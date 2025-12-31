import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen, Flame, Heart, Sparkles, ChevronLeft,
  PenLine, Share2, CheckCircle2, Sun, Moon, Calendar,
  TrendingUp, MessageCircle, Loader2
} from "lucide-react";
import { AICoachPanel } from "@/components/AICoachPanel";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const REACTIONS = [
  { key: "amen", label: "Amen", icon: "🙏" },
  { key: "thankful", label: "Thankful", icon: "💛" },
  { key: "inspired", label: "Inspired", icon: "✨" },
  { key: "challenged", label: "Challenged", icon: "💪" },
];

const FALLBACK_REFLECTIONS = [
  {
    id: 0,
    title: "Finding Rest in His Presence",
    content: "In our busy lives, we often forget that God invites us to rest in Him. Today, take a moment to breathe deeply and acknowledge that He is with you, guiding your steps and carrying your burdens.",
    scripture: "Matthew 11:28",
    scriptureText: "Come to me, all you who are weary and burdened, and I will give you rest.",
    category: "faith",
  },
  {
    id: 0,
    title: "Growing Through Challenges",
    content: "Every challenge you face is an opportunity for growth. The obstacles in your path are not roadblocks but stepping stones to becoming the person God created you to be.",
    scripture: "James 1:2-4",
    scriptureText: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.",
    category: "growth",
  },
  {
    id: 0,
    title: "The Power of Small Steps",
    content: "You don't have to change everything at once. Today, focus on one small step in the right direction. Consistency in small things leads to transformation over time.",
    scripture: "Zechariah 4:10",
    scriptureText: "Do not despise these small beginnings, for the Lord rejoices to see the work begin.",
    category: "purpose",
  },
];

