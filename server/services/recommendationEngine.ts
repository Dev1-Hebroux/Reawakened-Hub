/**
 * Recommendation Engine
 * 
 * Personalized content recommendations based on user profile,
 * engagement history, and spiritual growth areas.
 */

import { db } from '../db';
import { 
  readingPlans, 
  userPlanEnrollments, 
  userSpiritualProfiles,
  users,
} from '@shared/schema';
import { eq, and, notInArray, desc, sql } from 'drizzle-orm';
import { logger } from '../lib/logger';

// ============================================================================
// Types
// ============================================================================

interface ContentItem {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  totalDays: number;
  tags: string[];
  isFeatured: boolean;
}

interface ScoredItem<T> {
  item: T;
  score: number;
  reasons: string[];
}

interface RecommendationResult<T> {
  items: ScoredItem<T>[];
  strategy: string;
  generatedAt: Date;
}

interface UserContext {
  userId: string;
  maturityLevel?: string;
  interests?: string[];
  completedPlanIds: number[];
  currentStreak: number;
}

// ============================================================================
// Scoring Weights
// ============================================================================

const WEIGHTS = {
  MATURITY_MATCH: 30,
  INTEREST_MATCH: 25,
  FEATURED: 15,
  POPULARITY: 10,
  COMPLETION_RATE: 10,
  DIVERSITY: 10,
} as const;

// ============================================================================
// Core Engine
// ============================================================================

async function getUserContext(userId: string): Promise<UserContext> {
  // Get user's spiritual profile
  const [profile] = await db
    .select()
    .from(userSpiritualProfiles)
    .where(eq(userSpiritualProfiles.userId, userId))
    .limit(1);

  // Get completed plan IDs
  const completedEnrollments = await db
    .select({ planId: userPlanEnrollments.planId })
    .from(userPlanEnrollments)
    .where(
      and(
        eq(userPlanEnrollments.userId, userId),
        eq(userPlanEnrollments.status, 'completed')
      )
    );

  // Get current active enrollment for streak
  const [activeEnrollment] = await db
    .select({ currentStreak: userPlanEnrollments.currentStreak })
    .from(userPlanEnrollments)
    .where(
      and(
        eq(userPlanEnrollments.userId, userId),
        eq(userPlanEnrollments.status, 'active')
      )
    )
    .limit(1);

  return {
    userId,
    maturityLevel: profile?.maturityLevel || 'growing',
    interests: profile?.interests || [],
    completedPlanIds: completedEnrollments.map(e => e.planId),
    currentStreak: activeEnrollment?.currentStreak || 0,
  };
}

function scoreReadingPlan(
  plan: typeof readingPlans.$inferSelect,
  context: UserContext
): ScoredItem<ContentItem> {
  let score = 0;
  const reasons: string[] = [];

  // Maturity level match
  if (plan.maturityLevel === context.maturityLevel) {
    score += WEIGHTS.MATURITY_MATCH;
    reasons.push(`Matches your spiritual maturity level`);
  } else if (
    (context.maturityLevel === 'growing' && plan.maturityLevel === 'new-believer') ||
    (context.maturityLevel === 'mature' && plan.maturityLevel === 'growing')
  ) {
    score += WEIGHTS.MATURITY_MATCH * 0.5;
  }

  // Interest match
  const planTopics = plan.topics || [];
  const matchedInterests = planTopics.filter(topic => 
    context.interests?.includes(topic)
  );
  
  if (matchedInterests.length > 0) {
    const interestScore = (matchedInterests.length / Math.max(planTopics.length, 1)) * WEIGHTS.INTEREST_MATCH;
    score += interestScore;
    reasons.push(`Covers topics you're interested in: ${matchedInterests.join(', ')}`);
  }

  // Featured bonus
  if (plan.featured) {
    score += WEIGHTS.FEATURED;
    reasons.push('Featured plan');
  }

  // Popularity (enrollment count)
  const popularityScore = Math.min((plan.enrollmentCount || 0) / 100, 1) * WEIGHTS.POPULARITY;
  score += popularityScore;

  // Diversity: favor plans with topics the user hasn't explored
  const unexploredTopics = planTopics.filter(topic => 
    !context.interests?.includes(topic)
  );
  if (unexploredTopics.length > 0) {
    score += WEIGHTS.DIVERSITY * 0.5;
    reasons.push(`Explore new topics: ${unexploredTopics.slice(0, 2).join(', ')}`);
  }

  return {
    item: {
      id: plan.id,
      title: plan.title,
      category: plan.topics?.[0] || 'general',
      difficulty: plan.maturityLevel || 'growing',
      totalDays: plan.durationDays,
      tags: plan.topics || [],
      isFeatured: plan.featured || false,
    },
    score: Math.round(score),
    reasons,
  };
}

