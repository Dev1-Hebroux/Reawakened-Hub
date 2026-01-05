import { storage } from "./storage";

export async function autoSeedDominionContent(): Promise<void> {
  try {
    console.log('[Auto-Seed] Running full DOMINION content sync...');
    
    // Always run a full upsert to ensure all 180 sparks and 180 reflection cards exist
    // This handles both initial seeding and updates to existing content
    
    const content = getDominionSeedContent();
    
    let sparksUpserted = 0;
    let reflectionsUpserted = 0;
    let blogsUpserted = 0;
    
    // Use upsert to create or update each spark
    for (const spark of content.sparks) {
      await storage.upsertSpark(spark);
      sparksUpserted++;
    }
    
    // Use upsert to create or update each reflection card
    for (const card of content.reflectionCards) {
      await storage.upsertReflectionCard(card);
      reflectionsUpserted++;
    }
    
    // Upsert blog posts
    const blogPosts = getBlogSeedContent();
    for (const blog of blogPosts) {
      await storage.upsertBlogPost(blog);
      blogsUpserted++;
    }
    
    // Upsert events
    let eventsUpserted = 0;
    const events = getEventSeedContent();
    for (const event of events) {
      await storage.upsertEvent(event);
      eventsUpserted++;
    }
    
    console.log(`[Auto-Seed] Complete: ${sparksUpserted} sparks, ${reflectionsUpserted} reflection cards, ${blogsUpserted} blog posts, ${eventsUpserted} events synced.`);
    
    // Validate counts - use exact date range for DOMINION campaign (Jan 3 - Feb 1, 2026)
    const allSparks = await storage.getSparks();
    const dominionSparks = allSparks.filter((s: any) => {
      if (!s.dailyDate) return false;
      return s.dailyDate >= '2026-01-03' && s.dailyDate <= '2026-02-01';
    });
    console.log(`[Auto-Seed] Validation: ${dominionSparks.length} DOMINION sparks in database (expected: 180).`);
  } catch (error) {
    console.error('[Auto-Seed] Error syncing DOMINION content:', error);
  }
}

