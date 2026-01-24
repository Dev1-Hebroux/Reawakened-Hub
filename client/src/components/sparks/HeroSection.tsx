/**
 * HeroSection Component
 *
 * Featured spark hero banner with:
 * - Full-screen background image
 * - Featured badge and category
 * - Title and description
 * - Watch and subscribe CTAs
 * - Spark count indicator
 */

import { Play, Rss } from "lucide-react";
import type { Spark } from "@shared/schema";
import { getSparkImage } from "@/lib/sparkImageUtils";
import identityImage from "@assets/generated_images/worship_gathering_devotional_image.png";

interface HeroSectionProps {
  featuredSpark: Spark | null;
  totalSparks: number;
  onWatchClick: () => void;
  onSubscribeClick: () => void;
}

export function HeroSection({ featuredSpark, totalSparks, onWatchClick, onSubscribeClick }: HeroSectionProps) {
  return (
    <section className="relative mt-16 md:mt-[72px] w-full">
      <div className="absolute inset-0">
        <img
          src={featuredSpark ? getSparkImage(featuredSpark, 0) : identityImage}
          alt="Live Spark"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col justify-end min-h-[60vh] md:min-h-[70vh] p-6 md:p-12 max-w-7xl mx-auto w-full">
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
            {featuredSpark?.description ||
              "Real authority starts with security, not striving. Whether you're in school, on campus, building your career or business, or doing life as a couple, this is a simple daily reset for pressure and pace. When you know you belong, you stop performing and start living steady. Today, let your identity be your anchor."}
          </p>

          <div className="flex items-center gap-4 pt-4 flex-wrap">
            <button
              onClick={onWatchClick}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-full flex items-center gap-2 transition-all hover:scale-105"
              data-testid="button-watch-featured"
            >
              <Play className="h-5 w-5 fill-current" /> Watch Now
            </button>
            <button
              onClick={onSubscribeClick}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold px-6 py-4 rounded-full flex items-center gap-2 transition-all border border-white/20"
              data-testid="button-get-updates-hero"
            >
              <Rss className="h-5 w-5" /> Get Daily Updates
            </button>
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              {totalSparks} Sparks
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
