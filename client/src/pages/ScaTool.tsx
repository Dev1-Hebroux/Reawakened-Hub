import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft, ChevronRight, Zap, CheckCircle2,
  ArrowRight, BookOpen, Lightbulb, Target, Star, Plus, X,
  Flame, TrendingUp, Clock, Activity, GripVertical
} from "lucide-react";
import { AICoachPanel } from "@/components/AICoachPanel";
import { getApiUrl } from "@/lib/api";

interface FocusItem {
  id: string;
  title: string;
  startMotivation: number;
  currentMotivation?: number;
  isComplete: boolean;
}

const ACTIVITY_CATEGORIES = [
  { key: "career", label: "Career & Work", examples: ["Apply for promotion", "Complete certification", "Network with peers"] },
  { key: "health", label: "Health & Fitness", examples: ["Start morning runs", "Improve sleep habits", "Join a gym"] },
  { key: "relationships", label: "Relationships", examples: ["Weekly date nights", "Call parents more", "Make new friends"] },
  { key: "learning", label: "Learning & Growth", examples: ["Read 12 books", "Learn a language", "Take a course"] },
  { key: "spiritual", label: "Spiritual & Faith", examples: ["Daily devotions", "Join small group", "Serve at church"] },
  { key: "creative", label: "Creative & Fun", examples: ["Start a hobby", "Play music", "Travel somewhere new"] },
];

