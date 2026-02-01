import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Video,
  Music,
  Heart,
  MessageSquare,
  BookOpen,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { apiMutationRequest } from "@/lib/mutations";

interface CollaboratorSubmission {
  id: number;
  userId: number;
  contentType: string;
  title: string;
  content: string;
  scriptureRef?: string;
  category?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  reviewNotes?: string;
  scheduledDate?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  reviewer?: {
    id: number;
    name: string;
  };
}

const CONTENT_TYPE_CONFIG = {
  devotional: { label: "Daily Devotional", icon: BookOpen, color: "#7C9A8E" },
  prayer: { label: "Prayer Resource", icon: Heart, color: "#4A7C7C" },
  testimony: { label: "Testimony", icon: MessageSquare, color: "#D4A574" },
  worship: { label: "Worship Content", icon: Music, color: "#6B8B7E" },
  teaching: { label: "Teaching", icon: FileText, color: "#5A7A8E" },
  spark: { label: "Spark Video", icon: Video, color: "#B8956A" },
};

const STATUS_CONFIG = {
  pending: { label: "Pending Review", icon: Clock, color: "#D4A574" },
  approved: { label: "Approved", icon: CheckCircle2, color: "#7C9A8E" },
  rejected: { label: "Rejected", icon: XCircle, color: "#EF4444" },
  draft: { label: "Draft", icon: FileText, color: "#6B8B7E" },
};

