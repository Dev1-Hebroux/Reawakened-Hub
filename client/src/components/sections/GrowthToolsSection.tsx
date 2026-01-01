import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Target, Compass, Sparkles, TrendingUp, 
  ArrowRight, BookOpen, Heart, Lightbulb,
  Calendar, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

const growthTools = [
  {
    id: "vision",
    title: "Life Vision Pathway",
    subtitle: "Discover Your Purpose",
    description: "Map your life across 8 dimensions, clarify your values, and craft a God-given vision for your future.",
    scripture: "Habakkuk 2:2",
    scriptureText: "Write the vision and make it plain",
    icon: Compass,
    color: "#4A7C7C",
    link: "/vision",
    features: ["Wheel of Life Assessment", "Core Values Discovery", "Vision Statement Builder"],
  },
  {
    id: "goals",
    title: "Goals & Resolutions",
    subtitle: "2026 Goal Setting",
    description: "Set SMART goals with biblical wisdom. Track habits, celebrate milestones, and build momentum.",
    scripture: "Proverbs 16:3",
    scriptureText: "Commit your plans to the Lord",
    icon: Target,
    color: "#D4A574",
    link: "/goals",
    features: ["SMART Goal Framework", "Daily Habit Tracking", "Progress Milestones"],
  },
  {
    id: "growth",
    title: "Growth Tracks",
    subtitle: "Personal Development",
    description: "Discover your strengths, understand your style, and grow your emotional intelligence with proven tools.",
    scripture: "2 Peter 1:5-8",
    scriptureText: "Add to your faith... knowledge",
    icon: TrendingUp,
    color: "#7C9A8E",
    link: "/growth",
    features: ["Strengths Discovery", "Communication Styles", "EQ Development"],
  },
];

const biblicalPrinciples = [
  { icon: BookOpen, text: "Rooted in Scripture" },
  { icon: Heart, text: "Spirit-Led Growth" },
  { icon: Lightbulb, text: "Wisdom Applied" },
  { icon: Calendar, text: "Daily Practice" },
];

export function GrowthToolsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#FAF8F5] to-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4A7C7C] via-[#D4A574] to-[#7C9A8E]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#4A7C7C]/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4 text-[#4A7C7C]" />
            <span className="text-sm font-bold text-[#4A7C7C]">Personal Growth Tools</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Build Your Life with Purpose
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Faith-based tools to help you discover your vision, set meaningful goals, and grow into who God created you to be.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {biblicalPrinciples.map((principle, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
              >
                <principle.icon className="h-4 w-4 text-[#4A7C7C]" />
                <span className="text-sm font-medium text-gray-700">{principle.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {growthTools.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group"
            >
              <Link href={tool.link}>
                <div 
                  className="relative h-full bg-white rounded-2xl border-2 border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:border-transparent hover:shadow-xl"
                  style={{ 
                    '--hover-color': tool.color,
                  } as React.CSSProperties}
                  data-testid={`card-growth-${tool.id}`}
                >
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${tool.color}08, ${tool.color}15)`,
                    }}
                  />
                  
                  <div className="relative z-10">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${tool.color}15` }}
                    >
                      <tool.icon className="h-7 w-7" style={{ color: tool.color }} />
                    </div>
                    
                    <div className="mb-4">
                      <span 
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: tool.color }}
                      >
                        {tool.subtitle}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mt-1">{tool.title}</h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {tool.description}
                    </p>
                    
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <p className="text-xs text-gray-500 italic">
                        "{tool.scriptureText}"
                      </p>
                      <p className="text-xs font-medium text-gray-700 mt-1">— {tool.scripture}</p>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {tool.features.map((feature, fi) => (
                        <div key={fi} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div 
                      className="flex items-center gap-2 font-medium text-sm group-hover:gap-3 transition-all"
                      style={{ color: tool.color }}
                    >
                      Get Started <ArrowRight className="h-4 w-4" />
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
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm mb-4">
            No sign-up required to explore. Your progress saves when you create an account.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/vision">
              <Button 
                className="bg-[#4A7C7C] hover:bg-[#3d6666] text-white px-8 py-6 rounded-xl shadow-lg"
                data-testid="button-discover-vision"
              >
                <Compass className="h-5 w-5 mr-2" />
                Discover Your Vision
              </Button>
            </Link>
            <Link href="/goals">
              <Button 
                variant="outline"
                className="border-2 border-[#D4A574] text-[#D4A574] hover:bg-[#D4A574] hover:text-white px-8 py-6 rounded-xl"
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
