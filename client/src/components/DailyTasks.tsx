/**
 * Enhanced Daily Tasks Component
 *
 * Three-tier task system (Essential/Bonus/Stretch) with:
 * - Audience-specific tasks
 * - Time estimates
 * - Point system
 * - Progress tracking
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, Star, Gift, Rocket,
  Clock, Flame, Target, ChevronDown, ChevronUp,
  Sparkles, Award
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { celebrate, celebrateTask, celebrateDailyGoal } from "@/lib/celebrations";
import { CircularProgress } from "@/components/gamification/CircularProgress";
import { useSwipe } from "@/hooks/useGestures";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

type TaskTier = "essential" | "bonus" | "stretch";
type AudienceSegment = "gen-z-student" | "young-professional" | "couple" | "parent" | "senior" | "general";

interface DailyTask {
  id: string;
  title: string;
  description: string;
  tier: TaskTier;
  points: number;
  estimatedMinutes: number;
  audienceSegments: AudienceSegment[];
  icon?: string;
}

interface TaskCompletion {
  taskId: string;
  completedAt: Date;
  points: number;
}

interface DailyProgress {
  date: string;
  completions: TaskCompletion[];
  totalPoints: number;
  essentialCompleted: number;
  bonusCompleted: number;
  stretchCompleted: number;
}

// Task definitions by audience
const TASK_LIBRARY: DailyTask[] = [
  // Essential Tasks - Universal
  {
    id: "watch-spark",
    title: "Watch Today's Spark",
    description: "Start your day with today's devotional video",
    tier: "essential",
    points: 10,
    estimatedMinutes: 2,
    audienceSegments: ["general", "gen-z-student", "young-professional", "couple", "parent", "senior"],
    icon: "🎬"
  },
  {
    id: "morning-prayer",
    title: "Morning Prayer",
    description: "Spend a moment in prayer",
    tier: "essential",
    points: 10,
    estimatedMinutes: 1,
    audienceSegments: ["general", "gen-z-student", "young-professional", "couple", "parent", "senior"],
    icon: "🙏"
  },
  {
    id: "journal-entry",
    title: "Journal Reflection",
    description: "Write down one thought from today's spark",
    tier: "essential",
    points: 15,
    estimatedMinutes: 5,
    audienceSegments: ["general", "gen-z-student", "young-professional", "couple", "parent", "senior"],
    icon: "✍️"
  },

  // Bonus Tasks - Gen Z
  {
    id: "share-story",
    title: "Share to Your Story",
    description: "Post today's spark to Instagram or TikTok",
    tier: "bonus",
    points: 15,
    estimatedMinutes: 1,
    audienceSegments: ["gen-z-student"],
    icon: "📱"
  },
  {
    id: "dm-friend",
    title: "Send to a Friend",
    description: "DM this spark to someone who needs it",
    tier: "bonus",
    points: 20,
    estimatedMinutes: 2,
    audienceSegments: ["gen-z-student", "young-professional"],
    icon: "💬"
  },

  // Bonus Tasks - Young Professional
  {
    id: "lunchtime-prayer",
    title: "Midday Prayer",
    description: "1-minute prayer during lunch break",
    tier: "bonus",
    points: 10,
    estimatedMinutes: 1,
    audienceSegments: ["young-professional"],
    icon: "☕"
  },
  {
    id: "mentor-check",
    title: "Encourage a Colleague",
    description: "Send an encouraging message to someone at work",
    tier: "bonus",
    points: 20,
    estimatedMinutes: 3,
    audienceSegments: ["young-professional"],
    icon: "💼"
  },

  // Bonus Tasks - Couples
  {
    id: "pray-together",
    title: "Pray as a Couple",
    description: "Pray together for 2 minutes",
    tier: "bonus",
    points: 20,
    estimatedMinutes: 2,
    audienceSegments: ["couple"],
    icon: "💑"
  },
  {
    id: "gratitude-text",
    title: "Gratitude Text",
    description: "Text your spouse one thing you're grateful for",
    tier: "bonus",
    points: 15,
    estimatedMinutes: 1,
    audienceSegments: ["couple"],
    icon: "❤️"
  },

  // Bonus Tasks - Parents
  {
    id: "bedtime-prayer",
    title: "Bedtime Prayer",
    description: "Pray with your kids before bed",
    tier: "bonus",
    points: 15,
    estimatedMinutes: 3,
    audienceSegments: ["parent"],
    icon: "🌙"
  },
  {
    id: "family-devotional",
    title: "Family Devotional",
    description: "Share today's spark with your kids",
    tier: "bonus",
    points: 20,
    estimatedMinutes: 10,
    audienceSegments: ["parent"],
    icon: "👨‍👩‍👧‍👦"
  },

  // Bonus Tasks - Seniors
  {
    id: "call-encourage",
    title: "Encouragement Call",
    description: "Call someone and encourage them",
    tier: "bonus",
    points: 20,
    estimatedMinutes: 10,
    audienceSegments: ["senior"],
    icon: "📞"
  },
  {
    id: "scripture-meditation",
    title: "Scripture Meditation",
    description: "Meditate on today's verse for 10 minutes",
    tier: "bonus",
    points: 15,
    estimatedMinutes: 10,
    audienceSegments: ["senior"],
    icon: "📖"
  },

  // Stretch Challenges
  {
    id: "lead-discussion",
    title: "Lead a Discussion",
    description: "Host or lead a discussion about today's topic",
    tier: "stretch",
    points: 30,
    estimatedMinutes: 20,
    audienceSegments: ["young-professional", "senior"],
    icon: "🎤"
  },
  {
    id: "prayer-session",
    title: "Join Live Prayer",
    description: "Participate in a live intercession session",
    tier: "stretch",
    points: 25,
    estimatedMinutes: 15,
    audienceSegments: ["general", "gen-z-student", "young-professional", "couple", "parent", "senior"],
    icon: "🙏"
  },
  {
    id: "conversation-prompt",
    title: "Deep Conversation",
    description: "Have a meaningful faith conversation with someone",
    tier: "stretch",
    points: 30,
    estimatedMinutes: 15,
    audienceSegments: ["couple", "parent", "senior"],
    icon: "💭"
  },
  {
    id: "goal-progress",
    title: "Update Your Goal",
    description: "Make progress on one of your spiritual goals",
    tier: "stretch",
    points: 25,
    estimatedMinutes: 10,
    audienceSegments: ["gen-z-student", "young-professional"],
    icon: "🎯"
  }
];

const TIER_CONFIG = {
  essential: {
    label: "Essential Tasks",
    icon: Star,
    color: "#7C9A8E",
    bgColor: "rgba(124, 154, 142, 0.1)",
    borderColor: "rgba(124, 154, 142, 0.3)"
  },
  bonus: {
    label: "Bonus Tasks",
    icon: Gift,
    color: "#D4A574",
    bgColor: "rgba(212, 165, 116, 0.1)",
    borderColor: "rgba(212, 165, 116, 0.3)"
  },
  stretch: {
    label: "Stretch Challenge",
    icon: Rocket,
    color: "#4A7C7C",
    bgColor: "rgba(74, 124, 124, 0.1)",
    borderColor: "rgba(74, 124, 124, 0.3)"
  }
};

/**
 * Swipeable Task Item Component
 * Swipe left to complete (mobile-first interaction)
 */
