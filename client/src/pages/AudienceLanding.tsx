import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  ArrowRight, Flame, BookOpen, Users, Calendar, 
  GraduationCap, Briefcase, Rocket, Heart, School
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
  description: string;
  icon: React.ReactNode;
  heroImage: string;
  color: string;
  benefits: string[];
  testimonialQuote?: string;
  testimonialAuthor?: string;
}

const audienceConfigs: Record<string, AudienceConfig> = {
  schools: {
    segment: "schools",
    title: "DOMINION for Students",
    subtitle: "30 Days to Discover Your True Identity",
    hook: "School life is intense. This is your daily reset.",
    description: "Join thousands of students across the UK discovering confidence, peace, and purpose through 30 days of bite-sized content designed just for you.",
    icon: <School className="h-8 w-8" />,
    heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200",
    color: "from-blue-600 to-cyan-500",
    benefits: [
      "2-minute daily sparks that fit between classes",
      "Real talk about exam stress, friendships & identity",
      "Connect with students nationwide",
      "Unlock badges and track your streak"
    ],
    testimonialQuote: "This changed how I see myself. I actually feel confident now.",
    testimonialAuthor: "Year 12 Student, Manchester"
  },
  universities: {
    segment: "universities",
    title: "DOMINION for University",
    subtitle: "Reclaim Your Focus This Semester",
    hook: "Lectures. Deadlines. Big questions. Find your anchor.",
    description: "A 30-day journey designed for university life — addressing the real challenges you face while building habits that last beyond graduation.",
    icon: <GraduationCap className="h-8 w-8" />,
    heroImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200",
    color: "from-purple-600 to-indigo-500",
    benefits: [
      "Content that speaks to uni life pressures",
      "Build mental resilience for exam season",
      "Join Christian Unions across campuses",
      "Optional faith content when you're ready"
    ],
    testimonialQuote: "Finally something that gets what uni is actually like.",
    testimonialAuthor: "2nd Year, Birmingham"
  },
  "early-career": {
    segment: "early-career",
    title: "The 9-5 Reset",
    subtitle: "Reclaim Your Mornings. Redefine Success.",
    hook: "Your career doesn't have to define you.",
    description: "30 days of intentional content for young professionals navigating the gap between expectations and reality in the working world.",
    icon: <Briefcase className="h-8 w-8" />,
    heroImage: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1200",
    color: "from-orange-500 to-amber-400",
    benefits: [
      "5-minute morning sparks before your commute",
      "Navigate workplace challenges with wisdom",
      "Balance ambition with inner peace",
      "Connect with a community who gets it"
    ],
    testimonialQuote: "This reset my entire approach to work-life balance.",
    testimonialAuthor: "Marketing Manager, London"
  },
  builders: {
    segment: "builders",
    title: "DOMINION for Builders",
    subtitle: "Create with Purpose. Build with Vision.",
    hook: "Your ideas matter. So does your foundation.",
    description: "For entrepreneurs, creatives, and changemakers who want to build something meaningful without burning out or losing themselves.",
    icon: <Rocket className="h-8 w-8" />,
    heroImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200",
    color: "from-emerald-500 to-teal-400",
    benefits: [
      "Fuel creativity without the hustle culture",
      "Build sustainable habits for the long game",
      "Connect with other kingdom entrepreneurs",
      "Weekly challenges to stretch your impact"
    ],
    testimonialQuote: "Helped me remember why I started building in the first place.",
    testimonialAuthor: "Startup Founder, Bristol"
  },
  couples: {
    segment: "couples",
    title: "DOMINION for Couples",
    subtitle: "Grow Together. Build Something Beautiful.",
    hook: "Your relationship deserves intentional investment.",
    description: "30 days of shared content designed for couples who want to build stronger foundations and navigate life's challenges together.",
    icon: <Heart className="h-8 w-8" />,
    heroImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200",
    color: "from-rose-500 to-pink-400",
    benefits: [
      "Daily prompts for meaningful conversations",
      "Navigate communication challenges together",
      "Build shared rhythms and habits",
      "Connect with other intentional couples"
    ],
    testimonialQuote: "We've never felt more connected. This is our new morning ritual.",
    testimonialAuthor: "Married 2 years, Edinburgh"
  }
};

interface Props {
  segment: string;
}

export function AudienceLanding({ segment }: Props) {
  const config = audienceConfigs[segment];
  
  const { data: featuredSparks = [] } = useQuery<Spark[]>({
    queryKey: ["/api/sparks/featured", segment],
    queryFn: () => fetch(`/api/sparks/featured?audience=${segment}`).then(r => r.json()),
  });

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
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={config.heroImage} 
            alt={config.title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-40`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-r ${config.color} flex items-center justify-center`}>
                {config.icon}
              </div>
              <span className="text-white/70 font-medium uppercase tracking-wider text-sm">
                19 Jan - 17 Feb 2026
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-4" data-testid="text-audience-title">
              {config.title}
            </h1>
            
            <p className="text-2xl md:text-3xl text-white/90 font-medium mb-6">
              {config.subtitle}
            </p>
            
            <p className="text-xl text-white/70 mb-4">
              {config.hook}
            </p>
            
            <p className="text-lg text-white/60 mb-8 max-w-xl">
              {config.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className={`bg-gradient-to-r ${config.color} hover:opacity-90 text-white font-bold px-8 py-6 text-lg rounded-full`}
                data-testid="button-get-started"
              >
                Join the Movement <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/sparks">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full"
                  data-testid="button-preview"
                >
                  Preview Content
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              What You'll Get
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              30 days of curated content designed specifically for your season of life
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                data-testid={`card-benefit-${i}`}
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${config.color} flex items-center justify-center mb-4`}>
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <p className="text-white font-medium">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sparks Preview */}
      {featuredSparks.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Preview the Journey
              </h2>
              <p className="text-white/60 text-lg">
                Sample content from the 30-day DOMINION campaign
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredSparks.slice(0, 3).map((spark, i) => (
                <motion.div
                  key={spark.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden group"
                  data-testid={`card-preview-spark-${spark.id}`}
                >
                  <div className="aspect-video bg-gray-800 relative">
                    {spark.thumbnailUrl && (
                      <img src={spark.thumbnailUrl} alt={spark.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`bg-gradient-to-r ${config.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                        Day {i + 1}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2">{spark.title}</h3>
                    <p className="text-white/60 text-sm line-clamp-2">{spark.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial */}
      {config.testimonialQuote && (
        <section className="py-20 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className={`h-16 w-16 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center mx-auto mb-8`}>
                <Users className="h-8 w-8 text-white" />
              </div>
              <blockquote className="text-2xl md:text-3xl font-display italic text-white/90 mb-6">
                "{config.testimonialQuote}"
              </blockquote>
              <p className="text-white/60">— {config.testimonialAuthor}</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
              Join the DOMINION campaign launching January 19th. Sign up now to receive daily sparks tailored just for you.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className={`bg-gradient-to-r ${config.color} hover:opacity-90 text-white font-bold px-10 py-6 text-lg rounded-full`}
              data-testid="button-cta-signup"
            >
              Sign Up Now — It's Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-xl">Reawakened</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <Link href="/sparks" className="hover:text-white transition-colors">All Sparks</Link>
              <Link href="/community" className="hover:text-white transition-colors">Community</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
            </div>
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
