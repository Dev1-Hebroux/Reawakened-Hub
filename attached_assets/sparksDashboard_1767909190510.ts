/**
 * Combined Dashboard API Endpoint
 * 
 * This endpoint consolidates multiple API calls into a single request
 * to reduce initial page load latency on the Sparks page.
 * 
 * Instead of making 5 separate requests:
 * - /api/sparks/published
 * - /api/sparks/today
 * - /api/sparks/featured
 * - /api/reflection-cards/today
 * - /api/leader-prayer-sessions
 * 
 * Clients can make a single request to /api/sparks/dashboard
 */

import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { parseAudienceSegment } from '@shared/constants';

const router = Router();

interface DashboardResponse {
  sparks: any[];
  todaySpark: any | null;
  featured: any[];
  reflection: any | null;
  sessions: any[];
  meta: {
    timestamp: string;
    audienceSegment: string | null;
    totalSparks: number;
  };
}

/**
 * GET /api/sparks/dashboard
 * 
 * Returns all data needed for the Sparks page initial render.
 * 
 * Query Parameters:
 * - audience: Optional audience segment filter (schools, universities, early-career, builders, couples)
 * 
 * Response:
 * - sparks: Array of published sparks (filtered by audience if provided)
 * - todaySpark: Today's devotional (segment-specific or global fallback)
 * - featured: Array of featured sparks
 * - reflection: Today's reflection card (if available)
 * - sessions: Active prayer sessions
 * - meta: Response metadata
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Parse and validate audience segment
    const audienceParam = req.query.audience as string | undefined;
    const audienceSegment = parseAudienceSegment(audienceParam);
    
    // Execute all queries in parallel for maximum efficiency
    const [sparks, todaySpark, featured, reflection, sessions] = await Promise.all([
      getPublishedSparks(audienceSegment),
      getTodaySpark(audienceSegment),
      getFeaturedSparks(audienceSegment),
      getTodayReflection(audienceSegment),
      getActivePrayerSessions(),
    ]);
    
    const response: DashboardResponse = {
      sparks,
      todaySpark,
      featured,
      reflection,
      sessions,
      meta: {
        timestamp: new Date().toISOString(),
        audienceSegment,
        totalSparks: sparks.length,
      },
    };
    
    // Log performance metric
    const duration = Date.now() - startTime;
    console.log(JSON.stringify({
      level: 'info',
      message: 'Dashboard API request completed',
      duration_ms: duration,
      audience_segment: audienceSegment,
      sparks_count: sparks.length,
      timestamp: new Date().toISOString(),
    }));
    
    // Set cache headers for CDN/browser caching
    res.set({
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      'X-Response-Time': `${duration}ms`,
    });
    
    res.json(response);
  } catch (error) {
    const err = error as Error;
    console.error(JSON.stringify({
      level: 'error',
      message: 'Dashboard API error',
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    }));
    
    res.status(500).json({ 
      error: 'Failed to load dashboard data',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

/**
 * Helper: Get published sparks with optional audience filtering
 */
async function getPublishedSparks(audienceSegment: string | null): Promise<any[]> {
  // This would call your actual storage method
  // For now, showing the expected interface
  const allPublished = await storage.getPublishedSparks();
  
  if (!audienceSegment) {
    return allPublished;
  }
  
  // Return global sparks + segment-specific sparks
  return allPublished.filter(
    (s: any) => s.audienceSegment === null || s.audienceSegment === audienceSegment
  );
}

/**
 * Helper: Get today's spark with segment fallback logic
 */
async function getTodaySpark(audienceSegment: string | null): Promise<any | null> {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
  
  const todaySparks = await storage.getSparksByDailyDate(today);
  
  if (todaySparks.length === 0) {
    return null;
  }
  
  // If audience segment specified, look for segment-specific spark first
  if (audienceSegment) {
    const segmentSpark = todaySparks.find(
      (s: any) => s.audienceSegment === audienceSegment && s.status === 'published'
    );
    if (segmentSpark) {
      return segmentSpark;
    }
  }
  
  // Fall back to global spark
  return todaySparks.find(
    (s: any) => s.audienceSegment === null && s.status === 'published'
  ) || null;
}

/**
 * Helper: Get featured sparks
 */
async function getFeaturedSparks(audienceSegment: string | null): Promise<any[]> {
  const featured = await storage.getFeaturedSparks();
  
  if (!audienceSegment) {
    return featured;
  }
  
  // Filter to global + segment-specific
  return featured.filter(
    (s: any) => s.audienceSegment === null || s.audienceSegment === audienceSegment
  );
}

/**
 * Helper: Get today's reflection card
 */
async function getTodayReflection(audienceSegment: string | null): Promise<any | null> {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
  
  try {
    const reflection = await storage.getReflectionCardByDate(today);
    
    if (!reflection) {
      return null;
    }
    
    // If reflection has audience filtering, apply it
    if (audienceSegment && reflection.audienceSegment && 
        reflection.audienceSegment !== audienceSegment) {
      // Try to find a global reflection instead
      return await storage.getReflectionCardByDate(today, null);
    }
    
    return reflection;
  } catch {
    return null;
  }
}

/**
 * Helper: Get active prayer sessions
 */
async function getActivePrayerSessions(): Promise<any[]> {
  try {
    return await storage.getActivePrayerSessions();
  } catch {
    return [];
  }
}

export default router;

/**
 * Storage interface additions needed:
 * 
 * interface IStorage {
 *   getPublishedSparks(): Promise<Spark[]>;
 *   getSparksByDailyDate(date: string): Promise<Spark[]>;
 *   getFeaturedSparks(): Promise<Spark[]>;
 *   getReflectionCardByDate(date: string, audienceSegment?: string | null): Promise<ReflectionCard | null>;
 *   getActivePrayerSessions(): Promise<PrayerSession[]>;
 * }
 */
