import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, Loader2, 
  BookOpen, MessageSquare, Lightbulb, Zap, Heart,
  Video, Headphones, Share2, ChevronLeft, ChevronRight
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { toast } from "sonner";
import type { Journey, JourneyDay as JourneyDayType, JourneyStep, UserJourney, UserJourneyDay } from "@shared/schema";

const stepIcons: Record<string, typeof BookOpen> = {
  scripture: BookOpen,
  teaching: Lightbulb,
  reflection: MessageSquare,
  action: Zap,
  prayer: Heart,
  video: Video,
  audio: Headphones,
  share: Share2,
};

const stepLabels: Record<string, string> = {
  scripture: "Scripture",
  teaching: "Teaching",
  reflection: "Reflection",
  action: "Action Step",
  prayer: "Prayer",
  video: "Video",
  audio: "Audio",
  share: "Share",
};

interface DayContentResponse {
  journey: Journey;
  userJourney: UserJourney;
  day: JourneyDayType;
  steps: JourneyStep[];
  userProgress: UserJourneyDay | null;
}

export function JourneyDayPage() {
  const { userJourneyId, dayNumber } = useParams<{ userJourneyId: string; dayNumber: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [reflectionText, setReflectionText] = useState("");

  const { data, isLoading, error } = useQuery<DayContentResponse>({
    queryKey: [`/api/user-journeys/${userJourneyId}/day/${dayNumber}`],
    enabled: !!userJourneyId && !!dayNumber && !!user,
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/user-journeys/${userJourneyId}/day/${dayNumber}/complete`, {
        reflectionResponse: reflectionText || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me/journeys"] });
      queryClient.invalidateQueries({ queryKey: [`/api/user-journeys/${userJourneyId}/day/${dayNumber}`] });
      toast.success("Day completed!");
      
      if (data?.journey && parseInt(dayNumber!) < data.journey.durationDays) {
        const nextDay = parseInt(dayNumber!) + 1;
        navigate(`/journey/${userJourneyId}/day/${nextDay}`);
      } else {
        toast.success("Congratulations! You've completed the journey!");
        navigate("/journeys");
      }
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in");
        setTimeout(() => window.location.href = "/api/login", 1000);
      } else {
        toast.error("Failed to complete day");
      }
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="mb-4">Please log in to view your journey</p>
          <a href="/api/login" className="text-primary hover:underline">Log In</a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="mb-4">Could not load this day</p>
          <Link href="/journeys">
            <span className="text-primary hover:underline">Back to Journeys</span>
          </Link>
        </div>
      </div>
    );
  }

  const { journey, day, steps, userProgress } = data;
  const currentStep = steps[currentStepIndex];
  const isCompleted = !!userProgress?.completedAt;
  const isLastStep = currentStepIndex === steps.length - 1;
  const dayNum = parseInt(dayNumber!);

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleComplete = () => {
    completeMutation.mutate();
  };

  const renderStepContent = (step: JourneyStep) => {
    const content = step.contentJson as any;
    const StepIcon = stepIcons[step.stepType] || BookOpen;

    return (
      <motion.div
        key={step.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex-1 flex flex-col"
      >
        <div className="flex items-center gap-2 mb-4 text-primary">
          <StepIcon className="h-5 w-5" />
          <span className="text-sm font-medium">{stepLabels[step.stepType] || step.stepType}</span>
        </div>

        {step.stepType === "scripture" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{content.reference}</p>
            <blockquote className="text-xl md:text-2xl font-serif italic leading-relaxed text-white/90">
              "{content.text}"
            </blockquote>
          </div>
        )}

        {step.stepType === "teaching" && (
          <div className="prose prose-invert max-w-none">
            <h3 className="text-xl font-bold text-white mb-4">{content.title}</h3>
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{content.body}</div>
          </div>
        )}

        {step.stepType === "reflection" && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">{content.prompt}</h3>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Write your thoughts here..."
              className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary focus:outline-none resize-none"
              data-testid="input-reflection"
            />
          </div>
        )}

        {step.stepType === "action" && (
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-3">{content.title}</h3>
            <p className="text-gray-300">{content.description}</p>
          </div>
        )}

        {step.stepType === "prayer" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-lg text-gray-300 italic leading-relaxed">{content.text}</p>
          </div>
        )}

        {step.stepType === "video" && step.mediaUrl && (
          <div className="aspect-video bg-black rounded-2xl overflow-hidden">
            <video src={step.mediaUrl} controls className="w-full h-full" />
          </div>
        )}

        {step.stepType === "share" && (
          <div className="text-center py-8">
            <Share2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">{content.prompt}</h3>
            <p className="text-gray-400">{content.description}</p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/journeys/${journey.slug}`}>
            <span className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer" data-testid="link-back-journey">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">{journey.title}</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Day <span className="text-white font-bold">{dayNum}</span> of {journey.durationDays}
            </span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2" data-testid="text-day-title">
              Day {dayNum}: {day.title}
            </h1>
            {day.summary && (
              <p className="text-gray-400">{day.summary}</p>
            )}
          </motion.div>

          <div className="flex items-center gap-2 mb-8">
            {steps.map((step, i) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(i)}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i === currentStepIndex 
                    ? 'bg-primary' 
                    : i < currentStepIndex 
                    ? 'bg-green-500' 
                    : 'bg-white/20'
                }`}
                data-testid={`progress-step-${i}`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {currentStep && renderStepContent(currentStep)}
          </AnimatePresence>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-[#0a1628]/90 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            data-testid="button-prev-step"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStepIndex + 1} of {steps.length}
          </div>

          {isLastStep ? (
            isCompleted ? (
              <Link href={dayNum < journey.durationDays ? `/journey/${userJourneyId}/day/${dayNum + 1}` : "/journeys"}>
                <span className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-medium cursor-pointer" data-testid="button-next-day">
                  <CheckCircle2 className="h-5 w-5" />
                  {dayNum < journey.durationDays ? "Next Day" : "Finish"}
                </span>
              </Link>
            ) : (
              <button
                onClick={handleComplete}
                disabled={completeMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                data-testid="button-complete-day"
              >
                {completeMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                Complete Day
              </button>
            )
          ) : (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              data-testid="button-next-step"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

export default JourneyDayPage;
