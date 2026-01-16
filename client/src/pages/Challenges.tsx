import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Trophy, Users, Calendar, Target, Loader2, Star,
  ChevronRight, Flame, Award, TrendingUp
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import type { Challenge, ChallengeParticipant } from "@shared/schema";

import challengeDefault from "@assets/generated_images/group_of_friends_hiking_a_mountain_trail.png";

interface ChallengeWithParticipation extends Challenge {
  isJoined?: boolean;
  myProgress?: number;
  myPoints?: number;
}

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
];

const getCategoryStyles = (category: string) => {
  const styles: Record<string, string> = {
    prayer: "bg-purple-100 text-purple-700 border-purple-200",
    reading: "bg-blue-100 text-blue-700 border-blue-200",
    outreach: "bg-green-100 text-green-700 border-green-200",
    habits: "bg-amber-100 text-amber-700 border-amber-200",
    giving: "bg-emerald-100 text-emerald-700 border-emerald-200",
    fitness: "bg-orange-100 text-orange-700 border-orange-200",
  };
  return styles[category] || "bg-gray-100 text-gray-700 border-gray-200";
};

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-700";
    case "upcoming": return "bg-blue-100 text-blue-700";
    case "completed": return "bg-gray-100 text-gray-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

export function ChallengesPage() {
  const [filter, setFilter] = useState("all");
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading } = useQuery<ChallengeWithParticipation[]>({
    queryKey: ["/api/challenges/public", filter],
    queryFn: async () => {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/challenges/public${params}`);
      if (!res.ok) throw new Error("Failed to fetch challenges");
      return res.json();
    },
  });

  const { data: myParticipations = [] } = useQuery<ChallengeParticipant[]>({
    queryKey: ["/api/challenges/my-participations"],
    enabled: isAuthenticated,
  });

  const { data: leaderboard = [] } = useQuery<{ challengeId: number; leaders: any[] }[]>({
    queryKey: ["/api/challenges/leaderboard-preview"],
    queryFn: async () => {
      const res = await fetch("/api/challenges/leaderboard-preview");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      return await apiRequest<any>("POST", `/api/challenges/${challengeId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/public"] });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/my-participations"] });
      toast.success("Successfully joined the challenge!");
    },
    onError: () => {
      toast.error("Failed to join challenge. Please try again.");
    },
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return "TBD";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const challengesWithStatus = challenges.map(c => {
    const participation = myParticipations.find(p => p.challengeId === c.id);
    return {
      ...c,
      isJoined: !!participation,
      myProgress: participation?.progress || 0,
      myPoints: participation?.points || 0,
    };
  });

  const getLeaderboardForChallenge = (challengeId: number) => {
    const data = leaderboard.find(l => l.challengeId === challengeId);
    return data?.leaders || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] to-[#0f1729]">
      <Navbar />
      
      <section className="pt-24 pb-12 px-4" data-testid="hero-challenges">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full mb-6">
              <Trophy className="h-5 w-5" />
              <span className="text-sm font-medium">Community Challenges</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" data-testid="text-hero-title">
              Growth Challenges
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Join challenges that push you to grow spiritually, physically, and mentally. 
              Compete with the community and earn rewards.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Tabs value={filter} onValueChange={setFilter} className="mb-8">
            <TabsList className="bg-white/10 backdrop-blur-sm border border-white/10" data-testid="filter-tabs">
              {STATUS_FILTERS.map(f => (
                <TabsTrigger
                  key={f.value}
                  value={f.value}
                  className="text-white data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                  data-testid={`tab-filter-${f.value}`}
                >
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex items-center justify-center py-20" data-testid="loading-spinner">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : challengesWithStatus.length === 0 ? (
            <Card className="bg-white/5 border-white/10" data-testid="card-no-challenges">
              <CardContent className="p-12 text-center">
                <Trophy className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No challenges found</h3>
                <p className="text-gray-400">
                  {filter !== "all" 
                    ? `No ${filter} challenges at the moment. Check back soon!`
                    : "Challenges are coming soon. Stay tuned!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="challenges-grid">
              {challengesWithStatus.map((challenge, i) => {
                const leaders = getLeaderboardForChallenge(challenge.id);
                const progressPercent = challenge.goal 
                  ? Math.min(100, (challenge.myProgress || 0) / challenge.goal * 100)
                  : 0;
                const spotsRemaining = challenge.maxParticipants 
                  ? challenge.maxParticipants - (challenge.currentParticipants || 0)
                  : null;
                
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    data-testid={`card-challenge-${challenge.id}`}
                  >
                    <Card className="bg-white/5 border-white/10 overflow-hidden hover:bg-white/10 transition-all group">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={challenge.imageUrl || challengeDefault}
                          alt={challenge.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge variant="outline" className={getCategoryStyles(challenge.category)} data-testid={`badge-category-${challenge.id}`}>
                            {challenge.category}
                          </Badge>
                          {challenge.isFeatured && (
                            <Badge className="bg-amber-500 text-white border-0">
                              <Star className="h-3 w-3 mr-1 fill-white" /> Featured
                            </Badge>
                          )}
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge className={getStatusBadgeStyles(challenge.status || "draft")} data-testid={`badge-status-${challenge.id}`}>
                            {challenge.status}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-lg font-bold text-white truncate" data-testid={`text-title-${challenge.id}`}>
                            {challenge.title}
                          </h3>
                        </div>
                      </div>
                      
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center gap-1" data-testid={`text-dates-${challenge.id}`}>
                            <Calendar className="h-4 w-4" />
                            {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                          </div>
                          <div className="flex items-center gap-1" data-testid={`text-participants-${challenge.id}`}>
                            <Users className="h-4 w-4" />
                            {challenge.currentParticipants || 0}
                            {challenge.maxParticipants && ` / ${challenge.maxParticipants}`}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Target className="h-4 w-4 text-amber-500" />
                          <span>{challenge.goal} {challenge.goalUnit}</span>
                          {challenge.pointsPerAction && (
                            <span className="text-gray-500">• {challenge.pointsPerAction} pts/action</span>
                          )}
                        </div>

                        {challenge.isJoined && (
                          <div className="space-y-2" data-testid={`progress-section-${challenge.id}`}>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Your Progress</span>
                              <span className="text-amber-400 font-medium">
                                {challenge.myProgress}/{challenge.goal} {challenge.goalUnit}
                              </span>
                            </div>
                            <Progress value={progressPercent} className="h-2 bg-white/10" />
                            <div className="flex items-center gap-2 text-sm">
                              <Flame className="h-4 w-4 text-orange-500" />
                              <span className="text-gray-300">{challenge.myPoints} points earned</span>
                            </div>
                          </div>
                        )}

                        {leaders.length > 0 && (
                          <div className="pt-2 border-t border-white/10" data-testid={`leaderboard-${challenge.id}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wider">Leaderboard</span>
                              <TrendingUp className="h-3 w-3 text-gray-500" />
                            </div>
                            <div className="space-y-1">
                              {leaders.slice(0, 3).map((leader, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                    idx === 0 ? 'bg-amber-500 text-white' :
                                    idx === 1 ? 'bg-gray-400 text-white' :
                                    'bg-amber-700 text-white'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <span className="text-gray-300 flex-1 truncate">{leader.name}</span>
                                  <span className="text-gray-500">{leader.points} pts</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2">
                          {challenge.isJoined ? (
                            <Button 
                              className="w-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                              data-testid={`button-continue-${challenge.id}`}
                            >
                              <Award className="h-4 w-4 mr-2" /> Continue Challenge
                              <ChevronRight className="h-4 w-4 ml-auto" />
                            </Button>
                          ) : challenge.status === "active" && (!spotsRemaining || spotsRemaining > 0) ? (
                            <Button
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                              onClick={() => {
                                if (!isAuthenticated) {
                                  toast.error("Please log in to join challenges");
                                  return;
                                }
                                joinMutation.mutate(challenge.id);
                              }}
                              disabled={joinMutation.isPending}
                              data-testid={`button-join-${challenge.id}`}
                            >
                              {joinMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Trophy className="h-4 w-4 mr-2" /> Join Challenge
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button 
                              className="w-full" 
                              variant="outline"
                              disabled
                              data-testid={`button-closed-${challenge.id}`}
                            >
                              {spotsRemaining === 0 ? "Full" : "Coming Soon"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ChallengesPage;
