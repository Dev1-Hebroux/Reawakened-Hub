/**
 * SparkDetail Page - Refactored
 * 
 * This is a refactored version of the SparkDetail page that:
 * 1. Extracts audio logic into useAudioPlayer and useTTS hooks
 * 2. Extracts journaling logic into useJournaling hook
 * 3. Uses progressive reveal with word-count-based timing
 * 4. Wraps everything in an ErrorBoundary
 * 5. Properly cleans up audio elements on unmount
 * 
 * Original: ~520 lines
 * Refactored: ~280 lines (main component)
 */

import { useState, useMemo, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from 'sonner';
import { 
  ErrorBoundary, 
  SparkDetailError 
} from '@/components/ErrorBoundary';
import { 
  useAudioPlayer, 
  useTTS, 
  useProgressiveReveal,
  DEFAULT_BACKGROUND_TRACKS,
} from '@/hooks/useAudioPlayer';
import { useJournaling } from '@/hooks/useJournaling';
import { calculateWordCounts, formatSparkDate, safeShare } from '@/lib/sparksUtils';
import { AUDIO_SETTINGS, VALIDATION } from '@shared/constants';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Share2,
  BookOpen,
  Flame,
  ChevronLeft,
  ChevronDown,
  Mic,
  MicOff,
  Check,
  Music,
} from 'lucide-react';

// Types
import type { Spark } from '@shared/schema';

/**
 * Main SparkDetail component wrapped in error boundary.
 */
export default function SparkDetailPage() {
  return (
    <ErrorBoundary fallback={<SparkDetailError />}>
      <SparkDetailContent />
    </ErrorBoundary>
  );
}

