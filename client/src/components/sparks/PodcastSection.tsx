/**
 * PodcastSection — Colorful, Playable Podcast Player
 *
 * Features:
 * - Vibrant gradient colors per episode (YouTube Music inspired)
 * - Working HTML5 audio player with section chaining
 * - Animated waveform bars
 * - Large, accessible play buttons (min 44px)
 * - Progress tracking
 */

import { motion } from "framer-motion";
import { Headphones, Play, Pause, Mic2, Radio, SkipForward } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

interface PodcastEpisode {
  id: string;
  number: number;
  title: string;
  theme: string;
  duration: string;
  description: string;
  scripture: string;
  gradient: string;
  gradientText: string;
  accentColor: string;
  sections: string[];
}

const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    id: "ep03",
    number: 3,
    title: "When the Horses Got Confused",
    theme: "True revival transforms society",
    duration: "10 min",
    description:
      "In the Welsh coal mines, pit ponies were trained to respond to cursing. During the revival, the miners stopped swearing — and the horses didn't know what to do.",
    scripture: "2 Chronicles 7:14",
    gradient: "from-orange-500 via-amber-500 to-yellow-400",
    gradientText: "from-orange-400 to-yellow-300",
    accentColor: "orange",
    sections: [
      "/podcast/ep03-intro.mp3",
      "/podcast/ep03-section1.mp3",
      "/podcast/ep03-section2.mp3",
      "/podcast/ep03-section3.mp3",
      "/podcast/ep03-closing.mp3",
    ],
  },
  {
    id: "ep02",
    number: 2,
    title: "The Teenage Girl Who Changed Everything",
    theme: "Simple testimony releases power",
    duration: "11 min",
    description:
      "Fourteen words spoken by a terrified sixteen-year-old ignited a revival that transformed an entire nation. Her name was Florrie Evans.",
    scripture: "Revelation 12:11",
    gradient: "from-teal-500 via-emerald-500 to-green-400",
    gradientText: "from-teal-400 to-emerald-300",
    accentColor: "teal",
    sections: [
      "/podcast/ep02-intro.mp3",
      "/podcast/ep02-section1.mp3",
      "/podcast/ep02-section2.mp3",
      "/podcast/ep02-section3.mp3",
      "/podcast/ep02-closing.mp3",
    ],
  },
  {
    id: "ep01",
    number: 1,
    title: "The Pattern Nobody Talks About",
    theme: "Prayer precedes every revival",
    duration: "12 min",
    description:
      "There is a pattern so consistent across 300 years of revival history that it should shake us awake. And almost nobody talks about it.",
    scripture: "Joel 2:28",
    gradient: "from-purple-500 via-violet-500 to-indigo-400",
    gradientText: "from-purple-400 to-indigo-300",
    accentColor: "purple",
    sections: [
      "/podcast/ep01-intro.mp3",
      "/podcast/ep01-section1.mp3",
      "/podcast/ep01-section2.mp3",
      "/podcast/ep01-section3.mp3",
      "/podcast/ep01-closing.mp3",
    ],
  },
];

const SECTION_LABELS = ["Intro", "Part 1", "Part 2", "Part 3", "Closing"];

function WaveformBars({ color = "primary", active = false }: { color?: string; active?: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-6">
      {Array.from({ length: 20 }).map((_, i) => {
        const baseHeight = 20 + Math.sin(i * 0.8) * 50 + Math.random() * 30;
        return (
          <motion.div
            key={i}
            className={`w-[2px] rounded-full ${
              color === "orange" ? "bg-orange-400/50" :
              color === "teal" ? "bg-teal-400/50" :
              color === "purple" ? "bg-purple-400/50" :
              "bg-primary/30"
            }`}
            animate={active ? {
              height: [`${baseHeight}%`, `${20 + Math.random() * 80}%`, `${baseHeight}%`],
            } : {}}
            transition={active ? {
              duration: 0.6 + Math.random() * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
            } : {}}
            style={{ height: `${baseHeight}%` }}
          />
        );
      })}
    </div>
  );
}

