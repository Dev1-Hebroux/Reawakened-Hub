import { motion } from "framer-motion";
import { Users, BookOpen, Heart, Globe, ArrowRight } from "lucide-react";
import communityBg from "@assets/generated_images/abstract_network_of_connected_glowing_dots.png";

const rooms = [
  { title: "Students", count: "2.4k", icon: Users, color: "text-blue-400" },
  { title: "Creatives", count: "1.2k", icon: Heart, color: "text-pink-400" },
  { title: "Apologetics", count: "850", icon: BookOpen, color: "text-amber-400" },
  { title: "Missions", count: "3.1k", icon: Globe, color: "text-emerald-400" },
];

export function CommunityRooms() {
  return (
    <section id="community" className="py-24 relative overflow-hidden">
       {/* Background Image */}
       <div className="absolute inset-0 z-0 opacity-20">
        <img 
          src={communityBg} 
          alt="Community Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80 mix-blend-color" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
            Find Your <span className="text-gradient">People</span>.
          </h2>
          <p className="text-lg text-muted-foreground">
            Join moderated spaces for every life stage and calling. Connect, grow, and go together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rooms.map((room, i) => (
            <motion.div
              key={room.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className={`h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 ${room.color} group-hover:scale-110 transition-transform`}>
                <room.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{room.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{room.count} members</span>
                <ArrowRight className="h-4 w-4 text-white/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3 rounded-full font-medium transition-all">
            Explore All Rooms
          </button>
        </div>
      </div>
    </section>
  );
}
