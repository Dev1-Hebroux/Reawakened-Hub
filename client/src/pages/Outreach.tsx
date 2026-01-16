import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin, Loader2, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { toast } from "sonner";
import type { Event, EventRegistration } from "@shared/schema";

import heroBg from "@assets/generated_images/global_mission_map_concept.png";
import outreachImg from "@assets/generated_images/youth_outreach_event.png";
import hubImg from "@assets/generated_images/modern_tech_innovation_hub.png";
import trainingImg from "@assets/generated_images/mentorship_and_training_workshop.png";

const defaultEventImages = [outreachImg, hubImg, trainingImg];

function getDefaultEventImage(index: number) {
  return defaultEventImages[index % defaultEventImages.length];
}

function formatEventDate(date: Date | string | null) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const stats = [
  { value: "5k+", subtitle: "disciples by 2030", label: "Our Vision" },
  { value: "50+", subtitle: "nations reached", label: "Our Goal" },
  { value: "365", subtitle: "sparks per year", label: "Daily" },
  { value: "12+", subtitle: "mission projects", label: "Launching" },
];

const missionStories = [
  {
    id: 1,
    name: "Sarah M.",
    location: "UK",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    story: "Through the outreach to my Uni, I found Jesus and now looking forward to getting discipled!",
    tag: "Transformed Life"
  },
  {
    id: 2,
    name: "David K.",
    location: "Nigeria",
    image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=200",
    story: "The discipleship program changed everything. I went from struggling with purpose to starting my community.",
    tag: "Youth Leader"
  },
  {
    id: 3,
    name: "Grace O.",
    location: "Manchester",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    story: "I was trained in the Innovation Hub and now gainfully employed and started a side hustle. Kingdom impact through business!",
    tag: "Entrepreneur"
  },
  {
    id: 4,
    name: "James",
    location: "UK",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    story: "After attending Alpha, I rededicated my life to Christ. Now I'm serving as a volunteer leader helping others find their faith.",
    tag: "Alpha Participant"
  }
];

const eventTypes = ["All", "outreach", "prayer-night", "tech-hub", "discipleship"];
const eventTypeLabels: Record<string, string> = {
  "All": "All Events",
  "outreach": "Outreach",
  "prayer-night": "Prayer Night",
  "tech-hub": "Tech Hub",
  "discipleship": "Discipleship"
};

