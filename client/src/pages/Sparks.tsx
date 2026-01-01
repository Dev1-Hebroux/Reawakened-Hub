import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, MapPin, Share2, MessageCircle, 
  Heart, Play, Globe, X, Send,
  Maximize2, MoreVertical, ArrowRight,
  Mail, Rss, Smartphone, BookOpen, Clock, Calendar, Loader2, Check,
  Headphones, Download, Volume2, Pause, HandHeart
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { toast } from "sonner";
import type { Spark, SparkSubscription } from "@shared/schema";
import { GrowthToolsDiscovery } from "@/components/GrowthToolsDiscovery";

import spark1 from "@assets/generated_images/raw_street_worship_in_brazil.png";
import spark2 from "@assets/generated_images/testimony_of_healing_in_a_village.png";
import spark3 from "@assets/generated_images/underground_prayer_meeting.png";
import spark4 from "@assets/generated_images/student_sharing_gospel_on_campus.png";
import dailyBg from "@assets/generated_images/cinematic_sunrise_devotional_background.png";

const defaultThumbnails = [spark1, spark2, spark3, spark4];

function getDefaultThumbnail(index: number) {
  return defaultThumbnails[index % defaultThumbnails.length];
}

const pillars = ["All", "daily-devotional", "worship", "testimony"];
const pillarLabels: Record<string, string> = {
  "All": "All",
  "daily-devotional": "Devotional",
  "worship": "Worship",
  "testimony": "Testimony"
};

const subscriptionCategories = ["daily-devotional", "worship", "testimony"];

function getMediaTypeIcon(mediaType: string | null) {
  switch (mediaType) {
    case 'video': return Play;
    case 'audio': return Headphones;
    case 'quick-read': return BookOpen;
    case 'download': return Download;
    default: return Play;
  }
}

function getMediaTypeLabel(mediaType: string | null) {
  switch (mediaType) {
    case 'video': return 'Watch';
    case 'audio': return 'Listen';
    case 'quick-read': return 'Read';
    case 'download': return 'Download';
    default: return 'View';
  }
}

interface ReactionCounts {
  flame: number;
  amen: number;
  praying: number;
}

