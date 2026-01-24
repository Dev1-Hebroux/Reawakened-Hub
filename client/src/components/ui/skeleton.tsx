/**
 * Enhanced Skeleton Component
 * Premium loading states with shimmer animations
 */

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation variant */
  variant?: "pulse" | "shimmer" | "wave" | "none";
  /** Shape preset */
  shape?: "default" | "circle" | "button" | "card" | "text" | "avatar";
  /** Enable glassmorphism effect */
  glass?: boolean;
  /** Width (only for shape presets) */
  width?: string | number;
  /** Height (only for shape presets) */
  height?: string | number;
}

const shapePresets = {
  default: "rounded-md",
  circle: "rounded-full aspect-square",
  button: "rounded-lg h-10",
  card: "rounded-xl h-48",
  text: "rounded h-4",
  avatar: "rounded-full aspect-square w-10 h-10"
};

function Skeleton({
  className,
  variant = "shimmer",
  shape = "default",
  glass = false,
  width,
  height,
  ...props
}: SkeletonProps) {
  const getAnimationClass = () => {
    switch (variant) {
      case "pulse":
        return "animate-pulse";
      case "shimmer":
        return "shimmer";
      case "wave":
        return "animate-wave";
      case "none":
        return "";
      default:
        return "shimmer";
    }
  };

  const style = {
    ...(width && { width: typeof width === "number" ? `${width}px` : width }),
    ...(height && { height: typeof height === "number" ? `${height}px` : height })
  };

  if (glass) {
    return (
      <div
        className={cn(
          "glass-card relative overflow-hidden",
          shapePresets[shape],
          getAnimationClass(),
          className
        )}
        style={style}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/20",
        shapePresets[shape],
        getAnimationClass(),
        className
      )}
      style={style}
      {...props}
    />
  );
}

/**
 * Animated Skeleton with Framer Motion
 * Use for more complex loading animations
 */
function AnimatedSkeleton({
  className,
  delay = 0,
  ...props
}: SkeletonProps & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Skeleton className={className} {...props} />
    </motion.div>
  );
}

/**
 * Skeleton Group - Staggered loading animation
 */
interface SkeletonGroupProps {
  count: number;
  variant?: "pulse" | "shimmer" | "wave";
  shape?: "default" | "circle" | "button" | "card" | "text" | "avatar";
  stagger?: number;
  className?: string;
}

function SkeletonGroup({
  count,
  variant = "shimmer",
  shape = "default",
  stagger = 0.1,
  className
}: SkeletonGroupProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <AnimatedSkeleton
          key={i}
          variant={variant}
          shape={shape}
          delay={i * stagger}
          className={className}
        />
      ))}
    </>
  );
}

/**
 * Content-aware skeleton presets
 */
function SkeletonCard({ className, ...props }: Omit<SkeletonProps, "shape">) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton shape="card" {...props} />
      <Skeleton shape="text" width="80%" {...props} />
      <Skeleton shape="text" width="60%" {...props} />
    </div>
  );
}

function SkeletonAvatar({ className, size = 40, ...props }: Omit<SkeletonProps, "shape"> & { size?: number }) {
  return (
    <Skeleton
      shape="circle"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
}

function SkeletonText({
  lines = 3,
  className,
  ...props
}: Omit<SkeletonProps, "shape"> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          shape="text"
          width={i === lines - 1 ? "70%" : "100%"}
          {...props}
        />
      ))}
    </div>
  );
}

function SkeletonButton({ className, ...props }: Omit<SkeletonProps, "shape">) {
  return <Skeleton shape="button" className={cn("w-24", className)} {...props} />;
}

/**
 * Spark Card Skeleton - Specific to app
 */
function SkeletonSparkCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card p-6 space-y-4", className)}>
      <div className="flex items-center gap-3">
        <SkeletonAvatar size={48} variant="shimmer" />
        <div className="flex-1 space-y-2">
          <Skeleton shape="text" width="40%" variant="shimmer" />
          <Skeleton shape="text" width="60%" variant="shimmer" />
        </div>
      </div>
      <Skeleton shape="card" height={200} variant="shimmer" />
      <div className="flex gap-2">
        <SkeletonButton variant="shimmer" />
        <SkeletonButton variant="shimmer" />
      </div>
    </div>
  );
}

export {
  Skeleton,
  AnimatedSkeleton,
  SkeletonGroup,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonText,
  SkeletonButton,
  SkeletonSparkCard
};
