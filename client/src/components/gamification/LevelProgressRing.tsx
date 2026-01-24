/**
 * Level Progress Ring Component
 * Shows user's current level and progress to next level
 * Inspired by gaming progression systems with premium animations
 */

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Award, Zap } from "lucide-react";
import { spring } from "@/lib/animations";
import { AnimatedCounter } from "./CircularProgress";

const LEVEL_NAMES = [
  { name: "Seeker", color: "#9CA3AF", icon: Star },
  { name: "Learner", color: "#7C9A8E", icon: Star },
  { name: "Disciple", color: "#6B8E8E", icon: Award },
  { name: "Servant", color: "#4A7C7C", icon: Award },
  { name: "Teacher", color: "#D4A574", icon: Trophy },
  { name: "Leader", color: "#C49464", icon: Trophy },
  { name: "Influencer", color: "#9B8AA6", icon: Zap },
  { name: "Mentor", color: "#8A7995", icon: Zap },
  { name: "Guide", color: "#C17767", icon: Trophy },
  { name: "Champion", color: "#B16657", icon: Trophy },
];

interface LevelProgressRingProps {
  /** Current level (1-10) */
  level: number;
  /** Total points accumulated */
  totalPoints: number;
  /** Points needed for next level */
  pointsToNextLevel: number;
  /** Points at which next level is reached */
  nextLevelAt: number;
  /** Size of the component */
  size?: "sm" | "md" | "lg";
  /** Show level name */
  showLevelName?: boolean;
  /** Animate level up */
  isLevelingUp?: boolean;
  /** Custom className */
  className?: string;
}

export function LevelProgressRing({
  level,
  totalPoints,
  pointsToNextLevel,
  nextLevelAt,
  size = "md",
  showLevelName = true,
  isLevelingUp = false,
  className = "",
}: LevelProgressRingProps) {
  const currentLevel = Math.min(Math.max(level, 1), 10);
  const levelData = LEVEL_NAMES[currentLevel - 1];
  const progress = ((nextLevelAt - pointsToNextLevel) / nextLevelAt) * 100;

  const sizes = {
    sm: { ring: 80, stroke: 6, iconSize: 20, fontSize: "text-xl" },
    md: { ring: 120, stroke: 8, iconSize: 28, fontSize: "text-3xl" },
    lg: { ring: 160, stroke: 10, iconSize: 36, fontSize: "text-4xl" },
  };

  const config = sizes[size];
  const radius = (config.ring - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const LevelIcon = levelData.icon;

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Ring Container */}
      <div className={`relative`} style={{ width: config.ring, height: config.ring }}>
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ backgroundColor: levelData.color }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* SVG Ring */}
        <svg width={config.ring} height={config.ring} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={radius}
            stroke={`${levelData.color}20`}
            strokeWidth={config.stroke}
            fill="none"
          />

          {/* Progress ring */}
          <motion.circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={radius}
            stroke={levelData.color}
            strokeWidth={config.stroke}
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              duration: 1.5,
              ease: [0.33, 1, 0.68, 1],
            }}
            style={{
              strokeDasharray: circumference,
              filter: `drop-shadow(0 0 8px ${levelData.color}80)`,
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {isLevelingUp ? (
              <motion.div
                key="level-up"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={spring.bouncy}
                className="flex flex-col items-center"
              >
                <Trophy size={config.iconSize} style={{ color: levelData.color }} />
                <motion.div
                  className="text-xs font-bold mt-1"
                  style={{ color: levelData.color }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  LEVEL UP!
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="level-display"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <LevelIcon size={config.iconSize} style={{ color: levelData.color }} />
                <motion.div
                  className={`${config.fontSize} font-bold mt-1`}
                  style={{ color: levelData.color }}
                >
                  {currentLevel}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Level-up particles */}
        {isLevelingUp &&
          [...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: levelData.color }}
              initial={{
                opacity: 0,
                x: config.ring / 2,
                y: config.ring / 2,
              }}
              animate={{
                opacity: [0, 1, 0],
                x: config.ring / 2 + Math.cos((i * Math.PI) / 4) * 60,
                y: config.ring / 2 + Math.sin((i * Math.PI) / 4) * 60,
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
      </div>

      {/* Level Information */}
      {showLevelName && (
        <motion.div
          className="mt-3 text-center space-y-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-sm font-bold" style={{ color: levelData.color }}>
            {levelData.name}
          </div>
          <div className="text-xs text-muted-foreground">
            <AnimatedCounter value={pointsToNextLevel} suffix=" pts" /> to next level
          </div>
        </motion.div>
      )}

      {/* Progress percentage badge */}
      <motion.div
        className="absolute -top-2 -right-2 bg-white border-2 rounded-full px-2 py-0.5 shadow-md"
        style={{ borderColor: levelData.color }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, ...spring.bouncy }}
      >
        <span className="text-xs font-bold" style={{ color: levelData.color }}>
          {Math.round(progress)}%
        </span>
      </motion.div>
    </div>
  );
}

/**
 * Compact Level Badge
 * Smaller version for headers and cards
 */
interface LevelBadgeProps {
  level: number;
  size?: "xs" | "sm" | "md";
  onClick?: () => void;
}

export function LevelBadge({ level, size = "sm", onClick }: LevelBadgeProps) {
  const currentLevel = Math.min(Math.max(level, 1), 10);
  const levelData = LEVEL_NAMES[currentLevel - 1];

  const sizes = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
  };

  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 16,
  };

  const LevelIcon = levelData.icon;

  return (
    <motion.button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full font-bold shadow-md ${sizes[size]}`}
      style={{
        backgroundColor: levelData.color,
        color: "white",
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <LevelIcon size={iconSizes[size]} />
      <span>Lvl {currentLevel}</span>
    </motion.button>
  );
}

/**
 * Level Progression Timeline
 * Shows all levels with current progress
 */
interface LevelTimelineProps {
  currentLevel: number;
  className?: string;
}

export function LevelTimeline({ currentLevel, className = "" }: LevelTimelineProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
        Level Progression
      </h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Level nodes */}
        <div className="space-y-3">
          {LEVEL_NAMES.map((levelData, index) => {
            const level = index + 1;
            const isCurrentLevel = level === currentLevel;
            const isUnlocked = level <= currentLevel;
            const LevelIcon = levelData.icon;

            return (
              <motion.div
                key={level}
                className="relative flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Level marker */}
                <motion.div
                  className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isUnlocked ? "bg-white" : "bg-gray-100"
                  }`}
                  style={{
                    borderColor: isUnlocked ? levelData.color : "#E5E7EB",
                  }}
                  animate={isCurrentLevel ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <LevelIcon
                    size={16}
                    style={{ color: isUnlocked ? levelData.color : "#9CA3AF" }}
                  />
                </motion.div>

                {/* Level info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        isUnlocked ? "" : "text-muted-foreground"
                      }`}
                      style={{ color: isUnlocked ? levelData.color : undefined }}
                    >
                      {levelData.name}
                    </span>
                    {isCurrentLevel && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Level {level}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
