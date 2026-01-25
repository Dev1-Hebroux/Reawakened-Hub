import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { spring, cardHover } from "@/lib/animations"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable premium hover depth effects */
  animated?: boolean
  /** Enable glassmorphism effect */
  glass?: boolean
  /** Elevation level (1-3) for shadow depth */
  elevation?: 1 | 2 | 3
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, animated = false, glass = false, elevation = 1, ...props }, ref) => {
    const elevationClasses = {
      1: "shadow-sm hover:shadow-md",
      2: "shadow-md hover:shadow-lg",
      3: "shadow-lg hover:shadow-xl",
    }

    const glassClasses = glass
      ? "bg-white/10 backdrop-blur-md border-white/20"
      : "bg-card border"

    if (animated) {
      // Omit HTML event props that conflict with Framer Motion props
      const {
        onDrag, onDragEnd, onDragStart, onDragEnter, onDragLeave, onDragOver, onDrop,
        onAnimationStart, onAnimationEnd, onAnimationIteration,
        ...motionProps
      } = props
      return (
        <motion.div
          ref={ref as any}
          className={cn(
            "rounded-xl text-card-foreground transition-all duration-300",
            glassClasses,
            elevationClasses[elevation],
            className
          )}
          whileHover={cardHover}
          transition={spring.gentle}
          {...motionProps}
        />
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl text-card-foreground shadow",
          glass ? "bg-white/10 backdrop-blur-md border-white/20" : "bg-card border",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
