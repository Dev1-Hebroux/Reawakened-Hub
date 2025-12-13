import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPostSchema, insertReactionSchema, insertSparkSchema, insertSparkSubscriptionSchema, insertEventSchema, insertEventRegistrationSchema, insertBlogPostSchema, insertEmailSubscriptionSchema, insertPrayerRequestSchema, insertTestimonySchema, insertVolunteerSignupSchema, insertMissionRegistrationSchema, insertJourneySchema, insertJourneyDaySchema, insertJourneyStepSchema } from "@shared/schema";

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

  return httpServer;
}
