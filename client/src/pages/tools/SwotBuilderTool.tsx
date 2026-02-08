import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "wouter";
import {
  ArrowLeft, Target, Shield, AlertTriangle, TrendingUp,
  Plus, X, Save, Loader2, Lightbulb, Heart, CheckCircle2,
  Sparkles, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/Navbar";

interface SwotItem {
  id: string;
  item: string;
  faithReflection?: string;
  godGiven?: boolean;
  growthArea?: string;
  trustInGod?: string;
  kingdomOpportunity?: string;
  faithResponse?: string;
}

interface SwotData {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  actionItems: { action: string; priority: string; deadline: string }[];
  prayerPoints: string[];
}

const QUADRANT_CONFIG = {
  strengths: {
    title: "Strengths",
    icon: Shield,
    color: "green",
    bgGradient: "from-green-50 to-emerald-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    iconBg: "bg-green-100",
    prompt: "What God-given gifts and abilities do you bring to this venture?",
    faithQuestion: "How does this strength honor God's gifts to you?",
    scripture: "1 Peter 4:10",
    scriptureText: "Each of you should use whatever gift you have received to serve others.",
  },
  weaknesses: {
    title: "Weaknesses",
    icon: AlertTriangle,
    color: "amber",
    bgGradient: "from-amber-50 to-yellow-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    iconBg: "bg-amber-100",
    prompt: "Where do you need to grow or seek help?",
    faithQuestion: "How can you trust God in this area of growth?",
    scripture: "2 Corinthians 12:9",
    scriptureText: "My grace is sufficient for you, for my power is made perfect in weakness.",
  },
  opportunities: {
    title: "Opportunities",
    icon: TrendingUp,
    color: "blue",
    bgGradient: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    iconBg: "bg-blue-100",
    prompt: "What doors is God opening for your venture?",
    faithQuestion: "How could this opportunity serve Kingdom purposes?",
    scripture: "Revelation 3:8",
    scriptureText: "I have placed before you an open door that no one can shut.",
  },
  threats: {
    title: "Threats",
    icon: Target,
    color: "red",
    bgGradient: "from-red-50 to-rose-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    iconBg: "bg-red-100",
    prompt: "What challenges or obstacles might you face?",
    faithQuestion: "How will you respond in faith to this challenge?",
    scripture: "Isaiah 41:10",
    scriptureText: "Fear not, for I am with you; be not dismayed, for I am your God.",
  },
};

type QuadrantKey = keyof typeof QUADRANT_CONFIG;

export default function SwotBuilderTool() {
  const { sessionId } = useParams();
  const queryClient = useQueryClient();

  const [swotData, setSwotData] = useState<SwotData>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    actionItems: [],
    prayerPoints: [],
  });

  const [newItems, setNewItems] = useState<Record<QuadrantKey, string>>({
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
  });

  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: sessionData, isLoading } = useQuery<any>({
    queryKey: [`/api/product-launch/sessions/${sessionId}`],
    enabled: !!sessionId,
  });

  // Load existing data
  useEffect(() => {
    if (sessionData?.tools?.swot) {
      setSwotData({
        strengths: sessionData.tools.swot.strengths || [],
        weaknesses: sessionData.tools.swot.weaknesses || [],
        opportunities: sessionData.tools.swot.opportunities || [],
        threats: sessionData.tools.swot.threats || [],
        actionItems: sessionData.tools.swot.actionItems || [],
        prayerPoints: sessionData.tools.swot.prayerPoints || [],
      });
    }
  }, [sessionData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", `/api/product-launch/sessions/${sessionId}/swot`, swotData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/product-launch/sessions/${sessionId}`] });
      setHasChanges(false);
    },
  });

  const handleAddItem = (quadrant: QuadrantKey) => {
    if (!newItems[quadrant].trim()) return;

    const newItem: SwotItem = {
      id: `${quadrant}-${Date.now()}`,
      item: newItems[quadrant].trim(),
    };

    setSwotData((prev) => ({
      ...prev,
      [quadrant]: [...prev[quadrant], newItem],
    }));
    setNewItems((prev) => ({ ...prev, [quadrant]: "" }));
    setHasChanges(true);
  };

  const handleRemoveItem = (quadrant: QuadrantKey, itemId: string) => {
    setSwotData((prev) => ({
      ...prev,
      [quadrant]: prev[quadrant].filter((item) => item.id !== itemId),
    }));
    setHasChanges(true);
  };

  const handleUpdateItemReflection = (quadrant: QuadrantKey, itemId: string, field: string, value: string) => {
    setSwotData((prev) => ({
      ...prev,
      [quadrant]: prev[quadrant].map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
    setHasChanges(true);
  };

  const getTotalItems = () => {
    return swotData.strengths.length + swotData.weaknesses.length + swotData.opportunities.length + swotData.threats.length;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <Target className="w-7 h-7 text-blue-600" />
                  SWOT Builder
                </h1>
                <p className="text-gray-600 text-sm">
                  Analyze your venture with a faith-centered perspective
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {getTotalItems()} items
              </span>
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
                {hasChanges ? "Save Changes" : "Saved"}
              </Button>
            </div>
          </motion.div>

          {/* Intro Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 mb-1">Building with Wisdom</h2>
                <p className="text-gray-600 text-sm mb-2">
                  "By wisdom a house is built, and through understanding it is established; through knowledge its rooms are filled with rare and beautiful treasures." — <em>Proverbs 24:3-4</em>
                </p>
                <p className="text-gray-500 text-sm">
                  Take time to honestly assess where you are. Add items to each quadrant, then click on them to add faith reflections.
                </p>
              </div>
            </div>
          </motion.div>

          {/* SWOT Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {(Object.keys(QUADRANT_CONFIG) as QuadrantKey[]).map((quadrant, index) => {
              const config = QUADRANT_CONFIG[quadrant];
              const Icon = config.icon;
              const items = swotData[quadrant];

              return (
                <motion.div
                  key={quadrant}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br ${config.bgGradient} rounded-2xl p-5 border ${config.borderColor}`}
                >
                  {/* Quadrant Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 ${config.iconBg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${config.textColor}`} />
                    </div>
                    <div>
                      <h3 className={`font-bold ${config.textColor}`}>{config.title}</h3>
                      <p className="text-sm text-gray-600">{config.prompt}</p>
                    </div>
                  </div>

                  {/* Scripture */}
                  <div className="bg-white/60 rounded-lg px-3 py-2 mb-4 text-xs text-gray-600 italic">
                    <BookOpen className="w-3 h-3 inline mr-1" />
                    {config.scripture}: "{config.scriptureText}"
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 mb-4 min-h-[100px]">
                    <AnimatePresence>
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                          <div
                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                          >
                            <span className="text-gray-800 text-sm font-medium">{item.item}</span>
                            <div className="flex items-center gap-2">
                              {item.faithReflection && (
                                <Heart className="w-4 h-4 text-red-400" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveItem(quadrant, item.id);
                                }}
                                className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Faith Reflection */}
                          <AnimatePresence>
                            {expandedItem === item.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-3 pb-3 border-t border-gray-100 bg-gray-50"
                              >
                                <div className="pt-3">
                                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                                    <Heart className="w-3 h-3 inline mr-1" />
                                    {config.faithQuestion}
                                  </label>
                                  <Textarea
                                    value={item.faithReflection || ""}
                                    onChange={(e) => handleUpdateItemReflection(quadrant, item.id, "faithReflection", e.target.value)}
                                    placeholder="Your faith reflection..."
                                    rows={2}
                                    className="text-sm"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {items.length === 0 && (
                      <div className="text-center py-6 text-gray-400 text-sm">
                        No items yet. Add your first one below!
                      </div>
                    )}
                  </div>

                  {/* Add New Item */}
                  <div className="flex gap-2">
                    <Input
                      value={newItems[quadrant]}
                      onChange={(e) => setNewItems((prev) => ({ ...prev, [quadrant]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleAddItem(quadrant)}
                      placeholder={`Add a ${config.title.toLowerCase().slice(0, -1)}...`}
                      className="flex-1 bg-white/80 border-gray-200"
                    />
                    <Button
                      onClick={() => handleAddItem(quadrant)}
                      disabled={!newItems[quadrant].trim()}
                      size="icon"
                      variant="outline"
                      className="bg-white hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Summary Section */}
          {getTotalItems() > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Your SWOT Summary
              </h3>

              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">{swotData.strengths.length}</div>
                  <div className="text-sm text-green-700">Strengths</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl">
                  <div className="text-3xl font-bold text-amber-600">{swotData.weaknesses.length}</div>
                  <div className="text-sm text-amber-700">Weaknesses</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">{swotData.opportunities.length}</div>
                  <div className="text-sm text-blue-700">Opportunities</div>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <div className="text-3xl font-bold text-red-600">{swotData.threats.length}</div>
                  <div className="text-sm text-red-700">Threats</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <p className="text-sm text-amber-800">
                  <Lightbulb className="w-4 h-4 inline mr-1" />
                  <strong>Next Step:</strong> Use your strengths to pursue opportunities, while addressing weaknesses and preparing for threats. Take time to pray over each area!
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
