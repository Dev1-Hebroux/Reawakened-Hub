import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Users, Crown, Lock, CheckCircle2, Play, 
  ChevronRight, Sparkles, Star, Target, Zap, 
  Heart, MessageCircle, Shield, Eye, Lightbulb, 
  TrendingUp, Compass, ArrowRight
} from "lucide-react";

const TRACK_ICONS: Record<string, any> = {
  personal_mastery: Brain,
  communication: MessageCircle,
  leadership: Crown,
};

const TRACK_COLORS: Record<string, { bg: string; light: string; text: string; gradient: string }> = {
  personal_mastery: {
    bg: "bg-[#7C9A8E]",
    light: "bg-[#7C9A8E]/10",
    text: "text-[#7C9A8E]",
    gradient: "from-[#7C9A8E] to-[#6B8B7E]"
  },
  communication: {
    bg: "bg-[#4A7C7C]",
    light: "bg-[#4A7C7C]/10",
    text: "text-[#4A7C7C]",
    gradient: "from-[#4A7C7C] to-[#3A6C6C]"
  },
  leadership: {
    bg: "bg-[#D4A574]",
    light: "bg-[#D4A574]/10",
    text: "text-[#D4A574]",
    gradient: "from-[#D4A574] to-[#C49464]"
  },
};

const MODULE_ICONS: Record<string, any> = {
  strengths: Star,
  styles: Users,
  eq: Heart,
  wdep: Target,
  sca: Zap,
  mini360: Eye,
};

const DEMO_TRACKS = [
  {
    id: 1,
    key: "personal_mastery",
    title: "Personal Mastery",
    subtitle: "Know yourself deeply",
    description: "Discover your unique strengths, values, and purpose. Build self-awareness that drives meaningful growth.",
    estimatedMinutes: 45,
    modules: [
      { id: 1, key: "strengths", title: "Strengths Discovery", description: "Identify your top 5 character strengths", estimatedMinutes: 15, status: "available" },
      { id: 2, key: "wdep", title: "WDEP Goal Clarity", description: "Get unstuck with reality therapy", estimatedMinutes: 20, status: "locked" },
      { id: 3, key: "sca", title: "Self-Concordant Action", description: "Build your 10-item focus list", estimatedMinutes: 10, status: "locked" },
    ]
  },
  {
    id: 2,
    key: "communication",
    title: "Communication",
    subtitle: "Connect authentically",
    description: "Understand how you communicate and how to adapt your style to build stronger relationships.",
    estimatedMinutes: 40,
    modules: [
      { id: 4, key: "styles", title: "4 Styles Profile", description: "Discover your communication style", estimatedMinutes: 15, status: "available" },
      { id: 5, key: "eq", title: "EQ Micro-Skills", description: "Build emotional intelligence habits", estimatedMinutes: 25, status: "locked" },
    ]
  },
  {
    id: 3,
    key: "leadership",
    title: "Leadership",
    subtitle: "Influence with integrity",
    description: "Grow as a leader through feedback, reflection, and intentional practice.",
    estimatedMinutes: 35,
    modules: [
      { id: 6, key: "mini360", title: "Mini-360 Feedback", description: "Get insights from trusted voices", estimatedMinutes: 20, status: "coming_soon" },
    ]
  },
];

interface TrackCardProps {
  track: typeof DEMO_TRACKS[0];
  progress: number;
  onSelect: () => void;
}

