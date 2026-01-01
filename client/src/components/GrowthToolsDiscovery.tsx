import { motion } from "framer-motion";
import { Link } from "wouter";
import { Compass, Target, TrendingUp, ArrowRight, Sparkles } from "lucide-react";

const tools = [
  {
    id: "vision",
    title: "Vision Pathway",
    desc: "Discover your purpose",
    icon: Compass,
    color: "#4A7C7C",
    link: "/vision",
  },
  {
    id: "goals",
    title: "2026 Goals",
    desc: "Set & track goals",
    icon: Target,
    color: "#D4A574",
    link: "/goals",
  },
  {
    id: "growth",
    title: "Growth Tools",
    desc: "Personal development",
    icon: TrendingUp,
    color: "#7C9A8E",
    link: "/growth",
  },
];

interface GrowthToolsDiscoveryProps {
  variant?: "compact" | "full";
  title?: string;
}

export function GrowthToolsDiscovery({ 
  variant = "compact",
  title = "Personal Growth Tools"
}: GrowthToolsDiscoveryProps) {
  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-[#FAF8F5] to-white rounded-2xl p-5 border border-gray-100"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-[#4A7C7C]" />
          <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {tools.map((tool) => (
            <Link key={tool.id} href={tool.link}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-xl p-3 text-center cursor-pointer border border-gray-100 hover:border-transparent hover:shadow-md transition-all"
                data-testid={`discovery-${tool.id}`}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ backgroundColor: `${tool.color}15` }}
                >
                  <tool.icon className="h-5 w-5" style={{ color: tool.color }} />
                </div>
                <p className="text-xs font-bold text-gray-900 truncate">{tool.title}</p>
                <p className="text-[10px] text-gray-500 truncate">{tool.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
        
        <p className="text-[10px] text-center text-gray-400 mt-3 italic">
          "Write the vision and make it plain" — Habakkuk 2:2
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#4A7C7C]/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-[#4A7C7C]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">Faith-based development tools</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {tools.map((tool, i) => (
          <Link key={tool.id} href={tool.link}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ x: 4 }}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-transparent hover:shadow-md transition-all cursor-pointer group"
              style={{ backgroundColor: `${tool.color}05` }}
              data-testid={`discovery-full-${tool.id}`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${tool.color}15` }}
                >
                  <tool.icon className="h-6 w-6" style={{ color: tool.color }} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{tool.title}</p>
                  <p className="text-sm text-gray-500">{tool.desc}</p>
                </div>
              </div>
              <ArrowRight 
                className="h-5 w-5 text-gray-300 group-hover:translate-x-1 transition-all"
                style={{ color: tool.color }}
              />
            </motion.div>
          </Link>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-center text-gray-500 italic">
          "Add to your faith goodness; and to goodness, knowledge" — 2 Peter 1:5
        </p>
      </div>
    </motion.div>
  );
}
