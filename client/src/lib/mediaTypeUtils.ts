/**
 * Media Type Utilities
 *
 * Shared utility functions for handling spark media types (video, audio, quick-read, download).
 * Extracted from Sparks.tsx and SparkRow.tsx to eliminate code duplication.
 */

import type { ComponentType } from "react";
import { Play, Headphones, BookOpen, Download } from "lucide-react";

export type MediaType = 'video' | 'audio' | 'quick-read' | 'download' | null;

/**
 * Get the appropriate Lucide icon component for a media type
 *
 * @param mediaType - The media type string
 * @returns Lucide icon component
 */
export function getMediaTypeIcon(mediaType: string | null | undefined): ComponentType<{ className?: string }> {
  switch (mediaType) {
    case 'video':
      return Play;
    case 'audio':
      return Headphones;
    case 'quick-read':
      return BookOpen;
    case 'download':
      return Download;
    default:
      return Play;
  }
}

/**
 * Get user-friendly label for a media type
 *
 * @param mediaType - The media type string
 * @returns Human-readable label
 */
export function getMediaTypeLabel(mediaType: string | null | undefined): string {
  switch (mediaType) {
    case 'video':
      return 'Watch';
    case 'audio':
      return 'Listen';
    case 'quick-read':
      return 'Read';
    case 'download':
      return 'Download';
    default:
      return 'View';
  }
}

/**
 * Get duration display string for a media type
 *
 * @param duration - Duration in seconds
 * @returns Formatted duration string (e.g., "5:30")
 */
export function formatMediaDuration(duration: number | null | undefined): string {
  if (!duration) return '';

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Check if a media type requires playback controls
 *
 * @param mediaType - The media type string
 * @returns True if media type needs playback UI
 */
export function requiresPlayback(mediaType: MediaType): boolean {
  return mediaType === 'video' || mediaType === 'audio';
}

/**
 * Check if a media type can be downloaded
 *
 * @param mediaType - The media type string
 * @returns True if media type supports downloading
 */
export function isDownloadable(mediaType: MediaType): boolean {
  return mediaType === 'download' || mediaType === 'video' || mediaType === 'audio';
}
