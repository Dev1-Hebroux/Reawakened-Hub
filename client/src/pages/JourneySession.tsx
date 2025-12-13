import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Play, Pause, RotateCcw, Check, Loader2,
  ChevronLeft, ChevronRight, Clock, BookOpen, Users,
  MessageSquare, Lightbulb, Zap, Heart, Target
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import type { Journey, JourneyWeek, SessionSection, UserJourney } from "@shared/schema";

const sectionIcons: Record<string, typeof BookOpen> = {
  'welcome': Play,
  'scripture': BookOpen,
  'micro-teach': Lightbulb,
  'discussion': MessageSquare,
  'practice': Zap,
  'i-will': Target,
  'prayer': Heart,
};

const sectionColors: Record<string, string> = {
  'welcome': 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  'scripture': 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  'micro-teach': 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
  'discussion': 'from-purple-500/20 to-violet-500/20 border-purple-500/30',
  'practice': 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  'i-will': 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  'prayer': 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',
};

const iconColors: Record<string, string> = {
  'welcome': 'text-green-400',
  'scripture': 'text-blue-400',
  'micro-teach': 'text-yellow-400',
  'discussion': 'text-purple-400',
  'practice': 'text-orange-400',
  'i-will': 'text-pink-400',
  'prayer': 'text-indigo-400',
};

