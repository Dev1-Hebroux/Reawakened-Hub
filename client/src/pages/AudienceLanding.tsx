import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { 
  ArrowRight, Flame, BookOpen, Users, Calendar, 
  GraduationCap, Briefcase, Rocket, Heart, School,
  Sparkles, Zap, Trophy, Target, Star, Clock,
  ChevronLeft, ChevronRight, Play, MessageCircle
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Spark } from "@shared/schema";

interface AudienceConfig {
  segment: string;
  title: string;
  subtitle: string;
  hook: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  heroEmoji: string;
  gradient: string;
  accentColor: string;
  bgPattern: string;
  benefits: { icon: React.ReactNode; title: string; desc: string }[];
  testimonials: { quote: string; author: string; emoji: string }[];
  badges: { name: string; emoji: string }[];
  vibe: "energetic" | "chill" | "bold" | "warm" | "inspiring";
}

const audienceConfigs: Record<string, AudienceConfig> = {
  schools: {
    segment: "schools",
    title: "DOMINION",
    subtitle: "Your Daily Reset 🔥",
    hook: "School is intense. This is your anchor.",
    tagline: "30 Days • Your Identity • Your Power",
    description: "Join thousands of students discovering who they really are. Quick daily content that hits different.",
    icon: <School className="h-6 w-6" />,
    heroEmoji: "🎒",
    gradient: "from-blue-500 via-cyan-400 to-teal-400",
    accentColor: "cyan",
    bgPattern: "radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
    benefits: [
      { icon: <Zap className="h-5 w-5" />, title: "2-Min Daily Sparks", desc: "Fits between classes" },
      { icon: <MessageCircle className="h-5 w-5" />, title: "Real Talk", desc: "Stress, friends, identity" },
      { icon: <Users className="h-5 w-5" />, title: "Squad Goals", desc: "Connect nationwide" },
      { icon: <Trophy className="h-5 w-5" />, title: "Level Up", desc: "Badges & streaks" }
    ],
    testimonials: [
      { quote: "This literally changed how I see myself fr fr", author: "Year 12, Manchester", emoji: "🔥" },
      { quote: "Finally something that actually gets it", author: "Year 11, London", emoji: "💯" },
      { quote: "My morning routine now, no cap", author: "Year 13, Birmingham", emoji: "⚡" }
    ],
    badges: [
      { name: "Early Bird", emoji: "🌅" },
      { name: "7-Day Streak", emoji: "🔥" },
      { name: "Squad Leader", emoji: "👑" }
    ],
    vibe: "energetic"
  },
  universities: {
    segment: "universities",
    title: "DOMINION",
    subtitle: "Reclaim Your Focus ✨",
    hook: "Lectures. Deadlines. Big questions. Find your anchor.",
    tagline: "30 Days • Mental Clarity • Real Purpose",
    description: "Built for uni life — the pressure, the questions, the journey. Content that actually helps.",
    icon: <GraduationCap className="h-6 w-6" />,
    heroEmoji: "📚",
    gradient: "from-violet-500 via-purple-500 to-indigo-500",
    accentColor: "purple",
    bgPattern: "radial-gradient(circle at 30% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)",
    benefits: [
      { icon: <Target className="h-5 w-5" />, title: "Uni-Focused", desc: "Content that gets it" },
      { icon: <Sparkles className="h-5 w-5" />, title: "Mental Resilience", desc: "For exam season" },
      { icon: <Users className="h-5 w-5" />, title: "CU Network", desc: "Across campuses" },
      { icon: <BookOpen className="h-5 w-5" />, title: "Your Pace", desc: "Faith optional" }
    ],
    testimonials: [
      { quote: "Actually helped my anxiety during finals", author: "2nd Year, Birmingham", emoji: "🙏" },
      { quote: "The only app that understands uni pressure", author: "3rd Year, Leeds", emoji: "💜" },
      { quote: "Found my people through this", author: "Fresher, Edinburgh", emoji: "🎓" }
    ],
    badges: [
      { name: "Deep Thinker", emoji: "🧠" },
      { name: "Consistent", emoji: "📈" },
      { name: "Connector", emoji: "🤝" }
    ],
    vibe: "inspiring"
  },
  "early-career": {
    segment: "early-career",
    title: "THE 9-5 RESET",
    subtitle: "Reclaim Your Mornings ☕",
    hook: "Your job doesn't define you. Your purpose does.",
    tagline: "30 Days • Work-Life • Real Success",
    description: "For young professionals navigating the gap between expectations and reality.",
    icon: <Briefcase className="h-6 w-6" />,
    heroEmoji: "💼",
    gradient: "from-amber-400 via-orange-500 to-red-500",
    accentColor: "orange",
    bgPattern: "radial-gradient(circle at 25% 75%, rgba(251, 146, 60, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)",
    benefits: [
      { icon: <Clock className="h-5 w-5" />, title: "5-Min Mornings", desc: "Before the commute" },
      { icon: <Target className="h-5 w-5" />, title: "Work Wisdom", desc: "Navigate challenges" },
      { icon: <Sparkles className="h-5 w-5" />, title: "Inner Peace", desc: "Beyond ambition" },
      { icon: <Users className="h-5 w-5" />, title: "Community", desc: "People who get it" }
    ],
    testimonials: [
      { quote: "Changed my entire approach to work-life", author: "Marketing, London", emoji: "🚀" },
      { quote: "The reset I didn't know I needed", author: "Finance, Manchester", emoji: "☀️" },
      { quote: "Finally found balance", author: "Tech, Bristol", emoji: "⚖️" }
    ],
    badges: [
      { name: "Morning Person", emoji: "🌅" },
      { name: "Balance Master", emoji: "⚖️" },
      { name: "Mindful Pro", emoji: "🧘" }
    ],
    vibe: "bold"
  },
  builders: {
    segment: "builders",
    title: "DOMINION",
    subtitle: "Build with Purpose 🚀",
    hook: "Your ideas matter. So does your foundation.",
    tagline: "30 Days • Vision • Sustainable Impact",
    description: "For entrepreneurs and creatives building something meaningful without the burnout.",
    icon: <Rocket className="h-6 w-6" />,
    heroEmoji: "⚡",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    accentColor: "emerald",
    bgPattern: "radial-gradient(circle at 20% 80%, rgba(20, 184, 166, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)",
    benefits: [
      { icon: <Sparkles className="h-5 w-5" />, title: "Fuel Creativity", desc: "Without hustle culture" },
      { icon: <Target className="h-5 w-5" />, title: "Sustainable", desc: "Built for the long game" },
      { icon: <Users className="h-5 w-5" />, title: "Network", desc: "Kingdom entrepreneurs" },
      { icon: <Zap className="h-5 w-5" />, title: "Challenges", desc: "Stretch your impact" }
    ],
    testimonials: [
      { quote: "Reminded me why I started building", author: "Founder, Bristol", emoji: "💡" },
      { quote: "The grounding every builder needs", author: "Creative, London", emoji: "🎨" },
      { quote: "Purpose meets productivity", author: "Startup, Leeds", emoji: "🚀" }
    ],
    badges: [
      { name: "Visionary", emoji: "👁️" },
      { name: "Builder", emoji: "🛠️" },
      { name: "Innovator", emoji: "💡" }
    ],
    vibe: "bold"
  },
  couples: {
    segment: "couples",
    title: "DOMINION",
    subtitle: "Grow Together 💕",
    hook: "Your relationship deserves intentional investment.",
    tagline: "30 Days • Connection • Shared Purpose",
    description: "For couples who want to build stronger foundations and navigate life together.",
    icon: <Heart className="h-6 w-6" />,
    heroEmoji: "💑",
    gradient: "from-rose-400 via-pink-500 to-fuchsia-500",
    accentColor: "pink",
    bgPattern: "radial-gradient(circle at 30% 70%, rgba(244, 114, 182, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
    benefits: [
      { icon: <MessageCircle className="h-5 w-5" />, title: "Daily Prompts", desc: "Meaningful convos" },
      { icon: <Heart className="h-5 w-5" />, title: "Communication", desc: "Navigate together" },
      { icon: <Sparkles className="h-5 w-5" />, title: "Shared Rhythms", desc: "Build habits" },
      { icon: <Users className="h-5 w-5" />, title: "Community", desc: "Intentional couples" }
    ],
    testimonials: [
      { quote: "Never felt more connected", author: "Married 2 yrs, Edinburgh", emoji: "💕" },
      { quote: "Our new morning ritual together", author: "Engaged, London", emoji: "☕" },
      { quote: "Deep convos every single day", author: "Dating 3 yrs, Bristol", emoji: "💬" }
    ],
    badges: [
      { name: "Connected", emoji: "💕" },
      { name: "Intentional", emoji: "🎯" },
      { name: "Growing", emoji: "🌱" }
    ],
    vibe: "warm"
  }
};

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / (1000 * 60)) % 60),
          secs: Math.floor((diff / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-3">
      {[
        { value: timeLeft.days, label: "D" },
        { value: timeLeft.hours, label: "H" },
        { value: timeLeft.mins, label: "M" },
        { value: timeLeft.secs, label: "S" }
      ].map((item, i) => (
        <motion.div 
          key={i}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 min-w-[50px] text-center"
        >
          <span className="text-2xl font-bold font-display">{String(item.value).padStart(2, '0')}</span>
          <span className="text-xs text-white/60 ml-1">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setCount(0);
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [target]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
}

function FloatingParticles({ accentColor }: { accentColor: string }) {
  const colorMap: Record<string, string> = {
    cyan: "rgba(6, 182, 212, 0.4)",
    purple: "rgba(139, 92, 246, 0.4)",
    orange: "rgba(251, 146, 60, 0.4)",
    emerald: "rgba(16, 185, 129, 0.4)",
    pink: "rgba(236, 72, 153, 0.4)"
  };
  const particleColor = colorMap[accentColor] || "rgba(255, 255, 255, 0.3)";
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: particleColor }}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: "100%",
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: "-10%",
            x: `${Math.random() * 100}%`
          }}
          transition={{ 
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
}

function SparkCarousel({ sparks, config }: { sparks: Spark[]; config: AudienceConfig }) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const next = () => setCurrent((c) => (c + 1) % sparks.length);
  const prev = () => setCurrent((c) => (c - 1 + sparks.length) % sparks.length);

  if (sparks.length === 0) return null;

  return (
    <div className="relative">
      <div className="flex items-center justify-center gap-4 mb-6">
        <button 
          onClick={prev}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-white/60 text-sm">
          {current + 1} / {sparks.length}
        </span>
        <button 
          onClick={next}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div ref={containerRef} className="overflow-hidden rounded-3xl">
        <motion.div 
          className="flex"
          animate={{ x: `-${current * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {sparks.map((spark, i) => (
            <div 
              key={spark.id} 
              className="w-full flex-shrink-0 px-4"
            >
              <Link href="/sparks">
                <motion.div
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  data-testid={`card-spark-carousel-${spark.id}`}
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-30`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div 
                        className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="h-8 w-8 text-white ml-1" />
                      </motion.div>
                    </div>
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className={`bg-gradient-to-r ${config.gradient} text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg`}>
                        Day {i + 1}
                      </span>
                      <span className="bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full">
                        {spark.duration ? `${Math.floor(spark.duration / 60)} min` : '2 min'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 font-display">{spark.title}</h3>
                    <p className="text-white/60 text-sm line-clamp-2">{spark.description}</p>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                      <span className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent text-sm font-medium`}>
                        View Full Spark →
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {sparks.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current 
                ? `bg-gradient-to-r ${config.gradient} w-6` 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function TestimonialTicker({ testimonials, config }: { testimonials: AudienceConfig['testimonials']; config: AudienceConfig }) {
  return (
    <div className="overflow-hidden py-4">
      <motion.div
        className="flex gap-6"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
          <div 
            key={i}
            className="flex-shrink-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 min-w-[300px]"
          >
            <p className="text-white/80 text-sm mb-2">"{t.quote}"</p>
            <p className="text-white/50 text-xs flex items-center gap-2">
              <span>{t.emoji}</span> {t.author}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

interface Props {
  segment: string;
}

export function AudienceLanding({ segment }: Props) {
  const config = audienceConfigs[segment];
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  
  const { data: featuredSparks = [] } = useQuery<Spark[]>({
    queryKey: ["/api/sparks/featured", segment],
    queryFn: () => fetch(`/api/sparks/featured?audience=${segment}`).then(r => r.json()),
  });

  const campaignStart = new Date('2026-01-19T05:00:00Z');
  const signupGoal = 5000;

  if (!config) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Audience not found</p>
      </div>
    );
  }

  const handleGetStarted = () => {
    localStorage.setItem('user_audience_segment', segment);
    window.location.href = '/api/login';
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0" style={{ background: config.bgPattern }} />
        <FloatingParticles accentColor={config.accentColor} />
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
        
        <motion.div 
          style={{ y: heroY }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6"
              >
                <span className="text-2xl">{config.heroEmoji}</span>
                <span className="text-sm font-medium text-white/80">DOMINION 2026</span>
                <span className={`bg-gradient-to-r ${config.gradient} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                  NEW
                </span>
              </motion.div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black mb-2" data-testid="text-audience-title">
                <span className={`bg-gradient-to-r ${config.gradient} text-transparent bg-clip-text`}>
                  {config.title}
                </span>
              </h1>
              
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                {config.subtitle}
              </p>
              
              <p className="text-lg md:text-xl text-white/70 mb-2">
                {config.hook}
              </p>
              
              <p className="text-base text-white/50 mb-6 max-w-lg">
                {config.description}
              </p>
              
              <div className="mb-8">
                <p className="text-sm text-white/50 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Launching 19 Jan 2026
                </p>
                <CountdownTimer targetDate={campaignStart} />
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleGetStarted}
                    size="lg"
                    className={`bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white font-bold px-8 py-6 text-lg rounded-full shadow-xl relative overflow-hidden group`}
                    style={{ boxShadow: `0 20px 25px -5px ${config.accentColor === 'cyan' ? 'rgba(6,182,212,0.3)' : config.accentColor === 'purple' ? 'rgba(139,92,246,0.3)' : config.accentColor === 'orange' ? 'rgba(251,146,60,0.3)' : config.accentColor === 'emerald' ? 'rgba(16,185,129,0.3)' : 'rgba(236,72,153,0.3)'}` }}
                    data-testid="button-get-started"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Join the Movement <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <motion.div 
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </Button>
                </motion.div>
                
                <Link href="/sparks">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 px-6 py-6 rounded-full"
                    data-testid="button-preview"
                  >
                    <Play className="h-4 w-4 mr-2" /> Preview
                  </Button>
                </Link>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    Be among the first {signupGoal.toLocaleString()}
                  </p>
                  <p className="text-white/50 text-sm">Launching 19 Jan 2026</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className={`relative aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-br ${config.gradient} p-1`}>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                <div className="relative h-full rounded-3xl bg-black/80 backdrop-blur-xl p-8 flex flex-col justify-center items-center text-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="text-8xl mb-6"
                  >
                    {config.heroEmoji}
                  </motion.div>
                  <p className="text-white/60 text-sm uppercase tracking-wider mb-2">{config.tagline}</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {config.badges.map((badge, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + i * 0.2 }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-sm flex items-center gap-1"
                      >
                        <span>{badge.emoji}</span> {badge.name}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className={`w-1.5 h-3 rounded-full bg-gradient-to-b ${config.gradient}`} />
          </div>
        </motion.div>
      </section>

      {/* Social Proof Ticker */}
      <section className="py-8 border-y border-white/10 bg-white/5">
        <TestimonialTicker testimonials={config.testimonials} config={config} />
      </section>

      {/* Benefits Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${config.gradient} text-white text-sm font-bold px-4 py-2 rounded-full mb-6`}>
              <Sparkles className="h-4 w-4" /> What You'll Get
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              30 Days That Hit Different
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Content built for your life, your pace, your journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all cursor-pointer"
                data-testid={`card-benefit-${i}`}
              >
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-white/60">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Preview */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: config.bgPattern }} />
        <div className="absolute inset-0 bg-black/80" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${config.gradient} text-white text-sm font-bold px-4 py-2 rounded-full mb-6`}>
                <Trophy className="h-4 w-4" /> Level Up
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Earn Badges.<br />Build Your Streak. 🔥
              </h2>
              <p className="text-white/60 text-lg mb-8">
                Stay consistent and unlock achievements. Track your progress and celebrate every milestone.
              </p>
              
              <div className="space-y-4">
                {[
                  { label: "Complete Day 1", value: 90 },
                  { label: "7-Day Streak", value: 60 },
                  { label: "Share with friend", value: 40 }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/70">{item.label}</span>
                      <span className="text-white/50">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className={`h-full bg-gradient-to-r ${config.gradient} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { emoji: "🔥", name: "First Spark", desc: "Complete Day 1" },
                { emoji: "⚡", name: "On Fire", desc: "7-Day Streak" },
                { emoji: "👑", name: "Champion", desc: "Complete 30 Days" },
                { emoji: "🌟", name: "Early Bird", desc: "Before 7am" },
                { emoji: "💎", name: "Consistent", desc: "14-Day Streak" },
                { emoji: "🚀", name: "Launcher", desc: "Share 5 times" }
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`aspect-square bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer ${i > 2 ? 'opacity-50 grayscale' : ''}`}
                >
                  <span className="text-3xl mb-2">{badge.emoji}</span>
                  <p className="text-xs text-white font-medium text-center">{badge.name}</p>
                  <p className="text-xs text-white/50 text-center">{badge.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Sparks Carousel */}
      {featuredSparks.length > 0 && (
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${config.gradient} text-white text-sm font-bold px-4 py-2 rounded-full mb-6`}>
                <Play className="h-4 w-4" /> Sneak Peek
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Preview the Journey
              </h2>
              <p className="text-white/60 text-lg">
                Sample what's coming in the 30-day DOMINION campaign
              </p>
            </motion.div>

            <SparkCarousel sparks={featuredSparks.slice(0, 5)} config={config} />
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-10`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-8"
            >
              {config.heroEmoji}
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-display font-black mb-6">
              Ready to Start?
            </h2>
            <p className="text-white/60 text-xl mb-4">
              Be among the first {signupGoal.toLocaleString()} to join January 19th
            </p>
            <p className="text-white/40 mb-10">
              30 days. Your transformation. Completely free.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleGetStarted}
                size="lg"
                className={`bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white font-bold px-12 py-8 text-xl rounded-full shadow-2xl relative overflow-hidden group`}
                data-testid="button-cta-signup"
              >
                <span className="relative z-10 flex items-center gap-3">
                  I'm In — Let's Go! <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </span>
                <motion.div 
                  className="absolute inset-0 bg-white/20"
                  animate={{ 
                    x: ["-100%", "100%"]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                />
              </Button>
            </motion.div>
            
            <p className="text-white/40 text-sm mt-6">
              Free • No credit card • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                <Flame className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl">Reawakened</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <Link href="/sparks" className="hover:text-white transition-colors">All Sparks</Link>
              <Link href="/community" className="hover:text-white transition-colors">Community</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
            </div>
            <p className="text-white/40 text-sm">
              © 2026 Reawakened. Made with ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function SchoolsLanding() {
  return <AudienceLanding segment="schools" />;
}

export function UniversitiesLanding() {
  return <AudienceLanding segment="universities" />;
}

export function EarlyCareerLanding() {
  return <AudienceLanding segment="early-career" />;
}

export function BuildersLanding() {
  return <AudienceLanding segment="builders" />;
}

export function CouplesLanding() {
  return <AudienceLanding segment="couples" />;
}
