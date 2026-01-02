import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft, ChevronRight, CheckCircle2,
  ArrowRight, BookOpen, Lightbulb, Target
} from "lucide-react";

export interface AssessmentQuestion {
  id: number;
  key: string;
  questionText: string;
  questionType: "likert" | "multiple_choice" | "ranking" | "open_text" | "slider";
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number;
  biblicalInsight?: string;
  orderIndex: number;
}

export interface AssessmentAnswer {
  questionId: number;
  selectedOption?: string | number;
  selectedOptions?: (string | number)[];
  numericValue?: number;
  textValue?: string;
}

interface AssessmentProps {
  title: string;
  subtitle?: string;
  questions: AssessmentQuestion[];
  initialAnswers?: AssessmentAnswer[];
  mode?: "classic" | "faith";
  accentColor?: string;
  onSaveAnswer: (answer: AssessmentAnswer) => void;
  onComplete: (answers: AssessmentAnswer[]) => void;
  onBack?: () => void;
  showIntro?: boolean;
  introContent?: React.ReactNode;
}

const COLORS = {
  sage: { bg: "bg-[#7C9A8E]", gradient: "from-[#7C9A8E] to-[#6B8B7E]", text: "text-[#7C9A8E]", light: "bg-[#7C9A8E]/10" },
  teal: { bg: "bg-[#4A7C7C]", gradient: "from-[#4A7C7C] to-[#3A6C6C]", text: "text-[#4A7C7C]", light: "bg-[#4A7C7C]/10" },
  beige: { bg: "bg-[#D4A574]", gradient: "from-[#D4A574] to-[#C49464]", text: "text-[#D4A574]", light: "bg-[#D4A574]/10" },
};

