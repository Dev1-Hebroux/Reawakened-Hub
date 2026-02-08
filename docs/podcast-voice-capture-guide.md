# Podcast Voice Capture Guide
## Creating Your AI Voice Clone + Style Profile

This guide helps you create an AI-generated podcast that sounds authentically like YOU.

---

## Part 1: Recording Samples for AI Voice Cloning

### Recommended Service: ElevenLabs

ElevenLabs offers the best quality voice cloning. Other options: PlayHT, Resemble.AI, Descript.

**Requirements for quality voice clone:**
- 3-5 minutes of clean audio (minimum)
- 10-30 minutes for professional quality
- Clear speech, minimal background noise
- Variety of tones and emotions

---

### Recording Setup

**Equipment (in order of preference):**
1. USB microphone (Blue Yeti, Audio-Technica AT2020) - Best
2. Lavalier mic - Good
3. Phone voice memo in quiet room - Acceptable
4. Computer mic - Not recommended

**Environment:**
- Quiet room (no AC, fans, traffic)
- Soft surfaces (carpet, curtains absorb echo)
- Consistent distance from mic (6-8 inches)
- No eating/drinking during recording

**Technical Settings:**
- Format: WAV or MP3 (320kbps)
- Sample rate: 44.1kHz or higher
- Mono is fine (stereo not needed)

---

### What to Record

Record FIVE types of content (1 minute each minimum):

#### Sample 1: Natural Conversation
Just talk naturally about something you care about. No script.

**Prompt:** "Tell me about what drives your passion for revival. Why does this matter to you personally?"

*(Just speak from the heart for 2-3 minutes)*

---

#### Sample 2: Teaching/Explanation
Read this in your natural teaching voice:

```
Let me explain why small groups matter for revival.

When John Wesley organized the Methodist movement,
he didn't just preach to crowds. He created what he called "class meetings"—
small groups of about twelve people who met weekly.

They would ask each other honest questions:
"How is your soul? What sins have you committed?
What temptations are you facing?"

This level of accountability was radical. And it worked.
The Methodist movement didn't just convert people—it transformed them.
Because conversion without community doesn't last.

This is why every lasting revival has had some form of small group structure.
It's not enough to have a moment with God.
You need people who will walk with you after the moment passes.
```

---

#### Sample 3: Emotional Storytelling
Read this with feeling—let the emotion come through:

```
Picture this scene.

It's 1907. Pyongyang, Korea.
Fifteen hundred men have gathered for a Bible conference.
The missionary is preaching about sin. About honesty before God.

And then... something shifts.

One man stands up. He begins confessing—publicly—
things he'd hidden for years. Tears streaming down his face.

Then another man stands. And another.

And suddenly, everyone is praying. Out loud. At once.
The sound is overwhelming.
One witness described it as "the falling of many waters."
An ocean of prayer beating against God's throne.

Men who had cheated each other made restitution that night.
Enemies embraced. Hidden sins came to light.
And the revival that started in that room
would eventually lead to Korea becoming one of the most
Christian nations on earth.

It started with one man's honest confession.
What might God do if we were that honest?
```

---

#### Sample 4: Direct Challenge/Call to Action
Read this with conviction—you're calling people to action:

```
Here's what I need you to understand.

Revival is not a spectator sport.
You cannot scroll your way into spiritual awakening.
You cannot podcast your way into transformation.

At some point, you have to do something.

The Moravians didn't just talk about prayer—they prayed.
For one hundred years. Around the clock.

The Welsh believers didn't just study revival—they sought it.
Night after night. Year after year.

So let me ask you directly:
What are you actually DOING?

Not thinking about doing. Not planning to do.
What are you doing TODAY to seek God?

Because if you're waiting for the perfect moment,
you'll wait forever.

The moment is now.
The place is where you are.
The person God wants to use... is you.

Stop waiting. Start praying. Watch what happens.
```

---

#### Sample 5: Warm/Personal Closing
Read this like you're talking to a friend:

```
Hey, thanks for being here.

I know there are a million things competing for your attention,
and the fact that you chose to spend this time
learning about revival history... that means something.

I really believe we're living in significant days.
I believe God is stirring something in this generation.
And I believe you're not listening to this by accident.

So here's what I want you to do this week.
Just one thing.

Find ten minutes—that's it, ten minutes—
and ask God this question:
"What do you want to do in me... and through me?"

Then just listen. See what comes up.

And hey, if something happens—if God speaks to you,
if something shifts—I'd love to hear about it.
Reach out. Share your story.

Because your story might be the spark someone else needs.

Alright, that's it for today.
Go be dangerous.
I'll catch you next time.
```

---

### Recording Tips for Best Results

**DO:**
- Speak at your natural pace
- Let emotions come through naturally
- Include some natural pauses
- Read through scripts once before recording
- Hydrate before recording

**DON'T:**
- Whisper or shout
- Rush through the content
- Read in a monotone "reading voice"
- Stop/start repeatedly (do full takes)
- Edit out natural breaths

---

### Uploading to ElevenLabs

1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Create account (free tier allows voice cloning)
3. Navigate to "Voice Lab" → "Add Voice" → "Instant Voice Cloning"
4. Upload your audio files
5. Name your voice (e.g., "Reawakened Host")
6. Generate and test

**API Integration (for automation):**
```javascript
// ElevenLabs API example
const generateSpeech = async (text, voiceId) => {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    }
  );
  return response;
};
```

---

## Part 2: Voice Style Profile

