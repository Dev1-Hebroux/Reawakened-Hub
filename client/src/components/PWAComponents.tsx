/**
 * PWA Install & Update Components
 *
 * Premium install experience with:
 * - Smart install prompting (not intrusive)
 * - App update notifications
 * - Offline status indicator
 * - Install instructions for iOS
 */

import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __pwaInstallPrompt: BeforeInstallPromptEvent | null;
    __pwaUpdateSW: ((reloadPage?: boolean) => Promise<void>) | null;
  }
}

interface PWAContextValue {
  canInstall: boolean;
  isInstalled: boolean;
  installApp: () => Promise<boolean>;
  dismissInstallPrompt: () => void;
  hasUpdate: boolean;
  updateApp: () => void;
  isOnline: boolean;
  isIOS: boolean;
  showIOSInstallInstructions: boolean;
  setShowIOSInstallInstructions: (show: boolean) => void;
}

const PWAContext = createContext<PWAContextValue | null>(null);

export function PWAProvider({ children }: { children: ReactNode }) {
  // Check for early-captured install prompt from index.html
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(
    typeof window !== 'undefined' ? window.__pwaInstallPrompt : null
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showIOSInstallInstructions, setShowIOSInstallInstructions] = useState(false);

  const isIOS = typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

  // Check if already installed
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone ||
        document.referrer.includes('android-app://');
      setIsInstalled(isStandalone);
    };

    checkInstalled();
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkInstalled);

    return () => {
      mediaQuery.removeEventListener('change', checkInstalled);
    };
  }, []);

  // Listen for beforeinstallprompt (both early and late captures)
  useEffect(() => {
    // Check if we already have an early-captured prompt
    if (window.__pwaInstallPrompt && !installPrompt) {
      console.log('[PWA] Using early-captured install prompt');
      setInstallPrompt(window.__pwaInstallPrompt);
    }

    // Listen for new prompts via custom event from index.html
    const handleInstallReady = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent>;
      console.log('[PWA] pwa-install-ready event received');
      setInstallPrompt(customEvent.detail || window.__pwaInstallPrompt);
    };

    // Also listen for the native event (backup)
    const handleBeforeInstall = (e: Event) => {
      console.log('[PWA] beforeinstallprompt event received in React');
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      console.log('[PWA] App installed successfully');
      setIsInstalled(true);
      setInstallPrompt(null);
      window.__pwaInstallPrompt = null;
    };

    window.addEventListener('pwa-install-ready', handleInstallReady);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-install-ready', handleInstallReady);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, [installPrompt]);

  // Listen for update events from vite-plugin-pwa
  useEffect(() => {
    const handleUpdateAvailable = () => {
      console.log('[PWA] Update available');
      setHasUpdate(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    return () => window.removeEventListener('pwa-update-available', handleUpdateAvailable);
  }, []);

  // Online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = useCallback(async (): Promise<boolean> => {
    const prompt = installPrompt || window.__pwaInstallPrompt;
    console.log('[PWA] Install button clicked, prompt available:', !!prompt);

    if (!prompt) {
      if (isIOS) {
        console.log('[PWA] iOS detected, showing manual instructions');
        setShowIOSInstallInstructions(true);
        return false;
      }
      console.log('[PWA] No install prompt available');
      // Show helpful message
      alert('To install this app:\n\n• On Chrome/Edge: Look for the install icon in the address bar\n• On Safari: Tap Share → Add to Home Screen\n• On Firefox: This browser doesn\'t fully support PWA install');
      return false;
    }

    try {
      console.log('[PWA] Triggering install prompt...');
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      console.log('[PWA] User choice:', outcome);

      if (outcome === 'accepted') {
        setInstallPrompt(null);
        window.__pwaInstallPrompt = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error('[PWA] Install failed:', error);
      return false;
    }
  }, [installPrompt, isIOS]);

  const dismissInstallPrompt = useCallback(() => {
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
  }, []);

  const updateApp = useCallback(() => {
    // Use vite-plugin-pwa's updateSW function
    if (window.__pwaUpdateSW) {
      window.__pwaUpdateSW(true);
    } else {
      // Fallback: reload the page
      window.location.reload();
    }
  }, []);

  const canInstall = !!(installPrompt || window.__pwaInstallPrompt) || (isIOS && !isInstalled);

  const value: PWAContextValue = {
    canInstall,
    isInstalled,
    installApp,
    dismissInstallPrompt,
    hasUpdate,
    updateApp,
    isOnline,
    isIOS,
    showIOSInstallInstructions,
    setShowIOSInstallInstructions,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
}

export function usePWA(): PWAContextValue {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}

interface InstallBannerProps {
  delay?: number;
  requireEngagement?: boolean;
}

export function InstallBanner({ delay = 30000, requireEngagement = true }: InstallBannerProps) {
  const { canInstall, isInstalled, installApp, dismissInstallPrompt, isIOS } = usePWA();
  const [show, setShow] = useState(false);
  const [engaged, setEngaged] = useState(!requireEngagement);

  useEffect(() => {
    if (!requireEngagement) return;

    const handleEngagement = () => setEngaged(true);

    window.addEventListener('scroll', handleEngagement, { once: true });
    window.addEventListener('click', handleEngagement, { once: true });

    return () => {
      window.removeEventListener('scroll', handleEngagement);
      window.removeEventListener('click', handleEngagement);
    };
  }, [requireEngagement]);

  useEffect(() => {
    if (!canInstall || isInstalled || !engaged) return;

    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [canInstall, isInstalled, engaged, delay]);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4 z-50 shadow-lg animate-in slide-in-from-bottom duration-300" data-testid="install-banner">
      <div className="flex items-center gap-4 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a2744] to-[#2d4a6f] flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L12 16M12 16L8 12M12 16L16 12" />
            <path d="M4 20H20" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white">Install Reawakened</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isIOS ? 'Tap to see installation steps' : 'Add to home screen for the best experience'}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => {
              dismissInstallPrompt();
              setShow(false);
            }}
            className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400"
            data-testid="button-dismiss-install"
          >
            Not now
          </button>
          <button
            onClick={async () => {
              const installed = await installApp();
              if (installed || isIOS) {
                setShow(false);
              }
            }}
            className="px-4 py-2 text-sm font-medium bg-[#1a2744] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
            data-testid="button-install-app"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

export function UpdateBanner() {
  const { hasUpdate, updateApp } = usePWA();

  if (!hasUpdate) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-[#1a2744] text-white p-3 z-50 shadow-lg" data-testid="update-banner">
      <div className="flex items-center justify-center gap-4 max-w-xl mx-auto">
        <p className="text-sm font-medium">A new version is available!</p>
        <button
          onClick={updateApp}
          className="px-4 py-1.5 text-sm font-medium bg-white text-[#1a2744] rounded-lg hover:bg-gray-100 transition-colors"
          data-testid="button-update-app"
        >
          Update Now
        </button>
      </div>
    </div>
  );
}

export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
    } else {
      const timer = setTimeout(() => setShowOffline(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showOffline && isOnline) return null;

  return (
    <div
      className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium z-50 transition-all duration-300 ${
        isOnline
          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
      }`}
      data-testid="offline-indicator"
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Back online</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
            <span>You're offline</span>
          </>
        )}
      </div>
    </div>
  );
}

export function IOSInstallInstructions() {
  const { showIOSInstallInstructions, setShowIOSInstallInstructions } = usePWA();

  if (!showIOSInstallInstructions) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={() => setShowIOSInstallInstructions(false)}
      data-testid="ios-install-modal"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full animate-in slide-in-from-bottom duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl leading-none"
          onClick={() => setShowIOSInstallInstructions(false)}
          data-testid="button-close-ios-instructions"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Install Reawakened</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Add this app to your home screen for the best experience:</p>

        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold text-sm">
              1
            </span>
            <div>
              <span className="text-slate-700 dark:text-slate-300">Tap the <strong>Share</strong> button</span>
              <div className="mt-1">
                <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                  <polyline points="16,6 12,2 8,6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold text-sm">
              2
            </span>
            <span className="text-slate-700 dark:text-slate-300">Scroll down and tap <strong>"Add to Home Screen"</strong></span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold text-sm">
              3
            </span>
            <span className="text-slate-700 dark:text-slate-300">Tap <strong>"Add"</strong> in the top right</span>
          </li>
        </ol>

        <button
          className="w-full mt-6 px-4 py-3 bg-[#1a2744] text-white rounded-xl font-medium hover:bg-[#2d4a6f] transition-colors"
          onClick={() => setShowIOSInstallInstructions(false)}
          data-testid="button-got-it"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
