#!/usr/bin/env npx ts-node
import { config } from 'dotenv';
config();

import { db } from '../server/db';
import { users, passwordResetTokens } from '@shared/schema';
import { eq, isNull, sql } from 'drizzle-orm';
import { generateToken } from '../server/services/authService';
import { sendMigrationEmail } from '../server/email';

const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(msg: string, color = c.reset) {
  console.log(`${color}${msg}${c.reset}`);
}

function header(msg: string) {
  console.log();
  log('═'.repeat(60), c.cyan);
  log(`  ${msg}`, c.bright);
  log('═'.repeat(60), c.cyan);
  console.log();
}

interface MigrationUser {
  id: string;
  email: string | null;
  firstName: string | null;
  authProvider: string | null;
  hasPassword: boolean;
}

async function getUsers(): Promise<MigrationUser[]> {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      authProvider: users.authProvider,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .orderBy(users.id);
  
  return result.map(u => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    authProvider: u.authProvider,
    hasPassword: !!u.passwordHash,
  }));
}

async function analyze() {
  header('User Migration Analysis');
  
  const allUsers = await getUsers();
  
  const stats = {
    total: allUsers.length,
    withPassword: allUsers.filter(u => u.hasPassword).length,
    needsMigration: allUsers.filter(u => !u.hasPassword && u.email).length,
    replitOnly: allUsers.filter(u => u.authProvider === 'replit').length,
    emailOnly: allUsers.filter(u => u.authProvider === 'email').length,
    both: allUsers.filter(u => u.authProvider === 'both').length,
  };
  
  log(`Total Users:        ${stats.total}`);
  log(`With Password:      ${stats.withPassword}`, c.green);
  log(`Replit Only:        ${stats.replitOnly}`, c.yellow);
  log(`Email Only:         ${stats.emailOnly}`, c.cyan);
  log(`Both Methods:       ${stats.both}`, c.green);
  log(`Needs Migration:    ${stats.needsMigration}`, c.yellow);
  
  if (stats.needsMigration > 0) {
    console.log();
    log('Users requiring migration:', c.bright);
    const needsMigration = allUsers.filter(u => !u.hasPassword && u.email);
    for (const user of needsMigration.slice(0, 10)) {
      log(`  [${user.id.substring(0, 8)}...] ${user.email}`, c.gray);
    }
    if (needsMigration.length > 10) {
      log(`  ... and ${needsMigration.length - 10} more`, c.gray);
    }
  } else {
    log('✓ All users have passwords or email auth.', c.green);
  }
}

async function migrate(dryRun: boolean = false) {
  header(dryRun ? 'Migration Dry Run' : 'User Migration');
  
  const allUsers = await getUsers();
  const needsMigration = allUsers.filter(u => !u.hasPassword && u.email);
  
  if (needsMigration.length === 0) {
    log('✓ No users need migration.', c.green);
    return;
  }
  
  log(`Found ${needsMigration.length} users to migrate`);
  console.log();
  
  let migrated = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (const user of needsMigration) {
    if (!user.email) continue;
    
    try {
      if (dryRun) {
        log(`  Would migrate: ${user.email}`, c.gray);
        migrated++;
        continue;
      }
      
      const token = generateToken(32);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });
      
      await sendMigrationEmail(user.email, user.firstName, token);
      
      log(`  ✓ Migrated: ${user.email}`, c.green);
      migrated++;
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${user.email}: ${errorMsg}`);
      log(`  ✗ Failed: ${user.email}`, c.red);
      failed++;
    }
  }
  
  console.log();
  header('Migration Summary');
  log(`Migrated: ${migrated}`, c.green);
  log(`Failed:   ${failed}`, c.red);
  
  if (errors.length > 0) {
    console.log();
    log('Errors:', c.red);
    errors.forEach(e => log(`  ${e}`, c.gray));
  }
}

function showHelp() {
  log(`
${c.bright}User Migration Script${c.reset}

Migrates existing Replit users to the new dual-auth system.

${c.cyan}Usage:${c.reset}
  npx tsx scripts/migrate-users.ts [command]

${c.cyan}Commands:${c.reset}
  analyze     Show migration status and user counts
  dry-run     Preview migration without making changes
  migrate     Send migration emails to users
  help        Show this help message

${c.cyan}Process:${c.reset}
  1. Run 'analyze' to see how many users need migration
  2. Run 'dry-run' to preview the migration
  3. Run 'migrate' to send password setup emails

${c.cyan}Notes:${c.reset}
  - Users will receive an email to set their password
  - Links expire in 7 days
  - Users can still sign in with Replit during migration
`);
}

async function main() {
  const command = process.argv[2] || 'help';
  
  try {
    switch (command) {
      case 'analyze': await analyze(); break;
      case 'dry-run': await migrate(true); break;
      case 'migrate': await migrate(false); break;
      case 'help':
      default: showHelp(); break;
    }
    process.exit(0);
  } catch (error) {
    log(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, c.red);
    process.exit(1);
  }
}

main();
