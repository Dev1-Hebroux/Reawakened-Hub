/**
 * Image Optimization Components
 * 
 * - Lazy loading with Intersection Observer
 * - Blur placeholder while loading
 * - WebP with fallback
 * - Proper sizing to prevent layout shift
 */

import React, { useState, useRef, useEffect, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  webpSrc?: string;
  placeholder?: 'blur' | 'skeleton' | 'none';
  blurDataUrl?: string;
  width: number;
  height: number;
  lazy?: boolean;
  rootMargin?: string;
}

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

export function OptimizedImage({
  src,
  webpSrc,
  placeholder = 'blur',
  blurDataUrl,
  width,
  height,
  lazy = true,
  rootMargin = '200px',
  alt = '',
  className = '',
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, rootMargin, isInView]);

  const defaultBlurDataUrl = `data:image/svg+xml;base64,${btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="20"/>
      </filter>
      <rect width="100%" height="100%" fill="#e5e7eb" filter="url(#b)"/>
    </svg>`
  )}`;

  const placeholderUrl = blurDataUrl || defaultBlurDataUrl;
  const aspectRatio = height / width;

  return (
    <div
      ref={imgRef}
      className={cn('optimized-image-wrapper relative', className)}
      style={{
        width: '100%',
        maxWidth: width,
        ...style,
      }}
    >
      <div style={{ paddingBottom: `${aspectRatio * 100}%` }} />

      {placeholder !== 'none' && !isLoaded && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: placeholder === 'blur' ? `url(${placeholderUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundColor: placeholder === 'skeleton' ? '#e5e7eb' : undefined,
            animation: placeholder === 'skeleton' ? 'pulse 2s infinite' : undefined,
          }}
        />
      )}

      {isInView && !hasError && (
        <picture>
          {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={lazy ? 'lazy' : undefined}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: isLoaded ? 1 : 0 }}
            {...props}
          />
        </picture>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
      )}
    </div>
  );
}

export function OptimizedAvatar({ src, name = '', size = 40, className = '' }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const initials = name
    .split(' ')
    .map(part => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const getColorFromName = (name: string): string => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const bgColor = getColorFromName(name);

  if (src && !hasError) {
    return (
      <div 
        className={cn('rounded-full overflow-hidden flex-shrink-0', className)}
        style={{ width: size, height: size }}
      >
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-semibold', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        fontSize: size * 0.4,
      }}
    >
      {initials || '?'}
    </div>
  );
}

export function preloadImages(urls: string[]): void {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}
