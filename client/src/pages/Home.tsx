import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Foundations } from "@/components/sections/Foundations";
import { DailySparks } from "@/components/sections/DailySparks";
import { CommunityRooms } from "@/components/sections/CommunityRooms";
import { DiscipleshipPaths } from "@/components/sections/DiscipleshipPaths";
import { MissionEngine } from "@/components/sections/MissionEngine";
import { MarqueeCTA } from "@/components/sections/MarqueeCTA";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden">
      <Navbar />
      <main>
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
        <DailySparks />
        <CommunityRooms />
        <DiscipleshipPaths />
        <MissionEngine />
      </main>
      <Footer />
    </div>
  );
}
