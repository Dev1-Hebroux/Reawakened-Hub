/**
 * SparkFilters Component
 *
 * Sticky horizontal pill filter tabs (YouTube Music style)
 */

import { Globe } from "lucide-react";

interface SparkFiltersProps {
  pillars: string[];
  pillarLabels: Record<string, string>;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function SparkFilters({ pillars, pillarLabels, activeFilter, onFilterChange }: SparkFiltersProps) {
  return (
    <div className="sticky top-16 z-20 bg-black/90 backdrop-blur-md py-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {pillars.map((pillar) => (
            <button
              key={pillar}
              onClick={() => onFilterChange(pillar)}
              data-testid={`button-filter-${pillar}`}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                activeFilter === pillar
                  ? "bg-white text-black border-white shadow-lg"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {pillarLabels[pillar]}
            </button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <Globe className="h-4 w-4" /> Global Feed
        </div>
      </div>
    </div>
  );
}
