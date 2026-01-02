import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Compass, Plus, Loader2, Search, MoreVertical, 
  Target, Users, TrendingUp, Edit, Trash2, 
  Check, X, BookOpen, BarChart3, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { GoalTemplate } from "@shared/schema";

const CATEGORIES = [
  { value: "faith", label: "Faith" },
  { value: "career", label: "Career" },
  { value: "health", label: "Health" },
  { value: "relationships", label: "Relationships" },
  { value: "finance", label: "Finance" },
  { value: "personal", label: "Personal" },
];

const TIMEFRAMES = [
  { value: "30_days", label: "30 Days" },
  { value: "90_days", label: "90 Days" },
  { value: "6_months", label: "6 Months" },
  { value: "1_year", label: "1 Year" },
];

const DIFFICULTIES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case "faith": return "bg-purple-100 text-purple-700 border-purple-200";
    case "career": return "bg-blue-100 text-blue-700 border-blue-200";
    case "health": return "bg-green-100 text-green-700 border-green-200";
    case "relationships": return "bg-pink-100 text-pink-700 border-pink-200";
    case "finance": return "bg-amber-100 text-amber-700 border-amber-200";
    case "personal": return "bg-teal-100 text-teal-700 border-teal-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getDifficultyBadgeColor = (difficulty: string) => {
  switch (difficulty) {
    case "beginner": return "bg-green-100 text-green-700 border-green-200";
    case "intermediate": return "bg-amber-100 text-amber-700 border-amber-200";
    case "advanced": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const defaultFormData = {
  title: "",
  description: "",
  category: "personal",
  iconName: "",
  timeframe: "90_days",
  difficulty: "beginner",
  suggestedMilestones: "",
  suggestedHabits: "",
  isActive: true,
};

interface UserProgressStats {
  totalUsersWithGoals: number;
  averageCompletionRate: number;
  activeJourneys: number;
  userProgress: Array<{
    userId: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    goalsCount: number;
    habitsTracked: number;
    lastActivity: string | null;
  }>;
}

interface GrowthTrack {
  id: number;
  key: string;
  title: string;
  description: string | null;
  isEnabled: boolean;
  modulesCount: number;
}

export function AdminVisionGoals() {
  const [activeTab, setActiveTab] = useState("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<GoalTemplate | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<GoalTemplate | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery<{ templates: GoalTemplate[] }>({
    queryKey: ["/api/admin/goal-templates"],
    queryFn: async () => {
      const res = await fetch("/api/admin/goal-templates");
      if (!res.ok) throw new Error("Failed to fetch goal templates");
      return res.json();
    },
  });

  const { data: tracksData, isLoading: isLoadingTracks } = useQuery<{ tracks: GrowthTrack[] }>({
    queryKey: ["/api/admin/growth-tracks"],
    queryFn: async () => {
      const res = await fetch("/api/admin/growth-tracks");
      if (!res.ok) throw new Error("Failed to fetch growth tracks");
      return res.json();
    },
    enabled: activeTab === "tracks",
  });

  const { data: progressData, isLoading: isLoadingProgress } = useQuery<UserProgressStats>({
    queryKey: ["/api/admin/user-progress-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/user-progress-stats");
      if (!res.ok) throw new Error("Failed to fetch user progress stats");
      return res.json();
    },
    enabled: activeTab === "progress",
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/goal-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create goal template");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/goal-templates"] });
      toast({ title: "Template created", description: "The goal template has been created successfully." });
      closeModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/admin/goal-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update goal template");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/goal-templates"] });
      toast({ title: "Template updated", description: "The goal template has been updated successfully." });
      closeModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/goal-templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete goal template");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/goal-templates"] });
      toast({ title: "Template deleted", description: "The goal template has been deleted." });
      setDeleteTemplate(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (template: GoalTemplate) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      description: template.description || "",
      category: template.category,
      iconName: template.iconName || "",
      timeframe: template.timeframe || "90_days",
      difficulty: template.difficulty || "beginner",
      suggestedMilestones: template.suggestedMilestones ? JSON.stringify(template.suggestedMilestones, null, 2) : "",
      suggestedHabits: template.suggestedHabits ? JSON.stringify(template.suggestedHabits, null, 2) : "",
      isActive: template.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let suggestedMilestones = null;
    let suggestedHabits = null;

    try {
      if (formData.suggestedMilestones.trim()) {
        suggestedMilestones = JSON.parse(formData.suggestedMilestones);
      }
    } catch {
      toast({ title: "Error", description: "Invalid JSON for suggested milestones", variant: "destructive" });
      return;
    }

    try {
      if (formData.suggestedHabits.trim()) {
        suggestedHabits = JSON.parse(formData.suggestedHabits);
      }
    } catch {
      toast({ title: "Error", description: "Invalid JSON for suggested habits", variant: "destructive" });
      return;
    }
    
    const submitData = {
      title: formData.title,
      description: formData.description || null,
      category: formData.category,
      iconName: formData.iconName || null,
      timeframe: formData.timeframe,
      difficulty: formData.difficulty,
      suggestedMilestones,
      suggestedHabits,
      isActive: formData.isActive,
    };

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const templates = templatesData?.templates || [];
  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const tracks = tracksData?.tracks || [];

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const stats = {
    total: templates.length,
    active: templates.filter(t => t.isActive).length,
    totalUsage: templates.reduce((sum, t) => sum + (t.usageCount || 0), 0),
  };

  return (
    <AdminLayout
      title="Vision & Goals"
      subtitle="Manage goal templates, growth tracks, and user progress"
      breadcrumbs={[{ label: "Vision & Goals", href: "/admin/vision" }]}
      actions={
        activeTab === "templates" ? (
          <Button onClick={openCreateModal} className="bg-[#1a2744] hover:bg-[#1a2744]/90" data-testid="button-create-template">
            <Plus className="h-4 w-4 mr-2" /> New Template
          </Button>
        ) : null
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" data-testid="vision-tabs">
        <TabsList className="bg-white border shadow-sm" data-testid="tabs-list">
          <TabsTrigger value="templates" data-testid="tab-templates" className="data-[state=active]:bg-[#1a2744] data-[state=active]:text-white">
            <Target className="h-4 w-4 mr-2" />
            Goal Templates
          </TabsTrigger>
          <TabsTrigger value="tracks" data-testid="tab-tracks" className="data-[state=active]:bg-[#1a2744] data-[state=active]:text-white">
            <BookOpen className="h-4 w-4 mr-2" />
            Growth Tracks
          </TabsTrigger>
          <TabsTrigger value="progress" data-testid="tab-progress" className="data-[state=active]:bg-[#1a2744] data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            User Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6" data-testid="content-templates">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="template-stats">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-[#1a2744]/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-[#1a2744]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900" data-testid="stat-total-templates">{stats.total}</div>
                    <div className="text-sm text-gray-500">Total Templates</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900" data-testid="stat-active-templates">{stats.active}</div>
                    <div className="text-sm text-gray-500">Active Templates</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900" data-testid="stat-total-usage">{stats.totalUsage}</div>
                    <div className="text-sm text-gray-500">Total Usage</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm" data-testid="card-filters">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-templates"
                />
              </div>
            </CardContent>
          </Card>

          {isLoadingTemplates ? (
            <div className="flex items-center justify-center py-20" data-testid="loading-spinner">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card className="border-0 shadow-sm" data-testid="card-no-templates">
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? "Try adjusting your search criteria."
                    : "Create your first goal template to get started."}
                </p>
                {!searchQuery && (
                  <Button onClick={openCreateModal} className="bg-[#1a2744] hover:bg-[#1a2744]/90">
                    <Plus className="h-4 w-4 mr-2" /> Create Template
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm overflow-hidden" data-testid="card-templates-table">
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-templates">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Title</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Category</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Timeframe</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Difficulty</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Usage</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTemplates.map((template, i) => (
                      <motion.tr
                        key={template.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-gray-50"
                        data-testid={`row-template-${template.id}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#1a2744]/10 flex items-center justify-center flex-shrink-0">
                              <Compass className="h-5 w-5 text-[#1a2744]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900" data-testid={`text-template-title-${template.id}`}>
                                {template.title}
                              </p>
                              {template.description && (
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                  {template.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={getCategoryBadgeColor(template.category)}
                            data-testid={`badge-template-category-${template.id}`}
                          >
                            {template.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-600" data-testid={`text-template-timeframe-${template.id}`}>
                            {TIMEFRAMES.find(t => t.value === template.timeframe)?.label || template.timeframe || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <Badge
                            variant="outline"
                            className={getDifficultyBadgeColor(template.difficulty || "")}
                            data-testid={`badge-template-difficulty-${template.id}`}
                          >
                            {template.difficulty || "—"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-600" data-testid={`text-template-usage-${template.id}`}>
                            {template.usageCount || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={template.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}
                            data-testid={`badge-template-status-${template.id}`}
                          >
                            {template.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-template-actions-${template.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => openEditModal(template)} data-testid={`button-edit-template-${template.id}`}>
                                <Edit className="h-4 w-4 mr-2" /> Edit Template
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteTemplate(template)}
                                className="text-red-600"
                                data-testid={`button-delete-template-${template.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tracks" className="space-y-6" data-testid="content-tracks">
          {isLoadingTracks ? (
            <div className="flex items-center justify-center py-20" data-testid="loading-spinner-tracks">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
            </div>
          ) : tracks.length === 0 ? (
            <Card className="border-0 shadow-sm" data-testid="card-no-tracks">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No growth tracks found</h3>
                <p className="text-gray-500">Growth tracks are managed in the main system.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm overflow-hidden" data-testid="card-tracks-table">
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-tracks">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Description</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Modules</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tracks.map((track, i) => (
                      <motion.tr
                        key={track.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-gray-50"
                        data-testid={`row-track-${track.id}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-5 w-5 text-teal-600" />
                            </div>
                            <p className="font-medium text-gray-900" data-testid={`text-track-title-${track.id}`}>
                              {track.title}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-sm text-gray-600 truncate max-w-md" data-testid={`text-track-description-${track.id}`}>
                            {track.description || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600" data-testid={`text-track-modules-${track.id}`}>
                            {track.modulesCount}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={track.isEnabled ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}
                            data-testid={`badge-track-status-${track.id}`}
                          >
                            {track.isEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6" data-testid="content-progress">
          {isLoadingProgress ? (
            <div className="flex items-center justify-center py-20" data-testid="loading-spinner-progress">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="progress-stats">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-[#1a2744]/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-[#1a2744]" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900" data-testid="stat-users-with-goals">
                          {progressData?.totalUsersWithGoals || 0}
                        </div>
                        <div className="text-sm text-gray-500">Users with Goals</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900" data-testid="stat-completion-rate">
                          {progressData?.averageCompletionRate || 0}%
                        </div>
                        <div className="text-sm text-gray-500">Avg Completion Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Compass className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900" data-testid="stat-active-journeys">
                          {progressData?.activeJourneys || 0}
                        </div>
                        <div className="text-sm text-gray-500">Active Journeys</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {progressData?.userProgress && progressData.userProgress.length > 0 ? (
                <Card className="border-0 shadow-sm overflow-hidden" data-testid="card-progress-table">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg">User Progress</CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full" data-testid="table-user-progress">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">User</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Goals</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Habits Tracked</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Last Activity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {progressData.userProgress.map((user, i) => (
                          <motion.tr
                            key={user.userId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className="hover:bg-gray-50"
                            data-testid={`row-user-progress-${user.userId}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.profileImageUrl || undefined} />
                                  <AvatarFallback className="bg-[#1a2744]/10 text-[#1a2744] text-xs">
                                    {(user.firstName?.[0] || "") + (user.lastName?.[0] || "")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-gray-900" data-testid={`text-user-name-${user.userId}`}>
                                  {user.firstName || ""} {user.lastName || ""}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-600" data-testid={`text-user-goals-${user.userId}`}>
                                {user.goalsCount}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-600" data-testid={`text-user-habits-${user.userId}`}>
                                {user.habitsTracked}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className="text-sm text-gray-500" data-testid={`text-user-last-activity-${user.userId}`}>
                                {formatDate(user.lastActivity)}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm" data-testid="card-no-progress">
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No user progress yet</h3>
                    <p className="text-gray-500">Users haven't started tracking goals or habits yet.</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-template">
          <DialogHeader>
            <DialogTitle data-testid="modal-title">
              {editingTemplate ? "Edit Goal Template" : "Create Goal Template"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Goal title"
                  required
                  data-testid="input-template-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger id="category" data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value} data-testid={`option-category-${cat.value}`}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Goal description"
                rows={2}
                data-testid="input-template-description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="iconName">Icon Name</Label>
                <Input
                  id="iconName"
                  value={formData.iconName}
                  onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                  placeholder="e.g. Target, Heart"
                  data-testid="input-template-icon"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select value={formData.timeframe} onValueChange={(v) => setFormData({ ...formData, timeframe: v })}>
                  <SelectTrigger id="timeframe" data-testid="select-timeframe">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEFRAMES.map(tf => (
                      <SelectItem key={tf.value} value={tf.value} data-testid={`option-timeframe-${tf.value}`}>
                        {tf.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                  <SelectTrigger id="difficulty" data-testid="select-difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(d => (
                      <SelectItem key={d.value} value={d.value} data-testid={`option-difficulty-${d.value}`}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestedMilestones">Suggested Milestones (JSON array)</Label>
              <Textarea
                id="suggestedMilestones"
                value={formData.suggestedMilestones}
                onChange={(e) => setFormData({ ...formData, suggestedMilestones: e.target.value })}
                placeholder='["Milestone 1", "Milestone 2"]'
                rows={3}
                className="font-mono text-sm"
                data-testid="input-template-milestones"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestedHabits">Suggested Habits (JSON array)</Label>
              <Textarea
                id="suggestedHabits"
                value={formData.suggestedHabits}
                onChange={(e) => setFormData({ ...formData, suggestedHabits: e.target.value })}
                placeholder='["Daily habit 1", "Weekly habit 2"]'
                rows={3}
                className="font-mono text-sm"
                data-testid="input-template-habits"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-active"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal} data-testid="button-cancel">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#1a2744] hover:bg-[#1a2744]/90"
                data-testid="button-submit"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingTemplate ? "Update Template" : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTemplate} onOpenChange={() => setDeleteTemplate(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTemplate?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-delete-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTemplate && deleteMutation.mutate(deleteTemplate.id)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-delete-confirm"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
