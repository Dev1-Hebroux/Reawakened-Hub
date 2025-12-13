import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Foundations } from "@/components/sections/Foundations";
import { DailySparks } from "@/components/sections/DailySparks";
import { CommunityRooms } from "@/components/sections/CommunityRooms";
import { DiscipleshipPaths } from "@/components/sections/DiscipleshipPaths";
import { MissionEngine } from "@/components/sections/MissionEngine";
import { MarqueeCTA } from "@/components/sections/MarqueeCTA";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, ShoppingBag } from "lucide-react";

// Generated Merch Images
import outreachImg from "@assets/generated_images/group_wearing_reawakened.one_branded_t-shirts.png";
import capImg from "@assets/generated_images/cap_with_reawakened_embroidery.png";
import hoodieImg from "@assets/generated_images/hoodies_with_reawakened_logo.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden relative">
      {/* Subtle Bluish Brand Effect */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <Navbar />
      <main className="relative z-10">
        <Hero />
        {/* Statistics Banner - Travlo style */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
          <div className="bg-white rounded-[20px] shadow-xl p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 border border-gray-100">
             {[
              { label: "Community Members", value: "10k+" },
              { label: "Nations Reached", value: "45+" },
              { label: "Daily Sparks", value: "500+" },
              { label: "Mission Projects", value: "120" },
            ].map((stat, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 font-display mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        <Foundations />
        <MarqueeCTA />
        
        {/* Merch / Lifestyle Section */}
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
              {/* Card 1 */}
              <div className="group relative h-[400px] rounded-[30px] overflow-hidden cursor-pointer">
                <img src={outreachImg} alt="Community Outreach" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                   <h3 className="text-2xl font-bold text-white mb-2">Community Gear</h3>
                   <button className="flex items-center gap-2 text-white/80 hover:text-white font-medium group-hover:gap-3 transition-all">
                     View Collection <ArrowRight className="h-4 w-4" />
                   </button>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative h-[400px] rounded-[30px] overflow-hidden cursor-pointer md:-mt-8">
                <img src={capImg} alt="Signature Cap" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                   <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">BESTSELLER</span>
                   <h3 className="text-2xl font-bold text-white mb-2">Signature Caps</h3>
                   <button className="flex items-center gap-2 text-white/80 hover:text-white font-medium group-hover:gap-3 transition-all">
                     Shop Accessories <ArrowRight className="h-4 w-4" />
                   </button>
                </div>
              </div>

               {/* Card 3 */}
               <div className="group relative h-[400px] rounded-[30px] overflow-hidden cursor-pointer">
                <img src={hoodieImg} alt="Worship Hoodies" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                   <h3 className="text-2xl font-bold text-white mb-2">Revival Hoodies</h3>
                   <button className="flex items-center gap-2 text-white/80 hover:text-white font-medium group-hover:gap-3 transition-all">
                     Get Yours <ArrowRight className="h-4 w-4" />
                   </button>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <button className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg">
                <ShoppingBag className="h-5 w-5" /> Visit the Hub
              </button>
            </div>
          </div>
        </section>

        <DailySparks />
        <CommunityRooms />
        <DiscipleshipPaths />
        <MissionEngine />
      </main>
      <Footer />
    </div>
  );
}
