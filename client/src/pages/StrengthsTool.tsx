import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft, ChevronRight, Star, CheckCircle2, Sparkles,
  ArrowRight, BookOpen, Lightbulb, Crown, Award, Medal,
  Heart, Shield, Users, Brain, Zap, Eye, Target, Compass,
  Flame, Palette, Smile, ThumbsUp, Scale, Clock, Leaf
} from "lucide-react";
import { AICoachPanel } from "@/components/AICoachPanel";

const CHARACTER_STRENGTHS = [
  { key: "creativity", name: "Creativity", icon: Palette, category: "Wisdom", desc: "Thinking of novel ways to do things" },
  { key: "curiosity", name: "Curiosity", icon: Eye, category: "Wisdom", desc: "Taking interest in all ongoing experience" },
  { key: "judgment", name: "Judgment", icon: Scale, category: "Wisdom", desc: "Thinking things through; examining all sides" },
  { key: "love_of_learning", name: "Love of Learning", icon: BookOpen, category: "Wisdom", desc: "Mastering new skills and knowledge" },
  { key: "perspective", name: "Perspective", icon: Compass, category: "Wisdom", desc: "Being able to provide wise counsel" },
  { key: "bravery", name: "Bravery", icon: Shield, category: "Courage", desc: "Not shrinking from challenge or difficulty" },
  { key: "perseverance", name: "Perseverance", icon: Target, category: "Courage", desc: "Finishing what you start" },
  { key: "honesty", name: "Honesty", icon: Heart, category: "Courage", desc: "Speaking truth; being authentic" },
  { key: "zest", name: "Zest", icon: Zap, category: "Courage", desc: "Approaching life with energy and excitement" },
  { key: "love", name: "Love", icon: Heart, category: "Humanity", desc: "Valuing close relations with others" },
  { key: "kindness", name: "Kindness", icon: Smile, category: "Humanity", desc: "Doing favors and good deeds for others" },
  { key: "social_intelligence", name: "Social Intelligence", icon: Users, category: "Humanity", desc: "Being aware of others' motivations and feelings" },
  { key: "teamwork", name: "Teamwork", icon: Users, category: "Justice", desc: "Working well as a member of a group" },
  { key: "fairness", name: "Fairness", icon: Scale, category: "Justice", desc: "Treating all people the same" },
  { key: "leadership", name: "Leadership", icon: Crown, category: "Justice", desc: "Organizing and encouraging group activities" },
  { key: "forgiveness", name: "Forgiveness", icon: Leaf, category: "Temperance", desc: "Letting go of hurt caused by others" },
  { key: "humility", name: "Humility", icon: ThumbsUp, category: "Temperance", desc: "Letting accomplishments speak for themselves" },
  { key: "prudence", name: "Prudence", icon: Clock, category: "Temperance", desc: "Being careful about your choices" },
  { key: "self_regulation", name: "Self-Regulation", icon: Target, category: "Temperance", desc: "Regulating what you feel and do" },
  { key: "appreciation_beauty", name: "Appreciation of Beauty", icon: Palette, category: "Transcendence", desc: "Noticing beauty and excellence" },
  { key: "gratitude", name: "Gratitude", icon: Star, category: "Transcendence", desc: "Being thankful for good things" },
  { key: "hope", name: "Hope", icon: Flame, category: "Transcendence", desc: "Expecting the best and working to achieve it" },
  { key: "humor", name: "Humor", icon: Smile, category: "Transcendence", desc: "Liking to laugh and bring smiles to others" },
  { key: "spirituality", name: "Spirituality", icon: Sparkles, category: "Transcendence", desc: "Having beliefs about higher purpose and meaning" },
];

const CATEGORIES = ["Wisdom", "Courage", "Humanity", "Justice", "Temperance", "Transcendence"];

interface StrengthRating {
  key: string;
  rating: number;
  isTopStrength: boolean;
}

