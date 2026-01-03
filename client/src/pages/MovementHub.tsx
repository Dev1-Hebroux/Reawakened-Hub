import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  Zap, 
  Flame,
  Trophy,
  Users,
  MessageCircle,
  Heart,
  ChevronRight,
  Calendar,
  Play,
  Quote,
  Target,
  Clock,
  Award,
  Star,
  Loader2
} from "lucide-react";
import type { MissionChallenge } from "@shared/schema";

const challenges = [
  {
    id: 1,
    title: "21-Day Nations Awakening",
    description: "Pray for 21 nations in 21 days. Join thousands interceding for revival.",
    daysTotal: 21,
    daysRemaining: 14,
    participants: 1247,
    isJoined: true,
    currentDay: 7,
    theme: "prayer",
  },
  {
    id: 2,
    title: "7-Day Gospel Share",
    description: "Share your faith with one person each day for a week.",
    daysTotal: 7,
    daysRemaining: 7,
    participants: 589,
    isJoined: false,
    theme: "evangelism",
  },
  {
    id: 3,
    title: "30-Day Scripture Memory",
    description: "Memorize key verses that fuel your mission.",
    daysTotal: 30,
    daysRemaining: 25,
    participants: 892,
    isJoined: false,
    theme: "growth",
  },
];

const testimonies = [
  {
    id: 1,
    author: "Maria S.",
    type: "answered_prayer",
    content: "Prayed for my friend for 3 months. Yesterday, she gave her life to Jesus! God is so faithful.",
    likes: 156,
    timeAgo: "2 hours ago",
  },
  {
    id: 2,
    author: "David K.",
    type: "outreach_story",
    content: "Used the training to share my testimony at university. 4 students wanted to know more about Jesus!",
    likes: 89,
    timeAgo: "5 hours ago",
  },
  {
    id: 3,
    author: "Sarah L.",
    type: "salvation",
    content: "My whole family came to faith this Christmas. 12 years of prayer answered!",
    likes: 342,
    timeAgo: "1 day ago",
  },
];

const upcomingRooms = [
  { id: 1, title: "Morning Prayer Watch", time: "6:00 AM", participants: 23, isLive: true },
  { id: 2, title: "Youth Revival Fire", time: "8:00 PM", participants: 0, isLive: false },
  { id: 3, title: "Nations Intercession", time: "10:00 PM", participants: 0, isLive: false },
];

const prayerWall = [
  { id: 1, content: "Pray for open doors in North Korea", author: "Anonymous", prayingCount: 47 },
  { id: 2, content: "My friend is in hospital. Believing for healing.", author: "Emma T.", prayingCount: 89 },
  { id: 3, content: "Starting a campus ministry. Need wisdom!", author: "James L.", prayingCount: 34 },
];

const badges = [
  { id: "first_prayer", name: "First Prayer", icon: "🙏", earned: true, description: "Completed your first prayer session" },
  { id: "7_day_streak", name: "7 Day Streak", icon: "🔥", earned: true, description: "7 consecutive days of prayer" },
  { id: "21_day_streak", name: "21 Day Warrior", icon: "⚔️", earned: false, description: "21 consecutive days of prayer" },
  { id: "first_share", name: "Gospel Sharer", icon: "📢", earned: true, description: "Shared the gospel card" },
  { id: "challenge_complete", name: "Challenge Champion", icon: "🏆", earned: false, description: "Completed a full challenge" },
  { id: "intercessor", name: "Intercessor", icon: "💫", earned: false, description: "100+ prayer sessions" },
];

const leaderboardPreview = [
  { rank: 1, name: "Maria S.", points: 2450, streak: 45 },
  { rank: 2, name: "David K.", points: 2180, streak: 32 },
  { rank: 3, name: "Sarah L.", points: 1950, streak: 28 },
];

