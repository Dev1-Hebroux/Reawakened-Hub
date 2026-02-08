import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Trophy, Plus, Loader2, Search, Filter, MoreVertical, 
  Calendar, Users, Target, Edit, Trash2, Eye, ChevronLeft, 
  ChevronRight, Star, X, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { Challenge, ChallengeParticipant, User } from "@shared/schema";

interface ChallengeWithCounts extends Challenge {
  currentParticipants: number;
}

interface ParticipantWithUser extends ChallengeParticipant {
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

const CHALLENGE_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "team", label: "Team" },
  { value: "community", label: "Community" },
];

const CHALLENGE_CATEGORIES = [
  { value: "prayer", label: "Prayer" },
  { value: "reading", label: "Reading" },
  { value: "outreach", label: "Outreach" },
  { value: "habits", label: "Habits" },
  { value: "giving", label: "Giving" },
  { value: "fitness", label: "Fitness" },
];

const GOAL_UNITS = [
  { value: "days", label: "Days" },
  { value: "prayers", label: "Prayers" },
  { value: "chapters", label: "Chapters" },
  { value: "actions", label: "Actions" },
  { value: "hours", label: "Hours" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "upcoming", label: "Upcoming" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-700 border-green-200";
    case "upcoming": return "bg-blue-100 text-blue-700 border-blue-200";
    case "completed": return "bg-gray-100 text-gray-700 border-gray-200";
    case "cancelled": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-amber-100 text-amber-700 border-amber-200";
  }
};

const defaultFormData = {
  title: "",
  description: "",
  type: "individual",
  category: "prayer",
  imageUrl: "",
  startDate: "",
  endDate: "",
  goal: 7,
  goalUnit: "days",
  pointsPerAction: 10,
  maxParticipants: "",
  rewards: { first: "", completion: "" },
  rules: [""],
  status: "draft",
  isFeatured: false,
};

