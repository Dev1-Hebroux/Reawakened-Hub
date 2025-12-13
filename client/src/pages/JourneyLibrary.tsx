import { motion } from "framer-motion";
import { 
  Compass, MapPin, Clock, Users, ArrowRight, 
  Loader2, BookOpen, Heart, Sparkles, Target
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import type { Journey } from "@shared/schema";

const categories = [
  { id: "all", label: "All Journeys", icon: Compass },
  { id: "faith-basics", label: "Faith Basics", icon: BookOpen },
  { id: "purpose", label: "Purpose", icon: Target },
  { id: "anxiety", label: "Peace & Anxiety", icon: Heart },
  { id: "relationships", label: "Relationships", icon: Users },
];

const levelLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const categoryColors: Record<string, string> = {
  "faith-basics": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "purpose": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "anxiety": "bg-green-500/20 text-green-400 border-green-500/30",
  "relationships": "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export function JourneyLibrary() {
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: journeys = [], isLoading } = useQuery<Journey[]>({
    queryKey: ["/api/journeys"],
  });

  const filteredJourneys = activeCategory === "all"
    ? journeys
    : journeys.filter(j => j.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] text-white overflow-x-hidden">
      <Navbar />
      
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Discipleship Paths</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4" data-testid="text-page-title">
              Your Spiritual Journey Starts Here
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Discover guided paths designed to help you grow in faith, find purpose, and deepen your walk with Jesus.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  data-testid={`button-category-${cat.id}`}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${
                    activeCategory === cat.id
                      ? "bg-white text-gray-900 border-white"
                      : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredJourneys.length === 0 ? (
            <div className="text-center py-20">
              <Compass className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Journeys Yet</h3>
              <p className="text-gray-500">New paths are being created. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJourneys.map((journey, i) => (
                <motion.div
                  key={journey.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  data-testid={`card-journey-${journey.id}`}
                >
                  <Link href={`/journeys/${journey.slug}`}>
                    <div className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer h-full">
                      {journey.heroImageUrl && (
                        <div className="aspect-video relative overflow-hidden">
                          <img 
                            src={journey.heroImageUrl} 
                            alt={journey.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-md border ${categoryColors[journey.category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                            {categories.find(c => c.id === journey.category)?.label || journey.category}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{levelLabels[journey.level] || journey.level}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                          {journey.title}
                        </h3>
                        
                        {journey.subtitle && (
                          <p className="text-sm text-gray-400 mb-3">{journey.subtitle}</p>
                        )}
                        
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                          {journey.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {journey.durationDays} days
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              ~10 min/day
                            </span>
                          </div>
                          <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            Start <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default JourneyLibrary;
