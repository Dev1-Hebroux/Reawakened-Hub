import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from '../db';
import { users, userSessions, passwordResetTokens, emailVerificationTokens, authAuditLog } from '@shared/schema';
import { eq, and, gt, sql } from 'drizzle-orm';

const BCRYPT_ROUNDS = 12;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

interface RegisterResult {
  success: boolean;
  user?: typeof users.$inferSelect;
  error?: string;
}

interface LoginResult {
  success: boolean;
  user?: typeof users.$inferSelect;
  sessionToken?: string;
  error?: string;
}

export async function registerWithEmail(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<RegisterResult> {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingUser.length > 0) {
    await logAuditEvent(null, 'register_email_exists', ipAddress, userAgent, { email: normalizedEmail }, false);
    return { success: false, error: 'An account with this email already exists' };
  }

  const passwordHash = await hashPassword(password);
  const userId = generateToken(16);

  const [newUser] = await db
    .insert(users)
    .values({
      id: userId,
      email: normalizedEmail,
      firstName: firstName || null,
      lastName: lastName || null,
      passwordHash,
      authProvider: 'email',
      role: 'member',
    })
    .returning();

  await logAuditEvent(userId, 'register', ipAddress, userAgent, { provider: 'email' });

  return { success: true, user: newUser };
}

export async function loginWithEmail(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<LoginResult> {
  const normalizedEmail = email.toLowerCase().trim();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    await logAuditEvent(null, 'login_user_not_found', ipAddress, userAgent, { email: normalizedEmail }, false);
    return { success: false, error: 'Invalid email or password' };
  }

  if (user.isDisabled) {
    await logAuditEvent(user.id, 'login_disabled', ipAddress, userAgent, {}, false);
    return { success: false, error: 'Account is disabled' };
  }

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const minutesLeft = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
    await logAuditEvent(user.id, 'login_locked', ipAddress, userAgent, { minutesLeft }, false);
    return { success: false, error: `Account locked. Try again in ${minutesLeft} minutes` };
  }

  if (!user.passwordHash) {
    await logAuditEvent(user.id, 'login_no_password', ipAddress, userAgent, {}, false);
    return { success: false, error: 'No password set for this account. Please use the forgot password link to set one.' };
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    const newAttempts = (user.loginAttempts || 0) + 1;
    const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;

    await db
      .update(users)
      .set({
        loginAttempts: newAttempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await logAuditEvent(user.id, 'login_failed', ipAddress, userAgent, { attempts: newAttempts, locked: shouldLock }, false);

    if (shouldLock) {
      return { success: false, error: 'Too many failed attempts. Account locked for 15 minutes' };
    }
    return { success: false, error: 'Invalid email or password' };
  }

  await db
    .update(users)
    .set({
      loginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  const sessionToken = generateToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(userSessions).values({
    userId: user.id,
    token: sessionToken,
    expiresAt,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  });

  await logAuditEvent(user.id, 'login', ipAddress, userAgent, { provider: 'email' });

  return { success: true, user, sessionToken };
}

export async function validateSession(token: string): Promise<typeof users.$inferSelect | null> {
  const [session] = await db
    .select()
    .from(userSessions)
    .where(and(eq(userSessions.token, token), gt(userSessions.expiresAt, new Date())))
    .limit(1);

  if (!session) return null;

  await db
    .update(userSessions)
    .set({ lastActivityAt: new Date() })
    .where(eq(userSessions.id, session.id));

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user || null;
}

export async function invalidateSession(token: string): Promise<void> {
  await db.delete(userSessions).where(eq(userSessions.token, token));
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await db.delete(userSessions).where(eq(userSessions.userId, userId));
}

export async function createPasswordResetToken(
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; token?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    return { success: true };
  }

  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt,
  });

  await logAuditEvent(user.id, 'password_reset_requested', ipAddress, userAgent, {});

  return { success: true, token };
}

export async function resetPassword(
  token: string,
  newPassword: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!resetToken || resetToken.usedAt) {
    return { success: false, error: 'Invalid or expired reset link' };
  }

  const passwordHash = await hashPassword(newPassword);

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        passwordHash,
        authProvider: 'email',
        loginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, resetToken.userId));

    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, resetToken.id));

    await tx.delete(userSessions).where(eq(userSessions.userId, resetToken.userId));
  });

  await logAuditEvent(resetToken.userId, 'password_reset', ipAddress, userAgent, {});

  return { success: true };
}

export async function createEmailVerificationToken(
  userId: string,
  email: string
): Promise<string> {
  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId));

  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFY_TTL_MS);

  await db.insert(emailVerificationTokens).values({
    userId,
    email: email.toLowerCase(),
    token,
    expiresAt,
  });

  return token;
}

export async function verifyEmail(
  token: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  const [verifyToken] = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.token, token),
        gt(emailVerificationTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!verifyToken || verifyToken.verifiedAt) {
    return { success: false, error: 'Invalid or expired verification link' };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        emailVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, verifyToken.userId));

    await tx
      .update(emailVerificationTokens)
      .set({ verifiedAt: new Date() })
      .where(eq(emailVerificationTokens.id, verifyToken.id));
  });

  await logAuditEvent(verifyToken.userId, 'email_verified', ipAddress, userAgent, { email: verifyToken.email });

  return { success: true };
}

export async function addPasswordToAccount(
  userId: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const passwordHash = await hashPassword(password);

  await db
    .update(users)
    .set({
      passwordHash,
      authProvider: 'email',
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await logAuditEvent(userId, 'password_added', ipAddress, userAgent, {});

  return { success: true };
}

async function logAuditEvent(
  userId: string | null,
  action: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, any>,
  success: boolean = true
): Promise<void> {
  try {
    await db.insert(authAuditLog).values({
      userId,
      action,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      metadata: metadata || null,
      success,
    });
  } catch (error) {
    console.error('[AuthAudit] Failed to log event:', error);
  }
}

export async function cleanupExpiredSessions(): Promise<number> {
  const result = await db
    .delete(userSessions)
    .where(sql`${userSessions.expiresAt} < NOW()`)
    .returning({ id: userSessions.id });

  return result.length;
}

export async function cleanupExpiredTokens(): Promise<void> {
  await db.delete(passwordResetTokens).where(sql`${passwordResetTokens.expiresAt} < NOW()`);
  await db.delete(emailVerificationTokens).where(sql`${emailVerificationTokens.expiresAt} < NOW()`);
}
