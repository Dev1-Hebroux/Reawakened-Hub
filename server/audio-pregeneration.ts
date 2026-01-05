import { storage } from "./storage";
import { generateSparkAudio, getSparkAudioUrl } from "./tts-service";

export async function pregenerateTomorrowsAudio(): Promise<void> {
  if (!process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID) {
    console.log("[Audio Pre-generation] Skipping - object storage not configured");
    return;
  }
  
  console.log("[Audio Pre-generation] Starting pre-generation job...");
  
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log(`[Audio Pre-generation] Looking for sparks with daily_date = ${tomorrowStr}`);
    
    const sparks = await storage.getSparksByDailyDate(tomorrowStr);
    
    if (sparks.length === 0) {
      console.log("[Audio Pre-generation] No sparks scheduled for tomorrow");
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
          console.log(`[Audio Pre-generation] Spark ${spark.id} already has audio, skipping`);
          skipped++;
          continue;
        }
        
        if (!spark.fullTeaching) {
          console.log(`[Audio Pre-generation] Spark ${spark.id} has no teaching content, skipping`);
          skipped++;
          continue;
        }
        
        console.log(`[Audio Pre-generation] Generating audio for spark ${spark.id}: ${spark.title}`);
        
        const result = await generateSparkAudio(spark.id, {
          title: spark.title,
          scriptureRef: spark.scriptureRef || undefined,
          fullPassage: spark.fullPassage || undefined,
          fullTeaching: spark.fullTeaching,
          prayerLine: spark.prayerLine || undefined
        });
        
        if (result.success) {
          console.log(`[Audio Pre-generation] Successfully generated audio for spark ${spark.id}`);
          generated++;
        } else {
          console.error(`[Audio Pre-generation] Failed to generate audio for spark ${spark.id}: ${result.error}`);
          failed++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`[Audio Pre-generation] Error processing spark ${spark.id}:`, error);
        failed++;
      }
    }
    
    console.log(`[Audio Pre-generation] Complete: ${generated} generated, ${skipped} skipped, ${failed} failed`);
    
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
}

export async function pregenerateAllDominionAudio(batchSize: number = 10): Promise<BulkAudioGenerationResult> {
  const result: BulkAudioGenerationResult = {
    total: 0,
    generated: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };

  if (!process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID) {
    result.errors.push("Object storage not configured");
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
          prayerLine: spark.prayerLine || undefined
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

export function scheduleAudioPregeneration(): void {
  pregenerateTomorrowsAudio().catch(console.error);
  
  const runAt5AM = () => {
    const now = new Date();
    const next5AM = new Date();
    next5AM.setHours(5, 0, 0, 0);
    
    if (next5AM <= now) {
      next5AM.setDate(next5AM.getDate() + 1);
    }
    
    const msUntil5AM = next5AM.getTime() - now.getTime();
    
    console.log(`[Audio Pre-generation] Scheduled next run in ${Math.round(msUntil5AM / 1000 / 60)} minutes`);
    
    setTimeout(() => {
      pregenerateTomorrowsAudio().catch(console.error);
      setInterval(() => {
        pregenerateTomorrowsAudio().catch(console.error);
      }, 24 * 60 * 60 * 1000);
    }, msUntil5AM);
  };
  
  runAt5AM();
}
