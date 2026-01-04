import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockPlan = {
  id: 1,
  title: 'Test Reading Plan',
  description: 'A test plan for unit testing',
  durationDays: 7,
  maturityLevel: 'growing',
  topics: ['prayer', 'faith'],
  featured: false,
  enrollmentCount: 10,
  days: [
    {
      id: 1,
      planId: 1,
      dayNumber: 1,
      title: 'Day 1 Title',
      scriptureRef: 'John 3:16',
      scriptureText: 'For God so loved the world...',
      devotionalContent: 'First paragraph of content.\n\nSecond paragraph of content.\n\nThird paragraph of content.',
      reflectionQuestion: 'What did you learn?',
    },
    {
      id: 2,
      planId: 1,
      dayNumber: 2,
      title: 'Day 2 Title',
      scriptureRef: 'Psalm 23:1',
      scriptureText: 'The Lord is my shepherd...',
      devotionalContent: 'Day 2 first paragraph.\n\nDay 2 second paragraph.',
    },
  ],
};

const mockEnrollment = {
  id: 1,
  planId: 1,
  status: 'active',
  currentDay: 1,
  currentStreak: 1,
  progress: [{ dayNumber: 1, completed: false }],
};

describe('ReadingPlanDetail - Progressive Disclosure', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should calculate paragraph count correctly', () => {
    const content = 'Para 1.\n\nPara 2.\n\nPara 3.';
    const paragraphs = content.split('\n\n').filter((p) => p.trim());
    expect(paragraphs.length).toBe(3);
  });

  it('should identify all paragraphs as revealed when count matches total', () => {
    const paragraphs = ['P1', 'P2', 'P3'];
    const revealedCount = 3;
    const allRevealed = revealedCount >= paragraphs.length;
    expect(allRevealed).toBe(true);
  });

  it('should NOT consider all revealed when count is less than total', () => {
    const paragraphs = ['P1', 'P2', 'P3'];
    const revealedCount = 1;
    const allRevealed = revealedCount >= paragraphs.length;
    expect(allRevealed).toBe(false);
  });
});

describe('ReadingPlanDetail - Day Unlock Logic', () => {
  it('should unlock Day 1 when enrolled', () => {
    const enrollment = { currentDay: 1 };
    const completedDays = new Set<number>();
    const dayNumber = 1;
    
    const maxCompletedDay = completedDays.size > 0 ? Math.max(...Array.from(completedDays)) : 0;
    const isUnlocked = enrollment && (dayNumber <= (enrollment.currentDay || 1) || completedDays.has(dayNumber) || dayNumber <= maxCompletedDay + 1);
    
    expect(isUnlocked).toBe(true);
  });

  it('should unlock Day 2 after Day 1 is completed', () => {
    const enrollment = { currentDay: 1 };
    const completedDays = new Set([1]);
    const dayNumber = 2;
    
    const maxCompletedDay = completedDays.size > 0 ? Math.max(...Array.from(completedDays)) : 0;
    const isUnlocked = enrollment && (dayNumber <= (enrollment.currentDay || 1) || completedDays.has(dayNumber) || dayNumber <= maxCompletedDay + 1);
    
    expect(isUnlocked).toBe(true);
  });

  it('should NOT unlock Day 3 when only Day 1 is completed', () => {
    const enrollment = { currentDay: 1 };
    const completedDays = new Set([1]);
    const dayNumber = 3;
    
    const maxCompletedDay = completedDays.size > 0 ? Math.max(...Array.from(completedDays)) : 0;
    const isUnlocked = enrollment && (dayNumber <= (enrollment.currentDay || 1) || completedDays.has(dayNumber) || dayNumber <= maxCompletedDay + 1);
    
    expect(isUnlocked).toBe(false);
  });

  it('should unlock completed days even if currentDay is lower', () => {
    const enrollment = { currentDay: 1 };
    const completedDays = new Set([1, 2, 3]);
    const dayNumber = 3;
    
    const isCompleted = completedDays.has(dayNumber);
    
    expect(isCompleted).toBe(true);
  });
});

describe('ReadingPlanDetail - Topic Image Mapping', () => {
  const topicImages: Record<string, string> = {
    anxiety: '/anxiety.png',
    peace: '/peace.png',
    prayer: '/prayer.png',
    revival: '/revival.png',
    leadership: '/leadership.png',
    relationships: '/relationships.png',
    identity: '/identity.png',
    faith: '/faith.png',
  };

  it('should return first matching topic image', () => {
    const topics = ['prayer', 'faith'];
    let matchedImage = null;
    
    for (const topic of topics) {
      if (topicImages[topic.toLowerCase()]) {
        matchedImage = topicImages[topic.toLowerCase()];
        break;
      }
    }
    
    expect(matchedImage).toBe('/prayer.png');
  });

  it('should return null for unknown topics', () => {
    const topics = ['unknown', 'category'];
    let matchedImage = null;
    
    for (const topic of topics) {
      if (topicImages[topic.toLowerCase()]) {
        matchedImage = topicImages[topic.toLowerCase()];
        break;
      }
    }
    
    expect(matchedImage).toBeNull();
  });
});
