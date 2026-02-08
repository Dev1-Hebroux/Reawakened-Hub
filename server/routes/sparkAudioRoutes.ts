/**
 * Spark Audio API Routes
 * 
 * Endpoints for retrieving and managing pre-generated spark audio.
 */

import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { sparkAudioService } from '../services/sparkAudioService';
import { logger } from '../lib/logger';
import { downloadAudio, audioExists, getPublicUrl } from '../supabaseStorage';
import { storage } from '../storage';
import { generateSparkAudio, getSparkAudioUrl } from '../tts-service';
import { verifyAndRepairUpcomingAudio } from '../audio-pregeneration';

const router = Router();

router.get('/audio/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    // Redirect to Supabase public URL
    const publicUrl = getPublicUrl(filename);
    if (!publicUrl) {
      return res.status(500).json({ error: 'Storage not configured' });
    }

    const exists = await audioExists(filename);
    if (!exists) {
      return res.status(404).json({ error: 'Audio file not found' });
    }

    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.redirect(publicUrl);
  } catch (error) {
    logger.error({ error }, 'Error serving audio file');
    res.status(500).json({ error: 'Failed to serve audio' });
  }
});

router.get('/sparks/:id/audio', async (req, res) => {
  try {
    const sparkId = parseInt(req.params.id, 10);
    
    if (isNaN(sparkId)) {
      return res.status(400).json({ error: 'Invalid spark ID' });
    }
    
    const audioUrl = await sparkAudioService.getAudioUrl(sparkId);
    
    if (audioUrl) {
      return res.json({ audioUrl, sparkId, cached: true });
    }
    
    // Fallback: check for legacy non-hashed audio file
    const legacyFilename = `spark-${sparkId}.mp3`;
    const legacyExists = await audioExists(legacyFilename);
    if (legacyExists) {
      return res.json({ audioUrl: `/api/audio/${legacyFilename}`, sparkId, cached: true });
    }

    // On-demand generation: try generating audio now rather than returning 404
    logger.warn({ sparkId }, 'Audio not pre-generated, attempting on-demand generation');

    const spark = await storage.getSpark(sparkId);
    if (spark?.fullTeaching) {
      const genResult = await generateSparkAudio(sparkId, {
        title: spark.title,
        scriptureRef: spark.scriptureRef || undefined,
        fullPassage: spark.fullPassage || undefined,
        fullTeaching: spark.fullTeaching,
        reflectionQuestion: spark.reflectionQuestion || undefined,
        todayAction: spark.todayAction || undefined,
        prayerLine: spark.prayerLine || undefined,
        ctaPrimary: spark.ctaPrimary || undefined,
        weekTheme: spark.weekTheme || undefined
      });

      if (genResult.success && genResult.audioUrl) {
        logger.info({ sparkId }, 'On-demand audio generation succeeded');
        return res.json({ audioUrl: genResult.audioUrl, sparkId, cached: false, generated: true });
      }

      logger.error({ sparkId, error: genResult.error }, 'On-demand audio generation failed');
    }

    // Truly no audio available
    return res.status(404).json({
      error: 'Audio not available',
      message: 'Audio for this spark could not be generated. Please try again later.',
    });
  } catch (error) {
    logger.error({ error }, 'Error getting spark audio');
    res.status(500).json({ error: 'Failed to get audio' });
  }
});

