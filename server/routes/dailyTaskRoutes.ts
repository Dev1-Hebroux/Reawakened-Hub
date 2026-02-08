import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { z } from "zod";

const router = Router();

// Schema for completing a task
const completeTaskSchema = z.object({
  taskId: z.string(),
  date: z.string().optional(), // ISO date string, defaults to today
});

/**
 * GET /api/daily-tasks/progress
 * Get user's task completion progress for a specific date
 */
router.get("/daily-tasks/progress", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const date = req.query.date as string || new Date().toISOString().split('T')[0];

    const completedTasks = await storage.getUserDailyTasks(userId, date);
    const totalPoints = completedTasks.reduce((sum: number, task: any) => sum + (task.points || 0), 0);

    res.json({
      date,
      completedTasks: completedTasks.map((t: any) => ({
        taskId: t.taskId,
        completedAt: t.completedAt,
        points: t.points,
      })),
      totalPoints,
    });
  } catch (error) {
    console.error("Error fetching daily tasks progress:", error);
    res.status(500).json({ message: "Failed to fetch daily tasks progress" });
  }
});

/**
 * POST /api/daily-tasks/complete
 * Mark a task as complete and award points
 */
router.post("/daily-tasks/complete", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const { taskId, date } = completeTaskSchema.parse(req.body);
    const taskDate = date || new Date().toISOString().split('T')[0];

    // Check if task already completed today
    const existingTasks = await storage.getUserDailyTasks(userId, taskDate);
    const alreadyCompleted = existingTasks.some((t: any) => t.taskId === taskId);

    if (alreadyCompleted) {
      return res.status(400).json({ message: "Task already completed today" });
    }

    // Task points mapping (should match frontend DailyTasks.tsx)
    const TASK_POINTS: Record<string, number> = {
      'watch-spark': 10,
      'read-devotional': 10,
      'daily-reflection': 15,
      'scripture-meditation': 15,
      'morning-prayer': 10,
      'gratitude-journal': 10,
      'take-action': 15,
      'daily-quiz': 10,
      'share-spark': 15,
      'pray-for-request': 15,
      'encourage-friend': 15,
      'attend-live': 20,
      'reflect-deeply': 20,
      'invite-friend': 20,
      'weekly-challenge': 25,
      'mentor-conversation': 30,
      'create-content': 30,
    };

    const points = TASK_POINTS[taskId] || 10;

    // Record task completion
    await storage.createDailyTask({
      userId: parseInt(userId, 10),
      taskId,
      date: taskDate,
      completedAt: new Date(),
      points,
    });

    // Update user progression (add points, check for level up)
    await storage.addUserPoints(userId, points);

    // Check and award badges
    await storage.checkAndAwardBadges(userId);

    res.json({
      success: true,
      taskId,
      points,
      message: `Task completed! +${points} points`,
    });
  } catch (error: any) {
    console.error("Error completing daily task:", error);
    res.status(400).json({ message: error.message || "Failed to complete task" });
  }
});

/**
 * GET /api/daily-tasks/streak
 * Get user's current streak with grace period info
 */
router.get("/daily-tasks/streak", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const streakData = await storage.getUserStreak(userId);
    res.json(streakData);
  } catch (error) {
    console.error("Error fetching streak:", error);
    res.status(500).json({ message: "Failed to fetch streak" });
  }
});

export default router;
