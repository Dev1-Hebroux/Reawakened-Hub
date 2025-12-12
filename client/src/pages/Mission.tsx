import { motion } from "framer-motion";
import { 
  Globe, BookOpen, Briefcase, Cpu, Users, 
  ArrowRight, Code, Database, Zap, Map, 
  GraduationCap, Heart, Rocket, Terminal,
  LayoutGrid, Share2, Network
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

// Assets
import heroBg from "@assets/generated_images/global_mission_map_concept.png";
import outreachImg from "@assets/generated_images/youth_outreach_event.png";
import hubImg from "@assets/generated_images/modern_tech_innovation_hub.png";
import trainingImg from "@assets/generated_images/mentorship_and_training_workshop.png";
import apiImg from "@assets/generated_images/digital_api_connectivity_abstract.png";

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
  { label: "Nations Reached", value: "30+" },
  { label: "Students Trained", value: "12k" },
  { label: "Hub Partners", value: "150+" },
  { label: "API Integrations", value: "∞" }
];

export function MissionPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />
      
      {/* Hero Section */}
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
            <h1 className="text-5xl md:text-8xl font-display font-bold text-white mb-6 tracking-tight leading-none">
              Raising a Standard.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                Building Without Walls.
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              We are a movement committed to spiritual awakening, societal transformation, and empowering the next generation through faith, technology, and excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-full text-lg font-bold">
                Join the Movement
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg font-bold backdrop-blur-sm">
                Explore Programs
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100 relative z-20 -mt-20 max-w-6xl mx-auto rounded-2xl shadow-xl p-8 mx-4 md:mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Pillars Grid */}
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
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  
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

      {/* Digital Ecosystem Section */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        {/* Abstract Background */}
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
                Our mission isn't limited by physical walls. We are building a digital-first ecosystem capable of integrating with global platforms. From custom APIs to AI-driven insights, we are future-proof.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-cyan-400">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Centralized Data Hub</h4>
                    <p className="text-gray-400 text-sm">Unified database for member tracking, resource distribution, and impact analytics.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-purple-400">
                    <Network className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Open API Architecture</h4>
                    <p className="text-gray-400 text-sm">Seamlessly connect with CRM, LMS, and communication platforms to scale our reach.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-green-400">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">AI-Powered Growth</h4>
                    <p className="text-gray-400 text-sm">Leveraging artificial intelligence for personalized discipleship and strategic outreach planning.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Code/Dashboard Mockup */}
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
                    <span className="text-cyan-400">"integrations"</span>: {`{`}
                  </div>
                  <div className="flex pl-8">
                    <span className="text-purple-400 w-8">6</span>
                    <span className="text-blue-300">"stripe_connect"</span>: <span className="text-red-400">true</span>,
                  </div>
                  <div className="flex pl-8">
                    <span className="text-purple-400 w-8">7</span>
                    <span className="text-blue-300">"twilio_sms"</span>: <span className="text-red-400">true</span>,
                  </div>
                  <div className="flex pl-8">
                    <span className="text-purple-400 w-8">8</span>
                    <span className="text-blue-300">"openai_assistant"</span>: <span className="text-red-400">true</span>
                  </div>
                  <div className="flex">
                    <span className="text-purple-400 w-8">9</span>
                    {`}`}
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

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 text-white">
          <h2 className="text-4xl font-display font-bold mb-6">Ready to Step Into Your Calling?</h2>
          <p className="text-xl text-white/90 mb-10">
            Whether you are a student, professional, or creative—there is a place for you in this movement. Let's build the future together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-6 rounded-full text-lg font-bold shadow-lg">
              Partner With Us
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg font-bold">
              View Opportunities
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
