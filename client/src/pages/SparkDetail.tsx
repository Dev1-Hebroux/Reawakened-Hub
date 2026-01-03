import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Bookmark, BookmarkCheck, Share2, Volume2, VolumeX, 
  Pause, Play, Check, Flame, Heart, Mic, MicOff, Send, ChevronDown,
  ChevronUp, Sparkles, Target, MessageCircle, Clock, Calendar
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
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const startTextToSpeech = () => {
    if (!spark?.fullTeaching) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(spark.fullTeaching);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    
    if (audioRef.current && !isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
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
            src={spark.thumbnailUrl || "/placeholder-spark.jpg"} 
            alt={spark.title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
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
              <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/30">
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
              <p className="text-lg text-primary/90 font-medium">
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
                <blockquote className="pl-6 text-xl md:text-2xl font-display leading-relaxed text-white/90 italic">
                  "{spark.fullPassage}"
                </blockquote>
              </motion.div>
            )}
            
            <div className="flex items-center gap-4 py-4">
              <div className="relative">
                <button
                  onClick={togglePlayback}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all ${
                    isPlaying 
                      ? 'bg-primary text-white' 
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                  data-testid="button-play-music"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? "Pause Music" : "Background Music"}
                </button>
                
                <button
                  onClick={() => setShowTrackPicker(!showTrackPicker)}
                  className="ml-2 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
                >
                  {showTrackPicker ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                
                <AnimatePresence>
                  {showTrackPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-2xl z-20"
                    >
                      {backgroundTracks.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => {
                            setSelectedTrack(track);
                            setShowTrackPicker(false);
                            if (isPlaying && audioRef.current) {
                              audioRef.current.src = track.url;
                              audioRef.current.play();
                            }
                          }}
                          className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                            selectedTrack.id === track.id 
                              ? 'bg-primary/20 text-primary' 
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {track.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                onClick={startTextToSpeech}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all ${
                  isSpeaking 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
                data-testid="button-listen"
              >
                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {isSpeaking ? "Stop Reading" : "Listen"}
              </button>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-2 border-b border-white/10 mt-8">
            {['teaching', 'context', 'application'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section as any)}
                className={`px-4 py-3 text-sm font-medium transition-all capitalize ${
                  activeSection === section 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-white/60 hover:text-white'
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
                    className="text-white/85 leading-relaxed mb-6"
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>
            )}
            
            {activeSection === 'context' && spark.contextBackground && (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="font-bold">Historical Context</h3>
                </div>
                <p className="text-white/80 leading-relaxed">{spark.contextBackground}</p>
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
                    className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-white/85 leading-relaxed pt-1">{point}</p>
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
                <div className="flex items-center gap-2 text-primary">
                  <Target className="h-5 w-5" />
                  <h3 className="font-bold">Today's Action</h3>
                </div>
                {streak > 0 && (
                  <div className="flex items-center gap-1.5 bg-primary/20 px-3 py-1 rounded-full">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-bold text-orange-400">{streak} day streak</span>
                  </div>
                )}
              </div>
              
              <p className="text-white/90 leading-relaxed mb-6">{spark.todayAction}</p>
              
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
              
              <p className="text-white/90 text-lg leading-relaxed mb-6 italic">
                "{spark.reflectionQuestion}"
              </p>
              
              <AnimatePresence mode="wait">
                {!showJournal ? (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowJournal(true)}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-all flex items-center justify-center gap-2"
                    data-testid="button-start-journal"
                  >
                    <Mic className="h-5 w-5" />
                    Write Your Reflection
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
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
                        onClick={() => setShowJournal(false)}
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
              <p className="text-white/85 leading-relaxed italic">{spark.scenarioVignette}</p>
            </motion.div>
          )}
          
          <div className="pb-12" />
        </div>
      </div>
    </div>
  );
}
