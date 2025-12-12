import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, Play } from "lucide-react";
import heroBg from "@assets/generated_images/hero_background_with_golden_light_rays_and_dark_blue_clouds.png";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background/80 z-10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-10" />
        <img 
          src={heroBg} 
          alt="Abstract Background" 
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-sm text-primary-foreground mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-medium tracking-wide text-xs uppercase">A Call to Vigilance & Revival</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter text-white leading-[1.1]">
            Faith. Real Life. <br />
            <span className="text-gradient">Mission.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Reawakened is the digital hub for a generation ready to encounter Jesus, find their purpose, and change the world.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-14 text-lg font-medium shadow-[0_0_30px_-5px_hsla(25,90%,60%,0.4)] hover:shadow-[0_0_40px_-5px_hsla(25,90%,60%,0.6)] transition-all">
              Join the Movement <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 text-white rounded-full px-8 h-14 text-lg font-medium backdrop-blur-sm">
              <Play className="mr-2 h-5 w-5 fill-current" /> Watch Video
            </Button>
          </div>

          {/* Stats/Social Proof */}
          <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t border-white/5 mt-16 max-w-4xl mx-auto">
            {[
              { label: "Community Members", value: "10k+" },
              { label: "Nations Reached", value: "45+" },
              { label: "Daily Sparks", value: "500+" },
              { label: "Mission Projects", value: "120" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-bold text-white font-display">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-widest text-[10px] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
