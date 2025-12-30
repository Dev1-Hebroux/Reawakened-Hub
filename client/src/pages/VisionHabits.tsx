import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Plus, Flame, Check, X, Trash2 } from "lucide-react";

const today = new Date().toISOString().split("T")[0];
const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split("T")[0]);
  }
  return days;
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-[hsl(var(--color-paper))] to-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(`/vision`)} className="mb-4" data-testid="button-back-dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-primary mb-2">Habit Tracker</h1>
              <p className="text-muted-foreground">Build daily habits that support your goals</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-habit">
                  <Plus className="w-4 h-4 mr-2" /> Add Habit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Habit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="habitTitle">Habit Name</Label>
                    <Input
                      id="habitTitle"
                      value={habitForm.title}
                      onChange={(e) => setHabitForm({ ...habitForm, title: e.target.value })}
                      placeholder="e.g., Morning meditation"
                      data-testid="input-habit-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={habitForm.frequency}
                      onValueChange={(value) => setHabitForm({ ...habitForm, frequency: value })}
                    >
                      <SelectTrigger data-testid="select-frequency">
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
                      <Label htmlFor="targetPerWeek">Times per week</Label>
                      <Input
                        id="targetPerWeek"
                        type="number"
                        min={1}
                        max={7}
                        value={habitForm.targetPerWeek}
                        onChange={(e) => setHabitForm({ ...habitForm, targetPerWeek: parseInt(e.target.value) })}
                        data-testid="input-target-per-week"
                      />
                    </div>
                  )}
                  <Button
                    onClick={() => createHabit.mutate()}
                    disabled={!habitForm.title || createHabit.isPending}
                    className="w-full"
                    data-testid="button-save-habit"
                  >
                    {createHabit.isPending ? "Creating..." : "Create Habit"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {habits?.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Flame className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No habits yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add habits to track your daily progress
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Create Your First Habit
                </Button>
              </CardContent>
            </Card>
          )}

          {habits?.length > 0 && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2 text-sm font-medium text-muted-foreground">Habit</th>
                      {last7Days.map((day) => (
                        <th key={day} className="p-2 text-center text-xs text-muted-foreground">
                          {new Date(day).toLocaleDateString("en-US", { weekday: "short" })}
                          <br />
                          <span className="font-normal">{new Date(day).getDate()}</span>
                        </th>
                      ))}
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {habits.map((habit: any) => (
                      <HabitRow
                        key={habit.id}
                        habit={habit}
                        days={last7Days}
                        onDelete={() => deleteHabit.mutate(habit.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => navigate(`/vision/${sessionId}/plan`)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> 90-Day Plan
            </Button>
            <Button onClick={() => navigate(`/vision/${sessionId}/checkin`)} data-testid="button-to-checkin">
              Check-ins <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function HabitRow({ habit, days, onDelete }: { habit: any; days: string[]; onDelete: () => void }) {
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
      if (!res.ok) throw new Error("Failed to log");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vision/habits/${habit.id}/logs`] });
    },
  });

  const getLogForDate = (date: string) => {
    return logs?.find((log: any) => log.date === date);
  };

  const completedCount = days.filter((day) => getLogForDate(day)?.completed).length;
  const streak = calculateStreak(logs, days);

  return (
    <tr className="border-t" data-testid={`habit-row-${habit.id}`}>
      <td className="p-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <Flame className="w-4 h-4 text-accent" />
          </div>
          <div>
            <span className="font-medium">{habit.title}</span>
            {streak >= 3 && (
              <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                {streak} day streak
              </span>
            )}
          </div>
        </div>
      </td>
      {days.map((day) => {
        const log = getLogForDate(day);
        const isCompleted = log?.completed;
        return (
          <td key={day} className="p-2 text-center">
            <button
              onClick={() => toggleLog.mutate({ date: day, completed: !isCompleted })}
              className={`w-8 h-8 rounded-full border-2 transition-all mx-auto flex items-center justify-center ${
                isCompleted
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-gray-200 hover:border-green-300"
              }`}
              data-testid={`habit-${habit.id}-${day}`}
            >
              {isCompleted && <Check className="w-4 h-4" />}
            </button>
          </td>
        );
      })}
      <td className="p-2">
        <Button variant="ghost" size="sm" onClick={onDelete} data-testid={`delete-habit-${habit.id}`}>
          <Trash2 className="w-4 h-4 text-muted-foreground" />
        </Button>
      </td>
    </tr>
  );
}

function calculateStreak(logs: any[], days: string[]): number {
  if (!logs?.length) return 0;
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const log = logs.find((l: any) => l.date === days[i]);
    if (log?.completed) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default VisionHabits;
