import { motion } from "framer-motion";
import { CheckCircle2, Lock } from "lucide-react";
import pathBg from "@assets/generated_images/woman_looking_at_a_city_skyline_at_sunset.png";

const steps = [
  { day: 1, title: "The Awakening", status: "completed", desc: "Start your spiritual reset." },
  { day: 2, title: "Breaking Chains", status: "completed", desc: "Freedom from the past." },
  { day: 3, title: "Identity Reset", status: "current", desc: "Who you are in Christ." },
  { day: 4, title: "Hearing God", status: "locked", desc: "Learning to listen." },
];

export function DiscipleshipPaths() {
  return (
    <section id="paths" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-sm">Growth Paths</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mt-2">
            Structured Journeys for <br /> <span className="text-primary">Real Transformation</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Card 1: 7-Day Reset */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-[#FFF8F3] rounded-[40px] p-8 md:p-10 border border-orange-100 hover:shadow-xl transition-shadow relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="bg-white px-4 py-1 rounded-full text-xs font-bold text-primary inline-block mb-6 shadow-sm border border-orange-50">
                Most Popular
              </div>
              <h3 className="text-3xl font-display font-bold text-gray-900 mb-4">7 Days to Reset Your Faith</h3>
              <p className="text-gray-500 mb-8 max-w-sm">A guided week of prayer, scripture, and reflection to realign your heart with God's purpose.</p>
              
              <div className="space-y-4 mb-8">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.status === 'completed' ? 'bg-green-100 text-green-600' : step.status === 'current' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {step.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : step.status === 'current' ? <div className="h-2.5 w-2.5 bg-white rounded-full" /> : <Lock className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${step.status === 'locked' ? 'text-gray-400' : 'text-gray-900'}`}>{step.title}</h4>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-colors">
                Continue Journey (Day 3)
              </button>
            </div>
          </motion.div>

          {/* Card 2: Visual Promo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-[40px] overflow-hidden relative min-h-[500px] group"
          >
            <img 
              src={pathBg} 
              alt="Woman looking at city" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-10 left-10 right-10 text-white z-10">
              <h3 className="text-3xl font-display font-bold mb-4">Identity & Power</h3>
              <p className="text-white/80 mb-8">A 21-day deep dive into who God says you are. Break free from limits and step into your calling.</p>
              <button className="bg-white text-gray-900 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors w-full sm:w-auto">
                Start 21-Day Challenge
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
