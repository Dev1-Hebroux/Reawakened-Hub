import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Sparks API Logic', () => {
  describe('Daily Date Filtering', () => {
    it('should format today date correctly for London timezone', () => {
      const londonDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
      expect(londonDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should match spark with correct daily_date', () => {
      const sparks = [
        { id: 1, dailyDate: '2026-01-04', title: 'Today Spark' },
        { id: 2, dailyDate: '2026-01-05', title: 'Tomorrow Spark' },
      ];
      const today = '2026-01-04';
      
      const todaySpark = sparks.find(s => s.dailyDate === today);
      expect(todaySpark?.title).toBe('Today Spark');
    });
  });

  describe('Audience Segment Filtering', () => {
    it('should return segment-specific spark when available', () => {
      const sparks = [
        { id: 1, dailyDate: '2026-01-04', audienceSegment: null, title: 'Global Spark' },
        { id: 2, dailyDate: '2026-01-04', audienceSegment: 'schools', title: 'Schools Spark' },
        { id: 3, dailyDate: '2026-01-04', audienceSegment: 'universities', title: 'Uni Spark' },
      ];
      const segment = 'schools';
      const today = '2026-01-04';
      
      const todaySparks = sparks.filter(s => s.dailyDate === today);
      const segmentSpark = todaySparks.find(s => s.audienceSegment === segment);
      const globalSpark = todaySparks.find(s => s.audienceSegment === null);
      
      const result = segmentSpark || globalSpark;
      expect(result?.title).toBe('Schools Spark');
    });

    it('should fallback to global spark when no segment match', () => {
      const sparks = [
        { id: 1, dailyDate: '2026-01-04', audienceSegment: null, title: 'Global Spark' },
        { id: 2, dailyDate: '2026-01-04', audienceSegment: 'schools', title: 'Schools Spark' },
      ];
      const segment = 'couples';
      const today = '2026-01-04';
      
      const todaySparks = sparks.filter(s => s.dailyDate === today);
      const segmentSpark = todaySparks.find(s => s.audienceSegment === segment);
      const globalSpark = todaySparks.find(s => s.audienceSegment === null);
      
      const result = segmentSpark || globalSpark;
      expect(result?.title).toBe('Global Spark');
    });
  });

  describe('Week Theme Handling', () => {
    const weekThemes = [
      'Week 1: Identity & Belonging',
      'Week 2: Prayer & Presence',
      'Week 3: Peace & Anxiety',
      'Week 4: Bold Witness',
      'Week 5: Commission',
    ];

    it('should have valid week theme format', () => {
      weekThemes.forEach(theme => {
        expect(theme).toMatch(/^Week \d: .+$/);
      });
    });
  });
});

describe('Audio Pre-generation Logic', () => {
  it('should calculate tomorrow date correctly', () => {
    const today = new Date('2026-01-04T12:00:00Z');
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    expect(tomorrowStr).toBe('2026-01-05');
  });

  it('should generate correct audio filename', () => {
    const sparkId = 25;
    const title = "Seated, Not Shaken";
    const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const filename = `spark-${sparkId}-${sanitizedTitle}.mp3`;
    
    expect(filename).toBe('spark-25-seated-not-shaken.mp3');
  });

  it('should handle titles with special characters', () => {
    const title = "God's Love: A Journey (Part 1)";
    const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    expect(sanitizedTitle).toBe('god-s-love-a-journey-part-1');
  });
});

describe('Streak Calculation', () => {
  it('should count consecutive days with actions', () => {
    const actionDates = ['2026-01-04', '2026-01-03', '2026-01-02'];
    const today = '2026-01-04';
    
    let streak = 0;
    const dateCheck = new Date(today);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = dateCheck.toISOString().split('T')[0];
      if (actionDates.includes(checkDate)) {
        streak++;
        dateCheck.setDate(dateCheck.getDate() - 1);
      } else {
        break;
      }
    }
    
    expect(streak).toBe(3);
  });

  it('should break streak on missing day', () => {
    const actionDates = ['2026-01-04', '2026-01-02'];
    const today = '2026-01-04';
    
    let streak = 0;
    const dateCheck = new Date(today);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = dateCheck.toISOString().split('T')[0];
      if (actionDates.includes(checkDate)) {
        streak++;
        dateCheck.setDate(dateCheck.getDate() - 1);
      } else {
        break;
      }
    }
    
    expect(streak).toBe(1);
  });
});
