/**
 * Welcome Animation Component
 * Engaging first impression with smooth animations
 * Goal: Delight users immediately (< 5 seconds)
 */

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Flame, Heart, Star } from "lucide-react";
import { spring } from "@/lib/animations";
import { useState, useEffect } from "react";

interface WelcomeAnimationProps {
  onComplete: () => void;
  userName?: string;
}

export function WelcomeAnimation({ onComplete, userName }: WelcomeAnimationProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1000),
      setTimeout(() => setStep(2), 2500),
      setTimeout(() => setStep(3), 3500),
      setTimeout(() => onComplete(), 4500)
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="relative w-full max-w-md px-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Sparkle Burst */}
          {step === 0 && (
            <motion.div
              key="sparkle"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              transition={spring.bouncy}
              className="flex items-center justify-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-24 w-24 text-primary" />
              </motion.div>

              {/* Particle burst */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary"
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.cos((i * Math.PI) / 6) * 100,
                    y: Math.sin((i * Math.PI) / 6) * 100
                  }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              ))}
            </motion.div>
          )}

          {/* Step 2: Welcome Message */}
          {step === 1 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={spring.gentle}
              className="text-center space-y-4"
            >
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-white"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, ...spring.gentle }}
              >
                Welcome{userName ? `, ${userName}` : ""}!
              </motion.h1>
              <motion.p
                className="text-xl text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Your spiritual journey begins now
              </motion.p>
            </motion.div>
          )}

          {/* Step 3: Core Values */}
          {step === 2 && (
            <motion.div
              key="values"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {[
                { icon: Flame, text: "Build daily habits", color: "#F59E0B" },
                { icon: Heart, text: "Grow in faith", color: "#EF4444" },
                { icon: Star, text: "Earn rewards", color: "#D4A574" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2, ...spring.gentle }}
                  className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <item.icon className="h-6 w-6" style={{ color: item.color }} />
                  </div>
                  <span className="text-lg font-medium text-white">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Step 4: Get Started Pulse */}
          {step === 3 && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={spring.bouncy}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-green-400 rounded-full text-white font-bold text-xl"
              >
                Let's get started!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
