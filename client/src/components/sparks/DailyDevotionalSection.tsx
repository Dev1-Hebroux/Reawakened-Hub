/**
 * DailyDevotionalSection Component
 *
 * Today's devotional section with:
 * - View mode toggle (Reflection vs Faith Overlay)
 * - Today's spark video/audio
 * - Scripture verse and prayer
 * - WhatsApp and Email subscription CTAs
 */

import { BookOpen, Play, Calendar, Heart, Share2, MessageCircle, Mail, HandHeart, Loader2 } from "lucide-react";
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
                onClick={() => onViewModeChange('reflection')}
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
                onClick={() => onViewModeChange('faith')}
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
              onClick={onSparkClick}
              className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer border border-white/10"
              data-testid="card-today-spark"
            >
              <img
                src={getSparkImage(todaySpark, 0)}
                alt={todaySpark.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
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
                  {todaySpark.duration
                    ? `${Math.floor(todaySpark.duration / 60)} min ${
                        todaySpark.mediaType === 'video' ? 'watch' : 'listen'
                      }`
                    : 'Daily spark'}
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
                      onClick={onReactionClick}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors group"
                      data-testid="button-like-verse"
                    >
                      <Heart className="h-4 w-4 group-hover:fill-red-400" />
                      <span className="text-xs">Amen</span>
                    </button>
                    <button
                      onClick={handleShare}
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
                  onClick={onSubscribeClick}
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
                  onClick={onSubscribeClick}
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
  );
}
