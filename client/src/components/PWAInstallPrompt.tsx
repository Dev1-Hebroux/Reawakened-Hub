import { useState, useEffect } from "react";
import { X, Download, Share, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    setIsIOS(isIOSDevice);

    if (isInStandaloneMode) {
      return;
    }

    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    if (daysSinceDismissed < 7) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (isIOSDevice && !isInStandaloneMode) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (!showPrompt) return null;

  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-[#243656]">Install Reawakened</h3>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              data-testid="button-close-ios-instructions"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <p className="text-[#243656]/70 text-sm mb-6">
            Install Reawakened on your iPhone for the best experience:
          </p>
          
          <ol className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#4A7C7C] text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
              <div>
                <p className="text-[#243656]">Tap the <Share className="w-4 h-4 inline text-blue-500" /> Share button at the bottom of Safari</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#4A7C7C] text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
              <div>
                <p className="text-[#243656]">Scroll down and tap <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded"><Plus className="w-3 h-3" /> Add to Home Screen</span></p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#4A7C7C] text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <div>
                <p className="text-[#243656]">Tap <strong>Add</strong> in the top right corner</p>
              </div>
            </li>
          </ol>
          
          <button
            onClick={handleDismiss}
            className="w-full mt-6 py-3 bg-[#4A7C7C] text-white rounded-xl font-medium hover:bg-[#3d6666] transition-colors"
            data-testid="button-got-it-ios"
          >
            Got it!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90] sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#243656]/10 p-4 animate-in slide-in-from-bottom-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#4A7C7C] to-[#243656] rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#243656] text-sm">Install Reawakened</h3>
            <p className="text-[#243656]/60 text-xs mt-0.5">
              Get quick access with our app. Works offline too!
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors self-start"
            data-testid="button-dismiss-pwa-prompt"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 text-sm text-[#243656]/70 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="button-not-now-pwa"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 py-2 text-sm bg-[#4A7C7C] text-white rounded-lg font-medium hover:bg-[#3d6666] transition-colors"
            data-testid="button-install-pwa"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
