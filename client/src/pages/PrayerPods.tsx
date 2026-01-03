import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Heart, MessageCircle, Shield, Clock, MapPin, ChevronRight, Sparkles, UserCheck, Lock, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PrayerPod {
  id: number;
  name: string;
  description: string | null;
  focus: string;
  meetingSchedule: string | null;
  capacity: number;
  ageGroup: string;
  status: string;
  isPrivate: boolean;
  createdAt: string;
}

interface PodMember {
  id: number;
  podId: number;
  userId: string;
  role: string;
  displayName: string | null;
}

export default function PrayerPods() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [focusFilter, setFocusFilter] = useState<string>("all");

  const { data: pods = [], isLoading } = useQuery<PrayerPod[]>({
    queryKey: ["/api/prayer-pods"],
  });

  const { data: myPods = [] } = useQuery<PrayerPod[]>({
    queryKey: ["/api/prayer-pods/my-pods"],
  });

  const joinMutation = useMutation({
    mutationFn: async (podId: number) => {
      return apiRequest("POST", `/api/prayer-pods/${podId}/join`);
    },
    onSuccess: () => {
      toast({ title: "Joined!", description: "You've joined the prayer pod." });
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-pods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-pods/my-pods"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to join pod", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/prayer-pods", data);
    },
    onSuccess: () => {
      toast({ title: "Created!", description: "Your prayer pod has been created." });
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-pods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-pods/my-pods"] });
      setShowCreateDialog(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to create pod", variant: "destructive" });
    },
  });

  const focusOptions = [
    { value: "all", label: "All Focus Areas" },
    { value: "general", label: "General Prayer" },
    { value: "spiritual-growth", label: "Spiritual Growth" },
    { value: "healing", label: "Healing & Restoration" },
    { value: "relationships", label: "Relationships" },
    { value: "career", label: "Career & Purpose" },
    { value: "missions", label: "Missions & Outreach" },
    { value: "campus", label: "Campus & Students" },
    { value: "anxiety", label: "Peace & Anxiety" },
    { value: "identity", label: "Identity in Christ" },
  ];

  const filteredPods = pods.filter(pod => 
    focusFilter === "all" || pod.focus === focusFilter
  );

  const myPodIds = new Set(myPods.map(p => p.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full px-4 py-2 mb-6 border border-indigo-500/30">
              <Heart className="h-4 w-4 text-pink-400" />
              <span className="text-sm font-medium text-indigo-200">Prayer Partner Finder</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Find Your Prayer Pod
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Connect with 2-6 others for accountability, encouragement, and shared prayer
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
          >
            {[
              { icon: Shield, title: "Safe Space", desc: "Moderated groups with safety guardrails" },
              { icon: UserCheck, title: "Small Groups", desc: "Intimate pods of 2-6 people" },
              { icon: Lock, title: "Private", desc: "In-app messaging only, anonymous option" },
            ].map((item, i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="p-2 rounded-lg bg-indigo-500/20">
                    <item.icon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {myPods.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                Your Pods
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myPods.map(pod => (
                  <Card key={pod.id} className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/30 hover:border-indigo-400/50 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-white text-lg">{pod.name}</h3>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                          Joined
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-2 mb-4">{pod.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {pod.focus}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {pod.meetingSchedule || "Flexible"}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Open Chat
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" />
                Browse Pods
              </h2>
              <div className="flex items-center gap-3">
                <Select value={focusFilter} onValueChange={setFocusFilter}>
                  <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Filter by focus" />
                  </SelectTrigger>
                  <SelectContent>
                    {focusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500">
                      <Plus className="h-4 w-4 mr-2" />
                      Start a Pod
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                      <DialogTitle>Create Prayer Pod</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Start a new prayer pod for others to join
                      </DialogDescription>
                    </DialogHeader>
                    <CreatePodForm onSubmit={(data) => createMutation.mutate(data)} isLoading={createMutation.isPending} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
                    <CardContent className="p-5 h-48" />
                  </Card>
                ))}
              </div>
            ) : filteredPods.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No pods found</h3>
                  <p className="text-slate-400 mb-6">Be the first to create a pod for this focus area!</p>
                  <Button onClick={() => setShowCreateDialog(true)} className="bg-indigo-600 hover:bg-indigo-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Start a Pod
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredPods.map((pod, i) => (
                    <motion.div
                      key={pod.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="bg-white/5 border-white/10 hover:border-indigo-500/30 transition-all group">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-white text-lg group-hover:text-indigo-300 transition-colors">
                                {pod.name}
                              </h3>
                              <Badge variant="outline" className="mt-1 border-slate-700 text-slate-400 text-xs">
                                {pod.ageGroup === "minor" ? "Ages 15-17" : "Ages 18+"}
                              </Badge>
                            </div>
                            {pod.isPrivate && <Lock className="h-4 w-4 text-slate-500" />}
                          </div>
                          
                          <p className="text-sm text-slate-300 line-clamp-2 mb-4">
                            {pod.description || "A prayer pod focused on " + pod.focus}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                              <Heart className="h-3 w-3 mr-1" />
                              {focusOptions.find(f => f.value === pod.focus)?.label || pod.focus}
                            </Badge>
                            <Badge variant="outline" className="border-slate-700 text-slate-400">
                              <Users className="h-3 w-3 mr-1" />
                              Max {pod.capacity}
                            </Badge>
                          </div>
                          
                          {pod.meetingSchedule && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                              <Clock className="h-3 w-3" />
                              {pod.meetingSchedule}
                            </p>
                          )}
                          
                          {myPodIds.has(pod.id) ? (
                            <Button variant="outline" size="sm" className="w-full border-green-500/30 text-green-300" disabled>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Already Joined
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              className="w-full bg-indigo-600 hover:bg-indigo-500"
                              onClick={() => joinMutation.mutate(pod.id)}
                              disabled={joinMutation.isPending}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Join Pod
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-amber-500/20">
                    <AlertCircle className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Safety First</h3>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>All messages are moderated for safety</li>
                      <li>Anonymous display names protect your privacy</li>
                      <li>In-app messaging only - no sharing of personal contact info</li>
                      <li>Report inappropriate behavior anytime</li>
                      <li>Minors (15-17) are kept in separate age-appropriate groups</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function CreatePodForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [focus, setFocus] = useState("general");
  const [meetingSchedule, setMeetingSchedule] = useState("");
  const [capacity, setCapacity] = useState("6");
  const [ageGroup, setAgeGroup] = useState("adult");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      focus,
      meetingSchedule: meetingSchedule || null,
      capacity: parseInt(capacity),
      ageGroup,
      status: "active",
      isPrivate: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-slate-300">Pod Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning Prayer Warriors"
          className="bg-white/5 border-white/10 text-white"
          required
          data-testid="input-pod-name"
        />
      </div>
      
      <div>
        <Label htmlFor="description" className="text-slate-300">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What will this pod be about?"
          className="bg-white/5 border-white/10 text-white resize-none"
          rows={3}
          data-testid="input-pod-description"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-300">Focus Area</Label>
          <Select value={focus} onValueChange={setFocus}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="select-focus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Prayer</SelectItem>
              <SelectItem value="spiritual-growth">Spiritual Growth</SelectItem>
              <SelectItem value="healing">Healing & Restoration</SelectItem>
              <SelectItem value="relationships">Relationships</SelectItem>
              <SelectItem value="career">Career & Purpose</SelectItem>
              <SelectItem value="missions">Missions & Outreach</SelectItem>
              <SelectItem value="campus">Campus & Students</SelectItem>
              <SelectItem value="anxiety">Peace & Anxiety</SelectItem>
              <SelectItem value="identity">Identity in Christ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-slate-300">Age Group</Label>
          <Select value={ageGroup} onValueChange={setAgeGroup}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="select-age-group">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adult">Adults (18+)</SelectItem>
              <SelectItem value="minor">Youth (15-17)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-300">Max Members</Label>
          <Select value={capacity} onValueChange={setCapacity}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="select-capacity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 people</SelectItem>
              <SelectItem value="3">3 people</SelectItem>
              <SelectItem value="4">4 people</SelectItem>
              <SelectItem value="5">5 people</SelectItem>
              <SelectItem value="6">6 people</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="schedule" className="text-slate-300">Meeting Schedule</Label>
          <Input
            id="schedule"
            value={meetingSchedule}
            onChange={(e) => setMeetingSchedule(e.target.value)}
            placeholder="e.g., Tuesdays 7pm"
            className="bg-white/5 border-white/10 text-white"
            data-testid="input-schedule"
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={isLoading || !name} data-testid="button-create-pod">
        {isLoading ? "Creating..." : "Create Pod"}
      </Button>
    </form>
  );
}
