import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Rocket, Plus, Sparkles, Target, ChevronRight,
  Calendar, MoreHorizontal, Archive, Trash2,
  Lightbulb, TrendingUp, CheckCircle2, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const STAGE_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  ideation: { label: "Ideation", color: "text-purple-600", icon: Lightbulb, bg: "bg-purple-100" },
  validation: { label: "Validation", color: "text-blue-600", icon: Target, bg: "bg-blue-100" },
  planning: { label: "Planning", color: "text-amber-600", icon: Clock, bg: "bg-amber-100" },
  "pre-launch": { label: "Pre-Launch", color: "text-orange-600", icon: TrendingUp, bg: "bg-orange-100" },
  launched: { label: "Launched!", color: "text-green-600", icon: CheckCircle2, bg: "bg-green-100" },
};

const PRODUCT_TYPES = [
  { value: "digital", label: "Digital Product", emoji: "💻" },
  { value: "physical", label: "Physical Product", emoji: "📦" },
  { value: "service", label: "Service", emoji: "🤝" },
  { value: "ministry", label: "Ministry/Non-Profit", emoji: "⛪" },
];

export default function ProductLaunchHub() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: "",
    productDescription: "",
    productType: "digital",
    prayerCommitment: "",
    scriptureAnchor: "",
  });

  const { data, isLoading } = useQuery<{ sessions: ProductLaunchSession[] }>({
    queryKey: ["/api/product-launch/sessions"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newProduct) => {
      return apiRequest<{ session: ProductLaunchSession }>("POST", "/api/product-launch/sessions", data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-launch/sessions"] });
      setIsCreateOpen(false);
      setNewProduct({ productName: "", productDescription: "", productType: "digital", prayerCommitment: "", scriptureAnchor: "" });
      setLocation(`/product-launch/${result.session.id}`);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/product-launch/sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-launch/sessions"] });
    },
  });

  const sessions = data?.sessions || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />

      <div className="pt-20 pb-12">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Faith-Powered Entrepreneurship
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Launch Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">God-Given Idea</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
              Turn your vision into reality with tools designed for Kingdom entrepreneurs.
            </p>

            <p className="text-sm text-gray-500 italic">
              "Be fruitful and multiply; fill the earth and subdue it." — Genesis 1:28
            </p>
          </motion.div>

          {/* Create New Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-12"
          >
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 px-8 py-6 text-lg rounded-2xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start a New Venture
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-2xl">
                    <Rocket className="w-6 h-6 text-blue-600" />
                    Let's Build Something Great
                  </DialogTitle>
                  <DialogDescription>
                    Every great venture starts with a single step. What's God putting on your heart?
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      What's your product or idea called?
                    </label>
                    <Input
                      placeholder="e.g., Faith Fitness App, Christian Clothing Line..."
                      value={newProduct.productName}
                      onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      What type of venture is this?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRODUCT_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setNewProduct({ ...newProduct, productType: type.value })}
                          className={`p-3 rounded-xl border-2 transition-all text-left ${
                            newProduct.productType === type.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-xl mr-2">{type.emoji}</span>
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Describe your idea in a few sentences
                    </label>
                    <Textarea
                      placeholder="What problem does it solve? Who is it for?"
                      value={newProduct.productDescription}
                      onChange={(e) => setNewProduct({ ...newProduct, productDescription: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your prayer commitment for this venture (optional)
                    </label>
                    <Textarea
                      placeholder="e.g., I commit to praying over this venture daily..."
                      value={newProduct.prayerCommitment}
                      onChange={(e) => setNewProduct({ ...newProduct, prayerCommitment: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <Button
                    onClick={() => createMutation.mutate(newProduct)}
                    disabled={!newProduct.productName || createMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {createMutation.isPending ? (
                      "Creating..."
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 mr-2" />
                        Launch This Venture
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Sessions Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No ventures yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Ready to turn your God-given idea into reality? Click the button above to start your first venture!
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {sessions.map((session, index) => {
                  const stageConfig = STAGE_CONFIG[session.stage] || STAGE_CONFIG.ideation;
                  const StageIcon = stageConfig.icon;
                  const productType = PRODUCT_TYPES.find((t) => t.value === session.productType);

                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/product-launch/${session.id}`}>
                        <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden">
                          {/* Gradient accent */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {productType && <span className="text-lg">{productType.emoji}</span>}
                                <h3 className="font-bold text-gray-900 text-lg truncate">
                                  {session.productName || "Untitled Venture"}
                                </h3>
                              </div>
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stageConfig.bg} ${stageConfig.color}`}>
                                <StageIcon className="w-3 h-3" />
                                {stageConfig.label}
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault();
                                    archiveMutation.mutate(session.id);
                                  }}
                                  className="text-red-600"
                                >
                                  <Archive className="w-4 h-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Description */}
                          {session.productDescription && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {session.productDescription}
                            </p>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(session.updatedAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Continue
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 grid md:grid-cols-4 gap-4"
          >
            {[
              { icon: Target, title: "SWOT Builder", desc: "Analyze strengths with a faith lens", color: "blue" },
              { icon: TrendingUp, title: "GTM Canvas", desc: "Plan your Kingdom-aligned strategy", color: "purple" },
              { icon: Sparkles, title: "Pricing Calculator", desc: "Fair pricing with generosity tiers", color: "amber" },
              { icon: CheckCircle2, title: "Launch Checklist", desc: "Prayer milestones included", color: "green" },
            ].map((feature, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl bg-${feature.color}-50 border border-${feature.color}-100`}
              >
                <feature.icon className={`w-8 h-8 text-${feature.color}-600 mb-2`} />
                <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
