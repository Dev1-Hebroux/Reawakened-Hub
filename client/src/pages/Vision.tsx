import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Compass, Target, Sparkles, Calendar, CheckCircle2, 
  ArrowRight, Mountain, Heart, Flame, Star, ChevronRight,
  Zap, TrendingUp, Award
} from "lucide-react";

const STAGE_COLORS = {
  reflect: { bg: "from-violet-500 to-purple-600", light: "bg-violet-100", text: "text-violet-600", ring: "ring-violet-400" },
  align: { bg: "from-blue-500 to-cyan-500", light: "bg-blue-100", text: "text-blue-600", ring: "ring-blue-400" },
  plan: { bg: "from-emerald-500 to-teal-500", light: "bg-emerald-100", text: "text-emerald-600", ring: "ring-emerald-400" },
  practice: { bg: "from-orange-500 to-amber-500", light: "bg-orange-100", text: "text-orange-600", ring: "ring-orange-400" },
  review: { bg: "from-pink-500 to-rose-500", light: "bg-pink-100", text: "text-pink-600", ring: "ring-pink-400" },
};

const STAGES = [
  { key: "reflect", label: "Reflect", icon: Compass, desc: "Assess where you are" },
  { key: "align", label: "Align", icon: Heart, desc: "Clarify your values" },
  { key: "plan", label: "Plan", icon: Target, desc: "Set SMART goals" },
  { key: "practice", label: "Practice", icon: Flame, desc: "Build daily habits" },
  { key: "review", label: "Review", icon: Star, desc: "Track & adjust" },
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600"
        />
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
      <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 overflow-hidden">
        <section className="relative py-20 px-4">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-5 py-2.5 rounded-full mb-8 shadow-lg shadow-violet-200"
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm font-semibold">Life Vision & Goals</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Design Your Best
                </span>
                <br />
                <span className="text-slate-800">Season Yet</span>
              </h1>
              
              <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                An interactive journey to discover your purpose, set meaningful goals, 
                and build habits that stick. Whether you're starting fresh or realigning, 
                this is your space to dream, plan, and grow.
              </p>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  onClick={() => setShowOnboarding(true)}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-2xl shadow-xl shadow-violet-200 gap-3"
                  data-testid="button-start-vision"
                >
                  Start Your Vision Journey 
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 px-4 relative">
          <div className="max-w-5xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl font-display font-bold text-center mb-4"
            >
              <span className="bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                The 5-Stage Pathway
              </span>
            </motion.h2>
            <p className="text-center text-slate-500 mb-12 max-w-lg mx-auto">
              A proven framework to transform your dreams into daily action
            </p>
            
            <div className="relative">
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-violet-200 via-emerald-200 to-pink-200 -translate-y-1/2 rounded-full" />
              
              <div className="grid md:grid-cols-5 gap-6">
                {STAGES.map((stage, i) => {
                  const colors = STAGE_COLORS[stage.key as keyof typeof STAGE_COLORS];
                  return (
                    <motion.div
                      key={stage.key}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="text-center relative z-10"
                    >
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colors.bg} mx-auto flex items-center justify-center mb-4 shadow-lg`}
                      >
                        <stage.icon className="w-10 h-10 text-white" />
                      </motion.div>
                      <h3 className={`font-bold text-lg ${colors.text}`}>{stage.label}</h3>
                      <p className="text-sm text-slate-500 mt-1">{stage.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-600" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Compass className="w-6 h-6 text-white" />
                      </div>
                      Classic Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">
                      Focus on life design, goal-setting, and personal growth using 
                      proven frameworks like Wheel of Life and Ikigai.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      Faith & Reflection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">
                      Includes prayer prompts, Scripture reflections, and spiritual 
                      dimensions woven throughout the journey.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
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
  const themeColors = ["from-violet-500 to-purple-600", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-orange-500 to-amber-500", "from-pink-500 to-rose-500", "from-indigo-500 to-blue-600", "from-teal-500 to-green-500", "from-rose-500 to-pink-600"];
  const themeWords = ["Focus", "Growth", "Courage", "Peace", "Purpose", "Joy", "Discipline", "Freedom"];
  
  const steps = [
    {
      title: "Choose Your Mode",
      subtitle: "How would you like to approach this journey?",
      content: (
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode("classic")}
            className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
              mode === "classic" 
                ? "border-violet-400 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg" 
                : "border-slate-200 hover:border-violet-300 bg-white"
            }`}
            data-testid="button-mode-classic"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                mode === "classic" ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg" : "bg-slate-100"
              }`}>
                <Compass className={`w-7 h-7 ${mode === "classic" ? "text-white" : "text-slate-400"}`} />
              </div>
              <div>
                <span className={`font-bold text-lg ${mode === "classic" ? "text-violet-700" : "text-slate-700"}`}>Classic</span>
                <p className="text-sm text-slate-500 mt-1">
                  Life design focused on goals, habits, and personal growth
                </p>
              </div>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode("faith")}
            className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
              mode === "faith" 
                ? "border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg" 
                : "border-slate-200 hover:border-amber-300 bg-white"
            }`}
            data-testid="button-mode-faith"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                mode === "faith" ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg" : "bg-slate-100"
              }`}>
                <Sparkles className={`w-7 h-7 ${mode === "faith" ? "text-white" : "text-slate-400"}`} />
              </div>
              <div>
                <span className={`font-bold text-lg ${mode === "faith" ? "text-amber-700" : "text-slate-700"}`}>Faith & Reflection</span>
                <p className="text-sm text-slate-500 mt-1">
                  Includes prayer prompts and Scripture throughout the journey
                </p>
              </div>
            </div>
          </motion.button>
        </div>
      ),
    },
    {
      title: "What Season Is This?",
      subtitle: "Name this season of your life",
      content: (
        <div className="space-y-6">
          <div className="grid gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSeasonType("new_year");
                setSeasonLabel("2025 Reset");
              }}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                seasonType === "new_year" 
                  ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg" 
                  : "border-slate-200 hover:border-emerald-300 bg-white"
              }`}
              data-testid="button-season-newyear"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  seasonType === "new_year" ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "bg-slate-100"
                }`}>
                  <Star className={`w-5 h-5 ${seasonType === "new_year" ? "text-white" : "text-slate-400"}`} />
                </div>
                <span className={`font-semibold ${seasonType === "new_year" ? "text-emerald-700" : "text-slate-700"}`}>
                  New Year Reset
                </span>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSeasonType("new_season");
                setSeasonLabel("Spring Reset");
              }}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                seasonType === "new_season" 
                  ? "border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg" 
                  : "border-slate-200 hover:border-cyan-300 bg-white"
              }`}
              data-testid="button-season-new"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  seasonType === "new_season" ? "bg-gradient-to-br from-cyan-500 to-blue-500" : "bg-slate-100"
                }`}>
                  <TrendingUp className={`w-5 h-5 ${seasonType === "new_season" ? "text-white" : "text-slate-400"}`} />
                </div>
                <span className={`font-semibold ${seasonType === "new_season" ? "text-cyan-700" : "text-slate-700"}`}>
                  New Season / Fresh Start
                </span>
              </div>
            </motion.button>
          </div>
          
          <div>
            <Label htmlFor="seasonLabel" className="text-slate-600 font-medium">Season Name</Label>
            <Input
              id="seasonLabel"
              value={seasonLabel}
              onChange={(e) => setSeasonLabel(e.target.value)}
              placeholder="e.g., 2025 Reset, Spring Renewal"
              className="mt-2 rounded-xl border-slate-200 focus:border-violet-400 focus:ring-violet-100"
              data-testid="input-season-label"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Pick a Theme Word",
      subtitle: "Choose one word to anchor your season (optional)",
      content: (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {themeWords.map((word, i) => (
              <motion.button
                key={word}
                whileHover={{ scale: 1.08, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setThemeWord(word)}
                className={`px-5 py-3 rounded-xl font-semibold transition-all ${
                  themeWord === word 
                    ? `bg-gradient-to-r ${themeColors[i]} text-white shadow-lg` 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                data-testid={`button-theme-${word.toLowerCase()}`}
              >
                {word}
              </motion.button>
            ))}
          </div>
          <div>
            <Label htmlFor="themeWord" className="text-slate-600 font-medium">Or type your own</Label>
            <Input
              id="themeWord"
              value={themeWord}
              onChange={(e) => setThemeWord(e.target.value)}
              placeholder="Your theme word..."
              className="mt-2 rounded-xl border-slate-200 focus:border-violet-400 focus:ring-violet-100"
              data-testid="input-theme-word"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-violet-300/30 to-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-cyan-300/30 to-blue-300/30 rounded-full blur-3xl" />
      </div>
      
      <motion.div
        className="max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500" />
          <CardHeader className="text-center pb-2 pt-8">
            <div className="flex justify-center mb-6">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-12 h-2 rounded-full mx-1 transition-all duration-300 ${
                    i === step 
                      ? "bg-gradient-to-r from-violet-500 to-purple-600" 
                      : i < step 
                        ? "bg-violet-300" 
                        : "bg-slate-200"
                  }`}
                  animate={{ scale: i === step ? 1.1 : 1 }}
                />
              ))}
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {steps[step].title}
            </CardTitle>
            <p className="text-slate-500 mt-2">{steps[step].subtitle}</p>
          </CardHeader>
          <CardContent className="pt-6 px-8 pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {steps[step].content}
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-between mt-10">
              <Button
                variant="ghost"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="text-slate-500 hover:text-slate-700"
              >
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button 
                  onClick={() => setStep(step + 1)} 
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl px-6"
                  data-testid="button-next-step"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={onComplete} 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl px-6 shadow-lg"
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

  const dashboardCards = [
    {
      id: "wheel",
      title: "Wheel of Life",
      icon: Target,
      gradient: "from-violet-500 to-purple-600",
      lightBg: "from-violet-50 to-purple-50",
      desc: hasWheel ? "View & update your life assessment" : "Assess 8 areas of your life",
      completed: hasWheel,
      route: "wheel",
      stage: "Stage 1: Reflect",
    },
    {
      id: "values",
      title: "Values & Purpose",
      icon: Heart,
      gradient: "from-blue-500 to-cyan-500",
      lightBg: "from-blue-50 to-cyan-50",
      desc: "Discover what matters most to you",
      completed: false,
      route: "values",
      stage: "Stage 2: Align",
    },
    {
      id: "goals",
      title: "SMART Goals",
      icon: Target,
      gradient: "from-emerald-500 to-teal-500",
      lightBg: "from-emerald-50 to-teal-50",
      desc: hasGoals ? `${goals.length} goal${goals.length > 1 ? "s" : ""} set` : "Set meaningful, measurable goals",
      completed: hasGoals,
      route: "goals",
      stage: "Stage 3: Plan",
    },
    {
      id: "plan",
      title: "90-Day Plan",
      icon: Calendar,
      gradient: "from-orange-500 to-amber-500",
      lightBg: "from-orange-50 to-amber-50",
      desc: "Break down your goals into action",
      completed: false,
      route: "plan",
      stage: "Stage 3: Plan",
    },
    {
      id: "habits",
      title: "Habit Tracker",
      icon: Flame,
      gradient: "from-orange-500 to-amber-500",
      lightBg: "from-orange-50 to-amber-50",
      desc: hasHabits ? `${habits.length} habit${habits.length > 1 ? "s" : ""} tracking` : "Build daily habits that stick",
      completed: hasHabits,
      route: "habits",
      stage: "Stage 4: Practice",
    },
    {
      id: "checkin",
      title: "Check-ins",
      icon: CheckCircle2,
      gradient: "from-pink-500 to-rose-500",
      lightBg: "from-pink-50 to-rose-50",
      desc: "Daily focus & weekly reviews",
      completed: false,
      route: "checkin",
      stage: "Stage 5: Review",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 py-8 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-300/20 to-purple-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-300/20 to-blue-300/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
          >
            <div>
              <h1 className="text-4xl font-display font-bold">
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  {session.seasonLabel || "My Vision Journey"}
                </span>
              </h1>
              {session.themeWord && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-slate-500">Theme:</span>
                  <span className="px-4 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full font-semibold text-sm shadow-md">
                    {session.themeWord}
                  </span>
                </div>
              )}
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }}>
              {session.mode === "faith" ? (
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-5 py-2.5 rounded-full shadow-lg font-semibold">
                  <Sparkles className="w-4 h-4" /> Faith Mode
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-5 py-2.5 rounded-full shadow-lg font-semibold">
                  <Compass className="w-4 h-4" /> Classic Mode
                </span>
              )}
            </motion.div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => navigate(`/vision/${session.id}/${card.route}`)}
                data-testid={`card-${card.id}`}
              >
                <Card className={`h-full border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl ${
                  card.completed ? "ring-2 ring-emerald-400" : ""
                }`}>
                  <div className={`h-1.5 bg-gradient-to-r ${card.gradient}`} />
                  <CardHeader className="pb-2">
                    <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${card.gradient} text-white px-3 py-1 rounded-full mb-3 text-xs font-semibold shadow-md w-fit`}>
                      <Zap className="w-3 h-3" />
                      {card.stage}
                    </div>
                    <CardTitle className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                        <card.icon className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-lg font-bold text-slate-800">{card.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-500">{card.desc}</p>
                    {card.completed && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 mt-4"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-emerald-600 font-semibold text-sm">In Progress</span>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default VisionPage;
