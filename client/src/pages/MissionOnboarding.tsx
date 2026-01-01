import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { 
  Rocket, 
  Globe2, 
  Heart,
  Timer,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Check,
  Target,
  Flame,
  Users,
  Loader2
} from "lucide-react";
import type { MissionFocus } from "@shared/schema";

const steps = [
  { id: 1, title: "Welcome", subtitle: "Join the journey" },
  { id: 2, title: "Your Why", subtitle: "What drives you?" },
  { id: 3, title: "Focus Area", subtitle: "Choose a focus" },
  { id: 4, title: "Commitment", subtitle: "Set your rhythm" },
  { id: 5, title: "Ready!", subtitle: "Start making impact" },
];

const whyOptions = [
  { id: "encounter", label: "Find deeper meaning", icon: Sparkles },
  { id: "grow", label: "Grow personally", icon: Target },
  { id: "impact", label: "Make global impact", icon: Globe2 },
  { id: "community", label: "Join a community", icon: Users },
];

const commitmentOptions = [
  { id: 5, label: "5 min/day", description: "Quick but consistent" },
  { id: 15, label: "15 min/day", description: "Build the habit" },
  { id: 30, label: "30 min/day", description: "Go deeper" },
];

export function MissionOnboarding() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedWhy, setSelectedWhy] = useState<string[]>([]);
  const [selectedFocus, setSelectedFocus] = useState<MissionFocus | null>(null);
  const [selectedCommitment, setSelectedCommitment] = useState(15);
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const { data: focuses = [], isLoading: focusesLoading } = useQuery<MissionFocus[]>({
    queryKey: ["/api/mission/focuses"],
    queryFn: async () => {
      const res = await fetch("/api/mission/focuses");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/mission/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mission/profile"] });
    },
  });

  const createAdoptionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/mission/adoptions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mission/adoptions"] });
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/mission/plan", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mission/plan"] });
    },
  });

  const handleComplete = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to complete setup");
      return;
    }

    try {
      await createProfileMutation.mutateAsync({
        primaryPillar: "harvest",
        motivations: selectedWhy,
        onboardingCompleted: true,
      });

      if (selectedFocus) {
        await createAdoptionMutation.mutateAsync({
          focusId: selectedFocus.id,
          status: "active",
          durationDays: 21,
        });
      }

      await createPlanMutation.mutateAsync({
        weekStartDate: new Date().toISOString(),
        prayerGoalMinutes: selectedCommitment * 7,
        dailyCommitmentMinutes: selectedCommitment,
      });

      toast.success("You're all set! Let's make an impact.");
      navigate("/missions");
    } catch (error) {
      toast.error("Failed to complete setup. Please try again.");
    }
  };

  const displayFocuses = focuses.length > 0 ? focuses : [
    { id: 1, name: "Unreached Youth in North Africa", type: "people_group", region: "North Africa", population: "45M+" },
    { id: 2, name: "Urban Professionals in Tokyo", type: "people_group", region: "East Asia", population: "14M+" },
    { id: 3, name: "Rural Communities in South India", type: "people_group", region: "South Asia", population: "120M+" },
    { id: 4, name: "University Students in Europe", type: "people_group", region: "Europe", population: "25M+" },
  ];

  const toggleWhy = (id: string) => {
    setSelectedWhy(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return selectedWhy.length > 0;
      case 3: return selectedFocus !== null;
      case 4: return selectedCommitment > 0;
      case 5: return true;
      default: return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 5 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] via-[#1a2744]/95 to-[#1a2744]/90">
      <Navbar />
      
      <main className="pt-28 pb-32 px-4">
        <div className="max-w-lg mx-auto">
          
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  currentStep > step.id 
                    ? "bg-primary text-white" 
                    : currentStep === step.id 
                    ? "bg-white text-primary" 
                    : "bg-white/10 text-white/40"
                }`}>
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 transition-all ${
                    currentStep > step.id ? "bg-primary" : "bg-white/10"
                  }`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="h-24 w-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Rocket className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-3xl font-display font-bold text-white mb-4">
                  Make a Difference
                </h1>
                <p className="text-white/70 mb-8 max-w-sm mx-auto">
                  You're about to join thousands of people making real impact around the world. Let's set up your profile.
                </p>
                <div className="space-y-3 text-left bg-white/5 rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-white/80">Support communities in need</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#4A7C7C]/20 flex items-center justify-center">
                      <Globe2 className="h-4 w-4 text-[#4A7C7C]" />
                    </div>
                    <span className="text-white/80">Take meaningful action from anywhere</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#D4A574]/20 flex items-center justify-center">
                      <Users className="h-4 w-4 text-[#D4A574]" />
                    </div>
                    <span className="text-white/80">Join a global community</span>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">
                  What drives you?
                </h2>
                <p className="text-white/60 mb-6 text-center">
                  Select what resonates with you (pick all that apply)
                </p>
                <div className="space-y-3">
                  {whyOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleWhy(option.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        selectedWhy.includes(option.id)
                          ? "bg-primary/20 border-primary"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                      data-testid={`why-${option.id}`}
                    >
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        selectedWhy.includes(option.id) ? "bg-primary" : "bg-white/10"
                      }`}>
                        <option.icon className={`h-6 w-6 ${
                          selectedWhy.includes(option.id) ? "text-white" : "text-white/60"
                        }`} />
                      </div>
                      <span className="text-white font-medium">{option.label}</span>
                      {selectedWhy.includes(option.id) && (
                        <Check className="h-5 w-5 text-primary ml-auto" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">
                  Choose Your Focus
                </h2>
                <p className="text-white/60 mb-6 text-center">
                  Pick a community to support over the next 21 days
                </p>
                {focusesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 text-white/50 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayFocuses.map((focus: any) => (
                      <motion.button
                        key={focus.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedFocus(focus)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                          selectedFocus?.id === focus.id
                            ? "bg-primary/20 border-primary"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                        data-testid={`focus-${focus.id}`}
                      >
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                          selectedFocus?.id === focus.id ? "bg-primary" : "bg-white/10"
                        }`}>
                          <Globe2 className={`h-6 w-6 ${
                            selectedFocus?.id === focus.id ? "text-white" : "text-white/60"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{focus.name}</p>
                          <p className="text-xs text-white/50">{focus.region} • {focus.population}</p>
                        </div>
                        {selectedFocus?.id === focus.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">
                  Set Your Daily Rhythm
                </h2>
                <p className="text-white/60 mb-6 text-center">
                  How much time can you dedicate each day?
                </p>
                <div className="space-y-3">
                  {commitmentOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCommitment(option.id)}
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                        selectedCommitment === option.id
                          ? "bg-primary/20 border-primary"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                      data-testid={`commitment-${option.id}`}
                    >
                      <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                        selectedCommitment === option.id ? "bg-primary" : "bg-white/10"
                      }`}>
                        <Timer className={`h-7 w-7 ${
                          selectedCommitment === option.id ? "text-white" : "text-white/60"
                        }`} />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold text-lg">{option.label}</p>
                        <p className="text-sm text-white/50">{option.description}</p>
                      </div>
                      {selectedCommitment === option.id && (
                        <Check className="h-6 w-6 text-primary ml-auto" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="h-24 w-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                  <Flame className="h-12 w-12 text-green-400" />
                </div>
                <h1 className="text-3xl font-display font-bold text-white mb-4">
                  You're Ready!
                </h1>
                <p className="text-white/70 mb-8 max-w-sm mx-auto">
                  Your profile is set. Here's your commitment:
                </p>
                <div className="bg-white/5 rounded-2xl p-6 mb-6 text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Focus Area</span>
                    <span className="text-white font-medium">{selectedFocus?.name || "Not selected"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Daily Commitment</span>
                    <span className="text-white font-medium">{selectedCommitment} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Challenge Duration</span>
                    <span className="text-white font-medium">21 days</span>
                  </div>
                </div>
                <p className="text-xs text-white/50 mb-4 flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Optional: Add faith-based content in your settings
                </p>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-2xl"
                  onClick={handleComplete}
                  disabled={createProfileMutation.isPending}
                  data-testid="button-complete-setup"
                >
                  {createProfileMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Start Making Impact
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 mt-8">
            {currentStep > 1 && currentStep < 5 && (
              <Button
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10 py-5 rounded-2xl"
                onClick={prevStep}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </Button>
            )}
            {currentStep < 5 && (
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl"
                onClick={nextStep}
                disabled={!canProceed()}
                data-testid="button-next-step"
              >
                {currentStep === 1 ? "Let's Go" : "Continue"}
                <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
