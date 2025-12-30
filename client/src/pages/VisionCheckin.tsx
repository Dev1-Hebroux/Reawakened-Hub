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
import { ArrowLeft, Sun, Calendar, Sparkles, Plus, X } from "lucide-react";

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
  const queryClient = useQueryClient();
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
      <main className="min-h-screen bg-gradient-to-b from-[hsl(var(--color-paper))] to-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(`/vision`)} className="mb-4" data-testid="button-back-dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-primary mb-2">Check-ins</h1>
            <p className="text-muted-foreground">
              Stay on track with daily focus and weekly reviews
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="daily" className="flex items-center gap-2" data-testid="tab-daily">
                <Sun className="w-4 h-4" /> Daily Check-in
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-2" data-testid="tab-weekly">
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-accent" />
            Today's Check-in
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-3 block">How's your energy today?</Label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">1</span>
              <Slider
                value={[energy]}
                onValueChange={([val]) => setEnergy(val)}
                min={1}
                max={5}
                step={1}
                className="flex-1"
                data-testid="slider-energy"
              />
              <span className="text-sm text-muted-foreground">5</span>
            </div>
            <p className="text-center mt-2 text-sm font-medium text-accent">
              {energyLabels[energy - 1]}
            </p>
          </div>

          <div>
            <Label htmlFor="todayFocus">What's your #1 focus today?</Label>
            <Textarea
              id="todayFocus"
              value={todayFocus}
              onChange={(e) => setTodayFocus(e.target.value)}
              placeholder="The one thing I must accomplish today..."
              rows={2}
              className="mt-2"
              data-testid="input-today-focus"
            />
          </div>

          <div>
            <Label htmlFor="note">Any notes or thoughts?</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How you're feeling, obstacles you're facing..."
              rows={3}
              className="mt-2"
              data-testid="input-daily-note"
            />
          </div>

          {isFaithMode && (
            <div className="bg-accent/5 p-4 rounded-lg">
              <Label htmlFor="prayerNote" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Prayer Focus
              </Label>
              <Textarea
                id="prayerNote"
                value={prayerNote}
                onChange={(e) => setPrayerNote(e.target.value)}
                placeholder="What I'm praying about today..."
                rows={2}
                className="mt-2"
                data-testid="input-prayer-note"
              />
            </div>
          )}

          <Button
            onClick={() => saveCheckin.mutate()}
            disabled={saveCheckin.isPending}
            className="w-full"
            data-testid="button-save-daily"
          >
            {saveCheckin.isPending ? "Saving..." : saved ? "Saved!" : "Save Check-in"}
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Weekly Review
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Week of {new Date(weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="win">What was your biggest win this week?</Label>
            <Textarea
              id="win"
              value={win}
              onChange={(e) => setWin(e.target.value)}
              placeholder="Something you accomplished or progress you made..."
              rows={2}
              className="mt-2"
              data-testid="input-weekly-win"
            />
          </div>

          <div>
            <Label htmlFor="lesson">What did you learn?</Label>
            <Textarea
              id="lesson"
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="Insights, realizations, or skills gained..."
              rows={2}
              className="mt-2"
              data-testid="input-weekly-lesson"
            />
          </div>

          <div>
            <Label htmlFor="obstacle">What obstacles did you face?</Label>
            <Textarea
              id="obstacle"
              value={obstacle}
              onChange={(e) => setObstacle(e.target.value)}
              placeholder="Challenges or blockers you encountered..."
              rows={2}
              className="mt-2"
              data-testid="input-weekly-obstacle"
            />
          </div>

          <div>
            <Label htmlFor="adjustment">What will you adjust next week?</Label>
            <Textarea
              id="adjustment"
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
              placeholder="Changes to your approach or focus..."
              rows={2}
              className="mt-2"
              data-testid="input-weekly-adjustment"
            />
          </div>

          <div>
            <Label className="mb-3 block">Top 3 priorities for next week</Label>
            <div className="space-y-2">
              {nextWeekTop3.map((priority, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                    {i + 1}
                  </span>
                  <input
                    value={priority}
                    onChange={(e) => updateTop3(i, e.target.value)}
                    placeholder={`Priority ${i + 1}...`}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    data-testid={`input-priority-${i}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {isFaithMode && (
            <>
              <div className="bg-accent/5 p-4 rounded-lg">
                <Label htmlFor="gratitude" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Gratitude
                </Label>
                <Textarea
                  id="gratitude"
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="What are you thankful for this week?"
                  rows={2}
                  className="mt-2"
                  data-testid="input-gratitude"
                />
              </div>

              <div className="bg-accent/5 p-4 rounded-lg">
                <Label htmlFor="prayerFocus" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Prayer Focus for Next Week
                </Label>
                <Textarea
                  id="prayerFocus"
                  value={prayerFocus}
                  onChange={(e) => setPrayerFocus(e.target.value)}
                  placeholder="What will you be praying about?"
                  rows={2}
                  className="mt-2"
                  data-testid="input-prayer-focus"
                />
              </div>
            </>
          )}

          <Button
            onClick={() => saveReview.mutate()}
            disabled={saveReview.isPending}
            className="w-full"
            data-testid="button-save-weekly"
          >
            {saveReview.isPending ? "Saving..." : saved ? "Saved!" : "Save Review"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default VisionCheckin;
