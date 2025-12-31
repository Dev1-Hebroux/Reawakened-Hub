import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  Rocket, 
  Globe2, 
  Share2, 
  Users, 
  GraduationCap,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  Wifi,
  MapPin,
  Plane,
  Heart,
  HandHeart,
  Zap,
  Filter,
  Search
} from "lucide-react";

const projects = [
  {
    id: 1,
    title: "Digital Bible Distribution - East Africa",
    summary: "Providing digital Bibles to 10,000 youth in Kenya, Uganda, and Tanzania through mobile apps.",
    location: "East Africa",
    pillarTags: ["harvest", "biblical_truth"],
    fundingGoal: 15000,
    fundsRaised: 8750,
    hasDigitalActions: true,
    imageUrl: "/placeholder-project.jpg"
  },
  {
    id: 2,
    title: "Youth Discipleship Network - Southeast Asia",
    summary: "Training 500 young leaders to disciple their peers across Indonesia, Malaysia, and Philippines.",
    location: "Southeast Asia", 
    pillarTags: ["outpouring", "harvest"],
    fundingGoal: 25000,
    fundsRaised: 12000,
    hasDigitalActions: true,
    imageUrl: "/placeholder-project.jpg"
  },
  {
    id: 3,
    title: "Campus Revival Movement - Europe",
    summary: "Launching prayer and evangelism groups on 50 university campuses across Europe.",
    location: "Europe",
    pillarTags: ["outpouring", "without_walls"],
    fundingGoal: 20000,
    fundsRaised: 5000,
    hasDigitalActions: true,
    imageUrl: "/placeholder-project.jpg"
  },
];

const digitalOpportunities = [
  { id: 1, title: "Share Your Testimony", type: "share", icon: Share2, description: "Create a 60-second testimony video", color: "bg-primary" },
  { id: 2, title: "Invite a Friend", type: "invite", icon: Users, description: "Send an invite to join Reawakened", color: "bg-[#4A7C7C]" },
  { id: 3, title: "10-Min Training", type: "training", icon: GraduationCap, description: "Complete a gospel sharing module", color: "bg-[#D4A574]" },
  { id: 4, title: "Follow-Up Chat", type: "followup", icon: MessageCircle, description: "Start a discipleship conversation", color: "bg-[#7C9A8E]" },
];

const localOpportunities = [
  { id: 1, title: "Community Outreach - London", date: "Jan 15", location: "London, UK", type: "local" },
  { id: 2, title: "Youth Camp - Manchester", date: "Feb 8-10", location: "Manchester, UK", type: "local" },
];

const tripOpportunities = [
  { id: 1, title: "Kenya Mission Trip", date: "Mar 15-25", location: "Nairobi, Kenya", cost: 1500, type: "trip" },
  { id: 2, title: "Philippines Outreach", date: "Apr 5-15", location: "Manila, Philippines", cost: 2000, type: "trip" },
];

const pillarColors: Record<string, string> = {
  biblical_truth: "bg-blue-500/20 text-blue-300",
  outpouring: "bg-purple-500/20 text-purple-300",
  harvest: "bg-green-500/20 text-green-300",
  without_walls: "bg-orange-500/20 text-orange-300",
};

const pillarLabels: Record<string, string> = {
  biblical_truth: "Biblical Truth",
  outpouring: "The Outpouring",
  harvest: "The Harvest",
  without_walls: "Without Walls",
};

