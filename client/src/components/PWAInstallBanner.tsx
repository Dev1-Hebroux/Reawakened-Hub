import { usePWAInstallPrompt } from "@/hooks/usePWAInstallPrompt";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PWAInstallBanner() {
  const { isInstallable, promptInstall, dismissPrompt } = usePWAInstallPrompt();

  if (!isInstallable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        data-testid="pwa-install-banner"
      >
        <div className="bg-gradient-to-r from-[#1a2744] to-[#2a3754] rounded-2xl shadow-2xl border border-white/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm">
                Install Reawakened
              </h3>
              <p className="text-white/70 text-xs mt-0.5">
                Get the full app experience with offline access and quick launch
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={promptInstall}
                  size="sm"
                  className="bg-white text-[#1a2744] hover:bg-white/90 text-xs h-8 px-3"
                  data-testid="button-install-pwa"
                >
                  <Download className="w-3 h-3 mr-1.5" />
                  Install App
                </Button>
                <Button
                  onClick={dismissPrompt}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 text-xs h-8 px-3"
                  data-testid="button-dismiss-pwa"
                >
                  Not now
                </Button>
              </div>
            </div>
            <button
              onClick={dismissPrompt}
              className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
              data-testid="button-close-pwa-banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