export function PodcastSection() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentEpisode, setCurrentEpisode] = useState<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const activeEpisode = PODCAST_EPISODES.find(ep => ep.id === currentEpisode);

  // Update progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress(audio.currentTime);
        setDuration(audio.duration);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", () => setDuration(audio.duration));
    };
  }, [currentEpisode, currentSectionIndex]);

  // Auto-advance to next section
  const handleSectionEnd = useCallback(() => {
    if (!activeEpisode) return;

    if (currentSectionIndex < activeEpisode.sections.length - 1) {
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      if (audioRef.current) {
        audioRef.current.src = activeEpisode.sections[nextIndex];
        audioRef.current.play().catch(() => {});
      }
    } else {
      // Episode finished
      setIsPlaying(false);
      setCurrentEpisode(null);
      setCurrentSectionIndex(0);
      setProgress(0);
    }
  }, [activeEpisode, currentSectionIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener("ended", handleSectionEnd);
    return () => audio.removeEventListener("ended", handleSectionEnd);
  }, [handleSectionEnd]);

  const playEpisode = (episodeId: string) => {
    const episode = PODCAST_EPISODES.find(ep => ep.id === episodeId);
    if (!episode) return;

    if (currentEpisode === episodeId && isPlaying) {
      // Pause
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (currentEpisode === episodeId && !isPlaying) {
      // Resume
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
      return;
    }

    // Play new episode from start
    setCurrentEpisode(episodeId);
    setCurrentSectionIndex(0);
    setProgress(0);

    if (audioRef.current) {
      audioRef.current.src = episode.sections[0];
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const skipSection = () => {
    if (!activeEpisode) return;
    handleSectionEnd();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const latestEpisode = PODCAST_EPISODES[0];

  return (
    <section id="podcast" className="relative overflow-hidden scroll-mt-20">
      <audio ref={audioRef} preload="none" />

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
              <Mic2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
                The Reawakened One Podcast
              </h2>
              <p className="text-sm text-white/40 font-light">
                with Abraham — Revival history deep-dives
              </p>
            </div>
          </div>
        </motion.div>

        {/* Featured Latest Episode — Colorful Card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group relative rounded-3xl overflow-hidden mb-8"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${latestEpisode.gradient} opacity-15`} />
          <div className="absolute inset-0 border border-white/[0.08] rounded-3xl" />
          <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${latestEpisode.gradient} opacity-10 rounded-full blur-[80px] pointer-events-none`} />

          <div className="relative p-6 md:p-10">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              {/* Episode Art — Colorful */}
              <div className="relative flex-shrink-0">
                <div className={`absolute inset-0 bg-gradient-to-br ${latestEpisode.gradient} rounded-3xl blur-xl scale-110 opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
                <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br ${latestEpisode.gradient} flex items-center justify-center shadow-2xl`}>
                  <span className="text-4xl md:text-5xl font-bold text-white/90 font-display">
                    {latestEpisode.number}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {/* Meta badges */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r ${latestEpisode.gradientText} bg-clip-text text-transparent px-0.5`}>
                    Latest Episode
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">
                    Episode {latestEpisode.number} · Season 1
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight leading-tight">
                  {latestEpisode.title}
                </h3>

                <p className="text-sm text-white/40 italic">{latestEpisode.theme}</p>

                <p className="text-sm text-white/60 leading-relaxed max-w-2xl hidden md:block">
                  {latestEpisode.description}
                </p>

                {/* Waveform */}
                <WaveformBars color={latestEpisode.accentColor} active={currentEpisode === latestEpisode.id && isPlaying} />

                {/* Now Playing indicator */}
                {currentEpisode === latestEpisode.id && (
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span className="font-medium">
                      {SECTION_LABELS[currentSectionIndex]} — {formatTime(progress)} / {formatTime(duration)}
                    </span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden max-w-xs">
                      <div
                        className={`h-full bg-gradient-to-r ${latestEpisode.gradient} rounded-full transition-all duration-300`}
                        style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
                      />
                    </div>
                    <button
                      onClick={skipSection}
                      className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                      title="Skip to next section"
                    >
                      <SkipForward className="h-3.5 w-3.5 text-white/50" />
                    </button>
                  </div>
                )}

                {/* Action row */}
                <div className="flex items-center gap-4 pt-1">
                  <button
                    onClick={() => playEpisode(latestEpisode.id)}
                    className={`group/btn flex items-center gap-3 font-bold py-3 px-7 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                      currentEpisode === latestEpisode.id && isPlaying
                        ? `bg-gradient-to-r ${latestEpisode.gradient} text-white shadow-lg`
                        : 'bg-white text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.12)]'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform group-hover/btn:scale-110 ${
                      currentEpisode === latestEpisode.id && isPlaying
                        ? 'bg-white/20'
                        : `bg-gradient-to-br ${latestEpisode.gradient}`
                    }`}>
                      {currentEpisode === latestEpisode.id && isPlaying ? (
                        <Pause className="h-3.5 w-3.5 fill-white text-white" />
                      ) : (
                        <Play className="h-3.5 w-3.5 fill-white text-white ml-0.5" />
                      )}
                    </div>
                    {currentEpisode === latestEpisode.id && isPlaying ? 'Playing' : 'Listen Now'}
                  </button>
                  <div className="flex items-center gap-2 text-sm text-white/30">
                    <Headphones className="h-4 w-4" />
                    {latestEpisode.duration}
                  </div>
                  <span className="text-sm text-white/20 font-medium hidden sm:inline">
                    {latestEpisode.scripture}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Episode List — Colorful list items */}
        <div className="space-y-3">
          {PODCAST_EPISODES.slice(1).map((episode, index) => {
            const isActive = currentEpisode === episode.id;
            const isEpPlaying = isActive && isPlaying;

            return (
              <motion.div
                key={episode.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 * (index + 1) }}
                className={`group flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.06] border-white/[0.12]'
                    : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08]'
                }`}
                onClick={() => playEpisode(episode.id)}
              >
                {/* Colorful Episode Thumbnail */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${episode.gradient} flex items-center justify-center flex-shrink-0 shadow-lg ${
                  isEpPlaying ? 'animate-pulse' : ''
                }`}>
                  <span className="text-lg font-display font-bold text-white">
                    {episode.number}
                  </span>
                </div>

                {/* Episode Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-[15px] font-semibold transition-colors truncate ${
                    isActive ? 'text-white' : 'text-white/90 group-hover:text-white'
                  }`}>
                    {episode.title}
                  </h4>
                  <p className="text-xs text-white/30 mt-1 flex items-center gap-2">
                    <span className="truncate">{episode.theme}</span>
                    <span className="inline-block w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                    <span className="flex-shrink-0">{episode.duration}</span>
                    <span className="inline-block w-1 h-1 rounded-full bg-white/20 flex-shrink-0 hidden sm:inline-block" />
                    <span className={`flex-shrink-0 hidden sm:inline bg-gradient-to-r ${episode.gradientText} bg-clip-text text-transparent font-medium`}>
                      {episode.scripture}
                    </span>
                  </p>
                  {/* Progress bar when playing */}
                  {isActive && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-white/30">{SECTION_LABELS[currentSectionIndex]}</span>
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden max-w-[200px]">
                        <div
                          className={`h-full bg-gradient-to-r ${episode.gradient} rounded-full transition-all duration-300`}
                          style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-[10px] text-white/30">{formatTime(progress)}</span>
                    </div>
                  )}
                </div>

                {/* Play/Pause button */}
                <button
                  className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isEpPlaying
                      ? `bg-gradient-to-br ${episode.gradient} shadow-lg shadow-${episode.accentColor}-500/20`
                      : 'bg-white/[0.06] border border-white/[0.08] group-hover:bg-white/[0.12]'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    playEpisode(episode.id);
                  }}
                >
                  {isEpPlaying ? (
                    <Pause className="h-4 w-4 text-white fill-current" />
                  ) : (
                    <Play className="h-4 w-4 text-white/70 group-hover:text-white fill-current transition-colors ml-0.5" />
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4 mt-10 pt-8 border-t border-white/[0.04]"
        >
          <Radio className="h-3.5 w-3.5 text-primary/40" />
          <p className="text-xs text-white/20 tracking-wider uppercase font-medium">
            New episodes weekly
          </p>
          <span className="text-xs text-white/10">|</span>
          <p className="text-xs text-primary/30 font-semibold tracking-wide">
            Go be dangerous.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
