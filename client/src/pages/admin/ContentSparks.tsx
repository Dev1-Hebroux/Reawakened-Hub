import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Flame, Search, Filter, Plus, MoreVertical,
  Loader2, Calendar, Star, Edit, Trash2, Check,
  Archive, Eye, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Spark } from "@shared/schema";
import { getApiUrl } from "@/lib/api";

const STATUSES = ['draft', 'scheduled', 'published', 'archived'] as const;
const CATEGORIES = ['daily-devotional', 'worship', 'testimony', 'teaching', 'prayer', 'inspiration'] as const;
const MEDIA_TYPES = ['video', 'audio', 'quick-read', 'download'] as const;
const AUDIENCES = ['schools', 'universities', 'early-career', 'builders', 'couples'] as const;

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-700 border-green-200';
    case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'archived': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-amber-100 text-amber-700 border-amber-200';
  }
};

interface SparkFormData {
  title: string;
  description: string;
  category: string;
  mediaType: string;
  videoUrl?: string;
  audioUrl?: string;
  downloadUrl?: string;
  imageUrl?: string;
  scriptureRef?: string;
  audienceSegment?: string;
  dailyDate?: string;
  featured: boolean;
  prayerLine?: string;
  status: string;
}

const defaultFormData: SparkFormData = {
  title: '',
  description: '',
  category: 'daily-devotional',
  mediaType: 'video',
  videoUrl: '',
  audioUrl: '',
  downloadUrl: '',
  imageUrl: '',
  scriptureRef: '',
  audienceSegment: '',
  dailyDate: '',
  featured: false,
  prayerLine: '',
  status: 'draft',
};

