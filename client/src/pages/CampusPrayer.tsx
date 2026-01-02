import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building,
  GraduationCap,
  MapPin,
  Users,
  Flame,
  Church,
  BookOpen,
  HandHeart,
  User,
  Briefcase,
  UserCheck,
  Heart,
  Loader2,
  MessageCircle,
  Send,
  Plus,
  Clock,
  Link as LinkIcon,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

interface UkCampus {
  id: number;
  name: string;
  type: string;
  city: string;
  region: string;
  postcode?: string;
  studentPopulation?: number;
  website?: string;
  hasAltar?: boolean;
}

interface CampusAltar {
  id: number;
  campusId: number;
  name: string;
  description?: string;
  leaderId: string;
  meetingSchedule?: string;
  meetingLink?: string;
  whatsappGroup?: string;
  prayerPoints?: string[];
  scriptures?: string[];
  memberCount: number;
  totalPrayerHours: number;
  status: string;
}

interface AltarMember {
  id: number;
  altarId: number;
  userId: string;
  affiliation: string;
  prayerHours: number;
  joinedAt: string;
}

interface PrayerWallEntry {
  id: number;
  type: string;
  content: string;
  prayerCount: number;
  isAnonymous?: boolean;
  createdAt: string;
}

const AFFILIATIONS = [
  { id: "student", label: "Student", icon: GraduationCap, description: "Currently enrolled at this campus" },
  { id: "staff", label: "Staff/Faculty", icon: Briefcase, description: "Work at this institution" },
  { id: "alumni", label: "Alumni", icon: UserCheck, description: "Graduated from this campus" },
  { id: "local_supporter", label: "Local Supporter", icon: Heart, description: "Local believer with heart for this campus" },
];

const DEFAULT_PRAYER_POINTS = [
  "Pray for spiritual awakening among students",
  "Pray for Christian students to be bold witnesses",
  "Pray for staff and faculty to encounter Jesus",
  "Pray for protection and blessing over the campus",
  "Pray for godly mentors and discipleship",
];

const DEFAULT_SCRIPTURES = [
  "1 Timothy 4:12",
  "Jeremiah 29:11",
  "Acts 2:17",
  "2 Chronicles 7:14",
];