router.get('/admin/spark-audio/status', isAuthenticated, async (req: any, res) => {
  try {
    if (req.user?.claims?.metadata?.role !== 'super_admin' && req.user?.claims?.metadata?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const status = await sparkAudioService.getStatus();
    res.json(status);
  } catch (error) {
    logger.error({ error }, 'Error getting audio status');
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// TEMPORARY: One-time initial audio generation endpoint (remove after first use)
// Use GET with simple token to avoid CSRF issues
router.get('/spark-audio/bootstrap', async (req, res) => {
  try {
    // Simple auth check using environment variable
    const token = req.query.token;
    const expectedToken = process.env.BOOTSTRAP_TOKEN || 'reawakened-2026-bootstrap';

    if (token !== expectedToken) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    logger.info('Bootstrap audio generation requested');

    res.json({ message: 'Audio generation started in background', status: 'processing' });

    // Run in background
    import('../audio-pregeneration.js').then(({ pregenerateUpcomingAudio }) => {
      pregenerateUpcomingAudio(7)
        .then(() => logger.info('Bootstrap audio generation complete'))
        .catch(error => logger.error({ error }, 'Bootstrap audio generation failed'));
    });
  } catch (error) {
    logger.error({ error }, 'Error starting bootstrap generation');
    res.status(500).json({ error: 'Failed to start generation' });
  }
});

router.post('/admin/spark-audio/generate-all', isAuthenticated, async (req: any, res) => {
  try {
    if (req.user?.claims?.metadata?.role !== 'super_admin' && req.user?.claims?.metadata?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { force = false, concurrency = 3 } = req.body;
    
    logger.info({ userId: req.user?.claims?.sub, force, concurrency }, 'Admin triggered batch audio generation');
    
    res.json({ message: 'Audio generation started', status: 'processing' });
    
    sparkAudioService.generateAll({ force, concurrency })
      .then(report => {
        logger.info({ report }, 'Batch audio generation complete');
      })
      .catch(error => {
        logger.error({ error }, 'Batch audio generation failed');
      });
  } catch (error) {
    logger.error({ error }, 'Error starting audio generation');
    res.status(500).json({ error: 'Failed to start generation' });
  }
});

router.post('/admin/spark-audio/generate/:id', isAuthenticated, async (req: any, res) => {
  try {
    if (req.user?.claims?.metadata?.role !== 'super_admin' && req.user?.claims?.metadata?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const sparkId = parseInt(req.params.id, 10);
    const { force = false } = req.body;
    
    if (isNaN(sparkId)) {
      return res.status(400).json({ error: 'Invalid spark ID' });
    }
    
    logger.info({ userId: req.user?.claims?.sub, sparkId, force }, 'Admin triggered single spark audio generation');
    
    const result = await sparkAudioService.generateForSpark(sparkId, { force });
    
    if (result.success) {
      res.json({ message: 'Audio generated successfully', ...result });
    } else {
      res.status(500).json({ message: 'Audio generation failed', ...result });
    }
  } catch (error) {
    logger.error({ error }, 'Error generating spark audio');
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

router.post('/admin/spark-audio/regenerate-outdated', isAuthenticated, async (req: any, res) => {
  try {
    if (req.user?.claims?.metadata?.role !== 'super_admin' && req.user?.claims?.metadata?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    logger.info({ userId: req.user?.claims?.sub }, 'Admin triggered outdated audio regeneration');
    
    const results = await sparkAudioService.regenerateOutdated();
    
    res.json({
      message: 'Outdated audio regeneration complete',
      regenerated: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error) {
    logger.error({ error }, 'Error regenerating outdated audio');
    res.status(500).json({ error: 'Failed to regenerate audio' });
  }
});

router.post('/admin/spark-audio/verify', isAuthenticated, async (req: any, res) => {
  try {
    if (req.user?.claims?.metadata?.role !== 'super_admin' && req.user?.claims?.metadata?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    logger.info({ userId: req.user?.claims?.sub }, 'Admin triggered audio verification');

    const result = await verifyAndRepairUpcomingAudio(3);

    res.json({
      message: 'Audio verification complete',
      ...result,
    });
  } catch (error) {
    logger.error({ error }, 'Error running audio verification');
    res.status(500).json({ error: 'Failed to run verification' });
  }
});

router.delete('/admin/spark-audio/all', isAuthenticated, async (req: any, res) => {
  try {
    if (req.user?.claims?.metadata?.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    
    const { confirm } = req.body;
    
    if (confirm !== 'DELETE_ALL_AUDIO') {
      return res.status(400).json({
        error: 'Confirmation required',
        message: 'Set confirm to "DELETE_ALL_AUDIO" to proceed',
      });
    }
    
    logger.warn({ userId: req.user?.claims?.sub }, 'Admin deleting all spark audio');
    
    const result = await sparkAudioService.deleteAllAudio();
    
    res.json({ message: 'All audio files deleted', ...result });
  } catch (error) {
    logger.error({ error }, 'Error deleting all audio');
    res.status(500).json({ error: 'Failed to delete audio' });
  }
});

export default router;
