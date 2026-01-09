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

// ============================================================================
// Types
// ============================================================================

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAContextValue {
  // Install
  canInstall: boolean;
  isInstalled: boolean;
  installApp: () => Promise<boolean>;
  dismissInstallPrompt: () => void;
  
  // Update
  hasUpdate: boolean;
  updateApp: () => void;
  
  // Offline
  isOnline: boolean;
  
  // iOS specific
  isIOS: boolean;
  showIOSInstallInstructions: boolean;
  setShowIOSInstallInstructions: (show: boolean) => void;
}

// ============================================================================
// Context
// ============================================================================

const PWAContext = createContext<PWAContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function PWAProvider({ children }: { children: ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIOSInstallInstructions, setShowIOSInstallInstructions] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  // Detect if already installed
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

  // Capture install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    // App installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      // Track installation
      trackEvent('pwa_installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Service worker update detection
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for updates periodically
        const checkInterval = setInterval(() => {
          reg.update().catch(() => {});
        }, 60 * 60 * 1000); // Every hour

        // Listen for new service worker
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available
                setHasUpdate(true);
              }
            });
          }
        });

        return () => clearInterval(checkInterval);
      });

      // Handle controller change (after update)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Refresh to load new version
        window.location.reload();
      });
    }
  }, []);

  // Online/offline detection
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

  // Install app
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      // iOS - show instructions
      if (isIOS) {
        setShowIOSInstallInstructions(true);
        return false;
      }
      return false;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallPrompt(null);
        trackEvent('pwa_install_accepted');
        return true;
      } else {
        trackEvent('pwa_install_dismissed');
        return false;
      }
    } catch (error) {
      console.error('Install failed:', error);
      return false;
    }
  }, [installPrompt, isIOS]);

  // Dismiss install prompt
  const dismissInstallPrompt = useCallback(() => {
    setInstallPrompt(null);
    // Remember dismissal
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
    trackEvent('pwa_install_banner_dismissed');
  }, []);

  // Update app
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

// ============================================================================
// Hook
// ============================================================================

export function usePWA(): PWAContextValue {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}

// ============================================================================
// Install Banner Component
// ============================================================================

interface InstallBannerProps {
  /** Delay before showing banner (ms) */
  delay?: number;
  /** Only show after user has engaged (e.g., scrolled, clicked) */
  requireEngagement?: boolean;
}

