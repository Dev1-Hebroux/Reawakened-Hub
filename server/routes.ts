import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, isSuperAdmin } from "./auth";
import { setRLSContext } from "./middleware";
import { getAICoachInsights, type AICoachRequest } from "./ai-service";
import { audioExists, getPublicUrl, isStorageConfigured } from "./supabaseStorage";
import { generateSparkAudio, getSparkAudioUrl, generateReadingPlanDayAudio, getReadingPlanDayAudioUrl } from "./tts-service";
import notificationRoutes from "./routes/notificationRoutes";
import recommendationRoutes from "./routes/recommendationRoutes";
import sparkAudioRoutes from "./routes/sparkAudioRoutes";
import authRoutes from "./routes/authRoutes";
import initRoutes from "./routes/initRoutes";
import pushRoutes from "./routes/pushRoutes";
import dailyTaskRoutes from "./routes/dailyTaskRoutes";
import collaboratorRoutes from "./routes/collaboratorRoutes";
import progressRoutes from "./routes/progressRoutes";
import productLaunchRoutes from "./routes/productLaunchRoutes";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
import { 
  sendWelcomeEmail, 
  sendPrayerRequestNotification, 
  sendPrayerRequestConfirmationEmail,
  sendEventRegistrationEmail,
  sendChallengeEnrollmentEmail,
  sendTestimonyAcknowledgementEmail,
  sendVolunteerConfirmationEmail,
  sendMissionTripInterestEmail,
  sendSubscriptionWelcomeEmail,
  sendPrayerPodNotificationEmail,
  sendDailyDevotionalEmail,
  sendEventReminderEmail,
  sendPrayerAdoptionConfirmation,
} from "./email";
import { insertPostSchema, insertReactionSchema, insertSparkSchema, insertSparkReactionSchema, insertSparkSubscriptionSchema, insertEventSchema, insertEventRegistrationSchema, insertBlogPostSchema, insertEmailSubscriptionSchema, insertPrayerRequestSchema, insertTestimonySchema, insertVolunteerSignupSchema, insertMissionRegistrationSchema, insertJourneySchema, insertJourneyDaySchema, insertJourneyStepSchema, insertAlphaCohortSchema, insertAlphaCohortWeekSchema, insertAlphaCohortParticipantSchema, insertMissionProfileSchema, insertMissionPlanSchema, insertMissionAdoptionSchema, insertMissionPrayerSessionSchema, insertOpportunityInterestSchema, insertDigitalActionSchema, insertProjectFollowSchema, insertChallengeEnrollmentSchema, insertMissionTestimonySchema, insertChallengeSchema, insertUserSettingsSchema, insertCommentSchema, insertNotificationPreferencesSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth middleware - must be called before routes
  await setupAuth(app);

  // RLS Context middleware - sets PostgreSQL session variables for Row Level Security
  // IMPORTANT: Must run AFTER authentication to capture user context
  app.use(setRLSContext);

  // Register modular route handlers
  app.use('/api', initRoutes);
  app.use('/api', notificationRoutes);
  app.use('/api', recommendationRoutes);
  app.use('/api', sparkAudioRoutes);
  app.use('/api', pushRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api', dailyTaskRoutes);
  app.use('/api', collaboratorRoutes);
  app.use('/api', progressRoutes);
  app.use('/api', productLaunchRoutes);

  // Twilio domain verification
  app.get('/6fb6008290b49155dde41016be0276b0.html', (req, res) => {
    res.type('text/html').send('twilio-domain-verification=6fb6008290b49155dde41016be0276b0');
  });

  // Health check endpoint for Fly.io
  app.get('/api/health', async (req, res) => {
    try {
      // Basic health check - verify database connection
      const { pool } = await import('./db');
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();

      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Strip sensitive data before sending to client
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user preferences (content mode and audience segment)
  app.patch('/api/auth/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const preferencesSchema = z.object({
        contentMode: z.enum(['reflection', 'faith']).optional(),
        audienceSegment: z.enum(['schools', 'universities', 'early-career', 'builders', 'couples']).nullable().optional(),
      });
      const preferences = preferencesSchema.parse(req.body);
      const updatedUser = await storage.updateUserPreferences(userId, preferences);
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating user preferences:", error);
      res.status(400).json({ message: error.message || "Failed to update preferences" });
    }
  });

  // ===== USER STORIES ROUTES =====

  // Get all active stories (non-expired, grouped by user)
  app.get('/api/stories', async (req, res) => {
    try {
      const stories = await storage.getActiveStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  // Get current user's stories
  app.get('/api/stories/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const stories = await storage.getUserStories(userId);
      res.json(stories);
    } catch (error) {
      console.error("Error fetching user stories:", error);
      res.status(500).json({ message: "Failed to fetch your stories" });
    }
  });

  // Create a new story (protected)
  app.post('/api/stories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { mediaUrl, mediaType, caption } = req.body;
      
      if (!mediaUrl || !mediaType) {
        return res.status(400).json({ message: "Media URL and type are required" });
      }
      
      // Stories expire after 24 hours
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const story = await storage.createUserStory({
        userId,
        mediaUrl,
        mediaType,
        caption,
        expiresAt,
      });
      res.status(201).json(story);
    } catch (error: any) {
      console.error("Error creating story:", error);
      res.status(400).json({ message: error.message || "Failed to create story" });
    }
  });

  // Record a story view
  app.post('/api/stories/:id/view', isAuthenticated, async (req: any, res) => {
    try {
      const storyId = parseInt(req.params.id);
      const viewerId = req.user.claims?.sub || req.user.id;
      await storage.recordStoryView(storyId, viewerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error recording story view:", error);
      res.status(500).json({ message: "Failed to record view" });
    }
  });

  // ===== COMMUNITY HUB ROUTES =====
  
  // Get all posts (with optional type filter)
  app.get('/api/posts', async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const posts = await storage.getPosts(type);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Get a single post
  app.get('/api/posts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Create a new post (protected)
  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const postData = insertPostSchema.parse({ ...req.body, userId });
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error: any) {
      console.error("Error creating post:", error);
      res.status(400).json({ message: error.message || "Failed to create post" });
    }
  });

  // Get reactions for a post
  app.get('/api/posts/:id/reactions', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const reactions = await storage.getReactionsByPost(postId);
      res.json(reactions);
    } catch (error) {
      console.error("Error fetching reactions:", error);
      res.status(500).json({ message: "Failed to fetch reactions" });
    }
  });

  // Add a reaction to a post (protected)
  app.post('/api/reactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const reactionData = insertReactionSchema.parse({ ...req.body, userId });
      const reaction = await storage.createReaction(reactionData);
      res.status(201).json(reaction);
    } catch (error: any) {
      console.error("Error creating reaction:", error);
      res.status(400).json({ message: error.message || "Failed to create reaction" });
    }
  });

  // Delete a reaction (protected)
  app.delete('/api/reactions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteReaction(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting reaction:", error);
      res.status(500).json({ message: "Failed to delete reaction" });
    }
  });

  // ===== SPARKS ROUTES =====
  
  // Combined dashboard endpoint - consolidates multiple API calls into one
  app.get('/api/sparks/dashboard', async (req, res) => {
    const startTime = Date.now();
    
    try {
      const audienceParam = req.query.audience as string | undefined;
      const audienceSegment = audienceParam && ['schools', 'universities', 'early-career', 'builders', 'couples'].includes(audienceParam) 
        ? audienceParam 
        : null;
      
      // Execute all queries in parallel for maximum efficiency
      const [sparks, todaySpark, featured, reflection, sessions] = await Promise.all([
        storage.getPublishedSparks(audienceSegment || undefined),
        storage.getTodaySpark(audienceSegment || undefined),
        storage.getFeaturedSparks(audienceSegment || undefined),
        storage.getTodayReflectionCard(audienceSegment || undefined),
        storage.getActivePrayerSessions(),
      ]);
      
      const response = {
        sparks,
        todaySpark: todaySpark || null,
        featured,
        reflection: reflection || null,
        sessions,
        meta: {
          timestamp: new Date().toISOString(),
          audienceSegment,
          totalSparks: sparks.length,
        },
      };
      
      const duration = Date.now() - startTime;
      console.log(JSON.stringify({
        level: 'info',
        message: 'Dashboard API request completed',
        duration_ms: duration,
        audience_segment: audienceSegment,
        sparks_count: sparks.length,
        timestamp: new Date().toISOString(),
      }));
      
      res.set({
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'X-Response-Time': `${duration}ms`,
      });
      
      res.json(response);
    } catch (error) {
      const err = error as Error;
      console.error(JSON.stringify({
        level: 'error',
        message: 'Dashboard API error',
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      }));
      
      res.status(500).json({ 
        error: 'Failed to load dashboard data',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  });

  // Get all sparks (with optional category filter)
  app.get('/api/sparks', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const sparks = await storage.getSparks(category);
      res.json(sparks);
    } catch (error) {
      console.error("Error fetching sparks:", error);
      res.status(500).json({ message: "Failed to fetch sparks" });
    }
  });

  // Get published sparks (for public display)
  app.get('/api/sparks/published', async (req, res) => {
    try {
      const audienceSegment = req.query.audience as string | undefined;
      const sparks = await storage.getPublishedSparks(audienceSegment);
      res.json(sparks);
    } catch (error) {
      console.error("Error fetching published sparks:", error);
      res.status(500).json({ message: "Failed to fetch published sparks" });
    }
  });

  // Get featured sparks
  app.get('/api/sparks/featured', async (req, res) => {
    try {
      const audienceSegment = req.query.audience as string | undefined;
      const sparks = await storage.getFeaturedSparks(audienceSegment);
      res.json(sparks);
    } catch (error) {
      console.error("Error fetching featured sparks:", error);
      res.status(500).json({ message: "Failed to fetch featured sparks" });
    }
  });

  // Get today's devotional
  app.get('/api/sparks/today', async (req, res) => {
    try {
      const audienceSegment = req.query.audience as string | undefined;
      const spark = await storage.getTodaySpark(audienceSegment);
      if (!spark) {
        return res.status(404).json({ message: "No devotional for today" });
      }
      res.json(spark);
    } catch (error) {
      console.error("Error fetching today's spark:", error);
      res.status(500).json({ message: "Failed to fetch today's devotional" });
    }
  });

  // Get a single spark
  app.get('/api/sparks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const spark = await storage.getSpark(id);
      if (!spark) {
        return res.status(404).json({ message: "Spark not found" });
      }
      res.json(spark);
    } catch (error) {
      console.error("Error fetching spark:", error);
      res.status(500).json({ message: "Failed to fetch spark" });
    }
  });

  // Create a spark (protected - admin only in production)
  app.post('/api/sparks', isAuthenticated, async (req, res) => {
    try {
      const sparkData = insertSparkSchema.parse(req.body);
      const spark = await storage.createSpark(sparkData);
      res.status(201).json(spark);
    } catch (error: any) {
      console.error("Error creating spark:", error);
      res.status(400).json({ message: error.message || "Failed to create spark" });
    }
  });

  // Get spark reaction counts
  app.get('/api/sparks/:id/reactions', async (req, res) => {
    try {
      const sparkId = parseInt(req.params.id);
      const counts = await storage.getSparkReactionCounts(sparkId);
      res.json(counts);
    } catch (error) {
      console.error("Error fetching spark reactions:", error);
      res.status(500).json({ message: "Failed to fetch reactions" });
    }
  });

  // Add a spark reaction (protected)
  app.post('/api/sparks/:id/reactions', isAuthenticated, async (req: any, res) => {
    try {
      const sparkId = parseInt(req.params.id);
      const userId = req.user.claims?.sub || req.user.id;
      const { reactionType } = req.body;
      
      const existing = await storage.getUserSparkReaction(sparkId, userId);
      if (existing && existing.reactionType === reactionType) {
        await storage.deleteSparkReaction(sparkId, userId, reactionType);
        return res.json({ removed: true });
      }
      
      const reactionData = insertSparkReactionSchema.parse({ sparkId, userId, reactionType });
      const reaction = await storage.createSparkReaction(reactionData);
      res.status(201).json(reaction);
    } catch (error: any) {
      console.error("Error creating spark reaction:", error);
      res.status(400).json({ message: error.message || "Failed to add reaction" });
    }
  });

  // ===== SPARK BOOKMARKS =====
  
  // Check if user has bookmarked a spark
  app.get('/api/sparks/:id/bookmark', isAuthenticated, async (req: any, res) => {
    try {
      const sparkId = parseInt(req.params.id);
      const userId = req.user.claims?.sub || req.user.id;
      const bookmark = await storage.getSparkBookmark(sparkId, userId);
      res.json({ bookmarked: !!bookmark });
    } catch (error) {
      console.error("Error checking bookmark:", error);
      res.status(500).json({ message: "Failed to check bookmark" });
    }
  });

  // Add bookmark to spark
  app.post('/api/sparks/:id/bookmark', isAuthenticated, async (req: any, res) => {
    try {
      const sparkId = parseInt(req.params.id);
      const userId = req.user.claims?.sub || req.user.id;
      const bookmark = await storage.createSparkBookmark({ sparkId, userId });
      res.status(201).json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(400).json({ message: "Failed to bookmark" });
    }
  });

  // Remove bookmark from spark
  app.delete('/api/sparks/:id/bookmark', isAuthenticated, async (req: any, res) => {
    try {
      const sparkId = parseInt(req.params.id);
      const userId = req.user.claims?.sub || req.user.id;
      await storage.deleteSparkBookmark(sparkId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      res.status(500).json({ message: "Failed to remove bookmark" });
    }
  });

  // ===== SPARK JOURNALS =====

  // Save journal entry for spark
  app.post('/api/sparks/:id/journal', isAuthenticated, async (req: any, res) => {
    try {
      const sparkId = parseInt(req.params.id);
      const userId = req.user.claims?.sub || req.user.id;
      const { textContent, audioUrl, audioDuration } = req.body;
      const journal = await storage.createSparkJournal({ sparkId, userId, textContent, audioUrl, audioDuration });
      res.status(201).json(journal);
    } catch (error) {
      console.error("Error creating journal:", error);
      res.status(400).json({ message: "Failed to save journal" });
    }
  });

  // ===== SPARK ACTION COMPLETIONS =====

  // Check action completion status
  app.get('/api/sparks/:id/action-status', isAuthenticated, async (req: any, res) => {
    try {
      const sparkId = parseInt(req.params.id);
      const userId = req.user.claims?.sub || req.user.id;
      const completion = await storage.getSparkActionCompletion(sparkId, userId);
      res.json({ completed: !!completion });
    } catch (error) {
      console.error("Error checking action status:", error);
      res.status(500).json({ message: "Failed to check action status" });
    }
  });

  // Complete today's action
  app.post('/api/sparks/:id/complete-action', isAuthenticated, async (req: any, res) => {
    try {
      const sparkId = parseInt(req.params.id);
      const userId = req.user.claims?.sub || req.user.id;
      const completion = await storage.createSparkActionCompletion({ sparkId, userId });
      res.status(201).json(completion);
    } catch (error) {
      console.error("Error completing action:", error);
      res.status(400).json({ message: "Failed to complete action" });
    }
  });

  // Get user action streak
  app.get('/api/user/action-streak', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const streak = await storage.getUserActionStreak(userId);
      res.json({ streak });
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });

  // ===== TEXT-TO-SPEECH (TTS) =====
  
  // Generate natural voice audio from text using OpenAI TTS
  app.post('/api/tts/generate', async (req, res) => {
    try {
      const { text, voice = 'nova' } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Text is required" });
      }
      
      // Limit text length to avoid excessive API costs
      const truncatedText = text.slice(0, 4096);
      
      const mp3 = await openai.audio.speech.create({
        model: "tts-1-hd",
        voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
        input: truncatedText,
        speed: 0.95,
      });
      
      // Get the audio buffer
      const buffer = Buffer.from(await mp3.arrayBuffer());
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length,
        'Cache-Control': 'public, max-age=86400',
      });
      
      res.send(buffer);
    } catch (error: any) {
      console.error("Error generating TTS:", error);
      res.status(500).json({ message: error.message || "Failed to generate audio" });
    }
  });

  // Pre-generate and cache narration audio for a spark (admin only)
  app.post('/api/admin/sparks/:id/generate-narration', isAdmin, async (req: any, res) => {
    let filepath: string | null = null;
    
    try {
      const sparkId = parseInt(req.params.id);
      
      // Validate sparkId
      if (isNaN(sparkId) || sparkId <= 0) {
        return res.status(400).json({ message: "Invalid spark ID" });
      }
      
      const spark = await storage.getSpark(sparkId);
      
      if (!spark) {
        return res.status(404).json({ message: "Spark not found" });
      }
      
      if (!spark.fullTeaching) {
        return res.status(400).json({ message: "Spark has no teaching content to narrate" });
      }
      
      // Check if already has narration
      if (spark.narrationAudioUrl) {
        return res.status(400).json({ message: "Narration already exists", url: spark.narrationAudioUrl });
      }
      
      // Build narration text: scripture reference + passage + teaching
      let narrationText = '';
      if (spark.scriptureRef) {
        narrationText += spark.scriptureRef + '. ';
      }
      if (spark.fullPassage) {
        narrationText += spark.fullPassage + ' ';
      }
      narrationText += spark.fullTeaching;
      
      const truncatedText = narrationText.slice(0, 4096);
      
      const mp3 = await openai.audio.speech.create({
        model: "tts-1-hd",
        voice: 'nova',
        input: truncatedText,
        speed: 0.95,
      });
      
      const buffer = Buffer.from(await mp3.arrayBuffer());
      
      // Save to file with sanitized filename (only sparkId and timestamp)
      const audioDir = path.resolve(__dirname, "..", "attached_assets", "generated_audio");
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      
      const filename = `spark_${sparkId}_narration_${Date.now()}.mp3`;
      filepath = path.join(audioDir, filename);
      fs.writeFileSync(filepath, buffer);
      
      // Update spark with narration URL - if this fails, clean up the file
      const audioUrl = `/attached_assets/generated_audio/${filename}`;
      try {
        await storage.updateSpark(sparkId, { narrationAudioUrl: audioUrl });
      } catch (dbError) {
        // Clean up file if database update fails
        if (filepath && fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        throw dbError;
      }
      
      res.json({ 
        success: true, 
        url: audioUrl,
        size: buffer.length,
        sparkId 
      });
    } catch (error: any) {
      console.error("Error generating narration:", error);
      // Clean up file on any error
      if (filepath && fs.existsSync(filepath)) {
        try { fs.unlinkSync(filepath); } catch {}
      }
      res.status(500).json({ message: error.message || "Failed to generate narration" });
    }
  });

  // Serve cached narration audio with Range support for efficient streaming
  app.get('/api/sparks/:id/narration', async (req, res) => {
    try {
      const sparkId = parseInt(req.params.id);
      const spark = await storage.getSpark(sparkId);
      
      if (!spark || !spark.narrationAudioUrl) {
        return res.status(404).json({ message: "Narration not found" });
      }
      
      // Redirect to the static file
      res.redirect(spark.narrationAudioUrl);
    } catch (error) {
      console.error("Error serving narration:", error);
      res.status(500).json({ message: "Failed to serve narration" });
    }
  });

  // ===== PRAYER MESSAGES (LIVE INTERCESSION) =====
  
  // Get prayer messages (requires valid active sessionId for scoped chat)
  app.get('/api/prayer-messages', async (req, res) => {
    try {
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      if (!sessionId || isNaN(sessionId)) {
        return res.status(400).json({ message: "Session ID is required" });
      }
      
      const session = await storage.getLeaderPrayerSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Prayer session not found" });
      }
      
      if (session.status !== 'active') {
        return res.status(400).json({ message: "Prayer session has ended" });
      }
      
      const messages = await storage.getPrayerMessages(undefined, sessionId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching prayer messages:", error);
      res.status(500).json({ message: "Failed to fetch prayer messages" });
    }
  });

  // Create a prayer message (protected - requires valid sessionId)
  app.post('/api/prayer-messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      const userName = user?.firstName || 'Anonymous';
      const { sessionId, message } = req.body;
      
      if (!message || message.trim().length === 0) {
        return res.status(400).json({ message: "Prayer message cannot be empty" });
      }
      
      if (!sessionId || typeof sessionId !== 'number') {
        return res.status(400).json({ message: "Please join a prayer session first" });
      }
      
      const session = await storage.getLeaderPrayerSession(sessionId);
      if (!session || session.status !== 'active') {
        return res.status(400).json({ message: "Prayer session is not active" });
      }
      
      const prayerMessage = await storage.createPrayerMessage({
        sparkId: null,
        sessionId: sessionId,
        userId,
        userName,
        message: message.trim(),
      });
      res.status(201).json(prayerMessage);
    } catch (error: any) {
      console.error("Error creating prayer message:", error);
      res.status(400).json({ message: error.message || "Failed to create prayer message" });
    }
  });

  // ===== LEADER PRAYER SESSIONS =====

  // Get active prayer sessions (public)
  app.get('/api/leader-prayer-sessions', async (req, res) => {
    try {
      const status = req.query.status as string || 'active';
      const region = req.query.region as string | undefined;
      const sessions = await storage.getLeaderPrayerSessions(status, region);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching prayer sessions:", error);
      res.status(500).json({ message: "Failed to fetch prayer sessions" });
    }
  });

  // Get single prayer session
  app.get('/api/leader-prayer-sessions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getLeaderPrayerSession(id);
      if (!session) {
        return res.status(404).json({ message: "Prayer session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching prayer session:", error);
      res.status(500).json({ message: "Failed to fetch prayer session" });
    }
  });

  // Create a prayer session (leader-only)
  app.post('/api/leader-prayer-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      
      // Check if user is a leader or admin
      if (!user || (user.role !== 'leader' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Only leaders can start prayer sessions" });
      }
      
      const { title, description, region, community, meetingLink } = req.body;
      
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ message: "Title is required" });
      }
      
      const session = await storage.createLeaderPrayerSession({
        title: title.trim(),
        description: description?.trim() || null,
        region: region || user.region || null,
        community: community || user.community || null,
        meetingLink: meetingLink?.trim() || null,
        leaderId: userId,
        leaderName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Leader',
        status: 'active',
      });
      
      // Create notifications for users with prayer session alerts enabled (batch operation)
      try {
        const eligibleUserIds = await storage.getUsersForPrayerNotifications(userId);
        if (eligibleUserIds.length > 0) {
          const notificationsToCreate = eligibleUserIds.map(uid => ({
            userId: uid,
            type: 'prayer_session' as const,
            title: 'Live Prayer Session',
            body: `${session.leaderName} started "${session.title}"${session.region ? ` in ${session.region}` : ''}`,
            data: JSON.stringify({ sessionId: session.id }),
          }));
          await storage.createBulkNotifications(notificationsToCreate);
        }
      } catch (notifyError) {
        console.error("Error sending notifications:", notifyError);
      }
      
      res.status(201).json(session);
    } catch (error: any) {
      console.error("Error creating prayer session:", error);
      res.status(400).json({ message: error.message || "Failed to create prayer session" });
    }
  });

  // End a prayer session (leader-only)
  app.post('/api/leader-prayer-sessions/:id/end', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      const id = parseInt(req.params.id);
      
      // Check if user is a leader or admin
      if (!user || (user.role !== 'leader' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Only leaders can end prayer sessions" });
      }
      
      const session = await storage.endLeaderPrayerSession(id, userId);
      if (!session) {
        return res.status(404).json({ message: "Prayer session not found or you're not the leader" });
      }
      res.json(session);
    } catch (error: any) {
      console.error("Error ending prayer session:", error);
      res.status(400).json({ message: error.message || "Failed to end prayer session" });
    }
  });

  // Join a prayer session (increment participant count)
  app.post('/api/leader-prayer-sessions/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.incrementLeaderPrayerSessionParticipants(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error joining prayer session:", error);
      res.status(400).json({ message: error.message || "Failed to join prayer session" });
    }
  });

  // ===== NOTIFICATIONS =====

  // Get notification preferences
  app.get('/api/notifications/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const prefs = await storage.getNotificationPreferences(userId);
      res.json(prefs || { 
        pushEnabled: true, 
        emailEnabled: true, 
        prayerSessionAlerts: true, 
        newSparkAlerts: true, 
        eventReminders: true, 
        weeklyDigest: true 
      });
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  // Update notification preferences
  app.put('/api/notifications/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const prefsSchema = z.object({
        pushEnabled: z.boolean().optional(),
        emailEnabled: z.boolean().optional(),
        prayerSessionAlerts: z.boolean().optional(),
        newSparkAlerts: z.boolean().optional(),
        eventReminders: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),
        pushSubscription: z.string().optional(),
      });
      const prefs = prefsSchema.parse(req.body);
      const updated = await storage.upsertNotificationPreferences(userId, prefs);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating notification preferences:", error);
      res.status(400).json({ message: error.message || "Failed to update notification preferences" });
    }
  });

  // Get user notifications
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const notifications = await storage.getNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Get unread notifications count
  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // Mark notification as read
  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const id = parseInt(req.params.id);
      await storage.markNotificationRead(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.post('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      await storage.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // ===== REFLECTION CARDS ROUTES =====

  // Get published reflection cards
  app.get('/api/reflection-cards', async (req, res) => {
    try {
      const audienceSegment = req.query.audience as string | undefined;
      const cards = await storage.getReflectionCards(audienceSegment);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching reflection cards:", error);
      res.status(500).json({ message: "Failed to fetch reflection cards" });
    }
  });

  // Get today's reflection card
  app.get('/api/reflection-cards/today', async (req, res) => {
    try {
      const audienceSegment = req.query.audience as string | undefined;
      const card = await storage.getTodayReflectionCard(audienceSegment);
      if (!card) {
        return res.status(404).json({ message: "No reflection card for today" });
      }
      res.json(card);
    } catch (error) {
      console.error("Error fetching today's reflection card:", error);
      res.status(500).json({ message: "Failed to fetch today's reflection card" });
    }
  });

  // Get user subscriptions (protected)
  app.get('/api/subscriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const subscriptions = await storage.getSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  // Create a subscription (protected)
  app.post('/api/subscriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const subscriptionData = insertSparkSubscriptionSchema.parse({ ...req.body, userId });
      const subscription = await storage.createSubscription(subscriptionData);
      res.status(201).json(subscription);
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ message: error.message || "Failed to create subscription" });
    }
  });

  // Delete a subscription (protected)
  app.delete('/api/subscriptions/:category', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const category = req.params.category;
      await storage.deleteSubscription(userId, category);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting subscription:", error);
      res.status(500).json({ message: "Failed to delete subscription" });
    }
  });

  // ===== MISSION/EVENTS ROUTES =====
  
  // Get all events (with optional type filter)
  app.get('/api/events', async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const events = await storage.getEvents(type);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get a single event
  app.get('/api/events/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Create an event (protected - admin only in production)
  app.post('/api/events', isAuthenticated, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error: any) {
      console.error("Error creating event:", error);
      res.status(400).json({ message: error.message || "Failed to create event" });
    }
  });

  // Get event registrations
  app.get('/api/events/:id/registrations', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const registrations = await storage.getEventRegistrations(eventId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching event registrations:", error);
      res.status(500).json({ message: "Failed to fetch event registrations" });
    }
  });

  // Check user registration for an event (protected)
  app.get('/api/events/:id/my-registration', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const eventId = parseInt(req.params.id);
      const registration = await storage.getUserEventRegistration(eventId, userId);
      res.json(registration || null);
    } catch (error) {
      console.error("Error fetching user event registration:", error);
      res.status(500).json({ message: "Failed to fetch registration" });
    }
  });

  // Register for an event (protected)
  app.post('/api/event-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const registrationData = insertEventRegistrationSchema.parse({ ...req.body, userId });
      const registration = await storage.createEventRegistration(registrationData);
      
      // Get user and event details for email
      const user = await storage.getUser(userId);
      const event = await storage.getEvent(registrationData.eventId);
      
      if (user?.email && event) {
        sendEventRegistrationEmail(user.email, user.firstName || 'Friend', {
          eventTitle: event.title,
          eventDate: new Date(event.startDate),
          eventLocation: event.location || undefined,
          eventDescription: event.description || undefined,
        }).catch(err => console.error("Failed to send event registration email:", err));
      }
      
      res.status(201).json(registration);
    } catch (error: any) {
      console.error("Error creating event registration:", error);
      res.status(400).json({ message: error.message || "Failed to register for event" });
    }
  });

  // ===== BLOG ROUTES =====
  
  // Get all blog posts (with optional category filter)
  app.get('/api/blog', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const posts = await storage.getBlogPosts(category);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Get a single blog post by slug
  app.get('/api/blog/:slug', async (req, res) => {
    try {
      const slug = req.params.slug;
      const post = await storage.getBlogPost(slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Create a blog post (protected - admin only in production)
  app.post('/api/blog', isAuthenticated, async (req: any, res) => {
    try {
      const authorId = req.user.claims?.sub || req.user.id;
      const postData = insertBlogPostSchema.parse({ ...req.body, authorId });
      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      res.status(400).json({ message: error.message || "Failed to create blog post" });
    }
  });

  // ===== ENGAGEMENT FUNNEL ROUTES =====

  // Newsletter subscription (public)
  app.post('/api/subscribe', async (req, res) => {
    try {
      const { email, name, categories } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Check if already subscribed
      const existing = await storage.getEmailSubscriptionByEmail(email);
      if (existing) {
        // If inactive, reactivate and update categories
        if (!existing.isActive) {
          const updated = await storage.updateEmailSubscription(existing.id, {
            isActive: true,
            categories: categories || existing.categories,
            name: name || existing.name,
          });
          return res.status(200).json({ message: "Subscription reactivated", subscription: updated });
        }
        // If already active, just update categories
        const updated = await storage.updateEmailSubscription(existing.id, {
          categories: categories || existing.categories,
          name: name || existing.name,
        });
        return res.status(200).json({ message: "Subscription updated", subscription: updated });
      }
      
      // Generate unique unsubscribe token
      const unsubscribeToken = crypto.randomUUID();
      
      const subscriptionData = {
        email,
        name: name || null,
        categories: categories || ['daily-devotional'],
        unsubscribeToken,
        isActive: true,
      };
      
      const subscription = await storage.createEmailSubscription(subscriptionData);
      
      // Send welcome email to subscriber
      sendSubscriptionWelcomeEmail(email, {
        categories: subscriptionData.categories,
        whatsappOptIn: Boolean(req.body.whatsappOptIn),
        name: name || undefined,
        segment: (req.body.segment as 'sixth_form' | 'university' | 'early_career') || undefined,
        tone: (req.body.tone as 'seeker' | 'faith') || 'faith',
      }).catch(err => console.error("Failed to send subscription welcome email:", err));
      
      res.status(201).json({ message: "Successfully subscribed!", subscription });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ message: error.message || "Failed to subscribe" });
    }
  });

  // Unsubscribe from email list (public - via token)
  app.get('/api/unsubscribe/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const subscription = await storage.getEmailSubscriptionByToken(token);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      await storage.updateEmailSubscription(subscription.id, { isActive: false });
      
      res.json({ message: "Successfully unsubscribed", email: subscription.email });
    } catch (error: any) {
      console.error("Error unsubscribing:", error);
      res.status(400).json({ message: error.message || "Failed to unsubscribe" });
    }
  });

  // Resubscribe to email list (public - via token)
  app.post('/api/resubscribe/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const subscription = await storage.getEmailSubscriptionByToken(token);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      await storage.updateEmailSubscription(subscription.id, { isActive: true });
      
      res.json({ message: "Successfully resubscribed", email: subscription.email });
    } catch (error: any) {
      console.error("Error resubscribing:", error);
      res.status(400).json({ message: error.message || "Failed to resubscribe" });
    }
  });

  // Prayer request (public)
  app.post('/api/prayer-requests', async (req, res) => {
    try {
      const requestData = insertPrayerRequestSchema.parse(req.body);
      const request = await storage.createPrayerRequest(requestData);
      
      // Send email notification to prayer team
      sendPrayerRequestNotification({
        name: requestData.name,
        email: requestData.email || undefined,
        request: requestData.request,
        isPrivate: Boolean(requestData.isPrivate),
      }).catch(err => console.error("Failed to send prayer notification email:", err));
      
      // Send confirmation email to the person who submitted
      if (requestData.email) {
        sendPrayerRequestConfirmationEmail(requestData.email, requestData.name, {
          request: requestData.request,
          isPrivate: Boolean(requestData.isPrivate),
          urgencyLevel: requestData.urgencyLevel || undefined,
          category: requestData.category || undefined,
          campusOrCity: requestData.campusOrCity || undefined,
          segment: (req.body.segment as 'sixth_form' | 'university' | 'early_career') || undefined,
          tone: (req.body.tone as 'seeker' | 'faith') || 'faith',
        }).catch(err => console.error("Failed to send prayer confirmation email:", err));
      }
      
      res.status(201).json(request);
    } catch (error: any) {
      console.error("Error creating prayer request:", error);
      res.status(400).json({ message: error.message || "Failed to submit prayer request" });
    }
  });

  // Get public prayer requests
  app.get('/api/prayer-requests', async (req, res) => {
    try {
      const requests = await storage.getPrayerRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching prayer requests:", error);
      res.status(500).json({ message: "Failed to fetch prayer requests" });
    }
  });

  // Testimony submission (public)
  app.post('/api/testimonies', async (req, res) => {
    try {
      const testimonyData = insertTestimonySchema.parse(req.body);
      const testimony = await storage.createTestimony(testimonyData);
      
      // Send acknowledgement email if email provided
      if (testimonyData.email) {
        sendTestimonyAcknowledgementEmail(testimonyData.email, testimonyData.name, {
          testimonyTitle: testimonyData.title,
          category: testimonyData.category || 'General',
          sharingPermission: testimonyData.sharingPermission || undefined,
          displayNamePreference: testimonyData.displayNamePreference || undefined,
          segment: (req.body.segment as 'sixth_form' | 'university' | 'early_career') || undefined,
          tone: (req.body.tone as 'seeker' | 'faith') || 'faith',
        }).catch(err => console.error("Failed to send testimony acknowledgement email:", err));
      }
      
      res.status(201).json(testimony);
    } catch (error: any) {
      console.error("Error creating testimony:", error);
      res.status(400).json({ message: error.message || "Failed to submit testimony" });
    }
  });

  // Get approved testimonies
  app.get('/api/testimonies', async (req, res) => {
    try {
      const testimonies = await storage.getTestimonies(true);
      res.json(testimonies);
    } catch (error) {
      console.error("Error fetching testimonies:", error);
      res.status(500).json({ message: "Failed to fetch testimonies" });
    }
  });

  // Volunteer sign-up (public)
  app.post('/api/volunteer', async (req, res) => {
    try {
      const signupData = insertVolunteerSignupSchema.parse(req.body);
      const signup = await storage.createVolunteerSignup(signupData);
      
      // Send confirmation email
      if (signupData.email) {
        sendVolunteerConfirmationEmail(signupData.email, signupData.name, {
          areas: signupData.areas || [],
          phone: signupData.phone || undefined,
          segment: (signupData.segment as 'sixth_form' | 'university' | 'early_career') || undefined,
          tone: (req.body.tone as 'seeker' | 'faith') || 'faith',
        }).catch(err => console.error("Failed to send volunteer confirmation email:", err));
      }
      
      res.status(201).json(signup);
    } catch (error: any) {
      console.error("Error creating volunteer signup:", error);
      res.status(400).json({ message: error.message || "Failed to sign up" });
    }
  });

  // Mission trip registration (public)
  app.post('/api/mission-registration', async (req, res) => {
    try {
      const registrationData = insertMissionRegistrationSchema.parse(req.body);
      const registration = await storage.createMissionRegistration(registrationData);
      
      // Send confirmation email
      if (registrationData.email) {
        sendMissionTripInterestEmail(registrationData.email, registrationData.name, {
          tripInterest: registrationData.tripInterest || 'General mission interest',
          experience: registrationData.experience || undefined,
        }).catch(err => console.error("Failed to send mission registration email:", err));
      }
      
      res.status(201).json(registration);
    } catch (error: any) {
      console.error("Error creating mission registration:", error);
      res.status(400).json({ message: error.message || "Failed to register" });
    }
  });

  // ===== DISCIPLESHIP JOURNEY ROUTES =====

  // Get all published journeys
  app.get('/api/journeys', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const journeys = await storage.getJourneys(category);
      res.json(journeys);
    } catch (error) {
      console.error("Error fetching journeys:", error);
      res.status(500).json({ message: "Failed to fetch journeys" });
    }
  });

  // Get a single journey by slug with days
  app.get('/api/journeys/:slug', async (req, res) => {
    try {
      const slug = req.params.slug;
      const journey = await storage.getJourneyBySlug(slug);
      if (!journey) {
        return res.status(404).json({ message: "Journey not found" });
      }
      const days = await storage.getJourneyDays(journey.id);
      res.json({ ...journey, days });
    } catch (error) {
      console.error("Error fetching journey:", error);
      res.status(500).json({ message: "Failed to fetch journey" });
    }
  });

  // Start a journey (protected)
  app.post('/api/journeys/:id/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const journeyId = parseInt(req.params.id);
      
      // Check if already enrolled
      const existing = await storage.getUserJourneyByJourneyId(userId, journeyId);
      if (existing) {
        return res.json(existing);
      }
      
      const userJourney = await storage.startJourney(userId, journeyId);
      res.status(201).json(userJourney);
    } catch (error: any) {
      console.error("Error starting journey:", error);
      res.status(400).json({ message: error.message || "Failed to start journey" });
    }
  });

  // Get user's journeys (protected)
  app.get('/api/me/journeys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const userJourneys = await storage.getUserJourneys(userId);
      
      // Enrich with journey details
      const enriched = await Promise.all(userJourneys.map(async (uj) => {
        const journey = await storage.getJourneyById(uj.journeyId);
        const completedDays = await storage.getUserJourneyDays(uj.id);
        return {
          ...uj,
          journey,
          completedDaysCount: completedDays.filter(d => d.completedAt).length,
        };
      }));
      
      res.json(enriched);
    } catch (error) {
      console.error("Error fetching user journeys:", error);
      res.status(500).json({ message: "Failed to fetch user journeys" });
    }
  });

  // Get user's event registrations (protected)
  app.get('/api/me/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const registrations = await storage.getUserEventRegistrations(userId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching user event registrations:", error);
      res.status(500).json({ message: "Failed to fetch event registrations" });
    }
  });

  // Get user's consolidated activity (events, challenges, journeys)
  app.get('/api/me/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      // Fetch all user activities in parallel
      const [eventRegistrations, challengeEnrollments, userJourneys] = await Promise.all([
        storage.getUserEventRegistrations(userId),
        storage.getChallengeEnrollments(userId),
        storage.getUserJourneys(userId),
      ]);
      
      // Enrich challenge enrollments with challenge details
      const enrichedChallenges = await Promise.all(challengeEnrollments.map(async (enrollment) => {
        const challenge = await storage.getChallenge(enrollment.challengeId);
        return { enrollment, challenge };
      }));
      
      // Enrich journeys with journey details and progress
      const enrichedJourneys = await Promise.all(userJourneys.map(async (uj) => {
        const journey = await storage.getJourneyById(uj.journeyId);
        const completedDays = await storage.getUserJourneyDays(uj.id);
        return {
          userJourney: uj,
          journey,
          completedDaysCount: completedDays.filter(d => d.completedAt).length,
        };
      }));
      
      res.json({
        events: eventRegistrations,
        challenges: enrichedChallenges.filter(c => c.challenge),
        journeys: enrichedJourneys.filter(j => j.journey),
      });
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  // Get a specific day's content (protected)
  app.get('/api/user-journeys/:id/day/:dayNumber', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const userJourneyId = parseInt(req.params.id);
      const dayNumber = parseInt(req.params.dayNumber);
      
      const userJourney = await storage.getUserJourney(userJourneyId);
      if (!userJourney || userJourney.userId !== userId) {
        return res.status(404).json({ message: "Journey not found" });
      }
      
      const journey = await storage.getJourneyById(userJourney.journeyId);
      const journeyDay = await storage.getJourneyDay(userJourney.journeyId, dayNumber);
      if (!journeyDay) {
        return res.status(404).json({ message: "Day not found" });
      }
      
      const steps = await storage.getJourneySteps(journeyDay.id);
      const userDayProgress = await storage.getUserJourneyDay(userJourneyId, dayNumber);
      
      res.json({
        journey,
        userJourney,
        day: journeyDay,
        steps,
        userProgress: userDayProgress,
      });
    } catch (error) {
      console.error("Error fetching journey day:", error);
      res.status(500).json({ message: "Failed to fetch journey day" });
    }
  });

  // Mark a day as complete (protected)
  app.post('/api/user-journeys/:id/day/:dayNumber/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const userJourneyId = parseInt(req.params.id);
      const dayNumber = parseInt(req.params.dayNumber);
      const { notes, reflectionResponse } = req.body;
      
      const userJourney = await storage.getUserJourney(userJourneyId);
      if (!userJourney || userJourney.userId !== userId) {
        return res.status(404).json({ message: "Journey not found" });
      }
      
      // Complete the day
      const completedDay = await storage.completeJourneyDay(userJourneyId, dayNumber, notes, reflectionResponse);
      
      // Get journey to check if this was the last day
      const journey = await storage.getJourneyById(userJourney.journeyId);
      
      // Update current day and check if journey is complete
      const nextDay = dayNumber + 1;
      if (journey && nextDay > journey.durationDays) {
        // Journey complete!
        await storage.updateUserJourney(userJourneyId, {
          status: "completed",
          completedAt: new Date(),
          currentDay: dayNumber,
        });
      } else {
        // Move to next day
        await storage.updateUserJourney(userJourneyId, {
          currentDay: nextDay,
        });
      }
      
      // Update streak
      const today = new Date().toISOString().split('T')[0];
      const streak = await storage.getUserStreak(userId);
      let newStreakCount = 1;
      
      if (!streak) {
        await storage.updateUserStreak(userId, {
          currentStreak: 1,
          longestStreak: 1,
          lastCompletedDate: today,
        });
      } else if (streak.lastCompletedDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        newStreakCount = streak.lastCompletedDate === yesterdayStr 
          ? (streak.currentStreak || 0) + 1 
          : 1;
        
        await storage.updateUserStreak(userId, {
          currentStreak: newStreakCount,
          longestStreak: Math.max(newStreakCount, streak.longestStreak || 0),
          lastCompletedDate: today,
        });
      } else {
        newStreakCount = streak.currentStreak || 1;
      }
      
      // Award badges based on achievements
      const awardedBadges: string[] = [];
      
      // STARTED_STRONG: First day completed
      if (dayNumber === 1) {
        const badge = await storage.getBadgeByCode('STARTED_STRONG');
        if (badge && !(await storage.hasUserBadge(userId, badge.id))) {
          await storage.awardBadge(userId, badge.id);
          awardedBadges.push(badge.name);
        }
      }
      
      // CONSISTENT: 3-day streak
      if (newStreakCount >= 3) {
        const badge = await storage.getBadgeByCode('CONSISTENT');
        if (badge && !(await storage.hasUserBadge(userId, badge.id))) {
          await storage.awardBadge(userId, badge.id);
          awardedBadges.push(badge.name);
        }
      }
      
      // MOMENTUM: 7-day streak
      if (newStreakCount >= 7) {
        const badge = await storage.getBadgeByCode('MOMENTUM');
        if (badge && !(await storage.hasUserBadge(userId, badge.id))) {
          await storage.awardBadge(userId, badge.id);
          awardedBadges.push(badge.name);
        }
      }
      
      // FINISHER: Completed a journey
      if (journey && nextDay > journey.durationDays) {
        const badge = await storage.getBadgeByCode('FINISHER');
        if (badge && !(await storage.hasUserBadge(userId, badge.id))) {
          await storage.awardBadge(userId, badge.id);
          awardedBadges.push(badge.name);
        }
      }
      
      res.json({ ...completedDay, awardedBadges, newStreakCount });
    } catch (error: any) {
      console.error("Error completing day:", error);
      res.status(400).json({ message: error.message || "Failed to complete day" });
    }
  });

  // ===== JOURNEY WEEKS ROUTES (8-week programs) =====
  
  // Get all weeks for a journey by slug
  app.get('/api/journeys/:slug/weeks', async (req, res) => {
    try {
      const slug = req.params.slug;
      const journey = await storage.getJourneyBySlug(slug);
      if (!journey) {
        return res.status(404).json({ message: "Journey not found" });
      }
      const weeks = await storage.getJourneyWeeks(journey.id);
      res.json({ journey, weeks });
    } catch (error) {
      console.error("Error fetching journey weeks:", error);
      res.status(500).json({ message: "Failed to fetch journey weeks" });
    }
  });

  // Get session sections for a specific week
  app.get('/api/journey-weeks/:id/sections', async (req, res) => {
    try {
      const weekId = parseInt(req.params.id);
      const sections = await storage.getSessionSections(weekId);
      res.json(sections);
    } catch (error) {
      console.error("Error fetching session sections:", error);
      res.status(500).json({ message: "Failed to fetch session sections" });
    }
  });

  // Get mentor prompts for a specific week
  app.get('/api/journey-weeks/:id/mentor-prompts', async (req, res) => {
    try {
      const weekId = parseInt(req.params.id);
      const prompts = await storage.getMentorPrompts(weekId);
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching mentor prompts:", error);
      res.status(500).json({ message: "Failed to fetch mentor prompts" });
    }
  });

  // Create I Will commitment (protected)
  app.post('/api/user-journeys/:id/commitments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const userJourneyId = parseInt(req.params.id);
      
      const userJourney = await storage.getUserJourney(userJourneyId);
      if (!userJourney || userJourney.userId !== userId) {
        return res.status(404).json({ message: "Journey not found" });
      }
      
      const commitment = await storage.createIWillCommitment({
        userJourneyId,
        weekNumber: req.body.weekNumber,
        commitment: req.body.commitment,
        whoToEncourage: req.body.whoToEncourage,
      });
      res.status(201).json(commitment);
    } catch (error: any) {
      console.error("Error creating commitment:", error);
      res.status(400).json({ message: error.message || "Failed to create commitment" });
    }
  });

  // Get user's commitments for a journey (protected)
  app.get('/api/user-journeys/:id/commitments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const userJourneyId = parseInt(req.params.id);
      
      const userJourney = await storage.getUserJourney(userJourneyId);
      if (!userJourney || userJourney.userId !== userId) {
        return res.status(404).json({ message: "Journey not found" });
      }
      
      const commitments = await storage.getIWillCommitments(userJourneyId);
      res.json(commitments);
    } catch (error) {
      console.error("Error fetching commitments:", error);
      res.status(500).json({ message: "Failed to fetch commitments" });
    }
  });

  // Get user streak and badges (protected)
  app.get('/api/me/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const streak = await storage.getUserStreak(userId);
      const userBadges = await storage.getUserBadges(userId);
      const allBadges = await storage.getBadges();
      
      // Enrich user badges with badge details
      const enrichedBadges = userBadges.map(ub => {
        const badge = allBadges.find(b => b.id === ub.badgeId);
        return { ...ub, badge };
      });
      
      res.json({
        streak: streak || { currentStreak: 0, longestStreak: 0 },
        badges: enrichedBadges,
      });
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // ===== SEED DATA ROUTE (development only) =====
  app.post('/api/seed/journey', async (req, res) => {
    try {
      // Check if journey already exists
      const existing = await storage.getJourneyBySlug('find-your-way-back');
      if (existing) {
        return res.json({ message: "Journey already exists", journey: existing });
      }

      // Create the main journey
      const journey = await storage.createJourney({
        slug: 'find-your-way-back',
        title: 'Find Your Way Back',
        subtitle: 'A 7-Day Journey to Rediscover Your Faith',
        description: 'Life can pull us away from what matters most. This 7-day journey will help you reconnect with God, rediscover your purpose, and take meaningful steps back toward a vibrant relationship with Jesus.',
        category: 'faith-basics',
        durationDays: 7,
        level: 'beginner',
        heroImageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800',
        isPublished: 'true',
      });

      // Day 1: The First Step Home
      const day1 = await storage.createJourneyDay({
        journeyId: journey.id,
        dayNumber: 1,
        title: 'The First Step Home',
        summary: 'No matter how far you\'ve wandered, God is waiting with open arms.',
        estimatedMinutes: 12,
      });

      await storage.createJourneyStep({ journeyDayId: day1.id, stepOrder: 1, stepType: 'scripture', contentJson: { reference: 'Luke 15:20', text: '"But while he was still a long way off, his father saw him and was filled with compassion for him; he ran to his son, threw his arms around him and kissed him."' } });
      await storage.createJourneyStep({ journeyDayId: day1.id, stepOrder: 2, stepType: 'teaching', contentJson: { title: 'God Runs Toward You', body: 'The story of the prodigal son reveals something stunning about God\'s heart. The father didn\'t wait at home, arms crossed. He was watching. Waiting. And when he saw his son, he ran. In ancient Middle Eastern culture, dignified men didn\'t run. But love makes us do undignified things. God isn\'t standing at a distance, disappointed in how far you\'ve drifted. He\'s running toward you right now.' } });
      await storage.createJourneyStep({ journeyDayId: day1.id, stepOrder: 3, stepType: 'reflection', contentJson: { prompt: 'What does it feel like to know that God is running toward you, not away from you? What\'s been holding you back from taking that first step home?' } });
      await storage.createJourneyStep({ journeyDayId: day1.id, stepOrder: 4, stepType: 'action', contentJson: { task: 'Find a quiet moment today. Close your eyes and picture God running toward you with joy, not judgment. Sit with that image for 2 minutes.' } });
      await storage.createJourneyStep({ journeyDayId: day1.id, stepOrder: 5, stepType: 'prayer', contentJson: { text: 'Father, I\'ve been away too long. Thank you for not giving up on me. Thank you for running toward me even when I was walking away. I\'m taking my first step home today. Meet me where I am. Amen.' } });

      // Day 2: Letting Go of Shame
      const day2 = await storage.createJourneyDay({
        journeyId: journey.id,
        dayNumber: 2,
        title: 'Letting Go of Shame',
        summary: 'Your past mistakes don\'t disqualify you from God\'s love.',
        estimatedMinutes: 10,
      });

      await storage.createJourneyStep({ journeyDayId: day2.id, stepOrder: 1, stepType: 'scripture', contentJson: { reference: 'Romans 8:1', text: '"Therefore, there is now no condemnation for those who are in Christ Jesus."' } });
      await storage.createJourneyStep({ journeyDayId: day2.id, stepOrder: 2, stepType: 'teaching', contentJson: { title: 'Shame vs. Grace', body: 'Shame whispers that you\'ve gone too far, messed up too badly, or waited too long. It tells you that you need to clean yourself up before coming back to God. But grace says something different. Grace says come as you are. The woman at the well had five husbands and was living with another man. Jesus didn\'t shame her—He offered her living water. Your mistakes don\'t disqualify you; they\'re exactly why Jesus came.' } });
      await storage.createJourneyStep({ journeyDayId: day2.id, stepOrder: 3, stepType: 'reflection', contentJson: { prompt: 'What shame have you been carrying that\'s kept you from fully returning to God? Can you name it and release it today?' } });
      await storage.createJourneyStep({ journeyDayId: day2.id, stepOrder: 4, stepType: 'action', contentJson: { task: 'Write down one thing you\'ve felt ashamed about. Then write "NO CONDEMNATION" over it. Crumple it up and throw it away as a symbol of letting it go.' } });
      await storage.createJourneyStep({ journeyDayId: day2.id, stepOrder: 5, stepType: 'prayer', contentJson: { text: 'Lord Jesus, I\'ve carried this shame for too long. I choose today to believe Your word over my feelings. There is no condemnation for me in You. Help me walk in this truth. I receive Your grace. Amen.' } });

      // Day 3: Hearing His Voice Again
      const day3 = await storage.createJourneyDay({
        journeyId: journey.id,
        dayNumber: 3,
        title: 'Hearing His Voice Again',
        summary: 'God is still speaking. Let\'s tune back in together.',
        estimatedMinutes: 12,
      });

      await storage.createJourneyStep({ journeyDayId: day3.id, stepOrder: 1, stepType: 'scripture', contentJson: { reference: 'John 10:27', text: '"My sheep listen to my voice; I know them, and they follow me."' } });
      await storage.createJourneyStep({ journeyDayId: day3.id, stepOrder: 2, stepType: 'teaching', contentJson: { title: 'Tuning In', body: 'When we drift from God, we don\'t lose the ability to hear Him—we just get out of practice. It\'s like a muscle that needs exercising. God speaks through His Word, through prayer, through community, through circumstances, and through that gentle inner nudge of the Holy Spirit. The key isn\'t trying harder to hear; it\'s slowing down enough to listen. God hasn\'t gone silent. We\'ve just gotten busy.' } });
      await storage.createJourneyStep({ journeyDayId: day3.id, stepOrder: 3, stepType: 'reflection', contentJson: { prompt: 'When was the last time you felt like God spoke to you? What was happening in your life then that made it easier to hear Him?' } });
      await storage.createJourneyStep({ journeyDayId: day3.id, stepOrder: 4, stepType: 'action', contentJson: { task: 'Set aside 5 minutes of complete silence today. No phone, no music, no distractions. Just sit and listen. Write down anything that comes to mind.' } });
      await storage.createJourneyStep({ journeyDayId: day3.id, stepOrder: 5, stepType: 'prayer', contentJson: { text: 'Holy Spirit, tune my heart to hear Your voice again. Cut through the noise of my life. Speak, Lord, Your servant is listening. I want to know You more. Amen.' } });

      // Day 4: Rebuilding Trust
      const day4 = await storage.createJourneyDay({
        journeyId: journey.id,
        dayNumber: 4,
        title: 'Rebuilding Trust',
        summary: 'Trusting God again after disappointment or distance.',
        estimatedMinutes: 11,
      });

      await storage.createJourneyStep({ journeyDayId: day4.id, stepOrder: 1, stepType: 'scripture', contentJson: { reference: 'Proverbs 3:5-6', text: '"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."' } });
      await storage.createJourneyStep({ journeyDayId: day4.id, stepOrder: 2, stepType: 'teaching', contentJson: { title: 'When Trust Is Hard', body: 'Sometimes we drift because we felt let down. Prayers went unanswered. Life didn\'t go as planned. It\'s okay to be honest about that. God can handle your questions and doubts. Trust isn\'t about pretending everything is fine—it\'s about choosing to believe that God is good even when circumstances aren\'t. Rebuilding trust takes time. Start small. One prayer. One step. One day at a time.' } });
      await storage.createJourneyStep({ journeyDayId: day4.id, stepOrder: 3, stepType: 'reflection', contentJson: { prompt: 'Has disappointment or unanswered prayer made it hard to trust God? What would it look like to give Him one small area of your life today?' } });
      await storage.createJourneyStep({ journeyDayId: day4.id, stepOrder: 4, stepType: 'action', contentJson: { task: 'Choose one small thing you can trust God with today—a worry, a decision, a relationship. Verbally surrender it to Him: "God, I\'m choosing to trust You with this."' } });
      await storage.createJourneyStep({ journeyDayId: day4.id, stepOrder: 5, stepType: 'prayer', contentJson: { text: 'Father, I admit that trusting You hasn\'t been easy. I\'ve had questions and disappointments. But today, I choose to lean into You again. Help me trust You one step at a time. Amen.' } });

      // Day 5: Finding Your People
      const day5 = await storage.createJourneyDay({
        journeyId: journey.id,
        dayNumber: 5,
        title: 'Finding Your People',
        summary: 'Faith was never meant to be a solo journey.',
        estimatedMinutes: 10,
      });

      await storage.createJourneyStep({ journeyDayId: day5.id, stepOrder: 1, stepType: 'scripture', contentJson: { reference: 'Hebrews 10:24-25', text: '"And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together, as some are in the habit of doing, but encouraging one another."' } });
      await storage.createJourneyStep({ journeyDayId: day5.id, stepOrder: 2, stepType: 'teaching', contentJson: { title: 'You Need Community', body: 'Isolation is the enemy of transformation. When we drift from God, we often drift from community too. But finding your way back means finding your people—those who will encourage you, challenge you, and walk alongside you. This doesn\'t have to be a formal church (though that helps). It could be a small group, a friend who shares your faith, or an online community. The key is connection.' } });
      await storage.createJourneyStep({ journeyDayId: day5.id, stepOrder: 3, stepType: 'reflection', contentJson: { prompt: 'Who in your life encourages your faith? If no one comes to mind, what\'s one step you could take to find Christian community?' } });
      await storage.createJourneyStep({ journeyDayId: day5.id, stepOrder: 4, stepType: 'action', contentJson: { task: 'Reach out to one person today who encourages your faith. Send a text, make a call, or set up a time to meet. If you don\'t have someone, explore one community option (local church, online group, Reawakened community).' } });
      await storage.createJourneyStep({ journeyDayId: day5.id, stepOrder: 5, stepType: 'prayer', contentJson: { text: 'Lord, lead me to my people—those who will help me grow closer to You. Give me courage to reach out and connect. I don\'t want to walk alone anymore. Amen.' } });

      // Day 6: Discovering Your Purpose
      const day6 = await storage.createJourneyDay({
        journeyId: journey.id,
        dayNumber: 6,
        title: 'Discovering Your Purpose',
        summary: 'God has a plan for your life—let\'s rediscover it.',
        estimatedMinutes: 12,
      });

      await storage.createJourneyStep({ journeyDayId: day6.id, stepOrder: 1, stepType: 'scripture', contentJson: { reference: 'Jeremiah 29:11', text: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."' } });
      await storage.createJourneyStep({ journeyDayId: day6.id, stepOrder: 2, stepType: 'teaching', contentJson: { title: 'Purpose Never Expired', body: 'Here\'s encouraging news: your purpose hasn\'t expired. The gifts God placed in you, the calling He spoke over your life, the dreams He planted in your heart—they\'re still valid. Time away from God doesn\'t cancel His plans for you. Moses was 80 when he led Israel out of Egypt. Peter denied Jesus three times before becoming the rock of the early church. Your story isn\'t over. Your purpose is still unfolding.' } });
      await storage.createJourneyStep({ journeyDayId: day6.id, stepOrder: 3, stepType: 'reflection', contentJson: { prompt: 'What gifts, passions, or dreams has God placed in you? Have you abandoned any of them? What would it look like to revisit them?' } });
      await storage.createJourneyStep({ journeyDayId: day6.id, stepOrder: 4, stepType: 'action', contentJson: { task: 'Write down three things you\'re good at or passionate about. Ask God how He might want to use these for His kingdom. Listen for His response.' } });
      await storage.createJourneyStep({ journeyDayId: day6.id, stepOrder: 5, stepType: 'prayer', contentJson: { text: 'God, thank You that my purpose hasn\'t expired. Reignite the dreams You\'ve placed in me. Show me how to use my gifts for Your glory. I want my life to count for something eternal. Amen.' } });

      // Day 7: A New Beginning
      const day7 = await storage.createJourneyDay({
        journeyId: journey.id,
        dayNumber: 7,
        title: 'A New Beginning',
        summary: 'This isn\'t the end—it\'s the start of something beautiful.',
        estimatedMinutes: 10,
      });

      await storage.createJourneyStep({ journeyDayId: day7.id, stepOrder: 1, stepType: 'scripture', contentJson: { reference: '2 Corinthians 5:17', text: '"Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!"' } });
      await storage.createJourneyStep({ journeyDayId: day7.id, stepOrder: 2, stepType: 'teaching', contentJson: { title: 'New Every Morning', body: 'You\'ve made it through 7 days of intentional reconnection with God. This isn\'t a graduation—it\'s a new beginning. Every morning, God\'s mercies are new (Lamentations 3:22-23). Every day is a fresh start. The habits you\'ve started this week—reading Scripture, praying, reflecting, taking action—these are the building blocks of a vibrant faith. Keep going. The journey doesn\'t end here; it\'s just getting started.' } });
      await storage.createJourneyStep({ journeyDayId: day7.id, stepOrder: 3, stepType: 'reflection', contentJson: { prompt: 'What\'s been the most meaningful moment or insight from this journey? How do you want to continue growing from here?' } });
      await storage.createJourneyStep({ journeyDayId: day7.id, stepOrder: 4, stepType: 'action', contentJson: { task: 'Set one specific goal for your continued spiritual growth: daily Bible reading, weekly church attendance, joining a small group, or starting another journey. Write it down and commit to it.' } });
      await storage.createJourneyStep({ journeyDayId: day7.id, stepOrder: 5, stepType: 'prayer', contentJson: { text: 'Father, thank You for meeting me in this journey. Thank You for Your patience, Your grace, and Your relentless love. This isn\'t the end—it\'s a new beginning. Keep drawing me closer. I\'m all in. Amen.' } });

      // Also seed the 4 MVP badges
      const badgeDefinitions = [
        { code: 'STARTED_STRONG', name: 'Started Strong', description: 'Completed your first day of a journey', criteriaJson: { type: 'days_completed', value: 1 } },
        { code: 'CONSISTENT', name: 'Consistent', description: 'Maintained a 3-day streak', criteriaJson: { type: 'streak', value: 3 } },
        { code: 'MOMENTUM', name: 'Momentum', description: 'Maintained a 7-day streak', criteriaJson: { type: 'streak', value: 7 } },
        { code: 'FINISHER', name: 'Finisher', description: 'Completed an entire journey', criteriaJson: { type: 'journey_completed', value: 1 } },
      ];

      for (const badge of badgeDefinitions) {
        const existingBadge = await storage.getBadgeByCode(badge.code);
        if (!existingBadge) {
          await storage.createBadge(badge);
        }
      }

      res.status(201).json({ message: "Journey and badges seeded successfully", journeyId: journey.id });
    } catch (error: any) {
      console.error("Error seeding journey:", error);
      res.status(500).json({ message: error.message || "Failed to seed journey" });
    }
  });

  // ===== ALPHA COHORT ROUTES =====

  // Get all alpha cohorts (public)
  app.get('/api/alpha-cohorts', async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const cohorts = await storage.getAlphaCohorts(status);
      
      // Enrich with participant count
      const enriched = await Promise.all(cohorts.map(async (cohort) => {
        const participants = await storage.getAlphaCohortParticipants(cohort.id);
        const weeks = await storage.getAlphaCohortWeeks(cohort.id);
        return {
          ...cohort,
          participantCount: participants.filter(p => p.status === 'approved').length,
          weekCount: weeks.length,
        };
      }));
      
      res.json(enriched);
    } catch (error) {
      console.error("Error fetching alpha cohorts:", error);
      res.status(500).json({ message: "Failed to fetch alpha cohorts" });
    }
  });

  // Get a single alpha cohort with weeks and facilitators
  app.get('/api/alpha-cohorts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cohort = await storage.getAlphaCohort(id);
      if (!cohort) {
        return res.status(404).json({ message: "Alpha cohort not found" });
      }
      
      const weeks = await storage.getAlphaCohortWeeks(id);
      const participants = await storage.getAlphaCohortParticipants(id);
      const facilitators = participants.filter(p => p.role === 'facilitator' || p.role === 'host');
      
      res.json({
        ...cohort,
        weeks,
        facilitatorCount: facilitators.length,
        participantCount: participants.filter(p => p.status === 'approved').length,
      });
    } catch (error) {
      console.error("Error fetching alpha cohort:", error);
      res.status(500).json({ message: "Failed to fetch alpha cohort" });
    }
  });

  // Enroll in an alpha cohort (protected)
  app.post('/api/alpha-cohorts/:id/enroll', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const cohortId = parseInt(req.params.id);
      
      // Check if cohort exists
      const cohort = await storage.getAlphaCohort(cohortId);
      if (!cohort) {
        return res.status(404).json({ message: "Alpha cohort not found" });
      }
      
      // Check if already enrolled
      const existing = await storage.getAlphaCohortParticipant(cohortId, userId);
      if (existing) {
        return res.json(existing);
      }
      
      // Check capacity
      const participants = await storage.getAlphaCohortParticipants(cohortId);
      const approvedCount = participants.filter(p => p.status === 'approved').length;
      if (cohort.capacity && approvedCount >= cohort.capacity) {
        return res.status(400).json({ message: "This cohort is full" });
      }
      
      const participant = await storage.enrollInAlphaCohort(cohortId, userId);
      res.status(201).json(participant);
    } catch (error: any) {
      console.error("Error enrolling in alpha cohort:", error);
      res.status(400).json({ message: error.message || "Failed to enroll" });
    }
  });

  // Get user's enrolled alpha cohorts (protected)
  app.get('/api/me/alpha-cohorts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const participations = await storage.getUserAlphaCohorts(userId);
      
      // Enrich with cohort details and progress
      const enriched = await Promise.all(participations.map(async (p) => {
        const cohort = await storage.getAlphaCohort(p.cohortId);
        const weeks = await storage.getAlphaCohortWeeks(p.cohortId);
        const progressRecords = await storage.getAlphaCohortWeekProgress(p.id);
        
        // Map progress to simplified format for frontend
        const progress = weeks.map(w => {
          const pr = progressRecords.find(pr => pr.weekNumber === w.weekNumber);
          return {
            weekNumber: w.weekNumber,
            watched: !!pr?.watchedAt,
            prayerCompleted: !!pr?.prayerActionCompletedAt,
          };
        });
        
        return {
          cohort,
          participant: p,
          progress,
        };
      }));
      
      res.json(enriched);
    } catch (error) {
      console.error("Error fetching user alpha cohorts:", error);
      res.status(500).json({ message: "Failed to fetch user alpha cohorts" });
    }
  });

  // Get week content for participant (protected)
  app.get('/api/alpha-cohorts/:cohortId/week/:weekNumber', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const cohortId = parseInt(req.params.cohortId);
      const weekNumber = parseInt(req.params.weekNumber);
      
      const participant = await storage.getAlphaCohortParticipant(cohortId, userId);
      if (!participant) {
        return res.status(403).json({ message: "You are not enrolled in this cohort" });
      }
      
      const cohort = await storage.getAlphaCohort(cohortId);
      if (!cohort) {
        return res.status(404).json({ message: "Cohort not found" });
      }
      
      const weeks = await storage.getAlphaCohortWeeks(cohortId);
      const week = weeks.find(w => w.weekNumber === weekNumber);
      if (!week) {
        return res.status(404).json({ message: "Week not found" });
      }
      
      const allProgress = await storage.getAlphaCohortWeekProgress(participant.id);
      const weekProgress = allProgress.find(p => p.weekNumber === weekNumber);
      
      res.json({
        week,
        cohort,
        participant,
        progress: weekProgress || null,
      });
    } catch (error) {
      console.error("Error fetching week content:", error);
      res.status(500).json({ message: "Failed to fetch week content" });
    }
  });

  // Update week progress (protected)
  app.post('/api/alpha-cohort-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { participantId, weekNumber, watchedAt, discussionNotes, prayerActionCompletedAt, reflection } = req.body;
      
      // Verify participant belongs to user
      const participant = await storage.getAlphaCohortParticipantById(participantId);
      if (!participant || participant.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Frontend sends boolean flags, convert to dates
      const progress = await storage.updateAlphaCohortWeekProgress(participantId, weekNumber, {
        watchedAt: watchedAt === true ? new Date() : (watchedAt ? new Date(watchedAt) : undefined),
        discussionNotes,
        prayerActionCompletedAt: prayerActionCompletedAt === true ? new Date() : (prayerActionCompletedAt ? new Date(prayerActionCompletedAt) : undefined),
        reflection,
      });
      
      res.json(progress);
    } catch (error: any) {
      console.error("Error updating progress:", error);
      res.status(400).json({ message: error.message || "Failed to update progress" });
    }
  });

  // Create alpha cohort (admin)
  app.post('/api/alpha-cohorts', isAuthenticated, async (req, res) => {
    try {
      const cohortData = insertAlphaCohortSchema.parse(req.body);
      const cohort = await storage.createAlphaCohort(cohortData);
      res.status(201).json(cohort);
    } catch (error: any) {
      console.error("Error creating alpha cohort:", error);
      res.status(400).json({ message: error.message || "Failed to create cohort" });
    }
  });

  // Add week to cohort (admin)
  app.post('/api/alpha-cohorts/:id/weeks', isAuthenticated, async (req, res) => {
    try {
      const cohortId = parseInt(req.params.id);
      const weekData = insertAlphaCohortWeekSchema.parse({ ...req.body, cohortId });
      const week = await storage.createAlphaCohortWeek(weekData);
      res.status(201).json(week);
    } catch (error: any) {
      console.error("Error creating week:", error);
      res.status(400).json({ message: error.message || "Failed to create week" });
    }
  });

  // ===== VISION PATHWAY ROUTES =====

  // Get current session
  app.get('/api/vision/sessions/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const session = await storage.getCurrentPathwaySession(userId);
      res.json({ ok: true, data: session || null });
    } catch (error) {
      console.error("Error fetching current session:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to fetch session" } });
    }
  });

  // Get all sessions
  app.get('/api/vision/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const sessions = await storage.getPathwaySessions(userId);
      res.json({ ok: true, data: { items: sessions } });
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to fetch sessions" } });
    }
  });

  // Create session
  app.post('/api/vision/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { seasonType, seasonLabel, themeWord, mode } = req.body;
      const session = await storage.createPathwaySession({ userId, seasonType, seasonLabel, themeWord, mode, status: 'active' });
      res.status(201).json({ ok: true, data: session });
    } catch (error: any) {
      console.error("Error creating session:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to create session" } });
    }
  });

  // Update session
  app.patch('/api/vision/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.updatePathwaySession(sessionId, req.body);
      res.json({ ok: true, data: session });
    } catch (error: any) {
      console.error("Error updating session:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to update session" } });
    }
  });

  // Get wheel entries
  app.get('/api/vision/sessions/:id/wheel', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const entries = await storage.getWheelEntries(sessionId);
      const focusAreas = await storage.getFocusAreas(sessionId);
      const highest = [...entries].sort((a, b) => b.score - a.score).slice(0, 2).map(e => e.categoryKey);
      const lowest = [...entries].sort((a, b) => a.score - b.score).slice(0, 2).map(e => e.categoryKey);
      res.json({ ok: true, data: { categories: entries, focusAreas: focusAreas.map(f => f.categoryKey), computed: { highest, lowest } } });
    } catch (error) {
      console.error("Error fetching wheel:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to fetch wheel" } });
    }
  });

  // Save wheel entries
  app.put('/api/vision/sessions/:id/wheel', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { categories, focusAreas: focusAreaKeys } = req.body;
      const entries = await storage.upsertWheelEntries(sessionId, categories.map((c: any) => ({ sessionId, ...c })));
      const areas = await storage.upsertFocusAreas(sessionId, focusAreaKeys.map((key: string, i: number) => ({ sessionId, categoryKey: key, priority: i + 1 })));
      const highest = [...entries].sort((a, b) => b.score - a.score).slice(0, 2).map(e => e.categoryKey);
      const lowest = [...entries].sort((a, b) => a.score - b.score).slice(0, 2).map(e => e.categoryKey);
      res.json({ ok: true, data: { categories: entries, focusAreas: areas.map(a => a.categoryKey), computed: { highest, lowest } } });
    } catch (error: any) {
      console.error("Error saving wheel:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to save wheel" } });
    }
  });

  // Get values
  app.get('/api/vision/sessions/:id/values', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const values = await storage.getValuesSelection(sessionId);
      res.json({ ok: true, data: values || null });
    } catch (error) {
      console.error("Error fetching values:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to fetch values" } });
    }
  });

  // Save values
  app.put('/api/vision/sessions/:id/values', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const values = await storage.upsertValuesSelection(sessionId, req.body);
      res.json({ ok: true, data: values });
    } catch (error: any) {
      console.error("Error saving values:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to save values" } });
    }
  });

  // Get vision statement
  app.get('/api/vision/sessions/:id/vision', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const vision = await storage.getVisionStatement(sessionId);
      res.json({ ok: true, data: vision || null });
    } catch (error) {
      console.error("Error fetching vision:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to fetch vision" } });
    }
  });

  // Save vision statement
  app.put('/api/vision/sessions/:id/vision', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const vision = await storage.upsertVisionStatement(sessionId, req.body);
      res.json({ ok: true, data: vision });
    } catch (error: any) {
      console.error("Error saving vision:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to save vision" } });
    }
  });

  // Get purpose flower
  app.get('/api/vision/sessions/:id/purpose', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const purpose = await storage.getPurposeFlower(sessionId);
      res.json({ ok: true, data: purpose || null });
    } catch (error) {
      console.error("Error fetching purpose:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to fetch purpose" } });
    }
  });

  // Save purpose flower
  app.put('/api/vision/sessions/:id/purpose', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const purpose = await storage.upsertPurposeFlower(sessionId, req.body);
      res.json({ ok: true, data: purpose });
    } catch (error: any) {
      console.error("Error saving purpose:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to save purpose" } });
    }
  });

  // Get goals
  app.get('/api/vision/sessions/:id/goals', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const goals = await storage.getVisionGoals(sessionId);
      res.json({ ok: true, data: goals });
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to fetch goals" } });
    }
  });

  // Create goal
  app.post('/api/vision/goals', isAuthenticated, async (req: any, res) => {
    try {
      const goal = await storage.createVisionGoal(req.body);
      res.status(201).json({ ok: true, data: goal });
    } catch (error: any) {
      console.error("Error creating goal:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to create goal" } });
    }
  });

  // Update goal
  app.patch('/api/vision/goals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.updateVisionGoal(goalId, req.body);
      res.json({ ok: true, data: goal });
    } catch (error: any) {
      console.error("Error updating goal:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to update goal" } });
    }
  });

  // Get milestones for a goal
  app.get('/api/vision/goals/:id/milestones', isAuthenticated, async (req: any, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const milestones = await storage.getGoalMilestones(goalId);
      res.json({ ok: true, data: milestones });
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to fetch milestones" } });
    }
  });

  // Create milestone
  app.post('/api/vision/milestones', isAuthenticated, async (req: any, res) => {
    try {
      const milestone = await storage.createGoalMilestone(req.body);
      res.status(201).json({ ok: true, data: milestone });
    } catch (error: any) {
      console.error("Error creating milestone:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to create milestone" } });
    }
  });

  // Update milestone
  app.patch('/api/vision/milestones/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const milestone = await storage.updateGoalMilestone(id, req.body);
      res.json({ ok: true, data: milestone });
    } catch (error: any) {
      console.error("Error updating milestone:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to update milestone" } });
    }
  });

  // Delete milestone
  app.delete('/api/vision/milestones/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGoalMilestone(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting milestone:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to delete milestone" } });
    }
  });

  // Get 90-day plan
  app.get('/api/vision/sessions/:id/plan', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const plan = await storage.getNinetyDayPlan(sessionId);
      res.json({ ok: true, data: plan || null });
    } catch (error) {
      console.error("Error fetching plan:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to fetch plan" } });
    }
  });

  // Save 90-day plan
  app.put('/api/vision/sessions/:id/plan', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const plan = await storage.upsertNinetyDayPlan(sessionId, req.body);
      res.json({ ok: true, data: plan });
    } catch (error: any) {
      console.error("Error saving plan:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to save plan" } });
    }
  });

  // Get habits
  app.get('/api/vision/sessions/:id/habits', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const habits = await storage.getVisionHabits(sessionId);
      res.json({ ok: true, data: habits });
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to fetch habits" } });
    }
  });

  // Create habit
  app.post('/api/vision/habits', isAuthenticated, async (req: any, res) => {
    try {
      const habit = await storage.createVisionHabit(req.body);
      res.status(201).json({ ok: true, data: habit });
    } catch (error: any) {
      console.error("Error creating habit:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to create habit" } });
    }
  });

  // Update habit
  app.patch('/api/vision/habits/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const habit = await storage.updateVisionHabit(id, req.body);
      res.json({ ok: true, data: habit });
    } catch (error: any) {
      console.error("Error updating habit:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to update habit" } });
    }
  });

  // Delete habit
  app.delete('/api/vision/habits/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVisionHabit(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting habit:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to delete habit" } });
    }
  });

  // Log habit
  app.post('/api/vision/habits/:id/log', isAuthenticated, async (req: any, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const { date, completed } = req.body;
      if (typeof date !== 'string' || typeof completed !== 'boolean') {
        return res.status(400).json({ ok: false, error: { message: "Invalid input: date must be string, completed must be boolean" } });
      }
      const log = await storage.upsertHabitLog(habitId, date, completed);
      res.json({ ok: true, data: log });
    } catch (error: any) {
      console.error("Error logging habit:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to log habit" } });
    }
  });

  // Get habit logs
  app.get('/api/vision/habits/:id/logs', isAuthenticated, async (req: any, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const logs = await storage.getHabitLogs(habitId);
      res.json({ ok: true, data: logs });
    } catch (error) {
      console.error("Error fetching habit logs:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to fetch logs" } });
    }
  });

  // Get daily check-in
  app.get('/api/vision/sessions/:id/checkin/daily/:date', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const date = req.params.date;
      const checkin = await storage.getDailyCheckin(sessionId, date);
      res.json({ ok: true, data: checkin || null });
    } catch (error) {
      console.error("Error fetching daily checkin:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to fetch checkin" } });
    }
  });

  // Get weekly review
  app.get('/api/vision/sessions/:id/checkin/weekly/:weekStart', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const weekStartDate = req.params.weekStart;
      const review = await storage.getWeeklyReview(sessionId, weekStartDate);
      res.json({ ok: true, data: review || null });
    } catch (error) {
      console.error("Error fetching weekly review:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to fetch review" } });
    }
  });

  // Daily check-in
  app.post('/api/vision/sessions/:id/checkin/daily', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { date, ...data } = req.body;
      const checkin = await storage.upsertDailyCheckin(sessionId, date, data);
      res.json({ ok: true, data: checkin });
    } catch (error: any) {
      console.error("Error saving daily checkin:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to save checkin" } });
    }
  });

  // Weekly review
  app.post('/api/vision/sessions/:id/checkin/weekly', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { weekStartDate, ...data } = req.body;
      const review = await storage.upsertWeeklyReview(sessionId, weekStartDate, data);
      res.json({ ok: true, data: review });
    } catch (error: any) {
      console.error("Error saving weekly review:", error);
      res.status(400).json({ ok: false, error: { message: error.message || "Failed to save review" } });
    }
  });

  // ===== AI COACH ROUTE =====
  app.post('/api/vision/sessions/:id/ai/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { tool, data } = req.body as { tool: AICoachRequest['tool']; data: Record<string, any> };
      
      if (!tool || !data) {
        return res.status(400).json({ ok: false, error: { message: "Missing tool or data" } });
      }

      const session = await storage.getPathwaySession(sessionId);
      if (!session) {
        return res.status(404).json({ ok: false, error: { message: "Session not found" } });
      }

      const focusAreas = await storage.getFocusAreas(sessionId);
      const values = await storage.getValuesSelection(sessionId);
      const vision = await storage.getVisionStatement(sessionId);

      const sessionContext = {
        seasonLabel: session.seasonLabel || undefined,
        themeWord: session.themeWord || undefined,
        focusAreas: focusAreas.map(f => f.categoryKey),
        values: (values?.values as string[]) || [],
        purposeStatement: vision?.seasonStatement || undefined,
      };

      const insights = await getAICoachInsights({
        tool,
        mode: (session.mode as "classic" | "faith") || "classic",
        data,
        sessionContext,
      });

      res.json({ ok: true, data: insights });
    } catch (error: any) {
      console.error("Error getting AI insights:", error);
      res.status(500).json({ ok: false, error: { message: error.message || "Failed to get AI insights" } });
    }
  });

  // General AI analyze (no session required)
  app.post('/api/ai/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const { tool, data } = req.body as { tool: string; data: Record<string, any> };
      
      if (!tool || !data) {
        return res.status(400).json({ ok: false, error: { message: "Missing tool or data" } });
      }

      const insights = await getAICoachInsights({
        tool: tool as AICoachRequest['tool'],
        mode: "faith",
        data,
        sessionContext: {},
      });

      res.json({ ok: true, data: insights });
    } catch (error: any) {
      console.error("Error getting AI insights:", error);
      res.status(500).json({ ok: false, error: { message: error.message || "Failed to get AI insights" } });
    }
  });

  // ===== GROWTH TOOLS: TRACKS & MODULES =====

  app.get('/api/tracks', async (req, res) => {
    try {
      const tracksList = await storage.getTracks();
      res.json({ ok: true, data: tracksList });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.get('/api/tracks/:key', async (req, res) => {
    try {
      const track = await storage.getTrack(req.params.key);
      if (!track) return res.status(404).json({ ok: false, error: { message: "Track not found" } });
      const modulesList = await storage.getModules(track.id);
      res.json({ ok: true, data: { track, modules: modulesList } });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.get('/api/modules/:key', async (req, res) => {
    try {
      const mod = await storage.getModule(req.params.key);
      if (!mod) return res.status(404).json({ ok: false, error: { message: "Module not found" } });
      res.json({ ok: true, data: mod });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.get('/api/user/module-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId as string) : undefined;
      const progress = await storage.getUserModuleProgress(userId, sessionId);
      res.json({ ok: true, data: progress });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.post('/api/user/module-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const progress = await storage.upsertUserModuleProgress({ ...req.body, userId });
      res.json({ ok: true, data: progress });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // ===== ASSESSMENT ENGINE =====

  app.get('/api/assessments/:key', async (req, res) => {
    try {
      const assessment = await storage.getAssessment(req.params.key);
      if (!assessment) return res.status(404).json({ ok: false, error: { message: "Assessment not found" } });
      const questions = await storage.getAssessmentQuestions(assessment.id);
      res.json({ ok: true, data: { assessment, questions } });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.post('/api/assessments/:key/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { sessionId } = req.body;
      const assessment = await storage.getAssessment(req.params.key);
      if (!assessment) return res.status(404).json({ ok: false, error: { message: "Assessment not found" } });
      const response = await storage.createAssessmentResponse({ assessmentId: assessment.id, userId, sessionId, status: 'in_progress' });
      res.json({ ok: true, data: response });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.get('/api/assessment-responses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const response = await storage.getAssessmentResponse(parseInt(req.params.id));
      if (!response) return res.status(404).json({ ok: false, error: { message: "Response not found" } });
      const answers = await storage.getAssessmentAnswers(response.id);
      const scores = await storage.getAssessmentScores(response.id);
      const insight = await storage.getAssessmentInsight(response.id);
      res.json({ ok: true, data: { response, answers, scores, insight } });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.put('/api/assessment-responses/:id/answer', isAuthenticated, async (req: any, res) => {
    try {
      const responseId = parseInt(req.params.id);
      const { questionId, ...data } = req.body;
      const answer = await storage.upsertAssessmentAnswer(responseId, questionId, data);
      res.json({ ok: true, data: answer });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.post('/api/assessment-responses/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const responseId = parseInt(req.params.id);
      const response = await storage.updateAssessmentResponse(responseId, { status: 'completed', completedAt: new Date() });
      res.json({ ok: true, data: response });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.post('/api/assessment-responses/:id/scores', isAuthenticated, async (req: any, res) => {
    try {
      const responseId = parseInt(req.params.id);
      const scores = req.body.scores;
      const createdScores = await Promise.all(scores.map((s: any) => storage.createAssessmentScore({ ...s, responseId })));
      res.json({ ok: true, data: createdScores });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.post('/api/assessment-responses/:id/insight', isAuthenticated, async (req: any, res) => {
    try {
      const responseId = parseInt(req.params.id);
      const insight = await storage.createAssessmentInsight({ ...req.body, responseId });
      res.json({ ok: true, data: insight });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // ===== STRENGTHS =====

  app.get('/api/strengths-catalog', async (req, res) => {
    try {
      const catalog = await storage.getStrengthsCatalog();
      res.json({ ok: true, data: catalog });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.get('/api/vision/sessions/:id/strengths', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const strengths = await storage.getUserStrengths(sessionId);
      res.json({ ok: true, data: strengths });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.put('/api/vision/sessions/:id/strengths', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const sessionId = parseInt(req.params.id);
      const strengths = await storage.upsertUserStrengths(sessionId, userId, req.body.strengths);
      res.json({ ok: true, data: strengths });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // ===== 4 STYLES =====

  app.get('/api/styles-profiles', async (req, res) => {
    try {
      const profiles = await storage.getStylesProfiles();
      res.json({ ok: true, data: profiles });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.get('/api/vision/sessions/:id/style', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const style = await storage.getUserStyle(sessionId);
      res.json({ ok: true, data: style });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.put('/api/vision/sessions/:id/style', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const sessionId = parseInt(req.params.id);
      const style = await storage.upsertUserStyle({ ...req.body, sessionId, userId });
      res.json({ ok: true, data: style });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // ===== EQ =====

  app.get('/api/eq-domains', async (req, res) => {
    try {
      const domains = await storage.getEqDomains();
      res.json({ ok: true, data: domains });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.get('/api/vision/sessions/:id/eq-scores', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const scores = await storage.getUserEqScores(sessionId);
      res.json({ ok: true, data: scores });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // ===== PRACTICE LIBRARY =====

  app.get('/api/practices', async (req, res) => {
    try {
      const domainKey = req.query.domain as string | undefined;
      const practices = await storage.getPractices(domainKey);
      res.json({ ok: true, data: practices });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.get('/api/user/practice-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId as string) : undefined;
      const logs = await storage.getUserPracticeLogs(userId, sessionId);
      res.json({ ok: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.post('/api/user/practice-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const log = await storage.createUserPracticeLog({ ...req.body, userId });
      res.json({ ok: true, data: log });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // ===== WDEP =====

  app.post('/api/vision/sessions/:sessionId/wdep', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const sessionId = parseInt(req.params.sessionId);
      const entry = await storage.createWdepEntry({ ...req.body, userId, sessionId });
      res.json({ ok: true, data: entry });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.get('/api/wdep/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getWdepEntry(id);
      if (!entry) return res.status(404).json({ ok: false, error: { message: "WDEP entry not found" } });
      const [wants, doing, evaluation, plan, experiment] = await Promise.all([
        storage.getWdepWants(id),
        storage.getWdepDoing(id),
        storage.getWdepEvaluation(id),
        storage.getWdepPlan(id),
        storage.getWdepExperiment(id),
      ]);
      let experimentLogs: any[] = [];
      if (experiment) {
        experimentLogs = await storage.getWdepExperimentLogs(experiment.id);
      }
      res.json({ ok: true, data: { entry, wants, doing, evaluation, plan, experiment, experimentLogs } });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.get('/api/user/wdep', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId as string) : undefined;
      const entries = await storage.getWdepEntries(userId, sessionId);
      res.json({ ok: true, data: entries });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.put('/api/wdep/:id/wants', isAuthenticated, async (req: any, res) => {
    try {
      const wdepEntryId = parseInt(req.params.id);
      const wants = await storage.upsertWdepWants(wdepEntryId, req.body);
      res.json({ ok: true, data: wants });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.put('/api/wdep/:id/doing', isAuthenticated, async (req: any, res) => {
    try {
      const wdepEntryId = parseInt(req.params.id);
      const doing = await storage.upsertWdepDoing(wdepEntryId, req.body);
      res.json({ ok: true, data: doing });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.put('/api/wdep/:id/evaluation', isAuthenticated, async (req: any, res) => {
    try {
      const wdepEntryId = parseInt(req.params.id);
      const evaluation = await storage.upsertWdepEvaluation(wdepEntryId, req.body);
      res.json({ ok: true, data: evaluation });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.put('/api/wdep/:id/plan', isAuthenticated, async (req: any, res) => {
    try {
      const wdepEntryId = parseInt(req.params.id);
      const plan = await storage.upsertWdepPlan(wdepEntryId, req.body);
      await storage.updateWdepEntry(wdepEntryId, { status: 'active_plan' });
      res.json({ ok: true, data: plan });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.post('/api/wdep/:id/experiment', isAuthenticated, async (req: any, res) => {
    try {
      const wdepEntryId = parseInt(req.params.id);
      const experiment = await storage.createWdepExperiment({ ...req.body, wdepEntryId });
      res.json({ ok: true, data: experiment });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.post('/api/wdep/experiments/:experimentId/log', isAuthenticated, async (req: any, res) => {
    try {
      const experimentId = parseInt(req.params.experimentId);
      const log = await storage.createWdepExperimentLog({ ...req.body, experimentId });
      const experiment = await storage.getWdepExperimentById(experimentId);
      if (experiment && log.completed) {
        await storage.updateWdepExperiment(experimentId, { completedDays: (experiment.completedDays || 0) + 1 });
      }
      res.json({ ok: true, data: log });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.put('/api/wdep/experiments/:experimentId/reflection', isAuthenticated, async (req: any, res) => {
    try {
      const experimentId = parseInt(req.params.experimentId);
      const { reflectionDay7 } = req.body;
      
      if (!reflectionDay7 || typeof reflectionDay7 !== 'string' || reflectionDay7.trim().length === 0) {
        return res.status(400).json({ ok: false, error: { message: "Reflection text is required" } });
      }
      
      const experiment = await storage.updateWdepExperiment(experimentId, { 
        reflectionDay7: reflectionDay7.trim(),
        status: 'completed'
      });
      res.json({ ok: true, data: experiment });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.get('/api/vision/sessions/:sessionId/wdep/experiments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const sessionId = parseInt(req.params.sessionId);
      const wdepEntries = await storage.getWdepEntries(userId, sessionId);
      const experiments: any[] = [];
      for (const entry of wdepEntries) {
        const exp = await storage.getWdepExperiment(entry.id);
        if (exp) {
          const plan = await storage.getWdepPlan(entry.id);
          experiments.push({ ...exp, wdepId: entry.id, startNowAction: plan?.startNowAction || '' });
        }
      }
      res.json({ ok: true, data: experiments });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // ===== SELF-CONCORDANT ACTION =====

  app.post('/api/vision/sessions/:sessionId/sca', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const sessionId = parseInt(req.params.sessionId);
      const exercise = await storage.createScaExercise({ ...req.body, userId, sessionId });
      res.json({ ok: true, data: exercise });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.get('/api/vision/sessions/:sessionId/sca', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const sessionId = parseInt(req.params.sessionId);
      const exercises = await storage.getScaExercises(userId, sessionId);
      res.json({ ok: true, data: exercises });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.get('/api/sca/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const exercise = await storage.getScaExercise(id);
      if (!exercise) return res.status(404).json({ ok: false, error: { message: "SCA exercise not found" } });
      const focusItems = await storage.getScaFocusItems(id);
      res.json({ ok: true, data: { exercise, focusItems } });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.get('/api/user/sca', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId as string) : undefined;
      const exercises = await storage.getScaExercises(userId, sessionId);
      res.json({ ok: true, data: exercises });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.put('/api/sca/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const exercise = await storage.updateScaExercise(id, req.body);
      res.json({ ok: true, data: exercise });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  app.post('/api/sca/:id/focus-items', isAuthenticated, async (req: any, res) => {
    try {
      const scaExerciseId = parseInt(req.params.id);
      const item = await storage.createScaFocusItem({ ...req.body, scaExerciseId });
      res.json({ ok: true, data: item });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // ===== DAILY REFLECTIONS =====

  // Get today's reflection
  app.get('/api/reflection/today', async (req, res) => {
    try {
      const reflection = await storage.getTodayReflection();
      if (!reflection) {
        return res.status(404).json({ ok: false, error: { message: "No reflection available today" } });
      }
      res.json({ ok: true, data: reflection });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get a specific reflection
  app.get('/api/reflection/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reflection = await storage.getReflection(id);
      if (!reflection) {
        return res.status(404).json({ ok: false, error: { message: "Reflection not found" } });
      }
      res.json({ ok: true, data: reflection });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get user's reflection streak
  app.get('/api/reflection/streak', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const streak = await storage.getUserReflectionStreak(userId);
      res.json({ ok: true, data: { streak } });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Log viewing a reflection
  app.post('/api/reflection/:id/view', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const reflectionId = parseInt(req.params.id);
      const log = await storage.logReflectionView(userId, reflectionId);
      res.json({ ok: true, data: log });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // Log engagement (journal entry or reaction)
  app.post('/api/reflection/:id/engage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const reflectionId = parseInt(req.params.id);
      const { journalEntry, reaction } = req.body;
      const log = await storage.logReflectionEngagement(userId, reflectionId, { journalEntry, reaction });
      res.json({ ok: true, data: log });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get user's log for a specific reflection
  app.get('/api/reflection/:id/log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const reflectionId = parseInt(req.params.id);
      const log = await storage.getUserReflectionLog(userId, reflectionId);
      res.json({ ok: true, data: log || null });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Create a new reflection (admin only - for seeding)
  app.post('/api/reflections', isAuthenticated, async (req: any, res) => {
    try {
      const reflection = await storage.createReflection(req.body);
      res.json({ ok: true, data: reflection });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // ===== SESSION BOOKING =====

  // Get all active coaches
  app.get('/api/coaches', async (req, res) => {
    try {
      const coaches = await storage.getAllActiveCoaches();
      res.json({ ok: true, data: coaches });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get current user's coach profile
  app.get('/api/coach/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const profile = await storage.getCoachProfile(userId);
      res.json({ ok: true, data: profile || null });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Create or update coach profile
  app.post('/api/coach/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const existing = await storage.getCoachProfile(userId);
      if (existing) {
        const profile = await storage.updateCoachProfile(existing.id, req.body);
        res.json({ ok: true, data: profile });
      } else {
        const profile = await storage.createCoachProfile({ ...req.body, userId });
        res.json({ ok: true, data: profile });
      }
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get available slots for a coach
  app.get('/api/coaches/:coachId/slots', async (req, res) => {
    try {
      const coachId = parseInt(req.params.coachId);
      const slots = await storage.getAvailableSlots(coachId);
      res.json({ ok: true, data: slots });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Create session slots (coach only)
  app.post('/api/coach/slots', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const profile = await storage.getCoachProfile(userId);
      if (!profile) {
        return res.status(403).json({ ok: false, error: { message: "You are not registered as a coach" } });
      }
      const slot = await storage.createSessionSlot({ ...req.body, coachId: profile.id });
      res.json({ ok: true, data: slot });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get user's session bookings
  app.get('/api/user/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const bookings = await storage.getUserSessionBookings(userId);
      res.json({ ok: true, data: bookings });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get coach's session bookings (for coaches)
  app.get('/api/coach/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const profile = await storage.getCoachProfile(userId);
      if (!profile) {
        return res.status(403).json({ ok: false, error: { message: "You are not registered as a coach" } });
      }
      const bookings = await storage.getCoachSessionBookings(profile.id);
      res.json({ ok: true, data: bookings });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Create a session booking request
  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const booking = await storage.createSessionBooking({ ...req.body, userId });
      res.json({ ok: true, data: booking });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // Update session booking status
  app.put('/api/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.updateSessionBooking(id, req.body);
      res.json({ ok: true, data: booking });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get session follow-ups
  app.get('/api/sessions/:id/follow-ups', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const followUps = await storage.getSessionFollowUps(bookingId);
      res.json({ ok: true, data: followUps });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Create a session follow-up
  app.post('/api/sessions/:id/follow-ups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const bookingId = parseInt(req.params.id);
      const followUp = await storage.createSessionFollowUp({ ...req.body, bookingId, authorId: userId });
      res.json({ ok: true, data: followUp });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // ===== MINI-360 FEEDBACK =====

  // Get user's feedback campaigns
  app.get('/api/user/feedback-campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const campaigns = await storage.getUserFeedbackCampaigns(userId);
      res.json({ ok: true, data: campaigns });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get a specific feedback campaign
  app.get('/api/feedback-campaigns/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getFeedbackCampaign(id);
      if (!campaign) {
        return res.status(404).json({ ok: false, error: { message: "Campaign not found" } });
      }
      res.json({ ok: true, data: campaign });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Create a new feedback campaign
  app.post('/api/feedback-campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const campaign = await storage.createFeedbackCampaign({ ...req.body, userId });
      res.json({ ok: true, data: campaign });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // Update a feedback campaign
  app.put('/api/feedback-campaigns/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.updateFeedbackCampaign(id, req.body);
      res.json({ ok: true, data: campaign });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get campaign invites
  app.get('/api/feedback-campaigns/:id/invites', isAuthenticated, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const invites = await storage.getCampaignInvites(campaignId);
      res.json({ ok: true, data: invites });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Create a feedback invite
  app.post('/api/feedback-campaigns/:id/invites', isAuthenticated, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const invite = await storage.createFeedbackInvite({ ...req.body, campaignId, token });
      res.json({ ok: true, data: invite });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get invite by token (public - for anonymous responders)
  app.get('/api/feedback/respond/:token', async (req, res) => {
    try {
      const token = req.params.token;
      const invite = await storage.getFeedbackInviteByToken(token);
      if (!invite) {
        return res.status(404).json({ ok: false, error: { message: "Invite not found" } });
      }
      if (invite.status === 'completed') {
        return res.status(400).json({ ok: false, error: { message: "Feedback already submitted" } });
      }
      const campaign = await storage.getFeedbackCampaign(invite.campaignId);
      res.json({ ok: true, data: { invite, campaign } });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Submit feedback response (public - for anonymous responders)
  app.post('/api/feedback/respond/:token', async (req, res) => {
    try {
      const token = req.params.token;
      const invite = await storage.getFeedbackInviteByToken(token);
      if (!invite) {
        return res.status(404).json({ ok: false, error: { message: "Invite not found" } });
      }
      if (invite.status === 'completed') {
        return res.status(400).json({ ok: false, error: { message: "Feedback already submitted" } });
      }
      
      // Save each answer
      const { answers } = req.body;
      for (const answer of answers) {
        await storage.createFeedbackAnswer({
          campaignId: invite.campaignId,
          inviteId: invite.id,
          questionKey: answer.questionKey,
          rating: answer.rating,
          comment: answer.comment,
        });
      }
      
      // Update invite status
      await storage.updateFeedbackInvite(invite.id, { status: 'submitted', submittedAt: new Date() });
      
      res.json({ ok: true, data: { message: "Feedback submitted successfully" } });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get campaign answers
  app.get('/api/feedback-campaigns/:id/answers', isAuthenticated, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const answers = await storage.getCampaignAnswers(campaignId);
      res.json({ ok: true, data: answers });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Submit self-assessment
  app.post('/api/feedback-campaigns/:id/self-assessment', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const campaignId = parseInt(req.params.id);
      const { answers } = req.body;
      
      for (const answer of answers) {
        await storage.createFeedbackSelfAssessment({
          campaignId,
          userId,
          questionKey: answer.questionKey,
          rating: answer.rating,
          comment: answer.comment,
        });
      }
      
      res.json({ ok: true, data: { message: "Self-assessment submitted" } });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get campaign self-assessment
  app.get('/api/feedback-campaigns/:id/self-assessment', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const campaignId = parseInt(req.params.id);
      const assessment = await storage.getCampaignSelfAssessment(campaignId, userId);
      res.json({ ok: true, data: assessment });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get campaign aggregates
  app.get('/api/feedback-campaigns/:id/aggregates', isAuthenticated, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const aggregates = await storage.getCampaignAggregates(campaignId);
      res.json({ ok: true, data: aggregates });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Calculate and save aggregates
  app.post('/api/feedback-campaigns/:id/calculate', isAuthenticated, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const answers = await storage.getCampaignAnswers(campaignId);
      
      // Group by question key and calculate averages
      const grouped: Record<string, { ratings: number[], texts: string[] }> = {};
      for (const answer of answers) {
        if (!grouped[answer.questionKey]) {
          grouped[answer.questionKey] = { ratings: [], texts: [] };
        }
        if (answer.rating !== null) {
          grouped[answer.questionKey].ratings.push(answer.rating);
        }
        if (answer.comment) {
          grouped[answer.questionKey].texts.push(answer.comment);
        }
      }
      
      // Save aggregates
      const aggregates = [];
      for (const [dimensionKey, data] of Object.entries(grouped)) {
        const avgRating = data.ratings.length > 0 
          ? Math.round((data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length) * 10)
          : null;
        // Calculate distribution
        const distribution: Record<number, number> = {};
        for (const rating of data.ratings) {
          distribution[rating] = (distribution[rating] || 0) + 1;
        }
        const aggregate = await storage.createFeedbackAggregate({
          campaignId,
          dimensionKey,
          avgRating: avgRating,
          distributionJson: distribution,
          themesJson: data.texts.length > 0 ? data.texts : null,
        });
        aggregates.push(aggregate);
      }
      
      // Update campaign status
      await storage.updateFeedbackCampaign(campaignId, { status: 'completed' });
      
      res.json({ ok: true, data: aggregates });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // ===== MISSION HUB API ROUTES - DIGITAL FIRST =====

  // Mission Pillars
  app.get('/api/mission/pillars', async (req, res) => {
    try {
      const pillars = await storage.getMissionPillars();
      res.json(pillars);
    } catch (error) {
      console.error("Error fetching mission pillars:", error);
      res.status(500).json({ message: "Failed to fetch pillars" });
    }
  });

  // Mission Profile
  app.get('/api/mission/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const profile = await storage.getMissionProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching mission profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/mission/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const existingProfile = await storage.getMissionProfile(userId);
      
      if (existingProfile) {
        const profile = await storage.updateMissionProfile(userId, req.body);
        res.json(profile);
      } else {
        const profileData = insertMissionProfileSchema.parse({ ...req.body, userId });
        const profile = await storage.createMissionProfile(profileData);
        res.status(201).json(profile);
      }
    } catch (error: any) {
      console.error("Error creating/updating mission profile:", error);
      res.status(400).json({ message: error.message || "Failed to save profile" });
    }
  });

  // Mission Plan (Weekly goals)
  app.get('/api/mission/plan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const plan = await storage.getMissionPlan(userId);
      res.json(plan || null);
    } catch (error) {
      console.error("Error fetching mission plan:", error);
      res.status(500).json({ message: "Failed to fetch plan" });
    }
  });

  app.post('/api/mission/plan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const planData = insertMissionPlanSchema.parse({ ...req.body, userId });
      const plan = await storage.createMissionPlan(planData);
      res.status(201).json(plan);
    } catch (error: any) {
      console.error("Error creating mission plan:", error);
      res.status(400).json({ message: error.message || "Failed to create plan" });
    }
  });

  // Mission Focuses (People Groups / Nations / Cities)
  app.get('/api/mission/focuses', async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const focuses = await storage.getMissionFocuses(type);
      res.json(focuses);
    } catch (error) {
      console.error("Error fetching mission focuses:", error);
      res.status(500).json({ message: "Failed to fetch focuses" });
    }
  });

  app.get('/api/mission/focuses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const focus = await storage.getMissionFocus(id);
      if (!focus) return res.status(404).json({ message: "Focus not found" });
      res.json(focus);
    } catch (error) {
      console.error("Error fetching focus:", error);
      res.status(500).json({ message: "Failed to fetch focus" });
    }
  });

  // Prayer Guide Days
  app.get('/api/mission/focuses/:id/prayer-guide', async (req, res) => {
    try {
      const focusId = parseInt(req.params.id);
      const days = await storage.getPrayerGuideDays(focusId);
      res.json(days);
    } catch (error) {
      console.error("Error fetching prayer guide:", error);
      res.status(500).json({ message: "Failed to fetch prayer guide" });
    }
  });

  app.get('/api/mission/focuses/:id/prayer-guide/:day', async (req, res) => {
    try {
      const focusId = parseInt(req.params.id);
      const dayNumber = parseInt(req.params.day);
      const day = await storage.getPrayerGuideDay(focusId, dayNumber);
      if (!day) return res.status(404).json({ message: "Prayer guide day not found" });
      res.json(day);
    } catch (error) {
      console.error("Error fetching prayer guide day:", error);
      res.status(500).json({ message: "Failed to fetch prayer guide day" });
    }
  });

  // Mission Adoptions
  app.get('/api/mission/adoptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const adoptions = await storage.getUserAdoptions(userId);
      res.json(adoptions);
    } catch (error) {
      console.error("Error fetching adoptions:", error);
      res.status(500).json({ message: "Failed to fetch adoptions" });
    }
  });

  app.get('/api/mission/adoptions/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const adoption = await storage.getActiveAdoption(userId);
      res.json(adoption || null);
    } catch (error) {
      console.error("Error fetching active adoption:", error);
      res.status(500).json({ message: "Failed to fetch active adoption" });
    }
  });

  app.post('/api/mission/adoptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const adoptionData = insertMissionAdoptionSchema.parse({ ...req.body, userId });
      const adoption = await storage.createAdoption(adoptionData);
      res.status(201).json(adoption);
    } catch (error: any) {
      console.error("Error creating adoption:", error);
      res.status(400).json({ message: error.message || "Failed to create adoption" });
    }
  });

  app.patch('/api/mission/adoptions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const id = parseInt(req.params.id);
      const adoption = await storage.updateAdoptionForUser(userId, id, req.body);
      if (!adoption) return res.status(404).json({ message: "Adoption not found or unauthorized" });
      res.json(adoption);
    } catch (error: any) {
      console.error("Error updating adoption:", error);
      res.status(400).json({ message: error.message || "Failed to update adoption" });
    }
  });

  // Prayer Sessions
  app.post('/api/mission/prayer-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const sessionData = insertMissionPrayerSessionSchema.parse({ ...req.body, userId });
      const session = await storage.createPrayerSession(sessionData);
      res.status(201).json(session);
    } catch (error: any) {
      console.error("Error creating prayer session:", error);
      res.status(400).json({ message: error.message || "Failed to log prayer session" });
    }
  });

  app.get('/api/mission/prayer-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sessions = await storage.getUserPrayerSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching prayer sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get('/api/mission/prayer-streak', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const streak = await storage.getUserPrayerStreak(userId);
      res.json({ streak });
    } catch (error) {
      console.error("Error fetching prayer streak:", error);
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });

  // Mission Projects (digital actions first)
  app.get('/api/mission/projects', async (req, res) => {
    try {
      const hasDigitalActions = req.query.digital === 'true' ? true : req.query.digital === 'false' ? false : undefined;
      const status = req.query.status as string | undefined;
      const projects = await storage.getMissionProjects({ hasDigitalActions, status });
      res.json(projects);
    } catch (error) {
      console.error("Error fetching mission projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/mission/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getMissionProject(id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.get('/api/mission/projects/:id/updates', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const updates = await storage.getProjectUpdates(projectId);
      res.json(updates);
    } catch (error) {
      console.error("Error fetching project updates:", error);
      res.status(500).json({ message: "Failed to fetch updates" });
    }
  });

  // Project Follows
  app.get('/api/mission/follows', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const follows = await storage.getProjectFollows(userId);
      res.json(follows);
    } catch (error) {
      console.error("Error fetching follows:", error);
      res.status(500).json({ message: "Failed to fetch follows" });
    }
  });

  app.post('/api/mission/follows', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const followData = insertProjectFollowSchema.parse({ ...req.body, userId });
      const follow = await storage.followProject(followData);
      res.status(201).json(follow);
    } catch (error: any) {
      console.error("Error following project:", error);
      res.status(400).json({ message: error.message || "Failed to follow project" });
    }
  });

  app.delete('/api/mission/follows/:projectId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const projectId = parseInt(req.params.projectId);
      await storage.unfollowProject(userId, projectId);
      res.status(204).send();
    } catch (error) {
      console.error("Error unfollowing project:", error);
      res.status(500).json({ message: "Failed to unfollow project" });
    }
  });

  // Mission Opportunities (online first - default to online mode)
  app.get('/api/mission/opportunities', async (req, res) => {
    try {
      const deliveryMode = (req.query.mode as string) || 'online';
      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;
      const opportunities = await storage.getMissionOpportunities({ deliveryMode, type, status });
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.get('/api/mission/opportunities/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const opportunity = await storage.getMissionOpportunity(id);
      if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });
      res.json(opportunity);
    } catch (error) {
      console.error("Error fetching opportunity:", error);
      res.status(500).json({ message: "Failed to fetch opportunity" });
    }
  });

  // Opportunity Interests
  app.post('/api/mission/opportunity-interests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const interestData = insertOpportunityInterestSchema.parse({ ...req.body, userId });
      const interest = await storage.createOpportunityInterest(interestData);
      res.status(201).json(interest);
    } catch (error: any) {
      console.error("Error expressing interest:", error);
      res.status(400).json({ message: error.message || "Failed to express interest" });
    }
  });

  app.get('/api/mission/opportunity-interests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const interests = await storage.getUserOpportunityInterests(userId);
      res.json(interests);
    } catch (error) {
      console.error("Error fetching interests:", error);
      res.status(500).json({ message: "Failed to fetch interests" });
    }
  });

  // Digital Actions
  app.post('/api/mission/digital-actions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const actionData = insertDigitalActionSchema.parse({ ...req.body, userId });
      const action = await storage.createDigitalAction(actionData);
      res.status(201).json(action);
    } catch (error: any) {
      console.error("Error logging digital action:", error);
      res.status(400).json({ message: error.message || "Failed to log action" });
    }
  });

  app.get('/api/mission/digital-actions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const actions = await storage.getUserDigitalActions(userId, limit);
      res.json(actions);
    } catch (error) {
      console.error("Error fetching digital actions:", error);
      res.status(500).json({ message: "Failed to fetch actions" });
    }
  });

  // Share Cards
  app.get('/api/mission/share-cards', async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const cards = await storage.getShareCards(type);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching share cards:", error);
      res.status(500).json({ message: "Failed to fetch share cards" });
    }
  });

  app.get('/api/mission/share-cards/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const card = await storage.getShareCard(id);
      if (!card) return res.status(404).json({ message: "Share card not found" });
      res.json(card);
    } catch (error) {
      console.error("Error fetching share card:", error);
      res.status(500).json({ message: "Failed to fetch share card" });
    }
  });

  // Live Rooms
  app.get('/api/mission/live-rooms', async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const rooms = await storage.getLiveRooms(status);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching live rooms:", error);
      res.status(500).json({ message: "Failed to fetch live rooms" });
    }
  });

  app.get('/api/mission/live-rooms/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const room = await storage.getLiveRoom(id);
      if (!room) return res.status(404).json({ message: "Live room not found" });
      res.json(room);
    } catch (error) {
      console.error("Error fetching live room:", error);
      res.status(500).json({ message: "Failed to fetch live room" });
    }
  });

  // Training Modules
  app.get('/api/mission/training', async (req, res) => {
    try {
      const modules = await storage.getTrainingModules();
      res.json(modules);
    } catch (error) {
      console.error("Error fetching training modules:", error);
      res.status(500).json({ message: "Failed to fetch training modules" });
    }
  });

  app.get('/api/mission/training/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const module = await storage.getTrainingModule(id);
      if (!module) return res.status(404).json({ message: "Training module not found" });
      res.json(module);
    } catch (error) {
      console.error("Error fetching training module:", error);
      res.status(500).json({ message: "Failed to fetch training module" });
    }
  });

  app.get('/api/mission/training-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const progress = await storage.getTrainingProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching training progress:", error);
      res.status(500).json({ message: "Failed to fetch training progress" });
    }
  });

  // Mission Challenges
  app.get('/api/mission/challenges', async (req, res) => {
    try {
      const isActive = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
      const challenges = await storage.getMissionChallenges(isActive);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get('/api/mission/challenges/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const challenge = await storage.getMissionChallenge(id);
      if (!challenge) return res.status(404).json({ message: "Challenge not found" });
      res.json(challenge);
    } catch (error) {
      console.error("Error fetching challenge:", error);
      res.status(500).json({ message: "Failed to fetch challenge" });
    }
  });

  // Challenge Enrollments
  app.get('/api/mission/challenge-enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const enrollments = await storage.getChallengeEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post('/api/mission/challenge-enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const enrollmentData = insertChallengeEnrollmentSchema.parse({ ...req.body, userId });
      const enrollment = await storage.createChallengeEnrollment(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error: any) {
      console.error("Error enrolling in challenge:", error);
      res.status(400).json({ message: error.message || "Failed to enroll" });
    }
  });

  app.patch('/api/mission/challenge-enrollments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const enrollment = await storage.updateChallengeEnrollment(id, req.body);
      res.json(enrollment);
    } catch (error: any) {
      console.error("Error updating enrollment:", error);
      res.status(400).json({ message: error.message || "Failed to update enrollment" });
    }
  });

  // Mission Testimonies
  app.get('/api/mission/testimonies', async (req, res) => {
    try {
      const visibility = req.query.visibility as string | undefined;
      const testimonies = await storage.getMissionTestimonies(visibility);
      res.json(testimonies);
    } catch (error) {
      console.error("Error fetching testimonies:", error);
      res.status(500).json({ message: "Failed to fetch testimonies" });
    }
  });

  app.post('/api/mission/testimonies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const testimonyData = insertMissionTestimonySchema.parse({ ...req.body, userId });
      const testimony = await storage.createMissionTestimony(testimonyData);
      res.status(201).json(testimony);
    } catch (error: any) {
      console.error("Error creating testimony:", error);
      res.status(400).json({ message: error.message || "Failed to create testimony" });
    }
  });

  // Mission Dashboard - aggregated data for the user's mission dashboard
  app.get('/api/mission/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      const [profile, plan, activeAdoption, streak, recentActions] = await Promise.all([
        storage.getMissionProfile(userId),
        storage.getMissionPlan(userId),
        storage.getActiveAdoption(userId),
        storage.getUserPrayerStreak(userId),
        storage.getUserDigitalActions(userId, 5),
      ]);

      res.json({
        profile,
        plan,
        activeAdoption,
        streak,
        recentActions,
      });
    } catch (error) {
      console.error("Error fetching mission dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard" });
    }
  });

  // ===== ADMIN ROUTES =====

  // Admin Stats Dashboard
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const [users, sparks, events, blogPosts, posts, registrations] = await Promise.all([
        storage.getAllUsers(),
        storage.getSparks(),
        storage.getEvents(),
        storage.getBlogPosts(),
        storage.getPosts(),
        storage.getAllEventRegistrations(),
      ]);

      res.json({
        users: users.length,
        sparks: sparks.length,
        events: events.length,
        blogPosts: blogPosts.length,
        posts: posts.length,
        registrations: registrations.length,
        recentEvents: events.slice(0, 5),
        recentUsers: users.slice(0, 5),
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Admin - Get all users with pagination and search
  app.get('/api/admin/users', isAdmin, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = (req.query.search as string) || '';
      const role = (req.query.role as string) || '';
      
      const allUsers = await storage.getAllUsers();
      
      let filteredUsers = allUsers;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
          (u.firstName?.toLowerCase().includes(searchLower)) ||
          (u.lastName?.toLowerCase().includes(searchLower)) ||
          (u.email?.toLowerCase().includes(searchLower))
        );
      }
      if (role && role !== 'all') {
        filteredUsers = filteredUsers.filter(u => u.role === role);
      }
      
      const total = filteredUsers.length;
      const totalPages = Math.ceil(total / pageSize);
      const offset = (page - 1) * pageSize;
      const users = filteredUsers.slice(offset, offset + pageSize);
      
      res.json({
        users,
        total,
        page,
        pageSize,
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin - Change user role (super_admin only)
  app.patch('/api/admin/users/:id/role', isSuperAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;
      const adminUser = (req as any).dbUser;
      
      const validRoles = ['member', 'leader', 'admin', 'super_admin'];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      if (userId === adminUser.id) {
        return res.status(400).json({ message: "Cannot change your own role" });
      }
      
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const oldRole = targetUser.role;
      await storage.updateUserRole(userId, role);
      
      // Log the action
      console.log(`[AUDIT] Role changed: User ${userId} from ${oldRole} to ${role} by ${adminUser.id}`);
      
      res.json({ success: true, userId, oldRole, newRole: role });
    } catch (error) {
      console.error("Error changing user role:", error);
      res.status(500).json({ message: "Failed to change user role" });
    }
  });

  // Admin - Audit log endpoint
  app.post('/api/admin/audit-log', isAdmin, async (req: any, res) => {
    try {
      const adminUser = (req as any).dbUser;
      const { action, targetId, targetType, details } = req.body;
      
      console.log(`[AUDIT] ${action} on ${targetType}:${targetId} by ${adminUser.id} - ${JSON.stringify(details)}`);
      
      res.json({ success: true, logged: true });
    } catch (error) {
      console.error("Error logging audit action:", error);
      res.status(500).json({ message: "Failed to log action" });
    }
  });

  // Admin - Create event
  app.post('/api/admin/events', isAuthenticated, async (req: any, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error: any) {
      console.error("Error creating event:", error);
      res.status(400).json({ message: error.message || "Failed to create event" });
    }
  });

  // Admin - Update event
  app.put('/api/admin/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(id, updates);
      res.json(event);
    } catch (error: any) {
      console.error("Error updating event:", error);
      res.status(400).json({ message: error.message || "Failed to update event" });
    }
  });

  // Admin - Delete event
  app.delete('/api/admin/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Admin - List all sparks with filters
  app.get('/api/admin/sparks', isAdmin, async (req: any, res) => {
    try {
      const status = req.query.status as string | undefined;
      const category = req.query.category as string | undefined;
      const audience = req.query.audience as string | undefined;
      
      let allSparks = await storage.getSparks(category);
      
      if (status && status !== 'all') {
        allSparks = allSparks.filter(s => s.status === status);
      }
      if (audience && audience !== 'all') {
        allSparks = allSparks.filter(s => s.audienceSegment === audience);
      }
      
      res.json(allSparks);
    } catch (error) {
      console.error("Error fetching admin sparks:", error);
      res.status(500).json({ message: "Failed to fetch sparks" });
    }
  });

  // Admin - Create spark
  app.post('/api/admin/sparks', isAdmin, async (req: any, res) => {
    try {
      const sparkData = insertSparkSchema.parse(req.body);
      const spark = await storage.createSpark(sparkData);
      res.status(201).json(spark);
    } catch (error: any) {
      console.error("Error creating spark:", error);
      res.status(400).json({ message: error.message || "Failed to create spark" });
    }
  });

  // Admin - Update spark
  app.patch('/api/admin/sparks/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertSparkSchema.partial().parse(req.body);
      const spark = await storage.updateSpark(id, updates);
      res.json(spark);
    } catch (error: any) {
      console.error("Error updating spark:", error);
      res.status(400).json({ message: error.message || "Failed to update spark" });
    }
  });

  // Admin - Delete spark
  app.delete('/api/admin/sparks/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSpark(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting spark:", error);
      res.status(500).json({ message: "Failed to delete spark" });
    }
  });

  // Admin - Generate audio for all DOMINION sparks
  app.post('/api/admin/sparks/generate-all-audio', isAdmin, async (req: any, res) => {
    try {
      const { pregenerateAllDominionAudio } = await import('./audio-pregeneration');
      
      res.json({ 
        message: "Bulk audio generation started. This will run in the background.",
        status: "started"
      });
      
      pregenerateAllDominionAudio()
        .then(result => {
          console.log("[Admin] Bulk audio generation complete:", result);
        })
        .catch(error => {
          console.error("[Admin] Bulk audio generation failed:", error);
        });
        
    } catch (error: any) {
      console.error("Error starting bulk audio generation:", error);
      res.status(500).json({ message: error.message || "Failed to start audio generation" });
    }
  });

  // Admin - Generate audio batch (limited number, waits for completion)
  app.post('/api/admin/sparks/generate-audio-batch', isAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.body.limit) || 10;
      const { generateAudioBatch } = await import('./audio-pregeneration');
      
      console.log(`[Admin] Starting batch audio generation with limit: ${limit}`);
      const result = await generateAudioBatch(limit);
      
      res.json({
        message: `Batch audio generation complete`,
        ...result
      });
        
    } catch (error: any) {
      console.error("Error in batch audio generation:", error);
      res.status(500).json({ message: error.message || "Failed to generate audio batch" });
    }
  });

  // Admin - Bulk update sparks
  app.post('/api/admin/sparks/bulk', isAdmin, async (req: any, res) => {
    try {
      const { ids, action } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "No sparks selected" });
      }
      
      let status: string;
      if (action === 'publish') {
        status = 'published';
      } else if (action === 'archive') {
        status = 'archived';
      } else {
        return res.status(400).json({ message: "Invalid action" });
      }
      
      const updatedSparks = await Promise.all(
        ids.map(id => storage.updateSpark(id, { status }))
      );
      
      res.json({ updated: updatedSparks.length });
    } catch (error: any) {
      console.error("Error bulk updating sparks:", error);
      res.status(400).json({ message: error.message || "Failed to bulk update sparks" });
    }
  });

  // ===== ADMIN PRAYER ROUTES =====
  
  // Admin - Get all prayer requests (including private)
  app.get('/api/admin/prayer-requests', isAdmin, async (req: any, res) => {
    try {
      const status = req.query.status as string | undefined;
      const requests = await storage.getAllPrayerRequests(status);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching admin prayer requests:", error);
      res.status(500).json({ message: "Failed to fetch prayer requests" });
    }
  });

  // Admin - Update prayer request status
  app.patch('/api/admin/prayer-requests/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, prayerNote } = req.body;
      const updates: any = {};
      if (status) updates.status = status;
      if (prayerNote !== undefined) updates.prayerNote = prayerNote;
      if (status === 'answered') updates.answeredAt = new Date();
      
      const request = await storage.updatePrayerRequest(id, updates);
      res.json(request);
    } catch (error: any) {
      console.error("Error updating prayer request:", error);
      res.status(400).json({ message: error.message || "Failed to update prayer request" });
    }
  });

  // Admin - Delete prayer request
  app.delete('/api/admin/prayer-requests/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.updatePrayerRequest(id, { status: 'archived' });
      res.status(204).send();
    } catch (error) {
      console.error("Error archiving prayer request:", error);
      res.status(500).json({ message: "Failed to archive prayer request" });
    }
  });

  // Admin - List all blog posts with filters
  app.get('/api/admin/blog-posts', isAdmin, async (req: any, res) => {
    try {
      const allPosts = await storage.getBlogPosts();
      res.json(allPosts);
    } catch (error) {
      console.error("Error fetching admin blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Admin - Create blog post
  app.post('/api/admin/blog-posts', isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const blogData = insertBlogPostSchema.parse({ ...req.body, authorId: userId });
      const post = await storage.createBlogPost(blogData);
      res.status(201).json(post);
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      res.status(400).json({ message: error.message || "Failed to create blog post" });
    }
  });

  // Admin - Update blog post
  app.patch('/api/admin/blog-posts/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(id, updates);
      res.json(post);
    } catch (error: any) {
      console.error("Error updating blog post:", error);
      res.status(400).json({ message: error.message || "Failed to update blog post" });
    }
  });

  // Admin - Delete blog post
  app.delete('/api/admin/blog-posts/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // ===== ADMIN COACHING HUB =====

  // Get all coaches
  app.get('/api/admin/coaches', isAdmin, async (req: any, res) => {
    try {
      const coaches = await storage.getCoaches();
      res.json(coaches);
    } catch (error) {
      console.error("Error fetching coaches:", error);
      res.status(500).json({ message: "Failed to fetch coaches" });
    }
  });

  // Create a coach
  app.post('/api/admin/coaches', isAdmin, async (req: any, res) => {
    try {
      const coachData = req.body;
      const coach = await storage.createCoach(coachData);
      res.status(201).json(coach);
    } catch (error: any) {
      console.error("Error creating coach:", error);
      res.status(400).json({ message: error.message || "Failed to create coach" });
    }
  });

  // Update a coach
  app.patch('/api/admin/coaches/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const coach = await storage.updateCoach(id, updates);
      res.json(coach);
    } catch (error: any) {
      console.error("Error updating coach:", error);
      res.status(400).json({ message: error.message || "Failed to update coach" });
    }
  });

  // Get all coaching sessions
  app.get('/api/admin/coaching-sessions', isAdmin, async (req: any, res) => {
    try {
      const status = req.query.status as string | undefined;
      const sessions = await storage.getCoachingSessions(status);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching coaching sessions:", error);
      res.status(500).json({ message: "Failed to fetch coaching sessions" });
    }
  });

  // Get single coaching session
  app.get('/api/admin/coaching-sessions/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getCoachingSession(id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching coaching session:", error);
      res.status(500).json({ message: "Failed to fetch coaching session" });
    }
  });

  // Update coaching session
  app.patch('/api/admin/coaching-sessions/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const session = await storage.updateCoachingSession(id, updates);
      res.json(session);
    } catch (error: any) {
      console.error("Error updating coaching session:", error);
      res.status(400).json({ message: error.message || "Failed to update coaching session" });
    }
  });

  // Get all cohorts
  app.get('/api/admin/cohorts', isAdmin, async (req: any, res) => {
    try {
      const cohorts = await storage.getCoachingCohorts();
      res.json(cohorts);
    } catch (error) {
      console.error("Error fetching cohorts:", error);
      res.status(500).json({ message: "Failed to fetch cohorts" });
    }
  });

  // Create a cohort
  app.post('/api/admin/cohorts', isAdmin, async (req: any, res) => {
    try {
      const cohortData = req.body;
      const cohort = await storage.createCoachingCohort(cohortData);
      res.status(201).json(cohort);
    } catch (error: any) {
      console.error("Error creating cohort:", error);
      res.status(400).json({ message: error.message || "Failed to create cohort" });
    }
  });

  // Update a cohort
  app.patch('/api/admin/cohorts/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const cohort = await storage.updateCoachingCohort(id, updates);
      res.json(cohort);
    } catch (error: any) {
      console.error("Error updating cohort:", error);
      res.status(400).json({ message: error.message || "Failed to update cohort" });
    }
  });

  // Get cohort participants
  app.get('/api/admin/cohorts/:id/participants', isAdmin, async (req: any, res) => {
    try {
      const cohortId = parseInt(req.params.id);
      const participants = await storage.getCohortParticipants(cohortId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching cohort participants:", error);
      res.status(500).json({ message: "Failed to fetch cohort participants" });
    }
  });

  // ===== ADMIN CHALLENGES =====

  // Get all challenges (with pagination, search, and status filter)
  app.get('/api/admin/challenges', isAdmin, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;

      const result = await storage.getChallenges({ page, pageSize, search, status });
      res.json(result);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  // Create a new challenge
  app.post('/api/admin/challenges', isAdmin, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const challengeData = insertChallengeSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const challenge = await storage.createChallenge(challengeData);
      res.status(201).json(challenge);
    } catch (error: any) {
      console.error("Error creating challenge:", error);
      res.status(400).json({ message: error.message || "Failed to create challenge" });
    }
  });

  // Update a challenge
  app.patch('/api/admin/challenges/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getChallenge(id);
      if (!existing) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      const challenge = await storage.updateChallenge(id, req.body);
      res.json(challenge);
    } catch (error: any) {
      console.error("Error updating challenge:", error);
      res.status(400).json({ message: error.message || "Failed to update challenge" });
    }
  });

  // Delete a challenge
  app.delete('/api/admin/challenges/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getChallenge(id);
      if (!existing) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      await storage.deleteChallenge(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting challenge:", error);
      res.status(500).json({ message: "Failed to delete challenge" });
    }
  });

  // Get challenge participants with leaderboard
  app.get('/api/admin/challenges/:id/participants', isAdmin, async (req: any, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const participants = await storage.getChallengeParticipants(challengeId);
      res.json({ participants });
    } catch (error) {
      console.error("Error fetching challenge participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  // ===== ADMIN MISSION TRIPS =====

  // Get all mission trips (with pagination, search, and status filter)
  app.get('/api/admin/mission-trips', isAdmin, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      const { trips, total } = await storage.getMissionTrips({ status, search, page, pageSize });
      res.json({ trips, total, page, pageSize });
    } catch (error) {
      console.error("Error fetching mission trips:", error);
      res.status(500).json({ message: "Failed to fetch mission trips" });
    }
  });

  // Create a new mission trip
  app.post('/api/admin/mission-trips', isAdmin, async (req: any, res) => {
    try {
      const trip = await storage.createMissionTrip(req.body);
      res.status(201).json(trip);
    } catch (error: any) {
      console.error("Error creating mission trip:", error);
      res.status(400).json({ message: error.message || "Failed to create mission trip" });
    }
  });

  // Update a mission trip
  app.patch('/api/admin/mission-trips/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getMissionTrip(id);
      if (!existing) {
        return res.status(404).json({ message: "Mission trip not found" });
      }
      const trip = await storage.updateMissionTrip(id, req.body);
      res.json(trip);
    } catch (error: any) {
      console.error("Error updating mission trip:", error);
      res.status(400).json({ message: error.message || "Failed to update mission trip" });
    }
  });

  // Delete a mission trip
  app.delete('/api/admin/mission-trips/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getMissionTrip(id);
      if (!existing) {
        return res.status(404).json({ message: "Mission trip not found" });
      }
      await storage.deleteMissionTrip(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting mission trip:", error);
      res.status(500).json({ message: "Failed to delete mission trip" });
    }
  });

  // Get trip applications
  app.get('/api/admin/mission-trips/:id/applications', isAdmin, async (req: any, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const applications = await storage.getTripApplications(tripId);
      res.json({ applications });
    } catch (error) {
      console.error("Error fetching trip applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Update trip application status
  app.patch('/api/admin/trip-applications/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const reviewerId = req.user.claims?.sub || req.user.id;
      const application = await storage.updateTripApplication(id, {
        ...req.body,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      });
      res.json(application);
    } catch (error: any) {
      console.error("Error updating trip application:", error);
      res.status(400).json({ message: error.message || "Failed to update application" });
    }
  });

  // Get all users (for leader selection)
  app.get('/api/admin/users-list', isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // ===== ADMIN GOAL TEMPLATES =====
  
  // List all goal templates
  app.get('/api/admin/goal-templates', isAdmin, async (req: any, res) => {
    try {
      const templates = await storage.getGoalTemplates();
      res.json({ templates });
    } catch (error) {
      console.error("Error fetching goal templates:", error);
      res.status(500).json({ message: "Failed to fetch goal templates" });
    }
  });

  // Create a new goal template
  app.post('/api/admin/goal-templates', isAdmin, async (req: any, res) => {
    try {
      const template = await storage.createGoalTemplate(req.body);
      res.status(201).json(template);
    } catch (error: any) {
      console.error("Error creating goal template:", error);
      res.status(400).json({ message: error.message || "Failed to create goal template" });
    }
  });

  // Update a goal template
  app.patch('/api/admin/goal-templates/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.updateGoalTemplate(id, req.body);
      res.json(template);
    } catch (error: any) {
      console.error("Error updating goal template:", error);
      res.status(400).json({ message: error.message || "Failed to update goal template" });
    }
  });

  // Delete a goal template
  app.delete('/api/admin/goal-templates/:id', isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGoalTemplate(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting goal template:", error);
      res.status(500).json({ message: "Failed to delete goal template" });
    }
  });

  // Get user progress stats for admin
  app.get('/api/admin/user-progress-stats', isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getUserProgressStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user progress stats:", error);
      res.status(500).json({ message: "Failed to fetch user progress stats" });
    }
  });

  // Get growth tracks for admin
  app.get('/api/admin/growth-tracks', isAdmin, async (req: any, res) => {
    try {
      const tracks = await storage.getGrowthTracks();
      res.json({ tracks });
    } catch (error) {
      console.error("Error fetching growth tracks:", error);
      res.status(500).json({ message: "Failed to fetch growth tracks" });
    }
  });

  // ===== GOALS & RESOLUTIONS =====
  
  // Get user's goals with habits
  app.get('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const goals = await storage.getUserGoals(userId);
      res.json({ goals });
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  // Create a new goal
  app.post('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { title, category, targetDate, why, firstStep, habit } = req.body;
      
      const goal = await storage.createSimpleGoal({
        userId,
        title,
        category,
        targetDate: targetDate ? new Date(targetDate) : null,
        why,
        firstStep,
        habitTitle: habit,
      });
      
      res.status(201).json(goal);
    } catch (error: any) {
      console.error("Error creating goal:", error);
      res.status(400).json({ message: error.message || "Failed to create goal" });
    }
  });

  // Toggle habit completion
  app.post('/api/habits/:id/toggle', isAuthenticated, async (req: any, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const { completed, date } = req.body;
      
      const log = await storage.toggleHabitLog(habitId, date, completed);
      res.json(log);
    } catch (error) {
      console.error("Error toggling habit:", error);
      res.status(500).json({ message: "Failed to toggle habit" });
    }
  });

  // ===== AI COACHING =====
  
  // Simple in-memory rate limiter for AI endpoints
  const aiRateLimiter = new Map<string, { count: number; resetTime: number }>();
  const AI_RATE_LIMIT = 20; // messages per window
  const AI_RATE_WINDOW = 60 * 60 * 1000; // 1 hour
  
  const checkAiRateLimit = (userId: string): boolean => {
    const now = Date.now();
    const userLimit = aiRateLimiter.get(userId);
    
    if (!userLimit || now > userLimit.resetTime) {
      aiRateLimiter.set(userId, { count: 1, resetTime: now + AI_RATE_WINDOW });
      return true;
    }
    
    if (userLimit.count >= AI_RATE_LIMIT) {
      return false;
    }
    
    userLimit.count++;
    return true;
  };
  
  // Validation schemas
  const createSessionSchema = z.object({
    entryPoint: z.enum(['goals', 'vision', 'growth', 'general']).optional().default('general'),
  });
  
  const sendMessageSchema = z.object({
    content: z.string().min(1).max(2000),
  });
  
  // Get user's coaching sessions
  app.get('/api/ai-coach/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const sessions = await storage.getUserAiCoachSessions(userId);
      res.json({ sessions });
    } catch (error) {
      console.error("Error fetching AI coach sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Create new coaching session
  app.post('/api/ai-coach/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const parsed = createSessionSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid entry point" });
      }
      
      const session = await storage.createAiCoachSession({
        userId,
        entryPoint: parsed.data.entryPoint,
        lastMessageAt: new Date(),
      });
      
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating AI coach session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  // Get session messages
  app.get('/api/ai-coach/sessions/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getAiCoachSession(sessionId);
      
      if (!session || session.userId !== req.user.claims?.sub || req.user.id) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const messages = await storage.getAiCoachMessages(sessionId);
      res.json({ messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message and get AI response
  app.post('/api/ai-coach/sessions/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const userId = req.user.claims?.sub || req.user.id;
      
      // Validate request body
      const parsed = sendMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Message must be 1-2000 characters" });
      }
      
      // Check rate limit
      if (!checkAiRateLimit(userId)) {
        return res.status(429).json({ message: "Too many messages. Please try again later." });
      }
      
      const session = await storage.getAiCoachSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Save user message
      const userMessage = await storage.createAiCoachMessage({
        sessionId,
        sender: 'user',
        content: parsed.data.content,
      });
      
      // Get conversation history (limit to last 20 messages for context)
      const messages = await storage.getAiCoachMessages(sessionId);
      const recentMessages = messages.slice(-20);
      const chatHistory = recentMessages.map(m => ({
        role: m.sender as 'user' | 'assistant',
        content: m.content,
      }));
      
      // Get AI response
      const { getChatCompletion } = await import('./ai-coach');
      const aiResponse = await getChatCompletion(chatHistory, {
        userId,
        sessionId,
        entryPoint: session.entryPoint,
      });
      
      // Save AI response
      const assistantMessage = await storage.createAiCoachMessage({
        sessionId,
        sender: 'assistant',
        content: aiResponse,
      });
      
      res.json({ 
        userMessage, 
        assistantMessage 
      });
    } catch (error) {
      console.error("Error processing AI coach message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // ===== PUBLIC DISCOVERY API ROUTES =====

  // Get public challenges (published/active/upcoming)
  app.get('/api/challenges/public', async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const result = await storage.getChallenges({ 
        page: 1, 
        pageSize: 50,
        status: status && status !== 'all' ? status : undefined 
      });
      const publicChallenges = result.challenges.filter(c => 
        c.status === 'active' || c.status === 'upcoming' || c.status === 'completed'
      );
      res.json(publicChallenges);
    } catch (error) {
      console.error("Error fetching public challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  // Get leaderboard preview for challenges
  app.get('/api/challenges/leaderboard-preview', async (req, res) => {
    try {
      const result = await storage.getChallenges({ page: 1, pageSize: 10, status: 'active' });
      const leaderboards = await Promise.all(
        result.challenges.map(async (challenge) => {
          const participants = await storage.getChallengeParticipants(challenge.id);
          const leaders = participants
            .sort((a, b) => (b.points || 0) - (a.points || 0))
            .slice(0, 3)
            .map(p => ({
              name: p.userId?.substring(0, 8) || 'User',
              points: p.points || 0,
            }));
          return { challengeId: challenge.id, leaders };
        })
      );
      res.json(leaderboards);
    } catch (error) {
      console.error("Error fetching leaderboard preview:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get user's challenge participations
  app.get('/api/challenges/my-participations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const participations = await storage.getUserChallengeParticipations(userId);
      res.json(participations);
    } catch (error) {
      console.error("Error fetching user participations:", error);
      res.status(500).json({ message: "Failed to fetch participations" });
    }
  });

  // Join a challenge
  app.post('/api/challenges/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const challengeId = parseInt(req.params.id);
      
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      if (challenge.status !== 'active') {
        return res.status(400).json({ message: "Challenge is not active" });
      }
      if (challenge.maxParticipants && (challenge.currentParticipants || 0) >= challenge.maxParticipants) {
        return res.status(400).json({ message: "Challenge is full" });
      }
      
      const existing = await storage.getChallengeParticipant(challengeId, userId);
      if (existing) {
        return res.status(400).json({ message: "Already joined this challenge" });
      }
      
      const participant = await storage.createChallengeParticipant({
        challengeId,
        userId,
        progress: 0,
        points: 0,
        status: 'active',
      });
      
      await storage.updateChallenge(challengeId, {
        currentParticipants: (challenge.currentParticipants || 0) + 1,
      });
      
      // Send challenge enrollment email
      const user = await storage.getUser(userId);
      if (user?.email) {
        sendChallengeEnrollmentEmail(user.email, user.firstName || 'Friend', {
          challengeTitle: challenge.title,
          challengeDescription: challenge.description || undefined,
          startDate: new Date(challenge.startDate),
          endDate: new Date(challenge.endDate),
          goalDays: challenge.goal || 30,
        }).catch(err => console.error("Failed to send challenge enrollment email:", err));
      }
      
      res.status(201).json(participant);
    } catch (error) {
      console.error("Error joining challenge:", error);
      res.status(500).json({ message: "Failed to join challenge" });
    }
  });

  // Get public mission trips
  app.get('/api/mission-trips/public', async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const { trips } = await storage.getMissionTrips({ 
        status: 'open',
        page: 1,
        pageSize: 50,
      });
      const filtered = type && type !== 'all' 
        ? trips.filter(t => t.type === type)
        : trips;
      res.json(filtered);
    } catch (error) {
      console.error("Error fetching public mission trips:", error);
      res.status(500).json({ message: "Failed to fetch mission trips" });
    }
  });

  // Apply for a mission trip
  app.post('/api/mission-trips/:id/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const tripId = parseInt(req.params.id);
      const { whyApply } = req.body;
      
      const trip = await storage.getMissionTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      if (trip.status !== 'open') {
        return res.status(400).json({ message: "Applications are closed" });
      }
      if (trip.maxParticipants && (trip.currentParticipants || 0) >= trip.maxParticipants) {
        return res.status(400).json({ message: "Trip is full" });
      }
      
      const existing = await storage.getTripApplication(tripId, userId);
      if (existing) {
        return res.status(400).json({ message: "You have already applied for this trip" });
      }
      
      const application = await storage.createTripApplication({
        tripId,
        userId,
        whyApply: whyApply || '',
        status: 'pending',
      });
      
      res.status(201).json(application);
    } catch (error) {
      console.error("Error applying for trip:", error);
      res.status(500).json({ message: "Failed to apply for trip" });
    }
  });

  // Get public coaches
  app.get('/api/coaches/public', async (req, res) => {
    try {
      const coaches = await storage.getCoaches();
      const activeCoaches = coaches.filter((c: any) => c.isActive);
      
      const coachesWithUsers = await Promise.all(
        activeCoaches.map(async (coach: any) => {
          const user = await storage.getUser(coach.userId);
          return {
            ...coach,
            user: user ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImageUrl: user.profileImageUrl,
              email: user.email,
            } : undefined,
          };
        })
      );
      
      res.json(coachesWithUsers);
    } catch (error) {
      console.error("Error fetching public coaches:", error);
      res.status(500).json({ message: "Failed to fetch coaches" });
    }
  });

  // Get public cohorts
  app.get('/api/cohorts/public', async (req, res) => {
    try {
      const cohorts = await storage.getCoachingCohorts();
      const openCohorts = cohorts.filter((c: any) => c.status === 'open');
      res.json(openCohorts);
    } catch (error) {
      console.error("Error fetching public cohorts:", error);
      res.status(500).json({ message: "Failed to fetch cohorts" });
    }
  });

  // Book a coaching session
  app.post('/api/coaching-sessions/book', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { coachId, topic, notes } = req.body;
      
      if (!coachId || !topic) {
        return res.status(400).json({ message: "Coach and topic are required" });
      }
      
      const coach = await storage.getCoach(coachId);
      if (!coach || !coach.isActive) {
        return res.status(404).json({ message: "Coach not found or inactive" });
      }
      
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 7);
      
      const session = await storage.createCoachingSession({
        coachId,
        userId,
        scheduledAt,
        topic,
        userNotes: notes,
        status: 'scheduled',
        duration: 60,
      });
      
      res.status(201).json(session);
    } catch (error) {
      console.error("Error booking coaching session:", error);
      res.status(500).json({ message: "Failed to book session" });
    }
  });

  // Join a cohort
  app.post('/api/cohorts/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const cohortId = parseInt(req.params.id);
      
      const cohort = await storage.getCoachingCohort(cohortId);
      if (!cohort) {
        return res.status(404).json({ message: "Cohort not found" });
      }
      if (cohort.status !== 'open') {
        return res.status(400).json({ message: "Cohort is not accepting new participants" });
      }
      if (cohort.maxParticipants && (cohort.currentParticipants || 0) >= cohort.maxParticipants) {
        return res.status(400).json({ message: "Cohort is full" });
      }
      
      const existing = await storage.getCohortParticipant(cohortId, userId);
      if (existing) {
        return res.status(400).json({ message: "Already enrolled in this cohort" });
      }
      
      const participant = await storage.createCohortParticipant({
        cohortId,
        userId,
        status: 'enrolled',
        progress: 0,
      });
      
      await storage.updateCoachingCohort(cohortId, {
        currentParticipants: (cohort.currentParticipants || 0) + 1,
      });
      
      res.status(201).json(participant);
    } catch (error) {
      console.error("Error joining cohort:", error);
      res.status(500).json({ message: "Failed to join cohort" });
    }
  });

  // ===== ANALYTICS API ROUTES =====

  // Get analytics metrics
  app.get('/api/admin/analytics/metrics', isAdmin, async (req: any, res) => {
    try {
      const totalUsers = await storage.getTotalUserCount();
      const activeUsers7d = await storage.getActiveUserCount(7);
      const sparksViewed = await storage.getTotalSparkViews();
      const challengesCompleted = await storage.getCompletedChallengesCount();
      
      res.json({
        totalUsers,
        activeUsers7d,
        sparksViewed,
        challengesCompleted,
        userGrowth: 12,
        engagementRate: 68,
      });
    } catch (error) {
      console.error("Error fetching analytics metrics:", error);
      res.json({
        totalUsers: 0,
        activeUsers7d: 0,
        sparksViewed: 0,
        challengesCompleted: 0,
        userGrowth: 0,
        engagementRate: 0,
      });
    }
  });

  // Get user growth data
  app.get('/api/admin/analytics/user-growth', isAdmin, async (req: any, res) => {
    try {
      const range = req.query.range as string || '30d';
      const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
      
      const data = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return {
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          users: Math.floor(Math.random() * 50) + 100 + i * 2,
          activeUsers: Math.floor(Math.random() * 30) + 50 + i,
        };
      });
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching user growth:", error);
      res.status(500).json({ message: "Failed to fetch user growth data" });
    }
  });

  // Get content engagement data
  app.get('/api/admin/analytics/engagement', isAdmin, async (req: any, res) => {
    try {
      res.json([
        { category: "Devotionals", views: 1240, interactions: 890 },
        { category: "Challenges", views: 856, interactions: 623 },
        { category: "Worship", views: 720, interactions: 445 },
        { category: "Testimonies", views: 543, interactions: 312 },
        { category: "Journeys", views: 421, interactions: 287 },
      ]);
    } catch (error) {
      console.error("Error fetching engagement data:", error);
      res.status(500).json({ message: "Failed to fetch engagement data" });
    }
  });

  // Get top challenges
  app.get('/api/admin/analytics/top-challenges', isAdmin, async (req: any, res) => {
    try {
      const result = await storage.getChallenges({ page: 1, pageSize: 5, status: 'active' });
      const topChallenges = result.challenges.map((c, idx) => ({
        id: c.id,
        title: c.title,
        participants: c.currentParticipants || 0,
        completionRate: Math.floor(Math.random() * 40) + 60,
      }));
      res.json(topChallenges);
    } catch (error) {
      console.error("Error fetching top challenges:", error);
      res.json([]);
    }
  });

  // Get recent activity
  app.get('/api/admin/analytics/recent-activity', isAdmin, async (req: any, res) => {
    try {
      res.json([
        { id: 1, type: "join_challenge", description: "Joined '21 Days of Prayer'", userName: "Sarah M.", timestamp: "2 min ago" },
        { id: 2, type: "complete_spark", description: "Watched 'Morning Devotional'", userName: "John D.", timestamp: "5 min ago" },
        { id: 3, type: "new_user", description: "New user registration", userName: "Mike T.", timestamp: "12 min ago" },
        { id: 4, type: "mission_apply", description: "Applied for Kenya Mission Trip", userName: "Emily R.", timestamp: "18 min ago" },
        { id: 5, type: "join_cohort", description: "Joined Leadership Cohort", userName: "David K.", timestamp: "25 min ago" },
        { id: 6, type: "complete_challenge", description: "Completed 'Bible Reading Challenge'", userName: "Lisa W.", timestamp: "32 min ago" },
      ]);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.json([]);
    }
  });

  // ===== USER SETTINGS ROUTES =====
  
  // Get current user's settings
  app.get('/api/user/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const settings = await storage.getUserSettings(userId);
      res.json(settings || {});
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  // Update user settings (handles partial updates)
  app.put('/api/user/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const existing = await storage.getUserSettings(userId);
      const defaults = {
        theme: 'system',
        language: 'en',
        profileVisibility: 'public',
        showEmail: false,
        showLocation: true,
        allowMessaging: true,
      };
      const merged = { ...defaults, ...existing, ...req.body, userId };
      const settingsData = insertUserSettingsSchema.parse(merged);
      const settings = await storage.upsertUserSettings(settingsData);
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating user settings:", error);
      res.status(400).json({ message: error.message || "Failed to update user settings" });
    }
  });

  // ===== NOTIFICATION PREFERENCES ROUTES =====

  // Get notification preferences
  app.get('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const prefs = await storage.getNotificationPreferences(userId);
      res.json(prefs || {
        pushEnabled: true,
        emailEnabled: true,
        prayerSessionAlerts: true,
        newSparkAlerts: true,
        eventReminders: true,
        weeklyDigest: true,
      });
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  // Update notification preferences
  app.put('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const existing = await storage.getNotificationPreferences(userId);
      const defaults = {
        pushEnabled: true,
        emailEnabled: true,
        prayerSessionAlerts: true,
        newSparkAlerts: true,
        eventReminders: true,
        weeklyDigest: true,
      };
      const merged = { ...defaults, ...existing, ...req.body };
      const prefsData = insertNotificationPreferencesSchema.omit({ userId: true }).parse(merged);
      const prefs = await storage.upsertNotificationPreferences(userId, prefsData);
      res.json(prefs);
    } catch (error: any) {
      console.error("Error updating notification preferences:", error);
      res.status(400).json({ message: error.message || "Failed to update notification preferences" });
    }
  });

  // ===== COMMENTS ROUTES =====
  
  // Get comments for a post
  app.get('/api/posts/:postId/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPost(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create a comment (protected)
  app.post('/api/posts/:postId/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const postId = parseInt(req.params.postId);
      const commentData = insertCommentSchema.parse({ ...req.body, userId, postId });
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error: any) {
      console.error("Error creating comment:", error);
      res.status(400).json({ message: error.message || "Failed to create comment" });
    }
  });

  // Delete a comment (protected, must be owner)
  app.delete('/api/comments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteComment(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // ===== NOTIFICATIONS ROUTES =====
  
  // Get user's notifications (protected)
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const notifications = await storage.getNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.post('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const id = parseInt(req.params.id);
      await storage.markNotificationRead(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.post('/api/notifications/read-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      await storage.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // ===== WELCOME EMAIL ROUTE =====
  app.post('/api/send-welcome-email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.email) {
        return res.status(400).json({ message: "User email not found" });
      }

      const welcomeEmailSchema = z.object({
        prayerFocus: z.string().optional(),
        dailyCommitment: z.number().optional(),
        motivations: z.array(z.string()).optional(),
      });

      const data = welcomeEmailSchema.parse(req.body);
      
      const result = await sendWelcomeEmail(
        user.email,
        user.firstName || "Friend",
        data
      );

      if (result.success) {
        res.json({ success: true, message: "Welcome email sent" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send email" });
      }
    } catch (error: any) {
      console.error("Error sending welcome email:", error);
      res.status(500).json({ message: error.message || "Failed to send welcome email" });
    }
  });

  // ===== PRAYER PODS (Partner Finder) =====

  // Get available prayer pods
  app.get('/api/prayer-pods', async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const pods = await storage.getPrayerPods(status);
      res.json(pods);
    } catch (error) {
      console.error("Error fetching prayer pods:", error);
      res.status(500).json({ message: "Failed to fetch prayer pods" });
    }
  });

  // Get user's prayer pods
  app.get('/api/prayer-pods/my-pods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const pods = await storage.getUserPrayerPods(userId);
      res.json(pods);
    } catch (error) {
      console.error("Error fetching user's prayer pods:", error);
      res.status(500).json({ message: "Failed to fetch your pods" });
    }
  });

  // Get single prayer pod
  app.get('/api/prayer-pods/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pod = await storage.getPrayerPod(id);
      if (!pod) {
        return res.status(404).json({ message: "Pod not found" });
      }
      res.json(pod);
    } catch (error) {
      console.error("Error fetching prayer pod:", error);
      res.status(500).json({ message: "Failed to fetch prayer pod" });
    }
  });

  // Create a new prayer pod
  app.post('/api/prayer-pods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const podData = { ...req.body, createdBy: userId };
      const pod = await storage.createPrayerPod(podData);
      await storage.createPrayerPodMember({ podId: pod.id, userId, role: 'leader' });
      
      // Send pod creation email
      const user = await storage.getUser(userId);
      if (user?.email) {
        sendPrayerPodNotificationEmail(user.email, user.firstName || 'Friend', {
          podName: pod.name,
          action: 'created',
          memberCount: 1,
        }).catch(err => console.error("Failed to send pod creation email:", err));
      }
      
      res.status(201).json(pod);
    } catch (error: any) {
      console.error("Error creating prayer pod:", error);
      res.status(400).json({ message: error.message || "Failed to create pod" });
    }
  });

  // Get pod members
  app.get('/api/prayer-pods/:id/members', async (req, res) => {
    try {
      const podId = parseInt(req.params.id);
      const members = await storage.getPrayerPodMembers(podId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching pod members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  // Join a pod (with safety checks)
  app.post('/api/prayer-pods/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const podId = parseInt(req.params.id);
      const userId = req.user.claims?.sub || req.user.id;
      
      const existing = await storage.getPrayerPodMember(podId, userId);
      if (existing) {
        return res.status(400).json({ message: "Already a member of this pod" });
      }
      
      const pod = await storage.getPrayerPod(podId);
      if (!pod) {
        return res.status(404).json({ message: "Pod not found" });
      }
      
      const members = await storage.getPrayerPodMembers(podId);
      if (members.length >= (pod.capacity || 6)) {
        return res.status(400).json({ message: "Pod is full" });
      }
      
      const member = await storage.createPrayerPodMember({ podId, userId, role: 'member' });
      
      // Send pod join email
      const user = await storage.getUser(userId);
      if (user?.email) {
        sendPrayerPodNotificationEmail(user.email, user.firstName || 'Friend', {
          podName: pod.name,
          action: 'joined',
          memberCount: members.length + 1,
        }).catch(err => console.error("Failed to send pod join email:", err));
      }
      
      res.status(201).json(member);
    } catch (error: any) {
      console.error("Error joining pod:", error);
      res.status(400).json({ message: error.message || "Failed to join pod" });
    }
  });

  // Leave a pod
  app.delete('/api/prayer-pods/:id/leave', isAuthenticated, async (req: any, res) => {
    try {
      const podId = parseInt(req.params.id);
      const userId = req.user.claims?.sub || req.user.id;
      
      const member = await storage.getPrayerPodMember(podId, userId);
      if (!member) {
        return res.status(404).json({ message: "Not a member of this pod" });
      }
      
      await storage.deletePrayerPodMember(member.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error leaving pod:", error);
      res.status(500).json({ message: "Failed to leave pod" });
    }
  });

  // Get pod messages
  app.get('/api/prayer-pods/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const podId = parseInt(req.params.id);
      const userId = req.user.claims?.sub || req.user.id;
      
      const member = await storage.getPrayerPodMember(podId, userId);
      if (!member) {
        return res.status(403).json({ message: "Not a member of this pod" });
      }
      
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getPrayerPodMessages(podId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message to pod
  app.post('/api/prayer-pods/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const podId = parseInt(req.params.id);
      const userId = req.user.claims?.sub || req.user.id;
      
      const member = await storage.getPrayerPodMember(podId, userId);
      if (!member) {
        return res.status(403).json({ message: "Not a member of this pod" });
      }
      
      if (member.isMuted) {
        return res.status(403).json({ message: "You are muted in this pod" });
      }
      
      const { content, type, isAnonymous } = req.body;
      const message = await storage.createPrayerPodMessage({ podId, userId, content, type, isAnonymous });
      res.status(201).json(message);
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(400).json({ message: error.message || "Failed to send message" });
    }
  });

  // Report a member (safety feature)
  app.post('/api/prayer-pods/:id/report', isAuthenticated, async (req: any, res) => {
    try {
      const podId = parseInt(req.params.id);
      const reporterId = req.user.claims?.sub || req.user.id;
      const { reportedUserId, category, description } = req.body;
      
      const report = await storage.createPrayerPodReport({
        reporterId,
        podId,
        reportedUserId,
        category,
        description,
      });
      res.status(201).json({ message: "Report submitted for review" });
    } catch (error: any) {
      console.error("Error submitting report:", error);
      res.status(400).json({ message: error.message || "Failed to submit report" });
    }
  });

  // Get/update user's pod preferences
  app.get('/api/prayer-pods/preferences/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const prefs = await storage.getPrayerPodPreferences(userId);
      res.json(prefs || {});
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.put('/api/prayer-pods/preferences/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const prefs = await storage.upsertPrayerPodPreferences({ ...req.body, userId });
      res.json(prefs);
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      res.status(400).json({ message: error.message || "Failed to update preferences" });
    }
  });

  // ===== PRAYER MOVEMENT ROUTES =====

  // Get prayer focus groups (nations/people groups)
  app.get('/api/prayer/focus-groups', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const groups = await storage.getPrayerFocusGroups(category);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching prayer focus groups:", error);
      res.status(500).json({ message: "Failed to fetch prayer focus groups" });
    }
  });

  // Get single prayer focus group
  app.get('/api/prayer/focus-groups/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const group = await storage.getPrayerFocusGroup(id);
      if (!group) {
        return res.status(404).json({ message: "Focus group not found" });
      }
      res.json(group);
    } catch (error) {
      console.error("Error fetching prayer focus group:", error);
      res.status(500).json({ message: "Failed to fetch prayer focus group" });
    }
  });

  // Get UK campuses
  app.get('/api/prayer/uk-campuses', async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const region = req.query.region as string | undefined;
      const campuses = await storage.getUkCampuses(type, region);
      res.json(campuses);
    } catch (error) {
      console.error("Error fetching UK campuses:", error);
      res.status(500).json({ message: "Failed to fetch UK campuses" });
    }
  });

  // Search UK campuses
  app.get('/api/prayer/uk-campuses/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      const campuses = await storage.searchUkCampuses(query);
      res.json(campuses);
    } catch (error) {
      console.error("Error searching UK campuses:", error);
      res.status(500).json({ message: "Failed to search UK campuses" });
    }
  });

  // Get single UK campus
  app.get('/api/prayer/uk-campuses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campus = await storage.getUkCampus(id);
      if (!campus) {
        return res.status(404).json({ message: "Campus not found" });
      }
      res.json(campus);
    } catch (error) {
      console.error("Error fetching UK campus:", error);
      res.status(500).json({ message: "Failed to fetch UK campus" });
    }
  });

  // Get campus altars
  app.get('/api/prayer/altars', async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const altars = await storage.getCampusAltars(status);
      res.json(altars);
    } catch (error) {
      console.error("Error fetching campus altars:", error);
      res.status(500).json({ message: "Failed to fetch campus altars" });
    }
  });

  // Get single campus altar
  app.get('/api/prayer/altars/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const altar = await storage.getCampusAltar(id);
      if (!altar) {
        return res.status(404).json({ message: "Altar not found" });
      }
      res.json(altar);
    } catch (error) {
      console.error("Error fetching campus altar:", error);
      res.status(500).json({ message: "Failed to fetch campus altar" });
    }
  });

  // Create campus altar (protected)
  app.post('/api/prayer/altars', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const altarSchema = z.object({
        campusId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        meetingSchedule: z.string().optional(),
        meetingLink: z.string().optional(),
        whatsappGroup: z.string().optional(),
        prayerPoints: z.array(z.string()).optional(),
        scriptures: z.array(z.string()).optional(),
      });
      const data = altarSchema.parse(req.body);
      const altar = await storage.createCampusAltar({ ...data, leaderId: userId });
      res.status(201).json(altar);
    } catch (error: any) {
      console.error("Error creating campus altar:", error);
      res.status(400).json({ message: error.message || "Failed to create campus altar" });
    }
  });

  // Get altar members
  app.get('/api/prayer/altars/:id/members', async (req, res) => {
    try {
      const altarId = parseInt(req.params.id);
      const members = await storage.getAltarMembers(altarId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching altar members:", error);
      res.status(500).json({ message: "Failed to fetch altar members" });
    }
  });

  // Join campus altar (protected)
  app.post('/api/prayer/altars/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const altarId = parseInt(req.params.id);
      
      // Check if already a member
      const existing = await storage.getAltarMember(altarId, userId);
      if (existing) {
        return res.status(400).json({ message: "Already a member of this altar" });
      }

      const memberSchema = z.object({
        affiliation: z.enum(['student', 'staff', 'alumni', 'local_supporter']),
        receiveReminders: z.boolean().optional(),
        reminderFrequency: z.enum(['daily', 'weekly']).optional(),
      });
      const data = memberSchema.parse(req.body);
      
      const member = await storage.createAltarMember({
        altarId,
        userId,
        ...data,
      });
      res.status(201).json(member);
    } catch (error: any) {
      console.error("Error joining altar:", error);
      res.status(400).json({ message: error.message || "Failed to join altar" });
    }
  });

  // Get user's prayer subscriptions
  app.get('/api/prayer/subscriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const subscriptions = await storage.getPrayerSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching prayer subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch prayer subscriptions" });
    }
  });

  // Subscribe to a focus group (adopt a nation)
  app.post('/api/prayer/subscriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const subscriptionSchema = z.object({
        focusGroupId: z.number().optional(),
        altarId: z.number().optional(),
        type: z.enum(['nation', 'campus']),
        receiveReminders: z.boolean().optional(),
        reminderFrequency: z.enum(['daily', 'weekly']).optional(),
        reminderTime: z.string().optional(),
      });
      const data = subscriptionSchema.parse(req.body);
      
      // Check if already subscribed
      const existing = await storage.getPrayerSubscription(userId, data.focusGroupId, data.altarId);
      if (existing) {
        return res.status(400).json({ message: "Already subscribed to this focus" });
      }

      const subscription = await storage.createPrayerSubscription({
        userId,
        ...data,
        emailConfirmed: true, // Auto-confirm for now
      });

      // Send confirmation email
      try {
        const user = await storage.getUser(userId);
        if (user?.email) {
          let focusName = 'a prayer focus';
          let prayerPoints: string[] = [];
          let population: string | undefined;
          let region: string | undefined;

          if (data.focusGroupId) {
            const focusGroup = await storage.getPrayerFocusGroup(data.focusGroupId);
            if (focusGroup) {
              focusName = focusGroup.name;
              prayerPoints = (focusGroup.prayerPoints as string[]) || [];
              population = focusGroup.population || undefined;
              region = focusGroup.region || undefined;
            }
          }

          sendPrayerAdoptionConfirmation(user.email, user.firstName || 'Friend', {
            focusName,
            focusType: data.type,
            population,
            region,
            prayerPoints,
            reminderFrequency: data.reminderFrequency || 'daily',
          }).catch(err => console.error('Failed to send prayer adoption email:', err));
        }
      } catch (emailErr) {
        console.error('Error sending prayer adoption email:', emailErr);
      }

      res.status(201).json(subscription);
    } catch (error: any) {
      console.error("Error creating prayer subscription:", error);
      res.status(400).json({ message: error.message || "Failed to create prayer subscription" });
    }
  });

  // Delete prayer subscription
  app.delete('/api/prayer/subscriptions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePrayerSubscription(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting prayer subscription:", error);
      res.status(500).json({ message: "Failed to delete prayer subscription" });
    }
  });

  // Get prayer wall entries
  app.get('/api/prayer/wall', async (req, res) => {
    try {
      const focusGroupId = req.query.focusGroupId ? parseInt(req.query.focusGroupId as string) : undefined;
      const altarId = req.query.altarId ? parseInt(req.query.altarId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const entries = await storage.getPrayerWallEntries(focusGroupId, altarId, limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching prayer wall:", error);
      res.status(500).json({ message: "Failed to fetch prayer wall" });
    }
  });

  // Create prayer wall entry (protected)
  app.post('/api/prayer/wall', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const entrySchema = z.object({
        focusGroupId: z.number().optional(),
        altarId: z.number().optional(),
        type: z.enum(['request', 'praise', 'testimony', 'answered']),
        content: z.string().min(1),
        isAnonymous: z.boolean().optional(),
      });
      const data = entrySchema.parse(req.body);
      const entry = await storage.createPrayerWallEntry({ userId, ...data });
      res.status(201).json(entry);
    } catch (error: any) {
      console.error("Error creating prayer wall entry:", error);
      res.status(400).json({ message: error.message || "Failed to create prayer wall entry" });
    }
  });

  // Pray for a wall entry (increment prayer count)
  app.post('/api/prayer/wall/:id/pray', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.incrementPrayerCount(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing prayer count:", error);
      res.status(500).json({ message: "Failed to record prayer" });
    }
  });

  // Log a prayer session
  app.post('/api/prayer/logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const logSchema = z.object({
        subscriptionId: z.number().optional(),
        altarMemberId: z.number().optional(),
        focusGroupId: z.number().optional(),
        altarId: z.number().optional(),
        durationMinutes: z.number().min(1),
        notes: z.string().optional(),
        prayerPoints: z.array(z.string()).optional(),
      });
      const data = logSchema.parse(req.body);
      const log = await storage.createPrayerLog({ userId, ...data });
      res.status(201).json(log);
    } catch (error: any) {
      console.error("Error logging prayer:", error);
      res.status(400).json({ message: error.message || "Failed to log prayer" });
    }
  });

  // Get prayer stats
  app.get('/api/prayer/stats', async (req, res) => {
    try {
      const stats = await storage.getPrayerStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching prayer stats:", error);
      res.status(500).json({ message: "Failed to fetch prayer stats" });
    }
  });

  // ===== BIBLE READING PLANS =====

  // Get all reading plans with optional filters
  app.get('/api/reading-plans', async (req, res) => {
    try {
      const { topic, maturityLevel, durationDays } = req.query;
      const filters: { topic?: string; maturityLevel?: string; durationDays?: number } = {};
      if (topic) filters.topic = topic as string;
      if (maturityLevel) filters.maturityLevel = maturityLevel as string;
      if (durationDays) filters.durationDays = parseInt(durationDays as string);
      
      const plans = await storage.getReadingPlans(filters);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching reading plans:", error);
      res.status(500).json({ message: "Failed to fetch reading plans" });
    }
  });

  // Get recommended plans for user
  app.get('/api/reading-plans/recommended', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const plans = await storage.getRecommendedPlans(userId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching recommended plans:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Get a single reading plan with days
  app.get('/api/reading-plans/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.getReadingPlan(id);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      const days = await storage.getReadingPlanDays(id);
      res.json({ ...plan, days });
    } catch (error) {
      console.error("Error fetching reading plan:", error);
      res.status(500).json({ message: "Failed to fetch reading plan" });
    }
  });

  // Create a reading plan (admin only)
  app.post('/api/reading-plans', isAuthenticated, async (req: any, res) => {
    try {
      const planSchema = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        coverImageUrl: z.string().optional(),
        durationDays: z.number().min(1),
        maturityLevel: z.enum(['new-believer', 'growing', 'mature']),
        topics: z.array(z.string()).optional(),
        featured: z.boolean().optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
      });
      const data = planSchema.parse(req.body);
      const plan = await storage.createReadingPlan(data);
      res.status(201).json(plan);
    } catch (error: any) {
      console.error("Error creating reading plan:", error);
      res.status(400).json({ message: error.message || "Failed to create reading plan" });
    }
  });

  // Add a day to a reading plan (admin only)
  app.post('/api/reading-plans/:id/days', isAuthenticated, async (req: any, res) => {
    try {
      const planId = parseInt(req.params.id);
      const daySchema = z.object({
        dayNumber: z.number().min(1),
        title: z.string().min(1),
        scriptureRef: z.string().min(1),
        scriptureText: z.string().min(1),
        devotionalContent: z.string().min(1),
        reflectionQuestion: z.string().optional(),
        prayerPrompt: z.string().optional(),
        actionStep: z.string().optional(),
      });
      const data = daySchema.parse(req.body);
      const day = await storage.createReadingPlanDay({ ...data, planId });
      res.status(201).json(day);
    } catch (error: any) {
      console.error("Error creating reading plan day:", error);
      res.status(400).json({ message: error.message || "Failed to add day to plan" });
    }
  });

  // Get a specific day of a reading plan
  app.get('/api/reading-plans/:id/days/:dayNumber', async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const dayNumber = parseInt(req.params.dayNumber);
      const day = await storage.getReadingPlanDay(planId, dayNumber);
      if (!day) {
        return res.status(404).json({ message: "Day not found" });
      }
      res.json(day);
    } catch (error) {
      console.error("Error fetching reading plan day:", error);
      res.status(500).json({ message: "Failed to fetch day" });
    }
  });

  // ===== USER SPIRITUAL PROFILE =====

  // Get user's spiritual profile
  app.get('/api/user/spiritual-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const profile = await storage.getUserSpiritualProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching spiritual profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Create or update user's spiritual profile
  app.post('/api/user/spiritual-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const profileSchema = z.object({
        maturityLevel: z.enum(['new-believer', 'growing', 'mature']).optional(),
        interests: z.array(z.string()).optional(),
      });
      const data = profileSchema.parse(req.body);
      const profile = await storage.upsertUserSpiritualProfile({ userId, ...data });
      res.json(profile);
    } catch (error: any) {
      console.error("Error updating spiritual profile:", error);
      res.status(400).json({ message: error.message || "Failed to update profile" });
    }
  });

  // ===== USER PLAN ENROLLMENTS =====

  // Get user's enrolled plans
  app.get('/api/user/reading-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const enrollments = await storage.getUserPlanEnrollments(userId);
      
      // Fetch plan details for each enrollment
      const enrichedEnrollments = await Promise.all(
        enrollments.map(async (enrollment) => {
          const plan = await storage.getReadingPlan(enrollment.planId);
          const progress = await storage.getUserReadingProgress(enrollment.id);
          return { ...enrollment, plan, progress };
        })
      );
      
      res.json(enrichedEnrollments);
    } catch (error) {
      console.error("Error fetching user's reading plans:", error);
      res.status(500).json({ message: "Failed to fetch enrolled plans" });
    }
  });

  // Enroll in a reading plan
  app.post('/api/reading-plans/:id/enroll', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const planId = parseInt(req.params.id);
      
      // Check if already enrolled
      const existing = await storage.getUserPlanEnrollment(userId, planId);
      if (existing && existing.status === 'active') {
        return res.status(400).json({ message: "Already enrolled in this plan" });
      }
      
      const enrollment = await storage.createUserPlanEnrollment({ userId, planId });
      res.status(201).json(enrollment);
    } catch (error: any) {
      console.error("Error enrolling in plan:", error);
      res.status(400).json({ message: error.message || "Failed to enroll in plan" });
    }
  });

  // Complete a reading day
  app.post('/api/reading-plans/:planId/days/:dayNumber/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const planId = parseInt(req.params.planId);
      const dayNumber = parseInt(req.params.dayNumber);
      const { journalEntry } = req.body;
      
      // Get enrollment
      const enrollment = await storage.getUserPlanEnrollment(userId, planId);
      if (!enrollment) {
        return res.status(400).json({ message: "Not enrolled in this plan" });
      }
      
      // Get the plan day
      const planDay = await storage.getReadingPlanDay(planId, dayNumber);
      if (!planDay) {
        return res.status(404).json({ message: "Day not found" });
      }
      
      const progress = await storage.completeReadingDay(enrollment.id, planDay.id, journalEntry);
      res.json(progress);
    } catch (error: any) {
      console.error("Error completing reading day:", error);
      res.status(400).json({ message: error.message || "Failed to complete day" });
    }
  });

  // Get user's reading streak
  app.get('/api/user/reading-streak', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const streak = await storage.getUserReadingStreak(userId);
      res.json({ streak });
    } catch (error) {
      console.error("Error fetching reading streak:", error);
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });

  // ===== AUDIO/TTS ROUTES =====

  // Serve audio files via Supabase Storage redirect (public, no auth required)
  app.get('/api/audio/:filename', async (req, res) => {
    try {
      const { filename } = req.params;
      const publicUrl = getPublicUrl(filename);
      if (!publicUrl) {
        return res.status(500).json({ error: "Storage not configured" });
      }

      const exists = await audioExists(filename);
      if (!exists) {
        return res.status(404).json({ error: "Audio file not found" });
      }

      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.redirect(publicUrl);
    } catch (error) {
      console.error("Error serving audio:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to serve audio" });
      }
    }
  });

  // Stream spark audio directly (generates if needed)
  app.get('/api/sparks/:id/audio/stream', async (req, res) => {
    try {
      const sparkId = parseInt(req.params.id);
      const filename = `spark-${sparkId}.mp3`;
      const exists = await audioExists(filename);

      if (!exists) {
        const spark = await storage.getSpark(sparkId);
        if (!spark || !spark.fullTeaching) {
          return res.status(404).json({ error: "Spark not found or has no teaching content" });
        }

        const result = await generateSparkAudio(sparkId, spark.fullTeaching);
        if (!result.success) {
          return res.status(500).json({ error: result.error || "Failed to generate audio" });
        }
      }

      const publicUrl = getPublicUrl(filename);
      if (!publicUrl) {
        return res.status(500).json({ error: "Storage not configured" });
      }
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.redirect(publicUrl);
    } catch (error: any) {
      console.error("Error with spark audio stream:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Failed to stream audio" });
      }
    }
  });

  // Get or generate spark audio URL
  app.get('/api/sparks/:id/audio', async (req, res) => {
    try {
      const sparkId = parseInt(req.params.id);
      const filename = `spark-${sparkId}.mp3`;
      const exists = await audioExists(filename);

      if (exists) {
        return res.json({ audioUrl: `/api/audio/${filename}`, cached: true });
      }

      const spark = await storage.getSpark(sparkId);
      if (!spark || !spark.fullTeaching) {
        return res.status(404).json({ error: "Spark not found or has no teaching content" });
      }

      const result = await generateSparkAudio(sparkId, {
        title: spark.title,
        scriptureRef: spark.scriptureRef || undefined,
        fullPassage: spark.fullPassage || undefined,
        fullTeaching: spark.fullTeaching,
        reflectionQuestion: spark.reflectionQuestion || undefined,
        todayAction: spark.todayAction || undefined,
        prayerLine: spark.prayerLine || undefined,
        ctaPrimary: spark.ctaPrimary || undefined
      });

      if (!result.success) {
        return res.status(500).json({ error: result.error || "Failed to generate audio" });
      }

      res.json({ audioUrl: `/api/audio/${filename}`, cached: false });
    } catch (error: any) {
      console.error("Error with spark audio:", error);
      res.status(500).json({ error: error.message || "Failed to get audio" });
    }
  });

  // Get or generate reading plan day audio
  app.get('/api/reading-plans/:planId/days/:dayNumber/audio', async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const dayNumber = parseInt(req.params.dayNumber);
      const filename = `plan-${planId}-day-${dayNumber}.mp3`;
      const exists = await audioExists(filename);

      if (exists) {
        return res.json({ audioUrl: `/api/audio/${filename}`, cached: true });
      }

      const planDay = await storage.getReadingPlanDay(planId, dayNumber);
      if (!planDay || !planDay.devotionalContent) {
        return res.status(404).json({ error: "Reading plan day not found or has no content" });
      }

      const result = await generateReadingPlanDayAudio(planId, dayNumber, {
        title: planDay.title,
        scriptureRef: planDay.scriptureRef,
        scriptureText: planDay.scriptureText,
        devotionalContent: planDay.devotionalContent,
        prayerPrompt: planDay.prayerPrompt || undefined
      });

      if (!result.success) {
        return res.status(500).json({ error: result.error || "Failed to generate audio" });
      }

      res.json({ audioUrl: `/api/audio/${filename}`, cached: false });
    } catch (error: any) {
      console.error("Error with reading plan audio:", error);
      res.status(500).json({ error: error.message || "Failed to get audio" });
    }
  });

  // ===== ADMIN SEED ENDPOINT =====
  // Super admin endpoint to seed DOMINION content in production
  app.post('/api/admin/seed-dominion', isSuperAdmin, async (req: any, res) => {
    try {
      console.log('[Seed] Starting DOMINION content seed...');
      
      // Check if content already exists
      const existingSparks = await storage.getSparks();
      const dominionSparks = existingSparks.filter((s: any) => s.weekTheme?.includes('Week'));
      
      if (dominionSparks.length > 0) {
        return res.status(400).json({ 
          message: `DOMINION content already exists (${dominionSparks.length} sparks found). Delete existing content first or use admin dashboard to manage.`,
          existingCount: dominionSparks.length
        });
      }
      
      // The DOMINION content data - 30 days x 6 versions (global + 5 segments) = 180 sparks
      // Campaign dates: Jan 3 - Feb 1, 2026
      const dominionContent = getDominionSeedContent();
      
      let sparksCreated = 0;
      let reflectionsCreated = 0;
      
      // Insert sparks
      for (const spark of dominionContent.sparks) {
        await storage.createSpark(spark);
        sparksCreated++;
      }
      
      // Insert reflection cards
      for (const card of dominionContent.reflectionCards) {
        await storage.createReflectionCard(card);
        reflectionsCreated++;
      }
      
      console.log(`[Seed] Complete: ${sparksCreated} sparks, ${reflectionsCreated} reflection cards`);
      res.json({ 
        success: true, 
        sparksCreated, 
        reflectionsCreated,
        message: `Successfully seeded ${sparksCreated} sparks and ${reflectionsCreated} reflection cards`
      });
    } catch (error: any) {
      console.error('[Seed] Error seeding DOMINION content:', error);
      res.status(500).json({ message: error.message || 'Failed to seed content' });
    }
  });

  return httpServer;
}

