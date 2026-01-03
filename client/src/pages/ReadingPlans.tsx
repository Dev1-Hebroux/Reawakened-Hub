import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { 
  BookOpen, Clock, Users, ChevronRight, Flame, Filter, 
  Heart, Sparkles, Target, Award, TrendingUp, Check,
  Play, Bookmark, Star, ArrowRight, Search, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const TOPICS = [
  { id: "prayer", label: "Prayer", icon: "🙏", gradient: "from-indigo-600 to-purple-600", bgIcon: "🙏" },
  { id: "faith", label: "Faith", icon: "✨", gradient: "from-amber-500 to-orange-600", bgIcon: "✨" },
  { id: "identity", label: "Identity", icon: "🪞", gradient: "from-rose-500 to-pink-600", bgIcon: "🪞" },
  { id: "anxiety", label: "Anxiety & Peace", icon: "🕊️", gradient: "from-sky-500 to-cyan-600", bgIcon: "🕊️" },
  { id: "relationships", label: "Relationships", icon: "💕", gradient: "from-pink-500 to-rose-600", bgIcon: "💕" },
  { id: "leadership", label: "Leadership", icon: "👑", gradient: "from-amber-600 to-yellow-500", bgIcon: "👑" },
  { id: "purpose", label: "Purpose", icon: "🎯", gradient: "from-emerald-500 to-teal-600", bgIcon: "🎯" },
  { id: "worship", label: "Worship", icon: "🎵", gradient: "from-violet-500 to-purple-600", bgIcon: "🎵" },
];

const MATURITY_LEVELS = [
  { id: "new-believer", label: "New to Faith", description: "Just starting your journey" },
  { id: "growing", label: "Growing", description: "Building deeper foundations" },
  { id: "mature", label: "Mature", description: "Advanced spiritual insights" },
];

const DURATIONS = [
  { days: 7, label: "7 Days" },
  { days: 14, label: "14 Days" },
  { days: 21, label: "21 Days" },
  { days: 30, label: "30 Days" },
];

interface ReadingPlan {
  id: number;
  title: string;
  description: string;
  coverImageUrl?: string;
  durationDays: number;
  maturityLevel: string;
  topics?: string[];
  featured: boolean;
  enrollmentCount: number;
  averageRating?: number;
  status: string;
}

interface UserEnrollment {
  id: number;
  planId: number;
  status: string;
  currentDay: number;
  currentStreak: number;
  plan: ReadingPlan;
  progress: { dayNumber: number; completed: boolean }[];
}

interface SpiritualProfile {
  maturityLevel?: string;
  interests?: string[];
  completedPlansCount?: number;
  totalReadingDays?: number;
  longestStreak?: number;
}

export function ReadingPlansPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedMaturity, setSelectedMaturity] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMaturityLevel, setSelectedMaturityLevel] = useState<string>("growing");
  const [showFilters, setShowFilters] = useState(false);

  const { data: plans = [], isLoading: plansLoading } = useQuery<ReadingPlan[]>({
    queryKey: ["/api/reading-plans", selectedTopic, selectedMaturity, selectedDuration],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedTopic) params.set("topic", selectedTopic);
      if (selectedMaturity) params.set("maturityLevel", selectedMaturity);
      if (selectedDuration) params.set("durationDays", String(selectedDuration));
      const res = await fetch(`/api/reading-plans?${params}`);
      return res.json();
    },
  });

  const { data: enrollments = [] } = useQuery<UserEnrollment[]>({
    queryKey: ["/api/user/reading-plans"],
    enabled: !!user,
  });

  const { data: profile } = useQuery<SpiritualProfile>({
    queryKey: ["/api/user/spiritual-profile"],
    enabled: !!user,
  });

  const { data: recommendedPlans = [] } = useQuery<ReadingPlan[]>({
    queryKey: ["/api/reading-plans/recommended"],
    enabled: !!user && !!profile,
  });

  const { data: streak } = useQuery<{ streak: number }>({
    queryKey: ["/api/user/reading-streak"],
    enabled: !!user,
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (data: { maturityLevel: string; interests: string[] }) => {
      const res = await fetch("/api/user/spiritual-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/spiritual-profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans/recommended"] });
      setShowOnboarding(false);
      toast({ title: "Profile saved!", description: "We'll recommend plans based on your interests." });
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async (planId: number) => {
      const res = await fetch(`/api/reading-plans/${planId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to enroll");
      return res.json();
    },
    onSuccess: (_, planId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/reading-plans"] });
      toast({ title: "Enrolled!", description: "Start reading to build your streak!" });
      navigate(`/reading-plans/${planId}`);
    },
  });

  const activeEnrollment = enrollments.find(e => e.status === "active");
  const enrolledPlanIds = new Set(enrollments.map(e => e.planId));
  const featuredPlans = plans.filter(p => p.featured);

  const handleStartOnboarding = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to personalize your experience." });
      return;
    }
    setShowOnboarding(true);
    setOnboardingStep(0);
  };

  const handleSaveProfile = () => {
    saveProfileMutation.mutate({
      maturityLevel: selectedMaturityLevel,
      interests: selectedInterests,
    });
  };

  const toggleInterest = (topic: string) => {
    setSelectedInterests(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const clearFilters = () => {
    setSelectedTopic(null);
    setSelectedMaturity(null);
    setSelectedDuration(null);
  };

  const hasActiveFilters = selectedTopic || selectedMaturity || selectedDuration;

  if (authLoading || plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a2744]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading your spiritual journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2744]">
      <Navbar />
      
      {/* Hero Section with Floating Scripture */}
      <div className="relative overflow-hidden pt-24 pb-12">
        {/* Ambient Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 mb-6 border border-white/10">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-white/90 uppercase tracking-wider">Bible Reading Plans</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
              Grow Deeper in{" "}
              <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
                God's Word
              </span>
            </h1>
            
            <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
              Discover personalized reading plans designed for your spiritual journey. 
              Build consistent habits and transform your faith.
            </p>

            {/* Floating Scripture */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-5 mb-8 border border-white/10 max-w-md mx-auto"
            >
              <p className="text-white/80 italic text-sm leading-relaxed">
                "Your word is a lamp for my feet, a light on my path."
              </p>
              <p className="text-primary text-xs mt-2 font-medium">— Psalm 119:105</p>
            </motion.div>
            
            {/* Streak Badge */}
            {user && streak && streak.streak > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 backdrop-blur rounded-full px-6 py-3 border border-orange-500/30"
              >
                <div className="relative">
                  <Flame className="h-7 w-7 text-orange-400" />
                  <motion.div 
                    className="absolute inset-0 bg-orange-400/50 rounded-full blur-md"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-white">{streak.streak}</p>
                  <p className="text-xs text-orange-300/80">Day Streak</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-32">
        {/* Continue Reading Card */}
        {activeEnrollment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary via-primary to-amber-600 rounded-3xl p-6 mb-8 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Play className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Continue Your Journey</p>
                  <h3 className="text-xl font-bold">{activeEnrollment.plan.title}</h3>
                  <p className="text-white/70 text-sm mt-1">Day {activeEnrollment.currentDay} of {activeEnrollment.plan.durationDays}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center bg-white/10 rounded-xl px-4 py-2">
                  <Flame className="h-5 w-5 mx-auto text-orange-300 mb-1" />
                  <p className="text-sm font-bold">{activeEnrollment.currentStreak} days</p>
                </div>
                <Link href={`/reading-plans/${activeEnrollment.planId}`}>
                  <Button variant="secondary" size="lg" className="gap-2 font-bold shadow-lg" data-testid="button-continue-reading">
                    <Play className="h-4 w-4" />
                    Continue
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-5 bg-white/20 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                className="bg-white rounded-full h-2.5"
                initial={{ width: 0 }}
                animate={{ width: `${(activeEnrollment.progress.filter(p => p.completed).length / activeEnrollment.plan.durationDays) * 100}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Personalize CTA */}
        {!profile && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 backdrop-blur rounded-3xl p-6 mb-8 border border-amber-500/20"
          >
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-7 w-7 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Personalize Your Journey</h3>
                <p className="text-white/60 mb-4">
                  Tell us about your interests and spiritual journey to get personalized reading plan recommendations.
                </p>
                <Button onClick={handleStartOnboarding} className="gap-2 bg-amber-500 hover:bg-amber-600" data-testid="button-personalize">
                  <Heart className="h-4 w-4" />
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Featured Plans Carousel */}
        {featuredPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white">Featured</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {featuredPlans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex-shrink-0 w-72"
                >
                  <PlanCard 
                    plan={plan} 
                    enrolled={enrolledPlanIds.has(plan.id)}
                    onEnroll={() => enrollMutation.mutate(plan.id)}
                    enrolling={enrollMutation.isPending}
                    variant="featured"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommended Section */}
        {recommendedPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white">Recommended for You</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedPlans.slice(0, 3).map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <PlanCard 
                    plan={plan} 
                    enrolled={enrolledPlanIds.has(plan.id)}
                    onEnroll={() => enrollMutation.mutate(plan.id)}
                    enrolling={enrollMutation.isPending}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Filter className="h-5 w-5 text-white/70" />
              </div>
              <h3 className="font-bold text-white">Filter Plans</h3>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white/60 hover:text-white">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
          
          {/* Topics */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge 
              variant={selectedTopic === null ? "default" : "outline"}
              className={`cursor-pointer transition-all ${selectedTopic === null ? "bg-primary" : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"}`}
              onClick={() => setSelectedTopic(null)}
              data-testid="filter-topic-all"
            >
              All Topics
            </Badge>
            {TOPICS.map((topic) => (
              <Badge
                key={topic.id}
                variant={selectedTopic === topic.id ? "default" : "outline"}
                className={`cursor-pointer transition-all ${selectedTopic === topic.id ? "bg-primary" : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"}`}
                onClick={() => setSelectedTopic(topic.id)}
                data-testid={`filter-topic-${topic.id}`}
              >
                {topic.icon} {topic.label}
              </Badge>
            ))}
          </div>

          {/* Maturity Levels */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge 
              variant={selectedMaturity === null ? "default" : "outline"}
              className={`cursor-pointer transition-all ${selectedMaturity === null ? "bg-[#7C9A8E]" : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"}`}
              onClick={() => setSelectedMaturity(null)}
            >
              All Levels
            </Badge>
            {MATURITY_LEVELS.map((level) => (
              <Badge
                key={level.id}
                variant={selectedMaturity === level.id ? "default" : "outline"}
                className={`cursor-pointer transition-all ${selectedMaturity === level.id ? "bg-[#7C9A8E]" : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"}`}
                onClick={() => setSelectedMaturity(level.id)}
                data-testid={`filter-maturity-${level.id}`}
              >
                {level.label}
              </Badge>
            ))}
          </div>

          {/* Durations */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedDuration === null ? "default" : "outline"}
              className={`cursor-pointer transition-all ${selectedDuration === null ? "bg-[#D4A574]" : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"}`}
              onClick={() => setSelectedDuration(null)}
            >
              Any Duration
            </Badge>
            {DURATIONS.map((duration) => (
              <Badge
                key={duration.days}
                variant={selectedDuration === duration.days ? "default" : "outline"}
                className={`cursor-pointer transition-all ${selectedDuration === duration.days ? "bg-[#D4A574]" : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"}`}
                onClick={() => setSelectedDuration(duration.days)}
                data-testid={`filter-duration-${duration.days}`}
              >
                {duration.label}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* All Plans Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-white">
            {hasActiveFilters ? "Filtered Plans" : "All Reading Plans"}
          </h2>
          <p className="text-white/50 text-sm mt-1">{plans.length} plans available</p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
            <BookOpen className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 mb-4">No plans match your filters</p>
            <Button variant="outline" onClick={clearFilters} className="border-white/20 text-white hover:bg-white/10">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PlanCard 
                  plan={plan}
                  enrolled={enrolledPlanIds.has(plan.id)}
                  onEnroll={() => enrollMutation.mutate(plan.id)}
                  enrolling={enrollMutation.isPending}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowOnboarding(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a2744] rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {onboardingStep === 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Where are you on your faith journey?</h3>
                  <p className="text-white/60 mb-6">This helps us recommend the right plans for you.</p>
                  <div className="space-y-3">
                    {MATURITY_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setSelectedMaturityLevel(level.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedMaturityLevel === level.id 
                            ? "border-primary bg-primary/10" 
                            : "border-white/10 hover:border-white/30 bg-white/5"
                        }`}
                        data-testid={`onboarding-maturity-${level.id}`}
                      >
                        <p className="font-semibold text-white">{level.label}</p>
                        <p className="text-sm text-white/50">{level.description}</p>
                      </button>
                    ))}
                  </div>
                  <Button className="w-full mt-6" onClick={() => setOnboardingStep(1)}>
                    Continue <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              {onboardingStep === 1 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">What topics interest you?</h3>
                  <p className="text-white/60 mb-6">Select all that apply.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {TOPICS.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => toggleInterest(topic.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedInterests.includes(topic.id)
                            ? "border-primary bg-primary/10"
                            : "border-white/10 hover:border-white/30 bg-white/5"
                        }`}
                        data-testid={`onboarding-topic-${topic.id}`}
                      >
                        <span className="text-2xl mb-1 block">{topic.icon}</span>
                        <p className="font-medium text-sm text-white">{topic.label}</p>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setOnboardingStep(0)} className="border-white/20 text-white hover:bg-white/10">
                      Back
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={handleSaveProfile}
                      disabled={saveProfileMutation.isPending}
                    >
                      {saveProfileMutation.isPending ? "Saving..." : "Get My Recommendations"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlanCard({ 
  plan, 
  enrolled, 
  onEnroll,
  enrolling,
  variant = "default"
}: { 
  plan: ReadingPlan; 
  enrolled: boolean;
  onEnroll: () => void;
  enrolling: boolean;
  variant?: "default" | "featured";
}) {
  const maturityLabel = MATURITY_LEVELS.find(m => m.id === plan.maturityLevel)?.label || plan.maturityLevel;
  const primaryTopic = plan.topics?.[0] || "faith";
  const topicData = TOPICS.find(t => t.id === primaryTopic) || TOPICS[1];
  
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-[#243656] rounded-2xl shadow-xl border border-white/10 overflow-hidden group cursor-pointer h-full"
    >
      {/* Cover Image/Gradient */}
      <div 
        className={`h-44 relative overflow-hidden bg-gradient-to-br ${topicData.gradient}`}
        style={plan.coverImageUrl ? { 
          backgroundImage: `linear-gradient(to bottom, transparent 0%, rgba(26,39,68,0.8) 100%), url(${plan.coverImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        } : {}}
      >
        {/* Decorative Elements */}
        {!plan.coverImageUrl && (
          <>
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-8xl">{topicData.bgIcon}</span>
            </div>
            <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-black/10 blur-lg" />
          </>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {plan.featured && (
            <Badge className="bg-amber-500 text-white border-0 shadow-lg">
              <Star className="h-3 w-3 mr-1" /> Featured
            </Badge>
          )}
        </div>
        {enrolled && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0 shadow-lg">
            <Check className="h-3 w-3 mr-1" /> Enrolled
          </Badge>
        )}

        {/* Glowing Border Effect */}
        <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 transition-all rounded-t-2xl" />
      </div>
      
      <div className="p-5">
        {/* Tags */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-white/70">
            {maturityLabel}
          </Badge>
          <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-white/70">
            <Clock className="h-3 w-3 mr-1" />
            {plan.durationDays} Days
          </Badge>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{plan.title}</h3>
        <p className="text-white/50 text-sm line-clamp-2 mb-4">{plan.description}</p>
        
        {/* Topics */}
        {plan.topics && plan.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {plan.topics.slice(0, 2).map((topic) => {
              const tData = TOPICS.find(t => t.id === topic);
              return (
                <span key={topic} className="text-xs text-white/40">
                  {tData?.icon} {tData?.label || topic}
                </span>
              );
            })}
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-sm text-white/40">
            <Users className="h-4 w-4" />
            <span>{plan.enrollmentCount?.toLocaleString() || 0} enrolled</span>
          </div>
          
          {enrolled ? (
            <Link href={`/reading-plans/${plan.id}`}>
              <Button size="sm" className="gap-1 bg-white text-[#1a2744] hover:bg-white/90 font-bold" data-testid={`button-continue-plan-${plan.id}`}>
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button 
              size="sm" 
              className="gap-1 bg-primary hover:bg-primary/90 font-bold"
              onClick={(e) => {
                e.stopPropagation();
                onEnroll();
              }}
              disabled={enrolling}
              data-testid={`button-enroll-plan-${plan.id}`}
            >
              {enrolling ? "..." : "Start Plan"} <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ReadingPlansPage;
