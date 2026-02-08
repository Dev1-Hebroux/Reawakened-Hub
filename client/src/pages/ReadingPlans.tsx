import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import {
  BookOpen, Clock, Users, ChevronRight, Flame, Filter,
  Heart, Sparkles, Target, Award, TrendingUp, Check,
  Play, Bookmark, Star, ArrowRight, Search, X, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api";

import peaceImage from "@assets/stock_images/peaceful_nature_scen_fe6f1282.jpg";
import prayerImage from "@assets/stock_images/person_praying_hands_2c083135.jpg";
import leadershipImage from "@assets/stock_images/business_leader_prof_05517ed1.jpg";
import relationshipsImage from "@assets/stock_images/happy_family_togethe_b54439f5.jpg";
import identityImage from "@assets/stock_images/person_standing_conf_d8ff5fd8.jpg";
import womenLeadershipImage from "@assets/generated_images/woman_looking_at_a_city_skyline_at_sunset.png";

const TOPIC_IMAGES: Record<string, string> = {
  anxiety: peaceImage,
  prayer: prayerImage,
  worship: prayerImage,
  leadership: leadershipImage,
  purpose: leadershipImage,
  relationships: relationshipsImage,
  identity: identityImage,
  faith: peaceImage,
};

// Plan-specific image overrides (by title)
const PLAN_IMAGE_OVERRIDES: Record<string, string> = {
  "Let the Deborahs Arise": womenLeadershipImage,
};

const TOPICS = [
  { id: "prayer", label: "Prayer", icon: "🙏" },
  { id: "faith", label: "Faith", icon: "✨" },
  { id: "identity", label: "Identity", icon: "🪞" },
  { id: "anxiety", label: "Anxiety & Peace", icon: "🕊️" },
  { id: "relationships", label: "Relationships", icon: "💕" },
  { id: "leadership", label: "Leadership", icon: "👑" },
  { id: "purpose", label: "Purpose", icon: "🎯" },
  { id: "worship", label: "Worship", icon: "🎵" },
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
  const [searchQuery, setSearchQuery] = useState("");

  const { data: plans = [], isLoading: plansLoading } = useQuery<ReadingPlan[]>({
    queryKey: ["/api/reading-plans", selectedTopic, selectedMaturity, selectedDuration],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedTopic) params.set("topic", selectedTopic);
      if (selectedMaturity) params.set("maturityLevel", selectedMaturity);
      if (selectedDuration) params.set("durationDays", String(selectedDuration));
      const res = await fetch(getApiUrl(`/api/reading-plans?${params}`));
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
      const { apiFetchJson } = await import('@/lib/apiFetch');
      return await apiFetchJson(getApiUrl("/api/user/spiritual-profile"), {
        method: "POST",
        body: JSON.stringify(data),
      });
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
      const { apiFetchJson } = await import('@/lib/apiFetch');
      return await apiFetchJson(getApiUrl(`/api/reading-plans/${planId}/enroll`), {
        method: "POST",
      });
    },
    onSuccess: (_, planId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/reading-plans"] });
      toast({ title: "Enrolled!", description: "Start reading to build your streak!" });
      navigate(`/reading-plans/${planId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment failed",
        description: error.message || "Please check your connection and try again.",
        variant: "destructive"
      });
    },
  });

  const activeEnrollment = enrollments.find(e => e.status === "active");
  const enrolledPlanIds = new Set(enrollments.map(e => e.planId));

  // Search and filter logic
  const filteredPlans = useMemo(() => {
    let filtered = plans;

    // Apply topic filter
    if (selectedTopic) {
      filtered = filtered.filter(p => p.topics?.includes(selectedTopic));
    }

    // Apply maturity filter
    if (selectedMaturity) {
      filtered = filtered.filter(p => p.maturityLevel === selectedMaturity);
    }

    // Apply duration filter
    if (selectedDuration) {
      filtered = filtered.filter(p => p.durationDays === selectedDuration);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const titleMatch = p.title.toLowerCase().includes(query);
        const descMatch = p.description.toLowerCase().includes(query);
        const topicMatch = p.topics?.some(t => t.toLowerCase().includes(query));
        return titleMatch || descMatch || topicMatch;
      });
    }

    return filtered;
  }, [plans, selectedTopic, selectedMaturity, selectedDuration, searchQuery]);

  const featuredPlans = filteredPlans.filter(p => p.featured);

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
    setSearchQuery("");
  };

  const hasActiveFilters = selectedTopic || selectedMaturity || selectedDuration || searchQuery.trim();

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

      {/* Hero Section - Clean & Minimal */}
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">Bible Reading Plans</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
              Grow Deeper in God's Word
            </h1>

            <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
              Discover personalized reading plans designed for your spiritual journey.
              Build consistent habits and transform your faith.
            </p>

            {/* Scripture Quote */}
            <div className="bg-[#19233b] rounded-2xl p-5 mb-8 border border-white/10 max-w-md mx-auto">
              <p className="text-white/80 italic text-sm leading-relaxed">
                "Your word is a lamp for my feet, a light on my path."
              </p>
              <p className="text-white/80 text-xs mt-2 font-medium">— Psalm 119:105</p>
            </div>

            {/* Streak Badge */}
            {user && streak && streak.streak > 0 && (
              <div className="inline-flex items-center gap-3 bg-orange-500/20 rounded-full px-5 py-3 border border-orange-500/40">
                <Flame className="h-6 w-6 text-orange-400" />
                <div className="text-left">
                  <p className="text-xl font-bold text-white">{streak.streak}</p>
                  <p className="text-xs text-orange-300">Day Streak</p>
                </div>
              </div>
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
            className="bg-primary rounded-2xl p-5 mb-8 text-white"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                  <Play className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Continue Your Journey</p>
                  <h3 className="text-lg font-bold">{activeEnrollment.plan.title}</h3>
                  <p className="text-white/70 text-sm mt-1">Day {activeEnrollment.currentDay} of {activeEnrollment.plan.durationDays}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center bg-white/10 rounded-xl px-3 py-2">
                  <Flame className="h-4 w-4 mx-auto text-orange-300 mb-1" />
                  <p className="text-sm font-bold">{activeEnrollment.currentStreak} days</p>
                </div>
                <Link href={`/reading-plans/${activeEnrollment.planId}`}>
                  <Button variant="secondary" className="gap-2 font-semibold" data-testid="button-continue-reading">
                    <Play className="h-4 w-4" />
                    Continue
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${(activeEnrollment.progress.filter(p => p.completed).length / activeEnrollment.plan.durationDays) * 100}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Personalize CTA */}
        {!profile && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#19233b] rounded-2xl p-5 mb-8 border border-white/10"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Personalize Your Journey</h3>
                <p className="text-white/60 mb-4">
                  Tell us about your interests and spiritual journey to get personalized reading plan recommendations.
                </p>
                <Button onClick={handleStartOnboarding} className="gap-2 bg-primary hover:bg-primary/90" data-testid="button-personalize">
                  <Heart className="h-4 w-4" />
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Featured Plans - Vertical Stack */}
        {featuredPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white">Featured</h2>
            </div>
            <div className="space-y-4">
              {featuredPlans.map((plan, i) => (
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
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
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
          {/* Search Input */}
          <div className="mb-6" role="search" aria-label="Search reading plans">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search plans by title, description, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#19233b] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                data-testid="input-search-plans"
                aria-label="Search reading plans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm text-white/50 mt-2" role="status" aria-live="polite">
                Found {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

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
          <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter by topic">
            <Badge
              variant={selectedTopic === null ? "default" : "outline"}
              className={`cursor-pointer transition-all ${selectedTopic === null ? "bg-primary" : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"}`}
              onClick={() => setSelectedTopic(null)}
              data-testid="filter-topic-all"
              aria-pressed={selectedTopic === null}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedTopic(null)}
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
                aria-pressed={selectedTopic === topic.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedTopic(topic.id)}
              >
                {topic.icon} {topic.label}
              </Badge>
            ))}
          </div>

          {/* Maturity Levels */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant={selectedMaturity === null ? "default" : "outline"}
              className={`cursor-pointer transition-all ${selectedMaturity === null ? "bg-primary" : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"}`}
              onClick={() => setSelectedMaturity(null)}
            >
              All Levels
            </Badge>
            {MATURITY_LEVELS.map((level) => (
              <Badge
                key={level.id}
                variant={selectedMaturity === level.id ? "default" : "outline"}
                className={`cursor-pointer transition-all ${selectedMaturity === level.id ? "bg-primary" : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"}`}
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
              className={`cursor-pointer transition-all ${selectedDuration === null ? "bg-primary" : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"}`}
              onClick={() => setSelectedDuration(null)}
            >
              Any Duration
            </Badge>
            {DURATIONS.map((duration) => (
              <Badge
                key={duration.days}
                variant={selectedDuration === duration.days ? "default" : "outline"}
                className={`cursor-pointer transition-all ${selectedDuration === duration.days ? "bg-primary" : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"}`}
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
          <p className="text-white/50 text-sm mt-1">{filteredPlans.length} plans available</p>
        </div>

        {filteredPlans.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
            <BookOpen className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 mb-4">No plans match your {searchQuery ? 'search' : 'filters'}</p>
            <Button variant="outline" onClick={clearFilters} className="border-white/20 text-white hover:bg-white/10">
              Clear {searchQuery ? 'Search & ' : ''}Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlans.map((plan, i) => (
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
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${selectedMaturityLevel === level.id
                          ? "border-primary bg-primary/20 ring-2 ring-primary/50"
                          : "border-white/20 hover:border-white/40 bg-white/5"
                          }`}
                        data-testid={`onboarding-maturity-${level.id}`}
                      >
                        <p className="font-bold text-white">{level.label}</p>
                        <p className="text-sm text-white/60">{level.description}</p>
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
                        className={`p-4 rounded-xl border-2 text-left transition-all ${selectedInterests.includes(topic.id)
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
  const topicImage = PLAN_IMAGE_OVERRIDES[plan.title] || TOPIC_IMAGES[primaryTopic] || peaceImage;

  return (
    <div className="bg-[#19233b] rounded-2xl border border-white/10 overflow-hidden">
      {/* Cover Image */}
      <div
        className="h-40 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent 30%, rgba(25,35,59,0.95) 100%), url(${plan.coverImageUrl || topicImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {plan.featured && (
            <Badge className="bg-primary text-white border-0">
              <Star className="h-3 w-3 mr-1" /> Featured
            </Badge>
          )}
        </div>
        {enrolled && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0">
            <Check className="h-3 w-3 mr-1" /> Enrolled
          </Badge>
        )}
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
    </div>
  );
}

export default ReadingPlansPage;