export function ScaTool() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"intro" | "brainstorm" | "select" | "rate" | "results">("intro");
  const [activities, setActivities] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [focusItems, setFocusItems] = useState<FocusItem[]>([]);
  const [currentRating, setCurrentRating] = useState(0);

  const { data: session } = useQuery({
    queryKey: ["/api/vision/sessions/current"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/vision/sessions/current"), { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const saveExercise = useMutation({
    mutationFn: async () => {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      const result = await apiFetchJson(`/api/vision/sessions/${sessionId}/sca`, {
        method: "POST",
        body: JSON.stringify({
          title: "Focus List",
          focusItemCount: focusItems.length,
        }),
      });

      for (const item of focusItems) {
        await apiFetchJson(`/api/sca/${result.data.id}/focus-items`, {
          method: "POST",
          body: JSON.stringify({
            title: item.title,
            itemIndex: focusItems.indexOf(item),
            startMotivation: item.startMotivation,
          }),
        });
      }

      return result;
    },
    onSuccess: () => {
      setStep("results");
    },
  });

  const addActivity = () => {
    if (inputValue.trim() && activities.length < 20) {
      setActivities(prev => [...prev, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeActivity = (index: number) => {
    setActivities(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFocusItem = (activity: string) => {
    setFocusItems(prev => {
      const exists = prev.find(f => f.title === activity);
      if (exists) {
        return prev.filter(f => f.title !== activity);
      } else if (prev.length < 10) {
        return [...prev, {
          id: crypto.randomUUID(),
          title: activity,
          startMotivation: 5,
          isComplete: false
        }];
      }
      return prev;
    });
  };

  const updateMotivation = (id: string, value: number) => {
    setFocusItems(prev =>
      prev.map(f => f.id === id ? { ...f, startMotivation: value } : f)
    );
  };

  const handleNext = () => {
    if (step === "brainstorm" && activities.length >= 5) {
      setStep("select");
    } else if (step === "select" && focusItems.length >= 3) {
      setCurrentRating(0);
      setStep("rate");
    } else if (step === "rate") {
      if (currentRating + 1 < focusItems.length) {
        setCurrentRating(prev => prev + 1);
      } else {
        saveExercise.mutate();
      }
    }
  };

  const handleBack = () => {
    if (step === "intro") {
      navigate(`/growth`);
    } else if (step === "brainstorm") {
      setStep("intro");
    } else if (step === "select") {
      setStep("brainstorm");
    } else if (step === "rate") {
      if (currentRating > 0) {
        setCurrentRating(prev => prev - 1);
      } else {
        setStep("select");
      }
    }
  };

  const progress = step === "rate"
    ? ((currentRating + 1) / focusItems.length) * 100
    : step === "brainstorm" ? 33
      : step === "select" ? 66
        : 100;

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center px-4 pt-20"
    >
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D4A574] to-[#C49464] flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Zap className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-[#2C3E2D] mb-3">Self-Concordant Action</h1>
      <p className="text-[#6B7B6E] mb-6 text-lg">
        Build a focus list that energizes you
      </p>

      <Card className="bg-white border-[#E8E4DE] text-left mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold text-[#2C3E2D] mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#D4A574]" />
            What is Self-Concordance?
          </h3>
          <p className="text-sm text-[#6B7B6E] mb-4">
            Self-concordant goals align with your true interests and values. When you pursue them,
            motivation stays high from start to finish - unlike goals you "should" do.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-[#7C9A8E]">
              <CheckCircle2 className="w-4 h-4" />
              <span>More intrinsic motivation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#7C9A8E]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Higher completion rates</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#7C9A8E]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Greater well-being</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 justify-center text-xs text-[#8B9B8E] mb-6">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          ~10 minutes
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          Build 10-item list
        </span>
      </div>

      {session?.mode === "faith" && (
        <div className="bg-[#D4A574]/10 rounded-xl p-4 border border-[#D4A574]/20 text-left mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-[#D4A574]" />
            <span className="text-sm font-medium text-[#D4A574]">Faith Perspective</span>
          </div>
          <p className="text-sm text-[#6B7B6E] italic">
            "For it is God who works in you to will and to act in order to fulfill his good purpose" - Philippians 2:13
          </p>
        </div>
      )}

      <Button
        onClick={() => setStep("brainstorm")}
        className="w-full bg-gradient-to-r from-[#D4A574] to-[#C49464] hover:opacity-90 text-white py-4 rounded-full text-lg font-medium"
        data-testid="button-start"
      >
        Start Building <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );

  const renderBrainstorm = () => (
    <div className="min-h-screen bg-[#FAF8F5]">
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
            <span className="text-sm text-[#8B9B8E]">Step 1: Brainstorm</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-[#2C3E2D] mb-2 text-center">
            What activities energize you?
          </h2>
          <p className="text-[#6B7B6E] text-center mb-6">
            List at least 10 things you want to do (not things you "should" do)
          </p>

          <div className="flex gap-2 mb-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addActivity()}
              placeholder="Type an activity and press Enter..."
              className="flex-1 bg-white border-[#E8E4DE] rounded-xl"
              data-testid="input-activity"
            />
            <Button
              onClick={addActivity}
              disabled={!inputValue.trim() || activities.length >= 20}
              className="bg-[#D4A574] hover:bg-[#C49464] text-white rounded-xl px-4"
              data-testid="button-add"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <div className="mb-4">
            <span className={`text-sm font-medium ${activities.length >= 10 ? "text-[#7C9A8E]" : "text-[#D4A574]"}`}>
              {activities.length}/10 minimum ({20 - activities.length} more allowed)
            </span>
          </div>

          {activities.length > 0 && (
            <div className="space-y-2 mb-6">
              {activities.map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#E8E4DE]"
                >
                  <span className="flex-1 text-[#2C3E2D]">{activity}</span>
                  <button
                    onClick={() => removeActivity(i)}
                    className="text-[#8B9B8E] hover:text-[#C17767]"
                    data-testid={`remove-${i}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          <Card className="bg-[#7C9A8E]/10 border-none">
            <CardContent className="p-4">
              <h4 className="font-medium text-[#2C3E2D] mb-3 text-sm">Need inspiration?</h4>
              <div className="grid grid-cols-2 gap-2">
                {ACTIVITY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setInputValue(cat.examples[Math.floor(Math.random() * cat.examples.length)])}
                    className="text-left p-2 bg-white rounded-lg text-xs text-[#6B7B6E] hover:bg-[#7C9A8E]/20 transition-colors"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#FAF8F5] border-t border-[#E8E4DE] p-4 pb-8">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleNext}
            disabled={activities.length < 5}
            className="w-full bg-gradient-to-r from-[#D4A574] to-[#C49464] hover:opacity-90 text-white py-4 rounded-full text-lg font-medium disabled:opacity-50"
            data-testid="button-next"
          >
            Select Top 10 <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSelect = () => (
    <div className="min-h-screen bg-[#FAF8F5]">
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
            <span className="text-sm text-[#8B9B8E]">Step 2: Select</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-[#2C3E2D] mb-2 text-center">
            Choose your Focus List
          </h2>
          <p className="text-[#6B7B6E] text-center mb-6">
            Select 3-10 activities for your personal Focus List
          </p>

          <div className="mb-4 text-center">
            <span className={`text-sm font-medium ${focusItems.length >= 3 ? "text-[#7C9A8E]" : "text-[#D4A574]"}`}>
              {focusItems.length}/10 selected (min 3)
            </span>
          </div>

          <div className="space-y-2 mb-6">
            {activities.map((activity, i) => {
              const isSelected = focusItems.some(f => f.title === activity);

              return (
                <button
                  key={i}
                  onClick={() => toggleFocusItem(activity)}
                  disabled={!isSelected && focusItems.length >= 10}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all touch-manipulation ${isSelected
                    ? "border-[#7C9A8E] bg-[#7C9A8E]/10"
                    : focusItems.length >= 10
                      ? "border-[#E8E4DE] bg-white opacity-50"
                      : "border-[#E8E4DE] bg-white hover:border-[#7C9A8E]/50"
                    }`}
                  data-testid={`select-${i}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-[#7C9A8E] bg-[#7C9A8E]" : "border-[#D4D0C8]"
                      }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className="font-medium text-[#2C3E2D]">{activity}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#FAF8F5] border-t border-[#E8E4DE] p-4 pb-8">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleNext}
            disabled={focusItems.length < 3}
            className="w-full bg-gradient-to-r from-[#7C9A8E] to-[#6B8B7E] hover:opacity-90 text-white py-4 rounded-full text-lg font-medium disabled:opacity-50"
            data-testid="button-next"
          >
            Rate Motivation <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderRate = () => {
    const currentItem = focusItems[currentRating];

    return (
      <div className="min-h-screen bg-[#FAF8F5]">
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
                {currentRating + 1}/{focusItems.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-8 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#C49464] flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#2C3E2D] leading-relaxed mb-2">
                  {currentItem.title}
                </h2>
                <p className="text-[#6B7B6E]">How motivated are you to do this?</p>
              </div>

              <Card className="bg-white border-[#E8E4DE]">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <span className="text-5xl font-bold text-[#D4A574]">
                      {currentItem.startMotivation}
                    </span>
                    <span className="text-[#6B7B6E]">/10</span>
                  </div>
                  <Slider
                    value={[currentItem.startMotivation]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={([v]) => updateMotivation(currentItem.id, v)}
                    className="touch-manipulation"
                  />
                  <div className="flex justify-between text-xs text-[#8B9B8E] mt-3">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#7C9A8E]/10 border-none">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-[#7C9A8E]">
                    <TrendingUp className="w-4 h-4" />
                    <span>We'll track how this changes over time</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-[#FAF8F5] border-t border-[#E8E4DE] p-4 pb-8">
          <div className="max-w-lg mx-auto">
            <Button
              onClick={handleNext}
              disabled={saveExercise.isPending}
              className="w-full bg-gradient-to-r from-[#D4A574] to-[#C49464] hover:opacity-90 text-white py-4 rounded-full text-lg font-medium disabled:opacity-50"
              data-testid="button-next"
            >
              {currentRating + 1 >= focusItems.length ? (
                <>Complete <Star className="w-5 h-5 ml-2" /></>
              ) : (
                <>Next <ChevronRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    const avgMotivation = focusItems.reduce((sum, f) => sum + f.startMotivation, 0) / focusItems.length;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-4 pt-20 pb-32"
      >
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#2C3E2D] mb-2">Your Focus List is Ready!</h1>
            <p className="text-[#6B7B6E]">{focusItems.length} items with avg {avgMotivation.toFixed(1)} motivation</p>
          </div>

          <div className="space-y-3 mb-8">
            {focusItems.sort((a, b) => b.startMotivation - a.startMotivation).map((item, i) => (
              <Card key={item.id} className="bg-white border-[#E8E4DE]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#C49464] flex items-center justify-center text-white font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#2C3E2D]">{item.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-[#6B7B6E]">
                        <Flame className="w-3 h-3 text-[#D4A574]" />
                        <span>Motivation: {item.startMotivation}/10</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mb-6">
            <AICoachPanel
              sessionId={sessionId!}
              tool="sca"
              data={{
                activity: focusItems[0]?.title || "Focus List",
                focusList: focusItems.map(f => ({
                  reason: f.title,
                  rating: f.startMotivation,
                })),
                baselineMotivation: 5,
                finalMotivation: Math.max(...focusItems.map(f => f.startMotivation)),
              }}
              title="Motivation Insights"
              description="Deepen your intrinsic drive"
            />
          </div>

          <Button
            onClick={() => navigate(`/vision/${sessionId}/growth`)}
            className="w-full bg-gradient-to-r from-[#7C9A8E] to-[#6B8B7E] text-white py-4 rounded-full text-lg font-medium"
            data-testid="button-done"
          >
            Back to Growth Hub <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans">
      {step === "intro" && renderIntro()}
      {step === "brainstorm" && renderBrainstorm()}
      {step === "select" && renderSelect()}
      {step === "rate" && renderRate()}
      {step === "results" && renderResults()}
    </div>
  );
}