export function InstallBanner({ delay = 30000, requireEngagement = true }: InstallBannerProps) {
  const { canInstall, isInstalled, installApp, dismissInstallPrompt, isIOS } = usePWA();
  const [show, setShow] = useState(false);
  const [engaged, setEngaged] = useState(!requireEngagement);

  // Track engagement
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

  // Show banner after delay
  useEffect(() => {
    if (!canInstall || isInstalled || !engaged) return;

    // Check if recently dismissed
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return; // Don't show for 7 days after dismissal
    }

    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [canInstall, isInstalled, engaged, delay]);

  if (!show) return null;

  return (
    <div className="install-banner">
      <div className="install-banner-content">
        <div className="install-banner-icon">
          <img src="/icons/icon-48x48.png" alt="App icon" width={48} height={48} />
        </div>
        <div className="install-banner-text">
          <strong>Install Reawakened</strong>
          <span>Add to home screen for the best experience</span>
        </div>
        <div className="install-banner-actions">
          <button 
            onClick={() => {
              dismissInstallPrompt();
              setShow(false);
            }}
            className="install-banner-dismiss"
          >
            Not now
          </button>
          <button 
            onClick={() => {
              installApp();
              setShow(false);
            }}
            className="install-banner-install"
          >
            Install
          </button>
        </div>
      </div>
      
      <style>{`
        .install-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e5e7eb;
          padding: 1rem;
          z-index: 1000;
          box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        .install-banner-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .install-banner-icon img {
          border-radius: 12px;
        }
        
        .install-banner-text {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .install-banner-text strong {
          font-size: 1rem;
          color: #111827;
        }
        
        .install-banner-text span {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .install-banner-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .install-banner-dismiss {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          color: #6b7280;
          cursor: pointer;
        }
        
        .install-banner-install {
          padding: 0.5rem 1rem;
          background: #3b82f6;
          border: none;
          border-radius: 0.5rem;
          color: white;
          cursor: pointer;
          font-weight: 500;
        }
        
        .install-banner-install:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// iOS Install Instructions Modal
// ============================================================================

export function IOSInstallInstructions() {
  const { showIOSInstallInstructions, setShowIOSInstallInstructions } = usePWA();

  if (!showIOSInstallInstructions) return null;

  return (
    <div className="ios-install-modal-overlay" onClick={() => setShowIOSInstallInstructions(false)}>
      <div className="ios-install-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="ios-install-close"
          onClick={() => setShowIOSInstallInstructions(false)}
        >
          ×
        </button>
        
        <h2>Install Reawakened</h2>
        <p>Add this app to your home screen for the best experience:</p>
        
        <ol className="ios-install-steps">
          <li>
            <span className="step-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16,6 12,2 8,6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </span>
            <span>Tap the <strong>Share</strong> button in Safari</span>
          </li>
          <li>
            <span className="step-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </span>
            <span>Scroll and tap <strong>"Add to Home Screen"</strong></span>
          </li>
          <li>
            <span className="step-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </span>
            <span>Tap <strong>"Add"</strong> to confirm</span>
          </li>
        </ol>
        
        <button 
          className="ios-install-done"
          onClick={() => setShowIOSInstallInstructions(false)}
        >
          Got it
        </button>
      </div>
      
      <style>{`
        .ios-install-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 1001;
          animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .ios-install-modal {
          background: white;
          border-radius: 1rem 1rem 0 0;
          padding: 1.5rem;
          width: 100%;
          max-width: 400px;
          animation: slideUp 0.3s ease;
        }
        
        .ios-install-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #9ca3af;
          cursor: pointer;
        }
        
        .ios-install-modal h2 {
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
          color: #111827;
        }
        
        .ios-install-modal p {
          margin: 0 0 1.5rem;
          color: #6b7280;
        }
        
        .ios-install-steps {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem;
        }
        
        .ios-install-steps li {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .ios-install-steps li:last-child {
          border-bottom: none;
        }
        
        .step-icon {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          flex-shrink: 0;
        }
        
        .ios-install-done {
          width: 100%;
          padding: 0.875rem;
          background: #3b82f6;
          border: none;
          border-radius: 0.5rem;
          color: white;
          font-weight: 500;
          font-size: 1rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Update Available Banner
// ============================================================================

export function UpdateBanner() {
  const { hasUpdate, updateApp } = usePWA();

  if (!hasUpdate) return null;

  return (
    <div className="update-banner">
      <span>A new version is available!</span>
      <button onClick={updateApp}>Update now</button>
      
      <style>{`
        .update-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #3b82f6;
          color: white;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          z-index: 1000;
          animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        
        .update-banner button {
          background: white;
          color: #3b82f6;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Offline Indicator
// ============================================================================

export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
    } else {
      // Show briefly when coming back online
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!show && isOnline) return null;

  return (
    <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20,6 9,17 4,12" />
          </svg>
          <span>Back online</span>
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
            <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0122.58 9" />
            <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
            <path d="M8.53 16.11a6 6 0 016.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
          <span>You're offline</span>
        </>
      )}
      
      <style>{`
        .offline-indicator {
          position: fixed;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          padding: 0.75rem 1.25rem;
          border-radius: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          z-index: 1000;
          animation: fadeInUp 0.3s ease;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, 1rem);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        .offline-indicator.offline {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        
        .offline-indicator.online {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Analytics Helper
// ============================================================================

function trackEvent(event: string, data?: Record<string, any>) {
  // Integrate with your analytics
  console.log('[PWA Event]', event, data);
  
  // Example: Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', event, data);
  }
}

declare function gtag(...args: any[]): void;
