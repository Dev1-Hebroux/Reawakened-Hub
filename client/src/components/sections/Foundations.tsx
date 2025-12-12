import { motion } from "framer-motion";
import { CheckCircle2, Lock, Flame, Wheat, MoveHorizontal } from "lucide-react";

const pillars = [
  {
    icon: Flame,
    title: "The Outpouring",
    scripture: "Joel 2",
    desc: "I will pour out my Spirit upon all of you! Your sons and daughters will prophesy.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Wheat,
    title: "The Harvest",
    scripture: "John 4",
    desc: "Open your eyes and look at the fields! They are ripe for harvest.",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    icon: MoveHorizontal,
    title: "Without Walls",
    scripture: "Zechariah 2",
    desc: "Jerusalem will be a city without walls because of the multitude of people.",
    color: "bg-blue-100 text-blue-600",
  }
];

export function Foundations() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-sm">Our Pillars</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mt-2">
            Built on <span className="text-primary">Biblical Truth</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[30px] border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group"
            >
              <div className={`h-20 w-20 rounded-full mx-auto flex items-center justify-center mb-6 ${pillar.color} group-hover:scale-110 transition-transform`}>
                <pillar.icon className="h-10 w-10" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">{pillar.title}</h3>
              <div className="inline-block px-3 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-600 mb-4">
                {pillar.scripture}
              </div>
              
              <p className="text-gray-500 leading-relaxed">
                "{pillar.desc}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
