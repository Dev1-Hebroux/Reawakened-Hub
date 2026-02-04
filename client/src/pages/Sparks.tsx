import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ArrowRight, RefreshCw, Play, Calendar, Flame, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { DominionOnboarding } from "@/components/DominionOnboarding";
import { SEO } from "@/components/SEO";
import { useDashboard } from "@/hooks/useDashboard";
import { useSparkSubscriptions } from "@/hooks/useSparkSubscriptions";
import { useEmailSubscription } from "@/hooks/useEmailSubscription";
import { HeroSection } from "@/components/sparks/HeroSection";
import { SparkFilters } from "@/components/sparks/SparkFilters";
import { SparkGrid } from "@/components/sparks/SparkGrid";
import { SubscribeModal } from "@/components/sparks/SubscribeModal";
import { PodcastSection } from "@/components/sparks/PodcastSection";
import { usePullToRefresh } from "@/hooks/useGestures";
import { getSparkImage } from "@/lib/sparkImageUtils";

const pillars = ["All", "daily-devotional", "worship", "testimony", "podcast"];
const pillarLabels: Record<string, string> = {
  "All": "All",
  "daily-devotional": "Devotional",
  "worship": "Worship",
  "testimony": "Testimony",
  "podcast": "Podcast"
};

const subscriptionCategories = ["daily-devotional", "worship", "testimony", "podcast"];

