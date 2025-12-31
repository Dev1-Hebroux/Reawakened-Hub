import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft, ChevronRight, Users, CheckCircle2, Sparkles,
  ArrowRight, BookOpen, Lightbulb, MessageCircle, Zap,
  Heart, Shield, Target, Crown, Star, Clock
} from "lucide-react";

const STYLE_PROFILES = [
  {
    key: "driver",
    name: "Driver",
    subtitle: "Results-focused & decisive",
    color: "from-[#C17767] to-[#B16657]",
    lightColor: "bg-[#C17767]/10",
    textColor: "text-[#C17767]",
    icon: Target,
    traits: ["Direct", "Ambitious", "Decisive", "Independent"],
    strengths: ["Gets things done", "Clear communicator", "Takes initiative"],
    challenges: ["May seem impatient", "Can overlook emotions", "May dominate conversations"],
    communicatingWith: "Be direct, get to the point quickly, focus on results and outcomes",
    under_stress: "Becomes controlling and dismissive of others' input",
  },
  {
    key: "expressive",
    name: "Expressive",
    subtitle: "Enthusiastic & inspiring",
    color: "from-[#D4A574] to-[#C49464]",
    lightColor: "bg-[#D4A574]/10",
    textColor: "text-[#D4A574]",
    icon: Sparkles,
    traits: ["Enthusiastic", "Creative", "Persuasive", "Optimistic"],
    strengths: ["Motivates others", "Brings energy", "Creative problem solver"],
    challenges: ["May lack follow-through", "Can be disorganized", "May talk more than listen"],
    communicatingWith: "Be engaging, share big-picture vision, allow time for discussion",
    under_stress: "Becomes scattered and overly emotional",
  },
  {
    key: "amiable",
    name: "Amiable",
    subtitle: "Supportive & harmonious",
    color: "from-[#7C9A8E] to-[#6B8B7E]",
    lightColor: "bg-[#7C9A8E]/10",
    textColor: "text-[#7C9A8E]",
    icon: Heart,
    traits: ["Supportive", "Patient", "Diplomatic", "Reliable"],
    strengths: ["Great listener", "Builds consensus", "Reliable team player"],
    challenges: ["May avoid conflict", "Can be indecisive", "May prioritize others over self"],
    communicatingWith: "Be warm and personal, build trust first, give time to process",
    under_stress: "Becomes passive and withdraws from conflict",
  },
  {
    key: "analytical",
    name: "Analytical",
    subtitle: "Thorough & systematic",
    color: "from-[#4A7C7C] to-[#3A6C6C]",
    lightColor: "bg-[#4A7C7C]/10",
    textColor: "text-[#4A7C7C]",
    icon: Shield,
    traits: ["Precise", "Logical", "Systematic", "Detail-oriented"],
    strengths: ["Thorough analysis", "High quality work", "Catches errors"],
    challenges: ["May over-analyze", "Can seem critical", "May resist change"],
    communicatingWith: "Be prepared with data, be logical, give time for questions",
    under_stress: "Becomes overly critical and withdrawn",
  },
];

const STYLE_QUESTIONS = [
  {
    id: 1,
    question: "When making decisions, I prefer to...",
    options: [
      { style: "driver", text: "Decide quickly and move on" },
      { style: "expressive", text: "Discuss with others and explore possibilities" },
      { style: "amiable", text: "Consider how it affects everyone involved" },
      { style: "analytical", text: "Gather all the facts before deciding" },
    ],
  },
  {
    id: 2,
    question: "In team meetings, I usually...",
    options: [
      { style: "driver", text: "Focus on action items and next steps" },
      { style: "expressive", text: "Share ideas and get people excited" },
      { style: "amiable", text: "Make sure everyone feels heard" },
      { style: "analytical", text: "Ask clarifying questions and take notes" },
    ],
  },
  {
    id: 3,
    question: "When starting a new project, I first...",
    options: [
      { style: "driver", text: "Set goals and create a timeline" },
      { style: "expressive", text: "Brainstorm creative approaches" },
      { style: "amiable", text: "Build relationships with the team" },
      { style: "analytical", text: "Research and gather information" },
    ],
  },
  {
    id: 4,
    question: "Under pressure, I tend to...",
    options: [
      { style: "driver", text: "Take charge and push through" },
      { style: "expressive", text: "Stay optimistic and rally the team" },
      { style: "amiable", text: "Seek harmony and reduce tension" },
      { style: "analytical", text: "Slow down and double-check everything" },
    ],
  },
  {
    id: 5,
    question: "I get frustrated when...",
    options: [
      { style: "driver", text: "Things move too slowly" },
      { style: "expressive", text: "Details bog down the big picture" },
      { style: "amiable", text: "There's conflict in the team" },
      { style: "analytical", text: "Decisions are made without proper analysis" },
    ],
  },
  {
    id: 6,
    question: "My communication style is best described as...",
    options: [
      { style: "driver", text: "Direct and to the point" },
      { style: "expressive", text: "Animated and enthusiastic" },
      { style: "amiable", text: "Warm and encouraging" },
      { style: "analytical", text: "Precise and detailed" },
    ],
  },
];

