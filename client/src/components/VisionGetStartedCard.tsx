import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Compass, ArrowRight, Play, CheckCircle2, Sparkles, 
  Target, TrendingUp, RotateCcw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface VisionSession {
  id: number;
  seasonLabel: string;
  status: string;
  currentStage: string;
}

export function VisionGetStartedCard() {
  const { isAuthenticated } = useAuth();

  const { data: session, isLoading } = useQuery<VisionSession | null>({
    queryKey: ["/api/vision/sessions/current"],
    queryFn: async () => {
      const res = await fetch("/api/vision/sessions/current", { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated || isLoading) return null;

  const stageProgress: Record<string, number> = {
    "onboarding": 5,
    "reflect": 20,
    "align": 40,
    "plan": 60,
    "practice": 80,
    "review": 95,
    "completed": 100,
  };

  const progress = session ? stageProgress[session.currentStage] || 0 : 0;

  if (!session) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] border-none shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <Compass className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Design Your Season</h3>
                <p className="text-white/80 text-sm mb-4">
                  Get clarity on where you're headed with our proven 5-stage framework.
                </p>
                <Link href="/vision">
                  <Button 
                    className="bg-white text-[#7C9A8E] hover:bg-white/90 font-semibold rounded-full px-6"
                    data-testid="button-start-vision-dashboard"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Vision Journey
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (session.status === "completed") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-[#5B8C5A] to-[#4A7C49] border-none shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">{session.seasonLabel}</h3>
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">Complete</span>
                </div>
                <p className="text-white/80 text-sm mb-4">
                  Great work! Review your vision or start a new season.
                </p>
                <div className="flex gap-2">
                  <Link href="/vision">
                    <Button 
                      className="bg-white text-[#5B8C5A] hover:bg-white/90 font-semibold rounded-full px-4"
                      data-testid="button-review-vision"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Review Vision
                    </Button>
                  </Link>
                  <Button 
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 rounded-full px-4"
                    data-testid="button-new-season"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Season
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-[#4A7C7C] to-[#3A6C6C] border-none shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white">{session.seasonLabel}</h3>
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full capitalize">
                  {session.currentStage}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-white/70 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/20" />
              </div>
              <Link href="/vision">
                <Button 
                  className="bg-white text-[#4A7C7C] hover:bg-white/90 font-semibold rounded-full px-6"
                  data-testid="button-continue-vision"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Continue Journey
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