function SparkDetailContent() {
  const params = useParams<{ id: string }>();
  const sparkId = params.id ? parseInt(params.id, 10) : null;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch spark data
  const { data: spark, isLoading, error } = useQuery<Spark>({
    queryKey: ['/api/sparks', sparkId],
    queryFn: async () => {
      if (!sparkId) throw new Error('Invalid spark ID');
      const res = await fetch(`/api/sparks/${sparkId}`);
      if (!res.ok) throw new Error('Failed to load spark');
      return res.json();
    },
    enabled: !!sparkId,
    retry: 2,
  });

  // Parse teaching content into paragraphs
  const paragraphs = useMemo(() => {
    if (!spark?.textContent) return [];
    return spark.textContent.split('\n\n').filter(p => p.trim());
  }, [spark?.textContent]);

  // Calculate word counts for each paragraph
  const wordCounts = useMemo(() => {
    return paragraphs.map(p => p.split(/\s+/).filter(w => w.length > 0).length);
  }, [paragraphs]);

  // Audio player hook for background music
  const {
    audioRef,
    selectedTrack,
    setSelectedTrack,
    isBackgroundPlaying,
    toggleBackgroundPlayback,
    cleanup: cleanupBackground,
  } = useAudioPlayer({
    backgroundVolume: AUDIO_SETTINGS.BACKGROUND_VOLUME,
  });

  // TTS hook for spoken devotional
  const {
    isSpeaking,
    isLoadingTTS,
    startTextToSpeech,
    stopTextToSpeech,
    cleanup: cleanupTTS,
  } = useTTS({
    sparkId,
    textContent: spark?.textContent,
    backgroundAudioRef: audioRef,
    backgroundVolume: AUDIO_SETTINGS.BACKGROUND_VOLUME,
  });

  // Progressive reveal hook
  const {
    revealedParagraphs,
    allRevealed,
    revealAll,
    reset: resetReveal,
  } = useProgressiveReveal({
    totalParagraphs: paragraphs.length,
    isSpeaking,
    wordCounts,
    wordsPerSecond: AUDIO_SETTINGS.WORDS_PER_SECOND,
  });

  // Journaling hook
  const journaling = useJournaling({
    sparkId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sparks', sparkId, 'journal'] });
    },
  });

  // Action completion state
  const [actionCompleted, setActionCompleted] = useState(false);

  // Action completion mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!sparkId) throw new Error('No spark');
      await apiRequest('POST', `/api/sparks/${sparkId}/complete-action`);
    },
    onSuccess: () => {
      setActionCompleted(true);
      queryClient.invalidateQueries({ queryKey: ['/api/user/action-streak'] });
      toast.success('Action completed! Keep the streak going 🔥');
    },
    onError: () => {
      toast.error('Could not mark as complete');
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupBackground();
      cleanupTTS();
    };
  }, [cleanupBackground, cleanupTTS]);

  // Handle share
  const handleShare = async () => {
    if (!spark) return;
    
    const shareData = {
      title: spark.title,
      text: `Check out this devotional: ${spark.title}`,
      url: window.location.href,
    };

    const success = await safeShare(shareData, () => {
      toast.success('Link copied to clipboard');
    });

    if (!success) {
      toast.error('Could not share');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Error state
  if (error || !spark) {
    return <SparkDetailError />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Audio Element */}
      <audio ref={audioRef} src={selectedTrack.url} loop preload="none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/sparks')}
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-400 hover:text-white"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-4">
            {spark.category}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{spark.title}</h1>
          <p className="text-gray-400">{formatSparkDate(spark.dailyDate)}</p>
        </div>

        {/* Audio Controls */}
        <div className="bg-gray-900/50 rounded-2xl p-6 mb-8 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Listen to Devotional</h3>
            
            {/* Background Music Selector */}
            <select
              value={selectedTrack.id}
              onChange={(e) => {
                const track = DEFAULT_BACKGROUND_TRACKS.find(t => t.id === e.target.value);
                if (track) setSelectedTrack(track);
              }}
              className="bg-black/50 border border-white/20 rounded-lg px-3 py-1 text-sm"
            >
              {DEFAULT_BACKGROUND_TRACKS.map(track => (
                <option key={track.id} value={track.id}>
                  {track.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <Button
              size="lg"
              onClick={startTextToSpeech}
              disabled={isLoadingTTS}
              className="rounded-full h-14 w-14"
            >
              {isLoadingTTS ? (
                <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
              ) : isSpeaking ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleBackgroundPlayback}
              className="border-white/20"
            >
              {isBackgroundPlaying ? (
                <>
                  <VolumeX className="h-4 w-4 mr-2" />
                  Mute Music
                </>
              ) : (
                <>
                  <Music className="h-4 w-4 mr-2" />
                  Play Music
                </>
              )}
            </Button>

            {!allRevealed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={revealAll}
                className="text-gray-400"
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Show All
              </Button>
            )}
          </div>
        </div>

        {/* Teaching Content - Progressive Reveal */}
        <div className="prose prose-invert max-w-none mb-8">
          {paragraphs.slice(0, revealedParagraphs).map((paragraph, idx) => (
            <p
              key={idx}
              className="text-lg leading-relaxed mb-6 animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {paragraph}
            </p>
          ))}
          
          {!allRevealed && (
            <div className="text-center text-gray-500 text-sm">
              {isSpeaking ? 'More content will reveal as you listen...' : 'Press play to reveal more'}
            </div>
          )}
        </div>

        {/* Prayer Line */}
        {spark.prayerLine && (
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 mb-8 border border-primary/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              Prayer
            </h3>
            <p className="text-lg italic text-gray-300">{spark.prayerLine}</p>
          </div>
        )}

        {/* Action Section */}
        {spark.ctaType && (
          <div className="bg-gray-900/50 rounded-2xl p-6 mb-8 border border-white/10">
            <h3 className="font-semibold mb-3">Today's Action: {spark.ctaType}</h3>
            <p className="text-gray-400 mb-4">{spark.ctaText}</p>
            
            <Button
              onClick={() => completeMutation.mutate()}
              disabled={actionCompleted || completeMutation.isPending}
              className={actionCompleted ? 'bg-green-600' : ''}
            >
              {completeMutation.isPending ? (
                'Saving...'
              ) : actionCompleted ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Completed
                </>
              ) : (
                'Mark Complete'
              )}
            </Button>
          </div>
        )}

        {/* Journal Section */}
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Your Reflection
            </h3>
            
            {journaling.hasVoiceSupport && (
              <Button
                variant="outline"
                size="sm"
                onClick={journaling.isRecording ? journaling.stopVoiceRecording : journaling.startVoiceRecording}
                className="border-white/20"
              >
                {journaling.isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2 text-red-400" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice
                  </>
                )}
              </Button>
            )}
          </div>

          <Textarea
            value={journaling.journalText}
            onChange={(e) => journaling.setJournalText(e.target.value)}
            placeholder="What is God speaking to you today?"
            className="min-h-[120px] bg-black/50 border-white/20 resize-none mb-2"
          />
          
          <div className="flex items-center justify-between">
            <span className={`text-sm ${journaling.isOverLimit ? 'text-red-400' : 'text-gray-500'}`}>
              {journaling.characterCount.toLocaleString()} / {journaling.maxCharacters.toLocaleString()}
            </span>
            
            <Button
              onClick={journaling.saveJournal}
              disabled={journaling.isSaving || journaling.isOverLimit || !journaling.journalText.trim()}
            >
              {journaling.isSaving ? 'Saving...' : 'Save Reflection'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
