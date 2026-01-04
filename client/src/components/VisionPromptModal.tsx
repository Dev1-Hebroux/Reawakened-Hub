import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Compass, ArrowRight, X, Target, TrendingUp, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";

export function VisionPromptModal() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth() as { user: User | null; isAuthenticated: boolean };
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const dismissedKey = `vision_prompt_dismissed_${user.id}`;
    const alreadyDismissed = localStorage.getItem(dismissedKey);
    const onboardingComplete = localStorage.getItem('dominion_onboarding_complete');
    
    // Only show Vision prompt if onboarding is complete and prompt not dismissed
    if (!alreadyDismissed && onboardingComplete === 'true') {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]);

  const handleDismiss = () => {
    if (user) {
      localStorage.setItem(`vision_prompt_dismissed_${user.id}`, "true");
    }
    setShowPrompt(false);
  };

  const handleStartVision = () => {
    handleDismiss();
    navigate("/vision");
  };

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] mx-auto bg-[#FAF8F5] border-[#E8E4DE] p-0 overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-br from-[#7C9A8E] to-[#4A7C7C] p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Compass className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <button 
              onClick={handleDismiss}
              className="text-white/70 hover:text-white transition-colors"
              data-testid="button-close-vision-prompt"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-3 sm:mt-4 mb-2">
            Want a simple plan for this season?
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            Our Vision Journey helps you get crystal clear on where you're headed.
          </p>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            {[
              { icon: Target, text: "Set meaningful goals that stick" },
              { icon: Heart, text: "Align with your core values" },
              { icon: TrendingUp, text: "Build daily habits that last" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#7C9A8E]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#7C9A8E]" />
                </div>
                <span className="text-[#2C3E2D] font-medium text-sm sm:text-base">{item.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleStartVision}
              className="w-full bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white py-5 sm:py-6 rounded-xl font-semibold text-sm sm:text-base"
              data-testid="button-start-vision-prompt"
            >
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Start My Vision Journey
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="text-[#6B7B6E] hover:text-[#2C3E2D] text-sm sm:text-base"
              data-testid="button-maybe-later"
            >
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
