import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useOfflineContent } from "@/hooks/useOfflineContent";
import {
  BookOpen, Clock, Users, ChevronLeft, ChevronRight, Flame, Check,
  Play, Target, MessageSquare, ArrowRight, Lock, Calendar, ChevronDown,
  Volume2, Pause, WifiOff
} from "lucide-react";

// Background images for reading plans based on topics
import anxietyImage from "@assets/generated_images/peace_and_calm_devotional.jpg";
import prayerImage from "@assets/generated_images/prayer_and_presence_devotional.jpg";
import revivalImage from "@assets/generated_images/worship_gathering_devotional_image.jpg";
import leadershipImage from "@assets/generated_images/group_discussion_in_a_living_room.png";
import womenLeadershipImage from "@assets/generated_images/woman_looking_at_a_city_skyline_at_sunset.png";
import relationshipsImage from "@assets/generated_images/diverse_group_taking_a_selfie.png";
import identityImage from "@assets/generated_images/young_man_praying_with_golden_light_overlay.png";
import defaultImage from "@assets/generated_images/cinematic_sunrise_devotional_background.png";

const topicImages: Record<string, string> = {
  "anxiety": anxietyImage,
  "peace": anxietyImage,
  "prayer": prayerImage,
  "revival": revivalImage,
  "holiness": revivalImage,
  "leadership": leadershipImage,
  "purpose": leadershipImage,
  "relationships": relationshipsImage,
  "community": relationshipsImage,
  "identity": identityImage,
  "faith": identityImage,
};

// Plan-specific image overrides (by title match)
const planImageOverrides: Record<string, string> = {
  "Let the Deborahs Arise": womenLeadershipImage,
};
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ReadingPlanDay {
  id: number;
  planId: number;
  dayNumber: number;
  title: string;
  scriptureRef: string;
  scriptureText: string;
  devotionalContent: string;
  reflectionQuestion?: string;
  prayerPrompt?: string;
  actionStep?: string;
}

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
  days: ReadingPlanDay[];
}

interface UserProgress {
  dayNumber: number;
  completed: boolean;
  journalEntry?: string;
}

interface UserEnrollment {
  id: number;
  planId: number;
  status: string;
  currentDay: number;
  currentStreak: number;
  plan: ReadingPlan;
  progress: UserProgress[];
}

const MATURITY_LABELS: Record<string, string> = {
  "new-believer": "New to Faith",
  "growing": "Growing",
  "mature": "Mature"
};

