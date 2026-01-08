/**
 * Admin Routes
 * 
 * All admin endpoints with proper role verification middleware.
 * FIX: Ensures all /api/admin/* routes have isAdmin middleware.
 */

import { Router } from 'express';
import { isAdmin, isSuperAdmin } from '../replitAuth';
import { validateCsrfToken } from '../middleware/csrf';
import { writeRateLimiter } from '../middleware/rateLimiter';
import { logger } from '../lib/logger';
import { db } from '../db';
import { 
  goalTemplates, 
  growthTracks, 
  userGoals,
  users,
  journeys,
  readingPlans,
} from '@shared/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

const router = Router();

// ============================================================================
// Goal Template Management
// ============================================================================

/**
 * GET /api/admin/goal-templates
 * List all goal templates.
 */
router.get('/goal-templates', isAdmin, async (req, res) => {
  const requestId = (req as any).requestId || 'unknown';
  
  try {
    const templates = await db
      .select()
      .from(goalTemplates)
      .orderBy(desc(goalTemplates.createdAt));
    
    res.json(templates);
  } catch (error) {
    logger.error({ err: error, requestId }, 'Failed to fetch goal templates');
    res.status(500).json({ error: 'Failed to fetch goal templates' });
  }
});

/**
 * POST /api/admin/goal-templates
 * Create a new goal template.
 */
router.post('/goal-templates', isAdmin, validateCsrfToken, writeRateLimiter, async (req, res) => {
  const requestId = (req as any).requestId || 'unknown';
  const adminId = (req as any).dbUser?.id;
  
  try {
    const { 
      title, 
      description, 
      category, 
      mode, 
      defaultActions,
      suggestedHabits,
      reflectionPrompts,
    } = req.body;
    
    // Validate required fields
    if (!title || typeof title !== 'string' || title.length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: 'Category is required' });
    }
    
    // Validate JSON arrays
    if (defaultActions && !Array.isArray(defaultActions)) {
      return res.status(400).json({ error: 'defaultActions must be an array' });
    }
    
    if (suggestedHabits && !Array.isArray(suggestedHabits)) {
      return res.status(400).json({ error: 'suggestedHabits must be an array' });
    }
    
    if (reflectionPrompts && !Array.isArray(reflectionPrompts)) {
      return res.status(400).json({ error: 'reflectionPrompts must be an array' });
    }
    
    const [template] = await db
      .insert(goalTemplates)
      .values({
        title,
        description: description || null,
        category,
        mode: mode || 'classic',
        defaultActions: defaultActions || [],
        suggestedHabits: suggestedHabits || [],
        reflectionPrompts: reflectionPrompts || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    logger.info({ requestId, adminId, templateId: template.id }, 'Goal template created');
    res.status(201).json(template);
  } catch (error) {
    logger.error({ err: error, requestId }, 'Failed to create goal template');
    res.status(500).json({ error: 'Failed to create goal template' });
  }
});

/**
 * PUT /api/admin/goal-templates/:id
 * Update a goal template.
 */
router.put('/goal-templates/:id', isAdmin, validateCsrfToken, writeRateLimiter, async (req, res) => {
  const requestId = (req as any).requestId || 'unknown';
  const adminId = (req as any).dbUser?.id;
  const templateId = Number(req.params.id);
  
  try {
    const { 
      title, 
      description, 
      category, 
      mode, 
      defaultActions,
      suggestedHabits,
      reflectionPrompts,
      isActive,
    } = req.body;
    
    // Validate JSON arrays if provided
    if (defaultActions !== undefined && !Array.isArray(defaultActions)) {
      return res.status(400).json({ error: 'defaultActions must be an array' });
    }
    
    if (suggestedHabits !== undefined && !Array.isArray(suggestedHabits)) {
      return res.status(400).json({ error: 'suggestedHabits must be an array' });
    }
    
    if (reflectionPrompts !== undefined && !Array.isArray(reflectionPrompts)) {
      return res.status(400).json({ error: 'reflectionPrompts must be an array' });
    }
    
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (mode !== undefined) updateData.mode = mode;
    if (defaultActions !== undefined) updateData.defaultActions = defaultActions;
    if (suggestedHabits !== undefined) updateData.suggestedHabits = suggestedHabits;
    if (reflectionPrompts !== undefined) updateData.reflectionPrompts = reflectionPrompts;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const [updated] = await db
      .update(goalTemplates)
      .set(updateData)
      .where(eq(goalTemplates.id, templateId))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'Goal template not found' });
    }
    
    logger.info({ requestId, adminId, templateId }, 'Goal template updated');
    res.json(updated);
  } catch (error) {
    logger.error({ err: error, requestId, templateId }, 'Failed to update goal template');
    res.status(500).json({ error: 'Failed to update goal template' });
  }
});

