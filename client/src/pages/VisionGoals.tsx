import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Plus, Target, CheckCircle2, Edit2, Trash2, Calendar, TrendingUp } from "lucide-react";

const SMART_LETTERS = [
  { letter: "S", label: "Specific", placeholder: "What exactly will you achieve? Be precise.", color: "#7C9A8E" },
  { letter: "M", label: "Measurable", placeholder: "How will you track progress? What metrics?", color: "#4A7C7C" },
  { letter: "A", label: "Achievable", placeholder: "Is this realistic? What resources do you need?", color: "#6B8E8E" },
  { letter: "R", label: "Relevant", placeholder: "Why does this matter? How does it align with your values?", color: "#5B8C5A" },
  { letter: "T", label: "Time-bound", placeholder: "What's your deadline?", color: "#C17767" },
];

export function VisionGoals() {
  const { sessionId } = useParams();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [goalForm, setGoalForm] = useState({
    title: "",
    why: "",
    specific: "",
    measurable: "",
    metricName: "",
    metricTarget: "",
    achievable: "",
    relevant: "",
    deadline: "",
    firstStep: "",
    obstaclesPlan: "",
  });

  const { data: goals, isLoading } = useQuery({
    queryKey: [`/api/vision/sessions/${sessionId}/goals`],
    queryFn: async () => {
      const res = await fetch(`/api/vision/sessions/${sessionId}/goals`, { credentials: "include" });
      if (!res.ok) return [];
      return (await res.json()).data || [];
    },
  });

  const createGoal = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/vision/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sessionId: parseInt(sessionId!),
          ...goalForm,
          deadline: goalForm.deadline ? new Date(goalForm.deadline).toISOString() : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create goal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vision/sessions/${sessionId}/goals`] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateGoal = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/vision/goals/${editingGoal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...goalForm,
          deadline: goalForm.deadline ? new Date(goalForm.deadline).toISOString() : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update goal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vision/sessions/${sessionId}/goals`] });
      setIsDialogOpen(false);
      setEditingGoal(null);
      resetForm();
    },
  });

  const completeGoal = useMutation({
    mutationFn: async (goalId: number) => {
      const res = await fetch(`/api/vision/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "completed" }),
      });
      if (!res.ok) throw new Error("Failed to complete goal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vision/sessions/${sessionId}/goals`] });
    },
  });

  const resetForm = () => {
    setGoalForm({
      title: "",
      why: "",
      specific: "",
      measurable: "",
      metricName: "",
      metricTarget: "",
      achievable: "",
      relevant: "",
      deadline: "",
      firstStep: "",
      obstaclesPlan: "",
    });
  };

  const openEditDialog = (goal: any) => {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title || "",
      why: goal.why || "",
      specific: goal.specific || "",
      measurable: goal.measurable || "",
      metricName: goal.metricName || "",
      metricTarget: goal.metricTarget || "",
      achievable: goal.achievable || "",
      relevant: goal.relevant || "",
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split("T")[0] : "",
      firstStep: goal.firstStep || "",
      obstaclesPlan: goal.obstaclesPlan || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingGoal) {
      updateGoal.mutate();
    } else {
      createGoal.mutate();
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

  const activeGoals = goals?.filter((g: any) => g.status === "active") || [];
  const completedGoals = goals?.filter((g: any) => g.status === "completed") || [];

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
            className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-[#4A7C7C] text-white px-4 py-2 rounded-full mb-3">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Stage 3: Plan</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-[#2C3E2D]">
                SMART Goals
              </h1>
              <p className="text-[#6B7B6E] mt-2">Set specific, measurable goals for this season</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={() => { setEditingGoal(null); resetForm(); }} 
                    className="bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white rounded-xl"
                    data-testid="button-add-goal"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Goal
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FAF8F5] border-[#E8E4DE]">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-[#2C3E2D]">
                    {editingGoal ? "Edit Goal" : "Create SMART Goal"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-5 mt-4">
                  <div className="bg-white rounded-xl p-4 border border-[#E8E4DE]">
                    <Label htmlFor="title" className="text-[#2C3E2D] font-semibold">Goal Title</Label>
                    <Input
                      id="title"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                      placeholder="What do you want to achieve?"
                      className="mt-2 border-[#E8E4DE] focus:border-[#7C9A8E] bg-[#FDFCFA]"
                      data-testid="input-goal-title"
                    />
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-[#E8E4DE]">
                    <Label htmlFor="why" className="text-[#2C3E2D] font-semibold">Why does this matter?</Label>
                    <Textarea
                      id="why"
                      value={goalForm.why}
                      onChange={(e) => setGoalForm({ ...goalForm, why: e.target.value })}
                      placeholder="The deeper reason behind this goal..."
                      rows={2}
                      className="mt-2 border-[#E8E4DE] focus:border-[#7C9A8E] bg-[#FDFCFA]"
                      data-testid="input-goal-why"
                    />
                  </div>

                  {SMART_LETTERS.map((item) => (
                    <div 
                      key={item.letter} 
                      className="bg-white rounded-xl overflow-hidden border border-[#E8E4DE]"
                    >
                      <div 
                        className="flex items-center gap-3 px-4 py-3"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                          style={{ backgroundColor: item.color }}
                        >
                          {item.letter}
                        </div>
                        <span className="font-semibold text-[#2C3E2D]">{item.label}</span>
                      </div>
                      <div className="p-4">
                        {item.letter === "T" ? (
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <Label className="text-sm text-[#6B7B6E]">Deadline</Label>
                              <Input
                                type="date"
                                value={goalForm.deadline}
                                onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                                className="mt-1 border-[#E8E4DE] focus:border-[#7C9A8E] bg-[#FDFCFA]"
                                data-testid="input-goal-deadline"
                              />
                            </div>
                          </div>
                        ) : item.letter === "M" ? (
                          <div className="space-y-3">
                            <Textarea
                              value={goalForm.measurable}
                              onChange={(e) => setGoalForm({ ...goalForm, measurable: e.target.value })}
                              placeholder={item.placeholder}
                              rows={2}
                              className="border-[#E8E4DE] focus:border-[#7C9A8E] bg-[#FDFCFA]"
                              data-testid="input-goal-measurable"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-sm text-[#6B7B6E]">Key Metric</Label>
                                <Input
                                  value={goalForm.metricName}
                                  onChange={(e) => setGoalForm({ ...goalForm, metricName: e.target.value })}
                                  placeholder="e.g., Books read"
                                  className="mt-1 border-[#E8E4DE] focus:border-[#7C9A8E] bg-[#FDFCFA]"
                                  data-testid="input-goal-metric"
                                />
                              </div>
                              <div>
                                <Label className="text-sm text-[#6B7B6E]">Target</Label>
                                <Input
                                  value={goalForm.metricTarget}
                                  onChange={(e) => setGoalForm({ ...goalForm, metricTarget: e.target.value })}
                                  placeholder="e.g., 12"
                                  className="mt-1 border-[#E8E4DE] focus:border-[#7C9A8E] bg-[#FDFCFA]"
                                  data-testid="input-goal-target"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Textarea
                            value={
                              item.letter === "S" ? goalForm.specific :
                              item.letter === "A" ? goalForm.achievable :
                              goalForm.relevant
                            }
                            onChange={(e) => setGoalForm({ 
                              ...goalForm, 
                              [item.letter === "S" ? "specific" : item.letter === "A" ? "achievable" : "relevant"]: e.target.value 
                            })}
                            placeholder={item.placeholder}
                            rows={2}
                            className="border-[#E8E4DE] focus:border-[#7C9A8E] bg-[#FDFCFA]"
                            data-testid={`input-goal-${item.label.toLowerCase()}`}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="bg-white rounded-xl p-4 border border-[#E8E4DE]">
                    <Label htmlFor="firstStep" className="text-[#2C3E2D] font-semibold">First Step (within 48 hours)</Label>
                    <Input
                      id="firstStep"
                      value={goalForm.firstStep}
                      onChange={(e) => setGoalForm({ ...goalForm, firstStep: e.target.value })}
                      placeholder="The very first action you'll take..."
                      className="mt-2 border-[#E8E4DE] focus:border-[#7C9A8E] bg-[#FDFCFA]"
                      data-testid="input-goal-first-step"
                    />
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-[#E8E4DE]">
                    <Label htmlFor="obstaclesPlan" className="text-[#2C3E2D] font-semibold">If I get stuck, I will...</Label>
                    <Textarea
                      id="obstaclesPlan"
                      value={goalForm.obstaclesPlan}
                      onChange={(e) => setGoalForm({ ...goalForm, obstaclesPlan: e.target.value })}
                      placeholder="Plan for overcoming obstacles..."
                      rows={2}
                      className="mt-2 border-[#E8E4DE] focus:border-[#7C9A8E] bg-[#FDFCFA]"
                      data-testid="input-goal-obstacles"
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!goalForm.title || createGoal.isPending || updateGoal.isPending}
                    className="w-full bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white rounded-xl py-6"
                    data-testid="button-save-goal"
                  >
                    {createGoal.isPending || updateGoal.isPending ? "Saving..." : editingGoal ? "Update Goal" : "Create Goal"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {activeGoals.length === 0 && completedGoals.length === 0 && (
            <Card className="text-center py-16 border border-[#E8E4DE] bg-white rounded-2xl">
              <CardContent>
                <div className="w-20 h-20 rounded-2xl bg-[#7C9A8E]/10 mx-auto mb-6 flex items-center justify-center">
                  <Target className="w-10 h-10 text-[#7C9A8E]" />
                </div>
                <h3 className="text-xl font-bold text-[#2C3E2D] mb-2">No goals yet</h3>
                <p className="text-[#6B7B6E] mb-6 max-w-sm mx-auto">
                  Set your first SMART goal to start making progress toward your vision
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          )}

          <AnimatePresence>
            {activeGoals.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 mb-8"
              >
                <h2 className="text-xl font-semibold text-[#2C3E2D]">Active Goals</h2>
                {activeGoals.map((goal: any, i: number) => (
                  <motion.div 
                    key={goal.id} 
                    layout 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border border-[#E8E4DE] bg-white rounded-2xl hover:shadow-md transition-shadow" data-testid={`goal-card-${goal.id}`}>
                      <CardHeader className="pb-2 bg-[#FDFCFA] border-b border-[#E8E4DE]">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#7C9A8E] flex items-center justify-center">
                              <Target className="w-5 h-5 text-white" />
                            </div>
                            <CardTitle className="text-lg text-[#2C3E2D]">{goal.title}</CardTitle>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(goal)}
                              className="text-[#6B7B6E] hover:text-[#2C3E2D] hover:bg-[#E8E4DE]"
                              data-testid={`edit-goal-${goal.id}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => completeGoal.mutate(goal.id)}
                              className="text-[#5B8C5A] hover:bg-[#5B8C5A]/10"
                              data-testid={`complete-goal-${goal.id}`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {goal.why && (
                          <p className="text-sm text-[#6B7B6E] mb-3 italic">"{goal.why}"</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {goal.metricName && goal.metricTarget && (
                            <span className="inline-flex items-center gap-1 bg-[#4A7C7C]/10 text-[#4A7C7C] px-3 py-1.5 rounded-lg text-sm font-medium">
                              <TrendingUp className="w-3 h-3" />
                              {goal.metricName}: {goal.metricTarget}
                            </span>
                          )}
                          {goal.deadline && (
                            <span className="inline-flex items-center gap-1 bg-[#C17767]/10 text-[#C17767] px-3 py-1.5 rounded-lg text-sm font-medium">
                              <Calendar className="w-3 h-3" />
                              {new Date(goal.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {goal.firstStep && (
                          <div className="mt-4 p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DE]">
                            <span className="text-xs font-medium text-[#6B7B6E] uppercase tracking-wide">First Step:</span>
                            <p className="text-sm text-[#2C3E2D] mt-1">{goal.firstStep}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {completedGoals.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-[#5B8C5A]">Completed Goals</h2>
                {completedGoals.map((goal: any) => (
                  <Card key={goal.id} className="bg-[#5B8C5A]/5 border border-[#5B8C5A]/20 rounded-2xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-3 text-[#5B8C5A]">
                        <CheckCircle2 className="w-5 h-5" />
                        {goal.title}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-10">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/vision/${sessionId}/values`)}
              className="text-[#5A5A5A] hover:bg-[#E8E4DE]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Values & Purpose
            </Button>
            <Button 
              onClick={() => navigate(`/vision/${sessionId}/plan`)} 
              className="bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white rounded-xl"
              data-testid="button-to-plan"
            >
              90-Day Plan <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default VisionGoals;
