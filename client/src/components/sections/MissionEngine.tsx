import { motion } from "framer-motion";
import { Map, HeartHandshake, Send } from "lucide-react";

export function MissionEngine() {
  return (
    <section id="mission" className="py-24 bg-gradient-mesh relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Global Mission Engine
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Don't just watch. Act. Reawakened is your launchpad to pray, give, and go to the nations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Map,
              title: "Pray",
              desc: "Adopt a people group or city. Receive daily prayer points and see real-time impact.",
              action: "Start Praying",
              color: "bg-blue-500"
            },
            {
              icon: HeartHandshake,
              title: "Give",
              desc: "Transparent micro-giving to vetted mission projects. 100% goes to the field.",
              action: "View Projects",
              color: "bg-purple-500"
            },
            {
              icon: Send,
              title: "Go",
              desc: "Short-term trips, local outreach kits, and skills-based missions opportunities.",
              action: "Find Opportunities",
              color: "bg-orange-500"
            }
          ].map((item, i) => (
            <motion.div
              key={item.title}
              whileHover={{ y: -10 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${item.color} rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity`} />
              
              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <item.icon className="h-7 w-7 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {item.desc}
              </p>
              
              <button className="text-white font-medium border-b border-primary hover:border-white transition-colors pb-1">
                {item.action} &rarr;
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
