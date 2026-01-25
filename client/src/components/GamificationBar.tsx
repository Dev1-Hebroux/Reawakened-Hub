import { motion } from "framer-motion";
import { Flame, Trophy, Zap, Award, Crown, Sunrise, Share2, Brain, Target, Users, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { StreakFlame, MiniStreak } from "@/components/gamification/StreakFlame";
import { LevelBadge } from "@/components/gamification/LevelProgressRing";

interface UserProgress {
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate?: string;
  };
  badges: {
    id: number;
    userId: string;
    badgeId: number;
    awardedAt: string;
    badge: {
      id: number;
      code: string;
      name: string;
      description: string;
      iconUrl: string | null;
    };
  }[];
  progression?: {
    level: number;
    totalPoints: number;
    pointsToNextLevel: number;
    nextLevelAt: number;
  };
  gracePeriod?: {
    graceDaysUsed: number;
    graceDaysAllowed: number;
    lastGraceReset: string;
  };
}

const badgeIcons: Record<string, LucideIcon> = {
  FIRST_SPARK: Flame,
  STREAK_3: Zap,
  STREAK_7: Trophy,
  STREAK_14: Award,
  STREAK_30: Crown,
  EARLY_BIRD: Sunrise,
  SHARER: Share2,
  REFLECTOR: Brain,
  CHALLENGER: Target,
  COMMUNITY: Users
};

const LEVEL_NAMES = [
  'Seeker', 'Learner', 'Disciple', 'Servant', 'Teacher',
  'Leader', 'Influencer', 'Mentor', 'Guide', 'Champion'
];

const allBadges = [
  { code: 'FIRST_SPARK', name: 'First Spark', description: 'Watched your first spark' },
  { code: 'STREAK_3', name: 'On Fire', description: '3-day streak' },
  { code: 'STREAK_7', name: 'Week Warrior', description: '7-day streak' },
  { code: 'STREAK_14', name: 'Consistent', description: '14-day streak' },
  { code: 'STREAK_30', name: 'Champion', description: '30-day streak' },
  { code: 'EARLY_BIRD', name: 'Early Bird', description: 'Completed tasks before 8am' },
  { code: 'REFLECTOR', name: 'Deep Thinker', description: 'Completed 10 reflections' },
  { code: 'CHALLENGER', name: 'Challenger', description: 'Completed all weekly challenges' },
];

function getLevelName(level: number): string {
  return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] || 'Champion';
}

function getPointsForLevel(level: number): number {
  return level * 100;
}

export function GamificationBar() {
  const { isAuthenticated } = useAuth();

  const { data: progress } = useQuery<UserProgress>({
    queryKey: ["/api/me/progress"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="border-b mt-16 md:mt-[72px]" style={{ backgroundColor: 'rgba(15, 26, 25, 0.8)', borderColor: 'rgba(250, 248, 245, 0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center gap-3" style={{ color: 'rgba(250, 248, 245, 0.5)' }}>
            <Flame className="h-4 w-4" style={{ color: '#7C9A8E' }} />
            <span className="text-sm">Sign in to track your streak and earn badges</span>
          </div>
        </div>
      </div>
    );
  }

  const currentStreak = progress?.streak?.currentStreak || 0;
  const earnedBadgeCodes = progress?.badges?.map(b => b.badge?.code) || [];
  const level = progress?.progression?.level || 1;
  const totalPoints = progress?.progression?.totalPoints || 0;
  const pointsToNextLevel = progress?.progression?.pointsToNextLevel || 100;
  const nextLevelAt = progress?.progression?.nextLevelAt || 100;
  const levelProgress = ((totalPoints % nextLevelAt) / nextLevelAt) * 100;
  const graceDaysUsed = progress?.gracePeriod?.graceDaysUsed || 0;
  const graceDaysAllowed = progress?.gracePeriod?.graceDaysAllowed || 1;

  return (
    <div className="border-b mt-16 md:mt-[72px]" style={{ backgroundColor: 'rgba(15, 26, 25, 0.6)', borderColor: 'rgba(250, 248, 245, 0.08)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Streak Section */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MiniStreak
                streak={currentStreak}
              />
            </motion.div>

            <div className="hidden md:block h-6 w-px" style={{ backgroundColor: 'rgba(250, 248, 245, 0.1)' }} />

            {/* Level Section */}
            <motion.div
              className="hidden md:flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <LevelBadge level={level} size="md" />
              <div className="flex flex-col">
                <span className="text-xs font-medium" style={{ color: 'rgba(212, 165, 116, 0.9)' }}>
                  {getLevelName(level)}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-20 h-1 rounded-full" style={{ backgroundColor: 'rgba(212, 165, 116, 0.2)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: '#D4A574' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${levelProgress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: 'rgba(250, 248, 245, 0.4)' }}>
                    {pointsToNextLevel}
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="hidden lg:block h-6 w-px" style={{ backgroundColor: 'rgba(250, 248, 245, 0.1)' }} />

            {/* Badges Count */}
            <div className="hidden lg:flex items-center gap-2">
              <Trophy className="h-4 w-4" style={{ color: '#4A7C7C' }} />
              <span className="text-sm" style={{ color: 'rgba(250, 248, 245, 0.5)' }}>
                {earnedBadgeCodes.length} badges
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {allBadges.slice(0, 8).map((badge, i) => {
              const isEarned = earnedBadgeCodes.includes(badge.code);
              const IconComponent = badgeIcons[badge.code] || Award;

              return (
                <motion.div
                  key={badge.code}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative group flex-shrink-0"
                >
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer"
                    style={{
                      backgroundColor: isEarned ? 'rgba(212, 165, 116, 0.1)' : 'transparent',
                      border: isEarned
                        ? '1px solid rgba(212, 165, 116, 0.4)'
                        : '1px dashed rgba(250, 248, 245, 0.15)'
                    }}
                  >
                    {isEarned ? (
                      <IconComponent className="h-4 w-4" style={{ color: '#D4A574' }} />
                    ) : (
                      <Lock className="h-3.5 w-3.5" style={{ color: 'rgba(250, 248, 245, 0.2)' }} />
                    )}
                  </div>
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg"
                    style={{ backgroundColor: '#1a2744', color: '#FAF8F5', border: '1px solid rgba(250, 248, 245, 0.1)' }}
                  >
                    <div className="font-semibold">{badge.name}</div>
                    <div className="text-xs" style={{ color: 'rgba(250, 248, 245, 0.6)' }}>
                      {badge.description}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {allBadges.length > 8 && (
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(250, 248, 245, 0.05)',
                  border: '1px solid rgba(250, 248, 245, 0.1)'
                }}
              >
                <span className="text-xs font-semibold" style={{ color: 'rgba(250, 248, 245, 0.5)' }}>
                  +{allBadges.length - 8}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
