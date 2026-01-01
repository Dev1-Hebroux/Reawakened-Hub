import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { 
  Share2, 
  Users, 
  GraduationCap,
  MessageCircle,
  ChevronLeft,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Heart,
  Send,
  Loader2
} from "lucide-react";

const shareCards = [
  { 
    id: 1, 
    title: "Hope in Jesus", 
    message: "There's hope even in the darkest times. Jesus loves you and has a plan for your life. Want to discover more?",
    theme: "hope",
    color: "from-blue-500 to-purple-600",
    verse: "Jeremiah 29:11"
  },
  { 
    id: 2, 
    title: "You Are Loved", 
    message: "No matter what you've done or where you've been, God's love for you is unconditional. You are valued and precious.",
    theme: "love",
    color: "from-[#D4A574] to-[#B8956A]",
    verse: "Romans 8:38-39"
  },
  { 
    id: 3, 
    title: "New Beginning", 
    message: "Today can be the start of something beautiful. Jesus offers forgiveness, freedom, and a fresh start.",
    theme: "new_life",
    color: "from-green-500 to-teal-600",
    verse: "2 Corinthians 5:17"
  },
  { 
    id: 4, 
    title: "Peace in the Storm", 
    message: "Anxiety doesn't have to define you. There's a peace that surpasses understanding available to you through Christ.",
    theme: "peace",
    color: "from-cyan-500 to-blue-600",
    verse: "Philippians 4:6-7"
  },
  { 
    id: 5, 
    title: "Never Alone", 
    message: "In your darkest moments, you're never alone. God promises to be with you through every storm and valley.",
    theme: "presence",
    color: "from-indigo-500 to-violet-600",
    verse: "Isaiah 41:10"
  },
];

const inviteTemplates = [
  { id: 1, message: "Hey! I've joined a movement of young people making global impact for Jesus. Would you like to check it out?", context: "For friends" },
  { id: 2, message: "I've been part of this amazing community focused on prayer, missions, and discipleship. Think you'd love it!", context: "For church friends" },
  { id: 3, message: "Want to join me in praying for unreached people groups? There's this cool platform called Reawakened...", context: "For prayer partners" },
  { id: 4, message: "I found this app that helps young Christians pray for global missions together. Join our prayer room?", context: "For youth group" },
];

