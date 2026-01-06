import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  X, ChevronLeft, ChevronRight, Globe2, Flame, 
  Users, MapPin, BookOpen, Target, Waves, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

import logoLight from "@assets/Reawakened_278_141_logo_white_1767192258915.png";

interface VisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const slides = [
  {
    id: 1,
    type: "intro",
    title: "The Movement",
    subtitle: "A Call to Vigilance, Revival & Spiritual Awakening",
    verse: "I will pour out my Spirit upon all of you! Your sons and daughters will prophesy; your old men will dream dreams, and your young men see visions.",
    reference: "Joel 2:28",
    bgGradient: "from-primary via-primary/90 to-orange-600",
  },
  {
    id: 2,
    type: "stats",
    title: "Our Vision in Numbers",
    stats: [
      { value: "5k+", label: "disciples by 2030", sublabel: "OUR VISION" },
      { value: "50+", label: "nations reached", sublabel: "OUR GOAL" },
      { value: "365", label: "sparks per year", sublabel: "DAILY" },
      { value: "12+", label: "mission projects", sublabel: "LAUNCHING" },
    ],
    bgGradient: "from-[#1a2744] via-[#243656] to-[#1a2744]",
  },
  {
    id: 3,
    type: "pillars",
    title: "Three Pillars of Our Movement",
    pillars: [
      { 
        title: "The Outpouring", 
        icon: Waves, 
        description: "Hearts incubated by the Holy Spirit",
        color: "from-blue-500 to-indigo-600"
      },
      { 
        title: "The Harvest", 
        icon: Target, 
        description: "Possessing our inheritance",
        color: "from-orange-500 to-red-500"
      },
      { 
        title: "Without Walls", 
        icon: Globe2, 
        description: "A movement that transcends boundaries",
        color: "from-emerald-500 to-teal-600"
      },
    ],
    bgGradient: "from-[#7C9A8E] via-[#6B8B7E] to-[#4A7C7C]",
  },
  {
    id: 4,
    type: "features",
    title: "What We Offer",
    features: [
      { icon: Flame, title: "Daily Sparks", description: "365 devotionals for your spiritual journey" },
      { icon: Users, title: "Community Hub", description: "Connect with believers worldwide" },
      { icon: MapPin, title: "Prayer Movement", description: "Adopt nations and campuses in prayer" },
      { icon: BookOpen, title: "Discipleship", description: "Growth tracks and coaching labs" },
    ],
    bgGradient: "from-[#D4A574] via-[#C49466] to-[#B58456]",
  },
  {
    id: 5,
    type: "cta",
    title: "Join The Movement",
    subtitle: "Be part of a transformative mission that transcends walls and boundaries",
    bgGradient: "from-primary via-orange-500 to-primary",
  },
];

