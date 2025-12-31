import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AICoachRequest {
  tool: "wheel" | "values" | "goals" | "plan" | "habits" | "checkin";
  mode: "classic" | "faith";
  data: Record<string, any>;
  sessionContext?: {
    seasonLabel?: string;
    themeWord?: string;
    focusAreas?: string[];
    values?: string[];
    purposeStatement?: string;
  };
}

export interface AICoachResponse {
  insights: string[];
  recommendations: string[];
  encouragement: string;
  scriptures?: { reference: string; text: string; application: string }[];
  patterns?: string[];
  nextSteps?: string[];
}

const SYSTEM_PROMPTS = {
  classic: `You are a warm, supportive life coach helping someone design their best season. 
Your tone is encouraging, practical, and personalized. You use evidence-based coaching frameworks.
Keep responses concise but meaningful. Use bullet points for clarity.
Focus on actionable insights and genuine encouragement.`,

  faith: `You are a warm, supportive Christian life coach helping someone align their life with God's purpose.
Your tone is encouraging, faith-filled, and biblically grounded. You integrate Scripture naturally.
Keep responses concise but meaningful. Use bullet points for clarity.
Focus on actionable insights, spiritual encouragement, and biblical wisdom.
When providing Scripture, include the reference and a brief application to their situation.`,
};