export function AdminChallenges() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [viewingChallenge, setViewingChallenge] = useState<Challenge | null>(null);
  const [deleteChallenge, setDeleteChallenge] = useState<Challenge | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ challenges: ChallengeWithCounts[]; total: number }>({
    queryKey: ["/api/admin/challenges", { page, pageSize, search: searchQuery, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      
      const res = await fetch(`/api/admin/challenges?${params}`);
      if (!res.ok) throw new Error("Failed to fetch challenges");
      return res.json();
    },
  });

  const { data: participantsData, isLoading: isLoadingParticipants } = useQuery<{ participants: ParticipantWithUser[] }>({
    queryKey: ["/api/admin/challenges", viewingChallenge?.id, "participants"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/challenges/${viewingChallenge?.id}/participants`);
      if (!res.ok) throw new Error("Failed to fetch participants");
      return res.json();
    },
    enabled: !!viewingChallenge,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      return await apiFetchJson("/api/admin/challenges", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      toast({ title: "Challenge created", description: "The challenge has been created successfully." });
      closeModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      return await apiFetchJson(`/api/admin/challenges/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      toast({ title: "Challenge updated", description: "The challenge has been updated successfully." });
      closeModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { apiFetch } = await import('@/lib/apiFetch');
      await apiFetch(`/api/admin/challenges/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      toast({ title: "Challenge deleted", description: "The challenge has been deleted." });
      setDeleteChallenge(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const openCreateModal = () => {
    setEditingChallenge(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description || "",
      type: challenge.type,
      category: challenge.category,
      imageUrl: challenge.imageUrl || "",
      startDate: challenge.startDate ? new Date(challenge.startDate).toISOString().slice(0, 16) : "",
      endDate: challenge.endDate ? new Date(challenge.endDate).toISOString().slice(0, 16) : "",
      goal: challenge.goal,
      goalUnit: challenge.goalUnit,
      pointsPerAction: challenge.pointsPerAction || 10,
      maxParticipants: challenge.maxParticipants?.toString() || "",
      rewards: typeof challenge.rewards === "object" && challenge.rewards 
        ? challenge.rewards as { first: string; completion: string }
        : { first: "", completion: "" },
      rules: (challenge.rules && challenge.rules.length > 0) ? challenge.rules : [""],
      status: challenge.status || "draft",
      isFeatured: challenge.isFeatured || false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingChallenge(null);
    setFormData(defaultFormData);
  };

  const openParticipantsModal = (challenge: Challenge) => {
    setViewingChallenge(challenge);
    setIsParticipantsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      title: formData.title,
      description: formData.description || null,
      type: formData.type,
      category: formData.category,
      imageUrl: formData.imageUrl || null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      goal: formData.goal,
      goalUnit: formData.goalUnit,
      pointsPerAction: formData.pointsPerAction,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      rewards: (formData.rewards.first || formData.rewards.completion) ? formData.rewards : null,
      rules: formData.rules.filter(r => r.trim() !== ""),
      status: formData.status,
      isFeatured: formData.isFeatured,
    };

    if (editingChallenge) {
      updateMutation.mutate({ id: editingChallenge.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const addRule = () => {
    setFormData({ ...formData, rules: [...formData.rules, ""] });
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData({ ...formData, rules: newRules });
  };

  const removeRule = (index: number) => {
    setFormData({ ...formData, rules: formData.rules.filter((_, i) => i !== index) });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const challenges = data?.challenges || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const stats = {
    total: challenges.length,
    active: challenges.filter(c => c.status === "active").length,
    totalParticipants: challenges.reduce((sum, c) => sum + (c.currentParticipants || 0), 0),
  };

  return (
    <AdminLayout
      title="Challenges Manager"
      subtitle="Create and manage community challenges"
      breadcrumbs={[{ label: "Challenges", href: "/admin/challenges" }]}
      actions={
        <Button onClick={openCreateModal} className="bg-[#1a2744] hover:bg-[#1a2744]/90" data-testid="button-create-challenge">
          <Plus className="h-4 w-4 mr-2" /> New Challenge
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" data-testid="challenge-stats">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900" data-testid="stat-total-challenges">{total}</div>
                <div className="text-sm text-gray-500">Total Challenges</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900" data-testid="stat-active-challenges">{stats.active}</div>
                <div className="text-sm text-gray-500">Active Now</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900" data-testid="stat-total-participants">{stats.totalParticipants}</div>
                <div className="text-sm text-gray-500">Total Participants</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm mb-6" data-testid="card-filters">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-10"
                data-testid="input-search-challenges"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-status-all">All Statuses</SelectItem>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} data-testid={`option-status-${opt.value}`}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-20" data-testid="loading-spinner">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
        </div>
      ) : challenges.length === 0 ? (
        <Card className="border-0 shadow-sm" data-testid="card-no-challenges">
          <CardContent className="p-12 text-center">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No challenges found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Create your first challenge to get started."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={openCreateModal} className="bg-[#1a2744] hover:bg-[#1a2744]/90">
                <Plus className="h-4 w-4 mr-2" /> Create Challenge
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-0 shadow-sm overflow-hidden" data-testid="card-challenges-table">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-challenges">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Challenge</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Dates</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Participants</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {challenges.map((challenge, i) => (
                    <motion.tr
                      key={challenge.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-50"
                      data-testid={`row-challenge-${challenge.id}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            {challenge.imageUrl ? (
                              <img src={challenge.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                              <Trophy className="h-5 w-5 text-amber-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900" data-testid={`text-challenge-title-${challenge.id}`}>
                                {challenge.title}
                              </p>
                              {challenge.isFeatured && (
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              {challenge.goal} {challenge.goalUnit}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-600 capitalize" data-testid={`text-challenge-type-${challenge.id}`}>
                          {challenge.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-gray-600 capitalize" data-testid={`text-challenge-category-${challenge.id}`}>
                          {challenge.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span data-testid={`text-challenge-dates-${challenge.id}`}>
                              {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span data-testid={`text-challenge-participants-${challenge.id}`}>
                            {challenge.currentParticipants || 0}
                            {challenge.maxParticipants && ` / ${challenge.maxParticipants}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={getStatusBadgeStyles(challenge.status || "draft")}
                          data-testid={`badge-challenge-status-${challenge.id}`}
                        >
                          {challenge.status || "draft"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-challenge-actions-${challenge.id}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => openParticipantsModal(challenge)} data-testid={`button-view-participants-${challenge.id}`}>
                              <Eye className="h-4 w-4 mr-2" /> View Participants
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(challenge)} data-testid={`button-edit-challenge-${challenge.id}`}>
                              <Edit className="h-4 w-4 mr-2" /> Edit Challenge
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteChallenge(challenge)}
                              className="text-red-600"
                              data-testid={`button-delete-challenge-${challenge.id}`}
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4" data-testid="pagination">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages} ({total} total challenges)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  data-testid="button-next-page"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-challenge-form">
          <DialogHeader>
            <DialogTitle>{editingChallenge ? "Edit Challenge" : "Create Challenge"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 21-Day Prayer Challenge"
                  required
                  data-testid="input-challenge-title"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this challenge about?"
                  rows={3}
                  data-testid="input-challenge-description"
                />
              </div>
              <div>
                <Label>Type *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger data-testid="select-challenge-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHALLENGE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger data-testid="select-challenge-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHALLENGE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  data-testid="input-challenge-image"
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  data-testid="input-challenge-start"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  data-testid="input-challenge-end"
                />
              </div>
              <div>
                <Label htmlFor="goal">Goal *</Label>
                <Input
                  id="goal"
                  type="number"
                  min="1"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: parseInt(e.target.value) || 1 })}
                  required
                  data-testid="input-challenge-goal"
                />
              </div>
              <div>
                <Label>Goal Unit *</Label>
                <Select value={formData.goalUnit} onValueChange={(v) => setFormData({ ...formData, goalUnit: v })}>
                  <SelectTrigger data-testid="select-challenge-goal-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_UNITS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pointsPerAction">Points Per Action</Label>
                <Input
                  id="pointsPerAction"
                  type="number"
                  min="0"
                  value={formData.pointsPerAction}
                  onChange={(e) => setFormData({ ...formData, pointsPerAction: parseInt(e.target.value) || 0 })}
                  data-testid="input-challenge-points"
                />
              </div>
              <div>
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="0"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  placeholder="Leave empty for unlimited"
                  data-testid="input-challenge-max-participants"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger data-testid="select-challenge-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                  data-testid="switch-challenge-featured"
                />
                <Label htmlFor="featured" className="cursor-pointer">Featured Challenge</Label>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label>Rewards</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="rewardFirst" className="text-xs text-gray-500">First Place</Label>
                  <Input
                    id="rewardFirst"
                    value={formData.rewards.first}
                    onChange={(e) => setFormData({ ...formData, rewards: { ...formData.rewards, first: e.target.value } })}
                    placeholder="e.g. Gold Badge"
                    data-testid="input-reward-first"
                  />
                </div>
                <div>
                  <Label htmlFor="rewardCompletion" className="text-xs text-gray-500">Completion</Label>
                  <Input
                    id="rewardCompletion"
                    value={formData.rewards.completion}
                    onChange={(e) => setFormData({ ...formData, rewards: { ...formData.rewards, completion: e.target.value } })}
                    placeholder="e.g. Certificate"
                    data-testid="input-reward-completion"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Rules</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRule} data-testid="button-add-rule">
                  <Plus className="h-3 w-3 mr-1" /> Add Rule
                </Button>
              </div>
              <div className="space-y-2">
                {formData.rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={rule}
                      onChange={(e) => updateRule(index, e.target.value)}
                      placeholder={`Rule ${index + 1}`}
                      data-testid={`input-rule-${index}`}
                    />
                    {formData.rules.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRule(index)}
                        className="h-9 w-9 text-gray-400 hover:text-red-500"
                        data-testid={`button-remove-rule-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={closeModal} data-testid="button-cancel-form">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#1a2744] hover:bg-[#1a2744]/90"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit-form"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {editingChallenge ? "Save Changes" : "Create Challenge"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isParticipantsOpen} onOpenChange={setIsParticipantsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-participants">
          <DialogHeader>
            <DialogTitle>
              {viewingChallenge?.title} — Leaderboard
            </DialogTitle>
          </DialogHeader>
          {isLoadingParticipants ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#1a2744]" />
            </div>
          ) : participantsData?.participants?.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No participants yet</p>
            </div>
          ) : (
            <table className="w-full" data-testid="table-participants">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2 text-sm font-semibold text-gray-600">Rank</th>
                  <th className="text-left px-4 py-2 text-sm font-semibold text-gray-600">Participant</th>
                  <th className="text-left px-4 py-2 text-sm font-semibold text-gray-600">Points</th>
                  <th className="text-left px-4 py-2 text-sm font-semibold text-gray-600">Progress</th>
                  <th className="text-left px-4 py-2 text-sm font-semibold text-gray-600">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {participantsData?.participants?.map((participant, index) => (
                  <tr key={participant.id} className="hover:bg-gray-50" data-testid={`row-participant-${participant.id}`}>
                    <td className="px-4 py-2">
                      <span className={`font-bold ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-gray-600'}`}>
                        #{participant.rank || index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {participant.user?.profileImageUrl ? (
                          <img src={participant.user.profileImageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium" data-testid={`text-participant-name-${participant.id}`}>
                          {participant.user?.firstName} {participant.user?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-semibold text-[#1a2744]" data-testid={`text-participant-points-${participant.id}`}>
                        {participant.points || 0}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${viewingChallenge?.goal ? Math.min(100, ((participant.progress || 0) / viewingChallenge.goal) * 100) : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500" data-testid={`text-participant-progress-${participant.id}`}>
                          {participant.progress || 0}/{viewingChallenge?.goal || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-sm" data-testid={`text-participant-streak-${participant.id}`}>
                        🔥 {participant.streak || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteChallenge} onOpenChange={() => setDeleteChallenge(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteChallenge?.title}"? This action cannot be undone and will remove all participant data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteChallenge && deleteMutation.mutate(deleteChallenge.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

export default AdminChallenges;