export function DailyReflection() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showJournal, setShowJournal] = useState(false);
  const [journalEntry, setJournalEntry] = useState("");
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: reflectionData, isLoading } = useQuery({
    queryKey: ["/api/reflection/today"],
    queryFn: async () => {
      const res = await fetch("/api/reflection/today", { credentials: "include" });
      if (!res.ok) {
        const dayIndex = new Date().getDay() % FALLBACK_REFLECTIONS.length;
        return { ok: true, data: FALLBACK_REFLECTIONS[dayIndex] };
      }
      return res.json();
    },
  });

  const { data: logData } = useQuery({
    queryKey: ["/api/reflection/log", reflectionData?.data?.id],
    queryFn: async () => {
      if (!reflectionData?.data?.id || !user) return null;
      const res = await fetch(`/api/reflection/${reflectionData.data.id}/log`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!reflectionData?.data?.id && !!user,
  });

  const { data: streakData } = useQuery({
    queryKey: ["/api/reflection/streak"],
    queryFn: async () => {
      if (!user) return { data: { streak: 0 } };
      const res = await fetch("/api/reflection/streak", { credentials: "include" });
      if (!res.ok) return { data: { streak: 0 } };
      return res.json();
    },
    enabled: !!user,
  });

  const logView = useMutation({
    mutationFn: async (reflectionId: number) => {
      if (!user || reflectionId === 0) return;
      await fetch(`/api/reflection/${reflectionId}/view`, {
        method: "POST",
        credentials: "include",
      });
    },
  });

  const logEngagement = useMutation({
    mutationFn: async ({ reflectionId, journalEntry, reaction }: { reflectionId: number; journalEntry?: string; reaction?: string }) => {
      if (!user || reflectionId === 0) return;
      const res = await fetch(`/api/reflection/${reflectionId}/engage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ journalEntry, reaction }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reflection/log"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reflection/streak"] });
    },
  });

  useEffect(() => {
    if (reflectionData?.data?.id && user) {
      logView.mutate(reflectionData.data.id);
    }
  }, [reflectionData?.data?.id, user]);

  useEffect(() => {
    if (logData?.data) {
      setSelectedReaction(logData.data.reaction);
      setJournalEntry(logData.data.journalEntry || "");
    }
  }, [logData]);

  const reflection = reflectionData?.data;
  const streak = streakData?.data?.streak || 0;

  const handleReaction = (reaction: string) => {
    setSelectedReaction(reaction);
    if (reflection?.id) {
      logEngagement.mutate({ reflectionId: reflection.id, reaction });
    }
  };

  const handleSaveJournal = async () => {
    if (reflection?.id && journalEntry.trim()) {
      logEngagement.mutate({ reflectionId: reflection.id, journalEntry });
      setShowJournal(false);
      
      // Fetch AI coaching insight based on the journal entry
      setIsLoadingInsight(true);
      try {
        const res = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            tool: "reflection",
            data: {
              reflectionTitle: reflection.title,
              reflectionContent: reflection.content,
              scripture: reflection.scripture,
              scriptureText: reflection.scriptureText,
              journalEntry: journalEntry,
              reaction: selectedReaction,
            },
            prompt: "Based on this person's reflection and journal entry, provide a brief, warm, and encouraging coaching insight (2-3 sentences). Help them see patterns, growth opportunities, or affirm their journey. Be conversational and personal."
          }),
        });
        if (res.ok) {
          const result = await res.json();
          // API returns { ok, data: AIResponse }
          const insight = result.data?.encouragement || result.data?.insights?.[0] || result.data?.suggestions?.[0];
          if (insight) {
            setAiInsight(insight);
          }
        }
      } catch (error) {
        console.error("Failed to get AI insight:", error);
      } finally {
        setIsLoadingInsight(false);
      }
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: "Good morning", icon: Sun };
    if (hour < 18) return { greeting: "Good afternoon", icon: Sun };
    return { greeting: "Good evening", icon: Moon };
  };

  const { greeting, icon: TimeIcon } = getTimeOfDay();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7C9A8E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-24 md:pb-12">
        {/* Sub-header with date */}
        <div className="sticky top-16 z-10 bg-[#FAF8F5] border-b border-[#E8E4DE] px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 text-[#6B7B6E] hover:text-[#2C3E2D] transition-colors"
              data-testid="button-back"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[#7C9A8E]" />
              <span className="text-[#6B7B6E]">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-[#6B7B6E] mb-2">
              <TimeIcon className="w-5 h-5 text-[#D4A574]" />
              <span className="text-sm">{greeting}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#2C3E2D] mb-1">Daily Reflection</h1>
            {streak > 0 && (
              <div className="flex items-center justify-center gap-2 text-[#D4A574]">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-medium">{streak} day streak</span>
              </div>
            )}
          </div>

          {reflection && (
            <>
              <Card className="bg-white border-[#E8E4DE] overflow-hidden">
                <div className="bg-gradient-to-r from-[#7C9A8E] to-[#6B8B7E] px-5 py-4">
                  <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{reflection.scripture}</span>
                  </div>
                  <p className="text-white text-lg italic leading-relaxed">
                    "{reflection.scriptureText}"
                  </p>
                </div>
                <CardContent className="p-5">
                  <h2 className="font-bold text-xl text-[#2C3E2D] mb-3">{reflection.title}</h2>
                  <p className="text-[#6B7B6E] leading-relaxed">{reflection.content}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#D4A574]/10 to-[#7C9A8E]/10 border-none">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-[#2C3E2D] mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#D4A574]" />
                    How does this speak to you?
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {REACTIONS.map((r) => (
                      <button
                        key={r.key}
                        onClick={() => handleReaction(r.key)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all touch-manipulation ${
                          selectedReaction === r.key
                            ? "bg-[#7C9A8E] text-white"
                            : "bg-white hover:bg-[#7C9A8E]/10"
                        }`}
                        data-testid={`reaction-${r.key}`}
                      >
                        <span className="text-2xl">{r.icon}</span>
                        <span className="text-xs font-medium">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <AnimatePresence>
                {!showJournal ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Button
                      onClick={() => setShowJournal(true)}
                      variant="outline"
                      className="w-full border-[#E8E4DE] hover:bg-[#7C9A8E]/10 text-[#2C3E2D] py-4 rounded-xl"
                      data-testid="button-journal"
                    >
                      <PenLine className="w-5 h-5 mr-2 text-[#7C9A8E]" />
                      Write a personal reflection
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Card className="bg-white border-[#E8E4DE]">
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-[#2C3E2D] mb-3 flex items-center gap-2">
                          <PenLine className="w-4 h-4 text-[#7C9A8E]" />
                          Personal Reflection
                        </h3>
                        <Textarea
                          value={journalEntry}
                          onChange={(e) => setJournalEntry(e.target.value)}
                          placeholder="What thoughts or prayers come to mind? How can you apply this today?"
                          className="min-h-[120px] border-[#E8E4DE] mb-3 resize-none"
                          data-testid="textarea-journal"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowJournal(false)}
                            variant="outline"
                            className="flex-1 border-[#E8E4DE]"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveJournal}
                            disabled={!journalEntry.trim()}
                            className="flex-1 bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white"
                            data-testid="button-save-journal"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {logData?.data?.journalEntry && !showJournal && (
                <Card className="bg-[#7C9A8E]/5 border-[#7C9A8E]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-[#7C9A8E] text-sm mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium">Your reflection</span>
                    </div>
                    <p className="text-[#6B7B6E] text-sm italic">"{logData.data.journalEntry}"</p>
                  </CardContent>
                </Card>
              )}

              {/* AI Coaching Insight */}
              <AnimatePresence>
                {isLoadingInsight && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="bg-gradient-to-br from-[#4A7C7C]/10 to-[#7C9A8E]/10 border-[#4A7C7C]/20">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-[#4A7C7C] animate-spin" />
                        <span className="text-sm text-[#4A7C7C]">Getting your personalized coaching insight...</span>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {aiInsight && !isLoadingInsight && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="bg-gradient-to-br from-[#4A7C7C]/10 to-[#7C9A8E]/10 border-[#4A7C7C]/20">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-[#4A7C7C]">
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-medium text-sm">AI Coach Insight</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{aiInsight}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {!user && (
            <Card className="bg-[#D4A574]/10 border-[#D4A574]/20">
              <CardContent className="p-5 text-center">
                <Sparkles className="w-8 h-8 text-[#D4A574] mx-auto mb-2" />
                <h3 className="font-semibold text-[#2C3E2D] mb-2">Track Your Journey</h3>
                <p className="text-sm text-[#6B7B6E] mb-4">
                  Sign in to save your reflections, build a streak, and see your growth over time.
                </p>
                <Button
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-[#D4A574] hover:bg-[#C49464] text-white"
                  data-testid="button-signin"
                >
                  Sign In to Continue
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="text-center pt-4">
            <Button
              onClick={() => navigate("/growth")}
              variant="ghost"
              className="text-[#7C9A8E] hover:text-[#2C3E2D]"
              data-testid="button-growth"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Explore Growth Tools
            </Button>
          </div>
        </motion.div>
        </div>

        <AICoachPanel
          tool="reflection"
          data={{
            reflectionTitle: reflection?.title,
            scripture: reflection?.scripture,
            journalEntry: journalEntry,
            reaction: selectedReaction,
            streak: streak,
          }}
        />
      </main>
      <Footer />
    </div>
  );
}