import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Target, Compass, Sparkles, TrendingUp, 
  ArrowRight, Star, Zap, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

const growthTools = [
  {
    id: "vision",
    title: "Life Vision",
    subtitle: "Discover Your Purpose",
    description: "Map your life across 8 dimensions, clarify what matters most, and create a clear vision for your future.",
    icon: Compass,
    gradient: "from-teal-500 to-emerald-600",
    bgGradient: "from-teal-500/10 to-emerald-500/5",
    shadowColor: "shadow-teal-500/25",
    link: "/vision",
    stats: "1,200+ visions created",
  },
  {
    id: "goals",
    title: "2026 Goals",
    subtitle: "Make It Happen",
    description: "Set meaningful goals with proven frameworks. Track your habits, celebrate wins, and build unstoppable momentum.",
    icon: Target,
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-500/10 to-orange-500/5",
    shadowColor: "shadow-amber-500/25",
    link: "/goals",
    stats: "850+ goals set",
  },
  {
    id: "growth",
    title: "Growth Tools",
    subtitle: "Know Yourself",
    description: "Discover your unique strengths, understand your communication style, and develop emotional intelligence.",
    icon: TrendingUp,
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-500/10 to-purple-500/5",
    shadowColor: "shadow-violet-500/25",
    link: "/growth",
    stats: "3,400+ assessments taken",
  },
];

const highlights = [
  { icon: Star, text: "Science-backed tools", color: "text-amber-500" },
  { icon: Zap, text: "Purpose-driven growth", color: "text-violet-500" },
  { icon: BarChart3, text: "Track your progress", color: "text-teal-500" },
];

export function GrowthToolsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/10 to-teal-500/10 backdrop-blur-sm border border-violet-200/50 rounded-full px-5 py-2.5 mb-6"
          >
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-bold bg-gradient-to-r from-violet-600 to-teal-600 bg-clip-text text-transparent">Personal Growth Tools</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-5 leading-tight">
            Build the Life You<br />
            <span className="bg-gradient-to-r from-violet-600 via-teal-500 to-amber-500 bg-clip-text text-transparent">Really Want</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Practical tools to help you discover your purpose, set meaningful goals, and become the best version of yourself.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            {highlights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2"
              >
                <div className={`p-1.5 rounded-lg bg-gray-100 ${item.color}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-gray-700">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {growthTools.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="group"
            >
              <Link href={tool.link}>
                <div 
                  className={`relative h-full bg-gradient-to-br ${tool.bgGradient} rounded-3xl p-8 cursor-pointer transition-all duration-500 hover:shadow-2xl ${tool.shadowColor} border border-white/50 overflow-hidden`}
                  data-testid={`card-growth-${tool.id}`}
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-5`} />
                  </div>
                  
                  {/* Floating icon background */}
                  <div className="absolute -right-8 -top-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    <tool.icon className="h-48 w-48" />
                  </div>
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-6 shadow-lg ${tool.shadowColor}`}
                    >
                      <tool.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    
                    {/* Content */}
                    <div className="mb-6">
                      <span className={`text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent`}>
                        {tool.subtitle}
                      </span>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{tool.title}</h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {tool.description}
                    </p>
                    
                    {/* Stats badge */}
                    <div className="flex items-center gap-2 mb-6 text-xs text-gray-500">
                      <div className="flex -space-x-1">
                        {[1,2,3].map((n) => (
                          <div key={n} className={`w-5 h-5 rounded-full bg-gradient-to-br ${tool.gradient} border-2 border-white`} />
                        ))}
                      </div>
                      <span>{tool.stats}</span>
                    </div>
                    
                    {/* CTA */}
                    <div 
                      className={`flex items-center gap-2 font-semibold text-sm bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}
                    >
                      Start Now <ArrowRight className={`h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors`} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 text-sm mb-6">
            Free to explore. Your progress saves when you create an account.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/vision">
              <Button 
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white px-8 py-6 rounded-2xl shadow-lg shadow-teal-500/25 font-semibold"
                data-testid="button-discover-vision"
              >
                <Compass className="h-5 w-5 mr-2" />
                Discover Your Vision
              </Button>
            </Link>
            <Link href="/goals">
              <Button 
                variant="outline"
                className="border-2 border-amber-400 text-amber-600 hover:bg-amber-50 px-8 py-6 rounded-2xl font-semibold"
                data-testid="button-set-goals"
              >
                <Target className="h-5 w-5 mr-2" />
                Set Your 2026 Goals
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
