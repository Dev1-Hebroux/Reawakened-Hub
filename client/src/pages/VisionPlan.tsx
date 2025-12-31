import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Calendar, Target, Plus, X } from "lucide-react";

export function VisionPlan() {
  const { sessionId } = useParams();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [plan, setPlan] = useState({
    focusOutcome: "",
    keyResults: ["", "", ""],
    weeklyAnchors: [""],
    scheduleAnchors: { planningDay: "", deepWorkTime: "", reviewDay: "" },
    accountabilityPlan: "",
    stuckPlan: "",
  });

  const { data: planData, isLoading } = useQuery({
    queryKey: [`/api/vision/sessions/${sessionId}/plan`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/sessions/${sessionId}/plan`, { credentials: "include" });
      if (!res.ok) return null;
      return (await res.json()).data;
    },
  });

  useEffect(() => {
    if (planData) {
      setPlan({
        focusOutcome: planData.focusOutcome || "",
        keyResults: (planData.keyResults as string[]) || ["", "", ""],
        weeklyAnchors: (planData.weeklyAnchors as string[]) || [""],
        scheduleAnchors: (planData.scheduleAnchors as any) || { planningDay: "", deepWorkTime: "", reviewDay: "" },
        accountabilityPlan: planData.accountabilityPlan || "",
        stuckPlan: planData.stuckPlan || "",
      });
    }
  }, [planData]);

  const savePlan = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/vision/sessions/${sessionId}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(plan),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vision/sessions/${sessionId}/plan`] });
    },
  });

  const updateKeyResult = (index: number, value: string) => {
    const newResults = [...plan.keyResults];
    newResults[index] = value;
    setPlan({ ...plan, keyResults: newResults });
  };

  const addWeeklyAnchor = () => {
    setPlan({ ...plan, weeklyAnchors: [...plan.weeklyAnchors, ""] });
  };

  const updateWeeklyAnchor = (index: number, value: string) => {
    const newAnchors = [...plan.weeklyAnchors];
    newAnchors[index] = value;
    setPlan({ ...plan, weeklyAnchors: newAnchors });
  };

  const removeWeeklyAnchor = (index: number) => {
    const newAnchors = plan.weeklyAnchors.filter((_, i) => i !== index);
    setPlan({ ...plan, weeklyAnchors: newAnchors.length ? newAnchors : [""] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-600"
        />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/vision`)} 
            className="mb-4 hover:bg-orange-100" 
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-semibold">Stage 4: Practice</span>
            </div>
            <h1 className="text-4xl font-display font-bold mb-3">
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                90-Day Plan
              </span>
            </h1>
            <p className="text-slate-600 max-w-lg mx-auto">
              Break down your vision into actionable steps for the next 90 days
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  #1 Focus Outcome
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  If you could only achieve ONE thing in the next 90 days, what would have the biggest impact?
                </p>
                <Textarea
                  value={plan.focusOutcome}
                  onChange={(e) => setPlan({ ...plan, focusOutcome: e.target.value })}
                  placeholder="By the end of 90 days, I will have..."
                  rows={3}
                  data-testid="input-focus-outcome"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3 Key Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  What 3 measurable outcomes will prove you've achieved your focus?
                </p>
                <div className="space-y-3">
                  {plan.keyResults.map((result, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium text-accent">
                        {i + 1}
                      </span>
                      <Input
                        value={result}
                        onChange={(e) => updateKeyResult(i, e.target.value)}
                        placeholder={`Key result ${i + 1}...`}
                        data-testid={`input-key-result-${i}`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[hsl(var(--color-warning))]" />
                  Weekly Anchors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  What repeatable actions will you do every week?
                </p>
                <div className="space-y-2">
                  {plan.weeklyAnchors.map((anchor, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={anchor}
                        onChange={(e) => updateWeeklyAnchor(i, e.target.value)}
                        placeholder="e.g., Review goals every Sunday"
                        data-testid={`input-weekly-anchor-${i}`}
                      />
                      {plan.weeklyAnchors.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeWeeklyAnchor(i)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addWeeklyAnchor}>
                    <Plus className="w-4 h-4 mr-1" /> Add Anchor
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule Anchors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="planningDay">Weekly Planning Day</Label>
                    <Input
                      id="planningDay"
                      value={plan.scheduleAnchors.planningDay}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          scheduleAnchors: { ...plan.scheduleAnchors, planningDay: e.target.value },
                        })
                      }
                      placeholder="e.g., Sunday evening"
                      data-testid="input-planning-day"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deepWork">Deep Work Time</Label>
                    <Input
                      id="deepWork"
                      value={plan.scheduleAnchors.deepWorkTime}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          scheduleAnchors: { ...plan.scheduleAnchors, deepWorkTime: e.target.value },
                        })
                      }
                      placeholder="e.g., 6-8am daily"
                      data-testid="input-deep-work"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviewDay">Weekly Review Day</Label>
                    <Input
                      id="reviewDay"
                      value={plan.scheduleAnchors.reviewDay}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          scheduleAnchors: { ...plan.scheduleAnchors, reviewDay: e.target.value },
                        })
                      }
                      placeholder="e.g., Friday afternoon"
                      data-testid="input-review-day"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accountability & Obstacles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="accountability">Who will hold me accountable?</Label>
                  <Textarea
                    id="accountability"
                    value={plan.accountabilityPlan}
                    onChange={(e) => setPlan({ ...plan, accountabilityPlan: e.target.value })}
                    placeholder="e.g., Weekly check-in with my mentor..."
                    rows={2}
                    data-testid="input-accountability"
                  />
                </div>
                <div>
                  <Label htmlFor="stuck">If I get stuck, I will...</Label>
                  <Textarea
                    id="stuck"
                    value={plan.stuckPlan}
                    onChange={(e) => setPlan({ ...plan, stuckPlan: e.target.value })}
                    placeholder="e.g., Reach out to my accountability partner..."
                    rows={2}
                    data-testid="input-stuck-plan"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/vision/${sessionId}/goals`)}
                className="hover:bg-orange-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Goals
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => savePlan.mutate()}
                  disabled={savePlan.isPending}
                  className="border-orange-300 hover:bg-orange-50"
                  data-testid="button-save-plan"
                >
                  {savePlan.isPending ? "Saving..." : "Save Plan"}
                </Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={() => navigate(`/vision/${sessionId}/habits`)} 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg"
                    data-testid="button-to-habits"
                  >
                    Habits <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default VisionPlan;
