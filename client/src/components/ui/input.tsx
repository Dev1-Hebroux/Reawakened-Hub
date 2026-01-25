import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { spring } from "@/lib/animations"

export interface InputProps extends React.ComponentProps<"input"> {
  /** Enable premium focus glow animations */
  animated?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, animated = false, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    if (animated) {
      // Omit HTML event props that conflict with Framer Motion props
      const {
        onDrag, onDragEnd, onDragStart, onDragEnter, onDragLeave, onDragOver, onDrop,
        onAnimationStart, onAnimationEnd, onAnimationIteration,
        ...motionProps
      } = props
      return (
        <motion.div className="relative">
          <motion.input
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              isFocused && "ring-2 ring-primary/20 border-primary shadow-lg",
              className
            )}
            ref={ref as any}
            animate={{
              scale: isFocused ? 1.01 : 1,
            }}
            transition={spring.gentle}
            onFocus={(e) => {
              setIsFocused(true)
              motionProps.onFocus?.(e as any)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              motionProps.onBlur?.(e as any)
            }}
            {...motionProps}
          />
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-md pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={spring.gentle}
              style={{
                boxShadow: "0 0 20px var(--theme-glow-color, rgba(124, 154, 142, 0.3))",
              }}
            />
          )}
        </motion.div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
