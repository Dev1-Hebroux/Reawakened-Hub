import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Foundations } from "@/components/sections/Foundations";
import { DailySparks } from "@/components/sections/DailySparks";
import { CommunityRooms } from "@/components/sections/CommunityRooms";
import { DiscipleshipPaths } from "@/components/sections/DiscipleshipPaths";
import { MissionEngine } from "@/components/sections/MissionEngine";
import { MarqueeCTA } from "@/components/sections/MarqueeCTA";
import { SubscriptionCapture } from "@/components/sections/SubscriptionCapture";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, ShoppingBag, Flame, Heart, Globe, Zap, Rocket, HandHeart, Users, Clock, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import outreachImg from "@assets/generated_images/group_wearing_reawakened.one_branded_t-shirts.png";
import capImg from "@assets/generated_images/cap_with_reawakened_embroidery.png";
import hoodieImg from "@assets/generated_images/hoodies_with_reawakened_logo.png";

const actionCards = [
  {
    title: "Pray",
    subtitle: "Intercede for the Nations",
    description: "Adopt a people group, join live prayer rooms, and fuel the harvest through daily intercession.",
    icon: Heart,
    color: "from-[#D4A574] to-[#C49466]",
    bgColor: "bg-[#D4A574]/10",
    link: "/pray",
    cta: "Start Praying",
  },
  {
    title: "Give",
    subtitle: "Fuel the Mission",
    description: "Support verified projects, sponsor digital outreach, and see your giving reach the nations.",
    icon: HandHeart,
    color: "from-[#7C9A8E] to-[#6A8A7E]",
    bgColor: "bg-[#7C9A8E]/10",
    link: "/give",
    cta: "Give Now",
  },
  {
    title: "Go Digital",
    subtitle: "Take Action Online",
    description: "Share your testimony, invite friends, complete training, and make disciples from anywhere.",
    icon: Rocket,
    color: "from-primary to-orange-500",
    bgColor: "bg-primary/10",
    link: "/missions",
    cta: "Take Action",
  },
];

