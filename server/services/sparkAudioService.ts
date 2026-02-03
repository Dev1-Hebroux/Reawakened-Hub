/**
 * Spark Audio Pre-Generation Service
 * 
 * Handles batch generation and management of spark devotional audio files.
 * Uses content hashing to ensure audio matches content.
 */

import OpenAI from 'openai';
import { db } from '../db';
import { sparks } from '@shared/schema';
import { eq, sql, isNotNull } from 'drizzle-orm';
import { createHash } from 'crypto';
import { logger } from '../lib/logger';
import { objectStorageClient } from '../replit_integrations/object_storage';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TTS_CONFIG = {
  model: 'tts-1-hd' as const,
  speed: 0.95,
};

type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

const VOICE_OPTIONS: { voice: TTSVoice; accent: string; gender: string }[] = [
  { voice: 'onyx', accent: 'US', gender: 'male' },    // Deep male voice
  { voice: 'nova', accent: 'US', gender: 'female' },  // Warm female voice
];

function selectVoiceForSpark(sparkId: number): TTSVoice {
  const index = sparkId % VOICE_OPTIONS.length;
  return VOICE_OPTIONS[index].voice;
}

const AUDIO_STORAGE_PREFIX = 'public/audio';

interface SparkContent {
  id: number;
  title: string;
  scriptureRef: string | null;
  fullPassage: string | null;
  fullTeaching: string | null;
  reflectionQuestion: string | null;
  todayAction: string | null;
  prayerLine: string | null;
}

interface AudioMetadata {
  sparkId: number;
  contentHash: string;
  generatedAt: string;
  fileSize: number;
  storagePath: string;
  publicUrl: string;
}

interface GenerationResult {
  success: boolean;
  sparkId: number;
  error?: string;
  metadata?: AudioMetadata;
}

interface BatchGenerationReport {
  startedAt: string;
  completedAt: string;
  totalSparks: number;
  successful: number;
  failed: number;
  skipped: number;
  results: GenerationResult[];
}

interface SparkStatus {
  id: number;
  title: string;
  status: 'generated' | 'pending' | 'outdated';
  audioUrl?: string;
  generatedAt?: string;
  contentHash?: string;
}

interface StatusReport {
  total: number;
  generated: number;
  pending: number;
  outdated: number;
  sparks: SparkStatus[];
}

function generateContentHash(spark: SparkContent): string {
  const contentString = [
    spark.title,
    spark.scriptureRef || '',
    spark.fullPassage || '',
    spark.fullTeaching || '',
    spark.reflectionQuestion || '',
    spark.todayAction || '',
    spark.prayerLine || '',
  ].join('|||');
  
  return createHash('sha256').update(contentString).digest('hex').substring(0, 16);
}

function composeNarrationScript(spark: SparkContent): string {
  const sections: string[] = [];
  
  sections.push(`Today's devotional: ${spark.title}.`);
  sections.push('');
  
  if (spark.scriptureRef && spark.fullPassage) {
    sections.push(`Today's scripture reading is from ${spark.scriptureRef}.`);
    sections.push('');
    sections.push(spark.fullPassage);
    sections.push('');
    sections.push('');
  }
  
  if (spark.fullTeaching) {
    sections.push(spark.fullTeaching);
    sections.push('');
  }
  
  if (spark.reflectionQuestion) {
    sections.push('Take a moment to reflect.');
    sections.push('');
    sections.push(spark.reflectionQuestion);
    sections.push('');
  }
  
  if (spark.todayAction) {
    sections.push('Here is your action step for today.');
    sections.push('');
    sections.push(spark.todayAction);
    sections.push('');
  }
  
  if (spark.prayerLine) {
    sections.push("Let's close in prayer.");
    sections.push('');
    sections.push(spark.prayerLine);
  }
  
  sections.push('');
  sections.push('Amen. May this spark ignite your faith today.');
  
  return sections.join('\n');
}

