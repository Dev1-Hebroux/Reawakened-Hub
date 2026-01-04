import OpenAI from "openai";
import { objectStorageClient, ObjectStorageService } from "./replit_integrations/object_storage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TTSGenerationResult {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

export class TTSService {
  private objectStorageService: ObjectStorageService | null = null;
  private bucketName: string = "";
  private isConfigured: boolean = false;

  constructor() {
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    if (!bucketId) {
      console.warn("DEFAULT_OBJECT_STORAGE_BUCKET_ID not configured - TTS features will be disabled");
      return;
    }
    this.objectStorageService = new ObjectStorageService();
    this.bucketName = bucketId;
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
      const objectPath = `public/audio/${filename}`;
      const bucket = objectStorageClient.bucket(this.bucketName);
      const file = bucket.file(objectPath);

      await file.save(audioBuffer, {
        metadata: {
          contentType: "audio/mpeg",
          metadata: {
            "custom:aclPolicy": JSON.stringify({
              owner: "system",
              visibility: "public",
            }),
          },
        },
      });

      const audioUrl = `/api/audio/${filename}`;

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
      const objectPath = `public/audio/${filename}`;
      const bucket = objectStorageClient.bucket(this.bucketName);
      const file = bucket.file(objectPath);
      const [exists] = await file.exists();
      
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
      const objectPath = `public/audio/${filename}`;
      const bucket = objectStorageClient.bucket(this.bucketName);
      const file = bucket.file(objectPath);
      await file.delete();
      return true;
    } catch (error) {
      console.error("Error deleting audio file:", error);
      return false;
    }
  }
}

export const ttsService = new TTSService();

export async function generateSparkAudio(
  sparkId: number,
  fullTeaching: string
): Promise<TTSGenerationResult> {
  const filename = `spark-${sparkId}.mp3`;
  return ttsService.generateAndUploadAudio(fullTeaching, filename, "nova");
}

export async function getSparkAudioUrl(sparkId: number): Promise<string | null> {
  const filename = `spark-${sparkId}.mp3`;
  return ttsService.getAudioUrl(filename);
}

export async function generateReadingPlanDayAudio(
  planId: number,
  dayNumber: number,
  devotionalText: string
): Promise<TTSGenerationResult> {
  const filename = `plan-${planId}-day-${dayNumber}.mp3`;
  return ttsService.generateAndUploadAudio(devotionalText, filename, "nova");
}

export async function getReadingPlanDayAudioUrl(
  planId: number,
  dayNumber: number
): Promise<string | null> {
  const filename = `plan-${planId}-day-${dayNumber}.mp3`;
  return ttsService.getAudioUrl(filename);
}