export function MissionsHub() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"projects" | "go">("projects");
  const [showLocalOpps, setShowLocalOpps] = useState(false);
  const [showTripOpps, setShowTripOpps] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] via-[#1a2744]/95 to-[#1a2744]/90">
      <Navbar />
      
      <main className="pt-28 pb-32 px-4">
        <div className="max-w-lg mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Rocket className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-white/90">Missions</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Take Action Today
            </h1>
            <p className="text-white/70">
              Discover projects and go digital
            </p>
          </motion.div>

          <div className="flex gap-2 mb-6 bg-white/5 rounded-2xl p-1">
            <button
              onClick={() => setActiveTab("projects")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                activeTab === "projects" 
                  ? 'bg-white text-[#1a2744]' 
                  : 'text-white/60 hover:text-white'
              }`}
              data-testid="tab-projects"
            >
              <Globe2 className="h-4 w-4 inline mr-2" />
              Projects
            </button>
            <button
              onClick={() => setActiveTab("go")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                activeTab === "go" 
                  ? 'bg-white text-[#1a2744]' 
                  : 'text-white/60 hover:text-white'
              }`}
              data-testid="tab-go"
            >
              <Zap className="h-4 w-4 inline mr-2" />
              Go Digital
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "projects" ? (
              <motion.div
                key="projects"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input 
                      type="text"
                      placeholder="Search projects..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {projects.map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                      data-testid={`project-${project.id}`}
                    >
                      <div className="h-32 bg-gradient-to-br from-[#7C9A8E]/30 to-[#4A7C7C]/30 flex items-center justify-center">
                        <Globe2 className="h-12 w-12 text-white/30" />
                      </div>
                      
                      <div className="p-4">
                        <div className="flex gap-2 mb-2">
                          {project.pillarTags.map((tag) => (
                            <span 
                              key={tag} 
                              className={`text-[10px] font-bold px-2 py-1 rounded-full ${pillarColors[tag]}`}
                            >
                              {pillarLabels[tag]}
                            </span>
                          ))}
                        </div>
                        
                        <h3 className="font-bold text-white mb-1">{project.title}</h3>
                        <p className="text-sm text-white/60 mb-3 line-clamp-2">{project.summary}</p>
                        
                        <div className="bg-white/5 rounded-full h-2 mb-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(project.fundsRaised / project.fundingGoal) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-white/50 mb-4">
                          ${project.fundsRaised.toLocaleString()} of ${project.fundingGoal.toLocaleString()} raised
                        </p>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                            onClick={(e) => { e.stopPropagation(); }}
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Pray
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-primary hover:bg-primary/90 text-white"
                            onClick={(e) => { e.stopPropagation(); }}
                          >
                            <HandHeart className="h-4 w-4 mr-1" />
                            Give
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                            onClick={(e) => { e.stopPropagation(); }}
                          >
                            <Zap className="h-4 w-4 mr-1" />
                            Act
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="go"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-gradient-to-br from-primary/20 to-[#4A7C7C]/20 backdrop-blur-md rounded-3xl p-5 mb-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Wifi className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Take Action Now</h3>
                      <p className="text-xs text-white/60">Digital outreach from anywhere</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {digitalOpportunities.map((opp) => (
                      <motion.div
                        key={opp.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 cursor-pointer transition-all border border-white/5"
                        data-testid={`digital-opp-${opp.id}`}
                      >
                        <div className={`h-10 w-10 ${opp.color} rounded-xl flex items-center justify-center mb-3`}>
                          <opp.icon className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-bold text-white text-sm mb-1">{opp.title}</h4>
                        <p className="text-[10px] text-white/50">{opp.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 mb-4">
                  <button
                    onClick={() => setShowLocalOpps(!showLocalOpps)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#7C9A8E]/30 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-[#7C9A8E]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Local Opportunities</h3>
                        <p className="text-xs text-white/60">{localOpportunities.length} near you</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-white/50 transition-transform ${showLocalOpps ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showLocalOpps && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2">
                          {localOpportunities.map((opp) => (
                            <div key={opp.id} className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-white text-sm">{opp.title}</h4>
                                <p className="text-xs text-white/50">{opp.date} • {opp.location}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-white/30" />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10">
                  <button
                    onClick={() => setShowTripOpps(!showTripOpps)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#D4A574]/30 flex items-center justify-center">
                        <Plane className="h-5 w-5 text-[#D4A574]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Mission Trips</h3>
                        <p className="text-xs text-white/60">{tripOpportunities.length} upcoming</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-white/50 transition-transform ${showTripOpps ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showTripOpps && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2">
                          {tripOpportunities.map((opp) => (
                            <div key={opp.id} className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-white text-sm">{opp.title}</h4>
                                <p className="text-xs text-white/50">{opp.date} • ${opp.cost}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-white/30" />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </main>
    </div>
  );
}