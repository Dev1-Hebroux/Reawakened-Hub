import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import {
  ArrowLeft, DollarSign, Plus, X, Save, Loader2, Calculator,
  TrendingUp, Scale, Heart, Sparkles, Info, ChevronRight,
  Percent, Users, Gift, Building, Trash2
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
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/Navbar";

interface CostItem {
  id: string;
  name: string;
  amount: number;
  frequency?: string;
  perUnitCost?: number;
}

interface CompetitorPrice {
  id: string;
  competitor: string;
  price: number;
  notes?: string;
}

interface PricingData {
  fixedCosts: CostItem[];
  variableCosts: CostItem[];
  laborCosts: { id: string; role: string; hourlyRate: number; hoursPerUnit: number }[];
  totalCostPerUnit: number;
  pricingStrategy: string;
  targetMargin: number;
  recommendedPrice: number;
  competitorPrices: CompetitorPrice[];
  pricePositioning: string;
  generosityTier: { enabled: boolean; type: string; details: string };
  kingdomTithe: number;
  fairPricingReflection: string;
}

const PRICING_STRATEGIES = [
  { value: "cost-plus", label: "Cost-Plus", desc: "Add a margin to your costs" },
  { value: "value-based", label: "Value-Based", desc: "Price based on value delivered" },
  { value: "competitive", label: "Competitive", desc: "Match or beat competitors" },
  { value: "penetration", label: "Penetration", desc: "Start low to build market share" },
];

const GENEROSITY_TYPES = [
  { value: "pay-what-you-can", label: "Pay What You Can", desc: "Let customers choose" },
  { value: "scholarship", label: "Scholarship Tier", desc: "Discounts for those in need" },
  { value: "tithe-back", label: "Tithe Back", desc: "Donate a portion to ministry" },
];

export default function PricingCalculatorTool() {
  const { sessionId } = useParams();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [pricingData, setPricingData] = useState<PricingData>({
    fixedCosts: [],
    variableCosts: [],
    laborCosts: [],
    totalCostPerUnit: 0,
    pricingStrategy: "cost-plus",
    targetMargin: 30,
    recommendedPrice: 0,
    competitorPrices: [],
    pricePositioning: "mid-market",
    generosityTier: { enabled: false, type: "", details: "" },
    kingdomTithe: 10,
    fairPricingReflection: "",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [newCost, setNewCost] = useState({ name: "", amount: 0 });
  const [newCompetitor, setNewCompetitor] = useState({ competitor: "", price: 0 });

  const { data: sessionData, isLoading } = useQuery<any>({
    queryKey: [`/api/product-launch/sessions/${sessionId}`],
    enabled: !!sessionId,
  });

  // Load existing data
  useEffect(() => {
    if (sessionData?.tools?.pricing) {
      const data = sessionData.tools.pricing;
      setPricingData({
        fixedCosts: data.fixedCosts || [],
        variableCosts: data.variableCosts || [],
        laborCosts: data.laborCosts || [],
        totalCostPerUnit: data.totalCostPerUnit || 0,
        pricingStrategy: data.pricingStrategy || "cost-plus",
        targetMargin: data.targetMargin || 30,
        recommendedPrice: data.recommendedPrice || 0,
        competitorPrices: data.competitorPrices || [],
        pricePositioning: data.pricePositioning || "mid-market",
        generosityTier: data.generosityTier || { enabled: false, type: "", details: "" },
        kingdomTithe: data.kingdomTithe || 10,
        fairPricingReflection: data.fairPricingReflection || "",
      });
    }
  }, [sessionData]);

  // Calculate costs
  const calculations = useMemo(() => {
    const fixedTotal = pricingData.fixedCosts.reduce((sum, c) => sum + c.amount, 0);
    const variableTotal = pricingData.variableCosts.reduce((sum, c) => sum + (c.perUnitCost || c.amount), 0);
    const laborTotal = pricingData.laborCosts.reduce((sum, l) => sum + l.hourlyRate * l.hoursPerUnit, 0);

    const totalCostPerUnit = variableTotal + laborTotal; // Fixed costs spread differently
    const marginMultiplier = 1 + pricingData.targetMargin / 100;
    const recommendedPrice = Math.ceil(totalCostPerUnit * marginMultiplier);

    const avgCompetitorPrice = pricingData.competitorPrices.length > 0
      ? pricingData.competitorPrices.reduce((sum, c) => sum + c.price, 0) / pricingData.competitorPrices.length
      : 0;

    const grossProfit = recommendedPrice - totalCostPerUnit;
    const titheAmount = Math.round(grossProfit * (pricingData.kingdomTithe / 100));

    return {
      fixedTotal,
      variableTotal,
      laborTotal,
      totalCostPerUnit,
      recommendedPrice,
      avgCompetitorPrice,
      grossProfit,
      titheAmount,
    };
  }, [pricingData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", `/api/product-launch/sessions/${sessionId}/pricing`, {
        ...pricingData,
        totalCostPerUnit: calculations.totalCostPerUnit,
        recommendedPrice: calculations.recommendedPrice,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/product-launch/sessions/${sessionId}`] });
      setHasChanges(false);
    },
  });

  const addFixedCost = () => {
    if (!newCost.name.trim() || newCost.amount <= 0) return;
    setPricingData((prev) => ({
      ...prev,
      fixedCosts: [...prev.fixedCosts, { id: `fixed-${Date.now()}`, ...newCost }],
    }));
    setNewCost({ name: "", amount: 0 });
    setHasChanges(true);
  };

  const addVariableCost = () => {
    if (!newCost.name.trim() || newCost.amount <= 0) return;
    setPricingData((prev) => ({
      ...prev,
      variableCosts: [...prev.variableCosts, { id: `var-${Date.now()}`, name: newCost.name, amount: newCost.amount, perUnitCost: newCost.amount }],
    }));
    setNewCost({ name: "", amount: 0 });
    setHasChanges(true);
  };

  const addCompetitor = () => {
    if (!newCompetitor.competitor.trim() || newCompetitor.price <= 0) return;
    setPricingData((prev) => ({
      ...prev,
      competitorPrices: [...prev.competitorPrices, { id: `comp-${Date.now()}`, ...newCompetitor }],
    }));
    setNewCompetitor({ competitor: "", price: 0 });
    setHasChanges(true);
  };

  const removeCost = (type: "fixedCosts" | "variableCosts", id: string) => {
    setPricingData((prev) => ({
      ...prev,
      [type]: prev[type].filter((c) => c.id !== id),
    }));
    setHasChanges(true);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
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
                  <DollarSign className="w-7 h-7 text-amber-600" />
                  Pricing Calculator
                </h1>
                <p className="text-gray-600 text-sm">
                  Fair pricing with Kingdom economics
                </p>
              </div>
            </div>

            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!hasChanges || saveMutation.isPending}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {hasChanges ? "Save" : "Saved"}
            </Button>
          </motion.div>

          {/* Scripture Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100 mb-8"
          >
            <p className="text-amber-800 text-sm italic">
              <Scale className="w-4 h-4 inline mr-1" />
              "The Lord detests dishonest scales, but accurate weights find favor with him." — Proverbs 11:1
            </p>
          </motion.div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                  step === s
                    ? "bg-amber-600 text-white shadow-lg"
                    : step > s
                    ? "bg-amber-200 text-amber-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Step 1: Costs */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-600" />
                  Your Costs
                </h2>

                {/* Variable Costs (per unit) */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">Variable Costs (per unit)</h3>
                  <p className="text-sm text-gray-500 mb-3">Materials, supplies, shipping per item</p>

                  <div className="space-y-2 mb-3">
                    {pricingData.variableCosts.map((cost) => (
                      <div key={cost.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{cost.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(cost.amount)}</span>
                          <button
                            onClick={() => removeCost("variableCosts", cost.id)}
                            className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Cost name"
                      value={newCost.name}
                      onChange={(e) => setNewCost({ ...newCost, name: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="£0.00"
                      value={newCost.amount || ""}
                      onChange={(e) => setNewCost({ ...newCost, amount: parseFloat(e.target.value) * 100 || 0 })}
                      className="w-24"
                    />
                    <Button onClick={addVariableCost} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Fixed Costs */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Fixed Costs (monthly)</h3>
                  <p className="text-sm text-gray-500 mb-3">Rent, subscriptions, tools</p>

                  <div className="space-y-2 mb-3">
                    {pricingData.fixedCosts.map((cost) => (
                      <div key={cost.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{cost.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(cost.amount)}/mo</span>
                          <button
                            onClick={() => removeCost("fixedCosts", cost.id)}
                            className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Cost name"
                      value={newCost.name}
                      onChange={(e) => setNewCost({ ...newCost, name: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="£0.00"
                      value={newCost.amount || ""}
                      onChange={(e) => setNewCost({ ...newCost, amount: parseFloat(e.target.value) * 100 || 0 })}
                      className="w-24"
                    />
                    <Button onClick={addFixedCost} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} className="bg-amber-600 hover:bg-amber-700">
                  Next: Pricing Strategy
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Strategy */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  Pricing Strategy
                </h2>

                <div className="grid md:grid-cols-2 gap-3 mb-6">
                  {PRICING_STRATEGIES.map((strategy) => (
                    <button
                      key={strategy.value}
                      onClick={() => {
                        setPricingData((prev) => ({ ...prev, pricingStrategy: strategy.value }));
                        setHasChanges(true);
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        pricingData.pricingStrategy === strategy.value
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <h4 className="font-medium text-gray-900">{strategy.label}</h4>
                      <p className="text-sm text-gray-600">{strategy.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="font-medium text-gray-700 mb-2 block">
                    Target Profit Margin: {pricingData.targetMargin}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={pricingData.targetMargin}
                    onChange={(e) => {
                      setPricingData((prev) => ({ ...prev, targetMargin: parseInt(e.target.value) }));
                      setHasChanges(true);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10% (Low)</span>
                    <span>50% (Healthy)</span>
                    <span>80% (High)</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="font-medium text-gray-700 mb-2 block">Competitor Prices</label>
                  <div className="space-y-2 mb-3">
                    {pricingData.competitorPrices.map((comp) => (
                      <div key={comp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{comp.competitor}</span>
                        <span className="font-medium">{formatCurrency(comp.price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Competitor name"
                      value={newCompetitor.competitor}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, competitor: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="£0.00"
                      value={newCompetitor.price || ""}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, price: parseFloat(e.target.value) * 100 || 0 })}
                      className="w-24"
                    />
                    <Button onClick={addCompetitor} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button onClick={() => setStep(1)} variant="outline">Back</Button>
                <Button onClick={() => setStep(3)} className="bg-amber-600 hover:bg-amber-700">
                  Next: Generosity
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Generosity */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Kingdom Economics
                </h2>

                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-red-800">
                    "Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap." — Luke 6:38
                  </p>
                </div>

                {/* Generosity Tier */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Enable Generosity Tier?</h3>
                      <p className="text-sm text-gray-600">Offer accessible pricing options</p>
                    </div>
                    <Switch
                      checked={pricingData.generosityTier.enabled}
                      onCheckedChange={(checked) => {
                        setPricingData((prev) => ({
                          ...prev,
                          generosityTier: { ...prev.generosityTier, enabled: checked },
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  {pricingData.generosityTier.enabled && (
                    <div className="space-y-3">
                      {GENEROSITY_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => {
                            setPricingData((prev) => ({
                              ...prev,
                              generosityTier: { ...prev.generosityTier, type: type.value },
                            }));
                            setHasChanges(true);
                          }}
                          className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                            pricingData.generosityTier.type === type.value
                              ? "border-red-400 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <h4 className="font-medium text-gray-900">{type.label}</h4>
                          <p className="text-sm text-gray-600">{type.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Kingdom Tithe */}
                <div className="mb-6">
                  <label className="font-medium text-gray-700 mb-2 block">
                    <Gift className="w-4 h-4 inline mr-1" />
                    Kingdom Tithe: {pricingData.kingdomTithe}% of profit to ministry/charity
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={pricingData.kingdomTithe}
                    onChange={(e) => {
                      setPricingData((prev) => ({ ...prev, kingdomTithe: parseInt(e.target.value) }));
                      setHasChanges(true);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                {/* Fair Pricing Reflection */}
                <div>
                  <label className="font-medium text-gray-700 mb-2 block">
                    Fair Pricing Reflection
                  </label>
                  <Textarea
                    value={pricingData.fairPricingReflection}
                    onChange={(e) => {
                      setPricingData((prev) => ({ ...prev, fairPricingReflection: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="How does your pricing honor God and serve others fairly?"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button onClick={() => setStep(2)} variant="outline">Back</Button>
                <Button onClick={() => setStep(4)} className="bg-amber-600 hover:bg-amber-700">
                  See Results
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Results */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  Your Pricing Summary
                </h2>

                {/* Main Price Card */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white text-center mb-6">
                  <p className="text-amber-100 mb-2">Recommended Price</p>
                  <div className="text-5xl font-bold mb-2">
                    {formatCurrency(calculations.recommendedPrice)}
                  </div>
                  <p className="text-amber-100 text-sm">
                    Based on {pricingData.targetMargin}% margin over {formatCurrency(calculations.totalCostPerUnit)} cost
                  </p>
                </div>

                {/* Breakdown */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Cost per Unit</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculations.totalCostPerUnit)}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-600 mb-1">Gross Profit</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(calculations.grossProfit)}</p>
                  </div>
                </div>

                {/* Kingdom Tithe */}
                {pricingData.kingdomTithe > 0 && (
                  <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">Kingdom Tithe ({pricingData.kingdomTithe}%)</p>
                        <p className="text-sm text-red-700">Per sale going to ministry/charity</p>
                      </div>
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(calculations.titheAmount)}</p>
                    </div>
                  </div>
                )}

                {/* Competitor Comparison */}
                {calculations.avgCompetitorPrice > 0 && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-600 mb-1">vs. Competitor Average</p>
                    <p className="text-lg font-medium text-blue-900">
                      {calculations.recommendedPrice > calculations.avgCompetitorPrice
                        ? `${formatCurrency(calculations.recommendedPrice - calculations.avgCompetitorPrice)} higher`
                        : calculations.recommendedPrice < calculations.avgCompetitorPrice
                        ? `${formatCurrency(calculations.avgCompetitorPrice - calculations.recommendedPrice)} lower`
                        : "Same price"}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button onClick={() => setStep(3)} variant="outline">Back</Button>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Pricing
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
