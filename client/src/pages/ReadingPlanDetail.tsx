import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  BookOpen, Clock, Users, ChevronLeft, ChevronRight, Flame, Check,
  Play, Target, MessageSquare, ArrowRight, Lock, Calendar
} from "lucide-react";
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

  const { data: plan, isLoading } = useQuery<ReadingPlan>({
    queryKey: [`/api/reading-plans/${planId}`],
    enabled: planId > 0,
  });

  const { data: enrollments = [] } = useQuery<UserEnrollment[]>({
    queryKey: ["/api/user/reading-plans"],
    enabled: !!user,
  });

  const enrollment = enrollments.find(e => e.planId === planId);
  const completedDays = new Set(enrollment?.progress?.filter(p => p.completed).map(p => p.dayNumber) || []);

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/reading-plans/${planId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to enroll");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/reading-plans"] });
      toast({ title: "Enrolled!", description: "Start reading Day 1 now." });
      setSelectedDay(1);
    },
  });

  const completeDayMutation = useMutation({
    mutationFn: async ({ dayNumber, journal }: { dayNumber: number; journal?: string }) => {
      const res = await fetch(`/api/reading-plans/${planId}/days/${dayNumber}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journalEntry: journal }),
      });
      if (!res.ok) throw new Error("Failed to complete day");
      return res.json();
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

  const currentDayContent = selectedDay ? plan?.days?.find(d => d.dayNumber === selectedDay) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream to-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream to-white">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Plan not found</p>
          <Link href="/reading-plans">
            <Button variant="outline">Back to Plans</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      <div 
        className="bg-gradient-to-br from-primary/30 via-primary/20 to-transparent relative"
        style={plan.coverImageUrl ? {
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${plan.coverImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        } : {}}
      >
        <div className="container mx-auto px-4 py-8">
          <Link href="/reading-plans">
            <Button variant="ghost" className="gap-2 text-gray-700 hover:bg-white/50 mb-4" data-testid="button-back">
              <ChevronLeft className="h-4 w-4" />
              All Plans
            </Button>
          </Link>
          
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="bg-white/80">
                {MATURITY_LABELS[plan.maturityLevel] || plan.maturityLevel}
              </Badge>
              <Badge variant="outline" className="bg-white/80">
                <Clock className="h-3 w-3 mr-1" />
                {plan.durationDays} Days
              </Badge>
              <Badge variant="outline" className="bg-white/80">
                <Users className="h-3 w-3 mr-1" />
                {plan.enrollmentCount?.toLocaleString() || 0}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3">
              {plan.title}
            </h1>
            <p className="text-lg text-gray-700 mb-6">{plan.description}</p>
            
            {!enrollment ? (
              <Button 
                size="lg" 
                className="gap-2"
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
              <div className="flex items-center gap-4">
                <div className="bg-white/80 backdrop-blur rounded-xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="font-bold">{enrollment.currentStreak}</span>
                    <span className="text-sm text-gray-600">day streak</span>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl px-4 py-2">
                  <span className="font-bold">{completedDays.size}</span>
                  <span className="text-sm text-gray-600"> / {plan.durationDays} days completed</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          <Calendar className="h-5 w-5 inline mr-2" />
          Daily Readings
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {plan.days?.map((day) => {
            const isCompleted = completedDays.has(day.dayNumber);
            const isUnlocked = enrollment && (day.dayNumber <= (enrollment.currentDay || 1) || isCompleted);
            const isCurrent = enrollment && day.dayNumber === enrollment.currentDay && !isCompleted;
            
            return (
              <motion.button
                key={day.id}
                whileHover={isUnlocked ? { scale: 1.02 } : {}}
                onClick={() => isUnlocked && setSelectedDay(day.dayNumber)}
                disabled={!isUnlocked}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedDay === day.dayNumber
                    ? "border-primary bg-primary/5"
                    : isCompleted
                      ? "border-green-200 bg-green-50"
                      : isCurrent
                        ? "border-primary/50 bg-primary/5"
                        : isUnlocked
                          ? "border-gray-200 hover:border-gray-300 bg-white"
                          : "border-gray-100 bg-gray-50 opacity-60"
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
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                        {day.dayNumber}
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-500">Day {day.dayNumber}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{day.title}</h3>
                <p className="text-sm text-primary font-medium">{day.scriptureRef}</p>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {selectedDay && currentDayContent && (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Badge variant="outline" className="mb-2">Day {currentDayContent.dayNumber}</Badge>
                  <h2 className="text-2xl font-display font-bold text-gray-900">{currentDayContent.title}</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedDay(null)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-2 text-primary font-semibold mb-3">
                  <BookOpen className="h-5 w-5" />
                  <span>{currentDayContent.scriptureRef}</span>
                </div>
                <blockquote className="bg-primary/5 rounded-xl p-6 border-l-4 border-primary">
                  <p className="text-lg leading-relaxed text-gray-800 italic">
                    "{currentDayContent.scriptureText}"
                  </p>
                </blockquote>
              </div>

              <div className="prose prose-lg max-w-none mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Today's Reflection</h3>
                {currentDayContent.devotionalContent.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>
                ))}
              </div>

              {currentDayContent.reflectionQuestion && (
                <div className="bg-amber-50 rounded-xl p-6 mb-6 border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold mb-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Reflection Question</span>
                  </div>
                  <p className="text-gray-800">{currentDayContent.reflectionQuestion}</p>
                </div>
              )}

              {currentDayContent.actionStep && (
                <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                    <Target className="h-5 w-5" />
                    <span>Action Step</span>
                  </div>
                  <p className="text-gray-800">{currentDayContent.actionStep}</p>
                </div>
              )}

              {currentDayContent.prayerPrompt && (
                <div className="bg-purple-50 rounded-xl p-6 mb-8 border border-purple-200">
                  <div className="flex items-center gap-2 text-purple-700 font-semibold mb-2">
                    <span>🙏</span>
                    <span>Prayer</span>
                  </div>
                  <p className="text-gray-800 italic">{currentDayContent.prayerPrompt}</p>
                </div>
              )}

              {enrollment && !completedDays.has(selectedDay) && (
                <div className="border-t border-gray-100 pt-6">
                  {showJournal ? (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Write your reflection here..."
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                        className="min-h-[120px]"
                        data-testid="input-journal"
                      />
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setShowJournal(false)}>
                          Cancel
                        </Button>
                        <Button 
                          className="flex-1 gap-2"
                          onClick={() => completeDayMutation.mutate({ dayNumber: selectedDay, journal: journalEntry })}
                          disabled={completeDayMutation.isPending}
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
                        className="flex-1 gap-2"
                        onClick={() => setShowJournal(true)}
                        data-testid="button-add-journal"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Add Journal Entry
                      </Button>
                      <Button 
                        className="flex-1 gap-2"
                        onClick={() => completeDayMutation.mutate({ dayNumber: selectedDay })}
                        disabled={completeDayMutation.isPending}
                        data-testid="button-complete-day"
                      >
                        {completeDayMutation.isPending ? "..." : "Mark Complete"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {completedDays.has(selectedDay) && (
                <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Day Completed!</p>
                    <p className="text-sm text-green-600">You finished this day's reading</p>
                  </div>
                </div>
              )}

              {selectedDay < plan.durationDays && completedDays.has(selectedDay) && (
                <Button 
                  className="w-full mt-4 gap-2"
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
