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
import { ArrowLeft, ArrowRight, Calendar, Target, Plus, X, Clock, Users } from "lucide-react";
import { AICoachPanel, IntroGuide } from "@/components/AICoachPanel";

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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-[#E8E4DE] border-t-[#6B8E8E]"
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
            <div className="inline-flex items-center gap-2 bg-[#6B8E8E] text-white px-4 py-2 rounded-full mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Stage 4: Practice</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3 text-[#2C3E2D]">
              90-Day Plan
            </h1>
            <p className="text-[#6B7B6E] max-w-lg mx-auto">
              Break down your vision into actionable steps for the next 90 days
            </p>
          </motion.div>

          <IntroGuide
            title="90-Day Plan"
            description="A 90-day sprint is the perfect timeframe - long enough to make meaningful progress, short enough to stay focused. This plan breaks your biggest goal into key results and weekly anchors that keep you on track."
            benefits={[
              "Transform big goals into manageable quarterly sprints",
              "Create measurable key results to track progress",
              "Build weekly rhythms that create consistency",
              "Plan for obstacles before they derail you"
            ]}
            howToUse={[
              "Define your #1 focus outcome for the next 90 days",
              "Set 3 key results that prove you've achieved it",
              "Establish weekly anchors and schedule blocks",
              "Plan your accountability and what to do when stuck"
            ]}
          />

          <div className="flex justify-center mb-6">
            <AICoachPanel
              sessionId={sessionId!}
              tool="plan"
              data={plan}
              title="90-Day Strategy"
              description="Get guidance on your quarterly action plan"
            />
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card className="border border-[#E8E4DE] bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#7C9A8E]/10 border-b border-[#E8E4DE]">
                <CardTitle className="flex items-center gap-2 text-[#2C3E2D]">
                  <Target className="w-5 h-5 text-[#7C9A8E]" />
                  #1 Focus Outcome
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-[#6B7B6E] mb-4 italic">
                  If you could only achieve ONE thing in the next 90 days, what would have the biggest impact?
                </p>
                <Textarea
                  value={plan.focusOutcome}
                  onChange={(e) => setPlan({ ...plan, focusOutcome: e.target.value })}
                  placeholder="By the end of 90 days, I will have..."
                  rows={3}
                  className="border-[#E8E4DE] focus:border-[#7C9A8E] bg-[#FDFCFA]"
                  data-testid="input-focus-outcome"
                />
              </CardContent>
            </Card>

            <Card className="border border-[#E8E4DE] bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#4A7C7C]/10 border-b border-[#E8E4DE]">
                <CardTitle className="text-[#2C3E2D]">3 Key Results</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-[#6B7B6E] mb-4 italic">
                  What 3 measurable outcomes will prove you've achieved your focus?
                </p>
                <div className="space-y-3">
                  {plan.keyResults.map((result, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-[#4A7C7C] flex items-center justify-center text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      <Input
                        value={result}
                        onChange={(e) => updateKeyResult(i, e.target.value)}
                        placeholder={`Key result ${i + 1}...`}
                        className="border-[#E8E4DE] focus:border-[#4A7C7C] bg-[#FDFCFA]"
                        data-testid={`input-key-result-${i}`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#E8E4DE] bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#D4A574]/10 border-b border-[#E8E4DE]">
                <CardTitle className="flex items-center gap-2 text-[#2C3E2D]">
                  <Calendar className="w-5 h-5 text-[#D4A574]" />
                  Weekly Anchors
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-[#6B7B6E] mb-4 italic">
                  What repeatable actions will you do every week?
                </p>
                <div className="space-y-2">
                  {plan.weeklyAnchors.map((anchor, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={anchor}
                        onChange={(e) => updateWeeklyAnchor(i, e.target.value)}
                        placeholder="e.g., Review goals every Sunday"
                        className="border-[#E8E4DE] focus:border-[#D4A574] bg-[#FDFCFA]"
                        data-testid={`input-weekly-anchor-${i}`}
                      />
                      {plan.weeklyAnchors.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeWeeklyAnchor(i)}
                          className="text-[#8B9B8E] hover:text-[#C17767] hover:bg-[#C17767]/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addWeeklyAnchor}
                    className="border-[#D4A574] text-[#D4A574] hover:bg-[#D4A574]/10"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Anchor
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#E8E4DE] bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#6B8E8E]/10 border-b border-[#E8E4DE]">
                <CardTitle className="flex items-center gap-2 text-[#2C3E2D]">
                  <Clock className="w-5 h-5 text-[#6B8E8E]" />
                  Schedule Anchors
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[#FDFCFA] p-4 rounded-xl border border-[#E8E4DE]">
                    <Label htmlFor="planningDay" className="text-[#2C3E2D] font-medium">Weekly Planning Day</Label>
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
                      className="mt-2 border-[#E8E4DE] focus:border-[#6B8E8E] bg-white"
                      data-testid="input-planning-day"
                    />
                  </div>
                  <div className="bg-[#FDFCFA] p-4 rounded-xl border border-[#E8E4DE]">
                    <Label htmlFor="deepWork" className="text-[#2C3E2D] font-medium">Deep Work Time</Label>
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
                      className="mt-2 border-[#E8E4DE] focus:border-[#6B8E8E] bg-white"
                      data-testid="input-deep-work"
                    />
                  </div>
                  <div className="bg-[#FDFCFA] p-4 rounded-xl border border-[#E8E4DE]">
                    <Label htmlFor="reviewDay" className="text-[#2C3E2D] font-medium">Weekly Review Day</Label>
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
                      className="mt-2 border-[#E8E4DE] focus:border-[#6B8E8E] bg-white"
                      data-testid="input-review-day"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#E8E4DE] bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#5B8C5A]/10 border-b border-[#E8E4DE]">
                <CardTitle className="flex items-center gap-2 text-[#2C3E2D]">
                  <Users className="w-5 h-5 text-[#5B8C5A]" />
                  Accountability & Obstacles
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="accountability" className="text-[#2C3E2D] font-medium">Who will hold me accountable?</Label>
                  <Textarea
                    id="accountability"
                    value={plan.accountabilityPlan}
                    onChange={(e) => setPlan({ ...plan, accountabilityPlan: e.target.value })}
                    placeholder="e.g., Weekly check-in with my mentor..."
                    rows={2}
                    className="mt-2 border-[#E8E4DE] focus:border-[#5B8C5A] bg-[#FDFCFA]"
                    data-testid="input-accountability"
                  />
                </div>
                <div>
                  <Label htmlFor="stuck" className="text-[#2C3E2D] font-medium">If I get stuck, I will...</Label>
                  <Textarea
                    id="stuck"
                    value={plan.stuckPlan}
                    onChange={(e) => setPlan({ ...plan, stuckPlan: e.target.value })}
                    placeholder="e.g., Reach out to my accountability partner..."
                    rows={2}
                    className="mt-2 border-[#E8E4DE] focus:border-[#5B8C5A] bg-[#FDFCFA]"
                    data-testid="input-stuck-plan"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/vision/${sessionId}/goals`)}
                className="text-[#5A5A5A] hover:bg-[#E8E4DE]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Goals
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => savePlan.mutate()}
                  disabled={savePlan.isPending}
                  className="border-[#7C9A8E] text-[#7C9A8E] hover:bg-[#7C9A8E]/10"
                  data-testid="button-save-plan"
                >
                  {savePlan.isPending ? "Saving..." : "Save Plan"}
                </Button>
                <Button 
                  onClick={() => navigate(`/vision/${sessionId}/habits`)} 
                  className="bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white rounded-xl"
                  data-testid="button-to-habits"
                >
                  Habits <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
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
