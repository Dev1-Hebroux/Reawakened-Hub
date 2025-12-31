import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Heart, HandHeart, Send, ArrowRight, Target, Sparkles, Eye } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import visionVideo from "@assets/generated_videos/holy_spirit_dove_vision_video.mp4";
import worldMapBg from "@assets/11_1767182385476.png";

export function Hero() {
  const [showVideo, setShowVideo] = useState(false);
  const [, navigate] = useLocation();

  const stats = [
    { value: "10k+", label: "disciples by 2030", tag: "OUR VISION" },
    { value: "50+", label: "nations reached", tag: "OUR GOAL" },
    { value: "365", label: "sparks per year", tag: "DAILY" },
    { value: "12+", label: "mission projects", tag: "LAUNCHING" },
  ];

  const actionCards = [
    { id: 'pray', label: 'Pray', subtitle: 'Adopt a people group', icon: Heart, href: '/pray' },
    { id: 'give', label: 'Give', subtitle: 'Support mission projects', icon: HandHeart, href: '/give' },
    { id: 'go', label: 'Go', subtitle: 'Join outreach trips', icon: Send, href: '/missions' },
  ];

  return (
    <section className="relative min-h-[85vh] md:min-h-[80vh] flex flex-col pt-16 overflow-hidden bg-[#1a2744]">
      {/* Background with world map */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${worldMapBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2744]/80 via-[#1a2744]/90 to-[#1a2744]" />
      </div>
      
      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideo(false)}
                className="absolute -top-10 right-0 text-white hover:text-primary transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <video
                src={visionVideo}
                controls
                autoPlay
                className="w-full rounded-xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto px-4 w-full relative z-10 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 bg-primary/20 text-primary rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="h-3 w-3" />
            Global Impact
          </span>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-3">
            Ready to Change<br />the World?
          </h1>

          <p className="text-base md:text-lg text-white/70 max-w-xl mx-auto mb-6 leading-relaxed">
            Don't just watch. Act. Reawakened is your launchpad to pray, give, and go to the nations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Button 
              size="lg" 
              className="bg-white text-[#1a2744] hover:bg-gray-100 rounded-full px-6 h-11 text-sm font-bold w-full sm:w-auto"
              data-testid="button-start-mission"
              onClick={() => navigate('/start-mission')}
            >
              Start Your Mission
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="border-2 border-white/30 bg-transparent hover:bg-white/10 text-white rounded-full px-6 h-11 text-sm font-bold w-full sm:w-auto"
              data-testid="button-view-projects"
              onClick={() => navigate('/missions')}
            >
              View Projects
            </Button>
          </div>

          {/* Action Cards */}
          <div className="grid gap-3 max-w-md mx-auto">
            {actionCards.map((card) => (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate(card.href)}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm hover:bg-white/15 rounded-xl p-4 text-left transition-all group"
                data-testid={`action-card-${card.id}`}
              >
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">{card.label}</div>
                  <div className="text-xs text-white/60">{card.subtitle}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-white/70 transition-colors" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stats Bar */}
      <div className="relative z-10 mt-auto">
        <div className="bg-white rounded-t-2xl md:rounded-t-3xl shadow-lg">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-[#1a2744]">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{stat.tag}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
