import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Calendar, MapPin, ChevronRight, Trophy, BookOpen, Target, Clock, Flame, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Event, Challenge, Journey, ChallengeEnrollment, EventRegistration } from "@shared/schema";

type ActivityData = {
  events: { registration: EventRegistration; event: Event }[];
  challenges: { enrollment: ChallengeEnrollment; challenge: Challenge }[];
  journeys: { userJourney: any; journey: Journey; completedDaysCount: number }[];
};

export default function MyActivity() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: activity, isLoading } = useQuery<ActivityData>({
    queryKey: ["/api/me/activity"],
    enabled: isAuthenticated,
  });

  const upcomingEvents = activity?.events.filter(e => new Date(e.event.startDate) > new Date()) || [];
  const pastEvents = activity?.events.filter(e => new Date(e.event.startDate) <= new Date()) || [];
  const activeChallenges = activity?.challenges.filter(c => c.enrollment.status === 'active') || [];
  const completedChallenges = activity?.challenges.filter(c => c.enrollment.status === 'completed') || [];
  const activeJourneys = activity?.journeys.filter(j => j.userJourney.status === 'active') || [];
  const completedJourneys = activity?.journeys.filter(j => j.userJourney.status === 'completed') || [];

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1a2744]">
        <Navbar />
        <main className="pt-28 pb-32 px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-[#1a2744] dark:text-white mb-4">Sign In Required</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Sign in to view your activity and track your journey.</p>
            <Button onClick={() => window.location.href = "/api/login"} data-testid="button-sign-in">
              Sign In
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a2744]">
      <Navbar />
      
      <main className="pt-28 pb-32 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-[#4A7C7C] dark:text-[#7C9A8E] mb-6 hover:underline"
            data-testid="link-back-profile"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-[#1a2744] dark:text-white mb-2">My Activity</h1>
            <p className="text-gray-600 dark:text-gray-300">Track your events, challenges, and journeys all in one place.</p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#7C9A8E] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="events" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 dark:bg-[#19233b]" data-testid="tabs-activity">
                <TabsTrigger value="events" className="flex items-center gap-2" data-testid="tab-events">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Events</span>
                  {activity?.events.length ? <span className="ml-1 text-xs bg-[#7C9A8E] text-white px-1.5 rounded-full">{activity.events.length}</span> : null}
                </TabsTrigger>
                <TabsTrigger value="challenges" className="flex items-center gap-2" data-testid="tab-challenges">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Challenges</span>
                  {activity?.challenges.length ? <span className="ml-1 text-xs bg-[#D4A574] text-white px-1.5 rounded-full">{activity.challenges.length}</span> : null}
                </TabsTrigger>
                <TabsTrigger value="journeys" className="flex items-center gap-2" data-testid="tab-journeys">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Journeys</span>
                  {activity?.journeys.length ? <span className="ml-1 text-xs bg-[#4A7C7C] text-white px-1.5 rounded-full">{activity.journeys.length}</span> : null}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="events">
                {upcomingEvents.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#1a2744] dark:text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#7C9A8E]" />
                      Upcoming Events
                    </h3>
                    <div className="space-y-3">
                      {upcomingEvents.map(({ registration, event }) => (
                        <motion.div
                          key={registration.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-gradient-to-r from-[#7C9A8E]/10 to-transparent dark:from-[#7C9A8E]/20 p-4 rounded-xl border border-[#7C9A8E]/20"
                          data-testid={`card-event-${registration.id}`}
                        >
                          <h4 className="font-semibold text-[#1a2744] dark:text-white mb-2">{event.title}</h4>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(event.startDate)} at {formatTime(event.startDate)}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {pastEvents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-4">Past Events</h3>
                    <div className="space-y-3">
                      {pastEvents.map(({ registration, event }) => (
                        <div
                          key={registration.id}
                          className="bg-gray-50 dark:bg-[#19233b]/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 opacity-75"
                          data-testid={`card-past-event-${registration.id}`}
                        >
                          <h4 className="font-semibold text-gray-600 dark:text-gray-300">{event.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {formatDate(event.startDate)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activity?.events.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Events Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Discover upcoming events and gatherings.</p>
                    <Button variant="outline" onClick={() => navigate("/")} data-testid="button-explore-events">
                      Explore Events
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="challenges">
                {activeChallenges.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#1a2744] dark:text-white mb-4 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-[#D4A574]" />
                      Active Challenges
                    </h3>
                    <div className="space-y-3">
                      {activeChallenges.map(({ enrollment, challenge }) => (
                        <motion.div
                          key={enrollment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => navigate("/challenges")}
                          className="bg-gradient-to-r from-[#D4A574]/10 to-transparent dark:from-[#D4A574]/20 p-4 rounded-xl border border-[#D4A574]/20 cursor-pointer hover:border-[#D4A574]/40 transition-colors"
                          data-testid={`card-challenge-${enrollment.id}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-[#1a2744] dark:text-white">{challenge.title}</h4>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              Day {enrollment.progressDay || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="w-4 h-4" />
                              {enrollment.progressDay || 0} / {challenge.goal} {challenge.goalUnit}
                            </span>
                          </div>
                          <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#D4A574] to-[#C49464] rounded-full transition-all"
                              style={{ width: `${Math.min(((enrollment.progressDay || 0) / challenge.goal) * 100, 100)}%` }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {completedChallenges.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Completed Challenges
                    </h3>
                    <div className="space-y-3">
                      {completedChallenges.map(({ enrollment, challenge }) => (
                        <div
                          key={enrollment.id}
                          className="bg-gray-50 dark:bg-[#19233b]/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                          data-testid={`card-completed-challenge-${enrollment.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#D4A574]/20 flex items-center justify-center">
                              <Trophy className="w-5 h-5 text-[#D4A574]" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-700 dark:text-gray-200">{challenge.title}</h4>
                              <p className="text-sm text-gray-500">{challenge.goal} {challenge.goalUnit} completed</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activity?.challenges.length === 0 && (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Challenges Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Join a challenge to build spiritual habits.</p>
                    <Button variant="outline" onClick={() => navigate("/challenges")} data-testid="button-explore-challenges">
                      Explore Challenges
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="journeys">
                {activeJourneys.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#1a2744] dark:text-white mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#4A7C7C]" />
                      Active Journeys
                    </h3>
                    <div className="space-y-3">
                      {activeJourneys.map(({ userJourney, journey, completedDaysCount }) => (
                        <motion.div
                          key={userJourney.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => navigate(`/journeys/${journey.slug}`)}
                          className="bg-gradient-to-r from-[#4A7C7C]/10 to-transparent dark:from-[#4A7C7C]/20 p-4 rounded-xl border border-[#4A7C7C]/20 cursor-pointer hover:border-[#4A7C7C]/40 transition-colors"
                          data-testid={`card-journey-${userJourney.id}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-[#1a2744] dark:text-white">{journey.title}</h4>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{journey.subtitle}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {completedDaysCount} / {journey.durationDays} days
                            </span>
                          </div>
                          <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#4A7C7C] to-[#7C9A8E] rounded-full transition-all"
                              style={{ width: `${Math.min((completedDaysCount / journey.durationDays) * 100, 100)}%` }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {completedJourneys.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-4">Completed Journeys</h3>
                    <div className="space-y-3">
                      {completedJourneys.map(({ userJourney, journey }) => (
                        <div
                          key={userJourney.id}
                          className="bg-gray-50 dark:bg-[#19233b]/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                          data-testid={`card-completed-journey-${userJourney.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#4A7C7C]/20 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-[#4A7C7C]" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-700 dark:text-gray-200">{journey.title}</h4>
                              <p className="text-sm text-gray-500">{journey.durationDays} days completed</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activity?.journeys.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Journeys Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Start a guided journey to grow in your faith.</p>
                    <Button variant="outline" onClick={() => navigate("/journeys")} data-testid="button-explore-journeys">
                      Explore Journeys
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}
