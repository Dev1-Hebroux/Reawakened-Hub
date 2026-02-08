import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Register service worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    // Dispatch custom event for PWAComponents to handle
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  },
  onOfflineReady() {
    console.log('[PWA] App ready to work offline');
  },
  onRegistered(r) {
    // Check for updates periodically
    if (r) {
      setInterval(() => {
        r.update();
      }, 60 * 60 * 1000); // Check every hour
    }
  },
  onRegisterError(error) {
    console.error('[PWA] Service worker registration error:', error);
  }
});

// Make updateSW available globally for PWAComponents
(window as any).__pwaUpdateSW = updateSW;

createRoot(document.getElementById("root")!).render(<App />);
