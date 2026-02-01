import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ArrowRight, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { DominionOnboarding } from "@/components/DominionOnboarding";
import { WeeklyChallenge } from "@/components/WeeklyChallenge";
import { SEO } from "@/components/SEO";
import { useDashboard } from "@/hooks/useDashboard";
import { useSparkSubscriptions } from "@/hooks/useSparkSubscriptions";
import { useSparkReactions } from "@/hooks/useSparkReactions";
import { useViewMode } from "@/hooks/useViewMode";
import { useEmailSubscription } from "@/hooks/useEmailSubscription";
import { HeroSection } from "@/components/sparks/HeroSection";
import { DailyDevotionalSection } from "@/components/sparks/DailyDevotionalSection";
import { ReflectionGrowthSection } from "@/components/sparks/ReflectionGrowthSection";
import { SparkFilters } from "@/components/sparks/SparkFilters";
import { SparkGrid } from "@/components/sparks/SparkGrid";
import { SubscribeModal } from "@/components/sparks/SubscribeModal";
import { IntercessionModal } from "@/components/sparks/IntercessionModal";
import { usePullToRefresh } from "@/hooks/useGestures";

const pillars = ["All", "daily-devotional", "worship", "testimony"];
const pillarLabels: Record<string, string> = {
  "All": "All",
  "daily-devotional": "Devotional",
  "worship": "Worship",
  "testimony": "Testimony"
};

const subscriptionCategories = ["daily-devotional", "worship", "testimony"];