export function StrengthsTool() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"intro" | "rating" | "top5" | "results">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<Map<string, number>>(new Map());
  const [top5, setTop5] = useState<string[]>([]);

  const { data: session } = useQuery({
    queryKey: ["/api/vision/sessions/current"],
    queryFn: async () => {
      const res = await fetch("/api/vision/sessions/current", { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const saveStrengths = useMutation({
    mutationFn: async () => {
      const strengths = top5.map((key, i) => ({
        strengthKey: key,
        rank: i + 1,
        selfRating: ratings.get(key) || 5,
        isSignature: i < 5,
      }));
      const res = await fetch(`/api/vision/sessions/${sessionId}/strengths`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ strengths }),
      });
      if (!res.ok) throw new Error("Failed to save strengths");
      return res.json();
    },
    onSuccess: () => {
      setStep("results");
    },
  });

  const currentStrength = CHARACTER_STRENGTHS[currentIndex];
  const progress = (currentIndex / CHARACTER_STRENGTHS.length) * 100;

  const handleRate = (rating: number) => {
    setRatings(prev => {
      const next = new Map(prev);
      next.set(currentStrength.key, rating);
      return next;
    });
  };

  const handleNext = () => {
    // Ensure current strength has a rating saved (default to 5 if not set)
    if (!ratings.has(currentStrength.key)) {
      setRatings(prev => {
        const next = new Map(prev);
        next.set(currentStrength.key, 5);
        return next;
      });
    }
    
    if (currentIndex + 1 >= CHARACTER_STRENGTHS.length) {
      // Ensure all strengths have ratings before sorting
      const finalRatings = new Map(ratings);
      if (!finalRatings.has(currentStrength.key)) {
        finalRatings.set(currentStrength.key, 5);
      }
      // If some strengths weren't rated, give them a default rating of 5
      CHARACTER_STRENGTHS.forEach(s => {
        if (!finalRatings.has(s.key)) {
          finalRatings.set(s.key, 5);
        }
      });
      
      const sorted = Array.from(finalRatings.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([key]) => key);
      setTop5(sorted.slice(0, 5));
      setRatings(finalRatings);
      setStep("top5");
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step === "intro") {
      navigate(`/growth`);
    } else if (step === "rating" && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (step === "rating") {
      setStep("intro");
    } else if (step === "top5") {
      setStep("rating");
      setCurrentIndex(CHARACTER_STRENGTHS.length - 1);
    }
  };

  const toggleTop5 = (key: string) => {
    setTop5(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else if (prev.length < 5) {
        return [...prev, key];
      }
      return prev;
    });
  };

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center px-4"
    >
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D4A574] to-[#C49464] flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Star className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-[#2C3E2D] mb-3">Strengths Discovery</h1>
      <p className="text-[#6B7B6E] mb-6 text-lg">
        Discover your unique character strengths
      </p>

      <Card className="bg-white border-[#E8E4DE] text-left mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold text-[#2C3E2D] mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#D4A574]" />
            About This Tool
          </h3>
          <p className="text-sm text-[#6B7B6E] mb-4">
            Based on the VIA Character Strengths framework, this tool helps you identify
            your signature strengths - the core qualities that define who you are at your best.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#8B9B8E]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ~10 minutes
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              24 strengths
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {CATEGORIES.map((cat, i) => (
          <div key={cat} className="bg-[#7C9A8E]/10 rounded-xl p-3 text-center">
            <span className="text-xs font-medium text-[#7C9A8E]">{cat}</span>
          </div>
        ))}
      </div>

      {session?.mode === "faith" && (
        <div className="bg-[#D4A574]/10 rounded-xl p-4 border border-[#D4A574]/20 text-left mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-[#D4A574]" />
            <span className="text-sm font-medium text-[#D4A574]">Faith Perspective</span>
          </div>
          <p className="text-sm text-[#6B7B6E] italic">
            "Each of you should use whatever gift you have received to serve others" - 1 Peter 4:10
          </p>
        </div>
      )}

      <Button
        onClick={() => setStep("rating")}
        className="w-full bg-gradient-to-r from-[#D4A574] to-[#C49464] hover:opacity-90 text-white py-4 rounded-full text-lg font-medium"
        data-testid="button-start"
      >
        Begin Discovery <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );

  const renderRating = () => {
    const Icon = currentStrength.icon;
    const currentRating = ratings.get(currentStrength.key) ?? 5;

    return (
      <motion.div
        key={currentStrength.key}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="px-4"
      >
        <div className="text-center mb-8">
          <span className="text-sm font-medium text-[#D4A574] mb-2 block">
            {currentStrength.category} • {currentIndex + 1}/{CHARACTER_STRENGTHS.length}
          </span>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#C49464] flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#2C3E2D] mb-2">{currentStrength.name}</h2>
          <p className="text-[#6B7B6E]">{currentStrength.desc}</p>
        </div>

        <Card className="bg-white border-[#E8E4DE] mb-6">
          <CardContent className="p-6">
            <label className="block text-sm font-medium text-[#2C3E2D] mb-4 text-center">
              How well does this describe you?
            </label>
            <div className="text-center mb-6">
              <span className="text-5xl font-bold text-[#D4A574]">{currentRating}</span>
              <span className="text-[#6B7B6E]">/10</span>
            </div>
            <Slider
              value={[currentRating]}
              min={1}
              max={10}
              step={1}
              onValueChange={([v]) => handleRate(v)}
              className="touch-manipulation"
            />
            <div className="flex justify-between text-xs text-[#8B9B8E] mt-3">
              <span>Not me at all</span>
              <span>Very much me</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 border-[#E8E4DE] text-[#6B7B6E] py-3 rounded-full"
            data-testid="button-back"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-[#D4A574] to-[#C49464] text-white py-3 rounded-full"
            data-testid="button-next"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderTop5 = () => {
    const sortedByRating = Array.from(ratings.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#2C3E2D] mb-2">Choose Your Top 5</h2>
          <p className="text-[#6B7B6E]">
            Select the 5 strengths that feel most central to who you are
          </p>
        </div>

        <div className="mb-4 text-center">
          <span className={`text-sm font-medium ${top5.length === 5 ? "text-[#7C9A8E]" : "text-[#D4A574]"}`}>
            {top5.length}/5 selected
          </span>
        </div>

        <div className="space-y-2 mb-6 max-h-[50vh] overflow-y-auto">
          {sortedByRating.map((key) => {
            const strength = CHARACTER_STRENGTHS.find(s => s.key === key)!;
            const Icon = strength.icon;
            const isSelected = top5.includes(key);
            const rating = ratings.get(key) || 0;

            return (
              <button
                key={key}
                onClick={() => toggleTop5(key)}
                disabled={!isSelected && top5.length >= 5}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all touch-manipulation ${
                  isSelected
                    ? "border-[#7C9A8E] bg-[#7C9A8E]/10"
                    : top5.length >= 5
                    ? "border-[#E8E4DE] bg-white opacity-50"
                    : "border-[#E8E4DE] bg-white hover:border-[#7C9A8E]/50"
                }`}
                data-testid={`strength-${key}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-[#7C9A8E]" : "bg-[#D4A574]/20"
                  }`}>
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className="w-5 h-5 text-[#D4A574]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#2C3E2D]">{strength.name}</span>
                      <span className="text-sm text-[#8B9B8E]">{rating}/10</span>
                    </div>
                    <span className="text-xs text-[#6B7B6E]">{strength.category}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <Button
          onClick={() => saveStrengths.mutate()}
          disabled={top5.length !== 5 || saveStrengths.isPending}
          className="w-full bg-gradient-to-r from-[#7C9A8E] to-[#6B8B7E] text-white py-4 rounded-full text-lg font-medium disabled:opacity-50"
          data-testid="button-confirm"
        >
          Confirm My Top 5 <CheckCircle2 className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    );
  };

  const renderResults = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-4"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Award className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#2C3E2D] mb-2">Your Signature Strengths</h1>
        <p className="text-[#6B7B6E]">These are the qualities that define you at your best</p>
      </div>

      <div className="space-y-3 mb-8">
        {top5.map((key, i) => {
          const strength = CHARACTER_STRENGTHS.find(s => s.key === key)!;
          const Icon = strength.icon;
          const medals = [Medal, Award, Star, Crown, Heart];
          const MedalIcon = medals[i];

          return (
            <Card key={key} className="bg-white border-[#E8E4DE]">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#C49464] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#7C9A8E] flex items-center justify-center text-white text-xs font-bold">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#2C3E2D]">{strength.name}</h3>
                    <p className="text-sm text-[#6B7B6E]">{strength.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center mb-6">
        <AICoachPanel
          sessionId={sessionId!}
          tool="strengths"
          data={{
            topStrengths: top5.map((key, i) => ({
              name: CHARACTER_STRENGTHS.find(s => s.key === key)?.name,
              rating: ratings.get(key),
            })),
            allStrengths: Array.from(ratings.entries()).map(([key, rating]) => ({
              name: CHARACTER_STRENGTHS.find(s => s.key === key)?.name,
              rating,
            })),
          }}
          title="Strengths Insights"
          description="Discover how to use your strengths"
        />
      </div>

      <div className="space-y-3">
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans">
      {step === "rating" && (
        <div className="sticky top-0 z-10 bg-[#FAF8F5] border-b border-[#E8E4DE] px-4 py-3">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-[#6B7B6E] hover:text-[#2C3E2D] transition-colors"
                data-testid="button-back-header"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Back</span>
              </button>
              <span className="text-sm text-[#8B9B8E]">
                {currentIndex + 1}/{CHARACTER_STRENGTHS.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      <main className={`pb-32 ${step === "rating" ? "pt-6" : "pt-20"}`}>
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {step === "intro" && renderIntro()}
            {step === "rating" && renderRating()}
            {step === "top5" && renderTop5()}
            {step === "results" && renderResults()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}