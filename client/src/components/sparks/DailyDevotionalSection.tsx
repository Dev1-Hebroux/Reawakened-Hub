/**
 * DailyDevotionalSection Component — Premium Design
 *
 * Today's devotional section with:
 * - Refined glass-morphism cards
 * - Premium toggle with smooth transitions
 * - Cinematic video/audio preview card
 * - Elegant scripture display
 */

import { BookOpen, Play, Calendar, Heart, Share2, MessageCircle, Mail, HandHeart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import type { Spark } from "@shared/schema";
import { getSparkImage } from "@/lib/sparkImageUtils";

interface DailyDevotionalSectionProps {
  todaySpark: Spark | null;
  todayLoading: boolean;
  viewMode: 'reflection' | 'faith';
  onViewModeChange: (mode: 'reflection' | 'faith') => void;
  onSparkClick: () => void;
  onSubscribeClick: () => void;
  onReactionClick: () => void;
}

export function DailyDevotionalSection({
  todaySpark,
  todayLoading,
  viewMode,
  onViewModeChange,
  onSparkClick,
  onSubscribeClick,
  onReactionClick,
}: DailyDevotionalSectionProps) {
  const [isLiked, setIsLiked] = useState(() => {
    if (typeof window === 'undefined' || !todaySpark) return false;
    const stored = localStorage.getItem('amen_liked_sparks');
    const ids: number[] = stored ? JSON.parse(stored) : [];
    return todaySpark ? ids.includes(todaySpark.id) : false;
  });

  const handleAmen = () => {
    if (!todaySpark) return;
    const stored = localStorage.getItem('amen_liked_sparks');
    const ids: number[] = stored ? JSON.parse(stored) : [];
    const next = isLiked ? ids.filter(id => id !== todaySpark.id) : [...ids, todaySpark.id];
    localStorage.setItem('amen_liked_sparks', JSON.stringify(next));
    setIsLiked(!isLiked);
    if (!isLiked) {
      toast.success("Amen! 🙏");
    }
    onReactionClick();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleShare = () => {
    if (!todaySpark) return;

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
  };

  return (
    <div className="relative overflow-hidden">
      {/* Subtle background separation */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              Today's Devotional
            </h2>
            <p className="text-sm text-white/30 mt-1.5 ml-12 font-light">Your daily dose of scripture and inspiration.</p>
          </div>
          <div className="flex items-center bg-white/[0.04] rounded-full p-1 border border-white/[0.06]">
            <button
              onClick={() => onViewModeChange('reflection')}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                viewMode === 'reflection'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-white/40 hover:text-white/70'
              }`}
              data-testid="button-mode-reflection"
            >
              Reflection
            </button>
            <button
              onClick={() => onViewModeChange('faith')}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                viewMode === 'faith'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-white/40 hover:text-white/70'
              }`}
              data-testid="button-mode-faith"
            >
              Faith Overlay
            </button>
          </div>
        </div>

        {todayLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          </div>
        ) : todaySpark ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Today's Spark — Cinematic Preview */}
            <div
              onClick={onSparkClick}
              className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500"
              data-testid="card-today-spark"
            >
              <img
                src={getSparkImage(todaySpark, 0)}
                alt={todaySpark.title}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                style={{ filter: 'brightness(0.8) saturate(1.1)' }}
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Center Play */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500 shadow-2xl">
                  <Play className="h-7 w-7 fill-white text-white ml-1" />
                </div>
              </div>

              {/* Bottom Meta */}
              <div className="absolute bottom-5 left-5 right-5">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] bg-primary/80 text-white px-2.5 py-1 rounded-md mb-2.5 inline-block">
                  {todaySpark.weekTheme || "Today's Word"}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">{todaySpark.title}</h3>
                <p className="text-xs text-white/60 mt-1">
                  {todaySpark.duration
                    ? `${Math.floor(todaySpark.duration / 60)} min ${
                        todaySpark.mediaType === 'video' ? 'watch' : 'listen'
                      }`
                    : 'Daily spark'}
                </p>
              </div>
            </div>

            {/* Scripture & Prayer — Glass Card */}
            <div className="flex flex-col justify-between gap-6">
              <div className="bg-white/[0.03] rounded-2xl p-7 border border-white/[0.05] flex-1">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" /> {formatDate(todaySpark.dailyDate)}
                  </span>
                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={handleAmen}
                      whileTap={{ scale: 1.3 }}
                      className={`flex items-center gap-1.5 transition-colors duration-300 ${
                        isLiked ? 'text-red-400' : 'text-white/30 hover:text-red-400'
                      }`}
                      data-testid="button-like-verse"
                    >
                      <motion.div
                        animate={isLiked ? {
                          scale: [1, 1.3, 1],
                        } : {}}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        <Heart className={`h-4 w-4 transition-all ${isLiked ? 'fill-red-400 text-red-400' : 'hover:fill-red-400'}`} />
                      </motion.div>
                      <span className={`text-[10px] font-medium ${isLiked ? 'text-red-400' : ''}`}>Amen</span>
                    </motion.button>
                    <button
                      onClick={handleShare}
                      className="text-white/30 cursor-pointer hover:text-white transition-colors duration-300"
                      data-testid="button-share-verse"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Scripture Quote */}
                <blockquote className="text-lg md:text-xl font-display font-semibold text-white/90 leading-relaxed border-l-2 border-primary/60 pl-5 mb-4">
                  "{todaySpark.description}"
                </blockquote>

                {viewMode === 'faith' && todaySpark.scriptureRef && (
                  <p className="text-right text-primary font-bold text-sm">— {todaySpark.scriptureRef}</p>
                )}
                {viewMode === 'faith' && todaySpark.prayerLine && (
                  <div className="mt-5 pt-5 border-t border-white/[0.05]">
                    <p className="text-[10px] text-white/25 uppercase tracking-[0.15em] mb-2 flex items-center gap-2 font-medium">
                      <HandHeart className="h-3.5 w-3.5" /> Prayer
                    </p>
                    <p className="text-white/60 italic text-sm leading-relaxed">{todaySpark.prayerLine}</p>
                  </div>
                )}
              </div>

              {/* Subscribe buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onSubscribeClick}
                  className="bg-white/[0.03] hover:bg-white/[0.06] p-4 rounded-xl flex items-center gap-3 transition-all duration-300 border border-white/[0.04] hover:border-green-500/20 group"
                  data-testid="button-whatsapp"
                >
                  <div className="h-10 w-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-white/25 font-medium">Join on</div>
                    <div className="font-bold text-sm text-white/80">WhatsApp</div>
                  </div>
                </button>

                <button
                  onClick={onSubscribeClick}
                  className="bg-white/[0.03] hover:bg-white/[0.06] p-4 rounded-xl flex items-center gap-3 transition-all duration-300 border border-white/[0.04] hover:border-blue-500/20 group"
                  data-testid="button-email"
                >
                  <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-white/25 font-medium">Get via</div>
                    <div className="font-bold text-sm text-white/80">Email</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
            <Calendar className="h-10 w-10 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white/80 mb-2">No Devotional Today</h3>
            <p className="text-sm text-white/30 max-w-md mx-auto font-light">
              Check back tomorrow for your daily dose of inspiration, or explore our library of past devotionals below.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
