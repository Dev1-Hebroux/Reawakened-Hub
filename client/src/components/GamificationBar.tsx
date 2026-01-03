import { motion } from "framer-motion";
import { Flame, Trophy, Zap, Award, Crown, Sunrise, Share2, Brain, Target, Users, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

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

const allBadges = [
  { code: 'FIRST_SPARK', name: 'First Spark' },
  { code: 'STREAK_3', name: 'On Fire' },
  { code: 'STREAK_7', name: 'Week Warrior' },
  { code: 'STREAK_14', name: 'Consistent' },
  { code: 'STREAK_30', name: 'Champion' },
];

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

  return (
    <div className="border-b mt-16 md:mt-[72px]" style={{ backgroundColor: 'rgba(15, 26, 25, 0.6)', borderColor: 'rgba(250, 248, 245, 0.08)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ 
                  backgroundColor: currentStreak > 0 ? 'rgba(124, 154, 142, 0.15)' : 'rgba(250, 248, 245, 0.05)',
                  border: currentStreak > 0 ? '1px solid rgba(124, 154, 142, 0.3)' : '1px solid rgba(250, 248, 245, 0.1)'
                }}
              >
                <Flame 
                  className="h-5 w-5" 
                  style={{ color: currentStreak > 0 ? '#7C9A8E' : 'rgba(250, 248, 245, 0.3)' }} 
                />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span 
                    className="text-xl font-semibold" 
                    style={{ color: '#FAF8F5' }}
                    data-testid="text-streak-count"
                  >
                    {currentStreak}
                  </span>
                  <span className="text-sm" style={{ color: 'rgba(74, 124, 124, 0.8)' }}>day streak</span>
                </div>
                {progress?.streak?.longestStreak && progress.streak.longestStreak > currentStreak && (
                  <p className="text-xs" style={{ color: 'rgba(250, 248, 245, 0.3)' }}>
                    Best: {progress.streak.longestStreak} days
                  </p>
                )}
              </div>
            </motion.div>

            <div className="hidden md:block h-6 w-px" style={{ backgroundColor: 'rgba(250, 248, 245, 0.1)' }} />

            <div className="hidden md:flex items-center gap-2">
              <Trophy className="h-4 w-4" style={{ color: '#4A7C7C' }} />
              <span className="text-sm" style={{ color: 'rgba(250, 248, 245, 0.5)' }}>
                {earnedBadgeCodes.length} badges
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {allBadges.map((badge, i) => {
              const isEarned = earnedBadgeCodes.includes(badge.code);
              const IconComponent = badgeIcons[badge.code] || Award;
              
              return (
                <motion.div
                  key={badge.code}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative group"
                >
                  <div 
                    className="h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
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
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none"
                    style={{ backgroundColor: '#1a2744', color: '#FAF8F5' }}
                  >
                    {badge.name}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
