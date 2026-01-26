import { motion } from "framer-motion";
import {
  Clock, Calendar, ArrowLeft, Play, CheckCircle2,
  Loader2, Lock, BookOpen, Target, Users, Heart
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { toast } from "sonner";
import type { Journey, JourneyDay, UserJourney } from "@shared/schema";

const categoryIcons: Record<string, typeof BookOpen> = {
  "faith-basics": BookOpen,
  "purpose": Target,
  "anxiety": Heart,
  "relationships": Users,
};

const categoryColors: Record<string, string> = {
  "faith-basics": "from-blue-600 to-blue-800",
  "purpose": "from-purple-600 to-purple-800",
  "anxiety": "from-green-600 to-green-800",
  "relationships": "from-pink-600 to-pink-800",
};

interface JourneyWithDays extends Journey {
  days: JourneyDay[];
}

interface UserJourneyWithDetails extends UserJourney {
  journey?: Journey;
  completedDaysCount?: number;
}

export function JourneyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const { data: journey, isLoading } = useQuery<JourneyWithDays>({
    queryKey: [`/api/journeys/${slug}`],
    enabled: !!slug,
  });

  const { data: userJourneys = [] } = useQuery<UserJourneyWithDetails[]>({
    queryKey: ["/api/me/journeys"],
    enabled: !!user,
  });

  const userJourney = userJourneys.find(uj => uj.journeyId === journey?.id);

  const startMutation = useMutation({
    mutationFn: async (journeyId: number) => {
      return await apiRequest<UserJourney>("POST", `/api/journeys/${journeyId}/start`);
    },
    onSuccess: (data: UserJourney) => {
      queryClient.invalidateQueries({ queryKey: ["/api/me/journeys"] });
      toast.success("Journey started! Let's begin Day 1.");
      navigate(`/journey/${data.id}/day/1`);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in to start a journey");
        setTimeout(() => window.location.href = "/api/login", 1000);
      } else {
        toast.error("Failed to start journey");
      }
    },
  });

  const handleStart = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to start a journey");
      setTimeout(() => window.location.href = "/api/login", 1000);
      return;
    }
    if (journey) {
      startMutation.mutate(journey.id);
    }
  };

  const handleContinue = () => {
    if (userJourney) {
      navigate(`/journey/${userJourney.id}/day/${userJourney.currentDay}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <h1 className="text-2xl font-bold mb-4">Journey Not Found</h1>
          <Link href="/journeys">
            <span className="text-primary hover:underline flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Journeys
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[journey.category] || BookOpen;
  const gradientClass = categoryColors[journey.category] || "from-gray-600 to-gray-800";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] text-white overflow-x-hidden">
      <Navbar />

      <section className={`relative pt-20 pb-16 bg-gradient-to-br ${gradientClass}`}>
        <div className="absolute inset-0 bg-black/20" />
        {journey.heroImageUrl && (
          <div className="absolute inset-0">
            <img
              src={journey.heroImageUrl}
              alt=""
              className="w-full h-full object-cover opacity-20"
            />
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
          <Link href="/journeys">
            <span className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors cursor-pointer" data-testid="link-back-journeys">
              <ArrowLeft className="h-4 w-4" /> Back to Journeys
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                <CategoryIcon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-white/80 capitalize">{journey.category.replace('-', ' ')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold mb-3" data-testid="text-journey-title">
              {journey.title}
            </h1>

            {journey.subtitle && (
              <p className="text-xl text-white/80 mb-6">{journey.subtitle}</p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-sm text-white/70 mb-8">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {journey.durationDays} Days
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                ~10 min/day
              </span>
              <span className="capitalize bg-white/10 px-3 py-1 rounded-full text-xs">
                {journey.level}
              </span>
            </div>

            {userJourney ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  onClick={handleContinue}
                  className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-4 rounded-full flex items-center gap-2 transition-all"
                  data-testid="button-continue-journey"
                >
                  <Play className="h-5 w-5" />
                  Continue Day {userJourney.currentDay}
                </button>
                <div className="text-sm text-white/70">
                  <span className="text-primary font-bold">{userJourney.completedDaysCount || 0}</span> of {journey.durationDays} days completed
                </div>
              </div>
            ) : (
              <button
                onClick={handleStart}
                disabled={startMutation.isPending}
                className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-4 rounded-full flex items-center gap-2 transition-all disabled:opacity-50"
                data-testid="button-start-journey"
              >
                {startMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
                Start Journey
              </button>
            )}
          </motion.div>

          {/* Progress Bar for Active Journeys */}
          {userJourney && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white/80">Journey Progress</span>
                  <span className="text-sm font-bold text-white">
                    {Math.round((userJourney.completedDaysCount || 0) / journey.durationDays * 100)}%
                  </span>
                </div>
                <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(userJourney.completedDaysCount || 0) / journey.durationDays * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full"
                  />
                  {/* Milestone markers */}
                  {[25, 50, 75].map((milestone) => (
                    <div
                      key={milestone}
                      className="absolute top-0 h-full w-0.5 bg-white/30"
                      style={{ left: `${milestone}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1 text-xs text-white/50">
                  <span>Start</span>
                  <span className="translate-x-2">25%</span>
                  <span>50%</span>
                  <span className="-translate-x-2">75%</span>
                  <span>Complete</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">About This Journey</h2>
          <p className="text-gray-400 leading-relaxed">{journey.description}</p>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Journey Outline
          </h2>

          <div className="space-y-3">
            {journey.days && journey.days.length > 0 ? (
              journey.days.map((day, i) => {
                const isCompleted = userJourney && i < (userJourney.completedDaysCount || 0);
                const isCurrent = userJourney && day.dayNumber === userJourney.currentDay;
                const isLocked = userJourney ? day.dayNumber > (userJourney.currentDay || 1) : !userJourney && i > 0;

                return (
                  <motion.div
                    key={day.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${isCompleted
                      ? 'bg-green-500/10 border-green-500/30'
                      : isCurrent
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-white/5 border-white/10'
                      }`}
                    data-testid={`day-item-${day.dayNumber}`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-primary text-white'
                        : isLocked
                          ? 'bg-gray-700 text-gray-500'
                          : 'bg-white/10 text-white'
                      }`}>
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : isLocked && !userJourney ? <Lock className="h-4 w-4" /> : day.dayNumber}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${isLocked && !isCompleted ? 'text-gray-500' : 'text-white'}`}>
                        Day {day.dayNumber}: {day.title}
                      </h3>
                      {day.summary && (
                        <p className="text-sm text-gray-500 line-clamp-1">{day.summary}</p>
                      )}
                      {isLocked && userJourney && (
                        <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Unlocks after Day {day.dayNumber - 1}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {day.estimatedMinutes || 10} min
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Journey content is being prepared...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default JourneyDetail;
