import { storage } from "./storage";

// ============================================================================
// OPTIMIZED AUTO-SEED WITH BATCHING
// ============================================================================

const BATCH_SIZE = 20; // Process 20 items at a time
const BATCH_DELAY_MS = 10; // Small delay between batches to yield to event loop

/**
 * Yields to the event loop to prevent blocking other requests.
 * This is critical for maintaining server responsiveness during seeding.
 */
function yieldToEventLoop(): Promise<void> {
  return new Promise(resolve => setImmediate(resolve));
}

/**
 * Process items in batches with yields to prevent blocking the event loop.
 */
async function processBatch<T, R = unknown>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize = BATCH_SIZE
): Promise<number> {
  let processed = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // Process batch items in parallel
    await Promise.all(batch.map(processor));
    processed += batch.length;

    // Yield to event loop between batches
    await yieldToEventLoop();

    // Optional: Add small delay to reduce database pressure
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  return processed;
}

export async function autoSeedDominionContent(): Promise<void> {
  const startTime = Date.now();

  try {
    console.log('[Auto-Seed] Starting background content sync...');

    const content = getDominionSeedContent();

    // Process sparks in batches (yields between batches to allow requests through)
    const sparksUpserted = await processBatch(
      content.sparks,
      spark => storage.upsertSpark(spark)
    );
    console.log(`[Auto-Seed] Synced ${sparksUpserted} sparks`);

    // Process reflection cards in batches
    const reflectionsUpserted = await processBatch(
      content.reflectionCards,
      card => storage.upsertReflectionCard(card)
    );
    console.log(`[Auto-Seed] Synced ${reflectionsUpserted} reflection cards`);

    // Process blog posts in batches
    const blogPosts = getBlogSeedContent();
    const blogsUpserted = await processBatch(
      blogPosts,
      blog => storage.upsertBlogPost(blog)
    );
    console.log(`[Auto-Seed] Synced ${blogsUpserted} blog posts`);

    // Events - only seed if none exist (admin-managed)
    const existingEvents = await storage.getEvents();
    if (existingEvents.length === 0) {
      const events = getEventSeedContent();
      const eventsSeeded = await processBatch(
        events,
        event => storage.upsertEvent(event)
      );
      console.log(`[Auto-Seed] Seeded ${eventsSeeded} initial events`);
    } else {
      console.log(`[Auto-Seed] Skipping events (${existingEvents.length} already exist)`);
    }

    // Seed journeys if none exist
    await seedJourneys();

    // Validation
    const allSparks = await storage.getSparks();
    const dominionSparks = allSparks.filter((s: any) => {
      if (!s.dailyDate) return false;
      return s.dailyDate >= '2026-01-03';
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Auto-Seed] Complete in ${duration}s: ${dominionSparks.length} sparks in database (rolling content)`);

  } catch (error) {
    console.error('[Auto-Seed] Error during content sync:', error);
    // Don't re-throw - this runs in background and shouldn't crash the server
  }
}

export function getDominionSeedContent() {
  const segments = [null, 'schools', 'universities', 'early-career', 'builders', 'couples'];
  const campaignStart = new Date('2026-01-03');

  // Calculate total days: from campaign start through today + 7 days (rolling window)
  const now = new Date();
  const londonNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/London" }));
  const daysSinceStart = Math.ceil((londonNow.getTime() - campaignStart.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.max(38, daysSinceStart + 7);

  const dayImages = [
    // Lessons from Zechariah 2 (Days 1-5)
    '/attached_assets/generated_images/cinematic_sunrise_devotional_background.png',
    '/attached_assets/generated_images/woman_looking_at_a_city_skyline_at_sunset.png',
    '/attached_assets/generated_images/urban_street_portrait_of_stylish_youth.png',
    '/attached_assets/generated_images/open_bible_on_a_cafe_table_with_coffee.png',
    '/attached_assets/generated_images/outdoor_acoustic_worship_session.png',
    // Week 1-4: The Heart Posture → The Breakthrough (Days 6-19)
    '/attached_assets/generated_images/day_1_identity_belonging_worship.png',
    '/attached_assets/generated_images/day_2_confident_identity_sunrise.png',
    '/attached_assets/generated_images/day_3_community_belonging_friends.png',
    '/attached_assets/generated_images/day_4_hands_reaching_light.png',
    '/attached_assets/generated_images/day_5_peaceful_reflection_morning.png',
    '/attached_assets/generated_images/day_6_unity_circle_together.png',
    '/attached_assets/generated_images/day_7_wonder_stars_known.png',
    '/attached_assets/generated_images/day_8_prayer_warfare_strength.png',
    '/attached_assets/generated_images/day_9_breakthrough_running_forward.png',
    '/attached_assets/generated_images/day_10_standing_firm_resilience.png',
    '/attached_assets/generated_images/day_11_focus_determination_battle.png',
    '/attached_assets/generated_images/day_12_victory_triumph_mountain.png',
    '/attached_assets/generated_images/day_13_collective_prayer_warfare.png',
    '/attached_assets/generated_images/day_14_faith_through_fire.png',
    // Heart Cry for Revival (Days 20-26)
    '/attached_assets/generated_images/day_15_hands_nurturing_growth.png',
    '/attached_assets/generated_images/day_16_diligent_work_excellence.png',
    '/attached_assets/generated_images/day_17_generosity_giving_hands.png',
    '/attached_assets/generated_images/day_18_mentoring_investing_others.png',
    '/attached_assets/generated_images/day_19_time_stewardship_urgency.png',
    '/attached_assets/generated_images/day_20_gifts_talents_faithful.png',
    '/attached_assets/generated_images/day_21_harvest_multiplication_vision.png',
    // Let the Deborahs Arise (Days 27-33)
    '/attached_assets/generated_images/day_22_crossroads_path_purpose.png',
    '/attached_assets/generated_images/day_23_city_purpose_calling.png',
    '/attached_assets/generated_images/day_24_pathway_direction_destiny.png',
    '/attached_assets/generated_images/day_25_compass_clarity_vision.png',
    '/attached_assets/generated_images/day_26_doorway_new_season.png',
    '/attached_assets/generated_images/day_27_global_mission_reach.png',
    '/attached_assets/generated_images/day_28_sent_going_commission.png',
    // The Harvest is Ripe (Days 34-38)
    '/attached_assets/generated_images/day_29_bold_team_mission.png',
    '/attached_assets/generated_images/day_30_sunrise_declaration_commission.png',
    '/attached_assets/generated_images/concert_crowd_with_hands_raised_in_worship.png',
    '/attached_assets/generated_images/youth_outreach_event.png',
    '/attached_assets/generated_images/global_mission_map_concept.png',
  ];

  const dayThemes = [
    // Lessons from Zechariah 2 (Days 1-5)
    { title: "God Is Measuring His Plans for You", scripture: "Zechariah 2:1-2", week: "Lessons from Zechariah 2", featured: true, passage: "Then I looked up, and there before me was a man with a measuring line in his hand. I asked, \"Where are you going?\" He answered me, \"To measure Jerusalem, to find out how wide and how long it is.\"", imageUrl: dayImages[0] },
    { title: "A City Without Walls", scripture: "Zechariah 2:4-5", week: "Lessons from Zechariah 2", featured: false, passage: "Run, tell that young man, 'Jerusalem will be a city without walls because of the great number of people and animals in it. And I myself will be a wall of fire around it,' declares the Lord, 'and I will be its glory within.'", imageUrl: dayImages[1] },
    { title: "Escape What Holds You Back", scripture: "Zechariah 2:6-7", week: "Lessons from Zechariah 2", featured: false, passage: "\"Come! Come! Flee from the land of the north,\" declares the Lord, \"for I have scattered you to the four winds of heaven,\" declares the Lord. \"Come, Zion! Escape, you who live in Daughter Babylon!\"", imageUrl: dayImages[2] },
    { title: "The Apple of God's Eye", scripture: "Zechariah 2:8", week: "Lessons from Zechariah 2", featured: false, passage: "For this is what the Lord Almighty says: \"After the Glorious One has sent me against the nations that have plundered you — for whoever touches you touches the apple of his eye.\"", imageUrl: dayImages[3] },
    { title: "The Lord Will Dwell Among You", scripture: "Zechariah 2:10-11", week: "Lessons from Zechariah 2", featured: false, passage: "\"Shout and be glad, Daughter Zion. For I am coming, and I will live among you,\" declares the Lord. \"Many nations will be joined with the Lord in that day and will become my people. I will live among you and you will know that the Lord Almighty has sent me to you.\"", imageUrl: dayImages[4] },
    // Week 1-4: The Heart Posture → The Breakthrough (Days 6-19)
    { title: "Hunger That God Responds To", scripture: "Matthew 5:6", week: "Week 1: The Heart Posture", featured: true, passage: "Blessed are those who hunger and thirst for righteousness, for they will be filled.", imageUrl: dayImages[5] },
    { title: "Repentance Opens the Door", scripture: "Acts 3:19", week: "Week 1: The Heart Posture", featured: false, passage: "Repent, then, and turn to God, so that your sins may be wiped out, that times of refreshing may come from the Lord.", imageUrl: dayImages[6] },
    { title: "Small Compromises Quench Fire", scripture: "Song of Songs 2:15", week: "Week 1: The Heart Posture", featured: false, passage: "Catch for us the foxes, the little foxes that ruin the vineyards, our vineyards that are in bloom.", imageUrl: dayImages[7] },
    { title: "Prayerlessness Costs More Than We Think", scripture: "Isaiah 64:7", week: "Week 1: The Heart Posture", featured: false, passage: "No one calls on your name or strives to lay hold of you; for you have hidden your face from us and have given us over to our sins.", imageUrl: dayImages[8] },
    { title: "Unforgiveness Blocks Flow", scripture: "Matthew 6:14-15", week: "Week 2: Removing the Barriers", featured: false, passage: "For if you forgive other people when they sin against you, your heavenly Father will also forgive you. But if you do not forgive others their sins, your Father will not forgive your sins.", imageUrl: dayImages[9] },
    { title: "Pride Resists God", scripture: "James 4:6-8", week: "Week 2: Removing the Barriers", featured: false, passage: "But he gives us more grace. That is why Scripture says: God opposes the proud but shows favour to the humble. Submit yourselves, then, to God. Resist the devil, and he will flee from you. Come near to God and he will come near to you.", imageUrl: dayImages[10] },
    { title: "Unity Makes Room for Blessing", scripture: "Psalm 133:1-3", week: "Week 2: Removing the Barriers", featured: false, passage: "How good and pleasant it is when God's people live together in unity! It is like precious oil poured on the head, running down on the beard, running down on Aaron's beard, down on the collar of his robe. It is as if the dew of Hermon were falling on Mount Zion. For there the Lord bestows his blessing, even life forevermore.", imageUrl: dayImages[11] },
    { title: "Holiness Is the Home of Presence", scripture: "1 Peter 1:15-16", week: "Week 2: Removing the Barriers", featured: false, passage: "But just as he who called you is holy, so be holy in all you do; for it is written: Be holy, because I am holy.", imageUrl: dayImages[12] },
    { title: "The Word Must Lead", scripture: "Psalm 119:105", week: "Week 3: Building the Foundation", featured: false, passage: "Your word is a lamp for my feet, a light on my path.", imageUrl: dayImages[13] },
    { title: "Obedience Fuels Fire", scripture: "John 14:21", week: "Week 3: Building the Foundation", featured: false, passage: "Whoever has my commands and keeps them is the one who loves me. The one who loves me will be loved by my Father, and I too will love them and show myself to them.", imageUrl: dayImages[14] },
    { title: "Comfort Can Quiet the Cry", scripture: "Luke 9:23", week: "Week 3: Building the Foundation", featured: false, passage: "Then he said to them all: Whoever wants to be my disciple must deny themselves and take up their cross daily and follow me.", imageUrl: dayImages[15] },
    { title: "Tears Before Triumph", scripture: "Psalm 126:5-6", week: "Week 3: Building the Foundation", featured: false, passage: "Those who sow with tears will reap with songs of joy. Those who go out weeping, carrying seed to sow, will return with songs of joy, carrying sheaves with them.", imageUrl: dayImages[16] },
    { title: "Not by Might, but by the Spirit", scripture: "Zechariah 4:6", week: "Week 4: The Breakthrough", featured: false, passage: "Not by might nor by power, but by my Spirit, says the Lord Almighty.", imageUrl: dayImages[17] },
    { title: "Start With Me", scripture: "Psalm 139:23-24", week: "Week 4: The Breakthrough", featured: true, passage: "Search me, God, and know my heart; test me and know my anxious thoughts. See if there is any offensive way in me, and lead me in the way everlasting.", imageUrl: dayImages[18] },
    // Heart Cry for Revival (Days 20-26)
    { title: "Return With All Your Heart", scripture: "Joel 2:12-13", week: "Heart Cry for Revival", featured: true, passage: "\"Even now,\" declares the Lord, \"return to me with all your heart, with fasting and weeping and mourning.\" Rend your heart and not your garments. Return to the Lord your God, for he is gracious and compassionate, slow to anger and abounding in love, and he relents from sending calamity.", imageUrl: dayImages[19] },
    { title: "When Heaven Invades the Room", scripture: "Acts 2:1-4", week: "Heart Cry for Revival", featured: false, passage: "When the day of Pentecost came, they were all together in one place. Suddenly a sound like the blowing of a violent wind came from heaven and filled the whole house where they were sitting. They saw what seemed to be tongues of fire that separated and came to rest on each of them. All of them were filled with the Holy Spirit and began to speak in other tongues as the Spirit enabled them.", imageUrl: dayImages[20] },
    { title: "Return to Your First Love", scripture: "Revelation 2:4-5", week: "Heart Cry for Revival", featured: false, passage: "Yet I hold this against you: you have forsaken the love you had at first. Consider how far you have fallen! Repent and do the things you did at first. If you do not repent, I will come to you and remove your lampstand from its place.", imageUrl: dayImages[21] },
    { title: "Run the Race Set Before You", scripture: "Hebrews 12:1-2", week: "Heart Cry for Revival", featured: false, passage: "Therefore, since we are surrounded by such a great cloud of witnesses, let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us, fixing our eyes on Jesus, the pioneer and perfecter of faith.", imageUrl: dayImages[22] },
    { title: "Seek Me and You Will Find Me", scripture: "Jeremiah 29:12-14", week: "Heart Cry for Revival", featured: false, passage: "Then you will call on me and come and pray to me, and I will listen to you. You will seek me and find me when you seek me with all your heart. I will be found by you, declares the Lord.", imageUrl: dayImages[23] },
    { title: "The Unity That Shakes the World", scripture: "John 17:20-23", week: "Heart Cry for Revival", featured: false, passage: "My prayer is not for them alone. I pray also for those who will believe in me through their message, that all of them may be one, Father, just as you are in me and I am in you. May they also be in us so that the world may believe that you have sent me.", imageUrl: dayImages[24] },
    { title: "Here Am I, Send Me", scripture: "Isaiah 6:1-8", week: "Heart Cry for Revival", featured: false, passage: "In the year that King Uzziah died, I saw the Lord, high and exalted, seated on a throne; and the train of his robe filled the temple. Then I heard the voice of the Lord saying, \"Whom shall I send? And who will go for us?\" And I said, \"Here am I. Send me!\"", imageUrl: dayImages[25] },
    // Let the Deborahs Arise (Days 27-33)
    { title: "Raised Up to Lead", scripture: "Judges 4:4-7", week: "Let the Deborahs Arise", featured: true, passage: "Now Deborah, a prophet, the wife of Lappidoth, was leading Israel at that time. She held court under the Palm of Deborah between Ramah and Bethel in the hill country of Ephraim, and the Israelites went up to her to have their disputes decided.", imageUrl: dayImages[26] },
    { title: "For Such a Time as This", scripture: "Esther 4:14", week: "Let the Deborahs Arise", featured: false, passage: "For if you remain silent at this time, relief and deliverance for the Jews will arise from another place, but you and your father's family will perish. And who knows but that you have come to your royal position for such a time as this?", imageUrl: dayImages[27] },
    { title: "The Song That Changes Everything", scripture: "Luke 1:46-49", week: "Let the Deborahs Arise", featured: false, passage: "And Mary said: \"My soul glorifies the Lord and my spirit rejoices in God my Saviour, for the Mighty One has done great things for me — holy is his name.\"", imageUrl: dayImages[28] },
    { title: "Courageous Teaching, Humble Influence", scripture: "Acts 18:24-26", week: "Let the Deborahs Arise", featured: false, passage: "Meanwhile a Jew named Apollos, a native of Alexandria, came to Ephesus. He was a learned man, with a thorough knowledge of the Scriptures. When Priscilla and Aquila heard him, they invited him to their home and explained to him the way of God more adequately.", imageUrl: dayImages[29] },
    { title: "The Command That Turns the Battle", scripture: "Judges 4:14-16", week: "Let the Deborahs Arise", featured: false, passage: "Then Deborah said to Barak, \"Go! This is the day the Lord has given Sisera into your hands. Has not the Lord gone ahead of you?\" So Barak went down Mount Tabor, with ten thousand men following him.", imageUrl: dayImages[30] },
    { title: "The Voice That Shook a Nation", scripture: "2 Kings 22:14-20", week: "Let the Deborahs Arise", featured: false, passage: "Hilkiah the priest, Ahikam, Akbor, Shaphan and Asaiah went to speak to the prophet Huldah, who was the wife of Shallum. She said to them, \"This is what the Lord, the God of Israel, says...\"", imageUrl: dayImages[31] },
    { title: "Co-Workers in the Gospel", scripture: "Romans 16:1-7", week: "Let the Deborahs Arise", featured: false, passage: "I commend to you our sister Phoebe, a deacon of the church in Cenchreae. Greet Priscilla and Aquila, my co-workers in Christ Jesus. They risked their lives for me. Greet Andronicus and Junia, my fellow Jews who have been in prison with me. They are outstanding among the apostles.", imageUrl: dayImages[32] },
    // The Harvest is Ripe (Days 34-38)
    { title: "Ask the Lord of the Harvest", scripture: "Matthew 9:37-38", week: "The Harvest is Ripe", featured: true, passage: "Then he said to his disciples, \"The harvest is plentiful but the workers are few. Ask the Lord of the harvest, therefore, to send out workers into his harvest field.\"", imageUrl: dayImages[33] },
    { title: "Open Your Eyes to the Fields", scripture: "John 4:35-38", week: "The Harvest is Ripe", featured: false, passage: "Don't you have a saying, 'It's still four months until harvest'? I tell you, open your eyes and look at the fields! They are ripe for harvest. Even now the one who reaps draws a wage and harvests a crop for eternal life, so that the sower and the reaper may be glad together.", imageUrl: dayImages[34] },
    { title: "Sent With a Message", scripture: "Isaiah 6:8", week: "The Harvest is Ripe", featured: false, passage: "Then I heard the voice of the Lord saying, \"Whom shall I send? And who will go for us?\" And I said, \"Here am I. Send me!\"", imageUrl: dayImages[35] },
    { title: "Beautiful Feet That Carry Good News", scripture: "Romans 10:14-15", week: "The Harvest is Ripe", featured: false, passage: "How, then, can they call on the one they have not believed in? And how can they believe in the one of whom they have not heard? And how can they hear without someone preaching to them? And how can they preach unless they are sent? As it is written: \"How beautiful are the feet of those who bring good news!\"", imageUrl: dayImages[36] },
    { title: "Witnesses to the Ends of the Earth", scripture: "Acts 1:8", week: "The Harvest is Ripe", featured: false, passage: "But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.", imageUrl: dayImages[37] },
  ];

  const descriptions: Record<string, string> = {
    "Hunger That God Responds To": "Revival is not a trend \u2014 it\u2019s a return. Are you hungry for God, or just hungry for God to fix your situation? Today, let the hunger grow.",
    "Repentance Opens the Door": "Repentance sounds harsh until you realise what it actually is. It\u2019s not humiliation \u2014 it\u2019s homecoming. God refreshes what we surrender.",
    "Small Compromises Quench Fire": "Not lions. Not obvious enemies. Little foxes \u2014 the small compromises we excuse. Fire burns brighter where compromise is surrendered.",
    "Prayerlessness Costs More Than We Think": "When prayer becomes occasional, spiritual appetite weakens. Revival is often connected to people who stir themselves into seeking.",
    "Unforgiveness Blocks Flow": "Bitterness makes the heart small. Revival is love returning to its rightful place \u2014 first toward God, then toward people.",
    "Pride Resists God": "God gives grace to the humble and resists the proud. Pride doesn\u2019t always look like arrogance \u2014 sometimes it looks like self-protection.",
    "Unity Makes Room for Blessing": "God commands blessing where there is unity. Not suggests. Commands. Division weakens witness and drains spiritual power.",
    "Holiness Is the Home of Presence": "Holiness is not cold. It\u2019s clean love. God calls us to be holy because He wants closeness without compromise.",
    "The Word Must Lead": "Revival without Scripture can become emotion without direction. God\u2019s Word is a lamp \u2014 it guides steps, not just feelings.",
    "Obedience Fuels Fire": "Jesus links love and obedience. Revival is not only a feeling \u2014 it\u2019s a lifestyle shift. Fire is sustained by obedience in ordinary life.",
    "Comfort Can Quiet the Cry": "Comfort can become a subtle idol. Revival often tarries where convenience is protected more than consecration.",
    "Tears Before Triumph": "Revival is often born in tears \u2014 not emotionalism, but holy grief and intercession. The harvest is on the other side of the burden.",
    "Not by Might, but by the Spirit": "Revival is not manufactured. Strategy can serve, but the Spirit must lead. Keep praying, keep obeying, keep surrendering.",
    "Start With Me": "The most powerful revival prayer is personal: Lord, begin in me. Revival becomes real when God searches and reforms your own heart.",
    // Heart Cry for Revival (Days 15-21)
    "Return With All Your Heart": "God isn\u2019t asking for perfect performance. He\u2019s asking for an honest return. What would it look like to stop managing your faith and actually come home?",
    "When Heaven Invades the Room": "Pentecost wasn\u2019t a programme \u2014 it was a takeover. When the Spirit fills a room, everything shifts. Are you making space for that kind of interruption?",
    "Return to Your First Love": "Remember the fire you used to have? The excitement, the hunger, the sense that God was close? Jesus says the way back is simpler than you think: repent and return.",
    "Run the Race Set Before You": "Life is full of distractions. But the race God has set before you isn\u2019t someone else\u2019s race. Throw off what\u2019s slowing you down and keep your eyes on Jesus.",
    "Seek Me and You Will Find Me": "God doesn\u2019t hide from seekers. He promises to be found by anyone who looks with their whole heart. What would wholehearted seeking actually look like for you this week?",
    "The Unity That Shakes the World": "The world doesn\u2019t need more debate between Christians. It needs to see us genuinely love each other. Unity is the most convincing sermon we\u2019ll ever preach.",
    "Here Am I, Send Me": "Isaiah didn\u2019t volunteer because he was confident. He volunteered because he\u2019d been cleansed. Availability, not ability, is what God is looking for.",
    // Let the Deborahs Arise (Days 22-28)
    "Raised Up to Lead": "Deborah didn\u2019t wait for permission to lead. She simply obeyed God and served her generation. What if you\u2019re already standing in your place of influence?",
    "For Such a Time as This": "You weren\u2019t born by accident. Your generation, your city, your circles \u2014 God placed you here on purpose. What if this is your moment?",
    "The Song That Changes Everything": "Mary\u2019s song wasn\u2019t written in a palace. It was born in uncertainty. Sometimes the most powerful worship comes from the most unlikely places.",
    "Courageous Teaching, Humble Influence": "Priscilla didn\u2019t need a stage. She pulled someone aside and spoke truth with grace. Influence doesn\u2019t always need a platform \u2014 sometimes it just needs a conversation.",
    "The Command That Turns the Battle": "Deborah didn\u2019t fight the battle herself. She spoke the word and released others to move. Sometimes your role is to call out what God is doing and invite others into it.",
    "The Voice That Shook a Nation": "When the king needed a word from God, they didn\u2019t go to the famous prophets. They went to Huldah. Faithfulness in hiddenness prepares you for moments of national significance.",
    "Co-Workers in the Gospel": "Paul didn\u2019t build alone. He celebrated the women who partnered with him \u2014 risking their lives, leading churches, carrying the gospel. The kingdom has always been a team effort.",
    // The Harvest is Ripe (Days 29-33)
    "Ask the Lord of the Harvest": "Jesus didn\u2019t say pray for a bigger strategy. He said pray for more workers. The harvest is already ripe \u2014 the bottleneck is people willing to go.",
    "Open Your Eyes to the Fields": "We\u2019re often waiting for the right moment to share our faith. Jesus says the moment is now. Open your eyes \u2014 people around you are already searching.",
    "Sent With a Message": "You don\u2019t need to have all the answers. You just need to have been sent. God qualifies the willing, not the perfect.",
    "Beautiful Feet That Carry Good News": "Someone shared the gospel with you. Now you get to be that person for someone else. Your story is someone else\u2019s invitation.",
    "Witnesses to the Ends of the Earth": "It starts in your neighbourhood and stretches to the nations. The Holy Spirit gives you power to be a witness wherever you are \u2014 not just overseas.",
    // Lessons from Zechariah 2 (Days 34-38)
    "God Is Measuring His Plans for You": "God has plans for your life that are bigger than your current capacity. He\u2019s measuring something \u2014 and what He measures, He builds.",
    "A City Without Walls": "What God wants to build through you can\u2019t be contained by human limitations. He Himself will be the fire around you and the glory within.",
    "Escape What Holds You Back": "Some things from your past are still holding you in Babylon. God is calling you out \u2014 not just geographically, but mentally, emotionally, and spiritually.",
    "The Apple of God's Eye": "You are precious to God. Anyone who comes against you comes against the apple of His eye. Let that truth settle into the deepest part of your identity.",
    "The Lord Will Dwell Among You": "The promise isn\u2019t just future. God wants to dwell with you now \u2014 in the ordinary, the messy, the uncertain. His presence is the point of everything.",
  };

  const prayerLines: Record<string, string> = {
    "Hunger That God Responds To": "Father, make me genuinely hungry for You \u2014 not just for what You can do, but for who You are. Strip away what\u2019s been numbing my appetite and draw me closer.",
    "Repentance Opens the Door": "Lord, I don\u2019t want to hide anymore. Search my heart and show me what needs to change. I choose honesty over comfort. Refresh me as I turn back to You.",
    "Small Compromises Quench Fire": "Father, show me the little foxes. I don\u2019t want slow drift to steal what You\u2019ve planted in me. Give me the courage to deal with what\u2019s small before it becomes big.",
    "Prayerlessness Costs More Than We Think": "Lord, forgive my prayerlessness. I don\u2019t want to be someone who just talks about You \u2014 I want to talk with You. Stir me up to seek You again.",
    "Unforgiveness Blocks Flow": "Father, I don\u2019t want bitterness to steal my future. Give me the grace to forgive, even when it\u2019s hard. Free my heart to love again.",
    "Pride Resists God": "Lord, search me for hidden pride. Soften what\u2019s hardened. I don\u2019t want to resist You \u2014 I want to be close to You. Humble my heart today.",
    "Unity Makes Room for Blessing": "Father, forgive me for the ways I\u2019ve contributed to division. Give me humility to honour others and a heart that protects unity. Let Your blessing flow where we are one.",
    "Holiness Is the Home of Presence": "Lord, I want Your closeness more than my comfort. Purify what needs to be purified. Consecrate what needs to be set apart. Make my life a place where Your presence rests.",
    "The Word Must Lead": "Father, let Your Word lead me. Not my feelings, not the noise, not the opinions of others \u2014 Your Word. Make it a lamp for my path today.",
    "Obedience Fuels Fire": "Lord, I don\u2019t want to just hear Your voice \u2014 I want to respond. Show me the yes You\u2019re waiting for, and give me the courage to move.",
    "Comfort Can Quiet the Cry": "Jesus, I don\u2019t want comfort to be louder than Your call. Show me where convenience has replaced consecration. Give me the courage to choose You over ease.",
    "Tears Before Triumph": "Lord, I bring You the burdens I\u2019ve been carrying. Don\u2019t let me waste this grief. Turn my tears into seeds and my prayers into a harvest.",
    "Not by Might, but by the Spirit": "Holy Spirit, I release control. I can\u2019t manufacture what only You can create. Fill me, lead me, and move through me in ways that surprise even my own expectations.",
    "Start With Me": "Lord, begin in me. Not out there. Not in someone else. In me. Search my heart, test my thoughts, and lead me in Your way. I\u2019m ready. Start here.",
    // Heart Cry for Revival (Days 15-21)
    "Return With All Your Heart": "Father, I\u2019m done with half-hearted faith. I want to come back to You with everything I have. Strip away the pretence and meet me in my honesty. I\u2019m returning \u2014 all of me.",
    "When Heaven Invades the Room": "Holy Spirit, I don\u2019t want tidy religion. I want Your presence. Fill me. Interrupt me. Overflow me. I make room for You right now \u2014 come and do what only You can do.",
    "Return to Your First Love": "Jesus, forgive me for letting the fire grow cold. I remember what it was like when You were everything to me. Take me back there. Rekindle what\u2019s dimmed. I choose You first again.",
    "Run the Race Set Before You": "Lord, show me what\u2019s slowing me down. I don\u2019t want to run someone else\u2019s race or carry burdens You never gave me. Fix my eyes on You and give me endurance for the long road.",
    "Seek Me and You Will Find Me": "Father, I\u2019m seeking You \u2014 not answers, not outcomes, but You. Promise says I\u2019ll find You when I search with all my heart. Here I am, searching. Meet me today.",
    "The Unity That Shakes the World": "Lord, forgive me for every way I\u2019ve prioritised being right over being united. Give me grace to love people who are different from me. Let our unity tell the world You\u2019re real.",
    "Here Am I, Send Me": "God, I don\u2019t feel ready. But I\u2019m available. Cleanse what needs to be cleansed and send me where You want me. I\u2019m not waiting for perfection \u2014 I\u2019m saying yes now.",
    // Let the Deborahs Arise (Days 22-28)
    "Raised Up to Lead": "Father, if You\u2019ve called me to lead, give me the courage to step up. Not for my glory, but for Yours. Show me where my voice is needed and give me wisdom to serve well.",
    "For Such a Time as This": "Lord, I believe You placed me here on purpose. Help me not to shrink from my moment. Give me Esther\u2019s courage to speak up when it matters most, even when it\u2019s costly.",
    "The Song That Changes Everything": "God, I want to worship You even when life doesn\u2019t make sense. Like Mary, let my soul magnify You \u2014 not my circumstances, not my fears, but You. Put a new song in my heart.",
    "Courageous Teaching, Humble Influence": "Lord, give me the courage to speak truth and the humility to do it with love. I don\u2019t need a stage \u2014 just a willing heart. Use my conversations to point people to You.",
    "The Command That Turns the Battle": "Father, show me the battles You\u2019ve already won. Give me Deborah\u2019s clarity to call others forward and the faith to believe You\u2019ve gone ahead of us. The victory is Yours.",
    "The Voice That Shook a Nation": "God, I don\u2019t need to be famous to be faithful. Prepare me in the hidden place so that when You call my name, I\u2019m ready. Let my faithfulness in secret become influence in public.",
    "Co-Workers in the Gospel": "Lord, I don\u2019t want to build alone. Show me who I\u2019m called to partner with. Give me the humility to serve and the courage to lead. Together, let us carry the gospel further.",
    // The Harvest is Ripe (Days 29-33)
    "Ask the Lord of the Harvest": "Father, I pray for workers. Raise up people in my generation who will say yes \u2014 in their schools, workplaces, and communities. And Lord, if You\u2019re asking me to go, I\u2019m willing.",
    "Open Your Eyes to the Fields": "Jesus, open my eyes. Show me the people around me who are searching, hurting, and ready for good news. Give me the courage to start conversations that matter.",
    "Sent With a Message": "Lord, I don\u2019t have all the answers, but I have You. Send me. Use my story, my words, my presence. I\u2019m available for whatever You\u2019re doing in my world today.",
    "Beautiful Feet That Carry Good News": "Father, someone shared the gospel with me. Now let me be that person for someone else. Make my feet beautiful because of the message they carry. Give me boldness today.",
    "Witnesses to the Ends of the Earth": "Holy Spirit, give me power to be Your witness \u2014 starting right where I am. Not in my own strength, but in Yours. Let my life point to Jesus, wherever I go.",
    // Lessons from Zechariah 2 (Days 34-38)
    "God Is Measuring His Plans for You": "Lord, I trust that You\u2019re building something in my life \u2014 even when I can\u2019t see the full picture. Help me cooperate with Your measuring line and not rush ahead of Your timing.",
    "A City Without Walls": "Father, expand my vision beyond what I can control. Be the wall of fire around me and the glory within me. I don\u2019t need human walls when I have Your presence.",
    "Escape What Holds You Back": "God, I\u2019m ready to leave what\u2019s been holding me captive. Whether it\u2019s fear, old habits, or someone else\u2019s expectations \u2014 I choose freedom. Help me walk out of Babylon today.",
    "The Apple of God's Eye": "Father, let the truth of how You see me reshape how I see myself. I am the apple of Your eye. When rejection or doubt whispers, remind me whose I am.",
    "The Lord Will Dwell Among You": "Lord, I don\u2019t want Your gifts more than Your presence. Come and dwell with me \u2014 in the ordinary, the uncertain, the everyday. Your presence is what I need most. Stay close.",
  };

  const teachings: Record<string, { fullTeaching: string; contextBackground: string; applicationPoints: string[]; reflectionQuestion: string; todayAction: string }> = {
    "Hunger That God Responds To": {
      fullTeaching: "Revival is not a trend \u2014 it\u2019s a return. Jesus says those who hunger and thirst for righteousness will be filled. But here\u2019s the honest question: are you hungry for God, or just hungry for God to fix your situation?\n\nThere\u2019s a difference. One is desire that consumes. The other is convenience that evaporates.\n\nIn 1727, a community of about 300 refugees were living together on a German nobleman\u2019s estate in a place called Herrnhut. They were tired, divided, and arguing about doctrine. Nobody would have predicted what was coming. But a small group among them refused to settle for spiritual mediocrity. They started seeking God \u2014 not for comfort, but for God Himself. That August, during a communion service, something broke open. Enemies reconciled. Division melted. And out of that hunger, they launched a prayer meeting that ran 24 hours a day, 7 days a week \u2014 for over 100 years. Within two decades, they sent more missionaries than all of Protestantism had in the previous 200 years.\n\nIt started with hunger.\n\nDavid described it in Psalm 63 \u2014 \"My soul thirsts for you; my whole body longs for you, in a dry and parched land where there is no water.\" That\u2019s not casual interest. That\u2019s someone who wants God the way a dehydrated person wants water.\n\nIf revival feels distant, it might not be because God is distant. It might be because we\u2019ve been filling up on everything else. Comfort, scrolling, noise, busyness \u2014 these things don\u2019t kill hunger, they just numb it. And God tends to respond where people are genuinely seeking, not where they\u2019re merely spectating.\n\nStories like the Moravians remind us that hunger has always been the starting point. If you want to explore more of these revival stories and what they mean for your generation, the Revivalist\u2019s Journey is a good place to start.\n\nToday, ask yourself: what am I actually hungry for? If the answer is anything other than God Himself, that\u2019s not a failure \u2014 it\u2019s an invitation. Let the hunger grow.",
      contextBackground: "Jesus spoke the Beatitudes to a mixed crowd \u2014 religious leaders, common people, seekers. His words about hunger cut across every background. In the ancient world, real hunger was life-threatening. Jesus uses that intensity to describe what spiritual seeking should look like: it should be a matter of survival, not a hobby.",
      applicationPoints: ["Identify one thing you\u2019ve been filling up on instead of seeking God. Set it aside for 24 hours.", "Start your day with 5 minutes of honest prayer before reaching for your phone.", "Ask God to make you genuinely hungry \u2014 not for blessings, but for Him."],
      reflectionQuestion: "Where have you been hungry for outcomes more than for God Himself?",
      todayAction: "Identify one thing you\u2019ve been filling up on instead of seeking God. Set it aside for 24 hours and use that time for prayer or Scripture.",
    },
    "Repentance Opens the Door": {
      fullTeaching: "Repentance sounds harsh until you realise what it actually is. It\u2019s not humiliation \u2014 it\u2019s homecoming. Peter says repent and turn to God so that times of refreshing may come. Revival is rarely built on noise. It\u2019s built on honesty.\n\nIn January 1907, 1,500 Koreans gathered for a Bible conference in Pyongyang. For four months, missionaries had been meeting daily at noon to pray for revival. They\u2019d heard about what God was doing in Wales and India, and they thought, \"Why not here?\"\n\nDuring the final prayer service, a respected elder named Kil Sun-ju stood up and publicly confessed a specific financial wrong he had committed. The room went silent. Then something shifted. Hundreds began praying out loud simultaneously \u2014 not chaos, but a flood of voices pouring out to God. One eyewitness described it as \"the sound of many waters, an ocean of prayer beating against God\u2019s throne.\"\n\nPeople wept. They confessed. Enemies reconciled right there in the room. Within two months, 2,000 people had come to faith. By mid-1907, 30,000 had become Christians. Pyongyang became known as \"the Jerusalem of the East.\"\n\nWhat triggered it? One man being honest.\n\nThe same pattern shows up in Scripture. When Nineveh repented at Jonah\u2019s message, God relented. When King Josiah found the forgotten scroll and tore his robes in grief, revival swept the nation. God doesn\u2019t despise repentant hearts. He heals them.\n\nIf revival feels delayed, maybe the door is waiting for honesty. Not perfection \u2014 just truth. What needs to come into the light today?",
      contextBackground: "Peter\u2019s words in Acts 3 came shortly after Pentecost, addressed to the same crowd who had rejected Jesus. His call to repentance wasn\u2019t condemnation \u2014 it was an invitation to times of refreshing from the Lord. The Greek word for repentance (metanoia) literally means a change of mind \u2014 a new direction, not just feeling sorry.",
      applicationPoints: ["In a quiet moment today, ask the Holy Spirit to show you one thing that needs to come into the light.", "Write it down. Confess it to God and, if appropriate, to a trusted friend.", "Choose honesty over image in one conversation today."],
      reflectionQuestion: "What is one area where God is calling you to turn back fully?",
      todayAction: "In a quiet moment today, ask the Holy Spirit to show you one thing that needs to come into the light. Write it down. Confess it to God and, if appropriate, to a trusted friend.",
    },
    "Small Compromises Quench Fire": {
      fullTeaching: "Scripture talks about \"little foxes\" that spoil the vineyard. Not lions. Not obvious enemies. Little foxes \u2014 the small compromises we excuse, the habits that slowly dull our hunger, the patterns that drain tenderness toward God.\n\nSamson\u2019s story is the clearest example. His downfall wasn\u2019t one catastrophic moment. It was a slow drift. He kept getting closer to what would eventually break him \u2014 small compromises, boundary-pushing, ignoring the nudge of the Spirit. God still had mercy, but the consequences were real. By the time Delilah cut his hair, the power had already been leaking for years.\n\nContrast that with what happened in the Welsh coal mines during the 1904 revival. When the fire fell on Wales, it didn\u2019t stay in the churches. It went underground \u2014 literally. Miners started holding prayer meetings before their shifts. Singing hymns in the tunnels. Confessing wrongs to each other. The swearing stopped so completely that the pit ponies were confused \u2014 they\u2019d been trained to respond to profanity, and now nobody was cursing.\n\nCrime rates dropped. Pub attendance plummeted. Magistrates had nothing to do because there were no cases. Debts were repaid. Marriages were restored.\n\nThe difference wasn\u2019t dramatic spiritual experiences. It was practical holiness \u2014 people removing the small compromises that had been stealing from them. Not cold perfectionism, but clean love. Fire burns brighter where compromise is surrendered.\n\nWhat \"small\" thing has been stealing your sharpness? It might not look like much, but the little foxes do the most damage when no one\u2019s watching.",
      contextBackground: "Song of Songs 2:15 uses the imagery of a vineyard \u2014 a place of growth, beauty, and fruitfulness. Small foxes would nibble at the vines and destroy fruit before it ripened. The metaphor is pointed: it\u2019s the unnoticed threats that do the most damage to spiritual growth.",
      applicationPoints: ["Identify one habit or pattern that has been gradually pulling you away from God.", "Make one concrete change today \u2014 delete the app, have the conversation, set the boundary.", "Ask a trusted friend to hold you accountable on this for the next week."],
      reflectionQuestion: "What small compromise has been stealing your spiritual sharpness?",
      todayAction: "Identify one habit or pattern that has been gradually pulling you away from God. Make one concrete change today \u2014 delete the app, have the conversation, set the boundary.",
    },
    "Prayerlessness Costs More Than We Think": {
      fullTeaching: "Isaiah laments that no one stirs themselves to take hold of God. That phrase is key \u2014 \"stirs themselves.\" Revival is often connected to people who stir themselves into seeking. Not into hype, but into honest, persistent prayer.\n\nWhen prayer becomes occasional, spiritual appetite weakens. It\u2019s not that God stops speaking \u2014 it\u2019s that we stop listening. And the cost of prayerlessness is always higher than we expect. Not just unanswered prayers, but an unawareness of God\u2019s voice, a drifting that happens so gradually we don\u2019t notice until we\u2019re far from where we started.\n\nJesus told His closest friends to watch and pray so they wouldn\u2019t fall into temptation (Matthew 26:41). That was the night before His crucifixion. The stakes couldn\u2019t have been higher. And they fell asleep. Not because they didn\u2019t care \u2014 because they were tired. Prayerlessness doesn\u2019t always come from rebellion. Sometimes it comes from exhaustion and distraction.\n\nIn 1903, two missionary women working in the Khasi Hills of northeast India heard a message about prayer and returned with a conviction: revival would only come through sustained, earnest seeking. What happened next is extraordinary. The church in Mawphlang began holding Monday night prayer meetings for revival. Then it spread. By early 1905, communities weren\u2019t praying weekly \u2014 they were gathering every single evening. For over eighteen months, people showed up night after night to pray.\n\nThen in March 1905, revival broke out. Over 8,000 people were baptised within two years. Today, roughly 75% of that region is Christian. The revival didn\u2019t create the prayer \u2014 the prayer created the conditions for revival.\n\nFrom the Khasi Hills to the Korean prayer mountains, sustained prayer has always preceded revival. The Revivalist\u2019s Journey walks through these prayer stories and helps you build the kind of prayer life that lasts.\n\nIf revival tarries, rebuild the secret place. Your prayers are never wasted, even when they feel invisible.",
      contextBackground: "Isaiah 64 is a desperate prayer for God to act. The people felt abandoned, yet Isaiah recognised that part of the problem was their own spiritual lethargy. The chapter is both a lament and an honest confession: God was ready to respond, but His people had stopped reaching for Him.",
      applicationPoints: ["Set a 15-minute prayer alarm for tomorrow morning.", "Not a long, daunting commitment \u2014 just 15 minutes of honest conversation with God.", "Do it for three days and see what shifts."],
      reflectionQuestion: "What would change if prayer became your daily priority again?",
      todayAction: "Set a 15-minute prayer alarm for tomorrow morning. Not a long, daunting commitment \u2014 just 15 minutes of honest conversation with God. Do it for three days and see what shifts.",
    },
    "Unforgiveness Blocks Flow": {
      fullTeaching: "Bitterness makes the heart small. It takes up space where love should be and slowly turns everything sour. Jesus ties forgiveness directly to spiritual freedom because unforgiveness keeps you chained to the thing that hurt you.\n\nJoseph understood this. His brothers sold him into slavery. He was falsely imprisoned. He lost years of his life because of their jealousy. And when he finally stood before them with the power to destroy them, he wept and said, \"You intended to harm me, but God intended it for good\" (Genesis 45:5-8). Forgiveness didn\u2019t erase his past \u2014 it redeemed his future. It gave him back what bitterness would have stolen: his peace, his purpose, and his family.\n\nDuring the Pyongyang revival in 1907, one of the most striking features was reconciliation. As the Spirit moved, people didn\u2019t just confess private sins \u2014 they went to people they\u2019d wronged. Debts were repaid. Enemies made peace. Families that had been fractured for years were restored in a single evening. The observers noted that love flowing freely was one of the clearest signs that God was genuinely at work.\n\nRevival is love returning to its rightful place \u2014 first toward God, then toward people. When love flows, the Spirit moves freely. When bitterness blocks the flow, even genuine spiritual desire gets choked.\n\nForgiveness isn\u2019t a one-time decision. Sometimes it\u2019s a process. You might need to forgive the same person seventy times seven \u2014 not because you\u2019re weak, but because wounds take time to heal. The key is direction: are you moving toward forgiveness, or are you building walls?\n\nAsk God for the grace to begin releasing what\u2019s been holding you.",
      contextBackground: "Jesus taught about forgiveness in the Sermon on the Mount (Matthew 6), linking it directly to prayer. In the Lord\u2019s Prayer, \"forgive us as we forgive others\" creates an inseparable connection between receiving God\u2019s mercy and extending it. First-century Jewish culture valued honour and public reputation \u2014 forgiving publicly was costly, which is why Jesus emphasised it so strongly.",
      applicationPoints: ["Write down the name of someone you\u2019re holding something against.", "Pray for them by name \u2014 not for them to change, but for God to give you grace to release them.", "Take one step toward reconciliation, even if it\u2019s just in your own heart."],
      reflectionQuestion: "Who do you need to begin releasing to God, and what first step could you take?",
      todayAction: "Write down the name of someone you\u2019re holding something against. Pray for them by name \u2014 not for them to change, but for God to give you grace to release them.",
    },
    "Pride Resists God": {
      fullTeaching: "God gives grace to the humble and resists the proud. That\u2019s a sobering statement. Not that God ignores the proud \u2014 He actively resists them. And pride doesn\u2019t always look like arrogance. Sometimes it looks like self-protection: refusing correction, avoiding confession, needing to be right, maintaining an image.\n\nKing Uzziah\u2019s story illustrates this painfully. He started well \u2014 seeking God, leading faithfully, winning battles. \"But after Uzziah became powerful, his pride led to his downfall\" (2 Chronicles 26:16). His strength became his stumbling block. The very things God gave him became the things that made him feel like he didn\u2019t need God anymore.\n\nJohn Wesley experienced something similar \u2014 from the other direction. Before his famous Aldersgate experience in 1738, Wesley was arguably one of the most disciplined Christians in England. He was an ordained minister. He\u2019d crossed the Atlantic as a missionary. He fasted, prayed, visited prisoners, and studied Scripture systematically. By any external measure, he was doing everything right.\n\nBut something was missing. Wesley later admitted he was doing all the right things with the wrong foundation. He was building on effort and discipline rather than on grace and surrender. It took a moment of honest humility \u2014 sitting in a small meeting on Aldersgate Street, listening to someone read Luther\u2019s preface to Romans \u2014 for something to break. \"I felt my heart strangely warmed,\" he wrote. That moment changed everything, because it started with humility.\n\nIn awakenings throughout history, humility often looks the same: ordinary people weeping, confessing, and returning to simple obedience. God moves where people stop pretending. Draw near to God today with a soft heart.",
      contextBackground: "James wrote to Jewish Christians scattered by persecution. His letter addresses practical faith. The quote about God resisting the proud comes from Proverbs 3:34 and is repeated in 1 Peter 5:5 \u2014 a truth so important it appears multiple times in Scripture. The Greek word for resist (antitassetai) is military language: God actively opposes the proud.",
      applicationPoints: ["Ask someone you trust for honest feedback about one area of your life.", "Listen without defending yourself.", "Replace one \"I have to prove myself\" thought with \"I\u2019m already loved.\""],
      reflectionQuestion: "Where do you need to humble yourself before God \u2014 honestly and specifically?",
      todayAction: "Ask someone you trust for honest feedback about one area of your life. Listen without defending yourself.",
    },
    "Unity Makes Room for Blessing": {
      fullTeaching: "Psalm 133 says God commands blessing where there is unity. Not suggests. Commands. Division weakens witness and drains spiritual power. Unity doesn\u2019t mean uniformity \u2014 it means humility, honour, and shared purpose.\n\nThe Moravian community at Herrnhut is one of the most striking examples of this. In the early 1720s, refugees from different Protestant backgrounds settled together on Count Zinzendorf\u2019s estate in Germany. Different traditions, different opinions, different convictions. Conflict was constant. Some wanted to leave. The community looked like it was going to tear itself apart.\n\nThen Zinzendorf did something remarkable. He didn\u2019t pick a side. He brought people together to study Scripture, confess wrongs, and commit to loving each other across their differences. On August 13, 1727, during a communion service, the Holy Spirit fell on the entire community. Enemies reconciled. Division dissolved. Something was born that day that would change the world.\n\nOut of that unity came the 100-year prayer watch. Out of that prayer came the modern missionary movement. Out of those missions, over 60 people groups heard the gospel for the first time. The Moravians even influenced John Wesley\u2019s conversion \u2014 the very conversion that sparked the Methodist revival.\n\nAll of it started when a divided community chose unity.\n\nIn Acts 2, the disciples were \"together in one accord\" when the Spirit fell at Pentecost. Unity didn\u2019t make them perfect \u2014 it made them aligned. And alignment is often the atmosphere where God entrusts greater power.\n\nThe Moravians show what happens when divided people choose unity. If you want to explore how small groups have fuelled every major revival \u2014 from Wesley\u2019s class meetings to the Korean prayer cells \u2014 the Revivalist\u2019s Journey takes you deeper into that history.\n\nRevival movements that spread widely have almost always carried a strong sense of shared mission and love. Protect unity in your circles. It costs something. It\u2019s worth everything.",
      contextBackground: "Psalm 133 is a Song of Ascents \u2014 one of the psalms sung by pilgrims travelling to Jerusalem for worship. The imagery of oil running down Aaron\u2019s beard represents anointing and consecration. The dew of Hermon represents abundant life. Both images converge on one idea: God\u2019s richest blessings flow where His people are united.",
      applicationPoints: ["Reach out to someone you\u2019ve been distant from \u2014 a friend, family member, or fellow believer.", "Don\u2019t try to fix everything. Just reconnect.", "Choose honour over opinion in one conversation today."],
      reflectionQuestion: "Where can you choose honour and peace to strengthen unity today?",
      todayAction: "Reach out to someone you\u2019ve been distant from \u2014 a friend, family member, or fellow believer. Don\u2019t try to fix everything. Just reconnect.",
    },
    "Holiness Is the Home of Presence": {
      fullTeaching: "Holiness is not cold. It\u2019s not a list of rules or a performance for God\u2019s approval. Holiness is clean love. God calls us to be holy because He wants closeness without compromise. And revival often tarries when we want God\u2019s power without God\u2019s purity.\n\nIsaiah\u2019s calling shows this beautifully. When he saw God \"high and lifted up\" in the temple, his first response wasn\u2019t excitement \u2014 it was honesty: \"Woe is me! For I am a man of unclean lips.\" He didn\u2019t compare himself to others. He saw who God was, and it showed him who he was. Then something remarkable happened: a coal from the altar touched his lips and cleansed him. Encounter produced purification. Purification produced commission: \"Whom shall I send?\" \"Here am I. Send me.\"\n\nThat order still matters. Encounter. Cleansing. Calling.\n\nDuring the Welsh revival, the transformation wasn\u2019t just spiritual \u2014 it was deeply practical. People turned from destructive habits. Honesty replaced dishonesty. Relationships were restored. Addictions lost their grip. The miners who were transformed didn\u2019t just pray more \u2014 they lived differently. Their holiness wasn\u2019t performative. It was the natural fruit of being genuinely close to God.\n\nHoliness is not about earning God\u2019s love. You already have it. It\u2019s about making room for His presence. If you fill a room with clutter, there\u2019s no space to sit. If you fill your life with things that grieve the Spirit, His presence won\u2019t force its way in. He\u2019ll wait \u2014 patiently, lovingly \u2014 for you to clear the space.\n\nWhat area of your life needs consecration? Not perfection. Consecration. Setting it apart. Giving it back to God so His presence can rest more deeply on you.",
      contextBackground: "Peter wrote to believers scattered by persecution, encouraging them to live distinctively. His quotation \"Be holy, because I am holy\" comes from Leviticus (11:44-45; 19:2; 20:7), where it was given to Israel as an identity statement: you belong to a holy God, so live accordingly. Peter applies this to all followers of Jesus, regardless of background.",
      applicationPoints: ["Choose one area where you know God has been nudging you toward change.", "Take one practical step today \u2014 not out of guilt, but out of love for His presence.", "Ask the Holy Spirit to show you what needs to be set apart."],
      reflectionQuestion: "What area of your life needs consecration so God\u2019s presence can rest more deeply?",
      todayAction: "Choose one area where you know God has been nudging you toward change. Take one practical step today \u2014 not out of guilt, but out of love for His presence.",
    },
    "The Word Must Lead": {
      fullTeaching: "Revival without Scripture can become emotion without direction. God\u2019s Word is a lamp \u2014 it guides steps, not just feelings. When the Word leads, fire becomes fruitful instead of chaotic.\n\nJesus demonstrated this in the wilderness. When the enemy came with temptation, Jesus didn\u2019t rely on feelings or experiences. He spoke Scripture. Three times He was tested, three times He responded with \"It is written.\" The Word anchored Him under the most intense pressure imaginable. If the Son of God needed Scripture to stand, how much more do we?\n\nIn 1729, a group of Oxford University students started meeting together to take their faith seriously. They read the Greek New Testament together, examined their own lives honestly, and held each other accountable. Their critics mocked them as \"Bible Moths\" and \"Methodists\" because of their methodical approach to spiritual life. Among them were John and Charles Wesley and George Whitefield \u2014 men who would later shape the course of history.\n\nThe disciplines didn\u2019t save them \u2014 Wesley himself admitted he wasn\u2019t truly converted during those years. But the Word prepared the soil. When God\u2019s fire eventually fell, it had something to burn on. Scripture gave the revival roots.\n\nThe same pattern shows up in every major awakening. The Great Awakenings were marked by Scripture-saturated preaching. The Korean revival of 1907 happened during a Bible study conference. The Welsh revival meetings were filled with singing \u2014 and those songs were soaked in biblical truth.\n\nIf you want stability in a noisy world, Scripture must be more than a quote you saw on social media. It must become your daily bread \u2014 the thing you return to when everything else is shifting.",
      contextBackground: "Psalm 119 is the longest chapter in the Bible \u2014 176 verses, all devoted to the value of God\u2019s Word. The psalmist uses eight different Hebrew words for Scripture throughout, describing it as a lamp, a treasure, a guide, and a source of life. Verse 105 captures the essence: God\u2019s Word illuminates the next step, even when the full path isn\u2019t visible.",
      applicationPoints: ["Choose one passage of Scripture (even just 3-4 verses) and commit to reading it every morning this week.", "Don\u2019t just read it \u2014 sit with it. Let it shape your thinking before the day shapes your mood.", "Write out one verse and put it where you\u2019ll see it all day."],
      reflectionQuestion: "What Scripture will you return to daily this week to anchor your mind and heart?",
      todayAction: "Choose one passage of Scripture (even just 3-4 verses) and commit to reading it every morning this week. Don\u2019t just read it \u2014 sit with it.",
    },
    "Obedience Fuels Fire": {
      fullTeaching: "Jesus links love and obedience: \"Whoever has my commands and keeps them is the one who loves me.\" Revival is not only a feeling \u2014 it\u2019s a lifestyle shift. Fire is sustained by obedience in ordinary life: integrity, forgiveness, prayer, courage.\n\nWhen Elijah stood on Mount Carmel, facing 450 prophets of Baal, he didn\u2019t just call fire down from heaven. First, he repaired the altar. Twelve stones, one for each tribe of Israel \u2014 he rebuilt what had been broken. Restoration and obedience prepared the place for God to move publicly (1 Kings 18). God often begins not with the spectacular, but by asking you to repair what\u2019s broken in your personal altar.\n\nIn 1885, seven students at Cambridge University made a decision that shocked Victorian England. C.T. Studd was the captain of the Cambridge cricket team \u2014 one of the most famous sportsmen in the country. Stanley Smith was stroke oar of the Cambridge boat crew. Dixon Hoste was a military officer from a prestigious family. These weren\u2019t nobodies. They were elite, with glittering careers ahead of them.\n\nAnd they gave it all up to become missionaries to China.\n\nTheir obedience wasn\u2019t dramatic for its own sake. It was the natural result of encountering God and taking Him at His word. When they toured the country to say goodbye, 3,000 people packed their final meeting in London. Their decision directly inspired the Student Volunteer Movement, which eventually sent over 20,000 young people to the mission field.\n\nThe Cambridge Seven didn\u2019t just make a bold decision \u2014 they inspired an entire generation. The Revivalist\u2019s Journey unpacks stories like theirs and helps you discover what your own \"yes\" might look like.\n\nOne act of obedience. Thousands of lives changed. You might not be called to leave the country. But obedience always asks something of you. Whatever it is, obedience is not legalism \u2014 it\u2019s love responding to love.",
      contextBackground: "In John 14, Jesus is preparing His disciples for His departure. His words about obedience aren\u2019t a threat \u2014 they\u2019re an invitation into deeper intimacy. Keeping His commands is the evidence of love, not the condition for love. The same chapter promises the Holy Spirit as helper and comforter \u2014 obedience and the Spirit\u2019s empowerment work together.",
      applicationPoints: ["Identify one specific thing God has been asking of you \u2014 something you\u2019ve known but avoided.", "Do it today. Don\u2019t overthink it. Just obey.", "Tell someone what you did and how it felt."],
      reflectionQuestion: "What has God told you to do that you\u2019ve delayed, and what is one obedient step you can take today?",
      todayAction: "Identify one specific thing God has been asking of you \u2014 something you\u2019ve known but avoided. Do it today. Don\u2019t overthink it. Just obey.",
    },
    "Comfort Can Quiet the Cry": {
      fullTeaching: "Comfort can become a subtle idol. Not a dramatic one \u2014 subtle. The kind you don\u2019t notice until you realise you\u2019ve arranged your entire life to avoid discomfort. Jesus says deny yourself, take up your cross, and follow Me. That\u2019s not a comfortable invitation. It\u2019s a revolutionary one.\n\nThe rich young ruler in Mark 10 wanted eternal life. He had done everything right \u2014 kept the commandments, lived morally, asked the right questions. Jesus looked at him and loved him. Then He said, \"Go, sell everything you have and give to the poor.\" The young man walked away sad, because he had great wealth. He wanted the Kingdom, but he wasn\u2019t willing to let go of the comfort that kept him from entering it.\n\nRevival often tarries where convenience is protected more than consecration. Where the cry for God gets muted by a full calendar, an easy schedule, and the unconscious decision that spiritual hunger is fine as long as it doesn\u2019t actually cost anything.\n\nIn awakening stories throughout history, people paid a cost. The Moravian missionaries who went to the Caribbean sold themselves into slavery to reach enslaved people. The Cambridge Seven walked away from prestigious careers. Evan Roberts \u2014 the young Welshman at the centre of the 1904 revival \u2014 had prayed for 11 years, often through the night, before revival came. Florrie Evans stood up in a meeting and gave a simple testimony that cost her nothing financially but required everything emotionally: \"I love Jesus Christ with all my heart.\"\n\nThe cost is different for everyone. For some, it\u2019s time. For others, it\u2019s reputation. For others, it\u2019s control. But the principle is the same: comfort can keep you from the very freedom you\u2019re seeking.\n\nWhat comfort is God asking you to lay down?",
      contextBackground: "Luke 9:23 comes at a turning point in Jesus\u2019 ministry. He had just revealed that He would suffer and die. His call to \"take up your cross daily\" wasn\u2019t metaphorical to His listeners \u2014 they had seen crucifixions. It meant accepting a path that the world considers foolish, because you trust the One who walks it with you.",
      applicationPoints: ["Fast from one comfort today \u2014 a meal, your phone for a few hours, entertainment.", "Use the space to pray.", "Ask God: what comfort is louder than Your call in my life?"],
      reflectionQuestion: "What comfort is God asking you to lay down so your hunger can grow?",
      todayAction: "Fast from one comfort today \u2014 a meal, your phone for a few hours, entertainment, or something else you rely on habitually. Use the space to pray.",
    },
    "Tears Before Triumph": {
      fullTeaching: "Revival is often born in tears. Not emotionalism \u2014 holy grief and intercession. Psalm 126 says those who sow in tears will reap with songs of joy. The person who goes out weeping, carrying seed to sow, will return carrying sheaves. There\u2019s a harvest on the other side of the burden.\n\nJesus wept over Jerusalem. \"If only you had known what would bring you peace,\" He said through tears (Luke 19:41-42). His tears weren\u2019t weakness. They were love. He looked at a city full of people who didn\u2019t recognise what they had, and He grieved for them. When you feel burdened for people \u2014 for your friends, your city, your generation \u2014 that burden might be more than worry. It might be God inviting you into His own heart for them.\n\nEvan Roberts carried this kind of burden. For 11 years, the young Welsh coal miner prayed for revival. Not casually \u2014 persistently. Sometimes through the night. When he finally returned to his home church in October 1904 with a vision for 100,000 souls, the meetings weren\u2019t polished. He would sometimes say very little. He would weep. He would pray. He would invite others to respond.\n\nWithin months, 100,000 people had come to faith across Wales. But it was born in tears \u2014 years of hidden, persistent, costly prayer before anyone saw the fruit.\n\nDo not despise the burden. If your heart breaks for something \u2014 for your family, for your generation, for the lost \u2014 don\u2019t rush to numb that ache. Sit in it. Pray through it. It often precedes breakthrough.\n\nThe harvest is coming. Keep sowing.",
      contextBackground: "Psalm 126 is a Song of Ascents, likely written after Israel\u2019s return from Babylonian exile. It celebrates restoration \u2014 \"When the Lord restored the fortunes of Zion, we were like those who dreamed.\" But it also acknowledges that the present still requires labour and tears. The promise is that faithful sowing, even through grief, leads to a harvest of joy.",
      applicationPoints: ["Spend 10 minutes in prayer specifically for someone or something you\u2019re burdened about.", "Don\u2019t try to fix it \u2014 just bring it to God with honesty.", "Write down the burden and commit to praying about it daily this week."],
      reflectionQuestion: "What burden has God placed on your heart, and how can you carry it in prayer this week?",
      todayAction: "Spend 10 minutes in prayer specifically for someone or something you\u2019re burdened about. Don\u2019t try to fix it \u2014 just bring it to God with honesty.",
    },
    "Not by Might, but by the Spirit": {
      fullTeaching: "Revival is not manufactured. Strategy can serve, but the Spirit must lead. Zechariah\u2019s words cut through both pride and despair: \"Not by might, nor by power, but by my Spirit, says the Lord.\" That truth removes any illusion that we can program awakening \u2014 and any fear that it depends on us.\n\nOn February 14, 1904, in the small Welsh town of New Quay, a young woman named Florrie Evans stood up in a meeting and said fourteen words: \"I love Jesus Christ with all my heart \u2014 He died for me.\"\n\nThat\u2019s it. No theological lecture. No dramatic backstory. No famous platform. Just a young woman declaring the simplest truth she knew.\n\nSomething broke open in that meeting. The Holy Spirit began moving. What started with one honest testimony became a flood that swept across Wales. 100,000 people came to faith in less than a year. The movement spread to India, Korea, and beyond, sparking revivals across the globe.\n\nFlorrie wasn\u2019t mighty. She wasn\u2019t powerful by any human measure. But the Spirit was in her words.\n\nIn Acts 1, Jesus told His disciples to wait. Not plan. Not strategise. Wait. \"You will receive power when the Holy Spirit comes upon you.\" They weren\u2019t ready because they were talented \u2014 they were ready because God filled them. Waiting is not wasted when it is Spirit-dependent.\n\nFrom the Moravian missionaries to the prayer meetings in northeast India to the coal mines of Wales, every genuine move of God surprised human expectations. People who planned nothing saw everything change. And people who planned everything sometimes saw nothing.\n\nKeep praying. Keep obeying. Keep surrendering. The Spirit knows how to breathe on dry bones.",
      contextBackground: "Zechariah prophesied to a discouraged remnant trying to rebuild the temple after exile. The task felt impossible \u2014 they were few, weak, and surrounded by opposition. God\u2019s message through Zechariah was that the temple would be completed not by human effort but by divine empowerment. The same principle applies to spiritual rebuilding in every generation.",
      applicationPoints: ["Instead of making a plan today, spend time listening.", "Ask the Holy Spirit: What do You want to do?", "Sit with the silence. Let Him lead."],
      reflectionQuestion: "Where do you need to release control and trust the Spirit to do what you cannot?",
      todayAction: "Instead of making a plan today, spend time listening. Ask the Holy Spirit, \"What do You want to do?\" Sit with the silence. Let Him lead.",
    },
    "Start With Me": {
      fullTeaching: "The most powerful revival prayer is personal: \"Lord, begin in me.\"\n\nIt\u2019s easy to look at culture, politics, or the church \"out there\" and think, that\u2019s where the problem is. But revival becomes real when God searches and reforms your own heart first. Not someone else\u2019s. Yours.\n\nWhen Isaiah walked into the temple and saw God \"high and lifted up,\" he didn\u2019t point at the nation. He said, \"Woe is me, for I am a man of unclean lips, and I live among a people of unclean lips, for my eyes have seen the King\" (Isaiah 6:5). Personal cleansing became personal commission. \"Whom shall I send?\" \"Here am I. Send me.\" God often begins with the messenger.\n\nJohn Wesley experienced this on May 24, 1738. He had been an ordained minister for 13 years. He had crossed the Atlantic to be a missionary. He had fasted, prayed, visited prisoners, and taught the Bible methodically. By every visible measure, he was already living for God.\n\nBut that evening, sitting in a small meeting on Aldersgate Street in London, listening to someone read Martin Luther\u2019s preface to the book of Romans, something happened in Wesley\u2019s own heart. \"I felt my heart strangely warmed,\" he wrote. \"I felt I did trust in Christ, Christ alone for salvation; and an assurance was given me that He had taken away my sins, even mine.\"\n\nEverything changed after that. Not because the circumstances changed, but because Wesley changed. Over the next 50 years, he travelled 250,000 miles, preached 40,000 sermons, and sparked a movement that eventually touched 80 million lives.\n\nIt started with one heart. Strangely warmed. Personally transformed.\n\nWesley\u2019s story didn\u2019t end at Aldersgate \u2014 it was just the beginning. If you\u2019re ready to go further, the Revivalist\u2019s Journey is a 12-week path into the stories, disciplines, and prayers that have sparked every major revival. Your next step might be closer than you think.\n\nMany awakenings have spread because individuals said yes \u2014 in secret prayer, in repentance, in obedience. You might not be able to revive your whole city. But you can invite revival into your own habits, your own decisions, your own heart.\n\n\"Begin in me\" is a brave and beautiful prayer. Pray it today.",
      contextBackground: "Psalm 139 is one of the most intimate psalms \u2014 David invites God to examine every part of his inner life. The request \"search me and know my heart\" is not fearful but trusting. David knew that God\u2019s examination wasn\u2019t for punishment but for purification. The same vulnerability is the starting point for personal and corporate revival.",
      applicationPoints: ["Write out this prayer and put it somewhere you\u2019ll see it every day this week: Lord, search me. Know my heart. Start Your work in me.", "Tell one person about what God is stirring in you.", "Take one step of obedience that reflects \"revival in me\" \u2014 today."],
      reflectionQuestion: "What would revival in me look like in your daily habits and choices?",
      todayAction: "Write out this prayer and put it somewhere you\u2019ll see it every day this week: Lord, search me. Know my heart. Start Your work in me.",
    },
    // ========================================================================
    // HEART CRY FOR REVIVAL (Days 15-21)
    // ========================================================================
    "Return With All Your Heart": {
      fullTeaching: "\"Return to me with all your heart.\" Not half. Not when it\u2019s convenient. All.\n\nJoel was writing to a nation in crisis. A devastating locust plague had wiped out crops, livelihoods, and hope. But the prophet\u2019s message wasn\u2019t \"try harder.\" It was \"come home.\" God wasn\u2019t after their rituals. He wanted their hearts. \"Rend your heart and not your garments\" \u2014 real change, not religious performance.\n\nIn September 1857, a businessman named Jeremiah Lanphier placed a small advert in a New York newspaper inviting people to a lunchtime prayer meeting. He was nervous. He wasn\u2019t a pastor. He wasn\u2019t famous. He was a 48-year-old lay missionary working in a church near Wall Street. On the day of the first meeting, he sat alone for thirty minutes. Then six people trickled in.\n\nThe next week, fourteen came. The week after, twenty-three. Within six months, 10,000 people were gathering daily across New York City to pray \u2014 businessmen, labourers, shop workers. The movement spread to every major city in America. Within two years, over one million people had come to faith. Historians call it the Prayer Revival of 1857-58.\n\nIt started with one person returning to God with an honest heart.\n\nThe same pattern shows up everywhere. Think about it: how many of us have drifted without noticing? Not into dramatic sin, but into autopilot. Scrolling instead of praying. Performing instead of connecting. Managing our spiritual lives like a to-do list instead of a love relationship.\n\nGod\u2019s invitation through Joel isn\u2019t angry. It\u2019s tender: \"He is gracious and compassionate, slow to anger and abounding in love.\" He\u2019s not waiting with folded arms. He\u2019s waiting with open ones.\n\nIf you want to explore what returning with all your heart looks like over time, the Heart Cry for Revival reading plan walks you through seven days of honest seeking \u2014 one step at a time.\n\nWhat would it look like, today, to stop managing your faith and simply come home?",
      contextBackground: "Joel prophesied during one of Judah\u2019s darkest moments. A locust plague had destroyed everything \u2014 harvests, economy, morale. The prophet interpreted the disaster as a wake-up call, not as punishment, but as an invitation to return. His call to \"rend your heart\" stood in contrast to the cultural practice of tearing garments as a show of grief. God wanted internal transformation, not external display.",
      applicationPoints: ["Set aside 10 minutes today with no phone, no music \u2014 just you and God. Tell Him honestly where you\u2019ve drifted.", "Write down one area where you\u2019ve been on autopilot spiritually. Ask God to wake you up in that area.", "Send a message to a friend and ask them to pray with you this week about returning to God wholeheartedly."],
      reflectionQuestion: "Where have you been running on autopilot instead of genuinely connecting with God?",
      todayAction: "Set aside 10 minutes today with no phone, no music \u2014 just you and God. Tell Him honestly where you\u2019ve drifted. Ask Him to draw you back.",
    },
    "When Heaven Invades the Room": {
      fullTeaching: "They were all together in one place. And then everything changed.\n\nPentecost wasn\u2019t a carefully orchestrated event. There was no worship band, no lighting rig, no social media countdown. A group of about 120 ordinary people \u2014 fishermen, tax collectors, women, brothers of Jesus who had once thought He was mad \u2014 gathered in an upper room and waited. That\u2019s it. They waited because Jesus told them to.\n\nAnd then heaven invaded the room. A sound like a violent wind. Tongues of fire resting on each person. Languages they\u2019d never learned pouring from their mouths. Peter \u2014 the same man who had denied Jesus three times \u2014 stood up and preached, and 3,000 people came to faith in a single day.\n\nThe Spirit didn\u2019t come because they deserved it. He came because they were present and expectant.\n\nIn 1906, something similar happened in a run-down building at 312 Azusa Street, Los Angeles. William Seymour, a one-eyed son of former slaves, had been barred from sitting inside the church where he first heard about the baptism of the Holy Spirit \u2014 he had to listen through a window because of segregation laws. But Seymour was hungry for God, and hunger doesn\u2019t respect human barriers.\n\nWhen the Spirit fell at Azusa Street, it shattered racial and social boundaries. Black, white, Latino, Asian \u2014 people worshipped side by side in a culture that said that was impossible. The services ran for three years, often without any formal leader or programme. It became the birthplace of a movement that now includes over 600 million people worldwide.\n\nBoth stories share something: the Spirit came where people made room for Him.\n\nThink about your own life. When was the last time you genuinely made room for the Spirit to move? Not in theory, but in practice? Not a quick prayer before bed, but actual space \u2014 unhurried, expectant, open?\n\nThe Spirit isn\u2019t looking for perfect rooms. He\u2019s looking for open ones.",
      contextBackground: "Pentecost was an existing Jewish harvest festival (Shavuot), celebrating the giving of the Law at Sinai. The timing was deliberate: on the day the Law was commemorated, the Spirit came to write it on hearts. The 120 in the upper room had been waiting for ten days since Jesus\u2019 ascension, as He had instructed in Acts 1:4-5.",
      applicationPoints: ["This week, try spending 5 minutes in silence before God \u2014 no requests, no agenda. Just listen.", "Ask the Holy Spirit to show you one area of your life where He wants more access.", "If you\u2019re in a small group or community, suggest starting your next meeting with 10 minutes of waiting in silence."],
      reflectionQuestion: "What would it look like to genuinely make room for the Holy Spirit in your daily routine?",
      todayAction: "Spend 5 minutes in intentional silence today. No requests. No music. Just say, \"Holy Spirit, I\u2019m here and I\u2019m listening.\" See what happens.",
    },
    "Return to Your First Love": {
      fullTeaching: "Jesus\u2019 words to the church in Ephesus are some of the most piercing in Scripture. He begins with praise: you\u2019ve worked hard, endured, tested false teachers, persevered. By every metric, the Ephesian church was thriving. Doctrinally sound. Actively serving. Culturally engaged.\n\nAnd then the gut punch: \"Yet I hold this against you: you have forsaken the love you had at first.\"\n\nYou can do all the right things and still lose the most important thing.\n\nThis hits differently when you\u2019re young. Maybe you came alive spiritually at a conference, a camp, a prayer meeting. Everything felt electric. God was close. Prayer was easy. The Bible wasn\u2019t a chore \u2014 it was a lifeline. You couldn\u2019t stop talking about Jesus.\n\nAnd then... life happened. Exams. Jobs. Relationships. Bills. Social media. The fire didn\u2019t go out overnight \u2014 it just slowly dimmed. You\u2019re still going to church, still calling yourself a Christian, still posting the occasional verse. But something\u2019s different. The hunger is gone. The intimacy has faded. You\u2019re running on fumes.\n\nJesus doesn\u2019t condemn this \u2014 He calls you back. \"Consider how far you have fallen! Repent and do the things you did at first.\" Not the things you\u2019ve upgraded to. The things you did at first. The raw prayers. The honest worship. The genuine dependence.\n\nDuring the Korean revival of 1907, Christians didn\u2019t wait for a special programme. They returned to basics: prayer, confession, Scripture, and love. The meetings in Pyongyang were marked by tears, reconciliation, and a tangible return to simple devotion. An observer wrote, \"It was not new doctrine. It was old love, made new.\"\n\nYou don\u2019t need a new strategy. You need an old love rekindled. The way back isn\u2019t complicated. It\u2019s honest.\n\nWhat did you do when you first loved Jesus? Start there again.",
      contextBackground: "Revelation 2:1-7 records Jesus\u2019 letter to the church in Ephesus, delivered through the apostle John. Ephesus was a major city in Asia Minor, home to the temple of Artemis. The church had been founded by Paul and later led by Timothy. By the time of this letter, it was doctrinally mature but relationally cold \u2014 a warning that theological correctness without passionate love is incomplete.",
      applicationPoints: ["Think back to the season when your faith felt most alive. What were you doing regularly then that you\u2019ve stopped doing?", "Pick one of those things and start it again this week \u2014 even imperfectly.", "Write down what you loved most about Jesus when you first believed. Read it aloud as a prayer."],
      reflectionQuestion: "When did your faith feel most alive, and what were you doing differently then?",
      todayAction: "Think back to the season when your faith was most alive. Pick one thing you did regularly then \u2014 a prayer habit, a worship practice, a conversation pattern \u2014 and restart it today.",
    },
    "Run the Race Set Before You": {
      fullTeaching: "Hebrews 12 paints an extraordinary picture. You\u2019re in a stadium. The stands are full \u2014 not with critics, but with witnesses. Abel. Enoch. Noah. Abraham. Sarah. Moses. Rahab. David. The prophets. People who lived by faith through impossible odds. They\u2019re cheering you on.\n\nAnd the writer says: throw off everything that hinders. Run the race marked out for you. Fix your eyes on Jesus.\n\nNotice what it doesn\u2019t say. It doesn\u2019t say run everyone else\u2019s race. It says run yours. The race marked out for you. Your calling. Your gifts. Your generation. Your lane.\n\nEric Liddell understood this. You might know him from the film Chariots of Fire. Liddell was a Scottish sprinter who refused to run the 100 metres at the 1924 Paris Olympics because the heats were on a Sunday. The press mocked him. The British Olympic Committee pressured him. But Liddell famously said, \"God made me fast. And when I run, I feel His pleasure.\"\n\nHe switched to the 400 metres \u2014 an event he hadn\u2019t trained for \u2014 and won gold. But that\u2019s not where the story ends. After the Olympics, Liddell moved to China as a missionary. He spent the next twenty years serving in schools, hospitals, and eventually an internment camp during World War II. He died in that camp in 1945, at the age of 43. Fellow prisoners said he was the most Christ-like person they had ever met.\n\nLiddell didn\u2019t just run fast. He ran faithfully. He threw off the weight of public opinion, the entanglement of compromise, and fixed his eyes on Jesus until the end.\n\nComparison is one of the heaviest weights you can carry. Social media amplifies it: everyone else\u2019s race looks more exciting, more successful, more blessed. But God didn\u2019t design you to run their race. He designed a specific one for you \u2014 with specific challenges, specific rewards, and specific finish line.\n\nWhat\u2019s hindering your run right now? Name it. Throw it off. And keep going.",
      contextBackground: "Hebrews 12 follows the great \"hall of faith\" in chapter 11, where the writer lists dozens of people who lived by faith through extreme adversity. The metaphor of a race was familiar in Greco-Roman culture, where athletic competitions were a central part of public life. The \"cloud of witnesses\" refers to these faith heroes who have gone before \u2014 not as spectators in a literal sense, but as testimony that faithful endurance is possible.",
      applicationPoints: ["Identify one comparison trap you fall into regularly \u2014 a person, a platform, a metric. Consciously release it to God.", "Write down the unique race you believe God has set before you. What\u2019s distinctive about your calling?", "Remove one \"weight\" this week \u2014 a habit, commitment, or distraction that\u2019s draining your spiritual energy."],
      reflectionQuestion: "What weight or entanglement is slowing you down, and what would it look like to throw it off?",
      todayAction: "Identify one thing that\u2019s been hindering your spiritual race \u2014 comparison, distraction, fear, or busyness. Take one concrete step to throw it off today.",
    },
    "Seek Me and You Will Find Me": {
      fullTeaching: "Jeremiah\u2019s words to the exiles in Babylon are among the most personal promises in Scripture. These weren\u2019t people casually browsing for God. They were captives. Displaced. Traumatised. They\u2019d lost their homes, their temple, their freedom. And into that darkness, God sends a letter: \"You will seek me and find me when you seek me with all your heart. I will be found by you.\"\n\nGod doesn\u2019t hide from seekers. He hides for them \u2014 so the seeking itself becomes the transformation.\n\nIn Korea, the tradition of the prayer mountain (Kidowon) grew out of this conviction. For decades, Korean Christians have climbed literal mountains to fast, pray, and seek God \u2014 sometimes for days or weeks at a time. The practice isn\u2019t about earning God\u2019s attention. It\u2019s about creating the conditions where deep encounter becomes possible. Many of the most significant spiritual movements in Korean Christianity \u2014 the explosive church growth of the 1970s and 80s \u2014 trace their roots to ordinary people who went to the mountain and refused to leave until God met them.\n\nBut you don\u2019t need a mountain. You need a heart that\u2019s willing to go \"all in.\"\n\nWholehearted seeking looks different for everyone. For a student, it might mean turning off Netflix for a week and spending that time in prayer. For a young professional, it might mean waking up 30 minutes earlier to read Scripture before the day starts. For a parent, it might mean praying with your kids instead of just praying for them.\n\nThe common thread is intentionality. God responds to genuine seeking \u2014 not perfect seeking, but honest seeking. The kind that says, \"I\u2019m not okay with drift. I want You.\"\n\nJeremiah\u2019s promise isn\u2019t conditional on your strength. It\u2019s conditional on your sincerity. Seek Him with your whole heart. He will be found.",
      contextBackground: "Jeremiah 29 is a letter sent from the prophet in Jerusalem to the Jewish exiles in Babylon. The exile began in 597 BC, and Jeremiah told the captives to settle in, build houses, and seek the welfare of the city where God had placed them. The promise to be found by seekers comes within this longer message of patience and hope \u2014 a reminder that even in displacement, God has plans for His people.",
      applicationPoints: ["Choose a specific time this week \u2014 even just 15 minutes \u2014 dedicated to seeking God with no agenda except His presence.", "Fast from one thing for a day (a meal, social media, entertainment) and use that time to pray.", "Journal what you\u2019re seeking God for specifically, and return to it daily."],
      reflectionQuestion: "What would wholehearted seeking look like in your life this week \u2014 practically and honestly?",
      todayAction: "Choose one thing to fast from today and use that time to seek God intentionally. Even 15 minutes of focused prayer can shift everything.",
    },
    "The Unity That Shakes the World": {
      fullTeaching: "In John 17, Jesus is hours from the cross. He\u2019s praying \u2014 not for safety, not for escape, but for His followers. And His deepest request? Unity. \"That all of them may be one, Father, just as you are in me and I am in you... so that the world may believe that you have sent me.\"\n\nJesus links the credibility of the gospel to the unity of His people. When Christians are divided, the world doesn\u2019t just see dysfunction \u2014 it sees a reason to dismiss the message. But when believers genuinely love each other across differences, something powerful happens. People pay attention.\n\nThe Moravians understood this. Before the revival at Herrnhut in 1727, the community was fractured. Lutherans arguing with Reformed believers. Personal feuds. Doctrinal standoffs. Count Zinzendorf could have taken sides. Instead, he spent weeks visiting every household, listening, mediating, pointing people to Christ. He drafted a covenant of love and mutual honour. On August 13, 1727, during a communion service, the Spirit fell and the community was knit together in a unity they could never have manufactured.\n\nOut of that unity came the famous 24/7 prayer watch. Out of that prayer came the modern missionary movement. Divided, they were powerless. United, they changed the world.\n\nThis matters for your generation in a specific way. Social media has made it easier than ever to find Christians you disagree with and publicly tear them apart. Theological debates become Twitter fights. Denominations mock each other. Young believers pick teams and build trenches.\n\nBut Jesus\u2019 prayer cuts through all of it: \"That they may be one... so that the world may believe.\" Unity isn\u2019t about ignoring real differences. It\u2019s about loving people across those differences because Christ\u2019s love is bigger than your opinions.\n\nThe world isn\u2019t waiting for better arguments from Christians. It\u2019s waiting to see us actually love each other. That\u2019s the apologetic that has no counter-argument.",
      contextBackground: "John 17 is known as Jesus\u2019 High Priestly Prayer, spoken on the night before His crucifixion. It\u2019s the longest recorded prayer of Jesus, and unity is its central theme. Jesus prays for His current disciples (verses 6-19) and then extends His prayer to all future believers (verses 20-26). The unity He describes isn\u2019t organisational but relational \u2014 modelled on the Trinity itself.",
      applicationPoints: ["Think of a Christian you disagree with or have been distant from. Reach out with a simple message of encouragement today.", "Next time you\u2019re tempted to criticise another believer online, pray for them instead.", "In your community or small group, initiate a conversation about what unity looks like practically \u2014 not in theory, but in action."],
      reflectionQuestion: "Where has division crept into your relationships with other believers, and what would it take to pursue unity?",
      todayAction: "Reach out to one fellow believer you\u2019ve been distant from or disagreed with. Send a simple, genuine message of encouragement or reconciliation.",
    },
    "Here Am I, Send Me": {
      fullTeaching: "Isaiah\u2019s calling is one of the most dramatic scenes in Scripture. He sees the Lord high and exalted. Seraphim are flying, calling to one another: \"Holy, holy, holy.\" The doorposts shake. The temple fills with smoke. And Isaiah\u2019s response? Not excitement. Terror. \"Woe is me! I am ruined.\"\n\nEncounter with God doesn\u2019t inflate the ego. It reveals the gap. Isaiah saw who God was and instantly knew who he wasn\u2019t. But here\u2019s the grace: a coal from the altar touched his lips and cleansed him. God didn\u2019t leave him in the gap. He bridged it.\n\nThen came the question: \"Whom shall I send? And who will go for us?\" And Isaiah, freshly cleansed, said the words that have echoed through every generation since: \"Here am I. Send me.\"\n\nGladys Aylward heard those words and took them literally. She was a parlour maid in London \u2014 no qualifications, no money, no connections. Missionary societies rejected her. But she was convinced God was calling her to China. In 1930, she scraped together enough money for a one-way train ticket across Siberia. The journey was harrowing \u2014 at one point she was stranded in a war zone and had to walk through no-man\u2019s land in the snow.\n\nShe made it to China. She learned the language, adopted orphans, and when the Japanese invaded, she led over 100 children on a twelve-day march across mountains to safety. She had no military training, no support network, and no plan B. Just a calling and a willingness to go.\n\nAvailability, not ability, is what God is looking for. You don\u2019t need a theology degree to say yes. You don\u2019t need a platform to be sent. You need a heart that\u2019s been cleansed by grace and a mouth that says, \"Here am I.\"\n\nIf this week has stirred something in you \u2014 a hunger, a conviction, a longing for God to move \u2014 the Heart Cry for Revival reading plan is a way to keep going. Seven days of honest seeking, rooted in the stories and scriptures that have fuelled every major awakening.\n\nWhat is God asking you to say yes to today?",
      contextBackground: "Isaiah 6 is dated to the year King Uzziah died (around 740 BC) \u2014 a moment of national uncertainty. The vision came during worship in the temple. The threefold \"holy\" (the Trisagion) is the only attribute of God repeated three times in Scripture, emphasising its supreme importance. Isaiah\u2019s commission marked the beginning of a prophetic ministry that would span decades and address kings, nations, and the coming Messiah.",
      applicationPoints: ["Ask God this simple question today: \"What do You want me to say yes to?\" Listen before you act.", "Write down one thing you\u2019ve been avoiding because it feels too big or too costly. Bring it to God in prayer.", "Take one step of obedience before the day ends \u2014 even if it\u2019s small. Availability starts with action."],
      reflectionQuestion: "What is God asking you to say yes to that you\u2019ve been avoiding or delaying?",
      todayAction: "Ask God one question today: \"What do You want me to say yes to?\" Write down what comes to mind and take one step toward it before the day ends.",
    },
    // ========================================================================
    // LET THE DEBORAHS ARISE (Days 22-28)
    // ========================================================================
    "Raised Up to Lead": {
      fullTeaching: "Deborah didn\u2019t ask for permission to lead. She didn\u2019t wait for a title. She didn\u2019t campaign for a position. The text simply says: \"Deborah, a prophet, the wife of Lappidoth, was leading Israel at that time.\" In a culture that rarely elevated women to public leadership, Deborah was judging the nation \u2014 settling disputes, giving prophetic direction, and commanding military strategy.\n\nShe sat under a palm tree. People came to her. Not because of her title, but because of her wisdom. Her authority came from her walk with God, not from a committee vote.\n\nThis matters for a generation that often ties leadership to platforms, followers, and visibility. Deborah had none of that. She had faithfulness, discernment, and a willingness to speak what God was saying \u2014 even when it was uncomfortable.\n\nHeidi Baker is a modern example of this same pattern. In the late 1990s, Baker and her husband were running a small, struggling mission in Mozambique. They were exhausted, under-resourced, and on the verge of quitting. Then something shifted. Baker experienced a fresh encounter with the Holy Spirit and began responding with radical obedience \u2014 taking in orphans, planting churches in the bush, and preaching in villages with no electricity or running water.\n\nToday, their network has planted over 10,000 churches across Mozambique and beyond. Baker didn\u2019t start with a strategy. She started with presence \u2014 showing up, loving people, and trusting God one day at a time.\n\nMaybe you\u2019re reading this and thinking, \"I\u2019m not a leader.\" But leadership isn\u2019t about personality. It\u2019s about faithfulness. If people come to you for advice, you\u2019re leading. If you influence your friend group\u2019s conversations, you\u2019re leading. If you\u2019re the person who sets the tone in your flat, your office, your WhatsApp group \u2014 you\u2019re leading.\n\nIf you want to explore what it looks like for women and men to lead with courage and wisdom, the Let the Deborahs Arise reading plan digs into seven days of stories, scriptures, and challenges designed to call you higher.\n\nDeborah didn\u2019t wait for the world to be ready for her. She led because God called her. What if He\u2019s calling you too?",
      contextBackground: "Judges 4-5 tells Deborah\u2019s story during a period of chaos in Israel\u2019s history. The nation had no king, and cycles of idolatry, oppression, and deliverance defined the era. Deborah served as both prophet and judge \u2014 a unique dual role that gave her spiritual and civil authority. Her leadership resulted in 40 years of peace.",
      applicationPoints: ["Identify one area where people already look to you for guidance. Step into that space intentionally this week.", "Ask God to show you where your influence matters most \u2014 it might not be where you expect.", "Encourage another woman (or man) who you see leading faithfully but quietly. Your words might be the fuel they need."],
      reflectionQuestion: "Where has God already placed you in a position of influence, and how can you steward that more intentionally?",
      todayAction: "Identify one space where people already look to you for direction \u2014 a friend group, a team, a family. Step into that leadership intentionally today with one act of service or encouragement.",
    },
    "For Such a Time as This": {
      fullTeaching: "Mordecai\u2019s words to Esther are some of the most electrifying in the Old Testament: \"Who knows but that you have come to your royal position for such a time as this?\"\n\nEsther was a young Jewish woman living in exile, unexpectedly elevated to queen in a foreign empire. She didn\u2019t choose her position. She didn\u2019t plan for it. And now her entire people faced annihilation because of one man\u2019s hatred. The question wasn\u2019t whether Esther was qualified. The question was whether she was willing.\n\nMordecai\u2019s logic is stunning: if you stay silent, deliverance will come from somewhere else \u2014 but you and your family will miss it. The opportunity is time-sensitive. Your moment is now.\n\nHarriet Tubman heard that same urgency. Born into slavery in Maryland around 1822, Tubman escaped in 1849 and could have stayed safe in the North. Instead, she went back. Thirteen times she returned to the South, leading approximately seventy enslaved people to freedom through the Underground Railroad. She carried a pistol, she prayed constantly, and she never lost a single passenger.\n\nTubman once said, \"I was the conductor of the Underground Railroad for eight years, and I can say what most conductors can\u2019t say \u2014 I never ran my train off the track and I never lost a passenger.\" She attributed her success not to strategy but to prayer and obedience. She said God gave her dreams and visions that guided her routes.\n\nBoth Esther and Tubman faced the same question: will you risk comfort for calling? Will you use your position for something bigger than yourself?\n\nYou might not be facing a national crisis. But you\u2019re facing your generation. You have influence \u2014 in your friendship circle, your campus, your workplace, your online spaces. You didn\u2019t choose the era you were born into, but God did. What if your placement is strategic? What if the thing you\u2019re scared to speak up about is the very thing God positioned you to address?\n\nThe cost of silence is always higher than the cost of courage. You were made for such a time as this.",
      contextBackground: "The book of Esther is unique in that it never mentions God by name \u2014 yet His providence is woven through every chapter. Esther\u2019s story takes place during the Persian Empire, roughly 480 BC. The threat came from Haman, a high official who plotted to destroy all Jews. Esther\u2019s decision to approach the king uninvited risked her life \u2014 Persian law allowed the death penalty for anyone who entered the king\u2019s inner court without being summoned.",
      applicationPoints: ["Think about one situation in your life where you\u2019ve been staying silent because it feels risky. Ask God for courage to speak up.", "Write down three things about your current position (skills, relationships, platform) that could be used for someone else\u2019s good.", "Have one courageous conversation this week that you\u2019ve been putting off."],
      reflectionQuestion: "What situation in your life might you have been placed in \"for such a time as this\"?",
      todayAction: "Identify one conversation or action you\u2019ve been avoiding because it feels risky. Take the first step today \u2014 even if it\u2019s just drafting what you want to say.",
    },
    "The Song That Changes Everything": {
      fullTeaching: "Mary was probably a teenager. Unmarried, pregnant, and carrying the most impossible story anyone had ever heard. She had every reason to be silent. Every reason to hide. In her culture, an unwed pregnancy could mean public shame, family rejection, even death by stoning.\n\nInstead, she sang.\n\n\"My soul glorifies the Lord and my spirit rejoices in God my Saviour, for the Mighty One has done great things for me \u2014 holy is his name.\"\n\nThe Magnificat isn\u2019t a quiet, private prayer. It\u2019s a revolutionary anthem. Mary declares that God has scattered the proud, brought down rulers, and lifted up the humble. She\u2019s a young woman from Nazareth \u2014 a town so insignificant that Nathanael would later ask, \"Can anything good come from there?\" \u2014 and she\u2019s singing about God overturning the entire order of the world.\n\nThe most powerful worship often comes from the most unlikely places.\n\nSusanna Wesley understood this. She never preached a sermon, never held a title, never stood on a platform. But she raised eighteen children in poverty, taught them Scripture daily, and prayed for them relentlessly. Her sons John and Charles went on to spark the Methodist revival and write thousands of hymns that are still sung today. Charles Wesley\u2019s hymns \u2014 \"And Can It Be,\" \"O for a Thousand Tongues\" \u2014 were born from a mother who worshipped in the kitchen.\n\nSusanna once wrote, \"I am content to fill a little space if God be glorified.\" That contentment wasn\u2019t resignation. It was confidence that God uses small, faithful lives to change the world.\n\nMaybe your circumstances feel small right now. Maybe you\u2019re worshipping from a place of uncertainty \u2014 a difficult flat share, a dead-end job, a season of waiting. But Mary\u2019s song tells us something important: God does His greatest work in the lives of people the world overlooks.\n\nYour worship isn\u2019t limited by your circumstances. It\u2019s fuelled by your God. Sing anyway.",
      contextBackground: "The Magnificat (Luke 1:46-55) is Mary\u2019s response to Elizabeth\u2019s greeting. It draws heavily on Hannah\u2019s song in 1 Samuel 2, connecting Mary to the long tradition of women whose worship shaped Israel\u2019s story. The themes of reversal \u2014 the proud scattered, the humble lifted \u2014 echo throughout Scripture and would characterise Jesus\u2019 own ministry.",
      applicationPoints: ["Write out one thing God has done for you that you haven\u2019t properly celebrated. Thank Him for it today.", "Put on worship music during a mundane task \u2014 cooking, commuting, cleaning \u2014 and turn it into an act of praise.", "Share your \"Magnificat\" with someone: a short testimony of something God has done in your life, however small it seems."],
      reflectionQuestion: "What has God done for you that you haven\u2019t fully celebrated, and how can you worship Him for it today?",
      todayAction: "Write out one thing God has done for you recently \u2014 however small \u2014 and spend 5 minutes genuinely thanking Him for it. Turn a mundane moment today into worship.",
    },
    "Courageous Teaching, Humble Influence": {
      fullTeaching: "Apollos was brilliant. The text says he was \"a learned man, with a thorough knowledge of the Scriptures.\" He was eloquent, passionate, and bold. He spoke about Jesus accurately \u2014 as far as he knew. But his understanding was incomplete. He only knew about the baptism of John.\n\nEnter Priscilla and Aquila. When they heard Apollos preach, they didn\u2019t correct him publicly. They didn\u2019t tweet about his theological gaps. They didn\u2019t start a podcast dismantling his sermon. They \"invited him to their home and explained to him the way of God more adequately.\"\n\nThat\u2019s extraordinary. A married couple, tent-makers by trade, took one of the most gifted teachers of the early church into their home and gently corrected him over a meal. And Apollos received it. He went on to become one of the most effective preachers in the New Testament \u2014 Paul even mentions him alongside himself and Peter.\n\nPriscilla\u2019s influence is worth pausing on. She\u2019s named before Aquila in most references (Acts 18:18, 18:26, Romans 16:3, 2 Timothy 4:19), which scholars suggest indicates she was the more prominent teacher. She didn\u2019t need a pulpit to shape the church. She needed a kitchen table and the courage to speak truth with grace.\n\nThis is what influence looks like in a world obsessed with platforms. It\u2019s not about the size of your audience. It\u2019s about the depth of your conversations. Some of the most important discipleship happens over coffee, in car parks, in voice notes, and in living rooms.\n\nThink about your own circles. Is there someone who needs a gentle redirect? Not a callout \u2014 a conversation. Is there an Apollos in your life who has the passion but needs the perspective? Your humility and your truth could be the thing that unlocks their potential.\n\nCourage and humility aren\u2019t opposites. In Priscilla, they were inseparable.",
      contextBackground: "Acts 18 introduces Priscilla and Aquila as Jewish tent-makers who had been expelled from Rome under Emperor Claudius\u2019 edict. They worked alongside Paul in Corinth before moving to Ephesus, where they encountered Apollos. Their role as teachers and church leaders is well-documented: Paul calls them \"co-workers in Christ Jesus\" who \"risked their lives\" for him (Romans 16:3-4).",
      applicationPoints: ["Think of someone in your life who could benefit from a gentle, honest conversation. Plan to have it this week.", "Next time you disagree with someone, try inviting them for a coffee instead of debating online.", "Practice the Priscilla model: encourage first, then share what you\u2019ve learned. Lead with warmth, not correction."],
      reflectionQuestion: "Who in your life needs a gentle redirect, and how can you speak truth to them with love and humility?",
      todayAction: "Identify one person who could benefit from encouragement or gentle correction. Reach out to them today with warmth \u2014 not to fix, but to walk alongside.",
    },
    "The Command That Turns the Battle": {
      fullTeaching: "Deborah didn\u2019t fight the battle herself. She spoke the word.\n\n\"Go! This is the day the Lord has given Sisera into your hands. Has not the Lord gone ahead of you?\" That command to Barak \u2014 backed by prophetic clarity and unshakeable faith \u2014 turned the entire military situation. Barak had 10,000 troops against Sisera\u2019s 900 iron chariots. On paper, it was a mismatch. But Deborah could see something Barak couldn\u2019t: God had already gone ahead.\n\nSometimes your role isn\u2019t to fight the battle. It\u2019s to call others into it.\n\nPandita Ramabai understood this in 19th-century India. Born into a high-caste Hindu family, Ramabai lost her parents to famine and spent years wandering India as a scholar and reformer. After converting to Christianity, she founded the Mukti Mission in 1889 \u2014 a refuge for child widows and abandoned women. In 1905, during a Bible study, a young woman began praying with unusual intensity. Others joined her. Within days, the entire community was experiencing what became known as the Mukti Revival.\n\nRamabai hadn\u2019t planned it. She had simply been faithful \u2014 teaching, praying, and creating a space where God could move. When the fire fell, she didn\u2019t try to control it. She released it. Women who had been discarded by society became prayer warriors, evangelists, and leaders. The revival spread from Mukti to churches across India.\n\nRamabai\u2019s leadership looked like Deborah\u2019s: not fighting the battle alone, but speaking the word and releasing others to move.\n\nIn your own life, there may be people around you who are waiting for someone to say \"Go!\" Your flatmate who\u2019s been thinking about starting a Bible study but hasn\u2019t had anyone encourage them. Your colleague who\u2019s been sensing a call to serve but hasn\u2019t had anyone confirm it. Your friend who\u2019s hesitating at the edge of obedience.\n\nDeborah\u2019s gift wasn\u2019t just vision. It was the courage to call others into what God was doing. You might have the same gift.",
      contextBackground: "Judges 4:14-16 describes the climax of Israel\u2019s battle against Sisera, commander of King Jabin\u2019s Canaanite army. Sisera\u2019s 900 iron chariots represented the most advanced military technology of the time. But God used a sudden rainstorm (described in Judges 5:4-5) to bog down the chariots in mud, turning superior technology into a liability. Deborah\u2019s prophetic timing was crucial to the victory.",
      applicationPoints: ["Think of someone who needs encouragement to take a step of faith. Speak that encouragement to them today.", "Ask God to show you where He\u2019s already gone ahead in a situation you\u2019re facing. Trust His timing.", "Practice calling others into their gifts \u2014 affirm one person\u2019s calling or potential this week."],
      reflectionQuestion: "Who around you is waiting for a word of encouragement to step into what God is calling them to?",
      todayAction: "Identify one person who needs encouragement to take a step of faith. Send them a message today affirming what you see in them and urging them forward.",
    },
    "The Voice That Shook a Nation": {
      fullTeaching: "When King Josiah found the forgotten Book of the Law, he needed a prophet to interpret it. The royal advisors didn\u2019t go to Jeremiah. They didn\u2019t go to Zephaniah. They went to Huldah \u2014 a woman whose name most people don\u2019t recognise, living in the Second Quarter of Jerusalem, married to a man who kept the king\u2019s wardrobe.\n\nHuldah wasn\u2019t famous. She wasn\u2019t visible. But when the nation needed a word from God, they knew exactly where to find it.\n\nHer response was uncompromising. She confirmed that the words of the scroll were true, that judgement was coming because of the nation\u2019s idolatry, but that Josiah\u2019s tender heart meant he would be spared the worst. Her prophecy triggered the most significant reform in Judah\u2019s history. Josiah tore down altars, destroyed idols, renewed the covenant, and led the nation back to God.\n\nAll of it started with a woman speaking truth from a place of hiddenness.\n\nFaithfulness in secret prepares you for moments of national significance. Huldah didn\u2019t become prophetic overnight. She had clearly been walking with God for years \u2014 listening, discerning, studying. When the moment came, she was ready.\n\nThis is a crucial lesson in a culture that rewards visibility. We\u2019re trained to believe that influence only counts if people see it. But Huldah reminds us that the most significant voices are often the ones nobody was watching until they were needed.\n\nMaybe you\u2019re in a hidden season right now. Maybe your faithfulness feels invisible. You\u2019re praying and nobody knows. You\u2019re growing and nobody claps. You\u2019re serving and nobody posts about it.\n\nGood. Keep going. Huldah\u2019s story shows that God doesn\u2019t waste hidden seasons. He uses them to build the kind of depth that can handle the weight of public influence.\n\nWhen God needs a voice for your generation, will you be ready?",
      contextBackground: "2 Kings 22 records one of the most dramatic moments in Israel\u2019s history. During temple renovations under King Josiah (around 622 BC), the high priest Hilkiah discovered the Book of the Law \u2014 likely Deuteronomy \u2014 which had been lost or neglected for generations. Josiah\u2019s response of tearing his robes in grief prompted the consultation with Huldah, whose prophecy authenticated the scroll and catalysed national reform.",
      applicationPoints: ["Commit to one spiritual discipline this week that nobody will see \u2014 prayer, fasting, Scripture memorisation, or journaling.", "Resist the urge to share about it publicly. Let it be between you and God.", "Ask God to develop prophetic depth in you \u2014 the ability to hear His voice clearly, even when no one is asking."],
      reflectionQuestion: "What is God developing in you during this hidden season that could become significant later?",
      todayAction: "Commit to one spiritual practice this week that nobody will see. Pray, fast, or study Scripture in secret. Let God develop depth in you that\u2019s not dependent on an audience.",
    },
    "Co-Workers in the Gospel": {
      fullTeaching: "Paul\u2019s final chapter in Romans reads like a roll call of partnership. He names person after person \u2014 and many of them are women. Phoebe, a deacon of the church in Cenchreae. Priscilla, his co-worker who risked her life for him. Junia, outstanding among the apostles. Mary, who \"worked very hard\" for the community. Tryphena, Tryphosa, and Persis \u2014 all commended for their labour in the Lord.\n\nThis wasn\u2019t tokenism. These women weren\u2019t mentioned as footnotes. They were named as essential partners in the most significant spiritual movement the world has ever seen.\n\nThe kingdom has always been a team effort. Paul didn\u2019t build alone. Jesus didn\u2019t build alone. Every genuine movement of God has been characterised by partnership, co-labouring, and shared mission.\n\nIn the modern era, women have continued to play foundational roles in revival and mission. Catherine Booth co-founded the Salvation Army and was such a powerful preacher that she was known as the \"Mother of the Army.\" Amy Carmichael spent 55 years in India rescuing children from temple prostitution, writing 35 books, and discipling generations of workers. Jackie Pullinger moved into Hong Kong\u2019s Walled City \u2014 one of the most dangerous slums in the world \u2014 and spent decades leading drug addicts to Christ through prayer and presence.\n\nNone of them worked alone. They partnered, they served, and they released others into their callings.\n\nIf you\u2019re waiting for permission to serve, this is it. If you\u2019re waiting for someone to invite you into the mission, Paul already did \u2014 two thousand years ago. The early church didn\u2019t have a spectator section. Everyone was a co-worker.\n\nIf this series has challenged you to step into your calling with greater courage, the Let the Deborahs Arise reading plan goes deeper \u2014 seven days exploring what it means to lead, serve, and partner in the gospel with boldness and humility.\n\nWho are you called to partner with, and what are you building together?",
      contextBackground: "Romans 16 is Paul\u2019s most extensive personal greeting section, naming approximately 26 individuals. The prominence of women in this list is striking for a first-century document. Phoebe is called a \"diakonos\" (deacon/servant), the same word Paul uses for himself. Junia is described as \"outstanding among the apostles,\" suggesting she held significant authority. The chapter paints a picture of a diverse, collaborative, and gender-inclusive early church.",
      applicationPoints: ["Identify one person you could partner with in something God is doing \u2014 a project, a prayer commitment, a service opportunity.", "Celebrate another co-worker in the gospel today. Send them a message recognising their contribution.", "If you\u2019ve been operating solo in your faith, ask God to connect you with a team."],
      reflectionQuestion: "Who is God calling you to partner with, and what could you build together that you couldn\u2019t build alone?",
      todayAction: "Reach out to one person you admire in their faith and ask how you can partner with or support what they\u2019re doing. The kingdom is a team effort \u2014 find your team.",
    },
    // ========================================================================
    // THE HARVEST IS RIPE (Days 29-33)
    // ========================================================================
    "Ask the Lord of the Harvest": {
      fullTeaching: "Jesus looked at the crowds and felt compassion. They were harassed and helpless, like sheep without a shepherd. And His response wasn\u2019t \"build a bigger programme.\" It was \"pray for workers.\"\n\nThe harvest is plentiful. The problem isn\u2019t scarcity of opportunity \u2014 it\u2019s scarcity of people willing to go.\n\nHudson Taylor grasped this in 1865 when he founded the China Inland Mission. At the time, most missionaries clustered in coastal cities. Taylor looked at the map of inland China \u2014 millions of people with no access to the gospel \u2014 and was overwhelmed. Not by the impossibility, but by the urgency.\n\nTaylor\u2019s approach was radical for his era. He adopted Chinese clothing and customs. He refused to solicit funds directly, trusting God to provide through prayer alone. He recruited workers not based on education or background but on willingness and spiritual depth. Over the next fifty years, the China Inland Mission sent over 800 missionaries to China and established 300 stations across the interior.\n\nBut Taylor\u2019s starting point wasn\u2019t strategy. It was prayer. \"The Great Commission is not an option to be considered; it is a command to be obeyed,\" he wrote. He literally paced his room at night, praying for workers \u2014 and many of those workers came.\n\nThis matters for your generation in a very practical way. There are approximately 7,000 unreached people groups in the world today. Many of them have never heard the name of Jesus. But the harvest isn\u2019t just overseas. It\u2019s in your university lecture hall. Your office canteen. Your local gym. Your DMs.\n\nJesus didn\u2019t say \"pray for better strategies.\" He said pray for workers. People. Willing, available people. And maybe \u2014 just maybe \u2014 you\u2019re the answer to someone else\u2019s prayer.\n\nIf this sparks something in you, the Harvest is Ripe reading plan walks you through five days of praying, seeing, and responding to God\u2019s invitation to go.",
      contextBackground: "Matthew 9:35-38 comes immediately after Jesus healed a paralysed man, raised a dead girl, restored sight to the blind, and cast out a demon. Despite all these miracles, what moved Jesus to tears was not the physical need \u2014 it was the spiritual lostness of the crowds. His instruction to pray for workers reveals that evangelism begins not with technique but with intercession.",
      applicationPoints: ["Pray specifically for three people in your life who don\u2019t know Jesus. Write their names down and commit to praying for them daily.", "Ask God if you are one of the workers He wants to send. Be open to what He says.", "Find out about one unreached people group today and add them to your prayer list."],
      reflectionQuestion: "What if you are the answer to someone\u2019s prayer for a worker? How would that change how you see your daily life?",
      todayAction: "Write down the names of three people in your life who don\u2019t know Jesus. Pray for each one by name today. Ask God to open doors for conversation.",
    },
    "Open Your Eyes to the Fields": {
      fullTeaching: "Jesus is sitting by a well in Samaria. He\u2019s just had a life-changing conversation with a woman who came to draw water and left having met the Messiah. The disciples return with lunch and find Him not hungry. \"I have food to eat that you know nothing about,\" He says.\n\nThen He says something extraordinary: \"Open your eyes and look at the fields! They are ripe for harvest.\"\n\nThe disciples were looking at Samaria \u2014 a region most Jews avoided \u2014 and seeing nothing worth engaging with. Jesus was looking at the same place and seeing a harvest. Same view. Different eyes.\n\nIn the 1990s, a young South Korean man named David Jang started praying about campus evangelism while studying at university. He looked at the international student population and saw what Jesus saw: a harvest. Not a problem. Not a cultural challenge. A harvest. International students were arriving from countries closed to traditional missionaries \u2014 and they were accessible, open, and searching.\n\nWhat started as a small campus ministry grew into a global network. The principle was simple: see people the way Jesus sees them. Not as statistics or targets, but as individuals made in God\u2019s image who are already searching for meaning.\n\nThe same is true in your context. Your flatmate who\u2019s anxious about the future is searching. Your colleague who keeps asking existential questions over lunch is searching. Your school friend who\u2019s been posting about feeling lost on social media is searching.\n\nBut you\u2019ll miss it if your eyes aren\u2019t open. We\u2019re often so consumed with our own spiritual journey that we forget to look around. Jesus didn\u2019t say the fields would be ripe someday. He said they ARE ripe. Right now. Right where you are.\n\nThe question isn\u2019t whether people around you are ready. The question is whether you\u2019re looking.",
      contextBackground: "John 4:35-38 takes place during Jesus\u2019 journey through Samaria \u2014 territory most Jews bypassed by crossing the Jordan. His willingness to speak with a Samaritan woman broke multiple social conventions: Jews didn\u2019t associate with Samaritans, men didn\u2019t speak publicly with women, and rabbis didn\u2019t engage with people of questionable reputation. The harvest imagery connects to the Old Testament grain harvest, where timing was critical \u2014 if you waited too long, the crop was lost.",
      applicationPoints: ["This week, pay deliberate attention to three people around you. Pray for eyes to see their spiritual hunger.", "Start one genuine conversation with someone about what they believe, what they\u2019re searching for, or what gives them hope.", "Ask God to show you your \"Samaria\" \u2014 the place or people group you\u2019ve been avoiding that He wants you to engage with."],
      reflectionQuestion: "Who around you is already searching for meaning and purpose that you might be overlooking?",
      todayAction: "Open your eyes today. Pay attention to one person around you who seems to be searching or struggling. Ask them a genuine question about how they\u2019re doing and really listen.",
    },
    "Sent With a Message": {
      fullTeaching: "Isaiah\u2019s response \u2014 \"Here am I, send me\" \u2014 is one of the most repeated phrases in Christian history. But it\u2019s worth remembering what happened before he said it. He saw God. He was undone. He was cleansed. And then \u2014 only then \u2014 he was sent.\n\nBeing sent isn\u2019t about having all the answers. It\u2019s about having been with the Sender.\n\nBrother Andrew understood this. In the 1950s, a young Dutchman named Andrew van der Bijl felt called to smuggle Bibles into Communist countries where Scripture was banned. He had no organisation, no funding, and no experience in espionage. He drove a Volkswagen Beetle across borders with Bibles stacked in plain sight, praying, \"Lord, when You made blind eyes see, now make seeing eyes blind.\"\n\nFor decades, Brother Andrew and his team smuggled millions of Bibles into the Soviet Union, China, Cuba, and the Middle East. He wasn\u2019t a trained spy. He was a sent messenger. And God opened doors that should have been impossible.\n\nThe same principle applies in less dramatic contexts. You don\u2019t need to be a missionary to be sent. Every conversation is a sending. Every workplace is a mission field. Every school corridor is an opportunity.\n\nA student at a London university recently told me that she started a simple habit: praying for one person on her course every morning before lectures, then looking for a chance to serve that person during the day. Within a term, three people had asked her about her faith \u2014 not because she preached at them, but because she was present, kind, and genuinely interested in their lives.\n\nThat\u2019s what being sent looks like in real life. Not forced conversations. Not awkward gospel presentations. Just a person who\u2019s been with God, carrying His love into ordinary spaces.\n\nYou don\u2019t need to have all the answers. You just need to have been sent.",
      contextBackground: "Isaiah 6:8 follows the prophet\u2019s dramatic vision of God in the temple. The sequence is important: vision, conviction, cleansing, commission. Isaiah\u2019s willingness to go came from a deep encounter, not mere duty. The phrase \"who will go for us?\" uses the plural, hinting at the Trinity. God doesn\u2019t need our help, but He invites our partnership.",
      applicationPoints: ["Before leaving the house today, pray: \"Lord, send me. Open my eyes to whoever You want me to serve today.\"", "Carry one truth from this week\u2019s devotionals with you today and share it naturally if the opportunity arises.", "Identify your primary \"mission field\" this week \u2014 your campus, your workplace, your neighbourhood. Approach it intentionally."],
      reflectionQuestion: "Where is your everyday mission field, and what message is God sending you to carry there?",
      todayAction: "Before you leave the house today, pray: \"Lord, send me. Open my eyes to whoever You want me to serve.\" Then watch for the opportunity and respond.",
    },
    "Beautiful Feet That Carry Good News": {
      fullTeaching: "Paul asks a chain of questions in Romans 10 that follows an unstoppable logic: How can they call on someone they don\u2019t believe in? How can they believe in someone they haven\u2019t heard about? How can they hear without someone telling them? And how can anyone tell them unless they\u2019re sent?\n\nThe entire chain depends on one thing: someone willing to go.\n\n\"How beautiful are the feet of those who bring good news!\" That\u2019s not a metaphor about having nice shoes. It\u2019s a declaration that the most beautiful thing in the world is a person carrying a message of hope to someone who desperately needs it.\n\nThink about who carried the gospel to you. Maybe it was a parent who prayed over you before bed. A friend who invited you to church during a rough patch. A youth worker who didn\u2019t give up on you. A stranger online whose testimony made you curious. Someone had beautiful feet \u2014 and you\u2019re the result.\n\nThe Alpha course is a modern example of this chain in action. Started in 1977 at Holy Trinity Brompton in London, Alpha began as a simple introduction to the Christian faith over meals and conversation. There was nothing flashy about it \u2014 just food, a talk, and discussion. But because ordinary people kept inviting their friends, it spread. Today, Alpha has been run in 169 countries, translated into 112 languages, and over 30 million people have attended.\n\nNone of that happened because of a marketing budget. It happened because individuals with beautiful feet kept saying to their friends: \"Why don\u2019t you come along?\"\n\nYour story is someone else\u2019s invitation. The conversation you\u2019re scared to have might be the conversation that changes a life. You don\u2019t need to be eloquent. You don\u2019t need to have answers for every objection. You just need to be willing to share what God has done for you.\n\nBeautiful feet don\u2019t need to be perfect feet. They just need to go.",
      contextBackground: "Romans 10:14-15 draws from Isaiah 52:7, which celebrated the messengers who brought news of Israel\u2019s deliverance from Babylonian exile. Paul extends the imagery to the gospel: the good news of Jesus is the ultimate announcement of freedom. The passage underlines that faith comes through hearing, and hearing requires messengers \u2014 making every believer a potential link in the chain.",
      applicationPoints: ["Think about who shared the gospel with you. Send them a thank-you message today.", "Identify one person in your life who you could invite to explore faith \u2014 an Alpha course, a church service, or even a simple conversation over coffee.", "Practice sharing your story in 2-3 minutes. Keep it simple: what your life was like before, how you met Jesus, and what\u2019s different now."],
      reflectionQuestion: "Who carried the gospel to you, and who might you carry it to next?",
      todayAction: "Thank the person who shared the gospel with you \u2014 send them a message today. Then identify one person you could invite to explore faith this month.",
    },
    "Witnesses to the Ends of the Earth": {
      fullTeaching: "Jesus\u2019 final words before ascending weren\u2019t a farewell speech. They were a commission: \"You will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.\"\n\nNotice the concentric circles. Jerusalem \u2014 your immediate community. Judea \u2014 your region. Samaria \u2014 the places and people you\u2019d rather avoid. The ends of the earth \u2014 everywhere else. The mission starts local and goes global, but it starts.\n\nThe early church took this literally. Within a generation, the gospel had spread from a small room in Jerusalem to Rome, North Africa, India, and beyond. Persecution didn\u2019t stop it \u2014 it accelerated it. Every time believers were scattered, they took the message with them.\n\nIn the 1970s and 80s, Korean churches experienced explosive growth, partly fuelled by a deep missionary conviction. South Korea went from having almost no Christians in 1900 to sending more missionaries per capita than almost any other country by the end of the 20th century. By 2020, South Korea had sent over 27,000 missionaries to 170 countries. They took Acts 1:8 seriously: start where you are, but don\u2019t stop there.\n\nFor you, \"Jerusalem\" might be your flat. \"Judea\" might be your campus or workplace. \"Samaria\" might be the person you\u2019ve been avoiding because the conversation would be awkward. And \"the ends of the earth\" might start with supporting a missionary, learning about an unreached people group, or considering whether God is calling you overseas.\n\nThe Holy Spirit gives you power to be a witness. Not to be perfect. Not to have all the answers. Just to say, \"I\u2019ve seen Jesus, and He\u2019s real.\" That\u2019s a witness.\n\nIf the Harvest is Ripe series has stirred something in you, the reading plan goes deeper \u2014 five days of prayer, stories, and action steps to help you respond to God\u2019s invitation to go.\n\nWhere is God sending you? It might be further than you think. It might be closer than you think. Either way, go.",
      contextBackground: "Acts 1:8 was spoken on the Mount of Olives, just before Jesus\u2019 ascension. The disciples had just asked if He was going to restore Israel\u2019s political kingdom. Jesus redirected their expectations: the kingdom would spread not through political power but through Spirit-empowered witness. The geographic progression (Jerusalem \u2192 Judea \u2192 Samaria \u2192 ends of the earth) became the structural outline for the book of Acts itself.",
      applicationPoints: ["Map your own \"concentric circles\": Who is your Jerusalem (immediate community)? Your Judea? Your Samaria? The ends of your earth?", "Take one specific action this week in your \"Jerusalem\" \u2014 share your faith with someone close to you.", "Research one unreached people group or missionary organisation. Add them to your regular prayers."],
      reflectionQuestion: "What does your Jerusalem, Judea, Samaria, and ends of the earth look like practically?",
      todayAction: "Write out your concentric circles: who is in your Jerusalem (immediate community), your Judea (wider network), your Samaria (the uncomfortable reach), and your ends of the earth? Take one action in your Jerusalem today.",
    },
    // ========================================================================
    // LESSONS FROM ZECHARIAH 2 (Days 34-38)
    // ========================================================================
    "God Is Measuring His Plans for You": {
      fullTeaching: "Zechariah has a vision: a man with a measuring line, heading to measure Jerusalem. \"How wide? How long?\" The city had been destroyed. The temple was rubble. The people were recently returned from exile, overwhelmed by the scale of what needed rebuilding.\n\nBut God wasn\u2019t measuring the ruins. He was measuring the future.\n\nThat\u2019s a crucial distinction. When you look at your life, you might see the mess. God sees the measurements for what He\u2019s about to build.\n\nThis resonates deeply with a generation facing uncertainty. Career paths feel unclear. The housing market is brutal. Relationships are complicated. Mental health struggles are real. Sometimes it feels like you\u2019re standing in the rubble of expectations that didn\u2019t materialise.\n\nBut God is measuring. He has plans for what your life is going to look like \u2014 and those plans aren\u2019t constrained by your current limitations.\n\nAfter World War II, the city of Coventry lay in ruins. The medieval cathedral had been destroyed by German bombing in November 1940. The morning after the attack, the provost of the cathedral, Richard Howard, stood in the rubble and made a decision: they would rebuild. Not just the building, but the spirit. He wrote the words \"Father Forgive\" on the sanctuary wall. The new Coventry Cathedral, completed in 1962, became a global symbol of reconciliation and renewal \u2014 built literally alongside the ruins of the old one.\n\nThe old rubble didn\u2019t disappear. It became part of the story.\n\nMaybe you\u2019re in a season of rebuilding. A broken relationship. A career restart. A faith that\u2019s being reconstructed after doubt or disappointment. God isn\u2019t embarrassed by your rubble. He\u2019s already measuring what comes next.\n\nIf this resonates, the Lessons from Zechariah 2 reading plan walks you through five days exploring what it means to trust God\u2019s blueprint when you can\u2019t see the finished building.\n\nTrust the measuring line. What God measures, He builds.",
      contextBackground: "Zechariah prophesied around 520 BC, about eighteen years after the first exiles had returned from Babylon to Jerusalem. The temple rebuilding had stalled due to opposition and discouragement. Zechariah\u2019s visions were designed to encourage the people that God had not abandoned His plans. The man with the measuring line represents God\u2019s intentionality \u2014 He doesn\u2019t build randomly; He measures first.",
      applicationPoints: ["Write down one area of your life that feels like rubble right now. Hand it to God in prayer and ask Him to show you what He\u2019s measuring.", "Choose to see your current challenges as building materials, not obstacles. Ask God how He wants to use what\u2019s broken.", "Start a simple gratitude journal this week. Write down three things each day that show God is still working, even in the mess."],
      reflectionQuestion: "What area of your life feels like rubble, and what might God be preparing to build in that very place?",
      todayAction: "Write down one area of your life that feels unfinished or broken. Pray over it specifically: \"Lord, show me what You\u2019re measuring. I trust Your blueprint.\"",
    },
    "A City Without Walls": {
      fullTeaching: "The angel stops the man with the measuring line and delivers a message that must have stunned the returning exiles: \"Jerusalem will be a city without walls because of the great number of people and animals in it.\"\n\nNo walls? In the ancient world, walls were survival. Walls meant protection, identity, and control. A city without walls was vulnerable \u2014 or it was so filled with God\u2019s presence that human walls became unnecessary.\n\n\"I myself will be a wall of fire around it,\" God says, \"and I will be its glory within.\"\n\nThis is a radical shift. God isn\u2019t removing protection \u2014 He\u2019s upgrading it. The walls of fire He promises are better than any human structure. And the glory within means the city\u2019s significance comes from His presence, not its architecture.\n\nThere\u2019s a startup culture parallel here that your generation understands instinctively. The most innovative companies don\u2019t build rigid structures first. They build culture. They build vision. They stay flexible because growth requires adaptability. The companies that build walls too early often find those walls become prisons that limit expansion.\n\nGod is doing something in your life that can\u2019t be contained by the structures you\u2019ve built. Your career plan, your five-year timeline, your expectations \u2014 these might be walls that God wants to expand beyond. Not because they\u2019re bad, but because what He\u2019s planning is bigger than what you\u2019ve measured.\n\nFear is often the wall we build when God is calling us to open space. Fear of failure. Fear of what people think. Fear of the unknown. But if God Himself is your wall of fire, what do you actually need to be afraid of?\n\nThe returning exiles must have felt terrified at the idea of a city without walls. But God\u2019s promise reframed everything: His protection is better than any wall you can build, and His glory is the only thing that makes the city worth living in.\n\nStop building walls where God is building something open, expansive, and bigger than your imagination.",
      contextBackground: "In the ancient Near East, city walls were the primary defence against invasion. They defined a city\u2019s boundaries and controlled who could enter. God\u2019s promise of a \"city without walls\" was counter-cultural and prophetic \u2014 it declared that Jerusalem\u2019s future would be defined not by defensive structures but by divine presence. The imagery of fire recalls God\u2019s presence in the pillar of fire during the Exodus (Exodus 13:21-22).",
      applicationPoints: ["Identify one \"wall\" you\u2019ve built out of fear \u2014 a limitation, a boundary, or a self-imposed restriction. Ask God whether it\u2019s protecting you or limiting you.", "Practice releasing control in one area today. Trust God to be the fire around you.", "Dream bigger in one area of your life. Write down what God might be building if there were no walls."],
      reflectionQuestion: "What walls have you built out of fear that might be limiting what God wants to do in your life?",
      todayAction: "Identify one wall of fear or self-limitation in your life. Write it down, then pray: \"God, be the fire around me. I don\u2019t need this wall if I have Your presence.\"",
    },
    "Escape What Holds You Back": {
      fullTeaching: "\"Come! Flee from the land of the north!\" God\u2019s call to the exiles wasn\u2019t a gentle suggestion. It was urgent. \"Escape, you who live in Daughter Babylon!\"\n\nBut here\u2019s the surprising context: by the time Zechariah wrote these words, many Jewish exiles had settled comfortably in Babylon. They\u2019d built houses. Started businesses. Raised families. Babylon had become home. The urgency wasn\u2019t because Babylon was physically dangerous \u2014 it was because staying was spiritually dangerous. Comfort in the wrong place can trap you just as effectively as chains.\n\nThis speaks directly to a generation navigating identity, mental health, and purpose. Sometimes the things holding us back aren\u2019t dramatic. They\u2019re subtle. An old mindset. A toxic relationship. A coping mechanism that used to help but now just numbs. A version of yourself that you\u2019ve outgrown but haven\u2019t had the courage to leave behind.\n\nBabylon isn\u2019t just a place. It\u2019s a system of thinking. It\u2019s any environment that keeps you from the person God is calling you to be.\n\nA young woman I know spent three years stuck in a cycle of anxiety and people-pleasing. She knew God was calling her to something more, but every time she tried to move forward, old patterns pulled her back. It wasn\u2019t until she started counselling, found a praying community, and made the deliberate decision to \"flee Babylon\" \u2014 leaving behind relationships and habits that kept her small \u2014 that things began to shift. Today, she leads a campus prayer group and mentors other women walking through similar struggles.\n\nGod\u2019s call to escape isn\u2019t harsh. It\u2019s hopeful. He\u2019s not saying \"you\u2019re terrible for being stuck.\" He\u2019s saying \"there\u2019s something better, and I\u2019m calling you to it.\"\n\nWhat\u2019s your Babylon? What\u2019s comfortable but captive? Name it. Then start walking out.",
      contextBackground: "Zechariah\u2019s call to \"flee Babylon\" came decades after Cyrus of Persia had already decreed that Jews could return to Jerusalem (539 BC). Many chose to stay in Babylon, where they had prospered. God\u2019s urgent language suggests that the choice to remain in exile was not neutral \u2014 it carried spiritual consequences. The call to escape is both literal (return to Jerusalem) and symbolic (return to God\u2019s purposes).",
      applicationPoints: ["Identify one \"Babylon\" in your life \u2014 a mindset, habit, relationship, or environment that\u2019s keeping you from moving forward.", "Take one practical step toward leaving it this week. That might mean a conversation, a boundary, or a new routine.", "If you\u2019re struggling with something deeply rooted, consider reaching out to a counsellor, mentor, or trusted friend for support."],
      reflectionQuestion: "What is your \"Babylon\" \u2014 the comfortable-but-captive place God is calling you to leave?",
      todayAction: "Name one thing from your past or present that\u2019s been holding you back. Write it down and pray: \"God, I\u2019m choosing to walk out of this. Help me take the first step today.\"",
    },
    "The Apple of God's Eye": {
      fullTeaching: "\"Whoever touches you touches the apple of his eye.\"\n\nIn Hebrew, the phrase literally refers to the pupil of the eye \u2014 the most sensitive, most protected, most precious part. God is saying: you are so precious to Me that anyone who comes against you is poking Me in the eye.\n\nThat\u2019s not distant theology. That\u2019s fierce, protective, personal love.\n\nFor a generation battling identity crises, comparison culture, and mental health struggles, this truth is revolutionary. You\u2019re not defined by your follower count. You\u2019re not measured by your grades, your salary, or your relationship status. You\u2019re the apple of the Almighty\u2019s eye.\n\nCorrie ten Boom spent years in a Nazi concentration camp for hiding Jewish families during World War II. She lost her father and her sister Betsie in the camps. She experienced unimaginable suffering. But after the war, she travelled the world for over thirty years, sharing a message of forgiveness and God\u2019s love.\n\nHer most famous story involves meeting a former guard from Ravensbr\u00fcck concentration camp at one of her speaking events. He approached her with his hand extended, asking for forgiveness. Corrie described feeling her arm frozen at her side. \"Jesus, help me,\" she prayed silently. \"I can lift my hand. I can do that much. You supply the feeling.\" She reached out her hand, and in that moment, she said a current of warmth flooded through her.\n\nWhat gave Corrie the ability to forgive the unforgivable? She knew she was the apple of God\u2019s eye. When you know how God sees you, it changes how you see everyone else.\n\nRejection loses its sting when you know whose you are. Comparison loses its power. The voice that says \"you\u2019re not enough\" gets drowned out by the voice that says \"you\u2019re the apple of My eye.\"\n\nLet that truth settle deep today. Not as a nice idea, but as the foundation of your identity.",
      contextBackground: "Zechariah 2:8 uses imagery that appears elsewhere in Scripture to describe God\u2019s protective love. Deuteronomy 32:10 says God guarded Israel \"as the apple of his eye.\" Psalm 17:8 pleads, \"Keep me as the apple of your eye.\" The phrase communicates extreme tenderness and fierce protectiveness \u2014 God doesn\u2019t just notice when His people are hurt; He takes it personally.",
      applicationPoints: ["Write out Zechariah 2:8 and put it somewhere you\u2019ll see it daily. Let it reshape how you think about yourself.", "When comparison or rejection hits today, deliberately replace that voice with: \"I am the apple of God\u2019s eye.\"", "Extend this truth to someone else. Tell one person today that they are precious, valued, and seen."],
      reflectionQuestion: "How would knowing you are the apple of God\u2019s eye change the way you respond to rejection, comparison, or self-doubt?",
      todayAction: "Write out \"I am the apple of God\u2019s eye\" and stick it on your mirror, phone wallpaper, or desk. When doubt or comparison speaks today, read it aloud.",
    },
    "The Lord Will Dwell Among You": {
      fullTeaching: "\"Shout and be glad, Daughter Zion. For I am coming, and I will live among you.\"\n\nThe whole arc of Zechariah 2 builds to this: God\u2019s presence. Not blessings. Not strategies. Not even revival programmes. Presence. God with you. God among you. God in you.\n\nThis is the thread that runs through all of Scripture. In Eden, God walked with Adam and Eve. In the tabernacle, He dwelt among Israel. In Jesus, \"the Word became flesh and dwelt among us.\" At Pentecost, the Spirit took up permanent residence in believers. And in Revelation, the final vision is of God dwelling with His people forever: \"He will dwell with them, and they will be his people.\"\n\nThe entire biblical story is a love story about God moving closer.\n\nFor the exiles returning to Jerusalem, this promise was almost too good to believe. They\u2019d been in Babylon for seventy years. God had felt distant. The temple was gone. The glory had departed. And now God says: I\u2019m coming back. And this time, many nations will join in.\n\nA young man from Birmingham recently shared his story at a prayer gathering. He\u2019d grown up in church, walked away during university, spent three years chasing everything the world offered \u2014 parties, success, approval. He described it as \"building my own Babylon.\" Then, during a lockdown, alone in his flat with nothing to distract him, he opened the Bible app on his phone for the first time in years. Something broke. He started reading, then praying, then weeping. \"God didn\u2019t come back to me like a judge,\" he said. \"He came back like a father running down the road.\"\n\nThat\u2019s the promise of Zechariah 2: God doesn\u2019t just want to bless you from a distance. He wants to dwell with you. In the ordinary. In the messy. In the uncertain.\n\nIf this series has stirred something in you, the Lessons from Zechariah 2 reading plan goes deeper into what it means to live as someone God has called, protected, and chosen to dwell among.\n\nHis presence is the point of everything. Not the gifts. Not the miracles. Not even the revival. The presence. Make room for it today.",
      contextBackground: "Zechariah 2:10-11 concludes the prophet\u2019s second vision with a promise that extends beyond Israel to \"many nations.\" This universalising vision anticipates the New Testament reality where God\u2019s presence is available to all people through Christ. The Hebrew word for \"dwell\" (shakan) is the root of \"Shekinah\" \u2014 the manifest, visible presence of God among His people. The prophecy points both to the rebuilt temple and ultimately to Christ, in whom \"all the fullness of the Deity lives in bodily form\" (Colossians 2:9).",
      applicationPoints: ["Spend 10 minutes today simply being with God. No requests. No agenda. Just presence.", "Thank God for one specific way you\u2019ve sensed His nearness recently \u2014 even if it was subtle.", "Invite His presence into one ordinary moment today: a commute, a meal, a meeting. Consciously acknowledge that He\u2019s there."],
      reflectionQuestion: "What would change in your daily life if you genuinely believed God wants to dwell with you \u2014 not just bless you from a distance?",
      todayAction: "Spend 10 minutes today simply being with God. No requests, no list, no music. Just say: \"Lord, I\u2019m here. Dwell with me.\" Let His presence be enough.",
    },
  };

  const sparks: any[] = [];
  const reflectionCards: any[] = [];

  for (let day = 0; day < totalDays; day++) {
    const date = new Date(campaignStart);
    date.setDate(date.getDate() + day);
    const dailyDate = date.toISOString().split('T')[0];
    const publishAt = new Date(dailyDate + 'T05:00:00.000Z');

    // Cycle through 38 revival themes
    const themeIndex = day % 38;
    const theme = dayThemes[themeIndex];
    const desc = descriptions[theme.title] || theme.title;
    const prayer = prayerLines[theme.title] || "Lord, guide me today.";

    const teaching = teachings[theme.title];

    for (const segment of segments) {
      sparks.push({
        title: theme.title,
        description: desc,
        category: 'daily-devotional',
        mediaType: 'video',
        duration: 120,
        scriptureRef: theme.scripture,
        fullPassage: theme.passage,
        status: day === 0 ? 'published' : 'scheduled',
        publishAt,
        dailyDate,
        featured: theme.featured,
        prayerLine: prayer,
        ctaPrimary: 'Pray',
        thumbnailText: theme.title.split(':')[0].substring(0, 20),
        weekTheme: theme.week,
        audienceSegment: segment,
        fullTeaching: teaching.fullTeaching,
        contextBackground: teaching.contextBackground,
        applicationPoints: teaching.applicationPoints,
        todayAction: teaching.todayAction,
        reflectionQuestion: teaching.reflectionQuestion,
        imageUrl: theme.imageUrl,
      });
    }

    for (const segment of segments) {
      reflectionCards.push({
        baseQuote: desc.split('.')[0] + '.',
        question: teaching.reflectionQuestion,
        action: teaching.todayAction.split('.')[0] + '.',
        faithOverlayScripture: theme.scripture,
        publishAt,
        dailyDate,
        status: day === 0 ? 'published' : 'scheduled',
        weekTheme: theme.week,
        audienceSegment: segment,
      });
    }
  }

  return { sparks, reflectionCards };
}

function getBlogSeedContent() {
  return [
    {
      title: "The Lord is My Shepherd - A Psalm 23 Journey (Part 1)",
      slug: "psalm-23-the-lord-is-my-shepherd",
      excerpt: "Begin a transformative journey through Psalm 23. Discover the profound comfort of knowing the Lord as your personal Shepherd.",
      content: `## The Lord is My Shepherd

**Scripture:** "The Lord is my shepherd; I shall not want." - Psalm 23:1

### Reflection

In ancient Israel, a shepherd was everything to their flock. They provided protection, guidance, provision, and constant companionship. When David wrote these words, he wasn't speaking theoretically—he had been a shepherd himself.

The beauty of this declaration lies in its personal nature: "The Lord is **my** shepherd." Not just a distant God, but a personal guide walking with you through every season of life.

When you embrace God as your Shepherd, something shifts. The anxiety of provision fades. The fear of the unknown diminishes. You begin to trust that the One who leads you knows the path ahead.

### Prayer

Lord, help me trust You as my Shepherd today. When I feel lost, remind me that You are guiding my steps. When I feel lacking, remind me that You are my provider. Amen.

### Take Action

Join our WhatsApp community to connect with others on this journey of faith.`,
      coverImageUrl: "/attached_assets/the_lord_is_my_shepherd_1765592424280.png",
      authorId: "system",
      category: "Faith & Culture",
    },
    {
      title: "Finding Rest in God - A Psalm 23 Journey (Part 2)",
      slug: "psalm-23-rest-in-meadow-grass",
      excerpt: "Experience the peace that comes when you allow God to lead you to places of rest and restoration.",
      content: `## He Lets Me Rest in the Meadow Grass

**Scripture:** "He makes me lie down in green pastures. He leads me beside still waters." - Psalm 23:2

### Reflection

In our always-on culture, rest feels like a luxury we can't afford. But God doesn't just suggest rest—He makes us lie down. Sometimes He orchestrates circumstances that force us to pause, to breathe, to be still.

The green pastures and still waters aren't just about physical rest. They represent spiritual nourishment and emotional peace. God knows you need both activity and rest, both movement and stillness.

When was the last time you truly rested? Not just slept, but rested in God's presence? He's inviting you to those meadow pastures today.

### Prayer

Father, teach me to rest in Your presence. Quiet my anxious thoughts and lead me beside Your still waters. Restore my soul today. Amen.

### Take Action

Share your testimony of how God has brought you peace in chaotic times.`,
      coverImageUrl: "/attached_assets/the_lord_is_my_shepherd_(4)_1765592424277.png",
      authorId: "system",
      category: "Faith & Culture",
    },
    {
      title: "Fearless Through the Valley - A Psalm 23 Journey (Part 3)",
      slug: "psalm-23-valley-of-death",
      excerpt: "Learn to walk through life's darkest valleys without fear, knowing your Shepherd is with you.",
      content: `## Walking Through the Dark Valley of Death, I Will Not Be Afraid

**Scripture:** "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me." - Psalm 23:4

### Reflection

Notice that David says "through" the valley, not "around" it. Sometimes God's path takes us through dark places—grief, loss, uncertainty, fear. But the Shepherd doesn't abandon us at the valley's entrance.

The key to walking through darkness without fear isn't pretending the darkness doesn't exist. It's knowing that Someone walks with you who has already conquered the darkness. His rod protects you from predators; His staff guides your steps when you can't see the path.

Whatever valley you're facing today, you're not walking alone. The Shepherd is with you.

### Prayer

Lord, in my darkest moments, help me feel Your presence. When I cannot see the way forward, help me trust that You are guiding my steps. I choose not to fear, because You are with me. Amen.

### Take Action

Submit a prayer request if you're walking through a difficult season. Let us stand with you.`,
      coverImageUrl: "/attached_assets/the_lord_is_my_shepherd_(6)_1765592424278.png",
      authorId: "system",
      category: "Faith & Culture",
    },
    {
      title: "Goodness and Kindness Forever - A Psalm 23 Journey (Part 4)",
      slug: "psalm-23-goodness-kindness",
      excerpt: "Discover the promise that God's goodness and unfailing love will follow you all the days of your life.",
      content: `## Your Goodness and Unfailing Kindness Shall Be With Me All of My Life

**Scripture:** "Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the Lord forever." - Psalm 23:6

### Reflection

What a declaration to end this psalm! David doesn't say goodness and mercy *might* follow—he says they *surely* will. This isn't wishful thinking; it's confident faith in a faithful God.

The Hebrew word for "follow" here can also mean "pursue." God's goodness isn't passive; it actively chases after you. Even when you wander, even when you doubt, His unfailing kindness pursues you.

And the promise extends beyond this life. We will dwell in the house of the Lord forever. Every valley, every green pasture, every shadow—they all lead to an eternal home with our Shepherd.

### Prayer

Thank You, Lord, for Your relentless goodness that pursues me. Thank You that my journey with You doesn't end in this life but continues forever. Help me share this hope with others. Amen.

### Take Action

Share this devotional series with someone who needs encouragement today.`,
      coverImageUrl: "/attached_assets/the_lord_is_my_shepherd_(8)_1765592424280.png",
      authorId: "system",
      category: "Faith & Culture",
    },
  ];
}