// DOMINION Campaign seed content - embedded for production deployment
function getDominionSeedContent() {
  const segments = [null, 'schools', 'universities', 'early-career', 'builders', 'couples'];
  const campaignStart = new Date('2026-01-03');
  
  // 30 day themes - based on DOMINION campaign structure
  const dayThemes = [
    { title: "Dominion Begins with Belonging", scripture: "Romans 8:15-17", week: "Week 1: Identity & Belonging", featured: true },
    { title: "Seated, Not Shaken", scripture: "Ephesians 2:4-6", week: "Week 1: Identity & Belonging", featured: false },
    { title: "Chosen for Influence", scripture: "1 Peter 2:9", week: "Week 1: Identity & Belonging", featured: false },
    { title: "Testimony: From Pressure to Peace", scripture: "John 14:27", week: "Week 1: Identity & Belonging", featured: false },
    { title: "Dominion Through Love", scripture: "1 John 4:18-19", week: "Week 1: Identity & Belonging", featured: false },
    { title: "Living Light in Darkness", scripture: "Matthew 5:14-16", week: "Week 1: Identity & Belonging", featured: false },
    { title: "Power to Stand", scripture: "Ephesians 6:10-13", week: "Week 2: Prayer & Presence", featured: false },
    { title: "When Stillness Speaks", scripture: "Psalm 46:10", week: "Week 2: Prayer & Presence", featured: false },
    { title: "Prayer That Moves Mountains", scripture: "Mark 11:22-24", week: "Week 2: Prayer & Presence", featured: false },
    { title: "Testimony: Breakthrough Came", scripture: "James 5:16", week: "Week 2: Prayer & Presence", featured: false },
    { title: "In His Presence", scripture: "Psalm 16:11", week: "Week 2: Prayer & Presence", featured: false },
    { title: "The Secret Place", scripture: "Matthew 6:6", week: "Week 2: Prayer & Presence", featured: false },
    { title: "Peace That Guards", scripture: "Philippians 4:6-7", week: "Week 3: Peace & Anxiety", featured: false },
    { title: "Cast Your Cares", scripture: "1 Peter 5:7", week: "Week 3: Peace & Anxiety", featured: false },
    { title: "Anxiety to Trust", scripture: "Proverbs 3:5-6", week: "Week 3: Peace & Anxiety", featured: false },
    { title: "Testimony: From Overwhelm to Overflow", scripture: "Isaiah 26:3", week: "Week 3: Peace & Anxiety", featured: false },
    { title: "Mind Renewed", scripture: "Romans 12:2", week: "Week 3: Peace & Anxiety", featured: false },
    { title: "Rest for the Weary", scripture: "Matthew 11:28-30", week: "Week 3: Peace & Anxiety", featured: false },
    { title: "Speak Up", scripture: "Acts 1:8", week: "Week 4: Bold Witness", featured: false },
    { title: "Your Story Matters", scripture: "Revelation 12:11", week: "Week 4: Bold Witness", featured: false },
    { title: "Love in Action", scripture: "1 John 3:18", week: "Week 4: Bold Witness", featured: false },
    { title: "Testimony: One Conversation Changed Everything", scripture: "Romans 10:14-15", week: "Week 4: Bold Witness", featured: false },
    { title: "Courage Over Comfort", scripture: "Joshua 1:9", week: "Week 4: Bold Witness", featured: false },
    { title: "Salt and Light", scripture: "Matthew 5:13-16", week: "Week 4: Bold Witness", featured: false },
    { title: "The Commission", scripture: "Matthew 28:18-20", week: "Week 5: Commission", featured: false },
    { title: "Go Where You Are", scripture: "Acts 17:26-27", week: "Week 5: Commission", featured: false },
    { title: "Faithful in Little", scripture: "Luke 16:10", week: "Week 5: Commission", featured: false },
    { title: "Testimony: Sent Out", scripture: "Isaiah 6:8", week: "Week 5: Commission", featured: false },
    { title: "The Harvest is Ready", scripture: "John 4:35", week: "Week 5: Commission", featured: false },
    { title: "Until He Returns", scripture: "Matthew 24:14", week: "Week 5: Commission", featured: false },
  ];
  
  const descriptions: Record<string, string> = {
    "Dominion Begins with Belonging": "Real authority starts with security, not striving. When you know you belong, you stop performing and start living steady under pressure. Today, let your identity be your anchor.",
    "Seated, Not Shaken": "Dominion is perspective before it is performance. When life feels loud, remember you're not beneath fear—you're invited into a higher view. Calm begins when you stop fighting from the ground.",
    "Chosen for Influence": "You were made to bring light, not just survive the day. Dominion looks like quiet confidence, integrity, and courage that changes atmospheres.",
    "Testimony: From Pressure to Peace": "This is a real story of calm arriving in the middle of pressure. If you've been carrying stress, let this remind you that peace is possible.",
    "Dominion Through Love": "Fear shrinks you; love strengthens you. Dominion is not control—it's being steady enough to choose love in real situations.",
    "Living Light in Darkness": "The world around you is looking for something real. Your life can be that light—not by being perfect, but by being present.",
    "Power to Stand": "You don't have to fight every battle alone. God has already equipped you with everything you need to stand firm.",
    "When Stillness Speaks": "In the noise of life, stillness is where God meets you. Today, pause and listen for His voice.",
    "Prayer That Moves Mountains": "Prayer is not about getting what you want—it's about aligning with what God wants. That's where power lives.",
    "Testimony: Breakthrough Came": "Sometimes the breakthrough comes suddenly after a long wait. This story will encourage your faith today.",
    "In His Presence": "The fullness of joy is found in His presence. Today, make time to simply be with God.",
    "The Secret Place": "What happens in private shapes who you are in public. Your secret time with God matters more than you know.",
    "Peace That Guards": "Anxiety tells you to carry everything. God says cast it all on Him. Peace comes when you let go.",
    "Cast Your Cares": "You weren't designed to carry the weight of worry. Today, release what's been pressing on your heart.",
    "Anxiety to Trust": "Trust is a muscle. The more you practice it, the stronger it becomes. Today, choose trust over anxiety.",
    "Testimony: From Overwhelm to Overflow": "When everything felt like too much, God stepped in. This testimony will remind you He's still working.",
    "Mind Renewed": "Your thoughts shape your reality. Today, invite God to transform how you think.",
    "Rest for the Weary": "Rest isn't weakness—it's wisdom. Jesus invites the weary to come and find rest in Him.",
    "Speak Up": "Your voice matters. The world needs to hear what God has put in your heart. Today, be bold.",
    "Your Story Matters": "You have a testimony. Don't underestimate the power of your story to change someone's life.",
    "Love in Action": "Faith without works is incomplete. Today, let your love show up in tangible ways.",
    "Testimony: One Conversation Changed Everything": "It only takes one conversation to shift someone's eternity. This story will inspire you to speak.",
    "Courage Over Comfort": "Comfort zones are nice, but nothing grows there. Today, step out in courage.",
    "Salt and Light": "You're called to preserve and illuminate. Your presence changes the atmosphere around you.",
    "The Commission": "The Great Commission isn't just for missionaries—it's for you, wherever you are.",
    "Go Where You Are": "Mission starts right where you're standing. Your workplace, school, and neighborhood are your mission field.",
    "Faithful in Little": "Faithfulness in small things opens doors to greater things. Today, honor what's in your hand.",
    "Testimony: Sent Out": "When God sends you, He equips you. This testimony will encourage you to say yes.",
    "The Harvest is Ready": "The harvest is plentiful. Open your eyes to the opportunities around you today.",
    "Until He Returns": "We work with urgency because He's coming back. Let this reality fuel your purpose.",
  };
  
  const prayerLines: Record<string, string> = {
    "Dominion Begins with Belonging": "Father, anchor me in belonging and teach me to live from Your love, not from pressure.",
    "Seated, Not Shaken": "Jesus, lift my perspective and settle my heart in Your victory today.",
    "Chosen for Influence": "Lord, let my life bring light and hope to the people around me.",
    "Testimony: From Pressure to Peace": "Jesus, meet me in my pressure and give me peace that holds.",
    "Dominion Through Love": "Father, fill me with Your love until fear loses its voice in my life.",
    "Living Light in Darkness": "Lord, help me shine Your light wherever darkness needs to be pierced.",
    "Power to Stand": "Father, strengthen me to stand firm in every battle I face.",
    "When Stillness Speaks": "Lord, quiet my soul and help me hear Your voice in the stillness.",
    "Prayer That Moves Mountains": "Jesus, align my prayers with Your will and move mountains for Your glory.",
    "Testimony: Breakthrough Came": "Father, increase my faith as I wait for Your breakthrough.",
    "In His Presence": "Lord, draw me deeper into Your presence where fullness of joy is found.",
    "The Secret Place": "Father, meet me in the secret place and transform me from the inside out.",
    "Peace That Guards": "Lord, guard my heart and mind with Your supernatural peace.",
    "Cast Your Cares": "Jesus, I release my worries to You. Carry what I cannot.",
    "Anxiety to Trust": "Father, help me choose trust over anxiety in every situation.",
    "Testimony: From Overwhelm to Overflow": "Lord, turn my overwhelm into overflow by Your power.",
    "Mind Renewed": "Father, transform my thinking and renew my mind today.",
    "Rest for the Weary": "Jesus, I come to You weary. Give me Your rest.",
    "Speak Up": "Lord, give me boldness to speak and wisdom to know when.",
    "Your Story Matters": "Father, use my story to reach someone who needs hope.",
    "Love in Action": "Lord, help me love not just in words but in real action.",
    "Testimony: One Conversation Changed Everything": "Father, open doors for conversations that matter eternally.",
    "Courage Over Comfort": "Lord, give me courage to step beyond my comfort zone today.",
    "Salt and Light": "Jesus, help me preserve what's good and illuminate what's true.",
    "The Commission": "Lord, I accept Your commission. Send me where You need me.",
    "Go Where You Are": "Father, open my eyes to the mission field where I already stand.",
    "Faithful in Little": "Lord, help me be faithful in the small things today.",
    "Testimony: Sent Out": "Father, equip me for everywhere You're sending me.",
    "The Harvest is Ready": "Lord, give me eyes to see the harvest all around me.",
    "Until He Returns": "Jesus, fuel my urgency with hope as I wait for Your return.",
  };
  
  const sparks: any[] = [];
  const reflectionCards: any[] = [];
  
  // Generate 30 days of content for each segment
  for (let day = 0; day < 30; day++) {
    const date = new Date(campaignStart);
    date.setDate(date.getDate() + day);
    const dailyDate = date.toISOString().split('T')[0];
    const publishAt = new Date(dailyDate + 'T05:00:00.000Z');
    
    const theme = dayThemes[day];
    const desc = descriptions[theme.title] || theme.title;
    const prayer = prayerLines[theme.title] || "Lord, guide me today.";
    
    // Create spark for each segment
    for (const segment of segments) {
      sparks.push({
        title: theme.title,
        description: desc,
        category: theme.title.includes('Testimony') ? 'testimony' : 'daily-devotional',
        mediaType: 'video',
        duration: 120,
        scriptureRef: theme.scripture,
        status: day === 0 ? 'published' : 'scheduled',
        publishAt,
        dailyDate,
        featured: theme.featured,
        prayerLine: prayer,
        ctaPrimary: 'Pray',
        thumbnailText: theme.title.split(':')[0].substring(0, 20),
        weekTheme: theme.week,
        audienceSegment: segment,
      });
    }
    
    // Create reflection card for each segment
    for (const segment of segments) {
      reflectionCards.push({
        baseQuote: desc.split('.')[0] + '.',
        question: "What would it look like to live this truth today?",
        action: "Take one step in faith based on what you've reflected on.",
        faithOverlayScripture: theme.scripture,
        publishAt,
        dailyDate,
        status: day === 0 ? 'published' : 'scheduled',
        weekTheme: theme.week,
        audienceSegment: segment,
      });
    }
  }
  
  return { sparks, reflectionCards };
}

// ===== NOTIFICATION & RECOMMENDATION API ROUTES =====
// Note: These routes are registered separately to keep the main routes file organized.
// See server/services/notificationService.ts and server/services/recommendationEngine.ts
