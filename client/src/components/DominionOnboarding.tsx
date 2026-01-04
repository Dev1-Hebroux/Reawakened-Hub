import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, School, GraduationCap, Briefcase, Rocket, Heart, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

interface DominionOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
}

const audiences = [
  { id: "schools", label: "Student (15-18)", icon: School, color: "from-[#4A7C7C] to-[#3A6666]" },
  { id: "universities", label: "University", icon: GraduationCap, color: "from-[#5A7A8E] to-[#4A6A7E]" },
  { id: "early-career", label: "Young Professional", icon: Briefcase, color: "from-[#D4A574] to-[#B8956A]" },
  { id: "builders", label: "Entrepreneur/Creative", icon: Rocket, color: "from-[#7C9A8E] to-[#5A7A6E]" },
  { id: "couples", label: "Couple", icon: Heart, color: "from-[#6B8B7E] to-[#5A7A6E]" },
];

const modes = [
  { 
    id: "reflection", 
    label: "Reflection Mode", 
    icon: BookOpen,
    description: "Thoughtful quotes, questions, and actions for personal growth",
    color: "from-[#7C9A8E] to-[#5A7A6E]"
  },
  { 
    id: "faith", 
    label: "Faith Overlay", 
    icon: BookOpen,
    description: "Includes scripture references and prayer lines",
    color: "from-[#4A7C7C] to-[#3A6666]"
  },
];

export function DominionOnboarding({ isOpen, onComplete }: DominionOnboardingProps) {
  const [step, setStep] = useState<'audience' | 'mode'>('audience');
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'reflection' | 'faith' | null>(null);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/auth/user/preferences", {
        contentMode: selectedMode,
        audienceSegment: selectedAudience,
      });
    },
    onSuccess: () => {
      if (selectedAudience) {
        localStorage.setItem('user_audience_segment', selectedAudience);
      }
      if (selectedMode) {
        localStorage.setItem('sparks_view_mode', selectedMode);
      }
      localStorage.setItem('dominion_onboarding_complete', 'true');
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast.success("Preferences saved!");
      onComplete();
    },
    onError: () => {
      toast.error("Failed to save preferences");
    }
  });

  const handleContinue = () => {
    if (step === 'audience' && selectedAudience) {
      setStep('mode');
    } else if (step === 'mode' && selectedMode) {
      saveMutation.mutate();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('dominion_onboarding_complete', 'true');
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-[calc(100%-2rem)] max-w-lg bg-gray-900 rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-white/60" />
          </button>

          <div className="p-4 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-orange-500 mb-3 sm:mb-4">
                <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-2">
                {step === 'audience' ? 'Who are you?' : 'Choose your experience'}
              </h2>
              <p className="text-white/60 text-sm sm:text-base">
                {step === 'audience' 
                  ? 'Select what best describes you for personalized content'
                  : 'How would you like to experience DOMINION?'
                }
              </p>
            </div>

            {step === 'audience' ? (
              <div className="space-y-2 sm:space-y-3" data-testid="audience-selection">
                {audiences.map((audience) => {
                  const Icon = audience.icon;
                  const isSelected = selectedAudience === audience.id;
                  return (
                    <button
                      key={audience.id}
                      onClick={() => setSelectedAudience(audience.id)}
                      className={`w-full p-3 sm:p-4 rounded-xl border transition-all flex items-center gap-3 sm:gap-4 ${
                        isSelected
                          ? `bg-gradient-to-r ${audience.color} border-transparent`
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      data-testid={`button-audience-${audience.id}`}
                    >
                      <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-white/20' : `bg-gradient-to-r ${audience.color}`
                      }`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <span className="text-white font-medium text-sm sm:text-base">{audience.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4" data-testid="mode-selection">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id as 'reflection' | 'faith')}
                      className={`w-full p-4 sm:p-6 rounded-xl border transition-all text-left ${
                        isSelected
                          ? `bg-gradient-to-r ${mode.color} border-transparent`
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      data-testid={`button-mode-${mode.id}`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-white/20' : `bg-gradient-to-r ${mode.color}`
                        }`}>
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white mb-1">{mode.label}</h3>
                          <p className={`text-xs sm:text-sm ${isSelected ? 'text-white/80' : 'text-white/60'}`}>
                            {mode.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-2 sm:gap-3 mt-6 sm:mt-8">
              {step === 'mode' && (
                <Button
                  variant="outline"
                  onClick={() => setStep('audience')}
                  className="flex-1 border-white/20 text-white hover:bg-white/10 text-sm sm:text-base py-2 sm:py-2.5"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleContinue}
                disabled={(step === 'audience' && !selectedAudience) || (step === 'mode' && !selectedMode) || saveMutation.isPending}
                className="flex-1 bg-white text-black hover:bg-white/90 font-bold text-sm sm:text-base py-2 sm:py-2.5"
                data-testid="button-continue"
              >
                {saveMutation.isPending ? 'Saving...' : step === 'mode' ? 'Get Started' : 'Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-center gap-2 mt-4 sm:mt-6">
              <div className={`h-1.5 sm:h-2 w-6 sm:w-8 rounded-full transition-all ${step === 'audience' ? 'bg-white' : 'bg-white/30'}`} />
              <div className={`h-1.5 sm:h-2 w-6 sm:w-8 rounded-full transition-all ${step === 'mode' ? 'bg-white' : 'bg-white/30'}`} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
