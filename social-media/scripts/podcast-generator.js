#!/usr/bin/env node

/**
 * Reawakened Podcast Generator
 * Generates audio from podcast scripts using ElevenLabs voice cloning
 *
 * Usage:
 *   node podcast-generator.js list                    # List available scripts
 *   node podcast-generator.js preview <episode>       # Preview script text
 *   node podcast-generator.js generate <episode>      # Generate audio for one episode
 *   node podcast-generator.js generate all            # Generate all episodes
 *   node podcast-generator.js test                    # Test with short sample
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  apiKey: process.env.ELEVENLABS_API_KEY,
  voiceId: process.env.ELEVENLABS_PRIMARY_VOICE || process.env.ELEVENLABS_VOICE_ID_1,
  voiceId2: process.env.ELEVENLABS_VOICE_ID_2,
  outputDir: path.join(__dirname, '..', 'podcast-output'),
  scriptsFile: path.join(__dirname, '..', 'content', 'podcast-scripts-abraham-voice.md'),

  // ElevenLabs voice settings
  voiceSettings: {
    stability: 0.55,           // Higher stability = more consistent pacing throughout
    similarity_boost: 0.78,    // High = closer to original voice
    style: 0.40,               // Lower style = less drift/speed-up on long passages
    use_speaker_boost: true,   // Enhance clarity
  },

  // Model options: eleven_monolingual_v1, eleven_multilingual_v2, eleven_turbo_v2
  model: 'eleven_multilingual_v2',
};

// ============================================
// EPISODE DATA
// ============================================

const EPISODES = [
  {
    id: 'ep01',
    title: 'The Pattern Nobody Talks About',
    theme: 'Prayer precedes every revival',
    sections: [
      {
        name: 'intro',
        text: `Here's the thing that drives me crazy.

Everyone wants revival. Everyone's talking about it. "Oh, we need a move of God." "Oh, wouldn't it be amazing if God showed up."

But it doesn't stop there.

Because there's a pattern. A pattern so consistent across 300 years of history that it should shake us awake. And almost nobody talks about it.

I'm Abraham, and this is The Reawakened One Podcast — where we learn from history to ignite the future.

Today, I'm going to show you the one thing that preceded EVERY major revival in Christian history. Every single one. No exceptions.

And then I'm going to ask you a question you might not want to answer.

Let's go.`
      },
      {
        name: 'section1',
        text: `Think about this.

1727. Herrnhut, Germany. A small community of refugees called the Moravians. They'd been fighting each other — theological disputes, personal conflicts, the works.

And then something happened. August 13th. They experienced what they called a "baptism of the Holy Spirit" during a communion service.

But here's what you need to understand — that moment didn't come out of nowhere.

In the weeks before, they had committed to pray. Not casually. Intentionally. Sacrificially.

And after that August 13th encounter? They started a prayer watch that continued — listen to this — UNBROKEN for over ONE HUNDRED YEARS.

Round the clock. 24/7. For a century.

That's not a prayer meeting. That's what sparks revival.

But it doesn't stop there.

1904. Wales. Before Evan Roberts ever preached a sermon, there were small groups meeting in hidden prayer gatherings. For YEARS. Nobody saw them. Nobody celebrated them. They just prayed.

1907. Pyongyang, Korea. Before the sound of many waters — before that moment when fifteen hundred men began praying out loud at once — missionaries had been meeting for prayer. Some of them for YEARS.

Here's the pattern: Prayer doesn't just accompany revival. Prayer PRECEDES it. Every. Single. Time.`
      },
      {
        name: 'section2',
        text: `Let me camp on the Moravians for a second because they wreck me every time.

These weren't professional ministers. They weren't seminary graduates. They were refugees. Exiles. Ordinary people who decided that prayer was worth their lives.

When they started that hundred-year prayer watch, they didn't know it would last a hundred years. They just knew they couldn't stop.

And here's what came out of it — listen carefully.

The Moravians sent out more missionaries per capita than any Christian movement in history. One in sixty — ONE IN SIXTY — of their members became a foreign missionary.

They went places nobody else would go. They literally sold themselves into slavery to reach slaves in the Caribbean. They gave EVERYTHING.

And it all flowed from one thing: a furnace of prayer that never went out.

So let me ask you directly: What are we doing?

We've got Instagram and TikTok and podcasts and conferences and books and courses — and I'm not against any of that — but where is the PRAYER?

Where is the sustained, costly, desperate prayer that says "God, we will not let You go until You bless us"?

Because the Moravians didn't have any of our advantages. No technology. No platforms. No funding. They just had prayer.

And they changed the world.`
      },
      {
        name: 'section3',
        text: `Here's where it gets personal.

I've studied this history for years. I know the stories. I can quote the statistics.

But knowing the pattern isn't enough. Something has to shift in your heart.

God's word says it clearly. Joel 2:28 — "It will come to pass afterward that I will pour out My Spirit on all flesh."

That word "afterward" — it matters. Afterward means something comes BEFORE.

Before the outpouring comes the crying out. Before the fire falls comes the fuel of prayer. Before God moves publicly, somebody moves privately.

So let me ask you — and I'm asking myself too:

What would it look like for YOU to become a person of sustained prayer?

Not a one-time fast. Not a crisis prayer when things fall apart. Not a comfortable "Lord bless my day" while you're half-asleep.

I'm talking about the kind of prayer that costs something. The kind that reorganizes your schedule. The kind that makes you uncomfortable.

The Moravians gave an hour a day. At minimum. Many gave more.

What if we started there?`
      },
      {
        name: 'closing',
        text: `Here's what I want you to do this week.

Set aside fifteen minutes a day — MINIMUM — to pray specifically for revival. Not for your problems. Not for your preferences. For REVIVAL.

And here's the prayer I want you to pray:

"God, revive ME first. Before I ask You to revive my church or my city or my nation — do the work in ME."

Because revival always starts with one surrendered heart. Florrie Evans was one person. Evan Roberts was one person. Count Zinzendorf was one person.

What God has done, He will do again.

But He's looking for people who will pay the price in prayer.

Will you be one of them?

Go be dangerous.

I'll see you next time.`
      }
    ]
  },
  {
    id: 'ep02',
    title: 'The Teenage Girl Who Changed Everything',
    theme: 'Simple testimony releases power',
    sections: [
      {
        name: 'intro',
        text: `I want to tell you about a moment.

A moment that took maybe thirty seconds. Fourteen words. Spoken by a teenage girl who was terrified.

And that moment — that terrified, trembling, barely-audible moment — ignited a revival that transformed an entire nation.

Her name was Florrie Evans. She was sixteen years old. And she had no idea what she was starting.

I'm Abraham, and this is The Reawakened One Podcast.

Today, I'm going to tell you a story that should make you reconsider everything you think about who God can use — and what He can do with your simple, honest testimony.

Let's go.`
      },
      {
        name: 'section1',
        text: `February 1904. Cardiganshire, Wales.

Think about what's NOT happening yet. Evan Roberts hasn't started his public ministry. The famous revival meetings haven't begun. The 100,000 conversions haven't happened. All of that is still in the future.

But something is stirring.

In a small chapel in New Quay, a minister named Joseph Jenkins has been holding special meetings. Young people have been attending. The atmosphere is expectant. Something's in the air.

Florrie Evans is one of those young people. Recently, she'd had an encounter with God — not just religious ritual, but real surrender. She knew something had changed inside her.

And in that meeting, as others were sharing testimonies, Florrie felt something burning in her chest.

Here's the thing — she wasn't a preacher. She wasn't trained. She wasn't confident. She was a sixteen-year-old girl in a culture where women rarely spoke in public gatherings.

Every logical reason said "stay quiet."

But something shifted in her heart.`
      },
      {
        name: 'section2',
        text: `She stood up. Trembling. Heart pounding. Probably wanting to sit right back down.

And she said fourteen words. That's it. Fourteen words that changed a nation.

"I love Jesus Christ... with all my heart."

Not eloquent. Not theological. Not impressive by any human standard.

Just the truth. Simple, honest, vulnerable truth.

And something BROKE OPEN in that room.

Other young people began standing. Confessing their faith. Sharing their hearts. The meeting extended. The fire began to spread.

Within days, the movement reached other churches. Within weeks, it crossed into other towns. Within months, the entire nation of Wales was experiencing the greatest revival in its history.

And it traced back to a teenage girl who told the truth about her heart.`
      },
      {
        name: 'section3',
        text: `Let me get direct with you.

How many of us are waiting until we have something "impressive" to say? Waiting until we're more trained, more articulate, more confident?

Florrie didn't have perfect words. She had fourteen of them. But they were TRUE. They came from a heart that had genuinely encountered Jesus.

Your testimony matters. Not the polished version. The REAL version.

Revelation 12:11 — "They overcame him by the blood of the Lamb and by the word of their TESTIMONY."

Your testimony might feel small to you. But Florrie Evans didn't do anything dramatic either. She just told the truth. And a nation was transformed.`
      },
      {
        name: 'closing',
        text: `Here's your assignment this week.

Tell someone your story. Not the religious version — the REAL version.

How did you meet Jesus? What changed? What is He doing in you right now?

Share it with one person. That's it. Just one.

You don't know what God might do with it. You might be standing in your "New Quay moment" right now.

What God has done, He will do again.

Go be dangerous.`
      }
    ]
  },
  {
    id: 'ep03',
    title: 'When the Horses Got Confused',
    theme: 'True revival transforms society',
    sections: [
      {
        name: 'intro',
        text: `I want to tell you about pit ponies. Stay with me. This is going somewhere.

In the coal mines of Wales in 1904, they used horses — ponies — to pull the coal carts underground. These animals spent their whole lives in darkness.

And they were trained to respond to one thing: cursing. That's how the miners controlled them. Shouting, swearing, harsh commands.

But during the Welsh Revival, something strange started happening. The ponies got confused.

I'm Abraham, and this is The Reawakened One Podcast. Let me tell you what real revival looks like.`
      },
      {
        name: 'section1',
        text: `Here's what most people know about the Welsh Revival: Evan Roberts. 100,000 conversions. Powerful meetings. Emotional encounters with God.

And that's all true. But it doesn't stop there.

Because the Welsh Revival didn't just happen in church buildings. It happened in mines. In pubs. In courtrooms. In homes.

When those miners encountered God — really encountered Him — they didn't just raise their hands on Sunday. They came back to work on Monday as different men.

The cursing stopped. The drinking stopped. The stealing stopped. Men who had beaten their wives became gentle. Men who had gambled away their wages started providing for their families.

And the horses? They didn't know what to do. They'd been trained to respond to profanity. Suddenly, no one was swearing at them. They quite literally got confused because the atmosphere had changed.

That's what sparks revival. Not just emotional meetings, but transformed lives.`
      },
      {
        name: 'section2',
        text: `Let me give you the hard data.

During the Welsh Revival, crime dropped so dramatically that police officers were reassigned. They had nothing to do. Judges had empty courtrooms.

The taverns? Many of them closed. Not because of laws — because they had no customers.

Debt repayment skyrocketed. People who had cheated their neighbors for years were making restitution.

The SECULAR historians record this. The newspapers — many of them hostile to the revival — couldn't deny what was happening.

True revival doesn't just change church attendance numbers. True revival changes SOCIETY.

2 Chronicles 7:14 — "If My people who are called by My name will humble themselves, and pray and seek My face, and turn from their wicked ways, then I will hear from heaven, and will forgive their sin and heal their LAND."

Heal the LAND. Not just heal individuals. But heal the land. Transform the culture.`
      },
      {
        name: 'section3',
        text: `So let me get direct with you.

What do you think revival should look like? Because here's my concern: A lot of what we call "revival" today is just better church services.

But is anything actually CHANGING? Are the pit ponies confused? Are families being restored? Are addicts getting free?

If revival hit YOUR city the way it hit Wales in 1904, what would be different? Not in your church building. In your CITY.

That's the standard history sets for us. And honestly? Anything less than that — we shouldn't settle for it.`
      },
      {
        name: 'closing',
        text: `This week, pray for TRANSFORMATION — not just salvation. Pray that God would change hearts so completely that even the secular world can't deny it.

The pit ponies should be confused by how different you are.

What God has done, He will do again.

Go be dangerous.`
      }
    ]
  }
];

// ============================================
// ELEVENLABS API
// ============================================

function generateAudio(text, voiceId, outputPath) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      text: text,
      model_id: CONFIG.model,
      voice_settings: CONFIG.voiceSettings,
    });

    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'xi-api-key': CONFIG.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    console.log(`  Sending to ElevenLabs API...`);

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let errorBody = '';
        res.on('data', (chunk) => errorBody += chunk);
        res.on('end', () => {
          reject(new Error(`API returned ${res.statusCode}: ${errorBody}`));
        });
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        const stats = fs.statSync(outputPath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`  ✓ Saved: ${outputPath} (${sizeMB} MB)`);
        resolve(outputPath);
      });

      fileStream.on('error', reject);
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ============================================
// COMMANDS
// ============================================

async function listEpisodes() {
  console.log('\n🎙️  REAWAKENED PODCAST EPISODES');
  console.log('================================\n');

  EPISODES.forEach((ep, i) => {
    const totalChars = ep.sections.reduce((sum, s) => sum + s.text.length, 0);
    const estMinutes = Math.round(totalChars / 900); // ~150 words/min, ~6 chars/word
    console.log(`  ${ep.id}  "${ep.title}"`);
    console.log(`        Theme: ${ep.theme}`);
    console.log(`        Sections: ${ep.sections.length}`);
    console.log(`        Est. duration: ~${estMinutes} min`);
    console.log('');
  });

  console.log(`Total episodes: ${EPISODES.length}`);
  console.log(`\nVoice ID (primary): ${CONFIG.voiceId}`);
  console.log(`Voice ID (alt):     ${CONFIG.voiceId2}`);
  console.log(`API key: ${CONFIG.apiKey ? '✓ Configured' : '✗ Missing'}`);
  console.log('');
}

function previewEpisode(episodeId) {
  const episode = EPISODES.find((ep) => ep.id === episodeId);
  if (!episode) {
    console.log(`Episode "${episodeId}" not found. Use "list" to see options.`);
    return;
  }

  console.log(`\n🎙️  PREVIEW: "${episode.title}"`);
  console.log(`Theme: ${episode.theme}`);
  console.log('='.repeat(60) + '\n');

  episode.sections.forEach((section) => {
    console.log(`--- ${section.name.toUpperCase()} ---\n`);
    console.log(section.text);
    console.log('');
  });
}

async function generateEpisode(episodeId) {
  const episode = EPISODES.find((ep) => ep.id === episodeId);
  if (!episode) {
    console.log(`Episode "${episodeId}" not found.`);
    return;
  }

  if (!CONFIG.apiKey) {
    console.log('✗ ELEVENLABS_API_KEY not set in .env');
    return;
  }

  // Create output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  console.log(`\n🎙️  GENERATING: "${episode.title}"`);
  console.log(`Voice: ${CONFIG.voiceId}`);
  console.log(`Model: ${CONFIG.model}`);
  console.log('');

  const audioFiles = [];

  for (let i = 0; i < episode.sections.length; i++) {
    const section = episode.sections[i];
    const filename = `${episode.id}-${section.name}.mp3`;
    const outputPath = path.join(CONFIG.outputDir, filename);

    console.log(`[${i + 1}/${episode.sections.length}] Generating "${section.name}"...`);
    console.log(`  Characters: ${section.text.length}`);

    try {
      await generateAudio(section.text, CONFIG.voiceId, outputPath);
      audioFiles.push(outputPath);

      // Rate limiting - wait between sections
      if (i < episode.sections.length - 1) {
        console.log('  Waiting 2s (rate limit)...\n');
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`);
    }
  }

  console.log(`\n✓ Generated ${audioFiles.length}/${episode.sections.length} audio files`);
  console.log(`Output: ${CONFIG.outputDir}/`);

  // Create episode manifest
  const manifest = {
    episode: episode.id,
    title: episode.title,
    theme: episode.theme,
    generatedAt: new Date().toISOString(),
    voiceId: CONFIG.voiceId,
    model: CONFIG.model,
    settings: CONFIG.voiceSettings,
    files: audioFiles.map((f) => path.basename(f)),
  };

  const manifestPath = path.join(CONFIG.outputDir, `${episode.id}-manifest.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Manifest: ${manifestPath}\n`);
}

async function generateAll() {
  console.log('\n🎙️  GENERATING ALL EPISODES');
  console.log('============================\n');

  for (const episode of EPISODES) {
    await generateEpisode(episode.id);
    console.log('---\n');
    // Pause between episodes
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log('✓ All episodes generated!');
}

async function testGeneration() {
  if (!CONFIG.apiKey) {
    console.log('✗ ELEVENLABS_API_KEY not set in .env');
    return;
  }

  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  const testText = `Here's the thing. What God has done, He will do again. I'm Abraham, and this is The Reawakened One Podcast. Go be dangerous.`;

  console.log('\n🔊 TEST: Generating short sample...');
  console.log(`Voice: ${CONFIG.voiceId}`);
  console.log(`Text: "${testText}"\n`);

  const outputPath = path.join(CONFIG.outputDir, 'test-sample.mp3');

  try {
    await generateAudio(testText, CONFIG.voiceId, outputPath);
    console.log('\n✓ Test successful! Play the file to check quality.');
    console.log(`  open "${outputPath}"`);
  } catch (err) {
    console.log(`\n✗ Test failed: ${err.message}`);

    if (err.message.includes('401')) {
      console.log('  → Check your ELEVENLABS_API_KEY');
    } else if (err.message.includes('404')) {
      console.log('  → Check your voice ID');
    } else if (err.message.includes('429')) {
      console.log('  → Rate limit reached, wait and try again');
    }
  }
}

// ============================================
// CLI HANDLER
// ============================================

const [, , command, arg] = process.argv;

switch (command) {
  case 'list':
    listEpisodes();
    break;
  case 'preview':
    previewEpisode(arg || 'ep01');
    break;
  case 'generate':
    if (arg === 'all') {
      generateAll();
    } else {
      generateEpisode(arg || 'ep01');
    }
    break;
  case 'test':
    testGeneration();
    break;
  default:
    console.log(`
🎙️  Reawakened Podcast Generator
================================

Usage:
  node podcast-generator.js list                 List all episodes
  node podcast-generator.js preview <episode>    Preview script text
  node podcast-generator.js generate <episode>   Generate audio for episode
  node podcast-generator.js generate all         Generate all episodes
  node podcast-generator.js test                 Test with short sample

Examples:
  node podcast-generator.js test                 Test your voice + API key
  node podcast-generator.js generate ep01        Generate Episode 1
  node podcast-generator.js generate all         Generate everything
`);
}
