import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { 
  X, ArrowRight, ArrowLeft, Compass, Target, TrendingUp,
  Sparkles, Heart, MessageCircle, Users, BookOpen, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  userName?: string;
}

const tourSteps = [
  {
    id: "welcome",
    title: "Welcome to Reawakened!",
    description: "You've joined a community of young believers pursuing God's purpose. Let us show you around.",
    icon: Sparkles,
    color: "#D4A574",
    scripture: "Jeremiah 29:11",
    scriptureText: "For I know the plans I have for you",
  },
  {
    id: "vision",
    title: "Life Vision Pathway",
    description: "Discover your God-given purpose through our guided framework. Map your life, clarify your values, and craft a vision that aligns with His will.",
    icon: Compass,
    color: "#4A7C7C",
    link: "/vision",
    cta: "Start Vision Journey",
    features: ["Wheel of Life Assessment", "Core Values Discovery", "Purpose Statement Builder"],
  },
  {
    id: "goals",
    title: "Goals & Resolutions",
    description: "Set SMART goals rooted in biblical wisdom. Build daily habits, track your progress, and celebrate milestones along the way.",
    icon: Target,
    color: "#D4A574",
    link: "/goals",
    cta: "Set Your Goals",
    features: ["SMART Goal Framework", "Daily Habit Tracking", "Progress Milestones"],
  },
  {
    id: "growth",
    title: "Growth Tools",
    description: "Personal development tools to help you grow. Discover your strengths, understand your communication style, and develop emotional intelligence.",
    icon: TrendingUp,
    color: "#7C9A8E",
    link: "/growth",
    cta: "Explore Tools",
    features: ["Strengths Discovery", "4 Styles Assessment", "EQ Development"],
  },
  {
    id: "community",
    title: "Community & Sparks",
    description: "Connect with fellow believers, share prayer requests, and receive daily devotionals to keep your faith ignited.",
    icon: Users,
    color: "#9B8AA6",
    link: "/community",
    cta: "Join Community",
    features: ["Daily Devotionals", "Prayer Requests", "Mission Reports"],
  },
  {
    id: "aicoach",
    title: "Awake AI",
    description: "Get personalized guidance on your goals, habits, and spiritual journey. Access Awake AI from the navigation bar anytime.",
    icon: MessageCircle,
    color: "#4A7C7C",
    cta: "Got It!",
    features: ["Context-Aware Advice", "Goal Support", "24/7 Availability"],
  },
];

export function OnboardingTour({ isOpen, onComplete, userName }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [, navigate] = useLocation();

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleNavigate = (link: string) => {
    onComplete();
    navigate(link);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleSkip()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
        >
          {/* Progress Bar */}
          <div className="h-1 bg-gray-100 flex">
            {tourSteps.map((_, i) => (
              <div
                key={i}
                className="flex-1 transition-all duration-300"
                style={{
                  backgroundColor: i <= currentStep ? step.color : 'transparent',
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="p-6 pb-4 flex items-start justify-between">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${step.color}15` }}
            >
              <step.icon className="h-7 w-7" style={{ color: step.color }} />
            </div>
            <button
              onClick={handleSkip}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              data-testid="button-tour-skip"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
                  {step.id === "welcome" && userName ? `Welcome, ${userName}!` : step.title}
                </h2>
                <p className="text-gray-600 mb-4">{step.description}</p>

                {step.scripture && (
                  <div className="bg-[#FAF8F5] rounded-xl p-4 mb-4">
                    <p className="text-sm italic text-gray-600">"{step.scriptureText}"</p>
                    <p className="text-xs font-medium text-[#4A7C7C] mt-1">— {step.scripture}</p>
                  </div>
                )}

                {step.features && (
                  <div className="space-y-2 mb-4">
                    {step.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" style={{ color: step.color }} />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  className="text-gray-600"
                  data-testid="button-tour-prev"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {step.link && (
                <Button
                  variant="outline"
                  onClick={() => handleNavigate(step.link!)}
                  className="border-2"
                  style={{ borderColor: step.color, color: step.color }}
                  data-testid={`button-tour-goto-${step.id}`}
                >
                  {step.cta}
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="text-white"
                style={{ backgroundColor: step.color }}
                data-testid="button-tour-next"
              >
                {isLastStep ? "Get Started" : "Next"}
                {!isLastStep && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="px-6 pb-4 flex justify-center gap-1.5">
            {tourSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep ? 'w-6' : ''
                }`}
                style={{
                  backgroundColor: i === currentStep ? step.color : '#E5E7EB',
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to manage onboarding state
export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('reawakened_onboarding_complete');
    if (!hasSeenTour) {
      // Delay to let the page load first
      const timer = setTimeout(() => setShowTour(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTour = () => {
    localStorage.setItem('reawakened_onboarding_complete', 'true');
    setShowTour(false);
  };

  const resetTour = () => {
    localStorage.removeItem('reawakened_onboarding_complete');
    setShowTour(true);
  };

  return { showTour, completeTour, resetTour };
}
