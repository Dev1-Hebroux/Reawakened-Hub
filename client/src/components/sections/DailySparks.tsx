import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";

const sparks = [
  { id: 1, title: "Identity in Chaos", author: "@sarah_faith", views: "12k", color: "from-purple-500 to-blue-500" },
  { id: 2, title: "Why I Believe", author: "@josh_real", views: "8.5k", color: "from-orange-500 to-red-500" },
  { id: 3, title: "Hearing God's Voice", author: "@pastor_mike", views: "45k", color: "from-blue-500 to-cyan-500" },
  { id: 4, title: "Boldness at Work", author: "@maria_light", views: "15k", color: "from-pink-500 to-rose-500" },
  { id: 5, title: "Miracles Today", author: "@revival_now", views: "32k", color: "from-emerald-500 to-teal-500" },
];

export function DailySparks() {
  return (
    <section id="sparks" className="py-24 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">Daily Sparks</h2>
            <p className="text-muted-foreground max-w-md">Short, high-impact truths to ignite your faith every day. Swipe, watch, and be transformed.</p>
          </div>
          <button className="text-primary hover:text-primary/80 font-medium text-sm tracking-wide uppercase transition-colors">
            View All Sparks &rarr;
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-12 px-4 scrollbar-hide">
        <div className="flex space-x-6 min-w-max px-4 md:px-8 lg:px-12">
          {sparks.map((spark, i) => (
            <motion.div
              key={spark.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="relative group cursor-pointer"
            >
              <div className={`w-[280px] h-[500px] rounded-3xl bg-gradient-to-br ${spark.color} p-1 relative overflow-hidden shadow-2xl transition-transform duration-300 group-hover:-translate-y-2`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                    <Play className="h-8 w-8 text-white fill-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-24">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-white/20" />
                    <span className="text-sm font-medium text-white/90">{spark.author}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight mb-2">{spark.title}</h3>
                  <p className="text-xs text-white/60 flex items-center">
                    <Play className="h-3 w-3 mr-1" /> {spark.views} views
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