interface SwipeableTaskItemProps {
  task: DailyTask;
  isCompleted: boolean;
  isPending: boolean;
  config: typeof TIER_CONFIG[keyof typeof TIER_CONFIG];
  onComplete: () => void;
}

function SwipeableTaskItem({
  task,
  isCompleted,
  isPending,
  config,
  onComplete
}: SwipeableTaskItemProps) {
  const [swipeProgress, setSwipeProgress] = useState(0);

  const swipeHandlers = useSwipe(
    (direction) => {
      if (direction === "left" && !isCompleted && !isPending) {
        onComplete();
      }
    },
    { threshold: 80 }
  );

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl"
      drag="x"
      dragConstraints={{ left: -100, right: 0 }}
      dragElastic={0.1}
      onDragEnd={(_, info) => {
        if (info.offset.x < -80 && !isCompleted && !isPending) {
          onComplete();
        }
      }}
      onDrag={(_, info) => {
        const progress = Math.max(0, Math.min(100, (-info.offset.x / 100) * 100));
        setSwipeProgress(progress);
      }}
      {...swipeHandlers}
    >
      {/* Swipe Background Indicator */}
      {swipeProgress > 0 && (
        <motion.div
          className="absolute inset-y-0 right-0 flex items-center justify-end px-6"
          style={{
            width: `${swipeProgress}%`,
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            borderLeft: "2px solid rgba(34, 197, 94, 0.5)"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CheckCircle2 className="h-6 w-6 text-green-400" />
        </motion.div>
      )}

      <motion.button
        onClick={onComplete}
        disabled={isCompleted || isPending}
        className={`relative w-full p-4 border text-left transition-all ${
          isCompleted
            ? "bg-green-500/10 border-green-500/30"
            : "bg-white/5 border-white/10 hover:bg-white/10"
        }`}
        whileHover={{ scale: isCompleted ? 1 : 1.02 }}
        whileTap={{ scale: isCompleted ? 1 : 0.98 }}
        data-testid={`task-${task.id}`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{task.icon}</span>
              <h4 className={`font-semibold ${isCompleted ? "text-green-400" : "text-white"}`}>
                {task.title}
              </h4>
            </div>
            <p className="text-sm text-gray-400 mb-2">{task.description}</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-gray-500">
                <Clock className="h-3 w-3" />
                {task.estimatedMinutes} min
              </span>
              <span className="flex items-center gap-1 font-medium" style={{ color: config.color }}>
                <Award className="h-3 w-3" />
                +{task.points} pts
              </span>
            </div>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}

export function DailyTasks() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [expandedTiers, setExpandedTiers] = useState<TaskTier[]>(["essential", "bonus"]);

  // Get user's audience segment
  const audienceSegment: AudienceSegment = (user as any)?.audienceSegment || "general";

  // Filter tasks by audience
  const availableTasks = TASK_LIBRARY.filter(task =>
    task.audienceSegments.includes(audienceSegment) ||
    task.audienceSegments.includes("general")
  );

  // Fetch today's progress
  const { data: progress } = useQuery<DailyProgress>({
    queryKey: ["/api/daily-tasks/progress", new Date().toISOString().split('T')[0]],
    enabled: isAuthenticated,
  });

  const completedTaskIds = new Set(progress?.completions.map(c => c.taskId) || []);

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const task = availableTasks.find(t => t.id === taskId);
      if (!task) throw new Error("Task not found");

      return await apiRequest("POST", "/api/daily-tasks/complete", {
        taskId,
        points: task.points,
        date: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: (_: unknown, taskId: string) => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-tasks/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/progress"] });

      const task = availableTasks.find(t => t.id === taskId);

      // Single task celebration
      celebrateTask();
      toast.success(`${task?.icon || "✅"} Task completed! +${task?.points} points`);

      // Check for tier completion milestones
      const essentialTasks = availableTasks.filter(t => t.tier === "essential");
      const bonusTasks = availableTasks.filter(t => t.tier === "bonus");
      const stretchTasks = availableTasks.filter(t => t.tier === "stretch");

      const completedEssential = essentialTasks.filter(t =>
        completedTaskIds.has(t.id) || t.id === taskId
      );
      const completedBonus = bonusTasks.filter(t =>
        completedTaskIds.has(t.id) || t.id === taskId
      );
      const completedStretch = stretchTasks.filter(t =>
        completedTaskIds.has(t.id) || t.id === taskId
      );

      // Essential tasks complete
      if (completedEssential.length === essentialTasks.length) {
        celebrateDailyGoal();
        toast.success("🎉 All essential tasks complete! You're on fire!");
      }

      // All tasks in day complete (50 point goal reached)
      const totalCompleted = completedEssential.length + completedBonus.length + completedStretch.length;
      const totalTasks = essentialTasks.length + bonusTasks.length + stretchTasks.length;
      const estimatedPoints = (progress?.totalPoints || 0) + (task?.points || 0);

      if (estimatedPoints >= 50) {
        celebrate("daily-goal");
        toast.success("🔥 Daily goal achieved! 50+ points!");
      }
    },
    onError: () => {
      toast.error("Failed to complete task");
    }
  });

  const handleToggleTask = (taskId: string) => {
    if (completedTaskIds.has(taskId)) {
      toast.info("Task already completed!");
      return;
    }
    completeTaskMutation.mutate(taskId);
  };

  const toggleTier = (tier: TaskTier) => {
    setExpandedTiers(prev =>
      prev.includes(tier)
        ? prev.filter(t => t !== tier)
        : [...prev, tier]
    );
  };

  const tasksByTier = {
    essential: availableTasks.filter(t => t.tier === "essential"),
    bonus: availableTasks.filter(t => t.tier === "bonus"),
    stretch: availableTasks.filter(t => t.tier === "stretch")
  };

  const completionByTier = {
    essential: tasksByTier.essential.filter(t => completedTaskIds.has(t.id)).length,
    bonus: tasksByTier.bonus.filter(t => completedTaskIds.has(t.id)).length,
    stretch: tasksByTier.stretch.filter(t => completedTaskIds.has(t.id)).length
  };

  const totalPoints = progress?.totalPoints || 0;
  const dailyGoal = 50; // Essential tasks typically add up to ~35 points

  // Keyboard shortcuts for power users
  useKeyboardShortcuts([
    {
      key: "c",
      action: () => {
        // Complete first incomplete essential task
        const firstIncomplete = availableTasks.find(
          t => t.tier === "essential" && !completedTaskIds.has(t.id)
        );
        if (firstIncomplete) {
          handleToggleTask(firstIncomplete.id);
        }
      },
      description: "Complete next task",
      ignoreInputs: true
    }
  ]);

  if (!isAuthenticated) {
    return (
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="text-center">
          <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Daily Tasks</h3>
          <p className="text-gray-400 mb-4">Track your daily spiritual practices and earn rewards</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl"
          >
            Sign In to Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Daily Tasks
            </h2>
            <p className="text-gray-400 text-sm">Your spiritual growth checklist</p>
          </div>
          <div className="relative flex items-center justify-center">
            <CircularProgress
              progress={Math.min(100, (totalPoints / dailyGoal) * 100)}
              size={90}
              strokeWidth={8}
              color="#7C9A8E"
              glow={totalPoints >= dailyGoal}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{totalPoints}</span>
              <span className="text-xs text-gray-400">/ {dailyGoal}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(tasksByTier) as TaskTier[]).map(tier => {
            const config = TIER_CONFIG[tier];
            const completed = completionByTier[tier];
            const total = tasksByTier[tier].length;
            const progress = total > 0 ? (completed / total) * 100 : 0;

            return (
              <div
                key={tier}
                className="rounded-xl p-3 border"
                style={{
                  backgroundColor: config.bgColor,
                  borderColor: config.borderColor
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <config.icon className="h-4 w-4" style={{ color: config.color }} />
                    <span className="text-xs font-medium text-white/70">{config.label}</span>
                  </div>
                  <div className="relative" style={{ width: 32, height: 32 }}>
                    <CircularProgress
                      progress={progress}
                      size={32}
                      strokeWidth={3}
                      color={config.color}
                      glow={completed === total && total > 0}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">
                        {completed}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-white/60">
                  {completed === total && total > 0 ? "Complete!" : `${total - completed} left`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Lists */}
      <div className="p-6 space-y-4">
        {(Object.keys(tasksByTier) as TaskTier[]).map(tier => {
          const config = TIER_CONFIG[tier];
          const tasks = tasksByTier[tier];
          const isExpanded = expandedTiers.includes(tier);
          const completed = completionByTier[tier];

          if (tasks.length === 0) return null;

          return (
            <div key={tier} className="space-y-3">
              {/* Tier Header */}
              <button
                onClick={() => toggleTier(tier)}
                className="w-full flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-white/5"
                style={{ borderLeft: `3px solid ${config.color}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    <config.icon className="h-5 w-5" style={{ color: config.color }} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white">{config.label}</h3>
                    <p className="text-xs text-gray-400">
                      {completed === tasks.length ? "All complete!" : `${completed}/${tasks.length} completed`}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {/* Task List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {tasks.map(task => {
                      const isCompleted = completedTaskIds.has(task.id);
                      const isPending = completeTaskMutation.isPending && completeTaskMutation.variables === task.id;

                      return (
                        <SwipeableTaskItem
                          key={task.id}
                          task={task}
                          isCompleted={isCompleted}
                          isPending={isPending}
                          config={config}
                          onComplete={() => handleToggleTask(task.id)}
                        />
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer - Daily Summary */}
      {totalPoints >= dailyGoal && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-green-500/20 to-primary/20 border-t border-green-500/30"
        >
          <div className="flex items-center justify-center gap-3">
            <Flame className="h-6 w-6 text-green-400" />
            <p className="text-white font-medium">
              🎉 Daily goal achieved! You're building an amazing streak!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
