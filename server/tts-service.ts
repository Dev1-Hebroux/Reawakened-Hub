import OpenAI from "openai";
import { isStorageConfigured, uploadAudio, audioExists, deleteAudio as deleteAudioFile } from "./supabaseStorage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TTSGenerationResult {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

export class TTSService {
  private isConfigured: boolean = false;

  constructor() {
    if (!isStorageConfigured()) {
      console.warn("Supabase storage not configured - TTS features will be disabled");
      return;
    }
    this.isConfigured = true;
  }

  async generateAndUploadAudio(
    text: string,
    filename: string,
    voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "nova"
  ): Promise<TTSGenerationResult> {
    if (!this.isConfigured) {
      return { success: false, error: "TTS service not configured" };
    }

    try {
      const mp3Response = await openai.audio.speech.create({
        model: "tts-1",
        voice,
        input: text,
      });

      const audioBuffer = Buffer.from(await mp3Response.arrayBuffer());
      const audioUrl = await uploadAudio(filename, audioBuffer);

      return {
        success: true,
        audioUrl,
      };
    } catch (error: any) {
      console.error("TTS generation error:", error);
      return {
        success: false,
        error: error.message || "Failed to generate audio",
      };
    }
  }

  async getAudioUrl(filename: string): Promise<string | null> {
    if (!this.isConfigured) {
      return null;
    }

    try {
      const exists = await audioExists(filename);
      if (exists) {
        return `/api/audio/${filename}`;
      }
      return null;
    } catch (error) {
      console.error("Error checking audio file:", error);
      return null;
    }
  }

  async deleteAudio(filename: string): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      return await deleteAudioFile(filename);
    } catch (error) {
      console.error("Error deleting audio file:", error);
      return false;
    }
  }
}

export const ttsService = new TTSService();

interface SparkAudioContent {
  title: string;
  scriptureRef?: string;
  fullPassage?: string;
  fullTeaching: string;
  reflectionQuestion?: string;
  todayAction?: string;
  prayerLine?: string;
  ctaPrimary?: string;
  weekTheme?: string;
}

export async function generateSparkAudio(
  sparkId: number,
  content: SparkAudioContent | string
): Promise<TTSGenerationResult> {
  const filename = `spark-${sparkId}.mp3`;
  
  // Support both old string format and new object format
  let narrationText: string;
  if (typeof content === 'string') {
    narrationText = content;
  } else {
    // Compose full narration with title, scripture, teaching, reflection, action, and prayer
    const parts: string[] = [];
    
    // Opening with title
    parts.push(`Today's devotional: ${content.title}.`);
    
    // Scripture reading
    if (content.scriptureRef && content.fullPassage) {
      parts.push(`\n\nToday's scripture reading is from ${content.scriptureRef}:`);
      parts.push(`\n"${content.fullPassage}"`);
    }
    
    // Main teaching
    if (content.fullTeaching) {
      parts.push(`\n\n${content.fullTeaching}`);
    }
    
    // Reflection question
    if (content.reflectionQuestion) {
      parts.push(`\n\nTake a moment to reflect: ${content.reflectionQuestion}`);
    }
    
    // Today's action / nudge
    if (content.todayAction) {
      parts.push(`\n\nYour action for today: ${content.todayAction}`);
    }
    
    // CTA prompt
    if (content.ctaPrimary) {
      const ctaMessages: Record<string, string> = {
        'Pray': 'Will you commit to pray about this today?',
        'Give': 'Consider how you might give generously in response.',
        'Go': 'Where is God calling you to go and serve?'
      };
      const ctaMessage = ctaMessages[content.ctaPrimary] || `Your call to action: ${content.ctaPrimary}`;
      parts.push(`\n\n${ctaMessage}`);
    }
    
    // Closing prayer
    if (content.prayerLine) {
      parts.push(`\n\nLet's pray together: ${content.prayerLine}`);
    }
    
    narrationText = parts.join('');
  }

  // Determine voice: female-only for Deborahs, alternating for others
  const weekTheme = typeof content !== 'string' ? content.weekTheme : undefined;
  let voice: "onyx" | "nova" = sparkId % 2 === 0 ? "onyx" : "nova";
  if (weekTheme === "Let the Deborahs Arise") {
    voice = "nova"; // Female voices only for this series
  }

  return ttsService.generateAndUploadAudio(narrationText, filename, voice);
}

export async function getSparkAudioUrl(sparkId: number): Promise<string | null> {
  const filename = `spark-${sparkId}.mp3`;
  return ttsService.getAudioUrl(filename);
}

interface ReadingPlanDayAudioContent {
  title: string;
  scriptureRef: string;
  scriptureText: string;
  devotionalContent: string;
  prayerPrompt?: string;
}

export async function generateReadingPlanDayAudio(
  planId: number,
  dayNumber: number,
  content: ReadingPlanDayAudioContent | string
): Promise<TTSGenerationResult> {
  const filename = `plan-${planId}-day-${dayNumber}.mp3`;
  
  // Support both old string format and new object format
  let narrationText: string;
  if (typeof content === 'string') {
    narrationText = content;
  } else {
    // Compose full narration with title, scripture, devotional, and prayer
    const parts: string[] = [];
    
    // Opening with day title
    parts.push(`Day ${dayNumber}: ${content.title}.`);
    
    // Scripture reading
    parts.push(`\n\nToday's scripture reading is from ${content.scriptureRef}:`);
    parts.push(`\n"${content.scriptureText}"`);
    
    // Devotional content
    if (content.devotionalContent) {
      parts.push(`\n\n${content.devotionalContent}`);
    }
    
    // Closing prayer
    if (content.prayerPrompt) {
      parts.push(`\n\nLet's pray together: ${content.prayerPrompt}`);
    }
    
    narrationText = parts.join('');
  }
  
  return ttsService.generateAndUploadAudio(narrationText, filename, "nova");
}

export async function getReadingPlanDayAudioUrl(
  planId: number,
  dayNumber: number
): Promise<string | null> {
  const filename = `plan-${planId}-day-${dayNumber}.mp3`;
  return ttsService.getAudioUrl(filename);
}