Fill out this profile to help generate scripts that match your natural speaking style.

### Basic Information

```yaml
Host Name: [Your name]
Podcast Name: Reawakened
Tagline: "Learning from history to ignite the future"
```

### Speaking Style Characteristics

Rate each on a scale of 1-5:

```yaml
Pace:
  [ ] 1 - Very slow and deliberate
  [ ] 2 - Slower than average
  [ ] 3 - Moderate/conversational
  [ ] 4 - Energetic/faster
  [ ] 5 - Rapid-fire/intense

Formality:
  [ ] 1 - Very casual (like texting a friend)
  [ ] 2 - Relaxed conversational
  [ ] 3 - Professional but warm
  [ ] 4 - Polished/authoritative
  [ ] 5 - Formal/academic

Emotion Expression:
  [ ] 1 - Reserved/understated
  [ ] 2 - Subtle emotion
  [ ] 3 - Balanced expression
  [ ] 4 - Expressive
  [ ] 5 - Very passionate/animated

Directness:
  [ ] 1 - Very indirect (lots of qualifiers)
  [ ] 2 - Gentle suggestions
  [ ] 3 - Clear but diplomatic
  [ ] 4 - Direct and confident
  [ ] 5 - Very direct/challenging
```

### Vocabulary Preferences

**Words/phrases I naturally use:**
```
Example: "Here's the thing...", "What I love about this...", "Think about it..."
[Add your phrases]
```

**Words/phrases I avoid:**
```
Example: "Obviously", "Actually", overly academic terms
[Add your phrases]
```

**How I address the audience:**
```
[ ] "You" (direct)
[ ] "We" (inclusive)
[ ] "Friends" / "Family"
[ ] "Listeners"
[ ] Other: ________
```

### Signature Elements

**How I typically open episodes:**
```
[ ] Hook/story first
[ ] Direct welcome
[ ] Question to audience
[ ] Quote or fact
[ ] Other: ________
```

**How I typically close:**
```
[ ] Challenge/call to action
[ ] Prayer
[ ] Personal encouragement
[ ] Preview of next episode
[ ] Casual sign-off
```

**Recurring phrases or sign-offs:**
```
Example: "Go be dangerous", "See you next time", "Now go apply this"
[Add your phrases]
```

### Storytelling Style

**When telling historical stories, I prefer:**
```
[ ] Paint vivid sensory details
[ ] Focus on the human emotion
[ ] Emphasize the facts/timeline
[ ] Draw modern parallels throughout
[ ] Let the story speak for itself
```

**My ratio of teaching vs. story:**
```
[ ] Mostly story, some teaching (70/30)
[ ] Balanced (50/50)
[ ] Mostly teaching, some story (30/70)
```

### Theological Tone

**My approach to spiritual content:**
```
[ ] Seeker-friendly (assumes mixed audience)
[ ] Believer-focused (assumes Christian audience)
[ ] Mix (accessible but doesn't water down)
```

**When making spiritual challenges:**
```
[ ] Gentle invitation
[ ] Clear call to decision
[ ] Bold/prophetic tone
[ ] Depends on topic
```

### Sample Phrases

**Please write 3-5 sentences EXACTLY as you would say them:**

When introducing a topic:
```
[Write example]
```

When making a key point:
```
[Write example]
```

When transitioning between sections:
```
[Write example]
```

When challenging the listener:
```
[Write example]
```

When closing with encouragement:
```
[Write example]
```

---

## Part 3: Voice Profile Output

Once you complete the above, your voice profile might look like:

```yaml
# REAWAKENED HOST VOICE PROFILE

personality:
  name: "[Your Name]"
  role: "Revival historian and mobilizer"

style:
  pace: "moderate-to-energetic, varies with content"
  tone: "warm but authoritative, passionate not preachy"
  formality: "professional but accessible, like a knowledgeable friend"
  emotion: "expressive, especially during stories"

patterns:
  opening: "hook with story or striking fact"
  transitions: "rhetorical questions, 'Here's what matters...'"
  emphasis: "repetition, short punchy sentences"
  closing: "direct challenge + encouraging sign-off"

vocabulary:
  use_often:
    - "Here's the thing..."
    - "Think about this..."
    - "What would it look like if..."
    - "This is the pattern"
  avoid:
    - Academic jargon
    - Christianese without explanation
    - Hedging language ("kind of", "maybe")

audience_relationship:
  address_as: "you" (direct, personal)
  assumes: "interested but not expert"
  challenges_with: "direct questions, clear calls to action"

signature_elements:
  catchphrase: "[Your sign-off]"
  recurring_theme: "What God has done, He will do again"

audio_settings:
  elevenlabs_voice_id: "[Your cloned voice ID]"
  stability: 0.5
  similarity_boost: 0.75
```

---

## Next Steps

1. **Record your samples** (30-45 minutes total)
2. **Upload to ElevenLabs** and create your voice clone
3. **Fill out the Voice Style Profile** above
4. **Test generation** with a short script
5. **Refine settings** until it sounds right

Once complete, we can integrate this into automated podcast generation using your actual voice.

---

## File Locations

Save your audio samples in:
```
social-media/assets/voice-samples/
├── sample-01-conversation.wav
├── sample-02-teaching.wav
├── sample-03-story.wav
├── sample-04-challenge.wav
└── sample-05-closing.wav
```

Save your completed voice profile as:
```
podcast-voice-profile.yaml
```

---

*Your voice matters. Let's make sure AI captures what makes it unique.*