export function OutreachPage() {
  const [activeEventType, setActiveEventType] = useState("All");
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (window.location.hash === "#events") {
      const scrollToEvents = () => {
        const eventsSection = document.getElementById("events");
        if (eventsSection) {
          eventsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };
      scrollToEvents();
      setTimeout(scrollToEvents, 300);
      setTimeout(scrollToEvents, 600);
    }
  }, []);

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: myRegistrations = [] } = useQuery<EventRegistration[]>({
    queryKey: ["/api/my-registrations", events.map(e => e.id).join(",")],
    queryFn: async () => {
      if (!user) return [];
      const registrationPromises = events.map(async (event) => {
        try {
          const res = await fetch(`/api/events/${event.id}/my-registration`, {
            credentials: "include",
          });
          if (res.status === 401) return null;
          if (res.ok) return await res.json();
          return null;
        } catch {
          return null;
        }
      });
      const results = await Promise.all(registrationPromises);
      return results.filter(Boolean) as EventRegistration[];
    },
    enabled: !!user && events.length > 0,
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return await apiRequest<any>("POST", "/api/event-registrations", { eventId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-registrations"] });
      toast.success("Successfully registered for the event!");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in to register");
        setTimeout(() => window.location.href = "/api/login", 1000);
      } else {
        toast.error("Failed to register for event");
      }
    },
  });

  const isRegisteredForEvent = (eventId: number) => {
    return myRegistrations.some(reg => reg.eventId === eventId);
  };

  const handleRegister = (eventId: number) => {
    if (!isAuthenticated) {
      toast.error("Please log in to register");
      setTimeout(() => window.location.href = "/api/login", 1000);
      return;
    }
    registerMutation.mutate(eventId);
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime()
  );
  
  const filteredEvents = activeEventType === "All" 
    ? sortedEvents 
    : sortedEvents.filter(event => event.type === activeEventType);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />
      
      <section className="relative pt-20 md:pt-24 min-h-[85vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Mission Global" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-white" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wider uppercase mb-6">
              Possessing Our Inheritance
            </span>
            <h1 className="text-5xl md:text-8xl font-display font-bold text-white mb-6 tracking-tight leading-none" data-testid="text-outreach-title">
              Raising a Standard.<br />
              <span className="text-orange-400">
                Building Without Walls.
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              We are a movement committed to spiritual awakening, societal transformation, and empowering the next generation through faith, technology, and excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-full text-lg font-bold" 
                onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-join-movement"
              >
                Join the Movement
              </Button>
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg font-bold backdrop-blur-sm" 
                onClick={() => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-explore-programs"
              >
                Explore Programs
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100 relative z-20 -mt-8 max-w-6xl mx-auto rounded-2xl shadow-xl p-6 md:p-8 mx-4 md:mx-auto">
        <div className="grid grid-cols-4 gap-2 md:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="text-xl md:text-3xl font-display font-bold text-gray-900">{stat.value}</div>
              <div className="text-[9px] md:text-xs text-gray-600 leading-tight">{stat.subtitle}</div>
              <div className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="events" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-primary font-bold tracking-wider uppercase text-sm">Get Involved</span>
            <h2 className="text-4xl font-display font-bold text-gray-900 mt-2 mb-4">Upcoming Events</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join us at our next gathering. Whether it's outreach, prayer, or training—there's a place for you.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveEventType(type)}
                data-testid={`button-event-filter-${type}`}
                className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  activeEventType === type 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {eventTypeLabels[type]}
              </button>
            ))}
          </div>

          {eventsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No upcoming events. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, i) => {
                const isRegistered = isRegisteredForEvent(event.id);
                const isPendingThis = registerMutation.isPending && registerMutation.variables === event.id;
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                    data-testid={`card-event-${event.id}`}
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={event.imageUrl || getDefaultEventImage(i)} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                        {eventTypeLabels[event.type] || event.type}
                      </div>
                      {isRegistered && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                          <Check className="h-3 w-3" /> Registered
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatEventDate(event.startDate)}
                        </span>
                        {event.location && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {event.location}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                        {event.description}
                      </p>

                      <Button 
                        className={`w-full rounded-xl ${
                          isRegistered 
                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                            : 'bg-primary hover:bg-primary/90 text-white'
                        }`}
                        onClick={() => !isRegistered && handleRegister(event.id)}
                        disabled={isRegistered || isPendingThis}
                        data-testid={`button-register-${event.id}`}
                      >
                        {isPendingThis ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : isRegistered ? (
                          <>
                            <Check className="h-4 w-4 mr-2" /> Registered
                          </>
                        ) : (
                          "Register Now"
                        )}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="stories" className="py-24 px-4 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 text-xs font-bold tracking-wider uppercase mb-4">
              Stories of Transformation
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Lives Changed Around the World
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real stories from real people whose lives have been transformed through our mission.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {missionStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid={`story-card-${story.id}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{story.name}</div>
                    <div className="text-sm text-gray-500">{story.location}</div>
                  </div>
                </div>
                <span className="inline-block px-2 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full mb-3">
                  {story.tag}
                </span>
                <p className="text-gray-600 text-sm leading-relaxed">
                  "{story.story}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-[#1a2744] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              Ready to Be Part of the Movement?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of young people around the world who are making an impact through faith, community, and action.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-full text-lg font-bold"
                onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-view-events"
              >
                View Upcoming Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <a href="/sparks">
                <Button 
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg font-bold"
                  data-testid="button-explore-sparks"
                >
                  Explore Daily Sparks
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
