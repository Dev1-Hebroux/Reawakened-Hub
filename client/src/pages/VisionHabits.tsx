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
import { ArrowLeft, Plus, Flame, Check, X, Trash2, Zap, Award, TrendingUp } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-600"
        />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/vision`)} 
            className="mb-4 hover:bg-orange-100" 
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-semibold">Stage 4: Practice</span>
              </div>
              <h1 className="text-4xl font-display font-bold">
                <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Habit Tracker
                </span>
              </h1>
              <p className="text-slate-600 mt-2">Build daily habits that support your goals</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg rounded-xl"
                    data-testid="button-add-habit"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Habit
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="rounded-2xl border-0 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Create New Habit
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-5 mt-4">
                  <div>
                    <Label htmlFor="habitTitle" className="text-slate-600 font-medium">Habit Name</Label>
                    <Input
                      id="habitTitle"
                      value={habitForm.title}
                      onChange={(e) => setHabitForm({ ...habitForm, title: e.target.value })}
                      placeholder="e.g., Morning meditation"
                      className="mt-2 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                      data-testid="input-habit-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency" className="text-slate-600 font-medium">Frequency</Label>
                    <Select
                      value={habitForm.frequency}
                      onValueChange={(value) => setHabitForm({ ...habitForm, frequency: value })}
                    >
                      <SelectTrigger className="mt-2 rounded-xl border-slate-200" data-testid="select-frequency">
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
                      <Label htmlFor="targetPerWeek" className="text-slate-600 font-medium">Times per week</Label>
                      <Input
                        id="targetPerWeek"
                        type="number"
                        min={1}
                        max={7}
                        value={habitForm.targetPerWeek}
                        onChange={(e) => setHabitForm({ ...habitForm, targetPerWeek: parseInt(e.target.value) })}
                        className="mt-2 rounded-xl border-slate-200"
                        data-testid="input-target-per-week"
                      />
                    </div>
                  )}
                  <Button
                    onClick={() => createHabit.mutate()}
                    disabled={!habitForm.title || createHabit.isPending}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg"
                    data-testid="button-save-habit"
                  >
                    {createHabit.isPending ? "Creating..." : "Create Habit"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {habits?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="text-center py-16 border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
                <CardContent>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 mx-auto mb-6 flex items-center justify-center">
                    <Flame className="w-10 h-10 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No habits yet</h3>
                  <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                    Add habits to track your daily progress and build momentum
                  </p>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => setIsDialogOpen(true)}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Create Your First Habit
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <AnimatePresence>
            <div className="grid gap-4">
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
      const res = await fetch(`/api/vision/habits/${habit.id}/logs`, {
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
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow">
        <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-500" />
        <CardContent className="pt-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{habit.title}</h3>
                <p className="text-sm text-slate-500 capitalize">{habit.frequency}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {streak > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full shadow-md"
                >
                  <Zap className="w-4 h-4" />
                  <span className="font-bold text-sm">{streak} day streak</span>
                </motion.div>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onDelete}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                data-testid={`button-delete-habit-${habit.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4">
            {last7Days.map((date) => {
              const isCompleted = logMap.get(date);
              const isToday = date === new Date().toISOString().split("T")[0];
              return (
                <motion.button
                  key={date}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleLog.mutate({ date, completed: !isCompleted })}
                  className={`flex flex-col items-center gap-1.5 transition-all ${isToday ? "scale-110" : ""}`}
                  data-testid={`habit-${habit.id}-day-${date}`}
                >
                  <span className={`text-xs font-medium ${isToday ? "text-orange-600" : "text-slate-400"}`}>
                    {getDayLabel(date)}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                      isCompleted
                        ? "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-md"
                        : isToday
                          ? "bg-gradient-to-br from-orange-100 to-amber-100 text-orange-400 ring-2 ring-orange-300"
                          : "bg-white text-slate-300 border border-slate-200"
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <X className="w-4 h-4" />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <TrendingUp className="w-4 h-4" />
              <span>{completedCount}/7 this week</span>
            </div>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / 7) * 100}%` }}
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
              />
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

export default VisionHabits;
