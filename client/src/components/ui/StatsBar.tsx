import { motion } from "framer-motion";

interface Stat {
  value: string;
  subtitle: string;
  label: string;
}

interface StatsBarProps {
  variant?: "light" | "dark";
  className?: string;
}

const stats: Stat[] = [
  { value: "10k+", subtitle: "disciples by 2030", label: "Our Vision" },
  { value: "50+", subtitle: "nations reached", label: "Our Goal" },
  { value: "365", subtitle: "sparks per year", label: "Daily" },
  { value: "12+", subtitle: "mission projects", label: "Launching" },
];

export function StatsBar({ variant = "light", className = "" }: StatsBarProps) {
  const isLight = variant === "light";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isLight 
        ? "bg-white/95 backdrop-blur-sm border-gray-100 shadow-md" 
        : "bg-[#243656] border-[#4A7C7C]/30 shadow-xl"
      } rounded-xl px-3 py-3 md:px-6 md:py-4 grid grid-cols-4 gap-1 md:gap-4 border ${className}`}
      data-testid="stats-bar"
    >
      {stats.map((stat, i) => (
        <div key={i} className="text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
          <div className={`text-lg md:text-2xl font-bold font-display ${isLight ? "text-gray-900" : "text-white"}`}>
            {stat.value}
          </div>
          <div className={`text-[9px] md:text-xs leading-tight ${isLight ? "text-gray-600" : "text-[#E8E4DE]"}`}>
            {stat.subtitle}
          </div>
          <div className={`text-[8px] md:text-[10px] uppercase tracking-wide font-semibold mt-0.5 ${isLight ? "text-gray-400" : "text-[#7C9A8E]"}`}>
            {stat.label}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
