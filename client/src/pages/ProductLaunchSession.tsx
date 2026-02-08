import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import {
  ArrowLeft, Rocket, Edit3, Save, Target, DollarSign,
  CheckSquare, Compass, Lightbulb, TrendingUp, CheckCircle2,
  Clock, BookOpen, Sparkles, Lock, ChevronRight, Users,
  Heart, Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/Navbar";

interface ProductLaunchSession {
  id: number;
  productName: string | null;
  productDescription: string | null;
  productType: string | null;
  stage: string;
  prayerCommitment: string | null;
  scriptureAnchor: string | null;
  kingdomImpact: string | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SessionData {
  session: ProductLaunchSession;
  tools: {
    swot: any | null;
    gtmCanvas: any | null;
    pricing: any | null;
    checklist: any | null;
  };
  milestones: any[];
}

const STAGE_OPTIONS = [
  { value: "ideation", label: "Ideation", icon: Lightbulb, color: "purple" },
  { value: "validation", label: "Validation", icon: Target, color: "blue" },
  { value: "planning", label: "Planning", icon: Clock, color: "amber" },
  { value: "pre-launch", label: "Pre-Launch", icon: TrendingUp, color: "orange" },
  { value: "launched", label: "Launched!", icon: CheckCircle2, color: "green" },
];

const TOOLS = [
  {
    id: "swot",
    title: "SWOT Builder",
    description: "Analyze your strengths, weaknesses, opportunities, and threats with a faith perspective",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    path: "swot",
    scripture: "Proverbs 24:3-4",
  },
  {
    id: "gtm-canvas",
    title: "Go-To-Market Canvas",
    description: "Design your market strategy with Kingdom values at the center",
    icon: Compass,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    path: "gtm-canvas",
    scripture: "Luke 14:28",
  },
  {
    id: "pricing",
    title: "Pricing Calculator",
    description: "Set fair prices with generosity tiers and ethical considerations",
    icon: DollarSign,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    path: "pricing",
    scripture: "Proverbs 11:1",
  },
  {
    id: "checklist",
    title: "Launch Checklist",
    description: "Track your progress with prayer milestones and accountability",
    icon: CheckSquare,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    path: "checklist",
    scripture: "Ecclesiastes 3:1",
  },
];

export default function ProductLaunchSession() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ProductLaunchSession>>({});

  const { data, isLoading, error } = useQuery<SessionData>({
    queryKey: [`/api/product-launch/sessions/${sessionId}`],
    enabled: !!sessionId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<ProductLaunchSession>) => {
      return apiRequest<{ session: ProductLaunchSession }>("PUT", `/api/product-launch/sessions/${sessionId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/product-launch/sessions/${sessionId}`] });
      setIsEditing(false);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading your venture...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-gray-600">Could not load this venture. Please try again.</p>
          <Link href="/product-launch">
            <Button variant="outline" className="mt-4">Back to Hub</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { session, tools } = data;
  const currentStage = STAGE_OPTIONS.find((s) => s.value === session.stage) || STAGE_OPTIONS[0];

  const getToolStatus = (toolId: string) => {
    const toolKey = toolId === "gtm-canvas" ? "gtmCanvas" : toolId;
    const toolData = tools[toolKey as keyof typeof tools];
    if (!toolData) return { status: "not-started", label: "Not Started" };

    // Check if tool has meaningful data
    if (toolId === "swot") {
      const hasData = toolData.strengths?.length || toolData.weaknesses?.length || toolData.opportunities?.length || toolData.threats?.length;
      return hasData ? { status: "in-progress", label: "In Progress" } : { status: "not-started", label: "Not Started" };
    }
    if (toolId === "checklist") {
      const tasks = [...(toolData.preLaunchTasks || []), ...(toolData.launchDayTasks || []), ...(toolData.postLaunchTasks || [])];
      const completed = tasks.filter((t: any) => t.completed).length;
      if (tasks.length === 0) return { status: "not-started", label: "Not Started" };
      if (completed === tasks.length) return { status: "completed", label: "Completed!" };
      return { status: "in-progress", label: `${completed}/${tasks.length} done` };
    }

    return { status: "in-progress", label: "In Progress" };
  };

  const handleStartEdit = () => {
    setEditForm({
      productName: session.productName || "",
      productDescription: session.productDescription || "",
      stage: session.stage,
      prayerCommitment: session.prayerCommitment || "",
      scriptureAnchor: session.scriptureAnchor || "",
      kingdomImpact: session.kingdomImpact || "",
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateMutation.mutate(editForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link href="/product-launch">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">All Ventures</span>
              </button>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
          >
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Rocket className="w-10 h-10 text-blue-600" />
                  <Input
                    value={editForm.productName || ""}
                    onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
                    placeholder="Venture name"
                    className="text-2xl font-bold border-0 border-b-2 rounded-none px-0 focus-visible:ring-0"
                  />
                </div>

                <Textarea
                  value={editForm.productDescription || ""}
                  onChange={(e) => setEditForm({ ...editForm, productDescription: e.target.value })}
                  placeholder="Describe your venture..."
                  rows={2}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Stage</label>
                    <Select value={editForm.stage} onValueChange={(v) => setEditForm({ ...editForm, stage: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGE_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Guiding Scripture</label>
                    <Input
                      value={editForm.scriptureAnchor || ""}
                      onChange={(e) => setEditForm({ ...editForm, scriptureAnchor: e.target.value })}
                      placeholder="e.g., Jeremiah 29:11"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Prayer Commitment</label>
                  <Textarea
                    value={editForm.prayerCommitment || ""}
                    onChange={(e) => setEditForm({ ...editForm, prayerCommitment: e.target.value })}
                    placeholder="Your prayer commitment for this venture..."
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Kingdom Impact</label>
                  <Textarea
                    value={editForm.kingdomImpact || ""}
                    onChange={(e) => setEditForm({ ...editForm, kingdomImpact: e.target.value })}
                    placeholder="How does this serve God's purposes?"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Rocket className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {session.productName || "Untitled Venture"}
                      </h1>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 bg-${currentStage.color}-100 text-${currentStage.color}-700`}>
                        <currentStage.icon className="w-3 h-3" />
                        {currentStage.label}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleStartEdit}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>

                {session.productDescription && (
                  <p className="text-gray-600 mb-4">{session.productDescription}</p>
                )}

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  {session.scriptureAnchor && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      <span className="italic">{session.scriptureAnchor}</span>
                    </div>
                  )}
                  {session.prayerCommitment && (
                    <div className="flex items-start gap-2 text-gray-600 md:col-span-2">
                      <Heart className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{session.prayerCommitment}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>

          {/* Tools Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Your Launch Toolkit
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {TOOLS.map((tool, index) => {
                const status = getToolStatus(tool.id);
                const Icon = tool.icon;

                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.05 }}
                  >
                    <Link href={`/product-launch/${sessionId}/${tool.path}`}>
                      <div className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden">
                        {/* Gradient accent */}
                        <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${tool.color}`} />

                        <div className="flex items-start gap-4 pl-2">
                          <div className={`w-12 h-12 ${tool.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-6 h-6 ${tool.textColor}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-gray-900">{tool.title}</h3>
                              <div className={`text-xs px-2 py-0.5 rounded-full ${
                                status.status === "completed" ? "bg-green-100 text-green-700" :
                                status.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                                "bg-gray-100 text-gray-500"
                              }`}>
                                {status.label}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{tool.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400 italic">{tool.scripture}</span>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100"
          >
            <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Quick Tip
            </h3>
            <p className="text-amber-800 text-sm">
              Start with the <strong>SWOT Builder</strong> to understand your position, then move to the{" "}
              <strong>GTM Canvas</strong> to plan your strategy. Use the <strong>Pricing Calculator</strong>{" "}
              to set fair prices, and track everything with the <strong>Launch Checklist</strong>.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
