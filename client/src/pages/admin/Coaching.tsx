import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  GraduationCap, Search, Plus, MoreVertical, 
  Loader2, Calendar, Star, Edit, Eye, Users,
  Clock, User as UserIcon, CheckCircle, XCircle, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { Coach, CoachingSession, CoachingCohort, CohortParticipant, User } from "@shared/schema";

const SPECIALTIES = ['career', 'faith', 'relationships', 'leadership', 'vision', 'habits'] as const;
const SESSION_STATUSES = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as const;
const COHORT_STATUSES = ['draft', 'open', 'in_progress', 'completed', 'cancelled'] as const;
const TOPICS = ['leadership', 'vision', 'faith', 'career', 'relationships'] as const;

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-700 border-green-200';
    case 'confirmed': 
    case 'in_progress': 
    case 'open': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'scheduled': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'cancelled':
    case 'no_show': return 'bg-red-100 text-red-700 border-red-200';
    case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

interface CoachFormData {
  userId: string;
  specialties: string[];
  bio: string;
  photoUrl: string;
  hourlyRate: number | null;
  maxSessionsPerWeek: number;
  isActive: boolean;
}

interface CohortFormData {
  coachId: number;
  title: string;
  description: string;
  topic: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  schedule: { dayOfWeek: string; time: string; timezone: string };
  meetingLink: string;
  price: number | null;
  status: string;
}

const defaultCoachForm: CoachFormData = {
  userId: '',
  specialties: [],
  bio: '',
  photoUrl: '',
  hourlyRate: null,
  maxSessionsPerWeek: 10,
  isActive: true,
};

const defaultCohortForm: CohortFormData = {
  coachId: 0,
  title: '',
  description: '',
  topic: 'vision',
  maxParticipants: 12,
  startDate: '',
  endDate: '',
  schedule: { dayOfWeek: 'Tuesday', time: '19:00', timezone: 'UTC' },
  meetingLink: '',
  price: null,
  status: 'draft',
};

