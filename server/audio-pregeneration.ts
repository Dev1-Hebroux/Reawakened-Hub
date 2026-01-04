import { storage } from "./storage";
import { generateSparkAudio, getSparkAudioUrl } from "./tts-service";

export async function pregenerateTomorrowsAudio(): Promise<void> {
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
        
        const result = await generateSparkAudio(spark.id, spark.fullTeaching);
        
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