const TOOL_PROMPTS: Record<string, (data: any, context: any) => string> = {
  wheel: (data, context) => `
Analyze this person's Wheel of Life assessment and provide coaching insights.

SCORES (1-10 scale):
${Object.entries(data.scores || {}).map(([k, v]) => `- ${k}: ${v}/10`).join("\n")}

NOTES:
${Object.entries(data.notes || {}).map(([k, v]) => `- ${k}: ${v || "No notes"}`).join("\n")}

FOCUS AREAS SELECTED: ${(data.focusAreas || []).join(", ") || "None yet"}

${context.themeWord ? `Their theme word for this season: ${context.themeWord}` : ""}

Please provide:
1. Key patterns you notice in their life balance
2. Why their lowest-scoring areas might be connected
3. Specific recommendations for their chosen focus areas
4. Encouragement based on their strengths (higher-scoring areas)
`,

  values: (data, context) => `
Help this person articulate and align with their core values.

SELECTED VALUES: ${(data.values || []).join(", ")}
TOP VALUE MEANING: ${data.topValueMeaning || "Not yet defined"}

PURPOSE FLOWER (Ikigai):
- What they love: ${data.passion || "Not defined"}
- What they're good at: ${data.strengths || "Not defined"}
- What the world needs: ${data.needs || "Not defined"}
- What they can be rewarded for: ${data.rewards || "Not defined"}

CURRENT PURPOSE STATEMENT: ${data.purposeStatement || "Not yet written"}

${context.themeWord ? `Their theme word: ${context.themeWord}` : ""}

Please provide:
1. Insights on how their values connect to their purpose
2. Help refining their purpose statement (suggest a draft if empty)
3. How to live out their top value daily
4. Encouragement about their unique calling
`,

  goals: (data, context) => `
Review this person's SMART goals and provide coaching feedback.

GOALS:
${(data.goals || []).map((g: any, i: number) => `
Goal ${i + 1}: ${g.title}
- Why it matters: ${g.why || "Not stated"}
- Specific: ${g.specific || "Not defined"}
- Measurable: ${g.measurable || "Not defined"} (Metric: ${g.metricName} -> ${g.metricTarget})
- Achievable: ${g.achievable || "Not assessed"}
- Relevant: ${g.relevant || "Not connected"}
- Deadline: ${g.deadline || "No deadline"}
- First Step: ${g.firstStep || "Not defined"}
- Obstacle Plan: ${g.obstaclesPlan || "Not defined"}
`).join("\n")}

${context.values ? `Their core values: ${context.values.join(", ")}` : ""}
${context.purposeStatement ? `Their purpose: ${context.purposeStatement}` : ""}

Please provide:
1. Assessment of goal quality (are they truly SMART?)
2. Suggestions to strengthen weaker goals
3. How their goals align with their values/purpose
4. Motivation and encouragement to take action
`,

  plan: (data, context) => `
Review this person's 90-day plan and provide strategic coaching.

FOCUS OUTCOME: ${data.focusOutcome || "Not defined"}

KEY RESULTS:
${(data.keyResults || []).map((kr: string, i: number) => `${i + 1}. ${kr || "Not defined"}`).join("\n")}

WEEKLY ANCHORS: ${(data.weeklyAnchors || []).join(", ") || "None set"}

SCHEDULE ANCHORS:
- Planning Day: ${data.scheduleAnchors?.planningDay || "Not set"}
- Deep Work Time: ${data.scheduleAnchors?.deepWorkTime || "Not set"}
- Review Day: ${data.scheduleAnchors?.reviewDay || "Not set"}

ACCOUNTABILITY: ${data.accountabilityPlan || "No plan"}
STUCK PLAN: ${data.stuckPlan || "No plan"}

${context.focusAreas ? `Their focus areas: ${context.focusAreas.join(", ")}` : ""}

Please provide:
1. Assessment of their 90-day plan clarity and completeness
2. Suggestions for stronger key results
3. Tips for maintaining weekly rhythm
4. Encouragement for the journey ahead
`,

  habits: (data, context) => `
Analyze this person's habit tracking and provide insights.

HABITS:
${(data.habits || []).map((h: any) => `
- ${h.title} (${h.frequency})
  - Streak: ${h.streak || 0} days
  - This week: ${h.completedThisWeek || 0}/7
  - Overall completion: ${h.completionRate || 0}%
`).join("\n")}

${context.focusAreas ? `Their focus areas: ${context.focusAreas.join(", ")}` : ""}
${context.themeWord ? `Theme word: ${context.themeWord}` : ""}

Please provide:
1. Patterns in their habit consistency
2. Which habits are working well and why
3. Suggestions for struggling habits
4. Tips for building momentum and maintaining streaks
5. Encouragement based on their progress
`,

  checkin: (data, context) => `
Provide a weekly coaching summary based on their check-ins.

DAILY CHECK-IN (Today):
- Energy Level: ${data.daily?.energy || "Not logged"}/5
- Today's Focus: ${data.daily?.todayFocus || "Not set"}
- Notes: ${data.daily?.note || "None"}
${data.daily?.prayerNote ? `- Prayer: ${data.daily.prayerNote}` : ""}

WEEKLY REVIEW:
- Biggest Win: ${data.weekly?.win || "Not shared"}
- Lesson Learned: ${data.weekly?.lesson || "Not shared"}
- Obstacle Faced: ${data.weekly?.obstacle || "Not shared"}
- Adjustment Planned: ${data.weekly?.adjustment || "Not shared"}
- Next Week Priorities: ${(data.weekly?.nextWeekTop3 || []).join(", ") || "Not set"}
${data.weekly?.gratitude ? `- Gratitude: ${data.weekly.gratitude}` : ""}

${context.seasonLabel ? `Season: ${context.seasonLabel}` : ""}
${context.themeWord ? `Theme: ${context.themeWord}` : ""}

Please provide:
1. Key observations from their week
2. Patterns in energy and focus
3. Celebration of wins and progress
4. Strategic advice for next week
5. Personalized encouragement
`,
};

export async function getAICoachInsights(request: AICoachRequest): Promise<AICoachResponse> {
  const systemPrompt = SYSTEM_PROMPTS[request.mode];
  const toolPrompt = TOOL_PROMPTS[request.tool];
  
  if (!toolPrompt) {
    throw new Error(`Unknown tool: ${request.tool}`);
  }

  const userPrompt = toolPrompt(request.data, request.sessionContext || {});

  const faithAddition = request.mode === "faith" ? `
Also include 2-3 relevant Scripture references with brief applications to their situation.
Format scriptures as: {"reference": "Book Chapter:Verse", "text": "The verse text", "application": "How it applies"}
` : "";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt + faithAddition + `

Respond in JSON format:
{
  "insights": ["insight 1", "insight 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "encouragement": "A warm, personalized encouragement message",
  "patterns": ["pattern 1", "pattern 2", ...],
  "nextSteps": ["step 1", "step 2", ...]
  ${request.mode === "faith" ? ', "scriptures": [{"reference": "...", "text": "...", "application": "..."}]' : ""}
}` },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  return JSON.parse(content) as AICoachResponse;
}
