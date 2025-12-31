import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
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
  Search,
  Loader2,
  Flame,
  Trophy,
  Laptop,
  Target,
  BookOpen,
  Play,
  Sparkles
} from "lucide-react";
import type { MissionProject, MissionOpportunity, MissionChallenge, TrainingModule } from "@shared/schema";

const digitalActions = [
  { id: 1, title: "Share Gospel Card", type: "share", icon: Share2, description: "Share a beautiful gospel message", color: "bg-primary" },
  { id: 2, title: "Invite Friends", type: "invite", icon: Users, description: "Invite someone to join the movement", color: "bg-[#4A7C7C]" },
  { id: 3, title: "Quick Training", type: "training", icon: GraduationCap, description: "Complete an evangelism module", color: "bg-[#D4A574]" },
  { id: 4, title: "Start Conversation", type: "followup", icon: MessageCircle, description: "Begin a discipleship chat", color: "bg-[#7C9A8E]" },
];

export function MissionsHub() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"digital" | "projects" | "training">("digital");
  const [showFilters, setShowFilters] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const { data: projects = [], isLoading: projectsLoading } = useQuery<MissionProject[]>({
    queryKey: ["/api/mission/projects"],
    queryFn: async () => {
      const res = await fetch("/api/mission/projects");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: opportunities = [], isLoading: oppsLoading } = useQuery<MissionOpportunity[]>({
    queryKey: ["/api/mission/opportunities"],
    queryFn: async () => {
      const res = await fetch("/api/mission/opportunities");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: challenges = [], isLoading: challengesLoading } = useQuery<MissionChallenge[]>({
    queryKey: ["/api/mission/challenges"],
    queryFn: async () => {
      const res = await fetch("/api/mission/challenges?active=true");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: training = [], isLoading: trainingLoading } = useQuery<TrainingModule[]>({
    queryKey: ["/api/mission/training"],
    queryFn: async () => {
      const res = await fetch("/api/mission/training");
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

  const displayProjects = projects.length > 0 ? projects : [
    { id: 1, title: "Digital Bible Distribution - East Africa", description: "Providing digital Bibles to 10,000 youth", location: "East Africa", hasDigitalActions: true, fundingGoal: 15000, fundingRaised: 8750 },
    { id: 2, title: "Youth Discipleship Network", description: "Training 500 young leaders", location: "Southeast Asia", hasDigitalActions: true, fundingGoal: 25000, fundingRaised: 12000 },
    { id: 3, title: "Campus Revival Movement", description: "Prayer and evangelism on 50 campuses", location: "Europe", hasDigitalActions: true, fundingGoal: 20000, fundingRaised: 5000 },
  ];

  const displayTraining = training.length > 0 ? training : [
    { id: 1, title: "Share Your Faith 101", durationMinutes: 15, category: "evangelism" },
    { id: 2, title: "Effective Digital Outreach", durationMinutes: 20, category: "skills" },
    { id: 3, title: "Prayer for Nations", durationMinutes: 10, category: "prayer" },
  ];

  const displayChallenges = challenges.length > 0 ? challenges : [
    { id: 1, title: "21-Day Prayer Challenge", durationDays: 21, theme: "prayer" },
    { id: 2, title: "Share the Gospel Week", durationDays: 7, theme: "evangelism" },
  ];

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
              Go Digital. Go Global.
            </h1>
            <p className="text-white/70">
              Make an impact from anywhere in the world
            </p>
          </motion.div>

          {!dashboard?.profile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-gradient-to-r from-primary/30 to-[#D4A574]/20 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <Rocket className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">Start Your Mission</h3>
                  <p className="text-sm text-white/60">Set up your profile and join the movement</p>
                </div>
              </div>
              <Button 
                className="w-full mt-4 bg-white text-primary hover:bg-white/90 font-bold py-5 rounded-2xl"
                onClick={() => navigate("/mission/onboarding")}
                data-testid="button-start-mission"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Begin Setup
              </Button>
            </motion.div>
          )}

          {dashboard?.streak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{dashboard.streak} Day Streak!</p>
                  <p className="text-xs text-white/50">Keep the momentum going</p>
                </div>
              </div>
              <Trophy className="h-6 w-6 text-yellow-400" />
            </motion.div>
          )}

          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl">
            {[
              { key: "digital", label: "Digital", icon: Laptop },
              { key: "projects", label: "Projects", icon: Target },
              { key: "training", label: "Training", icon: BookOpen },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.key
                    ? "bg-primary text-white"
                    : "text-white/60 hover:bg-white/5"
                }`}
                data-testid={`tab-${tab.key}`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "digital" && (
              <motion.div
                key="digital"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  {digitalActions.map((action) => (
                    <motion.div
                      key={action.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white/10 backdrop-blur-md rounded-2xl p-4 cursor-pointer border border-white/5 hover:border-white/20 transition-all"
                      onClick={() => navigate(`/missions/action/${action.type}`)}
                      data-testid={`action-${action.id}`}
                    >
                      <div className={`h-10 w-10 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-white text-sm mb-1">{action.title}</h4>
                      <p className="text-xs text-white/50">{action.description}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Active Challenges
                  </h3>
                  <div className="space-y-3">
                    {displayChallenges.map((challenge: any) => (
                      <motion.div
                        key={challenge.id}
                        whileHover={{ scale: 1.01 }}
                        className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 cursor-pointer transition-all"
                        data-testid={`challenge-${challenge.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-white text-sm">{challenge.title}</h4>
                            <p className="text-xs text-white/50">{challenge.durationDays} days • {challenge.theme}</p>
                          </div>
                          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                            Join
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "projects" && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white/60">{displayProjects.length} projects</p>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-1 text-sm text-primary"
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                  </button>
                </div>

                {projectsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 text-white/50 animate-spin" />
                  </div>
                ) : (
                  displayProjects.map((project: any) => (
                    <motion.div
                      key={project.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white/10 backdrop-blur-md rounded-2xl p-4 cursor-pointer border border-white/5 hover:border-white/20 transition-all"
                      onClick={() => navigate(`/missions/project/${project.id}`)}
                      data-testid={`project-${project.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-white">{project.title}</h4>
                            {project.hasDigitalActions && (
                              <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">
                                Digital
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white/60 mb-2">{project.description}</p>
                          <div className="flex items-center gap-4 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {project.location || "Global"}
                            </span>
                            {project.fundingGoal && (
                              <span>
                                ${(project.fundingRaised || 0).toLocaleString()} / ${project.fundingGoal.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {project.fundingGoal && (
                            <div className="bg-white/10 rounded-full h-1.5 mt-2">
                              <div 
                                className="bg-primary h-1.5 rounded-full transition-all"
                                style={{ width: `${((project.fundingRaised || 0) / project.fundingGoal) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-white/30 mt-1" />
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "training" && (
              <motion.div
                key="training"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <p className="text-sm text-white/60 mb-2">Build your mission skills</p>

                {trainingLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 text-white/50 animate-spin" />
                  </div>
                ) : (
                  displayTraining.map((module: any) => (
                    <motion.div
                      key={module.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white/10 backdrop-blur-md rounded-2xl p-4 cursor-pointer border border-white/5 hover:border-white/20 transition-all"
                      data-testid={`training-${module.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{module.title}</h4>
                            <p className="text-xs text-white/50">{module.durationMinutes} min • {module.category}</p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </main>
    </div>
  );
}
