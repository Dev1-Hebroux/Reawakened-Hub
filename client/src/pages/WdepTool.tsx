import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft, ChevronRight, Target, Eye, Activity,
  Scale, Map, Rocket, CheckCircle2, Calendar,
  Lightbulb, ArrowRight, BookOpen, Clock, Star, Zap, Compass
} from "lucide-react";
import { AICoachPanel } from "@/components/AICoachPanel";
import { getApiUrl } from "@/lib/api";

const STEPS = [
  { key: "intro", label: "Introduction", icon: Compass, color: "from-[#7C9A8E] to-[#6B8B7E]" },
  { key: "wants", label: "Wants", icon: Target, color: "from-[#4A7C7C] to-[#3A6C6C]" },
  { key: "doing", label: "Doing", icon: Activity, color: "from-[#D4A574] to-[#C49464]" },
  { key: "evaluation", label: "Evaluation", icon: Scale, color: "from-[#7C9A8E] to-[#6B8B7E]" },
  { key: "plan", label: "Plan", icon: Map, color: "from-[#4A7C7C] to-[#3A6C6C]" },
];

interface WdepData {
  wants: {
    deepWant: string;
    surface_wants: string[];
    qualityWorld: string;
  };
  doing: {
    currentActions: string[];
    totalBehavior: {
      acting: string;
      thinking: string;
      feeling: string;
      physiology: string;
    };
  };
  evaluation: {
    gettingCloser: number;
    helpfulness: number;
    barriers: string[];
    insights: string;
  };
  plan: {
    commitments: string[];
    startNowAction: string;
    timeline: string;
    accountability: string;
  };
}

