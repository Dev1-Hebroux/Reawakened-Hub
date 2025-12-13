import { db } from "./db";
import { journeys, journeyWeeks, sessionSections, mentorPrompts } from "@shared/schema";

const FYWB_WEEKS = [
  {
    weekNumber: 1,
    title: "Returning to God",
    theme: "Coming Home",
    scriptureRef: "Zechariah 1:3",
    scriptureText: "Return to me, declares the LORD Almighty, and I will return to you.",
    weekType: "session",
    estimatedMinutes: 50,
    sections: [
      { sectionType: "welcome", title: "Buddy Check-In", durationMinutes: 5, content: { prompt: "Share your Win, Struggle, and Prayer request with your buddy." } },
      { sectionType: "scripture", title: "Scripture Reading", durationMinutes: 5, content: { verse: "Zechariah 1:3", text: "Return to me, declares the LORD Almighty, and I will return to you." } },
      { sectionType: "micro-teach", title: "Coming Home", durationMinutes: 10, content: { keyPoints: ["God is always waiting", "The first step is turning around", "He runs to meet you"] } },
      { sectionType: "discussion", title: "Group Discussion", durationMinutes: 15, content: { questions: ["What does 'returning to God' look like for you?", "What has kept you away?", "How does it feel knowing God is waiting?"] } },
      { sectionType: "practice", title: "Come Home Prayer", durationMinutes: 7, content: { activity: "Guided prayer of returning. Say out loud: 'Lord, I'm coming home.'" } },
      { sectionType: "i-will", title: "I Will Commitment", durationMinutes: 5, content: { prompt: "This week, I will _____ to return to God. I will encourage _____." } },
      { sectionType: "prayer", title: "Closing Prayer", durationMinutes: 3, content: { guide: "Pray for each person's commitment. Ask God to strengthen their resolve." } },
    ],
    mentorPrompts: [
      { promptDay: "D-1", promptType: "reminder", title: "Session Reminder", whatsappScript: "Hey! Just a reminder that our Finding Your Way Back session is tomorrow. Looking forward to seeing you! 🙏" },
      { promptDay: "D0", promptType: "recap", title: "Session Recap", whatsappScript: "Great session today on returning to God! Remember your 'I Will' commitment. You've got this! 💪" },
      { promptDay: "D2", promptType: "buddy-check", title: "Buddy Check", whatsappScript: "Hey, have you connected with your buddy yet this week? Don't forget to share your Win/Struggle/Prayer!" },
      { promptDay: "D4", promptType: "mentor-check", title: "Midweek Check-In", whatsappScript: "Hey! How's your week going? How's your 'I Will' commitment going? Any prayer needs?" },
      { promptDay: "D6", promptType: "celebrate", title: "Celebrate Progress", whatsappScript: "Week 1 done! 🎉 How did your commitment go? Proud of you for taking steps back to God!" },
    ],
  },
  {
    weekNumber: 2,
    title: "Jesus and His Way",
    theme: "Following the Teacher",
    scriptureRef: "John 13:34",
    scriptureText: "A new command I give you: Love one another. As I have loved you, so you must love one another.",
    weekType: "session",
    estimatedMinutes: 50,
    sections: [
      { sectionType: "welcome", title: "Buddy Check-In", durationMinutes: 5, content: { prompt: "Share your Win, Struggle, and Prayer request." } },
      { sectionType: "scripture", title: "Beatitudes Reading", durationMinutes: 5, content: { verse: "Matthew 5:3-12", text: "The Beatitudes - Jesus' way of living" } },
      { sectionType: "micro-teach", title: "The Way of Jesus", durationMinutes: 10, content: { keyPoints: ["Jesus invites us to follow His way", "It's about love, not rules", "Small acts of kindness matter"] } },
      { sectionType: "discussion", title: "Group Discussion", durationMinutes: 15, content: { questions: ["Which beatitude speaks to you most?", "How can you live more like Jesus this week?", "What's one kind act you can do?"] } },
      { sectionType: "practice", title: "Kindness Practice", durationMinutes: 7, content: { activity: "Plan one specific act of kindness for someone this week. Write it down." } },
      { sectionType: "i-will", title: "I Will Commitment", durationMinutes: 5, content: { prompt: "This week, I will show kindness by _____. I will encourage _____." } },
      { sectionType: "prayer", title: "Closing Prayer", durationMinutes: 3, content: { guide: "Pray for love to overflow in each person's life." } },
    ],
    mentorPrompts: [
      { promptDay: "D-1", promptType: "reminder", title: "Session Reminder", whatsappScript: "Week 2 tomorrow! We're diving into Jesus and His way of living. See you there! 🙏" },
      { promptDay: "D0", promptType: "recap", title: "Session Recap", whatsappScript: "Loved exploring the Beatitudes with you today! Remember your kindness commitment this week 💛" },
      { promptDay: "D2", promptType: "buddy-check", title: "Buddy Check", whatsappScript: "Buddy check! How are you doing with your kindness act? Connect with your partner!" },
      { promptDay: "D4", promptType: "mentor-check", title: "Midweek Check-In", whatsappScript: "Midweek check! How's following Jesus' way going? Any wins to share?" },
      { promptDay: "D6", promptType: "celebrate", title: "Celebrate Progress", whatsappScript: "Week 2 complete! 🌟 How did your kindness act go? You're becoming more like Jesus!" },
    ],
  },
  {
    weekNumber: 3,
    title: "Prayer That Feels Real",
    theme: "Talking to God",
    scriptureRef: "Philippians 4:6-7",
    scriptureText: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
    weekType: "session",
    estimatedMinutes: 50,
    sections: [
      { sectionType: "welcome", title: "Buddy Check-In", durationMinutes: 5, content: { prompt: "Share your Win, Struggle, and Prayer request." } },
      { sectionType: "scripture", title: "Scripture Reading", durationMinutes: 5, content: { verse: "Philippians 4:6-7", text: "Do not be anxious about anything..." } },
      { sectionType: "micro-teach", title: "ACTS Prayer", durationMinutes: 10, content: { keyPoints: ["A - Adoration (praise God)", "C - Confession (be honest)", "T - Thanksgiving (be grateful)", "S - Supplication (ask)"] } },
      { sectionType: "discussion", title: "Group Discussion", durationMinutes: 15, content: { questions: ["What makes prayer feel fake or forced?", "When has prayer felt real to you?", "Which part of ACTS is hardest for you?"] } },
      { sectionType: "practice", title: "5-Minute ACTS", durationMinutes: 7, content: { activity: "Practice ACTS prayer together. 1 min each section. Just talk to God." } },
      { sectionType: "i-will", title: "I Will Commitment", durationMinutes: 5, content: { prompt: "This week, I will pray using ACTS for 5 minutes x 5 days. I will encourage _____." } },
      { sectionType: "prayer", title: "Closing Prayer", durationMinutes: 3, content: { guide: "Pray that prayer becomes natural and life-giving for everyone." } },
    ],
    mentorPrompts: [
      { promptDay: "D-1", promptType: "reminder", title: "Session Reminder", whatsappScript: "Tomorrow we're learning about prayer that actually feels real. Excited! 🙏" },
      { promptDay: "D0", promptType: "recap", title: "Session Recap", whatsappScript: "Great session on ACTS prayer! Remember: 5 mins x 5 days. You've got this! 💬" },
      { promptDay: "D2", promptType: "buddy-check", title: "Buddy Check", whatsappScript: "How's the ACTS prayer going? Check in with your buddy!" },
      { promptDay: "D4", promptType: "mentor-check", title: "Midweek Check-In", whatsappScript: "Hey! How's prayer been this week? Any breakthroughs or struggles?" },
      { promptDay: "D6", promptType: "celebrate", title: "Celebrate Progress", whatsappScript: "Week 3 done! 🔥 First half complete! How many days did you pray? Celebrate that!" },
    ],
  },
  {
    weekNumber: 4,
    title: "Bible Confidence",
    theme: "DBS: Reading Scripture",
    scriptureRef: "Psalm 23",
    scriptureText: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures...",
    weekType: "dbs",
    estimatedMinutes: 53,
    sections: [
      { sectionType: "welcome", title: "Buddy Check-In", durationMinutes: 5, content: { prompt: "Win / Struggle / Prayer" } },
      { sectionType: "scripture", title: "Read Aloud", durationMinutes: 5, content: { verse: "Psalm 23 or John 1:1-5", text: "Read the passage aloud as a group" } },
      { sectionType: "micro-teach", title: "DBS Method Intro", durationMinutes: 8, content: { keyPoints: ["Read it twice", "What does it say?", "What does it mean to me?", "What will I do?"] } },
      { sectionType: "discussion", title: "DBS Discussion", durationMinutes: 20, content: { questions: ["What stands out to you?", "What does this teach about God?", "What does this teach about us?", "How can you apply this?"] } },
      { sectionType: "practice", title: "Personal Reflection", durationMinutes: 7, content: { activity: "Write one verse that speaks to you and why." } },
      { sectionType: "i-will", title: "I Will Commitment", durationMinutes: 5, content: { prompt: "I will read this passage again on my own this week. I will _____. I will encourage _____." } },
      { sectionType: "prayer", title: "Closing Prayer", durationMinutes: 3, content: { guide: "Pray the passage over each other." } },
    ],
    mentorPrompts: [
      { promptDay: "D-1", promptType: "reminder", title: "Session Reminder", whatsappScript: "Week 4 tomorrow! We start DBS - Discovery Bible Study. It's going to be powerful! 📖" },
      { promptDay: "D0", promptType: "recap", title: "Session Recap", whatsappScript: "DBS Week 1 done! Remember to re-read the passage this week. The Word is alive! 📖" },
      { promptDay: "D2", promptType: "buddy-check", title: "Buddy Check", whatsappScript: "Have you re-read Psalm 23 yet? Share what stood out with your buddy!" },
      { promptDay: "D4", promptType: "mentor-check", title: "Midweek Check-In", whatsappScript: "How's the Bible reading going? What's God showing you?" },
      { promptDay: "D6", promptType: "celebrate", title: "Celebrate Progress", whatsappScript: "Week 4 complete! 📖 You're building Bible confidence. Keep going!" },
    ],
  },
  {
    weekNumber: 5,
    title: "Faith in Daily Life",
    theme: "DBS: Living It Out",
    scriptureRef: "James 1:22-25",
    scriptureText: "Do not merely listen to the word, and so deceive yourselves. Do what it says.",
    weekType: "dbs",
    estimatedMinutes: 53,
    sections: [
      { sectionType: "welcome", title: "Buddy Check-In", durationMinutes: 5, content: { prompt: "Win / Struggle / Prayer" } },
      { sectionType: "scripture", title: "Read Aloud", durationMinutes: 5, content: { verse: "James 1:22-25", text: "Be doers of the word, not hearers only" } },
      { sectionType: "micro-teach", title: "Faith in Action", durationMinutes: 8, content: { keyPoints: ["Faith without works is dead", "Small obedience matters", "Start where you are"] } },
      { sectionType: "discussion", title: "DBS Discussion", durationMinutes: 20, content: { questions: ["Where has your faith been just 'hearing'?", "What's one area God is calling you to act?", "What's holding you back?"] } },
      { sectionType: "practice", title: "Action Planning", durationMinutes: 7, content: { activity: "Identify one specific action to take this week based on the passage." } },
      { sectionType: "i-will", title: "I Will Commitment", durationMinutes: 5, content: { prompt: "I will put my faith into action by _____. I will encourage _____." } },
      { sectionType: "prayer", title: "Closing Prayer", durationMinutes: 3, content: { guide: "Pray for courage to act on faith." } },
    ],
    mentorPrompts: [
      { promptDay: "D-1", promptType: "reminder", title: "Session Reminder", whatsappScript: "Tomorrow: Faith in Daily Life. Ready to put faith into action? 💪" },
      { promptDay: "D0", promptType: "recap", title: "Session Recap", whatsappScript: "Great DBS today! Remember: be a doer, not just a hearer. You've got this!" },
      { promptDay: "D2", promptType: "buddy-check", title: "Buddy Check", whatsappScript: "How's your faith-action going? Check in with your buddy!" },
      { promptDay: "D4", promptType: "mentor-check", title: "Midweek Check-In", whatsappScript: "Hey! How's putting faith into action going? Any victories?" },
      { promptDay: "D6", promptType: "celebrate", title: "Celebrate Progress", whatsappScript: "Week 5 done! 🎯 Over halfway there. Your faith is growing!" },
    ],
  },
  {
    weekNumber: 6,
    title: "Community & Belonging",
    theme: "DBS: Together",
    scriptureRef: "Acts 2:42-47",
    scriptureText: "They devoted themselves to the apostles' teaching and to fellowship, to the breaking of bread and to prayer.",
    weekType: "dbs",
    estimatedMinutes: 53,
    sections: [
      { sectionType: "welcome", title: "Buddy Check-In", durationMinutes: 5, content: { prompt: "Win / Struggle / Prayer" } },
      { sectionType: "scripture", title: "Read Aloud", durationMinutes: 5, content: { verse: "Acts 2:42-47", text: "The early church community" } },
      { sectionType: "micro-teach", title: "Why Community", durationMinutes: 8, content: { keyPoints: ["We're made for connection", "Isolation is the enemy's strategy", "Vulnerability builds trust"] } },
      { sectionType: "discussion", title: "DBS Discussion", durationMinutes: 20, content: { questions: ["What draws you to community?", "What makes community hard?", "How can this group support you?"] } },
      { sectionType: "practice", title: "Connection Practice", durationMinutes: 7, content: { activity: "Share one thing you appreciate about someone in the group." } },
      { sectionType: "i-will", title: "I Will Commitment", durationMinutes: 5, content: { prompt: "I will invest in community by _____. I will encourage _____." } },
      { sectionType: "prayer", title: "Closing Prayer", durationMinutes: 3, content: { guide: "Pray for unity and deeper connection." } },
    ],
    mentorPrompts: [
      { promptDay: "D-1", promptType: "reminder", title: "Session Reminder", whatsappScript: "Week 6 tomorrow! Community & Belonging - one of my favorites! 🤝" },
      { promptDay: "D0", promptType: "recap", title: "Session Recap", whatsappScript: "Loved the connection today! Remember, you're not alone on this journey 💙" },
      { promptDay: "D2", promptType: "buddy-check", title: "Buddy Check", whatsappScript: "How are you investing in community? Connect with your buddy!" },
      { promptDay: "D4", promptType: "mentor-check", title: "Midweek Check-In", whatsappScript: "Hey! How's community going? Any connections made this week?" },
      { promptDay: "D6", promptType: "celebrate", title: "Celebrate Progress", whatsappScript: "Week 6 complete! 🤝 You're building real community. Two more weeks!" },
    ],
  },
  {
    weekNumber: 7,
    title: "Serving Like Jesus",
    theme: "DBS: Service",
    scriptureRef: "John 13:1-17",
    scriptureText: "Now that I, your Lord and Teacher, have washed your feet, you also should wash one another's feet.",
    weekType: "dbs",
    estimatedMinutes: 53,
    sections: [
      { sectionType: "welcome", title: "Buddy Check-In", durationMinutes: 5, content: { prompt: "Win / Struggle / Prayer" } },
      { sectionType: "scripture", title: "Read Aloud", durationMinutes: 5, content: { verse: "John 13:1-17", text: "Jesus washes the disciples' feet" } },
      { sectionType: "micro-teach", title: "The Servant Heart", durationMinutes: 8, content: { keyPoints: ["Jesus led by serving", "No task is beneath you", "Service is love in action"] } },
      { sectionType: "discussion", title: "DBS Discussion", durationMinutes: 20, content: { questions: ["How does serving feel to you?", "Who can you serve this week?", "What holds you back from serving?"] } },
      { sectionType: "practice", title: "Service Planning", durationMinutes: 7, content: { activity: "Plan one specific way to serve someone this week." } },
      { sectionType: "i-will", title: "I Will Commitment", durationMinutes: 5, content: { prompt: "I will serve _____ by _____. I will encourage _____." } },
      { sectionType: "prayer", title: "Closing Prayer", durationMinutes: 3, content: { guide: "Pray for servant hearts." } },
    ],
    mentorPrompts: [
      { promptDay: "D-1", promptType: "reminder", title: "Session Reminder", whatsappScript: "Almost there! Week 7 tomorrow: Serving Like Jesus. 🙌" },
      { promptDay: "D0", promptType: "recap", title: "Session Recap", whatsappScript: "Powerful session on serving! Go wash some feet this week (metaphorically!) 👣" },
      { promptDay: "D2", promptType: "buddy-check", title: "Buddy Check", whatsappScript: "How's your service going? Share with your buddy!" },
      { promptDay: "D4", promptType: "mentor-check", title: "Midweek Check-In", whatsappScript: "Hey! How did serving go? Any stories to share?" },
      { promptDay: "D6", promptType: "celebrate", title: "Celebrate Progress", whatsappScript: "Week 7 done! 🙌 One more week! You're becoming like Jesus!" },
    ],
  },
  {
    weekNumber: 8,
    title: "Sharing Your Faith",
    theme: "DBS: Testimony",
    scriptureRef: "1 Peter 3:15",
    scriptureText: "Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have.",
    weekType: "dbs",
    estimatedMinutes: 53,
    sections: [
      { sectionType: "welcome", title: "Final Buddy Check-In", durationMinutes: 5, content: { prompt: "Win / Struggle / Prayer - Final Week!" } },
      { sectionType: "scripture", title: "Read Aloud", durationMinutes: 5, content: { verse: "1 Peter 3:15 + Matthew 28:18-20", text: "Be ready to share your hope + Go make disciples" } },
      { sectionType: "micro-teach", title: "Your Story Matters", durationMinutes: 8, content: { keyPoints: ["Your testimony is powerful", "Keep it simple: Before, How, After", "One conversation at a time"] } },
      { sectionType: "discussion", title: "DBS Discussion", durationMinutes: 20, content: { questions: ["What's your 2-minute testimony?", "Who in your life needs hope?", "What's your next step in faith?"] } },
      { sectionType: "practice", title: "Share Your Story", durationMinutes: 7, content: { activity: "Practice sharing your 2-minute testimony with a partner." } },
      { sectionType: "i-will", title: "I Will Commitment", durationMinutes: 5, content: { prompt: "I will share my faith with _____. I will continue my journey by _____." } },
      { sectionType: "prayer", title: "Commissioning Prayer", durationMinutes: 3, content: { guide: "Pray for boldness, open doors, and continued growth. Commission each person!" } },
    ],
    mentorPrompts: [
      { promptDay: "D-1", promptType: "reminder", title: "Session Reminder", whatsappScript: "FINAL WEEK tomorrow! 🎉 We're celebrating and looking ahead. Don't miss it!" },
      { promptDay: "D0", promptType: "recap", title: "Session Recap", whatsappScript: "YOU DID IT! 🎉 8 weeks complete! So proud of you. Keep sharing your faith!" },
      { promptDay: "D2", promptType: "buddy-check", title: "Buddy Check", whatsappScript: "Keep connecting with your buddy even after the journey! Iron sharpens iron 💪" },
      { promptDay: "D4", promptType: "mentor-check", title: "Midweek Check-In", whatsappScript: "How does it feel to have completed the journey? What's your next step?" },
      { promptDay: "D6", promptType: "celebrate", title: "Final Celebration", whatsappScript: "🎉 CONGRATULATIONS! 8 weeks of Finding Your Way Back COMPLETE! You found your way home. Keep going! What's next for you?" },
    ],
  },
];

