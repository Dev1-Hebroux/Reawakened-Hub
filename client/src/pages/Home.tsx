import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Foundations } from "@/components/sections/Foundations";
import { DailySparks } from "@/components/sections/DailySparks";
import { CommunityRooms } from "@/components/sections/CommunityRooms";
import { DiscipleshipPaths } from "@/components/sections/DiscipleshipPaths";
import { MissionEngine } from "@/components/sections/MissionEngine";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Foundations />
        <DailySparks />
        <CommunityRooms />
        <DiscipleshipPaths />
        <MissionEngine />
      </main>
      <Footer />
    </div>
  );
}
