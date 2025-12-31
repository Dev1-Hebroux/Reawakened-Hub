import { motion } from "framer-motion";
import { Users, BookOpen, Heart, Globe, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import communityBg from "@assets/generated_images/group_of_diverse_young_people_looking_at_a_phone.png";

const rooms = [
  { title: "Students", count: "2.4k", icon: Users, color: "bg-blue-50", iconColor: "text-blue-600" },
  { title: "Creatives", count: "1.2k", icon: Heart, color: "bg-pink-50", iconColor: "text-pink-600" },
  { title: "Apologetics", count: "850", icon: BookOpen, color: "bg-amber-50", iconColor: "text-amber-600" },
  { title: "Missions", count: "3.1k", icon: Globe, color: "bg-emerald-50", iconColor: "text-emerald-600" },
];

export function CommunityRooms() {
  const [, navigate] = useLocation();
  
  return (
    <section id="community" className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <span className="text-primary font-bold tracking-wider uppercase text-sm">Community</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 leading-tight">
              Connect With Your <br />
              <span className="text-primary">Spiritual Family</span>
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
              Life isn't meant to be lived alone. Join moderated spaces for every life stage and calling. Connect, grow, and go together.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {rooms.map((room) => (
                <div key={room.title} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${room.color}`}>
                    <room.icon className={`h-6 w-6 ${room.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{room.title}</h4>
                    <p className="text-xs text-gray-500 font-bold">{room.count} Members</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => navigate("/community")}
              className="btn-primary mt-6"
              data-testid="button-find-room"
            >
              Find Your Room
            </button>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.6 }}
             viewport={{ once: true }}
             className="relative"
          >
            <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src={communityBg} 
                alt="Community Group" 
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              <div className="absolute bottom-10 left-10 text-white">
                <p className="font-display font-bold text-3xl mb-2">"I found my people here."</p>
                <p className="font-medium opacity-80">— Jessica, Student Community</p>
              </div>
            </div>
            
            {/* Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-200 rounded-full blur-3xl -z-10" />
            <div className="absolute top-20 -left-10 w-20 h-20 bg-blue-200 rounded-full blur-2xl -z-10" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
