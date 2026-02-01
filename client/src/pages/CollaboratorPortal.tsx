/**
 * Collaborator Portal
 *
 * Allows approved collaborators to submit:
 * - Daily devotionals
 * - Prayer resources
 * - Testimonies
 * - Worship content
 * - Teaching materials
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Send, FileText, Video, Music, MessageSquare,
  BookOpen, Heart, CheckCircle2, Clock, XCircle,
  Upload, Image as ImageIcon, Loader2, Eye, Edit2, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/queryClient";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ContentType = "devotional" | "prayer" | "testimony" | "worship" | "teaching" | "spark";
type SubmissionStatus = "draft" | "pending" | "approved" | "rejected";

interface ContentSubmission {
  id: number;
  contentType: ContentType;
  title: string;
  content: string;
  scriptureRef?: string;
  category?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  status: SubmissionStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
  scheduledDate?: Date;
}

const CONTENT_TYPES = [
  {
    value: "devotional",
    label: "Daily Devotional",
    icon: BookOpen,
    description: "Morning or evening devotional content",
    color: "#7C9A8E"
  },
  {
    value: "prayer",
    label: "Prayer Resource",
    icon: Heart,
    description: "Prayer guides, prompts, or intercession content",
    color: "#4A7C7C"
  },
  {
    value: "testimony",
    label: "Testimony",
    icon: MessageSquare,
    description: "Personal faith stories and testimonies",
    color: "#D4A574"
  },
  {
    value: "worship",
    label: "Worship Content",
    icon: Music,
    description: "Worship songs, lyrics, or devotional music",
    color: "#C17767"
  },
  {
    value: "teaching",
    label: "Teaching",
    icon: FileText,
    description: "Bible teaching, sermon notes, or study guides",
    color: "#5A7A6E"
  },
  {
    value: "spark",
    label: "Spark Video",
    icon: Video,
    description: "Short 2-5 minute video devotionals",
    color: "#6B8B7E"
  }
];

const CATEGORIES = [
  "Identity & Belonging",
  "Prayer & Presence",
  "Peace & Anxiety",
  "Bold Witness",
  "Commission",
  "Relationships",
  "Purpose",
  "Calling",
  "Dominion",
  "Worship",
  "Testimony"
];

export function CollaboratorPortal() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [activeTab, setActiveTab] = useState<"submit" | "my-submissions">("submit");

  // Check if user is approved collaborator
  const isCollaborator = (user as any)?.role === "collaborator" || (user as any)?.role === "admin" || (user as any)?.role === "leader";

  // Fetch user's submissions
  const { data: submissions = [], isLoading } = useQuery<ContentSubmission[]>({
    queryKey: ["/api/collaborator/submissions"],
    enabled: isAuthenticated && isCollaborator,
  });

  // Submission form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    scriptureRef: "",
    category: "",
    mediaUrl: "",
    thumbnailUrl: "",
    scheduledDate: ""
  });

  const [isUploading, setIsUploading] = useState(false);

  // Create submission mutation
  const createSubmissionMutation = useMutation({
    mutationFn: async (data: typeof formData & { contentType: ContentType; status: SubmissionStatus }) => {
      return await apiRequest("POST", "/api/collaborator/submissions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collaborator/submissions"] });
      toast.success("Submission created successfully!");
      resetForm();
      setShowSubmissionForm(false);
    },
    onError: () => {
      toast.error("Failed to create submission");
    }
  });

  // File upload handler
  const handleFileUpload = async (file: File, type: "media" | "thumbnail") => {
    setIsUploading(true);
    try {
      // Get presigned URL
      const urlRes = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });

      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();

      // Upload file
      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file");

      // Update form data
      if (type === "media") {
        setFormData(prev => ({ ...prev, mediaUrl: objectPath }));
        toast.success("Media uploaded successfully!");
      } else {
        setFormData(prev => ({ ...prev, thumbnailUrl: objectPath }));
        toast.success("Thumbnail uploaded successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      scriptureRef: "",
      category: "",
      mediaUrl: "",
      thumbnailUrl: "",
      scheduledDate: ""
    });
    setSelectedType(null);
  };

  const handleSubmit = (status: SubmissionStatus) => {
    if (!selectedType) {
      toast.error("Please select a content type");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Please enter content");
      return;
    }

    createSubmissionMutation.mutate({
      ...formData,
      contentType: selectedType,
      status
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-20 pb-24">
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Collaborator Portal</h2>
            <p className="text-gray-600 mb-6">Sign in to submit content</p>
            <Button onClick={() => window.location.href = "/login"}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isCollaborator) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-20 pb-24">
          <div className="text-center py-12">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have collaborator access. Please contact an administrator if you'd like to contribute content.
            </p>
            <Button onClick={() => window.location.href = "mailto:admin@reawakened.one"}>
              Request Access
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Collaborator Portal
          </h1>
          <p className="text-gray-600">
            Submit devotionals, prayers, and other resources to bless the community
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("submit")}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "submit"
                ? "bg-primary text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Submit Content
          </button>
          <button
            onClick={() => setActiveTab("my-submissions")}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "my-submissions"
                ? "bg-primary text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            My Submissions ({submissions.length})
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "submit" ? (
            <motion.div
              key="submit"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {/* Content Type Selection */}
              {!showSubmissionForm ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CONTENT_TYPES.map((type) => (
                    <motion.button
                      key={type.value}
                      onClick={() => {
                        setSelectedType(type.value as ContentType);
                        setShowSubmissionForm(true);
                      }}
                      className="bg-white rounded-2xl p-6 text-left hover:shadow-lg transition-all border border-gray-100 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${type.color}20` }}
                      >
                        <type.icon className="h-6 w-6" style={{ color: type.color }} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">{type.label}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </motion.button>
                  ))}
                </div>
              ) : (
                /* Submission Form */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-3xl mx-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        New {CONTENT_TYPES.find(t => t.value === selectedType)?.label}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {CONTENT_TYPES.find(t => t.value === selectedType)?.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowSubmissionForm(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter a compelling title..."
                        data-testid="input-title"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Scripture Reference */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scripture Reference (optional)
                      </label>
                      <Input
                        value={formData.scriptureRef}
                        onChange={(e) => setFormData({ ...formData, scriptureRef: e.target.value })}
                        placeholder="e.g., John 3:16 or Psalm 23:1-6"
                        data-testid="input-scripture"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content *
                      </label>
                      <Textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write your content here..."
                        rows={10}
                        data-testid="textarea-content"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.content.length} characters
                      </p>
                    </div>

                    {/* Media Upload (for video/audio content) */}
                    {(selectedType === "spark" || selectedType === "worship") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Media File (video/audio)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                          <input
                            type="file"
                            accept={selectedType === "spark" ? "video/*" : "audio/*"}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, "media");
                            }}
                            className="hidden"
                            id="media-upload"
                          />
                          <label htmlFor="media-upload" className="cursor-pointer">
                            {isUploading ? (
                              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                            ) : (
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            )}
                            <p className="text-sm text-gray-600">
                              {formData.mediaUrl ? "Media uploaded! Click to replace" : "Click to upload media"}
                            </p>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Thumbnail Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thumbnail Image (optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "thumbnail");
                          }}
                          className="hidden"
                          id="thumbnail-upload"
                        />
                        <label htmlFor="thumbnail-upload" className="cursor-pointer">
                          {isUploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          )}
                          <p className="text-sm text-gray-600">
                            {formData.thumbnailUrl ? "Thumbnail uploaded! Click to replace" : "Click to upload thumbnail"}
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Scheduled Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Publish Date (optional)
                      </label>
                      <Input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        data-testid="input-scheduled-date"
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        onClick={() => handleSubmit("draft")}
                        variant="outline"
                        className="flex-1"
                        disabled={createSubmissionMutation.isPending}
                      >
                        Save as Draft
                      </Button>
                      <Button
                        onClick={() => handleSubmit("pending")}
                        className="flex-1 bg-primary hover:bg-primary/90"
                        disabled={createSubmissionMutation.isPending}
                        data-testid="button-submit"
                      >
                        {createSubmissionMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit for Review
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* My Submissions Tab */
            <motion.div
              key="submissions"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No submissions yet</h3>
                  <p className="text-gray-600 mb-6">Start contributing content to bless the community!</p>
                  <Button onClick={() => setActiveTab("submit")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Submission
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => {
                    const contentTypeConfig = CONTENT_TYPES.find(t => t.value === submission.contentType);
                    const Icon = contentTypeConfig?.icon || FileText;

                    return (
                      <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${contentTypeConfig?.color || "#7C9A8E"}20` }}
                          >
                            <Icon className="h-6 w-6" style={{ color: contentTypeConfig?.color || "#7C9A8E" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-gray-900 truncate">{submission.title}</h3>
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                                  submission.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : submission.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : submission.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {submission.status === "approved" && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                                {submission.status === "rejected" && <XCircle className="h-3 w-3 inline mr-1" />}
                                {submission.status === "pending" && <Clock className="h-3 w-3 inline mr-1" />}
                                {submission.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{submission.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>📅 {new Date(submission.submittedAt).toLocaleDateString()}</span>
                              {submission.category && <span>🏷️ {submission.category}</span>}
                              {submission.scriptureRef && <span>📖 {submission.scriptureRef}</span>}
                            </div>
                            {submission.reviewNotes && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-xs font-medium text-yellow-800 mb-1">Review Notes:</p>
                                <p className="text-xs text-yellow-700">{submission.reviewNotes}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {submission.status === "draft" && (
                              <Button variant="ghost" size="icon">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CollaboratorPortal;
