import { motion } from "framer-motion";
import { Flame, Wheat, MoveHorizontal } from "lucide-react";

const pillars = [
  {
    icon: Flame,
    title: "The Outpouring",
    scripture: "Joel 2",
    desc: "I will pour out my Spirit upon all of you! Your sons and daughters will prophesy.",
    iconBg: "bg-gradient-to-br from-orange-400 to-amber-500",
    glowColor: "shadow-orange-200",
    borderHover: "group-hover:border-orange-200",
  },
  {
    icon: Wheat,
    title: "The Harvest",
    scripture: "John 4",
    desc: "Open your eyes and look at the fields! They are ripe for harvest.",
    iconBg: "bg-gradient-to-br from-amber-400 to-yellow-500",
    glowColor: "shadow-yellow-200",
    borderHover: "group-hover:border-yellow-200",
  },
  {
    icon: MoveHorizontal,
    title: "Without Walls",
    scripture: "Zechariah 2",
    desc: "Jerusalem will be a city without walls because of the multitude of people.",
    iconBg: "bg-gradient-to-br from-[#4A7C7C] to-[#7C9A8E]",
    glowColor: "shadow-teal-200",
    borderHover: "group-hover:border-teal-200",
  }
];

export function Foundations() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#FAF8F5]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-[#7C9A8E] font-bold tracking-wider uppercase text-sm">Our Pillars</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mt-2">
            Built on <span className="bg-gradient-to-r from-[#7C9A8E] to-[#4A7C7C] bg-clip-text text-transparent">Biblical Truth</span>
          </h2>
          <p className="text-gray-500 mt-4 text-lg">The foundations that guide everything we do</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-gray-100 hover:shadow-2xl ${pillar.glowColor} transition-all duration-500 text-center cursor-pointer ${pillar.borderHover}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                <motion.div 
                  className={`h-20 w-20 rounded-2xl mx-auto flex items-center justify-center mb-6 ${pillar.iconBg} shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <pillar.icon className="h-10 w-10 text-white drop-shadow-md" />
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#4A7C7C] transition-colors">{pillar.title}</h3>
                
                <div className="inline-block px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 mb-4 group-hover:bg-[#7C9A8E]/10 group-hover:border-[#7C9A8E]/20 group-hover:text-[#4A7C7C] transition-all">
                  {pillar.scripture}
                </div>
                
                <p className="text-gray-500 leading-relaxed text-base italic">
                  "{pillar.desc}"
                </p>

                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm font-medium text-[#7C9A8E]">Learn more →</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
