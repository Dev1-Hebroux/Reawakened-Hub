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
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIOSInstallInstructions, setShowIOSInstallInstructions] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone ||
        document.referrer.includes('android-app://');
      setIsInstalled(isStandalone);
    };

    checkInstalled();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkInstalled);
    
    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkInstalled);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      console.log('[PWA] beforeinstallprompt event received');
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    console.log('[PWA] Listeners registered, waiting for beforeinstallprompt...');

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        const checkInterval = setInterval(() => {
          reg.update().catch(() => {});
        }, 60 * 60 * 1000);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setHasUpdate(true);
              }
            });
          }
        });

        return () => clearInterval(checkInterval);
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

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
    console.log('[PWA] Install button clicked, prompt available:', !!installPrompt);
    
    if (!installPrompt) {
      if (isIOS) {
        console.log('[PWA] iOS detected, showing manual instructions');
        setShowIOSInstallInstructions(true);
        return false;
      }
      console.log('[PWA] No install prompt available - browser may not support PWA install or app already installed');
      // Show alert for unsupported browsers
      alert('To install this app:\n\n• On Chrome/Edge: Look for the install icon in the address bar\n• On Safari: Tap Share → Add to Home Screen\n• On Firefox: This browser doesn\'t support PWA install');
      return false;
    }

    try {
      console.log('[PWA] Triggering install prompt...');
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      console.log('[PWA] User choice:', outcome);
      
      if (outcome === 'accepted') {
        setInstallPrompt(null);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('[PWA] Install failed:', error);
      return false;
    }
  }, [installPrompt, isIOS]);

  const dismissInstallPrompt = useCallback(() => {
    setInstallPrompt(null);
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
  }, []);

  const updateApp = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  const value: PWAContextValue = {
    canInstall: !!installPrompt || (isIOS && !isInstalled),
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
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage-500 to-teal-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L12 16M12 16L8 12M12 16L16 12" />
            <path d="M4 20H20" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white">Install Reawakened</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add to home screen for the best experience</p>
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
            onClick={() => {
              installApp();
              setShow(false);
            }}
            className="px-4 py-2 text-sm font-medium bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors"
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
    <div className="fixed top-0 left-0 right-0 bg-sage-500 text-white p-3 z-50 shadow-lg" data-testid="update-banner">
      <div className="flex items-center justify-center gap-4 max-w-xl mx-auto">
        <p className="text-sm font-medium">A new version is available!</p>
        <button 
          onClick={updateApp}
          className="px-4 py-1.5 text-sm font-medium bg-white text-sage-600 rounded-lg hover:bg-sage-50 transition-colors"
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
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl"
          onClick={() => setShowIOSInstallInstructions(false)}
          data-testid="button-close-ios-instructions"
        >
          ×
        </button>
        
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Install Reawakened</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Add this app to your home screen for the best experience:</p>
        
        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-900 flex items-center justify-center">
              <svg className="w-5 h-5 text-sage-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16,6 12,2 8,6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </span>
            <span className="text-slate-700 dark:text-slate-300">Tap the <strong>Share</strong> button in Safari</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-900 flex items-center justify-center">
              <svg className="w-5 h-5 text-sage-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </span>
            <span className="text-slate-700 dark:text-slate-300">Scroll down and tap <strong>"Add to Home Screen"</strong></span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-900 flex items-center justify-center">
              <svg className="w-5 h-5 text-sage-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="text-slate-700 dark:text-slate-300">Tap <strong>"Add"</strong> in the top right</span>
          </li>
        </ol>
        
        <button
          className="w-full mt-6 px-4 py-3 bg-sage-500 text-white rounded-xl font-medium hover:bg-sage-600 transition-colors"
          onClick={() => setShowIOSInstallInstructions(false)}
          data-testid="button-got-it"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
