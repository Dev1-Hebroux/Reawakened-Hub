import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft, ChevronRight, Heart, CheckCircle2, Sparkles,
  ArrowRight, BookOpen, Lightbulb, Eye, Users, Brain, Shield,
  Zap, Target, Star, Clock, Activity
} from "lucide-react";
import { AICoachPanel } from "@/components/AICoachPanel";

const EQ_DOMAINS = [
  {
    key: "self_awareness",
    name: "Self-Awareness",
    icon: Eye,
    color: "from-[#7C9A8E] to-[#6B8B7E]",
    lightColor: "bg-[#7C9A8E]/10",
    textColor: "text-[#7C9A8E]",
    description: "Recognizing your emotions and their impact",
    questions: [
      "I can identify what I'm feeling in the moment",
      "I understand how my moods affect others",
      "I recognize my emotional triggers",
    ],
    practices: [
      { name: "Emotion Check-In", desc: "Pause 3x daily to name your emotion", minutes: 1 },
      { name: "Trigger Journal", desc: "Write what triggered strong reactions", minutes: 5 },
      { name: "Body Scan", desc: "Notice physical sensations tied to emotions", minutes: 3 },
    ],
  },
  {
    key: "self_management",
    name: "Self-Management",
    icon: Shield,
    color: "from-[#4A7C7C] to-[#3A6C6C]",
    lightColor: "bg-[#4A7C7C]/10",
    textColor: "text-[#4A7C7C]",
    description: "Managing your emotions and impulses",
    questions: [
      "I stay calm under pressure",
      "I can delay gratification for better outcomes",
      "I adapt well to changing situations",
    ],
    practices: [
      { name: "Pause & Breathe", desc: "Take 3 deep breaths before reacting", minutes: 1 },
      { name: "Reframe Practice", desc: "Find one positive in a frustrating situation", minutes: 2 },
      { name: "Stress Relief", desc: "Use a go-to calming technique", minutes: 5 },
    ],
  },
  {
    key: "social_awareness",
    name: "Social Awareness",
    icon: Users,
    color: "from-[#D4A574] to-[#C49464]",
    lightColor: "bg-[#D4A574]/10",
    textColor: "text-[#D4A574]",
    description: "Understanding others' emotions and perspectives",
    questions: [
      "I can read the room and sense group dynamics",
      "I pick up on nonverbal cues from others",
      "I consider others' perspectives before responding",
    ],
    practices: [
      { name: "Active Listening", desc: "Listen without planning your reply", minutes: 5 },
      { name: "Perspective Taking", desc: "Imagine a situation from someone else's view", minutes: 3 },
      { name: "Empathy Response", desc: "Validate someone's feelings today", minutes: 2 },
    ],
  },
  {
    key: "relationship_management",
    name: "Relationship Management",
    icon: Heart,
    color: "from-[#C17767] to-[#B16657]",
    lightColor: "bg-[#C17767]/10",
    textColor: "text-[#C17767]",
    description: "Building and maintaining positive relationships",
    questions: [
      "I handle conflicts constructively",
      "I inspire and motivate others",
      "I build trust through consistent follow-through",
    ],
    practices: [
      { name: "Appreciation Express", desc: "Tell someone what you value about them", minutes: 2 },
      { name: "Difficult Conversation", desc: "Address one issue with care and clarity", minutes: 10 },
      { name: "Connection Ritual", desc: "Reach out to someone you haven't talked to", minutes: 5 },
    ],
  },
];

interface DomainScore {
  key: string;
  score: number;
  answers: number[];
}

