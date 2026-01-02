import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Flame, Check, Trash2, Zap, TrendingUp, Calendar, Lightbulb, ArrowRight as ArrowRightIcon } from "lucide-react";
import { AICoachPanel, IntroGuide } from "@/components/AICoachPanel";
import { ToolLink } from "@/components/ToolLink";

const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split("T")[0]);
  }
  return days;
};

const getDayLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (dateStr === today.toISOString().split("T")[0]) return "Today";
  if (dateStr === yesterday.toISOString().split("T")[0]) return "Yest";
  return date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3);
};

const getDayNumber = (dateStr: string) => {
  return new Date(dateStr).getDate();
};

export function VisionHabits() {
  const { sessionId } = useParams();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [habitForm, setHabitForm] = useState({ title: "", frequency: "daily", targetPerWeek: 7 });

  const last7Days = getLast7Days();

  const { data: habits, isLoading } = useQuery({
    queryKey: [`/api/vision/sessions/${sessionId}/habits`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/sessions/${sessionId}/habits`, { credentials: "include" });
      if (!res.ok) return [];
      return (await res.json()).data || [];
    },
  });

  const createHabit = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/vision/habits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sessionId: parseInt(sessionId!),
          ...habitForm,
        }),
      });
      if (!res.ok) throw new Error("Failed to create habit");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vision/sessions/${sessionId}/habits`] });
      setIsDialogOpen(false);
      setHabitForm({ title: "", frequency: "daily", targetPerWeek: 7 });
    },
  });

  const deleteHabit = useMutation({
    mutationFn: async (habitId: number) => {
      const res = await fetch(`/api/vision/habits/${habitId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete habit");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vision/sessions/${sessionId}/habits`] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-[#E8E4DE] border-t-[#D4A574]"
        />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF8F5] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/vision`)} 
            className="mb-4 text-[#5A5A5A] hover:bg-[#E8E4DE]" 
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-[#D4A574] text-white px-4 py-2 rounded-full mb-3">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-medium">Stage 4: Practice</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-[#2C3E2D]">
              Habit Tracker
            </h1>
            <p className="text-[#6B7B6E] mt-2">Build daily habits that support your goals</p>
          </motion.div>

          <IntroGuide
            title="Habit Tracker"
            description="Lasting change comes from small, consistent actions. This tracker helps you build and maintain daily habits that compound over time, turning your goals into sustainable lifestyle changes."
            benefits={[
              "Build consistency with visual streak tracking",
              "See your progress at a glance with the weekly view",
              "Stay motivated with completion percentages",
              "Identify patterns in your habit performance"
            ]}
            howToUse={[
              "Create habits that support your SMART goals",
              "Check off each habit daily as you complete them",
              "Watch your streaks grow with consistent effort",
              "Review your patterns with Awake AI insights"
            ]}
          />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <AICoachPanel
              sessionId={sessionId!}
              tool="habits"
              data={{ habits: habits || [] }}
              title="Habit Insights"
              description="Analyze your habit patterns and get tips"
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    className="bg-[#D4A574] hover:bg-[#C49464] text-white rounded-xl"
                    data-testid="button-add-habit"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Habit
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="bg-[#FAF8F5] border-[#E8E4DE]">
                <DialogHeader>
                  <DialogTitle className="text-xl text-[#2C3E2D]">
                    Create New Habit
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-5 mt-4">
                  <div>
                    <Label htmlFor="habitTitle" className="text-[#2C3E2D] font-medium">Habit Name</Label>
                    <Input
                      id="habitTitle"
                      value={habitForm.title}
                      onChange={(e) => setHabitForm({ ...habitForm, title: e.target.value })}
                      placeholder="e.g., Morning meditation"
                      className="mt-2 border-[#E8E4DE] focus:border-[#D4A574] bg-white"
                      data-testid="input-habit-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency" className="text-[#2C3E2D] font-medium">Frequency</Label>
                    <Select
                      value={habitForm.frequency}
                      onValueChange={(value) => setHabitForm({ ...habitForm, frequency: value })}
                    >
                      <SelectTrigger className="mt-2 border-[#E8E4DE] bg-white" data-testid="select-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {habitForm.frequency === "weekly" && (
                    <div>
                      <Label htmlFor="targetPerWeek" className="text-[#2C3E2D] font-medium">Times per week</Label>
                      <Input
                        id="targetPerWeek"
                        type="number"
                        min={1}
                        max={7}
                        value={habitForm.targetPerWeek}
                        onChange={(e) => setHabitForm({ ...habitForm, targetPerWeek: parseInt(e.target.value) })}
                        className="mt-2 border-[#E8E4DE] bg-white"
                        data-testid="input-target-per-week"
                      />
                    </div>
                  )}
                  <Button
                    onClick={() => createHabit.mutate()}
                    disabled={!habitForm.title || createHabit.isPending}
                    className="w-full bg-[#D4A574] hover:bg-[#C49464] text-white rounded-xl"
                    data-testid="button-save-habit"
                  >
                    {createHabit.isPending ? "Creating..." : "Create Habit"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {habits?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="text-center py-16 border border-[#E8E4DE] bg-white rounded-2xl">
                <CardContent>
                  <div className="w-20 h-20 rounded-2xl bg-[#D4A574]/10 mx-auto mb-6 flex items-center justify-center">
                    <Flame className="w-10 h-10 text-[#D4A574]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2C3E2D] mb-2">No habits yet</h3>
                  <p className="text-[#6B7B6E] mb-6 max-w-sm mx-auto">
                    Add habits to track your daily progress and build momentum
                  </p>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => setIsDialogOpen(true)}
                      className="bg-[#D4A574] hover:bg-[#C49464] text-white rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Create Your First Habit
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <AnimatePresence>
            <div className="space-y-4">
              {habits?.map((habit: any, i: number) => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  last7Days={last7Days} 
                  sessionId={sessionId!}
                  onDelete={() => deleteHabit.mutate(habit.id)}
                  index={i}
                />
              ))}
            </div>
          </AnimatePresence>

          {habits?.length > 0 && (
            <StreakBreakMotivation habits={habits} sessionId={sessionId!} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function HabitCard({ 
  habit, 
  last7Days, 
  sessionId, 
  onDelete,
  index 
}: { 
  habit: any; 
  last7Days: string[]; 
  sessionId: string;
  onDelete: () => void;
  index: number;
}) {
  const queryClient = useQueryClient();

  const { data: logs } = useQuery({
    queryKey: [`/api/vision/habits/${habit.id}/logs`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/habits/${habit.id}/logs`, { credentials: "include" });
      if (!res.ok) return [];
      return (await res.json()).data || [];
    },
  });

  const toggleLog = useMutation({
    mutationFn: async ({ date, completed }: { date: string; completed: boolean }) => {
      const res = await fetch(`/api/vision/habits/${habit.id}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date, completed }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vision/habits/${habit.id}/logs`] });
    },
  });

  const logMap = new Map((logs || []).map((l: any) => [l.date, l.completed]));
  const completedCount = last7Days.filter((d) => logMap.get(d)).length;
  const streak = calculateStreak(logs || [], last7Days);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border border-[#E8E4DE] bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 bg-[#FDFCFA] border-b border-[#E8E4DE]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4A574] flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#2C3E2D]">{habit.title}</h3>
                <p className="text-xs text-[#6B7B6E] capitalize">{habit.frequency}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {streak > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5 bg-[#D4A574] text-white px-3 py-1.5 rounded-full text-sm"
                >
                  <Zap className="w-3 h-3" />
                  <span className="font-bold">{streak} day streak</span>
                </motion.div>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onDelete}
                className="text-[#8B9B8E] hover:text-[#C17767] hover:bg-[#C17767]/10 rounded-lg"
                data-testid={`button-delete-habit-${habit.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {last7Days.map((date) => {
                const isCompleted = logMap.get(date);
                const isToday = date === new Date().toISOString().split("T")[0];
                return (
                  <motion.button
                    key={date}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleLog.mutate({ date, completed: !isCompleted })}
                    className="flex flex-col items-center gap-1"
                    data-testid={`habit-${habit.id}-day-${date}`}
                  >
                    <span className={`text-xs font-medium ${isToday ? "text-[#D4A574]" : "text-[#8B9B8E]"}`}>
                      {getDayLabel(date)}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-all ${
                        isCompleted
                          ? "bg-[#5B8C5A] text-white"
                          : isToday
                            ? "bg-[#D4A574]/10 text-[#D4A574] border-2 border-[#D4A574]"
                            : "bg-[#F5F3EF] text-[#8B9B8E] border border-[#E8E4DE]"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm">{getDayNumber(date)}</span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E8E4DE]">
              <div className="flex items-center gap-2 text-sm text-[#6B7B6E]">
                <TrendingUp className="w-4 h-4" />
                <span>{completedCount}/7 this week</span>
              </div>
              <div className="w-32 h-2 bg-[#E8E4DE] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / 7) * 100}%` }}
                  className="h-full bg-[#5B8C5A] rounded-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function calculateStreak(logs: any[], last7Days: string[]): number {
  let streak = 0;
  const logMap = new Map(logs.map((l: any) => [l.date, l.completed]));
  
  for (let i = last7Days.length - 1; i >= 0; i--) {
    if (logMap.get(last7Days[i])) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function StreakBreakMotivation({ habits, sessionId }: { habits: any[]; sessionId: string }) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0];

  const dailyHabits = habits.filter((h: any) => h.frequency === "daily");

  const { data: allLogs } = useQuery({
    queryKey: ["/api/vision/habits/logs/recent", dailyHabits.map((h: any) => h.id).join(",")],
    queryFn: async () => {
      const logsPromises = dailyHabits.map(async (habit: any) => {
        const res = await fetch(`/api/vision/habits/${habit.id}/logs`, { credentials: "include" });
        if (!res.ok) return { habitId: habit.id, logs: [] };
        const data = await res.json();
        return { habitId: habit.id, logs: data.data || [] };
      });
      return Promise.all(logsPromises);
    },
    enabled: dailyHabits.length > 0,
  });

  const hasStreakBreak = allLogs?.some((habitData: any) => {
    const completedLogs = habitData.logs.filter((l: any) => l.completed);
    if (completedLogs.length === 0) return false;
    
    const twoDaysAgoLog = habitData.logs.find((l: any) => l.date === twoDaysAgoStr);
    const yesterdayLog = habitData.logs.find((l: any) => l.date === yesterdayStr);
    
    return twoDaysAgoLog?.completed && !yesterdayLog?.completed;
  });

  if (!hasStreakBreak) return null;

  return (
    <div className="mt-6">
      <ToolLink tool="sca" context="streak-break" />
    </div>
  );
}

export default VisionHabits;
