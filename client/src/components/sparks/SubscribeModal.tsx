/**
 * SubscribeModal Component
 *
 * Subscription modal with:
 * - Category subscription toggles
 * - WhatsApp community link
 * - Email subscription form
 * - Login prompt for unauthenticated users
 */

import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, Check, Loader2, MessageCircle, Mail } from "lucide-react";
import type { SparkSubscription } from "@shared/schema";
import { COMMUNITY_LINKS } from "@/lib/config";

interface SubscribeModalProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  subscriptions: SparkSubscription[];
  subscriptionsLoading: boolean;
  subscribeMutation: { isPending: boolean; variables?: string };
  unsubscribeMutation: { isPending: boolean; variables?: string };
  emailInput: string;
  emailSubmitting: boolean;
  emailSuccess: boolean;
  pillarLabels: Record<string, string>;
  subscriptionCategories: string[];
  isSubscribed: (category: string) => boolean;
  onClose: () => void;
  onSubscriptionToggle: (category: string) => void;
  onEmailChange: (email: string) => void;
  onEmailSubmit: (e: React.FormEvent) => void;
}

export function SubscribeModal({
  isOpen,
  isAuthenticated,
  subscriptions,
  subscriptionsLoading,
  subscribeMutation,
  unsubscribeMutation,
  emailInput,
  emailSubmitting,
  emailSuccess,
  pillarLabels,
  subscriptionCategories,
  isSubscribed,
  onClose,
  onSubscriptionToggle,
  onEmailChange,
  onEmailSubmit,
}: SubscribeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full relative overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              data-testid="button-close-subscribe"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center mb-8">
              <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Ignite Your Daily Walk</h3>
              <p className="text-gray-400">Subscribe to spark categories to get notified when new content is posted.</p>
            </div>

            {/* Subscription Categories */}
            <div className="space-y-3 mb-6">
              {!isAuthenticated ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 mb-4">Log in to manage your subscriptions</p>
                  <button
                    onClick={() => window.location.href = "/api/login"}
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl"
                    data-testid="button-login-to-subscribe"
                  >
                    Log In
                  </button>
                </div>
              ) : subscriptionsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                subscriptionCategories.map((category) => {
                  const subscribed = isSubscribed(category);
                  const isPendingThis = (subscribeMutation.isPending && subscribeMutation.variables === category) ||
                                        (unsubscribeMutation.isPending && unsubscribeMutation.variables === category);

                  return (
                    <button
                      key={category}
                      onClick={() => onSubscriptionToggle(category)}
                      disabled={isPendingThis}
                      data-testid={`button-subscribe-${category}`}
                      className={`w-full py-4 px-6 rounded-xl flex items-center justify-between transition-colors ${
                        subscribed
                          ? 'bg-primary/20 border border-primary text-white'
                          : 'bg-gray-800 hover:bg-gray-700 border border-white/5 text-gray-300'
                      }`}
                    >
                      <span className="font-bold">{pillarLabels[category]}</span>
                      {isPendingThis ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : subscribed ? (
                        <div className="flex items-center gap-2 text-primary">
                          <Check className="h-5 w-5" />
                          <span className="text-sm">Subscribed</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Click to subscribe</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-white/10 pt-6 space-y-3">
              <p className="text-center text-sm text-gray-400 mb-4">Or get updates via:</p>
              <a
                href={COMMUNITY_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
                data-testid="button-join-whatsapp"
              >
                <MessageCircle className="h-5 w-5" /> Join WhatsApp Community
              </a>

              {emailSuccess ? (
                <div className="w-full bg-green-500/20 border border-green-500/50 text-green-400 font-bold py-4 rounded-xl flex items-center justify-center gap-3">
                  <Check className="h-5 w-5" /> You're subscribed!
                </div>
              ) : (
                <form onSubmit={onEmailSubmit} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => onEmailChange(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 bg-gray-800 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      data-testid="input-subscribe-email"
                    />
                    <button
                      type="submit"
                      disabled={emailSubmitting || subscriptions.length === 0}
                      className="bg-white hover:bg-gray-100 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="button-subscribe-email"
                    >
                      {emailSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                      Subscribe
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {subscriptions.length === 0
                      ? "Select at least one category above to subscribe"
                      : "Get daily devotionals, worship, and testimonies delivered to your inbox"}
                  </p>
                </form>
              )}
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">
              {isAuthenticated ? "Manage your subscriptions anytime." : "Log in to save your preferences."}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
