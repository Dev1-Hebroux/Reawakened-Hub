/**
 * IntercessionModal Component
 *
 * Live intercession prayer modal with:
 * - Featured image/video panel
 * - Live chat interface
 * - Action buttons (like, share)
 */

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2, Play } from "lucide-react";
import type { Spark } from "@shared/schema";
import { LiveIntercession } from "@/components/LiveIntercession";
import dailyBg from "@assets/generated_images/cinematic_sunrise_devotional_background.png";

interface IntercessionModalProps {
  isOpen: boolean;
  todaySpark: Spark | null;
  onClose: () => void;
}

export function IntercessionModal({ isOpen, todaySpark, onClose }: IntercessionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors z-50"
            data-testid="button-close-intercession"
          >
            <X className="h-8 w-8" />
          </button>

          <div className="w-full max-w-5xl h-[80vh] flex flex-col md:flex-row gap-6 items-stretch">
            {/* Left - Media Panel */}
            <div className="relative w-full md:w-1/2 h-64 md:h-full bg-black rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
              <img
                src={todaySpark?.thumbnailUrl || todaySpark?.imageUrl || dailyBg}
                alt="Prayer community"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Floating Action Buttons */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                <button className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors">
                  <Heart className="h-5 w-5 text-white" />
                </button>
                <span className="text-center text-white text-xs">0</span>
                <button className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors">
                  <Share2 className="h-5 w-5 text-white" />
                </button>
                <span className="text-center text-white text-xs">Share</span>
              </div>

              {/* Play button overlay */}
              <div className="absolute bottom-4 left-4">
                <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                  <Play className="h-5 w-5 text-white ml-0.5" />
                </div>
              </div>
            </div>

            {/* Right - Live Intercession Chat */}
            <div className="w-full md:w-1/2 h-full">
              <LiveIntercession sparkId={todaySpark?.id} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
