import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ChevronDown, ChevronUp, Lightbulb, Target, Heart, BookOpen, X, Loader2 } from "lucide-react";

interface AICoachPanelProps {
  sessionId: string | number;
  tool: "wheel" | "values" | "goals" | "plan" | "habits" | "checkin" | "wdep" | "strengths" | "styles" | "eq" | "sca";
  data: Record<string, any>;
  title?: string;
  description?: string;
}

interface AIResponse {
  insights: string[];
  recommendations: string[];
  encouragement: string;
  patterns?: string[];
  nextSteps?: string[];
  scriptures?: { reference: string; text: string; application: string }[];
}

export function AICoachPanel({ sessionId, tool, data, title, description }: AICoachPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("insights");

  const analyze = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/vision/sessions/${sessionId}/ai/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tool, data }),
      });
      if (!res.ok) throw new Error("Failed to get AI insights");
      const json = await res.json();
      return json.data as AIResponse;
    },
    onSuccess: (data) => {
      setResponse(data);
      setIsOpen(true);
    },
  });

  const handleAsk = () => {
    if (response) {
      setIsOpen(true);
    } else {
      analyze.mutate();
    }
  };

  const sections = response ? [
    { key: "insights", title: "Key Insights", icon: Lightbulb, items: response.insights, color: "#7C9A8E" },
    { key: "recommendations", title: "Recommendations", icon: Target, items: response.recommendations, color: "#4A7C7C" },
    ...(response.patterns?.length ? [{ key: "patterns", title: "Patterns Noticed", icon: Heart, items: response.patterns, color: "#D4A574" }] : []),
    ...(response.nextSteps?.length ? [{ key: "nextSteps", title: "Next Steps", icon: Target, items: response.nextSteps, color: "#5B8C5A" }] : []),
  ] : [];

  return (
    <div className="relative">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleAsk}
          disabled={analyze.isPending}
          className="bg-gradient-to-r from-[#7C9A8E] to-[#4A7C7C] hover:from-[#6B8B7E] hover:to-[#3A6C6C] text-white rounded-xl shadow-md gap-2"
          data-testid="button-ai-coach"
        >
          {analyze.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {analyze.isPending ? "Analyzing..." : response ? "View AI Insights" : "Ask AI Coach"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && response && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#FAF8F5] rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#7C9A8E] to-[#4A7C7C] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{title || "AI Coach Insights"}</h3>
                    <p className="text-white/80 text-sm">{description || "Personalized guidance for your journey"}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)]">
                <Card className="mb-4 border-[#D4A574]/30 bg-gradient-to-br from-[#D4A574]/10 to-[#C17767]/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#D4A574]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Heart className="w-4 h-4 text-[#C17767]" />
                      </div>
                      <p className="text-[#2C3E2D] text-sm leading-relaxed italic">
                        "{response.encouragement}"
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  {sections.map((section) => (
                    <Card key={section.key} className="border-[#E8E4DE] overflow-hidden">
                      <button
                        onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                        className="w-full flex items-center justify-between p-3 bg-[#FDFCFA] hover:bg-[#F5F3F0] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${section.color}20` }}
                          >
                            <section.icon className="w-4 h-4" style={{ color: section.color }} />
                          </div>
                          <span className="font-semibold text-[#2C3E2D] text-sm">{section.title}</span>
                          <span className="text-xs text-[#8B9B8E] bg-[#E8E4DE] px-2 py-0.5 rounded-full">
                            {section.items.length}
                          </span>
                        </div>
                        {expandedSection === section.key ? (
                          <ChevronUp className="w-4 h-4 text-[#6B7B6E]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#6B7B6E]" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedSection === section.key && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CardContent className="pt-0 pb-3 px-3">
                              <ul className="space-y-2">
                                {section.items.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-[#4A5A4E]">
                                    <span className="text-[#7C9A8E] mt-1">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  ))}

                  {response.scriptures && response.scriptures.length > 0 && (
                    <Card className="border-[#9B8AA6]/30 bg-gradient-to-br from-[#9B8AA6]/5 to-[#9B8AA6]/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-[#9B8AA6]">
                          <BookOpen className="w-4 h-4" />
                          Scripture Guidance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {response.scriptures.map((scripture, i) => (
                          <div key={i} className="bg-white rounded-lg p-3 border border-[#9B8AA6]/20">
                            <p className="text-xs font-semibold text-[#9B8AA6] mb-1">{scripture.reference}</p>
                            <p className="text-sm text-[#4A5A4E] italic mb-2">"{scripture.text}"</p>
                            <p className="text-xs text-[#6B7B6E]">{scripture.application}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-[#E8E4DE] bg-[#FDFCFA]">
                <Button
                  onClick={() => analyze.mutate()}
                  disabled={analyze.isPending}
                  variant="outline"
                  className="w-full border-[#7C9A8E] text-[#7C9A8E] hover:bg-[#7C9A8E]/10"
                >
                  {analyze.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Get Fresh Insights
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function IntroGuide({ 
  title, 
  description, 
  benefits, 
  howToUse 
}: { 
  title: string; 
  description: string; 
  benefits: string[]; 
  howToUse: string[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-6 border-[#E8E4DE] bg-gradient-to-br from-[#FDFCFA] to-[#F5F3F0] rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C9A8E]/15 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-[#7C9A8E]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2C3E2D]">About {title}</h3>
            <p className="text-sm text-[#6B7B6E]">Tap to learn more</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#6B7B6E]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#6B7B6E]" />
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 pb-4 px-4 space-y-4">
              <p className="text-sm text-[#4A5A4E] leading-relaxed">{description}</p>
              
              <div>
                <h4 className="text-sm font-semibold text-[#2C3E2D] mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#C17767]" /> Benefits
                </h4>
                <ul className="space-y-1">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="text-sm text-[#4A5A4E] flex items-start gap-2">
                      <span className="text-[#5B8C5A]">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-[#2C3E2D] mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#4A7C7C]" /> How to Use
                </h4>
                <ol className="space-y-1">
                  {howToUse.map((step, i) => (
                    <li key={i} className="text-sm text-[#4A5A4E] flex items-start gap-2">
                      <span className="text-[#7C9A8E] font-semibold">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
