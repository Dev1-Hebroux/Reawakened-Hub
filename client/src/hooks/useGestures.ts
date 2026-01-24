/**
 * useGestures Hook
 * Mobile-first gesture detection for swipe, long-press, and touch interactions
 * Inspired by iOS and Huawei gesture patterns
 */

import { useRef, useCallback, useEffect, useState } from "react";

export interface SwipeConfig {
  /** Minimum distance to trigger swipe (px) */
  threshold?: number;
  /** Maximum time for swipe (ms) */
  maxDuration?: number;
  /** Prevent default scroll behavior */
  preventDefault?: boolean;
}

export interface LongPressConfig {
  /** Duration to trigger long press (ms) */
  duration?: number;
  /** Movement threshold before canceling (px) */
  moveThreshold?: number;
}

export type SwipeDirection = "left" | "right" | "up" | "down";

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

/**
 * Hook for swipe gesture detection
 */
export function useSwipe(
  onSwipe: (direction: SwipeDirection) => void,
  config: SwipeConfig = {}
) {
  const {
    threshold = 80,
    maxDuration = 300,
    preventDefault = false
  } = config;

  const touchStart = useRef<TouchPosition | null>(null);
  const touchEnd = useRef<TouchPosition | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (preventDefault) e.preventDefault();

    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
    touchEnd.current = null;
  }, [preventDefault]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const duration = touchEnd.current.time - touchStart.current.time;

    // Check if swipe was fast enough
    if (duration > maxDuration) return;

    // Determine direction based on dominant axis
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < threshold) return;

    let direction: SwipeDirection;

    if (absX > absY) {
      // Horizontal swipe
      direction = deltaX > 0 ? "right" : "left";
    } else {
      // Vertical swipe
      direction = deltaY > 0 ? "down" : "up";
    }

    onSwipe(direction);

    // Reset
    touchStart.current = null;
    touchEnd.current = null;
  }, [onSwipe, threshold, maxDuration]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
}

/**
 * Hook for long press detection
 */
export function useLongPress(
  onLongPress: () => void,
  config: LongPressConfig = {}
) {
  const {
    duration = 500,
    moveThreshold = 10
  } = config;

  const timerRef = useRef<NodeJS.Timeout>();
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const start = useCallback((x: number, y: number) => {
    startPos.current = { x, y };
    setIsPressed(true);

    timerRef.current = setTimeout(() => {
      onLongPress();
      setIsPressed(false);
    }, duration);
  }, [onLongPress, duration]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsPressed(false);
    startPos.current = null;
  }, []);

  const move = useCallback((x: number, y: number) => {
    if (!startPos.current) return;

    const deltaX = Math.abs(x - startPos.current.x);
    const deltaY = Math.abs(y - startPos.current.y);

    // Cancel if moved too much
    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      cancel();
    }
  }, [cancel, moveThreshold]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    start(touch.clientX, touch.clientY);
  }, [start]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    move(touch.clientX, touch.clientY);
  }, [move]);

  const handleTouchEnd = useCallback(() => {
    cancel();
  }, [cancel]);

  // Mouse events (for desktop testing)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    start(e.clientX, e.clientY);
  }, [start]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    move(e.clientX, e.clientY);
  }, [move]);

  const handleMouseUp = useCallback(() => {
    cancel();
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    // Touch handlers
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
    // Mouse handlers
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp,
    // State
    isPressed
  };
}

/**
 * Hook for pull-to-refresh gesture
 */
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  config: { threshold?: number; maxPull?: number } = {}
) {
  const { threshold = 80, maxPull = 150 } = config;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStart = useRef<TouchPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only trigger if scrolled to top
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current || isRefreshing) return;

    const deltaY = e.touches[0].clientY - touchStart.current.y;

    // Only pull down
    if (deltaY > 0) {
      const distance = Math.min(deltaY, maxPull);
      setPullDistance(distance);

      // Add resistance as we approach max
      if (distance > threshold) {
        e.preventDefault();
      }
    }
  }, [isRefreshing, threshold, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    touchStart.current = null;
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
}

/**
 * Hook for double tap detection
 */
export function useDoubleTap(
  onDoubleTap: () => void,
  delay: number = 300
) {
  const lastTap = useRef<number>(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap.current;

    if (timeSinceLastTap < delay && timeSinceLastTap > 0) {
      onDoubleTap();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }, [onDoubleTap, delay]);

  return {
    onTouchEnd: handleTap,
    onClick: handleTap
  };
}

/**
 * Hook for pinch-to-zoom detection
 */
export function usePinchZoom(
  onZoom: (scale: number) => void,
  config: { minScale?: number; maxScale?: number } = {}
) {
  const { minScale = 0.5, maxScale = 3 } = config;

  const initialDistance = useRef<number>(0);
  const currentScale = useRef<number>(1);

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistance.current = getDistance(e.touches[0], e.touches[1]);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance.current > 0) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistance.current;

      const newScale = Math.min(
        Math.max(currentScale.current * scale, minScale),
        maxScale
      );

      onZoom(newScale);
      e.preventDefault();
    }
  }, [onZoom, minScale, maxScale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialDistance.current = 0;
    }
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
}
