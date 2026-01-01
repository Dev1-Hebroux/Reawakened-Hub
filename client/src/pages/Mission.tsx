import { motion } from "framer-motion";
import { 
  Globe, BookOpen, Briefcase, Cpu, Users, 
  ArrowRight, Code, Database, Zap, Map, 
  GraduationCap, Heart, Rocket, Terminal,
  LayoutGrid, Share2, Network, Calendar, MapPin, Loader2, Check,
  Flame, MessageCircle, Plane, Hand
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { toast } from "sonner";
import { SubscriptionCapture } from "@/components/sections/SubscriptionCapture";
import { PrayerRequestModal, TestimonyModal, VolunteerModal, MissionTripModal } from "@/components/sections/EngagementForms";
import { COMMUNITY_LINKS } from "@/lib/config";
import type { Event, EventRegistration, Testimony } from "@shared/schema";

import heroBg from "@assets/generated_images/global_mission_map_concept.png";
import outreachImg from "@assets/generated_images/youth_outreach_event.png";
import hubImg from "@assets/generated_images/modern_tech_innovation_hub.png";
import trainingImg from "@assets/generated_images/mentorship_and_training_workshop.png";
import apiImg from "@assets/generated_images/digital_api_connectivity_abstract.png";

const defaultEventImages = [outreachImg, hubImg, trainingImg];

function getDefaultEventImage(index: number) {
  return defaultEventImages[index % defaultEventImages.length];
}

function formatEventDate(date: Date | string | null) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const features = [
  {
    title: "Global Outreach",
    icon: Globe,
    description: "From school assemblies to national crusades. We are possessing our inheritance and harvesting the nations through trips, camps, and community service.",
    image: outreachImg,
    tags: ["School Tours", "Holiday Trips", "City Impact"],
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Reawakened Academy",
    icon: GraduationCap,
    description: "Comprehensive discipleship and professional development. Including Alpha courses, leadership training, and career mentorship pathways.",
    image: trainingImg,
    tags: ["Discipleship", "Alpha Training", "Career Dev"],
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
  {
    title: "Innovation Hub",
    icon: Cpu,
    description: "A cutting-edge ecosystem for IT, AI capability, and business incubation. Empowering the next generation of kingdom entrepreneurs and creators.",
    image: hubImg,
    tags: ["AI Labs", "Startup Incubator", "Tech Skills"],
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  }
];

const stats = [
  { value: "10k+", subtitle: "disciples by 2030", label: "Our Vision" },
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

export function MissionPage() {
  const [activeEventType, setActiveEventType] = useState("All");
  const [prayerModalOpen, setPrayerModalOpen] = useState(false);
  const [testimonyModalOpen, setTestimonyModalOpen] = useState(false);
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);
  const [missionModalOpen, setMissionModalOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: testimonies = [], isLoading: testimoniesLoading } = useQuery<Testimony[]>({
    queryKey: ["/api/testimonies"],
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
      const res = await apiRequest("POST", "/api/event-registrations", { eventId });
      return res.json();
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

  const filteredEvents = activeEventType === "All" 
    ? events 
    : events.filter(event => event.type === activeEventType);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />
      
      <PrayerRequestModal open={prayerModalOpen} onOpenChange={setPrayerModalOpen} />
      <TestimonyModal open={testimonyModalOpen} onOpenChange={setTestimonyModalOpen} />
      <VolunteerModal open={volunteerModalOpen} onOpenChange={setVolunteerModalOpen} />
      <MissionTripModal open={missionModalOpen} onOpenChange={setMissionModalOpen} />
      
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-black">
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
            <h1 className="text-5xl md:text-8xl font-display font-bold text-white mb-6 tracking-tight leading-none" data-testid="text-mission-title">
              Raising a Standard.<br />
              <span className="text-orange-400">
                Building Without Walls.
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              We are a movement committed to spiritual awakening, societal transformation, and empowering the next generation through faith, technology, and excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-full text-lg font-bold" 
                onClick={() => setVolunteerModalOpen(true)}
                data-testid="button-join-movement"
              >
                Join the Movement
              </Button>
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg font-bold backdrop-blur-sm" 
                data-testid="button-explore-programs"
              >
                Explore Programs
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100 relative z-20 -mt-20 max-w-6xl mx-auto rounded-2xl shadow-xl p-6 md:p-8 mx-4 md:mx-auto">
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

      <section id="outpouring" className="py-24 px-4 bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Flame className="h-4 w-4" /> Channel 1
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                The Outpouring
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Experience the power of God through intentional prayer, worship encounters, and spiritual awakening movements. We believe in the Joel 2:28 promise of God's Spirit being poured out on all flesh.
              </p>
              <ul className="space-y-4 mb-8">
                {["Weekly Prayer Nights", "Worship Encounters", "Revival Meetings", "Spiritual Retreats"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
                  onClick={() => setPrayerModalOpen(true)}
                  data-testid="button-submit-prayer"
                >
                  <Hand className="h-4 w-4 mr-2" /> Submit Prayer Request
                </Button>
                <Button 
                  variant="outline"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 rounded-full px-6"
                  onClick={() => setTestimonyModalOpen(true)}
                  data-testid="button-share-testimony"
                >
                  <BookOpen className="h-4 w-4 mr-2" /> Share Testimony
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-white rounded-3xl p-8 shadow-xl">
                <SubscriptionCapture 
                  variant="card"
                  title="Stay Ignited"
                  subtitle="Get daily prayer points, worship playlists, and revival news."
                  showCategories={false}
                  showWhatsApp={true}
                  className="shadow-none border-none p-0"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="harvest" className="py-24 px-4 bg-gradient-to-br from-blue-50 to-cyan-50 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:order-2"
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Globe className="h-4 w-4" /> Channel 2
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                The Harvest
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Go into all the world! Join mission trips, school tours, and community outreach initiatives reaching the nations. From local neighborhoods to distant nations, we are laborers in the harvest.
              </p>
              <ul className="space-y-4 mb-8">
                {["Short-Term Mission Trips", "School & Campus Outreach", "Medical Missions", "Community Service Projects"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6"
                  onClick={() => setMissionModalOpen(true)}
                  data-testid="button-join-mission"
                >
                  <Plane className="h-4 w-4 mr-2" /> Join a Mission Trip
                </Button>
                <Button 
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-full px-6"
                  onClick={() => setVolunteerModalOpen(true)}
                  data-testid="button-volunteer"
                >
                  <Users className="h-4 w-4 mr-2" /> Volunteer
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:order-1"
            >
              <img 
                src={outreachImg} 
                alt="Outreach" 
                className="rounded-3xl shadow-2xl w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section id="without-walls" className="py-24 px-4 bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Heart className="h-4 w-4" /> Channel 3
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Without Walls
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Build kingdom connections across continents. Join our WhatsApp community, partner with believers globally, and be part of a movement that knows no boundaries.
              </p>
              <ul className="space-y-4 mb-8">
                {["Global WhatsApp Community", "Cross-Cultural Partnerships", "Online Discipleship Groups", "Virtual Prayer Networks"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <a
                  href={COMMUNITY_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-3 font-bold transition-colors"
                  data-testid="button-join-whatsapp"
                >
                  <MessageCircle className="h-4 w-4" /> Join WhatsApp Community
                </a>
                <Button 
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full px-6"
                  onClick={() => setVolunteerModalOpen(true)}
                  data-testid="button-become-partner"
                >
                  <Network className="h-4 w-4 mr-2" /> Become a Partner
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Join Our WhatsApp</h3>
                  <p className="text-gray-600">Connect with thousands of believers worldwide</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">10,000+ Members</div>
                      <div className="text-sm text-gray-500">Active community</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">45+ Nations</div>
                      <div className="text-sm text-gray-500">Global presence</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <Flame className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Daily Content</div>
                      <div className="text-sm text-gray-500">Devotionals & updates</div>
                    </div>
                  </div>
                </div>
                <a
                  href={COMMUNITY_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 py-4 font-bold transition-colors"
                  data-testid="button-join-whatsapp-card"
                >
                  <MessageCircle className="h-5 w-5" /> Join Now
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">A Holistic Vision</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We don't just preach; we build. Our mission encompasses spiritual formation, social outreach, and marketplace domination.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className={`absolute top-4 left-4 p-3 rounded-xl ${feature.bg} backdrop-blur-md`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                </div>
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {feature.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a href="#" className={`flex items-center gap-2 font-bold ${feature.color} hover:opacity-80 transition-opacity`}>
                    Learn More <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Stories / Testimonials */}
      <section className="py-24 px-4 bg-gradient-to-br from-[#7C9A8E]/10 to-[#4A7C7C]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#7C9A8E] font-bold tracking-wider uppercase text-sm">Stories of Transformation</span>
            <h2 className="text-4xl font-display font-bold text-gray-900 mt-2 mb-4">
              Lives Changed Around the World
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real stories from real people whose lives have been transformed through our mission.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {missionStories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid={`card-story-${story.id}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-[#7C9A8E]">
                    <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{story.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {story.location}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{story.story}"</p>
                <span className="inline-block px-3 py-1 bg-[#7C9A8E]/10 text-[#7C9A8E] text-xs font-bold rounded-full">
                  {story.tag}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Community Testimonies */}
          {testimonies.length > 0 && (
            <div className="mt-16">
              <div className="text-center mb-10">
                <span className="text-[#D4A574] font-bold tracking-wider uppercase text-sm">From Our Community</span>
                <h3 className="text-2xl font-display font-bold text-gray-900 mt-2">
                  Your Stories, Your Faith
                </h3>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonies.slice(0, 6).map((testimony, i) => (
                  <motion.div
                    key={testimony.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#D4A574]/20"
                    data-testid={`card-testimony-${testimony.id}`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#7C9A8E] to-[#4A7C7C] flex items-center justify-center text-white font-bold text-lg">
                        {testimony.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{testimony.name}</h4>
                        {testimony.category && (
                          <span className="text-xs text-[#D4A574] font-medium capitalize">{testimony.category}</span>
                        )}
                      </div>
                    </div>
                    <h5 className="font-bold text-gray-800 mb-2">{testimony.title}</h5>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">"{testimony.story}"</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {testimoniesLoading && (
            <div className="flex items-center justify-center py-12 mt-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#7C9A8E]" />
            </div>
          )}

          <div className="mt-12 text-center">
            <Button 
              onClick={() => setTestimonyModalOpen(true)}
              className="bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white rounded-full px-8 py-6 text-lg font-bold"
              data-testid="button-share-story"
            >
              <Heart className="h-5 w-5 mr-2" />
              Share Your Story
            </Button>
          </div>
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

      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#3b82f6_0%,_transparent_50%)]" />
          <img src={apiImg} alt="Connectivity" className="w-full h-full object-cover opacity-30 mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-sm mb-6 border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 rounded-full">
                <Terminal className="h-4 w-4" />
                <span>API_READY: TRUE</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
                Digital Enhanced.<br />
                <span className="text-gray-500">Platform Ready.</span>
              </h2>
              
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Our mission isn't limited by physical walls. We are building a digital-first ecosystem capable of integrating with global platforms.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-cyan-400">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Centralized Data Hub</h4>
                    <p className="text-gray-400 text-sm">Unified database for member tracking and impact analytics.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-purple-400">
                    <Network className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Open API Architecture</h4>
                    <p className="text-gray-400 text-sm">Seamlessly connect with CRM and communication platforms.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-green-400">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">AI-Powered Growth</h4>
                    <p className="text-gray-400 text-sm">Leveraging AI for personalized discipleship.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl font-mono text-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-4">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-gray-500">mission_control.config.json</span>
                </div>
                
                <div className="space-y-2 text-gray-300">
                  <div className="flex">
                    <span className="text-purple-400 w-8">1</span>
                    <span className="text-cyan-400">"mission_vision"</span>: <span className="text-yellow-300">"Raising a Standard"</span>,
                  </div>
                  <div className="flex">
                    <span className="text-purple-400 w-8">2</span>
                    <span className="text-cyan-400">"target_regions"</span>: [
                  </div>
                  <div className="flex pl-8">
                    <span className="text-purple-400 w-8">3</span>
                    <span className="text-green-300">"Europe"</span>, <span className="text-green-300">"Americas"</span>, <span className="text-green-300">"Asia"</span>
                  </div>
                  <div className="flex">
                    <span className="text-purple-400 w-8">4</span>
                    ],
                  </div>
                  <div className="flex">
                    <span className="text-purple-400 w-8">5</span>
                    <span className="text-cyan-400">"channels"</span>: [<span className="text-green-300">"outpouring"</span>, <span className="text-green-300">"harvest"</span>, <span className="text-green-300">"without_walls"</span>]
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-green-400 flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" /> System Online
                  </span>
                  <span className="text-gray-600">v2.4.0-alpha</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
