import OpenAI from "openai";

const openai = new OpenAI();

export interface ModerationResult {
  flagged: boolean;
  categories: {
    harassment: boolean;
    "harassment/threatening": boolean;
    hate: boolean;
    "hate/threatening": boolean;
    "self-harm": boolean;
    "self-harm/intent": boolean;
    "self-harm/instructions": boolean;
    sexual: boolean;
    "sexual/minors": boolean;
    violence: boolean;
    "violence/graphic": boolean;
  };
  categoryScores: Record<string, number>;
  reason?: string;
}

export async function moderateContent(text: string): Promise<ModerationResult> {
  try {
    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    const result = moderation.results[0];
    
    let reason: string | undefined;
    if (result.flagged) {
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, value]) => value)
        .map(([key]) => key.replace("/", " ").replace("-", " "));
      reason = `Content flagged for: ${flaggedCategories.join(", ")}`;
    }

    return {
      flagged: result.flagged,
      categories: result.categories as ModerationResult["categories"],
      categoryScores: result.category_scores as unknown as Record<string, number>,
      reason,
    };
  } catch (error) {
    console.error("Moderation API error:", error);
    return {
      flagged: false,
      categories: {
        harassment: false,
        "harassment/threatening": false,
        hate: false,
        "hate/threatening": false,
        "self-harm": false,
        "self-harm/intent": false,
        "self-harm/instructions": false,
        sexual: false,
        "sexual/minors": false,
        violence: false,
        "violence/graphic": false,
      },
      categoryScores: {},
    };
  }
}

export function isSafeContent(result: ModerationResult): boolean {
  if (result.flagged) return false;
  
  const scores = result.categoryScores;
  if (scores.violence > 0.8) return false;
  if (scores.hate > 0.5) return false;
  if (scores.harassment > 0.7) return false;
  if (scores["sexual/minors"] > 0.01) return false;
  
  return true;
}
