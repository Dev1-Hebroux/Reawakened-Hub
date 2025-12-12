import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPostSchema, insertReactionSchema, insertSparkSchema, insertSparkSubscriptionSchema, insertEventSchema, insertEventRegistrationSchema, insertBlogPostSchema } from "@shared/schema";

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

  return httpServer;
}