export function CampusPrayer() {
  const [, navigate] = useLocation();
  const params = useParams();
  const campusId = parseInt(params.id || "0");
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [selectedAffiliation, setSelectedAffiliation] = useState<string>("student");
  const [receiveReminders, setReceiveReminders] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState<"daily" | "weekly">("daily");
  const [newAltarName, setNewAltarName] = useState("");
  const [newAltarDescription, setNewAltarDescription] = useState("");
  const [prayerContent, setPrayerContent] = useState("");
  const [prayerType, setPrayerType] = useState<"request" | "praise" | "testimony">("request");

  const { data: campus, isLoading: campusLoading } = useQuery<UkCampus>({
    queryKey: ["/api/prayer/uk-campuses", campusId],
    queryFn: async () => {
      const res = await fetch(`/api/prayer/uk-campuses/${campusId}`);
      if (!res.ok) throw new Error("Campus not found");
      return res.json();
    },
    enabled: campusId > 0,
  });

  const { data: altar } = useQuery<CampusAltar | null>({
    queryKey: ["/api/prayer/altars/campus", campusId],
    queryFn: async () => {
      const res = await fetch(`/api/prayer/altars?status=active`);
      if (!res.ok) return null;
      const altars = await res.json();
      return altars.find((a: CampusAltar) => a.campusId === campusId) || null;
    },
    enabled: campusId > 0,
  });

  const { data: members = [] } = useQuery<AltarMember[]>({
    queryKey: ["/api/prayer/altars", altar?.id, "members"],
    queryFn: async () => {
      if (!altar?.id) return [];
      const res = await fetch(`/api/prayer/altars/${altar.id}/members`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!altar?.id,
  });

  const { data: prayerWall = [] } = useQuery<PrayerWallEntry[]>({
    queryKey: ["/api/prayer/wall", altar?.id],
    queryFn: async () => {
      if (!altar?.id) return [];
      const res = await fetch(`/api/prayer/wall?altarId=${altar.id}&limit=10`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!altar?.id,
  });

  const isUserMember = members.some((m) => m.userId === user?.id);

  const createAltarMutation = useMutation({
    mutationFn: async (data: { campusId: number; name: string; description?: string }) => {
      const res = await apiRequest("POST", "/api/prayer/altars", {
        ...data,
        prayerPoints: DEFAULT_PRAYER_POINTS,
        scriptures: DEFAULT_SCRIPTURES,
      });
      return res.json();
    },
    onSuccess: (newAltar) => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer/altars"] });
      toast.success("Prayer altar created! You are the altar leader.");
      setShowCreateModal(false);
      joinAltarMutation.mutate({ altarId: newAltar.id });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create altar");
    },
  });

  const joinAltarMutation = useMutation({
    mutationFn: async (data: { altarId: number }) => {
      const res = await apiRequest("POST", `/api/prayer/altars/${data.altarId}/join`, {
        affiliation: selectedAffiliation,
        receiveReminders,
        reminderFrequency,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer/altars"] });
      toast.success("Welcome to the altar! You're now part of the intercession team.");
      setShowJoinModal(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to join altar");
    },
  });

  const submitPrayerMutation = useMutation({
    mutationFn: async (data: { altarId: number; type: string; content: string }) => {
      const res = await apiRequest("POST", "/api/prayer/wall", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer/wall"] });
      toast.success("Prayer submitted! Others can now intercede with you.");
      setShowPrayerModal(false);
      setPrayerContent("");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit prayer");
    },
  });

  const prayForMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const res = await apiRequest("POST", `/api/prayer/wall/${entryId}/pray`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer/wall"] });
      toast.success("Thank you for praying!");
    },
  });

  const handleJoinAltar = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to join the altar");
      navigate("/login");
      return;
    }
    if (altar) {
      setShowJoinModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleCreateAltar = () => {
    if (!newAltarName.trim()) {
      toast.error("Please enter an altar name");
      return;
    }
    createAltarMutation.mutate({
      campusId,
      name: newAltarName,
      description: newAltarDescription,
    });
  };

  const handleConfirmJoin = () => {
    if (altar) {
      joinAltarMutation.mutate({ altarId: altar.id });
    }
  };

  const handleSubmitPrayer = () => {
    if (!prayerContent.trim()) {
      toast.error("Please enter your prayer");
      return;
    }
    if (altar) {
      submitPrayerMutation.mutate({
        altarId: altar.id,
        type: prayerType,
        content: prayerContent,
      });
    }
  };

  if (campusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a2744] via-[#1a2744]/95 to-[#1a2744]/90 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  if (!campus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a2744] via-[#1a2744]/95 to-[#1a2744]/90">
        <Navbar />
        <div className="pt-28 px-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Campus not found</h1>
          <Button onClick={() => navigate("/pray")} className="bg-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pray Hub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] via-[#1a2744]/95 to-[#1a2744]/90">
      <Navbar />

      <main className="pt-28 pb-32 px-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate("/pray")}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pray Hub
          </button>

          {/* Campus Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className={`inline-flex items-center justify-center h-20 w-20 rounded-full mb-4 ${
              campus.type === 'university' ? 'bg-[#4A7C7C]/20' : 'bg-[#D4A574]/20'
            }`}>
              {campus.type === 'university' ? (
                <Building className="h-10 w-10 text-[#4A7C7C]" />
              ) : (
                <GraduationCap className="h-10 w-10 text-[#D4A574]" />
              )}
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-2">
              {campus.name}
            </h1>
            <div className="flex items-center justify-center gap-3 text-white/60 text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {campus.city}, {campus.region}
              </span>
              {campus.studentPopulation && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {campus.studentPopulation.toLocaleString()} students
                </span>
              )}
            </div>
          </motion.div>

          {/* Altar Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-3xl p-6 mb-6 border ${
              altar
                ? 'bg-gradient-to-br from-primary/20 to-[#4A7C7C]/20 border-primary/20'
                : 'bg-white/10 border-white/10'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Church className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  {altar ? altar.name : "Prayer Altar"}
                </h3>
                <p className="text-sm text-white/60">
                  {altar
                    ? `${altar.memberCount} intercessors • ${altar.totalPrayerHours || 0} prayer hours`
                    : "No altar established yet"
                  }
                </p>
              </div>
            </div>

            {altar ? (
              <>
                {altar.description && (
                  <p className="text-white/70 text-sm mb-4">{altar.description}</p>
                )}

                {altar.meetingSchedule && (
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                    <Clock className="h-4 w-4" />
                    {altar.meetingSchedule}
                  </div>
                )}

                {altar.meetingLink && (
                  <div className="flex items-center gap-2 text-sm text-primary mb-4">
                    <LinkIcon className="h-4 w-4" />
                    <a href={altar.meetingLink} target="_blank" rel="noopener noreferrer" className="underline">
                      Join Online Meeting
                    </a>
                  </div>
                )}

                {isUserMember ? (
                  <div className="bg-primary/10 rounded-2xl p-4 text-center">
                    <span className="text-primary font-bold flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      You're part of this altar!
                    </span>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl"
                    onClick={handleJoinAltar}
                    data-testid="button-join-altar"
                  >
                    <HandHeart className="h-5 w-5 mr-2" />
                    Join This Altar
                  </Button>
                )}
              </>
            ) : (
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl"
                onClick={handleJoinAltar}
                data-testid="button-raise-altar"
              >
                <Flame className="h-5 w-5 mr-2" />
                Raise an Altar
              </Button>
            )}
          </motion.div>

          {/* Prayer Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-[#D4A574]/20 flex items-center justify-center">
                <Flame className="h-6 w-6 text-[#D4A574]" />
              </div>
              <div>
                <h3 className="font-bold text-white">Prayer Points</h3>
                <p className="text-sm text-white/60">Focus your intercession</p>
              </div>
            </div>

            <div className="space-y-3">
              {(altar?.prayerPoints || DEFAULT_PRAYER_POINTS).map((point, i) => (
                <div key={i} className="flex items-start gap-3 text-white/80 text-sm">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  {point}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Scripture Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-primary/10 to-[#4A7C7C]/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-white">Scripture Focus</h3>
                <p className="text-sm text-white/60">Pray the Word over this campus</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(altar?.scriptures || DEFAULT_SCRIPTURES).map((scripture, i) => (
                <span
                  key={i}
                  className="bg-white/10 rounded-full px-4 py-2 text-sm font-medium text-white/80"
                >
                  {scripture}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Prayer Wall (if altar exists) */}
          {altar && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[#7C9A8E]/20 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-[#7C9A8E]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Prayer Wall</h3>
                    <p className="text-sm text-white/60">Requests & testimonies</p>
                  </div>
                </div>
                {isUserMember && (
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setShowPrayerModal(true)}
                    data-testid="button-add-prayer"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                )}
              </div>

              {prayerWall.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No prayers yet. Be the first to share!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prayerWall.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white/5 rounded-2xl p-4 border border-white/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
                            entry.type === 'praise' ? 'bg-yellow-500/20 text-yellow-400' :
                            entry.type === 'testimony' ? 'bg-green-500/20 text-green-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {entry.type === 'praise' ? 'Praise' :
                             entry.type === 'testimony' ? 'Testimony' : 'Request'}
                          </span>
                          <p className="text-white/80 text-sm">{entry.content}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white/50 hover:text-primary hover:bg-primary/10"
                          onClick={() => prayForMutation.mutate(entry.id)}
                          data-testid={`button-pray-${entry.id}`}
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          {entry.prayerCount || 0}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* Join Altar Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="bg-[#1a2744] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display flex items-center gap-2">
              <HandHeart className="h-5 w-5 text-primary" />
              Join {altar?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div>
              <Label className="text-white/80 mb-3 block">Your affiliation with this campus</Label>
              <RadioGroup value={selectedAffiliation} onValueChange={setSelectedAffiliation} className="space-y-2">
                {AFFILIATIONS.map((aff) => (
                  <div
                    key={aff.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAffiliation === aff.id
                        ? 'bg-primary/10 border-primary/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedAffiliation(aff.id)}
                  >
                    <RadioGroupItem value={aff.id} id={aff.id} className="sr-only" />
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                      <aff.icon className="h-5 w-5 text-white/60" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{aff.label}</div>
                      <div className="text-xs text-white/50">{aff.description}</div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white/80">Receive prayer reminders</Label>
                  <p className="text-xs text-white/50">Get email reminders with prayer points</p>
                </div>
                <Switch checked={receiveReminders} onCheckedChange={setReceiveReminders} />
              </div>

              {receiveReminders && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={reminderFrequency === "daily" ? "default" : "outline"}
                    className={reminderFrequency === "daily" ? "bg-primary" : "border-white/20 text-white"}
                    onClick={() => setReminderFrequency("daily")}
                  >
                    Daily
                  </Button>
                  <Button
                    size="sm"
                    variant={reminderFrequency === "weekly" ? "default" : "outline"}
                    className={reminderFrequency === "weekly" ? "bg-primary" : "border-white/20 text-white"}
                    onClick={() => setReminderFrequency("weekly")}
                  >
                    Weekly
                  </Button>
                </div>
              )}
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl"
              onClick={handleConfirmJoin}
              disabled={joinAltarMutation.isPending}
              data-testid="button-confirm-join"
            >
              {joinAltarMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Church className="h-5 w-5 mr-2" />
                  Join the Altar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Altar Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#1a2744] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              Raise an Altar
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-white/70 text-sm">
              Be the pioneer! Establish a prayer altar for {campus?.name} and lead intercession for your campus.
            </p>

            <div>
              <Label className="text-white/80 mb-2 block">Altar Name</Label>
              <Input
                placeholder={`e.g., "${campus?.name} Prayer Warriors"`}
                value={newAltarName}
                onChange={(e) => setNewAltarName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <Label className="text-white/80 mb-2 block">Description (optional)</Label>
              <Textarea
                placeholder="Describe the vision for this prayer altar..."
                value={newAltarDescription}
                onChange={(e) => setNewAltarDescription(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
              />
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl"
              onClick={handleCreateAltar}
              disabled={createAltarMutation.isPending || !newAltarName.trim()}
              data-testid="button-create-altar"
            >
              {createAltarMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Flame className="h-5 w-5 mr-2" />
                  Raise the Altar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Prayer Modal */}
      <Dialog open={showPrayerModal} onOpenChange={setShowPrayerModal}>
        <DialogContent className="bg-[#1a2744] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Share with the Altar
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/80 mb-2 block">Type</Label>
              <div className="flex gap-2">
                {(["request", "praise", "testimony"] as const).map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={prayerType === type ? "default" : "outline"}
                    className={prayerType === type ? "bg-primary" : "border-white/20 text-white"}
                    onClick={() => setPrayerType(type)}
                  >
                    {type === "request" ? "Prayer Request" :
                     type === "praise" ? "Praise Report" : "Testimony"}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white/80 mb-2 block">Your prayer</Label>
              <Textarea
                placeholder={
                  prayerType === "request" ? "Share your prayer request..." :
                  prayerType === "praise" ? "Share what you're praising God for..." :
                  "Share your testimony of what God has done..."
                }
                value={prayerContent}
                onChange={(e) => setPrayerContent(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[120px]"
              />
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl"
              onClick={handleSubmitPrayer}
              disabled={submitPrayerMutation.isPending || !prayerContent.trim()}
              data-testid="button-submit-prayer"
            >
              {submitPrayerMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