export function MovementHub() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"challenges" | "testimonies" | "prayer">("challenges");
  const { isAuthenticated } = useAuth();

  const { data: apiChallenges = [], isLoading: challengesLoading } = useQuery<MissionChallenge[]>({
    queryKey: ["/api/mission/challenges"],
    queryFn: async () => {
      const res = await fetch("/api/mission/challenges?active=true");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: dashboard } = useQuery({
    queryKey: ["/api/mission/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/mission/dashboard", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch events for calendar
  const { data: events = [], isLoading: eventsLoading } = useQuery<any[]>({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Filter to upcoming events
  const displayEvents = events.filter((e: any) => new Date(e.startDate) >= new Date());

  const themeColors: Record<string, string> = {
    prayer: "from-primary/30 to-[#D4A574]/20",
    evangelism: "from-[#4A7C7C]/30 to-[#7C9A8E]/20",
    growth: "from-[#7C9A8E]/30 to-[#D4A574]/20",
    revival: "from-primary/30 to-[#D4A574]/20",
    harvest: "from-[#4A7C7C]/30 to-[#7C9A8E]/20",
    nations: "from-[#7C9A8E]/30 to-[#D4A574]/20",
  };

  const displayChallenges = (apiChallenges.length > 0 ? apiChallenges : challenges).map((c: any) => ({
    ...c,
    daysTotal: c.durationDays || c.daysTotal || 21,
    daysRemaining: c.daysRemaining || c.durationDays || 21,
    participants: c.participants || 0,
    isJoined: c.isJoined || false,
    theme: c.theme || "prayer",
  }));

  const streak = dashboard?.streak || 0;
  const earnedBadges = badges.filter(b => b.earned).length;

  return (
    <div className="min-h-screen bg-[#1a2744]">
      <Navbar />
      
      <main className="pt-28 pb-32 px-4">
        <div className="max-w-lg mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-[#D4A574] rounded-full px-4 py-2 mb-4 shadow-lg">
              <Zap className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Movement</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-3">
              Join the Revival
            </h1>
            <p className="text-[#E8E4DE]">
              Challenges, testimonies & prayer
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#243656] rounded-3xl p-5 mb-6 border-2 border-[#D4A574]/40 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-[#D4A574]" />
                Your Journey
              </h3>
              <div className="flex items-center gap-2">
                {streak > 0 && (
                  <div className="bg-primary/20 rounded-full px-3 py-1 flex items-center gap-1">
                    <Flame className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-primary">{streak} days</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all shadow-md ${
                    badge.earned 
                      ? "bg-[#1a2744] border-2 border-[#D4A574]" 
                      : "bg-[#1a2744]/50 border border-[#4A7C7C]/20 opacity-50"
                  }`}
                  title={badge.description}
                  data-testid={`badge-${badge.id}`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  {badge.earned && (
                    <Star className="h-3 w-3 text-[#D4A574] mt-1" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#4A7C7C]/30 flex items-center justify-between">
              <span className="text-sm text-[#E8E4DE]">{earnedBadges}/{badges.length} badges earned</span>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-primary text-xs"
                onClick={() => navigate("/profile/badges")}
              >
                View All
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-[#243656] rounded-3xl p-5 mb-6 border-2 border-[#4A7C7C]/40 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#D4A574]" />
                Top Intercessors
              </h3>
              <span className="text-sm text-[#7C9A8E] font-medium">This Week</span>
            </div>
            <div className="space-y-3">
              {leaderboardPreview.map((user, i) => (
                <div 
                  key={user.rank}
                  className={`flex items-center justify-between p-3 rounded-xl shadow-md ${
                    i === 0 ? "bg-[#D4A574]/20 border-2 border-[#D4A574]" : "bg-[#1a2744] border border-[#4A7C7C]/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                      i === 0 ? "bg-[#D4A574] text-white" : 
                      i === 1 ? "bg-[#7C9A8E] text-white" : 
                      "bg-[#4A7C7C] text-white"
                    }`}>
                      {user.rank}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{user.name}</p>
                      <p className="text-xs text-[#7C9A8E]">{user.streak} day streak</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-[#D4A574]">{user.points.toLocaleString()}</p>
                    <p className="text-xs text-[#7C9A8E]">points</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#243656] rounded-3xl p-4 mb-6 border-2 border-red-500/40 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                <span className="text-base font-bold text-white">Live Now</span>
              </div>
              <span className="text-sm text-[#7C9A8E] font-medium">{upcomingRooms.filter(r => r.isLive).length} rooms active</span>
            </div>
            
            <div className="space-y-3">
              {upcomingRooms.map((room) => (
                <div 
                  key={room.id}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    room.isLive ? 'bg-red-500/20 border-2 border-red-500 hover:bg-red-500/30' : 'bg-[#1a2744] border border-[#4A7C7C]/20 hover:bg-[#2a3a5a]'
                  }`}
                  data-testid={`room-${room.id}`}
                >
                  <div className="flex items-center gap-3">
                    {room.isLive && <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />}
                    <div>
                      <h4 className="font-bold text-white text-sm">{room.title}</h4>
                      <p className="text-xs text-[#7C9A8E]">
                        {room.isLive ? `${room.participants} praying` : room.time}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className={room.isLive ? "bg-red-500 hover:bg-red-600 shadow-lg" : "bg-[#4A7C7C] hover:bg-[#4A7C7C]/80 text-white"}
                  >
                    {room.isLive ? <Play className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex gap-2 mb-6 bg-[#243656] rounded-2xl p-1.5 border border-[#4A7C7C]/30 shadow-lg">
            {[
              { key: "challenges", label: "Challenges", icon: Trophy },
              { key: "testimonies", label: "Stories", icon: Quote },
              { key: "prayer", label: "Prayer Wall", icon: Heart },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex-1 py-3 px-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === tab.key 
                    ? 'bg-[#D4A574] text-white shadow-lg' 
                    : 'text-[#E8E4DE] hover:text-white hover:bg-[#1a2744]'
                }`}
                data-testid={`tab-${tab.key}`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "challenges" && (
              <motion.div
                key="challenges"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {challengesLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-[#D4A574] animate-spin mb-3" />
                    <p className="text-[#7C9A8E] text-sm">Loading challenges...</p>
                  </div>
                ) : displayChallenges.map((challenge, i) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#243656] rounded-3xl p-5 border-2 border-[#4A7C7C]/40 shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-[#D4A574]" />
                        <span className="text-xs font-bold text-[#D4A574] uppercase tracking-wider">Challenge</span>
                      </div>
                      {challenge.isJoined && (
                        <div className="bg-green-600 rounded-full px-3 py-1 shadow-md">
                          <span className="text-[10px] font-bold text-white">Day {challenge.currentDay}</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-white text-lg mb-2">{challenge.title}</h3>
                    <p className="text-sm text-[#E8E4DE] mb-4">{challenge.description}</p>
                    
                    {challenge.isJoined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-[#7C9A8E] mb-1">
                          <span>Progress</span>
                          <span>{challenge.currentDay}/{challenge.daysTotal} days</span>
                        </div>
                        <div className="bg-[#1a2744] rounded-full h-2 border border-[#4A7C7C]/30">
                          <motion.div 
                            className="bg-[#D4A574] h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(challenge.currentDay / challenge.daysTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#7C9A8E]">
                        <Users className="h-4 w-4" />
                        <span className="text-xs font-medium">{challenge.participants.toLocaleString()} joined</span>
                      </div>
                      <Button 
                        size="sm"
                        className={challenge.isJoined 
                          ? "bg-white text-[#1a2744] hover:bg-[#E8E4DE] font-bold shadow-lg" 
                          : "bg-[#D4A574] hover:bg-[#C49464] text-white font-bold shadow-lg"
                        }
                        data-testid={`challenge-${challenge.id}`}
                      >
                        {challenge.isJoined ? "Continue" : "Join Challenge"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "testimonies" && (
              <motion.div
                key="testimonies"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-[#D4A574] hover:opacity-90 text-white font-bold py-6 rounded-2xl mb-2"
                  data-testid="button-share-testimony"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Share Your Story
                </Button>
                
                {testimonies.map((testimony, i) => (
                  <motion.div
                    key={testimony.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#243656] rounded-3xl p-5 border-2 border-[#7C9A8E]/30 shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">{testimony.author[0]}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{testimony.author}</h4>
                        <p className="text-xs text-white/50">{testimony.timeAgo}</p>
                      </div>
                    </div>
                    
                    <p className="text-white/80 mb-4">{testimony.content}</p>
                    
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-white/60 hover:text-primary transition-colors">
                        <Flame className="h-4 w-4" />
                        <span className="text-xs font-bold">{testimony.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-white/60 hover:text-primary transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">Reply</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "prayer" && (
              <motion.div
                key="prayer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Button 
                  className="w-full bg-[#7C9A8E] hover:bg-[#7C9A8E]/90 text-white font-bold py-6 rounded-2xl mb-2"
                  data-testid="button-post-prayer"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Post a Prayer Request
                </Button>
                
                {prayerWall.map((prayer, i) => (
                  <motion.div
                    key={prayer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10"
                  >
                    <p className="text-white/80 mb-3">{prayer.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">— {prayer.author}</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        I'm Praying ({prayer.prayingCount})
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Event Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#243656] rounded-3xl p-5 mt-6 border-2 border-primary/40 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Live Events Calendar</h3>
                  <p className="text-sm text-white/60">Worship, seminars & gatherings</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-primary text-xs"
                onClick={() => navigate("/mission#events")}
              >
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {eventsLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                  <p className="text-white/50 text-sm">Loading events...</p>
                </div>
              ) : displayEvents.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming events yet</p>
                </div>
              ) : (
                displayEvents.slice(0, 3).map((event: any, i: number) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 bg-[#1a2744] rounded-2xl p-4 border border-white/10"
                    data-testid={`event-${event.id}`}
                  >
                    <div className="flex flex-col items-center bg-primary/20 rounded-xl p-3 min-w-[60px]">
                      <span className="text-xs text-primary font-bold uppercase">
                        {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-2xl font-bold text-white">
                        {new Date(event.startDate).getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-sm mb-1">{event.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        {event.location && (
                          <>
                            <span>•</span>
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white"
                      onClick={() => navigate(`/mission#events`)}
                      data-testid={`button-event-${event.id}`}
                    >
                      View
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
          
        </div>
      </main>
    </div>
  );
}