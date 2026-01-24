/**
 * SparkFilters Component
 *
 * Filter buttons for spark categories with:
 * - Active filter state
 * - Responsive layout
 * - Category labels
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        {pillars.map((pillar) => (
          <button
            key={pillar}
            onClick={() => onFilterChange(pillar)}
            data-testid={`button-filter-${pillar}`}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
              activeFilter === pillar
                ? "bg-white text-black border-white"
                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {pillarLabels[pillar]}
          </button>
        ))}
      </div>
      <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
        <Globe className="h-4 w-4" /> Global Feed
      </div>
    </div>
  );
}
