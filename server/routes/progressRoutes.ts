import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";

const router = Router();

/**
 * GET /api/me/progress
 * Get user's complete gamification progress
 * Includes: streak, badges, level, points, grace periods
 */
router.get("/me/progress", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Get streak data
    const streakData = await storage.getUserStreak(userId);

    // Get badges
    const badges = await storage.getUserBadges(userId);

    // Get user progression (level, points)
    const progression = await storage.getUserProgression(userId);

    // Get grace period info
    const gracePeriod = await storage.getUserGracePeriod(userId);

    // Calculate points to next level (100 points per level)
    const nextLevelAt = progression.level * 100;
    const pointsToNextLevel = nextLevelAt - (progression.totalPoints % nextLevelAt);

    res.json({
      streak: {
        currentStreak: streakData?.currentStreak || 0,
        longestStreak: streakData?.longestStreak || 0,
        lastCompletedDate: streakData?.lastCompletedDate || undefined,
      },
      badges: badges.map((b: any) => ({
        id: b.id,
        userId: b.userId,
        badgeId: b.badgeCode,
        awardedAt: b.earnedAt,
        badge: {
          id: b.id,
          code: b.badgeCode,
          name: getBadgeName(b.badgeCode),
          description: getBadgeDescription(b.badgeCode),
          iconUrl: null,
        },
      })),
      progression: {
        level: progression.level,
        totalPoints: progression.totalPoints,
        pointsToNextLevel,
        nextLevelAt,
      },
      gracePeriod: {
        graceDaysUsed: gracePeriod.graceDaysUsed,
        graceDaysAllowed: gracePeriod.graceDaysAllowed,
        lastGraceReset: gracePeriod.lastGraceReset,
      },
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ message: "Failed to fetch progress" });
  }
});

/**
 * GET /api/badges
 * Get list of all available badges
 */
router.get("/badges", async (req, res) => {
  try {
    const badges = [
      { code: 'FIRST_SPARK', name: 'First Spark', description: 'Watched your first spark' },
      { code: 'STREAK_3', name: 'On Fire', description: '3-day streak' },
      { code: 'STREAK_7', name: 'Week Warrior', description: '7-day streak' },
      { code: 'STREAK_14', name: 'Consistent', description: '14-day streak' },
      { code: 'STREAK_30', name: 'Champion', description: '30-day streak' },
      { code: 'EARLY_BIRD', name: 'Early Bird', description: 'Completed tasks before 8am' },
      { code: 'REFLECTOR', name: 'Deep Thinker', description: 'Completed 10 reflections' },
      { code: 'CHALLENGER', name: 'Challenger', description: 'Completed all weekly challenges' },
      { code: 'SHARER', name: 'Sharer', description: 'Shared 5 sparks' },
      { code: 'COMMUNITY', name: 'Community', description: 'Attended 3 live sessions' },
    ];
    res.json(badges);
  } catch (error) {
    console.error("Error fetching badges:", error);
    res.status(500).json({ message: "Failed to fetch badges" });
  }
});

/**
 * GET /api/leaderboard
 * Get leaderboard (top users by points or streak)
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const type = req.query.type as string || 'points';
    const limit = parseInt(req.query.limit as string) || 10;

    const leaderboard = await storage.getLeaderboard(type, limit);
    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

// Helper functions for badge metadata
function getBadgeName(code: string): string {
  const badges: Record<string, string> = {
    FIRST_SPARK: 'First Spark',
    STREAK_3: 'On Fire',
    STREAK_7: 'Week Warrior',
    STREAK_14: 'Consistent',
    STREAK_30: 'Champion',
    EARLY_BIRD: 'Early Bird',
    REFLECTOR: 'Deep Thinker',
    CHALLENGER: 'Challenger',
    SHARER: 'Sharer',
    COMMUNITY: 'Community',
  };
  return badges[code] || code;
}

function getBadgeDescription(code: string): string {
  const descriptions: Record<string, string> = {
    FIRST_SPARK: 'Watched your first spark',
    STREAK_3: '3-day streak',
    STREAK_7: '7-day streak',
    STREAK_14: '14-day streak',
    STREAK_30: '30-day streak',
    EARLY_BIRD: 'Completed tasks before 8am',
    REFLECTOR: 'Completed 10 reflections',
    CHALLENGER: 'Completed all weekly challenges',
    SHARER: 'Shared 5 sparks',
    COMMUNITY: 'Attended 3 live sessions',
  };
  return descriptions[code] || '';
}

export default router;
