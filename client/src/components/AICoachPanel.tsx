import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, ChevronDown, ChevronUp, Lightbulb, Target, Heart, BookOpen, X, Loader2, Plus, Calendar, Zap, CheckCircle2 } from "lucide-react";

interface SuggestedGoal {
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

interface SuggestedHabit {
  title: string;
  frequency: "daily" | "weekdays" | "weekly";
  reason: string;
  supportedGoal: string;
  cue: string;
  routine: string;
  reward: string;
}

interface NinetyDayPlan {
  month1Theme: string;
  month1Actions: string[];
  month2Theme: string;
  month2Actions: string[];
  month3Theme: string;
  month3Actions: string[];
  quickWins: string[];
}

interface DailyFocus {
  topPriority: string;
  secondaryTasks: string[];
  energyTip: string;
  reminder: string;
}

interface WeeklyReview {
  winsToCelebrate?: string[];
  lessonsLearned?: string[];
  adjustmentsNeeded?: string[];
  nextWeekFocus?: string;
}

interface AICoachPanelProps {
  sessionId?: string | number;
  tool: "wheel" | "values" | "goals" | "plan" | "habits" | "checkin" | "wdep" | "strengths" | "styles" | "eq" | "sca" | "coaching" | "group-labs" | "sessions" | "360" | "reflection";
  data: Record<string, any>;
  title?: string;
  description?: string;
  onUseGoal?: (goal: SuggestedGoal) => void;
  onAddHabit?: (habit: SuggestedHabit) => void;
}

interface AIResponse {
  insights: string[];
  recommendations: string[];
  encouragement: string;
  patterns?: string[];
  nextSteps?: string[];
  scriptures?: { reference: string; text: string; application: string }[];
  suggestedGoals?: SuggestedGoal[];
  suggestedHabits?: SuggestedHabit[];
  ninetyDayPlan?: NinetyDayPlan;
  dailyFocus?: DailyFocus;
  weeklyReview?: WeeklyReview;
}

export function AICoachPanel({ sessionId, tool, data, title, description, onUseGoal, onAddHabit }: AICoachPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [usedGoals, setUsedGoals] = useState<Set<string>>(new Set());
  const [addedHabits, setAddedHabits] = useState<Set<string>>(new Set());
  const [expandedSection, setExpandedSection] = useState<string | null>("insights");

  const analyze = useMutation({
    mutationFn: async () => {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      const endpoint = sessionId
        ? `/api/vision/sessions/${sessionId}/ai/analyze`
        : `/api/ai/analyze`;
      const json = await apiFetchJson<{data: AIResponse}>(endpoint, {
        method: "POST",
        body: JSON.stringify({ tool, data }),
      });
      return json.data as AIResponse;
    },
    onSuccess: (data) => {
      setResponse(data);
      setIsOpen(true);
    },
  });

  const handleAsk = () => {
    if (response) {
      setIsOpen(true);
    } else {
      analyze.mutate();
    }
  };

  const sections = response ? [
    { key: "insights", title: "Key Insights", icon: Lightbulb, items: response.insights, color: "#7C9A8E" },
    { key: "recommendations", title: "Recommendations", icon: Target, items: response.recommendations, color: "#4A7C7C" },
    ...(response.patterns?.length ? [{ key: "patterns", title: "Patterns Noticed", icon: Heart, items: response.patterns, color: "#D4A574" }] : []),
    ...(response.nextSteps?.length ? [{ key: "nextSteps", title: "Next Steps", icon: Target, items: response.nextSteps, color: "#5B8C5A" }] : []),
  ] : [];

  return (
    <div className="relative">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleAsk}
          disabled={analyze.isPending}
          className="bg-gradient-to-r from-[#7C9A8E] to-[#4A7C7C] hover:from-[#6B8B7E] hover:to-[#3A6C6C] text-white rounded-xl shadow-md gap-2"
          data-testid="button-ai-coach"
        >
          {analyze.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
          {analyze.isPending ? "Analyzing..." : response ? "View AI Insights" : "Ask Awake AI"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && response && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#FAF8F5] rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#7C9A8E] to-[#4A7C7C] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{title || "Awake AI Insights"}</h3>
                    <p className="text-white/80 text-sm">{description || "Personalized guidance for your journey"}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)]">
                <Card className="mb-4 border-[#D4A574]/30 bg-gradient-to-br from-[#D4A574]/10 to-[#C17767]/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#D4A574]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Heart className="w-4 h-4 text-[#C17767]" />
                      </div>
                      <p className="text-[#2C3E2D] text-sm leading-relaxed italic">
                        "{response.encouragement}"
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  {sections.map((section) => (
                    <Card key={section.key} className="border-[#E8E4DE] overflow-hidden">
                      <button
                        onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                        className="w-full flex items-center justify-between p-3 bg-[#FDFCFA] hover:bg-[#F5F3F0] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${section.color}20` }}
                          >
                            <section.icon className="w-4 h-4" style={{ color: section.color }} />
                          </div>
                          <span className="font-semibold text-[#2C3E2D] text-sm">{section.title}</span>
                          <span className="text-xs text-[#8B9B8E] bg-[#E8E4DE] px-2 py-0.5 rounded-full">
                            {section.items.length}
                          </span>
                        </div>
                        {expandedSection === section.key ? (
                          <ChevronUp className="w-4 h-4 text-[#6B7B6E]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#6B7B6E]" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedSection === section.key && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CardContent className="pt-0 pb-3 px-3">
                              <ul className="space-y-2">
                                {section.items.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-[#4A5A4E]">
                                    <span className="text-[#7C9A8E] mt-1">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  ))}

                  {response.scriptures && response.scriptures.length > 0 && (
                    <Card className="border-[#9B8AA6]/30 bg-gradient-to-br from-[#9B8AA6]/5 to-[#9B8AA6]/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-[#9B8AA6]">
                          <BookOpen className="w-4 h-4" />
                          Scripture Guidance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {response.scriptures.map((scripture, i) => (
                          <div key={i} className="bg-white rounded-lg p-3 border border-[#9B8AA6]/20">
                            <p className="text-xs font-semibold text-[#9B8AA6] mb-1">{scripture.reference}</p>
                            <p className="text-sm text-[#4A5A4E] italic mb-2">"{scripture.text}"</p>
                            <p className="text-xs text-[#6B7B6E]">{scripture.application}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {response.suggestedGoals && response.suggestedGoals.length > 0 && (
                    <Card className="border-[#5B8C5A]/30 bg-gradient-to-br from-[#5B8C5A]/5 to-[#5B8C5A]/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-[#5B8C5A]">
                          <Target className="w-4 h-4" />
                          Suggested SMART Goals
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {response.suggestedGoals.map((goal, i) => (
                          <div key={i} className="bg-white rounded-lg p-3 border border-[#5B8C5A]/20">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-[#2C3E2D] text-sm">{goal.title}</h4>
                              <span className="text-xs bg-[#5B8C5A]/20 text-[#5B8C5A] px-2 py-0.5 rounded-full whitespace-nowrap">
                                {goal.focusArea}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B7B6E] mb-2">{goal.why}</p>
                            <div className="text-xs text-[#4A5A4E] space-y-1 mb-3">
                              <p><span className="font-medium">First step:</span> {goal.firstStep}</p>
                              <p><span className="font-medium">Deadline:</span> {goal.deadline}</p>
                            </div>
                            {onUseGoal && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  onUseGoal(goal);
                                  setUsedGoals(prev => new Set(prev).add(goal.title));
                                }}
                                disabled={usedGoals.has(goal.title)}
                                className="w-full bg-[#5B8C5A] hover:bg-[#4A7B49] text-white text-xs"
                                data-testid={`button-use-goal-${i}`}
                              >
                                {usedGoals.has(goal.title) ? (
                                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Added</>
                                ) : (
                                  <><Plus className="w-3 h-3 mr-1" /> Use This Goal</>
                                )}
                              </Button>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {response.ninetyDayPlan && (
                    <Card className="border-[#4A7C7C]/30 bg-gradient-to-br from-[#4A7C7C]/5 to-[#4A7C7C]/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-[#4A7C7C]">
                          <Calendar className="w-4 h-4" />
                          Your 90-Day Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {response.ninetyDayPlan.quickWins?.length > 0 && (
                          <div className="bg-[#D4A574]/10 rounded-lg p-3 border border-[#D4A574]/20">
                            <p className="text-xs font-semibold text-[#D4A574] mb-2">Quick Wins (This Week)</p>
                            <ul className="space-y-1">
                              {response.ninetyDayPlan.quickWins.map((win, i) => (
                                <li key={i} className="text-xs text-[#4A5A4E] flex items-start gap-1">
                                  <Zap className="w-3 h-3 text-[#D4A574] mt-0.5 flex-shrink-0" />
                                  {win}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="grid gap-2">
                          {[
                            { theme: response.ninetyDayPlan.month1Theme, actions: response.ninetyDayPlan.month1Actions, label: "Month 1" },
                            { theme: response.ninetyDayPlan.month2Theme, actions: response.ninetyDayPlan.month2Actions, label: "Month 2" },
                            { theme: response.ninetyDayPlan.month3Theme, actions: response.ninetyDayPlan.month3Actions, label: "Month 3" },
                          ].map((month, i) => (
                            <div key={i} className="bg-white rounded-lg p-2 border border-[#4A7C7C]/20">
                              <p className="text-xs font-semibold text-[#4A7C7C]">{month.label}: {month.theme}</p>
                              <ul className="mt-1 space-y-0.5">
                                {month.actions?.slice(0, 2).map((action, j) => (
                                  <li key={j} className="text-xs text-[#6B7B6E]">• {action}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {response.suggestedHabits && response.suggestedHabits.length > 0 && (
                    <Card className="border-[#7C9A8E]/30 bg-gradient-to-br from-[#7C9A8E]/5 to-[#7C9A8E]/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-[#7C9A8E]">
                          <CheckCircle2 className="w-4 h-4" />
                          Suggested Habits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {response.suggestedHabits.map((habit, i) => (
                          <div key={i} className="bg-white rounded-lg p-3 border border-[#7C9A8E]/20">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-[#2C3E2D] text-sm">{habit.title}</h4>
                              <span className="text-xs bg-[#7C9A8E]/20 text-[#7C9A8E] px-2 py-0.5 rounded-full capitalize">
                                {habit.frequency}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B7B6E] mb-2">{habit.reason}</p>
                            <div className="text-xs text-[#4A5A4E] space-y-1 mb-3 bg-[#F5F3F0] p-2 rounded">
                              <p><span className="font-medium">Cue:</span> {habit.cue}</p>
                              <p><span className="font-medium">Routine:</span> {habit.routine}</p>
                              <p><span className="font-medium">Reward:</span> {habit.reward}</p>
                            </div>
                            {onAddHabit && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  onAddHabit(habit);
                                  setAddedHabits(prev => new Set(prev).add(habit.title));
                                }}
                                disabled={addedHabits.has(habit.title)}
                                className="w-full bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white text-xs"
                                data-testid={`button-add-habit-${i}`}
                              >
                                {addedHabits.has(habit.title) ? (
                                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Added</>
                                ) : (
                                  <><Plus className="w-3 h-3 mr-1" /> Add This Habit</>
                                )}
                              </Button>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {response.dailyFocus && (
                    <Card className="border-[#D4A574]/30 bg-gradient-to-br from-[#D4A574]/5 to-[#D4A574]/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-[#D4A574]">
                          <Zap className="w-4 h-4" />
                          Today's Focus
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="bg-white rounded-lg p-3 border border-[#D4A574]/20">
                          <p className="text-xs font-semibold text-[#D4A574] mb-1">Top Priority</p>
                          <p className="text-sm text-[#2C3E2D] font-medium">{response.dailyFocus.topPriority}</p>
                        </div>
                        {response.dailyFocus.secondaryTasks?.length > 0 && (
                          <div className="bg-white rounded-lg p-2 border border-[#E8E4DE]">
                            <p className="text-xs text-[#6B7B6E] mb-1">Also consider:</p>
                            <ul className="space-y-0.5">
                              {response.dailyFocus.secondaryTasks.map((task, i) => (
                                <li key={i} className="text-xs text-[#4A5A4E]">• {task}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <div className="flex-1 bg-[#5B8C5A]/10 rounded-lg p-2 border border-[#5B8C5A]/20">
                            <p className="text-xs font-medium text-[#5B8C5A]">Energy Tip</p>
                            <p className="text-xs text-[#4A5A4E]">{response.dailyFocus.energyTip}</p>
                          </div>
                        </div>
                        <p className="text-xs text-[#7C9A8E] italic text-center pt-1">"{response.dailyFocus.reminder}"</p>
                      </CardContent>
                    </Card>
                  )}

                  {response.weeklyReview && (
                    <Card className="border-[#C17767]/30 bg-gradient-to-br from-[#C17767]/5 to-[#C17767]/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-[#C17767]">
                          <Heart className="w-4 h-4" />
                          Weekly Review
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {response.weeklyReview.winsToCelebrate && response.weeklyReview.winsToCelebrate.length > 0 && (
                          <div className="bg-[#5B8C5A]/10 rounded-lg p-2 border border-[#5B8C5A]/20">
                            <p className="text-xs font-semibold text-[#5B8C5A] mb-1">Wins to Celebrate</p>
                            <ul className="space-y-0.5">
                              {response.weeklyReview.winsToCelebrate.map((win, i) => (
                                <li key={i} className="text-xs text-[#4A5A4E]">• {win}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {response.weeklyReview.adjustmentsNeeded && response.weeklyReview.adjustmentsNeeded.length > 0 && (
                          <div className="bg-white rounded-lg p-2 border border-[#E8E4DE]">
                            <p className="text-xs font-semibold text-[#C17767] mb-1">Adjustments Needed</p>
                            <ul className="space-y-0.5">
                              {response.weeklyReview.adjustmentsNeeded.map((adj, i) => (
                                <li key={i} className="text-xs text-[#4A5A4E]">• {adj}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {response.weeklyReview.nextWeekFocus && (
                          <div className="bg-[#4A7C7C]/10 rounded-lg p-2 border border-[#4A7C7C]/20">
                            <p className="text-xs font-semibold text-[#4A7C7C] mb-1">Next Week Focus</p>
                            <p className="text-xs text-[#4A5A4E]">{response.weeklyReview.nextWeekFocus}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-[#E8E4DE] bg-[#FDFCFA]">
                <Button
                  onClick={() => analyze.mutate()}
                  disabled={analyze.isPending}
                  variant="outline"
                  className="w-full border-[#7C9A8E] text-[#7C9A8E] hover:bg-[#7C9A8E]/10"
                >
                  {analyze.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Bot className="w-4 h-4 mr-2" />}
                  Get Fresh Insights
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function IntroGuide({ 
  title, 
  description, 
  benefits, 
  howToUse 
}: { 
  title: string; 
  description: string; 
  benefits: string[]; 
  howToUse: string[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-6 border-[#E8E4DE] bg-gradient-to-br from-[#FDFCFA] to-[#F5F3F0] rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C9A8E]/15 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-[#7C9A8E]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2C3E2D]">About {title}</h3>
            <p className="text-sm text-[#6B7B6E]">Tap to learn more</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#6B7B6E]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#6B7B6E]" />
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 pb-4 px-4 space-y-4">
              <p className="text-sm text-[#4A5A4E] leading-relaxed">{description}</p>
              
              <div>
                <h4 className="text-sm font-semibold text-[#2C3E2D] mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#C17767]" /> Benefits
                </h4>
                <ul className="space-y-1">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="text-sm text-[#4A5A4E] flex items-start gap-2">
                      <span className="text-[#5B8C5A]">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-[#2C3E2D] mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#4A7C7C]" /> How to Use
                </h4>
                <ol className="space-y-1">
                  {howToUse.map((step, i) => (
                    <li key={i} className="text-sm text-[#4A5A4E] flex items-start gap-2">
                      <span className="text-[#7C9A8E] font-semibold">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
