import { storage } from "./storage";
import { getDominionSeedContent } from "./auto-seed";

let syncIntervalId: NodeJS.Timeout | null = null;

export function startNightlyContentSync(): void {
  console.log('[Content Sync] Starting nightly content sync scheduler...');
  
  scheduleNextSync();
  
  console.log('[Content Sync] Nightly sync scheduler initialized');
}

function scheduleNextSync(): void {
  const now = new Date();
  const londonTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/London" }));
  
  const targetHour = 23;
  const targetMinute = 0;
  
  let nextSync = new Date(londonTime);
  nextSync.setHours(targetHour, targetMinute, 0, 0);
  
  if (londonTime >= nextSync) {
    nextSync.setDate(nextSync.getDate() + 1);
  }
  
  const msUntilSync = nextSync.getTime() - londonTime.getTime();
  const hoursUntil = Math.floor(msUntilSync / (1000 * 60 * 60));
  const minutesUntil = Math.floor((msUntilSync % (1000 * 60 * 60)) / (1000 * 60));
  
  console.log(`[Content Sync] Next sync scheduled for 23:00 London time (in ${hoursUntil}h ${minutesUntil}m)`);
  
  if (syncIntervalId) {
    clearTimeout(syncIntervalId);
  }
  
  syncIntervalId = setTimeout(async () => {
    await runContentSync();
    scheduleNextSync();
  }, msUntilSync);
}

export async function runContentSync(): Promise<{ sparks: number; reflections: number }> {
  console.log('[Content Sync] Running automated content sync...');
  
  let sparksUpserted = 0;
  let reflectionsUpserted = 0;
  
  try {
    // Get fresh content at sync time (not at module load)
    const content = getDominionSeedContent();
    
    for (const spark of content.sparks) {
      await storage.upsertSpark(spark);
      sparksUpserted++;
    }
    
    for (const card of content.reflectionCards) {
      await storage.upsertReflectionCard(card);
      reflectionsUpserted++;
    }
    
    console.log(`[Content Sync] Complete: ${sparksUpserted} sparks, ${reflectionsUpserted} reflection cards synced`);
    
    return { sparks: sparksUpserted, reflections: reflectionsUpserted };
  } catch (error) {
    console.error('[Content Sync] Error during sync:', error);
    throw error;
  }
}

// getDominionSeedContent is now imported from auto-seed.ts (single source of truth)
