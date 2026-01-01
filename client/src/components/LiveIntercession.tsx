import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Users, Heart, Plus, MapPin, X, Loader2, Radio } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { PrayerMessage, PrayerSession, User } from "@shared/schema";

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
  const [showStartForm, setShowStartForm] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [sessionRegion, setSessionRegion] = useState("");
  const [activeTab, setActiveTab] = useState<'chat' | 'sessions'>('sessions');
  const [selectedSession, setSelectedSession] = useState<PrayerSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const isLeader = user?.role === 'leader' || user?.role === 'admin';

  const { data: messages = [], isLoading: messagesLoading } = useQuery<PrayerMessage[]>({
    queryKey: ["/api/prayer-messages", selectedSession?.id],
    queryFn: async () => {
      if (!selectedSession?.id) return [];
      const res = await fetch(`/api/prayer-messages?sessionId=${selectedSession.id}&limit=30`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 10000,
    enabled: activeTab === 'chat' && !!selectedSession?.id,
  });

  const { data: activeSessions = [], isLoading: sessionsLoading } = useQuery<PrayerSession[]>({
    queryKey: ["/api/leader-prayer-sessions"],
    queryFn: async () => {
      const res = await fetch("/api/leader-prayer-sessions?status=active");
      return res.json();
    },
    refetchInterval: 15000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!selectedSession?.id) {
        throw new Error("Please join a prayer session first");
      }
      const res = await apiRequest("POST", "/api/prayer-messages", {
        sessionId: selectedSession.id,
        message,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-messages", selectedSession?.id] });
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

  const createSessionMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; region: string }) => {
      const res = await apiRequest("POST", "/api/leader-prayer-sessions", data);
      return res.json();
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leader-prayer-sessions"] });
      setShowStartForm(false);
      setSessionTitle("");
      setSessionDescription("");
      setSessionRegion("");
      setSelectedSession(session);
      setActiveTab('chat');
      toast.success("Prayer session started!");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in");
        setTimeout(() => window.location.href = "/api/login", 1000);
      } else {
        toast.error(error.message || "Failed to start session");
      }
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await apiRequest("POST", `/api/leader-prayer-sessions/${sessionId}/end`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leader-prayer-sessions"] });
      setSelectedSession(null);
      setActiveTab('sessions');
      toast.success("Prayer session ended");
    },
    onError: () => {
      toast.error("Failed to end session");
    },
  });

  const joinSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await apiRequest("POST", `/api/leader-prayer-sessions/${sessionId}/join`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leader-prayer-sessions"] });
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

  const handleStartSession = () => {
    if (!sessionTitle.trim()) {
      toast.error("Please enter a title for the prayer session");
      return;
    }
    createSessionMutation.mutate({
      title: sessionTitle.trim(),
      description: sessionDescription.trim(),
      region: sessionRegion.trim(),
    });
  };

  const handleJoinSession = (session: PrayerSession) => {
    setSelectedSession(session);
    setActiveTab('chat');
    if (isAuthenticated) {
      joinSessionMutation.mutate(session.id);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart className="h-5 w-5" style={{ color: '#7C9A8E' }} />
              Live Intercession
            </h3>
            <p className="text-sm text-gray-400">
              {selectedSession ? selectedSession.title : "Join the prayer community"}
            </p>
          </div>
          {isLeader && !showStartForm && activeTab === 'sessions' && (
            <button
              onClick={() => setShowStartForm(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all"
              style={{ backgroundColor: 'rgba(124, 154, 142, 0.2)', color: '#7C9A8E' }}
              data-testid="button-start-session"
            >
              <Plus className="h-4 w-4" /> Start Session
            </button>
          )}
        </div>

        <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
          <button
            onClick={() => { setActiveTab('sessions'); setSelectedSession(null); }}
            className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'sessions' ? 'bg-white text-black' : 'text-gray-400'
            }`}
          >
            Active Sessions ({activeSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'chat' ? 'bg-white text-black' : 'text-gray-400'
            }`}
          >
            Prayer Chat
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showStartForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 space-y-3 flex-1"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Start Intercession Session</h4>
              <button onClick={() => setShowStartForm(false)} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Prayer focus (e.g., 'Prayers for London')"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/50"
              data-testid="input-session-title"
            />
            <textarea
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none"
              data-testid="input-session-description"
            />
            <input
              type="text"
              value={sessionRegion}
              onChange={(e) => setSessionRegion(e.target.value)}
              placeholder="Region (e.g., 'UK', 'Europe', 'Global')"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/50"
              data-testid="input-session-region"
            />
            <button
              onClick={handleStartSession}
              disabled={!sessionTitle.trim() || createSessionMutation.isPending}
              className="w-full py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#7C9A8E' }}
              data-testid="button-create-session"
            >
              {createSessionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Radio className="h-4 w-4" /> Start Live Session
                </>
              )}
            </button>
          </motion.div>
        ) : activeTab === 'sessions' ? (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {sessionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : activeSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Users className="h-8 w-8 text-gray-600 mb-2" />
                <p className="text-gray-500 text-sm">No active prayer sessions</p>
                {isLeader && (
                  <button
                    onClick={() => setShowStartForm(true)}
                    className="mt-3 text-sm font-medium"
                    style={{ color: '#7C9A8E' }}
                  >
                    Start the first one
                  </button>
                )}
              </div>
            ) : (
              activeSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => handleJoinSession(session)}
                  data-testid={`session-card-${session.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-green-500 uppercase">Live</span>
                      </div>
                      <h4 className="font-semibold text-white text-sm">{session.title}</h4>
                      {session.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{session.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {session.participantCount || 0}
                        </span>
                        {session.region && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {session.region}
                          </span>
                        )}
                        <span>Led by {session.leaderName || 'Leader'}</span>
                      </div>
                    </div>
                    <button
                      className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                      style={{ backgroundColor: 'rgba(74, 124, 124, 0.2)', color: '#4A7C7C' }}
                    >
                      Join
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {!selectedSession ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <Users className="h-12 w-12 text-gray-600 mb-4" />
                <h4 className="text-white font-semibold mb-2">Join a Prayer Session</h4>
                <p className="text-gray-500 text-sm mb-4">Select an active prayer session to join the conversation</p>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: 'rgba(74, 124, 124, 0.2)', color: '#4A7C7C' }}
                >
                  View Active Sessions
                </button>
              </div>
            ) : (
              <>
                {isLeader && selectedSession.leaderId === user?.id && (
                  <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
                    <span className="text-xs text-gray-400">You are leading this session</span>
                    <button
                      onClick={() => endSessionMutation.mutate(selectedSession.id)}
                      disabled={endSessionMutation.isPending}
                      className="text-xs font-medium text-red-400 hover:text-red-300"
                      data-testid="button-end-session"
                    >
                      {endSessionMutation.isPending ? 'Ending...' : 'End Session'}
                    </button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messagesLoading ? (
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
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
