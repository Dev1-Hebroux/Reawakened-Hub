import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "wouter";
import {
  ArrowLeft, CheckSquare, Plus, X, Save, Loader2, Calendar,
  Rocket, Clock, PartyPopper, Heart, Users, Sparkles, CheckCircle2,
  Circle, ChevronDown, ChevronUp, CalendarDays, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/Navbar";

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  notes?: string;
  isPrayerMilestone?: boolean;
}

interface ChecklistData {
  launchDate: string | null;
  preLaunchTasks: ChecklistItem[];
  launchDayTasks: ChecklistItem[];
  postLaunchTasks: ChecklistItem[];
  dedicationPrayer: { completed: boolean; date?: string; notes?: string };
  mentorBlessing: { sought: boolean; mentorName?: string; date?: string; notes?: string };
  communitySupport: { requested: boolean; supporters: string[]; prayers: string[] };
  launchDayPrayer: { completed: boolean; date?: string; notes?: string };
  gratitudeLog: { date: string; gratitude: string }[];
  accountabilityPartner: string;
  weeklyCheckIn: { week: number; completed: boolean; notes: string }[];
}

const DEFAULT_PRE_LAUNCH_TASKS: ChecklistItem[] = [
  { id: "pre-1", title: "Finalize product/service offering", completed: false },
  { id: "pre-2", title: "Set up pricing and payment system", completed: false },
  { id: "pre-3", title: "Create landing page or storefront", completed: false },
  { id: "pre-4", title: "Prepare marketing materials", completed: false },
  { id: "pre-5", title: "Build email list or audience", completed: false },
  { id: "pre-6", title: "Test everything thoroughly", completed: false },
  { id: "pre-7", title: "🙏 Dedication Prayer", completed: false, isPrayerMilestone: true },
  { id: "pre-8", title: "Seek mentor/community blessing", completed: false, isPrayerMilestone: true },
];

const DEFAULT_LAUNCH_DAY_TASKS: ChecklistItem[] = [
  { id: "launch-1", title: "🙏 Launch Day Prayer", completed: false, isPrayerMilestone: true },
  { id: "launch-2", title: "Go live!", completed: false },
  { id: "launch-3", title: "Announce on social media", completed: false },
  { id: "launch-4", title: "Send email to your list", completed: false },
  { id: "launch-5", title: "Share with friends and family", completed: false },
  { id: "launch-6", title: "Monitor for issues", completed: false },
];

const DEFAULT_POST_LAUNCH_TASKS: ChecklistItem[] = [
  { id: "post-1", title: "Respond to early customers/feedback", completed: false },
  { id: "post-2", title: "Track key metrics", completed: false },
  { id: "post-3", title: "Gather testimonials", completed: false },
  { id: "post-4", title: "Plan iteration/improvements", completed: false },
  { id: "post-5", title: "🙏 Gratitude and reflection", completed: false, isPrayerMilestone: true },
  { id: "post-6", title: "Celebrate with your community!", completed: false },
];

const PHASE_CONFIG = {
  preLaunch: {
    title: "Pre-Launch",
    icon: Clock,
    color: "amber",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
  },
  launchDay: {
    title: "Launch Day",
    icon: Rocket,
    color: "blue",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
  },
  postLaunch: {
    title: "Post-Launch",
    icon: PartyPopper,
    color: "green",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
  },
};

type PhaseKey = keyof typeof PHASE_CONFIG;

