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
import { ArrowLeft, ArrowRight, Check, Target } from "lucide-react";

const WHEEL_CATEGORIES = [
  { key: "health_energy", label: "Health & Energy", color: "#22c55e" },
  { key: "relationships", label: "Relationships", color: "#ef4444" },
  { key: "career_study", label: "Career / Study", color: "#3b82f6" },
  { key: "finances", label: "Finances", color: "#eab308" },
  { key: "personal_growth", label: "Personal Growth", color: "#8b5cf6" },
  { key: "fun_recreation", label: "Fun & Recreation", color: "#f97316" },
  { key: "physical_environment", label: "Physical Environment", color: "#14b8a6" },
  { key: "spirituality", label: "Spirituality / Purpose", color: "#ec4899" },
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-[hsl(var(--color-paper))] to-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(`/vision`)} className="mb-4" data-testid="button-back-dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-primary mb-2">Wheel of Life</h1>
            <p className="text-muted-foreground">
              Rate your satisfaction in each area from 1 (low) to 10 (thriving)
            </p>
          </div>

          {step === "assess" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid gap-6">
                {WHEEL_CATEGORIES.map((cat) => (
                  <Card key={cat.key} className="overflow-hidden">
                    <div className="h-1" style={{ backgroundColor: cat.color }} />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-sm text-muted-foreground w-8">1</span>
                        <Slider
                          value={[scores[cat.key] || 5]}
                          onValueChange={([val]) => setScores({ ...scores, [cat.key]: val })}
                          min={1}
                          max={10}
                          step={1}
                          className="flex-1"
                          data-testid={`slider-${cat.key}`}
                        />
                        <span className="text-2xl font-bold w-10 text-right" style={{ color: cat.color }}>
                          {scores[cat.key] || 5}
                        </span>
                      </div>
                      <Textarea
                        placeholder="Optional notes..."
                        value={notes[cat.key] || ""}
                        onChange={(e) => setNotes({ ...notes, [cat.key]: e.target.value })}
                        className="text-sm"
                        rows={2}
                        data-testid={`notes-${cat.key}`}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 text-center">
                <RadarChart scores={scores} categories={WHEEL_CATEGORIES} />
              </div>

              <div className="flex justify-end mt-8">
                <Button onClick={() => setStep("focus")} disabled={!allScored} data-testid="button-next-focus">
                  Select Focus Areas <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "focus" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Choose Your Focus Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Select up to 3 areas to focus on this season. Your lowest-scored areas are highlighted.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {WHEEL_CATEGORIES.map((cat) => {
                      const isLow = lowestTwo.includes(cat.key);
                      const isSelected = selectedFocus.includes(cat.key);
                      return (
                        <button
                          key={cat.key}
                          onClick={() => toggleFocus(cat.key)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected ? "border-primary bg-primary/10" : isLow ? "border-red-300 bg-red-50" : "border-border hover:border-primary/30"
                          }`}
                          data-testid={`focus-${cat.key}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                            {isSelected && <Check className="w-4 h-4 text-primary" />}
                          </div>
                          <span className="text-sm font-medium">{cat.label}</span>
                          <div className="text-lg font-bold mt-1" style={{ color: cat.color }}>
                            {scores[cat.key] || 5}/10
                          </div>
                          {isLow && <span className="text-xs text-red-500">Needs attention</span>}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep("assess")}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={() => saveWheel.mutate()}
                  disabled={selectedFocus.length === 0 || saveWheel.isPending}
                  data-testid="button-save-wheel"
                >
                  {saveWheel.isPending ? "Saving..." : "Save & Continue"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
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
  const size = 300;
  const center = size / 2;
  const radius = size / 2 - 30;
  const angleStep = (2 * Math.PI) / categories.length;

  const points = categories.map((cat, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const value = (scores[cat.key] || 5) / 10;
    const x = center + radius * value * Math.cos(angle);
    const y = center + radius * value * Math.sin(angle);
    return { x, y, cat };
  });

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} className="mx-auto" data-testid="radar-chart">
      {[2, 4, 6, 8, 10].map((level) => {
        const r = (radius * level) / 10;
        return (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}
      {categories.map((cat, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        const labelX = center + (radius + 20) * Math.cos(angle);
        const labelY = center + (radius + 20) * Math.sin(angle);
        return (
          <g key={cat.key}>
            <line x1={center} y1={center} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {cat.label.split(" ")[0]}
            </text>
          </g>
        );
      })}
      <path d={pathData} fill="hsla(var(--color-lavender) / 0.3)" stroke="hsl(var(--color-lavender))" strokeWidth="2" />
      {points.map((p) => (
        <circle key={p.cat.key} cx={p.x} cy={p.y} r="6" fill={p.cat.color} />
      ))}
    </svg>
  );
}

export default WheelOfLife;
