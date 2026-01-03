import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Bookmark, BookmarkCheck, Share2, Volume2, VolumeX, 
  Pause, Play, Check, Flame, Heart, Mic, MicOff, Send, ChevronDown,
  ChevronUp, Target, MessageCircle, Clock, Calendar
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import type { Spark } from "@shared/schema";

import music1 from "@assets/DappyTKeys_-_Background_Music_-_01_Background_Music_-_1_1767469486425.mp3";
import music2 from "@assets/DappyTKeys_-_Background_Music_-_02_Background_Music_-_2_1767469511632.mp3";
import music3 from "@assets/DappyTKeys_-_Background_Music_-_03_Background_Music_-_3_1767469511633.mp3";
import music4 from "@assets/DappyTKeys_-_Background_Music_-_04_Background_Music_-_4_1767469511634.mp3";
import music5 from "@assets/DappyTKeys_-_Background_Music_-_05_Background_Music_-_5_1767469511635.mp3";

import identityImage from "@assets/generated_images/worship_gathering_devotional_image.png";
import prayerImage from "@assets/generated_images/prayer_and_presence_devotional.png";
import peaceImage from "@assets/generated_images/peace_and_calm_devotional.png";
import boldImage from "@assets/generated_images/bold_witness_devotional_image.png";
import commissionImage from "@assets/generated_images/commission_missions_devotional.png";

const weekThemeImages: Record<string, string> = {
  "Week 1: Identity & Belonging": identityImage,
  "Week 2: Prayer & Presence": prayerImage,
  "Week 3: Peace & Anxiety": peaceImage,
  "Week 4: Bold Witness": boldImage,
  "Week 5: Commission": commissionImage,
  "identity": identityImage,
  "prayer": prayerImage,
  "peace": peaceImage,
  "witness": boldImage,
  "commission": commissionImage,
};

const backgroundTracks = [
  { id: "track1", name: "Peaceful Dawn", url: music1 },
  { id: "track2", name: "Gentle Waters", url: music2 },
  { id: "track3", name: "Morning Light", url: music3 },
  { id: "track4", name: "Still Moments", url: music4 },
  { id: "track5", name: "Grace Notes", url: music5 },
];