interface JourneyWeeksResponse {
  journey: Journey;
  weeks: JourneyWeek[];
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function JourneySession() {
  const { slug, weekNumber } = useParams<{ slug: string; weekNumber: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sectionCompleted, setSectionCompleted] = useState<Record<number, boolean>>({});
  
  const [iWillCommitment, setIWillCommitment] = useState("");
  const [whoToEncourage, setWhoToEncourage] = useState("");

  const weekNum = parseInt(weekNumber || "1");

  const { data: journeyData, isLoading: isLoadingJourney } = useQuery<JourneyWeeksResponse>({
    queryKey: [`/api/journeys/${slug}/weeks`],
    enabled: !!slug,
  });

  const currentWeek = journeyData?.weeks.find(w => w.weekNumber === weekNum);

  const { data: sections, isLoading: isLoadingSections } = useQuery<SessionSection[]>({
    queryKey: [`/api/journey-weeks/${currentWeek?.id}/sections`],
    enabled: !!currentWeek?.id,
  });

  const { data: userJourneys } = useQuery<UserJourney[]>({
    queryKey: ["/api/me/journeys"],
    enabled: !!user,
  });

  const currentUserJourney = userJourneys?.find(uj => uj.journeyId === journeyData?.journey.id);

  const createCommitment = useMutation({
    mutationFn: async () => {
      if (!currentUserJourney) throw new Error("Not enrolled in this journey");
      const res = await apiRequest("POST", `/api/user-journeys/${currentUserJourney.id}/commitments`, {
        weekNumber: weekNum,
        commitment: iWillCommitment,
        whoToEncourage: whoToEncourage || null,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Commitment saved!" });
      queryClient.invalidateQueries({ queryKey: [`/api/user-journeys/${currentUserJourney?.id}/commitments`] });
    },
    onError: () => {
      toast({ title: "Failed to save commitment", variant: "destructive" });
    },
  });

  const currentSection = sections?.[currentSectionIndex];

  useEffect(() => {
    if (currentSection) {
      setTimeRemaining((currentSection.durationMinutes || 5) * 60);
      setIsTimerRunning(false);
    }
  }, [currentSection]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const handleNextSection = useCallback(() => {
    if (!sections) return;
    setSectionCompleted(prev => ({ ...prev, [currentSectionIndex]: true }));
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  }, [currentSectionIndex, sections]);

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const resetTimer = () => {
    if (currentSection) {
      setTimeRemaining((currentSection.durationMinutes || 5) * 60);
      setIsTimerRunning(false);
    }
  };

  const isLoading = isLoadingJourney || isLoadingSections;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!journeyData || !currentWeek || !sections) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] text-white">
        <Navbar />
        <div className="pt-28 pb-20 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
          <p className="text-gray-400 mb-6">This week's session content is not available yet.</p>
          <Link href={`/journeys/${slug}`}>
            <Button variant="outline" data-testid="button-back-journey">Back to Journey</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { journey } = journeyData;
  const totalSections = sections.length;
  const completedCount = Object.keys(sectionCompleted).length;
  const progressPercent = totalSections > 0 ? (completedCount / totalSections) * 100 : 0;

  const renderSectionContent = (section: SessionSection) => {
    const content = section.contentJson as any;
    const SectionIcon = sectionIcons[section.sectionType] || BookOpen;
    const colorClass = sectionColors[section.sectionType] || 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
    const iconColor = iconColors[section.sectionType] || 'text-gray-400';

    return (
      <motion.div
        key={section.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex-1"
      >
        <div className={`bg-gradient-to-br ${colorClass} border rounded-2xl p-6 mb-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center`}>
              <SectionIcon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div>
              <h2 className="font-bold text-xl text-white">{section.title}</h2>
              <p className="text-sm text-gray-400">{section.durationMinutes} minutes</p>
            </div>
          </div>

          {section.sectionType === 'welcome' && (
            <div className="space-y-4">
              {content.greeting && <p className="text-lg text-gray-200">{content.greeting}</p>}
              {content.icebreaker && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-2">Icebreaker Question:</p>
                  <p className="text-white font-medium">{content.icebreaker}</p>
                </div>
              )}
              {content.overview && <p className="text-gray-300">{content.overview}</p>}
            </div>
          )}

          {section.sectionType === 'scripture' && (
            <div className="space-y-4">
              {content.reference && (
                <div className="bg-white/5 rounded-xl p-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">{content.reference}</p>
                  <blockquote className="text-xl md:text-2xl font-serif italic leading-relaxed text-white/90">
                    "{content.text || currentWeek.scriptureText}"
                  </blockquote>
                </div>
              )}
              {content.readingInstructions && (
                <p className="text-gray-400 text-sm">{content.readingInstructions}</p>
              )}
            </div>
          )}

          {section.sectionType === 'micro-teach' && (
            <div className="space-y-4">
              {content.title && <h3 className="text-lg font-bold text-white">{content.title}</h3>}
              {content.keyPoints && (
                <ul className="space-y-3">
                  {(content.keyPoints as string[]).map((point: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-gray-300">{point}</p>
                    </li>
                  ))}
                </ul>
              )}
              {content.body && <div className="text-gray-300 whitespace-pre-wrap">{content.body}</div>}
            </div>
          )}

          {section.sectionType === 'discussion' && (
            <div className="space-y-4">
              {content.introduction && <p className="text-gray-300 mb-4">{content.introduction}</p>}
              {content.questions && (
                <ul className="space-y-4">
                  {(content.questions as string[]).map((question: string, i: number) => (
                    <li key={i} className="flex gap-3 bg-white/5 rounded-xl p-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-white">{question}</p>
                    </li>
                  ))}
                </ul>
              )}
              {content.facilitatorTip && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mt-4">
                  <p className="text-sm text-purple-300"><strong>Tip:</strong> {content.facilitatorTip}</p>
                </div>
              )}
            </div>
          )}

          {section.sectionType === 'practice' && (
            <div className="space-y-4">
              {content.title && <h3 className="text-lg font-bold text-white">{content.title}</h3>}
              {content.activity && <p className="text-gray-300">{content.activity}</p>}
              {content.instructions && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-2">Instructions:</p>
                  <p className="text-white">{content.instructions}</p>
                </div>
              )}
              {content.steps && (
                <ol className="space-y-2 list-decimal list-inside">
                  {(content.steps as string[]).map((step: string, i: number) => (
                    <li key={i} className="text-gray-300">{step}</li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {section.sectionType === 'i-will' && (
            <div className="space-y-6">
              {content.prompt && <p className="text-gray-200 text-lg">{content.prompt}</p>}
              <div>
                <label className="block text-sm text-gray-400 mb-2">This week, I will...</label>
                <Textarea
                  value={iWillCommitment}
                  onChange={(e) => setIWillCommitment(e.target.value)}
                  placeholder="Write a specific, measurable commitment for this week..."
                  className="bg-white/5 border-white/20 min-h-[100px] text-white"
                  data-testid="input-i-will-commitment"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">I will encourage (optional):</label>
                <Input
                  value={whoToEncourage}
                  onChange={(e) => setWhoToEncourage(e.target.value)}
                  placeholder="Name someone you'll encourage this week"
                  className="bg-white/5 border-white/20 text-white"
                  data-testid="input-who-to-encourage"
                />
              </div>
              {user && currentUserJourney && (
                <Button
                  onClick={() => createCommitment.mutate()}
                  disabled={!iWillCommitment.trim() || createCommitment.isPending}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  data-testid="button-save-commitment"
                >
                  {createCommitment.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Target className="h-4 w-4 mr-2" />
                  )}
                  Save My Commitment
                </Button>
              )}
              {!user && (
                <p className="text-sm text-gray-500">
                  <a href="/api/login" className="text-primary hover:underline">Log in</a> to save your commitment
                </p>
              )}
            </div>
          )}

          {section.sectionType === 'prayer' && (
            <div className="space-y-4">
              {content.introduction && <p className="text-gray-300">{content.introduction}</p>}
              {content.prayerPoints && (
                <ul className="space-y-3">
                  {(content.prayerPoints as string[]).map((point: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <Heart className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300">{point}</p>
                    </li>
                  ))}
                </ul>
              )}
              {content.closingPrayer && (
                <div className="bg-white/5 rounded-xl p-4 mt-4">
                  <p className="text-white italic">{content.closingPrayer}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {section.facilitatorNotes && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-sm text-amber-300">
              <strong>Facilitator Note:</strong> {section.facilitatorNotes}
            </p>
          </div>
        )}
      </motion.div>
    );
  };

  const isLastSection = currentSectionIndex === sections.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] text-white overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/journeys/${slug}`}>
            <span className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer" data-testid="link-back-journey">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">{journey.title}</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Week</span>
              <span className="text-white font-bold">{weekNum}</span>
              <span className="text-gray-400">of {journeyData.weeks.length}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/30">
                Week {weekNum}
              </span>
              {currentWeek.weekType === 'dbs' && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                  Discovery Bible Study
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-1" data-testid="text-week-title">
              {currentWeek.title}
            </h1>
            {currentWeek.theme && (
              <p className="text-gray-400">{currentWeek.theme}</p>
            )}
          </motion.div>

          <div className="flex items-center gap-2 mb-6">
            {sections.map((section, i) => (
              <button
                key={section.id}
                onClick={() => setCurrentSectionIndex(i)}
                className={`flex-1 h-2 rounded-full transition-all ${
                  i === currentSectionIndex 
                    ? 'bg-primary scale-y-150' 
                    : sectionCompleted[i]
                    ? 'bg-green-500' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
                title={section.title}
                data-testid={`progress-section-${i}`}
              />
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-2xl font-mono font-bold text-white">
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-sm text-gray-500">
                  / {currentSection?.durationMinutes || 5} min
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetTimer}
                  className="text-gray-400 hover:text-white"
                  data-testid="button-reset-timer"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  size="sm"
                  className={isTimerRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
                  data-testid="button-toggle-timer"
                >
                  {isTimerRunning ? (
                    <><Pause className="h-4 w-4 mr-1" /> Pause</>
                  ) : (
                    <><Play className="h-4 w-4 mr-1" /> Start</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentSection && renderSectionContent(currentSection)}
          </AnimatePresence>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-[#0a1628]/90 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrevSection}
            disabled={currentSectionIndex === 0}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            data-testid="button-prev-section"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="text-center">
            <div className="text-sm text-gray-500">
              Section {currentSectionIndex + 1} of {sections.length}
            </div>
            <div className="text-xs text-gray-600">
              {Math.round(progressPercent)}% complete
            </div>
          </div>

          {isLastSection ? (
            <Link href={weekNum < journeyData.weeks.length ? `/journey/${slug}/week/${weekNum + 1}` : `/journeys/${slug}`}>
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:from-green-600 hover:to-emerald-600 transition-colors"
                data-testid="button-next-week"
              >
                <Check className="h-5 w-5" />
                {weekNum < journeyData.weeks.length ? "Next Week" : "Finish Journey"}
              </button>
            </Link>
          ) : (
            <button
              onClick={handleNextSection}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              data-testid="button-next-section"
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

export default JourneySession;
