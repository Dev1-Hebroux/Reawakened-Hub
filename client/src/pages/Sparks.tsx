import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, MapPin, Share2, MessageCircle, 
  Heart, Play, Globe, X, Send,
  Maximize2, MoreVertical, ArrowRight,
  Mail, Rss, Smartphone, BookOpen, Clock, Calendar, Loader2, Check,
  Headphones, Download, Volume2, Pause, HandHeart, Target, TrendingUp, Compass, Users
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { toast } from "sonner";
import type { Spark, SparkSubscription, ReflectionCard, PrayerSession } from "@shared/schema";
import { DominionOnboarding } from "@/components/DominionOnboarding";
import { WeeklyChallenge } from "@/components/WeeklyChallenge";
import { GamificationBar } from "@/components/GamificationBar";
import { JournalingPrompt } from "@/components/JournalingPrompt";
import { DailyQuiz } from "@/components/DailyQuiz";
import { LiveIntercession } from "@/components/LiveIntercession";
import { COMMUNITY_LINKS } from "@/lib/config";

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
  const [, params] = useRoute("/sparks/:id");
  const [, navigate] = useLocation();
  const sparkIdFromUrl = params?.id ? parseInt(params.id, 10) : null;
  
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedSpark, setSelectedSpark] = useState<Spark | null>(null);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const queryClient = useQueryClient();
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
  const [viewMode, setViewMode] = useState<'reflection' | 'faith'>(() => {
    if (userContentMode) return userContentMode;
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('sparks_view_mode') as 'reflection' | 'faith') || 'reflection';
    }
    return 'reflection';
  });

  useEffect(() => {
    if (userContentMode && userContentMode !== viewMode) {
      setViewMode(userContentMode);
    }
  }, [userContentMode]);

  useEffect(() => {
    if (userAudienceSegment) {
      localStorage.setItem('user_audience_segment', userAudienceSegment);
    }
  }, [userAudienceSegment]);

  const handleViewModeChange = async (mode: 'reflection' | 'faith') => {
    setViewMode(mode);
    localStorage.setItem('sparks_view_mode', mode);
    if (isAuthenticated) {
      try {
        await apiRequest("PATCH", "/api/auth/user/preferences", { 
          contentMode: mode,
          audienceSegment: userAudienceSegment ?? null,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      } catch (error) {
        console.error("Failed to save preference:", error);
      }
    }
  };

  const storedAudience = typeof window !== 'undefined' ? localStorage.getItem('user_audience_segment') : null;
  const effectiveAudience = userAudienceSegment || storedAudience || '';
  const audienceParam = effectiveAudience ? `?audience=${effectiveAudience}` : '';

  const { data: sparks = [], isLoading } = useQuery<Spark[]>({
    queryKey: ["/api/sparks/published", userAudienceSegment],
    queryFn: () => fetch(`/api/sparks/published${audienceParam}`).then(r => r.json()),
  });

  const { data: todaySpark, isLoading: todayLoading } = useQuery<Spark>({
    queryKey: ["/api/sparks/today", userAudienceSegment],
    queryFn: () => fetch(`/api/sparks/today${audienceParam}`).then(r => r.json()),
    retry: false,
  });

  const { data: featuredSparks = [] } = useQuery<Spark[]>({
    queryKey: ["/api/sparks/featured", userAudienceSegment],
    queryFn: () => fetch(`/api/sparks/featured${audienceParam}`).then(r => r.json()),
  });

  // Auto-open spark modal when accessing /sparks/:id directly
  useEffect(() => {
    if (sparkIdFromUrl && sparks.length > 0 && !selectedSpark) {
      const spark = sparks.find(s => s.id === sparkIdFromUrl);
      if (spark) {
        setSelectedSpark(spark);
      } else {
        // Check featured sparks too
        const featured = featuredSparks.find(s => s.id === sparkIdFromUrl);
        if (featured) {
          setSelectedSpark(featured);
        } else if (todaySpark?.id === sparkIdFromUrl) {
          setSelectedSpark(todaySpark);
        }
      }
    }
  }, [sparkIdFromUrl, sparks, featuredSparks, todaySpark, selectedSpark]);

  // Update URL when modal is closed
  const handleCloseSparkModal = () => {
    setSelectedSpark(null);
    if (sparkIdFromUrl) {
      navigate("/sparks", { replace: true });
    }
  };

  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery<SparkSubscription[]>({
    queryKey: ["/api/subscriptions"],
    enabled: !!user,
  });

  const { data: todayReflection } = useQuery<ReflectionCard>({
    queryKey: ["/api/reflection-cards/today", userAudienceSegment],
    queryFn: () => fetch(`/api/reflection-cards/today${audienceParam}`).then(r => r.json()),
    retry: false,
  });

  const { data: activeSessions = [] } = useQuery<PrayerSession[]>({
    queryKey: ["/api/leader-prayer-sessions"],
    queryFn: () => fetch("/api/leader-prayer-sessions?status=active").then(r => r.json()),
    refetchInterval: 30000,
  });

  const hasActiveSessions = activeSessions.length > 0;

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

  const handleSparkReaction = (sparkId: number, reactionType: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to react");
      setTimeout(() => window.location.href = "/api/login", 1000);
      return;
    }
    reactionMutation.mutate({ sparkId, reactionType }, {
      onSuccess: () => {
        toast.success("Amen!");
      }
    });
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
      
      <DominionOnboarding 
        isOpen={needsOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
      
      {/* Gamification Bar */}
      <GamificationBar />
      
      {/* Hero / Live Now Section */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] w-full overflow-hidden">
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
               {featuredSpark?.title || "Dominion Begins with Belonging"}
             </h1>
             
             <p className="text-lg text-white/80 max-w-xl" data-testid="text-hero-description">
               {featuredSpark?.description || "Real authority starts with security, not striving. Whether you're in school, on campus, building your career or business, or doing life as a couple, this is a simple daily reset for pressure and pace. When you know you belong, you stop performing and start living steady. Today, let your identity be your anchor."}
             </p>
             
             <div className="flex items-center gap-4 pt-4 flex-wrap">
               <button 
                 onClick={() => featuredSpark && setSelectedSpark(featuredSpark)}
                 className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-full flex items-center gap-2 transition-all hover:scale-105"
                 data-testid="button-watch-featured"
               >
                 <Play className="h-5 w-5 fill-current" /> Watch Now
               </button>
               <button 
                 onClick={() => setShowSubscribe(true)}
                 className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold px-6 py-4 rounded-full flex items-center gap-2 transition-all border border-white/20"
                 data-testid="button-get-updates-hero"
               >
                 <Rss className="h-5 w-5" /> Get Daily Updates
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
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" /> Today's Devotional
              </h2>
              <p className="text-gray-400 text-sm">Your daily dose of scripture and inspiration.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
                <button
                  onClick={() => handleViewModeChange('reflection')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    viewMode === 'reflection'
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  data-testid="button-mode-reflection"
                >
                  Reflection
                </button>
                <button
                  onClick={() => handleViewModeChange('faith')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    viewMode === 'faith'
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  data-testid="button-mode-faith"
                >
                  Faith Overlay
                </button>
              </div>
            </div>
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
                     <div className="flex items-center gap-3">
                       <button 
                         onClick={() => {
                           if (todaySpark) {
                             handleSparkReaction(todaySpark.id, 'amen');
                           }
                         }}
                         className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors group"
                         data-testid="button-like-verse"
                       >
                         <Heart className="h-4 w-4 group-hover:fill-red-400" />
                         <span className="text-xs">Amen</span>
                       </button>
                       <button
                         onClick={() => {
                           if (navigator.share) {
                             navigator.share({
                               title: todaySpark.title,
                               text: todaySpark.description,
                               url: window.location.href,
                             });
                           } else {
                             navigator.clipboard.writeText(`${todaySpark.description}\n\n— ${todaySpark.title}`);
                             toast.success("Copied to clipboard!");
                           }
                         }}
                         className="text-gray-400 cursor-pointer hover:text-white transition-colors"
                         data-testid="button-share-verse"
                       >
                         <Share2 className="h-4 w-4" />
                       </button>
                     </div>
                   </div>
                   
                   {/* Word of Encouragement / Verse */}
                   <div className="mb-4">
                     <blockquote className="text-xl font-display font-semibold text-white leading-relaxed border-l-4 border-primary pl-4">
                       "{todaySpark.description}"
                     </blockquote>
                   </div>
                   
                   {viewMode === 'faith' && todaySpark.scriptureRef && (
                     <p className="text-right text-primary font-bold">— {todaySpark.scriptureRef}</p>
                   )}
                   {viewMode === 'faith' && todaySpark.prayerLine && (
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

      {/* Today's Reflection & Growth Section */}
      {todayReflection && (
        <div className="bg-gradient-to-br from-gray-900 to-black border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Section Header with Tabs */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                  <button
                    onClick={() => setReflectionTab('reflection')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      reflectionTab === 'reflection'
                        ? 'bg-white text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    data-testid="tab-reflection"
                  >
                    Daily Reflection
                  </button>
                  <button
                    onClick={() => setReflectionTab('growth')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      reflectionTab === 'growth'
                        ? 'bg-white text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    data-testid="tab-growth"
                  >
                    Continue Your Growth
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowIntercession(true)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  hasActiveSessions ? 'animate-pulse shadow-lg shadow-teal-500/30' : ''
                }`}
                style={{ 
                  backgroundColor: hasActiveSessions ? 'rgba(74, 124, 124, 0.4)' : 'rgba(74, 124, 124, 0.2)', 
                  borderColor: hasActiveSessions ? '#4A7C7C' : 'rgba(74, 124, 124, 0.4)', 
                  color: hasActiveSessions ? '#fff' : '#4A7C7C' 
                }}
                data-testid="button-open-intercession"
              >
                {hasActiveSessions && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
                <Users className="h-4 w-4" /> {hasActiveSessions ? `Live (${activeSessions.length})` : 'Join Prayer'}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {reflectionTab === 'reflection' ? (
                <motion.div
                  key="reflection"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="rounded-2xl p-6 border backdrop-blur-xl" 
                  style={{ backgroundColor: 'rgba(124, 154, 142, 0.12)', borderColor: 'rgba(124, 154, 142, 0.25)' }}
                >
                  <div className="max-w-3xl mx-auto space-y-4">
                    {/* Quote */}
                    <div className="text-center">
                      <span className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full mb-3" style={{ backgroundColor: 'rgba(124, 154, 142, 0.25)', color: '#9FBAB0' }}>
                        {todayReflection.weekTheme || "Reflection"}
                      </span>
                      <blockquote className="text-xl md:text-2xl font-display font-bold text-white leading-relaxed" data-testid="text-reflection-quote">
                        "{todayReflection.baseQuote}"
                      </blockquote>
                    </div>

                    {/* Reflect & Action - Compact Grid */}
                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/15">
                      <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(250, 248, 245, 0.06)' }}>
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#7C9A8E' }}>
                          <MessageCircle className="h-3 w-3" /> Reflect
                        </h4>
                        <p className="text-sm text-white/90" data-testid="text-reflection-question">{todayReflection.question}</p>
                      </div>
                      <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(250, 248, 245, 0.06)' }}>
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#D4A574' }}>
                          <ArrowRight className="h-3 w-3" /> Take Action
                        </h4>
                        <p className="text-sm text-white/90" data-testid="text-reflection-action">{todayReflection.action}</p>
                      </div>
                    </div>

                    {viewMode === 'faith' && todayReflection.faithOverlayScripture && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-primary/20 rounded-xl p-4 border border-primary/30 text-center"
                      >
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center justify-center gap-2">
                          <BookOpen className="h-3 w-3" /> Scripture
                        </h4>
                        <p className="text-sm text-white font-medium" data-testid="text-reflection-scripture">{todayReflection.faithOverlayScripture}</p>
                      </motion.div>
                    )}

                    {/* Journaling Prompt - Compact */}
                    <JournalingPrompt 
                      prompt={todayReflection.question || "What is one thing you're grateful for today?"} 
                      reflectionId={todayReflection.id}
                    />

                    {/* Daily Quiz */}
                    <DailyQuiz />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="growth"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="rounded-2xl p-6 border backdrop-blur-xl"
                  style={{ backgroundColor: 'rgba(250, 248, 245, 0.06)', borderColor: 'rgba(250, 248, 245, 0.15)' }}
                >
                  <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(124, 154, 142, 0.2)' }}>
                        <Compass className="h-5 w-5" style={{ color: '#7C9A8E' }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Continue Your Growth</h3>
                        <p className="text-sm text-gray-400">Faith-based development tools</p>
                      </div>
                    </div>

                    {/* Growth Tools List */}
                    <div className="space-y-3">
                      <a 
                        href="/vision" 
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                        data-testid="link-vision-pathway"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(74, 124, 124, 0.15)' }}>
                            <Compass className="h-5 w-5" style={{ color: '#4A7C7C' }} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">Vision Pathway</h4>
                            <p className="text-sm text-gray-400">Discover your purpose</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors" />
                      </a>

                      <a 
                        href="/goals" 
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                        data-testid="link-goals"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 165, 116, 0.15)' }}>
                            <Target className="h-5 w-5" style={{ color: '#D4A574' }} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">2026 Goals</h4>
                            <p className="text-sm text-gray-400">Set & track goals</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors" />
                      </a>

                      <a 
                        href="/growth-tools" 
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                        data-testid="link-growth-tools"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(124, 154, 142, 0.15)' }}>
                            <TrendingUp className="h-5 w-5" style={{ color: '#7C9A8E' }} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">Growth Tools</h4>
                            <p className="text-sm text-gray-400">Personal development</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors" />
                      </a>
                    </div>

                    {/* Scripture Quote */}
                    <p className="text-center text-sm text-gray-500 mt-6 italic">
                      "Add to your faith goodness; and to goodness, knowledge" — 2 Peter 1:5
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Weekly Challenge */}
      <WeeklyChallenge />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {pillars.map((pillar) => (
              <button
                key={pillar}
                onClick={() => setActiveFilter(pillar)}
                data-testid={`button-filter-${pillar}`}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
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
                <a 
                  href={COMMUNITY_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors" 
                  data-testid="button-join-whatsapp"
                >
                  <MessageCircle className="h-5 w-5" /> Join WhatsApp Community
                </a>
                <a 
                  href="mailto:sparks@reawakened.one?subject=Subscribe%20to%20Daily%20Sparks&body=Hi%2C%20I%20would%20like%20to%20subscribe%20to%20receive%20daily%20Spark%20devotionals%20via%20email."
                  className="w-full bg-white hover:bg-gray-100 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors" 
                  data-testid="button-subscribe-email"
                >
                  <Mail className="h-5 w-5" /> Subscribe via Email
                </a>
              </div>

              <p className="text-center text-xs text-gray-500 mt-6">
                {isAuthenticated ? "Manage your subscriptions anytime." : "Log in to save your preferences."}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Intercession Modal */}
      <AnimatePresence>
        {showIntercession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
          >
            <button 
              onClick={() => setShowIntercession(false)}
              className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors z-50"
              data-testid="button-close-intercession"
            >
              <X className="h-8 w-8" />
            </button>

            <div className="w-full max-w-5xl h-[80vh] flex flex-col md:flex-row gap-6 items-stretch">
              {/* Left - Media Panel */}
              <div className="relative w-full md:w-1/2 h-64 md:h-full bg-black rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                <img 
                  src={todaySpark?.thumbnailUrl || todaySpark?.imageUrl || dailyBg} 
                  alt="Prayer community" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Floating Action Buttons */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                  <button className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors">
                    <Heart className="h-5 w-5 text-white" />
                  </button>
                  <span className="text-center text-white text-xs">0</span>
                  <button className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors">
                    <Share2 className="h-5 w-5 text-white" />
                  </button>
                  <span className="text-center text-white text-xs">Share</span>
                </div>

                {/* Play button overlay */}
                <div className="absolute bottom-4 left-4">
                  <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                    <Play className="h-5 w-5 text-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Right - Live Intercession Chat */}
              <div className="w-full md:w-1/2 h-full">
                <LiveIntercession sparkId={todaySpark?.id} />
              </div>
            </div>
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
              onClick={handleCloseSparkModal}
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
                      {viewMode === 'faith' && selectedSpark.scriptureRef && (
                        <span className="text-primary font-bold text-sm uppercase tracking-wider mb-4 block">
                          {selectedSpark.scriptureRef}
                        </span>
                      )}
                      <blockquote className="text-xl md:text-2xl font-serif italic leading-relaxed text-white/90 mb-6">
                        "{selectedSpark.description}"
                      </blockquote>
                      {viewMode === 'faith' && selectedSpark.prayerLine && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <p className="text-sm text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                            <HandHeart className="h-4 w-4" /> Prayer
                          </p>
                          <p className="text-white/80 italic text-sm">{selectedSpark.prayerLine}</p>
                        </div>
                      )}
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
