import { useRef } from "react";
import { motion } from "framer-motion";
import { Play, Heart, ArrowRight } from "lucide-react";

import identityImg from "@assets/generated_images/identity_in_chaos_abstract.png";
import believeImg from "@assets/generated_images/why_i_believe_abstract.png";
import hearingImg from "@assets/generated_images/hearing_god's_voice_abstract.png";
import boldnessImg from "@assets/generated_images/boldness_at_work_abstract.png";

const sparks = [
  { id: 1, title: "Identity in Chaos", author: "Abraham", views: "12k", category: "Faith", image: identityImg },
  { id: 2, title: "Why I Believe", author: "Josh", views: "8.5k", category: "Testimony", image: believeImg },
  { id: 3, title: "Hearing God's Voice", author: "Abraham", views: "45k", category: "Teaching", image: hearingImg },
  { id: 4, title: "Boldness at Work", author: "Sarah", views: "15k", category: "Lifestyle", image: boldnessImg },
];

export function DailySparks() {
  return (
    <section id="sparks" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-4">
            <span className="text-primary font-bold tracking-wider uppercase text-sm">Daily Inspiration</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 leading-tight">
              Ignite Your <br /><span className="text-primary">Spiritual Journey</span>
            </h2>
          </div>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold px-6 py-3 rounded-full flex items-center gap-2 transition-colors">
            View All Sparks <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sparks.map((spark, i) => (
            <motion.div
              key={spark.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative rounded-[24px] overflow-hidden aspect-[3/4] mb-4 shadow-md group-hover:shadow-xl transition-all duration-300">
                <img 
                  src={spark.image} 
                  alt={spark.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  <span className="text-xs font-bold text-white">{spark.category}</span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-14 w-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
                    <Play className="h-6 w-6 text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{spark.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                  <span>{spark.author}</span>
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {spark.views}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
