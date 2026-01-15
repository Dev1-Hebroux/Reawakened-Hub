import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

import heroBg from "@assets/generated_images/global_mission_map_concept.png";

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

export function OutreachPage() {
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
                onClick={() => window.location.href = '/login'}
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
              <Link href="/#events">
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-full text-lg font-bold"
                  data-testid="button-view-events"
                >
                  View Upcoming Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sparks">
                <Button 
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg font-bold"
                  data-testid="button-explore-sparks"
                >
                  Explore Daily Sparks
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