export function AdminReview() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [contentTypeFilter, setContentTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});
  const [scheduledDates, setScheduledDates] = useState<Record<number, string>>({});

  // Check if user is admin or leader
  const isAuthorized = user?.role === 'admin' || user?.role === 'leader';

  const { data: submissions = [], isLoading } = useQuery<CollaboratorSubmission[]>({
    queryKey: ["/api/admin/submissions", statusFilter, contentTypeFilter],
    enabled: isAuthenticated && isAuthorized,
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, scheduledDate }: { id: number; scheduledDate?: string }) => {
      return await apiMutationRequest("POST", `/api/admin/submissions/${id}/approve`, {
        scheduledDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      toast.success("Submission approved successfully!");
    },
    onError: () => {
      toast.error("Failed to approve submission");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      return await apiMutationRequest("POST", `/api/admin/submissions/${id}/reject`, {
        reviewNotes: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      toast.success("Submission rejected");
    },
    onError: () => {
      toast.error("Failed to reject submission");
    },
  });

  const handleApprove = (id: number) => {
    const scheduledDate = scheduledDates[id];
    approveMutation.mutate({ id, scheduledDate });
    setExpandedId(null);
  };

  const handleReject = (id: number) => {
    const notes = reviewNotes[id] || "";
    if (!notes.trim()) {
      toast.error("Please provide review notes explaining why this was rejected");
      return;
    }
    rejectMutation.mutate({ id, notes });
    setExpandedId(null);
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesContentType = contentTypeFilter === "all" || sub.contentType === contentTypeFilter;
    const matchesSearch =
      searchQuery === "" ||
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesContentType && matchesSearch;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <Button onClick={() => (window.location.href = "/login")}>Log In</Button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-white/60">You do not have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Content Review</h1>
          <p className="text-white/60">Review and approve collaborator submissions</p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                } border`}
              >
                <config.icon className="inline h-4 w-4 mr-1.5" style={{ color: config.color }} />
                {config.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setContentTypeFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                contentTypeFilter === "all"
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
              } border`}
            >
              All Types
            </button>
            {Object.entries(CONTENT_TYPE_CONFIG).map(([type, config]) => (
              <button
                key={type}
                onClick={() => setContentTypeFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  contentTypeFilter === type
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                } border`}
              >
                <config.icon className="inline h-4 w-4 mr-1.5" style={{ color: config.color }} />
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <FileText className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No submissions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredSubmissions.map((submission) => {
                const isExpanded = expandedId === submission.id;
                const typeConfig = CONTENT_TYPE_CONFIG[submission.contentType as keyof typeof CONTENT_TYPE_CONFIG];
                const statusConfig = STATUS_CONFIG[submission.status];
                const TypeIcon = typeConfig?.icon || FileText;

                return (
                  <motion.div
                    key={submission.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
                  >
                    {/* Header */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : submission.id)}
                      className="w-full p-5 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${typeConfig?.color}20`, border: `1px solid ${typeConfig?.color}40` }}
                        >
                          <TypeIcon className="h-6 w-6" style={{ color: typeConfig?.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate mb-1">{submission.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-white/60 flex-wrap">
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {submission.user.name}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium"
                              style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
                            >
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-white/40 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-white/40 flex-shrink-0" />
                      )}
                    </button>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-white/10"
                        >
                          <div className="p-5 space-y-4">
                            {/* Scripture Reference */}
                            {submission.scriptureRef && (
                              <div>
                                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                                  Scripture Reference
                                </label>
                                <p className="text-white/90 mt-1">{submission.scriptureRef}</p>
                              </div>
                            )}

                            {/* Category */}
                            {submission.category && (
                              <div>
                                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                                  Category
                                </label>
                                <p className="text-white/90 mt-1">{submission.category}</p>
                              </div>
                            )}

                            {/* Content */}
                            <div>
                              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                                Content
                              </label>
                              <div className="mt-2 bg-white/5 rounded-xl p-4 border border-white/10 max-h-64 overflow-y-auto">
                                <p className="text-white/90 whitespace-pre-wrap">{submission.content}</p>
                              </div>
                            </div>

                            {/* Media */}
                            {(submission.mediaUrl || submission.thumbnailUrl) && (
                              <div>
                                <label className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 block">
                                  Media
                                </label>
                                <div className="flex gap-3">
                                  {submission.thumbnailUrl && (
                                    <img
                                      src={submission.thumbnailUrl}
                                      alt="Thumbnail"
                                      className="h-24 w-24 object-cover rounded-lg"
                                    />
                                  )}
                                  {submission.mediaUrl && (
                                    <a
                                      href={submission.mediaUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-400 hover:text-blue-300 underline"
                                    >
                                      View Media File
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Review Notes (if rejected) */}
                            {submission.status === 'rejected' && submission.reviewNotes && (
                              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <label className="text-xs font-medium text-red-400 uppercase tracking-wider">
                                  Review Notes
                                </label>
                                <p className="text-red-300/90 mt-2">{submission.reviewNotes}</p>
                              </div>
                            )}

                            {/* Scheduled Date (if approved) */}
                            {submission.status === 'approved' && submission.scheduledDate && (
                              <div>
                                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                                  Scheduled For
                                </label>
                                <p className="text-white/90 mt-1">
                                  {new Date(submission.scheduledDate).toLocaleDateString()}
                                </p>
                              </div>
                            )}

                            {/* Action Buttons (for pending submissions) */}
                            {submission.status === 'pending' && (
                              <div className="space-y-3 pt-2">
                                {/* Schedule Date Input */}
                                <div>
                                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 block">
                                    Schedule For (Optional)
                                  </label>
                                  <input
                                    type="date"
                                    value={scheduledDates[submission.id] || ""}
                                    onChange={(e) =>
                                      setScheduledDates({ ...scheduledDates, [submission.id]: e.target.value })
                                    }
                                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
                                  />
                                </div>

                                {/* Review Notes Input */}
                                <div>
                                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 block">
                                    Review Notes (Required for rejection)
                                  </label>
                                  <textarea
                                    value={reviewNotes[submission.id] || ""}
                                    onChange={(e) =>
                                      setReviewNotes({ ...reviewNotes, [submission.id]: e.target.value })
                                    }
                                    placeholder="Provide feedback to the collaborator..."
                                    rows={3}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 resize-none"
                                  />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                  <Button
                                    onClick={() => handleApprove(submission.id)}
                                    disabled={approveMutation.isPending}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleReject(submission.id)}
                                    disabled={rejectMutation.isPending}
                                    variant="outline"
                                    className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
