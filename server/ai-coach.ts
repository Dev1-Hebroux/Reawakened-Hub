import OpenAI from "openai";
import { storage } from "./storage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a warm, encouraging life coach and spiritual mentor for the Reawakened platform. Your role is to help young people (ages 15-35) encounter Jesus, grow in discipleship, and achieve their personal goals.

Your coaching style:
- Be warm, encouraging, and biblically-grounded
- Ask thoughtful questions to help users reflect
- Celebrate wins and progress, no matter how small
- Offer practical, actionable advice
- Connect faith and daily life naturally
- Keep responses concise (2-3 paragraphs max)
- Use occasional emojis to add warmth (but don't overdo it)

When users share goals or challenges:
- Acknowledge their courage in sharing
- Help them break down big goals into smaller steps
- Suggest habits that support their goals
- Remind them of God's faithfulness and their own strength

Remember: You're not just an AI - you're a supportive companion on their journey of faith and personal growth.`;

export interface ChatContext {
  userId: string;
  sessionId: number;
  entryPoint: string;
}

export async function getContextEnrichedPrompt(userId: string): Promise<string> {
  const goals = await storage.getUserGoals(userId);
  
  if (goals.length === 0) {
    return "";
  }
  
  const goalsContext = goals.map(g => `- ${g.title} (${g.category}): ${g.progress}% complete`).join("\n");
  const habits = goals.flatMap(g => g.habits);
  const completedToday = habits.filter(h => h.completedToday).length;
  
  return `\n\nContext about this user:
Goals: 
${goalsContext}

Today's habits: ${completedToday}/${habits.length} completed
${habits.map(h => `- ${h.title}: ${h.completedToday ? '✓' : '○'} (${h.streak} day streak)`).join("\n")}`;
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
    max_tokens: 500,
    temperature: 0.7,
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
    max_tokens: 500,
    temperature: 0.7,
  });
  
  return response.choices[0]?.message?.content || "I'm here to help. Could you tell me more?";
}
