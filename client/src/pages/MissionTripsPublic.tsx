import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, Users, Calendar, MapPin, DollarSign, Loader2, 
  ChevronRight, Clock, Heart, Plane, X
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import type { MissionTrip } from "@shared/schema";

import tripDefault from "@assets/generated_images/global_mission_map_concept.png";

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "international", label: "International" },
  { value: "domestic", label: "Domestic" },
  { value: "local", label: "Local" },
];

const getTypeBadgeStyles = (type: string) => {
  switch (type) {
    case "international": return "bg-[#4A7C7C]/20 text-[#4A7C7C] border-[#4A7C7C]/30";
    case "domestic": return "bg-[#7C9A8E]/20 text-[#7C9A8E] border-[#7C9A8E]/30";
    case "local": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
};

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "open": return "bg-green-500/20 text-green-300";
    case "closed": return "bg-gray-500/20 text-gray-400";
    case "in_progress": return "bg-blue-500/20 text-blue-300";
    case "completed": return "bg-purple-500/20 text-purple-300";
    default: return "bg-gray-500/20 text-gray-400";
  }
};

export function MissionTripsPublic() {
  const [filter, setFilter] = useState("all");
  const [selectedTrip, setSelectedTrip] = useState<MissionTrip | null>(null);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [whyApply, setWhyApply] = useState("");
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading } = useQuery<MissionTrip[]>({
    queryKey: ["/api/mission-trips/public", filter],
    queryFn: async () => {
      const params = filter !== "all" ? `?type=${filter}` : "";
      const res = await fetch(`/api/mission-trips/public${params}`);
      if (!res.ok) throw new Error("Failed to fetch mission trips");
      return res.json();
    },
  });

  const applyMutation = useMutation({
    mutationFn: async ({ tripId, whyApply }: { tripId: number; whyApply: string }) => {
      const res = await apiRequest("POST", `/api/mission-trips/${tripId}/apply`, { whyApply });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mission-trips/public"] });
      toast.success("Application submitted successfully!");
      setApplicationModalOpen(false);
      setSelectedTrip(null);
      setWhyApply("");
    },
    onError: () => {
      toast.error("Failed to submit application. Please try again.");
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

  const openApplicationModal = (trip: MissionTrip) => {
    if (!isAuthenticated) {
      toast.error("Please log in to apply for mission trips");
      return;
    }
    setSelectedTrip(trip);
    setApplicationModalOpen(true);
  };

  const handleApply = () => {
    if (!selectedTrip) return;
    applyMutation.mutate({ tripId: selectedTrip.id, whyApply });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] to-[#0f1729]">
      <Navbar />
      
      <section className="pt-24 pb-12 px-4" data-testid="hero-mission-trips">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#4A7C7C]/20 text-[#4A7C7C] px-4 py-2 rounded-full mb-6">
              <Globe className="h-5 w-5" />
              <span className="text-sm font-medium">Go & Make Disciples</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" data-testid="text-hero-title">
              Mission Trips & Outreach
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Join life-changing mission trips around the world. Serve communities, 
              share the Gospel, and grow in your faith journey.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Tabs value={filter} onValueChange={setFilter} className="mb-8">
            <TabsList className="bg-white/10 backdrop-blur-sm border border-white/10" data-testid="filter-tabs">
              {TYPE_FILTERS.map(f => (
                <TabsTrigger
                  key={f.value}
                  value={f.value}
                  className="text-white data-[state=active]:bg-[#4A7C7C] data-[state=active]:text-white"
                  data-testid={`tab-filter-${f.value}`}
                >
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex items-center justify-center py-20" data-testid="loading-spinner">
              <Loader2 className="h-8 w-8 animate-spin text-[#4A7C7C]" />
            </div>
          ) : trips.length === 0 ? (
            <Card className="bg-white/5 border-white/10" data-testid="card-no-trips">
              <CardContent className="p-12 text-center">
                <Globe className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No trips available</h3>
                <p className="text-gray-400">
                  {filter !== "all" 
                    ? `No ${filter} trips at the moment. Check back soon!`
                    : "Mission trips are coming soon. Stay tuned!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="trips-grid">
              {trips.map((trip, i) => {
                const spotsRemaining = trip.maxParticipants 
                  ? trip.maxParticipants - (trip.currentParticipants || 0)
                  : null;
                const fundraisingProgress = trip.fundraisingGoal 
                  ? Math.min(100, ((trip.currentFundraising || 0) / trip.fundraisingGoal) * 100)
                  : 0;
                
                return (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    data-testid={`card-trip-${trip.id}`}
                  >
                    <Card className="bg-white/5 border-white/10 overflow-hidden hover:bg-white/10 transition-all group h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={trip.imageUrl || tripDefault}
                          alt={trip.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge variant="outline" className={getTypeBadgeStyles(trip.type)} data-testid={`badge-type-${trip.id}`}>
                            {trip.type === "international" && <Plane className="h-3 w-3 mr-1" />}
                            {trip.type}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge className={getStatusBadgeStyles(trip.status || "draft")} data-testid={`badge-status-${trip.id}`}>
                            {(trip.status || "draft").replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-lg font-bold text-white truncate" data-testid={`text-title-${trip.id}`}>
                            {trip.title}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-gray-300">
                            <MapPin className="h-3 w-3" />
                            <span data-testid={`text-destination-${trip.id}`}>
                              {trip.destination}{trip.country && `, ${trip.country}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-4 space-y-4 flex-1 flex flex-col">
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center gap-1" data-testid={`text-dates-${trip.id}`}>
                            <Calendar className="h-4 w-4" />
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-300" data-testid={`text-cost-${trip.id}`}>
                            <DollarSign className="h-4 w-4 text-green-400" />
                            <span>{formatCurrency(trip.cost)}</span>
                          </div>
                          <div className="flex items-center gap-1" data-testid={`text-spots-${trip.id}`}>
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className={spotsRemaining && spotsRemaining < 5 ? "text-orange-400" : "text-gray-400"}>
                              {spotsRemaining !== null ? `${spotsRemaining} spots left` : "Open"}
                            </span>
                          </div>
                        </div>

                        {trip.applicationDeadline && (
                          <div className="flex items-center gap-2 text-sm text-amber-400">
                            <Clock className="h-4 w-4" />
                            <span>Apply by {formatDate(trip.applicationDeadline)}</span>
                          </div>
                        )}

                        {trip.fundraisingGoal && (
                          <div className="space-y-2" data-testid={`fundraising-${trip.id}`}>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Fundraising</span>
                              <span className="text-[#4A7C7C] font-medium">
                                {formatCurrency(trip.currentFundraising)} / {formatCurrency(trip.fundraisingGoal)}
                              </span>
                            </div>
                            <Progress value={fundraisingProgress} className="h-2 bg-white/10" />
                          </div>
                        )}

                        {trip.activities && trip.activities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {trip.activities.slice(0, 3).map((activity, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs text-gray-400 border-gray-600">
                                {activity}
                              </Badge>
                            ))}
                            {trip.activities.length > 3 && (
                              <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                                +{trip.activities.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="pt-2 mt-auto">
                          {trip.status === "open" && (!spotsRemaining || spotsRemaining > 0) ? (
                            <Button
                              className="w-full bg-[#4A7C7C] hover:bg-[#3d6969] text-white"
                              onClick={() => openApplicationModal(trip)}
                              data-testid={`button-apply-${trip.id}`}
                            >
                              <Heart className="h-4 w-4 mr-2" /> Apply Now
                              <ChevronRight className="h-4 w-4 ml-auto" />
                            </Button>
                          ) : (
                            <Button 
                              className="w-full" 
                              variant="outline"
                              disabled
                              data-testid={`button-closed-${trip.id}`}
                            >
                              {spotsRemaining === 0 ? "Full" : "Applications Closed"}
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
        </div>
      </section>

      <AnimatePresence>
        {applicationModalOpen && selectedTrip && (
          <Dialog open={applicationModalOpen} onOpenChange={setApplicationModalOpen}>
            <DialogContent className="bg-[#1a2744] border-white/10 text-white max-w-md" data-testid="modal-application">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Apply for {selectedTrip.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <MapPin className="h-5 w-5 text-[#4A7C7C]" />
                  <div>
                    <p className="font-medium">{selectedTrip.destination}</p>
                    <p className="text-sm text-gray-400">
                      {formatDate(selectedTrip.startDate)} - {formatDate(selectedTrip.endDate)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whyApply" className="text-gray-300">Why do you want to join this trip?</Label>
                  <Textarea
                    id="whyApply"
                    value={whyApply}
                    onChange={(e) => setWhyApply(e.target.value)}
                    placeholder="Share your heart for this mission..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[120px]"
                    data-testid="input-why-apply"
                  />
                </div>
                <p className="text-sm text-gray-400">
                  Your application will be reviewed by the trip leader. You'll be notified once a decision is made.
                </p>
              </div>
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setApplicationModalOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                  data-testid="button-cancel-application"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={applyMutation.isPending || !whyApply.trim()}
                  className="bg-[#4A7C7C] hover:bg-[#3d6969]"
                  data-testid="button-submit-application"
                >
                  {applyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MissionTripsPublic;
