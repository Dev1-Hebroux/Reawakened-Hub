import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
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
  Sparkles
} from "lucide-react";

const peopleGroups = [
  { id: 1, name: "Unreached Youth in North Africa", region: "North Africa", population: "45M+", imageUrl: "/placeholder-people.jpg" },
  { id: 2, name: "Urban Professionals in Tokyo", region: "East Asia", population: "14M+", imageUrl: "/placeholder-people.jpg" },
  { id: 3, name: "Rural Communities in South India", region: "South Asia", population: "120M+", imageUrl: "/placeholder-people.jpg" },
];

const liveRooms = [
  { id: 1, title: "24/7 Global Prayer Room", type: "always_on", participants: 47, status: "live" },
  { id: 2, title: "Nations Awakening Prayer", type: "scheduled", scheduledAt: "7:00 PM GMT", status: "upcoming" },
  { id: 3, title: "Youth Revival Intercession", type: "scheduled", scheduledAt: "9:00 PM GMT", status: "upcoming" },
];

export function PrayHub() {
  const [, navigate] = useLocation();
  const [hasAdoption] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState(5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] via-[#1a2744]/95 to-[#1a2744]/90">
      <Navbar />
      
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-lg mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-5"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 mb-3">
              <Heart className="h-3 w-3 text-primary" />
              <span className="text-xs font-bold text-white/90">Pray</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-1">
              Intercede for the Nations
            </h1>
            <p className="text-sm text-white/70">
              Your prayers fuel revival across the earth
            </p>
          </motion.div>

          {!hasAdoption ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Globe2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Adopt a Focus</h3>
                  <p className="text-xs text-white/60">Choose a people group to pray for</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {peopleGroups.map((group) => (
                  <motion.div
                    key={group.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 cursor-pointer transition-all border border-white/5"
                    onClick={() => navigate("/pray/adopt")}
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
              
              <Button 
                className="w-full mt-3 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-xl text-sm"
                onClick={() => navigate("/pray/adopt")}
                data-testid="button-adopt-focus"
              >
                <Globe2 className="h-4 w-4 mr-2" />
                Browse All People Groups
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-primary/20 to-[#4A7C7C]/20 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Flame className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Today's Prayer</h3>
                    <p className="text-sm text-white/60">Day 7 of 21</p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-full px-3 py-1">
                  <span className="text-xs font-bold text-primary">🔥 7 Day Streak</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 mb-4">
                <p className="text-sm text-white/80 italic mb-2">
                  "Ask of me, and I will make the nations your inheritance, the ends of the earth your possession."
                </p>
                <p className="text-xs text-primary font-bold">— Psalm 2:8</p>
              </div>
              
              <Button 
                className="w-full bg-white text-primary hover:bg-white/90 font-bold py-6 rounded-2xl"
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
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/10"
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
              data-testid="button-start-timer"
            >
              <Timer className="h-5 w-5 mr-2" />
              Start {selectedTimer} Minute Prayer
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/10"
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
            
            <div className="space-y-3">
              {liveRooms.map((room) => (
                <motion.div
                  key={room.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 cursor-pointer transition-all border border-white/5"
                  data-testid={`room-${room.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {room.status === "live" && (
                        <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                      )}
                      <div>
                        <h4 className="font-bold text-white text-sm">{room.title}</h4>
                        <p className="text-xs text-white/50">
                          {room.status === "live" 
                            ? `${room.participants} praying now` 
                            : `Starts at ${room.scheduledAt}`
                          }
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className={room.status === "live" 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : "bg-white/10 hover:bg-white/20 text-white"
                      }
                    >
                      {room.status === "live" ? "Join" : "Remind Me"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#D4A574]/20 to-[#7C9A8E]/20 backdrop-blur-md rounded-2xl p-4 border border-white/10"
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