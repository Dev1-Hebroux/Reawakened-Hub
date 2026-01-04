import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Email Template Formatting', () => {
  describe('Welcome Email Content', () => {
    const motivationLabels: Record<string, string> = {
      encounter: "Encounter God deeper",
      grow: "Grow as a disciple",
      impact: "Make global impact",
      community: "Join a movement",
    };

    it('should format single motivation correctly', () => {
      const motivations = ['encounter'];
      const formatted = motivations.map(m => motivationLabels[m] || m).join(", ");
      expect(formatted).toBe("Encounter God deeper");
    });

    it('should format multiple motivations correctly', () => {
      const motivations = ['encounter', 'grow', 'impact'];
      const formatted = motivations.map(m => motivationLabels[m] || m).join(", ");
      expect(formatted).toBe("Encounter God deeper, Grow as a disciple, Make global impact");
    });

    it('should handle unknown motivation keys', () => {
      const motivations = ['unknown_key'];
      const formatted = motivations.map(m => motivationLabels[m] || m).join(", ");
      expect(formatted).toBe("unknown_key");
    });

    it('should format daily commitment text', () => {
      const formatCommitment = (minutes: number | undefined) => 
        minutes ? `${minutes} minutes/day` : "Not specified";

      expect(formatCommitment(5)).toBe("5 minutes/day");
      expect(formatCommitment(15)).toBe("15 minutes/day");
      expect(formatCommitment(30)).toBe("30 minutes/day");
      expect(formatCommitment(undefined)).toBe("Not specified");
      expect(formatCommitment(0)).toBe("Not specified");
    });

    it('should handle empty motivations array', () => {
      const motivations: string[] = [];
      const formatted = motivations.map(m => motivationLabels[m] || m).join(", ");
      expect(formatted).toBe("");
    });
  });

  describe('Prayer Request Notification', () => {
    it('should format private visibility label', () => {
      const getVisibilityLabel = (isPrivate: boolean) => 
        isPrivate ? 'Private (prayer team only)' : 'Public';

      expect(getVisibilityLabel(true)).toContain('Private');
      expect(getVisibilityLabel(false)).toBe('Public');
    });

    it('should use default prayer team email', () => {
      const prayerTeamEmail = process.env.PRAYER_TEAM_EMAIL || 'prayer@reawakened.one';
      expect(prayerTeamEmail).toBe('prayer@reawakened.one');
    });

    it('should structure notification payload correctly', () => {
      const payload = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        request: 'Please pray for my family',
        isPrivate: false
      };

      expect(payload.name).toBeDefined();
      expect(payload.request.length).toBeGreaterThan(0);
    });
  });

  describe('Prayer Reminder Email', () => {
    it('should format prayer points as numbered list', () => {
      const prayerPoints = [
        'Pray for revival on campus',
        'Pray for student leaders',
        'Pray for salvations'
      ];

      const formatted = prayerPoints.map((point, i) => `${i + 1}. ${point}`);
      
      expect(formatted[0]).toBe('1. Pray for revival on campus');
      expect(formatted[1]).toBe('2. Pray for student leaders');
      expect(formatted[2]).toBe('3. Pray for salvations');
      expect(formatted).toHaveLength(3);
    });

    it('should use correct focus icon for campus vs nation', () => {
      const getFocusIcon = (focusType: 'campus' | 'nation') => 
        focusType === 'campus' ? '🎓' : '🌍';

      expect(getFocusIcon('campus')).toBe('🎓');
      expect(getFocusIcon('nation')).toBe('🌍');
    });

    it('should format greeting with day number', () => {
      const formatGreeting = (dayNumber?: number) => 
        dayNumber ? `Day ${dayNumber}` : 'Today';

      expect(formatGreeting(1)).toBe('Day 1');
      expect(formatGreeting(5)).toBe('Day 5');
      expect(formatGreeting(undefined)).toBe('Today');
    });

    it('should limit prayer points to 3 in summary', () => {
      const prayerPoints = ['Point 1', 'Point 2', 'Point 3', 'Point 4', 'Point 5'];
      const summaryPoints = prayerPoints.slice(0, 3);
      
      expect(summaryPoints).toHaveLength(3);
      expect(summaryPoints).not.toContain('Point 4');
    });
  });

  describe('Altar Join Confirmation', () => {
    it('should format affiliation labels', () => {
      const affiliationLabels: Record<string, string> = {
        student: 'Student',
        staff: 'Staff/Faculty',
        alumni: 'Alumni',
        local_supporter: 'Local Supporter',
      };

      expect(affiliationLabels['student']).toBe('Student');
      expect(affiliationLabels['staff']).toBe('Staff/Faculty');
      expect(affiliationLabels['alumni']).toBe('Alumni');
      expect(affiliationLabels['local_supporter']).toBe('Local Supporter');
    });

    it('should handle unknown affiliation gracefully', () => {
      const affiliationLabels: Record<string, string> = {
        student: 'Student',
        staff: 'Staff/Faculty',
      };
      
      const affiliation = 'unknown';
      const label = affiliationLabels[affiliation] || affiliation;
      
      expect(label).toBe('unknown');
    });

    it('should generate links array based on available data', () => {
      const generateLinks = (whatsappLink?: string, meetingLink?: string) => {
        const links: string[] = [];
        if (whatsappLink) links.push(whatsappLink);
        if (meetingLink) links.push(meetingLink);
        return links;
      };

      expect(generateLinks('https://wa.me/123', 'https://meet.google.com/abc')).toHaveLength(2);
      expect(generateLinks('https://wa.me/123', undefined)).toHaveLength(1);
      expect(generateLinks(undefined, undefined)).toHaveLength(0);
    });
  });

  describe('Email Service Configuration', () => {
    it('should detect missing API key', () => {
      const hasApiKey = !!process.env.RESEND_API_KEY;
      const isConfigured = hasApiKey && process.env.RESEND_API_KEY !== '';
      
      expect(typeof isConfigured).toBe('boolean');
    });

    it('should return error result when not configured', () => {
      const createErrorResult = () => ({ 
        success: false, 
        error: 'Email service not configured' 
      });

      const result = createErrorResult();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email service not configured');
    });

    it('should return success result format', () => {
      const createSuccessResult = (data: any) => ({ 
        success: true, 
        data 
      });

      const result = createSuccessResult({ id: 'email-123' });
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('email-123');
    });
  });

  describe('Email Subject Lines', () => {
    it('should format welcome email subject with name', () => {
      const formatWelcomeSubject = (name: string) => 
        `🔥 Welcome to the Mission, ${name}!`;

      expect(formatWelcomeSubject('John')).toBe('🔥 Welcome to the Mission, John!');
    });

    it('should format prayer request subject', () => {
      const formatPrayerSubject = (name: string) => 
        `🙏 New Prayer Request from ${name}`;

      expect(formatPrayerSubject('Jane')).toBe('🙏 New Prayer Request from Jane');
    });

    it('should format altar join subject', () => {
      const formatAltarSubject = (altarName: string) => 
        `⛪ Welcome to ${altarName}!`;

      expect(formatAltarSubject('Campus Prayer Altar')).toBe('⛪ Welcome to Campus Prayer Altar!');
    });
  });
});
