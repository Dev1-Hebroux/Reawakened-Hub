import { motion } from "framer-motion";
import { 
  ArrowLeft, Calendar, Users, Clock, Play, CheckCircle2, 
  Loader2, MessageSquare, Heart, ChevronRight
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { format, differenceInDays } from "date-fns";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { AlphaCohort, AlphaCohortWeek, AlphaCohortParticipant } from "@shared/schema";

interface CohortDetail extends AlphaCohort {
  weeks: AlphaCohortWeek[];
  participantCount: number;
}

interface UserCohort {
  cohort: AlphaCohort;
  participant: AlphaCohortParticipant;
  progress: { weekNumber: number; watched: boolean; prayerCompleted: boolean }[];
}

export function AlphaCohortDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cohort, isLoading } = useQuery<CohortDetail>({
    queryKey: [`/api/alpha-cohorts/${id}`],
    enabled: !!id,
  });

  const { data: userCohorts = [] } = useQuery<UserCohort[]>({
    queryKey: ["/api/me/alpha-cohorts"],
  });

  const isEnrolled = userCohorts.some(uc => uc.cohort.id === Number(id));
  const userCohort = userCohorts.find(uc => uc.cohort.id === Number(id));

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/alpha-cohorts/${id}/enroll`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to enroll");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me/alpha-cohorts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/alpha-cohorts/${id}`] });
      toast({
        title: "Welcome to the cohort!",
        description: "You've successfully enrolled in this Alpha journey.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cohort) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] text-white">
        <Navbar />
        <div className="pt-28 pb-20 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Cohort Not Found</h1>
          <Link href="/journeys">
            <Button variant="outline">Back to Journeys</Button>
          </Link>
        </div>
      </div>
    );
  }

  const daysUntilStart = differenceInDays(new Date(cohort.startDate), new Date());
  const spotsLeft = (cohort.capacity || 50) - cohort.participantCount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] text-white overflow-x-hidden">
      <Navbar />
      
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/journeys">
            <button className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors" data-testid="button-back-journeys">
              <ArrowLeft className="h-4 w-4" />
              Back to Journeys
            </button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-400 border border-orange-500/30">
                Alpha Course
              </span>
              <span className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                cohort.status === "active" 
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-blue-500/20 text-blue-400 border-blue-500/30"
              }`}>
                {cohort.status === "active" ? "In Progress" : "Coming Soon"}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4" data-testid="text-cohort-title">
              {cohort.title}
            </h1>
            
            {cohort.description && (
              <p className="text-lg text-gray-400 mb-8">
                {cohort.description}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <Calendar className="h-5 w-5 text-orange-400 mb-2" />
                <p className="text-sm text-gray-400">Starts</p>
                <p className="font-bold">{format(new Date(cohort.startDate), "MMM d, yyyy")}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <Clock className="h-5 w-5 text-orange-400 mb-2" />
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-bold">{cohort.weeks?.length || 0} Weeks</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <Users className="h-5 w-5 text-orange-400 mb-2" />
                <p className="text-sm text-gray-400">Enrolled</p>
                <p className="font-bold">{cohort.participantCount} / {cohort.capacity || 50}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <Play className="h-5 w-5 text-orange-400 mb-2" />
                <p className="text-sm text-gray-400">Format</p>
                <p className="font-bold">Video + Discussion</p>
              </div>
            </div>

            {!isEnrolled ? (
              <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-orange-500/30 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Ready to explore life's big questions?</h3>
                    <p className="text-gray-400">
                      {daysUntilStart > 0 
                        ? `${daysUntilStart} days until we begin. ${spotsLeft} spots remaining.`
                        : `${spotsLeft} spots remaining. Join now!`
                      }
                    </p>
                  </div>
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                    data-testid="button-enroll"
                  >
                    {enrollMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Join This Cohort
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                  <div>
                    <h3 className="text-lg font-bold text-green-400">You're enrolled!</h3>
                    <p className="text-gray-400 text-sm">Access your weekly content below</p>
                  </div>
                </div>
                {cohort.status === "active" && (
                  <Link href={`/alpha/${id}/week/1`}>
                    <Button className="bg-green-600 hover:bg-green-700" data-testid="button-continue">
                      Continue to Current Week
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold mb-6">Weekly Schedule</h2>
          
          <div className="space-y-4">
            {(cohort.weeks || []).sort((a, b) => a.weekNumber - b.weekNumber).map((week) => {
              const weekProgress = userCohort?.progress?.find(p => p.weekNumber === week.weekNumber);
              const isWatched = weekProgress?.watched;
              const isPrayerDone = weekProgress?.prayerCompleted;

              return (
                <motion.div
                  key={week.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="group"
                  data-testid={`card-week-${week.weekNumber}`}
                >
                  {isEnrolled && cohort.status === "active" ? (
                    <Link href={`/alpha/${id}/week/${week.weekNumber}`}>
                      <WeekCard week={week} isWatched={isWatched} isPrayerDone={isPrayerDone} clickable />
                    </Link>
                  ) : (
                    <WeekCard week={week} isWatched={false} isPrayerDone={false} clickable={false} />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function WeekCard({ week, isWatched, isPrayerDone, clickable }: { 
  week: AlphaCohortWeek; 
  isWatched?: boolean;
  isPrayerDone?: boolean;
  clickable: boolean;
}) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl p-5 transition-all ${
      clickable ? "hover:border-orange-500/50 cursor-pointer" : ""
    }`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-orange-500/30 flex items-center justify-center">
          <span className="text-orange-400 font-bold">{week.weekNumber}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className={`font-bold text-lg ${clickable ? "group-hover:text-orange-400 transition-colors" : "text-white"}`}>
                {week.theme}
              </h3>
              {week.description && (
                <p className="text-sm text-gray-400 mt-1">{week.description}</p>
              )}
              {week.watchPartyDate && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Watch Party: {format(new Date(week.watchPartyDate), "EEE, MMM d 'at' h:mm a")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isWatched && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                  <Play className="h-3 w-3" /> Watched
                </span>
              )}
              {isPrayerDone && (
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Prayed
                </span>
              )}
              {clickable && <ChevronRight className="h-5 w-5 text-gray-500" />}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Play className="h-3.5 w-3.5" /> Video Episode
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" /> Discussion
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" /> Prayer Action
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlphaCohortDetail;
