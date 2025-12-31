import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  HandHeart, 
  Heart, 
  Repeat,
  ChevronRight,
  Gift,
  Target,
  Users,
  Sparkles,
  CheckCircle2,
  TrendingUp
} from "lucide-react";

const featuredCampaign = {
  id: 1,
  title: "Harvest 2025 Push",
  description: "Fuel the greatest evangelism push of 2025. Every dollar reaches 10 young people with the gospel.",
  goal: 50000,
  raised: 32500,
  endDate: "Jan 31, 2025",
  supporters: 247,
};

const quickAmounts = [10, 25, 50, 100];

const projects = [
  { id: 1, title: "Digital Bible Distribution", raised: 8750, goal: 15000, supporters: 89 },
  { id: 2, title: "Youth Discipleship Network", raised: 12000, goal: 25000, supporters: 156 },
  { id: 3, title: "Campus Revival Movement", raised: 5000, goal: 20000, supporters: 42 },
];

const impactStories = [
  { id: 1, name: "Sarah M.", quote: "Your giving helped me receive my first Bible. Now I'm leading a small group!" },
  { id: 2, name: "James K.", quote: "The training I received changed everything. I've shared Jesus with 20 friends." },
];

export function GiveHub() {
  const [, navigate] = useLocation();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);
  const [isRecurring, setIsRecurring] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] via-[#1a2744]/95 to-[#1a2744]/90">
      <Navbar />
      
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-lg mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 mb-3">
              <HandHeart className="h-3 w-3 text-primary" />
              <span className="text-xs font-bold text-white/90">Give</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-1">
              Fuel the Mission
            </h1>
            <p className="text-sm text-white/70">
              Your generosity reaches the nations
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-primary/30 to-[#D4A574]/20 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Featured Campaign</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{featuredCampaign.title}</h3>
              <p className="text-sm text-white/70 mb-4">{featuredCampaign.description}</p>
              
              <div className="bg-white/10 rounded-full h-3 mb-2">
                <motion.div 
                  className="bg-gradient-to-r from-primary to-[#D4A574] h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(featuredCampaign.raised / featuredCampaign.goal) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              
              <div className="flex justify-between text-sm mb-4">
                <span className="text-white font-bold">${featuredCampaign.raised.toLocaleString()} raised</span>
                <span className="text-white/60">of ${featuredCampaign.goal.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {featuredCampaign.supporters} supporters
                </span>
                <span>Ends {featuredCampaign.endDate}</span>
              </div>
              
              <Button 
                className="w-full bg-white text-primary hover:bg-white/90 font-medium py-2.5 rounded-xl text-sm"
                onClick={() => navigate("/give/campaign/1")}
                data-testid="button-give-campaign"
              >
                <Gift className="h-5 w-5 mr-2" />
                Give to This Campaign
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-[#7C9A8E]/30 flex items-center justify-center">
                <Target className="h-6 w-6 text-[#7C9A8E]" />
              </div>
              <div>
                <h3 className="font-bold text-white">Quick Give</h3>
                <p className="text-sm text-white/60">Support the mission in seconds</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`py-3 rounded-xl font-bold transition-all ${
                    selectedAmount === amount 
                      ? 'bg-primary text-white' 
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                  data-testid={`amount-${amount}`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-xl">
              <button
                onClick={() => setIsRecurring(!isRecurring)}
                className={`h-6 w-11 rounded-full transition-colors relative ${
                  isRecurring ? 'bg-primary' : 'bg-white/20'
                }`}
              >
                <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${
                  isRecurring ? 'left-6' : 'left-1'
                }`} />
              </button>
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-white/60" />
                <span className="text-sm text-white/80">Make this monthly</span>
              </div>
            </div>
            
            <Button 
              className="w-full bg-[#7C9A8E] hover:bg-[#7C9A8E]/90 text-white font-bold py-6 rounded-2xl"
              disabled={!selectedAmount}
              data-testid="button-quick-give"
            >
              <HandHeart className="h-5 w-5 mr-2" />
              Give ${selectedAmount || 0} {isRecurring ? "Monthly" : "Now"}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Support a Project</h3>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 cursor-pointer transition-all border border-white/5"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  data-testid={`project-${project.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white text-sm">{project.title}</h4>
                    <ChevronRight className="h-4 w-4 text-white/30" />
                  </div>
                  
                  <div className="bg-white/10 rounded-full h-1.5 mb-2">
                    <div 
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${(project.raised / project.goal) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">${project.raised.toLocaleString()} raised</span>
                    <span className="text-white/40">{project.supporters} supporters</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#4A7C7C]/20 to-[#7C9A8E]/20 backdrop-blur-md rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-[#4A7C7C]/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#4A7C7C]" />
              </div>
              <div>
                <h3 className="font-bold text-white">Your Impact</h3>
                <p className="text-sm text-white/60">Stories from the field</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {impactStories.map((story) => (
                <div key={story.id} className="bg-white/5 rounded-2xl p-4">
                  <p className="text-sm text-white/80 italic mb-2">"{story.quote}"</p>
                  <p className="text-xs text-primary font-bold">— {story.name}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/60">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-xs">100% goes to mission</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-xs">Tax deductible</span>
              </div>
            </div>
          </motion.div>
          
        </div>
      </main>
    </div>
  );
}