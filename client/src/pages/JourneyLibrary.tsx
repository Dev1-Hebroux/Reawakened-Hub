import { motion } from "framer-motion";
import { 
  Compass, MapPin, Clock, Users, ArrowRight, 
  Loader2, BookOpen, Heart, Sparkles, Target, Calendar, Play
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import type { Journey, AlphaCohort } from "@shared/schema";

interface AlphaCohortWithCounts extends AlphaCohort {
  participantCount: number;
  weekCount: number;
}

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
  "faith-basics": "bg-[#4A7C7C]/20 text-[#4A7C7C] border-[#4A7C7C]/30",
  "purpose": "bg-[#5A7A8E]/20 text-[#5A7A8E] border-[#5A7A8E]/30",
  "anxiety": "bg-[#7C9A8E]/20 text-[#7C9A8E] border-[#7C9A8E]/30",
  "relationships": "bg-[#D4A574]/20 text-[#D4A574] border-[#D4A574]/30",
};

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const statusLabels: Record<string, string> = {
  upcoming: "Coming Soon",
  active: "In Progress",
  completed: "Completed",
};

export function JourneyLibrary() {
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: journeys = [], isLoading } = useQuery<Journey[]>({
    queryKey: ["/api/journeys"],
  });

  const { data: alphaCohorts = [], isLoading: isLoadingCohorts } = useQuery<AlphaCohortWithCounts[]>({
    queryKey: ["/api/alpha-cohorts"],
  });

  const filteredJourneys = activeCategory === "all"
    ? journeys
    : journeys.filter(j => j.category === activeCategory);

  const upcomingCohorts = alphaCohorts.filter(c => c.status === "upcoming" || c.status === "active");

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

      {/* Alpha Cohorts Section */}
      {upcomingCohorts.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Play className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">Alpha Cohorts</h2>
                  <p className="text-sm text-gray-400">Join a group journey through the Alpha Film Series</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingCohorts ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                upcomingCohorts.map((cohort, i) => (
                  <motion.div
                    key={cohort.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    data-testid={`card-alpha-cohort-${cohort.id}`}
                  >
                    <Link href={`/alpha/${cohort.id}`}>
                      <div className="group relative bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/20 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all cursor-pointer h-full">
                        {cohort.heroImageUrl && (
                          <div className="aspect-video relative overflow-hidden">
                            <img 
                              src={cohort.heroImageUrl} 
                              alt={cohort.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
                          </div>
                        )}
                        
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold px-2 py-1 rounded-md bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-400 border border-orange-500/30">
                              Alpha Course
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-md border ${statusColors[cohort.status] || statusColors.upcoming}`}>
                              {statusLabels[cohort.status] || cohort.status}
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                            {cohort.title}
                          </h3>
                          
                          {cohort.description && (
                            <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                              {cohort.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(cohort.startDate), "MMM d, yyyy")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {cohort.participantCount}/{cohort.capacity || 50}
                              </span>
                            </div>
                            <span className="text-orange-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                              Join <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Self-Paced Journeys Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {upcomingCohorts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Compass className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">Self-Paced Journeys</h2>
                  <p className="text-sm text-gray-400">Go at your own pace with guided devotional paths</p>
                </div>
              </div>
            </motion.div>
          )}

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