export function SparksPage() {
  const [, params] = useRoute("/sparks/:id");
  const [, navigate] = useLocation();
  const sparkIdFromUrl = params?.id ? parseInt(params.id, 10) : null;

  const [activeFilter, setActiveFilter] = useState("All");
  const [showSubscribe, setShowSubscribe] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const userContentMode = (user as any)?.contentMode as 'reflection' | 'faith' | undefined;
  const userAudienceSegment = (user as any)?.audienceSegment as string | undefined;

  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    const completed = localStorage.getItem('dominion_onboarding_complete');
    return !completed;
  });

  const needsOnboarding = isAuthenticated && showOnboarding && !userContentMode && !userAudienceSegment;

  const [showIntercession, setShowIntercession] = useState(false);
  const [reflectionTab, setReflectionTab] = useState<'reflection' | 'growth'>('reflection');

  // Custom Hooks
  const { viewMode, handleViewModeChange } = useViewMode({
    isAuthenticated,
    userContentMode,
    userAudienceSegment,
  });

  const {
    subscriptions,
    subscriptionsLoading,
    subscribeMutation,
    unsubscribeMutation,
    isSubscribed,
    handleSubscriptionToggle,
  } = useSparkSubscriptions(isAuthenticated);

  const { handleSparkReaction } = useSparkReactions(isAuthenticated);

  const {
    emailInput,
    setEmailInput,
    emailSubmitting,
    emailSuccess,
    handleEmailSubscribe,
  } = useEmailSubscription();

  // Pull-to-refresh functionality
  const queryClient = useQueryClient();
  const { containerRef, pullDistance, isRefreshing, handlers } = usePullToRefresh(
    async () => {
      // Invalidate all dashboard queries to fetch fresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/me/progress"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/daily-tasks/progress"] })
      ]);
    },
    { threshold: 80, maxPull: 120 }
  );

  // Sync audience segment to localStorage
  useEffect(() => {
    if (userAudienceSegment) {
      localStorage.setItem('user_audience_segment', userAudienceSegment);
    }
  }, [userAudienceSegment]);

  const storedAudience = typeof window !== 'undefined' ? localStorage.getItem('user_audience_segment') : null;
  const effectiveAudience = userAudienceSegment || storedAudience || '';

  const dashboardResult = useDashboard({ userAudienceSegment: effectiveAudience });

  const sparks = dashboardResult.sparks ?? [];
  const todaySpark = dashboardResult.todaySpark;
  const featuredSparks = dashboardResult.featured ?? [];
  const todayReflection = dashboardResult.reflection;
  const activeSessions = dashboardResult.sessions ?? [];
  const isLoading = dashboardResult.isLoading;
  const todayLoading = isLoading;

  // Redirect old spark URLs
  useEffect(() => {
    if (sparkIdFromUrl) {
      navigate(`/spark/${sparkIdFromUrl}`, { replace: true });
    }
  }, [sparkIdFromUrl, navigate]);

  const filteredSparks = activeFilter === "All"
    ? sparks
    : sparks.filter(s => s.category === activeFilter);

  const featuredSpark = featuredSparks.length > 0 ? featuredSparks[0] : (sparks.length > 0 ? sparks[0] : null);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-white overflow-x-hidden"
      {...handlers}
    >
      <Navbar />

      {/* Pull-to-Refresh Indicator */}
      <AnimatePresence>
        {pullDistance > 0 && (
          <motion.div
            className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full px-4 py-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw className="h-4 w-4 text-primary" />
            </motion.div>
            <span className="text-sm font-medium text-primary">
              {isRefreshing ? "Refreshing..." : pullDistance >= 80 ? "Release to refresh" : "Pull to refresh"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <DominionOnboarding
        isOpen={needsOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />

      {/* Hero Section - Shows today's spark */}
      <HeroSection
        featuredSpark={todaySpark || featuredSpark}
        totalSparks={sparks.length}
        onWatchClick={() => (todaySpark || featuredSpark) && navigate(`/spark/${(todaySpark || featuredSpark)!.id}`)}
        onSubscribeClick={() => setShowSubscribe(true)}
      />

      {/* Daily Devotional Section */}
      <DailyDevotionalSection
        todaySpark={todaySpark}
        todayLoading={todayLoading}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onSparkClick={() => todaySpark && navigate(`/spark/${todaySpark.id}`)}
        onSubscribeClick={() => setShowSubscribe(true)}
        onReactionClick={() => {
          if (todaySpark) {
            handleSparkReaction(todaySpark.id, 'amen');
          }
        }}
      />

      {/* Reflection & Growth Section */}
      <ReflectionGrowthSection
        todayReflection={todayReflection}
        activeSessions={activeSessions}
        reflectionTab={reflectionTab}
        viewMode={viewMode}
        onTabChange={setReflectionTab}
        onIntercessionClick={() => setShowIntercession(true)}
      />

      {/* Weekly Challenge */}
      <WeeklyChallenge />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <SparkFilters
          pillars={pillars}
          pillarLabels={pillarLabels}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Spark Grid */}
        <SparkGrid
          sparks={filteredSparks}
          isLoading={isLoading}
          onSparkClick={(id) => navigate(`/spark/${id}`)}
          pillarLabels={pillarLabels}
        />

        {/* Reading Plans CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-[#7C9A8E]/20 to-[#4A7C7C]/10 rounded-3xl p-8 border border-white/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Ready for a Deeper Journey?</h3>
              <p className="text-gray-400 max-w-lg">
                Explore personalized Bible reading plans tailored to your spiritual growth. From 7-day quick studies to 30-day deep dives.
              </p>
            </div>
            <a
              href="/reading-plans"
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl transition-colors whitespace-nowrap"
              data-testid="link-reading-plans-cta"
            >
              <BookOpen className="h-5 w-5" />
              Explore Reading Plans
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Subscribe Modal */}
      <SubscribeModal
        isOpen={showSubscribe}
        isAuthenticated={isAuthenticated}
        subscriptions={subscriptions}
        subscriptionsLoading={subscriptionsLoading}
        subscribeMutation={subscribeMutation}
        unsubscribeMutation={unsubscribeMutation}
        emailInput={emailInput}
        emailSubmitting={emailSubmitting}
        emailSuccess={emailSuccess}
        pillarLabels={pillarLabels}
        subscriptionCategories={subscriptionCategories}
        isSubscribed={isSubscribed}
        onClose={() => setShowSubscribe(false)}
        onSubscriptionToggle={handleSubscriptionToggle}
        onEmailChange={setEmailInput}
        onEmailSubmit={handleEmailSubscribe}
      />

      {/* Live Intercession Modal */}
      <IntercessionModal
        isOpen={showIntercession}
        todaySpark={todaySpark}
        onClose={() => setShowIntercession(false)}
      />
    </div>
  );
}