async function seedFYWB() {
  console.log("Seeding Finding Your Way Back journey...");
  
  // Check if journey exists
  const [existing] = await db.select().from(journeys).where(
    (await import("drizzle-orm")).eq(journeys.slug, "finding-your-way-back")
  );
  
  if (existing) {
    console.log("Journey already exists, skipping seed.");
    return;
  }
  
  // Create the main journey
  const [journey] = await db.insert(journeys).values({
    slug: "finding-your-way-back",
    title: "Finding Your Way Back",
    subtitle: "8 Weeks of Rediscovering God",
    description: "Have you wandered from God? This 8-week journey will help you return home. Through weekly sessions, buddy accountability, and practical 'I Will' commitments, you'll rebuild your relationship with Jesus and discover your purpose.",
    category: "faith-basics",
    durationDays: 56,
    level: "beginner",
    heroImageUrl: "/attached_assets/Finding_Your_Way_Back!_1_1765592941439.png",
    isPublished: "true",
  }).returning();
  
  console.log(`Created journey: ${journey.title} (ID: ${journey.id})`);
  
  // Seed each week
  for (const weekData of FYWB_WEEKS) {
    const [week] = await db.insert(journeyWeeks).values({
      journeyId: journey.id,
      weekNumber: weekData.weekNumber,
      title: weekData.title,
      theme: weekData.theme,
      scriptureRef: weekData.scriptureRef,
      scriptureText: weekData.scriptureText,
      weekType: weekData.weekType,
      estimatedMinutes: weekData.estimatedMinutes,
    }).returning();
    
    console.log(`  Week ${week.weekNumber}: ${week.title}`);
    
    // Seed sections for this week
    for (let i = 0; i < weekData.sections.length; i++) {
      const section = weekData.sections[i];
      await db.insert(sessionSections).values({
        journeyWeekId: week.id,
        sectionOrder: i + 1,
        sectionType: section.sectionType,
        title: section.title,
        durationMinutes: section.durationMinutes,
        contentJson: section.content,
        facilitatorNotes: null,
      });
    }
    console.log(`    - Added ${weekData.sections.length} session sections`);
    
    // Seed mentor prompts for this week
    for (const prompt of weekData.mentorPrompts) {
      await db.insert(mentorPrompts).values({
        journeyWeekId: week.id,
        promptDay: prompt.promptDay,
        promptType: prompt.promptType,
        title: prompt.title,
        whatsappScript: prompt.whatsappScript,
        tips: null,
      });
    }
    console.log(`    - Added ${weekData.mentorPrompts.length} mentor prompts`);
  }
  
  console.log("\n✅ Finding Your Way Back journey seeded successfully!");
}

seedFYWB().catch(console.error).finally(() => process.exit(0));
