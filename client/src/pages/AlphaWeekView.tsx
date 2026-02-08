import { motion } from "framer-motion";
import { 
  ArrowLeft, Play, MessageSquare, Heart, Check, 
  Loader2, ChevronLeft, ChevronRight, Clock, Users
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { AlphaCohort, AlphaCohortWeek, AlphaCohortParticipant } from "@shared/schema";

interface WeekContent {
  week: AlphaCohortWeek;
  cohort: AlphaCohort;
  participant: AlphaCohortParticipant;
  progress: {
    watchedAt: string | null;
    discussionNotes: string | null;
    prayerActionCompletedAt: string | null;
    reflection: string | null;
  } | null;
}

export function AlphaWeekView() {
  const { cohortId, weekNumber } = useParams<{ cohortId: string; weekNumber: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [reflection, setReflection] = useState("");

  const { data, isLoading, error } = useQuery<WeekContent>({
    queryKey: [`/api/alpha-cohorts/${cohortId}/week/${weekNumber}`],
    enabled: !!cohortId && !!weekNumber,
  });

  const updateProgress = useMutation({
    mutationFn: async (updates: { watchedAt?: boolean; prayerActionCompletedAt?: boolean; reflection?: string }) => {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      return await apiFetchJson("/api/alpha-cohort-progress", {
        method: "POST",
        body: JSON.stringify({
          participantId: data?.participant.id,
          weekNumber: Number(weekNumber),
          ...updates,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/alpha-cohorts/${cohortId}/week/${weekNumber}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/alpha-cohorts"] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] text-white">
        <Navbar />
        <div className="pt-28 pb-20 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Content Not Available</h1>
          <p className="text-gray-400 mb-6">You may need to enroll in this cohort first.</p>
          <Link href={`/alpha/${cohortId}`}>
            <Button variant="outline">Back to Cohort</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { week, cohort, progress } = data;
  const isWatched = !!progress?.watchedAt;
  const isPrayerDone = !!progress?.prayerActionCompletedAt;
  const weekNum = Number(weekNumber);
  const discussionPrompts = week.discussionPrompts as string[] | null;

  const handleMarkWatched = () => {
    updateProgress.mutate({ watchedAt: true });
    toast({ title: "Video marked as watched!" });
  };

  const handleMarkPrayerDone = () => {
    updateProgress.mutate({ prayerActionCompletedAt: true });
    toast({ title: "Prayer action completed!" });
  };

  const handleSaveReflection = () => {
    updateProgress.mutate({ reflection });
    toast({ title: "Reflection saved!" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] text-white overflow-x-hidden">
      <Navbar />
      
      <section className="relative pt-28 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href={`/alpha/${cohortId}`}>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors" data-testid="button-back-cohort">
              <ArrowLeft className="h-4 w-4" />
              Back to {cohort.title}
            </button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-400 border border-orange-500/30">
                Week {weekNum}
              </span>
              {isWatched && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                  <Check className="h-3 w-3" /> Video Watched
                </span>
              )}
              {isPrayerDone && (
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Prayer Done
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2" data-testid="text-week-theme">
              {week.theme}
            </h1>
            
            {week.description && (
              <p className="text-gray-400 mb-6">
                {week.description}
              </p>
            )}

            {week.watchPartyDate && (
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-2 mb-6">
                <Clock className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-orange-300">
                  Watch Party: {format(new Date(week.watchPartyDate), "EEEE, MMMM d 'at' h:mm a")}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Play className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Alpha Film Series Episode</h2>
                <p className="text-sm text-gray-400">Watch the video, then discuss with your group</p>
              </div>
            </div>
            
            {week.videoUrl ? (
              <div className="aspect-video bg-black/50">
                <iframe
                  src={week.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video bg-black/20 flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">Video coming soon</p>
                </div>
              </div>
            )}
            
            <div className="p-4">
              {!isWatched ? (
                <Button 
                  onClick={handleMarkWatched}
                  disabled={updateProgress.isPending}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  data-testid="button-mark-watched"
                >
                  {updateProgress.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Mark as Watched
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Discussion Prompts</h2>
                <p className="text-sm text-gray-400">Questions to explore with your group</p>
              </div>
            </div>
            
            {discussionPrompts && discussionPrompts.length > 0 ? (
              <ul className="space-y-4">
                {discussionPrompts.map((prompt, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-gray-300">{prompt}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Discussion prompts will be added soon.</p>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Heart className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Weekly Prayer Action</h2>
                <p className="text-sm text-gray-400">A simple step to put your faith into practice</p>
              </div>
            </div>
            
            {week.prayerAction ? (
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-gray-200">{week.prayerAction}</p>
              </div>
            ) : (
              <p className="text-gray-500 mb-4">Prayer action will be added soon.</p>
            )}

            {!isPrayerDone ? (
              <Button 
                onClick={handleMarkPrayerDone}
                disabled={updateProgress.isPending}
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                data-testid="button-mark-prayer"
              >
                {updateProgress.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
                Mark Prayer Action Complete
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-purple-400">
                <Heart className="h-5 w-5 fill-current" />
                <span className="font-medium">Prayer action completed!</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-2">Personal Reflection</h2>
            <p className="text-sm text-gray-400 mb-4">
              Capture your thoughts, questions, or insights from this week
            </p>
            <Textarea
              value={reflection || progress?.reflection || ""}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What stood out to you this week? Any questions or insights?"
              className="bg-white/5 border-white/20 min-h-[120px] mb-4"
              data-testid="input-reflection"
            />
            <Button 
              onClick={handleSaveReflection}
              disabled={updateProgress.isPending}
              variant="outline"
              data-testid="button-save-reflection"
            >
              Save Reflection
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {weekNum > 1 ? (
              <Link href={`/alpha/${cohortId}/week/${weekNum - 1}`}>
                <Button variant="ghost" className="text-gray-400 hover:text-white" data-testid="button-prev-week">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous Week
                </Button>
              </Link>
            ) : <div />}
            
            <Link href={`/alpha/${cohortId}/week/${weekNum + 1}`}>
              <Button variant="ghost" className="text-gray-400 hover:text-white" data-testid="button-next-week">
                Next Week
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AlphaWeekView;
