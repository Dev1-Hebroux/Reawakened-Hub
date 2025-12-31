import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { 
  Heart, 
  Timer, 
  Globe2, 
  Users, 
  Play, 
  ChevronRight,
  Flame,
  BookOpen,
  Send,
  Sparkles,
  Loader2,
  Check
} from "lucide-react";
import type { MissionFocus, LiveRoom, MissionAdoption } from "@shared/schema";

export function PrayHub() {
  const [, navigate] = useLocation();
  const [selectedTimer, setSelectedTimer] = useState(5);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const { data: focuses = [], isLoading: focusesLoading } = useQuery<MissionFocus[]>({
    queryKey: ["/api/mission/focuses"],
    queryFn: async () => {
      const res = await fetch("/api/mission/focuses?type=people_group");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: liveRooms = [], isLoading: roomsLoading } = useQuery<LiveRoom[]>({
    queryKey: ["/api/mission/live-rooms"],
    queryFn: async () => {
      const res = await fetch("/api/mission/live-rooms");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: activeAdoption } = useQuery<MissionAdoption | null>({
    queryKey: ["/api/mission/adoptions/active"],
    queryFn: async () => {
      const res = await fetch("/api/mission/adoptions/active", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: streakData } = useQuery<{ streak: number }>({
    queryKey: ["/api/mission/prayer-streak"],
    queryFn: async () => {
      const res = await fetch("/api/mission/prayer-streak", { credentials: "include" });
      if (!res.ok) return { streak: 0 };
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const logPrayerMutation = useMutation({
    mutationFn: async (data: { focusId?: number; durationMinutes: number; completed: boolean }) => {
      const res = await apiRequest("POST", "/api/mission/prayer-sessions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mission/prayer-streak"] });
      toast.success("Prayer session logged! Keep up the streak!");
    },
    onError: () => {
      toast.error("Failed to log prayer session");
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((s) => {
          if (s <= 1) {
            setTimerActive(false);
            if (isAuthenticated) {
              logPrayerMutation.mutate({
                focusId: activeAdoption?.focusId,
                durationMinutes: selectedTimer,
                completed: true,
              });
            }
            toast.success("Prayer time complete! Well done.");
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const startTimer = () => {
    setTimerSeconds(selectedTimer * 60);
    setTimerActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const hasAdoption = !!activeAdoption;
  const streak = streakData?.streak || 0;

  const displayFocuses = focuses.length > 0 ? focuses.slice(0, 3) : [
    { id: 1, name: "Unreached Youth in North Africa", region: "North Africa", population: "45M+" },
    { id: 2, name: "Urban Professionals in Tokyo", region: "East Asia", population: "14M+" },
    { id: 3, name: "Rural Communities in South India", region: "South Asia", population: "120M+" },
  ];

  const displayRooms = liveRooms.length > 0 ? liveRooms : [
    { id: 1, title: "24/7 Global Prayer Room", scheduleType: "always_on", maxParticipants: 47, status: "live" },
    { id: 2, title: "Nations Awakening Prayer", scheduleType: "scheduled", scheduledAt: new Date(), status: "upcoming" },
    { id: 3, title: "Youth Revival Intercession", scheduleType: "scheduled", scheduledAt: new Date(), status: "upcoming" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] via-[#1a2744]/95 to-[#1a2744]/90">
      <Navbar />
      
      <main className="pt-28 pb-32 px-4">
        <div className="max-w-lg mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-white/90">Pray</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Intercede for the Nations
            </h1>
            <p className="text-white/70">
              Your prayers fuel revival across the earth
            </p>
            {streak > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-2">
                <Flame className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-primary">{streak} Day Streak!</span>
              </div>
            )}
          </motion.div>

          {!hasAdoption ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Globe2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Adopt a Focus</h3>
                  <p className="text-sm text-white/60">Choose a people group to pray for</p>
                </div>
              </div>
              
              {focusesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 text-white/50 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {displayFocuses.map((group: any) => (
                    <motion.div
                      key={group.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 cursor-pointer transition-all border border-white/5"
                      onClick={() => navigate("/mission/onboarding")}
                      data-testid={`focus-${group.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white text-sm">{group.name}</h4>
                          <p className="text-xs text-white/50">{group.region} • {group.population}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-white/30" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              <Button 
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-2xl"
                onClick={() => navigate("/mission/onboarding")}
                data-testid="button-adopt-focus"
              >
                <Globe2 className="h-5 w-5 mr-2" />
                Start Your Mission
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-primary/20 to-[#4A7C7C]/20 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Flame className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Today's Prayer</h3>
                    <p className="text-sm text-white/60">Day {activeAdoption?.currentDay || 1} of 21</p>
                  </div>
                </div>
                {streak > 0 && (
                  <div className="bg-white/10 rounded-full px-3 py-1">
                    <span className="text-xs font-bold text-primary">🔥 {streak} Day Streak</span>
                  </div>
                )}
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 mb-4">
                <p className="text-sm text-white/80 italic mb-2">
                  "Ask of me, and I will make the nations your inheritance, the ends of the earth your possession."
                </p>
                <p className="text-xs text-primary font-bold">— Psalm 2:8</p>
              </div>
              
              <Button 
                className="w-full bg-white text-primary hover:bg-white/90 font-bold py-6 rounded-2xl"
                onClick={() => navigate(`/pray/guide/${activeAdoption?.focusId}`)}
                data-testid="button-pray-now"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Prayer Guide
              </Button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-[#4A7C7C]/30 flex items-center justify-center">
                <Timer className="h-6 w-6 text-[#7C9A8E]" />
              </div>
              <div>
                <h3 className="font-bold text-white">Quick Prayer Timer</h3>
                <p className="text-sm text-white/60">Set your focus time</p>
              </div>
            </div>
            
            {timerActive ? (
              <div className="text-center py-6">
                <div className="text-5xl font-display font-bold text-white mb-4">
                  {formatTime(timerSeconds)}
                </div>
                <p className="text-white/60 mb-4">Stay focused in prayer...</p>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    setTimerActive(false);
                    setTimerSeconds(0);
                  }}
                >
                  End Early
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  {[1, 3, 5, 10].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setSelectedTimer(mins)}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                        selectedTimer === mins 
                          ? 'bg-primary text-white' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                      data-testid={`timer-${mins}`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
                
                <Button 
                  className="w-full bg-[#4A7C7C] hover:bg-[#4A7C7C]/90 text-white font-bold py-5 rounded-2xl"
                  onClick={startTimer}
                  data-testid="button-start-timer"
                >
                  <Timer className="h-5 w-5 mr-2" />
                  Start {selectedTimer} Minute Prayer
                </Button>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Live Prayer Rooms</h3>
                  <p className="text-sm text-white/60">Join others in prayer</p>
                </div>
              </div>
            </div>
            
            {roomsLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 text-white/50 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {displayRooms.map((room: any) => (
                  <motion.div
                    key={room.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 cursor-pointer transition-all border border-white/5"
                    data-testid={`room-${room.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {(room.status === "live" || room.scheduleType === "always_on") && (
                          <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                        )}
                        <div>
                          <h4 className="font-bold text-white text-sm">{room.title}</h4>
                          <p className="text-xs text-white/50">
                            {room.status === "live" || room.scheduleType === "always_on"
                              ? `${room.maxParticipants || 0} praying now` 
                              : `Scheduled`
                            }
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className={room.status === "live" || room.scheduleType === "always_on"
                          ? "bg-red-500 hover:bg-red-600 text-white" 
                          : "bg-white/10 hover:bg-white/20 text-white"
                        }
                      >
                        {room.status === "live" || room.scheduleType === "always_on" ? "Join" : "Remind Me"}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#D4A574]/20 to-[#7C9A8E]/20 backdrop-blur-md rounded-3xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-[#D4A574]/30 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-[#D4A574]" />
              </div>
              <div>
                <h3 className="font-bold text-white">Spirit-Led Prompt</h3>
                <p className="text-sm text-white/60">Listen & respond</p>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-4 mb-4">
              <p className="text-sm text-white/90 font-medium">
                "Ask the Holy Spirit: Who should I encourage today?"
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 border-white/20 text-white hover:bg-white/10 font-bold py-5 rounded-2xl"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Journal
              </Button>
              <Button 
                className="flex-1 bg-[#D4A574] hover:bg-[#D4A574]/90 text-white font-bold py-5 rounded-2xl"
                data-testid="button-send-encouragement"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Now
              </Button>
            </div>
          </motion.div>
          
        </div>
      </main>
    </div>
  );
}
