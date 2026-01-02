import { motion } from "framer-motion";
import { CheckCircle2, Lock, Play, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import pathBg from "@assets/generated_images/woman_looking_at_a_city_skyline_at_sunset.png";

type UserJourneyWithDetails = {
  id: number;
  userId: string;
  journeyId: number;
  status: string;
  currentDay: number | null;
  startedAt: string | null;
  completedAt: string | null;
  lastActivityAt: string | null;
  journey: {
    id: number;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string;
    category: string;
    durationDays: number;
    level: string;
    heroImageUrl: string | null;
    isPublished: string;
  } | null;
  completedDaysCount: number;
};

export function DiscipleshipPaths() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const { data: userJourneys, isLoading: journeysLoading } = useQuery<UserJourneyWithDetails[]>({
    queryKey: ["/api/me/journeys"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: allJourneys } = useQuery<{ id: number; slug: string; title: string; durationDays: number; category: string; heroImageUrl: string | null }[]>({
    queryKey: ["/api/journeys"],
  });

  const activeJourney = userJourneys?.find(uj => uj.status === "active");
  const featuredJourney = allJourneys?.[0];

  const isLoading = authLoading || journeysLoading;

  const generateSteps = (currentDay: number, totalDays: number) => {
    const steps = [];
    const stepsToShow = Math.min(4, totalDays);
    for (let i = 1; i <= stepsToShow; i++) {
      const status = i < currentDay ? "completed" : i === currentDay ? "current" : "locked";
      steps.push({ day: i, status });
    }
    return steps;
  };

  return (
    <section id="paths" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-sm">Growth Paths</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mt-2">
            Structured Journeys for <br /> <span className="text-primary">Real Transformation</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Card 1: Active Journey or Start New */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-[#FFF8F3] rounded-[40px] p-8 md:p-10 border border-orange-100 hover:shadow-xl transition-shadow relative overflow-hidden group"
            data-testid="card-discipleship-active"
          >
            <div className="relative z-10">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : activeJourney && activeJourney.journey ? (
                <>
                  <div className="bg-white px-4 py-1 rounded-full text-xs font-bold text-green-600 inline-block mb-6 shadow-sm border border-green-100">
                    In Progress
                  </div>
                  <h3 className="text-3xl font-display font-bold text-gray-900 mb-4" data-testid="text-active-journey-title">
                    {activeJourney.journey.title}
                  </h3>
                  <p className="text-gray-500 mb-4 max-w-sm">
                    Day {activeJourney.currentDay} of {activeJourney.journey.durationDays}
                  </p>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>Progress</span>
                      <span>{activeJourney.completedDaysCount} / {activeJourney.journey.durationDays} days</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all" 
                        style={{ width: `${(activeJourney.completedDaysCount / activeJourney.journey.durationDays) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {generateSteps(activeJourney.currentDay || 1, activeJourney.journey.durationDays).map((step, i) => (
                      <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-50">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.status === 'completed' ? 'bg-green-100 text-green-600' : step.status === 'current' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {step.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : step.status === 'current' ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </div>
                        <span className={`font-medium text-sm ${step.status === 'locked' ? 'text-gray-400' : 'text-gray-700'}`}>
                          Day {step.day}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link href={`/journey/${activeJourney.id}/day/${activeJourney.currentDay || 1}`}>
                    <button 
                      className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                      data-testid="button-resume-journey"
                    >
                      <Play className="h-5 w-5" /> Resume Day {activeJourney.currentDay}
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="bg-white px-4 py-1 rounded-full text-xs font-bold text-primary inline-block mb-6 shadow-sm border border-orange-50">
                    Most Popular
                  </div>
                  <h3 className="text-3xl font-display font-bold text-gray-900 mb-4">
                    {featuredJourney?.title || "Find Your Way Back"}
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-sm">
                    A guided week of prayer, scripture, and reflection to realign your heart with God's purpose.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    {[
                      { day: 1, title: "The Awakening", status: "ready" },
                      { day: 2, title: "Breaking Chains", status: "locked" },
                      { day: 3, title: "Identity Reset", status: "locked" },
                      { day: 4, title: "Hearing God", status: "locked" },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-50">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.status === 'ready' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {step.status === 'ready' ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className={`font-bold text-sm ${step.status === 'locked' ? 'text-gray-400' : 'text-gray-900'}`}>{step.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link href={featuredJourney ? `/journeys/${featuredJourney.slug}` : "/journeys"}>
                    <button 
                      className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-colors"
                      data-testid="button-start-journey"
                    >
                      Start Your Journey
                    </button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          {/* Card 2: Visual Promo - Browse All Journeys */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-[40px] overflow-hidden relative min-h-[500px] group"
            data-testid="card-discipleship-browse"
          >
            <img 
              src={pathBg} 
              alt="Woman looking at city" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-10 left-10 right-10 text-white z-10">
              <h3 className="text-3xl font-display font-bold mb-4">Explore All Journeys</h3>
              <p className="text-white/80 mb-8">Discover guided paths for faith basics, finding purpose, overcoming anxiety, and building relationships.</p>
              <Link href="/journeys">
                <button 
                  className="bg-white text-gray-900 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors w-full sm:w-auto flex items-center justify-center sm:inline-flex gap-2"
                  data-testid="button-browse-journeys"
                >
                  Browse Journey Library <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
