import { storage } from '../server/storage';
import { generateSparkAudio, getSparkAudioUrl } from '../server/tts-service';

async function main() {
  const batchSize = parseInt(process.argv[2]) || 10;
  const startFrom = parseInt(process.argv[3]) || 0;
  
  console.log(`=== REGENERATING DOMINION AUDIO ===`);
  console.log(`Batch size: ${batchSize}, Starting from index: ${startFrom}`);
  
  const sparks = await storage.getAllDominionSparks();
  console.log(`Found ${sparks.length} total DOMINION sparks\n`);
  
  let generated = 0;
  let skipped = 0;
  let failed = 0;
  
  const endIndex = Math.min(startFrom + batchSize, sparks.length);
  
  for (let i = startFrom; i < endIndex; i++) {
    const spark = sparks[i];
    
    if (!spark.fullTeaching) {
      console.log(`[${i+1}/${sparks.length}] Spark ${spark.id} has no teaching, skipping`);
      skipped++;
      continue;
    }
    
    try {
      console.log(`[${i+1}/${sparks.length}] Generating: ${spark.title} (ID: ${spark.id})`);
      
      const result = await generateSparkAudio(spark.id, {
        title: spark.title,
        scriptureRef: spark.scriptureRef || undefined,
        fullPassage: spark.fullPassage || undefined,
        fullTeaching: spark.fullTeaching,
        reflectionQuestion: spark.reflectionQuestion || undefined,
        todayAction: spark.todayAction || undefined,
        prayerLine: spark.prayerLine || undefined,
        ctaPrimary: spark.ctaPrimary || undefined
      });
      
      if (result.success) {
        console.log(`  ✓ Success`);
        generated++;
      } else {
        console.log(`  ✗ Failed: ${result.error}`);
        failed++;
      }
      
      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 400));
      
    } catch (error: any) {
      console.log(`  ✗ Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n=== BATCH COMPLETE ===`);
  console.log(`Generated: ${generated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`\nProcessed indices ${startFrom} to ${endIndex - 1}`);
  
  if (endIndex < sparks.length) {
    console.log(`\nTo continue, run: npx tsx scripts/regenerate-all-audio.ts ${batchSize} ${endIndex}`);
  } else {
    console.log(`\n✓ All ${sparks.length} sparks processed!`);
  }
}

main().catch(console.error).finally(() => process.exit(0));