const commitmentLevels = [
  { id: "5min", label: "5 min", description: "Daily prayer", color: "from-[#D4A574] to-[#C49466]" },
  { id: "15min", label: "15 min", description: "Prayer + devotional", color: "from-[#7C9A8E] to-[#6A8A7E]" },
  { id: "30min", label: "30 min", description: "Full intercession", color: "from-primary to-orange-500" },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [selectedCommitment, setSelectedCommitment] = useState<string | null>(null);
  
  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <Navbar />
      <main className="relative z-10">
        <Hero />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md px-3 py-3 md:px-6 md:py-4 grid grid-cols-4 gap-1 md:gap-4 border border-gray-100">
            {[
              { label: "Our Vision", value: "10k+", subtitle: "disciples by 2030" },
              { label: "Our Goal", value: "50+", subtitle: "nations reached" },
              { label: "Daily", value: "365", subtitle: "sparks per year" },
              { label: "Launching", value: "12+", subtitle: "mission projects" },
            ].map((stat, i) => (
              <div key={i} className="text-center" data-testid={`stat-home-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="text-lg md:text-2xl font-bold text-gray-900 font-display">{stat.value}</div>
                <div className="text-[9px] md:text-xs text-gray-600 leading-tight">{stat.subtitle}</div>
                <div className="text-[8px] md:text-[10px] text-gray-400 uppercase tracking-wide font-semibold mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <section className="py-12 bg-gradient-to-b from-white to-gray-50/50 relative">
          <div className="max-w-2xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-6"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-3">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-primary">Daily Commitment</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900">How much time will you give?</h3>
            </motion.div>

            <div className="flex gap-3 justify-center mb-4">
              {commitmentLevels.map((level) => (
                <motion.button
                  key={level.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCommitment(level.id)}
                  className={`relative flex-1 max-w-[120px] p-4 rounded-2xl border-2 transition-all ${
                    selectedCommitment === level.id
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  data-testid={`commitment-${level.id}`}
                >
                  {selectedCommitment === level.id && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                  <div className={`h-10 w-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center`}>
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">{level.label}</div>
                  <div className="text-[10px] text-gray-500">{level.description}</div>
                </motion.button>
              ))}
            </div>

            {selectedCommitment && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Button 
                  onClick={() => navigate('/pray')}
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 rounded-xl shadow-lg"
                  data-testid="button-start-commitment"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Start Today's Prayer
                </Button>
              </motion.div>
            )}
          </div>
        </section>
        
        <Foundations />
        <MarqueeCTA />
        
        <section className="py-24 bg-gray-50/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Wear the Vision</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">Represent the Movement</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join thousands of watchmen carrying the message on the streets, in schools, and across nations.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group relative h-[400px] rounded-[30px] overflow-hidden cursor-pointer">
                <img src={outreachImg} alt="Community Outreach" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                   <h3 className="text-2xl font-bold text-white mb-2">Community Gear</h3>
                   <button className="flex items-center gap-2 text-white/80 hover:text-white font-medium group-hover:gap-3 transition-all" data-testid="button-merch-community">
                     View Collection <ArrowRight className="h-4 w-4" />
                   </button>
                </div>
              </div>

              <div className="group relative h-[400px] rounded-[30px] overflow-hidden cursor-pointer md:-mt-8">
                <img src={capImg} alt="Signature Cap" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                   <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">BESTSELLER</span>
                   <h3 className="text-2xl font-bold text-white mb-2">Signature Caps</h3>
                   <button className="flex items-center gap-2 text-white/80 hover:text-white font-medium group-hover:gap-3 transition-all" data-testid="button-merch-caps">
                     Shop Accessories <ArrowRight className="h-4 w-4" />
                   </button>
                </div>
              </div>

              <div className="group relative h-[400px] rounded-[30px] overflow-hidden cursor-pointer">
                <img src={hoodieImg} alt="Worship Hoodies" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                   <h3 className="text-2xl font-bold text-white mb-2">Revival Hoodies</h3>
                   <button className="flex items-center gap-2 text-white/80 hover:text-white font-medium group-hover:gap-3 transition-all" data-testid="button-merch-hoodies">
                     Get Yours <ArrowRight className="h-4 w-4" />
                   </button>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={() => navigate("/community")}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg" 
                data-testid="button-visit-hub"
              >
                <ShoppingBag className="h-5 w-5" /> Visit the Hub
              </button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Your Part in the Mission</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">Pray. Give. Go.</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Every action fuels revival. Choose how you want to make an impact today.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {actionCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group cursor-pointer"
                  onClick={() => navigate(card.link)}
                  data-testid={`card-action-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />
                  <div className={`relative ${card.bgColor} border border-gray-100 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 h-full group-hover:bg-white`}>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} text-white mb-6 shadow-lg`}>
                      <card.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.title}</h3>
                    <p className="text-sm font-bold text-primary mb-4">{card.subtitle}</p>
                    <p className="text-gray-600 mb-6 leading-relaxed">{card.description}</p>
                    <Button 
                      className={`w-full bg-gradient-to-r ${card.color} hover:opacity-90 text-white font-bold py-6 rounded-xl shadow-lg`}
                      data-testid={`button-${card.title.toLowerCase()}`}
                    >
                      {card.cta} <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-500 mb-4">Join the global movement of young believers taking action</p>
              <div className="flex justify-center gap-8 items-center">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-[#D4A574] border-2 border-white flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-700">2,500+ active missionaries</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DailySparks />
        <CommunityRooms />
        <DiscipleshipPaths />
        <MissionEngine />

        <section className="py-16 bg-gradient-to-br from-primary via-primary to-blue-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] " />
          </div>
          
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 text-white mb-4"
              >
                <Zap className="h-6 w-6" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                Stay Ignited. Stay Connected.
              </h2>
              <p className="text-sm text-white/80">
                Join thousands receiving weekly inspiration and mission updates.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <SubscriptionCapture 
                variant="card"
                title="Join the Movement"
                subtitle="Get daily sparks, mission updates, and prayer points delivered to your inbox."
                showCategories={true}
                showWhatsApp={true}
              />
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
