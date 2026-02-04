/**
 * HeroSection Component — Premium Cinematic Design
 *
 * Full-viewport hero with:
 * - Cinematic parallax background
 * - Glass-morphism UI elements
 * - Elegant typography hierarchy
 * - Smooth hover micro-interactions
 */

import { Play, Rss, Sparkles } from "lucide-react";
import type { Spark } from "@shared/schema";
import { getSparkImage } from "@/lib/sparkImageUtils";
import identityImage from "@assets/generated_images/worship_gathering_devotional_image.jpg";

interface HeroSectionProps {
  featuredSpark: Spark | null;
  totalSparks: number;
  onWatchClick: () => void;
  onSubscribeClick: () => void;
}

export function HeroSection({ featuredSpark, totalSparks, onWatchClick, onSubscribeClick }: HeroSectionProps) {
  return (
    <section className="relative mt-16 md:mt-[72px] w-full overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img
          src={featuredSpark ? getSparkImage(featuredSpark, 0) : identityImage}
          alt="Live Spark"
          className="w-full h-full object-cover scale-105 animate-[slowZoom_30s_ease-in-out_infinite_alternate]"
          style={{ filter: 'brightness(0.5) saturate(1.2)' }}
        />
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        {/* Subtle radial glow */}
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col justify-end min-h-[65vh] md:min-h-[75vh] p-6 md:p-16 max-w-7xl mx-auto w-full">
        <div className="w-full md:w-3/5 space-y-5">
          {/* Badges */}
          <div className="flex items-center gap-3">
            <span className="bg-primary/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.15em] flex items-center gap-1.5 shadow-lg shadow-primary/20">
              <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" /> Featured
            </span>
            <span className="bg-white/[0.08] backdrop-blur-xl text-white/90 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.15em] border border-white/[0.08]">
              {featuredSpark?.category || "Daily Spark"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-[3.5rem] lg:text-6xl font-display font-bold leading-[1.08] tracking-tight" data-testid="text-hero-title">
            {featuredSpark?.title || "Dominion Begins with Belonging"}
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-white/70 max-w-xl leading-relaxed font-light" data-testid="text-hero-description">
            {featuredSpark?.description ||
              "Real authority starts with security, not striving. Whether you're in school, on campus, building your career or business, or doing life as a couple, this is a simple daily reset for pressure and pace."}
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4 pt-3 flex-wrap">
            <button
              onClick={onWatchClick}
              className="group bg-white text-black font-bold px-8 py-4 rounded-full flex items-center gap-2.5 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98]"
              data-testid="button-watch-featured"
            >
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                <Play className="h-3.5 w-3.5 fill-white text-white ml-0.5" />
              </div>
              Watch Now
            </button>
            <button
              onClick={onSubscribeClick}
              className="bg-white/[0.06] backdrop-blur-xl hover:bg-white/[0.12] text-white font-semibold px-7 py-4 rounded-full flex items-center gap-2.5 transition-all duration-300 border border-white/[0.1] hover:border-white/[0.2]"
              data-testid="button-get-updates-hero"
            >
              <Rss className="h-4 w-4" /> Get Daily Updates
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-white/50">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {totalSparks} Sparks
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
