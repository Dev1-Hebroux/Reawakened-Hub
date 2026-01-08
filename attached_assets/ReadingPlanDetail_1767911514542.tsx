/**
 * Reading Plan Detail Component - Fixed Version
 * 
 * Fixes applied:
 * 1. [MEDIUM] Progressive reveal counter persists on re-entry
 * 2. [MEDIUM] Day unlock logic allows skipping
 * 3. [MEDIUM] No idempotency on day completion
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Lock, 
  BookOpen,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useApiMutation } from '@/lib/mutations';
import { apiRequest } from '@/lib/queryClient';
import { colors } from '@/lib/theme';

interface ReadingPlanDay {
  id: number;
  dayNumber: number;
  title: string;
  scriptureReference: string;
  content: string;
  reflectionPrompt?: string;
}

interface ReadingPlan {
  id: number;
  title: string;
  description: string;
  totalDays: number;
  category: string;
  imageUrl?: string;
  days: ReadingPlanDay[];
}

interface UserProgress {
  completedDays: number[];
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt: string | null;
}

export default function ReadingPlanDetail() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [revealedParagraphs, setRevealedParagraphs] = useState(1);
  
  // Fetch plan data
  const { data: plan, isLoading: planLoading } = useQuery<ReadingPlan>({
    queryKey: ['/api/reading-plans', planId],
    queryFn: () => apiRequest('GET', `/api/reading-plans/${planId}`),
    enabled: !!planId,
  });
  
  // Fetch user progress
  const { data: progress, isLoading: progressLoading } = useQuery<UserProgress>({
    queryKey: ['/api/user-reading-progress', planId],
    queryFn: () => apiRequest('GET', `/api/user-reading-progress/${planId}`),
    enabled: !!planId,
  });
  
  // Memoized set for O(1) completion checks
  const completedDaysSet = useMemo(() => {
    return new Set(progress?.completedDays || []);
  }, [progress?.completedDays]);
  
  // Get current day's data
  const currentDayData = useMemo(() => {
    if (!plan || selectedDay === null) return null;
    return plan.days.find(d => d.dayNumber === selectedDay);
  }, [plan, selectedDay]);
  
  // Check if current day is completed
  const isDayCompleted = selectedDay !== null && completedDaysSet.has(selectedDay);
  
  /**
   * FIX: Reset revealed paragraphs when selecting a new day.
   * Also handles the case where day is already completed (show all).
   */
  useEffect(() => {
    if (selectedDay !== null) {
      // If day is already completed, show all content
      // Otherwise start with 1 paragraph revealed
      setRevealedParagraphs(isDayCompleted ? Infinity : 1);
    }
  }, [selectedDay, isDayCompleted]);
  
  /**
   * FIX: Strict sequential day unlock logic.
   * Day is unlocked if:
   * - It's day 1 (always unlocked)
   * - It's already completed
   * - The previous day (dayNumber - 1) is completed
   */
  const isDayUnlocked = (dayNumber: number): boolean => {
    // Day 1 is always unlocked
    if (dayNumber === 1) return true;
    
    // Already completed days are unlocked
    if (completedDaysSet.has(dayNumber)) return true;
    
    // Check if previous day is completed
    return completedDaysSet.has(dayNumber - 1);
  };
  
  // Get the next available day to work on
  const nextAvailableDay = useMemo(() => {
    if (!plan) return 1;
    
    // Find first uncompleted day that is unlocked
    for (let day = 1; day <= plan.totalDays; day++) {
      if (!completedDaysSet.has(day) && isDayUnlocked(day)) {
        return day;
      }
    }
    
    // All days completed
    return null;
  }, [plan, completedDaysSet]);
  
  /**
   * FIX: Idempotent day completion mutation.
   * Uses upsert pattern server-side and disables button during mutation.
   */
  const completeDayMutation = useApiMutation(
    async (dayNumber: number) => {
      return apiRequest('POST', `/api/user-reading-progress/${planId}/complete`, {
        dayNumber,
        // Include idempotency key based on plan + day + date
        idempotencyKey: `${planId}-${dayNumber}-${new Date().toISOString().split('T')[0]}`,
      });
    },
    {
      successMessage: 'Day completed! 🎉',
      invalidateKeys: [['/api/user-reading-progress', planId!]],
      onSuccess: () => {
        // Move to next day if available
        if (selectedDay !== null && selectedDay < (plan?.totalDays || 0)) {
          setSelectedDay(selectedDay + 1);
        }
      },
    }
  );
  
  // Parse content into paragraphs for progressive reveal
  const paragraphs = useMemo(() => {
    if (!currentDayData?.content) return [];
    return currentDayData.content.split('\n\n').filter(p => p.trim());
  }, [currentDayData?.content]);
  
  const handleRevealMore = () => {
    if (revealedParagraphs < paragraphs.length) {
      setRevealedParagraphs(prev => prev + 1);
    }
  };
  
  const handleCompleteDay = () => {
    if (selectedDay !== null && !completeDayMutation.isPending) {
      completeDayMutation.mutate(selectedDay);
    }
  };
  
  const handleDaySelect = (dayNumber: number) => {
    if (isDayUnlocked(dayNumber)) {
      setSelectedDay(dayNumber);
    }
  };
  
  // Calculate progress percentage
  const progressPercent = plan 
    ? Math.round((completedDaysSet.size / plan.totalDays) * 100) 
    : 0;
  
  if (planLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600" />
      </div>
    );
  }
  
  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Reading plan not found.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/reading-plans')}
        >
          Back to Reading Plans
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="mb-4 -ml-2"
          onClick={() => navigate('/reading-plans')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Plans
        </Button>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {plan.title}
        </h1>
        
        <p className="text-muted-foreground mb-4">
          {plan.description}
        </p>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completedDaysSet.size} of {plan.totalDays} days completed
            </span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        
        {/* Streak display */}
        {progress && progress.currentStreak > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">
              {progress.currentStreak} day streak!
            </span>
          </div>
        )}
      </div>
      
      {/* Day selector */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Select a Day</h2>
        <div className="grid grid-cols-7 gap-2">
          {plan.days.map((day) => {
            const isCompleted = completedDaysSet.has(day.dayNumber);
            const isUnlocked = isDayUnlocked(day.dayNumber);
            const isSelected = selectedDay === day.dayNumber;
            
            return (
              <button
                key={day.id}
                onClick={() => handleDaySelect(day.dayNumber)}
                disabled={!isUnlocked}
                className={`
                  relative aspect-square rounded-lg flex items-center justify-center
                  text-sm font-medium transition-all
                  ${isSelected 
                    ? 'bg-sage-600 text-white ring-2 ring-sage-600 ring-offset-2' 
                    : isCompleted 
                      ? 'bg-sage-100 text-sage-700' 
                      : isUnlocked 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }
                `}
                aria-label={`Day ${day.dayNumber}${isCompleted ? ' (completed)' : ''}${!isUnlocked ? ' (locked)' : ''}`}
              >
                {!isUnlocked ? (
                  <Lock className="h-4 w-4" />
                ) : isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  day.dayNumber
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Day content */}
      <AnimatePresence mode="wait">
        {currentDayData && (
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="h-5 w-5 text-sage-600" />
                  <div>
                    <h3 className="font-semibold">Day {currentDayData.dayNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentDayData.scriptureReference}
                    </p>
                  </div>
                </div>
                
                <h4 className="text-xl font-semibold mb-4">
                  {currentDayData.title}
                </h4>
                
                {/* Progressive content reveal */}
                <div className="prose prose-sm max-w-none mb-6">
                  {paragraphs.slice(0, revealedParagraphs).map((paragraph, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="mb-4"
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>
                
                {/* Reveal more button */}
                {revealedParagraphs < paragraphs.length && (
                  <Button
                    variant="outline"
                    onClick={handleRevealMore}
                    className="w-full mb-4"
                  >
                    Continue Reading
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                
                {/* Reflection prompt */}
                {revealedParagraphs >= paragraphs.length && currentDayData.reflectionPrompt && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-sage-50 rounded-lg p-4 mb-6"
                  >
                    <h5 className="font-medium text-sage-800 mb-2">
                      Reflection
                    </h5>
                    <p className="text-sage-700 text-sm">
                      {currentDayData.reflectionPrompt}
                    </p>
                  </motion.div>
                )}
                
                {/* Complete day button */}
                {revealedParagraphs >= paragraphs.length && !isDayCompleted && (
                  <Button
                    onClick={handleCompleteDay}
                    disabled={completeDayMutation.isPending}
                    className="w-full"
                    style={{ backgroundColor: colors.sage }}
                  >
                    {completeDayMutation.isPending ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Mark Day Complete
                      </>
                    )}
                  </Button>
                )}
                
                {isDayCompleted && (
                  <div className="flex items-center justify-center gap-2 text-sage-600 py-2">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Day Completed</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Prompt to select day if none selected */}
      {!selectedDay && nextAvailableDay && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Ready to continue?
            </h3>
            <p className="text-muted-foreground mb-4">
              Pick up where you left off with Day {nextAvailableDay}
            </p>
            <Button onClick={() => setSelectedDay(nextAvailableDay)}>
              Start Day {nextAvailableDay}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
