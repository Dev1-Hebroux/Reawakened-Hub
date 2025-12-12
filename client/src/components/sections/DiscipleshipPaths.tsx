import { motion } from "framer-motion";
import { CheckCircle2, Lock } from "lucide-react";
import pathBg from "@assets/generated_images/abstract_mountain_path_glowing_in_the_dark.png";

const steps = [
  { day: 1, title: "The Awakening", status: "completed" },
  { day: 2, title: "Breaking Chains", status: "completed" },
  { day: 3, title: "Identity Reset", status: "current" },
  { day: 4, title: "Hearing God", status: "locked" },
  { day: 5, title: "The Commission", status: "locked" },
];

export function DiscipleshipPaths() {
  return (
    <section id="paths" className="py-24 bg-background relative border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
                Structured Growth.<br />
                <span className="text-primary">Real Transformation.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Forget random scrolling. Step into curated 7-30 day journeys designed to build deep roots. Track your progress, earn badges, and grow with friends.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">7</div>
                <div>
                  <h4 className="text-white font-bold">Days to Reset Your Faith</h4>
                  <p className="text-sm text-muted-foreground">Start here. Re-align your heart.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-4 opacity-60">
                <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">21</div>
                <div>
                  <h4 className="text-white font-bold">Days of Identity & Power</h4>
                  <p className="text-sm text-muted-foreground">Go deeper. Discover who you are.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Phone Mockup / UI Card */}
            <div className="relative mx-auto w-full max-w-md aspect-[3/4] rounded-[2.5rem] border-8 border-white/10 bg-black overflow-hidden shadow-2xl">
              <img src={pathBg} alt="Path Background" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white mb-6">Your Journey</h3>
                <div className="space-y-4 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-white/10 -z-10" />
                  
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 z-10 
                        ${step.status === 'completed' ? 'bg-primary border-primary text-black' : 
                          step.status === 'current' ? 'bg-background border-primary text-primary' : 
                          'bg-background border-white/20 text-white/20'}`}>
                        {step.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : 
                         step.status === 'current' ? <div className="h-2.5 w-2.5 rounded-full bg-primary" /> : 
                         <Lock className="h-4 w-4" />}
                      </div>
                      <div className={`${step.status === 'locked' ? 'opacity-40' : 'opacity-100'}`}>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Day {step.day}</div>
                        <div className="font-bold text-white">{step.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-8 w-full bg-white text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform">
                  Continue Journey
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