export function VisionModal({ isOpen, onClose }: VisionModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentSlide]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const slide = slides[currentSlide];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl h-[85vh] md:h-auto md:aspect-video rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient}`}
              >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-white/10 rounded-full blur-3xl" />

                <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-white text-center overflow-y-auto">
                  <img src={logoLight} alt="Reawakened" className="h-6 sm:h-8 md:h-10 mb-4 md:mb-6 opacity-80 flex-shrink-0" />

                  {slide.type === "intro" && (
                    <>
                      <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl sm:text-3xl md:text-6xl font-display font-bold mb-2 sm:mb-4"
                      >
                        {slide.title}
                      </motion.h2>
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm sm:text-base md:text-xl text-white/80 mb-4 sm:mb-6 max-w-2xl px-2"
                      >
                        {slide.subtitle}
                      </motion.p>
                      <motion.blockquote
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm sm:text-base md:text-lg text-white/90 italic max-w-xl px-2"
                      >
                        "{slide.verse}"
                        <span className="block text-xs sm:text-sm text-orange-200 mt-2 not-italic font-bold">— {slide.reference}</span>
                      </motion.blockquote>
                    </>
                  )}

                  {slide.type === "stats" && (
                    <>
                      <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl sm:text-2xl md:text-5xl font-display font-bold mb-4 sm:mb-6 md:mb-8"
                      >
                        {slide.title}
                      </motion.h2>
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-12"
                      >
                        {slide.stats?.map((stat, i) => (
                          <motion.div 
                            key={i}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="text-center"
                          >
                            <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-xs sm:text-sm md:text-base text-white/80">{stat.label}</div>
                            <div className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wider mt-1">{stat.sublabel}</div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </>
                  )}

                  {slide.type === "pillars" && (
                    <>
                      <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl sm:text-2xl md:text-5xl font-display font-bold mb-4 sm:mb-6 md:mb-8"
                      >
                        {slide.title}
                      </motion.h2>
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 w-full max-w-3xl px-2"
                      >
                        {slide.pillars?.map((pillar, i) => (
                          <motion.div 
                            key={i}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className={`bg-gradient-to-br ${pillar.color} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-center shadow-lg`}
                          >
                            <pillar.icon className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 mx-auto mb-2 sm:mb-3 text-white" />
                            <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2">{pillar.title}</h3>
                            <p className="text-white/80 text-xs sm:text-sm">{pillar.description}</p>
                          </motion.div>
                        ))}
                      </motion.div>
                    </>
                  )}

                  {slide.type === "features" && (
                    <>
                      <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl sm:text-2xl md:text-5xl font-display font-bold mb-4 sm:mb-6 md:mb-8"
                      >
                        {slide.title}
                      </motion.h2>
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 max-w-2xl w-full px-2"
                      >
                        {slide.features?.map((feature, i) => (
                          <motion.div 
                            key={i}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-left border border-white/20"
                          >
                            <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mb-2 sm:mb-3 text-white" />
                            <h3 className="font-bold text-xs sm:text-sm md:text-lg mb-1">{feature.title}</h3>
                            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">{feature.description}</p>
                          </motion.div>
                        ))}
                      </motion.div>
                    </>
                  )}

                  {slide.type === "cta" && (
                    <>
                      <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl sm:text-3xl md:text-6xl font-display font-bold mb-2 sm:mb-4"
                      >
                        {slide.title}
                      </motion.h2>
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm sm:text-base md:text-xl text-white/80 mb-4 sm:mb-6 md:mb-8 max-w-xl px-2"
                      >
                        {slide.subtitle}
                      </motion.p>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-2 sm:gap-4 px-4"
                      >
                        <Button 
                          size="lg" 
                          className="bg-white text-primary hover:bg-gray-100 rounded-full px-4 sm:px-8 font-bold text-sm sm:text-base"
                          onClick={() => {
                            onClose();
                            window.location.href = "/mission/onboarding";
                          }}
                          data-testid="button-modal-join"
                        >
                          Start Your Mission <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="border-2 border-white text-white hover:bg-white/10 rounded-full px-4 sm:px-8 font-bold text-sm sm:text-base"
                          onClick={() => {
                            onClose();
                            window.location.href = "/about";
                          }}
                          data-testid="button-modal-learn-more"
                        >
                          Learn More
                        </Button>
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={onClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              data-testid="button-close-vision-modal"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </button>

            <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2 sm:gap-4">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`p-1.5 sm:p-2 rounded-full transition-all ${currentSlide === 0 ? 'opacity-30' : 'bg-white/10 hover:bg-white/20'}`}
                data-testid="button-prev-slide"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </button>

              <div className="flex gap-1.5 sm:gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDirection(i > currentSlide ? 1 : -1);
                      setCurrentSlide(i);
                    }}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-4 sm:w-6' : 'bg-white/40 hover:bg-white/60'}`}
                    data-testid={`button-slide-${i}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className={`p-1.5 sm:p-2 rounded-full transition-all ${currentSlide === slides.length - 1 ? 'opacity-30' : 'bg-white/10 hover:bg-white/20'}`}
                data-testid="button-next-slide"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
