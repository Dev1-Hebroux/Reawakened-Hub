import { motion } from "framer-motion";
import { Flame, Wheat, MoveHorizontal } from "lucide-react";

const pillars = [
  {
    icon: Flame,
    title: "The Outpouring",
    scripture: "Joel 2",
    desc: "I will pour out my Spirit upon all of you! Your sons and daughters will prophesy.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20"
  },
  {
    icon: Wheat,
    title: "The Harvest",
    scripture: "John 4",
    desc: "Open your eyes and look at the fields! They are ripe for harvest.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20"
  },
  {
    icon: MoveHorizontal,
    title: "Without Walls",
    scripture: "Zechariah 2",
    desc: "Jerusalem will be a city without walls because of the multitude of people and livestock in it.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  }
];

export function Foundations() {
  return (
    <section className="py-20 bg-background border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className={`rounded-2xl p-8 border ${pillar.border} ${pillar.bg} backdrop-blur-sm relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 font-display font-bold text-6xl text-white select-none">
                {i + 1}
              </div>
              
              <div className={`h-12 w-12 rounded-xl bg-background border border-white/10 flex items-center justify-center mb-6 ${pillar.color}`}>
                <pillar.icon className="h-6 w-6" />
              </div>

              <div className="flex items-baseline space-x-3 mb-2">
                <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 ${pillar.color} border border-white/10`}>
                  {pillar.scripture}
                </span>
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                "{pillar.desc}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
