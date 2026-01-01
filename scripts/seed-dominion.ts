import { db } from '../server/db';
import { sparks, reflectionCards } from '../shared/schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sparksGlobalPath = path.join(__dirname, '../attached_assets/sparks_db_import_2026-01-19_to_2026-02-17_1767289894415.json');
const sparksSegmentedPath = path.join(__dirname, '../attached_assets/sparks_segmented_db_import_2026-01-19_to_2026-02-17_1767290599311.json');
const reflectionsGlobalPath = path.join(__dirname, '../attached_assets/reflection_cards_db_import_2026-01-19_to_2026-02-17_1767290379298.json');
const reflectionsSegmentedPath = path.join(__dirname, '../attached_assets/reflection_cards_segmented_db_import_2026-01-19_to_2026-02-17_1767290599311.json');

interface SparkJson {
  title: string;
  description: string;
  category: string;
  media_type: string;
  duration: number;
  scripture_ref: string;
  video_url: string;
  audio_url: string;
  thumbnail_url: string;
  status: string;
  publish_at: string;
  daily_date: string;
  featured: boolean;
  prayer_line: string;
  cta_primary: string;
  thumbnail_text: string;
  thumbnail_prompt: string;
  week_theme: string;
  audience_segment: string;
}

interface ReflectionJson {
  base_quote: string;
  question: string;
  action: string;
  faith_overlay_scripture: string;
  publish_at: string;
  daily_date: string;
  status: string;
  week_theme: string;
  audience_segment: string;
}

async function seedSparks(filePath: string, description: string) {
  console.log(`\nSeeding ${description}...`);
  const data: SparkJson[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  for (const item of data) {
    await db.insert(sparks).values({
      title: item.title,
      description: item.description,
      category: item.category,
      mediaType: item.media_type,
      duration: item.duration || null,
      scriptureRef: item.scripture_ref || null,
      videoUrl: item.video_url || null,
      audioUrl: item.audio_url || null,
      thumbnailUrl: item.thumbnail_url || null,
      status: item.status,
      publishAt: item.publish_at ? new Date(item.publish_at) : null,
      dailyDate: item.daily_date || null,
      featured: item.featured || false,
      prayerLine: item.prayer_line || null,
      ctaPrimary: item.cta_primary || null,
      thumbnailText: item.thumbnail_text || null,
      thumbnailPrompt: item.thumbnail_prompt || null,
      weekTheme: item.week_theme || null,
      audienceSegment: item.audience_segment || null,
    });
  }
  console.log(`  Inserted ${data.length} sparks`);
}

async function seedReflections(filePath: string, description: string) {
  console.log(`\nSeeding ${description}...`);
  const data: ReflectionJson[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  for (const item of data) {
    await db.insert(reflectionCards).values({
      baseQuote: item.base_quote,
      question: item.question,
      action: item.action,
      faithOverlayScripture: item.faith_overlay_scripture || null,
      publishAt: item.publish_at ? new Date(item.publish_at) : null,
      dailyDate: item.daily_date || null,
      status: item.status,
      weekTheme: item.week_theme || null,
      audienceSegment: item.audience_segment || null,
    });
  }
  console.log(`  Inserted ${data.length} reflection cards`);
}

async function main() {
  console.log('🌱 Starting DOMINION Campaign Seed...');
  
  try {
    await seedSparks(sparksGlobalPath, 'Global Sparks (30)');
    await seedSparks(sparksSegmentedPath, 'Segmented Sparks (150)');
    await seedReflections(reflectionsGlobalPath, 'Global Reflection Cards (30)');
    await seedReflections(reflectionsSegmentedPath, 'Segmented Reflection Cards (150)');
    
    console.log('\n✅ DOMINION Campaign seed complete!');
    console.log('   Total: 180 sparks + 180 reflection cards = 360 pieces of content');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
