import { storage } from "./storage";

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

function getDominionSeedContent() {
  const segments = [null, 'schools', 'universities', 'early-career', 'builders', 'couples'];
  const campaignStart = new Date('2026-01-03');
  
  const dayThemes = [
    { title: "Dominion Begins with Belonging", scripture: "Romans 8:15-17", week: "Week 1: Identity & Belonging", featured: true },
    { title: "Seated, Not Shaken", scripture: "Ephesians 2:4-6", week: "Week 1: Identity & Belonging", featured: false },
    { title: "Chosen for Influence", scripture: "1 Peter 2:9", week: "Week 1: Identity & Belonging", featured: false },
    { title: "Testimony: From Pressure to Peace", scripture: "John 14:27", week: "Week 1: Identity & Belonging", featured: false },
    { title: "Dominion Through Love", scripture: "1 John 4:18-19", week: "Week 1: Identity & Belonging", featured: false },
    { title: "Living Light in Darkness", scripture: "Matthew 5:14-16", week: "Week 1: Identity & Belonging", featured: false },
    { title: "Power to Stand", scripture: "Ephesians 6:10-13", week: "Week 2: Prayer & Presence", featured: false },
    { title: "When Stillness Speaks", scripture: "Psalm 46:10", week: "Week 2: Prayer & Presence", featured: false },
    { title: "Prayer That Moves Mountains", scripture: "Mark 11:22-24", week: "Week 2: Prayer & Presence", featured: false },
    { title: "Testimony: Breakthrough Came", scripture: "James 5:16", week: "Week 2: Prayer & Presence", featured: false },
    { title: "In His Presence", scripture: "Psalm 16:11", week: "Week 2: Prayer & Presence", featured: false },
    { title: "The Secret Place", scripture: "Matthew 6:6", week: "Week 2: Prayer & Presence", featured: false },
    { title: "Peace That Guards", scripture: "Philippians 4:6-7", week: "Week 3: Peace & Anxiety", featured: false },
    { title: "Cast Your Cares", scripture: "1 Peter 5:7", week: "Week 3: Peace & Anxiety", featured: false },
    { title: "Anxiety to Trust", scripture: "Proverbs 3:5-6", week: "Week 3: Peace & Anxiety", featured: false },
    { title: "Testimony: From Overwhelm to Overflow", scripture: "Isaiah 26:3", week: "Week 3: Peace & Anxiety", featured: false },
    { title: "Mind Renewed", scripture: "Romans 12:2", week: "Week 3: Peace & Anxiety", featured: false },
    { title: "Rest for the Weary", scripture: "Matthew 11:28-30", week: "Week 3: Peace & Anxiety", featured: false },
    { title: "Speak Up", scripture: "Acts 1:8", week: "Week 4: Bold Witness", featured: false },
    { title: "Your Story Matters", scripture: "Revelation 12:11", week: "Week 4: Bold Witness", featured: false },
    { title: "Love in Action", scripture: "1 John 3:18", week: "Week 4: Bold Witness", featured: false },
    { title: "Testimony: One Conversation Changed Everything", scripture: "Romans 10:14-15", week: "Week 4: Bold Witness", featured: false },
    { title: "Courage Over Comfort", scripture: "Joshua 1:9", week: "Week 4: Bold Witness", featured: false },
    { title: "Salt and Light", scripture: "Matthew 5:13-16", week: "Week 4: Bold Witness", featured: false },
    { title: "The Commission", scripture: "Matthew 28:18-20", week: "Week 5: Commission", featured: false },
    { title: "Go Where You Are", scripture: "Acts 17:26-27", week: "Week 5: Commission", featured: false },
    { title: "Faithful in Little", scripture: "Luke 16:10", week: "Week 5: Commission", featured: false },
    { title: "Testimony: Sent Out", scripture: "Isaiah 6:8", week: "Week 5: Commission", featured: false },
    { title: "The Harvest is Ready", scripture: "John 4:35", week: "Week 5: Commission", featured: false },
    { title: "Until He Returns", scripture: "Matthew 24:14", week: "Week 5: Commission", featured: false },
  ];
  
  const descriptions: Record<string, string> = {
    "Dominion Begins with Belonging": "Real authority starts with security, not striving. When you know you belong, you stop performing and start living steady under pressure. Today, let your identity be your anchor.",
    "Seated, Not Shaken": "Dominion is perspective before it is performance. When life feels loud, remember you're not beneath fear—you're invited into a higher view. Calm begins when you stop fighting from the ground.",
    "Chosen for Influence": "You were made to bring light, not just survive the day. Dominion looks like quiet confidence, integrity, and courage that changes atmospheres.",
    "Testimony: From Pressure to Peace": "This is a real story of calm arriving in the middle of pressure. If you've been carrying stress, let this remind you that peace is possible.",
    "Dominion Through Love": "Fear shrinks you; love strengthens you. Dominion is not control—it's being steady enough to choose love in real situations.",
    "Living Light in Darkness": "The world around you is looking for something real. Your life can be that light—not by being perfect, but by being present.",
    "Power to Stand": "You don't have to fight every battle alone. God has already equipped you with everything you need to stand firm.",
    "When Stillness Speaks": "In the noise of life, stillness is where God meets you. Today, pause and listen for His voice.",
    "Prayer That Moves Mountains": "Prayer is not about getting what you want—it's about aligning with what God wants. That's where power lives.",
    "Testimony: Breakthrough Came": "Sometimes the breakthrough comes suddenly after a long wait. This story will encourage your faith today.",
    "In His Presence": "The fullness of joy is found in His presence. Today, make time to simply be with God.",
    "The Secret Place": "What happens in private shapes who you are in public. Your secret time with God matters more than you know.",
    "Peace That Guards": "Anxiety tells you to carry everything. God says cast it all on Him. Peace comes when you let go.",
    "Cast Your Cares": "You weren't designed to carry the weight of worry. Today, release what's been pressing on your heart.",
    "Anxiety to Trust": "Trust is a muscle. The more you practice it, the stronger it becomes. Today, choose trust over anxiety.",
    "Testimony: From Overwhelm to Overflow": "When everything felt like too much, God stepped in. This testimony will remind you He's still working.",
    "Mind Renewed": "Your thoughts shape your reality. Today, invite God to transform how you think.",
    "Rest for the Weary": "Rest isn't weakness—it's wisdom. Jesus invites the weary to come and find rest in Him.",
    "Speak Up": "Your voice matters. The world needs to hear what God has put in your heart. Today, be bold.",
    "Your Story Matters": "You have a testimony. Don't underestimate the power of your story to change someone's life.",
    "Love in Action": "Faith without works is incomplete. Today, let your love show up in tangible ways.",
    "Testimony: One Conversation Changed Everything": "It only takes one conversation to shift someone's eternity. This story will inspire you to speak.",
    "Courage Over Comfort": "Comfort zones are nice, but nothing grows there. Today, step out in courage.",
    "Salt and Light": "You're called to preserve and illuminate. Your presence changes the atmosphere around you.",
    "The Commission": "The Great Commission isn't just for missionaries—it's for you, wherever you are.",
    "Go Where You Are": "Mission starts right where you're standing. Your workplace, school, and neighborhood are your mission field.",
    "Faithful in Little": "Faithfulness in small things opens doors to greater things. Today, honor what's in your hand.",
    "Testimony: Sent Out": "When God sends you, He equips you. This testimony will encourage you to say yes.",
    "The Harvest is Ready": "The harvest is plentiful. Open your eyes to the opportunities around you today.",
    "Until He Returns": "We work with urgency because He's coming back. Let this reality fuel your purpose.",
  };
  
  const prayerLines: Record<string, string> = {
    "Dominion Begins with Belonging": "Father, anchor me in belonging and teach me to live from Your love, not from pressure.",
    "Seated, Not Shaken": "Jesus, lift my perspective and settle my heart in Your victory today.",
    "Chosen for Influence": "Lord, let my life bring light and hope to the people around me.",
    "Testimony: From Pressure to Peace": "Jesus, meet me in my pressure and give me peace that holds.",
    "Dominion Through Love": "Father, fill me with Your love until fear loses its voice in my life.",
    "Living Light in Darkness": "Lord, help me shine Your light wherever darkness needs to be pierced.",
    "Power to Stand": "Father, strengthen me to stand firm in every battle I face.",
    "When Stillness Speaks": "Lord, quiet my soul and help me hear Your voice in the stillness.",
    "Prayer That Moves Mountains": "Jesus, align my prayers with Your will and move mountains for Your glory.",
    "Testimony: Breakthrough Came": "Father, increase my faith as I wait for Your breakthrough.",
    "In His Presence": "Lord, draw me deeper into Your presence where fullness of joy is found.",
    "The Secret Place": "Father, meet me in the secret place and transform me from the inside out.",
    "Peace That Guards": "Lord, guard my heart and mind with Your supernatural peace.",
    "Cast Your Cares": "Jesus, I release my worries to You. Carry what I cannot.",
    "Anxiety to Trust": "Father, help me choose trust over anxiety in every situation.",
    "Testimony: From Overwhelm to Overflow": "Lord, turn my overwhelm into overflow by Your power.",
    "Mind Renewed": "Father, transform my thinking and renew my mind today.",
    "Rest for the Weary": "Jesus, I come to You weary. Give me Your rest.",
    "Speak Up": "Lord, give me boldness to speak and wisdom to know when.",
    "Your Story Matters": "Father, use my story to reach someone who needs hope.",
    "Love in Action": "Lord, help me love not just in words but in real action.",
    "Testimony: One Conversation Changed Everything": "Father, open doors for conversations that matter eternally.",
    "Courage Over Comfort": "Lord, give me courage to step beyond my comfort zone today.",
    "Salt and Light": "Jesus, help me preserve what's good and illuminate what's true.",
    "The Commission": "Lord, I accept Your commission. Send me where You need me.",
    "Go Where You Are": "Father, open my eyes to the mission field where I already stand.",
    "Faithful in Little": "Lord, help me be faithful in the small things today.",
    "Testimony: Sent Out": "Father, equip me for everywhere You're sending me.",
    "The Harvest is Ready": "Lord, give me eyes to see the harvest all around me.",
    "Until He Returns": "Jesus, fuel my urgency with hope as I wait for Your return.",
  };
  
  const sparks: any[] = [];
  const reflectionCards: any[] = [];
  
  for (let day = 0; day < 30; day++) {
    const date = new Date(campaignStart);
    date.setDate(date.getDate() + day);
    const dailyDate = date.toISOString().split('T')[0];
    const publishAt = new Date(dailyDate + 'T05:00:00.000Z');
    
    const theme = dayThemes[day];
    const desc = descriptions[theme.title] || theme.title;
    const prayer = prayerLines[theme.title] || "Lord, guide me today.";
    
    for (const segment of segments) {
      sparks.push({
        title: theme.title,
        description: desc,
        category: theme.title.includes('Testimony') ? 'testimony' : 'daily-devotional',
        mediaType: 'video',
        duration: 120,
        scriptureRef: theme.scripture,
        status: 'scheduled',
        publishAt,
        dailyDate,
        featured: theme.featured,
        prayerLine: prayer,
        ctaPrimary: 'Pray',
        thumbnailText: theme.title.split(':')[0].substring(0, 20),
        weekTheme: theme.week,
        audienceSegment: segment,
      });
    }
    
    for (const segment of segments) {
      reflectionCards.push({
        baseQuote: desc.split('.')[0] + '.',
        question: "What would it look like to live this truth today?",
        action: "Take one step in faith based on what you've reflected on.",
        faithOverlayScripture: theme.scripture,
        publishAt,
        dailyDate,
        status: 'scheduled',
        weekTheme: theme.week,
        audienceSegment: segment,
      });
    }
  }
  
  return { sparks, reflectionCards };
}