async function generateTTSAudio(text: string, sparkId: number): Promise<Buffer> {
  const voice = selectVoiceForSpark(sparkId);
  logger.info({ sparkId, voice }, 'Using voice for TTS generation');
  
  const response = await openai.audio.speech.create({
    model: TTS_CONFIG.model,
    voice,
    speed: TTS_CONFIG.speed,
    input: text,
  });
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function getAudioStoragePath(sparkId: number, contentHash: string): string {
  return `${AUDIO_STORAGE_PREFIX}/spark-${sparkId}-${contentHash}.mp3`;
}

function getLegacyAudioPath(sparkId: number): string {
  return `${AUDIO_STORAGE_PREFIX}/spark-${sparkId}.mp3`;
}

async function fetchAllSparks(): Promise<SparkContent[]> {
  const results = await db
    .select({
      id: sparks.id,
      title: sparks.title,
      scriptureRef: sparks.scriptureRef,
      fullPassage: sparks.fullPassage,
      fullTeaching: sparks.fullTeaching,
      reflectionQuestion: sparks.reflectionQuestion,
      todayAction: sparks.todayAction,
      prayerLine: sparks.prayerLine,
    })
    .from(sparks)
    .orderBy(sparks.id);
  
  return results;
}

async function fetchSparkById(sparkId: number): Promise<SparkContent | null> {
  const [result] = await db
    .select({
      id: sparks.id,
      title: sparks.title,
      scriptureRef: sparks.scriptureRef,
      fullPassage: sparks.fullPassage,
      fullTeaching: sparks.fullTeaching,
      reflectionQuestion: sparks.reflectionQuestion,
      todayAction: sparks.todayAction,
      prayerLine: sparks.prayerLine,
    })
    .from(sparks)
    .where(eq(sparks.id, sparkId))
    .limit(1);
  
  return result || null;
}

async function getStoredAudioMetadata(sparkId: number): Promise<AudioMetadata | null> {
  const [result] = await db
    .select({
      audioMetadata: sparks.audioMetadata,
    })
    .from(sparks)
    .where(eq(sparks.id, sparkId))
    .limit(1);
  
  if (!result?.audioMetadata) return null;
  return result.audioMetadata as AudioMetadata;
}

async function saveAudioMetadata(sparkId: number, metadata: AudioMetadata): Promise<void> {
  await db
    .update(sparks)
    .set({ 
      audioMetadata: metadata,
      narrationAudioUrl: metadata.publicUrl,
    })
    .where(eq(sparks.id, sparkId));
}

async function clearAudioMetadata(sparkId: number): Promise<void> {
  await db
    .update(sparks)
    .set({ 
      audioMetadata: null,
      narrationAudioUrl: null,
    })
    .where(eq(sparks.id, sparkId));
}

export class SparkAudioService {
  private bucketId: string;
  
  constructor() {
    this.bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || '';
  }
  
  async getAudioUrl(sparkId: number): Promise<string | null> {
    const metadata = await getStoredAudioMetadata(sparkId);
    if (!metadata) return null;
    return metadata.publicUrl;
  }

  async generateForSpark(
    sparkId: number, 
    options: { force?: boolean } = {}
  ): Promise<GenerationResult> {
    try {
      const spark = await fetchSparkById(sparkId);
      
      if (!spark) {
        return { success: false, sparkId, error: 'Spark not found' };
      }
      
      if (!spark.fullTeaching) {
        return { success: false, sparkId, error: 'Spark has no teaching content' };
      }
      
      const contentHash = generateContentHash(spark);
      const storagePath = getAudioStoragePath(sparkId, contentHash);
      
      if (!options.force) {
        const existingMetadata = await getStoredAudioMetadata(sparkId);
        
        if (existingMetadata && existingMetadata.contentHash === contentHash) {
          logger.info({ sparkId, contentHash }, 'Audio already exists and is current');
          return { success: true, sparkId, metadata: existingMetadata };
        }
      }
      
      logger.info({ sparkId, contentHash }, 'Generating new audio');
      
      const script = composeNarrationScript(spark);
      const audioBuffer = await generateTTSAudio(script, sparkId);
      
      if (!this.bucketId) {
        return { success: false, sparkId, error: 'Object storage not configured' };
      }
      
      const bucket = objectStorageClient.bucket(this.bucketId);
      const file = bucket.file(storagePath);
      
      await file.save(audioBuffer, {
        metadata: {
          contentType: 'audio/mpeg',
          metadata: {
            'custom:aclPolicy': JSON.stringify({
              owner: 'system',
              visibility: 'public',
            }),
          },
        },
      });
      
      const publicUrl = `/api/audio/spark-${sparkId}-${contentHash}.mp3`;
      
      const metadata: AudioMetadata = {
        sparkId,
        contentHash,
        generatedAt: new Date().toISOString(),
        fileSize: audioBuffer.length,
        storagePath,
        publicUrl,
      };
      
      await saveAudioMetadata(sparkId, metadata);
      
      // Delete legacy file if exists
      try {
        const legacyPath = getLegacyAudioPath(sparkId);
        const legacyFile = bucket.file(legacyPath);
        const [exists] = await legacyFile.exists();
        if (exists) {
          await legacyFile.delete();
          logger.info({ sparkId, legacyPath }, 'Deleted legacy audio file');
        }
      } catch (e) {
        // Ignore errors when deleting legacy files
      }
      
      logger.info({ sparkId, contentHash, size: audioBuffer.length }, 'Audio generated successfully');
      
      return { success: true, sparkId, metadata };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ sparkId, error: errorMessage }, 'Failed to generate audio');
      return { success: false, sparkId, error: errorMessage };
    }
  }

  async generateAll(options: { 
    force?: boolean;
    concurrency?: number;
  } = {}): Promise<BatchGenerationReport> {
    const { force = false, concurrency = 3 } = options;
    const startedAt = new Date().toISOString();
    
    logger.info({ force, concurrency }, 'Starting batch audio generation');
    
    const allSparks = await fetchAllSparks();
    const results: GenerationResult[] = [];
    let successful = 0;
    let failed = 0;
    let skipped = 0;
    
    for (let i = 0; i < allSparks.length; i += concurrency) {
      const batch = allSparks.slice(i, i + concurrency);
      
      const batchResults = await Promise.all(
        batch.map(spark => this.generateForSpark(spark.id, { force }))
      );
      
      for (const result of batchResults) {
        results.push(result);
        
        if (result.success) {
          if (result.metadata?.generatedAt.startsWith(startedAt.substring(0, 10))) {
            successful++;
          } else {
            skipped++;
          }
        } else {
          failed++;
        }
      }
      
      logger.info({ progress: Math.min(i + concurrency, allSparks.length), total: allSparks.length }, 'Generation progress');
    }
    
    const completedAt = new Date().toISOString();
    
    return {
      startedAt,
      completedAt,
      totalSparks: allSparks.length,
      successful,
      failed,
      skipped,
      results,
    };
  }

  async getStatus(): Promise<StatusReport> {
    const allSparks = await fetchAllSparks();
    const sparkStatuses: SparkStatus[] = [];
    let generated = 0;
    let pending = 0;
    let outdated = 0;
    
    for (const spark of allSparks) {
      const metadata = await getStoredAudioMetadata(spark.id);
      const currentHash = generateContentHash(spark);
      
      let status: 'generated' | 'pending' | 'outdated';
      
      if (!metadata) {
        status = 'pending';
        pending++;
      } else if (metadata.contentHash !== currentHash) {
        status = 'outdated';
        outdated++;
      } else {
        status = 'generated';
        generated++;
      }
      
      sparkStatuses.push({
        id: spark.id,
        title: spark.title,
        status,
        audioUrl: metadata?.publicUrl,
        generatedAt: metadata?.generatedAt,
        contentHash: metadata?.contentHash,
      });
    }
    
    return {
      total: allSparks.length,
      generated,
      pending,
      outdated,
      sparks: sparkStatuses,
    };
  }

  async regenerateOutdated(): Promise<GenerationResult[]> {
    const status = await this.getStatus();
    const outdatedSparks = status.sparks.filter(s => s.status === 'outdated');
    
    const results: GenerationResult[] = [];
    
    for (const spark of outdatedSparks) {
      const result = await this.generateForSpark(spark.id, { force: true });
      results.push(result);
    }
    
    return results;
  }

  async deleteAllAudio(): Promise<{ deleted: number; errors: string[] }> {
    const allSparks = await fetchAllSparks();
    let deleted = 0;
    const errors: string[] = [];
    
    if (!this.bucketId) {
      return { deleted: 0, errors: ['Object storage not configured'] };
    }
    
    const bucket = objectStorageClient.bucket(this.bucketId);
    
    for (const spark of allSparks) {
      try {
        const metadata = await getStoredAudioMetadata(spark.id);
        
        if (metadata?.storagePath) {
          const file = bucket.file(metadata.storagePath);
          const [exists] = await file.exists();
          if (exists) {
            await file.delete();
            deleted++;
          }
        }
        
        // Also try legacy path
        const legacyPath = getLegacyAudioPath(spark.id);
        const legacyFile = bucket.file(legacyPath);
        const [legacyExists] = await legacyFile.exists();
        if (legacyExists) {
          await legacyFile.delete();
          deleted++;
        }
        
        await clearAudioMetadata(spark.id);
      } catch (error) {
        errors.push(`Spark ${spark.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    logger.info({ deleted, errors: errors.length }, 'Deleted all spark audio');
    
    return { deleted, errors };
  }
}

export const sparkAudioService = new SparkAudioService();