export default function LaunchChecklistTool() {
  const { sessionId } = useParams();
  const queryClient = useQueryClient();

  const [checklistData, setChecklistData] = useState<ChecklistData>({
    launchDate: null,
    preLaunchTasks: DEFAULT_PRE_LAUNCH_TASKS,
    launchDayTasks: DEFAULT_LAUNCH_DAY_TASKS,
    postLaunchTasks: DEFAULT_POST_LAUNCH_TASKS,
    dedicationPrayer: { completed: false },
    mentorBlessing: { sought: false },
    communitySupport: { requested: false, supporters: [], prayers: [] },
    launchDayPrayer: { completed: false },
    gratitudeLog: [],
    accountabilityPartner: "",
    weeklyCheckIn: [],
  });

  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    preLaunch: true,
    launchDay: true,
    postLaunch: true,
  });

  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({
    preLaunch: "",
    launchDay: "",
    postLaunch: "",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [newGratitude, setNewGratitude] = useState("");

  const { data: sessionData, isLoading } = useQuery<any>({
    queryKey: [`/api/product-launch/sessions/${sessionId}`],
    enabled: !!sessionId,
  });

  // Load existing data
  useEffect(() => {
    if (sessionData?.tools?.checklist) {
      const data = sessionData.tools.checklist;
      setChecklistData({
        launchDate: data.launchDate || null,
        preLaunchTasks: data.preLaunchTasks?.length ? data.preLaunchTasks : DEFAULT_PRE_LAUNCH_TASKS,
        launchDayTasks: data.launchDayTasks?.length ? data.launchDayTasks : DEFAULT_LAUNCH_DAY_TASKS,
        postLaunchTasks: data.postLaunchTasks?.length ? data.postLaunchTasks : DEFAULT_POST_LAUNCH_TASKS,
        dedicationPrayer: data.dedicationPrayer || { completed: false },
        mentorBlessing: data.mentorBlessing || { sought: false },
        communitySupport: data.communitySupport || { requested: false, supporters: [], prayers: [] },
        launchDayPrayer: data.launchDayPrayer || { completed: false },
        gratitudeLog: data.gratitudeLog || [],
        accountabilityPartner: data.accountabilityPartner || "",
        weeklyCheckIn: data.weeklyCheckIn || [],
      });
    }
  }, [sessionData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", `/api/product-launch/sessions/${sessionId}/checklist`, checklistData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/product-launch/sessions/${sessionId}`] });
      setHasChanges(false);
    },
  });

  const toggleTask = (phase: "preLaunchTasks" | "launchDayTasks" | "postLaunchTasks", taskId: string) => {
    setChecklistData((prev) => ({
      ...prev,
      [phase]: prev[phase].map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    }));
    setHasChanges(true);
  };

  const addTask = (phase: "preLaunch" | "launchDay" | "postLaunch") => {
    const phaseKey = `${phase}Tasks` as "preLaunchTasks" | "launchDayTasks" | "postLaunchTasks";
    if (!newTaskInputs[phase].trim()) return;

    const newTask: ChecklistItem = {
      id: `${phase}-${Date.now()}`,
      title: newTaskInputs[phase].trim(),
      completed: false,
    };

    setChecklistData((prev) => ({
      ...prev,
      [phaseKey]: [...prev[phaseKey], newTask],
    }));
    setNewTaskInputs((prev) => ({ ...prev, [phase]: "" }));
    setHasChanges(true);
  };

  const removeTask = (phase: "preLaunchTasks" | "launchDayTasks" | "postLaunchTasks", taskId: string) => {
    setChecklistData((prev) => ({
      ...prev,
      [phase]: prev[phase].filter((task) => task.id !== taskId),
    }));
    setHasChanges(true);
  };

  const addGratitude = () => {
    if (!newGratitude.trim()) return;

    setChecklistData((prev) => ({
      ...prev,
      gratitudeLog: [...prev.gratitudeLog, { date: new Date().toISOString(), gratitude: newGratitude.trim() }],
    }));
    setNewGratitude("");
    setHasChanges(true);
  };

  const getPhaseProgress = (tasks: ChecklistItem[]) => {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
  };

  const getTotalProgress = () => {
    const allTasks = [...checklistData.preLaunchTasks, ...checklistData.launchDayTasks, ...checklistData.postLaunchTasks];
    if (allTasks.length === 0) return 0;
    return Math.round((allTasks.filter((t) => t.completed).length / allTasks.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  const renderPhase = (
    phaseKey: "preLaunch" | "launchDay" | "postLaunch",
    tasksKey: "preLaunchTasks" | "launchDayTasks" | "postLaunchTasks"
  ) => {
    const config = PHASE_CONFIG[phaseKey];
    const Icon = config.icon;
    const tasks = checklistData[tasksKey];
    const progress = getPhaseProgress(tasks);
    const isExpanded = expandedPhases[phaseKey];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${config.bgColor} rounded-2xl border ${config.borderColor} overflow-hidden`}
      >
        {/* Phase Header */}
        <button
          onClick={() => setExpandedPhases((prev) => ({ ...prev, [phaseKey]: !prev[phaseKey] }))}
          className="w-full p-4 flex items-center justify-between hover:bg-white/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm`}>
              <Icon className={`w-5 h-5 ${config.textColor}`} />
            </div>
            <div className="text-left">
              <h3 className={`font-bold ${config.textColor}`}>{config.title}</h3>
              <p className="text-sm text-gray-600">
                {tasks.filter((t) => t.completed).length} of {tasks.length} complete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-2 bg-white/50 rounded-full overflow-hidden">
              <div
                className={`h-full bg-${config.color}-500 transition-all`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${config.textColor}`}>{progress}%</span>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </button>

        {/* Tasks */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4"
            >
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-gray-100 ${
                      task.completed ? "opacity-60" : ""
                    }`}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(tasksKey, task.id)}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <span className={`flex-1 text-sm ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                      {task.isPrayerMilestone && <Heart className="w-4 h-4 inline mr-1 text-red-400" />}
                      {task.title}
                    </span>
                    <button
                      onClick={() => removeTask(tasksKey, task.id)}
                      className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Task */}
              <div className="flex gap-2 mt-3">
                <Input
                  value={newTaskInputs[phaseKey]}
                  onChange={(e) => setNewTaskInputs((prev) => ({ ...prev, [phaseKey]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addTask(phaseKey)}
                  placeholder="Add a task..."
                  className="flex-1 bg-white"
                />
                <Button
                  onClick={() => addTask(phaseKey)}
                  disabled={!newTaskInputs[phaseKey].trim()}
                  size="icon"
                  variant="outline"
                  className="bg-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <Link href={`/product-launch/${sessionId}`}>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <CheckSquare className="w-7 h-7 text-green-600" />
                  Launch Checklist
                </h1>
                <p className="text-gray-600 text-sm">
                  Track your progress with prayer milestones
                </p>
              </div>
            </div>

            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!hasChanges || saveMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {hasChanges ? "Save" : "Saved"}
            </Button>
          </motion.div>

          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Overall Progress
              </h2>
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                {getTotalProgress()}%
              </span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getTotalProgress()}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              "For everything there is a season, and a time for every matter under heaven." — Ecclesiastes 3:1
            </p>
          </motion.div>

          {/* Launch Date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6"
          >
            <div className="flex items-center gap-4">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Target Launch Date</label>
                <Input
                  type="date"
                  value={checklistData.launchDate?.split("T")[0] || ""}
                  onChange={(e) => {
                    setChecklistData((prev) => ({ ...prev, launchDate: e.target.value }));
                    setHasChanges(true);
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          </motion.div>

          {/* Phases */}
          <div className="space-y-4 mb-8">
            {renderPhase("preLaunch", "preLaunchTasks")}
            {renderPhase("launchDay", "launchDayTasks")}
            {renderPhase("postLaunch", "postLaunchTasks")}
          </div>

          {/* Gratitude Log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100"
          >
            <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Gratitude Log
            </h3>
            <p className="text-sm text-amber-800 mb-4">
              Keep track of what you're thankful for throughout your launch journey.
            </p>

            <div className="space-y-2 mb-4">
              {checklistData.gratitudeLog.map((entry, index) => (
                <div key={index} className="bg-white/60 rounded-lg p-3 text-sm">
                  <span className="text-amber-600 text-xs">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  <p className="text-gray-700">{entry.gratitude}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newGratitude}
                onChange={(e) => setNewGratitude(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGratitude()}
                placeholder="What are you thankful for today?"
                className="flex-1 bg-white/80"
              />
              <Button onClick={addGratitude} disabled={!newGratitude.trim()} variant="outline" className="bg-white">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Accountability Partner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Accountability Partner
            </h3>
            <Input
              value={checklistData.accountabilityPartner}
              onChange={(e) => {
                setChecklistData((prev) => ({ ...prev, accountabilityPartner: e.target.value }));
                setHasChanges(true);
              }}
              placeholder="Who's keeping you accountable?"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
