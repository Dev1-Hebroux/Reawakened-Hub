import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Heart, 
  Clock, 
  CheckCircle, 
  Archive, 
  Filter,
  Mail,
  Lock,
  Globe,
  MessageSquare,
  Loader2,
  RefreshCw,
  HandHeart,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { format } from "date-fns";

interface PrayerRequest {
  id: number;
  name: string;
  email: string | null;
  request: string;
  isPrivate: string | null;
  status: string | null;
  prayerNote: string | null;
  answeredAt: string | null;
  userId: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  praying: "bg-blue-100 text-blue-800 border-blue-200",
  answered: "bg-green-100 text-green-800 border-green-200",
  archived: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  praying: Heart,
  answered: CheckCircle,
  archived: Archive,
};

export function AdminPrayer() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);
  const [prayerNote, setPrayerNote] = useState("");

  const { data: requests = [], isLoading, refetch } = useQuery<PrayerRequest[]>({
    queryKey: ["/api/admin/prayer-requests", statusFilter],
    queryFn: async () => {
      const url = statusFilter !== "all" 
        ? `/api/admin/prayer-requests?status=${statusFilter}` 
        : "/api/admin/prayer-requests";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, prayerNote }: { id: number; status?: string; prayerNote?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/prayer-requests/${id}`, { status, prayerNote });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prayer-requests"] });
      toast.success("Prayer request updated");
      setSelectedRequest(null);
      setPrayerNote("");
    },
    onError: () => {
      toast.error("Failed to update prayer request");
    },
  });

  const handleStatusChange = (id: number, newStatus: string) => {
    updateMutation.mutate({ id, status: newStatus });
  };

  const handleSaveNote = () => {
    if (selectedRequest) {
      updateMutation.mutate({ id: selectedRequest.id, prayerNote });
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending" || !r.status).length,
    praying: requests.filter(r => r.status === "praying").length,
    answered: requests.filter(r => r.status === "answered").length,
  };

  const metricCards = [
    { 
      label: "Total Requests", 
      value: stats.total, 
      icon: MessageSquare, 
      color: "bg-gray-500",
      subtext: "All time"
    },
    { 
      label: "Pending", 
      value: stats.pending, 
      icon: Clock, 
      color: "bg-yellow-500",
      subtext: "Awaiting prayer"
    },
    { 
      label: "Being Prayed For", 
      value: stats.praying, 
      icon: HandHeart, 
      color: "bg-blue-500",
      subtext: "Active intercession"
    },
    { 
      label: "Answered", 
      value: stats.answered, 
      icon: Sparkles, 
      color: "bg-green-500",
      subtext: "Testimonies"
    },
  ];

  return (
    <AdminLayout 
      title="Prayer Dashboard" 
      subtitle="Manage prayer requests from your community"
      breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Prayer" }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="prayer-metrics-grid">
        {metricCards.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-0 shadow-sm" data-testid={`metric-card-${metric.label.toLowerCase().replace(/\s/g, '-')}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${metric.color}`}>
                    <metric.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  <div className="text-sm text-gray-500 font-medium">{metric.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{metric.subtext}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="praying">Being Prayed For</SelectItem>
                  <SelectItem value="answered">Answered</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              data-testid="button-refresh-prayers"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No prayer requests</h3>
            <p className="text-gray-500 mt-1">Prayer requests from your community will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request, i) => {
            const StatusIcon = statusIcons[request.status || "pending"] || Clock;
            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card 
                  className="border-0 shadow-sm hover:shadow-md transition-shadow"
                  data-testid={`card-prayer-request-${request.id}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{request.name}</span>
                          {request.isPrivate === "true" ? (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Lock className="h-3 w-3" /> Private
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Globe className="h-3 w-3" /> Public
                            </Badge>
                          )}
                          <Badge className={`gap-1 text-xs border ${statusColors[request.status || "pending"]}`}>
                            <StatusIcon className="h-3 w-3" />
                            {request.status === "praying" ? "Being Prayed For" : (request.status || "pending")}
                          </Badge>
                        </div>
                        <p className="text-gray-600 whitespace-pre-wrap mb-3 leading-relaxed">{request.request}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{format(new Date(request.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                          {request.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {request.email}
                            </span>
                          )}
                          {request.answeredAt && (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Answered {format(new Date(request.answeredAt), "MMM d")}
                            </span>
                          )}
                        </div>
                        {request.prayerNote && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <p className="text-sm text-blue-800">
                              <strong>Prayer Team Note:</strong> {request.prayerNote}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <Select 
                          value={request.status || "pending"} 
                          onValueChange={(value) => handleStatusChange(request.id, value)}
                        >
                          <SelectTrigger className="w-[140px]" data-testid={`select-status-${request.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="praying">Praying</SelectItem>
                            <SelectItem value="answered">Answered</SelectItem>
                            <SelectItem value="archived">Archive</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setPrayerNote(request.prayerNote || "");
                          }}
                          data-testid={`button-add-note-${request.id}`}
                        >
                          {request.prayerNote ? "Edit Note" : "Add Note"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Prayer Team Note</DialogTitle>
            <DialogDescription>
              Add a note for the prayer team about this request from {selectedRequest?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="E.g., 'Praying daily this week' or 'Follow up on healing report'"
              value={prayerNote}
              onChange={(e) => setPrayerNote(e.target.value)}
              rows={4}
              data-testid="textarea-prayer-note"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveNote}
                disabled={updateMutation.isPending}
                data-testid="button-save-note"
              >
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