export function DigitalActions() {
  const { type } = useParams();
  const [, navigate] = useLocation();
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const logActionMutation = useMutation({
    mutationFn: async (data: { actionType: string; targetPlatform?: string; metadata?: any }) => {
      const res = await apiRequest("POST", "/api/mission/digital-actions", data);
      if (!res.ok) {
        throw new Error("Failed to log action");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mission/digital-actions"] });
      toast.success("Action logged! Keep up the great work!");
    },
    onError: () => {
      // Silent fail for logging - don't interrupt user experience
    },
  });

  const handleShare = (platform: string, card: typeof shareCards[0]) => {
    const shareUrl = `https://reawakened.org/share/${card.id}`;
    const text = `${card.title}: ${card.message}`;
    
    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(text + "\n\n" + shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
    
    if (url) {
      window.open(url, "_blank");
    }

    if (isAuthenticated) {
      logActionMutation.mutate({
        actionType: "share_card",
        targetPlatform: platform,
        metadata: { cardId: card.id, cardTheme: card.theme },
      });
    }
  };

  const generateInviteLink = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const link = `https://reawakened.org/join/${code}`;
    setInviteLink(link);
    
    if (isAuthenticated) {
      logActionMutation.mutate({
        actionType: "generate_invite",
        metadata: { inviteCode: code },
      });
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Invite link copied!");
  };

  return (
    <div className="min-h-screen bg-[#1a2744]">
      <Navbar />
      
      <main className="pt-28 pb-32 px-4">
        <div className="max-w-lg mx-auto">
          
          <button 
            onClick={() => navigate("/missions")}
            className="flex items-center gap-2 text-[#D4A574] hover:text-white mb-6 transition-colors font-medium"
            data-testid="button-back-missions"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Missions
          </button>

          {type === "share" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-[#D4A574] rounded-full px-4 py-2 mb-4 shadow-lg">
                  <Share2 className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Share the Gospel</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-white mb-3">
                  Gospel Share Cards
                </h1>
                <p className="text-[#E8E4DE]">
                  Pick a message and share it with your network
                </p>
              </div>

              <div className="space-y-4">
                {shareCards.map((card) => (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.02 }}
                    className={`bg-gradient-to-r ${card.color} rounded-2xl p-5 cursor-pointer transition-all ${
                      selectedCard === card.id ? "ring-2 ring-white" : ""
                    }`}
                    onClick={() => setSelectedCard(card.id)}
                    data-testid={`share-card-${card.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-white text-lg">{card.title}</h3>
                      <span className="text-[10px] text-white/60 bg-white/10 px-2 py-0.5 rounded-full">{card.verse}</span>
                    </div>
                    <p className="text-white/90 text-sm mb-4">{card.message}</p>
                    
                    {selectedCard === card.id && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-3 border-t border-white/20"
                      >
                        <p className="text-xs text-white/60 mb-2">Share via:</p>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={(e) => { e.stopPropagation(); handleShare("whatsapp", card); }}
                            disabled={logActionMutation.isPending}
                          >
                            WhatsApp
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-black hover:bg-gray-800 text-white"
                            onClick={(e) => { e.stopPropagation(); handleShare("twitter", card); }}
                            disabled={logActionMutation.isPending}
                          >
                            X
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={(e) => { e.stopPropagation(); handleShare("facebook", card); }}
                            disabled={logActionMutation.isPending}
                          >
                            Facebook
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-white/20 hover:bg-white/30 text-white"
                            onClick={(e) => { e.stopPropagation(); handleShare("copy", card); }}
                            disabled={logActionMutation.isPending}
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {type === "invite" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-[#4A7C7C]/20 rounded-full px-4 py-2 mb-4">
                  <Users className="h-4 w-4 text-[#4A7C7C]" />
                  <span className="text-sm font-bold text-[#4A7C7C]">Invite Friends</span>
                </div>
                <h1 className="text-2xl font-display font-bold text-white mb-2">
                  Grow the Movement
                </h1>
                <p className="text-white/60">
                  Invite friends to join you on mission
                </p>
              </div>

              <div className="bg-[#243656] rounded-3xl p-6 mb-6 border-2 border-[#4A7C7C]/30 shadow-xl">
                <h3 className="font-bold text-white text-lg mb-4">Generate Your Invite Link</h3>
                
                {!inviteLink ? (
                  <Button 
                    className="w-full bg-[#4A7C7C] hover:bg-[#4A7C7C]/90 text-white font-bold py-5 rounded-2xl"
                    onClick={generateInviteLink}
                    data-testid="button-generate-invite"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Invite Link
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-white/80 text-sm truncate">{inviteLink}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-primary"
                        onClick={copyInviteLink}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Join me on Reawakened! " + inviteLink)}`, "_blank")}
                      >
                        Share via WhatsApp
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#243656] rounded-3xl p-6 border-2 border-[#7C9A8E]/30 shadow-xl">
                <h3 className="font-bold text-white text-lg mb-4">Message Templates</h3>
                <div className="space-y-3">
                  {inviteTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className="bg-[#1a2744] rounded-2xl p-4 cursor-pointer hover:bg-[#2a3a5a] transition-colors border border-[#4A7C7C]/20"
                      onClick={() => {
                        navigator.clipboard.writeText(template.message);
                        toast.success("Message copied!");
                      }}
                      data-testid={`invite-template-${template.id}`}
                    >
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{template.context}</p>
                      <p className="text-white/80 text-sm">{template.message}</p>
                      <p className="text-xs text-primary mt-2 flex items-center gap-1">
                        <Copy className="h-3 w-3" /> Tap to copy
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {type === "training" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-[#D4A574]/20 rounded-full px-4 py-2 mb-4">
                  <GraduationCap className="h-4 w-4 text-[#D4A574]" />
                  <span className="text-sm font-bold text-[#D4A574]">Training</span>
                </div>
                <h1 className="text-2xl font-display font-bold text-white mb-2">
                  Evangelism Training
                </h1>
                <p className="text-[#E8E4DE]">
                  Learn to share your faith effectively
                </p>
              </div>

              <div className="bg-[#243656] rounded-3xl p-6 border-2 border-[#D4A574]/30 shadow-xl text-center">
                <div className="h-20 w-20 mx-auto rounded-full bg-[#D4A574] flex items-center justify-center mb-4 shadow-lg">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-white text-xl mb-2">Coming Soon</h3>
                <p className="text-[#E8E4DE] mb-4">
                  We're building interactive training modules to help you share your faith with confidence.
                </p>
                <Button 
                  className="bg-[#D4A574] hover:bg-[#C49464] text-white font-bold px-6"
                  onClick={() => navigate("/missions")}
                >
                  Back to Missions
                </Button>
              </div>
            </motion.div>
          )}

          {type === "followup" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-[#7C9A8E] rounded-full px-4 py-2 mb-4 shadow-lg">
                  <MessageCircle className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Follow-Up</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-white mb-3">
                  Start a Conversation
                </h1>
                <p className="text-[#E8E4DE]">
                  Tools to help you disciple others
                </p>
              </div>

              <div className="bg-[#243656] rounded-3xl p-6 border-2 border-[#7C9A8E]/40 shadow-xl text-center">
                <div className="h-20 w-20 mx-auto rounded-full bg-[#7C9A8E] flex items-center justify-center mb-4 shadow-lg">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-white text-xl mb-2">Coming Soon</h3>
                <p className="text-[#E8E4DE] mb-4">
                  We're creating tools to help you have meaningful discipleship conversations.
                </p>
                <Button 
                  className="bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white font-bold px-6"
                  onClick={() => navigate("/missions")}
                >
                  Back to Missions
                </Button>
              </div>
            </motion.div>
          )}
          
        </div>
      </main>
    </div>
  );
}
