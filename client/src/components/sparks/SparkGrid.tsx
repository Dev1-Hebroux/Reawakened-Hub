/**
 * SparkGrid Component
 *
 * Grid display for spark cards with:
 * - Responsive grid layout
 * - Loading and empty states
 * - Navigation to spark details
 */

import { Loader2, Flame } from "lucide-react";
import type { Spark } from "@shared/schema";
import { SparkCard } from "./SparkCard";

interface SparkGridProps {
  sparks: Spark[];
  isLoading: boolean;
  onSparkClick: (sparkId: number) => void;
  pillarLabels: Record<string, string>;
}

export function SparkGrid({ sparks, isLoading, onSparkClick, pillarLabels }: SparkGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (sparks.length === 0) {
    return (
      <div className="text-center py-20">
        <Flame className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No sparks yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {sparks.map((spark, i) => (
        <SparkCard
          key={spark.id}
          spark={spark}
          index={i}
          onClick={() => onSparkClick(spark.id)}
          pillarLabels={pillarLabels}
        />
      ))}
    </div>
  );
}
