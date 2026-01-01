import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Target, Plus, Check, Flame, Calendar, Trophy, 
  Loader2, ArrowRight, Sparkles, CheckCircle2, Circle,
  X, Edit2, Trash2, Bot, Lightbulb, Heart, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@shared/schema";

const categories = [
  { value: "faith", label: "Faith & Spiritual Growth", icon: "🙏" },
  { value: "health", label: "Health & Fitness", icon: "💪" },
  { value: "career", label: "Career & Finance", icon: "💼" },
  { value: "relationships", label: "Relationships", icon: "❤️" },
  { value: "learning", label: "Learning & Growth", icon: "📚" },
  { value: "service", label: "Service & Impact", icon: "🌍" },
];

const templates = [
  { title: "Read the Bible daily", category: "faith", habit: "Read Bible for 15 minutes" },
  { title: "Exercise regularly", category: "health", habit: "Exercise 30 minutes" },
  { title: "Save money monthly", category: "career", habit: "Transfer to savings" },
  { title: "Connect with loved ones", category: "relationships", habit: "Call/text a friend" },
  { title: "Learn a new skill", category: "learning", habit: "Study for 30 minutes" },
  { title: "Volunteer monthly", category: "service", habit: "Serve in community" },
];

interface Goal {
  id: number;
  title: string;
  category: string;
  targetDate: string;
  progress: number;
  habits: Habit[];
  milestones: Milestone[];
}

interface Habit {
  id: number;
  title: string;
  frequency: string;
  completedToday: boolean;
  streak: number;
}

interface Milestone {
  id: number;
  title: string;
  dueDate: string;
  completed: boolean;
}