export function ReadingPlanDetail() {
  const { id } = useParams<{ id: string }>();
  const planId = parseInt(id || "0");
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [journalEntry, setJournalEntry] = useState("");
  const [showJournal, setShowJournal] = useState(false);
  const [revealedParagraphs, setRevealedParagraphs] = useState(1);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset revealed paragraphs when changing days
  useEffect(() => {
    setRevealedParagraphs(1);
    setIsAudioPlaying(false);
    setAudioProgress(0);
  }, [selectedDay]);

  // Use offline content hook instead of direct useQuery
  const { data: plan, isLoading, isOffline } = useOfflineContent<ReadingPlan>({
    key: `/api/reading-plans/${planId}`,
    fetchFn: async () => {
      const res = await fetch(`/api/reading-plans/${planId}`);
      if (!res.ok) throw new Error("Failed to fetch plan");
      return res.json();
    },
    enabled: planId > 0,
  });

  const currentDayContent = selectedDay ? plan?.days?.find(d => d.dayNumber === selectedDay) : null;

  // Auto-reveal paragraphs when audio is playing (simulated audio progress)
  useEffect(() => {
    if (!isAudioPlaying || !currentDayContent) return;

    const paragraphs = currentDayContent.devotionalContent.split('\n\n').filter(p => p.trim());
    const totalParagraphs = paragraphs.length;

    // Simulate audio reading - reveal one paragraph every 8 seconds
    const interval = setInterval(() => {
      setRevealedParagraphs(prev => {
        const next = prev + 1;
        if (next >= totalParagraphs) {
          setIsAudioPlaying(false);
          return totalParagraphs;
        }
        return next;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [isAudioPlaying, currentDayContent]);

  // Scroll to content when day is selected - wait for AnimatePresence to mount new content
  useEffect(() => {
    if (!selectedDay) return;

    // Poll for content ref since AnimatePresence mode="wait" delays mounting
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = setInterval(() => {
      attempts++;
      if (contentRef.current) {
        contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        clearInterval(pollInterval);
      } else if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
      }
    }, 50);

    return () => clearInterval(pollInterval);
  }, [selectedDay]);

  const { data: enrollments = [] } = useQuery<UserEnrollment[]>({
    queryKey: ["/api/user/reading-plans"],
    enabled: !!user,
  });

  const enrollment = enrollments.find(e => e.planId === planId);
  const completedDays = new Set(enrollment?.progress?.filter(p => p.completed).map(p => p.dayNumber) || []);

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      return await apiFetchJson(`/api/reading-plans/${planId}/enroll`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/reading-plans"] });
      toast({ title: "Enrolled!", description: "Start reading Day 1 now." });
      setSelectedDay(1);
    },
  });

  const completeDayMutation = useMutation({
    mutationFn: async ({ dayNumber, journal }: { dayNumber: number; journal?: string }) => {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      return await apiFetchJson(`/api/reading-plans/${planId}/days/${dayNumber}/complete`, {
        method: "POST",
        body: JSON.stringify({
          journalEntry: journal,
          idempotencyKey: `${planId}-${dayNumber}-${new Date().toISOString().split('T')[0]}`
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/reading-plans"] });
      toast({ title: "Day Complete!", description: "Great progress! Keep building your streak." });
      setShowJournal(false);
      setJournalEntry("");

      if (selectedDay && plan && selectedDay < plan.durationDays) {
        setSelectedDay(selectedDay + 1);
      } else {
        setSelectedDay(null);
        toast({ title: "Plan Completed!", description: "Congratulations on finishing this reading plan!" });
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/50 mb-4">Plan not found</p>
          <Link href="/reading-plans">
            <Button variant="outline" className="border-white/20 text-white/70 hover:bg-white/10">Back to Plans</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get background image based on plan title override, coverImageUrl, or topics
  const getBackgroundImage = () => {
    if (planImageOverrides[plan.title]) return planImageOverrides[plan.title];
    if (plan.coverImageUrl) return plan.coverImageUrl;
    const topics = plan.topics || [];
    for (const topic of topics) {
      if (topicImages[topic.toLowerCase()]) {
        return topicImages[topic.toLowerCase()];
      }
    }
    return defaultImage;
  };

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Hero Section with Background Image */}
      <div className="relative">
        {/* Background Image */}
        <div className="absolute inset-0 h-[400px] md:h-[450px]">
          <img
            src={getBackgroundImage()}
            alt={plan.title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a2744]/60 via-[#1a2744]/80 to-[#0f1419]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 pt-6 pb-12">
          <Link href="/reading-plans">
            <Button variant="ghost" className="gap-2 text-white/70 hover:text-white hover:bg-white/10 mb-6" data-testid="button-back">
              <ChevronLeft className="h-4 w-4" />
              All Plans
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur">
                {MATURITY_LABELS[plan.maturityLevel] || plan.maturityLevel}
              </Badge>
              <Badge className="bg-white/10 text-white/80 border-white/20 backdrop-blur">
                <Clock className="h-3 w-3 mr-1" />
                {plan.durationDays} Days
              </Badge>
              {(plan.enrollmentCount || 0) > 0 && (
                <Badge className="bg-white/10 text-white/80 border-white/20 backdrop-blur">
                  <Users className="h-3 w-3 mr-1" />
                  {plan.enrollmentCount?.toLocaleString()}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
              {plan.title}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed max-w-2xl">
              {plan.description}
            </p>

            {/* CTA or Progress */}
            {!enrollment ? (
              <Button
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                onClick={() => {
                  if (!user) {
                    toast({ title: "Sign in required", description: "Please sign in to start a reading plan." });
                    return;
                  }
                  enrollMutation.mutate();
                }}
                disabled={enrollMutation.isPending}
                data-testid="button-start-plan"
              >
                <Play className="h-5 w-5" />
                {enrollMutation.isPending ? "Starting..." : "Start This Plan"}
              </Button>
            ) : (
              <div className="flex items-center gap-4 flex-wrap">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-400" />
                    <span className="font-bold text-white text-lg">{enrollment.currentStreak}</span>
                    <span className="text-sm text-white/60">day streak</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3">
                  <span className="font-bold text-white text-lg">{completedDays.size}</span>
                  <span className="text-sm text-white/60"> / {plan.durationDays} days</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Daily Readings Section */}
      <div className="container mx-auto px-4 py-8">

        {/* Offline Indicator */}
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <WifiOff className="h-5 w-5 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-400">You're offline</p>
              <p className="text-sm text-amber-400/70">
                Browsing cached version. Progress will sync when you reconnect.
              </p>
            </div>
          </motion.div>
        )}

        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Daily Readings
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {plan.days?.map((day) => {
            const isCompleted = completedDays.has(day.dayNumber);
            const isDayUnlocked = (dayNumber: number): boolean => {
              if (dayNumber === 1) return true;
              if (completedDays.has(dayNumber)) return true;
              return completedDays.has(dayNumber - 1);
            };
            const isUnlocked = enrollment && isDayUnlocked(day.dayNumber);
            const isCurrent = enrollment && day.dayNumber === enrollment.currentDay && !isCompleted;

            return (
              <motion.button
                key={day.id}
                whileHover={isUnlocked ? { scale: 1.02 } : {}}
                onClick={() => isUnlocked && setSelectedDay(day.dayNumber)}
                disabled={!isUnlocked}
                className={`text-left p-4 rounded-xl border transition-all ${selectedDay === day.dayNumber
                  ? "border-primary bg-primary/10"
                  : isCompleted
                    ? "border-green-500/30 bg-green-500/10"
                    : isCurrent
                      ? "border-primary/50 bg-primary/10"
                      : isUnlocked
                        ? "border-white/10 hover:border-white/20 bg-white/5"
                        : "border-white/5 bg-white/5 opacity-50"
                  }`}
                data-testid={`day-card-${day.dayNumber}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : isCurrent ? (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                    ) : isUnlocked ? (
                      <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/80">
                        {day.dayNumber}
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-white/30" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-white/50">Day {day.dayNumber}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-1 line-clamp-1">{day.title}</h3>
                <p className="text-sm text-primary font-medium">{day.scriptureRef}</p>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {selectedDay && currentDayContent && (
            <motion.div
              ref={contentRef}
              key={selectedDay}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1a2744] rounded-2xl border border-white/10 p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">Day {currentDayContent.dayNumber}</Badge>
                  <h2 className="text-2xl font-display font-bold text-white">{currentDayContent.title}</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/60 hover:text-white hover:bg-white/10"
                  onClick={() => setSelectedDay(null)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <BookOpen className="h-5 w-5" />
                    <span>{currentDayContent.scriptureRef}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`gap-2 border-white/20 ${isAudioPlaying ? 'bg-primary text-white border-primary hover:bg-primary/90' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                    onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                    data-testid="button-audio-toggle"
                  >
                    {isAudioPlaying ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause Audio
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4" />
                        Listen
                      </>
                    )}
                  </Button>
                </div>
                <blockquote className="bg-primary/10 rounded-xl p-6 border-l-4 border-primary">
                  <p className="text-lg leading-relaxed text-white/90 italic">
                    "{currentDayContent.scriptureText}"
                  </p>
                </blockquote>

                {isAudioPlaying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-4 bg-primary rounded animate-pulse" />
                        <div className="w-1 h-6 bg-primary rounded animate-pulse delay-100" />
                        <div className="w-1 h-3 bg-primary rounded animate-pulse delay-200" />
                        <div className="w-1 h-5 bg-primary rounded animate-pulse" />
                      </div>
                      <span className="text-sm text-white/60">Playing devotional... Auto-advancing sections</span>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="max-w-none mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Today's Reflection</h3>
                {(() => {
                  const paragraphs = currentDayContent.devotionalContent.split('\n\n').filter(p => p.trim());
                  const totalParagraphs = paragraphs.length;
                  const allRevealed = revealedParagraphs >= totalParagraphs;

                  return (
                    <>
                      {paragraphs.map((paragraph, i) => {
                        const isRevealed = i < revealedParagraphs;
                        const isNext = i === revealedParagraphs;

                        if (!isRevealed && !isNext) return null;

                        return (
                          <motion.div
                            key={i}
                            initial={i > 0 ? { opacity: 0, y: 10 } : {}}
                            animate={{ opacity: isRevealed ? 1 : 0.3, y: 0 }}
                            transition={{ duration: 0.4 }}
                          >
                            {isRevealed ? (
                              <p className="text-white/80 leading-relaxed mb-4 text-lg">{paragraph}</p>
                            ) : (
                              <div className="relative">
                                <p className="text-white/30 leading-relaxed mb-4 blur-sm select-none">
                                  {paragraph.slice(0, 100)}...
                                </p>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a2744]" />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}

                      {!allRevealed && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-center mt-6"
                        >
                          <Button
                            className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg"
                            onClick={() => setRevealedParagraphs(prev => prev + 1)}
                            data-testid="button-continue-reading"
                          >
                            <ChevronDown className="h-4 w-4" />
                            Continue Reading ({revealedParagraphs}/{totalParagraphs})
                          </Button>
                        </motion.div>
                      )}

                      {allRevealed && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-center gap-2 text-green-400 py-2"
                        >
                          <Check className="h-4 w-4" />
                          <span className="text-sm font-medium">Reading complete</span>
                        </motion.div>
                      )}
                    </>
                  );
                })()}
              </div>

              {currentDayContent.reflectionQuestion && (
                <div className="bg-amber-500/10 rounded-xl p-6 mb-6 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Reflection Question</span>
                  </div>
                  <p className="text-white/80">{currentDayContent.reflectionQuestion}</p>
                </div>
              )}

              {currentDayContent.actionStep && (
                <div className="bg-green-500/10 rounded-xl p-6 mb-6 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                    <Target className="h-5 w-5" />
                    <span>Action Step</span>
                  </div>
                  <p className="text-white/80">{currentDayContent.actionStep}</p>
                </div>
              )}

              {currentDayContent.prayerPrompt && (
                <div className="bg-purple-500/10 rounded-xl p-6 mb-8 border border-purple-500/20">
                  <div className="flex items-center gap-2 text-purple-400 font-semibold mb-2">
                    <span>🙏</span>
                    <span>Prayer</span>
                  </div>
                  <p className="text-white/80 italic">{currentDayContent.prayerPrompt}</p>
                </div>
              )}

              {enrollment && !completedDays.has(selectedDay) && (() => {
                const paragraphs = currentDayContent.devotionalContent.split('\n\n').filter(p => p.trim());
                const totalParagraphs = paragraphs.length;
                const allRevealed = revealedParagraphs >= totalParagraphs;

                return (
                  <div className="border-t border-white/10 pt-6">
                    {!allRevealed && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 flex items-center gap-3">
                        <Lock className="h-5 w-5 text-amber-400" />
                        <p className="text-sm text-amber-300">
                          Read all sections to unlock day completion
                        </p>
                      </div>
                    )}

                    {showJournal ? (
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Write your reflection here..."
                          value={journalEntry}
                          onChange={(e) => setJournalEntry(e.target.value)}
                          className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          data-testid="input-journal"
                        />
                        <div className="flex gap-3">
                          <Button variant="outline" className="border-white/20 text-white/70 hover:bg-white/10" onClick={() => setShowJournal(false)}>
                            Cancel
                          </Button>
                          <Button
                            className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                            onClick={() => completeDayMutation.mutate({ dayNumber: selectedDay, journal: journalEntry })}
                            disabled={completeDayMutation.isPending || !allRevealed}
                            data-testid="button-save-journal"
                          >
                            {completeDayMutation.isPending ? "Saving..." : "Complete Day"}
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 gap-2 border-white/20 text-white/70 hover:bg-white/10"
                          onClick={() => setShowJournal(true)}
                          disabled={!allRevealed}
                          data-testid="button-add-journal"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Add Journal Entry
                        </Button>
                        <Button
                          className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                          onClick={() => completeDayMutation.mutate({ dayNumber: selectedDay })}
                          disabled={completeDayMutation.isPending || !allRevealed}
                          data-testid="button-complete-day"
                        >
                          {!allRevealed ? (
                            <>
                              <Lock className="h-4 w-4" />
                              Read to Complete
                            </>
                          ) : completeDayMutation.isPending ? "..." : (
                            <>
                              Mark Complete
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {completedDays.has(selectedDay) && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-400">Day Completed!</p>
                    <p className="text-sm text-green-400/70">You finished this day's reading</p>
                  </div>
                </div>
              )}

              {selectedDay < plan.durationDays && completedDays.has(selectedDay) && (
                <Button
                  className="w-full mt-4 gap-2 bg-primary hover:bg-primary/90"
                  onClick={() => setSelectedDay(selectedDay + 1)}
                  data-testid="button-next-day"
                >
                  Continue to Day {selectedDay + 1}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ReadingPlanDetail;
