/**
 * Job Scheduler
 * 
 * Simple cron-based job scheduler for background tasks.
 * Handles scheduled notifications, streak reminders, and cleanup jobs.
 */

import { logger } from './logger';

type JobHandler = () => Promise<void>;

interface ScheduledJob {
  name: string;
  cronExpression: string;
  handler: JobHandler;
  isRunning: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  errorCount: number;
}

// Simple cron expression parser for basic patterns
// Supports: minute, hour, day of month, month, day of week
// Supports: * (any), specific numbers, */n (every n)
function parseCronExpression(expression: string): { minute: number[]; hour: number[]; dayOfMonth: number[]; month: number[]; dayOfWeek: number[] } {
  const parts = expression.split(' ');
  
  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: ${expression}`);
  }
  
  const parseField = (field: string, min: number, max: number): number[] => {
    if (field === '*') {
      return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }
    
    if (field.includes('/')) {
      const [, step] = field.split('/');
      const stepNum = parseInt(step, 10);
      return Array.from({ length: Math.ceil((max - min + 1) / stepNum) }, (_, i) => min + i * stepNum).filter(v => v <= max);
    }
    
    if (field.includes(',')) {
      return field.split(',').map(v => parseInt(v, 10));
    }
    
    return [parseInt(field, 10)];
  };
  
  return {
    minute: parseField(parts[0], 0, 59),
    hour: parseField(parts[1], 0, 23),
    dayOfMonth: parseField(parts[2], 1, 31),
    month: parseField(parts[3], 1, 12),
    dayOfWeek: parseField(parts[4], 0, 6),
  };
}

function getNextRunTime(cronExpression: string): Date {
  const now = new Date();
  const cron = parseCronExpression(cronExpression);
  
  const next = new Date(now);
  next.setSeconds(0, 0);
  next.setMinutes(next.getMinutes() + 1);
  
  // Simple approach: try each minute for the next 48 hours
  const maxIterations = 48 * 60;
  
  for (let i = 0; i < maxIterations; i++) {
    const minute = next.getMinutes();
    const hour = next.getHours();
    const dayOfMonth = next.getDate();
    const month = next.getMonth() + 1;
    const dayOfWeek = next.getDay();
    
    if (
      cron.minute.includes(minute) &&
      cron.hour.includes(hour) &&
      cron.dayOfMonth.includes(dayOfMonth) &&
      cron.month.includes(month) &&
      cron.dayOfWeek.includes(dayOfWeek)
    ) {
      return next;
    }
    
    next.setMinutes(next.getMinutes() + 1);
  }
  
  // Fallback: return 1 hour from now
  return new Date(now.getTime() + 60 * 60 * 1000);
}

class JobScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  register(name: string, cronExpression: string, handler: JobHandler): void {
    if (this.jobs.has(name)) {
      logger.warn({ jobName: name }, `Job ${name} already registered, skipping`);
      return;
    }
    
    const nextRunAt = getNextRunTime(cronExpression);
    
    this.jobs.set(name, {
      name,
      cronExpression,
      handler,
      isRunning: false,
      lastRunAt: null,
      nextRunAt,
      errorCount: 0,
    });
    
    logger.info({ jobName: name, cronExpression, nextRunAt }, `Job ${name} registered`);
  }

  start(): void {
    if (this.isRunning) {
      logger.warn('Job scheduler already running');
      return;
    }
    
    this.isRunning = true;
    
    Array.from(this.jobs.entries()).forEach(([name, job]) => {
      this.scheduleNext(name, job);
    });
    
    logger.info({ jobCount: this.jobs.size }, 'Job scheduler started');
  }

  stop(): void {
    this.isRunning = false;
    
    Array.from(this.timers.values()).forEach(timer => {
      clearTimeout(timer);
    });
    
    this.timers.clear();
    logger.info('Job scheduler stopped');
  }

  private scheduleNext(name: string, job: ScheduledJob): void {
    if (!this.isRunning) return;
    
    const now = Date.now();
    const nextRunAt = getNextRunTime(job.cronExpression);
    const delay = Math.max(nextRunAt.getTime() - now, 1000);
    
    job.nextRunAt = nextRunAt;
    
    const timer = setTimeout(async () => {
      await this.runJob(name);
    }, delay);
    
    this.timers.set(name, timer);
  }

  private async runJob(name: string): Promise<void> {
    const job = this.jobs.get(name);
    
    if (!job || job.isRunning) {
      return;
    }
    
    job.isRunning = true;
    const startTime = Date.now();
    
    logger.info({ jobName: name }, `Job ${name} starting`);
    
    try {
      await job.handler();
      
      job.lastRunAt = new Date();
      job.errorCount = 0;
      
      const duration = Date.now() - startTime;
      logger.info({ jobName: name, durationMs: duration }, `Job ${name} completed`);
    } catch (error) {
      job.errorCount++;
      
      logger.error({
        jobName: name,
        errorCount: job.errorCount,
        err: error,
      }, `Job ${name} failed`);
    } finally {
      job.isRunning = false;
      this.scheduleNext(name, job);
    }
  }

  async runNow(name: string): Promise<void> {
    const job = this.jobs.get(name);
    
    if (!job) {
      throw new Error(`Job ${name} not found`);
    }
    
    if (job.isRunning) {
      throw new Error(`Job ${name} is already running`);
    }
    
    await this.runJob(name);
  }

  getStatus(): Record<string, { lastRunAt: Date | null; nextRunAt: Date | null; isRunning: boolean; errorCount: number }> {
    const status: Record<string, { lastRunAt: Date | null; nextRunAt: Date | null; isRunning: boolean; errorCount: number }> = {};
    
    Array.from(this.jobs.entries()).forEach(([name, job]) => {
      status[name] = {
        lastRunAt: job.lastRunAt,
        nextRunAt: job.nextRunAt,
        isRunning: job.isRunning,
        errorCount: job.errorCount,
      };
    });
    
    return status;
  }
}

export const jobScheduler = new JobScheduler();

// ============================================================================
// Common Cron Patterns
// ============================================================================

export const CronPatterns = {
  EVERY_MINUTE: '* * * * *',
  EVERY_5_MINUTES: '*/5 * * * *',
  EVERY_15_MINUTES: '*/15 * * * *',
  EVERY_30_MINUTES: '*/30 * * * *',
  EVERY_HOUR: '0 * * * *',
  EVERY_6_HOURS: '0 */6 * * *',
  DAILY_MIDNIGHT: '0 0 * * *',
  DAILY_6AM: '0 6 * * *',
  DAILY_8AM: '0 8 * * *',
  DAILY_9PM: '0 21 * * *',
  WEEKLY_SUNDAY: '0 0 * * 0',
  WEEKLY_MONDAY: '0 0 * * 1',
} as const;

export default jobScheduler;