export function Goals() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth() as { 
    user: User | null; 
    isAuthenticated: boolean; 
    isLoading: boolean 
  };
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"goals" | "habits">("goals");
  const [showAICoach, setShowAICoach] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "faith",
    targetDate: "",
    why: "",
    firstStep: "",
    habit: "",
  });

  const { data: goalsData, isLoading } = useQuery<{ goals: Goal[] }>({
    queryKey: ["/api/goals"],
    enabled: isAuthenticated,
  });

  const goals = goalsData?.goals || [];

  const createGoalMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/goals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast.success("Goal created! Let's make it happen!");
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create goal");
    },
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: number; completed: boolean }) => {
      const res = await apiRequest("POST", `/api/habits/${habitId}/toggle`, { 
        completed, 
        date: new Date().toISOString().split("T")[0] 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast.success("Habit logged!");
    },
  });

  const aiSuggestMutation = useMutation({
    mutationFn: async (category: string) => {
      const res = await apiRequest("POST", "/api/goals/ai-suggest", { category });
      return res.json();
    },
    onSuccess: (data) => {
      setAiSuggestions(data);
    },
    onError: () => {
      toast.error("Failed to get AI suggestions");
    },
  });

  const aiCoachMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/goals/ai-coach", { 
        goals: goals.map(g => ({
          title: g.title,
          why: "",
          relevant: g.category,
          deadline: g.targetDate,
        }))
      });
      return res.json();
    },
    onSuccess: (data) => {
      setAiSuggestions(data);
      setShowAICoach(true);
    },
    onError: () => {
      toast.error("Failed to get AI coaching");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      category: "faith",
      targetDate: "",
      why: "",
      firstStep: "",
      habit: "",
    });
  };

  const useTemplate = (template: typeof templates[0]) => {
    setFormData({
      ...formData,
      title: template.title,
      category: template.category,
      habit: template.habit,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a goal title");
      return;
    }
    createGoalMutation.mutate(formData);
  };

  const today = new Date().toISOString().split("T")[0];
  const allHabits = goals.flatMap(g => g.habits);
  const completedToday = allHabits.filter(h => h.completedToday).length;
  const totalHabits = allHabits.length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <div className="max-w-md mx-auto px-4 pt-20 pb-24">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
              Goals & Resolutions
            </h1>
            <p className="text-gray-600 mb-6">
              Set meaningful goals, build daily habits, and track your progress throughout the year.
            </p>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary hover:bg-primary/90"
            >
              Sign In to Get Started
            </Button>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Navbar />
      
      <div className="max-w-md mx-auto px-4 pt-20 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">
            Goals & Resolutions
          </h1>
          <p className="text-gray-500">
            {new Date().getFullYear()} - Your year of breakthrough
          </p>
        </motion.div>

        {/* Daily Progress Card */}
        {totalHabits > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#1a2744] to-[#243656] rounded-2xl p-5 mb-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/70 text-sm">Today's Progress</p>
                <p className="text-2xl font-bold">{completedToday}/{totalHabits} habits</p>
              </div>
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
                <Flame className="h-7 w-7 text-orange-400" />
              </div>
            </div>
            <Progress 
              value={(completedToday / totalHabits) * 100} 
              className="h-2 bg-white/20"
            />
          </motion.div>
        )}

        {/* AI Coach Button */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <Button
              onClick={() => aiCoachMutation.mutate()}
              disabled={aiCoachMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl py-4"
              data-testid="ai-coach-button"
            >
              {aiCoachMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Bot className="h-5 w-5 mr-2" />
              )}
              Get AI Coaching Insights
            </Button>
          </motion.div>
        )}

        {/* AI Coach Panel */}
        <AnimatePresence>
          {showAICoach && aiSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-600" />
                    <h3 className="font-bold text-gray-900 dark:text-white">AI Coach Insights</h3>
                  </div>
                  <button 
                    onClick={() => setShowAICoach(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {aiSuggestions.encouragement && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Heart className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">{aiSuggestions.encouragement}</p>
                    </div>
                  </div>
                )}

                {aiSuggestions.insights?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" /> Key Insights
                    </h4>
                    <ul className="space-y-2">
                      {aiSuggestions.insights.slice(0, 3).map((insight: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg p-3">
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSuggestions.recommendations?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {aiSuggestions.recommendations.slice(0, 3).map((rec: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSuggestions.scriptures?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Scripture for Your Journey</h4>
                    {aiSuggestions.scriptures.slice(0, 2).map((scripture: any, i: number) => (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-2">
                        <p className="text-sm font-medium text-primary">{scripture.reference}</p>
                        <p className="text-sm italic text-gray-600 dark:text-gray-400 mt-1">"{scripture.text}"</p>
                        <p className="text-xs text-gray-500 mt-2">{scripture.application}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => aiCoachMutation.mutate()}
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-purple-600"
                  disabled={aiCoachMutation.isPending}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${aiCoachMutation.isPending ? 'animate-spin' : ''}`} />
                  Refresh Insights
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Switcher */}
        <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("goals")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === "goals"
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            My Goals
          </button>
          <button
            onClick={() => setActiveTab("habits")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === "habits"
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Daily Habits
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Goals Tab */}
            {activeTab === "goals" && (
              <div className="space-y-4">
                {goals.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Start Your Journey
                    </h3>
                    <p className="text-gray-500 mb-6 text-sm">
                      Set your first goal and build habits that will transform your year.
                    </p>
                    <Button 
                      onClick={() => setIsModalOpen(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Create First Goal
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    {goals.map((goal, i) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">
                              {categories.find(c => c.value === goal.category)?.icon || "🎯"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900">{goal.title}</h3>
                            <p className="text-xs text-gray-500 mb-3">
                              Target: {new Date(goal.targetDate).toLocaleDateString("en-US", { 
                                month: "short", 
                                day: "numeric", 
                                year: "numeric" 
                              })}
                            </p>
                            <div className="flex items-center gap-2">
                              <Progress value={goal.progress} className="h-1.5 flex-1" />
                              <span className="text-xs font-medium text-gray-600">
                                {goal.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <Button 
                      onClick={() => setIsModalOpen(true)}
                      variant="outline"
                      className="w-full border-dashed"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Another Goal
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Habits Tab */}
            {activeTab === "habits" && (
              <div className="space-y-3">
                {allHabits.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No habits yet</h3>
                    <p className="text-gray-500 text-sm">
                      Create a goal with a daily habit to start tracking.
                    </p>
                  </div>
                ) : (
                  allHabits.map((habit, i) => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${
                        habit.completedToday 
                          ? "border-green-200 bg-green-50/50" 
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleHabitMutation.mutate({ 
                            habitId: habit.id, 
                            completed: !habit.completedToday 
                          })}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            habit.completedToday
                              ? "bg-green-500 text-white"
                              : "border-2 border-gray-300 hover:border-primary"
                          }`}
                        >
                          {habit.completedToday && <Check className="h-4 w-4" />}
                        </button>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            habit.completedToday ? "text-green-700" : "text-gray-900"
                          }`}>
                            {habit.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {habit.streak > 0 ? `🔥 ${habit.streak} day streak` : habit.frequency}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Goal Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              New Goal
            </DialogTitle>
          </DialogHeader>

          {/* Quick Templates */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Quick start with a template:</p>
            <div className="flex flex-wrap gap-2">
              {templates.slice(0, 3).map((t) => (
                <button
                  key={t.title}
                  onClick={() => useTemplate(t)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all"
                >
                  {categories.find(c => c.value === t.category)?.icon} {t.title}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                What do you want to achieve? *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Read through the entire Bible"
                data-testid="input-goal-title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger data-testid="select-goal-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Target Date</label>
                <Input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  data-testid="input-goal-date"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Why is this important to you?
              </label>
              <Textarea
                value={formData.why}
                onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                placeholder="What will achieving this goal mean for your life?"
                rows={2}
                data-testid="input-goal-why"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Daily habit to build (optional)
              </label>
              <Input
                value={formData.habit}
                onChange={(e) => setFormData({ ...formData, habit: e.target.value })}
                placeholder="e.g. Read Bible for 15 minutes each day"
                data-testid="input-goal-habit"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                First step (do this within 48 hours)
              </label>
              <Input
                value={formData.firstStep}
                onChange={(e) => setFormData({ ...formData, firstStep: e.target.value })}
                placeholder="e.g. Get a reading plan and set a reminder"
                data-testid="input-goal-first-step"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={createGoalMutation.isPending}
                data-testid="button-create-goal"
              >
                {createGoalMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Create Goal</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <MobileNav />
    </div>
  );
}

export default Goals;
