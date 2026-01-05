import { generateAudioBatch } from '../server/audio-pregeneration';

async function main() {
  const limit = parseInt(process.argv[2]) || 10;
  const forceRegenerate = process.argv[3] === '--force' || process.argv[3] === 'true';
  
  console.log(`Starting batch audio generation with limit: ${limit}, forceRegenerate: ${forceRegenerate}...`);
  
  const result = await generateAudioBatch(limit, forceRegenerate);
  
  console.log('\n=== BATCH AUDIO GENERATION COMPLETE ===');
  console.log(`Total DOMINION sparks: ${result.total}`);
  console.log(`Generated this batch: ${result.generated}`);
  console.log(`Skipped (already have audio): ${result.skipped}`);
  console.log(`Failed: ${result.failed}`);
  
  if (result.generatedIds.length > 0) {
    console.log(`\nGenerated audio for spark IDs: ${result.generatedIds.join(', ')}`);
  }
  
  if (result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach(err => console.log(`  - ${err}`));
  }
  
  const remaining = result.total - result.skipped - result.generated - result.failed;
  console.log(`\nRemaining without audio: ~${Math.max(0, remaining)}`);
}

main().catch(console.error).finally(() => process.exit(0));
