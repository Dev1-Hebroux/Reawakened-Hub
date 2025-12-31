import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Share2, 
  Users, 
  Play, 
  BookOpen, 
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Send,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ActionType = 'share' | 'invite' | 'live-room' | 'training' | 'follow-up';

interface DigitalActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: ActionType;
  projectTitle?: string;
  projectId?: number;
}

export function DigitalActionsModal({ 
  isOpen, 
  onClose, 
  action, 
  projectTitle = "This Mission",
  projectId 
}: DigitalActionsModalProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/projects/${projectId || ''}` 
    : '';

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInvite = async () => {
    if (!email) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setEmail('');
    }, 2000);
  };

  const actionConfig = {
    'share': {
      title: 'Share This Mission',
      icon: Share2,
      color: 'bg-primary',
    },
    'invite': {
      title: 'Invite a Friend',
      icon: Users,
      color: 'bg-[#7C9A8E]',
    },
    'live-room': {
      title: 'Join Live Room',
      icon: Play,
      color: 'bg-[#D4A574]',
    },
    'training': {
      title: 'Start Training',
      icon: BookOpen,
      color: 'bg-[#4A7C7C]',
    },
    'follow-up': {
      title: 'Follow-Up',
      icon: MessageCircle,
      color: 'bg-primary',
    },
  };

  const config = actionConfig[action];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-xl ${config.color} flex items-center justify-center text-white`}>
                    <config.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{config.title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  data-testid="button-close-modal"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {action === 'share' && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Share "{projectTitle}" with others and invite them to join the mission.
                  </p>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-2">Share Link</div>
                    <div className="flex gap-2">
                      <Input 
                        value={shareUrl} 
                        readOnly 
                        className="flex-1 text-sm"
                        data-testid="input-share-url"
                      />
                      <Button 
                        onClick={copyToClipboard}
                        variant="outline"
                        data-testid="button-copy-link"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                      data-testid="button-share-whatsapp"
                    >
                      <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                        <Send className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">WhatsApp</span>
                    </button>
                    <button 
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                      data-testid="button-share-email"
                    >
                      <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white">
                        <Mail className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">Email</span>
                    </button>
                    <button 
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                      data-testid="button-share-other"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                        <ExternalLink className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">More</span>
                    </button>
                  </div>
                </div>
              )}

              {action === 'invite' && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Send a personal invitation to join this mission journey.
                  </p>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Friend's Email
                    </label>
                    <div className="flex gap-2">
                      <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="friend@example.com"
                        className="flex-1"
                        data-testid="input-invite-email"
                      />
                      <Button 
                        onClick={sendInvite}
                        disabled={!email || sent}
                        className="bg-primary hover:bg-primary/90"
                        data-testid="button-send-invite"
                      >
                        {sent ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-primary/5 to-orange-500/5 rounded-xl p-4 border border-primary/10">
                    <div className="text-sm font-medium text-gray-900 mb-1">Personal Note</div>
                    <p className="text-sm text-gray-600">
                      Your friend will receive an invitation with your name and a link to join this mission.
                    </p>
                  </div>
                </div>
              )}

              {action === 'live-room' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#D4A574]/10 to-[#D4A574]/5 rounded-xl p-6 text-center border border-[#D4A574]/20">
                    <div className="h-16 w-16 mx-auto rounded-full bg-[#D4A574]/20 flex items-center justify-center mb-4">
                      <Play className="h-8 w-8 text-[#D4A574]" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Live Prayer Room</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Join believers around the world in real-time intercession.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-[#D4A574] font-medium mb-4">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                      12 people praying now
                    </div>
                    <Button 
                      className="w-full bg-[#D4A574] hover:bg-[#D4A574]/90 text-white font-bold"
                      data-testid="button-join-room"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Join Now
                    </Button>
                  </div>
                </div>
              )}

              {action === 'training' && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Complete quick training modules to maximize your impact.
                  </p>
                  
                  <div className="space-y-3">
                    {[
                      { title: 'Gospel Sharing Basics', duration: '5 min', complete: true },
                      { title: 'Digital Outreach', duration: '10 min', complete: false },
                      { title: 'Cultural Sensitivity', duration: '8 min', complete: false },
                    ].map((module, i) => (
                      <button
                        key={i}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          module.complete ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-primary/50'
                        }`}
                        data-testid={`training-module-${i}`}
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          module.complete ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {module.complete ? <Check className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{module.title}</div>
                          <div className="text-xs text-gray-500">{module.duration}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {action === 'follow-up' && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Stay connected and continue the conversation.
                  </p>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <textarea
                      placeholder="Write a message to the team..."
                      className="w-full bg-transparent resize-none h-24 focus:outline-none text-gray-900"
                      data-testid="input-follow-up-message"
                    />
                  </div>

                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    data-testid="button-send-message"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
