import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { ArrowRight, Lightbulb, Sparkles, Zap, Target, Heart } from "lucide-react";

interface ToolLinkProps {
  tool: "wdep" | "sca" | "strengths" | "styles" | "eq";
  context: "goal-stuck" | "obstacle" | "motivation" | "discover" | "streak-break";
  className?: string;
}

const TOOL_CONFIG = {
  wdep: {
    name: "WDEP Reality Check",
    description: "Work through what you want, what you're doing, and create a new plan",
    icon: Target,
    color: "#4A7C7C",
    bgColor: "#4A7C7C/10",
  },
  sca: {
    name: "Motivation Booster",
    description: "Rediscover why this matters to you and reignite your drive",
    icon: Zap,
    color: "#D4A574",
    bgColor: "#D4A574/10",
  },
  strengths: {
    name: "Strengths Discovery",
    description: "Identify your Top 5 character strengths",
    icon: Sparkles,
    color: "#7C9A8E",
    bgColor: "#7C9A8E/10",
  },
  styles: {
    name: "4 Styles Assessment",
    description: "Discover your communication style",
    icon: Heart,
    color: "#C17767",
    bgColor: "#C17767/10",
  },
  eq: {
    name: "EQ Micro-Skills",
    description: "Build emotional intelligence practices",
    icon: Lightbulb,
    color: "#5B8C5A",
    bgColor: "#5B8C5A/10",
  },
};

const CONTEXT_MESSAGES = {
  "goal-stuck": {
    headline: "Feeling stuck on this goal?",
    cta: "Try the WDEP Reality Check",
  },
  "obstacle": {
    headline: "Facing obstacles?",
    cta: "Use WDEP to work through them",
  },
  "motivation": {
    headline: "Need a motivation boost?",
    cta: "Reconnect with your why",
  },
  "discover": {
    headline: "Want to learn more about yourself?",
    cta: "Explore this tool",
  },
  "streak-break": {
    headline: "Lost your streak?",
    cta: "Boost your motivation",
  },
};

export function ToolLink({ tool, context, className = "" }: ToolLinkProps) {
  const [, navigate] = useLocation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const config = TOOL_CONFIG[tool];
  const message = CONTEXT_MESSAGES[context];
  const Icon = config.icon;

  const handleClick = () => {
    if (sessionId) {
      navigate(`/vision/${sessionId}/tools/${tool}`);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${className}`}
      style={{ 
        backgroundColor: `${config.color}08`,
        borderColor: `${config.color}30`,
      }}
      whileHover={{ scale: 1.01, borderColor: config.color }}
      whileTap={{ scale: 0.99 }}
      data-testid={`tool-link-${tool}`}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#6B7B6E] mb-0.5">{message.headline}</p>
          <p className="font-medium text-[#2C3E2D] flex items-center gap-2">
            {message.cta}
            <ArrowRight className="w-4 h-4" style={{ color: config.color }} />
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export function ToolLinkCompact({ tool, label, sessionId }: { tool: string; label: string; sessionId: string }) {
  const [, navigate] = useLocation();
  
  return (
    <button
      onClick={() => navigate(`/vision/${sessionId}/tools/${tool}`)}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4A7C7C] hover:text-[#2C3E2D] transition-colors"
      data-testid={`tool-link-compact-${tool}`}
    >
      <Lightbulb className="w-4 h-4" />
      {label}
      <ArrowRight className="w-3 h-3" />
    </button>
  );
}