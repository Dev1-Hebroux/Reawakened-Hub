/**
 * SparkCard Component — Premium Design
 *
 * Individual spark card with:
 * - Cinematic thumbnail with parallax zoom
 * - Glass-morphism overlays
 * - Smooth micro-interactions
 * - Clean typography hierarchy
 */

import { motion } from "framer-motion";
import { Flame, Clock } from "lucide-react";
import type { Spark } from "@shared/schema";
import { getSparkImage } from "@/lib/sparkImageUtils";
import { getMediaTypeIcon, getMediaTypeLabel } from "@/lib/mediaTypeUtils";

interface SparkCardProps {
  spark: Spark;
  index: number;
  onClick: () => void;
  pillarLabels: Record<string, string>;
}

export function SparkCard({ spark, index, onClick, pillarLabels }: SparkCardProps) {
  const MediaIcon = getMediaTypeIcon(spark.mediaType);

  return (
    <motion.div
      layoutId={`spark-${spark.id}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="group relative aspect-[9/16] rounded-[20px] overflow-hidden bg-gray-950 cursor-pointer border border-white/[0.04] hover:border-white/[0.12] transition-all duration-500 hover:shadow-2xl hover:shadow-black/40"
      data-testid={`card-spark-${spark.id}`}
    >
      <img
        src={getSparkImage(spark, index)}
        alt={spark.title}
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-90"
        style={{ filter: 'saturate(1.1)' }}
        loading="lazy"
        decoding="async"
      />

      {/* Gradient overlay — multi-layer for premium depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30" />

      {/* Top Meta */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-start">
        <span className="bg-black/30 backdrop-blur-xl text-white text-[9px] font-bold px-2.5 py-1 rounded-lg border border-white/[0.06] flex items-center gap-1.5 tracking-wider uppercase">
          <Flame className="h-2.5 w-2.5 text-primary" /> {pillarLabels[spark.category] || spark.category}
        </span>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
        <h3 className="text-sm font-bold text-white line-clamp-2 mb-1.5 leading-snug tracking-tight">
          {spark.title}
        </h3>
        <p className="text-[11px] text-white/50 line-clamp-2 mb-3 leading-relaxed font-light">
          {spark.description}
        </p>
        <div className="flex items-center justify-between text-[10px] font-semibold text-white/40 border-t border-white/[0.06] pt-3">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />{" "}
            {spark.duration
              ? `${Math.floor(spark.duration / 60)} min`
              : spark.mediaType === 'quick-read'
              ? '2 min'
              : '5 min'}
          </span>
          <span className="flex items-center gap-1.5 text-primary/70">
            <MediaIcon className="h-3 w-3" /> {getMediaTypeLabel(spark.mediaType)}
          </span>
        </div>
      </div>

      {/* Center Play Button on Hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400">
        <div className="h-14 w-14 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl shadow-black/20 group-hover:scale-105 transition-transform duration-300">
          <MediaIcon className="h-6 w-6 fill-white text-white" />
        </div>
      </div>
    </motion.div>
  );
}
