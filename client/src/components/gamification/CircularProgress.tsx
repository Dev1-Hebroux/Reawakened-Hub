/**
 * Circular Progress Component
 * Apple Watch Activity-inspired progress rings
 * Shows visual progress with smooth animations
 */

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { spring } from "@/lib/animations";

interface CircularProgressProps {
  /** Progress value (0-100) */
  progress: number;
  /** Ring size in pixels */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Primary color for the progress */
  color?: string;
  /** Background track color */
  trackColor?: string;
  /** Show percentage text in center */
  showValue?: boolean;
  /** Custom label */
  label?: string;
  /** Animation duration in seconds */
  duration?: number;
  /** Ring glow effect */
  glow?: boolean;
  /** Custom className */
  className?: string;
}

export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 8,
  color = "#7C9A8E",
  trackColor = "rgba(124, 154, 142, 0.1)",
  showValue = true,
  label,
  duration = 1.5,
  glow = false,
  className = "",
}: CircularProgressProps) {
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    // Smooth progress animation
    const timer = setTimeout(() => {
      setCurrentProgress(Math.min(Math.max(progress, 0), 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (currentProgress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration,
            ease: [0.33, 1, 0.68, 1],
          }}
          style={{
            strokeDasharray: circumference,
            filter: glow ? `drop-shadow(0 0 8px ${color}80)` : undefined,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <motion.span
            className="text-2xl font-bold"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring.bouncy}
          >
            {Math.round(currentProgress)}%
          </motion.span>
        )}
        {label && (
          <motion.span
            className="text-xs text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {label}
          </motion.span>
        )}
      </div>
    </div>
  );
}

/**
 * Multi-Ring Progress (like Apple Watch)
 * Shows multiple progress rings in concentric circles
 */
interface Ring {
  progress: number;
  color: string;
  label: string;
  glow?: boolean;
}

interface MultiRingProgressProps {
  rings: Ring[];
  size?: number;
  className?: string;
}

export function MultiRingProgress({
  rings,
  size = 160,
  className = "",
}: MultiRingProgressProps) {
  const strokeWidth = 10;
  const spacing = 14;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {rings.map((ring, index) => {
          const radius = (size - strokeWidth) / 2 - index * spacing;
          const circumference = radius * 2 * Math.PI;
          const offset = circumference - (ring.progress / 100) * circumference;

          return (
            <g key={index}>
              {/* Background track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={`${ring.color}20`}
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Progress ring */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={ring.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{
                  duration: 1.5,
                  delay: index * 0.2,
                  ease: [0.33, 1, 0.68, 1],
                }}
                style={{
                  strokeDasharray: circumference,
                  filter: ring.glow ? `drop-shadow(0 0 6px ${ring.color}60)` : undefined,
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-4">
        {rings.map((ring, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-1.5 text-xs"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 + 0.5 }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: ring.color }}
            />
            <span className="text-muted-foreground">{ring.label}</span>
            <span className="font-semibold" style={{ color: ring.color }}>
              {Math.round(ring.progress)}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Animated Counter
 * Counts up to a target number with smooth animation
 */
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  suffix = "",
  prefix = "",
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

/**
 * Radial Progress Bar
 * Alternative style with gradient fills
 */
interface RadialProgressProps {
  progress: number;
  size?: number;
  thickness?: number;
  gradient?: [string, string];
  label?: string;
  icon?: React.ReactNode;
}

export function RadialProgress({
  progress,
  size = 100,
  thickness = 12,
  gradient = ["#7C9A8E", "#4A7C7C"],
  label,
  icon,
}: RadialProgressProps) {
  const radius = (size - thickness) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>

        {/* Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={thickness}
          fill="none"
        />

        {/* Progress with gradient */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {icon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={spring.bouncy}
          >
            {icon}
          </motion.div>
        )}
        {label && (
          <span className="text-xs text-muted-foreground mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}
