import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Compass, Target, Sparkles, Calendar, CheckCircle2, 
  ArrowRight, Mountain, Heart, Flame, Star, ChevronRight
} from "lucide-react";

const STAGES = [
  { key: "reflect", label: "Reflect", icon: Compass, color: "bg-[hsl(var(--color-lavender))]" },
  { key: "align", label: "Align", icon: Heart, color: "bg-[hsl(var(--color-sage))]" },
  { key: "plan", label: "Plan", icon: Target, color: "bg-[hsl(var(--color-accent))]" },
  { key: "practice", label: "Practice", icon: Flame, color: "bg-[hsl(var(--color-warning))]" },
  { key: "review", label: "Review", icon: Star, color: "bg-[hsl(var(--color-success))]" },
];

export function VisionPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [mode, setMode] = useState<"classic" | "faith">("classic");
  const [seasonType, setSeasonType] = useState<"new_year" | "new_season">("new_year");
  const [seasonLabel, setSeasonLabel] = useState("2025 Reset");
  const [themeWord, setThemeWord] = useState("");

  const { data: session, isLoading } = useQuery({
    queryKey: ["/api/vision/sessions/current"],
    queryFn: async () => {
      const res = await fetch("/api/vision/sessions/current", { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const createSession = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/vision/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ seasonType, seasonLabel, themeWord, mode }),
      });
      if (!res.ok) throw new Error("Failed to create session");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vision/sessions/current"] });
      navigate(`/vision/${data.data.id}/wheel`);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (session) {
    return <VisionDashboard session={session} />;
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow
        step={onboardingStep}
        setStep={setOnboardingStep}
        mode={mode}
        setMode={setMode}
        seasonType={seasonType}
        setSeasonType={setSeasonType}
        seasonLabel={seasonLabel}
        setSeasonLabel={setSeasonLabel}
        themeWord={themeWord}
        setThemeWord={setThemeWord}
        onComplete={() => createSession.mutate()}
        isSubmitting={createSession.isPending}
      />
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-[hsl(var(--color-paper))] to-white">
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                <Mountain className="w-4 h-4" />
                <span className="text-sm font-medium">Life Vision & Goals</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6">
                Design Your Best Season Yet
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                An interactive journey to discover your purpose, set meaningful goals, 
                and build habits that stick. Whether you're starting fresh or realigning, 
                this is your space to dream, plan, and grow.
              </p>
              <Button 
                size="lg" 
                onClick={() => setShowOnboarding(true)}
                className="gap-2"
                data-testid="button-start-vision"
              >
                Start Your Vision Journey <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-center text-primary mb-12">
              The 5-Stage Pathway
            </h2>
            <div className="grid md:grid-cols-5 gap-4">
              {STAGES.map((stage, i) => (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className={`w-16 h-16 rounded-full ${stage.color} mx-auto flex items-center justify-center mb-3`}>
                    <stage.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-primary">{stage.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stage.key === "reflect" && "Assess where you are"}
                    {stage.key === "align" && "Clarify your values"}
                    {stage.key === "plan" && "Set SMART goals"}
                    {stage.key === "practice" && "Build daily habits"}
                    {stage.key === "review" && "Track & adjust"}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-accent" />
                    Classic Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Focus on life design, goal-setting, and personal growth using 
                    proven frameworks like Wheel of Life and Ikigai.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-accent/30 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Faith & Reflection Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Includes prayer prompts, Scripture reflections, and spiritual 
                    dimensions woven throughout the journey.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function OnboardingFlow({
  step,
  setStep,
  mode,
  setMode,
  seasonType,
  setSeasonType,
  seasonLabel,
  setSeasonLabel,
  themeWord,
  setThemeWord,
  onComplete,
  isSubmitting,
}: {
  step: number;
  setStep: (s: number) => void;
  mode: "classic" | "faith";
  setMode: (m: "classic" | "faith") => void;
  seasonType: "new_year" | "new_season";
  setSeasonType: (t: "new_year" | "new_season") => void;
  seasonLabel: string;
  setSeasonLabel: (l: string) => void;
  themeWord: string;
  setThemeWord: (w: string) => void;
  onComplete: () => void;
  isSubmitting: boolean;
}) {
  const steps = [
    {
      title: "Choose Your Mode",
      content: (
        <div className="space-y-6">
          <p className="text-muted-foreground text-center">
            How would you like to approach this journey?
          </p>
          <div className="grid gap-4">
            <button
              onClick={() => setMode("classic")}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                mode === "classic" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
              data-testid="button-mode-classic"
            >
              <div className="flex items-center gap-3 mb-2">
                <Compass className="w-6 h-6 text-primary" />
                <span className="font-semibold text-primary">Classic</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Life design focused on goals, habits, and personal growth
              </p>
            </button>
            <button
              onClick={() => setMode("faith")}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                mode === "faith" ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"
              }`}
              data-testid="button-mode-faith"
            >
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-accent" />
                <span className="font-semibold text-accent">Faith & Reflection</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Includes prayer prompts and Scripture throughout the journey
              </p>
            </button>
          </div>
        </div>
      ),
    },
    {
      title: "What Season Is This?",
      content: (
        <div className="space-y-6">
          <p className="text-muted-foreground text-center">
            Name this season of your life
          </p>
          <div className="grid gap-4">
            <button
              onClick={() => {
                setSeasonType("new_year");
                setSeasonLabel("2025 Reset");
              }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                seasonType === "new_year" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
              data-testid="button-season-newyear"
            >
              <span className="font-semibold text-primary">New Year Reset</span>
            </button>
            <button
              onClick={() => {
                setSeasonType("new_season");
                setSeasonLabel("Spring Reset");
              }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                seasonType === "new_season" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
              data-testid="button-season-new"
            >
              <span className="font-semibold text-primary">New Season / Fresh Start</span>
            </button>
          </div>
          <div>
            <Label htmlFor="seasonLabel">Season Name</Label>
            <Input
              id="seasonLabel"
              value={seasonLabel}
              onChange={(e) => setSeasonLabel(e.target.value)}
              placeholder="e.g., 2025 Reset, Spring Renewal"
              className="mt-2"
              data-testid="input-season-label"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Pick a Theme Word",
      content: (
        <div className="space-y-6">
          <p className="text-muted-foreground text-center">
            Choose one word to anchor your season (optional)
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["Focus", "Growth", "Courage", "Peace", "Purpose", "Joy", "Discipline", "Freedom"].map((word) => (
              <button
                key={word}
                onClick={() => setThemeWord(word)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  themeWord === word ? "border-accent bg-accent text-white" : "border-border hover:border-accent"
                }`}
                data-testid={`button-theme-${word.toLowerCase()}`}
              >
                {word}
              </button>
            ))}
          </div>
          <div>
            <Label htmlFor="themeWord">Or type your own</Label>
            <Input
              id="themeWord"
              value={themeWord}
              onChange={(e) => setThemeWord(e.target.value)}
              placeholder="Your theme word..."
              className="mt-2"
              data-testid="input-theme-word"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--color-paper))] to-white flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full mx-1 transition-colors ${
                    i === step ? "bg-primary" : i < step ? "bg-primary/50" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <CardTitle className="text-xl">{steps[step].title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {steps[step].content}
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-between mt-8">
              <Button
                variant="ghost"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
              >
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep(step + 1)} data-testid="button-next-step">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={onComplete} 
                  disabled={isSubmitting}
                  data-testid="button-begin-journey"
                >
                  {isSubmitting ? "Creating..." : "Begin Journey"} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function VisionDashboard({ session }: { session: any }) {
  const [, navigate] = useLocation();

  const { data: wheelData } = useQuery({
    queryKey: [`/api/vision/sessions/${session.id}/wheel`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/sessions/${session.id}/wheel`, { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const { data: goals } = useQuery({
    queryKey: [`/api/vision/sessions/${session.id}/goals`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/sessions/${session.id}/goals`, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: habits } = useQuery({
    queryKey: [`/api/vision/sessions/${session.id}/habits`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/sessions/${session.id}/habits`, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
  });

  const hasWheel = wheelData?.categories?.length > 0;
  const hasGoals = goals?.length > 0;
  const hasHabits = habits?.length > 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-[hsl(var(--color-paper))] to-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-primary">
                {session.seasonLabel || "My Vision Journey"}
              </h1>
              {session.themeWord && (
                <p className="text-accent font-medium mt-1">Theme: {session.themeWord}</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {session.mode === "faith" ? (
                <span className="flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" /> Faith Mode
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
                  <Compass className="w-3 h-3" /> Classic Mode
                </span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card 
              className={`cursor-pointer hover:shadow-lg transition-shadow ${hasWheel ? "border-green-200 bg-green-50/50" : ""}`}
              onClick={() => navigate(`/vision/${session.id}/wheel`)}
              data-testid="card-wheel-of-life"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-lavender))]/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[hsl(var(--color-lavender))]" />
                  </div>
                  Wheel of Life
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {hasWheel ? "View & update your life assessment" : "Assess 8 areas of your life"}
                </p>
                {hasWheel && <CheckCircle2 className="w-5 h-5 text-green-500 mt-2" />}
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/vision/${session.id}/values`)}
              data-testid="card-values"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-sage))]/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-[hsl(var(--color-sage))]" />
                  </div>
                  Values & Purpose
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Discover what matters most to you
                </p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer hover:shadow-lg transition-shadow ${hasGoals ? "border-green-200 bg-green-50/50" : ""}`}
              onClick={() => navigate(`/vision/${session.id}/goals`)}
              data-testid="card-goals"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-accent" />
                  </div>
                  SMART Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {hasGoals ? `${goals.length} goal${goals.length > 1 ? "s" : ""} set` : "Set meaningful, measurable goals"}
                </p>
                {hasGoals && <CheckCircle2 className="w-5 h-5 text-green-500 mt-2" />}
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/vision/${session.id}/plan`)}
              data-testid="card-plan"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-warning))]/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[hsl(var(--color-warning))]" />
                  </div>
                  90-Day Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Break down your goals into action
                </p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer hover:shadow-lg transition-shadow ${hasHabits ? "border-green-200 bg-green-50/50" : ""}`}
              onClick={() => navigate(`/vision/${session.id}/habits`)}
              data-testid="card-habits"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-success))]/20 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-[hsl(var(--color-success))]" />
                  </div>
                  Habit Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {hasHabits ? `${habits.length} habit${habits.length > 1 ? "s" : ""} tracking` : "Build daily habits that stick"}
                </p>
                {hasHabits && <CheckCircle2 className="w-5 h-5 text-green-500 mt-2" />}
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/vision/${session.id}/checkin`)}
              data-testid="card-checkin"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Daily focus & weekly reviews
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default VisionPage;
