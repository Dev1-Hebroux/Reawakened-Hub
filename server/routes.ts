import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getAICoachInsights, type AICoachRequest } from "./ai-service";
import { insertPostSchema, insertReactionSchema, insertSparkSchema, insertSparkReactionSchema, insertSparkSubscriptionSchema, insertEventSchema, insertEventRegistrationSchema, insertBlogPostSchema, insertEmailSubscriptionSchema, insertPrayerRequestSchema, insertTestimonySchema, insertVolunteerSignupSchema, insertMissionRegistrationSchema, insertJourneySchema, insertJourneyDaySchema, insertJourneyStepSchema, insertAlphaCohortSchema, insertAlphaCohortWeekSchema, insertAlphaCohortParticipantSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth middleware - must be called before routes
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      await storage.deleteReaction(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting reaction:", error);
      res.status(500).json({ message: "Failed to delete reaction" });
    }
  });

  // ===== SPARKS ROUTES =====
  
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
      const userId = req.user.claims.sub;
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

  // Get user subscriptions (protected)
  app.get('/api/subscriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const registrationData = insertEventRegistrationSchema.parse({ ...req.body, userId });
      const registration = await storage.createEventRegistration(registrationData);
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
      const authorId = req.user.claims.sub;
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
      const subscriptionData = insertEmailSubscriptionSchema.parse(req.body);
      const subscription = await storage.createEmailSubscription(subscriptionData);
      res.status(201).json(subscription);
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ message: error.message || "Failed to subscribe" });
    }
  });

  // Prayer request (public)
  app.post('/api/prayer-requests', async (req, res) => {
    try {
      const requestData = insertPrayerRequestSchema.parse(req.body);
      const request = await storage.createPrayerRequest(requestData);
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

  // Get a specific day's content (protected)
  app.get('/api/user-journeys/:id/day/:dayNumber', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId as string) : undefined;
      const progress = await storage.getUserModuleProgress(userId, sessionId);
      res.json({ ok: true, data: progress });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.post('/api/user/module-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId as string) : undefined;
      const logs = await storage.getUserPracticeLogs(userId, sessionId);
      res.json({ ok: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  app.post('/api/user/practice-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const log = await storage.createUserPracticeLog({ ...req.body, userId });
      res.json({ ok: true, data: log });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: { message: error.message } });
    }
  });

  // ===== WDEP =====

  app.post('/api/vision/sessions/:sessionId/wdep', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

  // ===== SELF-CONCORDANT ACTION =====

  app.post('/api/vision/sessions/:sessionId/sca', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = parseInt(req.params.sessionId);
      const exercise = await storage.createScaExercise({ ...req.body, userId, sessionId });
      res.json({ ok: true, data: exercise });
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const streak = await storage.getUserReflectionStreak(userId);
      res.json({ ok: true, data: { streak } });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Log viewing a reflection
  app.post('/api/reflection/:id/view', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const profile = await storage.getCoachProfile(userId);
      res.json({ ok: true, data: profile || null });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Create or update coach profile
  app.post('/api/coach/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const bookings = await storage.getUserSessionBookings(userId);
      res.json({ ok: true, data: bookings });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: { message: error.message } });
    }
  });

  // Get coach's session bookings (for coaches)
  app.get('/api/coach/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

  // ===== MISSION HUB API ROUTES =====

  // Mission Projects
  app.get('/api/mission/projects', async (req, res) => {
    try {
      const projects = await storage.getMissionProjects();
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
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Mission Focuses (people groups/regions)
  app.get('/api/mission/focuses', async (req, res) => {
    try {
      const focuses = await storage.getMissionFocuses();
      res.json(focuses);
    } catch (error) {
      console.error("Error fetching focuses:", error);
      res.status(500).json({ message: "Failed to fetch focuses" });
    }
  });

  // Mission Opportunities (online-first by default)
  app.get('/api/mission/opportunities', async (req, res) => {
    try {
      const deliveryMode = req.query.deliveryMode as string | undefined;
      const opportunities = await storage.getMissionOpportunities(deliveryMode);
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
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

  // Mission Challenges
  app.get('/api/mission/challenges', async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const challenges = await storage.getMissionChallenges(status);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.post('/api/mission/challenges/:id/enroll', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const challengeId = parseInt(req.params.id);
      const enrollment = await storage.enrollInChallenge(userId, challengeId);
      res.status(201).json(enrollment);
    } catch (error: any) {
      console.error("Error enrolling in challenge:", error);
      res.status(400).json({ message: error.message || "Failed to enroll" });
    }
  });

  app.get('/api/mission/me/challenges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollments = await storage.getUserChallengeEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching user challenges:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Mission Testimonies
  app.get('/api/mission/testimonies', async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const testimonies = await storage.getMissionTestimonies(type);
      res.json(testimonies);
    } catch (error) {
      console.error("Error fetching testimonies:", error);
      res.status(500).json({ message: "Failed to fetch testimonies" });
    }
  });

  app.post('/api/mission/testimonies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const testimony = await storage.createMissionTestimony({ ...req.body, userId });
      res.status(201).json(testimony);
    } catch (error: any) {
      console.error("Error creating testimony:", error);
      res.status(400).json({ message: error.message || "Failed to create testimony" });
    }
  });

  // Mission Pillars
  app.get('/api/mission/pillars', async (req, res) => {
    try {
      const pillars = await storage.getMissionPillars();
      res.json(pillars);
    } catch (error) {
      console.error("Error fetching pillars:", error);
      res.status(500).json({ message: "Failed to fetch pillars" });
    }
  });

  // Mission Profile (user's mission settings)
  app.get('/api/mission/me/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getMissionProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching mission profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/mission/me/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.upsertMissionProfile({ ...req.body, userId });
      res.json(profile);
    } catch (error: any) {
      console.error("Error saving mission profile:", error);
      res.status(400).json({ message: error.message || "Failed to save profile" });
    }
  });

  // Digital Actions
  app.get('/api/mission/me/actions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const actions = await storage.getUserDigitalActions(userId);
      res.json(actions);
    } catch (error) {
      console.error("Error fetching digital actions:", error);
      res.status(500).json({ message: "Failed to fetch actions" });
    }
  });

  app.post('/api/mission/actions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const action = await storage.createDigitalAction({ ...req.body, userId });
      res.status(201).json(action);
    } catch (error: any) {
      console.error("Error creating digital action:", error);
      res.status(400).json({ message: error.message || "Failed to create action" });
    }
  });

  // Donations
  app.get('/api/mission/me/donations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const donations = await storage.getUserDonations(userId);
      res.json(donations);
    } catch (error) {
      console.error("Error fetching donations:", error);
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  app.post('/api/mission/donations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const donation = await storage.createMissionDonation({ ...req.body, userId });
      res.status(201).json(donation);
    } catch (error: any) {
      console.error("Error creating donation:", error);
      res.status(400).json({ message: error.message || "Failed to create donation" });
    }
  });

  return httpServer;
}
