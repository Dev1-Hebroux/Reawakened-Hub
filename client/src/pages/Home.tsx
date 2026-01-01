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
import { ArrowRight, ShoppingBag, Flame, Heart, Globe, Zap, Rocket, HandHeart, Users, Clock, CheckCircle2, Compass, Target, Sparkles, TrendingUp } from "lucide-react";
import { StatsBar } from "@/components/ui/StatsBar";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import outreachImg from "@assets/generated_images/group_wearing_reawakened.one_branded_t-shirts.png";
import capImg from "@assets/generated_images/cap_with_reawakened_embroidery.png";
import hoodieImg from "@assets/generated_images/hoodies_with_reawakened_logo.png";

const globalImpactCards = [
  {
    title: "Pray",
    subtitle: "Support a community",
    icon: Heart,
    link: "/pray",
  },
  {
    title: "Give",
    subtitle: "Fund impactful projects",
    icon: HandHeart,
    link: "/give",
  },
  {
    title: "Go",
    subtitle: "Join outreach trips",
    icon: Rocket,
    link: "/missions",
  },
  {
    title: "Connect",
    subtitle: "Join the community",
    icon: Zap,
    link: "/community",
  },
];

const commitmentLevels = [
  { id: "5min", label: "5 min", description: "Daily reflection", color: "from-[#D4A574] to-[#C49466]" },
  { id: "15min", label: "15 min", description: "Reflection + reading", color: "from-[#7C9A8E] to-[#6A8A7E]" },
  { id: "30min", label: "30 min", description: "Deep focus time", color: "from-[#1a2744] to-[#243656]" },
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
          <StatsBar variant="light" />
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
                  onClick={() => navigate('/vision')}
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 rounded-xl shadow-lg"
                  data-testid="button-start-commitment"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Begin Your Journey
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
                Join thousands carrying the message on the streets, in schools, and across nations.
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

        <section className="py-20 bg-[#1a2744] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48Y2lyY2xlIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIGN4PSIyMCIgY3k9IjIwIiByPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 bg-[#D4A574] rounded-full px-4 py-2 mb-6 shadow-lg">
                  <Globe className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Global Impact</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                  Ready to Change<br />the World?
                </h2>
                <p className="text-lg text-[#E8E4DE] mb-8 max-w-md">
                  Don't just watch. Act. Reawakened is your launchpad to pray, give, and go to the nations.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => navigate('/mission/onboarding')}
                    className="bg-white hover:bg-gray-100 text-[#1a2744] font-bold px-8 py-6 rounded-full shadow-xl"
                    data-testid="button-start-mission"
                  >
                    Start Your Mission
                  </Button>
                  <Button 
                    onClick={() => navigate('/mission')}
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 font-bold px-8 py-6 rounded-full"
                    data-testid="button-view-projects"
                  >
                    View Projects
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {globalImpactCards.map((card, i) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(card.link)}
                    className="bg-[#243656] hover:bg-[#2a3f66] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all group border border-[#4A7C7C]/20 shadow-lg"
                    data-testid={`card-impact-${card.title.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-[#1a2744] flex items-center justify-center shadow-md">
                        <card.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{card.title}</h3>
                        <p className="text-sm text-[#7C9A8E]">{card.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-[#7C9A8E] group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="mt-16 text-center">
              <p className="text-[#7C9A8E] mb-4">Join a global community of young people taking action</p>
              <div className="flex justify-center gap-8 items-center">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-[#D4A574] to-[#7C9A8E] border-2 border-[#1a2744] flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-white">2,500+ active missionaries</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DailySparks />
        <CommunityRooms />

        <section className="py-24 bg-gradient-to-br from-[#1a2744] via-[#1a2744] to-[#243656] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48Y2lyY2xlIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIGN4PSIyMCIgY3k9IjIwIiByPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-2 mb-6">
                  <Compass className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-primary">Your Vision Journey</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                  Discover Your Purpose.<br />Set Your Path.
                </h2>
                <p className="text-lg text-[#E8E4DE] mb-6 max-w-md">
                  A step-by-step journey to gain clarity on who you are, what matters most, and where you're headed. Build a personal roadmap for meaningful growth.
                </p>
                <p className="text-sm text-[#7C9A8E] mb-8 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Faith-friendly options available for those who want them
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => navigate('/vision')}
                    className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 rounded-full shadow-xl"
                    data-testid="button-start-vision"
                  >
                    Start Your Vision Journey
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {[
                  { step: 1, title: "Reflect", description: "Assess where you are in life's key areas", icon: Target },
                  { step: 2, title: "Clarify", description: "Discover what truly drives and inspires you", icon: Compass },
                  { step: 3, title: "Set Goals", description: "Define meaningful goals that fit your season", icon: TrendingUp },
                  { step: 4, title: "Build Habits", description: "Create daily practices that lead to lasting change", icon: CheckCircle2 },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#243656] hover:bg-[#2a3f66] rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all group border border-[#4A7C7C]/20 shadow-lg"
                    onClick={() => navigate('/vision')}
                    data-testid={`card-vision-step-${item.step}`}
                  >
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shadow-md">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg">{item.title}</h3>
                      <p className="text-sm text-[#7C9A8E]">{item.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-[#7C9A8E] group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-[#7C9A8E] mb-4">Join thousands who've found clarity and direction</p>
              <div className="flex justify-center gap-8 items-center flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-[#7C9A8E] border-2 border-[#1a2744] flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-white">3,200+ journeys started</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DiscipleshipPaths />
        <MissionEngine />

        <section className="py-16 bg-gradient-to-br from-[#1a2744] via-[#1a2744] to-[#243656] relative overflow-hidden">
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
                Join thousands receiving weekly inspiration and updates.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <SubscriptionCapture 
                variant="card"
                title="Join the Community"
                subtitle="Get daily inspiration, growth tips, and updates delivered to your inbox."
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
