/**
 * Quick Start Flow Component
 * Get users to value in < 60 seconds
 * 3-step process: Pick focus → See example → Complete first task
 */

import { motion, AnimatePresence } from "framer-motion";
import { Brain, Heart, Users, Check, ArrowRight, Sparkles } from "lucide-react";
import { spring } from "@/lib/animations";
import { celebrate } from "@/lib/celebrations";
import { useState } from "react";
import { CircularProgress } from "@/components/gamification/CircularProgress";

interface QuickStartFlowProps {
  onComplete: (config: {
    focusArea: string;
    audienceSegment: string;
    firstTaskCompleted: boolean;
  }) => void;
  onSkip: () => void;
}

const FOCUS_AREAS = [
  {
    id: "spiritual-growth",
    icon: Brain,
    title: "Spiritual Growth",
    description: "Deepen your understanding and relationship with God",
    color: "#7C9A8E"
  },
  {
    id: "daily-devotion",
    icon: Heart,
    title: "Daily Devotion",
    description: "Build a consistent prayer and worship habit",
    color: "#EF4444"
  },
  {
    id: "community",
    icon: Users,
    title: "Community",
    description: "Connect with others on their faith journey",
    color: "#D4A574"
  }
];

const AUDIENCE_SEGMENTS = [
  { id: "gen-z-student", label: "Student", emoji: "📚" },
  { id: "young-professional", label: "Young Professional", emoji: "💼" },
  { id: "parent", label: "Parent", emoji: "👨‍👩‍👧‍👦" },
  { id: "senior", label: "Senior", emoji: "🧓" },
  { id: "general", label: "Just exploring", emoji: "✨" }
];

const FIRST_TASKS = [
  {
    id: "watch-spark",
    title: "Watch your first Spark",
    description: "2-minute devotional video",
    icon: "🎬",
    points: 10
  },
  {
    id: "set-intention",
    title: "Set your daily intention",
    description: "What's your focus for today?",
    icon: "🎯",
    points: 10
  },
  {
    id: "morning-prayer",
    title: "Say a morning prayer",
    description: "Start your day with gratitude",
    icon: "🙏",
    points: 10
  }
];

export function QuickStartFlow({ onComplete, onSkip }: QuickStartFlowProps) {
  const [step, setStep] = useState(1);
  const [focusArea, setFocusArea] = useState<string>("");
  const [audienceSegment, setAudienceSegment] = useState<string>("");
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleFocusSelect = (id: string) => {
    setFocusArea(id);
    setTimeout(() => setStep(2), 300);
  };

  const handleAudienceSelect = (id: string) => {
    setAudienceSegment(id);
    setTimeout(() => setStep(3), 300);
  };

  const handleTaskComplete = (taskId: string) => {
    if (completedTasks.has(taskId)) return;

    const newCompleted = new Set(completedTasks);
    newCompleted.add(taskId);
    setCompletedTasks(newCompleted);

    // Celebrate first task
    celebrate("task");

    // Complete onboarding after first task
    setTimeout(() => {
      onComplete({
        focusArea,
        audienceSegment,
        firstTaskCompleted: true
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="relative w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Quick Setup</span>
            <button
              onClick={onSkip}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Skip for now
            </button>
          </div>
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-green-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Choose Focus */}
          {step === 1 && (
            <motion.div
              key="focus"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={spring.gentle}
            >
              <h2 className="text-3xl font-bold text-white mb-2">What's your main focus?</h2>
              <p className="text-gray-400 mb-8">Choose what resonates with you most</p>

              <div className="grid gap-4">
                {FOCUS_AREAS.map((area) => (
                  <motion.button
                    key={area.id}
                    onClick={() => handleFocusSelect(area.id)}
                    className={`group relative p-6 rounded-xl border-2 text-left transition-all ${
                      focusArea === area.id
                        ? "border-primary bg-primary/10"
                        : "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${area.color}20` }}
                      >
                        <area.icon className="h-7 w-7" style={{ color: area.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{area.title}</h3>
                        <p className="text-gray-400 text-sm">{area.description}</p>
                      </div>
                      {focusArea === area.id && (
                        <Check className="h-6 w-6 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Choose Audience */}
          {step === 2 && (
            <motion.div
              key="audience"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={spring.gentle}
            >
              <h2 className="text-3xl font-bold text-white mb-2">Tell us about yourself</h2>
              <p className="text-gray-400 mb-8">We'll personalize your experience</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {AUDIENCE_SEGMENTS.map((segment) => (
                  <motion.button
                    key={segment.id}
                    onClick={() => handleAudienceSelect(segment.id)}
                    className={`p-6 rounded-xl border-2 text-center transition-all ${
                      audienceSegment === segment.id
                        ? "border-primary bg-primary/10"
                        : "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-4xl mb-3">{segment.emoji}</div>
                    <div className="text-white font-semibold">{segment.label}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Complete First Task */}
          {step === 3 && (
            <motion.div
              key="first-task"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={spring.gentle}
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, ...spring.bouncy }}
                  className="inline-block mb-4"
                >
                  <Sparkles className="h-16 w-16 text-primary" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Ready for your first win?
                </h2>
                <p className="text-gray-400">
                  Complete one task to get started
                </p>
              </div>

              <div className="grid gap-4">
                {FIRST_TASKS.map((task, i) => {
                  const isCompleted = completedTasks.has(task.id);

                  return (
                    <motion.button
                      key={task.id}
                      onClick={() => handleTaskComplete(task.id)}
                      disabled={isCompleted}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        isCompleted
                          ? "border-green-500/30 bg-green-500/10"
                          : "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, ...spring.gentle }}
                      whileHover={{ scale: isCompleted ? 1 : 1.02 }}
                      whileTap={{ scale: isCompleted ? 1 : 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{task.icon}</div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold mb-1 ${isCompleted ? "text-green-400" : "text-white"}`}>
                            {task.title}
                          </h3>
                          <p className="text-gray-400 text-sm">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-bold">+{task.points} pts</span>
                          {isCompleted ? (
                            <Check className="h-6 w-6 text-green-400" />
                          ) : (
                            <ArrowRight className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
