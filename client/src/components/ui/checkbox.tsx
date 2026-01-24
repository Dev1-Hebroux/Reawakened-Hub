import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { spring, iconBounce } from "@/lib/animations"

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Enable premium bounce animations */
  animated?: boolean
}

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, animated = false, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState(false)

  React.useEffect(() => {
    setIsChecked(props.checked === true || props.checked === "indeterminate")
  }, [props.checked])

  if (animated) {
    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        transition={spring.snappy}
      >
        <CheckboxPrimitive.Root
          ref={ref}
          className={cn(
            "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-colors",
            className
          )}
          onCheckedChange={(checked) => {
            setIsChecked(checked === true || checked === "indeterminate")
            props.onCheckedChange?.(checked)
          }}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            className={cn("grid place-content-center text-current")}
            asChild
          >
            <AnimatePresence mode="wait">
              {isChecked && (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={spring.bouncy}
                >
                  <Check className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
      </motion.div>
    )
  }

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("grid place-content-center text-current")}
      >
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
