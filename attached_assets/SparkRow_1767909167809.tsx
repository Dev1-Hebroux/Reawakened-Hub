import React, { memo, useCallback } from 'react';
import { Link } from 'wouter';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  Calendar,
  Users,
  Star,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CATEGORY_LABELS, AUDIENCE_LABELS, STATUS_COLORS } from '@shared/constants';
import type { Spark } from '@shared/schema';

interface SparkRowProps {
  spark: Spark;
  isSelected: boolean;
  onSelect: (sparkId: number, selected: boolean) => void;
  onEdit: (spark: Spark) => void;
  onDelete: (sparkId: number) => void;
  onView: (sparkId: number) => void;
}

/**
 * Status badge colors based on spark status.
 */
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'published':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'scheduled':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'draft':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'archived':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

/**
 * Format date for display in table.
 */
const formatTableDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Memoized SparkRow component to prevent unnecessary re-renders.
 * 
 * This is critical for performance when the admin table has 100+ sparks.
 * Each row only re-renders when its own props change, not when other
 * rows are selected/modified.
 */
export const SparkRow = memo(function SparkRow({
  spark,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onView,
}: SparkRowProps) {
  // Memoize checkbox change handler
  const handleSelectChange = useCallback((checked: boolean) => {
    onSelect(spark.id, checked);
  }, [spark.id, onSelect]);

  // Memoize action handlers
  const handleEdit = useCallback(() => {
    onEdit(spark);
  }, [spark, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(spark.id);
  }, [spark.id, onDelete]);

  const handleView = useCallback(() => {
    onView(spark.id);
  }, [spark.id, onView]);

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      {/* Selection Checkbox */}
      <td className="px-4 py-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleSelectChange}
          aria-label={`Select ${spark.title}`}
        />
      </td>

      {/* Title */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href={`/sparks/${spark.id}`}>
            <span className="text-white hover:text-primary cursor-pointer font-medium">
              {spark.title}
            </span>
          </Link>
          {spark.featured && (
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          )}
        </div>
        {spark.description && (
          <p className="text-gray-500 text-sm truncate max-w-md mt-1">
            {spark.description}
          </p>
        )}
      </td>

      {/* Category */}
      <td className="px-4 py-3">
        <span className="text-gray-400 text-sm">
          {CATEGORY_LABELS[spark.category] || spark.category}
        </span>
      </td>

      {/* Audience Segment */}
      <td className="px-4 py-3">
        {spark.audienceSegment ? (
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {AUDIENCE_LABELS[spark.audienceSegment] || spark.audienceSegment}
          </Badge>
        ) : (
          <span className="text-gray-500 text-sm">Global</span>
        )}
      </td>

      {/* Daily Date */}
      <td className="px-4 py-3">
        {spark.dailyDate ? (
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Calendar className="h-3 w-3" />
            {formatTableDate(spark.dailyDate)}
          </div>
        ) : (
          <span className="text-gray-500 text-sm">—</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <Badge className={`text-xs ${getStatusColor(spark.status)}`}>
          {spark.status}
        </Badge>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-900 border-white/10">
            <DropdownMenuItem onClick={handleView} className="cursor-pointer">
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete} 
              className="cursor-pointer text-red-400 focus:text-red-400"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if these specific props changed
  return (
    prevProps.spark.id === nextProps.spark.id &&
    prevProps.spark.title === nextProps.spark.title &&
    prevProps.spark.status === nextProps.spark.status &&
    prevProps.spark.featured === nextProps.spark.featured &&
    prevProps.spark.dailyDate === nextProps.spark.dailyDate &&
    prevProps.spark.audienceSegment === nextProps.spark.audienceSegment &&
    prevProps.isSelected === nextProps.isSelected
  );
});

/**
 * Hook for creating stable callback functions for the SparkRow component.
 * Use this in the parent component to ensure callbacks don't change on every render.
 */
export function useSparkRowCallbacks(
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>,
  setEditSpark: (spark: Spark | null) => void,
  setDeleteSparkId: (id: number | null) => void,
  navigate: (path: string) => void
) {
  const handleSelect = useCallback((sparkId: number, selected: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(sparkId);
      } else {
        next.delete(sparkId);
      }
      return next;
    });
  }, [setSelectedIds]);

  const handleEdit = useCallback((spark: Spark) => {
    setEditSpark(spark);
  }, [setEditSpark]);

  const handleDelete = useCallback((sparkId: number) => {
    setDeleteSparkId(sparkId);
  }, [setDeleteSparkId]);

  const handleView = useCallback((sparkId: number) => {
    navigate(`/sparks/${sparkId}`);
  }, [navigate]);

  return {
    handleSelect,
    handleEdit,
    handleDelete,
    handleView,
  };
}