function TrackCard({ track, progress, onSelect }: TrackCardProps) {
  const Icon = TRACK_ICONS[track.key] || Brain;
  const colors = TRACK_COLORS[track.key] || TRACK_COLORS.personal_mastery;
  const completedModules = track.modules.filter(m => m.status === "completed").length;
  const totalModules = track.modules.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className="touch-manipulation"
    >
      <Card 
        className="bg-white border-[#E8E4DE] shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
        onClick={onSelect}
        data-testid={`card-track-${track.key}`}
      >
        <CardContent className="p-0">
          <div className={`h-2 bg-gradient-to-r ${colors.gradient}`} />
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-[#2C3E2D] mb-0.5">{track.title}</h3>
                <p className="text-sm text-[#6B7B6E] mb-2">{track.subtitle}</p>
                <div className="flex items-center gap-3 text-xs text-[#8B9B8E]">
                  <span>{track.modules.length} modules</span>
                  <span className="w-1 h-1 rounded-full bg-[#D4D0C8]" />
                  <span>{track.estimatedMinutes} min</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#B8C4B8] flex-shrink-0 mt-1" />
            </div>
            
            {progress > 0 && (
              <div className="mt-4 pt-3 border-t border-[#E8E4DE]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#6B7B6E]">{completedModules}/{totalModules} completed</span>
                  <span className={colors.text}>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ModuleCardProps {
  module: typeof DEMO_TRACKS[0]["modules"][0];
  trackKey: string;
  index: number;
  onStart: () => void;
}

function ModuleCard({ module, trackKey, index, onStart }: ModuleCardProps) {
  const Icon = MODULE_ICONS[module.key] || Lightbulb;
  const colors = TRACK_COLORS[trackKey] || TRACK_COLORS.personal_mastery;
  const isLocked = module.status === "locked";
  const isCompleted = module.status === "completed";
  const isComingSoon = module.status === "coming_soon";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="touch-manipulation"
    >
      <Card 
        className={`bg-white border-[#E8E4DE] ${isLocked || isComingSoon ? "opacity-60" : ""} overflow-hidden`}
        data-testid={`card-module-${module.key}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${isCompleted ? "bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E]" : colors.light} flex items-center justify-center flex-shrink-0`}>
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-white" />
              ) : isLocked ? (
                <Lock className="w-5 h-5 text-[#A8B8A8]" />
              ) : (
                <Icon className={`w-6 h-6 ${colors.text}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-[#2C3E2D]">{module.title}</h4>
                {isComingSoon && (
                  <span className="px-2 py-0.5 bg-[#D4A574]/20 text-[#D4A574] text-xs font-medium rounded-full">Soon</span>
                )}
              </div>
              <p className="text-sm text-[#6B7B6E] mb-2">{module.description}</p>
              <div className="flex items-center gap-2 text-xs text-[#8B9B8E]">
                <span>{module.estimatedMinutes} min</span>
              </div>
            </div>
          </div>
          
          {!isLocked && !isComingSoon && !isCompleted && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              className={`w-full mt-4 bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white py-3 rounded-full font-medium`}
              data-testid={`button-start-${module.key}`}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Module
            </Button>
          )}
          
          {isCompleted && (
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              className="w-full mt-4 border-[#7C9A8E] text-[#7C9A8E] py-3 rounded-full font-medium"
              data-testid={`button-review-${module.key}`}
            >
              Review Results
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TrackHub() {
  const [, navigate] = useLocation();
  const [selectedTrack, setSelectedTrack] = useState<typeof DEMO_TRACKS[0] | null>(null);

  const { data: session } = useQuery({
    queryKey: ["/api/vision/sessions/current"],
    queryFn: async () => {
      const res = await fetch("/api/vision/sessions/current", { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const handleStartModule = (moduleKey: string) => {
    if (!session) {
      navigate("/vision");
      return;
    }
    navigate(`/vision/${session.id}/tools/${moduleKey}`);
  };

  const introCards = [
    {
      icon: Star,
      title: "Know Your Strengths",
      desc: "Discover what makes you uniquely gifted"
    },
    {
      icon: MessageCircle,
      title: "Communicate Better",
      desc: "Understand your style and adapt to others"
    },
    {
      icon: TrendingUp,
      title: "Grow as a Leader",
      desc: "Build influence through authentic growth"
    },
  ];

  if (selectedTrack) {
    const colors = TRACK_COLORS[selectedTrack.key] || TRACK_COLORS.personal_mastery;
    const Icon = TRACK_ICONS[selectedTrack.key] || Brain;
    
    return (
      <div className="min-h-screen bg-[#FAF8F5] font-sans">
        <Navbar />
        
        <main className="pt-20 pb-32 px-4">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setSelectedTrack(null)}
              className="flex items-center gap-2 text-[#6B7B6E] hover:text-[#2C3E2D] mb-6 transition-colors"
              data-testid="button-back"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Tracks
            </button>
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-4 shadow-sm`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#2C3E2D] mb-2">{selectedTrack.title}</h1>
              <p className="text-[#6B7B6E]">{selectedTrack.description}</p>
            </motion.div>
            
            <div className="space-y-4">
              {selectedTrack.modules.map((module, index) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  trackKey={selectedTrack.key}
                  index={index}
                  onStart={() => handleStartModule(module.key)}
                />
              ))}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans">
      <Navbar />
      
      <main className="pt-20 pb-32 px-4">
        <div className="max-w-lg mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C9A8E]/10 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-[#7C9A8E]" />
              <span className="text-sm font-medium text-[#7C9A8E]">Growth Tools</span>
            </div>
            <h1 className="text-3xl font-bold text-[#2C3E2D] mb-3">Track Hub</h1>
            <p className="text-[#6B7B6E] text-lg">
              Choose your growth journey
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {introCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-4 border border-[#E8E4DE] text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center mx-auto mb-2">
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xs font-semibold text-[#2C3E2D] mb-1">{card.title}</h3>
                <p className="text-xs text-[#6B7B6E] leading-tight">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-[#2C3E2D] mb-4 flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#7C9A8E]" />
            Growth Tracks
          </h2>
          
          <div className="space-y-4">
            {DEMO_TRACKS.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TrackCard
                  track={track}
                  progress={0}
                  onSelect={() => setSelectedTrack(track)}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gradient-to-br from-[#7C9A8E]/10 to-[#D4A574]/10 rounded-2xl p-5 border border-[#E8E4DE]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#7C9A8E]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2C3E2D] mb-1">Your growth is safe here</h3>
                <p className="text-sm text-[#6B7B6E]">
                  All assessments are private. Results are only shared if you choose to.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}