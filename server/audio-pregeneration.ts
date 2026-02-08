import { storage } from "./storage";
import { generateSparkAudio, getSparkAudioUrl } from "./tts-service";

export async function pregenerateUpcomingAudio(daysAhead: number = 7): Promise<void> {
  if (!process.env.SUPABASE_URL) {
    console.log("[Audio Pre-generation] Skipping - Supabase storage not configured");
    return;
  }

  console.log(`[Audio Pre-generation] Starting pre-generation for next ${daysAhead} days...`);

  try {
    const now = new Date();
    const londonNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/London" }));
    const todayStr = londonNow.toISOString().split('T')[0];

    const endDate = new Date(londonNow);
    endDate.setDate(endDate.getDate() + daysAhead);
    const endStr = endDate.toISOString().split('T')[0];

    console.log(`[Audio Pre-generation] Looking for sparks from ${todayStr} to ${endStr}`);

    const sparks = await storage.getSparksByDateRange(todayStr, endStr);

    if (sparks.length === 0) {
      console.log("[Audio Pre-generation] No sparks found for upcoming dates");
      return;
    }

    console.log(`[Audio Pre-generation] Found ${sparks.length} sparks to process`);

    let generated = 0;
    let skipped = 0;
    let failed = 0;

    for (const spark of sparks) {
      try {
        const existingUrl = await getSparkAudioUrl(spark.id);

        if (existingUrl) {
          skipped++;
          continue;
        }

        if (!spark.fullTeaching) {
          skipped++;
          continue;
        }

        console.log(`[Audio Pre-generation] Generating audio for spark ${spark.id}: ${spark.title} (${spark.dailyDate})`);

        const result = await generateSparkAudio(spark.id, {
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

        if (result.success) {
          console.log(`[Audio Pre-generation] Successfully generated audio for spark ${spark.id}`);
          generated++;
        } else {
          console.error(`[Audio Pre-generation] Failed to generate audio for spark ${spark.id}: ${result.error}`);
          failed++;
        }

        // Throttle API calls
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`[Audio Pre-generation] Error processing spark ${spark.id}:`, error);
        failed++;
      }
    }

    console.log(`[Audio Pre-generation] Complete: ${generated} generated, ${skipped} skipped (already have audio), ${failed} failed`);

  } catch (error) {
    console.error("[Audio Pre-generation] Job failed:", error);
  }
}

export interface BulkAudioGenerationResult {
  total: number;
  generated: number;
  skipped: number;
  failed: number;
  errors: string[];
  generatedIds: number[];
}

// Track which sparks have been regenerated in this session (for batch regeneration)
const regeneratedSparkIds = new Set<number>();

// Generate audio for a limited batch of sparks (for incremental generation)
// Set forceRegenerate=true to regenerate audio even if it already exists
export async function generateAudioBatch(limit: number = 10, forceRegenerate: boolean = false): Promise<BulkAudioGenerationResult> {
  const result: BulkAudioGenerationResult = {
    total: 0,
    generated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    generatedIds: []
  };

  if (!process.env.SUPABASE_URL) {
    result.errors.push("Supabase storage not configured");
    return result;
  }

  console.log(`[Batch Audio] Starting batch generation (limit: ${limit}, forceRegenerate: ${forceRegenerate})...`);

  try {
    const sparks = await storage.getAllDominionSparks();
    result.total = sparks.length;
    
    console.log(`[Batch Audio] Found ${sparks.length} total DOMINION sparks`);

    let generatedCount = 0;

    for (const spark of sparks) {
      if (generatedCount >= limit) {
        console.log(`[Batch Audio] Reached batch limit of ${limit}`);
        break;
      }
      
      try {
        const existingUrl = await getSparkAudioUrl(spark.id);
        
        if (existingUrl && !forceRegenerate) {
          result.skipped++;
          continue;
        }
        
        // Skip if already regenerated in this session
        if (forceRegenerate && regeneratedSparkIds.has(spark.id)) {
          result.skipped++;
          continue;
        }
        
        if (!spark.fullTeaching) {
          console.log(`[Batch Audio] Spark ${spark.id} has no teaching content, skipping`);
          result.skipped++;
          continue;
        }
        
        console.log(`[Batch Audio] Generating audio for spark ${spark.id}: ${spark.title}`);
        
        const genResult = await generateSparkAudio(spark.id, {
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

        if (genResult.success) {
          console.log(`[Batch Audio] Successfully generated audio for spark ${spark.id}`);
          result.generated++;
          result.generatedIds.push(spark.id);
          regeneratedSparkIds.add(spark.id); // Track for batch regeneration
          generatedCount++;
        } else {
          console.error(`[Batch Audio] Failed to generate audio for spark ${spark.id}: ${genResult.error}`);
          result.failed++;
          result.errors.push(`Spark ${spark.id}: ${genResult.error}`);
        }
        
        // Small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error: any) {
        console.error(`[Batch Audio] Error processing spark ${spark.id}:`, error);
        result.failed++;
        result.errors.push(`Spark ${spark.id}: ${error.message}`);
      }
    }
    
    console.log(`[Batch Audio] Complete: ${result.generated} generated, ${result.skipped} skipped (already have audio), ${result.failed} failed`);
    
  } catch (error: any) {
    console.error("[Batch Audio] Job failed:", error);
    result.errors.push(`Job failed: ${error.message}`);
  }

  return result;
}

export async function pregenerateAllDominionAudio(batchSize: number = 10): Promise<BulkAudioGenerationResult> {
  const result: BulkAudioGenerationResult = {
    total: 0,
    generated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    generatedIds: []
  };

  if (!process.env.SUPABASE_URL) {
    result.errors.push("Supabase storage not configured");
    return result;
  }

  console.log(`[Bulk Audio] Starting bulk generation for all DOMINION sparks (batch size: ${batchSize})...`);

  try {
    const sparks = await storage.getAllDominionSparks();
    result.total = sparks.length;
    
    console.log(`[Bulk Audio] Found ${sparks.length} DOMINION sparks to process`);

    let batchCount = 0;
    let processedInBatch = 0;

    for (let i = 0; i < sparks.length; i++) {
      const spark = sparks[i];
      
      try {
        const existingUrl = await getSparkAudioUrl(spark.id);
        
        if (existingUrl) {
          result.skipped++;
          continue;
        }
        
        if (!spark.fullTeaching) {
          console.log(`[Bulk Audio] Spark ${spark.id} has no teaching content, skipping`);
          result.skipped++;
          continue;
        }
        
        console.log(`[Bulk Audio] Generating audio for spark ${spark.id}: ${spark.title}`);
        
        const genResult = await generateSparkAudio(spark.id, {
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

        if (genResult.success) {
          console.log(`[Bulk Audio] Successfully generated audio for spark ${spark.id}`);
          result.generated++;
          processedInBatch++;
        } else {
          console.error(`[Bulk Audio] Failed to generate audio for spark ${spark.id}: ${genResult.error}`);
          result.failed++;
          result.errors.push(`Spark ${spark.id}: ${genResult.error}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (processedInBatch >= batchSize) {
          batchCount++;
          console.log(`[Bulk Audio] Batch ${batchCount} complete (${result.generated} generated so far). Pausing 5 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          processedInBatch = 0;
        }
        
      } catch (error: any) {
        console.error(`[Bulk Audio] Error processing spark ${spark.id}:`, error);
        result.failed++;
        result.errors.push(`Spark ${spark.id}: ${error.message}`);
      }
    }
    
    console.log(`[Bulk Audio] Complete: ${result.generated} generated, ${result.skipped} skipped, ${result.failed} failed`);
    
  } catch (error: any) {
    console.error("[Bulk Audio] Job failed:", error);
    result.errors.push(`Job failed: ${error.message}`);
  }

  return result;
}

export interface AudioVerificationResult {
  checked: number;
  ready: number;
  missing: number;
  repaired: number;
  failedRepairs: string[];
}

/**
 * Verify that upcoming sparks (today + tomorrow) have audio ready.
 * Any missing audio is regenerated with up to maxRetries attempts.
 */
export async function verifyAndRepairUpcomingAudio(maxRetries: number = 3): Promise<AudioVerificationResult> {
  const result: AudioVerificationResult = {
    checked: 0,
    ready: 0,
    missing: 0,
    repaired: 0,
    failedRepairs: [],
  };

  if (!process.env.SUPABASE_URL) {
    console.log("[Audio Verify] Skipping - Supabase storage not configured");
    return result;
  }

  console.log("[Audio Verify] Starting verification of today's and tomorrow's audio...");

  try {
    const now = new Date();
    const londonNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/London" }));
    const todayStr = londonNow.toISOString().split('T')[0];

    const tomorrow = new Date(londonNow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const sparks = await storage.getSparksByDateRange(todayStr, tomorrowStr);

    if (sparks.length === 0) {
      console.log("[Audio Verify] No sparks found for today/tomorrow");
      return result;
    }

    console.log(`[Audio Verify] Checking ${sparks.length} sparks (${todayStr} to ${tomorrowStr})`);

    for (const spark of sparks) {
      result.checked++;

      if (!spark.fullTeaching) {
        console.log(`[Audio Verify] Spark ${spark.id} has no teaching content, skipping`);
        continue;
      }

      const existingUrl = await getSparkAudioUrl(spark.id);

      if (existingUrl) {
        result.ready++;
        continue;
      }

      // Audio is missing — attempt repair with retries
      result.missing++;
      console.warn(`[Audio Verify] MISSING audio for spark ${spark.id}: "${spark.title}" (${spark.dailyDate})`);

      let repaired = false;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`[Audio Verify] Retry ${attempt}/${maxRetries} for spark ${spark.id}...`);

        try {
          const genResult = await generateSparkAudio(spark.id, {
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

          if (genResult.success) {
            console.log(`[Audio Verify] Repaired audio for spark ${spark.id} on attempt ${attempt}`);
            result.repaired++;
            repaired = true;
            break;
          }

          console.error(`[Audio Verify] Attempt ${attempt} failed for spark ${spark.id}: ${genResult.error}`);
        } catch (error: any) {
          console.error(`[Audio Verify] Attempt ${attempt} threw error for spark ${spark.id}:`, error.message);
        }

        // Exponential backoff: 2s, 4s, 8s
        if (attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          console.log(`[Audio Verify] Waiting ${backoffMs / 1000}s before next retry...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }

      if (!repaired) {
        const msg = `Spark ${spark.id} "${spark.title}" (${spark.dailyDate}) - failed after ${maxRetries} retries`;
        result.failedRepairs.push(msg);
        console.error(`[Audio Verify] CRITICAL: ${msg}`);
      }
    }

    console.log(`[Audio Verify] Complete: ${result.checked} checked, ${result.ready} ready, ${result.missing} missing, ${result.repaired} repaired, ${result.failedRepairs.length} still failing`);

  } catch (error) {
    console.error("[Audio Verify] Verification job failed:", error);
  }

  return result;
}

export function scheduleAudioPregeneration(): void {
  // Generate audio for next 7 days on startup
  pregenerateUpcomingAudio(7).catch(console.error);

  // Schedule pre-generation at 23:30 London time
  scheduleLondonTime(23, 30, () => {
    pregenerateUpcomingAudio(7).catch(console.error);
  }, "pre-generation");

  // Schedule verification at 21:00 London time (3 hours before midnight for retries)
  scheduleLondonTime(21, 0, () => {
    verifyAndRepairUpcomingAudio(3).catch(console.error);
  }, "verification");
}

function scheduleLondonTime(hour: number, minute: number, task: () => void, label: string): void {
  const now = new Date();
  const londonOffset = getLondonOffset(now);
  const nextRun = new Date();
  nextRun.setUTCHours(hour - Math.floor(londonOffset / 60), minute - (londonOffset % 60), 0, 0);

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  const msUntil = nextRun.getTime() - now.getTime();
  console.log(`[Audio Scheduler] ${label} scheduled at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} London time in ${Math.round(msUntil / 1000 / 60)} minutes`);

  setTimeout(() => {
    task();
    setInterval(task, 24 * 60 * 60 * 1000);
  }, msUntil);
}

// Helper to get London timezone offset in minutes
function getLondonOffset(date: Date): number {
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);
  const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  const isDST = date.getTimezoneOffset() < stdOffset;
  return isDST ? -60 : 0; // BST is UTC+1, GMT is UTC+0
}
