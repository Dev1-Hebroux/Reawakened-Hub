/**
 * SparkCard Component
 *
 * Individual spark card with:
 * - Thumbnail image with fallback
 * - Title and description
 * - Category badge
 * - Duration and media type
 * - Hover effects
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
      transition={{ delay: index * 0.05 }}
      className="group relative aspect-[9/16] rounded-[24px] overflow-hidden bg-gray-900 cursor-pointer border border-white/5 hover:border-white/20 transition-colors"
      data-testid={`card-spark-${spark.id}`}
    >
      <img
        src={getSparkImage(spark, index)}
        alt={spark.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

      {/* Top Meta */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10 flex items-center gap-1">
          <Flame className="h-3 w-3 text-primary" /> {pillarLabels[spark.category] || spark.category}
        </span>
      </div>

      {/* Bottom Meta */}
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
        <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">
          {spark.title}
        </h3>
        <p className="text-xs text-white/70 line-clamp-2 mb-3 leading-snug">
          {spark.description}
        </p>
        <div className="flex items-center justify-between text-xs font-bold text-white/50 border-t border-white/10 pt-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />{" "}
            {spark.duration
              ? `${Math.floor(spark.duration / 60)}min`
              : spark.mediaType === 'quick-read'
              ? '2min'
              : '5min'}
          </span>
          <span className="flex items-center gap-1 text-primary">
            <MediaIcon className="h-3 w-3" /> {getMediaTypeLabel(spark.mediaType)}
          </span>
        </div>
      </div>

      {/* Hover Action Button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
          <MediaIcon className="h-6 w-6 fill-white text-white" />
        </div>
      </div>
    </motion.div>
  );
}
