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
  Zap, TrendingUp, Award, Play, Users, Trophy, Clock
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

  const stats = [
    { label: "Journeys Started", value: "2.5k+", icon: Play },
    { label: "Goals Achieved", value: "8.2k", icon: Trophy },
    { label: "Habits Built", value: "15k+", icon: Flame },
    { label: "Active Users", value: "1.2k", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#0a1628] text-white font-sans">
      <Navbar />
      
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-cyan-900/40" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full mb-8"
            >
              <Sparkles className="w-4 h-4 text-violet-300" />
              <span className="text-sm font-semibold">Life Vision & Goals Pathway</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 tracking-tight leading-[0.9]" data-testid="text-vision-title">
              Design Your
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Best Season Yet
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              An interactive journey to discover your purpose, set meaningful goals, 
              and build habits that transform your life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  onClick={() => setShowOnboarding(true)}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-xl shadow-violet-500/30 gap-3"
                  data-testid="button-start-vision"
                >
                  Start Your Vision Journey 
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg backdrop-blur-sm"
                >
                  <Play className="w-5 h-5 mr-2" /> Watch Preview
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Animated scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Compact Stats Bar */}
      <section className="bg-white relative z-20 -mt-12 max-w-md md:max-w-2xl mx-4 md:mx-auto rounded-2xl shadow-xl p-4 md:p-6">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="text-center py-2">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-violet-600" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Compact Journey Roadmap */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-600 px-3 py-1.5 rounded-full text-xs font-bold mb-4">
              <Target className="h-3 w-3" /> Your Path to Purpose
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              The 5-Stage Vision Pathway
            </h2>
            <p className="text-sm text-gray-600">
              A proven framework that transforms dreams into daily action
            </p>
          </div>
          
          {/* Vertical Stacked Cards */}
          <div className="space-y-4">
            {STAGES.map((stage, i) => {
              const colors = STAGE_COLORS[stage.key as keyof typeof STAGE_COLORS];
              return (
                <div
                  key={stage.key}
                  className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-md mb-3`}>
                      <stage.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className={`text-xs font-bold ${colors.text} mb-1`}>Stage {i + 1}</span>
                    <h3 className="font-bold text-lg text-gray-900">{stage.label}</h3>
                    <p className="text-xs text-gray-500">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compact Mode Selection */}
      <section className="py-12 px-4 bg-gradient-to-br from-gray-50 to-violet-50/30">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Choose Your Approach
            </h2>
            <p className="text-sm text-gray-600">
              Two powerful modes to suit your journey
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Classic Mode Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
              <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-600" />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Compass className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Classic Mode</h3>
                    <p className="text-xs text-violet-600 font-medium">Personal Growth Focus</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Focus on life design, goal-setting, and personal growth using proven frameworks like Wheel of Life and Ikigai purpose discovery.
                </p>
                <ul className="space-y-1.5">
                  {["Wheel of Life Assessment", "SMART Goals Framework", "90-Day Action Plans", "Habit Tracking"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Faith Mode Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md border-l-4 border-l-orange-400 border border-gray-100">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Faith & Reflection</h3>
                    <p className="text-xs text-orange-600 font-medium">Spiritual Integration</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Includes prayer prompts, Scripture reflections, and spiritual dimensions woven throughout every stage of your journey.
                </p>
                <ul className="space-y-1.5">
                  {["Biblical Foundations", "Prayer & Reflection Prompts", "Purpose Aligned with Faith", "Spiritual Growth Tracking"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Full-width CTA */}
          <div className="mt-8">
            <Button 
              size="lg" 
              onClick={() => setShowOnboarding(true)}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-4 text-base rounded-full shadow-lg"
              data-testid="button-start-vision-bottom"
            >
              Begin Your Journey Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
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
                <Heart className={`w-7 h-7 ${mode === "faith" ? "text-white" : "text-slate-400"}`} />
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

  // Calculate overall progress based on tracked stages only
  // Only count stages we can actually verify completion for
  const trackedSteps = [
    { name: "Wheel of Life", completed: hasWheel },
    { name: "SMART Goals", completed: hasGoals },
    { name: "Habits", completed: hasHabits },
  ];
  const completedSteps = trackedSteps.filter(s => s.completed).length;
  const totalTrackedSteps = trackedSteps.length;
  const progressPercent = Math.round((completedSteps / totalTrackedSteps) * 100);

  return (
    <div className="min-h-screen bg-[#0a1628] text-white font-sans">
      <Navbar />
      
      {/* Dashboard Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-cyan-900/40" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <motion.div whileHover={{ scale: 1.05 }} className="inline-block mb-4">
                {session.mode === "faith" ? (
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-5 py-2.5 rounded-full shadow-lg font-semibold text-sm">
                    <Heart className="w-4 h-4" /> Faith & Reflection Mode
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full font-semibold text-sm">
                    <Compass className="w-4 h-4" /> Classic Mode
                  </span>
                )}
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {session.seasonLabel || "My Vision Journey"}
                </span>
              </h1>
              {session.themeWord && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">Theme Word:</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full font-bold text-sm shadow-lg">
                    {session.themeWord}
                  </span>
                </div>
              )}
            </div>
            
            {/* Progress Ring */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="w-32 h-32 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - progressPercent / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{progressPercent}%</span>
                  <span className="text-xs text-gray-400">Complete</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats Bar with Dynamic Widgets */}
      <section className="bg-white relative z-20 -mt-8 max-w-5xl mx-4 md:mx-auto rounded-2xl shadow-2xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-violet-600">{goals?.length || 0}</div>
            <div className="text-xs text-gray-500 font-medium">Goals Set</div>
          </motion.div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-500">{habits?.length || 0}</div>
            <div className="text-xs text-gray-500 font-medium">Habits Tracking</div>
          </motion.div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-cyan-600">{progressPercent}%</div>
            <div className="text-xs text-gray-500 font-medium">Progress</div>
          </motion.div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-500">{completedSteps}/{totalTrackedSteps}</div>
            <div className="text-xs text-gray-500 font-medium">Steps Done</div>
          </motion.div>
        </div>
      </section>

      {/* Journey Cards */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Your Vision Pathway</h2>
            <p className="text-gray-500">Continue your journey through each stage</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="cursor-pointer group"
                onClick={() => navigate(`/vision/${session.id}/${card.route}`)}
                data-testid={`card-${card.id}`}
              >
                <div className={`h-full bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 ${
                  card.completed ? "ring-2 ring-emerald-400" : ""
                }`}>
                  <div className={`h-2 bg-gradient-to-r ${card.gradient}`} />
                  <div className="p-6">
                    <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${card.gradient} text-white px-3 py-1.5 rounded-full mb-4 text-xs font-bold shadow-md`}>
                      <Zap className="w-3 h-3" />
                      {card.stage}
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <card.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
                        <p className="text-sm text-gray-500">{card.desc}</p>
                      </div>
                    </div>
                    {card.completed ? (
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-emerald-600 font-semibold text-sm">In Progress</span>
                        <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                        <span className="text-gray-400 text-sm">Start this step</span>
                        <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default VisionPage;