export function StylesTool() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"intro" | "quiz" | "results">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [primaryStyle, setPrimaryStyle] = useState<string | null>(null);
  const [secondaryStyle, setSecondaryStyle] = useState<string | null>(null);

  const { data: session } = useQuery({
    queryKey: ["/api/vision/sessions/current"],
    queryFn: async () => {
      const res = await fetch("/api/vision/sessions/current", { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const saveStyle = useMutation({
    mutationFn: async () => {
      const scores: Record<string, number> = { driver: 0, expressive: 0, amiable: 0, analytical: 0 };
      answers.forEach((style) => {
        scores[style] = (scores[style] || 0) + 1;
      });
      
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const primary = sorted[0][0];
      const secondary = sorted[1][0];
      
      setPrimaryStyle(primary);
      setSecondaryStyle(secondary);

      const res = await fetch(`/api/vision/sessions/${sessionId}/style`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          primaryStyle: primary,
          secondaryStyle: secondary,
          scores,
        }),
      });
      if (!res.ok) throw new Error("Failed to save style");
      return res.json();
    },
    onSuccess: () => {
      setStep("results");
    },
  });

  const progress = ((currentQuestion + 1) / STYLE_QUESTIONS.length) * 100;
  const question = STYLE_QUESTIONS[currentQuestion];

  const handleAnswer = (style: string) => {
    setAnswers(prev => {
      const next = new Map(prev);
      next.set(question.id, style);
      return next;
    });
  };

  const handleNext = () => {
    if (currentQuestion + 1 >= STYLE_QUESTIONS.length) {
      saveStyle.mutate();
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step === "intro") {
      navigate(`/growth`);
    } else if (step === "quiz" && currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else if (step === "quiz") {
      setStep("intro");
    }
  };

  const primaryProfile = STYLE_PROFILES.find(p => p.key === primaryStyle);
  const secondaryProfile = STYLE_PROFILES.find(p => p.key === secondaryStyle);

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center px-4 pt-20"
    >
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#4A7C7C] to-[#3A6C6C] flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Users className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-[#2C3E2D] mb-3">4 Styles Profile</h1>
      <p className="text-[#6B7B6E] mb-6 text-lg">
        Discover your communication style
      </p>

      <Card className="bg-white border-[#E8E4DE] text-left mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold text-[#2C3E2D] mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#D4A574]" />
            The 4 Styles
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {STYLE_PROFILES.map((profile) => {
              const Icon = profile.icon;
              return (
                <div key={profile.key} className={`${profile.lightColor} rounded-xl p-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${profile.textColor}`} />
                    <span className="font-medium text-[#2C3E2D] text-sm">{profile.name}</span>
                  </div>
                  <p className="text-xs text-[#6B7B6E]">{profile.subtitle}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 justify-center text-xs text-[#8B9B8E] mb-6">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          ~5 minutes
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          {STYLE_QUESTIONS.length} questions
        </span>
      </div>

      {session?.mode === "faith" && (
        <div className="bg-[#D4A574]/10 rounded-xl p-4 border border-[#D4A574]/20 text-left mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-[#D4A574]" />
            <span className="text-sm font-medium text-[#D4A574]">Faith Perspective</span>
          </div>
          <p className="text-sm text-[#6B7B6E] italic">
            "Let your conversation be always full of grace, seasoned with salt" - Colossians 4:6
          </p>
        </div>
      )}

      <Button
        onClick={() => setStep("quiz")}
        className="w-full bg-gradient-to-r from-[#4A7C7C] to-[#3A6C6C] hover:opacity-90 text-white py-4 rounded-full text-lg font-medium"
        data-testid="button-start"
      >
        Start Quiz <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );

  const renderQuiz = () => (
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
              {currentQuestion + 1}/{STYLE_QUESTIONS.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-8 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-[#2C3E2D] leading-relaxed">
                {question.question}
              </h2>
            </div>

            <div className="space-y-3">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(option.style)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all touch-manipulation ${
                    answers.get(question.id) === option.style
                      ? "border-[#4A7C7C] bg-[#4A7C7C]/10"
                      : "border-[#E8E4DE] bg-white hover:border-[#4A7C7C]/50"
                  }`}
                  data-testid={`option-${option.style}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers.get(question.id) === option.style
                        ? "border-[#4A7C7C] bg-[#4A7C7C]"
                        : "border-[#D4D0C8]"
                    }`}>
                      {answers.get(question.id) === option.style && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="font-medium text-[#2C3E2D]">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#FAF8F5] border-t border-[#E8E4DE] p-4 pb-8">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleNext}
            disabled={!answers.get(question.id) || saveStyle.isPending}
            className="w-full bg-gradient-to-r from-[#4A7C7C] to-[#3A6C6C] hover:opacity-90 text-white py-4 rounded-full text-lg font-medium disabled:opacity-50"
            data-testid="button-next"
          >
            {currentQuestion + 1 >= STYLE_QUESTIONS.length ? (
              <>See Results <Star className="w-5 h-5 ml-2" /></>
            ) : (
              <>Next <ChevronRight className="w-5 h-5 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!primaryProfile) return null;
    const PrimaryIcon = primaryProfile.icon;
    const SecondaryIcon = secondaryProfile?.icon || Users;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-4 pt-20 pb-32"
      >
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${primaryProfile.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <PrimaryIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#2C3E2D] mb-2">Your Primary Style</h1>
            <h2 className={`text-3xl font-bold ${primaryProfile.textColor}`}>{primaryProfile.name}</h2>
            <p className="text-[#6B7B6E] mt-2">{primaryProfile.subtitle}</p>
          </div>

          <Card className="bg-white border-[#E8E4DE] mb-4">
            <CardContent className="p-5">
              <h3 className="font-semibold text-[#2C3E2D] mb-3">Core Traits</h3>
              <div className="flex flex-wrap gap-2">
                {primaryProfile.traits.map((trait, i) => (
                  <span key={i} className={`px-3 py-1 rounded-full ${primaryProfile.lightColor} ${primaryProfile.textColor} text-sm font-medium`}>
                    {trait}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E8E4DE] mb-4">
            <CardContent className="p-5">
              <h3 className="font-semibold text-[#2C3E2D] mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-[#D4A574]" />
                Your Strengths
              </h3>
              <ul className="space-y-2">
                {primaryProfile.strengths.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#6B7B6E]">
                    <CheckCircle2 className="w-4 h-4 text-[#7C9A8E]" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E8E4DE] mb-4">
            <CardContent className="p-5">
              <h3 className="font-semibold text-[#2C3E2D] mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#C17767]" />
                Watch Out For
              </h3>
              <ul className="space-y-2">
                {primaryProfile.challenges.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#6B7B6E]">
                    <span className="w-4 h-4 flex items-center justify-center">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {secondaryProfile && (
            <Card className={`${secondaryProfile.lightColor} border-none mb-6`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${secondaryProfile.color} flex items-center justify-center`}>
                    <SecondaryIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7B6E]">Secondary Style</p>
                    <h4 className="font-semibold text-[#2C3E2D]">{secondaryProfile.name}</h4>
                  </div>
                </div>
                <p className="text-sm text-[#6B7B6E]">{secondaryProfile.subtitle}</p>
              </CardContent>
            </Card>
          )}

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
      {step === "quiz" && renderQuiz()}
      {step === "results" && renderResults()}
    </div>
  );
}