import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Globe, Plus, Loader2, Search, Filter, MoreVertical, 
  Calendar, Users, DollarSign, Edit, Trash2, Eye, ChevronLeft, 
  ChevronRight, MapPin, X, Check, XCircle, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import type { MissionTrip, TripApplication, User } from "@shared/schema";

interface TripWithCounts extends MissionTrip {
  currentParticipants: number;
}

interface ApplicationWithUser extends TripApplication {
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    profileImageUrl: string | null;
  };
}

const TRIP_TYPES = [
  { value: "international", label: "International" },
  { value: "domestic", label: "Domestic" },
  { value: "local", label: "Local" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const APPLICATION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "waitlisted", label: "Waitlisted" },
];

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "open": return "bg-green-100 text-green-700 border-green-200";
    case "closed": return "bg-gray-100 text-gray-700 border-gray-200";
    case "in_progress": return "bg-blue-100 text-blue-700 border-blue-200";
    case "completed": return "bg-purple-100 text-purple-700 border-purple-200";
    case "cancelled": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-amber-100 text-amber-700 border-amber-200";
  }
};

const getTypeBadgeStyles = (type: string) => {
  switch (type) {
    case "international": return "bg-[#4A7C7C]/10 text-[#4A7C7C] border-[#4A7C7C]/20";
    case "domestic": return "bg-[#7C9A8E]/10 text-[#7C9A8E] border-[#7C9A8E]/20";
    case "local": return "bg-[#1a2744]/10 text-[#1a2744] border-[#1a2744]/20";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getApplicationStatusStyles = (status: string) => {
  switch (status) {
    case "approved": return "bg-green-100 text-green-700 border-green-200";
    case "rejected": return "bg-red-100 text-red-700 border-red-200";
    case "waitlisted": return "bg-amber-100 text-amber-700 border-amber-200";
    default: return "bg-blue-100 text-blue-700 border-blue-200";
  }
};

const defaultFormData = {
  title: "",
  description: "",
  destination: "",
  country: "",
  type: "international",
  imageUrl: "",
  startDate: "",
  endDate: "",
  applicationDeadline: "",
  minParticipants: 5,
  maxParticipants: 20,
  cost: "",
  depositAmount: "",
  fundraisingGoal: "",
  requirements: [""],
  activities: [""],
  leaderId: "",
  meetingLink: "",
  status: "draft",
};

export function AdminMissionTrips() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<MissionTrip | null>(null);
  const [viewingTrip, setViewingTrip] = useState<MissionTrip | null>(null);
  const [deleteTrip, setDeleteTrip] = useState<MissionTrip | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ trips: TripWithCounts[]; total: number }>({
    queryKey: ["/api/admin/mission-trips", { page, pageSize, search: searchQuery, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      
      const res = await fetch(`/api/admin/mission-trips?${params}`);
      if (!res.ok) throw new Error("Failed to fetch mission trips");
      return res.json();
    },
  });

  const { data: usersData } = useQuery<{ users: User[] }>({
    queryKey: ["/api/admin/users-list"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users-list");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const { data: applicationsData, isLoading: isLoadingApplications } = useQuery<{ applications: ApplicationWithUser[] }>({
    queryKey: ["/api/admin/mission-trips", viewingTrip?.id, "applications"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/mission-trips/${viewingTrip?.id}/applications`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    enabled: !!viewingTrip,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/mission-trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create mission trip");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mission-trips"] });
      toast({ title: "Trip created", description: "The mission trip has been created successfully." });
      closeModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/admin/mission-trips/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update mission trip");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mission-trips"] });
      toast({ title: "Trip updated", description: "The mission trip has been updated successfully." });
      closeModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/mission-trips/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete mission trip");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mission-trips"] });
      toast({ title: "Trip deleted", description: "The mission trip has been deleted." });
      setDeleteTrip(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/admin/trip-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update application");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mission-trips", viewingTrip?.id, "applications"] });
      toast({ title: "Application updated", description: "The application status has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const openCreateModal = () => {
    setEditingTrip(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (trip: MissionTrip) => {
    setEditingTrip(trip);
    setFormData({
      title: trip.title,
      description: trip.description || "",
      destination: trip.destination,
      country: trip.country || "",
      type: trip.type,
      imageUrl: trip.imageUrl || "",
      startDate: trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 16) : "",
      endDate: trip.endDate ? new Date(trip.endDate).toISOString().slice(0, 16) : "",
      applicationDeadline: trip.applicationDeadline ? new Date(trip.applicationDeadline).toISOString().slice(0, 16) : "",
      minParticipants: trip.minParticipants || 5,
      maxParticipants: trip.maxParticipants || 20,
      cost: trip.cost ? (trip.cost / 100).toString() : "",
      depositAmount: trip.depositAmount ? (trip.depositAmount / 100).toString() : "",
      fundraisingGoal: trip.fundraisingGoal ? (trip.fundraisingGoal / 100).toString() : "",
      requirements: (trip.requirements && trip.requirements.length > 0) ? trip.requirements : [""],
      activities: (trip.activities && trip.activities.length > 0) ? trip.activities : [""],
      leaderId: trip.leaderId || "",
      meetingLink: trip.meetingLink || "",
      status: trip.status || "draft",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTrip(null);
    setFormData(defaultFormData);
  };

  const openApplicationsModal = (trip: MissionTrip) => {
    setViewingTrip(trip);
    setIsApplicationsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      title: formData.title,
      description: formData.description || null,
      destination: formData.destination,
      country: formData.country || null,
      type: formData.type,
      imageUrl: formData.imageUrl || null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : null,
      minParticipants: formData.minParticipants,
      maxParticipants: formData.maxParticipants,
      cost: formData.cost ? Math.round(parseFloat(formData.cost) * 100) : null,
      depositAmount: formData.depositAmount ? Math.round(parseFloat(formData.depositAmount) * 100) : null,
      fundraisingGoal: formData.fundraisingGoal ? Math.round(parseFloat(formData.fundraisingGoal) * 100) : null,
      requirements: formData.requirements.filter(r => r.trim() !== ""),
      activities: formData.activities.filter(a => a.trim() !== ""),
      leaderId: formData.leaderId || null,
      meetingLink: formData.meetingLink || null,
      status: formData.status,
    };

    if (editingTrip) {
      updateMutation.mutate({ id: editingTrip.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const addRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ""] });
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const removeRequirement = (index: number) => {
    setFormData({ ...formData, requirements: formData.requirements.filter((_, i) => i !== index) });
  };

  const addActivity = () => {
    setFormData({ ...formData, activities: [...formData.activities, ""] });
  };

  const updateActivity = (index: number, value: string) => {
    const newActivities = [...formData.activities];
    newActivities[index] = value;
    setFormData({ ...formData, activities: newActivities });
  };

  const removeActivity = (index: number) => {
    setFormData({ ...formData, activities: formData.activities.filter((_, i) => i !== index) });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (cents: number | null) => {
    if (!cents) return "$0";
    return `$${(cents / 100).toLocaleString()}`;
  };

  const trips = data?.trips || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);
  const users = usersData?.users || [];

  const stats = {
    total: trips.length,
    open: trips.filter(t => t.status === "open").length,
    totalParticipants: trips.reduce((sum, t) => sum + (t.currentParticipants || 0), 0),
    totalFundraising: trips.reduce((sum, t) => sum + (t.currentFundraising || 0), 0),
  };

  return (
    <AdminLayout
      title="Mission Trips Manager"
      subtitle="Create and manage mission trips and outreach programs"
      breadcrumbs={[{ label: "Mission Trips", href: "/admin/mission-trips" }]}
      actions={
        <Button onClick={openCreateModal} className="bg-[#1a2744] hover:bg-[#1a2744]/90" data-testid="button-create-trip">
          <Plus className="h-4 w-4 mr-2" /> New Trip
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" data-testid="trip-stats">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-[#4A7C7C]/10 flex items-center justify-center">
                <Globe className="h-6 w-6 text-[#4A7C7C]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900" data-testid="stat-total-trips">{total}</div>
                <div className="text-sm text-gray-500">Total Trips</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900" data-testid="stat-open-trips">{stats.open}</div>
                <div className="text-sm text-gray-500">Open for Registration</div>
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
                <div className="text-sm text-gray-500">Total Applicants</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-[#7C9A8E]/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#7C9A8E]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900" data-testid="stat-total-fundraising">{formatCurrency(stats.totalFundraising)}</div>
                <div className="text-sm text-gray-500">Total Fundraised</div>
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
                placeholder="Search trips by title or destination..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-10"
                data-testid="input-search-trips"
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
      ) : trips.length === 0 ? (
        <Card className="border-0 shadow-sm" data-testid="card-no-trips">
          <CardContent className="p-12 text-center">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No mission trips found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Create your first mission trip to get started."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={openCreateModal} className="bg-[#1a2744] hover:bg-[#1a2744]/90">
                <Plus className="h-4 w-4 mr-2" /> Create Trip
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-0 shadow-sm overflow-hidden" data-testid="card-trips-table">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-trips">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Trip</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Destination</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Dates</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Participants</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Fundraising</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trips.map((trip, i) => {
                    const fundraisingProgress = trip.fundraisingGoal 
                      ? Math.min(100, ((trip.currentFundraising || 0) / trip.fundraisingGoal) * 100)
                      : 0;
                    
                    return (
                      <motion.tr
                        key={trip.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-gray-50"
                        data-testid={`row-trip-${trip.id}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#4A7C7C]/10 flex items-center justify-center flex-shrink-0">
                              {trip.imageUrl ? (
                                <img src={trip.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                              ) : (
                                <Globe className="h-5 w-5 text-[#4A7C7C]" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900" data-testid={`text-trip-title-${trip.id}`}>
                                {trip.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatCurrency(trip.cost)} per person
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span data-testid={`text-trip-destination-${trip.id}`}>
                              {trip.destination}
                              {trip.country && `, ${trip.country}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge
                            variant="outline"
                            className={getTypeBadgeStyles(trip.type)}
                            data-testid={`badge-trip-type-${trip.id}`}
                          >
                            {trip.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span data-testid={`text-trip-dates-${trip.id}`}>
                                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span data-testid={`text-trip-participants-${trip.id}`}>
                              {trip.currentParticipants || 0}
                              {trip.maxParticipants && ` / ${trip.maxParticipants}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {trip.fundraisingGoal ? (
                            <div className="min-w-[120px]" data-testid={`progress-fundraising-${trip.id}`}>
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>{formatCurrency(trip.currentFundraising || 0)}</span>
                                <span>{formatCurrency(trip.fundraisingGoal)}</span>
                              </div>
                              <Progress value={fundraisingProgress} className="h-2" />
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={getStatusBadgeStyles(trip.status || "draft")}
                            data-testid={`badge-trip-status-${trip.id}`}
                          >
                            {(trip.status || "draft").replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-trip-actions-${trip.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => openApplicationsModal(trip)} data-testid={`button-view-applications-${trip.id}`}>
                                <Eye className="h-4 w-4 mr-2" /> View Applications
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditModal(trip)} data-testid={`button-edit-trip-${trip.id}`}>
                                <Edit className="h-4 w-4 mr-2" /> Edit Trip
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteTrip(trip)}
                                className="text-red-600"
                                data-testid={`button-delete-trip-${trip.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4" data-testid="pagination">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} trips
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  data-testid="button-next-page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-trip-form">
          <DialogHeader>
            <DialogTitle>{editingTrip ? "Edit Mission Trip" : "Create Mission Trip"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter trip title"
                  required
                  data-testid="input-trip-title"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the mission trip..."
                  rows={3}
                  data-testid="input-trip-description"
                />
              </div>
              <div>
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="e.g., Nairobi, Kenya"
                  required
                  data-testid="input-trip-destination"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g., Kenya"
                  data-testid="input-trip-country"
                />
              </div>
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger data-testid="select-trip-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIP_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger data-testid="select-trip-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
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
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-trip-image"
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
                  data-testid="input-trip-start-date"
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
                  data-testid="input-trip-end-date"
                />
              </div>
              <div>
                <Label htmlFor="applicationDeadline">Application Deadline</Label>
                <Input
                  id="applicationDeadline"
                  type="datetime-local"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  data-testid="input-trip-deadline"
                />
              </div>
              <div>
                <Label htmlFor="leaderId">Trip Leader</Label>
                <Select value={formData.leaderId} onValueChange={(v) => setFormData({ ...formData, leaderId: v })}>
                  <SelectTrigger data-testid="select-trip-leader">
                    <SelectValue placeholder="Select leader..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No leader assigned</SelectItem>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email || u.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="minParticipants">Min Participants</Label>
                <Input
                  id="minParticipants"
                  type="number"
                  value={formData.minParticipants}
                  onChange={(e) => setFormData({ ...formData, minParticipants: parseInt(e.target.value) || 5 })}
                  min={1}
                  data-testid="input-trip-min-participants"
                />
              </div>
              <div>
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 20 })}
                  min={1}
                  data-testid="input-trip-max-participants"
                />
              </div>
              <div>
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="e.g., 2500"
                  data-testid="input-trip-cost"
                />
              </div>
              <div>
                <Label htmlFor="depositAmount">Deposit Amount ($)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  step="0.01"
                  value={formData.depositAmount}
                  onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  placeholder="e.g., 500"
                  data-testid="input-trip-deposit"
                />
              </div>
              <div>
                <Label htmlFor="fundraisingGoal">Fundraising Goal ($)</Label>
                <Input
                  id="fundraisingGoal"
                  type="number"
                  step="0.01"
                  value={formData.fundraisingGoal}
                  onChange={(e) => setFormData({ ...formData, fundraisingGoal: e.target.value })}
                  placeholder="e.g., 50000"
                  data-testid="input-trip-fundraising-goal"
                />
              </div>
              <div>
                <Label htmlFor="meetingLink">Meeting Link</Label>
                <Input
                  id="meetingLink"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://zoom.us/..."
                  data-testid="input-trip-meeting-link"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <Label>Requirements</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addRequirement} data-testid="button-add-requirement">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {formData.requirements.map((req, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      value={req}
                      onChange={(e) => updateRequirement(idx, e.target.value)}
                      placeholder="e.g., Valid passport"
                      data-testid={`input-requirement-${idx}`}
                    />
                    {formData.requirements.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeRequirement(idx)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <Label>Activities</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addActivity} data-testid="button-add-activity">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {formData.activities.map((act, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      value={act}
                      onChange={(e) => updateActivity(idx, e.target.value)}
                      placeholder="e.g., Construction, Teaching"
                      data-testid={`input-activity-${idx}`}
                    />
                    {formData.activities.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeActivity(idx)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal} data-testid="button-cancel">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#1a2744] hover:bg-[#1a2744]/90"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingTrip ? "Update Trip" : "Create Trip"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isApplicationsOpen} onOpenChange={setIsApplicationsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-applications">
          <DialogHeader>
            <DialogTitle>Applications for {viewingTrip?.title}</DialogTitle>
          </DialogHeader>
          {isLoadingApplications ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
            </div>
          ) : !applicationsData?.applications?.length ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-500">Applications will appear here once people apply.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicationsData.applications.map((app) => (
                <Card key={app.id} className="border shadow-sm" data-testid={`card-application-${app.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {app.user?.profileImageUrl ? (
                            <img src={app.user.profileImageUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <Users className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900" data-testid={`text-applicant-name-${app.id}`}>
                            {app.user?.firstName || "Unknown"} {app.user?.lastName || "User"}
                          </p>
                          <p className="text-sm text-gray-500">{app.user?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={getApplicationStatusStyles(app.status || "pending")}
                              data-testid={`badge-application-status-${app.id}`}
                            >
                              {app.status || "pending"}
                            </Badge>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Applied {formatDate(app.appliedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {app.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-200 text-green-700 hover:bg-green-50"
                              onClick={() => updateApplicationMutation.mutate({ id: app.id, status: "approved" })}
                              disabled={updateApplicationMutation.isPending}
                              data-testid={`button-approve-${app.id}`}
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() => updateApplicationMutation.mutate({ id: app.id, status: "rejected" })}
                              disabled={updateApplicationMutation.isPending}
                              data-testid={`button-reject-${app.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-200 text-amber-700 hover:bg-amber-50"
                              onClick={() => updateApplicationMutation.mutate({ id: app.id, status: "waitlisted" })}
                              disabled={updateApplicationMutation.isPending}
                              data-testid={`button-waitlist-${app.id}`}
                            >
                              Waitlist
                            </Button>
                          </>
                        )}
                        {app.status !== "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateApplicationMutation.mutate({ id: app.id, status: "pending" })}
                            disabled={updateApplicationMutation.isPending}
                            data-testid={`button-reset-${app.id}`}
                          >
                            Reset to Pending
                          </Button>
                        )}
                      </div>
                    </div>
                    {app.whyApply && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">
                          <strong>Why they want to go:</strong> {app.whyApply}
                        </p>
                      </div>
                    )}
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Amount Paid:</span>{" "}
                        <span className="font-medium">{formatCurrency(app.amountPaid || 0)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Fundraised:</span>{" "}
                        <span className="font-medium">{formatCurrency(app.fundraisingAmount || 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTrip} onOpenChange={(open) => !open && setDeleteTrip(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mission Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTrip?.title}"? This action cannot be undone.
              All applications will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTrip && deleteMutation.mutate(deleteTrip.id)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
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