export function AdminCoaching() {
  const [activeTab, setActiveTab] = useState("coaches");
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionStatusFilter, setSessionStatusFilter] = useState<string>("all");
  
  const [coachModalOpen, setCoachModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [coachForm, setCoachForm] = useState<CoachFormData>(defaultCoachForm);
  
  const [cohortModalOpen, setCohortModalOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<CoachingCohort | null>(null);
  const [cohortForm, setCohortForm] = useState<CohortFormData>(defaultCohortForm);
  
  const [sessionDetailsModal, setSessionDetailsModal] = useState<CoachingSession | null>(null);
  const [participantsModal, setParticipantsModal] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coaches = [], isLoading: loadingCoaches } = useQuery<Coach[]>({
    queryKey: ["/api/admin/coaches"],
    queryFn: async () => {
      const res = await fetch('/api/admin/coaches');
      if (!res.ok) throw new Error('Failed to fetch coaches');
      return res.json();
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users-list"],
    queryFn: async () => {
      const res = await fetch('/api/admin/users?pageSize=100');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      return data.users || [];
    },
  });

  const { data: sessions = [], isLoading: loadingSessions } = useQuery<CoachingSession[]>({
    queryKey: ["/api/admin/coaching-sessions", { status: sessionStatusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sessionStatusFilter !== 'all') params.set('status', sessionStatusFilter);
      const res = await fetch(`/api/admin/coaching-sessions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json();
    },
  });

  const { data: cohorts = [], isLoading: loadingCohorts } = useQuery<CoachingCohort[]>({
    queryKey: ["/api/admin/cohorts"],
    queryFn: async () => {
      const res = await fetch('/api/admin/cohorts');
      if (!res.ok) throw new Error('Failed to fetch cohorts');
      return res.json();
    },
  });

  const { data: participants = [] } = useQuery<CohortParticipant[]>({
    queryKey: ["/api/admin/cohorts", participantsModal, "participants"],
    queryFn: async () => {
      if (!participantsModal) return [];
      const res = await fetch(`/api/admin/cohorts/${participantsModal}/participants`);
      if (!res.ok) throw new Error('Failed to fetch participants');
      return res.json();
    },
    enabled: !!participantsModal,
  });

  const createCoachMutation = useMutation({
    mutationFn: async (data: CoachFormData) => {
      const res = await fetch('/api/admin/coaches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to create coach');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaches"] });
      toast({ title: "Coach created", description: "The coach has been created successfully." });
      closeCoachModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCoachMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CoachFormData> }) => {
      const res = await fetch(`/api/admin/coaches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to update coach');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaches"] });
      toast({ title: "Coach updated", description: "The coach has been updated successfully." });
      closeCoachModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createCohortMutation = useMutation({
    mutationFn: async (data: CohortFormData) => {
      const payload = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      };
      const res = await fetch('/api/admin/cohorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to create cohort');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cohorts"] });
      toast({ title: "Cohort created", description: "The cohort has been created successfully." });
      closeCohortModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCohortMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CohortFormData> }) => {
      const payload = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      };
      const res = await fetch(`/api/admin/cohorts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to update cohort');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cohorts"] });
      toast({ title: "Cohort updated", description: "The cohort has been updated successfully." });
      closeCohortModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const openCoachModal = (coach?: Coach) => {
    if (coach) {
      setEditingCoach(coach);
      setCoachForm({
        userId: coach.userId,
        specialties: coach.specialties || [],
        bio: coach.bio || '',
        photoUrl: coach.photoUrl || '',
        hourlyRate: coach.hourlyRate,
        maxSessionsPerWeek: coach.maxSessionsPerWeek || 10,
        isActive: coach.isActive ?? true,
      });
    } else {
      setEditingCoach(null);
      setCoachForm(defaultCoachForm);
    }
    setCoachModalOpen(true);
  };

  const closeCoachModal = () => {
    setCoachModalOpen(false);
    setEditingCoach(null);
    setCoachForm(defaultCoachForm);
  };

  const openCohortModal = (cohort?: CoachingCohort) => {
    if (cohort) {
      setEditingCohort(cohort);
      setCohortForm({
        coachId: cohort.coachId,
        title: cohort.title,
        description: cohort.description || '',
        topic: cohort.topic,
        maxParticipants: cohort.maxParticipants || 12,
        startDate: cohort.startDate ? new Date(cohort.startDate).toISOString().split('T')[0] : '',
        endDate: cohort.endDate ? new Date(cohort.endDate).toISOString().split('T')[0] : '',
        schedule: (cohort.schedule as any) || defaultCohortForm.schedule,
        meetingLink: cohort.meetingLink || '',
        price: cohort.price,
        status: cohort.status || 'draft',
      });
    } else {
      setEditingCohort(null);
      setCohortForm(defaultCohortForm);
    }
    setCohortModalOpen(true);
  };

  const closeCohortModal = () => {
    setCohortModalOpen(false);
    setEditingCohort(null);
    setCohortForm(defaultCohortForm);
  };

  const handleCoachSubmit = () => {
    if (editingCoach) {
      updateCoachMutation.mutate({ id: editingCoach.id, data: coachForm });
    } else {
      createCoachMutation.mutate(coachForm);
    }
  };

  const handleCohortSubmit = () => {
    if (editingCohort) {
      updateCohortMutation.mutate({ id: editingCohort.id, data: cohortForm });
    } else {
      createCohortMutation.mutate(cohortForm);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setCoachForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const getCoachName = (coachId: number) => {
    const coach = coaches.find(c => c.id === coachId);
    if (!coach) return 'Unknown Coach';
    const user = users.find(u => u.id === coach.userId);
    return user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Unknown';
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : userId;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });
  };

  const filteredCoaches = coaches.filter(coach => {
    if (!searchQuery) return true;
    const user = users.find(u => u.id === coach.userId);
    const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase() : '';
    return name.includes(searchQuery.toLowerCase()) || coach.bio?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const isPending = createCoachMutation.isPending || updateCoachMutation.isPending ||
                    createCohortMutation.isPending || updateCohortMutation.isPending;

  return (
    <AdminLayout 
      title="Coaching Hub" 
      subtitle="Manage coaches, sessions, and group cohorts"
      breadcrumbs={[{ label: "Coaching" }]}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]" data-testid="tabs-coaching">
          <TabsTrigger value="coaches" data-testid="tab-coaches">Coaches</TabsTrigger>
          <TabsTrigger value="sessions" data-testid="tab-sessions">1-on-1 Sessions</TabsTrigger>
          <TabsTrigger value="cohorts" data-testid="tab-cohorts">Group Cohorts</TabsTrigger>
        </TabsList>

        <TabsContent value="coaches" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search coaches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-coaches"
              />
            </div>
            <Button 
              onClick={() => openCoachModal()}
              className="bg-[#1a2744] hover:bg-[#1a2744]/90"
              data-testid="button-create-coach"
            >
              <Plus className="h-4 w-4 mr-2" /> New Coach
            </Button>
          </div>

          {loadingCoaches ? (
            <div className="flex items-center justify-center py-20" data-testid="loading-coaches">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
            </div>
          ) : filteredCoaches.length === 0 ? (
            <Card className="border-0 shadow-sm" data-testid="card-no-coaches">
              <CardContent className="p-12 text-center">
                <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No coaches found</h3>
                <p className="text-gray-500 mb-4">Create your first coach to get started.</p>
                <Button onClick={() => openCoachModal()} data-testid="button-create-first-coach">
                  <Plus className="h-4 w-4 mr-2" /> Create Coach
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm overflow-hidden" data-testid="card-coaches-table">
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-coaches">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Coach</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Specialties</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Rating</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Sessions</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCoaches.map((coach, i) => {
                      const user = users.find(u => u.id === coach.userId);
                      return (
                        <motion.tr
                          key={coach.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="hover:bg-gray-50"
                          data-testid={`row-coach-${coach.id}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {coach.photoUrl || user?.profileImageUrl ? (
                                <img 
                                  src={coach.photoUrl || user?.profileImageUrl || undefined} 
                                  alt="" 
                                  className="h-10 w-10 rounded-full object-cover" 
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-[#1a2744]/10 flex items-center justify-center">
                                  <UserIcon className="h-5 w-5 text-[#1a2744]" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900" data-testid={`text-coach-name-${coach.id}`}>
                                  {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {(coach.specialties || []).slice(0, 3).map(s => (
                                <Badge key={s} variant="outline" className="text-xs capitalize">
                                  {s}
                                </Badge>
                              ))}
                              {(coach.specialties?.length || 0) > 3 && (
                                <Badge variant="outline" className="text-xs">+{(coach.specialties?.length || 0) - 3}</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <span className="text-sm font-medium">{((coach.rating || 0) / 100).toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-sm text-gray-600">{coach.totalSessions || 0}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge 
                              variant="outline" 
                              className={coach.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}
                              data-testid={`badge-coach-status-${coach.id}`}
                            >
                              {coach.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-coach-actions-${coach.id}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openCoachModal(coach)} data-testid={`button-edit-coach-${coach.id}`}>
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateCoachMutation.mutate({ id: coach.id, data: { isActive: !coach.isActive } })}
                                  data-testid={`button-toggle-coach-${coach.id}`}
                                >
                                  {coach.isActive ? (
                                    <><XCircle className="h-4 w-4 mr-2" /> Deactivate</>
                                  ) : (
                                    <><CheckCircle className="h-4 w-4 mr-2" /> Activate</>
                                  )}
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
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={sessionStatusFilter} onValueChange={setSessionStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-session-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {SESSION_STATUSES.map(s => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadingSessions ? (
            <div className="flex items-center justify-center py-20" data-testid="loading-sessions">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
            </div>
          ) : sessions.length === 0 ? (
            <Card className="border-0 shadow-sm" data-testid="card-no-sessions">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No sessions found</h3>
                <p className="text-gray-500">Coaching sessions will appear here when users book.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm overflow-hidden" data-testid="card-sessions-table">
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-sessions">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Coach</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">User</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Date/Time</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Duration</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Topic</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sessions.map((session, i) => (
                      <motion.tr
                        key={session.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-gray-50"
                        data-testid={`row-session-${session.id}`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{getCoachName(session.coachId)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-600">{getUserName(session.userId)}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDateTime(session.scheduledAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {session.duration || 60} min
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant="outline"
                            className={getStatusBadgeStyles(session.status || 'scheduled')}
                            data-testid={`badge-session-status-${session.id}`}
                          >
                            {(session.status || 'scheduled').replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-gray-600">{session.topic || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setSessionDetailsModal(session)}
                            data-testid={`button-view-session-${session.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-4">
          <div className="flex justify-end">
            <Button 
              onClick={() => openCohortModal()}
              className="bg-[#1a2744] hover:bg-[#1a2744]/90"
              data-testid="button-create-cohort"
            >
              <Plus className="h-4 w-4 mr-2" /> New Cohort
            </Button>
          </div>

          {loadingCohorts ? (
            <div className="flex items-center justify-center py-20" data-testid="loading-cohorts">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
            </div>
          ) : cohorts.length === 0 ? (
            <Card className="border-0 shadow-sm" data-testid="card-no-cohorts">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No cohorts found</h3>
                <p className="text-gray-500 mb-4">Create your first group cohort to get started.</p>
                <Button onClick={() => openCohortModal()} data-testid="button-create-first-cohort">
                  <Plus className="h-4 w-4 mr-2" /> Create Cohort
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm overflow-hidden" data-testid="card-cohorts-table">
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-cohorts">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Title</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Coach</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Topic</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Start Date</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Participants</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cohorts.map((cohort, i) => (
                      <motion.tr
                        key={cohort.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-gray-50"
                        data-testid={`row-cohort-${cohort.id}`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900" data-testid={`text-cohort-title-${cohort.id}`}>
                            {cohort.title}
                          </p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-gray-600">{getCoachName(cohort.coachId)}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <Badge variant="outline" className="capitalize">{cohort.topic}</Badge>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-600">{formatDate(cohort.startDate)}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{cohort.currentParticipants || 0}/{cohort.maxParticipants || 12}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant="outline"
                            className={getStatusBadgeStyles(cohort.status || 'draft')}
                            data-testid={`badge-cohort-status-${cohort.id}`}
                          >
                            {(cohort.status || 'draft').replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-cohort-actions-${cohort.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openCohortModal(cohort)} data-testid={`button-edit-cohort-${cohort.id}`}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setParticipantsModal(cohort.id)} data-testid={`button-view-participants-${cohort.id}`}>
                                <Users className="h-4 w-4 mr-2" /> View Participants
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
      </Tabs>

      <Dialog open={coachModalOpen} onOpenChange={setCoachModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-coach-form">
          <DialogHeader>
            <DialogTitle>{editingCoach ? 'Edit Coach' : 'Create New Coach'}</DialogTitle>
            <DialogDescription>
              {editingCoach ? 'Update the coach details below.' : 'Select a user and configure their coaching profile.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userId">User *</Label>
              <Select 
                value={coachForm.userId} 
                onValueChange={(v) => setCoachForm(prev => ({ ...prev, userId: v }))}
                disabled={!!editingCoach}
              >
                <SelectTrigger data-testid="select-coach-user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.email || user.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Specialties</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(specialty => (
                  <Button
                    key={specialty}
                    type="button"
                    variant={coachForm.specialties.includes(specialty) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSpecialty(specialty)}
                    className="capitalize"
                    data-testid={`button-specialty-${specialty}`}
                  >
                    {specialty}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={coachForm.bio}
                onChange={(e) => setCoachForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Coach bio and background..."
                rows={3}
                data-testid="input-coach-bio"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input
                id="photoUrl"
                value={coachForm.photoUrl}
                onChange={(e) => setCoachForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                placeholder="https://..."
                data-testid="input-coach-photo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="hourlyRate">Hourly Rate (cents)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={coachForm.hourlyRate || ''}
                  onChange={(e) => setCoachForm(prev => ({ ...prev, hourlyRate: e.target.value ? parseInt(e.target.value) : null }))}
                  placeholder="0 = free"
                  data-testid="input-coach-rate"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxSessions">Max Sessions/Week</Label>
                <Input
                  id="maxSessions"
                  type="number"
                  value={coachForm.maxSessionsPerWeek}
                  onChange={(e) => setCoachForm(prev => ({ ...prev, maxSessionsPerWeek: parseInt(e.target.value) || 10 }))}
                  data-testid="input-coach-max-sessions"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={coachForm.isActive}
                onCheckedChange={(checked) => setCoachForm(prev => ({ ...prev, isActive: checked }))}
                data-testid="switch-coach-active"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeCoachModal} data-testid="button-cancel-coach">Cancel</Button>
            <Button 
              onClick={handleCoachSubmit} 
              disabled={isPending || !coachForm.userId}
              className="bg-[#1a2744] hover:bg-[#1a2744]/90"
              data-testid="button-save-coach"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingCoach ? 'Save Changes' : 'Create Coach'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cohortModalOpen} onOpenChange={setCohortModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-cohort-form">
          <DialogHeader>
            <DialogTitle>{editingCohort ? 'Edit Cohort' : 'Create New Cohort'}</DialogTitle>
            <DialogDescription>
              {editingCohort ? 'Update the cohort details below.' : 'Set up a new group coaching cohort.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cohortTitle">Title *</Label>
              <Input
                id="cohortTitle"
                value={cohortForm.title}
                onChange={(e) => setCohortForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Cohort title"
                data-testid="input-cohort-title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={cohortForm.description}
                onChange={(e) => setCohortForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Cohort description..."
                rows={3}
                data-testid="input-cohort-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cohortCoach">Coach *</Label>
                <Select 
                  value={cohortForm.coachId ? String(cohortForm.coachId) : ''} 
                  onValueChange={(v) => setCohortForm(prev => ({ ...prev, coachId: parseInt(v) }))}
                >
                  <SelectTrigger data-testid="select-cohort-coach">
                    <SelectValue placeholder="Select coach" />
                  </SelectTrigger>
                  <SelectContent>
                    {coaches.filter(c => c.isActive).map(coach => (
                      <SelectItem key={coach.id} value={String(coach.id)}>
                        {getCoachName(coach.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="topic">Topic *</Label>
                <Select 
                  value={cohortForm.topic} 
                  onValueChange={(v) => setCohortForm(prev => ({ ...prev, topic: v }))}
                >
                  <SelectTrigger data-testid="select-cohort-topic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPICS.map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={cohortForm.startDate}
                  onChange={(e) => setCohortForm(prev => ({ ...prev, startDate: e.target.value }))}
                  data-testid="input-cohort-start-date"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={cohortForm.endDate}
                  onChange={(e) => setCohortForm(prev => ({ ...prev, endDate: e.target.value }))}
                  data-testid="input-cohort-end-date"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={cohortForm.maxParticipants}
                  onChange={(e) => setCohortForm(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 12 }))}
                  data-testid="input-cohort-max-participants"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (cents)</Label>
                <Input
                  id="price"
                  type="number"
                  value={cohortForm.price || ''}
                  onChange={(e) => setCohortForm(prev => ({ ...prev, price: e.target.value ? parseInt(e.target.value) : null }))}
                  placeholder="0 = free"
                  data-testid="input-cohort-price"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                value={cohortForm.meetingLink}
                onChange={(e) => setCohortForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                placeholder="https://zoom.us/..."
                data-testid="input-cohort-meeting-link"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={cohortForm.status} 
                onValueChange={(v) => setCohortForm(prev => ({ ...prev, status: v }))}
              >
                <SelectTrigger data-testid="select-cohort-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COHORT_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeCohortModal} data-testid="button-cancel-cohort">Cancel</Button>
            <Button 
              onClick={handleCohortSubmit} 
              disabled={isPending || !cohortForm.title || !cohortForm.coachId || !cohortForm.startDate}
              className="bg-[#1a2744] hover:bg-[#1a2744]/90"
              data-testid="button-save-cohort"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingCohort ? 'Save Changes' : 'Create Cohort'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!sessionDetailsModal} onOpenChange={() => setSessionDetailsModal(null)}>
        <DialogContent className="max-w-md" data-testid="dialog-session-details">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          {sessionDetailsModal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Coach</Label>
                  <p className="font-medium">{getCoachName(sessionDetailsModal.coachId)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">User</Label>
                  <p className="font-medium">{getUserName(sessionDetailsModal.userId)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Scheduled</Label>
                  <p className="font-medium">{formatDateTime(sessionDetailsModal.scheduledAt)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Duration</Label>
                  <p className="font-medium">{sessionDetailsModal.duration || 60} minutes</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-500">Status</Label>
                <Badge 
                  variant="outline"
                  className={`mt-1 ${getStatusBadgeStyles(sessionDetailsModal.status || 'scheduled')}`}
                >
                  {(sessionDetailsModal.status || 'scheduled').replace(/_/g, ' ')}
                </Badge>
              </div>
              {sessionDetailsModal.topic && (
                <div>
                  <Label className="text-gray-500">Topic</Label>
                  <p className="font-medium">{sessionDetailsModal.topic}</p>
                </div>
              )}
              {sessionDetailsModal.meetingLink && (
                <div>
                  <Label className="text-gray-500">Meeting Link</Label>
                  <a href={sessionDetailsModal.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <Video className="h-4 w-4" /> Join Meeting
                  </a>
                </div>
              )}
              {sessionDetailsModal.notes && (
                <div>
                  <Label className="text-gray-500">Coach Notes</Label>
                  <p className="text-sm bg-gray-50 rounded p-2 mt-1">{sessionDetailsModal.notes}</p>
                </div>
              )}
              {sessionDetailsModal.actionItems && sessionDetailsModal.actionItems.length > 0 && (
                <div>
                  <Label className="text-gray-500">Action Items</Label>
                  <ul className="list-disc list-inside text-sm mt-1">
                    {sessionDetailsModal.actionItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!participantsModal} onOpenChange={() => setParticipantsModal(null)}>
        <DialogContent className="max-w-md" data-testid="dialog-cohort-participants">
          <DialogHeader>
            <DialogTitle>Cohort Participants</DialogTitle>
          </DialogHeader>
          {participants.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No participants yet.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#1a2744]/10 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-[#1a2744]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{getUserName(p.userId)}</p>
                      <p className="text-xs text-gray-500">Progress: {p.progress || 0} sessions</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusBadgeStyles(p.status || 'enrolled')}
                  >
                    {p.status || 'enrolled'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default AdminCoaching;
