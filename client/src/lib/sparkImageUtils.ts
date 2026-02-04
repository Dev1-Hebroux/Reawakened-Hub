/**
 * Spark Image Utilities
 *
 * Shared utility functions for handling spark image fallbacks and theme images.
 * Extracted from Sparks.tsx and SparkDetail.tsx to eliminate code duplication.
 */

import spark1 from "@assets/generated_images/raw_street_worship_in_brazil.jpg";
import spark2 from "@assets/generated_images/testimony_of_healing_in_a_village.jpg";
import spark3 from "@assets/generated_images/underground_prayer_meeting.jpg";
import spark4 from "@assets/generated_images/student_sharing_gospel_on_campus.jpg";

import identityImage from "@assets/generated_images/worship_gathering_devotional_image.jpg";
import prayerImage from "@assets/generated_images/prayer_and_presence_devotional.jpg";
import peaceImage from "@assets/generated_images/peace_and_calm_devotional.jpg";
import boldImage from "@assets/generated_images/bold_witness_devotional_image.jpg";
import commissionImage from "@assets/generated_images/commission_missions_devotional.jpg";

export const weekThemeImages: Record<string, string> = {
  "Week 1: Identity & Belonging": identityImage,
  "Week 2: Prayer & Presence": prayerImage,
  "Week 3: Peace & Anxiety": peaceImage,
  "Week 4: Bold Witness": boldImage,
  "Week 5: Commission": commissionImage,
  // Alternate shorter keys
  "identity": identityImage,
  "prayer": prayerImage,
  "peace": peaceImage,
  "witness": boldImage,
  "commission": commissionImage,
};

export const defaultThumbnails = [spark1, spark2, spark3, spark4];

/**
 * Combined pool of all available fallback images for maximum variety
 * when displaying sparks in lists/grids
 */
export const allFallbackImages = [
  spark1, spark2, spark3, spark4,
  identityImage, prayerImage, peaceImage, boldImage, commissionImage,
];

/**
 * Get default thumbnail image based on index (rotates through 4 images)
 */
export function getDefaultThumbnail(index: number): string {
  return defaultThumbnails[index % defaultThumbnails.length];
}

/**
 * Get the appropriate image for a spark, with fallback logic:
 * 1. Use spark.imageUrl if available
 * 2. Use spark.thumbnailUrl if available
 * 3. Use week theme image if weekTheme matches (only for single/featured display)
 * 4. Use fallback from combined image pool based on fallbackIndex
 *
 * @param spark - The spark object
 * @param fallbackIndex - Index for fallback image (uses full pool for variety)
 * @returns URL string for the image to display
 */
export function getSparkImage(
  spark: {
    id?: number;
    imageUrl?: string | null;
    thumbnailUrl?: string | null;
    weekTheme?: string | null;
  },
  fallbackIndex: number = 0
): string {
  if (spark.imageUrl) {
    return spark.imageUrl;
  }
  if (spark.thumbnailUrl) {
    return spark.thumbnailUrl;
  }
  // Use spark.id to deterministically pick a unique image per spark
  // This prevents all sparks with the same weekTheme from showing identical images
  const uniqueIndex = spark.id != null ? spark.id : fallbackIndex;
  return allFallbackImages[uniqueIndex % allFallbackImages.length];
}