export function WdepTool() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [wdepEntryId, setWdepEntryId] = useState<number | null>(null);
  const [data, setData] = useState<WdepData>({
    wants: { deepWant: "", surface_wants: [], qualityWorld: "" },
    doing: { currentActions: [], totalBehavior: { acting: "", thinking: "", feeling: "", physiology: "" } },
    evaluation: { gettingCloser: 5, helpfulness: 5, barriers: [], insights: "" },
    plan: { commitments: [], startNowAction: "", timeline: "", accountability: "" },
  });
  const [inputValue, setInputValue] = useState("");

  const { data: session } = useQuery({
    queryKey: ["/api/vision/sessions/current"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/vision/sessions/current"), { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const createEntry = useMutation({
    mutationFn: async () => {
      const res = await fetch(getApiUrl(`/api/vision/sessions/${sessionId}/wdep`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: "New WDEP Session" }),
      });
      if (!res.ok) throw new Error("Failed to create WDEP entry");
      return res.json();
    },
    onSuccess: (result) => {
      setWdepEntryId(result.data.id);
    },
  });

  const saveWants = useMutation({
    mutationFn: async () => {
      if (!wdepEntryId) return;
      const res = await fetch(getApiUrl(`/api/wdep/${wdepEntryId}/wants`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data.wants),
      });
      if (!res.ok) throw new Error("Failed to save wants");
      return res.json();
    },
  });

  const saveDoing = useMutation({
    mutationFn: async () => {
      if (!wdepEntryId) return;
      const res = await fetch(getApiUrl(`/api/wdep/${wdepEntryId}/doing`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data.doing),
      });
      if (!res.ok) throw new Error("Failed to save doing");
      return res.json();
    },
  });

  const saveEvaluation = useMutation({
    mutationFn: async () => {
      if (!wdepEntryId) return;
      const res = await fetch(getApiUrl(`/api/wdep/${wdepEntryId}/evaluation`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data.evaluation),
      });
      if (!res.ok) throw new Error("Failed to save evaluation");
      return res.json();
    },
  });

  const savePlan = useMutation({
    mutationFn: async () => {
      if (!wdepEntryId) return;
      const res = await fetch(getApiUrl(`/api/wdep/${wdepEntryId}/plan`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data.plan),
      });
      if (!res.ok) throw new Error("Failed to save plan");
      return res.json();
    },
    onSuccess: () => {
      navigate(`/vision/${sessionId}/wdep/${wdepEntryId}/experiment`);
    },
  });

  const progress = (currentStep / (STEPS.length - 1)) * 100;
  const currentStepData = STEPS[currentStep];

  const handleNext = async () => {
    if (currentStep === 0 && !wdepEntryId) {
      await createEntry.mutateAsync();
    } else if (currentStep === 1) {
      await saveWants.mutateAsync();
    } else if (currentStep === 2) {
      await saveDoing.mutateAsync();
    } else if (currentStep === 3) {
      await saveEvaluation.mutateAsync();
    } else if (currentStep === 4) {
      await savePlan.mutateAsync();
      return;
    }
    setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1));
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate(`/growth`);
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const addToList = (key: string, listKey: string) => {
    if (!inputValue.trim()) return;
    setData(prev => ({
      ...prev,
      [key]: {
        ...prev[key as keyof WdepData],
        [listKey]: [...(prev[key as keyof WdepData] as any)[listKey], inputValue.trim()],
      },
    }));
    setInputValue("");
  };

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Target className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-[#2C3E2D] mb-3">WDEP Goal Clarity</h1>
      <p className="text-[#6B7B6E] mb-6 text-lg">
        Get unstuck using Reality Therapy principles
      </p>

      <Card className="bg-white border-[#E8E4DE] text-left mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold text-[#2C3E2D] mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#D4A574]" />
            What is WDEP?
          </h3>
          <div className="space-y-3">
            {[
              { letter: "W", word: "Wants", desc: "What do you really want?" },
              { letter: "D", word: "Doing", desc: "What are you currently doing?" },
              { letter: "E", word: "Evaluation", desc: "Is it working?" },
              { letter: "P", word: "Plan", desc: "What will you do differently?" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{item.letter}</span>
                </div>
                <div>
                  <span className="font-medium text-[#2C3E2D]">{item.word}</span>
                  <p className="text-sm text-[#6B7B6E]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="bg-[#4A7C7C]/10 rounded-2xl p-4 border border-[#4A7C7C]/20 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-[#4A7C7C]" />
          <span className="text-sm font-medium text-[#4A7C7C]">About 15-20 minutes</span>
        </div>
        <p className="text-sm text-[#6B7B6E]">
          Take your time. Honest reflection leads to real change.
        </p>
      </div>
    </motion.div>
  );

  const renderWants = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4A7C7C] to-[#3A6C6C] flex items-center justify-center mx-auto mb-4">
          <Target className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-[#2C3E2D]">What Do You Want?</h2>
        <p className="text-[#6B7B6E] mt-2">Go beyond the surface. What do you really want?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#2C3E2D] mb-2">
            Your Deep Want
          </label>
          <Textarea
            value={data.wants.deepWant}
            onChange={(e) => setData(prev => ({
              ...prev,
              wants: { ...prev.wants, deepWant: e.target.value }
            }))}
            placeholder="What do you truly desire in your heart? Not the surface goal, but the deeper longing..."
            className="min-h-[100px] bg-white border-[#E8E4DE] rounded-xl"
            data-testid="input-deep-want"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C3E2D] mb-2">
            Quality World Vision
          </label>
          <Textarea
            value={data.wants.qualityWorld}
            onChange={(e) => setData(prev => ({
              ...prev,
              wants: { ...prev.wants, qualityWorld: e.target.value }
            }))}
            placeholder="Imagine your ideal life where this want is fulfilled. What does it look like?"
            className="min-h-[80px] bg-white border-[#E8E4DE] rounded-xl"
            data-testid="input-quality-world"
          />
        </div>
      </div>

      {session?.mode === "faith" && (
        <div className="bg-[#D4A574]/10 rounded-xl p-4 border border-[#D4A574]/20">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-[#D4A574]" />
            <span className="text-sm font-medium text-[#D4A574]">Biblical Reflection</span>
          </div>
          <p className="text-sm text-[#6B7B6E] italic">
            "Delight yourself in the Lord, and he will give you the desires of your heart." - Psalm 37:4
          </p>
        </div>
      )}
    </motion.div>
  );

  const renderDoing = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#C49464] flex items-center justify-center mx-auto mb-4">
          <Activity className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-[#2C3E2D]">What Are You Doing?</h2>
        <p className="text-[#6B7B6E] mt-2">Examine your current actions and behaviors</p>
      </div>

      <Card className="bg-white border-[#E8E4DE]">
        <CardContent className="p-4">
          <h3 className="font-semibold text-[#2C3E2D] mb-3">Total Behavior (TFAP)</h3>
          <p className="text-sm text-[#6B7B6E] mb-4">All behavior has four components:</p>

          <div className="space-y-3">
            {[
              { key: "thinking", label: "Thinking", placeholder: "What thoughts occupy your mind?" },
              { key: "feeling", label: "Feeling", placeholder: "What emotions come up?" },
              { key: "acting", label: "Acting", placeholder: "What actions are you taking?" },
              { key: "physiology", label: "Physiology", placeholder: "How does your body feel?" },
            ].map((item) => (
              <div key={item.key}>
                <label className="block text-xs font-medium text-[#6B7B6E] mb-1">{item.label}</label>
                <Textarea
                  value={data.doing.totalBehavior[item.key as keyof typeof data.doing.totalBehavior]}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    doing: {
                      ...prev.doing,
                      totalBehavior: { ...prev.doing.totalBehavior, [item.key]: e.target.value }
                    }
                  }))}
                  placeholder={item.placeholder}
                  className="min-h-[60px] bg-[#FAF8F5] border-[#E8E4DE] rounded-lg text-sm"
                  data-testid={`input-${item.key}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderEvaluation = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center mx-auto mb-4">
          <Scale className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-[#2C3E2D]">Self-Evaluation</h2>
        <p className="text-[#6B7B6E] mt-2">Is what you're doing getting you what you want?</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl p-5 border border-[#E8E4DE]">
          <label className="block text-sm font-medium text-[#2C3E2D] mb-4">
            How close is your current behavior getting you to your want?
          </label>
          <div className="text-center mb-4">
            <span className="text-4xl font-bold text-[#7C9A8E]">{data.evaluation.gettingCloser}</span>
            <span className="text-[#6B7B6E]">/10</span>
          </div>
          <Slider
            value={[data.evaluation.gettingCloser]}
            min={1}
            max={10}
            step={1}
            onValueChange={([v]) => setData(prev => ({
              ...prev,
              evaluation: { ...prev.evaluation, gettingCloser: v }
            }))}
            className="touch-manipulation"
          />
          <div className="flex justify-between text-xs text-[#8B9B8E] mt-2">
            <span>Not at all</span>
            <span>Very close</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E8E4DE]">
          <label className="block text-sm font-medium text-[#2C3E2D] mb-4">
            How helpful are your current actions?
          </label>
          <div className="text-center mb-4">
            <span className="text-4xl font-bold text-[#4A7C7C]">{data.evaluation.helpfulness}</span>
            <span className="text-[#6B7B6E]">/10</span>
          </div>
          <Slider
            value={[data.evaluation.helpfulness]}
            min={1}
            max={10}
            step={1}
            onValueChange={([v]) => setData(prev => ({
              ...prev,
              evaluation: { ...prev.evaluation, helpfulness: v }
            }))}
            className="touch-manipulation"
          />
          <div className="flex justify-between text-xs text-[#8B9B8E] mt-2">
            <span>Not helpful</span>
            <span>Very helpful</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C3E2D] mb-2">
            Key Insights
          </label>
          <Textarea
            value={data.evaluation.insights}
            onChange={(e) => setData(prev => ({
              ...prev,
              evaluation: { ...prev.evaluation, insights: e.target.value }
            }))}
            placeholder="What did you realize through this evaluation?"
            className="min-h-[80px] bg-white border-[#E8E4DE] rounded-xl"
            data-testid="input-insights"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderPlan = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4A7C7C] to-[#3A6C6C] flex items-center justify-center mx-auto mb-4">
          <Map className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-[#2C3E2D]">Make a Plan</h2>
        <p className="text-[#6B7B6E] mt-2">What will you do differently?</p>
      </div>

      <Card className="bg-gradient-to-br from-[#D4A574]/20 to-[#D4A574]/10 border-[#D4A574]/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-[#D4A574]" />
            <h3 className="font-semibold text-[#2C3E2D]">Start Now Action</h3>
          </div>
          <p className="text-sm text-[#6B7B6E] mb-3">
            What's ONE small thing you can do in the next 10 minutes?
          </p>
          <Textarea
            value={data.plan.startNowAction}
            onChange={(e) => setData(prev => ({
              ...prev,
              plan: { ...prev.plan, startNowAction: e.target.value }
            }))}
            placeholder="e.g., Send that message, write 3 sentences, do 5 pushups..."
            className="min-h-[60px] bg-white border-[#D4A574]/30 rounded-xl"
            data-testid="input-start-now"
          />
        </CardContent>
      </Card>

      <div>
        <label className="block text-sm font-medium text-[#2C3E2D] mb-2">
          Timeline
        </label>
        <Textarea
          value={data.plan.timeline}
          onChange={(e) => setData(prev => ({
            ...prev,
            plan: { ...prev.plan, timeline: e.target.value }
          }))}
          placeholder="When will you take these actions? Be specific."
          className="min-h-[60px] bg-white border-[#E8E4DE] rounded-xl"
          data-testid="input-timeline"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2C3E2D] mb-2">
          Accountability
        </label>
        <Textarea
          value={data.plan.accountability}
          onChange={(e) => setData(prev => ({
            ...prev,
            plan: { ...prev.plan, accountability: e.target.value }
          }))}
          placeholder="Who will help keep you on track? How will you check in?"
          className="min-h-[60px] bg-white border-[#E8E4DE] rounded-xl"
          data-testid="input-accountability"
        />
      </div>

      <div className="flex justify-center mb-6">
        <AICoachPanel
          sessionId={sessionId!}
          tool="wdep"
          data={{
            want: data.wants.deepWant,
            doing: [
              data.doing.totalBehavior.acting,
              data.doing.totalBehavior.thinking,
              data.doing.totalBehavior.feeling,
              data.doing.totalBehavior.physiology,
            ].filter(Boolean).join(". "),
            evaluate: `Getting closer: ${data.evaluation.gettingCloser}/10. Helpfulness: ${data.evaluation.helpfulness}/10. Insights: ${data.evaluation.insights}`,
            plan: `Start now: ${data.plan.startNowAction}. Timeline: ${data.plan.timeline}. Accountability: ${data.plan.accountability}`,
            experiment: data.plan.startNowAction,
          }}
          title="Reality Check Insights"
          description="AI coaching for your plan"
        />
      </div>

      <div className="bg-[#7C9A8E]/10 rounded-xl p-4 border border-[#7C9A8E]/20">
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="w-5 h-5 text-[#7C9A8E]" />
          <span className="font-medium text-[#2C3E2D]">7-Day Experiment</span>
        </div>
        <p className="text-sm text-[#6B7B6E]">
          After completing your plan, you'll be invited to run a 7-day experiment to test your new approach.
        </p>
      </div>
    </motion.div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderIntro();
      case 1: return renderWants();
      case 2: return renderDoing();
      case 3: return renderEvaluation();
      case 4: return renderPlan();
      default: return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return data.wants.deepWant.trim().length > 0;
    if (currentStep === 2) return data.doing.totalBehavior.acting.trim().length > 0;
    if (currentStep === 3) return true;
    if (currentStep === 4) return data.plan.startNowAction.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans">
      <div className="sticky top-0 z-10 bg-[#FAF8F5] border-b border-[#E8E4DE] px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-[#6B7B6E] hover:text-[#2C3E2D] transition-colors"
              data-testid="button-back"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>
            <span className="text-sm text-[#8B9B8E]">
              {currentStepData.label}
            </span>
          </div>
          <Progress value={progress} className="h-2" />

          <div className="flex justify-between mt-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === currentStep;
              const isComplete = i < currentStep;
              return (
                <div
                  key={step.key}
                  className={`flex flex-col items-center ${isActive ? "opacity-100" : isComplete ? "opacity-60" : "opacity-30"
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isComplete ? "bg-[#7C9A8E]" : isActive ? `bg-gradient-to-br ${step.color}` : "bg-[#E8E4DE]"
                    }`}>
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#8B9B8E]"}`} />
                    )}
                  </div>
                  <span className="text-xs mt-1 text-[#6B7B6E] hidden sm:block">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main className="pt-6 pb-32 px-4">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#FAF8F5] border-t border-[#E8E4DE] p-4 pb-8">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleNext}
            disabled={!canProceed() || createEntry.isPending || saveWants.isPending || saveDoing.isPending || saveEvaluation.isPending || savePlan.isPending}
            className={`w-full bg-gradient-to-r ${currentStepData.color} hover:opacity-90 text-white py-4 rounded-full text-lg font-medium disabled:opacity-50`}
            data-testid="button-next"
          >
            {currentStep === 4 ? (
              <>Complete & Start Experiment <Rocket className="w-5 h-5 ml-2" /></>
            ) : (
              <>Continue <ChevronRight className="w-5 h-5 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}