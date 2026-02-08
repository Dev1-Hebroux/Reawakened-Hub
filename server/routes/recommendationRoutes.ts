/**
 * Recommendation API Routes
 * 
 * Handles personalized content recommendations using the storage layer.
 */

import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

// Get personalized reading plan recommendations
router.get('/recommendations', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const limit = parseInt(req.query.limit as string) || 5;
    
    // Get user's completed plans through storage
    const completedPlanIds = await storage.getUserCompletedPlanIds(userId);
    
    // Get available reading plans through storage
    const plans = await storage.getPublishedReadingPlans(limit * 2);
    
    // Filter and score plans
    const recommendations = plans
      .filter(plan => !completedPlanIds.includes(plan.id))
      .slice(0, limit)
      .map(plan => ({
        item: plan,
        score: plan.featured ? 100 : 50,
        reasons: plan.featured ? ['Featured plan'] : ['Matches your interests'],
      }));
    
    res.json({
      items: recommendations,
      strategy: 'collaborative',
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});

// Get continue reading suggestion
router.get('/recommendations/continue', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    
    // Get active enrollment through storage
    const enrollment = await storage.getActiveEnrollmentWithPlan(userId);
    
    if (enrollment && enrollment.planId) {
      res.json({
        planId: enrollment.planId,
        currentDay: enrollment.currentDay,
        title: enrollment.title,
      });
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Error fetching continue reading:', error);
    res.status(500).json({ message: 'Failed to fetch continue reading' });
  }
});

// Get user streak data
router.get('/user/streak', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    
    // Get streak data through storage
    const streakData = await storage.getReadingPlanStreakData(userId);
    res.json(streakData);
  } catch (error) {
    console.error('Error fetching streak data:', error);
    res.status(500).json({ message: 'Failed to fetch streak data' });
  }
});

export default router;
