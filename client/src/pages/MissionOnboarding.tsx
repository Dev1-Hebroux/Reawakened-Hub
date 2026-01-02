import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import confetti from "canvas-confetti";
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
  Loader2,
  LogIn,
  BookOpen,
  Compass,
  Trophy,
  Plane,
  MessageCircle
} from "lucide-react";
import type { MissionFocus } from "@shared/schema";

const ONBOARDING_STORAGE_KEY = "reawakened_onboarding_data";

const steps = [
  { id: 1, title: "Welcome", subtitle: "Join the mission" },
  { id: 2, title: "Features", subtitle: "What awaits you" },
  { id: 3, title: "Your Why", subtitle: "What drives you?" },
  { id: 4, title: "Prayer Focus", subtitle: "Adopt a focus" },
  { id: 5, title: "Commitment", subtitle: "Set your rhythm" },
  { id: 6, title: "Ready!", subtitle: "Start your mission" },
];

const whyOptions = [
  { id: "encounter", label: "Encounter God deeper", icon: Sparkles },
  { id: "grow", label: "Grow as a disciple", icon: Target },
  { id: "impact", label: "Make global impact", icon: Globe2 },
  { id: "community", label: "Join a movement", icon: Users },
];

const commitmentOptions = [
  { id: 5, label: "5 min/day", description: "Quick but consistent" },
  { id: 15, label: "15 min/day", description: "Build the habit" },
  { id: 30, label: "30 min/day", description: "Go deeper" },
];

const featureShowcase = [
  { id: "sparks", icon: Sparkles, title: "Daily Sparks", description: "Start each day with devotionals", color: "bg-orange-500" },
  { id: "community", icon: MessageCircle, title: "Community Hub", description: "Connect with believers", color: "bg-green-500" },
  { id: "vision", icon: Compass, title: "Vision Journey", description: "Discover your purpose", color: "bg-teal-500" },
  { id: "challenges", icon: Trophy, title: "Growth Challenges", description: "Build lasting habits", color: "bg-purple-500" },
  { id: "missions", icon: Plane, title: "Mission Trips", description: "Go into all the world", color: "bg-blue-500" },
];

const defaultFocuses = [
  { id: 1, name: "Unreached Youth in North Africa", type: "people_group", region: "North Africa", population: "45M+" },
  { id: 2, name: "Urban Professionals in Tokyo", type: "people_group", region: "East Asia", population: "14M+" },
  { id: 3, name: "Rural Communities in South India", type: "people_group", region: "South Asia", population: "120M+" },
  { id: 4, name: "University Students in Europe", type: "people_group", region: "Europe", population: "25M+" },
  { id: 5, name: "Young Believers in the UK", type: "people_group", region: "United Kingdom", population: "12M+" },
  { id: 6, name: "Gen-Z in the United States", type: "people_group", region: "USA", population: "70M+" },
  { id: 7, name: "Youth in Brazil", type: "people_group", region: "Brazil", population: "50M+" },
  { id: 8, name: "Young Professionals in Australia", type: "people_group", region: "Australia", population: "8M+" },
  { id: 9, name: "Campus Students in Nigeria", type: "people_group", region: "Nigeria", population: "25M+" },
  { id: 10, name: "Youth in Saudi Arabia", type: "people_group", region: "Middle East", population: "10M+" },
  { id: 11, name: "Urban Youth in China", type: "people_group", region: "China", population: "200M+" },
  { id: 12, name: "Young Adults in India", type: "people_group", region: "India", population: "350M+" },
];

