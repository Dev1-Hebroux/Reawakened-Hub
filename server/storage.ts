import {
  users,
  posts,
  reactions,
  sparks,
  sparkSubscriptions,
  events,
  eventRegistrations,
  blogPosts,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Reaction,
  type InsertReaction,
  type Spark,
  type InsertSpark,
  type SparkSubscription,
  type InsertSparkSubscription,
  type Event,
  type InsertEvent,
  type EventRegistration,
  type InsertEventRegistration,
  type BlogPost,
  type InsertBlogPost,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, inArray, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Community Hub - Posts
  getPosts(type?: string): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;

  // Community Hub - Reactions
  getReactionsByPost(postId: number): Promise<Reaction[]>;
  createReaction(reaction: InsertReaction): Promise<Reaction>;
  deleteReaction(id: number, userId: string): Promise<void>;

  // Sparks
  getSparks(category?: string): Promise<Spark[]>;
  getSpark(id: number): Promise<Spark | undefined>;
  createSpark(spark: InsertSpark): Promise<Spark>;

  // Spark Subscriptions
  getSubscriptions(userId: string): Promise<SparkSubscription[]>;
  createSubscription(subscription: InsertSparkSubscription): Promise<SparkSubscription>;
  deleteSubscription(userId: string, category: string): Promise<void>;

  // Events
  getEvents(type?: string): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Event Registrations
  getEventRegistrations(eventId: number): Promise<EventRegistration[]>;
  getUserEventRegistration(eventId: number, userId: string): Promise<EventRegistration | undefined>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;

  // Blog
  getBlogPosts(category?: string): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Posts
  async getPosts(type?: string): Promise<any[]> {
    const query = db
      .select({
        id: posts.id,
        userId: posts.userId,
        type: posts.type,
        content: posts.content,
        imageUrl: posts.imageUrl,
        createdAt: posts.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));

    const results = type 
      ? await query.where(eq(posts.type, type))
      : await query;

    // Get reaction counts for all posts
    const postIds = results.map(p => p.id);
    let reactionCounts: { postId: number; count: number }[] = [];
    
    if (postIds.length > 0) {
      reactionCounts = await db
        .select({
          postId: reactions.postId,
          count: count(reactions.id),
        })
        .from(reactions)
        .where(inArray(reactions.postId, postIds))
        .groupBy(reactions.postId);
    }

    // Map reaction counts to posts
    const postsWithCounts = results.map(post => ({
      ...post,
      reactionCount: reactionCounts.find(r => r.postId === post.id)?.count || 0,
    }));

    return postsWithCounts;
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createPost(postData: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(postData).returning();
    return post;
  }

  // Reactions
  async getReactionsByPost(postId: number): Promise<Reaction[]> {
    return db.select().from(reactions).where(eq(reactions.postId, postId));
  }

  async createReaction(reactionData: InsertReaction): Promise<Reaction> {
    const [reaction] = await db.insert(reactions).values(reactionData).returning();
    return reaction;
  }

  async deleteReaction(id: number, userId: string): Promise<void> {
    await db.delete(reactions).where(and(eq(reactions.id, id), eq(reactions.userId, userId)));
  }

  // Sparks
  async getSparks(category?: string): Promise<Spark[]> {
    if (category) {
      return db.select().from(sparks).where(eq(sparks.category, category)).orderBy(desc(sparks.createdAt));
    }
    return db.select().from(sparks).orderBy(desc(sparks.createdAt));
  }

  async getSpark(id: number): Promise<Spark | undefined> {
    const [spark] = await db.select().from(sparks).where(eq(sparks.id, id));
    return spark;
  }

  async createSpark(sparkData: InsertSpark): Promise<Spark> {
    const [spark] = await db.insert(sparks).values(sparkData).returning();
    return spark;
  }

  // Spark Subscriptions
  async getSubscriptions(userId: string): Promise<SparkSubscription[]> {
    return db.select().from(sparkSubscriptions).where(eq(sparkSubscriptions.userId, userId));
  }

  async createSubscription(subscriptionData: InsertSparkSubscription): Promise<SparkSubscription> {
    const [subscription] = await db.insert(sparkSubscriptions).values(subscriptionData).returning();
    return subscription;
  }

  async deleteSubscription(userId: string, category: string): Promise<void> {
    await db.delete(sparkSubscriptions).where(
      and(eq(sparkSubscriptions.userId, userId), eq(sparkSubscriptions.category, category))
    );
  }

  // Events
  async getEvents(type?: string): Promise<Event[]> {
    if (type) {
      return db.select().from(events).where(eq(events.type, type)).orderBy(desc(events.startDate));
    }
    return db.select().from(events).orderBy(desc(events.startDate));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(eventData).returning();
    return event;
  }

  // Event Registrations
  async getEventRegistrations(eventId: number): Promise<EventRegistration[]> {
    return db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, eventId));
  }

  async getUserEventRegistration(eventId: number, userId: string): Promise<EventRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, userId)));
    return registration;
  }

  async createEventRegistration(registrationData: InsertEventRegistration): Promise<EventRegistration> {
    const [registration] = await db.insert(eventRegistrations).values(registrationData).returning();
    return registration;
  }

  // Blog
  async getBlogPosts(category?: string): Promise<BlogPost[]> {
    if (category) {
      return db.select().from(blogPosts).where(eq(blogPosts.category, category)).orderBy(desc(blogPosts.publishedAt));
    }
    return db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(postData: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(postData).returning();
    return post;
  }
}

export const storage = new DatabaseStorage();
