import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Globe2, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@assets/generated_images/young_man_praying_with_golden_light_overlay.png";
import visionVideo from "@assets/generated_videos/holy_spirit_dove_vision_video.mp4";
import logoImage from "@assets/1_1765584395888.png";
import heroBgImage from "@assets/11_1767182385476.png";

export function Hero() {
  const [showVideo, setShowVideo] = useState(false);
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 md:pt-36 pb-12 overflow-hidden">
      {/* Background Image with Rich Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBgImage} 
          alt="Sunrise with cross" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C9A8E]/20 via-[#D4A574]/15 to-[#4A7C7C]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8F3]/90 via-[#FFF8F3]/70 to-transparent" />
      </div>
      
      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#1a2744]/95 flex items-center justify-center p-4"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideo(false)}
                className="absolute -top-12 right-0 text-white hover:text-primary transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
              <video
                src={visionVideo}
                controls
                autoPlay
                className="w-full rounded-2xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Circles - More Vibrant */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-br from-[#D4A574]/40 to-orange-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-[#7C9A8E]/40 to-[#4A7C7C]/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#D4A574]/10 via-transparent to-[#7C9A8E]/10 rounded-full blur-3xl" />
      
      {/* Subtle Logo Watermark */}
      <div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[200px] opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url(${logoImage})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'grayscale(100%)',
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 bg-white border border-orange-100 rounded-full px-4 py-2 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-bold text-xs text-orange-900 uppercase tracking-wider">A Call to Vigilance, Revival & Spiritual Awakening!</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-gray-900 leading-[1.05] tracking-tight">
              Faith. Real Life. <br />
              <span className="text-primary relative inline-block">
                Mission.
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-orange-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed">
              <span className="text-[clamp(1.5rem,4vw,2rem)] md:text-[2.5rem] font-display font-black text-primary block mb-2 tracking-tight drop-shadow-sm">Reawakened</span>
              is the digital hub for a generation ready to encounter Jesus, find their purpose, and change the world.
            </p>

            <blockquote className="text-base md:text-lg text-gray-600 max-w-lg leading-relaxed border-l-4 border-primary/30 pl-4 italic bg-white/50 py-3 rounded-r-lg">
              "I will pour out my Spirit upon all of you! Your sons and daughters will prophesy; your old men will dream dreams, and your young men see visions."
              <span className="block text-sm text-primary font-bold mt-2 not-italic">— Joel 2:28</span>
            </blockquote>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-14 text-base font-bold shadow-xl shadow-orange-500/20 w-full sm:w-auto hover:-translate-y-1 transition-all"
                data-testid="button-start-mission"
                onClick={() => navigate(isAuthenticated ? '/missions' : '/mission/onboarding')}
              >
                <Globe2 className="h-5 w-5 mr-2" />
                {isAuthenticated ? 'Continue Your Mission' : 'Start Your Mission'}
              </Button>
              <Button 
                variant="outline"
                size="lg" 
                className="border-2 border-gray-200 bg-white/80 hover:bg-white text-gray-900 rounded-full px-6 h-14 text-base font-bold w-full sm:w-auto hover:-translate-y-1 transition-all"
                data-testid="button-pray-now"
                onClick={() => navigate('/pray')}
              >
                Pray Now
              </Button>
            </div>
            <div 
              className="flex items-center gap-3 cursor-pointer group justify-center sm:justify-start mt-2"
              onClick={() => setShowVideo(true)}
              data-testid="button-watch-video"
            >
              <div className="h-12 w-12 rounded-full bg-white border border-gray-100 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform text-primary">
                <Play className="h-4 w-4 fill-current ml-1" />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-primary transition-colors text-sm">Watch Our Vision</span>
            </div>
          </motion.div>

          {/* Right Image Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src={heroImage} 
                alt="Young man praying" 
                className="w-full h-[350px] md:h-[450px] lg:h-[600px] object-cover"
              />
              
              {/* Floating Cards */}
              <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-4 max-w-xs border border-white/50">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Globe2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Global Impact</p>
                  <p className="text-xs text-gray-500">50 Nations to be Reached</p>
                </div>
              </div>

              <div className="absolute top-12 right-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50">
                 <span className="text-sm font-bold text-gray-900">🔥 500+ Sparks Today</span>
              </div>
            </div>
            
            {/* Background Shape */}
            <div className="absolute -top-10 -right-10 w-full h-full bg-orange-100 rounded-[40px] -z-10 -rotate-3" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
