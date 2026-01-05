import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AICoachRequest {
  tool: "wheel" | "values" | "goals" | "plan" | "habits" | "checkin" | "wdep" | "strengths" | "styles" | "eq" | "sca";
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

export interface SuggestedGoal {
  title: string;
  why: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  deadline: string;
  firstStep: string;
  focusArea: string;
}

export interface SuggestedHabit {
  title: string;
  frequency: "daily" | "weekdays" | "weekly";
  reason: string;
  supportedGoal: string;
  cue: string;
  routine: string;
  reward: string;
}

export interface NinetyDayPlan {
  month1Theme: string;
  month1Actions: string[];
  month2Theme: string;
  month2Actions: string[];
  month3Theme: string;
  month3Actions: string[];
  quickWins: string[];
}

export interface DailyFocus {
  topPriority: string;
  secondaryTasks: string[];
  energyTip: string;
  reminder: string;
}

export interface WeeklyReview {
  winsToСelebrate: string[];
  lessonsLearned: string[];
  adjustmentsNeeded: string[];
  nextWeekFocus: string;
}

export interface AICoachResponse {
  insights: string[];
  recommendations: string[];
  encouragement: string;
  scriptures?: { reference: string; text: string; application: string }[];
  patterns?: string[];
  nextSteps?: string[];
  suggestedGoals?: SuggestedGoal[];
  suggestedHabits?: SuggestedHabit[];
  ninetyDayPlan?: NinetyDayPlan;
  dailyFocus?: DailyFocus;
  weeklyReview?: WeeklyReview;
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
Review this person's SMART goals AND suggest new goals based on their Wheel of Life and values.

CURRENT GOALS:
${(data.goals || []).length > 0 ? (data.goals || []).map((g: any, i: number) => `
Goal ${i + 1}: ${g.title}
- Why it matters: ${g.why || "Not stated"}
- Specific: ${g.specific || "Not defined"}
- Measurable: ${g.measurable || "Not defined"} (Metric: ${g.metricName} -> ${g.metricTarget})
- Achievable: ${g.achievable || "Not assessed"}
- Relevant: ${g.relevant || "Not connected"}
- Deadline: ${g.deadline || "No deadline"}
- First Step: ${g.firstStep || "Not defined"}
- Obstacle Plan: ${g.obstaclesPlan || "Not defined"}
`).join("\n") : "No goals created yet - they need suggestions!"}

WHEEL OF LIFE SCORES (areas needing attention):
${data.wheelScores ? Object.entries(data.wheelScores).sort((a: any, b: any) => a[1] - b[1]).map(([k, v]) => `- ${k}: ${v}/10`).join("\n") : "Not assessed yet"}

FOCUS AREAS: ${(context.focusAreas || []).join(", ") || "Not selected yet"}
${context.values ? `CORE VALUES: ${context.values.join(", ")}` : ""}
${context.purposeStatement ? `PURPOSE: ${context.purposeStatement}` : ""}
${context.themeWord ? `THEME WORD: ${context.themeWord}` : ""}

Please provide:
1. Insights on their current goals (if any) and life balance
2. Assessment of goal quality (are they truly SMART?)
3. How their goals align with their values/purpose
4. 2-3 SUGGESTED NEW SMART GOALS based on their lowest wheel scores and values
5. A 90-DAY PLAN with monthly themes and quick wins
6. Encouragement to take action

For each suggested goal, provide complete SMART details they can use directly.
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
Analyze this person's habit tracking AND suggest new habits that support their SMART goals.

CURRENT HABITS:
${(data.habits || []).length > 0 ? (data.habits || []).map((h: any) => `
- ${h.title} (${h.frequency})
  - Streak: ${h.streak || 0} days
  - This week: ${h.completedThisWeek || 0}/7
  - Overall completion: ${h.completionRate || 0}%
`).join("\n") : "No habits created yet - they need suggestions!"}

THEIR SMART GOALS:
${(data.goals || []).map((g: any) => `- ${g.title}`).join("\n") || "No goals set yet"}

WHEEL OF LIFE FOCUS AREAS: ${(context.focusAreas || []).join(", ") || "Not selected"}
${context.values ? `CORE VALUES: ${context.values.join(", ")}` : ""}
${context.themeWord ? `THEME WORD: ${context.themeWord}` : ""}

Please provide:
1. Insights on their current habits and patterns
2. Which habits are working well and why
3. Adjustments for struggling habits
4. 2-3 SUGGESTED NEW HABITS that directly support their goals
   - For each habit: title, frequency (daily/weekdays/weekly), the goal it supports, and why
   - Include the habit loop: cue (trigger), routine (the habit), reward (payoff)
5. Tips for building momentum and maintaining streaks
6. Encouragement based on their progress
`,

  checkin: (data, context) => `
Provide coaching for daily focus AND weekly review based on their check-ins and goals.

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

THEIR CURRENT GOALS:
${(data.goals || []).map((g: any) => `- ${g.title} (${g.progress || 0}% complete)`).join("\n") || "No goals set"}

THEIR HABITS (This Week):
${(data.habits || []).map((h: any) => `- ${h.title}: ${h.completedThisWeek || 0}/7 days`).join("\n") || "No habits tracked"}

${context.seasonLabel ? `Season: ${context.seasonLabel}` : ""}
${context.themeWord ? `Theme: ${context.themeWord}` : ""}

Please provide:
1. Insights on their energy patterns and focus
2. Celebration of wins and progress (be specific!)
3. Patterns or blockers to address
4. DAILY FOCUS SUGGESTION for today:
   - Top priority task based on their goals
   - 2-3 secondary tasks
   - Energy management tip
   - A motivating reminder
5. WEEKLY REVIEW SUMMARY:
   - Wins to celebrate
   - Key lessons learned
   - Adjustments needed for next week
   - Recommended focus for next week
6. Personalized encouragement
`,

  wdep: (data, context) => `
Analyze this person's WDEP (Reality Therapy) exercise and provide coaching insights.
WDEP is based on Choice Theory by William Glasser.

W - WANTS (What do they really want?):
${data.want || "Not yet defined"}

D - DOING (What are they currently doing?):
${data.doing || "Not yet defined"}

E - EVALUATION (Is what they're doing helping?):
${data.evaluate || "Not yet evaluated"}

P - PLAN (What's their new plan?):
${data.plan || "Not yet planned"}

EXPERIMENT (7-day action):
${data.experiment || "Not yet set"}

${context.focusAreas ? `Their focus areas: ${context.focusAreas.join(", ")}` : ""}
${context.themeWord ? `Theme word: ${context.themeWord}` : ""}

Please provide:
1. Insights on the gap between their wants and current behaviors
2. Assessment of their self-evaluation honesty
3. Feedback on their plan's likelihood of success
4. Suggestions to make their 7-day experiment more effective
5. Encouragement for taking ownership of their choices
`,

  strengths: (data, context) => `
Analyze this person's character strengths discovery and help them apply their strengths.

TOP 5 STRENGTHS SELECTED:
${(data.topStrengths || []).map((s: any, i: number) => `${i + 1}. ${s.name}${s.meaning ? ` - "${s.meaning}"` : ""}`).join("\n")}

${data.allStrengths ? `
ALL STRENGTHS RATED:
${data.allStrengths.map((s: any) => `- ${s.name}: ${s.rating || "Not rated"}`).join("\n")}
` : ""}

${context.focusAreas ? `Their focus areas: ${context.focusAreas.join(", ")}` : ""}
${context.purposeStatement ? `Their purpose: ${context.purposeStatement}` : ""}

Based on the VIA Character Strengths framework, please provide:
1. Insights on their unique strengths combination
2. How their top strengths work together synergistically
3. Practical ways to use each strength daily
4. How to leverage their strengths for their goals/focus areas
5. Watch-outs (potential overuse of certain strengths)
6. Encouragement about their character
`,

  styles: (data, context) => `
Analyze this person's communication and behavioral style results and provide insights.

PRIMARY STYLE: ${data.primaryStyle || "Not determined"}
SECONDARY STYLE: ${data.secondaryStyle || "Not determined"}

STYLE SCORES:
- Driver (D): ${data.scores?.driver || 0}
- Influencer (I): ${data.scores?.influencer || 0}
- Supporter (S): ${data.scores?.supporter || 0}
- Analyzer (C): ${data.scores?.analyzer || 0}

${data.quizAnswers ? `
NOTABLE RESPONSES:
${Object.entries(data.quizAnswers).slice(0, 5).map(([q, a]) => `- Q${q}: ${a}`).join("\n")}
` : ""}

${context.focusAreas ? `Their focus areas: ${context.focusAreas.join(", ")}` : ""}

Based on the DISC-inspired 4 Styles framework, please provide:
1. What their style combination reveals about them
2. Their natural strengths in communication and work
3. Potential blind spots to be aware of
4. How to flex their style when working with others
5. Tips for their style when facing stress or conflict
6. Encouragement about their unique contribution
`,

  eq: (data, context) => `
Analyze this person's Emotional Intelligence assessment and provide development insights.

EQ DOMAIN SCORES (1-10 scale):
- Self-Awareness: ${data.scores?.selfAwareness || "Not assessed"}
- Self-Management: ${data.scores?.selfManagement || "Not assessed"}
- Social Awareness: ${data.scores?.socialAwareness || "Not assessed"}
- Relationship Management: ${data.scores?.relationshipManagement || "Not assessed"}

SELECTED PRACTICES:
${(data.selectedPractices || []).map((p: any) => `- ${p.name} (${p.domain})`).join("\n") || "None selected yet"}

${data.reflections ? `
SELF-REFLECTIONS:
${Object.entries(data.reflections).map(([domain, reflection]) => `- ${domain}: ${reflection}`).join("\n")}
` : ""}

${context.focusAreas ? `Their focus areas: ${context.focusAreas.join(", ")}` : ""}

Based on the Daniel Goleman EQ framework, please provide:
1. Analysis of their EQ profile balance
2. Their strongest EQ domain and how to leverage it
3. Priority area for development and why
4. Specific micro-practices for their growth areas
5. How EQ connects to their life goals
6. Encouragement about their emotional growth journey
`,

  sca: (data, context) => `
Analyze this person's Self-Concordant Action (Motivation Booster) exercise.

ACTIVITY BEING BOOSTED: ${data.activity || "Not specified"}

BASELINE MOTIVATION (before exercise): ${data.baselineMotivation || "Not rated"}/10

FOCUS LIST (Reasons this matters):
${(data.focusList || []).map((item: any, i: number) => `${i + 1}. ${item.reason}${item.rating ? ` (Impact: ${item.rating}/10)` : ""}`).join("\n") || "Not created yet"}

FINAL MOTIVATION (after exercise): ${data.finalMotivation || "Not rated"}/10
MOTIVATION CHANGE: ${data.finalMotivation && data.baselineMotivation ? `+${data.finalMotivation - data.baselineMotivation}` : "N/A"}

${context.values ? `Their core values: ${context.values.join(", ")}` : ""}
${context.purposeStatement ? `Their purpose: ${context.purposeStatement}` : ""}

Based on Self-Concordance Theory (aligned with intrinsic motivation), please provide:
1. Analysis of why their motivation increased (or didn't)
2. Which reasons are most powerful and why
3. Suggestions for additional intrinsic motivators
4. How to maintain this motivation over time
5. Connections between this activity and their deeper purpose
6. Encouragement to take action now
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

  const goalsAddition = request.tool === "goals" ? `,
  "suggestedGoals": [
    {
      "title": "Goal title",
      "why": "Why this goal matters",
      "specific": "What exactly will be accomplished",
      "measurable": "How to measure progress",
      "achievable": "Why this is realistic",
      "relevant": "How it connects to values/purpose",
      "deadline": "Target date (e.g., '90 days from now')",
      "firstStep": "The very first action to take",
      "focusArea": "Which wheel of life area this addresses"
    }
  ],
  "ninetyDayPlan": {
    "month1Theme": "Theme for month 1",
    "month1Actions": ["action 1", "action 2"],
    "month2Theme": "Theme for month 2",
    "month2Actions": ["action 1", "action 2"],
    "month3Theme": "Theme for month 3",
    "month3Actions": ["action 1", "action 2"],
    "quickWins": ["quick win 1", "quick win 2"]
  }` : "";

  const habitsAddition = request.tool === "habits" ? `,
  "suggestedHabits": [
    {
      "title": "Habit name",
      "frequency": "daily or weekdays or weekly",
      "reason": "Why this habit will help",
      "supportedGoal": "Which goal this supports",
      "cue": "Trigger/reminder for the habit",
      "routine": "The actual habit action",
      "reward": "The payoff/celebration"
    }
  ]` : "";

  const checkinAddition = request.tool === "checkin" ? `,
  "dailyFocus": {
    "topPriority": "The one thing to focus on today",
    "secondaryTasks": ["task 1", "task 2"],
    "energyTip": "How to manage energy today",
    "reminder": "A motivating reminder"
  },
  "weeklyReview": {
    "winsToCelebrate": ["win 1", "win 2"],
    "lessonsLearned": ["lesson 1"],
    "adjustmentsNeeded": ["adjustment 1"],
    "nextWeekFocus": "Main focus for next week"
  }` : "";

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
  ${request.mode === "faith" ? ', "scriptures": [{"reference": "...", "text": "...", "application": "..."}]' : ""}${goalsAddition}${habitsAddition}${checkinAddition}
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