export function EqTool() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"intro" | "assessment" | "results" | "practice">("intro");
  const [currentDomain, setCurrentDomain] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Map<string, DomainScore>>(new Map());
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);

  const { data: session } = useQuery({
    queryKey: ["/api/vision/sessions/current"],
    queryFn: async () => {
      const res = await fetch("/api/vision/sessions/current", { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const domain = EQ_DOMAINS[currentDomain];
  const totalQuestions = EQ_DOMAINS.reduce((sum, d) => sum + d.questions.length, 0);
  const answeredQuestions = Array.from(scores.values()).reduce((sum, s) => sum + s.answers.length, 0);
  const progress = (answeredQuestions / totalQuestions) * 100;

  const currentScore = scores.get(domain.key) || { key: domain.key, score: 0, answers: [] };
  const currentAnswer = currentScore.answers[currentQuestion];

  const handleRate = (value: number) => {
    setScores(prev => {
      const next = new Map(prev);
      const existing = next.get(domain.key) || { key: domain.key, score: 0, answers: [] };
      const newAnswers = [...existing.answers];
      newAnswers[currentQuestion] = value;
      const avgScore = newAnswers.reduce((a, b) => a + b, 0) / newAnswers.length;
      next.set(domain.key, { ...existing, answers: newAnswers, score: avgScore });
      return next;
    });
  };

  const handleNext = () => {
    if (currentQuestion + 1 < domain.questions.length) {
      setCurrentQuestion(prev => prev + 1);
    } else if (currentDomain + 1 < EQ_DOMAINS.length) {
      setCurrentDomain(prev => prev + 1);
      setCurrentQuestion(0);
    } else {
      setStep("results");
    }
  };

  const handleBack = () => {
    if (step === "intro") {
      navigate(`/growth`);
    } else if (step === "assessment") {
      if (currentQuestion > 0) {
        setCurrentQuestion(prev => prev - 1);
      } else if (currentDomain > 0) {
        setCurrentDomain(prev => prev - 1);
        setCurrentQuestion(EQ_DOMAINS[currentDomain - 1].questions.length - 1);
      } else {
        setStep("intro");
      }
    } else if (step === "results") {
      setStep("assessment");
    }
  };

  const togglePractice = (key: string) => {
    setSelectedPractices(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Strong";
    if (score >= 6) return "Good";
    if (score >= 4) return "Developing";
    return "Growth Area";
  };

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center px-4 pt-20"
    >
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#C17767] to-[#B16657] flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Heart className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-[#2C3E2D] mb-3">EQ Micro-Skills</h1>
      <p className="text-[#6B7B6E] mb-6 text-lg">
        Build emotional intelligence one skill at a time
      </p>

      <Card className="bg-white border-[#E8E4DE] text-left mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold text-[#2C3E2D] mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#D4A574]" />
            The 4 EQ Domains
          </h3>
          <div className="space-y-3">
            {EQ_DOMAINS.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.key} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${d.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-medium text-[#2C3E2D] text-sm">{d.name}</span>
                    <p className="text-xs text-[#6B7B6E]">{d.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 justify-center text-xs text-[#8B9B8E] mb-6">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          ~8 minutes
        </span>
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3" />
          {totalQuestions} questions
        </span>
      </div>

      {session?.mode === "faith" && (
        <div className="bg-[#D4A574]/10 rounded-xl p-4 border border-[#D4A574]/20 text-left mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-[#D4A574]" />
            <span className="text-sm font-medium text-[#D4A574]">Faith Perspective</span>
          </div>
          <p className="text-sm text-[#6B7B6E] italic">
            "Be quick to listen, slow to speak and slow to become angry" - James 1:19
          </p>
        </div>
      )}

      <Button
        onClick={() => setStep("assessment")}
        className="w-full bg-gradient-to-r from-[#C17767] to-[#B16657] hover:opacity-90 text-white py-4 rounded-full text-lg font-medium"
        data-testid="button-start"
      >
        Start Assessment <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );

  const renderAssessment = () => {
    const Icon = domain.icon;
    const question = domain.questions[currentQuestion];

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
              <span className={`text-sm font-medium ${domain.textColor}`}>
                {domain.name}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-8 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${domain.key}-${currentQuestion}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${domain.color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#2C3E2D] leading-relaxed">
                  {question}
                </h2>
              </div>

              <Card className="bg-white border-[#E8E4DE]">
                <CardContent className="p-6">
                  <label className="block text-sm font-medium text-[#2C3E2D] mb-4 text-center">
                    Rate yourself (1-10)
                  </label>
                  <div className="text-center mb-6">
                    <span className={`text-5xl font-bold ${domain.textColor}`}>
                      {currentAnswer ?? 5}
                    </span>
                    <span className="text-[#6B7B6E]">/10</span>
                  </div>
                  <Slider
                    value={[currentAnswer ?? 5]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={([v]) => handleRate(v)}
                    className="touch-manipulation"
                  />
                  <div className="flex justify-between text-xs text-[#8B9B8E] mt-3">
                    <span>Rarely</span>
                    <span>Always</span>
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
              disabled={currentAnswer === undefined}
              className={`w-full bg-gradient-to-r ${domain.color} hover:opacity-90 text-white py-4 rounded-full text-lg font-medium disabled:opacity-50`}
              data-testid="button-next"
            >
              {currentDomain + 1 >= EQ_DOMAINS.length && currentQuestion + 1 >= domain.questions.length ? (
                <>See Results <Star className="w-5 h-5 ml-2" /></>
              ) : (
                <>Next <ChevronRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-4 pt-20 pb-32"
    >
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#2C3E2D] mb-2">Your EQ Profile</h1>
          <p className="text-[#6B7B6E]">See your strengths and growth areas</p>
        </div>

        <div className="space-y-4 mb-8">
          {EQ_DOMAINS.map((d) => {
            const Icon = d.icon;
            const score = scores.get(d.key)?.score || 0;
            const label = getScoreLabel(score);

            return (
              <Card key={d.key} className="bg-white border-[#E8E4DE]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${d.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-[#2C3E2D]">{d.name}</h3>
                        <span className={`text-sm font-medium ${d.textColor}`}>{score.toFixed(1)}/10</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${d.lightColor} ${d.textColor}`}>
                        {label}
                      </span>
                    </div>
                  </div>
                  <Progress value={score * 10} className="h-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center mb-6">
          <AICoachPanel
            sessionId={sessionId!}
            tool="eq"
            data={{
              scores: {
                selfAwareness: scores.get("self_awareness")?.score || 0,
                selfManagement: scores.get("self_management")?.score || 0,
                socialAwareness: scores.get("social_awareness")?.score || 0,
                relationshipManagement: scores.get("relationship_management")?.score || 0,
              },
            }}
            title="EQ Insights"
            description="Develop your emotional intelligence"
          />
        </div>

        <Card className="bg-gradient-to-br from-[#7C9A8E]/10 to-[#D4A574]/10 border-none mb-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-[#D4A574]" />
              <h3 className="font-semibold text-[#2C3E2D]">Build Your Practice</h3>
            </div>
            <p className="text-sm text-[#6B7B6E]">
              Choose 1-2 micro-practices from your growth areas to work on this week.
            </p>
          </CardContent>
        </Card>

        <Button
          onClick={() => setStep("practice")}
          className="w-full bg-gradient-to-r from-[#7C9A8E] to-[#6B8B7E] text-white py-4 rounded-full text-lg font-medium"
          data-testid="button-practices"
        >
          Choose Practices <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  const renderPractice = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pt-20 pb-32"
    >
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#2C3E2D] mb-2">Weekly Practice Plan</h1>
          <p className="text-[#6B7B6E]">Choose 1-3 practices to focus on</p>
        </div>

        <div className="mb-4 text-center">
          <span className={`text-sm font-medium ${selectedPractices.length > 0 ? "text-[#7C9A8E]" : "text-[#D4A574]"}`}>
            {selectedPractices.length} selected
          </span>
        </div>

        <div className="space-y-6 mb-8">
          {EQ_DOMAINS.map((d) => {
            const Icon = d.icon;
            const score = scores.get(d.key)?.score || 5;
            
            return (
              <div key={d.key}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-4 h-4 ${d.textColor}`} />
                  <h3 className="font-medium text-[#2C3E2D] text-sm">{d.name}</h3>
                  {score < 6 && (
                    <span className="text-xs px-2 py-0.5 bg-[#D4A574]/20 text-[#D4A574] rounded-full">
                      Growth Area
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {d.practices.map((p, i) => {
                    const key = `${d.key}-${i}`;
                    const isSelected = selectedPractices.includes(key);
                    
                    return (
                      <button
                        key={key}
                        onClick={() => togglePractice(key)}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all touch-manipulation ${
                          isSelected
                            ? `border-[#7C9A8E] bg-[#7C9A8E]/10`
                            : "border-[#E8E4DE] bg-white"
                        }`}
                        data-testid={`practice-${key}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-[#7C9A8E] bg-[#7C9A8E]" : "border-[#D4D0C8]"
                          }`}>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-[#2C3E2D] text-sm">{p.name}</span>
                            <p className="text-xs text-[#6B7B6E]">{p.desc}</p>
                          </div>
                          <span className="text-xs text-[#8B9B8E]">{p.minutes}m</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={() => navigate(`/vision/${sessionId}/growth`)}
          disabled={selectedPractices.length === 0}
          className="w-full bg-gradient-to-r from-[#7C9A8E] to-[#6B8B7E] text-white py-4 rounded-full text-lg font-medium disabled:opacity-50"
          data-testid="button-done"
        >
          Save & Return <CheckCircle2 className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans">
      {step === "intro" && renderIntro()}
      {step === "assessment" && renderAssessment()}
      {step === "results" && renderResults()}
      {step === "practice" && renderPractice()}
    </div>
  );
}