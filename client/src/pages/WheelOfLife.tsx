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
import { ArrowLeft, ArrowRight, Check, Target, Sparkles } from "lucide-react";

const WHEEL_CATEGORIES = [
  { key: "health_energy", label: "Health & Energy", color: "#22c55e", gradient: "from-green-400 to-emerald-500" },
  { key: "relationships", label: "Relationships", color: "#ef4444", gradient: "from-red-400 to-rose-500" },
  { key: "career_study", label: "Career / Study", color: "#3b82f6", gradient: "from-blue-400 to-indigo-500" },
  { key: "finances", label: "Finances", color: "#eab308", gradient: "from-yellow-400 to-amber-500" },
  { key: "personal_growth", label: "Personal Growth", color: "#8b5cf6", gradient: "from-violet-400 to-purple-500" },
  { key: "fun_recreation", label: "Fun & Recreation", color: "#f97316", gradient: "from-orange-400 to-red-500" },
  { key: "physical_environment", label: "Physical Environment", color: "#14b8a6", gradient: "from-teal-400 to-cyan-500" },
  { key: "spirituality", label: "Spirituality / Purpose", color: "#ec4899", gradient: "from-pink-400 to-rose-500" },
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600"
        />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-300/20 to-purple-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-fuchsia-300/20 to-violet-300/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/vision`)} 
            className="mb-4 hover:bg-violet-100" 
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
              <Target className="w-4 h-4" />
              <span className="text-sm font-semibold">Stage 1: Reflect</span>
            </div>
            <h1 className="text-4xl font-display font-bold mb-3">
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Wheel of Life
              </span>
            </h1>
            <p className="text-slate-600 max-w-lg mx-auto">
              Rate your satisfaction in each area from 1 (low) to 10 (thriving)
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
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden hover:shadow-xl transition-shadow">
                      <div className={`h-1.5 bg-gradient-to-r ${cat.gradient}`} />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-md`}>
                            <span className="text-white font-bold text-sm">{scores[cat.key] || 5}</span>
                          </div>
                          <span className="text-slate-800">{cat.label}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-5">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-sm text-slate-400 font-medium w-4">1</span>
                          <Slider
                            value={[scores[cat.key] || 5]}
                            onValueChange={([val]) => setScores({ ...scores, [cat.key]: val })}
                            min={1}
                            max={10}
                            step={1}
                            className="flex-1"
                            data-testid={`slider-${cat.key}`}
                          />
                          <span className="text-sm text-slate-400 font-medium w-6">10</span>
                        </div>
                        <Textarea
                          placeholder="Optional notes..."
                          value={notes[cat.key] || ""}
                          onChange={(e) => setNotes({ ...notes, [cat.key]: e.target.value })}
                          className="text-sm border-slate-200 focus:border-violet-400 focus:ring-violet-100 rounded-xl"
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
                className="mt-10 text-center"
              >
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Your Life Balance</h3>
                <RadarChart scores={scores} categories={WHEEL_CATEGORIES} />
              </motion.div>

              <div className="flex justify-end mt-10">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={() => setStep("focus")} 
                    disabled={!allScored} 
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg rounded-xl px-6"
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
              <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
                <CardHeader>
                  <CardTitle className="text-xl">
                    <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      Choose Your Focus Areas
                    </span>
                  </CardTitle>
                  <p className="text-slate-500 mt-1">
                    Select up to 3 areas to prioritize this season. 
                    <span className="text-amber-600 font-medium"> Your lowest-scoring areas are highlighted.</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {WHEEL_CATEGORIES.map((cat) => {
                      const isLow = lowestTwo.includes(cat.key);
                      const isSelected = selectedFocus.includes(cat.key);
                      return (
                        <motion.button
                          key={cat.key}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleFocus(cat.key)}
                          className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                            isSelected
                              ? "border-violet-400 bg-gradient-to-br from-violet-50 to-purple-50 shadow-md"
                              : isLow
                                ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50"
                                : "border-slate-200 bg-white hover:border-violet-300"
                          }`}
                          data-testid={`focus-${cat.key}`}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-md`}>
                            {isSelected ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <span className="text-white font-bold text-sm">{scores[cat.key] || 5}</span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">{cat.label}</span>
                            {isLow && !isSelected && (
                              <span className="block text-xs text-amber-600 font-medium">Needs attention</span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="text-center text-sm text-slate-500 mt-6">
                    Selected: <span className="font-semibold text-violet-600">{selectedFocus.length}/3</span>
                  </p>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep("assess")}
                  className="hover:bg-violet-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => saveWheel.mutate()}
                    disabled={selectedFocus.length === 0 || saveWheel.isPending}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg rounded-xl px-6"
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
  const maxRadius = 120;
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
    <div className="inline-block p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl">
      <svg width="300" height="300" viewBox="0 0 300 300">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d946ef" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        
        {gridLevels.map((level) => {
          const points = categories.map((_, i) => getPoint(i, level));
          const d = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ") + " Z";
          return <path key={level} d={d} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
        })}

        {categories.map((cat, i) => {
          const outerPoint = getPoint(i, 10);
          const labelPoint = getPoint(i, 12);
          return (
            <g key={cat.key}>
              <line x1={centerX} y1={centerY} x2={outerPoint.x} y2={outerPoint.y} stroke="#e2e8f0" strokeWidth="1" />
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] fill-slate-500 font-medium"
              >
                {cat.label.split(" ")[0]}
              </text>
            </g>
          );
        })}

        <motion.path
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          d={pathD}
          fill="url(#chartGradient)"
          stroke="url(#chartGradient)"
          strokeWidth="3"
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
            className="drop-shadow-md"
          />
        ))}
      </svg>
    </div>
  );
}

export default WheelOfLife;
