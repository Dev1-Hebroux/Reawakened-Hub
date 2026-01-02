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
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  pending: "bg-yellow-100 text-yellow-800",
  praying: "bg-blue-100 text-blue-800",
  answered: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-600",
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

  return (
    <AdminLayout title="Prayer Dashboard" subtitle="Manage prayer requests from your community">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <MessageSquare className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Requests</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Heart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.praying}</p>
                <p className="text-xs text-gray-500">Being Prayed For</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.answered}</p>
                <p className="text-xs text-gray-500">Answered</p>
              </div>
            </div>
          </motion.div>
        </div>

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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No prayer requests</h3>
            <p className="text-gray-500 mt-1">Prayer requests from your community will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request, i) => {
              const StatusIcon = statusIcons[request.status || "pending"] || Clock;
              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  data-testid={`card-prayer-request-${request.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">{request.name}</span>
                        {request.isPrivate === "true" ? (
                          <Badge variant="secondary" className="gap-1">
                            <Lock className="h-3 w-3" /> Private
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Globe className="h-3 w-3" /> Public
                          </Badge>
                        )}
                        <Badge className={`gap-1 ${statusColors[request.status || "pending"]}`}>
                          <StatusIcon className="h-3 w-3" />
                          {request.status || "pending"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 whitespace-pre-wrap mb-3">{request.request}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{format(new Date(request.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                        {request.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {request.email}
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
                    <div className="flex flex-col gap-2">
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
                        Add Note
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Prayer Team Note</DialogTitle>
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
