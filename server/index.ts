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
  authRateLimiter 
} from "./middleware";
import { jobScheduler, CronPatterns } from "./lib/jobScheduler";
import { notificationService } from "./services/notificationService";
import { compressionMiddleware, serverTiming, slowRequestLogger } from "./middleware/performance";
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
app.use("/api/callback", authRateLimiter);

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

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    async () => {
      log(`serving on port ${port}`);
      
      // Auto-seed DOMINION content in background (non-blocking so server starts immediately)
      // This allows the site to load for users while content syncs in the background
      autoSeedDominionContent().catch(err => {
        console.error('[Auto-Seed] Background sync failed:', err);
      });
      
      // Start nightly content sync scheduler (runs at 23:00 London time daily)
      startNightlyContentSync();
      
      // Start audio pre-generation scheduler (only if OpenAI key is configured)
      if (process.env.OPENAI_API_KEY) {
        scheduleAudioPregeneration();
      }
      
      // Start notification scheduler for daily devotionals and event reminders
      initializeNotificationScheduler();
      
      // Register background jobs
      jobScheduler.register(
        'process-scheduled-notifications',
        CronPatterns.EVERY_5_MINUTES,
        async () => {
          const result = await notificationService.processPending();
          log(`Processed ${result.processed} scheduled notifications`);
        }
      );
      
      jobScheduler.start();
      log('Background job scheduler started');
    },
  );
})();
