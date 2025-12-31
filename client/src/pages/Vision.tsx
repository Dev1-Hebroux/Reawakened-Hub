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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Compass, Target, Sparkles, Calendar, CheckCircle2, 
  ArrowRight, Mountain, Heart, Flame, Star, ChevronRight,
  Zap, TrendingUp, Award, Play, Users, Trophy, Clock, X,
  BookOpen, Lightbulb, Route, Quote
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
  const [showDemoModal, setShowDemoModal] = useState(false);

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

  const trustBadges = [
    { icon: Route, label: "Proven 5-Stage Framework" },
    { icon: Heart, label: "Faith-Friendly Options" },
    { icon: Target, label: "Actionable 90-Day Plans" },
  ];

  const whyCards = [
    { 
      icon: Compass, 
      title: "Discover Your Purpose", 
      desc: "Use the Wheel of Life and Ikigai frameworks to find clarity on what matters most.",
      gradient: "from-violet-500 to-purple-600"
    },
    { 
      icon: Target, 
      title: "Set Meaningful Goals", 
      desc: "Create SMART goals with real deadlines and measurable outcomes.",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      icon: Flame, 
      title: "Build Lasting Habits", 
      desc: "Track daily habits and build consistency with streak tracking and accountability.",
      gradient: "from-orange-500 to-amber-500"
    },
  ];

  const demoFrameworks = [
    { 
      title: "Wheel of Life", 
      desc: "Assess 8 key life areas to discover where you need the most growth",
      icon: Compass,
      biblical: "Proverbs 4:26 - Give careful thought to the paths for your feet"
    },
    { 
      title: "Purpose Discovery (Ikigai)", 
      desc: "Find the intersection of your passions, skills, and what the world needs",
      icon: Lightbulb,
      biblical: "Jeremiah 29:11 - For I know the plans I have for you"
    },
    { 
      title: "SMART Goals", 
      desc: "Set Specific, Measurable, Achievable, Relevant, and Time-bound goals",
      icon: Target,
      biblical: "Habakkuk 2:2 - Write down the vision and make it plain"
    },
    { 
      title: "90-Day Action Plans", 
      desc: "Break big dreams into quarterly sprints with clear milestones",
      icon: Calendar,
      biblical: "Proverbs 16:3 - Commit to the Lord whatever you do"
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a1628] text-white font-sans">
      <Navbar />
      
      {/* Demo Modal */}
      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f1d32] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              Vision & Goal Frameworks
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-gray-300 text-sm">
              Discover proven frameworks for designing your best season, with biblical principles woven throughout.
            </p>
            {demoFrameworks.map((framework, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <framework.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1">{framework.title}</h4>
                    <p className="text-sm text-gray-300 mb-2">{framework.desc}</p>
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <BookOpen className="w-3 h-3" />
                      <span className="italic">{framework.biblical}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            <Button 
              onClick={() => {
                setShowDemoModal(false);
                setShowOnboarding(true);
              }}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white py-3 rounded-full mt-4"
            >
              Start Your Journey <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dark Gradient Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-cyan-900/40" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-violet-300" />
              <span className="text-sm font-medium">Life Vision & Goals Pathway</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight leading-tight" data-testid="text-vision-title">
              Design Your
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"> Best Season</span>
            </h1>
            
            <p className="text-base md:text-lg text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
              An interactive journey to discover your purpose, set meaningful goals, 
              and build habits that transform your life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  onClick={() => setShowOnboarding(true)}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-5 text-base rounded-full shadow-xl shadow-violet-500/25 gap-2"
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
                  onClick={() => setShowDemoModal(true)}
                  className="border-white/20 text-white hover:bg-white/10 px-6 py-5 rounded-full text-base backdrop-blur-sm"
                  data-testid="button-watch-demo"
                >
                  <Play className="w-4 h-4 mr-2" /> Watch Demo
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 px-4 bg-[#0a1628]">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {trustBadges.map((badge, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-full"
              >
                <badge.icon className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-gray-300 font-medium">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Pathway Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#0a1628] to-[#0f1d32]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              What You'll Discover
            </h2>
            <p className="text-gray-400">
              Transform dreams into daily action with proven frameworks
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {whyCards.map((card, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">{card.title}</h3>
                <p className="text-sm text-gray-400">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5-Stage Journey Timeline */}
      <section className="py-16 px-4 bg-[#0f1d32]">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 text-violet-300 px-3 py-1.5 rounded-full text-xs font-bold mb-4">
              <Target className="h-3 w-3" /> Your Path to Purpose
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              The 5-Stage Pathway
            </h2>
            <p className="text-sm text-gray-400">
              A proven framework for intentional living
            </p>
          </div>
          
          {/* Vertical Timeline */}
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-blue-500 via-emerald-500 via-orange-500 to-pink-500" />
            
            <div className="space-y-6">
              {STAGES.map((stage, i) => {
                const colors = STAGE_COLORS[stage.key as keyof typeof STAGE_COLORS];
                return (
                  <motion.div
                    key={stage.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-4 pl-0"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg relative z-10`}>
                      <stage.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4">
                      <span className={`text-xs font-bold ${colors.text}`}>Stage {i + 1}</span>
                      <h3 className="font-bold text-white">{stage.label}</h3>
                      <p className="text-xs text-gray-400">{stage.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Mode Selection - Dark Theme */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#0f1d32] to-[#0a1628]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Choose Your Approach
            </h2>
            <p className="text-gray-400">
              Two powerful modes to suit your journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Classic Mode */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Classic</h3>
                  <p className="text-xs text-violet-400">Personal Growth</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Focus on life design using Wheel of Life, Ikigai, and SMART goals.
              </p>
              <ul className="space-y-2">
                {["Wheel of Life", "SMART Goals", "90-Day Plans", "Habit Tracking"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Faith Mode */}
            <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Faith & Reflection</h3>
                  <p className="text-xs text-amber-400">Spiritual Integration</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Includes prayer prompts and Scripture woven throughout.
              </p>
              <ul className="space-y-2">
                {["Biblical Foundations", "Prayer Prompts", "Faith-Aligned Purpose", "Spiritual Growth"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 px-4 bg-[#0a1628]">
        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-8 text-center"
          >
            <Quote className="w-10 h-10 text-violet-400 mx-auto mb-4 opacity-50" />
            <p className="text-lg text-gray-200 italic mb-6">
              "This pathway helped me finally get clarity on my purpose and set goals that actually stick. 
              The faith integration made it feel like more than just another planning tool."
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">JM</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-white text-sm">James M.</p>
                <p className="text-xs text-gray-400">Completed the Vision Pathway</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-gradient-to-t from-[#0f1d32] to-[#0a1628]">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Design Your Best Season?
          </h2>
          <p className="text-gray-400 mb-8">
            Start your vision journey today and transform your dreams into reality.
          </p>
          <Button 
            size="lg" 
            onClick={() => setShowOnboarding(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-5 text-base rounded-full shadow-xl shadow-violet-500/25"
            data-testid="button-start-vision-bottom"
          >
            Begin Your Journey Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
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

      {/* Journey Progress Summary */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-lg mx-auto">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Journey Progress</h3>
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-4">
            <div className="space-y-3">
              {trackedSteps.map((step, i) => (
                <div key={step.name} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-gradient-to-br from-emerald-400 to-green-500' 
                      : 'bg-gray-200'
                  }`}>
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs text-gray-500">{i + 1}</span>
                    )}
                  </div>
                  <span className={`flex-1 text-sm ${step.completed ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {step.name}
                  </span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: step.completed ? '100%' : '0%' }}
                      transition={{ delay: i * 0.2, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-violet-100 flex items-center justify-between">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className="text-lg font-bold text-violet-600">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Cards */}
      <section className="py-12 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-lg mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your Vision Pathway</h2>
            <p className="text-sm text-gray-500">Continue your journey through each stage</p>
          </motion.div>

          <div className="space-y-3">
            {dashboardCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="cursor-pointer"
                onClick={() => navigate(`/vision/${session.id}/${card.route}`)}
                data-testid={`card-${card.id}`}
              >
                <div className={`bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 ${
                  card.completed ? "border-l-4 border-l-emerald-400" : ""
                }`}>
                  <div className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{card.title}</h3>
                        {card.completed && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{card.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300" />
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
