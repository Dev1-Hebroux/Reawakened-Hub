import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Heart, Sparkles, X } from "lucide-react";

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
      const res = await fetch(`/api/vision/sessions/current`, { credentials: "include" });
      if (!res.ok) return null;
      return (await res.json()).data;
    },
  });

  const { data: valuesData } = useQuery({
    queryKey: [`/api/vision/sessions/${sessionId}/values`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/sessions/${sessionId}/values`, { credentials: "include" });
      if (!res.ok) return null;
      return (await res.json()).data;
    },
  });

  const { data: purposeData } = useQuery({
    queryKey: [`/api/vision/sessions/${sessionId}/purpose`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/sessions/${sessionId}/purpose`, { credentials: "include" });
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
      const res = await fetch(`/api/vision/sessions/${sessionId}/values`, {
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
      const res = await fetch(`/api/vision/sessions/${sessionId}/purpose`, {
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-300/20 to-blue-300/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/vision`)} 
            className="mb-4 hover:bg-blue-100" 
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-semibold">Stage 2: Align</span>
            </div>
            <h1 className="text-4xl font-display font-bold mb-3">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {step === "values" ? "Your Core Values" : "Purpose Flower"}
              </span>
            </h1>
            <p className="text-slate-600 max-w-lg mx-auto">
              {step === "values"
                ? "Select up to 5 values that guide your life"
                : "Discover where your passions, strengths, and impact align"}
            </p>
          </motion.div>

          {step === "values" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-accent" />
                    Choose Your Values
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {VALUE_OPTIONS.map((value) => {
                      const isSelected = selectedValues.includes(value);
                      const index = selectedValues.indexOf(value);
                      return (
                        <button
                          key={value}
                          onClick={() => toggleValue(value)}
                          className={`px-4 py-2 rounded-full border transition-all ${
                            isSelected
                              ? "border-accent bg-accent text-white"
                              : "border-border hover:border-accent"
                          }`}
                          data-testid={`value-${value.toLowerCase()}`}
                        >
                          {isSelected && <span className="mr-1">#{index + 1}</span>}
                          {value}
                        </button>
                      );
                    })}
                  </div>

                  {selectedValues.length > 0 && (
                    <div className="bg-accent/10 p-4 rounded-lg mb-6">
                      <p className="text-sm font-medium mb-2">Your selected values (in order of selection):</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedValues.map((value, i) => (
                          <span
                            key={value}
                            className="inline-flex items-center gap-1 bg-accent text-white px-3 py-1 rounded-full text-sm"
                          >
                            #{i + 1} {value}
                            <button onClick={() => toggleValue(value)} className="ml-1">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedValues.length > 0 && (
                    <div>
                      <Label htmlFor="topValueMeaning">
                        What does "{selectedValues[0]}" mean to you in daily life?
                      </Label>
                      <Textarea
                        id="topValueMeaning"
                        value={topValueMeaning}
                        onChange={(e) => setTopValueMeaning(e.target.value)}
                        placeholder="When I live by this value, I..."
                        className="mt-2"
                        rows={3}
                        data-testid="input-value-meaning"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => navigate(`/vision/${sessionId}/wheel`)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Wheel of Life
                </Button>
                <Button
                  onClick={() => saveValues.mutate()}
                  disabled={selectedValues.length === 0 || saveValues.isPending}
                  data-testid="button-save-values"
                >
                  {saveValues.isPending ? "Saving..." : "Continue to Purpose"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "purpose" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="border-2 border-[hsl(var(--color-lavender))]/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-[hsl(var(--color-lavender))]">What I Love</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={purpose.passion}
                      onChange={(e) => setPurpose({ ...purpose, passion: e.target.value })}
                      placeholder="Activities that energize me, topics I could talk about for hours..."
                      rows={4}
                      data-testid="input-passion"
                    />
                  </CardContent>
                </Card>

                <Card className="border-2 border-[hsl(var(--color-sage))]/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-[hsl(var(--color-sage))]">What I'm Good At</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={purpose.strengths}
                      onChange={(e) => setPurpose({ ...purpose, strengths: e.target.value })}
                      placeholder="Skills, talents, things people compliment me on..."
                      rows={4}
                      data-testid="input-strengths"
                    />
                  </CardContent>
                </Card>

                <Card className="border-2 border-accent/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-accent">What the World Needs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={purpose.needs}
                      onChange={(e) => setPurpose({ ...purpose, needs: e.target.value })}
                      placeholder="Problems I want to solve, people I want to help..."
                      rows={4}
                      data-testid="input-needs"
                    />
                  </CardContent>
                </Card>

                <Card className="border-2 border-[hsl(var(--color-warning))]/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-[hsl(var(--color-warning))]">What I Can Be Rewarded For</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={purpose.rewards}
                      onChange={(e) => setPurpose({ ...purpose, rewards: e.target.value })}
                      placeholder="Ways I can earn income, recognition, or fulfillment..."
                      rows={4}
                      data-testid="input-rewards"
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-8 border-2 border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    My Purpose Statement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {isFaithMode
                      ? "I believe God has called me to..."
                      : "At the intersection of all four, I find my purpose:"}
                  </p>
                  <Textarea
                    value={purpose.purposeStatement}
                    onChange={(e) => setPurpose({ ...purpose, purposeStatement: e.target.value })}
                    placeholder="My purpose is to..."
                    rows={3}
                    data-testid="input-purpose-statement"
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep("values")}
                  className="hover:bg-blue-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Values
                </Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => savePurpose.mutate()}
                    disabled={savePurpose.isPending}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg"
                    data-testid="button-save-purpose"
                  >
                    {savePurpose.isPending ? "Saving..." : "Continue to Goals"} <ArrowRight className="w-4 h-4 ml-2" />
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

export default VisionValues;
