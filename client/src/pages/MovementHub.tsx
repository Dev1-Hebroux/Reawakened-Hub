import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
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
  Sparkles,
  Target,
  Clock
} from "lucide-react";

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

export function MovementHub() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"challenges" | "testimonies" | "prayer">("challenges");

  const themeColors: Record<string, string> = {
    prayer: "from-primary/30 to-[#D4A574]/20",
    evangelism: "from-[#4A7C7C]/30 to-[#7C9A8E]/20",
    growth: "from-[#7C9A8E]/30 to-[#D4A574]/20",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] via-[#1a2744]/95 to-[#1a2744]/90 pb-20">
      <Navbar />
      
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-lg mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 mb-3">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-xs font-bold text-white/90">Movement</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-1">
              Join the Revival
            </h1>
            <p className="text-sm text-white/70">
              Challenges, testimonies & prayer
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-white">Live Now</span>
              </div>
              <span className="text-xs text-white/50">{upcomingRooms.filter(r => r.isLive).length} rooms active</span>
            </div>
            
            <div className="space-y-2">
              {upcomingRooms.map((room) => (
                <div 
                  key={room.id}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    room.isLive ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-white/5 hover:bg-white/10'
                  }`}
                  data-testid={`room-${room.id}`}
                >
                  <div className="flex items-center gap-3">
                    {room.isLive && <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />}
                    <div>
                      <h4 className="font-bold text-white text-sm">{room.title}</h4>
                      <p className="text-xs text-white/50">
                        {room.isLive ? `${room.participants} praying` : room.time}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className={room.isLive ? "bg-red-500 hover:bg-red-600" : "bg-white/10 hover:bg-white/20"}
                  >
                    {room.isLive ? <Play className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex gap-2 mb-6 bg-white/5 rounded-2xl p-1">
            {[
              { key: "challenges", label: "Challenges", icon: Trophy },
              { key: "testimonies", label: "Stories", icon: Sparkles },
              { key: "prayer", label: "Prayer Wall", icon: Heart },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex-1 py-3 px-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                  activeTab === tab.key 
                    ? 'bg-white text-[#1a2744]' 
                    : 'text-white/60 hover:text-white'
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
                {challenges.map((challenge, i) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-gradient-to-br ${themeColors[challenge.theme]} backdrop-blur-md rounded-2xl p-4 border border-white/10`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Challenge</span>
                      </div>
                      {challenge.isJoined && (
                        <div className="bg-green-500/20 rounded-full px-2 py-1">
                          <span className="text-[10px] font-bold text-green-400">Day {challenge.currentDay}</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-white text-lg mb-2">{challenge.title}</h3>
                    <p className="text-sm text-white/70 mb-4">{challenge.description}</p>
                    
                    {challenge.isJoined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-white/60 mb-1">
                          <span>Progress</span>
                          <span>{challenge.currentDay}/{challenge.daysTotal} days</span>
                        </div>
                        <div className="bg-white/10 rounded-full h-2">
                          <motion.div 
                            className="bg-primary h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${((challenge.currentDay || 0) / challenge.daysTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/60">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">{challenge.participants.toLocaleString()} joined</span>
                      </div>
                      <Button 
                        size="sm"
                        className={challenge.isJoined 
                          ? "bg-white text-primary hover:bg-white/90" 
                          : "bg-primary hover:bg-primary/90 text-white"
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
                  <Sparkles className="h-5 w-5 mr-2" />
                  Share Your Story
                </Button>
                
                {testimonies.map((testimony, i) => (
                  <motion.div
                    key={testimony.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10"
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
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10"
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
          
        </div>
      </main>
    </div>
  );
}