// ============================================================================
// Public API
// ============================================================================

export async function getReadingPlanRecommendations(
  userId: string,
  limit = 5
): Promise<RecommendationResult<ContentItem>> {
  const startTime = Date.now();
  
  try {
    const context = await getUserContext(userId);

    // Get available plans (not completed by user)
    const availablePlans = await db
      .select()
      .from(readingPlans)
      .where(
        and(
          eq(readingPlans.status, 'published'),
          context.completedPlanIds.length > 0
            ? notInArray(readingPlans.id, context.completedPlanIds)
            : sql`1=1`
        )
      );

    // Score and sort
    const scored = availablePlans
      .map(plan => scoreReadingPlan(plan, context))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const duration = Date.now() - startTime;
    logger.info({
      userId,
      planCount: availablePlans.length,
      recommendedCount: scored.length,
      durationMs: duration,
    }, 'Generated reading plan recommendations');

    return {
      items: scored,
      strategy: 'personalized',
      generatedAt: new Date(),
    };
  } catch (error) {
    logger.error({ userId, err: error }, 'Failed to generate recommendations');
    
    // Fallback to featured plans
    const featuredPlans = await db
      .select()
      .from(readingPlans)
      .where(
        and(
          eq(readingPlans.status, 'published'),
          eq(readingPlans.featured, true)
        )
      )
      .limit(limit);

    return {
      items: featuredPlans.map(plan => ({
        item: {
          id: plan.id,
          title: plan.title,
          category: plan.topics?.[0] || 'general',
          difficulty: plan.maturityLevel || 'growing',
          totalDays: plan.durationDays,
          tags: plan.topics || [],
          isFeatured: true,
        },
        score: 50,
        reasons: ['Featured plan'],
      })),
      strategy: 'fallback_featured',
      generatedAt: new Date(),
    };
  }
}

export async function getContinueReading(
  userId: string
): Promise<{ planId: number; currentDay: number; title: string } | null> {
  const [enrollment] = await db
    .select({
      planId: userPlanEnrollments.planId,
      currentDay: userPlanEnrollments.currentDay,
      title: readingPlans.title,
    })
    .from(userPlanEnrollments)
    .innerJoin(readingPlans, eq(userPlanEnrollments.planId, readingPlans.id))
    .where(
      and(
        eq(userPlanEnrollments.userId, userId),
        eq(userPlanEnrollments.status, 'active')
      )
    )
    .orderBy(desc(userPlanEnrollments.lastReadAt))
    .limit(1);

  if (!enrollment) return null;
  
  return {
    planId: enrollment.planId,
    currentDay: enrollment.currentDay ?? 1,
    title: enrollment.title,
  };
}

export async function getStreakData(
  userId: string
): Promise<{ currentStreak: number; longestStreak: number; lastReadAt: Date | null }> {
  const [profile] = await db
    .select({
      longestStreak: userSpiritualProfiles.longestStreak,
    })
    .from(userSpiritualProfiles)
    .where(eq(userSpiritualProfiles.userId, userId))
    .limit(1);

  const [enrollment] = await db
    .select({
      currentStreak: userPlanEnrollments.currentStreak,
      lastReadAt: userPlanEnrollments.lastReadAt,
    })
    .from(userPlanEnrollments)
    .where(
      and(
        eq(userPlanEnrollments.userId, userId),
        eq(userPlanEnrollments.status, 'active')
      )
    )
    .orderBy(desc(userPlanEnrollments.currentStreak))
    .limit(1);

  return {
    currentStreak: enrollment?.currentStreak || 0,
    longestStreak: profile?.longestStreak || 0,
    lastReadAt: enrollment?.lastReadAt || null,
  };
}

export async function recordActivity(
  userId: string,
  activityType: 'reading_completed' | 'plan_started' | 'plan_completed'
): Promise<void> {
  logger.info({ userId, activityType }, 'Recording user activity');
  
  // Update spiritual profile stats based on activity
  if (activityType === 'reading_completed') {
    await db
      .update(userSpiritualProfiles)
      .set({
        totalReadingDays: sql`${userSpiritualProfiles.totalReadingDays} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(userSpiritualProfiles.userId, userId));
  } else if (activityType === 'plan_completed') {
    await db
      .update(userSpiritualProfiles)
      .set({
        completedPlansCount: sql`${userSpiritualProfiles.completedPlansCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(userSpiritualProfiles.userId, userId));
  }
}

export const recommendationEngine = {
  getReadingPlanRecommendations,
  getContinueReading,
  getStreakData,
  recordActivity,
};

export default recommendationEngine;