export function SparksPage() {
  const [, params] = useRoute("/sparks/:id");
  const [, navigate] = useLocation();
  const sparkIdFromUrl = params?.id ? parseInt(params.id, 10) : null;

  const [activeFilter, setActiveFilter] = useState("All");
  const [showSubscribe, setShowSubscribe] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const userAudienceSegment = (user as any)?.audienceSegment as string | undefined;
  const userContentMode = (user as any)?.contentMode as 'reflection' | 'faith' | undefined;

  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    const completed = localStorage.getItem('dominion_onboarding_complete');
    return !completed;
  });

  const needsOnboarding = isAuthenticated && showOnboarding && !userContentMode && !userAudienceSegment;

  const {
    subscriptions,
    subscriptionsLoading,
    subscribeMutation,
    unsubscribeMutation,
    isSubscribed,
    handleSubscriptionToggle,
  } = useSparkSubscriptions(isAuthenticated);

  const {
    emailInput,
    setEmailInput,
    emailSubmitting,
    emailSuccess,
    handleEmailSubscribe,
  } = useEmailSubscription();

  // Pull-to-refresh
  const queryClient = useQueryClient();
  const { containerRef, pullDistance, isRefreshing, handlers } = usePullToRefresh(
    async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/me/progress"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/daily-tasks/progress"] })
      ]);
    },
    { threshold: 80, maxPull: 120 }
  );

  // Sync audience segment
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
  const isLoading = dashboardResult.isLoading;

  // Redirect old spark URLs
  useEffect(() => {
    if (sparkIdFromUrl) {
      navigate(`/spark/${sparkIdFromUrl}`, { replace: true });
    }
  }, [sparkIdFromUrl, navigate]);

  // Handle hash navigation (e.g. /sparks#podcast)
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const filteredSparks = activeFilter === "All"
    ? sparks
    : sparks.filter(s => s.category === activeFilter);

  const featuredSpark = featuredSparks.length > 0 ? featuredSparks[0] : (sparks.length > 0 ? sparks[0] : null);
  const heroSpark = todaySpark || featuredSpark;

  // Group sparks by category for horizontal scroll sections
  const devotionals = sparks.filter(s => s.category === 'daily-devotional');
  const worshipSparks = sparks.filter(s => s.category === 'worship');
  const testimonies = sparks.filter(s => s.category === 'testimony');

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-white overflow-x-hidden"
      {...handlers}
    >
      <SEO
        title="Sparks - Reawakened"
        description="Daily devotionals, worship, testimonies, and the Reawakened One Podcast. Ignite your spiritual journey."
      />
      <Navbar />

      {/* Pull-to-Refresh */}
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

      {/* 1. Hero Section */}
      <HeroSection
        featuredSpark={heroSpark}
        totalSparks={sparks.length}
        onWatchClick={() => heroSpark && navigate(`/spark/${heroSpark.id}`)}
        onSubscribeClick={() => setShowSubscribe(true)}
      />

      {/* 2. Sticky Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SparkFilters
          pillars={pillars}
          pillarLabels={pillarLabels}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      {/* 3. Today's Featured Spark */}
      {heroSpark && activeFilter === "All" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              onClick={() => navigate(`/spark/${heroSpark.id}`)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500"
            >
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-video md:aspect-auto md:min-h-[260px]">
                  <img
                    src={getSparkImage(heroSpark, 0)}
                    alt={heroSpark.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: 'brightness(0.85) saturate(1.1)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60 hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-14 w-14 bg-white/15 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/25 group-hover:scale-110 group-hover:bg-white/25 transition-all duration-500 shadow-2xl">
                      <Play className="h-6 w-6 fill-white text-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center bg-gradient-to-br from-white/[0.04] to-transparent">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-primary/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Today's Word
                    </span>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-2 tracking-tight">
                    {heroSpark.title}
                  </h3>
                  <p className="text-sm text-white/50 line-clamp-2 mb-4 leading-relaxed">
                    {heroSpark.description}
                  </p>
                  {heroSpark.scriptureRef && (
                    <p className="text-sm text-primary font-semibold">
                      {heroSpark.scriptureRef}
                    </p>
                  )}
                  {heroSpark.duration && (
                    <p className="text-xs text-white/30 mt-2">
                      {Math.floor(heroSpark.duration / 60)} min {heroSpark.mediaType === 'video' ? 'watch' : 'listen'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 4. Category Sections — Horizontal Scroll (Spotify/YouTube Music style) */}
      {activeFilter === "All" && (
        <div className="space-y-10 mb-12">
          {/* Devotionals Carousel */}
          {devotionals.length > 0 && (
            <HorizontalSection
              title="Daily Devotionals"
              subtitle="Start your day with the Word"
              sparks={devotionals}
              onSparkClick={(id) => navigate(`/spark/${id}`)}
              onSeeAll={() => setActiveFilter('daily-devotional')}
              pillarLabels={pillarLabels}
            />
          )}

          {/* Worship Carousel */}
          {worshipSparks.length > 0 && (
            <HorizontalSection
              title="Worship"
              subtitle="Encounter His presence"
              sparks={worshipSparks}
              onSparkClick={(id) => navigate(`/spark/${id}`)}
              onSeeAll={() => setActiveFilter('worship')}
              pillarLabels={pillarLabels}
            />
          )}

          {/* Testimonies Carousel */}
          {testimonies.length > 0 && (
            <HorizontalSection
              title="Testimonies"
              subtitle="Stories of God moving"
              sparks={testimonies}
              onSparkClick={(id) => navigate(`/spark/${id}`)}
              onSeeAll={() => setActiveFilter('testimony')}
              pillarLabels={pillarLabels}
            />
          )}
        </div>
      )}

      {/* 5. Full Grid (when a filter is active or as browse-all) */}
      {activeFilter !== "All" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <SparkGrid
            sparks={filteredSparks}
            isLoading={isLoading}
            onSparkClick={(id) => navigate(`/spark/${id}`)}
            pillarLabels={pillarLabels}
          />
        </div>
      )}

      {/* Browse All — shown on "All" tab below carousels */}
      {activeFilter === "All" && sparks.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-display font-bold text-white tracking-tight">Browse All</h3>
              <p className="text-xs text-white/30 mt-0.5">{sparks.length} sparks available</p>
            </div>
          </div>
          <SparkGrid
            sparks={sparks}
            isLoading={isLoading}
            onSparkClick={(id) => navigate(`/spark/${id}`)}
            pillarLabels={pillarLabels}
          />
        </div>
      )}

      {/* 6. Podcast Section */}
      <PodcastSection />

      {/* 7. Reading Plans CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#7C9A8E]/20 to-[#4A7C7C]/10 rounded-3xl p-8 border border-white/10"
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
    </div>
  );
}


/** Horizontal scroll section — YouTube Music / Spotify style */
function HorizontalSection({
  title,
  subtitle,
  sparks,
  onSparkClick,
  onSeeAll,
  pillarLabels,
}: {
  title: string;
  subtitle: string;
  sparks: any[];
  onSparkClick: (id: number) => void;
  onSeeAll: () => void;
  pillarLabels: Record<string, string>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-white/30 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onSeeAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            See all <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sparks.slice(0, 8).map((spark, i) => (
          <div
            key={spark.id}
            className="flex-shrink-0 w-[160px] sm:w-[180px] snap-start"
          >
            <HorizontalSparkCard
              spark={spark}
              index={i}
              onClick={() => onSparkClick(spark.id)}
              pillarLabels={pillarLabels}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}


/** Compact spark card for horizontal scroll — YouTube Music style */
function HorizontalSparkCard({
  spark,
  index,
  onClick,
  pillarLabels,
}: {
  spark: any;
  index: number;
  onClick: () => void;
  pillarLabels: Record<string, string>;
}) {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 bg-gray-900">
        <img
          src={getSparkImage(spark, index)}
          alt={spark.title}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
          style={{ filter: 'saturate(1.1)' }}
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 scale-90 group-hover:scale-100 transition-transform">
            <Play className="h-4 w-4 fill-white text-white ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        {spark.duration && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-[10px] font-medium text-white/80 px-1.5 py-0.5 rounded">
            {Math.floor(spark.duration / 60)}:{String(spark.duration % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Info */}
      <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
        {spark.title}
      </h4>
      <p className="text-[11px] text-white/35 mt-1 flex items-center gap-1">
        <Flame className="h-2.5 w-2.5 text-primary/50" />
        {pillarLabels[spark.category] || spark.category}
      </p>
    </motion.div>
  );
}
