/**
 * Spark Audio API Routes
 * 
 * Endpoints for retrieving and managing pre-generated spark audio.
 */

import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { sparkAudioService } from '../services/sparkAudioService';
import { logger } from '../lib/logger';
import { objectStorageClient } from '../replit_integrations/object_storage';

const router = Router();

router.get('/audio/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    
    if (!bucketId) {
      return res.status(500).json({ error: 'Object storage not configured' });
    }
    
    const bucket = objectStorageClient.bucket(bucketId);
    const file = bucket.file(`public/audio/${filename}`);
    
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: 'Audio file not found' });
    }
    
    const [metadata] = await file.getMetadata();
    const fileSize = metadata.size;
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', fileSize || 0);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Accept-Ranges', 'bytes');
    
    const stream = file.createReadStream();
    stream.pipe(res);
  } catch (error) {
    logger.error({ error }, 'Error streaming audio file');
    res.status(500).json({ error: 'Failed to stream audio' });
  }
});

router.get('/sparks/:id/audio', async (req, res) => {
  try {
    const sparkId = parseInt(req.params.id, 10);
    
    if (isNaN(sparkId)) {
      return res.status(400).json({ error: 'Invalid spark ID' });
    }
    
    const audioUrl = await sparkAudioService.getAudioUrl(sparkId);
    
    if (!audioUrl) {
      return res.status(404).json({ 
        error: 'Audio not available',
        message: 'Audio for this spark has not been generated yet.',
      });
    }
    
    res.json({ audioUrl, sparkId });
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
