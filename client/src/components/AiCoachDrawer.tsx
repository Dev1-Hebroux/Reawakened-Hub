import { useState, useRef, useEffect, createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, X, Send, Loader2, 
  ChevronRight, Bot, User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: number;
  sessionId: number;
  sender: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface Session {
  id: number;
  userId: string;
  entryPoint: string;
  title: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

interface AiCoachDrawerProps {
  entryPoint?: string;
}

interface AwakeAIContextType {
  openAwakeAI: () => void;
}

const AwakeAIContext = createContext<AwakeAIContextType | null>(null);

export function useAwakeAI() {
  const context = useContext(AwakeAIContext);
  return context;
}

const AI_BUTTON_HIDDEN_KEY = 'awake-ai-button-hidden';
const AI_BUTTON_DELAY_MS = 2 * 60 * 1000; // 2 minutes

export function AiCoachDrawer({ entryPoint = "general" }: AiCoachDrawerProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show button after 2 minutes on site, allow user to hide it
  const [showButton, setShowButton] = useState(false);
  const [isHiddenByUser, setIsHiddenByUser] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AI_BUTTON_HIDDEN_KEY) === 'true';
    }
    return false;
  });

  // Timer to show button after 2 minutes
  useEffect(() => {
    if (isHiddenByUser) return;

    const timer = setTimeout(() => {
      setShowButton(true);
    }, AI_BUTTON_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isHiddenByUser]);

  // Hide bot when dialogs/modals are open (form filling)
  const [isFormOpen, setIsFormOpen] = useState(false);
  useEffect(() => {
    const checkForDialogs = () => {
      const hasOpenDialog = document.querySelector('[role="dialog"]') !== null ||
                           document.querySelector('[data-state="open"]') !== null ||
                           document.querySelector('.fixed.inset-0') !== null;
      setIsFormOpen(hasOpenDialog && !isOpen);
    };

    // Check on mount and observe DOM changes
    checkForDialogs();
    const observer = new MutationObserver(checkForDialogs);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isOpen]);

  // Handle hiding the button
  const handleHideButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHiddenByUser(true);
    localStorage.setItem(AI_BUTTON_HIDDEN_KEY, 'true');
  };

  useEffect(() => {
    const handleOpenAwakeAI = () => {
      setShowButton(true); // Force show when explicitly opened
      setIsOpen(true);
    };
    window.addEventListener('openAwakeAI', handleOpenAwakeAI);
    return () => window.removeEventListener('openAwakeAI', handleOpenAwakeAI);
  }, []);

  const { data: sessionsData } = useQuery<{ sessions: Session[] }>({
    queryKey: ["/api/ai-coach/sessions"],
    enabled: isAuthenticated && isOpen,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery<{ messages: Message[] }>({
    queryKey: [`/api/ai-coach/sessions/${activeSessionId}/messages`],
    enabled: !!activeSessionId,
  });

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest<Session>("POST", "/api/ai-coach/sessions", { entryPoint });
    },
    onSuccess: (session: Session) => {
      setActiveSessionId(session.id);
      queryClient.invalidateQueries({ queryKey: ["/api/ai-coach/sessions"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest<Message>("POST", `/api/ai-coach/sessions/${activeSessionId}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ai-coach/sessions/${activeSessionId}/messages`] });
      setInput("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.messages]);

  const handleStartNewChat = () => {
    createSessionMutation.mutate();
  };

  const handleSend = () => {
    if (!input.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAuthenticated) return null;

  const messages = messagesData?.messages || [];
  const sessions = sessionsData?.sessions || [];

  return (
    <>
      {/* Floating AI Bot Button — always bottom-right, shows after 2 mins, hides during forms */}
      <AnimatePresence>
        {!isOpen && showButton && !isHiddenByUser && !isFormOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-[60] flex items-center gap-2"
          >
            {/* Main AI button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsOpen(true)}
              className="h-12 px-4 bg-[#1a2744] text-white rounded-full shadow-lg flex items-center gap-2 transition-shadow hover:shadow-xl"
              data-testid="button-open-ai-coach"
              aria-label="Open AI Coach"
            >
              <Bot className="h-5 w-5" />
              <span className="text-sm font-medium">Ask Awake AI</span>
            </motion.button>
            {/* Close/Hide button */}
            <button
              onClick={handleHideButton}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
              aria-label="Hide Awake AI button"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[80vh] max-h-[700px] bg-white z-50 flex flex-col shadow-2xl rounded-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#1a2744] to-[#243656] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Awake AI</h3>
                    <p className="text-xs text-white/70">Your personal growth companion</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  data-testid="button-close-ai-coach"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!activeSessionId ? (
                <div className="flex-1 flex flex-col p-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#4A7C7C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="h-8 w-8 text-[#4A7C7C]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Welcome to Awake AI
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Get personalized guidance on your goals, habits, and spiritual journey.
                    </p>
                  </div>

                  <Button
                    onClick={handleStartNewChat}
                    disabled={createSessionMutation.isPending}
                    data-testid="button-start-new-chat"
                    className="bg-[#4A7C7C] hover:bg-[#3d6666] text-white mb-6"
                  >
                    {createSessionMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    Start New Conversation
                  </Button>

                  {sessions.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-3">Recent conversations</p>
                      <div className="space-y-2">
                        {sessions.slice(0, 5).map((session) => (
                          <button
                            key={session.id}
                            onClick={() => setActiveSessionId(session.id)}
                            data-testid={`button-session-${session.id}`}
                            className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {session.title || `${session.entryPoint} session`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(session.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[#4A7C7C]" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">
                          Start the conversation by saying hello or asking a question!
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`flex gap-2 max-w-[85%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.sender === "user" 
                                ? "bg-[#243656]" 
                                : "bg-[#4A7C7C]"
                            }`}>
                              {message.sender === "user" ? (
                                <UserIcon className="h-4 w-4 text-white" />
                              ) : (
                                <Bot className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div className={`rounded-2xl px-4 py-3 ${
                              message.sender === "user"
                                ? "bg-[#243656] text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                    {sendMessageMutation.isPending && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="flex gap-2 max-w-[85%]">
                          <div className="w-8 h-8 rounded-full bg-[#4A7C7C] flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="bg-gray-100 rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t bg-white">
                    <div className="flex gap-2">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        data-testid="input-ai-coach-message"
                        className="flex-1 resize-none min-h-[44px] max-h-32"
                        rows={1}
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!input.trim() || sendMessageMutation.isPending}
                        data-testid="button-send-message"
                        className="bg-[#4A7C7C] hover:bg-[#3d6666] px-4"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <button
                      onClick={() => setActiveSessionId(null)}
                      className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      ← Back to sessions
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
