/**
 * Journal Entries API Routes
 * 
 * Server-side storage for journal entries, replacing insecure localStorage.
 * Entries are associated with user accounts and can be linked to
 * reflections, sparks, or reading plan days.
 */

import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { validateCsrfToken } from '../middleware/csrf';
import { writeRateLimiter } from '../middleware/rateLimiter';
import { logger } from '../lib/logger';
import { db } from '../db';
import { journalEntries } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = Router();

/**
 * Validation for journal entry content.
 */
function validateContent(content: unknown): { valid: boolean; error?: string } {
  if (typeof content !== 'string') {
    return { valid: false, error: 'Content must be a string' };
  }
  
  if (content.length === 0) {
    return { valid: false, error: 'Content cannot be empty' };
  }
  
  if (content.length > 50000) {
    return { valid: false, error: 'Content exceeds maximum length of 50,000 characters' };
  }
  
  return { valid: true };
}

/**
 * GET /api/journal-entries
 * Fetch journal entries for a specific context.
 */
router.get('/', isAuthenticated, async (req, res) => {
  const requestId = (req as any).requestId || 'unknown';
  const userId = (req.user as any).claims.sub;
  
  try {
    const { reflectionId, sparkId, readingPlanDayId } = req.query;
    
    // Build query conditions
    const conditions = [eq(journalEntries.userId, userId)];
    
    if (reflectionId) {
      conditions.push(eq(journalEntries.reflectionId, Number(reflectionId)));
    }
    if (sparkId) {
      conditions.push(eq(journalEntries.sparkId, Number(sparkId)));
    }
    if (readingPlanDayId) {
      conditions.push(eq(journalEntries.readingPlanDayId, Number(readingPlanDayId)));
    }
    
    const entries = await db
      .select()
      .from(journalEntries)
      .where(and(...conditions))
      .orderBy(desc(journalEntries.createdAt))
      .limit(100);
    
    res.json(entries);
  } catch (error) {
    logger.error({ err: error, requestId, userId }, 'Failed to fetch journal entries');
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

/**
 * GET /api/journal-entries/all
 * Fetch all journal entries for the current user with pagination.
 */
router.get('/all', isAuthenticated, async (req, res) => {
  const requestId = (req as any).requestId || 'unknown';
  const userId = (req.user as any).claims.sub;
  
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;
    
    const entries = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId));
    
    res.json({
      entries,
      total: Number(countResult[0]?.count || 0),
      limit,
      offset,
    });
  } catch (error) {
    logger.error({ err: error, requestId, userId }, 'Failed to fetch all journal entries');
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

/**
 * POST /api/journal-entries
 * Create a new journal entry.
 */
router.post('/', isAuthenticated, validateCsrfToken, writeRateLimiter, async (req, res) => {
  const requestId = (req as any).requestId || 'unknown';
  const userId = (req.user as any).claims.sub;
  
  try {
    const { content, reflectionId, sparkId, readingPlanDayId } = req.body;
    
    // Validate content
    const validation = validateContent(content);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Create entry
    const [entry] = await db
      .insert(journalEntries)
      .values({
        userId,
        content,
        reflectionId: reflectionId ? Number(reflectionId) : null,
        sparkId: sparkId ? Number(sparkId) : null,
        readingPlanDayId: readingPlanDayId ? Number(readingPlanDayId) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    logger.info({ requestId, userId, entryId: entry.id }, 'Journal entry created');
    res.status(201).json(entry);
  } catch (error) {
    logger.error({ err: error, requestId, userId }, 'Failed to create journal entry');
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

/**
 * PATCH /api/journal-entries/:id
 * Update an existing journal entry.
 */
router.patch('/:id', isAuthenticated, validateCsrfToken, writeRateLimiter, async (req, res) => {
  const requestId = (req as any).requestId || 'unknown';
  const userId = (req.user as any).claims.sub;
  const entryId = Number(req.params.id);
  
  try {
    const { content } = req.body;
    
    // Validate content
    const validation = validateContent(content);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Verify ownership
    const existing = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .limit(1);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    // Update entry
    const [updated] = await db
      .update(journalEntries)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .returning();
    
    logger.info({ requestId, userId, entryId }, 'Journal entry updated');
    res.json(updated);
  } catch (error) {
    logger.error({ err: error, requestId, userId, entryId }, 'Failed to update journal entry');
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

/**
 * DELETE /api/journal-entries/:id
 * Delete a journal entry.
 */
router.delete('/:id', isAuthenticated, validateCsrfToken, writeRateLimiter, async (req, res) => {
  const requestId = (req as any).requestId || 'unknown';
  const userId = (req.user as any).claims.sub;
  const entryId = Number(req.params.id);
  
  try {
    // Verify ownership and delete
    const result = await db
      .delete(journalEntries)
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    logger.info({ requestId, userId, entryId }, 'Journal entry deleted');
    res.status(204).send();
  } catch (error) {
    logger.error({ err: error, requestId, userId, entryId }, 'Failed to delete journal entry');
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

export default router;