export function SparkDetail() {
  const [, params] = useRoute("/spark/:id");
  const [, navigate] = useLocation();
  const sparkId = params?.id ? parseInt(params.id, 10) : null;
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const [activeSection, setActiveSection] = useState<'teaching' | 'context' | 'application'>('teaching');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(backgroundTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrackPicker, setShowTrackPicker] = useState(false);
  const [streak, setStreak] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsUrlRef = useRef<string | null>(null);
  const ttsBlobUrlRef = useRef<boolean>(false);
  const ttsSparkIdRef = useRef<number | null>(null);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);

  const { data: spark, isLoading } = useQuery<Spark>({
    queryKey: ["/api/sparks", sparkId],
    queryFn: () => fetch(`/api/sparks/${sparkId}`).then(r => r.json()),
    enabled: !!sparkId,
  });

  const { data: bookmarkStatus } = useQuery({
    queryKey: ["/api/sparks", sparkId, "bookmark"],
    queryFn: async () => {
      if (!isAuthenticated || !sparkId) return { bookmarked: false };
      const res = await fetch(`/api/sparks/${sparkId}/bookmark`, { credentials: "include" });
      return res.ok ? res.json() : { bookmarked: false };
    },
    enabled: isAuthenticated && !!sparkId,
  });

  const { data: actionStatus } = useQuery({
    queryKey: ["/api/sparks", sparkId, "action"],
    queryFn: async () => {
      if (!isAuthenticated || !sparkId) return { completed: false };
      const res = await fetch(`/api/sparks/${sparkId}/action-status`, { credentials: "include" });
      return res.ok ? res.json() : { completed: false };
    },
    enabled: isAuthenticated && !!sparkId,
  });

  const { data: streakData } = useQuery({
    queryKey: ["/api/user/streak"],
    queryFn: async () => {
      if (!isAuthenticated) return { streak: 0 };
      const res = await fetch(`/api/user/action-streak`, { credentials: "include" });
      return res.ok ? res.json() : { streak: 0 };
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (bookmarkStatus?.bookmarked) setIsBookmarked(true);
    if (actionStatus?.completed) setActionCompleted(true);
    if (streakData?.streak) setStreak(streakData.streak);
  }, [bookmarkStatus, actionStatus, streakData]);

  useEffect(() => {
    return () => {
      if (ttsUrlRef.current && ttsBlobUrlRef.current) {
        URL.revokeObjectURL(ttsUrlRef.current);
      }
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
      }
    };
  }, []);

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await apiRequest("DELETE", `/api/sparks/${sparkId}/bookmark`);
      } else {
        await apiRequest("POST", `/api/sparks/${sparkId}/bookmark`);
      }
    },
    onSuccess: () => {
      setIsBookmarked(!isBookmarked);
      queryClient.invalidateQueries({ queryKey: ["/api/sparks", sparkId, "bookmark"] });
      toast.success(isBookmarked ? "Removed from saved" : "Saved to collection");
    },
    onError: () => toast.error("Please sign in to save"),
  });

  const actionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/sparks/${sparkId}/complete-action`);
    },
    onSuccess: () => {
      setActionCompleted(true);
      setStreak(prev => prev + 1);
      queryClient.invalidateQueries({ queryKey: ["/api/sparks", sparkId, "action"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/streak"] });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7C9A8E', '#D4A574', '#4A7C7C'],
      });
      toast.success("Action completed! Keep your streak going!");
    },
    onError: () => toast.error("Please sign in to track progress"),
  });

  const journalMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/sparks/${sparkId}/journal`, { textContent: content });
    },
    onSuccess: () => {
      setShowJournal(false);
      setJournalText("");
      toast.success("Reflection saved");
    },
    onError: () => toast.error("Please sign in to save reflections"),
  });

  const safePlay = async (audio: HTMLAudioElement) => {
    try {
      await audio.play();
      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Audio play error:", err);
      }
      return false;
    }
  };

  const pauseAll = () => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsSpeaking(false);
    setIsPlaying(false);
  };

  const resumeAll = async () => {
    if (ttsAudioRef.current) {
      await safePlay(ttsAudioRef.current);
      setIsSpeaking(true);
    }
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      await safePlay(audioRef.current);
      setIsPlaying(true);
    }
  };

  const togglePlayback = async () => {
    if (!audioRef.current) return;
    if (isPlaying || isSpeaking) {
      pauseAll();
    } else if (ttsAudioRef.current && ttsUrlRef.current) {
      await resumeAll();
    } else {
      await safePlay(audioRef.current);
      setIsPlaying(true);
    }
  };

  const startTextToSpeech = async () => {
    if (!spark?.fullTeaching) return;
    if (isLoadingTTS) return;
    
    if (isSpeaking) {
      pauseAll();
      return;
    }
    
    if (ttsSparkIdRef.current !== sparkId) {
      if (ttsUrlRef.current && ttsBlobUrlRef.current) {
        URL.revokeObjectURL(ttsUrlRef.current);
      }
      ttsUrlRef.current = null;
      ttsBlobUrlRef.current = false;
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
      ttsSparkIdRef.current = sparkId;
    }
    
    if (ttsAudioRef.current && ttsUrlRef.current) {
      await resumeAll();
      return;
    }

    setIsLoadingTTS(true);
    
    try {
      let audioUrl: string;
      
      // Use pre-generated narration if available, otherwise generate on-the-fly
      let isBlobUrl = false;
      if (spark.narrationAudioUrl) {
        audioUrl = spark.narrationAudioUrl;
      } else {
        // Build narration text: scripture passage first, then teaching
        let narrationText = '';
        if (spark.scriptureRef) {
          narrationText += spark.scriptureRef + '. ';
        }
        if (spark.fullPassage) {
          narrationText += spark.fullPassage + ' ';
        }
        if (spark.fullTeaching) {
          narrationText += spark.fullTeaching;
        }
        
        const response = await fetch('/api/tts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: narrationText,
            voice: 'nova'
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate audio');
        }
        
        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        isBlobUrl = true;
      }
      
      if (ttsUrlRef.current && ttsBlobUrlRef.current) {
        URL.revokeObjectURL(ttsUrlRef.current);
      }
      ttsUrlRef.current = audioUrl;
      ttsBlobUrlRef.current = isBlobUrl;
      
      const ttsAudio = new Audio(audioUrl);
      ttsAudioRef.current = ttsAudio;
      ttsSparkIdRef.current = sparkId;
      
      ttsAudio.onended = () => {
        setIsSpeaking(false);
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      };
      
      ttsAudio.onerror = () => {
        setIsSpeaking(false);
        setIsLoadingTTS(false);
        toast.error("Audio playback failed");
      };
      
      await resumeAll();
    } catch (error) {
      console.error("TTS error:", error);
      toast.error("Could not generate audio");
    } finally {
      setIsLoadingTTS(false);
    }
  };

  const handleShare = async () => {
    const shareText = spark?.shareableVersion || spark?.description || "";
    const shareData = {
      title: spark?.title || "DOMINION Daily Devotional",
      text: shareText,
      url: window.location.href,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`);
        toast.success("Copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  if (isLoading || !spark) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <audio ref={audioRef} src={selectedTrack.url} loop />
      
      <div className="relative pt-16">
        <div className="absolute inset-0 h-[50vh]">
          <img 
            src={spark.thumbnailUrl || (spark.weekTheme && weekThemeImages[spark.weekTheme]) || identityImage} 
            alt={spark.title}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black" />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate("/sparks")}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              data-testid="button-back"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => bookmarkMutation.mutate()}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                  isBookmarked 
                    ? 'bg-primary/20 text-primary border border-primary/40' 
                    : 'bg-white/10 text-white/70 hover:text-white border border-white/10'
                }`}
                data-testid="button-bookmark"
              >
                {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
              </motion.button>
              
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/10 text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-all"
                data-testid="button-share"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                {spark.weekTheme || "DOMINION Campaign"}
              </span>
              {spark.dailyDate && (
                <span className="text-white/60 text-sm flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(spark.dailyDate)}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight">
              {spark.title}
            </h1>
            
            {spark.scriptureRef && (
              <p className="text-lg text-amber-400 font-semibold drop-shadow-sm">
                {spark.scriptureRef}
              </p>
            )}
            
            {spark.fullPassage && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/60 to-transparent rounded-full" />
                <blockquote className="pl-6 text-xl md:text-2xl font-display leading-relaxed text-white italic">
                  "{spark.fullPassage}"
                </blockquote>
              </motion.div>
            )}
            
            {/* Unified Audio Player */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-2xl p-5 border border-primary/30 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={startTextToSpeech}
                    disabled={isLoadingTTS}
                    className={`h-14 w-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      isLoadingTTS 
                        ? 'bg-gray-600 text-white cursor-wait'
                        : isSpeaking 
                          ? 'bg-primary text-white shadow-primary/40' 
                          : 'bg-white text-black hover:scale-105'
                    }`}
                    data-testid="button-play-devotional"
                  >
                    {isLoadingTTS ? (
                      <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isSpeaking ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-0.5" />
                    )}
                  </motion.button>
                  
                  <div>
                    <p className="text-white font-semibold">
                      {isLoadingTTS ? "Generating Audio..." : isSpeaking ? "Playing Devotional" : "Listen to Devotional"}
                    </p>
                    {isSpeaking && (
                      <p className="text-white/60 text-sm">
                        with {selectedTrack.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowTrackPicker(!showTrackPicker)}
                      className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all border border-white/10"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span className="hidden sm:inline">{selectedTrack.name}</span>
                      {showTrackPicker ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    
                    <AnimatePresence>
                      {showTrackPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute top-full right-0 mt-2 w-52 bg-gray-900/98 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden shadow-2xl z-20"
                        >
                          <div className="px-4 py-3 border-b border-white/10">
                            <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Ambient Music</p>
                          </div>
                          {backgroundTracks.map((track) => (
                            <button
                              key={track.id}
                              onClick={() => {
                                setSelectedTrack(track);
                                setShowTrackPicker(false);
                                if (audioRef.current) {
                                  audioRef.current.src = track.url;
                                  if (isPlaying || isSpeaking) {
                                    audioRef.current.play();
                                  }
                                }
                              }}
                              className={`w-full px-4 py-3 text-left text-sm transition-all flex items-center gap-3 ${
                                selectedTrack.id === track.id 
                                  ? 'bg-primary/20 text-primary' 
                                  : 'text-white hover:bg-white/10'
                              }`}
                            >
                              <div className={`h-2 w-2 rounded-full ${selectedTrack.id === track.id ? 'bg-primary' : 'bg-white/30'}`} />
                              {track.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              
              {isSpeaking && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 flex items-center gap-3"
                >
                  <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 60, ease: "linear" }}
                    />
                  </div>
                  <span className="text-xs text-white/60">Reading...</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
          
          <div className="flex items-center gap-2 border-b border-white/10 mt-8">
            {['teaching', 'context', 'application'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section as any)}
                className={`px-4 py-3 text-sm font-semibold transition-all capitalize ${
                  activeSection === section 
                    ? 'text-white border-b-2 border-primary bg-primary/10' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
                data-testid={`tab-${section}`}
              >
                {section}
              </button>
            ))}
          </div>
          
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="py-8"
          >
            {activeSection === 'teaching' && spark.fullTeaching && (
              <div className="prose prose-invert prose-lg max-w-none">
                {spark.fullTeaching.split('\n\n').map((paragraph, i) => (
                  <motion.p 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-white leading-relaxed mb-6 text-lg"
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>
            )}
            
            {activeSection === 'context' && spark.contextBackground && (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold text-amber-400 mb-4">Historical Context</h3>
                <p className="text-white leading-relaxed text-lg">{spark.contextBackground}</p>
              </div>
            )}
            
            {activeSection === 'application' && spark.applicationPoints && (
              <div className="space-y-4">
                {(spark.applicationPoints as string[]).map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-start gap-4 bg-white/5 rounded-xl p-5 border border-white/10"
                  >
                    <div className="h-8 w-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-white leading-relaxed pt-1">{point}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
          
          {spark.todayAction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 border border-primary/30 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-400" />
                  <h3 className="font-bold text-white">Today's Action</h3>
                </div>
                {streak > 0 && (
                  <div className="flex items-center gap-1.5 bg-primary/20 px-3 py-1 rounded-full">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-bold text-orange-400">{streak} day streak</span>
                  </div>
                )}
              </div>
              
              <p className="text-white leading-relaxed mb-6 text-lg">{spark.todayAction}</p>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => !actionCompleted && actionMutation.mutate()}
                disabled={actionCompleted}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  actionCompleted 
                    ? 'bg-green-600/20 text-green-400 border border-green-600/40 cursor-default' 
                    : 'bg-primary hover:bg-primary/90 text-white'
                }`}
                data-testid="button-complete-action"
              >
                {actionCompleted ? (
                  <>
                    <Check className="h-5 w-5" />
                    Completed!
                  </>
                ) : (
                  <>
                    <Target className="h-5 w-5" />
                    Mark as Complete
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
          
          {spark.reflectionQuestion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8"
            >
              <div className="flex items-center gap-2 mb-4 text-white">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Reflection Question</h3>
              </div>
              
              <p className="text-white text-lg leading-relaxed mb-6 italic">
                "{spark.reflectionQuestion}"
              </p>
              
              <AnimatePresence mode="wait">
                {!showJournal ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-3"
                  >
                    <button
                      onClick={() => setShowJournal(true)}
                      className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-all flex items-center justify-center gap-2"
                      data-testid="button-write-reflection"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Write Your Reflection
                    </button>
                    {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
                      <button
                        onClick={() => {
                          setShowJournal(true);
                          try {
                            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
                            const recognition = new SpeechRecognition();
                            recognition.continuous = true;
                            recognition.interimResults = true;
                            recognition.lang = 'en-GB';
                            
                            recognition.onresult = (event: any) => {
                              let transcript = '';
                              for (let i = 0; i < event.results.length; i++) {
                                transcript += event.results[i][0].transcript;
                              }
                              setJournalText(transcript);
                            };
                            
                            recognition.onerror = (event: any) => {
                              setIsRecording(false);
                              if (event.error === 'not-allowed') {
                                toast.error("Microphone access denied. Please allow microphone in your browser settings.");
                              } else if (event.error === 'no-speech') {
                                toast.info("No speech detected. Try speaking closer to the microphone.");
                              } else {
                                toast.error("Voice recording error. Please try again or type your reflection.");
                              }
                            };
                            
                            recognition.onend = () => setIsRecording(false);
                            
                            (window as any).currentRecognition = recognition;
                            recognition.start();
                            setIsRecording(true);
                          } catch (err) {
                            toast.error("Could not start voice recording. Please type your reflection instead.");
                            setIsRecording(false);
                          }
                        }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium transition-all flex items-center justify-center gap-2"
                        data-testid="button-voice-reflection"
                      >
                        <Mic className="h-5 w-5" />
                        Or Speak Your Reflection
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {isRecording && (
                      <div className="flex items-center justify-center gap-3 py-4 bg-red-500/10 rounded-xl border border-red-500/30 mb-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-400 font-medium">Recording... Speak now</span>
                        <button
                          onClick={() => {
                            if ((window as any).currentRecognition) {
                              (window as any).currentRecognition.stop();
                            }
                            setIsRecording(false);
                          }}
                          className="ml-2 px-3 py-1 bg-red-500/20 rounded-lg text-red-400 text-sm hover:bg-red-500/30"
                        >
                          Stop
                        </button>
                      </div>
                    )}
                    <Textarea
                      value={journalText}
                      onChange={(e) => setJournalText(e.target.value)}
                      placeholder="Pour out your heart here..."
                      className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
                      data-testid="textarea-journal"
                    />
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowJournal(false);
                          if ((window as any).currentRecognition) {
                            (window as any).currentRecognition.stop();
                          }
                          setIsRecording(false);
                        }}
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => journalMutation.mutate(journalText)}
                        disabled={!journalText.trim() || journalMutation.isPending}
                        className="flex-1 bg-primary hover:bg-primary/90"
                        data-testid="button-save-journal"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Save Reflection
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          
          {spark.scenarioVignette && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-amber-900/20 to-orange-900/10 rounded-2xl p-6 border border-amber-700/30 mb-8"
            >
              <div className="flex items-center gap-2 mb-4 text-amber-400">
                <Heart className="h-5 w-5" />
                <h3 className="font-bold">Real-Life Moment</h3>
              </div>
              <p className="text-white leading-relaxed italic text-lg">{spark.scenarioVignette}</p>
            </motion.div>
          )}
          
          <div className="pb-12" />
        </div>
      </div>
    </div>
  );
}
