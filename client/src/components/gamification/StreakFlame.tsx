/**
 * Streak Flame Component
 * Animated fire effect that grows with streak intensity
 * Visual representation of user's daily commitment
 */

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { spring } from "@/lib/animations";

interface StreakFlameProps {
  /** Current streak count */
  streak: number;
  /** Longest streak count */
  longestStreak?: number;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show streak number */
  showNumber?: boolean;
  /** Enable glow effect */
  glow?: boolean;
  /** Custom className */
  className?: string;
}

export function StreakFlame({
  streak,
  longestStreak,
  size = "md",
  showNumber = true,
  glow = true,
  className = "",
}: StreakFlameProps) {
  // Determine flame color based on streak length
  const getFlameColor = () => {
    if (streak === 0) return "#9CA3AF"; // Gray
    if (streak < 3) return "#F59E0B"; // Amber
    if (streak < 7) return "#F97316"; // Orange
    if (streak < 14) return "#EF4444"; // Red
    if (streak < 30) return "#DC2626"; // Dark Red
    return "#7C2D12"; // Deep Red (Champion)
  };

  const getFlameIntensity = () => {
    if (streak === 0) return 0;
    if (streak < 3) return 0.5;
    if (streak < 7) return 0.7;
    if (streak < 14) return 0.85;
    return 1;
  };

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 48,
  };

  const flameColor = getFlameColor();
  const intensity = getFlameIntensity();
  const isActive = streak > 0;
  const isNewRecord = longestStreak !== undefined && streak > longestStreak;

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Flame Animation Container */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Glow effect */}
        {glow && isActive && (
          <motion.div
            className="absolute inset-0 rounded-full blur-xl"
            style={{ backgroundColor: flameColor }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.2 * intensity, 0.4 * intensity, 0.2 * intensity],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Flame Icon */}
        <motion.div
          className="relative flex items-center justify-center w-full h-full"
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: isActive ? 1 : 0.7,
            rotate: 0,
          }}
          transition={spring.bouncy}
        >
          <motion.div
            animate={
              isActive
                ? {
                    y: [-2, 2, -2],
                    scale: [1, 1.05, 1],
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Flame
              size={iconSizes[size]}
              style={{ color: flameColor }}
              fill={isActive ? flameColor : "none"}
              className={isActive ? "drop-shadow-lg" : ""}
            />
          </motion.div>
        </motion.div>

        {/* Streak particles (for high streaks) */}
        {streak >= 7 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: flameColor,
                  left: "50%",
                  top: "50%",
                }}
                initial={{
                  opacity: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 20],
                  y: [0, -20 - Math.random() * 10],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Streak Number */}
      {showNumber && (
        <motion.div
          className="mt-2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="text-2xl font-bold"
            style={{ color: flameColor }}
            animate={isNewRecord ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {streak}
          </motion.div>
          <div className="text-xs text-muted-foreground">day streak</div>
        </motion.div>
      )}

      {/* New Record Badge */}
      {isNewRecord && (
        <motion.div
          className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={spring.bouncy}
        >
          NEW!
        </motion.div>
      )}

      {/* Milestone Badge */}
      {streak > 0 && streak % 7 === 0 && (
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full"
          initial={{ scale: 0, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={spring.bouncy}
        >
          {streak === 7 && "🔥 Week"}
          {streak === 14 && "💪 Fortnight"}
          {streak === 21 && "⭐ 3 Weeks"}
          {streak === 30 && "🏆 Month"}
          {streak > 30 && streak % 30 === 0 && `🎉 ${streak / 30} Month${streak > 30 ? 's' : ''}`}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Streak Progress Bar
 * Linear alternative for compact displays
 */
interface StreakProgressProps {
  currentStreak: number;
  goal?: number;
  className?: string;
}

export function StreakProgress({
  currentStreak,
  goal = 30,
  className = "",
}: StreakProgressProps) {
  const progress = Math.min((currentStreak / goal) * 100, 100);
  const segments = 7; // Show week segments

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="font-medium">Current Streak</span>
        <span className="text-muted-foreground">
          {currentStreak} / {goal} days
        </span>
      </div>

      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        {/* Progress fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 via-red-500 to-red-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
          style={{
            boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)",
          }}
        />

        {/* Week segment markers */}
        {[...Array(segments)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-white/50"
            style={{ left: `${((i + 1) / segments) * 100}%` }}
          />
        ))}
      </div>

      {/* Milestones */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Start</span>
        <span>1 Week</span>
        <span>Goal</span>
      </div>
    </div>
  );
}

/**
 * Mini Streak Indicator
 * Compact version for navbar/sidebar
 */
interface MiniStreakProps {
  streak: number;
  onClick?: () => void;
}

export function MiniStreak({ streak, onClick }: MiniStreakProps) {
  const isActive = streak > 0;
  const color = streak >= 7 ? "#EF4444" : "#F59E0B";

  return (
    <motion.button
      onClick={onClick}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={
          isActive
            ? {
                scale: [1, 1.2, 1],
              }
            : {}
        }
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Flame
          size={16}
          style={{ color }}
          fill={isActive ? color : "none"}
        />
      </motion.div>
      <span className="text-sm font-semibold" style={{ color }}>
        {streak}
      </span>

      {/* Pulsing indicator for active streak */}
      {isActive && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}
    </motion.button>
  );
}