export function Assessment({
  title,
  subtitle,
  questions,
  initialAnswers = [],
  mode = "classic",
  accentColor = "sage",
  onSaveAnswer,
  onComplete,
  onBack,
  showIntro = true,
  introContent,
}: AssessmentProps) {
  const [currentIndex, setCurrentIndex] = useState(showIntro ? -1 : 0);
  const [answers, setAnswers] = useState<Map<number, AssessmentAnswer>>(
    new Map(initialAnswers.map(a => [a.questionId, a]))
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const colors = COLORS[accentColor as keyof typeof COLORS] || COLORS.sage;
  const currentQuestion = currentIndex >= 0 ? questions[currentIndex] : null;
  const progress = currentIndex < 0 ? 0 : ((currentIndex + 1) / questions.length) * 100;
  const isComplete = currentIndex >= questions.length;

  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : undefined;

  const updateAnswer = useCallback((value: Partial<AssessmentAnswer>) => {
    if (!currentQuestion) return;
    
    const newAnswer: AssessmentAnswer = {
      questionId: currentQuestion.id,
      ...currentAnswer,
      ...value,
    };
    
    setAnswers(prev => {
      const next = new Map(prev);
      next.set(currentQuestion.id, newAnswer);
      return next;
    });
    
    onSaveAnswer(newAnswer);
  }, [currentQuestion, currentAnswer, onSaveAnswer]);

  const canProceed = useCallback(() => {
    if (currentIndex < 0) return true;
    if (!currentQuestion) return false;
    
    const answer = answers.get(currentQuestion.id);
    if (!answer) return false;
    
    switch (currentQuestion.questionType) {
      case "likert":
      case "slider":
        return answer.numericValue !== undefined;
      case "multiple_choice":
        return answer.selectedOption !== undefined;
      case "ranking":
        return answer.selectedOptions && answer.selectedOptions.length > 0;
      case "open_text":
        return answer.textValue && answer.textValue.trim().length > 0;
      default:
        return true;
    }
  }, [currentIndex, currentQuestion, answers]);

  const handleNext = useCallback(() => {
    if (isAnimating || !canProceed()) return;
    setIsAnimating(true);
    
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        onComplete(Array.from(answers.values()));
      } else {
        setCurrentIndex(prev => prev + 1);
      }
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, canProceed, currentIndex, questions.length, answers, onComplete]);

  const handleBack = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    setTimeout(() => {
      if (currentIndex <= 0 && onBack) {
        onBack();
      } else {
        setCurrentIndex(prev => Math.max(-1, prev - 1));
      }
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, currentIndex, onBack]);

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center px-4"
    >
      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
        <Target className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-[#2C3E2D] mb-3">{title}</h1>
      {subtitle && <p className="text-[#6B7B6E] mb-6 text-lg">{subtitle}</p>}
      
      {introContent || (
        <div className="bg-white rounded-2xl p-5 border border-[#E8E4DE] text-left mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${colors.light} flex items-center justify-center`}>
              <Lightbulb className={`w-5 h-5 ${colors.text}`} />
            </div>
            <span className="font-semibold text-[#2C3E2D]">How This Works</span>
          </div>
          <ul className="space-y-2 text-sm text-[#6B7B6E]">
            <li className="flex items-start gap-2">
              <span className={`w-5 h-5 rounded-full ${colors.light} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <span className={`text-xs font-bold ${colors.text}`}>1</span>
              </span>
              Answer {questions.length} simple questions honestly
            </li>
            <li className="flex items-start gap-2">
              <span className={`w-5 h-5 rounded-full ${colors.light} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <span className={`text-xs font-bold ${colors.text}`}>2</span>
              </span>
              Your answers are saved automatically
            </li>
            <li className="flex items-start gap-2">
              <span className={`w-5 h-5 rounded-full ${colors.light} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <span className={`text-xs font-bold ${colors.text}`}>3</span>
              </span>
              Get personalized insights at the end
            </li>
          </ul>
        </div>
      )}
      
      <Button
        onClick={handleNext}
        className={`w-full bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white py-4 rounded-full text-lg font-medium`}
        data-testid="button-start-assessment"
      >
        Begin <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );

  const renderLikertQuestion = () => {
    if (!currentQuestion) return null;
    const options = currentQuestion.options || [
      { label: "Strongly Disagree", value: 1 },
      { label: "Disagree", value: 2 },
      { label: "Neutral", value: 3 },
      { label: "Agree", value: 4 },
      { label: "Strongly Agree", value: 5 },
    ];

    return (
      <div className="space-y-3">
        {options.map((option, i) => (
          <button
            key={i}
            onClick={() => updateAnswer({ numericValue: option.value as number })}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all touch-manipulation ${
              currentAnswer?.numericValue === option.value
                ? `border-[#7C9A8E] bg-[#7C9A8E]/10`
                : "border-[#E8E4DE] bg-white hover:border-[#7C9A8E]/50"
            }`}
            data-testid={`option-${option.value}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                currentAnswer?.numericValue === option.value
                  ? "border-[#7C9A8E] bg-[#7C9A8E]"
                  : "border-[#D4D0C8]"
              }`}>
                {currentAnswer?.numericValue === option.value && (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="font-medium text-[#2C3E2D]">{option.label}</span>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderSliderQuestion = () => {
    if (!currentQuestion) return null;
    const min = currentQuestion.min ?? 1;
    const max = currentQuestion.max ?? 10;
    const value = currentAnswer?.numericValue ?? Math.floor((min + max) / 2);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className={`text-5xl font-bold ${colors.text} mb-2`}>{value}</div>
          <p className="text-[#6B7B6E] text-sm">Slide to rate</p>
        </div>
        <div className="px-2">
          <Slider
            value={[value]}
            min={min}
            max={max}
            step={1}
            onValueChange={([v]) => updateAnswer({ numericValue: v })}
            className="touch-manipulation"
          />
          <div className="flex justify-between text-xs text-[#8B9B8E] mt-2">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMultipleChoiceQuestion = () => {
    if (!currentQuestion || !currentQuestion.options) return null;

    return (
      <div className="space-y-3">
        {currentQuestion.options.map((option, i) => (
          <button
            key={i}
            onClick={() => updateAnswer({ selectedOption: option.value })}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all touch-manipulation ${
              currentAnswer?.selectedOption === option.value
                ? `border-[#7C9A8E] bg-[#7C9A8E]/10`
                : "border-[#E8E4DE] bg-white hover:border-[#7C9A8E]/50"
            }`}
            data-testid={`option-${option.value}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                currentAnswer?.selectedOption === option.value
                  ? "border-[#7C9A8E] bg-[#7C9A8E]"
                  : "border-[#D4D0C8]"
              }`}>
                {currentAnswer?.selectedOption === option.value && (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="font-medium text-[#2C3E2D]">{option.label}</span>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderOpenTextQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <Textarea
        value={currentAnswer?.textValue || ""}
        onChange={(e) => updateAnswer({ textValue: e.target.value })}
        placeholder="Share your thoughts..."
        className="min-h-[120px] bg-white border-[#E8E4DE] rounded-xl p-4 text-[#2C3E2D] focus:border-[#7C9A8E] focus:ring-[#7C9A8E]"
        data-testid="input-text-answer"
      />
    );
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <span className={`text-sm font-medium ${colors.text} mb-2 block`}>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <h2 className="text-xl font-bold text-[#2C3E2D] leading-relaxed">
            {currentQuestion.questionText}
          </h2>
        </div>

        {currentQuestion.questionType === "likert" && renderLikertQuestion()}
        {currentQuestion.questionType === "slider" && renderSliderQuestion()}
        {currentQuestion.questionType === "multiple_choice" && renderMultipleChoiceQuestion()}
        {currentQuestion.questionType === "open_text" && renderOpenTextQuestion()}

        {mode === "faith" && currentQuestion.biblicalInsight && (
          <div className="bg-[#D4A574]/10 rounded-xl p-4 border border-[#D4A574]/20">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-[#D4A574]" />
              <span className="text-sm font-medium text-[#D4A574]">Biblical Insight</span>
            </div>
            <p className="text-sm text-[#6B7B6E] italic">
              {currentQuestion.biblicalInsight}
            </p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans pb-32">
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
              {currentIndex < 0 ? "Introduction" : `${currentIndex + 1}/${questions.length}`}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-8">
        <AnimatePresence mode="wait">
          {currentIndex < 0 ? renderIntro() : renderQuestion()}
        </AnimatePresence>
      </div>

      {currentIndex >= 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FAF8F5] border-t border-[#E8E4DE] p-4 pb-8">
          <div className="max-w-lg mx-auto">
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`w-full bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white py-4 rounded-full text-lg font-medium disabled:opacity-50`}
              data-testid="button-next"
            >
              {currentIndex + 1 >= questions.length ? (
                <>Complete <CheckCircle2 className="w-5 h-5 ml-2" /></>
              ) : (
                <>Next <ChevronRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}