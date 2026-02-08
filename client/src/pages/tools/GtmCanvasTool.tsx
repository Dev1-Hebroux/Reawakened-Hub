import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "wouter";
import {
  ArrowLeft, Compass, Save, Loader2, Users, Target, Megaphone,
  Handshake, Building, ChevronDown, ChevronUp, Plus, X, Sparkles,
  Heart, MessageCircle, Scale, Edit3, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/Navbar";

interface GtmCanvasData {
  targetMarket: {
    primaryAudience: string;
    demographics: string;
    psychographics: string;
    painPoints: string[];
  };
  customerPersonas: { id: string; name: string; age: string; story: string; needs: string; faithJourney: string }[];
  valueProposition: {
    uniqueBenefit: string;
    problemSolved: string;
    kingdomValue: string;
  };
  competitorAnalysis: { id: string; name: string; strengths: string; weaknesses: string; differentiation: string }[];
  distributionChannels: { id: string; channel: string; strategy: string; faithAlignment: string }[];
  marketingChannels: { id: string; channel: string; content: string; integrity: string }[];
  partnerships: { id: string; partner: string; relationship: string; kingdomSynergy: string }[];
  positioningStatement: string;
  brandValues: { id: string; value: string; meaning: string; biblicalBasis: string }[];
  messagingPillars: { id: string; pillar: string; keyMessage: string }[];
  stewardshipReflection: string;
  integrityCommitment: string;
}

const DEFAULT_DATA: GtmCanvasData = {
  targetMarket: { primaryAudience: "", demographics: "", psychographics: "", painPoints: [] },
  customerPersonas: [],
  valueProposition: { uniqueBenefit: "", problemSolved: "", kingdomValue: "" },
  competitorAnalysis: [],
  distributionChannels: [],
  marketingChannels: [],
  partnerships: [],
  positioningStatement: "",
  brandValues: [],
  messagingPillars: [],
  stewardshipReflection: "",
  integrityCommitment: "",
};

interface SectionConfig {
  id: string;
  title: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
}

const SECTIONS: SectionConfig[] = [
  { id: "target", title: "Target Market", icon: Users, color: "blue", bgColor: "bg-blue-50", description: "Who are you serving?" },
  { id: "value", title: "Value Proposition", icon: Target, color: "purple", bgColor: "bg-purple-50", description: "What unique value do you offer?" },
  { id: "channels", title: "Channels", icon: Megaphone, color: "green", bgColor: "bg-green-50", description: "How will you reach customers?" },
  { id: "positioning", title: "Positioning", icon: Building, color: "amber", bgColor: "bg-amber-50", description: "How do you want to be perceived?" },
  { id: "stewardship", title: "Stewardship", icon: Heart, color: "red", bgColor: "bg-red-50", description: "How does this serve God's purposes?" },
];

export default function GtmCanvasTool() {
  const { sessionId } = useParams();
  const queryClient = useQueryClient();

  const [canvasData, setCanvasData] = useState<GtmCanvasData>(DEFAULT_DATA);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    target: true,
    value: false,
    channels: false,
    positioning: false,
    stewardship: false,
  });
  const [hasChanges, setHasChanges] = useState(false);

  const { data: sessionData, isLoading } = useQuery<any>({
    queryKey: [`/api/product-launch/sessions/${sessionId}`],
    enabled: !!sessionId,
  });

  // Load existing data
  useEffect(() => {
    if (sessionData?.tools?.gtmCanvas) {
      setCanvasData({ ...DEFAULT_DATA, ...sessionData.tools.gtmCanvas });
    }
  }, [sessionData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", `/api/product-launch/sessions/${sessionId}/gtm-canvas`, canvasData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/product-launch/sessions/${sessionId}`] });
      setHasChanges(false);
    },
  });

  const updateField = (path: string, value: any) => {
    setCanvasData((prev) => {
      const keys = path.split(".");
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    setHasChanges(true);
  };

  const addArrayItem = (path: string, item: any) => {
    setCanvasData((prev) => {
      const keys = path.split(".");
      const newData = { ...prev };
      let current: any = newData;
      for (const key of keys.slice(0, -1)) {
        current[key] = { ...current[key] };
        current = current[key];
      }
      const lastKey = keys[keys.length - 1];
      current[lastKey] = [...(current[lastKey] || []), item];
      return newData;
    });
    setHasChanges(true);
  };

  const removeArrayItem = (path: string, id: string) => {
    setCanvasData((prev) => {
      const keys = path.split(".");
      const newData = { ...prev };
      let current: any = newData;
      for (const key of keys.slice(0, -1)) {
        current[key] = { ...current[key] };
        current = current[key];
      }
      const lastKey = keys[keys.length - 1];
      current[lastKey] = current[lastKey].filter((item: any) => item.id !== id);
      return newData;
    });
    setHasChanges(true);
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  const renderSection = (config: SectionConfig) => {
    const Icon = config.icon;
    const isExpanded = expandedSections[config.id];

    return (
      <motion.div
        key={config.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${config.bgColor} rounded-2xl border border-${config.color}-200 overflow-hidden`}
      >
        <button
          onClick={() => toggleSection(config.id)}
          className="w-full p-4 flex items-center justify-between hover:bg-white/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Icon className={`w-5 h-5 text-${config.color}-600`} />
            </div>
            <div className="text-left">
              <h3 className={`font-bold text-${config.color}-700`}>{config.title}</h3>
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4"
            >
              {config.id === "target" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Primary Audience</label>
                    <Input
                      value={canvasData.targetMarket.primaryAudience}
                      onChange={(e) => updateField("targetMarket.primaryAudience", e.target.value)}
                      placeholder="e.g., Young Christian professionals aged 25-35"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Demographics</label>
                    <Textarea
                      value={canvasData.targetMarket.demographics}
                      onChange={(e) => updateField("targetMarket.demographics", e.target.value)}
                      placeholder="Age, location, income, education..."
                      rows={2}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Psychographics</label>
                    <Textarea
                      value={canvasData.targetMarket.psychographics}
                      onChange={(e) => updateField("targetMarket.psychographics", e.target.value)}
                      placeholder="Values, interests, lifestyle, faith journey..."
                      rows={2}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Pain Points</label>
                    <div className="space-y-2 mb-2">
                      {canvasData.targetMarket.painPoints.map((pain, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                          <span className="flex-1 text-sm">{pain}</span>
                          <button
                            onClick={() => {
                              const newPains = canvasData.targetMarket.painPoints.filter((_, idx) => idx !== i);
                              updateField("targetMarket.painPoints", newPains);
                            }}
                            className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a pain point..."
                        className="bg-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                            updateField("targetMarket.painPoints", [
                              ...canvasData.targetMarket.painPoints,
                              (e.target as HTMLInputElement).value.trim(),
                            ]);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {config.id === "value" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Unique Benefit</label>
                    <Textarea
                      value={canvasData.valueProposition.uniqueBenefit}
                      onChange={(e) => updateField("valueProposition.uniqueBenefit", e.target.value)}
                      placeholder="What makes your offering unique and valuable?"
                      rows={2}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Problem Solved</label>
                    <Textarea
                      value={canvasData.valueProposition.problemSolved}
                      onChange={(e) => updateField("valueProposition.problemSolved", e.target.value)}
                      placeholder="What specific problem does this solve for your customers?"
                      rows={2}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      Kingdom Value
                    </label>
                    <Textarea
                      value={canvasData.valueProposition.kingdomValue}
                      onChange={(e) => updateField("valueProposition.kingdomValue", e.target.value)}
                      placeholder="How does this serve God's purposes beyond profit?"
                      rows={2}
                      className="bg-white"
                    />
                  </div>
                </div>
              )}

              {config.id === "channels" && (
                <div className="space-y-6">
                  {/* Distribution Channels */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Distribution Channels</label>
                    <div className="space-y-2 mb-2">
                      {canvasData.distributionChannels.map((ch) => (
                        <div key={ch.id} className="p-3 bg-white rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{ch.channel}</span>
                            <button
                              onClick={() => removeArrayItem("distributionChannels", ch.id)}
                              className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">{ch.strategy}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addArrayItem("distributionChannels", {
                          id: `dist-${Date.now()}`,
                          channel: "New Channel",
                          strategy: "",
                          faithAlignment: "",
                        })
                      }
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Distribution Channel
                    </Button>
                  </div>

                  {/* Marketing Channels */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Marketing Channels</label>
                    <div className="space-y-2 mb-2">
                      {canvasData.marketingChannels.map((ch) => (
                        <div key={ch.id} className="p-3 bg-white rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{ch.channel}</span>
                            <button
                              onClick={() => removeArrayItem("marketingChannels", ch.id)}
                              className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">{ch.content}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addArrayItem("marketingChannels", {
                          id: `mkt-${Date.now()}`,
                          channel: "New Channel",
                          content: "",
                          integrity: "",
                        })
                      }
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Marketing Channel
                    </Button>
                  </div>

                  {/* Partnerships */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Strategic Partnerships</label>
                    <div className="space-y-2 mb-2">
                      {canvasData.partnerships.map((p) => (
                        <div key={p.id} className="p-3 bg-white rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{p.partner}</span>
                            <button
                              onClick={() => removeArrayItem("partnerships", p.id)}
                              className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">{p.relationship}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addArrayItem("partnerships", {
                          id: `part-${Date.now()}`,
                          partner: "New Partner",
                          relationship: "",
                          kingdomSynergy: "",
                        })
                      }
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Partnership
                    </Button>
                  </div>
                </div>
              )}

              {config.id === "positioning" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Positioning Statement</label>
                    <Textarea
                      value={canvasData.positioningStatement}
                      onChange={(e) => updateField("positioningStatement", e.target.value)}
                      placeholder="For [target audience] who [need], [your product] is a [category] that [key benefit]. Unlike [competitors], we [differentiator]."
                      rows={3}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Brand Values</label>
                    <div className="space-y-2 mb-2">
                      {canvasData.brandValues.map((v) => (
                        <div key={v.id} className="p-3 bg-white rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{v.value}</span>
                            <button
                              onClick={() => removeArrayItem("brandValues", v.id)}
                              className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">{v.meaning}</p>
                          {v.biblicalBasis && (
                            <p className="text-xs text-gray-500 italic mt-1">📖 {v.biblicalBasis}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addArrayItem("brandValues", {
                          id: `val-${Date.now()}`,
                          value: "New Value",
                          meaning: "",
                          biblicalBasis: "",
                        })
                      }
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Brand Value
                    </Button>
                  </div>
                </div>
              )}

              {config.id === "stewardship" && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-red-800 italic">
                      <Scale className="w-4 h-4 inline mr-1" />
                      "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters." — Colossians 3:23
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Stewardship Reflection
                    </label>
                    <Textarea
                      value={canvasData.stewardshipReflection}
                      onChange={(e) => updateField("stewardshipReflection", e.target.value)}
                      placeholder="How does this venture serve others beyond just making money? How are you being a good steward of the resources God has given you?"
                      rows={4}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Integrity Commitment
                    </label>
                    <Textarea
                      value={canvasData.integrityCommitment}
                      onChange={(e) => updateField("integrityCommitment", e.target.value)}
                      placeholder="What ethical commitments will guide your business practices? How will you maintain integrity in marketing, pricing, and customer relationships?"
                      rows={4}
                      className="bg-white"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
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
                  <Compass className="w-7 h-7 text-purple-600" />
                  Go-To-Market Canvas
                </h1>
                <p className="text-gray-600 text-sm">
                  Design your Kingdom-aligned market strategy
                </p>
              </div>
            </div>

            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!hasChanges || saveMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {hasChanges ? "Save" : "Saved"}
            </Button>
          </motion.div>

          {/* Intro Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 mb-1">Plan Before You Build</h2>
                <p className="text-gray-600 text-sm mb-2">
                  "For which of you, desiring to build a tower, does not first sit down and count the cost, whether he has enough to complete it?" — <em>Luke 14:28</em>
                </p>
                <p className="text-gray-500 text-sm">
                  Work through each section to create a comprehensive go-to-market strategy that honors God and serves your customers well.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Canvas Sections */}
          <div className="space-y-4">
            {SECTIONS.map((section) => renderSection(section))}
          </div>
        </div>
      </div>
    </div>
  );
}
