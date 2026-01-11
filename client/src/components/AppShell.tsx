/**
 * App Shell Component
 * 
 * Provides instant perceived load time by rendering a skeleton UI
 * while the main application loads. This is critical for PWA performance.
 * 
 * The shell renders immediately from the browser cache while:
 * - JavaScript bundles download
 * - API calls resolve
 * - Heavy components lazy-load
 */

import React, { Suspense, lazy, ComponentType } from 'react';

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="h-8 w-32 rounded bg-muted animate-pulse" />
        <div className="flex-1" />
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    </header>
  );
}

function HeroSkeleton() {
  return (
    <div className="relative w-full h-48 sm:h-64 lg:h-80 bg-muted animate-pulse rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <div className="h-6 w-3/4 bg-muted-foreground/20 rounded" />
        <div className="h-4 w-1/2 bg-muted-foreground/20 rounded" />
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
      <div className="h-3 w-full bg-muted animate-pulse rounded" />
      <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
    </div>
  );
}

function ContentSkeleton() {
  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      <HeroSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="space-y-4">
        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </main>
  );
}

function BottomNavSkeleton() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-16 items-center justify-around">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-6 w-6 rounded bg-muted animate-pulse" />
            <div className="h-2 w-8 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </nav>
  );
}

export function AppSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderSkeleton />
      <ContentSkeleton />
      <BottomNavSkeleton />
    </div>
  );
}

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl">Something went wrong</div>
        <h1 className="text-xl font-semibold">We hit a bump</h1>
        <p className="text-muted-foreground text-sm">
          {error?.message || 'An unexpected error occurred'}
        </p>
        {resetErrorBoundary && (
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            data-testid="button-try-again"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function OfflineFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl">You're offline</div>
        <h1 className="text-xl font-semibold">No connection</h1>
        <p className="text-muted-foreground text-sm">
          Check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          data-testid="button-retry"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

interface AppShellProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AppShell({ children, fallback }: AppShellProps) {
  return (
    <Suspense fallback={fallback || <AppSkeleton />}>
      {children}
    </Suspense>
  );
}

export function lazyWithPreload<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
) {
  const Component = lazy(factory);
  (Component as { preload?: typeof factory }).preload = factory;
  return Component;
}

export function preloadOnIdle(preloadFn: () => Promise<unknown>) {
  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => preloadFn());
  } else {
    setTimeout(preloadFn, 200);
  }
}

export default AppShell;
