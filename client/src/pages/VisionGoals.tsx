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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Plus, Target, CheckCircle2, Edit2, Trash2 } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600"
        />
      </div>
    );
  }

  const activeGoals = goals?.filter((g: any) => g.status === "active") || [];
  const completedGoals = goals?.filter((g: any) => g.status === "completed") || [];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-300/20 to-teal-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-300/20 to-blue-300/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/vision`)} 
            className="mb-4 hover:bg-emerald-100" 
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                <Target className="w-4 h-4" />
                <span className="text-sm font-semibold">Stage 3: Plan</span>
              </div>
              <h1 className="text-4xl font-display font-bold">
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  SMART Goals
                </span>
              </h1>
              <p className="text-slate-600 mt-2">Set specific, measurable goals for this season</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={() => { setEditingGoal(null); resetForm(); }} 
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg rounded-xl"
                    data-testid="button-add-goal"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Goal
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-0 shadow-2xl">
                <DialogHeader>
                  <DialogTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                      placeholder="What do you want to achieve?"
                      data-testid="input-goal-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="why">Why does this matter?</Label>
                    <Textarea
                      id="why"
                      value={goalForm.why}
                      onChange={(e) => setGoalForm({ ...goalForm, why: e.target.value })}
                      placeholder="The deeper reason behind this goal..."
                      rows={2}
                      data-testid="input-goal-why"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="specific">Specific</Label>
                      <Textarea
                        id="specific"
                        value={goalForm.specific}
                        onChange={(e) => setGoalForm({ ...goalForm, specific: e.target.value })}
                        placeholder="What exactly will you do?"
                        rows={2}
                        data-testid="input-goal-specific"
                      />
                    </div>
                    <div>
                      <Label htmlFor="measurable">Measurable</Label>
                      <Textarea
                        id="measurable"
                        value={goalForm.measurable}
                        onChange={(e) => setGoalForm({ ...goalForm, measurable: e.target.value })}
                        placeholder="How will you track progress?"
                        rows={2}
                        data-testid="input-goal-measurable"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="metricName">Key Metric</Label>
                      <Input
                        id="metricName"
                        value={goalForm.metricName}
                        onChange={(e) => setGoalForm({ ...goalForm, metricName: e.target.value })}
                        placeholder="e.g., Books read, kg lost"
                        data-testid="input-goal-metric"
                      />
                    </div>
                    <div>
                      <Label htmlFor="metricTarget">Target</Label>
                      <Input
                        id="metricTarget"
                        value={goalForm.metricTarget}
                        onChange={(e) => setGoalForm({ ...goalForm, metricTarget: e.target.value })}
                        placeholder="e.g., 12, 5kg"
                        data-testid="input-goal-target"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={goalForm.deadline}
                      onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                      data-testid="input-goal-deadline"
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstStep">First Step (within 48 hours)</Label>
                    <Input
                      id="firstStep"
                      value={goalForm.firstStep}
                      onChange={(e) => setGoalForm({ ...goalForm, firstStep: e.target.value })}
                      placeholder="The very first action you'll take..."
                      data-testid="input-goal-first-step"
                    />
                  </div>
                  <div>
                    <Label htmlFor="obstaclesPlan">If I get stuck, I will...</Label>
                    <Textarea
                      id="obstaclesPlan"
                      value={goalForm.obstaclesPlan}
                      onChange={(e) => setGoalForm({ ...goalForm, obstaclesPlan: e.target.value })}
                      placeholder="Plan for overcoming obstacles..."
                      rows={2}
                      data-testid="input-goal-obstacles"
                    />
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={!goalForm.title || createGoal.isPending || updateGoal.isPending}
                    className="w-full"
                    data-testid="button-save-goal"
                  >
                    {createGoal.isPending || updateGoal.isPending ? "Saving..." : editingGoal ? "Update Goal" : "Create Goal"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {activeGoals.length === 0 && completedGoals.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Target className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No goals yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set your first SMART goal to start making progress
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          )}

          {activeGoals.length > 0 && (
            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold text-primary">Active Goals</h2>
              {activeGoals.map((goal: any) => (
                <motion.div key={goal.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="hover:shadow-md transition-shadow" data-testid={`goal-card-${goal.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(goal)}
                            data-testid={`edit-goal-${goal.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => completeGoal.mutate(goal.id)}
                            data-testid={`complete-goal-${goal.id}`}
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {goal.why && <p className="text-sm text-muted-foreground mb-2">Why: {goal.why}</p>}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {goal.metricName && goal.metricTarget && (
                          <span className="bg-accent/10 text-accent px-2 py-1 rounded">
                            {goal.metricName}: {goal.metricTarget}
                          </span>
                        )}
                        {goal.deadline && (
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {completedGoals.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-green-600">Completed Goals</h2>
              {completedGoals.map((goal: any) => (
                <Card key={goal.id} className="bg-green-50/50 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      {goal.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => navigate(`/vision/${sessionId}/values`)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Values & Purpose
            </Button>
            <Button onClick={() => navigate(`/vision/${sessionId}/plan`)} data-testid="button-to-plan">
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
