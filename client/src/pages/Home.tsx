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
import { ArrowRight, ShoppingBag, Flame, Heart, Globe, Zap } from "lucide-react";
import { Link } from "wouter";

import outreachImg from "@assets/generated_images/group_wearing_reawakened.one_branded_t-shirts.png";
import capImg from "@assets/generated_images/cap_with_reawakened_embroidery.png";
import hoodieImg from "@assets/generated_images/hoodies_with_reawakened_logo.png";

const funnelCards = [
  {
    title: "The Outpouring",
    subtitle: "Holy Spirit, Prayer & Revival",
    description: "Experience the power of God through intentional prayer, worship encounters, and spiritual awakening movements.",
    icon: Flame,
    color: "from-orange-500 to-red-500",
    link: "/mission#outpouring",
  },
  {
    title: "The Harvest",
    subtitle: "Evangelism, Outreach & Missions",
    description: "Go into all the world! Join mission trips, school tours, and community outreach initiatives reaching the nations.",
    icon: Globe,
    color: "from-blue-500 to-cyan-500",
    link: "/mission#harvest",
  },
  {
    title: "Without Walls",
    subtitle: "Community & Global Partnerships",
    description: "Build kingdom connections, join our WhatsApp community, and partner with believers across continents.",
    icon: Heart,
    color: "from-purple-500 to-pink-500",
    link: "/mission#without-walls",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <Navbar />
      <main className="relative z-10">
        <Hero />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
          <div className="bg-white rounded-[20px] shadow-xl p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 border border-gray-100">
            {[
              { label: "Our Vision", value: "10k+", subtitle: "disciples by 2030" },
              { label: "Our Goal", value: "50+", subtitle: "nations reached" },
              { label: "Daily", value: "365", subtitle: "sparks per year" },
              { label: "Launching", value: "12+", subtitle: "mission projects" },
            ].map((stat, i) => (
              <div key={i} className="text-center md:text-left" data-testid={`stat-home-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 font-display mb-1">{stat.value}</div>
                <div className="text-xs text-primary font-bold mb-1">{stat.subtitle}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                   <h3 className="text-2xl font-bold text-white mb-2">Community Gear</h3>
                   <button className="flex items-center gap-2 text-white/80 hover:text-white font-medium group-hover:gap-3 transition-all" data-testid="button-merch-community">
                     View Collection <ArrowRight className="h-4 w-4" />
                   </button>
                </div>
              </div>

              <div className="group relative h-[400px] rounded-[30px] overflow-hidden cursor-pointer md:-mt-8">
                <img src={capImg} alt="Signature Cap" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                   <h3 className="text-2xl font-bold text-white mb-2">Revival Hoodies</h3>
                   <button className="flex items-center gap-2 text-white/80 hover:text-white font-medium group-hover:gap-3 transition-all" data-testid="button-merch-hoodies">
                     Get Yours <ArrowRight className="h-4 w-4" />
                   </button>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <button className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg" data-testid="button-visit-hub">
                <ShoppingBag className="h-5 w-5" /> Visit the Hub
              </button>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Join the Movement</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">Three Channels. One Vision.</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Encounter. Equip. Mobilise. Choose your pathway and become part of a global movement.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {funnelCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group"
                  data-testid={`card-funnel-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />
                  <div className="relative bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 h-full">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} text-white mb-6`}>
                      <card.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-sm font-medium text-primary mb-4">{card.subtitle}</p>
                    <p className="text-gray-600 mb-6 leading-relaxed">{card.description}</p>
                    <Link href={card.link}>
                      <span className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all cursor-pointer" data-testid={`link-funnel-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        Explore <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <DailySparks />
        <CommunityRooms />
        <DiscipleshipPaths />
        <MissionEngine />

        <section className="py-24 bg-gradient-to-br from-primary via-primary to-blue-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] " />
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 text-white mb-6"
              >
                <Zap className="h-8 w-8" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                Stay Ignited. Stay Connected.
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Join thousands receiving weekly inspiration, mission updates, prayer points, and exclusive content.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-2xl"
            >
              <SubscriptionCapture 
                variant="card"
                title="Join the Movement"
                subtitle="Get daily sparks, mission updates, and prayer points delivered to your inbox."
                showCategories={true}
                showWhatsApp={true}
                className="shadow-none border-none p-0"
              />
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
