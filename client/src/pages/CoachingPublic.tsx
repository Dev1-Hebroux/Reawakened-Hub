import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  GraduationCap, Users, Calendar, Star, Loader2, 
  ChevronRight, Clock, User, BookOpen, MessageCircle
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import type { Coach, CoachingCohort, User as UserType } from "@shared/schema";

import coachDefault from "@assets/generated_images/mentorship_and_training_workshop.png";

interface CoachWithUser extends Coach {
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    email: string | null;
  };
}

interface CohortWithCoach extends CoachingCohort {
  coach?: {
    id: number;
    user?: {
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
    };
  };
}

const SPECIALTY_STYLES: Record<string, string> = {
  career: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  faith: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  relationships: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  leadership: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  vision: "bg-green-500/20 text-green-300 border-green-500/30",
  habits: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

const TOPIC_STYLES: Record<string, string> = {
  leadership: "bg-amber-500/20 text-amber-300",
  vision: "bg-green-500/20 text-green-300",
  faith: "bg-purple-500/20 text-purple-300",
  career: "bg-blue-500/20 text-blue-300",
  relationships: "bg-pink-500/20 text-pink-300",
};

export function CoachingPublic() {
  const [activeTab, setActiveTab] = useState("coaches");
  const [selectedCoach, setSelectedCoach] = useState<CoachWithUser | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<CohortWithCoach | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [bookingTopic, setBookingTopic] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: coaches = [], isLoading: loadingCoaches } = useQuery<CoachWithUser[]>({
    queryKey: ["/api/coaches/public"],
    queryFn: async () => {
      const res = await fetch("/api/coaches/public");
      if (!res.ok) throw new Error("Failed to fetch coaches");
      return res.json();
    },
  });

  const { data: cohorts = [], isLoading: loadingCohorts } = useQuery<CohortWithCoach[]>({
    queryKey: ["/api/cohorts/public"],
    queryFn: async () => {
      const res = await fetch("/api/cohorts/public");
      if (!res.ok) throw new Error("Failed to fetch cohorts");
      return res.json();
    },
  });

  const bookSessionMutation = useMutation({
    mutationFn: async ({ coachId, topic, notes }: { coachId: number; topic: string; notes: string }) => {
      return await apiRequest<any>("POST", "/api/coaching-sessions/book", { coachId, topic, notes });
    },
    onSuccess: () => {
      toast.success("Session request submitted! The coach will confirm soon.");
      setBookingModalOpen(false);
      setSelectedCoach(null);
      setBookingTopic("");
      setBookingNotes("");
    },
    onError: () => {
      toast.error("Failed to book session. Please try again.");
    },
  });

  const joinCohortMutation = useMutation({
    mutationFn: async (cohortId: number) => {
      return await apiRequest<any>("POST", `/api/cohorts/${cohortId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cohorts/public"] });
      toast.success("Successfully joined the cohort!");
      setJoinModalOpen(false);
      setSelectedCohort(null);
    },
    onError: () => {
      toast.error("Failed to join cohort. Please try again.");
    },
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return "TBD";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (cents: number | null) => {
    if (!cents) return "Free";
    return `$${(cents / 100).toLocaleString()}`;
  };

  const getCoachName = (coach: CoachWithUser) => {
    if (coach.user) {
      return `${coach.user.firstName || ""} ${coach.user.lastName || ""}`.trim() || "Coach";
    }
    return "Coach";
  };

  const getRatingStars = (rating: number | null) => {
    const stars = (rating || 0) / 100;
    return stars.toFixed(1);
  };

  const openBookingModal = (coach: CoachWithUser) => {
    if (!isAuthenticated) {
      toast.error("Please log in to book a coaching session");
      return;
    }
    setSelectedCoach(coach);
    setBookingModalOpen(true);
  };

  const openJoinModal = (cohort: CohortWithCoach) => {
    if (!isAuthenticated) {
      toast.error("Please log in to join a cohort");
      return;
    }
    setSelectedCohort(cohort);
    setJoinModalOpen(true);
  };

  const handleBookSession = () => {
    if (!selectedCoach || !bookingTopic) return;
    bookSessionMutation.mutate({ 
      coachId: selectedCoach.id, 
      topic: bookingTopic, 
      notes: bookingNotes 
    });
  };

  const handleJoinCohort = () => {
    if (!selectedCohort) return;
    joinCohortMutation.mutate(selectedCohort.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] to-[#0f1729]">
      <Navbar />
      
      <section className="pt-24 pb-12 px-4" data-testid="hero-coaching">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full mb-6">
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm font-medium">Personal Growth</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" data-testid="text-hero-title">
              Coaching & Mentorship
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Connect with experienced coaches for 1-on-1 guidance or join group cohorts 
              to grow alongside others on a similar journey.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-white/10 backdrop-blur-sm border border-white/10 mx-auto w-fit" data-testid="coaching-tabs">
              <TabsTrigger
                value="coaches"
                className="text-white data-[state=active]:bg-purple-500 data-[state=active]:text-white px-6"
                data-testid="tab-find-coach"
              >
                <User className="h-4 w-4 mr-2" /> Find a Coach
              </TabsTrigger>
              <TabsTrigger
                value="cohorts"
                className="text-white data-[state=active]:bg-purple-500 data-[state=active]:text-white px-6"
                data-testid="tab-group-cohorts"
              >
                <Users className="h-4 w-4 mr-2" /> Group Cohorts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="coaches" className="space-y-6">
              {loadingCoaches ? (
                <div className="flex items-center justify-center py-20" data-testid="loading-coaches">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : coaches.length === 0 ? (
                <Card className="bg-white/5 border-white/10" data-testid="card-no-coaches">
                  <CardContent className="p-12 text-center">
                    <GraduationCap className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No coaches available</h3>
                    <p className="text-gray-400">Coaches will be available soon. Check back later!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="coaches-grid">
                  {coaches.map((coach, i) => (
                    <motion.div
                      key={coach.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      data-testid={`card-coach-${coach.id}`}
                    >
                      <Card className="bg-white/5 border-white/10 overflow-hidden hover:bg-white/10 transition-all group h-full flex flex-col">
                        <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                              {coach.photoUrl || coach.user?.profileImageUrl ? (
                                <img
                                  src={coach.photoUrl || coach.user?.profileImageUrl || ""}
                                  alt={getCoachName(coach)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-8 w-8 text-purple-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-white truncate" data-testid={`text-coach-name-${coach.id}`}>
                                {getCoachName(coach)}
                              </h3>
                              <div className="flex items-center gap-1 text-amber-400">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-sm font-medium" data-testid={`text-coach-rating-${coach.id}`}>
                                  {getRatingStars(coach.rating)}
                                </span>
                                <span className="text-gray-500 text-sm">
                                  ({coach.totalSessions || 0} sessions)
                                </span>
                              </div>
                            </div>
                          </div>

                          {coach.specialties && coach.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-2" data-testid={`specialties-${coach.id}`}>
                              {coach.specialties.map((specialty, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className={SPECIALTY_STYLES[specialty] || "bg-gray-500/20 text-gray-300 border-gray-500/30"}
                                >
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {coach.bio && (
                            <p className="text-sm text-gray-400 line-clamp-3" data-testid={`text-coach-bio-${coach.id}`}>
                              {coach.bio}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-sm text-gray-400 pt-2 border-t border-white/10">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>60 min sessions</span>
                            </div>
                            {coach.hourlyRate && (
                              <span className="text-white font-medium">
                                {formatCurrency(coach.hourlyRate)}/hr
                              </span>
                            )}
                          </div>

                          <div className="pt-2 mt-auto">
                            <Button
                              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                              onClick={() => openBookingModal(coach)}
                              data-testid={`button-book-${coach.id}`}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" /> Book Session
                              <ChevronRight className="h-4 w-4 ml-auto" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cohorts" className="space-y-6">
              {loadingCohorts ? (
                <div className="flex items-center justify-center py-20" data-testid="loading-cohorts">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : cohorts.length === 0 ? (
                <Card className="bg-white/5 border-white/10" data-testid="card-no-cohorts">
                  <CardContent className="p-12 text-center">
                    <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No cohorts available</h3>
                    <p className="text-gray-400">Group cohorts will be available soon. Check back later!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="cohorts-grid">
                  {cohorts.map((cohort, i) => {
                    const spotsRemaining = cohort.maxParticipants 
                      ? (cohort.maxParticipants || 0) - (cohort.currentParticipants || 0)
                      : null;
                    
                    return (
                      <motion.div
                        key={cohort.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        data-testid={`card-cohort-${cohort.id}`}
                      >
                        <Card className="bg-white/5 border-white/10 overflow-hidden hover:bg-white/10 transition-all group h-full flex flex-col">
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={cohort.imageUrl || coachDefault}
                              alt={cohort.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute top-3 left-3">
                              <Badge className={TOPIC_STYLES[cohort.topic] || "bg-gray-500/20 text-gray-300"} data-testid={`badge-topic-${cohort.id}`}>
                                {cohort.topic}
                              </Badge>
                            </div>
                            <div className="absolute bottom-3 left-3 right-3">
                              <h3 className="text-lg font-bold text-white" data-testid={`text-cohort-title-${cohort.id}`}>
                                {cohort.title}
                              </h3>
                            </div>
                          </div>
                          
                          <CardContent className="p-4 space-y-4 flex-1 flex flex-col">
                            {cohort.description && (
                              <p className="text-sm text-gray-400 line-clamp-2">
                                {cohort.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-sm text-gray-400">
                              <div className="flex items-center gap-1" data-testid={`text-cohort-dates-${cohort.id}`}>
                                <Calendar className="h-4 w-4" />
                                {formatDate(cohort.startDate)}
                                {cohort.endDate && ` - ${formatDate(cohort.endDate)}`}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1" data-testid={`text-cohort-participants-${cohort.id}`}>
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className={spotsRemaining && spotsRemaining < 3 ? "text-orange-400" : "text-gray-400"}>
                                  {cohort.currentParticipants || 0}/{cohort.maxParticipants || "∞"} joined
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-400">{cohort.sessionCount || 8} sessions</span>
                              </div>
                            </div>

                            {cohort.price !== null && cohort.price !== undefined && (
                              <div className="text-sm">
                                <span className="text-white font-medium">{formatCurrency(cohort.price)}</span>
                                <span className="text-gray-500"> total</span>
                              </div>
                            )}

                            <div className="pt-2 mt-auto">
                              {cohort.status === "open" && (!spotsRemaining || spotsRemaining > 0) ? (
                                <Button
                                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                                  onClick={() => openJoinModal(cohort)}
                                  data-testid={`button-join-cohort-${cohort.id}`}
                                >
                                  <Users className="h-4 w-4 mr-2" /> Join Cohort
                                  <ChevronRight className="h-4 w-4 ml-auto" />
                                </Button>
                              ) : (
                                <Button 
                                  className="w-full" 
                                  variant="outline"
                                  disabled
                                  data-testid={`button-closed-${cohort.id}`}
                                >
                                  {spotsRemaining === 0 ? "Full" : "Coming Soon"}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="bg-[#1a2744] border-white/10 text-white max-w-md" data-testid="modal-booking">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Book a Session</DialogTitle>
          </DialogHeader>
          {selectedCoach && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-500/20 flex items-center justify-center">
                  {selectedCoach.photoUrl || selectedCoach.user?.profileImageUrl ? (
                    <img
                      src={selectedCoach.photoUrl || selectedCoach.user?.profileImageUrl || ""}
                      alt={getCoachName(selectedCoach)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-purple-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{getCoachName(selectedCoach)}</p>
                  <p className="text-sm text-gray-400">
                    {selectedCoach.hourlyRate ? formatCurrency(selectedCoach.hourlyRate) + "/hr" : "Free"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-gray-300">What would you like to discuss?</Label>
                <Select value={bookingTopic} onValueChange={setBookingTopic}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="select-topic">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="career">Career Growth</SelectItem>
                    <SelectItem value="faith">Faith Journey</SelectItem>
                    <SelectItem value="relationships">Relationships</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="vision">Vision & Goals</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-300">Additional notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Any specific questions or topics you'd like to cover..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  data-testid="input-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setBookingModalOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookSession}
              disabled={bookSessionMutation.isPending || !bookingTopic}
              className="bg-purple-500 hover:bg-purple-600"
              data-testid="button-confirm-booking"
            >
              {bookSessionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Request Session"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
        <DialogContent className="bg-[#1a2744] border-white/10 text-white max-w-md" data-testid="modal-join-cohort">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Join Cohort</DialogTitle>
          </DialogHeader>
          {selectedCohort && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <h4 className="font-medium mb-1">{selectedCohort.title}</h4>
                <p className="text-sm text-gray-400">
                  {formatDate(selectedCohort.startDate)} - {formatDate(selectedCohort.endDate)}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {selectedCohort.sessionCount || 8} sessions • {selectedCohort.maxParticipants || "Unlimited"} max participants
                </p>
                {selectedCohort.price !== null && selectedCohort.price !== undefined && (
                  <p className="text-sm text-white font-medium mt-2">
                    Cost: {formatCurrency(selectedCohort.price)}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-400">
                By joining this cohort, you commit to attending the scheduled sessions and participating actively in the group discussions.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setJoinModalOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinCohort}
              disabled={joinCohortMutation.isPending}
              className="bg-purple-500 hover:bg-purple-600"
              data-testid="button-confirm-join"
            >
              {joinCohortMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Join Cohort"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CoachingPublic;