export function MissionOnboarding() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedWhy, setSelectedWhy] = useState<string[]>([]);
  const [selectedFocus, setSelectedFocus] = useState<MissionFocus | null>(null);
  const [selectedCommitment, setSelectedCommitment] = useState(15);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [customFocus, setCustomFocus] = useState("");
  const [isOthersSelected, setIsOthersSelected] = useState(false);
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

  useEffect(() => {
    const savedData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (savedData && isAuthenticated) {
      const parsed = JSON.parse(savedData);
      if (parsed.autoSave) {
        handleAutoSave(parsed);
      }
    }
  }, [isAuthenticated]);

  const handleAutoSave = async (data: any) => {
    try {
      setSelectedWhy(data.selectedWhy || []);
      setSelectedFocus(data.selectedFocus);
      setSelectedCommitment(data.selectedCommitment || 15);
      setCustomFocus(data.customFocus || "");
      setIsOthersSelected(data.isOthersSelected || false);
      
      await performCompletion(
        data.selectedWhy,
        data.selectedFocus,
        data.selectedCommitment,
        data.customFocus,
        data.isOthersSelected
      );
      
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (error) {
      console.error("Auto-save failed:", error);
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  };

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

  const sendWelcomeEmailMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/send-welcome-email", data);
      return res.json();
    },
  });

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const performCompletion = async (
    whyChoices: string[],
    focus: MissionFocus | null,
    commitment: number,
    customFocusText: string,
    othersSelected: boolean
  ) => {
    await createProfileMutation.mutateAsync({
      primaryPillar: "harvest",
      motivations: whyChoices,
      onboardingCompleted: true,
    });

    if (focus && !othersSelected) {
      await createAdoptionMutation.mutateAsync({
        focusId: focus.id,
        status: "active",
        durationDays: 21,
      });
    }

    await createPlanMutation.mutateAsync({
      weekStartDate: new Date().toISOString(),
      prayerGoalMinutes: commitment * 7,
      dailyCommitmentMinutes: commitment,
    });

    const prayerFocusName = othersSelected && customFocusText 
      ? customFocusText 
      : focus?.name;

    sendWelcomeEmailMutation.mutate({
      prayerFocus: prayerFocusName,
      dailyCommitment: commitment,
      motivations: whyChoices,
    });

    triggerConfetti();
    toast.success("🎉 Mission profile created! Let's go!");
    
    setTimeout(() => {
      navigate("/missions");
    }, 1500);
  };

  const handleComplete = async () => {
    if (!isAuthenticated) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({
        selectedWhy,
        selectedFocus,
        selectedCommitment,
        customFocus,
        isOthersSelected,
        autoSave: true,
      }));
      setShowLoginModal(true);
      return;
    }

    try {
      await performCompletion(selectedWhy, selectedFocus, selectedCommitment, customFocus, isOthersSelected);
    } catch (error) {
      toast.error("Failed to complete setup. Please try again.");
    }
  };

  const displayFocuses = focuses.length > 0 ? focuses : defaultFocuses;

  const toggleWhy = (id: string) => {
    setSelectedWhy(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const handleFocusSelect = (focus: any) => {
    setSelectedFocus(focus);
    setIsOthersSelected(false);
    setCustomFocus("");
  };

  const handleOthersSelect = () => {
    setIsOthersSelected(true);
    setSelectedFocus(null);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return true;
      case 3: return selectedWhy.length > 0;
      case 4: return selectedFocus !== null || (isOthersSelected && customFocus.trim().length > 0);
      case 5: return selectedCommitment > 0;
      case 6: return true;
      default: return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 6 && canProceed()) {
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
      
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="max-w-md bg-white border-gray-200">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-gray-900">
              Sign in to Continue
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              Create a free account to save your mission profile and start your journey.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-6">
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl font-semibold"
              data-testid="button-login-onboarding"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
            <p className="text-center text-sm text-gray-500">
              Your choices will be saved automatically
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
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
                  <div className={`w-4 md:w-6 h-0.5 transition-all ${
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
                  Start Your Mission
                </h1>
                <p className="text-white/70 mb-8 max-w-sm mx-auto">
                  You're about to join thousands of believers making digital impact for the Kingdom. Let's set up your mission profile.
                </p>
                <div className="space-y-3 text-left bg-white/5 rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-white/80">Pray for unreached people groups</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#4A7C7C]/20 flex items-center justify-center">
                      <Globe2 className="h-4 w-4 text-[#4A7C7C]" />
                    </div>
                    <span className="text-white/80">Take digital mission actions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#D4A574]/20 flex items-center justify-center">
                      <Users className="h-4 w-4 text-[#D4A574]" />
                    </div>
                    <span className="text-white/80">Join a global movement</span>
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
                  What Awaits You
                </h2>
                <p className="text-white/60 mb-6 text-center">
                  Discover the tools for your spiritual journey
                </p>
                <div className="space-y-3">
                  {featureShowcase.map((feature, index) => (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <div className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{feature.title}</p>
                        <p className="text-sm text-white/50">{feature.description}</p>
                      </div>
                    </motion.div>
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

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">
                  Adopt a Prayer Focus
                </h2>
                <p className="text-white/60 mb-6 text-center">
                  Choose a people group to pray for over 21 days
                </p>
                {focusesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 text-white/50 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {displayFocuses.map((focus: any) => (
                      <motion.button
                        key={focus.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleFocusSelect(focus)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                          selectedFocus?.id === focus.id && !isOthersSelected
                            ? "bg-primary/20 border-primary"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                        data-testid={`focus-${focus.id}`}
                      >
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                          selectedFocus?.id === focus.id && !isOthersSelected ? "bg-primary" : "bg-white/10"
                        }`}>
                          <Globe2 className={`h-6 w-6 ${
                            selectedFocus?.id === focus.id && !isOthersSelected ? "text-white" : "text-white/60"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{focus.name}</p>
                          <p className="text-xs text-white/50">{focus.region} • {focus.population}</p>
                        </div>
                        {selectedFocus?.id === focus.id && !isOthersSelected && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </motion.button>
                    ))}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleOthersSelect}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                        isOthersSelected
                          ? "bg-primary/20 border-primary"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                      data-testid="focus-others"
                    >
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        isOthersSelected ? "bg-primary" : "bg-white/10"
                      }`}>
                        <Heart className={`h-6 w-6 ${
                          isOthersSelected ? "text-white" : "text-white/60"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Others</p>
                        <p className="text-xs text-white/50">Enter your own prayer focus</p>
                      </div>
                      {isOthersSelected && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </motion.button>
                    
                    {isOthersSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-2"
                      >
                        <Input
                          value={customFocus}
                          onChange={(e) => setCustomFocus(e.target.value)}
                          placeholder="Enter your prayer focus..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                          data-testid="input-custom-focus"
                        />
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">
                  Set Your Prayer Rhythm
                </h2>
                <p className="text-white/60 mb-6 text-center">
                  How much time can you commit daily?
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

            {currentStep === 6 && (
              <motion.div
                key="step6"
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
                  Your mission profile is set. Here's your commitment:
                </p>
                <div className="bg-white/5 rounded-2xl p-6 mb-6 text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Prayer Focus</span>
                    <span className="text-white font-medium text-right max-w-[60%]">
                      {isOthersSelected && customFocus ? customFocus : selectedFocus?.name || "Not selected"}
                    </span>
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
                      Launch My Mission
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 mt-8">
            {currentStep > 1 && currentStep < 6 && (
              <Button
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10 py-5 rounded-2xl"
                onClick={prevStep}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </Button>
            )}
            {currentStep < 6 && (
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
