import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, Target, CheckCircle2, Play, Flame, Calendar,
  ArrowRight, AlertCircle, TrendingDown, RotateCcw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface WdepExperiment {
  id: number;
  wdepId: number;
  startNowAction: string;
  completedDays: number;
  status: string;
}

interface ScaFocusItem {
  id: number;
  title: string;
  startMotivation: number;
  currentMotivation: number | null;
  isComplete: boolean;
}

export function WdepPinnedAction() {
  const { isAuthenticated } = useAuth();

  const { data: session } = useQuery({
    queryKey: ["/api/vision/sessions/current"],
    queryFn: async () => {
      const res = await fetch("/api/vision/sessions/current", { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
    enabled: isAuthenticated,
  });

  const { data: experiments } = useQuery<WdepExperiment[]>({
    queryKey: [`/api/vision/sessions/${session?.id}/wdep/experiments`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/sessions/${session?.id}/wdep/experiments`, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: isAuthenticated && !!session?.id,
  });

  const activeExperiment = experiments?.find(e => e.status === "active");

  if (!activeExperiment) return null;

  const progress = (activeExperiment.completedDays / 7) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-[#D4A574] to-[#C49464] border-none shadow-lg overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-white/70 uppercase tracking-wide">Today's Action</span>
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  Day {activeExperiment.completedDays + 1}/7
                </span>
              </div>
              <p className="text-white font-semibold">{activeExperiment.startNowAction}</p>
            </div>
          </div>
          <div className="mb-3">
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>
          <Link href={`/vision/${session?.id}/wdep/${activeExperiment.wdepId}/experiment`}>
            <Button 
              className="w-full bg-white text-[#D4A574] hover:bg-white/90 font-semibold rounded-full"
              data-testid="button-log-action"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Log Today's Action
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ScaFocusCard() {
  const { isAuthenticated } = useAuth();

  const { data: session } = useQuery({
    queryKey: ["/api/vision/sessions/current"],
    queryFn: async () => {
      const res = await fetch("/api/vision/sessions/current", { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
    enabled: isAuthenticated,
  });

  const { data: scaExercises } = useQuery({
    queryKey: [`/api/vision/sessions/${session?.id}/sca`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/sessions/${session?.id}/sca`, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: isAuthenticated && !!session?.id,
  });

  const latestExercise = scaExercises?.[0];

  const { data: focusItems } = useQuery<ScaFocusItem[]>({
    queryKey: [`/api/sca/${latestExercise?.id}/focus-items`],
    queryFn: async () => {
      const res = await fetch(`/api/sca/${latestExercise?.id}/focus-items`, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: isAuthenticated && !!latestExercise?.id,
  });

  if (!focusItems || focusItems.length === 0) return null;

  const completedCount = focusItems.filter(f => f.isComplete).length;
  const lowMotivationItems = focusItems.filter(f => 
    f.currentMotivation !== null && 
    f.currentMotivation < f.startMotivation - 2 &&
    !f.isComplete
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-white border-[#E8E4DE] shadow-lg overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#7C9A8E]/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#7C9A8E]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2C3E2D]">Focus List</h3>
                <p className="text-xs text-[#6B7B6E]">{completedCount}/{focusItems.length} complete</p>
              </div>
            </div>
            <Link href={`/vision/${session?.id}/sca`}>
              <Button variant="ghost" size="sm" className="text-[#7C9A8E]">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {lowMotivationItems.length > 0 && (
            <div className="bg-[#C17767]/10 rounded-xl p-3 mb-4 border border-[#C17767]/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-[#C17767]" />
                <span className="text-sm font-medium text-[#C17767]">Motivation dip detected</span>
              </div>
              <p className="text-xs text-[#6B7B6E] mb-2">
                {lowMotivationItems[0].title} needs a boost!
              </p>
              <Link href={`/vision/${session?.id}/sca`}>
                <Button 
                  size="sm"
                  className="bg-[#C17767] hover:bg-[#B16657] text-white rounded-full text-xs"
                  data-testid="button-boost-motivation"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Boost Motivation
                </Button>
              </Link>
            </div>
          )}

          <div className="space-y-2">
            {focusItems.slice(0, 3).map((item) => (
              <div 
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  item.isComplete ? "bg-[#5B8C5A]/10" : "bg-[#FAF8F5]"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  item.isComplete 
                    ? "bg-[#5B8C5A] text-white" 
                    : "border-2 border-[#E8E4DE]"
                }`}>
                  {item.isComplete && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <span className={`text-sm flex-1 ${
                  item.isComplete ? "text-[#5B8C5A] line-through" : "text-[#2C3E2D]"
                }`}>
                  {item.title}
                </span>
                {!item.isComplete && item.currentMotivation !== null && (
                  <div className="flex items-center gap-1">
                    {item.currentMotivation < item.startMotivation - 2 ? (
                      <TrendingDown className="w-3 h-3 text-[#C17767]" />
                    ) : (
                      <Flame className="w-3 h-3 text-[#D4A574]" />
                    )}
                    <span className="text-xs text-[#6B7B6E]">{item.currentMotivation}/10</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
