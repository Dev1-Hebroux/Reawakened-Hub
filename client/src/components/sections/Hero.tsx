import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Globe2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { VisionModal } from "@/components/VisionModal";
import heroImage from "@assets/generated_images/young_man_praying_with_golden_light_overlay.png";
import studentsCampus from "@assets/Uni_Student_1767866708966.jpg";
import studentsSharing from "@assets/Uni_Student_Sharing_1767866708964.jpg";
import logoImage from "@assets/1_1765584395888.png";
import heroBgImage from "@assets/11_1767182385476.jpg";

const heroImages = [
  { src: heroImage, alt: "Young man praying" },
  { src: studentsCampus, alt: "Diverse students on university campus" },
  { src: studentsSharing, alt: "Students sharing and connecting" },
];

export function Hero() {
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 md:pt-36 pb-12 overflow-hidden">
      {/* Vision Modal */}
      <VisionModal isOpen={showVisionModal} onClose={() => setShowVisionModal(false)} />

      {/* Background Image with Rich Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBgImage}
          alt="Sunrise with cross"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          fetchPriority="low"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C9A8E]/20 via-[#D4A574]/15 to-[#4A7C7C]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8F3]/90 via-[#FFF8F3]/70 to-transparent" />
      </div>

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
        {/* Mobile: Image First, Content Below */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Image - Shows first on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative order-first lg:order-last w-full"
          >
            <div className="relative z-10 rounded-[24px] lg:rounded-[40px] overflow-hidden shadow-2xl border-2 lg:border-4 border-white lg:rotate-2 lg:hover:rotate-0 transition-transform duration-500 mx-auto max-w-sm lg:max-w-none">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={heroImages[currentImageIndex].src}
                  alt={heroImages[currentImageIndex].alt}
                  className="w-full h-[280px] sm:h-[320px] md:h-[400px] lg:h-[600px] object-cover"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  decoding="async"
                />
              </AnimatePresence>
              
              {/* Carousel Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-white w-4' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Floating Cards with Animations - Visible on all screens */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: [0, -6, 0],
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.5 },
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="flex absolute bottom-3 sm:bottom-4 lg:bottom-8 left-2 sm:left-4 lg:left-8 bg-white/95 backdrop-blur-md p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg items-center gap-2 sm:gap-3 lg:gap-4 max-w-[160px] sm:max-w-xs border border-white/50"
              >
                <div className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Globe2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-[10px] sm:text-xs lg:text-sm">Global Impact</p>
                  <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-500">50 Nations</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: [1, 1.03, 1],
                  y: [0, -4, 0],
                }}
                transition={{ 
                  opacity: { duration: 0.4, delay: 0.3 },
                  scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                }}
                className="flex absolute top-3 sm:top-8 lg:top-12 right-2 sm:right-4 lg:right-8 bg-white/95 backdrop-blur-md px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full shadow-lg border border-white/50 items-center gap-1 sm:gap-1.5"
              >
                <span className="text-xs sm:text-sm lg:text-base">🔥</span>
                <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-900">500+ Sparks</span>
              </motion.div>
            </div>
            
            {/* Background Shape - Hidden on mobile */}
            <div className="hidden lg:block absolute -top-10 -right-10 w-full h-full bg-orange-100 rounded-[40px] -z-10 -rotate-3" />
          </motion.div>

          {/* Content - Shows second on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-5 lg:space-y-8 order-last lg:order-first text-center lg:text-left"
          >
            <div className="inline-flex items-center space-x-2 bg-white border border-orange-100 rounded-full px-3 py-1.5 lg:px-4 lg:py-2 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-bold text-[10px] lg:text-xs text-orange-900 uppercase tracking-wider">A Call to Revival & Spiritual Awakening!</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-gray-900 leading-[1.1] tracking-tight">
              Faith. Real Life. <br />
              <span className="text-primary relative inline-block">
                Mission.
                <svg className="absolute -bottom-1 lg:-bottom-2 left-0 w-full h-2 lg:h-3 text-orange-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="text-base lg:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              <span className="text-2xl sm:text-3xl lg:text-[2.5rem] font-display font-black text-primary block mb-2 tracking-tight drop-shadow-sm">Reawakened</span>
              is the digital hub for a generation ready to encounter Jesus, find their purpose, and change the world.
            </p>

            <blockquote className="hidden md:block text-base lg:text-lg text-gray-600 max-w-lg leading-relaxed border-l-4 border-primary/30 pl-4 italic bg-white/50 py-3 rounded-r-lg mx-auto lg:mx-0">
              "I will pour out my Spirit upon all of you! Your sons and daughters will prophesy; your old men will dream dreams, and your young men see visions."
              <span className="block text-sm text-primary font-bold mt-2 not-italic">— Joel 2:28</span>
            </blockquote>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 lg:px-8 h-12 lg:h-14 text-sm lg:text-base font-bold shadow-xl shadow-orange-500/20 w-full sm:w-auto hover:-translate-y-1 transition-all"
                data-testid="button-start-mission"
                onClick={() => navigate(isAuthenticated ? '/missions' : '/mission/onboarding')}
              >
                <Globe2 className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                {isAuthenticated ? 'Continue Your Mission' : 'Start Your Mission'}
              </Button>
              <Button 
                variant="outline"
                size="lg" 
                className="border-2 border-gray-200 bg-white/80 hover:bg-white text-gray-900 rounded-full px-5 lg:px-6 h-12 lg:h-14 text-sm lg:text-base font-bold w-full sm:w-auto hover:-translate-y-1 transition-all"
                data-testid="button-pray-now"
                onClick={() => navigate('/pray')}
              >
                Pray Now
              </Button>
            </div>
            <div 
              className="flex items-center gap-3 cursor-pointer group justify-center lg:justify-start mt-2"
              onClick={() => setShowVisionModal(true)}
              data-testid="button-watch-video"
            >
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-white border border-gray-100 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform text-primary">
                <Play className="h-3 w-3 lg:h-4 lg:w-4 fill-current ml-0.5" />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-primary transition-colors text-sm">Watch Our Vision</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
