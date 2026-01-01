import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Users, Heart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { PrayerMessage } from "@shared/schema";

interface LiveIntercessionProps {
  sparkId?: number;
}

function formatTimeAgo(date: Date | string | null): string {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export function LiveIntercession({ sparkId }: LiveIntercessionProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: messages = [], isLoading } = useQuery<PrayerMessage[]>({
    queryKey: ["/api/prayer-messages", sparkId],
    queryFn: async () => {
      const url = sparkId 
        ? `/api/prayer-messages?sparkId=${sparkId}&limit=30`
        : `/api/prayer-messages?limit=30`;
      const res = await fetch(url);
      return res.json();
    },
    refetchInterval: 10000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/prayer-messages", {
        sparkId: sparkId || null,
        message,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-messages", sparkId] });
      setNewMessage("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in to share your prayer");
        setTimeout(() => window.location.href = "/api/login", 1000);
      } else {
        toast.error("Failed to send prayer");
      }
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    if (!isAuthenticated) {
      toast.error("Please log in to share your prayer");
      setTimeout(() => window.location.href = "/api/login", 1000);
      return;
    }
    sendMessageMutation.mutate(newMessage.trim());
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart className="h-5 w-5" style={{ color: '#7C9A8E' }} />
              Live Intercession
            </h3>
            <p className="text-sm text-gray-400">Join the prayer community</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Users className="h-4 w-4" />
            <span>{messages.length} prayers</span>
          </div>
        </div>
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500">Loading prayers...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Be the first to share a prayer
          </div>
        ) : (
          <AnimatePresence>
            {[...messages].reverse().map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3"
              >
                <div 
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: '#4A7C7C' }}
                >
                  {(msg.userName || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white text-sm">
                      {msg.userName || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm break-words">{msg.message}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Share your prayer..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/50"
            data-testid="input-prayer-message"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="h-10 w-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#4A7C7C' }}
            data-testid="button-send-prayer"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
