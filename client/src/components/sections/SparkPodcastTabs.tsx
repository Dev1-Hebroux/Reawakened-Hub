import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowRight, Mic2, Clock, Flame, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useDashboard } from "@/hooks/useDashboard";

import identityImg from "@assets/generated_images/identity_in_chaos_abstract.png";
import believeImg from "@assets/generated_images/why_i_believe_abstract.png";

const fallbackImages = [identityImg, believeImg];

const PODCAST_PREVIEW = [
  { num: 3, title: "When the Horses Got Confused", theme: "Revival transforms society", duration: "10 min", color: "from-orange-500 to-amber-400" },
  { num: 2, title: "The Teenage Girl Who Changed Everything", theme: "Simple testimony releases power", duration: "11 min", color: "from-teal-500 to-emerald-400" },
];

export function SparkPodcastTabs() {
  const [activeTab, setActiveTab] = useState<'sparks' | 'podcast'>('sparks');
  const { todaySpark, featured, sparks, isLoading } = useDashboard();

  const displaySparks = [
    todaySpark,
    ...featured.filter(s => s.id !== todaySpark?.id),
    ...sparks.filter(s => s.id !== todaySpark?.id && !featured.some(f => f.id === s.id)),
  ].filter(Boolean).slice(0, 3);

  return (
    <div>
      <div className="mb-4">
        <span className="text-primary font-bold tracking-wider uppercase text-xs">Daily Inspiration</span>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 leading-tight mt-1">
          Ignite Your <span className="text-primary">Spiritual Journey</span>
        </h2>
      </div>

      {/* Pill Toggle */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 mb-5 w-fit">
        <button
          onClick={() => setActiveTab('sparks')}
          className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-1.5 ${
            activeTab === 'sparks'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Flame className="h-3 w-3" /> Sparks
        </button>
        <button
          onClick={() => setActiveTab('podcast')}
          className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-1.5 ${
            activeTab === 'podcast'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Mic2 className="h-3 w-3" /> Podcast
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'sparks' ? (
          <motion.div
            key="sparks"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : displaySparks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">New devotionals coming soon!</p>
              </div>
            ) : (
              displaySparks.map((spark, i) => (
                <Link key={spark!.id} href={`/spark/${spark!.id}`}>
                  <div className="group flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={spark!.thumbnailUrl || spark!.imageUrl || fallbackImages[i % fallbackImages.length]}
                        alt={spark!.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                        {spark!.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <span className="capitalize">{spark!.category?.replace('-', ' ')}</span>
                        {spark!.duration && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span>{Math.floor(spark!.duration / 60)} min</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:scale-105 transition-all">
                      <Play className="h-3 w-3 text-primary group-hover:text-white fill-current ml-0.5" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="podcast"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {PODCAST_PREVIEW.map((ep) => (
              <Link key={ep.num} href="/sparks">
                <div className="group flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ep.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <span className="text-lg font-display font-bold text-white">{ep.num}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                      {ep.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <span>{ep.theme}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{ep.duration}</span>
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:scale-105 transition-all">
                    <Play className="h-3 w-3 text-primary group-hover:text-white fill-current ml-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* View All */}
      <Link href="/sparks">
        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">
          View All {activeTab === 'sparks' ? 'Sparks' : 'Episodes'} <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </Link>
    </div>
  );
}
