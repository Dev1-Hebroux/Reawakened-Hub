import { motion } from "framer-motion";
import { Flame, Trophy, Star, Lock } from "lucide-react";
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

const badgeEmojis: Record<string, string> = {
  FIRST_SPARK: '🔥',
  STREAK_3: '⚡',
  STREAK_7: '🏆',
  STREAK_14: '💎',
  STREAK_30: '👑',
  EARLY_BIRD: '🌅',
  SHARER: '🚀',
  REFLECTOR: '🧠',
  CHALLENGER: '🎯',
  COMMUNITY: '🤝'
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
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-3 text-white/60">
            <Flame className="h-5 w-5 text-amber-400" />
            <span className="text-sm">Sign in to track your streak and earn badges</span>
          </div>
        </div>
      </div>
    );
  }

  const currentStreak = progress?.streak?.currentStreak || 0;
  const earnedBadgeCodes = progress?.badges?.map(b => b.badge?.code) || [];

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                currentStreak > 0 
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                  : 'bg-white/10'
              }`}>
                <Flame className={`h-6 w-6 ${currentStreak > 0 ? 'text-white' : 'text-white/40'}`} />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white" data-testid="text-streak-count">
                    {currentStreak}
                  </span>
                  <span className="text-white/60 text-sm">day streak</span>
                </div>
                {progress?.streak?.longestStreak && progress.streak.longestStreak > currentStreak && (
                  <p className="text-xs text-white/40">Best: {progress.streak.longestStreak} days</p>
                )}
              </div>
            </motion.div>

            <div className="hidden md:block h-8 w-px bg-white/10" />

            <div className="hidden md:flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <span className="text-sm text-white/60">{earnedBadgeCodes.length} badges</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allBadges.slice(0, 5).map((badge, i) => {
              const isEarned = earnedBadgeCodes.includes(badge.code);
              return (
                <motion.div
                  key={badge.code}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative group`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                    isEarned 
                      ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/50' 
                      : 'bg-white/5 border border-white/10 grayscale opacity-40'
                  }`}>
                    {isEarned ? badgeEmojis[badge.code] : <Lock className="h-4 w-4 text-white/30" />}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
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