function getEventSeedContent() {
  const SUPER_ADMIN_ID = "49038710";

  return [
    {
      title: "Fresh Start: Creative & Fun Evening",
      description: "Feeling the winter slump or just ready for a reset? Come through for a cosy, creative afternoon with h...",
      type: "community",
      location: "Buckingham",
      startDate: new Date("2026-01-31T16:00:00.000Z"),
      endDate: new Date("2026-01-31T20:00:00.000Z"),
      imageUrl: "/attached_assets/generated_images/group_discussion_in_a_living_room.png",
      createdBy: SUPER_ADMIN_ID,
    },
    {
      title: "Mission Training Weekend",
      description: "Join our online training sessions to equip yourself for global mission. Two powerful evenings of teaching, Q&A, and commissioning.",
      type: "training",
      location: "Online",
      startDate: new Date("2026-03-07T19:00:00.000Z"),
      endDate: new Date("2026-03-08T21:00:00.000Z"),
      createdBy: SUPER_ADMIN_ID,
    },
    {
      title: "Campus Spark Night",
      description: "A night of unified prayer & Worship for campuses across the UK, US, and beyond. Join us as we lift up student leaders and pray for revival on university campuses.",
      type: "prayer-night",
      location: "Online",
      startDate: new Date("2026-02-07T19:00:00.000Z"),
      endDate: new Date("2026-02-07T21:00:00.000Z"),
      createdBy: SUPER_ADMIN_ID,
    },
    {
      title: "Global Outreach Conference",
      description: "Our annual missions conference bringing together young people passionate about reaching the nations. Hear from field workers, worship together, and get equipped for your calling. Dates: September/October 2026 (TBC).",
      type: "outreach",
      location: "London, UK",
      startDate: new Date("2026-09-01T09:00:00.000Z"),
      endDate: new Date("2026-10-31T17:00:00.000Z"),
      createdBy: SUPER_ADMIN_ID,
    },
    {
      title: "Tech Hub Launch",
      description: "Explore how technology can be leveraged for kingdom impact. Network with Christian tech professionals and learn about digital missions opportunities.",
      type: "tech-hub",
      location: "Online",
      startDate: new Date("2026-02-21T18:00:00.000Z"),
      endDate: new Date("2026-02-21T20:00:00.000Z"),
      createdBy: SUPER_ADMIN_ID,
    },
  ];
}