export function ContentSparks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [selectedSparks, setSelectedSparks] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpark, setEditingSpark] = useState<Spark | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Spark | null>(null);
  const [formData, setFormData] = useState<SparkFormData>(defaultFormData);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sparks = [], isLoading } = useQuery<Spark[]>({
    queryKey: ["/api/admin/sparks", { status: statusFilter, category: categoryFilter, audience: audienceFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (audienceFilter !== 'all') params.set('audience', audienceFilter);

      const res = await fetch(getApiUrl(`/api/admin/sparks?${params}`));
      if (!res.ok) throw new Error('Failed to fetch sparks');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SparkFormData) => {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      return await apiFetchJson('/api/admin/sparks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sparks"] });
      toast({ title: "Spark created", description: "The spark has been created successfully." });
      closeModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SparkFormData> }) => {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      return await apiFetchJson(`/api/admin/sparks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sparks"] });
      toast({ title: "Spark updated", description: "The spark has been updated successfully." });
      closeModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { apiFetch } = await import('@/lib/apiFetch');
      await apiFetch(`/api/admin/sparks/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sparks"] });
      toast({ title: "Spark deleted", description: "The spark has been deleted." });
      setDeleteConfirm(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async ({ ids, action }: { ids: number[]; action: string }) => {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      return await apiFetchJson('/api/admin/sparks/bulk', {
        method: 'POST',
        body: JSON.stringify({ ids, action }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sparks"] });
      toast({ title: "Sparks updated", description: `${data.updated} sparks have been updated.` });
      setSelectedSparks([]);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredSparks = sparks.filter(spark => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return spark.title.toLowerCase().includes(query) ||
        spark.description.toLowerCase().includes(query);
    }
    return true;
  });

  const openModal = (spark?: Spark) => {
    if (spark) {
      setEditingSpark(spark);
      setFormData({
        title: spark.title,
        description: spark.description,
        category: spark.category,
        mediaType: spark.mediaType,
        videoUrl: spark.videoUrl || '',
        audioUrl: spark.audioUrl || '',
        downloadUrl: spark.downloadUrl || '',
        imageUrl: spark.imageUrl || '',
        scriptureRef: spark.scriptureRef || '',
        audienceSegment: spark.audienceSegment || '',
        dailyDate: spark.dailyDate || '',
        featured: spark.featured || false,
        prayerLine: spark.prayerLine || '',
        status: spark.status,
      });
    } else {
      setEditingSpark(null);
      setFormData(defaultFormData);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSpark(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      dailyDate: formData.dailyDate || undefined,
      audienceSegment: formData.audienceSegment || undefined,
    };

    if (editingSpark) {
      updateMutation.mutate({ id: editingSpark.id, data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  const toggleSparkSelection = (id: number) => {
    setSelectedSparks(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedSparks.length === filteredSparks.length) {
      setSelectedSparks([]);
    } else {
      setSelectedSparks(filteredSparks.map(s => s.id));
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout
      title="Sparks Management"
      subtitle={`${sparks.length} total sparks`}
      breadcrumbs={[{ label: "Content" }, { label: "Sparks" }]}
      actions={
        <Button
          onClick={() => openModal()}
          className="bg-[#1a2744] hover:bg-[#1a2744]/90"
          data-testid="button-create-spark"
        >
          <Plus className="h-4 w-4 mr-2" /> New Spark
        </Button>
      }
    >
      <Card className="border-0 shadow-sm mb-6" data-testid="card-sparks-filters">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sparks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-sparks"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[150px]" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUSES.map(s => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-[150px]" data-testid="select-category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={audienceFilter} onValueChange={setAudienceFilter}>
              <SelectTrigger className="w-full lg:w-[150px]" data-testid="select-audience-filter">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                {AUDIENCES.map(a => (
                  <SelectItem key={a} value={a}>{a.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedSparks.length > 0 && (
        <Card className="border-0 shadow-sm mb-4 bg-[#1a2744]" data-testid="card-bulk-actions">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-white font-medium">{selectedSparks.length} spark(s) selected</span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => bulkMutation.mutate({ ids: selectedSparks, action: 'publish' })}
                disabled={bulkMutation.isPending}
                data-testid="button-bulk-publish"
              >
                <Check className="h-4 w-4 mr-1" /> Publish
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => bulkMutation.mutate({ ids: selectedSparks, action: 'archive' })}
                disabled={bulkMutation.isPending}
                data-testid="button-bulk-archive"
              >
                <Archive className="h-4 w-4 mr-1" /> Archive
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSparks([])}
                className="text-white hover:bg-white/10"
                data-testid="button-clear-selection"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20" data-testid="loading-spinner">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
        </div>
      ) : filteredSparks.length === 0 ? (
        <Card className="border-0 shadow-sm" data-testid="card-no-sparks">
          <CardContent className="p-12 text-center">
            <Flame className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No sparks found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? "Try adjusting your filters."
                : "Create your first spark to get started."}
            </p>
            <Button onClick={() => openModal()} data-testid="button-create-first-spark">
              <Plus className="h-4 w-4 mr-2" /> Create Spark
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden" data-testid="card-sparks-table">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="table-sparks">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 w-10">
                    <Checkbox
                      checked={selectedSparks.length === filteredSparks.length && filteredSparks.length > 0}
                      onCheckedChange={toggleSelectAll}
                      data-testid="checkbox-select-all"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Audience</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Daily Date</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Featured</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSparks.map((spark, i) => (
                  <motion.tr
                    key={spark.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50"
                    data-testid={`row-spark-${spark.id}`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedSparks.includes(spark.id)}
                        onCheckedChange={() => toggleSparkSelection(spark.id)}
                        data-testid={`checkbox-spark-${spark.id}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Flame className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate" data-testid={`text-spark-title-${spark.id}`}>
                            {spark.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{spark.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-600" data-testid={`text-spark-category-${spark.id}`}>
                        {spark.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={getStatusBadgeStyles(spark.status)}
                        data-testid={`badge-spark-status-${spark.id}`}
                      >
                        {spark.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-gray-600" data-testid={`text-spark-audience-${spark.id}`}>
                        {spark.audienceSegment ? spark.audienceSegment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span data-testid={`text-spark-date-${spark.id}`}>{formatDate(spark.dailyDate)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {spark.featured ? (
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" data-testid={`icon-featured-${spark.id}`} />
                      ) : (
                        <Star className="h-5 w-5 text-gray-300" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            data-testid={`button-spark-actions-${spark.id}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openModal(spark)} data-testid={`button-edit-spark-${spark.id}`}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteConfirm(spark)}
                            className="text-red-600"
                            data-testid={`button-delete-spark-${spark.id}`}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-spark-form">
          <DialogHeader>
            <DialogTitle>{editingSpark ? 'Edit Spark' : 'Create New Spark'}</DialogTitle>
            <DialogDescription>
              {editingSpark ? 'Update the spark details below.' : 'Fill in the details to create a new spark.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter spark title"
                data-testid="input-spark-title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter spark description"
                rows={3}
                data-testid="input-spark-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger data-testid="select-spark-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>
                        {c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mediaType">Media Type *</Label>
                <Select
                  value={formData.mediaType}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, mediaType: v }))}
                >
                  <SelectTrigger data-testid="select-spark-media-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDIA_TYPES.map(m => (
                      <SelectItem key={m} value={m}>
                        {m.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://..."
                data-testid="input-spark-video-url"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="audioUrl">Audio URL</Label>
              <Input
                id="audioUrl"
                value={formData.audioUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, audioUrl: e.target.value }))}
                placeholder="https://..."
                data-testid="input-spark-audio-url"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="downloadUrl">Download URL</Label>
              <Input
                id="downloadUrl"
                value={formData.downloadUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, downloadUrl: e.target.value }))}
                placeholder="https://..."
                data-testid="input-spark-download-url"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://..."
                data-testid="input-spark-image-url"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scriptureRef">Scripture Reference</Label>
              <Input
                id="scriptureRef"
                value={formData.scriptureRef}
                onChange={(e) => setFormData(prev => ({ ...prev, scriptureRef: e.target.value }))}
                placeholder="e.g. Matthew 6:6"
                data-testid="input-spark-scripture"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="audienceSegment">Audience Segment</Label>
                <Select
                  value={formData.audienceSegment || 'none'}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, audienceSegment: v === 'none' ? '' : v }))}
                >
                  <SelectTrigger data-testid="select-spark-audience">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Audiences</SelectItem>
                    {AUDIENCES.map(a => (
                      <SelectItem key={a} value={a}>
                        {a.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                >
                  <SelectTrigger data-testid="select-spark-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dailyDate">Daily Date</Label>
              <Input
                id="dailyDate"
                type="date"
                value={formData.dailyDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dailyDate: e.target.value }))}
                data-testid="input-spark-daily-date"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prayerLine">Prayer Line</Label>
              <Textarea
                id="prayerLine"
                value={formData.prayerLine}
                onChange={(e) => setFormData(prev => ({ ...prev, prayerLine: e.target.value }))}
                placeholder="Enter prayer prompt..."
                rows={2}
                data-testid="input-spark-prayer-line"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                data-testid="switch-spark-featured"
              />
              <Label htmlFor="featured">Featured Spark</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} data-testid="button-cancel-spark">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.description || isPending}
              className="bg-[#1a2744] hover:bg-[#1a2744]/90"
              data-testid="button-save-spark"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingSpark ? 'Update Spark' : 'Create Spark'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent data-testid="dialog-delete-spark">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Spark</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

export default ContentSparks;