function getDominionSeedContent() {
  const segments = [null, 'schools', 'universities', 'early-career', 'builders', 'couples'];
  const campaignStart = new Date('2026-01-03');
  
  const dayThemes = [
    { title: "Dominion Begins with Belonging", scripture: "Romans 8:15-17", week: "Week 1: Identity & Belonging", featured: true, passage: "For you didn't receive the spirit of bondage again to fear, but you received the Spirit of adoption, by whom we cry, 'Abba! Father!' The Spirit himself testifies with our spirit that we are children of God; and if children, then heirs—heirs of God and joint heirs with Christ." },
    { title: "Seated, Not Shaken", scripture: "Ephesians 2:4-6", week: "Week 1: Identity & Belonging", featured: false, passage: "But God, being rich in mercy, for his great love with which he loved us, even when we were dead through our trespasses, made us alive together with Christ—by grace you have been saved—and raised us up with him, and made us to sit with him in the heavenly places in Christ Jesus." },
    { title: "Chosen for Influence", scripture: "1 Peter 2:9", week: "Week 1: Identity & Belonging", featured: false, passage: "But you are a chosen race, a royal priesthood, a holy nation, a people for God's own possession, that you may proclaim the excellence of him who called you out of darkness into his marvelous light." },
    { title: "Testimony: From Pressure to Peace", scripture: "John 14:27", week: "Week 1: Identity & Belonging", featured: false, passage: "Peace I leave with you. My peace I give to you; not as the world gives, I give to you. Don't let your heart be troubled, neither let it be fearful." },
    { title: "Dominion Through Love", scripture: "1 John 4:18-19", week: "Week 1: Identity & Belonging", featured: false, passage: "There is no fear in love; but perfect love casts out fear, because fear has punishment. He who fears is not made perfect in love. We love him, because he first loved us." },
    { title: "Living Light in Darkness", scripture: "Matthew 5:14-16", week: "Week 1: Identity & Belonging", featured: false, passage: "You are the light of the world. A city located on a hill can't be hidden. Neither do you light a lamp and put it under a measuring basket, but on a stand; and it shines to all who are in the house. Even so, let your light shine before men, that they may see your good works and glorify your Father who is in heaven." },
    { title: "Power to Stand", scripture: "Ephesians 6:10-13", week: "Week 2: Prayer & Presence", featured: false, passage: "Finally, be strong in the Lord and in the strength of his might. Put on the whole armor of God, that you may be able to stand against the wiles of the devil. For our wrestling is not against flesh and blood, but against the principalities, against the powers, against the world's rulers of the darkness of this age, and against the spiritual forces of wickedness in the heavenly places." },
    { title: "When Stillness Speaks", scripture: "Psalm 46:10", week: "Week 2: Prayer & Presence", featured: false, passage: "Be still, and know that I am God. I will be exalted among the nations. I will be exalted in the earth." },
    { title: "Prayer That Moves Mountains", scripture: "Mark 11:22-24", week: "Week 2: Prayer & Presence", featured: false, passage: "Jesus answered them, 'Have faith in God. For most certainly I tell you, whoever may tell this mountain, \"Be taken up and cast into the sea,\" and doesn't doubt in his heart, but believes that what he says is happening, he shall have whatever he says. Therefore I tell you, all things whatever you pray and ask for, believe that you have received them, and you shall have them.'" },
    { title: "Testimony: Breakthrough Came", scripture: "James 5:16", week: "Week 2: Prayer & Presence", featured: false, passage: "Confess your offenses to one another, and pray for one another, that you may be healed. The insistent prayer of a righteous person is powerfully effective." },
    { title: "In His Presence", scripture: "Psalm 16:11", week: "Week 2: Prayer & Presence", featured: false, passage: "You will show me the path of life. In your presence is fullness of joy. In your right hand there are pleasures forever more." },
    { title: "The Secret Place", scripture: "Matthew 6:6", week: "Week 2: Prayer & Presence", featured: false, passage: "But you, when you pray, enter into your inner room, and having shut your door, pray to your Father who is in secret; and your Father who sees in secret will reward you openly." },
    { title: "Peace That Guards", scripture: "Philippians 4:6-7", week: "Week 3: Peace & Anxiety", featured: false, passage: "In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus." },
    { title: "Cast Your Cares", scripture: "1 Peter 5:7", week: "Week 3: Peace & Anxiety", featured: false, passage: "Casting all your worries on him, because he cares for you." },
    { title: "Anxiety to Trust", scripture: "Proverbs 3:5-6", week: "Week 3: Peace & Anxiety", featured: false, passage: "Trust in the Lord with all your heart, and don't lean on your own understanding. In all your ways acknowledge him, and he will make your paths straight." },
    { title: "Testimony: From Overwhelm to Overflow", scripture: "Isaiah 26:3", week: "Week 3: Peace & Anxiety", featured: false, passage: "You will keep whoever's mind is steadfast in perfect peace, because he trusts in you." },
    { title: "Mind Renewed", scripture: "Romans 12:2", week: "Week 3: Peace & Anxiety", featured: false, passage: "Don't be conformed to this world, but be transformed by the renewing of your mind, so that you may prove what is the good, well-pleasing, and perfect will of God." },
    { title: "Rest for the Weary", scripture: "Matthew 11:28-30", week: "Week 3: Peace & Anxiety", featured: false, passage: "Come to me, all you who labor and are heavily burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart; and you will find rest for your souls. For my yoke is easy, and my burden is light." },
    { title: "Speak Up", scripture: "Acts 1:8", week: "Week 4: Bold Witness", featured: false, passage: "But you will receive power when the Holy Spirit has come upon you. You will be witnesses to me in Jerusalem, in all Judea and Samaria, and to the uttermost parts of the earth." },
    { title: "Your Story Matters", scripture: "Revelation 12:11", week: "Week 4: Bold Witness", featured: false, passage: "They overcame him because of the Lamb's blood, and because of the word of their testimony. They didn't love their life, even to death." },
    { title: "Love in Action", scripture: "1 John 3:18", week: "Week 4: Bold Witness", featured: false, passage: "My little children, let's not love in word only, or with the tongue only, but in deed and truth." },
    { title: "Testimony: One Conversation Changed Everything", scripture: "Romans 10:14-15", week: "Week 4: Bold Witness", featured: false, passage: "How then will they call on him in whom they have not believed? How will they believe in him whom they have not heard? How will they hear without a preacher? And how will they preach unless they are sent? As it is written: 'How beautiful are the feet of those who preach the Good News of peace, who bring glad tidings of good things!'" },
    { title: "Courage Over Comfort", scripture: "Joshua 1:9", week: "Week 4: Bold Witness", featured: false, passage: "Haven't I commanded you? Be strong and courageous. Don't be afraid. Don't be dismayed, for the Lord your God is with you wherever you go." },
    { title: "Salt and Light", scripture: "Matthew 5:13-16", week: "Week 4: Bold Witness", featured: false, passage: "You are the salt of the earth, but if the salt has lost its flavor, with what will it be salted? It is then good for nothing, but to be cast out and trodden under the feet of men. You are the light of the world. A city located on a hill can't be hidden." },
    { title: "The Commission", scripture: "Matthew 28:18-20", week: "Week 5: Commission", featured: false, passage: "Jesus came to them and spoke to them, saying, 'All authority has been given to me in heaven and on earth. Go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all things that I commanded you. Behold, I am with you always, even to the end of the age.'" },
    { title: "Go Where You Are", scripture: "Acts 17:26-27", week: "Week 5: Commission", featured: false, passage: "He made from one blood every nation of men to dwell on all the surface of the earth, having determined appointed seasons and the boundaries of their dwellings, that they should seek the Lord, if perhaps they might reach out for him and find him, though he is not far from each one of us." },
    { title: "Faithful in Little", scripture: "Luke 16:10", week: "Week 5: Commission", featured: false, passage: "He who is faithful in a very little is faithful also in much. He who is dishonest in a very little is also dishonest in much." },
    { title: "Testimony: Sent Out", scripture: "Isaiah 6:8", week: "Week 5: Commission", featured: false, passage: "I heard the Lord's voice, saying, 'Whom shall I send, and who will go for us?' Then I said, 'Here I am. Send me!'" },
    { title: "The Harvest is Ready", scripture: "John 4:35", week: "Week 5: Commission", featured: false, passage: "Don't you say, 'There are yet four months until the harvest?' Behold, I tell you, lift up your eyes and look at the fields, that they are white for harvest already." },
    { title: "Until He Returns", scripture: "Matthew 24:14", week: "Week 5: Commission", featured: false, passage: "This Good News of the Kingdom will be preached in the whole world for a testimony to all the nations, and then the end will come." },
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
  
  const teachings: Record<string, { fullTeaching: string; contextBackground: string; applicationPoints: string[] }> = {
    "Dominion Begins with Belonging": {
      fullTeaching: "Dominion does not begin with you trying harder—it begins with you belonging deeper. When your identity feels uncertain, every challenge becomes personal. Pressure doesn't just test your work; it tests your worth. But when your heart is settled in belonging, you can face responsibility without being crushed by it. You're no longer striving to earn significance—you're living from a secure place.\n\nPaul says you did not receive a spirit that pulls you back into fear. That's important because fear always produces performance. It makes you overthink, overwork, and over-control. Fear tells you, \"If you don't prove yourself, you'll be forgotten.\" But the Spirit of adoption tells a different story: \"You are wanted. You are chosen. You are safe.\" That security is where true authority grows.\n\nAdoption is not a sentimental word here—it's a status change. The Spirit leads you to cry \"Abba, Father,\" not as a religious script, but as a real relationship. In other words, dominion is not first about what you do in public; it's about what you believe in private. When your inner world knows you're loved, your outer world becomes steadier, calmer, and more courageous.\n\nAnd then Paul pushes it further: if you are a child, you are an heir. You are not living from scarcity; you are living from inheritance. That doesn't mean you'll never face hardship—Paul even acknowledges suffering—but it does mean hardship doesn't get to define you. Dominion looks like walking through pressure as someone who belongs to God, carries His Spirit, and has a future secured in Christ.",
      contextBackground: "In the Roman world, adoption often meant receiving a new family identity with full legal rights to inheritance. Paul uses that backdrop to show believers are not spiritual slaves trying to avoid punishment, but sons and daughters with real belonging and access to the Father. The phrase \"Abba\" communicates closeness and trust, and the \"Spirit testifying\" speaks to an inner assurance that your identity is not fragile—it is confirmed by God.",
      applicationPoints: ["Notice when fear is driving performance; pause and return to belonging before you respond.", "Start your day from identity (\"I am God's child\") rather than anxiety (\"I must prove myself\").", "Treat pressure as a proving ground for peace, not proof that you're failing."]
    },
    "Seated, Not Shaken": {
      fullTeaching: "Dominion is perspective before it is performance. When life feels loud—when the pressure builds and uncertainty swirls—your first instinct may be to react, to fix, to fight. But God invites you into something different: a seat above the noise.\n\nPaul describes this seat in Ephesians 2. You have been raised with Christ and seated with Him in heavenly places. That's not just poetic language. It's your position. Before you engage the challenges of today, remember where you're seated. You're not beneath the chaos—you're above it, with Him.\n\nThis doesn't mean you ignore reality. It means you engage from a different posture. When fear tries to push you into panic, you can pause and remember: this is not my first battle, and God has already won the war. That truth changes how you show up.\n\nThe enemy wants you to live from reactivity. But dominion is about response, not reaction. Respond from rest. Respond from trust. Respond from the seat God has given you—not because you're passive, but because you're positioned.\n\nToday, don't let circumstances define your capacity. Let your position define your peace.",
      contextBackground: "Ephesians was written to a church navigating pressure from both Roman culture and internal conflict. Paul's language of being 'seated with Christ' reminded them that their identity was not determined by external circumstances but by their union with Jesus. The 'heavenly places' are not a distant future—they describe present spiritual reality and authority.",
      applicationPoints: ["When anxiety rises, pause and declare: 'I am seated, not shaken.'", "Before reacting to a situation, ask: 'What would it look like to respond from rest?'", "Write Ephesians 2:6 somewhere you'll see it today."]
    },
    "Chosen for Influence": {
      fullTeaching: "You are not an afterthought. Before you walked into this day, God had already chosen you—not just for salvation, but for influence. You are called to be a royal priesthood, a people set apart. That phrase is not about exclusion; it's about purpose.\n\nPeter's words to early believers still echo today: you are chosen. You are called. You are meant to declare His praises—not from a stage, but from your life. Influence doesn't always look like visibility. Sometimes it looks like consistency. Sometimes it's the person who shows up steady when everyone else is spiraling.\n\nDominion through influence is not about control. It's about presence. When you walk into a room grounded in who God says you are, the atmosphere shifts. You don't have to demand attention. You can simply carry light.\n\nInfluence grows when you stop trying to prove yourself and start living from your identity. You are not auditioning for acceptance. You've already been chosen. Now, live like it.\n\nToday, carry the confidence of someone who belongs to God—and watch how your presence begins to change the space around you.",
      contextBackground: "Peter wrote to scattered believers who felt like outsiders in their own culture. His words reframed their marginalization: they weren't rejected—they were chosen. The language of 'royal priesthood' echoes Exodus 19, where Israel was called to mediate God's presence to the world. Now, that calling extends to all who follow Jesus.",
      applicationPoints: ["Identify one space today where you can carry light—work, school, home.", "Replace any 'I have to prove myself' thoughts with 'I have already been chosen.'", "Ask God: 'How do You want to use my presence today?'"]
    },
    "Testimony: From Pressure to Peace": {
      fullTeaching: "There's a moment when pressure stops feeling temporary and starts feeling permanent. It builds. It presses. And without warning, it becomes your normal.\n\nThis is the story of someone who lived there—juggling expectations, managing anxiety, and wondering when the weight would lift. For months, they carried it silently, convinced that rest was a luxury and peace was for other people.\n\nBut then something shifted. Not the circumstances. The posture. A simple prayer began to change everything: 'Lord, I can't carry this. I need You to.' It wasn't dramatic. It was desperate. And in that desperation, peace came.\n\nNot the absence of pressure—but a presence in the middle of it. Peace didn't remove the deadline. It gave the strength to face it. Peace didn't change the relationship. It gave the clarity to navigate it.\n\nThis is what Jesus meant when He said, 'My peace I give to you—not as the world gives.' It's not circumstantial. It's supernatural.\n\nIf you're in the middle of pressure today, take a moment. Stop striving. Let go of the illusion of control. And invite peace—not as an escape, but as an anchor.",
      contextBackground: "John 14 records Jesus speaking to His disciples just before His crucifixion. He knew they would face intense pressure, confusion, and fear. His promise of peace was both a present gift and a future assurance: the Holy Spirit would sustain them. The same Spirit offers you peace today.",
      applicationPoints: ["Identify where you've been carrying pressure that's not yours to carry.", "Speak this out loud: 'Lord, I release what I cannot control.'", "Pause three times today to breathe deeply and invite God's peace."]
    },
    "Dominion Through Love": {
      fullTeaching: "Fear shrinks you. It makes you second-guess, hold back, and protect yourself. But love does the opposite. Love expands you. It gives you strength to show up when it's hard, to forgive when it hurts, and to move toward people instead of away from them.\n\nJohn writes that perfect love drives out fear. That's not a feeling—it's a truth. When you are rooted in God's love, fear loses its grip. It doesn't disappear overnight. But it weakens every time you choose love over self-protection.\n\nDominion isn't control. It's not winning every argument or managing every outcome. Dominion is being steady enough in love that you can respond with grace, even when you're provoked.\n\nThink about the hardest relationships in your life. The ones where fear shows up as defensiveness, silence, or control. What would change if love led instead? Not weakness—but the kind of strength that refuses to let fear write the narrative.\n\nToday, choose love. Not because it's easy. But because it's the truest expression of the life God has placed in you.",
      contextBackground: "1 John was written to a community facing confusion about who Jesus was and how believers should live. John's repeated emphasis on love wasn't sentimental—it was corrective. Love was the mark of authentic faith. Fear-based religion was incomplete. The love of God, fully received, transforms how we treat others.",
      applicationPoints: ["Name one relationship where fear has been louder than love.", "Ask God to show you one step of love you can take today.", "Memorize 1 John 4:18 and speak it over any area of fear."]
    }
  };
  
  const defaultTeaching = {
    fullTeaching: "Today's devotional invites you into a deeper understanding of what it means to live with dominion. Dominion is not about control—it's about trust. It's about resting in who God says you are while actively engaging in the world around you.\n\nThe Scripture for today reminds us that our strength comes from surrender, not striving. When we try to carry life on our own, we become exhausted and anxious. But when we learn to lean into God's grace, we find a power that sustains us.\n\nThis is the paradox of the Kingdom: we gain by giving, we find by seeking, and we live by dying to ourselves. Jesus modeled this for us—not through distant commands, but through His very life.\n\nAs you move through today, pay attention to where you're striving. Notice where anxiety is present. And in those moments, pause. Breathe. Invite God into the space. Dominion starts in the hidden places of the heart before it ever shows up in the visible areas of life.\n\nToday, take one step toward trust. Let go of one thing you've been gripping too tightly. And watch how freedom begins to grow.",
    contextBackground: "The passages we explore in this series are rooted in both Old and New Testament themes of identity, authority, and purpose. The original audiences—whether ancient Israel or first-century believers—faced similar challenges to what we face today: pressure, fear, and the temptation to live from performance rather than position. These words still speak with power and relevance.",
    applicationPoints: ["Identify one area where you've been striving and choose to trust instead.", "Spend 5 minutes in stillness, inviting God's presence into your day.", "Share today's truth with one person who might need encouragement."]
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
    
    const teaching = teachings[theme.title] || defaultTeaching;
    
    for (const segment of segments) {
      sparks.push({
        title: theme.title,
        description: desc,
        category: theme.title.includes('Testimony') ? 'testimony' : 'daily-devotional',
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
        todayAction: "Take 2 minutes to reflect on today's message and apply it to one specific situation in your life.",
        reflectionQuestion: "How does today's truth speak to where you are right now?",
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
  return [
    {
      title: "Fresh Start: Creative & Fun Evening",
      description: "Feeling the winter slump or just ready for a reset? Come through for a cosy, creative afternoon with h...",
      type: "community",
      location: "Buckingham",
      startDate: new Date("2026-01-31T16:00:00.000Z"),
      endDate: new Date("2026-01-31T20:00:00.000Z"),
      imageUrl: "/attached_assets/community_event_1765592424280.png",
    },
    {
      title: "Mission Training Weekend",
      description: "Join our online training sessions to equip yourself for global mission. Two powerful evenings of teaching, Q&A, and commissioning.",
      type: "training",
      location: "Online",
      startDate: new Date("2026-01-29T19:00:00.000Z"),
      endDate: new Date("2026-01-30T21:00:00.000Z"),
    },
    {
      title: "Campus Prayer Night",
      description: "A night of unified prayer for campuses across the UK, US, and beyond. Join us as we lift up student leaders and pray for revival on university campuses.",
      type: "prayer-night",
      location: "Online",
      startDate: new Date("2026-02-07T19:00:00.000Z"),
      endDate: new Date("2026-02-07T21:00:00.000Z"),
    },
    {
      title: "Global Outreach Conference",
      description: "Our annual missions conference bringing together young people passionate about reaching the nations. Hear from field workers, worship together, and get equipped for your calling.",
      type: "outreach",
      location: "London, UK",
      startDate: new Date("2026-03-14T09:00:00.000Z"),
      endDate: new Date("2026-03-15T17:00:00.000Z"),
    },
    {
      title: "Tech Hub Launch",
      description: "Explore how technology can be leveraged for kingdom impact. Network with Christian tech professionals and learn about digital missions opportunities.",
      type: "tech-hub",
      location: "Online",
      startDate: new Date("2026-02-21T18:00:00.000Z"),
      endDate: new Date("2026-02-21T20:00:00.000Z"),
    },
  ];
}
