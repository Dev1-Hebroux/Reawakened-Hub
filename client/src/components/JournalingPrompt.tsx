import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Save, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface JournalingPromptProps {
  prompt: string;
  reflectionId?: number;
}

export function JournalingPrompt({ prompt, reflectionId }: JournalingPromptProps) {
  const { isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [journalEntry, setJournalEntry] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!journalEntry.trim()) return;
    
    setIsSaving(true);
    
    const key = `journal_${reflectionId || 'general'}_${new Date().toISOString().split('T')[0]}`;
    localStorage.setItem(key, journalEntry);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsSaving(false);
    setIsSaved(true);
    toast.success("Journal entry saved");
    
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'rgba(212, 165, 116, 0.08)', borderColor: 'rgba(212, 165, 116, 0.2)' }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
        data-testid="button-journal-toggle"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 165, 116, 0.15)' }}>
            <PenLine className="h-5 w-5" style={{ color: '#D4A574' }} />
          </div>
          <div>
            <h4 className="font-bold text-white">Journal Your Thoughts</h4>
            <p className="text-sm text-white/60">Take a moment to reflect deeper</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-white/40" />
        ) : (
          <ChevronDown className="h-5 w-5 text-white/40" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(250, 248, 245, 0.05)' }}>
                <p className="text-sm text-white/70 italic">"{prompt}"</p>
              </div>

              {isAuthenticated ? (
                <>
                  <Textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    placeholder="Write your thoughts here... This is private and stored locally on your device."
                    className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                    data-testid="input-journal-entry"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/40">
                      {journalEntry.length > 0 ? `${journalEntry.split(' ').filter(w => w).length} words` : 'Start writing...'}
                    </p>
                    <Button
                      onClick={handleSave}
                      disabled={!journalEntry.trim() || isSaving}
                      className="bg-gradient-to-r from-[#D4A574] to-[#B8956A] hover:from-[#C49564] hover:to-[#A8855A] text-white"
                      data-testid="button-save-journal"
                    >
                      {isSaving ? (
                        <span className="flex items-center gap-2">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <Save className="h-4 w-4" />
                          </motion.div>
                          Saving...
                        </span>
                      ) : isSaved ? (
                        <span className="flex items-center gap-2">
                          <Check className="h-4 w-4" /> Saved
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Save className="h-4 w-4" /> Save Entry
                        </span>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-white/60 text-sm mb-3">Sign in to save your journal entries</p>
                  <a href="/api/login" className="text-[#D4A574] hover:underline text-sm font-medium">
                    Sign In
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
