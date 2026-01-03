import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  BookOpen, Clock, Users, ChevronRight, Flame, Filter, 
  Heart, Sparkles, Target, Award, TrendingUp, Check,
  Play, Bookmark, Star, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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

  if (authLoading || plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream to-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 text-primary mb-4">
              <BookOpen className="h-6 w-6" />
              <span className="text-sm font-semibold uppercase tracking-wider">Bible Reading Plans</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Grow Deeper in God's Word
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover personalized reading plans designed for your spiritual journey. 
              Build consistent habits and transform your faith.
            </p>
            
            {user && streak && streak.streak > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 bg-white/80 backdrop-blur rounded-full px-6 py-3 shadow-lg border border-primary/20"
              >
                <Flame className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{streak.streak}</p>
                  <p className="text-sm text-gray-600">Day Streak</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeEnrollment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 mb-8 text-white"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Continue Reading</p>
                <h3 className="text-xl font-bold">{activeEnrollment.plan.title}</h3>
                <p className="text-white/80 mt-1">Day {activeEnrollment.currentDay} of {activeEnrollment.plan.durationDays}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <Flame className="h-6 w-6 mx-auto text-orange-300" />
                  <p className="text-sm mt-1">{activeEnrollment.currentStreak} day streak</p>
                </div>
                <Link href={`/reading-plans/${activeEnrollment.planId}`}>
                  <Button variant="secondary" className="gap-2" data-testid="button-continue-reading">
                    <Play className="h-4 w-4" />
                    Continue
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <motion.div 
                className="bg-white rounded-full h-2"
                initial={{ width: 0 }}
                animate={{ width: `${(activeEnrollment.progress.filter(p => p.completed).length / activeEnrollment.plan.durationDays) * 100}%` }}
              />
            </div>
          </motion.div>
        )}

        {!profile && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 mb-8 border border-amber-200"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Personalize Your Journey</h3>
                <p className="text-gray-600 mb-4">
                  Tell us about your interests and spiritual journey to get personalized reading plan recommendations.
                </p>
                <Button onClick={handleStartOnboarding} className="gap-2" data-testid="button-personalize">
                  <Heart className="h-4 w-4" />
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {recommendedPlans.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-amber-500" />
              <h2 className="text-2xl font-display font-bold text-gray-900">Recommended for You</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedPlans.slice(0, 3).map((plan) => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  enrolled={enrolledPlanIds.has(plan.id)}
                  onEnroll={() => enrollMutation.mutate(plan.id)}
                  enrolling={enrollMutation.isPending}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-700">Filter Plans</h3>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge 
              variant={selectedTopic === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedTopic(null)}
              data-testid="filter-topic-all"
            >
              All Topics
            </Badge>
            {TOPICS.map((topic) => (
              <Badge
                key={topic.id}
                variant={selectedTopic === topic.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTopic(topic.id)}
                data-testid={`filter-topic-${topic.id}`}
              >
                {topic.icon} {topic.label}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge 
              variant={selectedMaturity === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedMaturity(null)}
            >
              All Levels
            </Badge>
            {MATURITY_LEVELS.map((level) => (
              <Badge
                key={level.id}
                variant={selectedMaturity === level.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedMaturity(level.id)}
                data-testid={`filter-maturity-${level.id}`}
              >
                {level.label}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedDuration === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedDuration(null)}
            >
              Any Duration
            </Badge>
            {DURATIONS.map((duration) => (
              <Badge
                key={duration.days}
                variant={selectedDuration === duration.days ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedDuration(duration.days)}
                data-testid={`filter-duration-${duration.days}`}
              >
                {duration.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900">
            {selectedTopic || selectedMaturity || selectedDuration ? "Filtered Plans" : "All Reading Plans"}
          </h2>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No plans match your filters</p>
            <Button variant="outline" onClick={() => {
              setSelectedTopic(null);
              setSelectedMaturity(null);
              setSelectedDuration(null);
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard 
                key={plan.id} 
                plan={plan}
                enrolled={enrolledPlanIds.has(plan.id)}
                onEnroll={() => enrollMutation.mutate(plan.id)}
                enrolling={enrollMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowOnboarding(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {onboardingStep === 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-2">Where are you on your faith journey?</h3>
                  <p className="text-gray-600 mb-6">This helps us recommend the right plans for you.</p>
                  <div className="space-y-3">
                    {MATURITY_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setSelectedMaturityLevel(level.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedMaturityLevel === level.id 
                            ? "border-primary bg-primary/5" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        data-testid={`onboarding-maturity-${level.id}`}
                      >
                        <p className="font-semibold">{level.label}</p>
                        <p className="text-sm text-gray-500">{level.description}</p>
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
                  <h3 className="text-xl font-bold mb-2">What topics interest you?</h3>
                  <p className="text-gray-600 mb-6">Select all that apply (you can change this later).</p>
                  <div className="grid grid-cols-2 gap-3">
                    {TOPICS.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => toggleInterest(topic.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedInterests.includes(topic.id)
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        data-testid={`onboarding-topic-${topic.id}`}
                      >
                        <span className="text-2xl mb-1 block">{topic.icon}</span>
                        <p className="font-medium text-sm">{topic.label}</p>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setOnboardingStep(0)}>
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
  enrolling
}: { 
  plan: ReadingPlan; 
  enrolled: boolean;
  onEnroll: () => void;
  enrolling: boolean;
}) {
  const maturityLabel = MATURITY_LEVELS.find(m => m.id === plan.maturityLevel)?.label || plan.maturityLevel;
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      <div 
        className="h-40 bg-gradient-to-br from-primary/30 to-primary/10 relative"
        style={plan.coverImageUrl ? { 
          backgroundImage: `url(${plan.coverImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        } : {}}
      >
        {plan.featured && (
          <Badge className="absolute top-3 left-3 bg-amber-500">
            <Star className="h-3 w-3 mr-1" /> Featured
          </Badge>
        )}
        {enrolled && (
          <Badge className="absolute top-3 right-3 bg-green-500">
            <Check className="h-3 w-3 mr-1" /> Enrolled
          </Badge>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">{maturityLabel}</Badge>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {plan.durationDays} Days
          </Badge>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{plan.description}</p>
        
        {plan.topics && plan.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {plan.topics.slice(0, 3).map((topic) => {
              const topicData = TOPICS.find(t => t.id === topic);
              return (
                <span key={topic} className="text-xs text-gray-500">
                  {topicData?.icon} {topicData?.label || topic}
                </span>
              );
            })}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{plan.enrollmentCount?.toLocaleString() || 0} enrolled</span>
          </div>
          
          {enrolled ? (
            <Link href={`/reading-plans/${plan.id}`}>
              <Button size="sm" className="gap-1" data-testid={`button-continue-plan-${plan.id}`}>
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button 
              size="sm" 
              className="gap-1"
              onClick={onEnroll}
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
