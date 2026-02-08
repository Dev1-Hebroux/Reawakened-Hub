import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { securityHeaders } from "./securityHeaders";
import { apiLimiter } from "./rateLimiter";
import { scheduleAudioPregeneration } from "./audio-pregeneration";
import { autoSeedDominionContent } from "./auto-seed";
import { startNightlyContentSync } from "./content-sync";
import { initializeNotificationScheduler } from "./notification-scheduler";
import {
  setCsrfToken,
  validateCsrfToken,
  requestIdMiddleware,
  metricsMiddleware,
  metricsEndpoint,
  authRateLimiter,
  setRLSContext
} from "./middleware";
import { jobScheduler, CronPatterns } from "./lib/jobScheduler";
import { notificationService } from "./services/notificationService";
import { compressionMiddleware, serverTiming, slowRequestLogger } from "./middleware/performance";
import { sendPrayerReminderEmail } from "./email";
import { storage } from "./storage";
import initRoutes from "./routes/initRoutes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(compressionMiddleware);
app.use(serverTiming);
app.use(slowRequestLogger({ threshold: 300 }));
app.use(securityHeaders);
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(metricsMiddleware);
app.use(setCsrfToken);
app.use("/api", apiLimiter);
app.use("/api/login", authRateLimiter);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

app.use('/api', validateCsrfToken);
app.get('/metrics', metricsEndpoint);

app.use("/attached_assets", express.static(path.resolve(__dirname, "..", "attached_assets")));
app.use("/assets", express.static(path.resolve(__dirname, "..", "attached_assets")));
app.use("/assets", express.static(path.resolve(__dirname, "..", "attached_assets", "generated_images")));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// ============================================================================
// BACKGROUND SERVICES INITIALIZATION
// ============================================================================

/**
 * Initialize all background services AFTER the server is ready to accept requests.
 * This ensures the server responds immediately while heavy tasks run in background.
 * 
 * CRITICAL: Uses setImmediate() and delays to ensure initial page requests
 * get priority over background work.
 */
async function initializeBackgroundServices(): Promise<void> {
  log('Starting background services initialization...', 'background');
  
  try {
    // PHASE 1: Content seeding (runs immediately but doesn't block)
    // Using Promise.resolve().then() to ensure it runs in next tick
    autoSeedDominionContent()
      .then(() => log('Content seeding completed', 'background'))
      .catch(err => console.error('[Background] Seeding error:', err));
    
    // PHASE 2: Delayed scheduler initialization (5 seconds after server start)
    // This prevents competing with initial page load requests
    setTimeout(() => {
      log('Initializing schedulers...', 'background');
      
      // Start nightly content sync scheduler
      startNightlyContentSync();
      
      // Start audio pre-generation (only if API key configured)
      if (process.env.OPENAI_API_KEY) {
        scheduleAudioPregeneration();
      }
      
      // Start notification scheduler
      initializeNotificationScheduler();
      
      // Register and start background job scheduler
      jobScheduler.register(
        'process-scheduled-notifications',
        CronPatterns.EVERY_5_MINUTES,
        async () => {
          const result = await notificationService.processPending();
          log(`Processed ${result.processed} scheduled notifications`, 'jobs');
        }
      );

      // Prayer reminder job - runs daily at 00:01
      jobScheduler.register(
        'send-daily-prayer-reminders',
        CronPatterns.DAILY_0001,
        async () => {
          const subscriptions = await storage.getPrayerSubscriptionsDueForReminder('daily');
          let sent = 0;
          let failed = 0;

          for (const { subscription, user, focusGroup } of subscriptions) {
            try {
              if (!user.email) continue;

              const focusName = focusGroup?.name || 'your prayer focus';
              const prayerPoints = (focusGroup?.prayerPoints as string[]) || [];
              const scriptures = (focusGroup?.scriptures as string[]) || [];

              // Calculate day number since subscription
              const daysSinceStart = Math.floor(
                (Date.now() - new Date(subscription.createdAt!).getTime()) / (1000 * 60 * 60 * 24)
              ) + 1;

              await sendPrayerReminderEmail(user.email, user.firstName || 'Friend', {
                focusName,
                focusType: subscription.type as 'nation' | 'campus',
                prayerPoints,
                scriptures,
                dayNumber: daysSinceStart,
              });

              // Mark as sent to prevent duplicate sends
              await storage.updateSubscriptionReminderSent(subscription.id);
              sent++;
            } catch (error) {
              console.error(`Failed to send reminder to subscription ${subscription.id}:`, error);
              failed++;
            }
          }

          log(`Sent ${sent} daily prayer reminders (${failed} failed)`, 'jobs');
        }
      );

      // Weekly prayer reminder job - runs every Sunday at 00:01
      jobScheduler.register(
        'send-weekly-prayer-reminders',
        '1 0 * * 0', // Sunday at 00:01
        async () => {
          const subscriptions = await storage.getPrayerSubscriptionsDueForReminder('weekly');
          let sent = 0;
          let failed = 0;

          for (const { subscription, user, focusGroup } of subscriptions) {
            try {
              if (!user.email) continue;

              const focusName = focusGroup?.name || 'your prayer focus';
              const prayerPoints = (focusGroup?.prayerPoints as string[]) || [];
              const scriptures = (focusGroup?.scriptures as string[]) || [];

              await sendPrayerReminderEmail(user.email, user.firstName || 'Friend', {
                focusName,
                focusType: subscription.type as 'nation' | 'campus',
                prayerPoints,
                scriptures,
              });

              // Mark as sent to prevent duplicate sends
              await storage.updateSubscriptionReminderSent(subscription.id);
              sent++;
            } catch (error) {
              console.error(`Failed to send weekly reminder to subscription ${subscription.id}:`, error);
              failed++;
            }
          }

          log(`Sent ${sent} weekly prayer reminders (${failed} failed)`, 'jobs');
        }
      );
      
      jobScheduler.start();
      log('All background services initialized', 'background');
      
    }, 5000); // 5 second delay to prioritize initial page requests
    
  } catch (error) {
    console.error('[Background] Failed to initialize services:', error);
    // Don't throw - background service failures shouldn't crash the server
  }
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup static serving / Vite based on environment
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Start the server
  const port = parseInt(process.env.PORT || "5000", 10);
  
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`Server ready on port ${port}`);
      
      // CRITICAL: Initialize background services AFTER server is listening
      // Using setImmediate ensures the listen callback completes first
      setImmediate(() => {
        initializeBackgroundServices();
      });
    },
  );
})();
