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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Compass, Target, Sparkles, Calendar, CheckCircle2, 
  ArrowRight, Mountain, Heart, Flame, Star, ChevronRight,
  Zap, TrendingUp, Award, Play, Users, Trophy, Clock, X,
  BookOpen, Lightbulb, Route, Quote, LogIn
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";


const STAGE_COLORS = {
  reflect: { bg: "from-[#7C9A8E] to-[#6B8B7E]", light: "bg-[#7C9A8E]/10", text: "text-[#7C9A8E]", ring: "ring-[#7C9A8E]" },
  align: { bg: "from-[#9B8AA6] to-[#8A7995]", light: "bg-[#9B8AA6]/10", text: "text-[#9B8AA6]", ring: "ring-[#9B8AA6]" },
  plan: { bg: "from-[#4A7C7C] to-[#3A6C6C]", light: "bg-[#4A7C7C]/10", text: "text-[#4A7C7C]", ring: "ring-[#4A7C7C]" },
  practice: { bg: "from-[#D4A574] to-[#C49464]", light: "bg-[#D4A574]/10", text: "text-[#D4A574]", ring: "ring-[#D4A574]" },
  review: { bg: "from-[#C17767] to-[#B16657]", light: "bg-[#C17767]/10", text: "text-[#C17767]", ring: "ring-[#C17767]" },
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
  const { user, isLoading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [mode, setMode] = useState<"classic" | "faith">("classic");
  const [seasonType, setSeasonType] = useState<"new_year" | "new_season">("new_year");
  const [seasonLabel, setSeasonLabel] = useState("2025 Reset");
  const [themeWord, setThemeWord] = useState("");
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-[#E8E4DE] border-t-[#7C9A8E]"
        />
      </div>
    );
  }

  if (session) {
    return <VisionDashboard session={session} />;
  }

  const handleBeginJourney = () => {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      createSession.mutate();
    }
  };

  if (showOnboarding) {
    return (
      <>
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
          onComplete={handleBeginJourney}
          isSubmitting={createSession.isPending}
        />
        
        {/* Login Prompt Dialog */}
        <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
          <DialogContent className="max-w-md bg-white border-[#E8E4DE]">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center shadow-lg">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
              </div>
              <DialogTitle className="text-2xl font-bold text-center text-[#2C3E2D]">
                Sign in to Continue
              </DialogTitle>
              <DialogDescription className="text-center text-[#6B7B6E] mt-2">
                Create a free account to save your vision journey progress and access it from anywhere.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-6">
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="w-full bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white py-6 rounded-xl font-semibold"
                data-testid="button-login-vision"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
              <p className="text-center text-sm text-[#6B7B6E]">
                Your progress will be saved automatically
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </>
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
      gradient: "from-[#7C9A8E] to-[#6B8B7E]"
    },
    { 
      icon: Target, 
      title: "Set Meaningful Goals", 
      desc: "Create SMART goals with real deadlines and measurable outcomes.",
      gradient: "from-[#4A7C7C] to-[#3A6C6C]"
    },
    { 
      icon: Flame, 
      title: "Build Lasting Habits", 
      desc: "Track daily habits and build consistency with streak tracking and accountability.",
      gradient: "from-[#D4A574] to-[#C49464]"
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
    <div className="min-h-screen bg-[#FAF8F5] font-sans">
      <Navbar />
      
      {/* Demo Modal */}
      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FAF8F5] border-[#E8E4DE] text-[#2C3E2D]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2C3E2D] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              Vision & Goal Frameworks
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-[#6B7B6E] text-sm">
              Discover proven frameworks for designing your best season, with biblical principles woven throughout.
            </p>
            {demoFrameworks.map((framework, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-[#E8E4DE] rounded-xl p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center flex-shrink-0">
                    <framework.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#2C3E2D] mb-1">{framework.title}</h4>
                    <p className="text-sm text-[#6B7B6E] mb-2">{framework.desc}</p>
                    <div className="flex items-center gap-2 text-xs text-[#D4A574]">
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
              className="w-full bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white py-3 rounded-full mt-4"
            >
              Start Your Journey <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Warm Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20 pb-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C9A8E]/10 via-[#FAF8F5] to-[#D4A574]/10" />
          <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#7C9A8E]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-[#D4A574]/10 rounded-full blur-[100px]" />
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
              className="inline-flex items-center gap-2 bg-[#7C9A8E]/10 border border-[#7C9A8E]/30 text-[#7C9A8E] px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#7C9A8E]" />
              <span className="text-sm font-medium">Life Vision & Goals Pathway</span>
            </motion.div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-4 tracking-tight leading-tight text-[#2C3E2D]" data-testid="text-vision-title">
              Design Your
              <span className="text-[#7C9A8E]"> Best Season</span>
            </h1>
            
            <p className="text-base md:text-lg text-[#6B7B6E] mb-8 max-w-xl mx-auto leading-relaxed">
              An interactive journey to discover your purpose, set meaningful goals, 
              and build habits that transform your life.
            </p>
            
            <div className="flex flex-col gap-3 justify-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  onClick={() => setShowOnboarding(true)}
                  className="w-full sm:w-auto bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white px-8 py-6 text-base rounded-full shadow-lg gap-2"
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
                  className="w-full sm:w-auto border-[#7C9A8E] text-[#7C9A8E] hover:bg-[#7C9A8E]/10 px-8 py-6 rounded-full text-base"
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
      <section className="py-6 px-4 bg-[#FAF8F5]">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
            {trustBadges.map((badge, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center justify-center gap-2 bg-white border border-[#E8E4DE] px-4 py-3 rounded-full"
              >
                <badge.icon className="w-4 h-4 text-[#7C9A8E]" />
                <span className="text-sm text-[#2C3E2D] font-medium">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Pathway Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2C3E2D] mb-2">
              What You'll Discover
            </h2>
            <p className="text-[#6B7B6E]">
              Transform dreams into daily action with proven frameworks
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whyCards.map((card, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-[#FAF8F5] border border-[#E8E4DE] rounded-2xl p-6 text-center hover:shadow-md transition-all"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg text-[#2C3E2D] mb-2">{card.title}</h3>
                <p className="text-sm text-[#6B7B6E]">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5-Stage Journey Timeline */}
      <section className="py-12 px-4 bg-[#FAF8F5]">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#7C9A8E]/10 text-[#7C9A8E] px-3 py-1.5 rounded-full text-xs font-bold mb-4">
              <Target className="h-3 w-3" /> Your Path to Purpose
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2C3E2D] mb-2">
              The 5-Stage Pathway
            </h2>
            <p className="text-sm text-[#6B7B6E]">
              A proven framework for intentional living
            </p>
          </div>
          
          {/* Vertical Timeline */}
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#7C9A8E] via-[#9B8AA6] via-[#4A7C7C] via-[#D4A574] to-[#C17767]" />
            
            <div className="space-y-4">
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
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-md relative z-10`}>
                      <stage.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 bg-white border border-[#E8E4DE] rounded-xl p-4">
                      <span className={`text-xs font-bold ${colors.text}`}>Stage {i + 1}</span>
                      <h3 className="font-bold text-[#2C3E2D]">{stage.label}</h3>
                      <p className="text-xs text-[#6B7B6E]">{stage.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Mode Selection */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2C3E2D] mb-2">
              Choose Your Approach
            </h2>
            <p className="text-[#6B7B6E]">
              Two powerful modes to suit your journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Classic Mode */}
            <div className="bg-[#FAF8F5] border border-[#E8E4DE] rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center shadow-md">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2C3E2D]">Classic</h3>
                  <p className="text-xs text-[#7C9A8E]">Personal Growth</p>
                </div>
              </div>
              <p className="text-sm text-[#6B7B6E] mb-4">
                Focus on life design using Wheel of Life, Ikigai, and SMART goals.
              </p>
              <ul className="space-y-2">
                {["Wheel of Life", "SMART Goals", "90-Day Plans", "Habit Tracking"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#2C3E2D]">
                    <CheckCircle2 className="w-4 h-4 text-[#7C9A8E]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Faith Mode */}
            <div className="bg-[#FAF8F5] border-2 border-[#D4A574]/30 rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#C49464] flex items-center justify-center shadow-md">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2C3E2D]">Faith & Reflection</h3>
                  <p className="text-xs text-[#D4A574]">Spiritual Integration</p>
                </div>
              </div>
              <p className="text-sm text-[#6B7B6E] mb-4">
                Includes prayer prompts and Scripture woven throughout.
              </p>
              <ul className="space-y-2">
                {["Biblical Foundations", "Prayer Prompts", "Faith-Aligned Purpose", "Spiritual Growth"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#2C3E2D]">
                    <CheckCircle2 className="w-4 h-4 text-[#D4A574]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-12 px-4 bg-[#FAF8F5]">
        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E8E4DE] rounded-2xl p-6 md:p-8 text-center"
          >
            <Quote className="w-10 h-10 text-[#7C9A8E] mx-auto mb-4 opacity-50" />
            <p className="text-base md:text-lg text-[#2C3E2D] italic mb-6">
              "This pathway helped me finally get clarity on my purpose and set goals that actually stick. 
              The faith integration made it feel like more than just another planning tool."
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center">
                <span className="text-white font-bold text-sm">JM</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-[#2C3E2D] text-sm">James M.</p>
                <p className="text-xs text-[#6B7B6E]">Completed the Vision Pathway</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2C3E2D] mb-4">
            Ready to Design Your Best Season?
          </h2>
          <p className="text-[#6B7B6E] mb-8">
            Start your vision journey today and transform your dreams into reality.
          </p>
          <Button 
            size="lg" 
            onClick={() => setShowOnboarding(true)}
            className="w-full bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white px-8 py-6 text-base rounded-full shadow-lg"
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
  const themeColors = ["from-[#7C9A8E] to-[#6B8B7E]", "from-[#4A7C7C] to-[#3A6C6C]", "from-[#9B8AA6] to-[#8A7995]", "from-[#D4A574] to-[#C49464]", "from-[#C17767] to-[#B16657]", "from-[#6B8E8E] to-[#5A7D7D]", "from-[#8A9B7E] to-[#798A6D]", "from-[#B07E6E] to-[#9F6D5D]"];
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
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
              mode === "classic" 
                ? "border-[#7C9A8E] bg-[#7C9A8E]/10 shadow-lg" 
                : "border-[#E8E4DE] hover:border-[#7C9A8E]/50 bg-white"
            }`}
            data-testid="button-mode-classic"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                mode === "classic" ? "bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] shadow-md" : "bg-[#E8E4DE]"
              }`}>
                <Compass className={`w-6 h-6 ${mode === "classic" ? "text-white" : "text-[#6B7B6E]"}`} />
              </div>
              <div>
                <span className={`font-bold text-base ${mode === "classic" ? "text-[#7C9A8E]" : "text-[#2C3E2D]"}`}>Classic</span>
                <p className="text-sm text-[#6B7B6E] mt-1">
                  Life design focused on goals, habits, and personal growth
                </p>
              </div>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode("faith")}
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
              mode === "faith" 
                ? "border-[#D4A574] bg-[#D4A574]/10 shadow-lg" 
                : "border-[#E8E4DE] hover:border-[#D4A574]/50 bg-white"
            }`}
            data-testid="button-mode-faith"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                mode === "faith" ? "bg-gradient-to-br from-[#D4A574] to-[#C49464] shadow-md" : "bg-[#E8E4DE]"
              }`}>
                <Heart className={`w-6 h-6 ${mode === "faith" ? "text-white" : "text-[#6B7B6E]"}`} />
              </div>
              <div>
                <span className={`font-bold text-base ${mode === "faith" ? "text-[#D4A574]" : "text-[#2C3E2D]"}`}>Faith & Reflection</span>
                <p className="text-sm text-[#6B7B6E] mt-1">
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
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                seasonType === "new_year" 
                  ? "border-[#7C9A8E] bg-[#7C9A8E]/10 shadow-md" 
                  : "border-[#E8E4DE] hover:border-[#7C9A8E]/50 bg-white"
              }`}
              data-testid="button-season-newyear"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  seasonType === "new_year" ? "bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E]" : "bg-[#E8E4DE]"
                }`}>
                  <Star className={`w-5 h-5 ${seasonType === "new_year" ? "text-white" : "text-[#6B7B6E]"}`} />
                </div>
                <span className={`font-semibold ${seasonType === "new_year" ? "text-[#7C9A8E]" : "text-[#2C3E2D]"}`}>
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
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                seasonType === "new_season" 
                  ? "border-[#4A7C7C] bg-[#4A7C7C]/10 shadow-md" 
                  : "border-[#E8E4DE] hover:border-[#4A7C7C]/50 bg-white"
              }`}
              data-testid="button-season-new"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  seasonType === "new_season" ? "bg-gradient-to-br from-[#4A7C7C] to-[#3A6C6C]" : "bg-[#E8E4DE]"
                }`}>
                  <TrendingUp className={`w-5 h-5 ${seasonType === "new_season" ? "text-white" : "text-[#6B7B6E]"}`} />
                </div>
                <span className={`font-semibold ${seasonType === "new_season" ? "text-[#4A7C7C]" : "text-[#2C3E2D]"}`}>
                  New Season / Fresh Start
                </span>
              </div>
            </motion.button>
          </div>
          
          <div>
            <Label htmlFor="seasonLabel" className="text-[#6B7B6E] font-medium">Season Name</Label>
            <Input
              id="seasonLabel"
              value={seasonLabel}
              onChange={(e) => setSeasonLabel(e.target.value)}
              placeholder="e.g., 2025 Reset, Spring Renewal"
              className="mt-2 rounded-xl border-[#E8E4DE] focus:border-[#7C9A8E] focus:ring-[#7C9A8E]/20"
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
          <div className="flex flex-wrap gap-2 justify-center">
            {themeWords.map((word, i) => (
              <motion.button
                key={word}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setThemeWord(word)}
                className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  themeWord === word 
                    ? `bg-gradient-to-r ${themeColors[i]} text-white shadow-md` 
                    : "bg-[#E8E4DE] text-[#2C3E2D] hover:bg-[#D4D0CA]"
                }`}
                data-testid={`button-theme-${word.toLowerCase()}`}
              >
                {word}
              </motion.button>
            ))}
          </div>
          <div>
            <Label htmlFor="themeWord" className="text-[#6B7B6E] font-medium">Or type your own</Label>
            <Input
              id="themeWord"
              value={themeWord}
              onChange={(e) => setThemeWord(e.target.value)}
              placeholder="Your theme word..."
              className="mt-2 rounded-xl border-[#E8E4DE] focus:border-[#7C9A8E] focus:ring-[#7C9A8E]/20"
              data-testid="input-theme-word"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 md:left-20 w-48 md:w-72 h-48 md:h-72 bg-[#7C9A8E]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 md:right-20 w-48 md:w-72 h-48 md:h-72 bg-[#D4A574]/10 rounded-full blur-3xl" />
      </div>
      
      <motion.div
        className="max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-xl border border-[#E8E4DE] bg-white rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#7C9A8E] via-[#4A7C7C] to-[#D4A574]" />
          <CardHeader className="text-center pb-2 pt-6">
            <div className="flex justify-center mb-4">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-10 h-1.5 rounded-full mx-1 transition-all duration-300 ${
                    i === step 
                      ? "bg-[#7C9A8E]" 
                      : i < step 
                        ? "bg-[#7C9A8E]/50" 
                        : "bg-[#E8E4DE]"
                  }`}
                  animate={{ scale: i === step ? 1.1 : 1 }}
                />
              ))}
            </div>
            <CardTitle className="text-xl text-[#2C3E2D]">
              {steps[step].title}
            </CardTitle>
            <p className="text-[#6B7B6E] mt-2 text-sm">{steps[step].subtitle}</p>
          </CardHeader>
          <CardContent className="pt-4 px-5 pb-6">
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
            <div className="flex justify-between mt-8">
              <Button
                variant="ghost"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="text-[#6B7B6E] hover:text-[#2C3E2D] hover:bg-[#E8E4DE]"
              >
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button 
                  onClick={() => setStep(step + 1)} 
                  className="bg-[#7C9A8E] hover:bg-[#6B8B7E] rounded-xl px-6 py-5"
                  data-testid="button-next-step"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={onComplete} 
                  disabled={isSubmitting}
                  className="bg-[#7C9A8E] hover:bg-[#6B8B7E] rounded-xl px-6 py-5 shadow-md"
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
      gradient: "from-[#7C9A8E] to-[#6B8B7E]",
      lightBg: "from-[#7C9A8E]/10 to-[#6B8B7E]/10",
      desc: hasWheel ? "View & update your life assessment" : "Assess 8 areas of your life",
      completed: hasWheel,
      route: "wheel",
      stage: "Stage 1: Reflect",
    },
    {
      id: "values",
      title: "Values & Purpose",
      icon: Heart,
      gradient: "from-[#9B8AA6] to-[#8A7995]",
      lightBg: "from-[#9B8AA6]/10 to-[#8A7995]/10",
      desc: "Discover what matters most to you",
      completed: false,
      route: "values",
      stage: "Stage 2: Align",
    },
    {
      id: "goals",
      title: "SMART Goals",
      icon: Target,
      gradient: "from-[#4A7C7C] to-[#3A6C6C]",
      lightBg: "from-[#4A7C7C]/10 to-[#3A6C6C]/10",
      desc: hasGoals ? `${goals.length} goal${goals.length > 1 ? "s" : ""} set` : "Set meaningful, measurable goals",
      completed: hasGoals,
      route: "goals",
      stage: "Stage 3: Plan",
    },
    {
      id: "plan",
      title: "90-Day Plan",
      icon: Calendar,
      gradient: "from-[#6B8E8E] to-[#5A7D7D]",
      lightBg: "from-[#6B8E8E]/10 to-[#5A7D7D]/10",
      desc: "Break down your goals into action",
      completed: false,
      route: "plan",
      stage: "Stage 3: Plan",
    },
    {
      id: "habits",
      title: "Habit Tracker",
      icon: Flame,
      gradient: "from-[#D4A574] to-[#C49464]",
      lightBg: "from-[#D4A574]/10 to-[#C49464]/10",
      desc: hasHabits ? `${habits.length} habit${habits.length > 1 ? "s" : ""} tracking` : "Build daily habits that stick",
      completed: hasHabits,
      route: "habits",
      stage: "Stage 4: Practice",
    },
    {
      id: "checkin",
      title: "Check-ins",
      icon: CheckCircle2,
      gradient: "from-[#C17767] to-[#B16657]",
      lightBg: "from-[#C17767]/10 to-[#B16657]/10",
      desc: "Daily focus & weekly reviews",
      completed: false,
      route: "checkin",
      stage: "Stage 5: Review",
    },
  ];

  // Calculate overall progress based on tracked stages only
  // Only count stages we can actually verify completion for
  const trackedSteps = [
    { name: "Wheel of Life", completed: hasWheel, route: "wheel", icon: Target, gradient: "from-[#7C9A8E] to-[#6B8B7E]" },
    { name: "SMART Goals", completed: hasGoals, route: "goals", icon: Target, gradient: "from-[#4A7C7C] to-[#3A6C6C]" },
    { name: "Daily Habits", completed: hasHabits, route: "habits", icon: Flame, gradient: "from-[#D4A574] to-[#C49464]" },
  ];
  const completedSteps = trackedSteps.filter(s => s.completed).length;
  const totalTrackedSteps = trackedSteps.length;
  const progressPercent = Math.round((completedSteps / totalTrackedSteps) * 100);
  
  // Find the next uncompleted step
  const nextStep = trackedSteps.find(s => !s.completed);

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans">
      <Navbar />
      
      {/* Dashboard Hero */}
      <section className="relative pt-20 pb-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C9A8E]/10 via-[#FAF8F5] to-[#D4A574]/10" />
          <div className="absolute top-0 left-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-[#7C9A8E]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[150px] md:w-[300px] h-[150px] md:h-[300px] bg-[#D4A574]/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-lg mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div whileHover={{ scale: 1.02 }} className="inline-block mb-4">
              {session.mode === "faith" ? (
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4A574] to-[#C49464] text-white px-4 py-2 rounded-full shadow-md font-semibold text-sm">
                  <Heart className="w-4 h-4" /> Faith & Reflection Mode
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 bg-[#7C9A8E]/10 border border-[#7C9A8E]/30 text-[#7C9A8E] px-4 py-2 rounded-full font-semibold text-sm">
                  <Compass className="w-4 h-4" /> Classic Mode
                </span>
              )}
            </motion.div>
            <h1 className="text-2xl md:text-4xl font-display font-bold mb-2 text-[#2C3E2D]">
              {session.seasonLabel || "My Vision Journey"}
            </h1>
            <p className="text-[#6B7B6E] text-sm mb-1">
              {progressPercent === 0 
                ? "Let's get started - your journey begins now!"
                : progressPercent === 100 
                ? "Amazing! You've completed all core steps."
                : progressPercent >= 66 
                ? "You're making great progress - almost there!"
                : progressPercent >= 33 
                ? "Good momentum - keep building your vision!"
                : "Nice start - let's continue your journey."
              }
            </p>
            {session.themeWord && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-[#6B7B6E] text-sm">Theme Word:</span>
                <span className="px-3 py-1.5 bg-[#9B8AA6] text-white rounded-full font-bold text-sm shadow-sm">
                  {session.themeWord}
                </span>
              </div>
            )}
            
            {/* Progress Ring */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex justify-center mt-4"
            >
              <div className="w-28 h-28 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    fill="none"
                    stroke="#E8E4DE"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r="48"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 48}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - progressPercent / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7C9A8E" />
                      <stop offset="100%" stopColor="#4A7C7C" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#2C3E2D]">{progressPercent}%</span>
                  <span className="text-xs text-[#6B7B6E]">Complete</span>
                </div>
              </div>
            </motion.div>
            
            {/* Next Step CTA */}
            {nextStep && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4"
              >
                <Button
                  onClick={() => navigate(`/vision/${session.id}/${nextStep.route}`)}
                  className={`bg-gradient-to-r ${nextStep.gradient} hover:opacity-90 text-white font-semibold px-6 py-3 rounded-full shadow-md`}
                  data-testid="button-next-step-cta"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue: {nextStep.name}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Quick Stats Bar with Dynamic Widgets */}
      <section className="bg-white relative z-20 max-w-lg mx-4 md:mx-auto rounded-2xl shadow-lg border border-[#E8E4DE] p-4 mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.div 
            className="text-center p-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-center mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#4A7C7C]/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-[#4A7C7C]" />
              </div>
            </div>
            <div className="text-xl font-bold text-[#4A7C7C]">{goals?.length || 0}</div>
            <div className="text-[10px] text-[#6B7B6E] font-medium">Goals</div>
          </motion.div>
          
          <motion.div 
            className="text-center p-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-center mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#D4A574]/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-[#D4A574]" />
              </div>
            </div>
            <div className="text-xl font-bold text-[#D4A574]">{habits?.length || 0}</div>
            <div className="text-[10px] text-[#6B7B6E] font-medium">Habits</div>
          </motion.div>
          
          <motion.div 
            className="text-center p-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-center mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#7C9A8E]/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#7C9A8E]" />
              </div>
            </div>
            <div className="text-xl font-bold text-[#7C9A8E]">{progressPercent}%</div>
            <div className="text-[10px] text-[#6B7B6E] font-medium">Progress</div>
          </motion.div>
          
          <motion.div 
            className="text-center p-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-center mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#7C9A8E]/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#7C9A8E]" />
              </div>
            </div>
            <div className="text-xl font-bold text-[#7C9A8E]">{completedSteps}/{totalTrackedSteps}</div>
            <div className="text-[10px] text-[#6B7B6E] font-medium">Done</div>
          </motion.div>
        </div>
      </section>

      {/* Journey Progress Summary */}
      <section className="py-6 px-4 bg-[#FAF8F5]">
        <div className="max-w-lg mx-auto">
          <h3 className="text-base font-bold text-[#2C3E2D] mb-3">Journey Progress</h3>
          <div className="bg-white border border-[#E8E4DE] rounded-xl p-4">
            <div className="space-y-3">
              {trackedSteps.map((step, i) => (
                <div key={step.name} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-[#7C9A8E]' 
                      : 'bg-[#E8E4DE]'
                  }`}>
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs text-[#6B7B6E]">{i + 1}</span>
                    )}
                  </div>
                  <span className={`flex-1 text-sm ${step.completed ? 'text-[#2C3E2D] font-medium' : 'text-[#6B7B6E]'}`}>
                    {step.name}
                  </span>
                  <div className="w-20 h-1.5 bg-[#E8E4DE] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: step.completed ? '100%' : '0%' }}
                      transition={{ delay: i * 0.2, duration: 0.5 }}
                      className="h-full bg-[#7C9A8E] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[#E8E4DE] flex items-center justify-between">
              <span className="text-sm text-[#6B7B6E]">Overall Progress</span>
              <span className="text-base font-bold text-[#7C9A8E]">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Cards */}
      <section className="py-6 px-4 bg-[#FAF8F5]">
        <div className="max-w-lg mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4"
          >
            <h2 className="text-lg font-bold text-[#2C3E2D] mb-1">Your Vision Pathway</h2>
            <p className="text-sm text-[#6B7B6E]">Continue your journey through each stage</p>
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
                <div className={`bg-white rounded-xl overflow-hidden shadow-sm border border-[#E8E4DE] active:scale-[0.99] transition-transform ${
                  card.completed ? "border-l-4 border-l-[#7C9A8E]" : ""
                }`}>
                  <div className="p-4 flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-[#2C3E2D] text-sm">{card.title}</h3>
                        {card.completed && (
                          <CheckCircle2 className="w-4 h-4 text-[#7C9A8E]" />
                        )}
                      </div>
                      <p className="text-xs text-[#6B7B6E] truncate">{card.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#C4BFB8]" />
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
