/**
 * PodcastSection Component — Premium Cinematic Design
 *
 * The Reawakened One Podcast embedded in the Sparks page:
 * - Glass-morphism hero card for latest episode
 * - Waveform-inspired visual design
 * - Staggered reveal animations
 * - Premium Apple Music / Spotify aesthetic
 */

import { motion } from "framer-motion";
import { Headphones, Play, Mic2, Radio, ChevronRight } from "lucide-react";

interface PodcastEpisode {
  id: string;
  number: number;
  title: string;
  theme: string;
  duration: string;
  description: string;
  scripture: string;
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
  },
];

// Decorative waveform bars for visual rhythm
function WaveformBars({ count = 24, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`flex items-end gap-[2px] h-8 ${className}`}>
      {Array.from({ length: count }).map((_, i) => {
        const height = 20 + Math.sin(i * 0.7) * 60 + Math.random() * 20;
        return (
          <div
            key={i}
            className="w-[2px] rounded-full bg-primary/30"
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}

interface PodcastSectionProps {
  onEpisodeClick?: (id: number) => void;
}

export function PodcastSection({ onEpisodeClick }: PodcastSectionProps) {
  const latestEpisode = PODCAST_EPISODES[0];

  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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

        {/* Featured Latest Episode — Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="group relative rounded-3xl overflow-hidden mb-8"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-white/[0.03] to-black/40" />
          <div className="absolute inset-0 border border-white/[0.06] rounded-3xl" />
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Episode Art — Premium circle with glow */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl scale-110 group-hover:scale-125 transition-transform duration-700" />
                <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/20">
                  <span className="text-5xl md:text-6xl font-bold text-white/90 font-display">
                    {latestEpisode.number}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {/* Meta badges */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20">
                    Latest Episode
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">
                    Episode {latestEpisode.number} &middot; Season 1
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight leading-tight">
                  {latestEpisode.title}
                </h3>

                {/* Theme */}
                <p className="text-sm text-white/40 italic">
                  {latestEpisode.theme}
                </p>

                {/* Description */}
                <p className="text-sm md:text-base text-white/60 leading-relaxed max-w-2xl">
                  {latestEpisode.description}
                </p>

                {/* Waveform decoration */}
                <WaveformBars count={40} className="opacity-50 my-4" />

                {/* Action row */}
                <div className="flex items-center gap-5 pt-2">
                  <button className="group/btn flex items-center gap-3 bg-white text-black font-bold py-3.5 px-7 rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:scale-[1.02] active:scale-[0.98]">
                    <div className="h-7 w-7 bg-primary rounded-full flex items-center justify-center transition-transform group-hover/btn:scale-110">
                      <Play className="h-3 w-3 fill-white text-white ml-0.5" />
                    </div>
                    Listen Now
                  </button>
                  <div className="flex items-center gap-2 text-sm text-white/30">
                    <Headphones className="h-4 w-4" />
                    {latestEpisode.duration}
                  </div>
                  <span className="text-sm text-primary/60 font-medium">
                    {latestEpisode.scripture}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Episode List — Clean, spaced, premium */}
        <div className="space-y-3">
          {PODCAST_EPISODES.slice(1).map((episode, index) => (
            <motion.div
              key={episode.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 * (index + 1) }}
              className="group flex items-center gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-primary/10 transition-all duration-300 cursor-pointer"
            >
              {/* Episode Number */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] flex items-center justify-center flex-shrink-0 border border-white/[0.06] group-hover:border-primary/20 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-300">
                <span className="text-lg font-display font-bold text-white/60 group-hover:text-primary transition-colors">
                  {episode.number}
                </span>
              </div>

              {/* Episode Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-semibold text-white/90 group-hover:text-white transition-colors truncate">
                  {episode.title}
                </h4>
                <p className="text-xs text-white/30 mt-1.5 flex items-center gap-2">
                  <span>{episode.theme}</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-white/20" />
                  <span>{episode.duration}</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-primary/50">{episode.scripture}</span>
                </p>
              </div>

              {/* Play button */}
              <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:border-primary transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
                <Play className="h-3.5 w-3.5 text-white/50 group-hover:text-white fill-current transition-colors ml-0.5" />
              </div>
            </motion.div>
          ))}
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
