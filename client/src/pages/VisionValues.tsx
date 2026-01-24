import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Heart, X, Check, Compass } from "lucide-react";
import { AICoachPanel, IntroGuide } from "@/components/AICoachPanel";
import { getApiUrl } from "@/lib/api";

const VALUE_OPTIONS = [
  "Family", "Faith", "Freedom", "Growth", "Adventure", "Creativity", "Service",
  "Health", "Integrity", "Love", "Peace", "Purpose", "Security", "Wisdom",
  "Connection", "Excellence", "Courage", "Authenticity", "Compassion", "Joy",
  "Balance", "Impact", "Learning", "Gratitude", "Resilience", "Generosity"
];

export function VisionValues() {
  const { sessionId } = useParams();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [topValueMeaning, setTopValueMeaning] = useState("");
  const [step, setStep] = useState<"values" | "purpose">("values");
  const [purpose, setPurpose] = useState({
    passion: "",
    strengths: "",
    needs: "",
    rewards: "",
    purposeStatement: "",
  });

  const { data: session } = useQuery({
    queryKey: [`/api/vision/sessions/${sessionId}`],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/vision/sessions/current"), { credentials: "include" });
      if (!res.ok) return null;
      return (await res.json()).data;
    },
  });

  const { data: valuesData } = useQuery({
    queryKey: [`/api/vision/sessions/${sessionId}/values`],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/vision/sessions/${sessionId}/values`), { credentials: "include" });
      if (!res.ok) return null;
      return (await res.json()).data;
    },
  });

  const { data: purposeData } = useQuery({
    queryKey: [`/api/vision/sessions/${sessionId}/purpose`],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/vision/sessions/${sessionId}/purpose`), { credentials: "include" });
      if (!res.ok) return null;
      return (await res.json()).data;
    },
  });

  useEffect(() => {
    if (valuesData) {
      setSelectedValues(valuesData.values as string[] || []);
      setTopValueMeaning(valuesData.topValueMeaning || "");
    }
  }, [valuesData]);

  useEffect(() => {
    if (purposeData) {
      setPurpose({
        passion: purposeData.passion || "",
        strengths: purposeData.strengths || "",
        needs: purposeData.needs || "",
        rewards: purposeData.rewards || "",
        purposeStatement: purposeData.purposeStatement || "",
      });
    }
  }, [purposeData]);

  const saveValues = useMutation({
    mutationFn: async () => {
      const res = await fetch(getApiUrl(`/api/vision/sessions/${sessionId}/values`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ values: selectedValues, topValueMeaning }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vision/sessions/${sessionId}/values`] });
      setStep("purpose");
    },
  });

  const savePurpose = useMutation({
    mutationFn: async () => {
      const res = await fetch(getApiUrl(`/api/vision/sessions/${sessionId}/purpose`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(purpose),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vision/sessions/${sessionId}/purpose`] });
      navigate(`/vision/${sessionId}/goals`);
    },
  });

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    } else if (selectedValues.length < 5) {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const isFaithMode = session?.mode === "faith";

  const purposeQuadrants = [
    { key: "passion", label: "What I Love", color: "#9B8AA6", emoji: "💜", placeholder: "Activities that energize me, topics I could talk about for hours..." },
    { key: "strengths", label: "What I'm Good At", color: "#7C9A8E", emoji: "💪", placeholder: "Skills, talents, things people compliment me on..." },
    { key: "needs", label: "What the World Needs", color: "#4A7C7C", emoji: "🌍", placeholder: "Problems I want to solve, people I want to help..." },
    { key: "rewards", label: "What I Can Be Rewarded For", color: "#D4A574", emoji: "✨", placeholder: "Ways I can earn income, recognition, or fulfillment..." },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF8F5] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(`/vision`)}
            className="mb-4 text-[#5A5A5A] hover:bg-[#E8E4DE]"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-[#9B8AA6] text-white px-4 py-2 rounded-full mb-4">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Stage 2: Align</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3 text-[#2C3E2D]">
              {step === "values" ? "Your Core Values" : "Purpose Flower"}
            </h1>
            <p className="text-[#6B7B6E] max-w-lg mx-auto">
              {step === "values"
                ? "Select up to 5 values that guide your life"
                : "Discover where your passions, strengths, and impact align"}
            </p>
          </motion.div>

          <IntroGuide
            title="Values & Purpose"
            description="Your core values are the guiding principles that shape your decisions and actions. The Purpose Flower (Ikigai) helps you discover where your passions, strengths, world needs, and rewards intersect - revealing your unique purpose."
            benefits={[
              "Gain clarity on what truly matters to you",
              "Make decisions that align with your authentic self",
              "Discover your unique purpose at the intersection of 4 key areas",
              "Create a personal purpose statement to guide your life"
            ]}
            howToUse={[
              "Select up to 5 core values that resonate deeply with you",
              "Reflect on what your top value means in daily life",
              "Complete the Purpose Flower to explore your Ikigai",
              "Craft a purpose statement that captures your calling"
            ]}
          />

          <div className="flex justify-center mb-6">
            <AICoachPanel
              sessionId={sessionId!}
              tool="values"
              data={{ values: selectedValues, topValueMeaning, ...purpose }}
              title="Purpose Guidance"
              description="Get help articulating your values and purpose"
            />
          </div>

          {step === "values" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="mb-8 border border-[#E8E4DE] bg-white rounded-2xl">
                <CardHeader className="bg-[#FDFCFA] border-b border-[#E8E4DE]">
                  <CardTitle className="flex items-center gap-2 text-[#2C3E2D]">
                    <Heart className="w-5 h-5 text-[#9B8AA6]" />
                    Choose Your Values
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {VALUE_OPTIONS.map((value) => {
                      const isSelected = selectedValues.includes(value);
                      const index = selectedValues.indexOf(value);
                      return (
                        <motion.button
                          key={value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleValue(value)}
                          className={`px-4 py-2.5 rounded-xl border-2 transition-all font-medium ${isSelected
                            ? "border-[#7C9A8E] bg-[#7C9A8E] text-white"
                            : "border-[#E8E4DE] bg-white text-[#5A5A5A] hover:border-[#7C9A8E]/50"
                            }`}
                          data-testid={`value-${value.toLowerCase()}`}
                        >
                          {isSelected && <span className="mr-1.5 bg-white/20 px-1.5 py-0.5 rounded text-xs">#{index + 1}</span>}
                          {value}
                        </motion.button>
                      );
                    })}
                  </div>

                  {selectedValues.length > 0 && (
                    <div className="bg-[#7C9A8E]/10 p-5 rounded-xl mb-6 border border-[#7C9A8E]/20">
                      <p className="text-sm font-medium text-[#2C3E2D] mb-3">Your selected values (in order of selection):</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedValues.map((value, i) => (
                          <span
                            key={value}
                            className="inline-flex items-center gap-2 bg-[#7C9A8E] text-white px-4 py-2 rounded-xl text-sm font-medium"
                          >
                            #{i + 1} {value}
                            <button
                              onClick={() => toggleValue(value)}
                              className="hover:bg-white/20 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedValues.length > 0 && (
                    <div className="bg-[#FDFCFA] p-5 rounded-xl border border-[#E8E4DE]">
                      <Label htmlFor="topValueMeaning" className="text-[#2C3E2D] font-semibold">
                        What does "{selectedValues[0]}" mean to you in daily life?
                      </Label>
                      <Textarea
                        id="topValueMeaning"
                        value={topValueMeaning}
                        onChange={(e) => setTopValueMeaning(e.target.value)}
                        placeholder="When I live by this value, I..."
                        className="mt-3 border-[#E8E4DE] focus:border-[#7C9A8E] bg-white"
                        rows={3}
                        data-testid="input-value-meaning"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/vision/${sessionId}/wheel`)}
                  className="text-[#5A5A5A] hover:bg-[#E8E4DE]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Wheel of Life
                </Button>
                <Button
                  onClick={() => saveValues.mutate()}
                  disabled={selectedValues.length === 0 || saveValues.isPending}
                  className="bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white rounded-xl"
                  data-testid="button-save-values"
                >
                  {saveValues.isPending ? "Saving..." : "Continue to Purpose"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "purpose" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-8">
                <p className="text-[#6B7B6E] italic">
                  The Ikigai framework helps you find purpose at the intersection of what you love, what you're good at, what the world needs, and what you can be rewarded for.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {purposeQuadrants.map((quadrant) => (
                  <Card
                    key={quadrant.key}
                    className="border-2 rounded-2xl overflow-hidden"
                    style={{ borderColor: `${quadrant.color}30` }}
                  >
                    <CardHeader
                      className="pb-2"
                      style={{ backgroundColor: `${quadrant.color}10` }}
                    >
                      <CardTitle className="text-lg flex items-center gap-2" style={{ color: quadrant.color }}>
                        <span className="text-xl">{quadrant.emoji}</span>
                        {quadrant.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Textarea
                        value={purpose[quadrant.key as keyof typeof purpose]}
                        onChange={(e) => setPurpose({ ...purpose, [quadrant.key]: e.target.value })}
                        placeholder={quadrant.placeholder}
                        rows={4}
                        className="border-[#E8E4DE] focus:border-[#7C9A8E] bg-[#FDFCFA]"
                        data-testid={`input-${quadrant.key}`}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mb-8 border-2 border-[#7C9A8E]/30 rounded-2xl overflow-hidden">
                <CardHeader className="bg-[#7C9A8E]/10">
                  <CardTitle className="flex items-center gap-2 text-[#7C9A8E]">
                    <Compass className="w-5 h-5" />
                    My Purpose Statement
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-[#6B7B6E] mb-4 italic">
                    {isFaithMode
                      ? "I believe God has called me to..."
                      : "At the intersection of all four, I find my purpose:"}
                  </p>
                  <Textarea
                    value={purpose.purposeStatement}
                    onChange={(e) => setPurpose({ ...purpose, purposeStatement: e.target.value })}
                    placeholder="My purpose is to..."
                    rows={3}
                    className="border-[#E8E4DE] focus:border-[#7C9A8E] bg-[#FDFCFA] text-lg"
                    data-testid="input-purpose-statement"
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setStep("values")}
                  className="text-[#5A5A5A] hover:bg-[#E8E4DE]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Values
                </Button>
                <Button
                  onClick={() => savePurpose.mutate()}
                  disabled={savePurpose.isPending}
                  className="bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white rounded-xl"
                  data-testid="button-save-purpose"
                >
                  {savePurpose.isPending ? "Saving..." : "Continue to Goals"} <ArrowRight className="w-4 h-4 ml-2" />
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

export default VisionValues;
