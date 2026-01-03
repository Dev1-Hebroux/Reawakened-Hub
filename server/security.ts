import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { securityLogs } from "@shared/schema";

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    await logSecurityEvent({
      eventType: "rate_limit_exceeded",
      ipAddress: req.ip || req.socket.remoteAddress || "unknown",
      userAgent: req.get("user-agent") || "unknown",
      path: req.path,
      details: { limit: 200, window: "15m" },
    });
    res.status(429).json({ error: "Too many requests, please try again later" });
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    await logSecurityEvent({
      eventType: "auth_rate_limit_exceeded",
      ipAddress: req.ip || req.socket.remoteAddress || "unknown",
      userAgent: req.get("user-agent") || "unknown",
      path: req.path,
      details: { limit: 20, window: "15m" },
    });
    res.status(429).json({ error: "Too many authentication attempts, please try again later" });
  },
});

export const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Rate limit exceeded for this action" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many AI requests, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
});

interface SecurityLogEntry {
  eventType: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  path: string;
  details?: Record<string, any>;
}

export async function logSecurityEvent(entry: SecurityLogEntry): Promise<void> {
  try {
    await db.insert(securityLogs).values({
      eventType: entry.eventType,
      userId: entry.userId || null,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      path: entry.path,
      details: entry.details ? JSON.stringify(entry.details) : null,
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
}