/**
 * DELETE /api/admin/goal-templates/:id
 * Delete a goal template.
 */
router.delete('/goal-templates/:id', isAdmin, validateCsrfToken, writeRateLimiter, async (req, res) => {
  const requestId = (req as any).requestId || 'unknown';
  const adminId = (req as any).dbUser?.id;
  const templateId = Number(req.params.id);
  
  try {
    const result = await db
      .delete(goalTemplates)
      .where(eq(goalTemplates.id, templateId))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Goal template not found' });
    }
    
    logger.info({ requestId, adminId, templateId }, 'Goal template deleted');
    res.status(204).send();
  } catch (error) {
    logger.error({ err: error, requestId, templateId }, 'Failed to delete goal template');
    res.status(500).json({ error: 'Failed to delete goal template' });
  }
});

// ============================================================================
// Analytics and Dashboard
// ============================================================================

/**
 * GET /api/admin/analytics/overview
 * Get overview analytics for admin dashboard.
 */
router.get('/analytics/overview', isAdmin, async (req, res) => {
  const requestId = (req as any).requestId || 'unknown';
  
  try {
    const [
      userCount,
      goalCount,
      journeyCount,
      planCount,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(userGoals),
      db.select({ count: sql<number>`count(*)` }).from(journeys),
      db.select({ count: sql<number>`count(*)` }).from(readingPlans),
    ]);
    
    res.json({
      totalUsers: Number(userCount[0]?.count || 0),
      totalGoals: Number(goalCount[0]?.count || 0),
      totalJourneys: Number(journeyCount[0]?.count || 0),
      totalReadingPlans: Number(planCount[0]?.count || 0),
    });
  } catch (error) {
    logger.error({ err: error, requestId }, 'Failed to fetch analytics');
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ============================================================================
// User Management (Super Admin Only)
// ============================================================================

/**
 * GET /api/admin/users
 * List all users (super admin only).
 */
router.get('/users', isSuperAdmin, async (req, res) => {
  const requestId = (req as any).requestId || 'unknown';
  
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Number(req.query.offset) || 0;
    
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
    
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    res.json({
      users: userList,
      total: Number(countResult[0]?.count || 0),
      limit,
      offset,
    });
  } catch (error) {
    logger.error({ err: error, requestId }, 'Failed to fetch users');
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * PATCH /api/admin/users/:id/role
 * Update a user's role (super admin only).
 */
router.patch('/users/:id/role', isSuperAdmin, validateCsrfToken, writeRateLimiter, async (req, res) => {
  const requestId = (req as any).requestId || 'unknown';
  const adminId = (req as any).dbUser?.id;
  const targetUserId = req.params.id;
  
  try {
    const { role } = req.body;
    
    // Validate role
    const validRoles = ['member', 'leader', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be one of: member, leader, admin' 
      });
    }
    
    // Prevent self-demotion
    if (targetUserId === adminId) {
      return res.status(400).json({ error: 'Cannot modify your own role' });
    }
    
    const [updated] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, targetUserId))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    logger.info({ requestId, adminId, targetUserId, newRole: role }, 'User role updated');
    res.json({ id: updated.id, role: updated.role });
  } catch (error) {
    logger.error({ err: error, requestId, targetUserId }, 'Failed to update user role');
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;
