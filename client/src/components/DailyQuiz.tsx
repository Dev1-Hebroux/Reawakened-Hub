import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const sampleQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What does DOMINION mean in the context of this campaign?",
    options: [
      "Having power over others",
      "Stepping into your God-given authority and purpose",
      "A type of prayer",
      "A historical event"
    ],
    correctIndex: 1,
    explanation: "DOMINION is about understanding your identity in Christ and stepping into the authority and purpose God has given you."
  },
  {
    id: 2,
    question: "What is the first step in deeper reflection?",
    options: [
      "Rushing through content",
      "Pausing and being present",
      "Skipping to the action",
      "Sharing immediately"
    ],
    correctIndex: 1,
    explanation: "True reflection starts with pausing and being fully present. This allows you to hear what God might be saying to you."
  },
  {
    id: 3,
    question: "Why is community important in spiritual growth?",
    options: [
      "It's not important",
      "For social media followers",
      "We grow stronger together and can encourage one another",
      "To compete with others"
    ],
    correctIndex: 2,
    explanation: "The Bible teaches us that we are stronger together. Community provides encouragement, accountability, and shared wisdom."
  },
  {
    id: 4,
    question: "What makes a spark truly impactful?",
    options: [
      "Reading it quickly",
      "Applying it to your daily life",
      "Forgetting it after",
      "Only reading the quote"
    ],
    correctIndex: 1,
    explanation: "A spark becomes impactful when you move from reading to action. Applying the insights to your daily life creates lasting change."
  },
  {
    id: 5,
    question: "What is the purpose of the 'Take Action' prompt?",
    options: [
      "Just for decoration",
      "To give you a practical step to apply what you've learned",
      "To fill space",
      "For entertainment only"
    ],
    correctIndex: 1,
    explanation: "The 'Take Action' prompt gives you a concrete, practical step to apply the day's insight. Action is where transformation happens."
  }
];

export function DailyQuiz() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [todaysQuestions, setTodaysQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    const shuffled = [...sampleQuestions].sort(() => Math.random() - 0.5);
    setTodaysQuestions(shuffled.slice(0, 3));
  }, []);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === todaysQuestions[currentQuestion].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < todaysQuestions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
      if (score >= 2) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const resetQuiz = () => {
    const shuffled = [...sampleQuestions].sort(() => Math.random() - 0.5);
    setTodaysQuestions(shuffled.slice(0, 3));
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="w-full rounded-2xl p-5 border flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
        style={{ backgroundColor: 'rgba(74, 124, 124, 0.08)', borderColor: 'rgba(74, 124, 124, 0.2)' }}
        data-testid="button-start-quiz"
      >
        <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(74, 124, 124, 0.15)' }}>
          <Brain className="h-6 w-6" style={{ color: '#4A7C7C' }} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white">Daily Knowledge Check</h4>
          <p className="text-sm text-white/60">Test what you've learned in a fun way</p>
        </div>
        <ChevronRight className="h-5 w-5 text-white/40" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'rgba(74, 124, 124, 0.12)', borderColor: 'rgba(74, 124, 124, 0.25)' }}
    >
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(74, 124, 124, 0.15)' }}>
            <Brain className="h-5 w-5" style={{ color: '#4A7C7C' }} />
          </div>
          <div>
            <h4 className="font-bold text-white">Daily Quiz</h4>
            <p className="text-sm text-white/60">Question {currentQuestion + 1} of {todaysQuestions.length}</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/40 hover:text-white/60 text-sm"
        >
          Close
        </button>
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {!quizComplete ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex gap-1 mb-4">
                {todaysQuestions.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-colors"
                    style={{
                      backgroundColor: i < currentQuestion ? '#7C9A8E' : i === currentQuestion ? '#4A7C7C' : 'rgba(255,255,255,0.1)'
                    }}
                  />
                ))}
              </div>

              <p className="text-lg font-medium text-white mb-6" data-testid="text-quiz-question">
                {todaysQuestions[currentQuestion]?.question}
              </p>

              <div className="space-y-3">
                {todaysQuestions[currentQuestion]?.options.map((option, i) => {
                  const isCorrect = i === todaysQuestions[currentQuestion].correctIndex;
                  const isSelected = selectedAnswer === i;
                  
                  let bgColor = 'rgba(250, 248, 245, 0.05)';
                  let borderColor = 'rgba(250, 248, 245, 0.1)';
                  
                  if (showResult) {
                    if (isCorrect) {
                      bgColor = 'rgba(124, 154, 142, 0.2)';
                      borderColor = 'rgba(124, 154, 142, 0.4)';
                    } else if (isSelected && !isCorrect) {
                      bgColor = 'rgba(239, 68, 68, 0.1)';
                      borderColor = 'rgba(239, 68, 68, 0.3)';
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={showResult}
                      className="w-full p-4 rounded-xl text-left transition-all flex items-center gap-3"
                      style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
                      data-testid={`button-answer-${i}`}
                    >
                      <div className="flex-1 text-white/90">{option}</div>
                      {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-[#7C9A8E]" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-400" />}
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-4"
                >
                  <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(250, 248, 245, 0.05)' }}>
                    <p className="text-sm text-white/70">{todaysQuestions[currentQuestion].explanation}</p>
                  </div>
                  <Button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-[#4A7C7C] to-[#3A6666] hover:from-[#3A6666] hover:to-[#2A5656]"
                    data-testid="button-next-question"
                  >
                    {currentQuestion < todaysQuestions.length - 1 ? "Next Question" : "See Results"}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="mb-4">
                <Trophy className="h-16 w-16 mx-auto" style={{ color: score >= 2 ? '#D4A574' : '#7C9A8E' }} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2" data-testid="text-quiz-score">
                {score} / {todaysQuestions.length}
              </h3>
              <p className="text-white/60 mb-6">
                {score === todaysQuestions.length
                  ? "Perfect score! You're crushing it!"
                  : score >= 2
                  ? "Great job! Keep learning!"
                  : "Good effort! Try again tomorrow!"}
              </p>
              <Button
                onClick={resetQuiz}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                data-testid="button-retry-quiz"
              >
                <RotateCcw className="h-4 w-4 mr-2" /> Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
