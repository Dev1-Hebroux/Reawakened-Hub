import { log } from "./index";

export interface ModerationResult {
  flagged: boolean;
  categories: {
    hate: boolean;
    harassment: boolean;
    selfHarm: boolean;
    sexual: boolean;
    violence: boolean;
    spam: boolean;
  };
  scores: {
    hate: number;
    harassment: number;
    selfHarm: number;
    sexual: number;
    violence: number;
    spam: number;
  };
  action: "allow" | "review" | "block";
}

interface ModerationLog {
  timestamp: Date;
  content: string;
  result: ModerationResult;
  userId?: string;
  contentType: string;
  contentId?: string | number;
}

const moderationLogs: ModerationLog[] = [];
const MAX_LOGS = 5000;

const SHADOW_MODE = true;

const BLOCKED_PATTERNS = [
  /\b(spam|scam|buy now|click here|free money)\b/i,
];

const REVIEW_PATTERNS = [
  /\b(hate|kill|attack|destroy)\b/i,
];

export async function moderateContent(
  content: string,
  options?: {
    userId?: string;
    contentType?: string;
    contentId?: string | number;
  }
): Promise<ModerationResult> {
  const result: ModerationResult = {
    flagged: false,
    categories: {
      hate: false,
      harassment: false,
      selfHarm: false,
      sexual: false,
      violence: false,
      spam: false,
    },
    scores: {
      hate: 0,
      harassment: 0,
      selfHarm: 0,
      sexual: 0,
      violence: 0,
      spam: 0,
    },
    action: "allow",
  };

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(content)) {
      result.flagged = true;
      result.categories.spam = true;
      result.scores.spam = 0.9;
      result.action = "block";
      break;
    }
  }

  if (!result.flagged) {
    for (const pattern of REVIEW_PATTERNS) {
      if (pattern.test(content)) {
        result.flagged = true;
        result.action = "review";
        break;
      }
    }
  }

  const logEntry: ModerationLog = {
    timestamp: new Date(),
    content: content.substring(0, 200),
    result,
    userId: options?.userId,
    contentType: options?.contentType || "unknown",
    contentId: options?.contentId,
  };

  moderationLogs.push(logEntry);
  if (moderationLogs.length > MAX_LOGS) {
    moderationLogs.shift();
  }

  if (result.flagged) {
    log(
      `MODERATION [${SHADOW_MODE ? "SHADOW" : "ACTIVE"}]: ${result.action} - ${options?.contentType}/${options?.contentId} by ${options?.userId}`,
      "moderation"
    );
  }

  if (SHADOW_MODE) {
    return {
      ...result,
      action: "allow",
    };
  }

  return result;
}

export function getModerationLogs(limit = 100): ModerationLog[] {
  return moderationLogs
    .slice(-limit)
    .reverse();
}

export function getModerationStats() {
  const total = moderationLogs.length;
  const flagged = moderationLogs.filter((l) => l.result.flagged).length;
  const blocked = moderationLogs.filter((l) => l.result.action === "block").length;
  const reviewed = moderationLogs.filter((l) => l.result.action === "review").length;

  return {
    total,
    flagged,
    blocked,
    reviewed,
    flagRate: total > 0 ? (flagged / total) * 100 : 0,
  };
}