export async function seedJourneys(): Promise<void> {
  try {
    const existingJourneys = await storage.getJourneys();
    if (existingJourneys.length > 0) {
      console.log(`[Auto-Seed] Skipping journeys (${existingJourneys.length} already exist).`);
      return;
    }

    console.log('[Auto-Seed] Seeding journeys...');
    const journeys = getJourneySeedContent();
    let journeysSeeded = 0;

    for (const journey of journeys) {
      await storage.createJourney(journey);
      journeysSeeded++;
    }

    console.log(`[Auto-Seed] Seeded ${journeysSeeded} journeys.`);
  } catch (error) {
    console.error('[Auto-Seed] Error seeding journeys:', error);
  }
}

function getJourneySeedContent() {
  return [
    {
      slug: "foundations-of-faith",
      title: "Foundations of Faith",
      subtitle: "Build your faith on solid ground",
      description: "A 7-day journey through the core beliefs of Christianity. Perfect for new believers or anyone wanting to strengthen their foundational understanding of who God is and what He has done for us.",
      category: "faith-basics",
      durationDays: 7,
      level: "beginner",
      heroImageUrl: "/attached_assets/generated_images/young_people_at_a_coffee_shop_bible_study-DG5CkE7V.png",
      isPublished: "true",
    },
    {
      slug: "discovering-your-purpose",
      title: "Discovering Your Purpose",
      subtitle: "Find clarity for your calling",
      description: "A 14-day journey to help you understand God's unique purpose for your life. Through scripture, reflection, and practical exercises, you'll gain clarity on your gifts, passions, and how God wants to use you.",
      category: "purpose",
      durationDays: 14,
      level: "intermediate",
      heroImageUrl: "/attached_assets/generated_images/backpacker_overlooking_a_landscape-Dac9B8ii.png",
      isPublished: "true",
    },
    {
      slug: "overcoming-anxiety",
      title: "Overcoming Anxiety",
      subtitle: "Find peace in God's presence",
      description: "A 21-day journey for anyone struggling with worry, stress, or anxiety. Learn biblical strategies for finding peace, managing anxious thoughts, and resting in God's faithful care.",
      category: "anxiety",
      durationDays: 21,
      level: "beginner",
      heroImageUrl: "/attached_assets/generated_images/peaceful_nature_scen_fe6f1282-vPXC0jKD.jpg",
      isPublished: "true",
    },
    {
      slug: "healthy-relationships",
      title: "Building Healthy Relationships",
      subtitle: "Love God, love others well",
      description: "A 10-day journey exploring what the Bible says about friendships, dating, and community. Learn practical wisdom for navigating relationships with grace and truth.",
      category: "relationships",
      durationDays: 10,
      level: "intermediate",
      heroImageUrl: "/attached_assets/generated_images/diverse_group_taking_a_selfie-BJcfhr8H.png",
      isPublished: "true",
    },
    {
      slug: "prayer-life",
      title: "Deepening Your Prayer Life",
      subtitle: "Grow in intimacy with God",
      description: "A 7-day journey to transform your prayer life. Discover different ways to pray, overcome common obstacles, and experience the joy of ongoing conversation with your Heavenly Father.",
      category: "faith-basics",
      durationDays: 7,
      level: "beginner",
      heroImageUrl: "/attached_assets/generated_images/person_praying_hands_2c083135-BiB2O1YS.jpg",
      isPublished: "true",
    },
    {
      slug: "identity-in-christ",
      title: "Your Identity in Christ",
      subtitle: "Know who you truly are",
      description: "A 14-day journey through what Scripture says about who you are in Christ. Break free from false identities and embrace the truth of being God's beloved child.",
      category: "purpose",
      durationDays: 14,
      level: "intermediate",
      heroImageUrl: "/attached_assets/generated_images/young_man_praying_with_golden_light_overlay-RgKbkVhv.png",
      isPublished: "true",
    },
  ];
}
