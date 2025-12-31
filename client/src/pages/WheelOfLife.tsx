import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, Target, Sparkles, CircleDot } from "lucide-react";

const WHEEL_CATEGORIES = [
  { key: "health_energy", label: "Health & Energy", emoji: "💪", color: "#5B8C5A" },
  { key: "relationships", label: "Relationships", emoji: "❤️", color: "#C17767" },
  { key: "career_study", label: "Career / Study", emoji: "💼", color: "#4A7C7C" },
  { key: "finances", label: "Finances", emoji: "💰", color: "#B8976E" },
  { key: "personal_growth", label: "Personal Growth", emoji: "🌱", color: "#7C9A8E" },
  { key: "fun_recreation", label: "Fun & Recreation", emoji: "🎉", color: "#D4A574" },
  { key: "physical_environment", label: "Physical Environment", emoji: "🏠", color: "#6B8E8E" },
  { key: "spirituality", label: "Spirituality / Purpose", emoji: "✨", color: "#9B8AA6" },
];

export function WheelOfLife() {
  const { sessionId } = useParams();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [step, setStep] = useState<"assess" | "focus">("assess");

  const { data: wheelData, isLoading } = useQuery({
    queryKey: [`/api/vision/sessions/${sessionId}/wheel`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/sessions/${sessionId}/wheel`, { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  useEffect(() => {
    if (wheelData?.categories) {
      const scoreMap: Record<string, number> = {};
      const noteMap: Record<string, string> = {};
      wheelData.categories.forEach((c: any) => {
        scoreMap[c.categoryKey] = c.score;
        noteMap[c.categoryKey] = c.notes || "";
      });
      setScores(scoreMap);
      setNotes(noteMap);
    }
    if (wheelData?.focusAreas) {
      setSelectedFocus(wheelData.focusAreas);
    }
  }, [wheelData]);

  const saveWheel = useMutation({
    mutationFn: async () => {
      const categories = WHEEL_CATEGORIES.map((cat) => ({
        categoryKey: cat.key,
        score: scores[cat.key] || 5,
        notes: notes[cat.key] || null,
      }));
      const res = await fetch(`/api/vision/sessions/${sessionId}/wheel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ categories, focusAreas: selectedFocus }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vision/sessions/${sessionId}/wheel`] });
      navigate(`/vision/${sessionId}/values`);
    },
  });

  const allScored = WHEEL_CATEGORIES.every((cat) => scores[cat.key] !== undefined);
  const sortedByScore = [...WHEEL_CATEGORIES].sort((a, b) => (scores[a.key] || 5) - (scores[b.key] || 5));
  const lowestTwo = sortedByScore.slice(0, 2).map((c) => c.key);

  const toggleFocus = (key: string) => {
    if (selectedFocus.includes(key)) {
      setSelectedFocus(selectedFocus.filter((k) => k !== key));
    } else if (selectedFocus.length < 3) {
      setSelectedFocus([...selectedFocus, key]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-[#E8E4DE] border-t-[#7C9A8E]"
        />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF8F5] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/vision`)} 
            className="mb-4 text-[#5A5A5A] hover:bg-[#E8E4DE] hover:text-[#3A3A3A]" 
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-[#7C9A8E] text-white px-4 py-2 rounded-full mb-4">
              <CircleDot className="w-4 h-4" />
              <span className="text-sm font-medium">Stage 1: Reflect</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3 text-[#2C3E2D]">
              Wheel of Life
            </h1>
            <p className="text-[#6B7B6E] max-w-lg mx-auto">
              Rate your satisfaction in each area from 1 (needs attention) to 10 (thriving)
            </p>
          </motion.div>

          {step === "assess" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid gap-4">
                {WHEEL_CATEGORIES.map((cat, i) => (
                  <motion.div
                    key={cat.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border border-[#E8E4DE] shadow-sm bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2 bg-[#FDFCFA]">
                        <CardTitle className="text-lg flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${cat.color}15` }}
                          >
                            {cat.emoji}
                          </div>
                          <div className="flex-1">
                            <span className="text-[#2C3E2D] font-semibold">{cat.label}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div 
                                className="h-2 rounded-full flex-1 bg-[#E8E4DE]"
                                style={{ maxWidth: "120px" }}
                              >
                                <div 
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${(scores[cat.key] || 5) * 10}%`,
                                    backgroundColor: cat.color 
                                  }}
                                />
                              </div>
                              <span 
                                className="text-lg font-bold w-8 text-center"
                                style={{ color: cat.color }}
                              >
                                {scores[cat.key] || 5}
                              </span>
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-5 pt-3">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-xs text-[#8B9B8E] font-medium w-4">1</span>
                          <Slider
                            value={[scores[cat.key] || 5]}
                            onValueChange={([val]) => setScores({ ...scores, [cat.key]: val })}
                            min={1}
                            max={10}
                            step={1}
                            className="flex-1"
                            data-testid={`slider-${cat.key}`}
                          />
                          <span className="text-xs text-[#8B9B8E] font-medium w-6">10</span>
                        </div>
                        <Textarea
                          placeholder="Reflect on this area... What's going well? What needs attention?"
                          value={notes[cat.key] || ""}
                          onChange={(e) => setNotes({ ...notes, [cat.key]: e.target.value })}
                          className="text-sm border-[#E8E4DE] focus:border-[#7C9A8E] focus:ring-[#7C9A8E]/20 rounded-xl bg-[#FDFCFA] placeholder:text-[#B0BAB3]"
                          rows={2}
                          data-testid={`notes-${cat.key}`}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-10"
              >
                <Card className="border border-[#E8E4DE] shadow-sm bg-white rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-[#2C3E2D] mb-4 text-center">Your Life Balance</h3>
                  <div className="flex justify-center">
                    <RadarChart scores={scores} categories={WHEEL_CATEGORIES} />
                  </div>
                </Card>
              </motion.div>

              <div className="flex justify-end mt-10">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={() => setStep("focus")} 
                    disabled={!allScored} 
                    className="bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white shadow-sm rounded-xl px-6"
                    data-testid="button-next-focus"
                  >
                    Select Focus Areas <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {step === "focus" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="mb-8 border border-[#E8E4DE] shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="bg-[#FDFCFA] border-b border-[#E8E4DE]">
                  <CardTitle className="text-xl text-[#2C3E2D]">
                    Choose Your Focus Areas
                  </CardTitle>
                  <p className="text-[#6B7B6E] mt-1">
                    Select up to 3 areas to prioritize this season. 
                    <span className="text-[#C17767] font-medium"> Your lowest-scoring areas are highlighted.</span>
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-3">
                    {WHEEL_CATEGORIES.map((cat) => {
                      const isLow = lowestTwo.includes(cat.key);
                      const isSelected = selectedFocus.includes(cat.key);
                      return (
                        <motion.button
                          key={cat.key}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => toggleFocus(cat.key)}
                          className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                            isSelected
                              ? "border-[#7C9A8E] bg-[#7C9A8E]/10"
                              : isLow
                                ? "border-[#C17767]/50 bg-[#C17767]/5"
                                : "border-[#E8E4DE] bg-white hover:border-[#7C9A8E]/50"
                          }`}
                          data-testid={`focus-${cat.key}`}
                        >
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            style={{ backgroundColor: isSelected ? `${cat.color}20` : `${cat.color}10` }}
                          >
                            {isSelected ? (
                              <Check className="w-6 h-6" style={{ color: cat.color }} />
                            ) : (
                              cat.emoji
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-[#2C3E2D]">{cat.label}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm font-medium" style={{ color: cat.color }}>
                                Score: {scores[cat.key] || 5}/10
                              </span>
                              {isLow && !isSelected && (
                                <span className="text-xs text-[#C17767] font-medium bg-[#C17767]/10 px-2 py-0.5 rounded-full">
                                  Needs attention
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="text-center mt-6 py-3 bg-[#FDFCFA] rounded-xl border border-[#E8E4DE]">
                    <span className="text-[#6B7B6E]">Selected: </span>
                    <span className="font-bold text-[#7C9A8E]">{selectedFocus.length}/3</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep("assess")}
                  className="text-[#5A5A5A] hover:bg-[#E8E4DE]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => saveWheel.mutate()}
                    disabled={selectedFocus.length === 0 || saveWheel.isPending}
                    className="bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white shadow-sm rounded-xl px-6"
                    data-testid="button-save-wheel"
                  >
                    {saveWheel.isPending ? "Saving..." : "Continue to Values"} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function RadarChart({ scores, categories }: { scores: Record<string, number>; categories: typeof WHEEL_CATEGORIES }) {
  const centerX = 150;
  const centerY = 150;
  const maxRadius = 110;
  const numPoints = categories.length;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
    const radius = (value / 10) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const gridLevels = [2, 4, 6, 8, 10];
  const dataPoints = categories.map((cat, i) => getPoint(i, scores[cat.key] || 5));
  const pathD = dataPoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ") + " Z";

  return (
    <svg width="300" height="300" viewBox="0 0 300 300">
      <defs>
        <linearGradient id="sageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C9A8E" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4A7C7C" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      
      {gridLevels.map((level) => {
        const points = categories.map((_, i) => getPoint(i, level));
        const d = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ") + " Z";
        return <path key={level} d={d} fill="none" stroke="#E8E4DE" strokeWidth="1" />;
      })}

      {categories.map((cat, i) => {
        const outerPoint = getPoint(i, 10);
        const labelPoint = getPoint(i, 12.5);
        return (
          <g key={cat.key}>
            <line x1={centerX} y1={centerY} x2={outerPoint.x} y2={outerPoint.y} stroke="#E8E4DE" strokeWidth="1" />
            <text
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[9px] fill-[#6B7B6E] font-medium"
            >
              {cat.emoji}
            </text>
          </g>
        );
      })}

      <motion.path
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        d={pathD}
        fill="url(#sageGradient)"
        stroke="#7C9A8E"
        strokeWidth="2"
      />

      {dataPoints.map((point, i) => (
        <motion.circle
          key={categories[i].key}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05 }}
          cx={point.x}
          cy={point.y}
          r="6"
          fill={categories[i].color}
          stroke="white"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

export default WheelOfLife;