export function SparksPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedSpark, setSelectedSpark] = useState<Spark | null>(null);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'reflection' | 'faith'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('sparks_view_mode') as 'reflection' | 'faith') || 'reflection';
    }
    return 'reflection';
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const handleViewModeChange = (mode: 'reflection' | 'faith') => {
    setViewMode(mode);
    localStorage.setItem('sparks_view_mode', mode);
  };

  const { data: sparks = [], isLoading } = useQuery<Spark[]>({
    queryKey: ["/api/sparks/published"],
  });

  const { data: todaySpark, isLoading: todayLoading } = useQuery<Spark>({
    queryKey: ["/api/sparks/today"],
    retry: false,
  });

  const { data: featuredSparks = [] } = useQuery<Spark[]>({
    queryKey: ["/api/sparks/featured"],
  });

  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery<SparkSubscription[]>({
    queryKey: ["/api/subscriptions"],
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (category: string) => {
      const res = await apiRequest("POST", "/api/subscriptions", { category });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast.success("Subscribed successfully!");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in to subscribe");
        setTimeout(() => window.location.href = "/api/login", 1000);
      } else {
        toast.error("Failed to subscribe");
      }
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async (category: string) => {
      await apiRequest("DELETE", `/api/subscriptions/${category}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast.success("Unsubscribed successfully!");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in");
        setTimeout(() => window.location.href = "/api/login", 1000);
      } else {
        toast.error("Failed to unsubscribe");
      }
    },
  });

  const { data: reactionCounts = { flame: 0, amen: 0, praying: 0 } } = useQuery<ReactionCounts>({
    queryKey: ["/api/sparks", selectedSpark?.id, "reactions"],
    queryFn: async () => {
      if (!selectedSpark) return { flame: 0, amen: 0, praying: 0 };
      const res = await fetch(`/api/sparks/${selectedSpark.id}/reactions`);
      return res.json();
    },
    enabled: !!selectedSpark,
  });

  const reactionMutation = useMutation({
    mutationFn: async ({ sparkId, reactionType }: { sparkId: number; reactionType: string }) => {
      const res = await apiRequest("POST", `/api/sparks/${sparkId}/reactions`, { reactionType });
      return res.json();
    },
    onSuccess: () => {
      if (selectedSpark) {
        queryClient.invalidateQueries({ queryKey: ["/api/sparks", selectedSpark.id, "reactions"] });
      }
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in to react");
        setTimeout(() => window.location.href = "/api/login", 1000);
      } else {
        toast.error("Failed to add reaction");
      }
    },
  });

  const handleReaction = (reactionType: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to react");
      setTimeout(() => window.location.href = "/api/login", 1000);
      return;
    }
    if (selectedSpark) {
      reactionMutation.mutate({ sparkId: selectedSpark.id, reactionType });
    }
  };

  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      const progress = (audio.currentTime / audio.duration) * 100;
      setAudioProgress(progress || 0);
    };
    
    const handleEnded = () => {
      setIsAudioPlaying(false);
      setAudioProgress(0);
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [selectedSpark]);

  useEffect(() => {
    if (!selectedSpark) {
      setIsAudioPlaying(false);
      setAudioProgress(0);
    }
  }, [selectedSpark]);

  const isSubscribed = (category: string) => {
    return subscriptions.some(sub => sub.category === category);
  };

  const handleSubscriptionToggle = (category: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to subscribe");
      setTimeout(() => window.location.href = "/api/login", 1000);
      return;
    }
    
    if (isSubscribed(category)) {
      unsubscribeMutation.mutate(category);
    } else {
      subscribeMutation.mutate(category);
    }
  };

  const filteredSparks = activeFilter === "All" 
    ? sparks 
    : sparks.filter(s => s.category === activeFilter);

  const featuredSpark = featuredSparks.length > 0 ? featuredSparks[0] : (sparks.length > 0 ? sparks[0] : null);
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      
      {/* Hero / Live Now Section */}
      <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={featuredSpark?.thumbnailUrl || spark1} 
            alt="Live Spark" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex items-end p-6 md:p-12 max-w-7xl mx-auto w-full">
          <div className="w-full md:w-1/2 space-y-4">
             <div className="flex items-center gap-2">
               <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                 <div className="h-2 w-2 bg-white rounded-full" /> FEATURED
               </span>
               <span className="bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
                 {featuredSpark?.category || "Daily Spark"}
               </span>
             </div>
             
             <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight" data-testid="text-hero-title">
               {featuredSpark?.title || "Street Worship Erupts in Downtown"}
             </h1>
             
             <p className="text-lg text-white/80 max-w-xl" data-testid="text-hero-description">
               {featuredSpark?.description || "Join thousands gathering to declare Jesus over the city. Miracles are happening!"}
             </p>
             
             <div className="flex items-center gap-4 pt-4">
               <button 
                 onClick={() => featuredSpark && setSelectedSpark(featuredSpark)}
                 className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-full flex items-center gap-2 transition-all hover:scale-105"
                 data-testid="button-watch-featured"
               >
                 <Play className="h-5 w-5 fill-current" /> Watch Now
               </button>
               <div className="flex items-center gap-2 text-sm font-medium">
                 <div className="h-2 w-2 bg-green-500 rounded-full" />
                 {sparks.length} Sparks
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Daily Devotional Section */}
      <div className="bg-gray-900 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" /> Today's Devotional
              </h2>
              <p className="text-gray-400 text-sm">Your daily dose of scripture and inspiration.</p>
            </div>
            <button 
              onClick={() => setShowSubscribe(true)}
              className="hidden md:flex items-center gap-2 text-sm font-bold text-primary hover:text-white transition-colors"
              data-testid="button-get-updates"
            >
              Get Daily Updates <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {todayLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : todaySpark ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Today's Spark */}
              <div 
                onClick={() => setSelectedSpark(todaySpark)}
                className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer border border-white/10"
                data-testid="card-today-spark"
              >
                <img src={todaySpark.thumbnailUrl || dailyBg} alt={todaySpark.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 fill-white text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-2 inline-block">
                    {todaySpark.weekTheme || "Today's Word"}
                  </span>
                  <h3 className="text-xl font-bold text-white">{todaySpark.title}</h3>
                  <p className="text-sm text-white/80">
                    {todaySpark.duration ? `${Math.floor(todaySpark.duration / 60)} min ${todaySpark.mediaType === 'video' ? 'watch' : 'listen'}` : 'Daily spark'}
                  </p>
                </div>
              </div>

              {/* Today's Scripture & Prayer */}
              <div className="flex flex-col justify-between space-y-6">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex-1">
                   <div className="flex items-center justify-between mb-4">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                       <Calendar className="h-4 w-4" /> {formatDate(todaySpark.dailyDate)}
                     </span>
                     <Share2 className="h-4 w-4 text-gray-400 cursor-pointer hover:text-white" />
                   </div>
                   <p className="text-lg text-white/90 mb-4 leading-relaxed">
                     {todaySpark.description}
                   </p>
                   {todaySpark.scriptureRef && (
                     <p className="text-right text-primary font-bold">— {todaySpark.scriptureRef}</p>
                   )}
                   {todaySpark.prayerLine && (
                     <div className="mt-4 pt-4 border-t border-white/10">
                       <p className="text-sm text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                         <HandHeart className="h-4 w-4" /> Prayer
                       </p>
                       <p className="text-white/80 italic">{todaySpark.prayerLine}</p>
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => setShowSubscribe(true)}
                     className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl flex items-center gap-3 transition-colors border border-white/5 group"
                     data-testid="button-whatsapp"
                   >
                     <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                       <MessageCircle className="h-5 w-5" />
                     </div>
                     <div className="text-left">
                       <div className="text-xs text-gray-400">Join on</div>
                       <div className="font-bold">WhatsApp</div>
                     </div>
                   </button>

                   <button 
                     onClick={() => setShowSubscribe(true)}
                     className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl flex items-center gap-3 transition-colors border border-white/5 group"
                     data-testid="button-email"
                   >
                     <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                       <Mail className="h-5 w-5" />
                     </div>
                     <div className="text-left">
                       <div className="text-xs text-gray-400">Get via</div>
                       <div className="font-bold">Email</div>
                     </div>
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Devotional Today</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Check back tomorrow for your daily dose of inspiration, or explore our library of past devotionals below.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Filters */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 scrollbar-hide gap-4">
          <div className="flex gap-2">
            {pillars.map((pillar) => (
              <button
                key={pillar}
                onClick={() => setActiveFilter(pillar)}
                data-testid={`button-filter-${pillar}`}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  activeFilter === pillar 
                    ? "bg-white text-black border-white" 
                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {pillarLabels[pillar]}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
            <Globe className="h-4 w-4" /> Global Feed
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredSparks.length === 0 ? (
          <div className="text-center py-20">
            <Flame className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No sparks yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredSparks.map((spark, i) => (
              <motion.div
                key={spark.id}
                layoutId={`spark-${spark.id}`}
                onClick={() => setSelectedSpark(spark)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative aspect-[9/16] rounded-[24px] overflow-hidden bg-gray-900 cursor-pointer border border-white/5 hover:border-white/20 transition-colors"
                data-testid={`card-spark-${spark.id}`}
              >
                <img 
                  src={spark.imageUrl || spark.thumbnailUrl || getDefaultThumbnail(i)} 
                  alt={spark.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                
                {/* Top Meta */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                   <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10 flex items-center gap-1">
                     <Flame className="h-3 w-3 text-primary" /> {pillarLabels[spark.category] || spark.category}
                   </span>
                </div>

                {/* Bottom Meta */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">
                    {spark.title}
                  </h3>
                  <p className="text-xs text-white/70 line-clamp-2 mb-3 leading-snug">
                    {spark.description}
                  </p>
                  <div className="flex items-center justify-between text-xs font-bold text-white/50 border-t border-white/10 pt-3">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {spark.duration ? `${Math.floor(spark.duration / 60)}min` : spark.mediaType === 'quick-read' ? '2min' : '5min'}</span>
                    {(() => {
                      const MediaIcon = getMediaTypeIcon(spark.mediaType);
                      return (
                        <span className="flex items-center gap-1 text-primary">
                          <MediaIcon className="h-3 w-3" /> {getMediaTypeLabel(spark.mediaType)}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Hover Action Button - based on media type */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    {(() => {
                      const MediaIcon = getMediaTypeIcon(spark.mediaType);
                      return <MediaIcon className="h-6 w-6 fill-white text-white" />;
                    })()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Growth Tools Discovery */}
        <div className="mt-12 max-w-md mx-auto lg:max-w-none lg:grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <GrowthToolsDiscovery variant="full" title="Continue Your Growth" />
          </div>
        </div>

        {/* Real-time Ticker */}
        <div className="fixed bottom-8 right-8 z-40 hidden lg:block">
          <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-72 shadow-2xl">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" /> Global Prayer Pulse
            </h4>
            <div className="space-y-3">
              {[
                { user: "Maria (Brazil)", action: "ignited a spark", time: "just now" },
                { user: "John (UK)", action: "is praying for London", time: "2s ago" },
                { user: "Team Kenya", action: "started a live stream", time: "5s ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className="h-6 w-6 rounded-full bg-white/10 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white">{item.user}</span> <span className="text-gray-400">{item.action}</span>
                    <div className="text-[10px] text-gray-600">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Subscribe Modal */}
      <AnimatePresence>
        {showSubscribe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full relative overflow-hidden"
            >
              <button 
                onClick={() => setShowSubscribe(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                data-testid="button-close-subscribe"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="text-center mb-8">
                <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Ignite Your Daily Walk</h3>
                <p className="text-gray-400">Subscribe to spark categories to get notified when new content is posted.</p>
              </div>

              {/* Subscription Categories */}
              <div className="space-y-3 mb-6">
                {!user ? (
                  <div className="text-center py-6">
                    <p className="text-gray-400 mb-4">Log in to manage your subscriptions</p>
                    <button
                      onClick={() => window.location.href = "/api/login"}
                      className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl"
                      data-testid="button-login-to-subscribe"
                    >
                      Log In
                    </button>
                  </div>
                ) : subscriptionsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  subscriptionCategories.map((category) => {
                    const subscribed = isSubscribed(category);
                    const isPendingThis = (subscribeMutation.isPending && subscribeMutation.variables === category) || 
                                          (unsubscribeMutation.isPending && unsubscribeMutation.variables === category);
                    
                    return (
                      <button
                        key={category}
                        onClick={() => handleSubscriptionToggle(category)}
                        disabled={isPendingThis}
                        data-testid={`button-subscribe-${category}`}
                        className={`w-full py-4 px-6 rounded-xl flex items-center justify-between transition-colors ${
                          subscribed 
                            ? 'bg-primary/20 border border-primary text-white' 
                            : 'bg-gray-800 hover:bg-gray-700 border border-white/5 text-gray-300'
                        }`}
                      >
                        <span className="font-bold">{pillarLabels[category]}</span>
                        {isPendingThis ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : subscribed ? (
                          <div className="flex items-center gap-2 text-primary">
                            <Check className="h-5 w-5" />
                            <span className="text-sm">Subscribed</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Click to subscribe</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-3">
                <p className="text-center text-sm text-gray-400 mb-4">Or get updates via:</p>
                <button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors" data-testid="button-join-whatsapp">
                  <MessageCircle className="h-5 w-5" /> Join WhatsApp Community
                </button>
                <button className="w-full bg-white hover:bg-gray-100 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors" data-testid="button-subscribe-email">
                  <Mail className="h-5 w-5" /> Subscribe via Email
                </button>
              </div>

              <p className="text-center text-xs text-gray-500 mt-6">
                {isAuthenticated ? "Manage your subscriptions anytime." : "Log in to save your preferences."}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Immersive Overlay Modal */}
      <AnimatePresence>
        {selectedSpark && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
          >
            <button 
              onClick={() => setSelectedSpark(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors z-50"
              data-testid="button-close-spark-modal"
            >
              <X className="h-8 w-8" />
            </button>

            <div className="w-full max-w-6xl h-full flex flex-col md:flex-row gap-8 items-center justify-center">
              
              {/* Media Player - adapts based on media type */}
              <div className="relative w-full max-w-md aspect-[9/16] bg-black rounded-[30px] overflow-hidden shadow-2xl border border-white/10 flex-shrink-0">
                {/* Background image for all types */}
                <img 
                  src={selectedSpark.imageUrl || selectedSpark.thumbnailUrl || spark1} 
                  alt={selectedSpark.title} 
                  className="w-full h-full object-cover" 
                />
                
                {/* Video overlay */}
                {selectedSpark.mediaType === 'video' && selectedSpark.videoUrl && (
                  <video 
                    src={selectedSpark.videoUrl} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    controls 
                    autoPlay
                  />
                )}

                {/* Audio overlay */}
                {selectedSpark.mediaType === 'audio' && selectedSpark.audioUrl && (
                  <>
                    <audio ref={audioRef} src={selectedSpark.audioUrl} />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-8">
                      <div 
                        onClick={toggleAudioPlayback}
                        className="h-24 w-24 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-lg mb-8"
                        data-testid="button-audio-play"
                      >
                        {isAudioPlaying ? (
                          <Pause className="h-12 w-12 text-white" />
                        ) : (
                          <Play className="h-12 w-12 text-white ml-2" />
                        )}
                      </div>
                      <div className="w-full max-w-xs">
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300" 
                            style={{ width: `${audioProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-white/60 mt-2">
                          <span>{Math.floor(audioProgress * (selectedSpark.duration || 300) / 6000)}:{String(Math.floor((audioProgress * (selectedSpark.duration || 300) / 100) % 60)).padStart(2, '0')}</span>
                          <span>{selectedSpark.duration ? `${Math.floor(selectedSpark.duration / 60)}:${String(selectedSpark.duration % 60).padStart(2, '0')}` : '5:00'}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Quick-read overlay */}
                {selectedSpark.mediaType === 'quick-read' && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-8 overflow-y-auto">
                    <div className="max-w-sm text-center">
                      <BookOpen className="h-12 w-12 text-primary mx-auto mb-6" />
                      {selectedSpark.scriptureRef && (
                        <span className="text-primary font-bold text-sm uppercase tracking-wider mb-4 block">
                          {selectedSpark.scriptureRef}
                        </span>
                      )}
                      <blockquote className="text-xl md:text-2xl font-serif italic leading-relaxed text-white/90 mb-6">
                        "{selectedSpark.description}"
                      </blockquote>
                    </div>
                  </div>
                )}

                {/* Download overlay */}
                {selectedSpark.mediaType === 'download' && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-8">
                    <div className="text-center">
                      <div className="h-20 w-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Download className="h-10 w-10 text-primary" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">{selectedSpark.title}</h4>
                      <p className="text-white/70 text-sm mb-6 max-w-xs">{selectedSpark.description}</p>
                      {selectedSpark.downloadUrl && (
                        <a
                          href={selectedSpark.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-full inline-flex items-center gap-2 transition-all hover:scale-105"
                          data-testid="button-download-resource"
                        >
                          <Download className="h-5 w-5" /> Download Now
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
                
                {/* Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4 pointer-events-none">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-primary/30 flex items-center justify-center">
                       {(() => {
                         const MediaIcon = getMediaTypeIcon(selectedSpark.mediaType);
                         return <MediaIcon className="h-5 w-5 text-primary" />;
                       })()}
                     </div>
                     <div>
                       <h4 className="font-bold text-white">{selectedSpark.title}</h4>
                       <p className="text-xs text-white/70">{pillarLabels[selectedSpark.category] || selectedSpark.category}</p>
                     </div>
                  </div>
                  {selectedSpark.mediaType !== 'quick-read' && (
                    <p className="text-sm text-white/90">{selectedSpark.description}</p>
                  )}
                </div>

                {/* Side Actions - Reactions */}
                <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center pointer-events-auto">
                  <div className="text-center space-y-1">
                    <button 
                      onClick={() => handleReaction('flame')}
                      disabled={reactionMutation.isPending}
                      className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-primary/30 cursor-pointer transition-colors"
                      data-testid="button-react-flame"
                    >
                      <Flame className="h-6 w-6 text-primary" />
                    </button>
                    <span className="text-xs font-bold">{reactionCounts.flame || 0}</span>
                  </div>
                  <div className="text-center space-y-1">
                    <button 
                      onClick={() => handleReaction('amen')}
                      disabled={reactionMutation.isPending}
                      className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-primary/30 cursor-pointer transition-colors"
                      data-testid="button-react-amen"
                    >
                      <HandHeart className="h-6 w-6 text-white" />
                    </button>
                    <span className="text-xs font-bold">{reactionCounts.amen || 0}</span>
                  </div>
                  <div className="text-center space-y-1">
                     <button 
                       onClick={() => {
                         navigator.share?.({
                           title: selectedSpark.title,
                           text: selectedSpark.description,
                           url: window.location.href
                         }).catch(() => {
                           navigator.clipboard.writeText(window.location.href);
                           toast.success("Link copied to clipboard!");
                         });
                       }}
                       className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors"
                       data-testid="button-share-spark"
                     >
                       <Share2 className="h-6 w-6 text-white" />
                     </button>
                     <span className="text-xs font-bold">Share</span>
                  </div>
                </div>
              </div>

              {/* Context / Chat (Desktop Only) */}
              <div className="hidden md:flex flex-col h-[80vh] w-full max-w-md bg-gray-900 rounded-[30px] border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-gray-900">
                  <h3 className="font-bold text-white">Live Intercession</h3>
                  <p className="text-xs text-gray-400">Join the prayer community</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {[1,2,3,4,5,6].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-white/10 flex-shrink-0" />
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-gray-300">User {i + 1}</span>
                          <span className="text-[10px] text-gray-600">2m</span>
                        </div>
                        <p className="text-sm text-gray-400">Amen! Agreeing with this prayer.</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-white/10 bg-gray-900">
                   <div className="relative">
                     <input 
                       type="text" 
                       placeholder="Add a prayer..." 
                       className="w-full bg-black rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                       data-testid="input-prayer"
                     />
                     <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary rounded-full text-white" data-testid="button-send-prayer">
                       <Send className="h-4 w-4" />
                     </button>
                   </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
