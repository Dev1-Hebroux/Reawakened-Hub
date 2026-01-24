import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2, Circle, ArrowLeft, Calendar, Target, Rocket,
  PartyPopper, Flame, Star, Trophy, ChevronRight
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

export function WdepExperiment() {
  const { sessionId, wdepId } = useParams<{ sessionId: string; wdepId: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [reflection, setReflection] = useState("");

  const { data: wdepData, isLoading } = useQuery({
    queryKey: [`/api/wdep/${wdepId}`],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/wdep/${wdepId}`), { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const createExperiment = useMutation({
    mutationFn: async () => {
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const res = await fetch(getApiUrl(`/api/wdep/${wdepId}/experiment`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          dailyAction: wdepData?.data?.plan?.startNowAction || "",
          daysTarget: 7,
          startDate,
          endDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to create experiment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wdep/${wdepId}`] });
    },
  });

  const logDay = useMutation({
    mutationFn: async ({ date, completed, note }: { date: string; completed: boolean; note?: string }) => {
      const res = await fetch(getApiUrl(`/api/wdep/experiments/${wdepData?.data?.experiment?.id}/log`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date, completed, note }),
      });
      if (!res.ok) throw new Error("Failed to log day");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wdep/${wdepId}`] });
    },
  });

  const saveReflection = useMutation({
    mutationFn: async () => {
      const res = await fetch(getApiUrl(`/api/wdep/experiments/${wdepData?.data?.experiment?.id}/reflection`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reflectionDay7: reflection }),
      });
      if (!res.ok) throw new Error("Failed to save reflection");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wdep/${wdepId}`] });
    },
  });

  useEffect(() => {
    if (wdepData?.data?.experiment?.reflectionDay7) {
      setReflection(wdepData.data.experiment.reflectionDay7);
    }
  }, [wdepData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-[#E8E4DE] border-t-[#7C9A8E]"
        />
      </div>
    );
  }

  const experiment = wdepData?.data?.experiment;
  const experimentLogs = wdepData?.data?.experimentLogs || [];
  const plan = wdepData?.data?.plan;

  const getDays = () => {
    if (!experiment?.startDate) return [];
    const days = [];
    const start = new Date(experiment.startDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const log = experimentLogs.find((l: any) => l.date === dateStr);
      const today = new Date().toISOString().split('T')[0];
      days.push({
        day: i + 1,
        date: dateStr,
        displayDate: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        completed: log?.completed || false,
        isPast: dateStr < today,
        isToday: dateStr === today,
        isFuture: dateStr > today,
      });
    }
    return days;
  };

  const days = getDays();
  const completedCount = days.filter(d => d.completed).length;
  const isDay7Complete = completedCount >= 7;
  const showReflection = completedCount >= 6;

  if (!experiment) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] font-sans">
        <Navbar />
        <div className="pt-24 pb-16 px-4 max-w-lg mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(`/vision/${sessionId}/tools/wdep`)}
            className="mb-6 text-[#6B7B6E]"
            data-testid="button-back-wdep"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to WDEP
          </Button>

          <Card className="bg-white border-[#E8E4DE] shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#4A7C7C] to-[#3A6C6C] flex items-center justify-center shadow-lg">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-[#2C3E2D]">
                Start Your 7-Day Experiment
              </CardTitle>
              <p className="text-[#6B7B6E] mt-2">
                Test your new approach with a focused 7-day challenge. Small, consistent action creates lasting change.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#E8E4DE]">
                <p className="text-sm text-[#6B7B6E] mb-2">Your daily action:</p>
                <p className="font-semibold text-[#2C3E2D]">
                  {plan?.startNowAction || "Complete the WDEP plan first"}
                </p>
              </div>

              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div key={day} className="flex items-center gap-3 p-3 bg-[#E8E4DE]/50 rounded-xl">
                    <Circle className="w-5 h-5 text-[#6B7B6E]" />
                    <span className="text-[#6B7B6E]">Day {day}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => createExperiment.mutate()}
                disabled={createExperiment.isPending || !plan?.startNowAction}
                className="w-full bg-gradient-to-r from-[#4A7C7C] to-[#3A6C6C] text-white py-6 rounded-xl font-semibold shadow-lg"
                data-testid="button-start-experiment"
              >
                {createExperiment.isPending ? "Starting..." : "Begin 7-Day Challenge"}
                <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-lg mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(`/vision/${sessionId}/tools/wdep`)}
          className="mb-6 text-[#6B7B6E]"
          data-testid="button-back-wdep-tracker"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to WDEP
        </Button>

        <Card className="bg-white border-[#E8E4DE] shadow-lg mb-6">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#4A7C7C] to-[#3A6C6C] flex items-center justify-center shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-[#2C3E2D]">
              7-Day Experiment
            </CardTitle>
            <p className="text-[#6B7B6E] text-sm mt-2">
              {experiment.dailyAction}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-2 bg-[#7C9A8E]/10 px-4 py-2 rounded-full">
                <Flame className="w-4 h-4 text-[#D4A574]" />
                <span className="font-bold text-[#7C9A8E]">{completedCount}/7</span>
                <span className="text-sm text-[#6B7B6E]">days complete</span>
              </div>
            </div>

            <div className="space-y-2">
              {days.map((day) => (
                <motion.button
                  key={day.day}
                  whileHover={{ scale: day.isFuture ? 1 : 1.02 }}
                  whileTap={{ scale: day.isFuture ? 1 : 0.98 }}
                  onClick={() => {
                    if (!day.isFuture && !day.completed) {
                      logDay.mutate({ date: day.date, completed: true });
                    }
                  }}
                  disabled={day.isFuture || logDay.isPending}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${day.completed
                    ? "bg-[#7C9A8E]/10 border-[#7C9A8E]"
                    : day.isToday
                      ? "bg-[#D4A574]/10 border-[#D4A574] hover:bg-[#D4A574]/20"
                      : day.isFuture
                        ? "bg-[#E8E4DE]/30 border-[#E8E4DE] opacity-50 cursor-not-allowed"
                        : "bg-white border-[#E8E4DE] hover:border-[#7C9A8E] hover:bg-[#7C9A8E]/5"
                    }`}
                  data-testid={`day-${day.day}-button`}
                >
                  <div className="flex items-center gap-3">
                    {day.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-[#7C9A8E]" />
                    ) : day.isToday ? (
                      <Star className="w-6 h-6 text-[#D4A574]" />
                    ) : (
                      <Circle className="w-6 h-6 text-[#6B7B6E]" />
                    )}
                    <div className="text-left">
                      <div className={`font-semibold ${day.completed ? "text-[#7C9A8E]" : day.isToday ? "text-[#D4A574]" : "text-[#2C3E2D]"}`}>
                        Day {day.day}
                      </div>
                      <div className="text-xs text-[#6B7B6E]">{day.displayDate}</div>
                    </div>
                  </div>
                  {day.isToday && !day.completed && (
                    <span className="text-xs bg-[#D4A574] text-white px-2 py-1 rounded-full font-semibold">
                      Today
                    </span>
                  )}
                  {day.completed && (
                    <span className="text-xs text-[#7C9A8E] font-semibold">Done!</span>
                  )}
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {showReflection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white border-[#E8E4DE] shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#C49464] flex items-center justify-center shadow-md">
                  {isDay7Complete ? (
                    <Trophy className="w-6 h-6 text-white" />
                  ) : (
                    <PartyPopper className="w-6 h-6 text-white" />
                  )}
                </div>
                <CardTitle className="text-lg font-bold text-[#2C3E2D]">
                  {isDay7Complete ? "Congratulations!" : "Almost There!"}
                </CardTitle>
                <p className="text-[#6B7B6E] text-sm mt-1">
                  {isDay7Complete
                    ? "You completed the 7-day experiment! Reflect on what you learned."
                    : "You're doing great! Complete Day 7 to unlock your reflection."}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C3E2D] mb-2">
                    Day 7 Reflection
                  </label>
                  <Textarea
                    placeholder="What did you learn? Will you continue this habit? What would you do differently?"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    rows={4}
                    className="resize-none"
                    data-testid="input-reflection"
                  />
                </div>
                <Button
                  onClick={() => saveReflection.mutate()}
                  disabled={saveReflection.isPending || !reflection.trim()}
                  className="w-full bg-[#D4A574] hover:bg-[#C49464] text-white py-3 rounded-xl"
                  data-testid="button-save-reflection"
                >
                  {saveReflection.isPending ? "Saving..." : "Save Reflection"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => navigate(`/vision/${sessionId}`)}
            className="border-[#E8E4DE] text-[#6B7B6E]"
            data-testid="button-back-vision"
          >
            Back to Vision Dashboard
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
