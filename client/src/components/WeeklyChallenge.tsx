import { motion } from "framer-motion";
import { Target, Zap, Heart, MessageCircle, Globe, ArrowRight, Check, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface WeeklyChallenge {
  week: number;
  theme: string;
  title: string;
  description: string;
  challenge: string;
  icon: React.ReactNode;
  color: string;
  dateRange: string;
}

const weeklyData: WeeklyChallenge[] = [
  {
    week: 1,
    theme: "Identity & Belonging",
    title: "Know Who You Are",
    description: "This week is about understanding your true identity and finding security in belonging.",
    challenge: "Share one thing you're grateful for about who you are with someone you trust.",
    icon: <Heart className="h-6 w-6" />,
    color: "from-rose-500 to-pink-500",
    dateRange: "19-24 Jan"
  },
  {
    week: 2,
    theme: "Prayer & Presence",
    title: "Create Space",
    description: "Discover the power of stillness and intentional presence in your daily life.",
    challenge: "Set aside 10 minutes of phone-free time each day this week to reflect or pray.",
    icon: <Clock className="h-6 w-6" />,
    color: "from-purple-500 to-indigo-500",
    dateRange: "25-30 Jan"
  },
  {
    week: 3,
    theme: "Peace & Anxiety",
    title: "Find Your Calm",
    description: "Learn to navigate stress and anxiety with practical tools and deeper peace.",
    challenge: "When you feel anxious this week, try the 5-4-3-2-1 grounding technique.",
    icon: <Zap className="h-6 w-6" />,
    color: "from-emerald-500 to-teal-500",
    dateRange: "31 Jan - 5 Feb"
  },
  {
    week: 4,
    theme: "Bold Witness",
    title: "Speak Up",
    description: "Discover the courage to share your story and be a light to those around you.",
    challenge: "Share this week's spark with one friend who might need encouragement.",
    icon: <MessageCircle className="h-6 w-6" />,
    color: "from-amber-500 to-orange-500",
    dateRange: "6-11 Feb"
  },
  {
    week: 5,
    theme: "Commission",
    title: "Go & Make Impact",
    description: "Step into your calling and commit to making a difference in your world.",
    challenge: "Commit to one way you'll continue growing after DOMINION ends.",
    icon: <Globe className="h-6 w-6" />,
    color: "from-blue-500 to-cyan-500",
    dateRange: "12-17 Feb"
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

  const currentChallenge = weeklyData[currentWeek - 1];
  const isCompleted = completedChallenges.includes(currentWeek);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold font-display flex items-center gap-2">
              <Target className="h-6 w-6 text-green-400" /> Weekly Challenge
            </h2>
            <p className="text-gray-400 text-sm">Take action on what you're learning</p>
          </div>
          <div className="flex items-center gap-1">
            {weeklyData.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-6 rounded-full transition-all ${
                  i + 1 < currentWeek
                    ? 'bg-green-500'
                    : i + 1 === currentWeek
                    ? `bg-gradient-to-r ${currentChallenge.color}`
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`bg-gradient-to-br ${currentChallenge.color} rounded-3xl p-8 relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  {currentChallenge.icon}
                </div>
                <div>
                  <span className="text-white/70 text-sm font-medium">Week {currentChallenge.week}</span>
                  <h3 className="text-xl font-bold text-white">{currentChallenge.theme}</h3>
                </div>
              </div>
              
              <h4 className="text-3xl font-display font-bold text-white mb-3" data-testid="text-challenge-title">
                {currentChallenge.title}
              </h4>
              <p className="text-white/80 mb-4" data-testid="text-challenge-description">
                {currentChallenge.description}
              </p>
              <p className="text-white/60 text-sm">{currentChallenge.dateRange}</p>
            </div>

            <div className="flex flex-col justify-center">
              <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h5 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" /> Your Challenge
                </h5>
                <p className="text-lg font-medium text-white mb-6" data-testid="text-challenge-action">
                  {currentChallenge.challenge}
                </p>
                
                <Button
                  onClick={() => handleComplete(currentWeek)}
                  className={`w-full font-bold py-4 rounded-xl transition-all ${
                    isCompleted
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                  data-testid="button-complete-challenge"
                >
                  {isCompleted ? (
                    <>
                      <Check className="h-5 w-5 mr-2" /> Challenge Completed!
                    </>
                  ) : (
                    <>
                      Mark as Complete <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-5 gap-2 mt-6">
          {weeklyData.map((week, i) => {
            const isPast = i + 1 < currentWeek;
            const isCurrent = i + 1 === currentWeek;
            const isComplete = completedChallenges.includes(i + 1);
            
            return (
              <div
                key={i}
                className={`p-3 rounded-xl text-center transition-all ${
                  isCurrent
                    ? `bg-gradient-to-br ${week.color} border border-white/30`
                    : isPast
                    ? 'bg-white/5 border border-white/10'
                    : 'bg-white/5 border border-white/5 opacity-50'
                }`}
              >
                <div className="text-xs text-white/60 mb-1">Week {week.week}</div>
                <div className="text-sm font-bold text-white truncate">{week.theme.split(' ')[0]}</div>
                {isComplete && <Check className="h-4 w-4 text-green-400 mx-auto mt-1" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
