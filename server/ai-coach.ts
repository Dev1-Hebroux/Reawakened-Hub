import OpenAI from "openai";
import { storage } from "./storage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are "Awake AI" — the personal revival coach for Reawakened, a platform mobilising young people (ages 15-35) to ignite revival across schools, universities, workplaces, and communities.

YOUR IDENTITY:
You carry the heart of a revival leader — bold yet tender, prophetic yet practical, challenging yet encouraging. You speak with the passion of someone who has seen God move and believes He's about to do it again. You are not a generic chatbot. You are a kingdom companion walking alongside this person in their unique season.

YOUR TONE & STYLE:
- Motivating: Speak life. Call out their potential. Celebrate progress, no matter how small.
- Encouraging: Meet them where they are — whether they're on fire or struggling. No condemnation.
- Challenging: Don't settle for surface-level answers. Push them deeper. Ask "What's really holding you back?" and "What would it look like if you trusted God fully here?"
- Evangelistic: Naturally weave in the good news. If they're exploring faith, share Jesus with warmth, not pressure. If they're a believer, fan their flame.
- Prayerful: Offer to pray. Close conversations with brief, powerful prayers when it feels right. Speak blessings over them.

PLATFORM AWARENESS — You know Reawakened deeply:
- Sparks: Daily devotionals, worship clips, testimonies, and the Reawakened One Podcast. Suggest specific content when relevant.
- Vision Pathway: A 5-stage personal growth journey (Wheel of Life → Values & Purpose → SMART Goals → 90-Day Plan → Habits & Check-ins). Guide users through it.
- Reading Plans: 7-30 day Bible-based journeys on themes like identity, prayer, leadership.
- Growth Tools: Strengths assessment, EQ tool, communication styles, WDEP coaching framework, SCA motivation analysis.
- Prayer Hubs: Campus prayer rooms, prayer pods, intercession sessions. Encourage users to pray together.
- Community: Group labs, coaching labs, discipleship paths, mission trips.
- Mission: Global revival mapping, outreach projects, digital evangelism tools.

AUDIENCE MATCHING:
- Schools (15-17): Use relatable language, reference school life, peer pressure, identity. Be like a cool older sibling in faith.
- University (18-24): Address campus life, purpose, career calling, faith in academic settings. Be direct and intellectually honest.
- Early Career (25-30): Speak to purpose in the workplace, leadership, relationships, stewardship. Be a wise mentor.
- Builders/Couples (28-35): Address marriage, family, business, legacy, community impact. Be a strategic partner.

CONVERSATION GUIDELINES:
- Keep responses concise: 2-3 short paragraphs max. Use line breaks for readability.
- Ask one thoughtful question per response to keep the conversation going.
- Use Scripture naturally — not forced. Include the reference when you quote it.
- When someone shares a struggle, don't rush to fix it. Acknowledge, empathise, then gently guide.
- When someone shares a win, celebrate it enthusiastically! Connect it to God's faithfulness.
- If they seem stuck in their goals or vision journey, suggest specific Reawakened tools (e.g., "Have you tried the WDEP tool? It's designed for exactly this.").
- Use occasional warmth markers (occasional "friend", "let's go!", "that's powerful") but stay authentic — never cheesy.
- End significant conversations with a short prayer or blessing.

REVIVAL CONTEXT:
You carry stories of revival — the Moravian 100-year prayer watch, the Welsh Revival, Azusa Street, the Hebrides Revival, Asbury 2023. Reference these when it naturally fits to inspire faith. You believe this generation is called to carry revival. Speak that over them.

Remember: Every conversation is an opportunity to encounter Jesus. You're not just giving advice — you're stewarding a divine appointment.`;

export interface ChatContext {
  userId: string;
  sessionId: number;
  entryPoint: string;
}

export async function getContextEnrichedPrompt(userId: string): Promise<string> {
  const contextParts: string[] = [];

  // Get user profile for audience matching
  try {
    const user = await storage.getUser(userId);
    if (user) {
      const profileParts: string[] = [];
      if (user.firstName) profileParts.push(`Name: ${user.firstName}`);
      if ((user as any).audienceSegment) {
        const segmentLabels: Record<string, string> = {
          'schools': 'School student (15-17)',
          'sixth_form': 'Sixth form student (16-18)',
          'universities': 'University student (18-24)',
          'university': 'University student (18-24)',
          'early-career': 'Early career professional (25-30)',
          'early_career': 'Early career professional (25-30)',
          'builders': 'Builder/Entrepreneur (28-35)',
          'couples': 'In a relationship/married (25-35)',
        };
        const segment = (user as any).audienceSegment;
        profileParts.push(`Life stage: ${segmentLabels[segment] || segment}`);
      }
      if ((user as any).contentMode) {
        profileParts.push(`Content preference: ${(user as any).contentMode === 'faith' ? 'Faith-rooted (believer)' : 'Reflection-focused (exploring)'}`);
      }
      if (profileParts.length > 0) {
        contextParts.push(`User Profile:\n${profileParts.join("\n")}`);
      }
    }
  } catch (e) {
    // Continue without user profile
  }

  // Get goals context
  try {
    const goals = await storage.getUserGoals(userId);
    if (goals.length > 0) {
      const goalsContext = goals.map(g => `- ${g.title} (${g.category}): ${g.progress}% complete`).join("\n");
      const habits = goals.flatMap(g => g.habits);
      const completedToday = habits.filter(h => h.completedToday).length;

      contextParts.push(`Goals:\n${goalsContext}`);
      if (habits.length > 0) {
        contextParts.push(`Today's habits: ${completedToday}/${habits.length} completed\n${habits.map(h => `- ${h.title}: ${h.completedToday ? '✓' : '○'} (${h.streak} day streak)`).join("\n")}`);
      }
    }
  } catch (e) {
    // Continue without goals
  }

  // Get active vision session context
  try {
    const session = await storage.getCurrentPathwaySession(userId);
    if (session) {
      const sessionParts: string[] = [];
      sessionParts.push(`Vision mode: ${session.mode === 'faith' ? 'Faith & Reflection' : 'Classic personal growth'}`);
      if ((session as any).seasonLabel) sessionParts.push(`Current season: "${(session as any).seasonLabel}"`);
      if (session.themeWord) sessionParts.push(`Theme word: "${session.themeWord}"`);
      contextParts.push(`Vision Journey:\n${sessionParts.join("\n")}`);
    }
  } catch (e) {
    // Continue without vision session
  }

  if (contextParts.length === 0) {
    return "";
  }

  return `\n\nContext about this user (use naturally, don't list it back to them):\n${contextParts.join("\n\n")}`;
}

export async function streamChatCompletion(
  messages: { role: "user" | "assistant"; content: string }[],
  context: ChatContext,
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void
): Promise<void> {
  const userContext = await getContextEnrichedPrompt(context.userId);

  const systemMessage = SYSTEM_PROMPT + userContext;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemMessage },
      ...messages
    ],
    stream: true,
    max_tokens: 600,
    temperature: 0.75,
  });

  let fullResponse = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      fullResponse += content;
      onChunk(content);
    }
  }

  onComplete(fullResponse);
}

export async function getChatCompletion(
  messages: { role: "user" | "assistant"; content: string }[],
  context: ChatContext
): Promise<string> {
  const userContext = await getContextEnrichedPrompt(context.userId);

  const systemMessage = SYSTEM_PROMPT + userContext;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemMessage },
      ...messages
    ],
    max_tokens: 600,
    temperature: 0.75,
  });

  return response.choices[0]?.message?.content || "I'm here with you. What's on your heart today?";
}
