import { log } from "./index";

export interface AuditLogEntry {
  timestamp: Date;
  userId: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string | number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const auditLogs: AuditLogEntry[] = [];
const MAX_LOGS = 10000;

export function logAuditEvent(entry: Omit<AuditLogEntry, "timestamp">) {
  const fullEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date(),
  };

  auditLogs.push(fullEntry);

  if (auditLogs.length > MAX_LOGS) {
    auditLogs.shift();
  }

  const logMessage = `AUDIT: ${entry.action} on ${entry.resource}${entry.resourceId ? `/${entry.resourceId}` : ""} by user ${entry.userId}`;
  log(logMessage, "audit");

  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify(fullEntry));
  }
}

export function getAuditLogs(filters?: {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): AuditLogEntry[] {
  let filtered = [...auditLogs];

  if (filters?.userId) {
    filtered = filtered.filter((l) => l.userId === filters.userId);
  }
  if (filters?.action) {
    filtered = filtered.filter((l) => l.action === filters.action);
  }
  if (filters?.resource) {
    filtered = filtered.filter((l) => l.resource === filters.resource);
  }
  if (filters?.startDate) {
    filtered = filtered.filter((l) => l.timestamp >= filters.startDate!);
  }
  if (filters?.endDate) {
    filtered = filtered.filter((l) => l.timestamp <= filters.endDate!);
  }

  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (filters?.limit) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
}

export const AuditActions = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  VIEW: "VIEW",
  EXPORT: "EXPORT",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  PUBLISH: "PUBLISH",
  UNPUBLISH: "UNPUBLISH",
} as const;

export const AuditResources = {
  USER: "user",
  SPARK: "spark",
  BLOG_POST: "blog_post",
  EVENT: "event",
  POST: "post",
  PRAYER_REQUEST: "prayer_request",
  TESTIMONY: "testimony",
  CHALLENGE: "challenge",
  COHORT: "cohort",
  SETTINGS: "settings",
} as const;
