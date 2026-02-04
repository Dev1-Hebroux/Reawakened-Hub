import { motion, AnimatePresence } from "framer-motion";
import { Target, Zap, Heart, MessageCircle, Globe, ArrowRight, Check, Clock, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { useState } from "react";

interface WeeklyChallengeData {
  week: number;
  theme: string;
  title: string;
  description: string;
  challenge: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  dateRange: string;
}

const weeklyData: WeeklyChallengeData[] = [
  {
    week: 1,
    theme: "Identity & Belonging",
    title: "Know Who You Are",
    description: "This week is about understanding your true identity and finding security in belonging.",
    challenge: "Share one thing you're grateful for about who you are with someone you trust.",
    icon: <Heart className="h-5 w-5" />,
    color: "from-[#7C9A8E] to-[#5A7A6E]",
    bgColor: "bg-[#7C9A8E]",
    dateRange: "19–24 Jan"
  },
  {
    week: 2,
    theme: "Prayer & Presence",
    title: "Create Space",
    description: "Discover the power of stillness and intentional presence in your daily life.",
    challenge: "Set aside 10 minutes of phone-free time each day this week to reflect or pray.",
    icon: <Clock className="h-5 w-5" />,
    color: "from-[#4A7C7C] to-[#3A6666]",
    bgColor: "bg-[#4A7C7C]",
    dateRange: "25–30 Jan"
  },
  {
    week: 3,
    theme: "Peace & Anxiety",
    title: "Find Your Calm",
    description: "Learn to navigate stress and anxiety with practical tools and deeper peace.",
    challenge: "When you feel anxious this week, try the 5-4-3-2-1 grounding technique.",
    icon: <Zap className="h-5 w-5" />,
    color: "from-[#6B8B7E] to-[#4A7C7C]",
    bgColor: "bg-[#6B8B7E]",
    dateRange: "31 Jan – 5 Feb"
  },
  {
    week: 4,
    theme: "Bold Witness",
    title: "Speak Up",
    description: "Discover the courage to share your story and be a light to those around you.",
    challenge: "Share this week's spark with one friend who might need encouragement.",
    icon: <MessageCircle className="h-5 w-5" />,
    color: "from-[#D4A574] to-[#B8956A]",
    bgColor: "bg-[#D4A574]",
    dateRange: "6–11 Feb"
  },
  {
    week: 5,
    theme: "Commission",
    title: "Go & Make Impact",
    description: "Step into your calling and commit to making a difference in your world.",
    challenge: "Commit to one way you'll continue growing after DOMINION ends.",
    icon: <Globe className="h-5 w-5" />,
    color: "from-[#5A7A8E] to-[#4A6A7E]",
    bgColor: "bg-[#5A7A8E]",
    dateRange: "12–17 Feb"
  }
];

function getCurrentWeek(): number {
  const campaignStart = new Date('2026-01-19T00:00:00Z');
  const campaignEnd = new Date('2026-02-17T23:59:59Z');
  const now = new Date();

  if (now < campaignStart) return 1;
  if (now > campaignEnd) return 5;

  const daysSinceStart = Math.floor((now.getTime() - campaignStart.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(5, Math.floor(daysSinceStart / 6) + 1);
}

export function WeeklyChallenge() {
  const currentWeek = getCurrentWeek();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [completedChallenges, setCompletedChallenges] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('completed_weekly_challenges');
    return stored ? JSON.parse(stored) : [];
  });

  const handleComplete = (week: number) => {
    const updated = completedChallenges.includes(week)
      ? completedChallenges.filter(w => w !== week)
      : [...completedChallenges, week];
    setCompletedChallenges(updated);
    localStorage.setItem('completed_weekly_challenges', JSON.stringify(updated));
  };

  const selected = weeklyData[selectedWeek - 1];
  const isCompleted = completedChallenges.includes(selectedWeek);
  const isPast = selectedWeek < currentWeek;
  const isFuture = selectedWeek > currentWeek;
  const completedCount = completedChallenges.length;

  const goToPrev = () => setSelectedWeek(w => Math.max(1, w - 1));
  const goToNext = () => setSelectedWeek(w => Math.min(5, w + 1));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-green-500/15 flex items-center justify-center">
            <Target className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-white tracking-tight">Weekly Challenge</h2>
            <p className="text-xs text-white/30">Take action on what you're learning</p>
          </div>
        </div>
        {completedCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
            <Trophy className="h-3.5 w-3.5" />
            {completedCount}/5
          </div>
        )}
      </div>

      {/* Week Selector — Horizontal scrollable pills */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none' }}>
        {weeklyData.map((week, i) => {
          const weekNum = i + 1;
          const isSelected = weekNum === selectedWeek;
          const isWeekPast = weekNum < currentWeek;
          const isWeekCurrent = weekNum === currentWeek;
          const isWeekComplete = completedChallenges.includes(weekNum);

          return (
            <button
              key={i}
              onClick={() => setSelectedWeek(weekNum)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-left transition-all duration-300 border ${
                isSelected
                  ? `bg-gradient-to-r ${week.color} border-white/20 shadow-lg`
                  : isWeekPast
                  ? 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08]'
                  : isWeekCurrent
                  ? 'bg-white/[0.06] border-white/[0.1] hover:bg-white/[0.1]'
                  : 'bg-white/[0.02] border-white/[0.04] opacity-50'
              }`}
            >
              {/* Week number / check */}
              <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                isWeekComplete
                  ? 'bg-green-500 text-white'
                  : isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-white/[0.06] text-white/40'
              }`}>
                {isWeekComplete ? <Check className="h-3.5 w-3.5" /> : weekNum}
              </div>
              <div className="min-w-0">
                <div className={`text-[10px] font-medium ${isSelected ? 'text-white/70' : 'text-white/25'}`}>
                  Week {weekNum}
                </div>
                <div className={`text-xs font-bold whitespace-nowrap ${isSelected ? 'text-white' : 'text-white/50'}`}>
                  {week.theme}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Challenge Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedWeek}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className={`bg-gradient-to-br ${selected.color} rounded-2xl overflow-hidden relative`}
        >
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 p-6 md:p-8">
            {/* Top Row — Week info + Nav */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                  {selected.icon}
                </div>
                <div>
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Week {selected.week}</span>
                  <h3 className="text-base font-bold text-white">{selected.theme}</h3>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={goToPrev}
                  disabled={selectedWeek === 1}
                  className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10 disabled:opacity-30 hover:bg-black/30 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={goToNext}
                  disabled={selectedWeek === 5}
                  className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10 disabled:opacity-30 hover:bg-black/30 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Title + Description */}
            <h4 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 tracking-tight" data-testid="text-challenge-title">
              {selected.title}
            </h4>
            <p className="text-white/75 text-sm leading-relaxed mb-2 max-w-lg" data-testid="text-challenge-description">
              {selected.description}
            </p>
            <p className="text-white/40 text-xs font-medium mb-5">{selected.dateRange}</p>

            {/* Challenge Box */}
            <div className="bg-black/20 backdrop-blur-md rounded-xl p-5 border border-white/10">
              <h5 className="text-[10px] font-bold text-white/50 uppercase tracking-[0.15em] mb-2.5 flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5" /> Your Challenge
              </h5>
              <p className="text-white font-medium leading-relaxed mb-5" data-testid="text-challenge-action">
                {selected.challenge}
              </p>

              {/* CTA Button */}
              {isFuture ? (
                <div className="flex items-center gap-2 text-sm text-white/30 font-medium">
                  <Clock className="h-4 w-4" /> Coming soon
                </div>
              ) : (
                <button
                  onClick={() => handleComplete(selectedWeek)}
                  className={`group flex items-center justify-center gap-2.5 w-full font-bold py-3.5 px-6 rounded-xl text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20'
                      : 'bg-white hover:bg-white/90 text-black hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]'
                  }`}
                  data-testid="button-complete-challenge"
                >
                  {isCompleted ? (
                    <>
                      <Check className="h-5 w-5" />
                      Completed
                      <span className="text-white/60 font-normal text-xs ml-1">(tap to undo)</span>
                    </>
                  ) : isPast ? (
                    <>
                      Mark as Complete <Check className="h-4 w-4 opacity-60" />
                    </>
                  ) : (
                    <>
                      Mark as Complete <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mt-4 flex items-center gap-1.5">
        {weeklyData.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              completedChallenges.includes(i + 1)
                ? 'bg-green-500'
                : i + 1 === currentWeek
                ? 'bg-white/30'
                : i + 1 < currentWeek
                ? 'bg-white/10'
                : 'bg-white/[0.04]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
