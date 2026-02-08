#!/usr/bin/env node

/**
 * Quick audio generation script for immediate testing
 * Generates audio for today's and tomorrow's sparks
 */

import { pregenerateUpcomingAudio } from './server/audio-pregeneration.js';

console.log('🎵 Starting immediate audio generation for upcoming sparks...\n');

try {
  await pregenerateUpcomingAudio(2); // Generate for today + tomorrow
  console.log('\n✅ Audio generation complete!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Audio generation failed:', error);
  process.exit(1);
}
