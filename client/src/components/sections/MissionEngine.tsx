import { motion } from "framer-motion";
import { Map, HeartHandshake, Send, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
const missionBg = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800";

export function MissionEngine() {
  const [, navigate] = useLocation();
  
  return (
    <section id="mission" className="py-24 bg-[#FFF8F3] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="bg-primary rounded-[40px] p-8 md:p-16 relative overflow-hidden shadow-2xl">
          {/* Background Image Overlay */}
          <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay">
            <img 
              src={missionBg} 
              alt="Mission Background" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold border border-white/20 inline-block">
                Global Impact
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                Ready to Change <br /> the World?
              </h2>
              <p className="text-white/80 text-lg max-w-md">
                Don't just watch. Act. Reawakened is your launchpad to pray, give, and go to the nations.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={() => navigate("/mission#outpouring")}
                  className="bg-white text-primary font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                  data-testid="button-start-mission"
                >
                  Start Your Mission
                </button>
                <button 
                  onClick={() => navigate("/mission")}
                  className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white/10 transition-colors"
                  data-testid="button-view-projects"
                >
                  View Projects
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
               {[
                { icon: Map, title: "Pray", desc: "Adopt a people group" },
                { icon: HeartHandshake, title: "Give", desc: "Support mission projects" },
                { icon: Send, title: "Go", desc: "Join outreach trips" }
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex items-center gap-6 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="h-12 w-12 rounded-full bg-white text-primary flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-white/70 text-sm">{item.desc}</p>
                  </div>
                  <ArrowRight className="text-white/50 h-5 w-5" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
