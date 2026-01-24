/**
 * ReflectionGrowthSection Component
 *
 * Reflection and Growth tabs section with:
 * - Daily reflection card
 * - Growth tools links
 * - Journaling prompt
 * - Daily quiz
 * - Live intercession button
 */

import { motion, AnimatePresence } from "framer-motion";
import { Users, MessageCircle, ArrowRight, BookOpen, Compass, Target, TrendingUp } from "lucide-react";
import type { ReflectionCard, PrayerSession } from "@shared/schema";
import { JournalingPrompt } from "@/components/JournalingPrompt";
import { DailyQuiz } from "@/components/DailyQuiz";

interface ReflectionGrowthSectionProps {
  todayReflection: ReflectionCard | null;
  activeSessions: PrayerSession[];
  reflectionTab: 'reflection' | 'growth';
  viewMode: 'reflection' | 'faith';
  onTabChange: (tab: 'reflection' | 'growth') => void;
  onIntercessionClick: () => void;
}

export function ReflectionGrowthSection({
  todayReflection,
  activeSessions,
  reflectionTab,
  viewMode,
  onTabChange,
  onIntercessionClick,
}: ReflectionGrowthSectionProps) {
  if (!todayReflection) return null;

  const hasActiveSessions = activeSessions.length > 0;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Header with Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
              <button
                onClick={() => onTabChange('reflection')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  reflectionTab === 'reflection'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
                data-testid="tab-reflection"
              >
                Daily Reflection
              </button>
              <button
                onClick={() => onTabChange('growth')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  reflectionTab === 'growth'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
                data-testid="tab-growth"
              >
                Continue Your Growth
              </button>
            </div>
          </div>
          <button
            onClick={onIntercessionClick}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              hasActiveSessions ? 'animate-pulse shadow-lg shadow-teal-500/30' : ''
            }`}
            style={{
              backgroundColor: hasActiveSessions ? 'rgba(74, 124, 124, 0.4)' : 'rgba(74, 124, 124, 0.2)',
              borderColor: hasActiveSessions ? '#4A7C7C' : 'rgba(74, 124, 124, 0.4)',
              color: hasActiveSessions ? '#fff' : '#4A7C7C'
            }}
            data-testid="button-open-intercession"
          >
            {hasActiveSessions && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
            <Users className="h-4 w-4" /> {hasActiveSessions ? `Live (${activeSessions.length})` : 'Join Prayer'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {reflectionTab === 'reflection' ? (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="rounded-2xl p-6 border backdrop-blur-xl"
              style={{ backgroundColor: 'rgba(124, 154, 142, 0.12)', borderColor: 'rgba(124, 154, 142, 0.25)' }}
            >
              <div className="max-w-3xl mx-auto space-y-4">
                {/* Quote */}
                <div className="text-center">
                  <span
                    className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full mb-3"
                    style={{ backgroundColor: 'rgba(124, 154, 142, 0.25)', color: '#9FBAB0' }}
                  >
                    {todayReflection.weekTheme || "Reflection"}
                  </span>
                  <blockquote className="text-xl md:text-2xl font-display font-bold text-white leading-relaxed" data-testid="text-reflection-quote">
                    "{todayReflection.baseQuote}"
                  </blockquote>
                </div>

                {/* Reflect & Action - Compact Grid */}
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/15">
                  <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(250, 248, 245, 0.06)' }}>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#7C9A8E' }}>
                      <MessageCircle className="h-3 w-3" /> Reflect
                    </h4>
                    <p className="text-sm text-white/90" data-testid="text-reflection-question">{todayReflection.question}</p>
                  </div>
                  <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(250, 248, 245, 0.06)' }}>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#D4A574' }}>
                      <ArrowRight className="h-3 w-3" /> Take Action
                    </h4>
                    <p className="text-sm text-white/90" data-testid="text-reflection-action">{todayReflection.action}</p>
                  </div>
                </div>

                {viewMode === 'faith' && todayReflection.faithOverlayScripture && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/20 rounded-xl p-4 border border-primary/30 text-center"
                  >
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center justify-center gap-2">
                      <BookOpen className="h-3 w-3" /> Scripture
                    </h4>
                    <p className="text-sm text-white font-medium" data-testid="text-reflection-scripture">{todayReflection.faithOverlayScripture}</p>
                  </motion.div>
                )}

                {/* Journaling Prompt - Compact */}
                <JournalingPrompt
                  prompt={todayReflection.question || "What is one thing you're grateful for today?"}
                  reflectionId={todayReflection.id}
                />

                {/* Daily Quiz */}
                <DailyQuiz />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="growth"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="rounded-2xl p-6 border backdrop-blur-xl"
              style={{ backgroundColor: 'rgba(250, 248, 245, 0.06)', borderColor: 'rgba(250, 248, 245, 0.15)' }}
            >
              <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(124, 154, 142, 0.2)' }}>
                    <Compass className="h-5 w-5" style={{ color: '#7C9A8E' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Continue Your Growth</h3>
                    <p className="text-sm text-gray-400">Faith-based development tools</p>
                  </div>
                </div>

                {/* Growth Tools List */}
                <div className="space-y-3">
                  <a
                    href="/vision"
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                    data-testid="link-vision-pathway"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(74, 124, 124, 0.15)' }}>
                        <Compass className="h-5 w-5" style={{ color: '#4A7C7C' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Vision Pathway</h4>
                        <p className="text-sm text-gray-400">Discover your purpose</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors" />
                  </a>

                  <a
                    href="/goals"
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                    data-testid="link-goals"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 165, 116, 0.15)' }}>
                        <Target className="h-5 w-5" style={{ color: '#D4A574' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">2026 Goals</h4>
                        <p className="text-sm text-gray-400">Set & track goals</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors" />
                  </a>

                  <a
                    href="/growth-tools"
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                    data-testid="link-growth-tools"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(124, 154, 142, 0.15)' }}>
                        <TrendingUp className="h-5 w-5" style={{ color: '#7C9A8E' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Growth Tools</h4>
                        <p className="text-sm text-gray-400">Personal development</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors" />
                  </a>
                </div>

                {/* Scripture Quote */}
                <p className="text-center text-sm text-gray-500 mt-6 italic">
                  "Add to your faith goodness; and to goodness, knowledge" — 2 Peter 1:5
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
