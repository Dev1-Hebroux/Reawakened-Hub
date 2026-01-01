import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./Admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Plus, Edit2, Trash2, Play, Headphones, BookOpen, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { apiRequest } from "@/lib/queryClient";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Spark } from "@shared/schema";

const categories = [
  { value: "daily-devotional", label: "Daily Devotional" },
  { value: "worship", label: "Worship" },
  { value: "testimony", label: "Testimony" },
  { value: "teaching", label: "Teaching" },
];

const mediaTypes = [
  { value: "video", label: "Video", icon: Play },
  { value: "audio", label: "Audio", icon: Headphones },
  { value: "quick-read", label: "Quick Read", icon: BookOpen },
  { value: "download", label: "Download", icon: Download },
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const ctaOptions = [
  { value: "", label: "None" },
  { value: "Pray", label: "Pray" },
  { value: "Go", label: "Go" },
  { value: "Give", label: "Give" },
];

const audienceOptions = [
  { value: "", label: "Global (All Audiences)" },
  { value: "schools", label: "Schools" },
  { value: "universities", label: "Universities" },
  { value: "early-career", label: "Early Career (9-5 Reset)" },
  { value: "builders", label: "Builders" },
  { value: "couples", label: "Couples" },
];

export function AdminSparks() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpark, setEditingSpark] = useState<Spark | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "daily-devotional",
    mediaType: "video",
    videoUrl: "",
    audioUrl: "",
    downloadUrl: "",
    imageUrl: "",
    thumbnailUrl: "",
    scriptureRef: "",
    duration: "",
    status: "draft",
    publishAt: "",
    dailyDate: "",
    featured: false,
    prayerLine: "",
    ctaPrimary: "",
    weekTheme: "",
    audienceSegment: "",
  });

  const queryClient = useQueryClient();

  const { data: sparks = [], isLoading } = useQuery<Spark[]>({
    queryKey: ["/api/sparks"],
  });

  const prepareFormData = (data: typeof formData) => ({
    ...data,
    duration: data.duration ? parseInt(data.duration) : null,
    publishAt: data.publishAt ? new Date(data.publishAt).toISOString() : null,
    dailyDate: data.dailyDate || null,
    featured: data.featured,
    prayerLine: data.prayerLine || null,
    ctaPrimary: data.ctaPrimary || null,
    weekTheme: data.weekTheme || null,
    audienceSegment: data.audienceSegment || null,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/admin/sparks", prepareFormData(data));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sparks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sparks/featured"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sparks/published"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast.success("Spark created successfully!");
      closeModal();
    },
    onError: () => toast.error("Failed to create spark"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await apiRequest("PUT", `/api/admin/sparks/${id}`, prepareFormData(data));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sparks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sparks/featured"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sparks/published"] });
      toast.success("Spark updated successfully!");
      closeModal();
    },
    onError: () => toast.error("Failed to update spark"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/sparks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sparks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast.success("Spark deleted successfully!");
    },
    onError: () => toast.error("Failed to delete spark"),
  });

  const openCreateModal = () => {
    setEditingSpark(null);
    setFormData({
      title: "",
      description: "",
      category: "daily-devotional",
      mediaType: "video",
      videoUrl: "",
      audioUrl: "",
      downloadUrl: "",
      imageUrl: "",
      thumbnailUrl: "",
      scriptureRef: "",
      duration: "",
      status: "draft",
      publishAt: "",
      dailyDate: "",
      featured: false,
      prayerLine: "",
      ctaPrimary: "",
      weekTheme: "",
      audienceSegment: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (spark: Spark) => {
    setEditingSpark(spark);
    setFormData({
      title: spark.title,
      description: spark.description,
      category: spark.category,
      mediaType: spark.mediaType || "video",
      videoUrl: spark.videoUrl || "",
      audioUrl: spark.audioUrl || "",
      downloadUrl: spark.downloadUrl || "",
      imageUrl: spark.imageUrl || "",
      thumbnailUrl: spark.thumbnailUrl || "",
      scriptureRef: spark.scriptureRef || "",
      duration: spark.duration?.toString() || "",
      status: spark.status || "draft",
      publishAt: spark.publishAt ? new Date(spark.publishAt).toISOString().slice(0, 16) : "",
      dailyDate: spark.dailyDate || "",
      featured: spark.featured || false,
      prayerLine: spark.prayerLine || "",
      ctaPrimary: spark.ctaPrimary || "",
      weekTheme: spark.weekTheme || "",
      audienceSegment: spark.audienceSegment || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSpark(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Please fill in required fields");
      return;
    }

    if (editingSpark) {
      updateMutation.mutate({ id: editingSpark.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (spark: Spark) => {
    if (confirm(`Are you sure you want to delete "${spark.title}"?`)) {
      deleteMutation.mutate(spark.id);
    }
  };

  const getMediaIcon = (type: string) => {
    const media = mediaTypes.find(m => m.value === type);
    return media?.icon || Play;
  };

  return (
    <AdminLayout 
      title="Sparks Manager" 
      subtitle="Create and manage devotional content"
      actions={
        <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add Spark
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sparks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Flame className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No sparks yet</h3>
          <p className="text-gray-500 mb-6">Create your first spark to inspire your community.</p>
          <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Create Spark
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sparks.map((spark, i) => {
            const MediaIcon = getMediaIcon(spark.mediaType || "video");
            return (
              <motion.div
                key={spark.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
              >
                {spark.thumbnailUrl ? (
                  <img 
                    src={spark.thumbnailUrl} 
                    alt="" 
                    className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-14 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Flame className="h-6 w-6 text-orange-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-900 truncate">{spark.title}</h3>
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full capitalize">
                      {spark.category.replace("-", " ")}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      spark.status === 'published' ? 'bg-green-100 text-green-700' :
                      spark.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      spark.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {spark.status || 'draft'}
                    </span>
                    {spark.featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Featured</span>
                    )}
                    {spark.audienceSegment && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full capitalize">
                        {spark.audienceSegment.replace("-", " ")}
                      </span>
                    )}
                    <MediaIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 truncate">{spark.description}</p>
                  {spark.dailyDate && (
                    <p className="text-xs text-gray-400 mt-1">Daily: {spark.dailyDate}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(spark)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(spark)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSpark ? "Edit Spark" : "Create Spark"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Spark title"
                data-testid="input-spark-title"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Spark description"
                rows={3}
                data-testid="input-spark-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Category *</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Media Type *</label>
                <Select value={formData.mediaType} onValueChange={(v) => setFormData({ ...formData, mediaType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mediaTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.mediaType === "video" && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Video URL</label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
            )}
            {formData.mediaType === "audio" && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Audio URL</label>
                <Input
                  value={formData.audioUrl}
                  onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}
            {formData.mediaType === "download" && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Download URL</label>
                <Input
                  value={formData.downloadUrl}
                  onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Thumbnail URL</label>
                <Input
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Scripture Reference</label>
                <Input
                  value={formData.scriptureRef}
                  onChange={(e) => setFormData({ ...formData, scriptureRef: e.target.value })}
                  placeholder="e.g. Matthew 6:6"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Duration (seconds)</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 180"
              />
            </div>

            {/* New DOMINION fields */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Scheduling & Publishing</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Audience Segment</label>
                  <Select value={formData.audienceSegment} onValueChange={(v) => setFormData({ ...formData, audienceSegment: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {audienceOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Publish At</label>
                  <Input
                    type="datetime-local"
                    value={formData.publishAt}
                    onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Daily Date</label>
                  <Input
                    type="date"
                    value={formData.dailyDate}
                    onChange={(e) => setFormData({ ...formData, dailyDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Spark</span>
                </label>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Content Enhancements</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Week Theme</label>
                  <Input
                    value={formData.weekTheme}
                    onChange={(e) => setFormData({ ...formData, weekTheme: e.target.value })}
                    placeholder="e.g. Week 1: Identity & Belonging"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Prayer Line (Faith Overlay)</label>
                  <Textarea
                    value={formData.prayerLine}
                    onChange={(e) => setFormData({ ...formData, prayerLine: e.target.value })}
                    placeholder="Prayer prompt for users with Faith Overlay enabled"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">CTA Button</label>
                  <Select value={formData.ctaPrimary} onValueChange={(v) => setFormData({ ...formData, ctaPrimary: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select CTA" />
                    </SelectTrigger>
                    <SelectContent>
                      {ctaOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-spark"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingSpark ? "Update Spark" : "Create Spark"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default AdminSparks;
