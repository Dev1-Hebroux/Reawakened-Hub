import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Sun, Calendar, Sparkles, Check } from "lucide-react";

const getToday = () => new Date().toISOString().split("T")[0];
const getWeekStart = () => {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff)).toISOString().split("T")[0];
};

export function VisionCheckin() {
  const { sessionId } = useParams();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("daily");

  const { data: session } = useQuery({
    queryKey: [`/api/vision/sessions/${sessionId}`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/sessions/current`, { credentials: "include" });
      if (!res.ok) return null;
      return (await res.json()).data;
    },
  });

  const isFaithMode = session?.mode === "faith";

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
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-[#C17767] text-white px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Stage 5: Review</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3 text-[#2C3E2D]">
              Check-ins
            </h1>
            <p className="text-[#6B7B6E] max-w-lg mx-auto">
              Stay on track with daily focus and weekly reviews
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-[#E8E4DE]">
              <TabsTrigger 
                value="daily" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-[#D4A574] data-[state=active]:text-white data-[state=active]:shadow-sm" 
                data-testid="tab-daily"
              >
                <Sun className="w-4 h-4" /> Daily Check-in
              </TabsTrigger>
              <TabsTrigger 
                value="weekly" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-[#C17767] data-[state=active]:text-white data-[state=active]:shadow-sm" 
                data-testid="tab-weekly"
              >
                <Calendar className="w-4 h-4" /> Weekly Review
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily">
              <DailyCheckin sessionId={sessionId!} isFaithMode={isFaithMode} />
            </TabsContent>

            <TabsContent value="weekly">
              <WeeklyReview sessionId={sessionId!} isFaithMode={isFaithMode} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
}

function DailyCheckin({ sessionId, isFaithMode }: { sessionId: string; isFaithMode: boolean }) {
  const queryClient = useQueryClient();
  const today = getToday();
  const [energy, setEnergy] = useState(3);
  const [todayFocus, setTodayFocus] = useState("");
  const [note, setNote] = useState("");
  const [prayerNote, setPrayerNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { data: checkinData } = useQuery({
    queryKey: [`/api/vision/sessions/${sessionId}/checkin/daily/${today}`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/sessions/${sessionId}/checkin/daily/${today}`, {
        credentials: "include",
      });
      if (!res.ok) return null;
      return (await res.json()).data;
    },
  });

  useEffect(() => {
    if (checkinData && !loaded) {
      setEnergy(checkinData.energy || 3);
      setTodayFocus(checkinData.todayFocus || "");
      setNote(checkinData.note || "");
      setPrayerNote(checkinData.prayerNote || "");
      setLoaded(true);
    }
  }, [checkinData, loaded]);

  const saveCheckin = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/vision/sessions/${sessionId}/checkin/daily`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date: today, energy, todayFocus, note, prayerNote }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vision/sessions/${sessionId}/checkin/daily/${today}`] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const energyLabels = ["Low", "Below Average", "Okay", "Good", "Great"];
  const energyEmojis = ["😴", "😐", "🙂", "😊", "🔥"];
  const energyColors = ["#C17767", "#D4A574", "#B8976E", "#7C9A8E", "#5B8C5A"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="border border-[#E8E4DE] bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#D4A574]/10 border-b border-[#E8E4DE]">
          <CardTitle className="flex items-center gap-2 text-[#2C3E2D]">
            <Sun className="w-5 h-5 text-[#D4A574]" />
            Today's Check-in
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="bg-[#FDFCFA] p-5 rounded-xl border border-[#E8E4DE]">
            <Label className="mb-4 block text-[#2C3E2D] font-medium">How's your energy today?</Label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#8B9B8E] font-medium">1</span>
              <Slider
                value={[energy]}
                onValueChange={([val]) => setEnergy(val)}
                min={1}
                max={5}
                step={1}
                className="flex-1"
                data-testid="slider-energy"
              />
              <span className="text-sm text-[#8B9B8E] font-medium">5</span>
            </div>
            <div className="text-center mt-4 flex items-center justify-center gap-2">
              <span className="text-2xl">{energyEmojis[energy - 1]}</span>
              <span 
                className="font-bold text-lg"
                style={{ color: energyColors[energy - 1] }}
              >
                {energyLabels[energy - 1]}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="todayFocus" className="text-[#2C3E2D] font-medium">What's your #1 focus today?</Label>
            <Textarea
              id="todayFocus"
              value={todayFocus}
              onChange={(e) => setTodayFocus(e.target.value)}
              placeholder="The one thing I must accomplish today..."
              rows={2}
              className="mt-2 border-[#E8E4DE] focus:border-[#D4A574] bg-[#FDFCFA]"
              data-testid="input-today-focus"
            />
          </div>

          <div>
            <Label htmlFor="note" className="text-[#2C3E2D] font-medium">Any notes or thoughts?</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How you're feeling, obstacles you're facing..."
              rows={3}
              className="mt-2 border-[#E8E4DE] focus:border-[#D4A574] bg-[#FDFCFA]"
              data-testid="input-daily-note"
            />
          </div>

          {isFaithMode && (
            <div className="bg-[#9B8AA6]/10 p-5 rounded-xl border border-[#9B8AA6]/20">
              <Label htmlFor="prayerNote" className="flex items-center gap-2 text-[#9B8AA6] font-medium">
                <Sparkles className="w-4 h-4" />
                Prayer Focus
              </Label>
              <Textarea
                id="prayerNote"
                value={prayerNote}
                onChange={(e) => setPrayerNote(e.target.value)}
                placeholder="What I'm praying about today..."
                rows={2}
                className="mt-2 border-[#9B8AA6]/30 focus:border-[#9B8AA6] bg-white"
                data-testid="input-prayer-note"
              />
            </div>
          )}

          <Button
            onClick={() => saveCheckin.mutate()}
            disabled={saveCheckin.isPending}
            className={`w-full rounded-xl py-6 ${
              saved 
                ? "bg-[#5B8C5A] hover:bg-[#5B8C5A]" 
                : "bg-[#D4A574] hover:bg-[#C49464]"
            } text-white`}
            data-testid="button-save-daily"
          >
            {saveCheckin.isPending ? "Saving..." : saved ? (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" /> Saved!
              </span>
            ) : "Save Check-in"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WeeklyReview({ sessionId, isFaithMode }: { sessionId: string; isFaithMode: boolean }) {
  const queryClient = useQueryClient();
  const weekStart = getWeekStart();
  const [win, setWin] = useState("");
  const [lesson, setLesson] = useState("");
  const [obstacle, setObstacle] = useState("");
  const [adjustment, setAdjustment] = useState("");
  const [nextWeekTop3, setNextWeekTop3] = useState(["", "", ""]);
  const [gratitude, setGratitude] = useState("");
  const [prayerFocus, setPrayerFocus] = useState("");
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { data: reviewData } = useQuery({
    queryKey: [`/api/vision/sessions/${sessionId}/checkin/weekly/${weekStart}`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/sessions/${sessionId}/checkin/weekly/${weekStart}`, {
        credentials: "include",
      });
      if (!res.ok) return null;
      return (await res.json()).data;
    },
  });

  useEffect(() => {
    if (reviewData && !loaded) {
      setWin(reviewData.win || "");
      setLesson(reviewData.lesson || "");
      setObstacle(reviewData.obstacle || "");
      setAdjustment(reviewData.adjustment || "");
      setNextWeekTop3((reviewData.nextWeekTop3 as string[]) || ["", "", ""]);
      setGratitude(reviewData.gratitude || "");
      setPrayerFocus(reviewData.prayerFocus || "");
      setLoaded(true);
    }
  }, [reviewData, loaded]);

  const saveReview = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/vision/sessions/${sessionId}/checkin/weekly`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          weekStartDate: weekStart,
          win,
          lesson,
          obstacle,
          adjustment,
          nextWeekTop3,
          gratitude,
          prayerFocus,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vision/sessions/${sessionId}/checkin/weekly/${weekStart}`] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const updateTop3 = (index: number, value: string) => {
    const newTop3 = [...nextWeekTop3];
    newTop3[index] = value;
    setNextWeekTop3(newTop3);
  };

  const reviewQuestions = [
    { key: "win", label: "What was your biggest win this week?", placeholder: "Something you accomplished or progress you made...", color: "#5B8C5A" },
    { key: "lesson", label: "What did you learn?", placeholder: "Insights, realizations, or skills gained...", color: "#4A7C7C" },
    { key: "obstacle", label: "What obstacles did you face?", placeholder: "Challenges or blockers you encountered...", color: "#C17767" },
    { key: "adjustment", label: "What will you adjust next week?", placeholder: "Changes to your approach or focus...", color: "#D4A574" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="border border-[#E8E4DE] bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#C17767]/10 border-b border-[#E8E4DE]">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[#2C3E2D]">
              <Calendar className="w-5 h-5 text-[#C17767]" />
              Weekly Review
            </CardTitle>
            <span className="text-sm text-[#6B7B6E] bg-white px-3 py-1 rounded-full border border-[#E8E4DE]">
              Week of {new Date(weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {reviewQuestions.map((q) => (
            <div key={q.key}>
              <Label htmlFor={q.key} className="text-[#2C3E2D] font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: q.color }} />
                {q.label}
              </Label>
              <Textarea
                id={q.key}
                value={
                  q.key === "win" ? win :
                  q.key === "lesson" ? lesson :
                  q.key === "obstacle" ? obstacle : adjustment
                }
                onChange={(e) => {
                  if (q.key === "win") setWin(e.target.value);
                  else if (q.key === "lesson") setLesson(e.target.value);
                  else if (q.key === "obstacle") setObstacle(e.target.value);
                  else setAdjustment(e.target.value);
                }}
                placeholder={q.placeholder}
                rows={2}
                className="mt-2 border-[#E8E4DE] focus:border-[#C17767] bg-[#FDFCFA]"
                data-testid={`input-weekly-${q.key}`}
              />
            </div>
          ))}

          <div className="bg-[#FDFCFA] p-5 rounded-xl border border-[#E8E4DE]">
            <Label className="mb-3 block text-[#2C3E2D] font-medium">Top 3 priorities for next week</Label>
            <div className="space-y-2">
              {nextWeekTop3.map((priority, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#7C9A8E] flex items-center justify-center text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <input
                    value={priority}
                    onChange={(e) => updateTop3(i, e.target.value)}
                    placeholder={`Priority ${i + 1}...`}
                    className="flex-1 px-4 py-2.5 border border-[#E8E4DE] rounded-xl text-sm bg-white focus:border-[#7C9A8E] focus:outline-none focus:ring-2 focus:ring-[#7C9A8E]/20"
                    data-testid={`input-priority-${i}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {isFaithMode && (
            <>
              <div className="bg-[#9B8AA6]/10 p-5 rounded-xl border border-[#9B8AA6]/20">
                <Label htmlFor="gratitude" className="flex items-center gap-2 text-[#9B8AA6] font-medium">
                  <Sparkles className="w-4 h-4" />
                  Gratitude
                </Label>
                <Textarea
                  id="gratitude"
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="What are you thankful for this week?"
                  rows={2}
                  className="mt-2 border-[#9B8AA6]/30 focus:border-[#9B8AA6] bg-white"
                  data-testid="input-gratitude"
                />
              </div>

              <div className="bg-[#9B8AA6]/10 p-5 rounded-xl border border-[#9B8AA6]/20">
                <Label htmlFor="prayerFocus" className="flex items-center gap-2 text-[#9B8AA6] font-medium">
                  <Sparkles className="w-4 h-4" />
                  Prayer Focus for Next Week
                </Label>
                <Textarea
                  id="prayerFocus"
                  value={prayerFocus}
                  onChange={(e) => setPrayerFocus(e.target.value)}
                  placeholder="What will you be praying about?"
                  rows={2}
                  className="mt-2 border-[#9B8AA6]/30 focus:border-[#9B8AA6] bg-white"
                  data-testid="input-prayer-focus"
                />
              </div>
            </>
          )}

          <Button
            onClick={() => saveReview.mutate()}
            disabled={saveReview.isPending}
            className={`w-full rounded-xl py-6 ${
              saved 
                ? "bg-[#5B8C5A] hover:bg-[#5B8C5A]" 
                : "bg-[#C17767] hover:bg-[#B06657]"
            } text-white`}
            data-testid="button-save-weekly"
          >
            {saveReview.isPending ? "Saving..." : saved ? (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" /> Saved!
              </span>
            ) : "Save Review"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default VisionCheckin;
