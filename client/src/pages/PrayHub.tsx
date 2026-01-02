import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Lightbulb,
  Loader2,
  Check,
  X,
  GraduationCap,
  MapPin,
  Building,
  Church,
  HandHeart,
  Search,
  MessageCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MissionFocus, LiveRoom, MissionAdoption } from "@shared/schema";

interface PrayerFocusGroup {
  id: number;
  name: string;
  region: string;
  country: string;
  population: string;
  description?: string;
  prayerPoints?: string[];
  scriptures?: string[];
  category: string;
  intercessorCount: number;
}

interface UkCampus {
  id: number;
  name: string;
  type: string;
  city: string;
  region: string;
  studentPopulation?: number;
  hasAltar?: boolean;
}

interface PrayerSubscription {
  id: number;
  focusGroupId?: number;
  altarId?: number;
  type: string;
}

interface PrayerStats {
  totalHours: number;
  totalIntercessors: number;
  campusesCovered: number;
}

export function PrayHub() {
  const [, navigate] = useLocation();
  const [selectedTimer, setSelectedTimer] = useState(5);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptType, setAdoptType] = useState<"nation" | "campus">("nation");
  const [selectedGroup, setSelectedGroup] = useState<PrayerFocusGroup | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<UkCampus | null>(null);
  const [campusSearch, setCampusSearch] = useState("");
  const [showPrayerDetail, setShowPrayerDetail] = useState(false);
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Fetch prayer focus groups from new API
  const { data: focusGroups = [], isLoading: focusesLoading } = useQuery<PrayerFocusGroup[]>({
    queryKey: ["/api/prayer/focus-groups"],
    queryFn: async () => {
      const res = await fetch("/api/prayer/focus-groups");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch UK campuses
  const { data: ukCampuses = [], isLoading: campusesLoading } = useQuery<UkCampus[]>({
    queryKey: ["/api/prayer/uk-campuses", campusSearch],
    queryFn: async () => {
      const url = campusSearch 
        ? `/api/prayer/uk-campuses/search?q=${encodeURIComponent(campusSearch)}`
        : "/api/prayer/uk-campuses";
      const res = await fetch(url);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch user's prayer subscriptions
  const { data: subscriptions = [] } = useQuery<PrayerSubscription[]>({
    queryKey: ["/api/prayer/subscriptions"],
    queryFn: async () => {
      const res = await fetch("/api/prayer/subscriptions", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch prayer stats
  const { data: prayerStats } = useQuery<PrayerStats>({
    queryKey: ["/api/prayer/stats"],
    queryFn: async () => {
      const res = await fetch("/api/prayer/stats");
      if (!res.ok) return { totalHours: 0, totalIntercessors: 0, campusesCovered: 0 };
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

  const { data: streakData } = useQuery<{ streak: number }>({
    queryKey: ["/api/mission/prayer-streak"],
    queryFn: async () => {
      const res = await fetch("/api/mission/prayer-streak", { credentials: "include" });
      if (!res.ok) return { streak: 0 };
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Subscribe to a focus group / adopt a nation
  const adoptMutation = useMutation({
    mutationFn: async (data: { focusGroupId?: number; altarId?: number; type: "nation" | "campus" }) => {
      const res = await apiRequest("POST", "/api/prayer/subscriptions", {
        ...data,
        receiveReminders: true,
        reminderFrequency: "daily",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer/subscriptions"] });
      toast.success("You've committed to pray! Welcome to the movement.");
      setShowAdoptModal(false);
      setShowPrayerDetail(false);
      setSelectedGroup(null);
      setSelectedCampus(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to join prayer group");
    },
  });

  // Log prayer session
  const logPrayerMutation = useMutation({
    mutationFn: async (data: { focusGroupId?: number; durationMinutes: number }) => {
      const res = await apiRequest("POST", "/api/prayer/logs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer/stats"] });
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
                focusGroupId: selectedGroup?.id,
                durationMinutes: selectedTimer,
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

  const streak = streakData?.streak || 0;
  const hasSubscription = subscriptions.length > 0;

  // Group focus groups by category
  const nationGroups = focusGroups.filter(g => g.category === "nation" || g.category === "city");
  const campusGroups = focusGroups.filter(g => g.category === "campus");
  const unreachedGroups = focusGroups.filter(g => g.category === "unreached");

  const displayFocuses = focusGroups.slice(0, 3);
  const displayRooms = liveRooms.length > 0 ? liveRooms : [
    { id: 1, title: "24/7 Global Prayer Room", scheduleType: "always_on", maxParticipants: 47, status: "live" },
    { id: 2, title: "Nations Awakening Prayer", scheduleType: "scheduled", scheduledAt: new Date(), status: "upcoming" },
  ];

  const handleSelectGroup = (group: PrayerFocusGroup) => {
    setSelectedGroup(group);
    setShowPrayerDetail(true);
  };

  const handleAdoptNation = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to adopt a nation");
      navigate("/login");
      return;
    }
    if (selectedGroup) {
      adoptMutation.mutate({ focusGroupId: selectedGroup.id, type: "nation" });
    }
  };

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

          {/* Prayer Stats Banner */}
          {prayerStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-3 gap-3 mb-6"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-primary">{prayerStats.totalHours || 0}</div>
                <div className="text-xs text-white/50">Prayer Hours</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-[#7C9A8E]">{prayerStats.totalIntercessors || 0}</div>
                <div className="text-xs text-white/50">Intercessors</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-[#D4A574]">{prayerStats.campusesCovered || 0}</div>
                <div className="text-xs text-white/50">Campuses</div>
              </div>
            </motion.div>
          )}

          {/* Adopt a Focus Section */}
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
                <p className="text-sm text-white/60">Choose a nation or campus to pray for</p>
              </div>
            </div>
            
            {focusesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 text-white/50 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {displayFocuses.map((group) => (
                  <motion.div
                    key={group.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 cursor-pointer transition-all border border-white/5"
                    onClick={() => handleSelectGroup(group)}
                    data-testid={`focus-${group.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{group.name}</h4>
                        <p className="text-xs text-white/50">{group.region} • {group.population}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary font-medium">{group.intercessorCount} praying</span>
                        <ChevronRight className="h-5 w-5 text-white/30" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button 
                className="bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl"
                onClick={() => { setAdoptType("nation"); setShowAdoptModal(true); }}
                data-testid="button-adopt-nation"
              >
                <Globe2 className="h-4 w-4 mr-2" />
                Nations
              </Button>
              <Button 
                className="bg-[#4A7C7C] hover:bg-[#4A7C7C]/90 text-white font-bold py-5 rounded-2xl"
                onClick={() => { setAdoptType("campus"); setShowAdoptModal(true); }}
                data-testid="button-adopt-campus"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                UK Campuses
              </Button>
            </div>
          </motion.div>

          {/* Quick Prayer Timer */}
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

          {/* Live Prayer Rooms */}
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
                        onClick={() => {
                          if (room.status === "live" || room.scheduleType === "always_on") {
                            toast.success("Joining prayer room...");
                            navigate(`/pray/room/${room.id}`);
                          } else {
                            toast.success("Reminder set! We'll notify you when this session starts.");
                          }
                        }}
                        data-testid={`button-room-action-${room.id}`}
                      >
                        {room.status === "live" || room.scheduleType === "always_on" ? "Join" : "Remind Me"}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Spirit-Led Prompt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#D4A574]/20 to-[#7C9A8E]/20 backdrop-blur-md rounded-3xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-[#D4A574]/30 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-[#D4A574]" />
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
                onClick={() => navigate("/reflection")}
                data-testid="button-journal"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Journal
              </Button>
              <Button 
                className="flex-1 bg-[#D4A574] hover:bg-[#D4A574]/90 text-white font-bold py-5 rounded-2xl"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error("Please sign in to send encouragement");
                    return;
                  }
                  navigate("/community");
                  toast.success("Share your encouragement with the community!");
                }}
                data-testid="button-send-encouragement"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Now
              </Button>
            </div>
          </motion.div>
          
        </div>
      </main>

      {/* Adopt Modal */}
      <Dialog open={showAdoptModal} onOpenChange={setShowAdoptModal}>
        <DialogContent className="bg-[#1a2744] border-white/10 text-white max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display flex items-center gap-2">
              {adoptType === "nation" ? (
                <>
                  <Globe2 className="h-5 w-5 text-primary" />
                  Adopt a Nation
                </>
              ) : (
                <>
                  <GraduationCap className="h-5 w-5 text-[#4A7C7C]" />
                  Pray for UK Campuses
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={adoptType} onValueChange={(v) => setAdoptType(v as "nation" | "campus")} className="mt-2">
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger value="nation" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Nations
              </TabsTrigger>
              <TabsTrigger value="campus" className="data-[state=active]:bg-[#4A7C7C] data-[state=active]:text-white">
                UK Campuses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nation" className="mt-4 space-y-3">
              {/* Categories */}
              <div className="space-y-4">
                {unreachedGroups.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase text-white/50 mb-2 font-bold">Unreached People Groups</h4>
                    <div className="space-y-2">
                      {unreachedGroups.map((group) => (
                        <motion.div
                          key={group.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="bg-white/5 hover:bg-white/10 rounded-xl p-3 cursor-pointer border border-white/5"
                          onClick={() => handleSelectGroup(group)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-sm">{group.name}</h5>
                              <p className="text-xs text-white/50">{group.region} • {group.population}</p>
                            </div>
                            <span className="text-xs text-primary">{group.intercessorCount} praying</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {nationGroups.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase text-white/50 mb-2 font-bold">Nations & Cities</h4>
                    <div className="space-y-2">
                      {nationGroups.map((group) => (
                        <motion.div
                          key={group.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="bg-white/5 hover:bg-white/10 rounded-xl p-3 cursor-pointer border border-white/5"
                          onClick={() => handleSelectGroup(group)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-sm">{group.name}</h5>
                              <p className="text-xs text-white/50">{group.country} • {group.population}</p>
                            </div>
                            <span className="text-xs text-primary">{group.intercessorCount} praying</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {campusGroups.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase text-white/50 mb-2 font-bold">Campus Movements</h4>
                    <div className="space-y-2">
                      {campusGroups.map((group) => (
                        <motion.div
                          key={group.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="bg-white/5 hover:bg-white/10 rounded-xl p-3 cursor-pointer border border-white/5"
                          onClick={() => handleSelectGroup(group)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-sm">{group.name}</h5>
                              <p className="text-xs text-white/50">{group.region} • {group.population}</p>
                            </div>
                            <span className="text-xs text-primary">{group.intercessorCount} praying</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="campus" className="mt-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search universities or colleges..."
                  value={campusSearch}
                  onChange={(e) => setCampusSearch(e.target.value)}
                  className="bg-white/5 border-white/10 pl-10 text-white placeholder:text-white/40"
                />
              </div>

              {campusesLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 text-white/50 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {ukCampuses.map((campus) => (
                    <motion.div
                      key={campus.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`bg-white/5 hover:bg-white/10 rounded-xl p-3 cursor-pointer border border-white/5 ${
                        selectedCampus?.id === campus.id ? 'ring-2 ring-[#4A7C7C]' : ''
                      }`}
                      onClick={() => setSelectedCampus(campus)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            campus.type === 'university' ? 'bg-[#4A7C7C]/20' : 'bg-[#D4A574]/20'
                          }`}>
                            {campus.type === 'university' ? (
                              <Building className="h-5 w-5 text-[#4A7C7C]" />
                            ) : (
                              <GraduationCap className="h-5 w-5 text-[#D4A574]" />
                            )}
                          </div>
                          <div>
                            <h5 className="font-bold text-sm">{campus.name}</h5>
                            <p className="text-xs text-white/50 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {campus.city}, {campus.region}
                            </p>
                          </div>
                        </div>
                        {campus.hasAltar && (
                          <div className="bg-primary/20 rounded-full px-2 py-1">
                            <span className="text-xs text-primary font-medium">Active Altar</span>
                          </div>
                        )}
                      </div>
                      {campus.studentPopulation && (
                        <p className="text-xs text-white/40 mt-2 ml-13">
                          {campus.studentPopulation.toLocaleString()} students
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {selectedCampus && (
                <Button
                  className="w-full bg-[#4A7C7C] hover:bg-[#4A7C7C]/90 text-white font-bold py-5 rounded-2xl mt-4"
                  onClick={() => navigate(`/pray/campus/${selectedCampus.id}`)}
                  data-testid="button-pray-for-campus"
                >
                  <Church className="h-5 w-5 mr-2" />
                  Pray for {selectedCampus.name}
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Prayer Detail Modal */}
      <Dialog open={showPrayerDetail} onOpenChange={setShowPrayerDetail}>
        <DialogContent className="bg-[#1a2744] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">{selectedGroup?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {selectedGroup?.country || selectedGroup?.region}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {selectedGroup?.population}
              </span>
              <span className="flex items-center gap-1">
                <HandHeart className="h-4 w-4" />
                {selectedGroup?.intercessorCount} praying
              </span>
            </div>

            {selectedGroup?.description && (
              <p className="text-white/80 text-sm">{selectedGroup.description}</p>
            )}

            {selectedGroup?.prayerPoints && selectedGroup.prayerPoints.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  Prayer Points
                </h4>
                <ul className="space-y-2">
                  {selectedGroup.prayerPoints.map((point, i) => (
                    <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedGroup?.scriptures && selectedGroup.scriptures.length > 0 && (
              <div className="bg-primary/10 rounded-2xl p-4">
                <h4 className="font-bold text-sm flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Scripture Focus
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedGroup.scriptures.map((scripture, i) => (
                    <span key={i} className="bg-white/10 rounded-full px-3 py-1 text-xs font-medium text-primary">
                      {scripture}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 font-bold py-5 rounded-2xl"
                onClick={() => setShowPrayerDetail(false)}
              >
                Back
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl"
                onClick={handleAdoptNation}
                disabled={adoptMutation.isPending}
                data-testid="button-commit-prayer"
              >
                {adoptMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <HandHeart className="h-5 w-5 mr-2" />
                    Commit to Pray
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
