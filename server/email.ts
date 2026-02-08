import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

if (!resend) {
  console.warn('RESEND_API_KEY not configured - email functionality will be disabled');
}

// ===== EMAIL BRANDING =====

// Reawakened logo URL (hosted publicly)
const LOGO_URL = 'https://reawakened.app/logo-email.png';

// Email header with Reawakened branding (replaces emoji icons)
// Uses table with bgcolor attribute for maximum email client compatibility
export function getEmailHeader(title: string, subtitle: string, bgColor: string = '#1a2744'): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
      <tr>
        <td bgcolor="${bgColor}" style="background-color: ${bgColor}; border-radius: 24px; padding: 40px; text-align: center;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-bottom: 20px; text-align: center;">
                <span style="font-family: 'Space Grotesk', 'Segoe UI', Arial, sans-serif; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Reawakened</span>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding-bottom: 12px;">
                <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 700; font-family: 'Segoe UI', Arial, sans-serif;">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="text-align: center;">
                <p style="color: #e0e0e0; font-size: 16px; margin: 0; font-family: 'Segoe UI', Arial, sans-serif;">${subtitle}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

// Social media links
const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/reawakened.one',
  youtube: 'https://youtube.com/@reawakenedone',
  twitter: 'https://x.com/reawakenedone',
  tiktok: 'https://tiktok.com/@reawakened.one'
};

// Email footer with social links and unsubscribe
export function getEmailFooter(email: string, scriptureQuote?: string): string {
  const unsubscribeUrl = `https://reawakened.app/preferences?email=${encodeURIComponent(email)}`;
  
  return `
    <!-- Social Media Links -->
    <div style="text-align: center; padding: 24px 0; border-top: 1px solid #E8E4DE; margin-top: 24px;">
      <p style="color: #6B7B6E; font-size: 13px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Connect with us</p>
      <div style="margin-bottom: 20px;">
        <a href="${SOCIAL_LINKS.instagram}" style="display: inline-block; margin: 0 8px; text-decoration: none;" title="Instagram">
          <div style="width: 40px; height: 40px; background-color: #E1306C; background: linear-gradient(135deg, #E1306C 0%, #F77737 50%, #FCAF45 100%); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: #ffffff; font-size: 18px; line-height: 40px;">📷</span>
          </div>
        </a>
        <a href="${SOCIAL_LINKS.youtube}" style="display: inline-block; margin: 0 8px; text-decoration: none;" title="YouTube">
          <div style="width: 40px; height: 40px; background: #FF0000; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: #ffffff; font-size: 18px; line-height: 40px;">▶️</span>
          </div>
        </a>
        <a href="${SOCIAL_LINKS.twitter}" style="display: inline-block; margin: 0 8px; text-decoration: none;" title="X (Twitter)">
          <div style="width: 40px; height: 40px; background: #000000; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: #ffffff; font-size: 16px; font-weight: bold; line-height: 40px;">𝕏</span>
          </div>
        </a>
        <a href="${SOCIAL_LINKS.tiktok}" style="display: inline-block; margin: 0 8px; text-decoration: none;" title="TikTok">
          <div style="width: 40px; height: 40px; background: #000000; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: #ffffff; font-size: 18px; line-height: 40px;">♪</span>
          </div>
        </a>
      </div>
      
      ${scriptureQuote ? `
      <p style="color: #6B7B6E; font-size: 13px; margin: 0 0 16px 0; font-style: italic; line-height: 1.5; max-width: 400px; margin-left: auto; margin-right: auto;">
        "${scriptureQuote}"
      </p>
      ` : ''}
      
      <!-- Preferences & Unsubscribe -->
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #E8E4DE;">
        <a href="${unsubscribeUrl}" style="color: #6B7B6E; font-size: 12px; text-decoration: underline;">
          Update email preferences or unsubscribe
        </a>
      </div>
      
      <p style="color: #9CA3AF; font-size: 11px; margin: 12px 0 0 0;">
        © ${new Date().getFullYear()} Reawakened. All rights reserved.
      </p>
    </div>`;
}

// ===== TWO-TONE EMAIL HELPERS =====

export type ContentTone = 'seeker' | 'faith';
export type AudienceSegment = 'sixth_form' | 'university' | 'early_career' | null;

// Get segment-specific paragraph block
export function getSegmentBlock(segment: AudienceSegment, tone: ContentTone): string {
  const blocks: Record<string, Record<ContentTone, string>> = {
    sixth_form: {
      seeker: `If you're juggling exams, deadlines, and life pressure, you're not the only one. This space is here to help you reset your head, stay grounded, and move forward with confidence—one step at a time.`,
      faith: `If you're juggling exams and pressure, you're not the only one. We're believing God will strengthen you, give you clarity, and help you walk with peace and confidence—one day at a time.`
    },
    university: {
      seeker: `Uni can feel intense—new people, big decisions, and a lot happening at once. This community exists to support you with real encouragement, practical steps, and a place to belong.`,
      faith: `Uni can feel intense—new people, big decisions, and a lot happening at once. This community is here to help you stay close to Jesus, grow in faith, and find your people while you build your future.`
    },
    early_career: {
      seeker: `Early career life can be a lot—work pressure, identity, relationships, money decisions. We're here for the "real life" side of growth, not just motivation.`,
      faith: `Early career life can be a lot—work pressure, identity, relationships, and big decisions. We're here to help you grow with God, build strong habits, and live with purpose, not pressure.`
    }
  };

  if (!segment || !blocks[segment]) {
    // Default fallback for unspecified segment
    return tone === 'faith' 
      ? `We're here to help you grow in faith, find community, and live with purpose.`
      : `We're here to support you with real encouragement and practical steps forward.`;
  }

  return blocks[segment][tone];
}

// Get tone-specific content
export function getToneContent<T>(tone: ContentTone, seekerVersion: T, faithVersion: T): T {
  return tone === 'seeker' ? seekerVersion : faithVersion;
}

// Format segment label for display
export function getSegmentLabel(segment: AudienceSegment): string {
  const labels: Record<string, string> = {
    sixth_form: 'Sixth Form / College',
    university: 'University',
    early_career: 'Early Career'
  };
  return segment ? labels[segment] || 'Community Member' : 'Community Member';
}

// Get urgency display with color
export function getUrgencyDisplay(urgency: string | null | undefined): { label: string; color: string; bgColor: string } {
  const urgencyMap: Record<string, { label: string; color: string; bgColor: string }> = {
    critical: { label: '🔴 Critical', color: '#DC2626', bgColor: '#FEE2E2' },
    urgent: { label: '🟠 Urgent', color: '#EA580C', bgColor: '#FFEDD5' },
    normal: { label: '🟢 Normal', color: '#16A34A', bgColor: '#DCFCE7' }
  };
  return urgencyMap[urgency || 'normal'] || urgencyMap.normal;
}

// Get category display label
export function getCategoryLabel(category: string | null | undefined): string {
  const labels: Record<string, string> = {
    healing: 'Healing',
    provision: 'Provision',
    guidance: 'Guidance',
    relationships: 'Relationships',
    salvation: 'Salvation',
    anxiety: 'Anxiety / Peace',
    other: 'Other'
  };
  return category ? labels[category] || category : 'General';
}

export async function sendWelcomeEmail(to: string, name: string, data: {
  prayerFocus?: string;
  dailyCommitment?: number;
  motivations?: string[];
}) {
  const motivationLabels: Record<string, string> = {
    encounter: "Encounter God deeper",
    grow: "Grow as a disciple",
    impact: "Make global impact",
    community: "Join a movement",
  };

  const motivationsList = data.motivations?.map(m => motivationLabels[m] || m).join(", ") || "Not specified";
  const commitmentText = data.dailyCommitment ? `${data.dailyCommitment} minutes/day` : "Not specified";
  const prayerFocusText = data.prayerFocus || "Not specified";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Reawakened</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
      <tr>
        <td bgcolor="#1a2744" style="background-color: #1a2744; border-radius: 24px; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 32px; margin: 0 0 16px 0; font-weight: 700; font-family: 'Segoe UI', Arial, sans-serif;">
            🔥 Welcome to Reawakened, ${name}!
          </h1>
          <p style="color: #e0e0e0; font-size: 18px; margin: 0; line-height: 1.6; font-family: 'Segoe UI', Arial, sans-serif;">
            Your mission journey has begun. You're now part of a global movement making digital impact for the Kingdom.
          </p>
        </td>
      </tr>
    </table>

    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h2 style="color: #1a2744; font-size: 20px; margin: 0 0 20px 0; font-weight: 600;">
        📋 Your Mission Profile
      </h2>
      
      <div style="background: #FAF8F5; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #E8E4DE; padding-bottom: 12px;">
          <span style="color: #6B7B6E; font-size: 14px;">Prayer Focus</span>
          <span style="color: #1a2744; font-weight: 600; font-size: 14px;">${prayerFocusText}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #E8E4DE; padding-bottom: 12px;">
          <span style="color: #6B7B6E; font-size: 14px;">Daily Commitment</span>
          <span style="color: #1a2744; font-weight: 600; font-size: 14px;">${commitmentText}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6B7B6E; font-size: 14px;">Your Motivations</span>
          <span style="color: #1a2744; font-weight: 600; font-size: 14px; text-align: right; max-width: 60%;">${motivationsList}</span>
        </div>
      </div>
    </div>

    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h2 style="color: #1a2744; font-size: 20px; margin: 0 0 20px 0; font-weight: 600;">
        🚀 Get Started
      </h2>
      
      <a href="https://reawakened.app/sparks" style="display: block; background-color: #D4A574; background: linear-gradient(135deg, #D4A574 0%, #C49464 100%); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; margin-bottom: 12px; font-weight: 600;">
        ✨ Daily Sparks — Start your day with devotionals
      </a>
      
      <a href="https://reawakened.app/community" style="display: block; background-color: #7C9A8E; background: linear-gradient(135deg, #7C9A8E 0%, #6B8B7E 100%); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; margin-bottom: 12px; font-weight: 600;">
        👥 Community Hub — Connect with fellow believers
      </a>
      
      <a href="https://reawakened.app/vision" style="display: block; background-color: #4A7C7C; background: linear-gradient(135deg, #4A7C7C 0%, #3A6C6C 100%); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 600;">
        🎯 Vision Journey — Discover your purpose
      </a>
    </div>

    ${getEmailFooter(to)}
  </div>
</body>
</html>
  `;

  if (!resend) {
    console.warn('Resend not configured, skipping welcome email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <noreply@reawakened.app>',
      to: [to],
      subject: `🔥 Welcome to the Mission, ${name}!`,
      html: htmlContent,
    });

    console.log('Welcome email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

export async function sendPrayerReminderEmail(to: string, name: string, data: {
  focusName: string;
  focusType: 'nation' | 'campus';
  prayerPoints: string[];
  scriptures: string[];
  dayNumber?: number;
}) {
  const prayerPointsHtml = data.prayerPoints.map((point, i) => `
    <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
      <div style="width: 24px; height: 24px; background-color: #D4A574; background: linear-gradient(135deg, #D4A574 0%, #C49464 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <span style="color: white; font-size: 12px; font-weight: bold;">${i + 1}</span>
      </div>
      <p style="color: #1a2744; font-size: 14px; margin: 0; line-height: 1.6;">${point}</p>
    </div>
  `).join('');

  const scripturesHtml = data.scriptures.map(s => `
    <span style="display: inline-block; background: #E8F4F0; color: #4A7C7C; padding: 6px 12px; border-radius: 16px; font-size: 13px; margin: 4px 4px 4px 0; font-weight: 500;">${s}</span>
  `).join('');

  const focusIcon = data.focusType === 'campus' ? '🎓' : '🌍';
  const greeting = data.dayNumber ? `Day ${data.dayNumber}` : 'Today';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prayer Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
      <tr>
        <td bgcolor="#1a2744" style="background-color: #1a2744; border-radius: 24px; padding: 40px; text-align: center;">
          <p style="color: #b0b0b0; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px; font-family: 'Segoe UI', Arial, sans-serif;">
            ${greeting}'s Prayer Focus
          </p>
          <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 12px 0; font-weight: 700; font-family: 'Segoe UI', Arial, sans-serif;">
            ${focusIcon} ${data.focusName}
          </h1>
          <p style="color: #e0e0e0; font-size: 16px; margin: 0; line-height: 1.6; font-family: 'Segoe UI', Arial, sans-serif;">
            Hi ${name}, here are today's prayer points for your intercession.
          </p>
        </td>
      </tr>
    </table>

    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h2 style="color: #1a2744; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; display: flex; align-items: center; gap: 8px;">
        🔥 Prayer Points
      </h2>
      ${prayerPointsHtml}
    </div>

    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h2 style="color: #1a2744; font-size: 18px; margin: 0 0 16px 0; font-weight: 600; display: flex; align-items: center; gap: 8px;">
        📖 Scripture Focus
      </h2>
      <div>${scripturesHtml}</div>
      
      <div style="background: #FAF8F5; border-radius: 12px; padding: 20px; margin-top: 16px; border-left: 4px solid #D4A574;">
        <p style="color: #1a2744; font-size: 15px; font-style: italic; margin: 0; line-height: 1.6;">
          "Ask of me, and I will make the nations your inheritance, the ends of the earth your possession."
        </p>
        <p style="color: #D4A574; font-size: 13px; margin: 8px 0 0 0; font-weight: 600;">— Psalm 2:8</p>
      </div>
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://reawakened.app/pray" style="display: inline-block; background-color: #D4A574; background: linear-gradient(135deg, #D4A574 0%, #C49464 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        🙏 Start Praying Now
      </a>
    </div>

    ${getEmailFooter(to, 'Ask of me, and I will make the nations your inheritance. — Psalm 2:8')}
  </div>
</body>
</html>
  `;

  if (!resend) {
    console.warn('Resend not configured, skipping prayer reminder email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened Prayer <prayer@reawakened.app>',
      to: [to],
      subject: `🙏 ${greeting}'s Prayer for ${data.focusName}`,
      html: htmlContent,
    });

    console.log('Prayer reminder email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send prayer reminder email:', error);
    return { success: false, error };
  }
}

// Prayer Adoption Confirmation Email
export async function sendPrayerAdoptionConfirmation(to: string, name: string, data: {
  focusName: string;
  focusType: 'nation' | 'campus';
  population?: string;
  region?: string;
  prayerPoints: string[];
  reminderFrequency: string;
}) {
  const focusIcon = data.focusType === 'campus' ? '🎓' : '🌍';
  const typeLabel = data.focusType === 'campus' ? 'Campus' : 'Nation';
  
  const prayerPointsHtml = data.prayerPoints.slice(0, 4).map((point, i) => `
    <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
      <div style="width: 24px; height: 24px; background-color: #4A7C7C; background: linear-gradient(135deg, #4A7C7C 0%, #3A6C6C 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <span style="color: white; font-size: 12px; font-weight: bold;">${i + 1}</span>
      </div>
      <p style="color: #1a2744; font-size: 14px; margin: 0; line-height: 1.6;">${point}</p>
    </div>
  `).join('');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Prayer Movement</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader(`${focusIcon} You've Adopted ${data.focusName}!`, `Welcome to the intercessory movement`, 'linear-gradient(135deg, #1a2744 0%, #2d3a52 100%)')}

    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h2 style="color: #1a2744; font-size: 20px; margin: 0 0 16px 0; font-weight: 600;">
        Hi ${name}, you're now standing in the gap!
      </h2>
      <p style="color: #6B7B6E; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
        Thank you for committing to pray for <strong style="color: #1a2744;">${data.focusName}</strong>. Your intercession matters more than you know. Together, we're believing for breakthrough and transformation.
      </p>
      
      <div style="background: #FAF8F5; border-radius: 12px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E8E4DE; padding-bottom: 12px; margin-bottom: 12px;">
          <span style="color: #6B7B6E; font-size: 14px;">Focus Type</span>
          <span style="color: #1a2744; font-weight: 600; font-size: 14px;">${typeLabel}</span>
        </div>
        ${data.region ? `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E8E4DE; padding-bottom: 12px; margin-bottom: 12px;">
          <span style="color: #6B7B6E; font-size: 14px;">Region</span>
          <span style="color: #1a2744; font-weight: 600; font-size: 14px;">${data.region}</span>
        </div>
        ` : ''}
        ${data.population ? `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E8E4DE; padding-bottom: 12px; margin-bottom: 12px;">
          <span style="color: #6B7B6E; font-size: 14px;">Population</span>
          <span style="color: #1a2744; font-weight: 600; font-size: 14px;">${data.population}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6B7B6E; font-size: 14px;">Reminders</span>
          <span style="color: #4A7C7C; font-weight: 600; font-size: 14px;">${data.reminderFrequency === 'daily' ? 'Daily' : 'Weekly'}</span>
        </div>
      </div>
    </div>

    ${data.prayerPoints.length > 0 ? `
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h2 style="color: #1a2744; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">
        🔥 Prayer Points to Start
      </h2>
      ${prayerPointsHtml}
    </div>
    ` : ''}

    <div style="background-color: #E8F4F0; background: linear-gradient(135deg, #E8F4F0 0%, #D4E8E4 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
      <p style="color: #1a2744; font-size: 15px; font-style: italic; margin: 0 0 8px 0; line-height: 1.6;">
        "Ask of me, and I will make the nations your inheritance, the ends of the earth your possession."
      </p>
      <p style="color: #4A7C7C; font-size: 13px; margin: 0; font-weight: 600;">— Psalm 2:8</p>
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://reawakened.app/pray" style="display: inline-block; background-color: #4A7C7C; background: linear-gradient(135deg, #4A7C7C 0%, #3A6C6C 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        🙏 Start Praying Now
      </a>
    </div>

    ${getEmailFooter(to, 'The prayer of a righteous person is powerful and effective. — James 5:16')}
  </div>
</body>
</html>
  `;

  if (!resend) {
    console.warn('Resend not configured, skipping prayer adoption confirmation email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened Prayer <prayer@reawakened.app>',
      to: [to],
      subject: `🙏 You're now praying for ${data.focusName}!`,
      html: htmlContent,
    });

    console.log('Prayer adoption confirmation email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send prayer adoption confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendAltarJoinConfirmation(to: string, name: string, data: {
  altarName: string;
  campusName: string;
  affiliation: string;
  prayerPoints: string[];
  whatsappLink?: string;
  meetingLink?: string;
}) {
  const affiliationLabels: Record<string, string> = {
    student: 'Student',
    staff: 'Staff/Faculty',
    alumni: 'Alumni',
    local_supporter: 'Local Supporter',
  };

  const prayerPointsHtml = data.prayerPoints.slice(0, 3).map(point => `
    <li style="color: #1a2744; font-size: 14px; margin-bottom: 8px; line-height: 1.5;">${point}</li>
  `).join('');

  const linksHtml = [];
  if (data.whatsappLink) {
    linksHtml.push(`
      <a href="${data.whatsappLink}" style="display: block; background: #25D366; color: #ffffff; text-decoration: none; padding: 14px 20px; border-radius: 10px; margin-bottom: 10px; font-weight: 600; text-align: center;">
        💬 Join WhatsApp Group
      </a>
    `);
  }
  if (data.meetingLink) {
    linksHtml.push(`
      <a href="${data.meetingLink}" style="display: block; background: #4A7C7C; color: #ffffff; text-decoration: none; padding: 14px 20px; border-radius: 10px; font-weight: 600; text-align: center;">
        📹 Join Online Meeting
      </a>
    `);
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Altar</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader(`Welcome to ${data.altarName}!`, `You've joined the prayer altar for ${data.campusName}`, 'linear-gradient(135deg, #4A7C7C 0%, #3A6C6C 100%)')}

    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h2 style="color: #1a2744; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">
        🙏 Your Commitment
      </h2>
      
      <div style="background: #FAF8F5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E8E4DE; padding-bottom: 12px; margin-bottom: 12px;">
          <span style="color: #6B7B6E; font-size: 14px;">Your Role</span>
          <span style="color: #1a2744; font-weight: 600; font-size: 14px;">${affiliationLabels[data.affiliation] || data.affiliation}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6B7B6E; font-size: 14px;">Campus</span>
          <span style="color: #1a2744; font-weight: 600; font-size: 14px;">${data.campusName}</span>
        </div>
      </div>

      <h3 style="color: #1a2744; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">
        🔥 Key Prayer Points
      </h3>
      <ul style="margin: 0; padding-left: 20px;">
        ${prayerPointsHtml}
      </ul>
    </div>

    ${linksHtml.length > 0 ? `
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h2 style="color: #1a2744; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">
        🔗 Connect with Your Altar
      </h2>
      ${linksHtml.join('')}
    </div>
    ` : ''}

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://reawakened.app/pray" style="display: inline-block; background-color: #D4A574; background: linear-gradient(135deg, #D4A574 0%, #C49464 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        Start Interceding
      </a>
    </div>

    ${getEmailFooter(to, 'If my people who are called by my name will humble themselves and pray... — 2 Chronicles 7:14')}
  </div>
</body>
</html>
  `;

  if (!resend) {
    console.warn('Resend not configured, skipping altar join confirmation email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <noreply@reawakened.app>',
      to: [to],
      subject: `⛪ Welcome to ${data.altarName}!`,
      html: htmlContent,
    });

    console.log('Altar join confirmation email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send altar join confirmation:', error);
    return { success: false, error };
  }
}

export async function sendPrayerRequestNotification(data: {
  name: string;
  email?: string;
  request: string;
  isPrivate: boolean;
}) {
  const prayerTeamEmail = process.env.PRAYER_TEAM_EMAIL || 'prayer@reawakened.app';
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Prayer Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader('New Prayer Request', 'Someone needs your intercession', 'linear-gradient(135deg, #D4A574 0%, #C49464 100%)')}

    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <div style="margin-bottom: 20px;">
        <p style="color: #6B7B6E; font-size: 13px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">From</p>
        <p style="color: #1a2744; font-size: 18px; font-weight: 600; margin: 0;">${data.name}</p>
        ${data.email ? `<p style="color: #6B7B6E; font-size: 14px; margin: 4px 0 0 0;">${data.email}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 20px;">
        <p style="color: #6B7B6E; font-size: 13px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Visibility</p>
        <span style="display: inline-block; background: ${data.isPrivate ? '#FEF3C7' : '#D1FAE5'}; color: ${data.isPrivate ? '#92400E' : '#065F46'}; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 500;">
          ${data.isPrivate ? '🔒 Private (prayer team only)' : '🌍 Public'}
        </span>
      </div>
      
      <div style="background: #FAF8F5; border-radius: 12px; padding: 20px; border-left: 4px solid #D4A574;">
        <p style="color: #6B7B6E; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Prayer Request</p>
        <p style="color: #1a2744; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.request}</p>
      </div>
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://reawakened.app/admin/prayer" style="display: inline-block; background-color: #4A7C7C; background: linear-gradient(135deg, #4A7C7C 0%, #3A6C6C 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        View in Prayer Dashboard
      </a>
    </div>

    ${getEmailFooter(prayerTeamEmail, 'The prayer of a righteous person is powerful and effective. — James 5:16')}
  </div>
</body>
</html>
  `;

  if (!resend) {
    console.warn('Resend not configured, skipping prayer request notification');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened Prayer <prayer@reawakened.app>',
      to: [prayerTeamEmail],
      subject: `🙏 New Prayer Request from ${data.name}`,
      html: htmlContent,
    });

    console.log('Prayer request notification sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send prayer request notification:', error);
    return { success: false, error };
  }
}

// Event Registration Confirmation
export async function sendEventRegistrationEmail(to: string, name: string, data: {
  eventTitle: string;
  eventDate: Date;
  eventLocation?: string;
  eventDescription?: string;
}) {
  const dateStr = data.eventDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = data.eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader("You're Registered!", `Hi ${name}, you're confirmed for this event`)}
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h2 style="color: #1a2744; font-size: 22px; margin: 0 0 20px 0; font-weight: 600;">${data.eventTitle}</h2>
      <div style="background: #FAF8F5; border-radius: 12px; padding: 20px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <span style="font-size: 20px;">📅</span>
          <div>
            <p style="color: #1a2744; font-weight: 600; margin: 0;">${dateStr}</p>
            <p style="color: #6B7B6E; font-size: 14px; margin: 4px 0 0 0;">${timeStr}</p>
          </div>
        </div>
        ${data.eventLocation ? `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 20px;">📍</span>
          <p style="color: #1a2744; margin: 0;">${data.eventLocation}</p>
        </div>` : ''}
      </div>
      ${data.eventDescription ? `<p style="color: #6B7B6E; font-size: 14px; margin-top: 16px; line-height: 1.6;">${data.eventDescription}</p>` : ''}
    </div>
    ${getEmailFooter(to, 'For where two or three gather in my name, there am I with them. — Matthew 18:20')}
  </div>
</body>
</html>`;

  if (!resend) {
    console.warn('Resend not configured, skipping event registration email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <noreply@reawakened.app>',
      to: [to],
      subject: `🎉 You're registered for ${data.eventTitle}!`,
      html: htmlContent,
    });
    console.log('Event registration email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send event registration email:', error);
    return { success: false, error };
  }
}

// Challenge Enrollment Confirmation
export async function sendChallengeEnrollmentEmail(to: string, name: string, data: {
  challengeTitle: string;
  challengeDescription?: string;
  startDate: Date;
  endDate: Date;
  goalDays: number;
}) {
  const startStr = data.startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  const endStr = data.endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader('Challenge Accepted!', `Hi ${name}, you've joined the challenge`, 'linear-gradient(135deg, #D4A574 0%, #C49464 100%)')}
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h2 style="color: #1a2744; font-size: 22px; margin: 0 0 16px 0; font-weight: 600;">${data.challengeTitle}</h2>
      ${data.challengeDescription ? `<p style="color: #6B7B6E; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6;">${data.challengeDescription}</p>` : ''}
      <div style="background: #FAF8F5; border-radius: 12px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: #6B7B6E;">Duration</span>
          <span style="color: #1a2744; font-weight: 600;">${data.goalDays} days</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6B7B6E;">Period</span>
          <span style="color: #1a2744; font-weight: 600;">${startStr} - ${endStr}</span>
        </div>
      </div>
    </div>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://reawakened.app/challenges" style="display: inline-block; background-color: #D4A574; background: linear-gradient(135deg, #D4A574 0%, #C49464 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600;">
        Start Your Challenge
      </a>
    </div>
    ${getEmailFooter(to, 'I can do all things through Christ who strengthens me. — Philippians 4:13')}
  </div>
</body>
</html>`;

  if (!resend) {
    console.warn('Resend not configured, skipping challenge enrollment email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <noreply@reawakened.app>',
      to: [to],
      subject: `🏆 Challenge Accepted: ${data.challengeTitle}`,
      html: htmlContent,
    });
    console.log('Challenge enrollment email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send challenge enrollment email:', error);
    return { success: false, error };
  }
}

// Testimony Acknowledgement (Two-tone version)
export async function sendTestimonyAcknowledgementEmail(to: string, name: string, data: {
  testimonyTitle: string;
  category: string;
  sharingPermission?: string;
  displayNamePreference?: string;
  segment?: AudienceSegment;
  tone?: ContentTone;
}) {
  const tone = data.tone || 'faith';
  const segment = data.segment || null;
  const segmentBlock = getSegmentBlock(segment, tone);

  const sharingLabels: Record<string, string> = {
    private: 'Keep private (just for review)',
    anonymous: 'Share anonymously',
    public: 'Share publicly'
  };

  const displayLabels: Record<string, string> = {
    first_name: 'First name only',
    full_name: 'Full name',
    anonymous: 'Anonymous'
  };

  const subject = getToneContent(tone,
    `We received your story — thank you`,
    `Thank you for sharing your testimony — it builds faith`
  );

  const headline = getToneContent(tone,
    `Thank You for Sharing!`,
    `Thank You for Your Testimony!`
  );

  const intro = getToneContent(tone,
    `Thank you for sharing your testimony with us. We've received it, and we're genuinely grateful you trusted us with your story.`,
    `Thank you for sharing what God has done. We've received your testimony, and it's already encouraging us.`
  );

  const nextStepsText = getToneContent(tone,
    `Our team will review it for clarity and safety (especially if it's public). If we need anything, we'll reply here. If you selected "public," we'll tell you when it's live.`,
    `We'll review it with care and honour (especially if it's public). If we need clarification, we'll reply here. If you selected "public," we'll let you know when it's live.`
  );

  const ctaText = getToneContent(tone,
    `Reply with one sentence you'd want someone else to take away from your story. That line helps us share it well.`,
    `Reply with one sentence you'd want someone to remember. We may use it as a headline to help your testimony reach the right people.`
  );

  const signOff = getToneContent(tone, `Warmly,`, `Grateful with you,`);

  const scripture = tone === 'faith'
    ? `<p style="color: #6B7B6E; font-size: 13px; margin: 0; font-style: italic;">"They triumphed over him by the blood of the Lamb and by the word of their testimony." — Revelation 12:11</p>`
    : '';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader(headline, `Hi ${name}`, 'linear-gradient(135deg, #7C9A8E 0%, #6B8B7E 100%)')}
    
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <p style="color: #1a2744; font-size: 16px; margin: 0 0 16px 0; line-height: 1.6;">${intro}</p>
      <p style="color: #6B7B6E; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6; background: #FAF8F5; padding: 16px; border-radius: 12px;">${segmentBlock}</p>
      
      <h2 style="color: #1a2744; font-size: 20px; margin: 0 0 16px 0; font-weight: 600;">"${data.testimonyTitle}"</h2>
      
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
        <span style="display: inline-block; background: #E8F4F0; color: #4A7C7C; padding: 6px 12px; border-radius: 12px; font-size: 13px; font-weight: 500;">${data.category}</span>
        ${data.sharingPermission ? `<span style="display: inline-block; background: #FAF0E6; color: #D4A574; padding: 6px 12px; border-radius: 12px; font-size: 13px; font-weight: 500;">${sharingLabels[data.sharingPermission] || data.sharingPermission}</span>` : ''}
        ${data.displayNamePreference && data.sharingPermission !== 'private' ? `<span style="display: inline-block; background: #F3F4F6; color: #6B7B6E; padding: 6px 12px; border-radius: 12px; font-size: 13px;">Display: ${displayLabels[data.displayNamePreference] || data.displayNamePreference}</span>` : ''}
      </div>
      
      <h3 style="color: #1a2744; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">What Happens Next</h3>
      <p style="color: #6B7B6E; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6;">${nextStepsText}</p>
      
      <div style="background: #FAF0E6; border-radius: 12px; padding: 20px; border-left: 4px solid #D4A574;">
        <p style="color: #92400E; font-size: 14px; margin: 0;"><strong>Your Next Step (optional):</strong><br/>${ctaText}</p>
      </div>
    </div>

    ${getEmailFooter(to, tone === 'faith' ? 'They triumphed over him by the blood of the Lamb and by the word of their testimony. — Revelation 12:11' : undefined)}
  </div>
</body>
</html>`;

  if (!resend) {
    console.warn('Resend not configured, skipping testimony acknowledgement email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <noreply@reawakened.app>',
      to: [to],
      subject: `✨ ${subject}`,
      html: htmlContent,
    });
    console.log('Testimony acknowledgement email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send testimony acknowledgement email:', error);
    return { success: false, error };
  }
}

// Volunteer Sign-up Confirmation (Two-tone version)
export async function sendVolunteerConfirmationEmail(to: string, name: string, data: {
  areas: string[];
  phone?: string;
  segment?: AudienceSegment;
  tone?: ContentTone;
}) {
  const tone = data.tone || 'faith';
  const segment = data.segment || null;
  const segmentBlock = getSegmentBlock(segment, tone);
  
  const areasHtml = data.areas.map(area => `
    <span style="display: inline-block; background: #E8F4F0; color: #4A7C7C; padding: 6px 12px; border-radius: 16px; font-size: 13px; margin: 4px; font-weight: 500;">${area}</span>
  `).join('');

  const subject = getToneContent(tone,
    `You're in — welcome to the team`,
    `Thank you for stepping up — welcome`
  );

  const headline = getToneContent(tone,
    `Welcome to the Team!`,
    `Thank you for Stepping Up!`
  );

  const intro = getToneContent(tone,
    `Thanks for signing up to volunteer. We're genuinely glad you're here.`,
    `Thank you for signing up to volunteer. Your "yes" matters more than you know.`
  );

  const nextStepsIntro = getToneContent(tone,
    `We'll review your sign-up and match you to a role that fits what you chose.`,
    `We'll review your sign-up and connect you with a role that fits your grace and availability.`
  );

  const ctaText = getToneContent(tone,
    `See upcoming opportunities`,
    `See what God is doing + where you can serve`
  );

  const closingText = getToneContent(tone,
    `If you already know what you'd love to help with, reply and tell us—we'll try to place you where you'll thrive.`,
    `If you already feel drawn to prayer, outreach, content, media, mentoring, or logistics, reply and tell us. We'd love to place you intentionally.`
  );

  const signOff = getToneContent(tone, `Warmly,`, `With gratitude,`);

  const scripture = tone === 'faith' 
    ? `<p style="color: #6B7B6E; font-size: 13px; margin: 0; font-style: italic;">"Each of you should use whatever gift you have received to serve others." — 1 Peter 4:10</p>`
    : '';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader(headline, `Hi ${name}`, 'linear-gradient(135deg, #4A7C7C 0%, #3A6C6C 100%)')}
    
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <p style="color: #1a2744; font-size: 16px; margin: 0 0 16px 0; line-height: 1.6;">${intro}</p>
      <p style="color: #6B7B6E; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6; background: #FAF8F5; padding: 16px; border-radius: 12px;">${segmentBlock}</p>
      
      <h2 style="color: #1a2744; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">Next Steps</h2>
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
          <span style="background: #4A7C7C; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">1</span>
          <p style="color: #1a2744; font-size: 14px; margin: 0;">${nextStepsIntro}</p>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
          <span style="background: #4A7C7C; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">2</span>
          <p style="color: #1a2744; font-size: 14px; margin: 0;">You'll get a message within <strong>48 hours</strong> with onboarding steps.</p>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <span style="background: #4A7C7C; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">3</span>
          <p style="color: #1a2744; font-size: 14px; margin: 0;">You'll be added to a volunteer channel to meet the team.</p>
        </div>
      </div>
      
      <h3 style="color: #1a2744; font-size: 16px; margin: 20px 0 12px 0; font-weight: 600;">Your Areas of Interest</h3>
      <div style="margin-bottom: 20px;">${areasHtml}</div>
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://reawakened.app/events" style="display: inline-block; background-color: #4A7C7C; background: linear-gradient(135deg, #4A7C7C 0%, #3A6C6C 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600;">
        ${ctaText}
      </a>
    </div>

    <div style="background: #ffffff; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <p style="color: #6B7B6E; font-size: 14px; margin: 0; line-height: 1.6;">${closingText}</p>
    </div>

    ${getEmailFooter(to, tone === 'faith' ? 'Each of you should use whatever gift you have received to serve others. — 1 Peter 4:10' : undefined)}
  </div>
</body>
</html>`;

  if (!resend) {
    console.warn('Resend not configured, skipping volunteer confirmation email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <noreply@reawakened.app>',
      to: [to],
      subject: `🙌 ${subject}`,
      html: htmlContent,
    });
    console.log('Volunteer confirmation email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send volunteer confirmation email:', error);
    return { success: false, error };
  }
}

// Mission Trip Interest Confirmation
export async function sendMissionTripInterestEmail(to: string, name: string, data: {
  tripInterest: string;
  experience?: string;
}) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader('Mission Interest Received!', `Thank you for your heart for the nations, ${name}`)}
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h2 style="color: #1a2744; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">Your Interest</h2>
      <div style="background: #FAF8F5; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <p style="color: #1a2744; font-weight: 600; margin: 0;">${data.tripInterest}</p>
      </div>
      ${data.experience ? `<p style="color: #6B7B6E; font-size: 14px; margin: 0 0 16px 0;"><strong>Experience:</strong> ${data.experience}</p>` : ''}
      <p style="color: #6B7B6E; font-size: 14px; margin: 0; line-height: 1.6;">
        Our missions team will be in touch with upcoming trip opportunities and next steps. Start preparing your heart through prayer!
      </p>
    </div>
    ${getEmailFooter(to, 'Go therefore and make disciples of all nations. — Matthew 28:19')}
  </div>
</body>
</html>`;

  if (!resend) {
    console.warn('Resend not configured, skipping mission trip interest email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <noreply@reawakened.app>',
      to: [to],
      subject: `🌍 Your mission trip interest has been received!`,
      html: htmlContent,
    });
    console.log('Mission trip interest email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send mission trip interest email:', error);
    return { success: false, error };
  }
}

// Subscription Welcome Email (Two-tone version)
export async function sendSubscriptionWelcomeEmail(to: string, data: {
  categories: string[];
  whatsappOptIn: boolean;
  name?: string;
  segment?: AudienceSegment;
  tone?: ContentTone;
}) {
  const tone = data.tone || 'faith';
  const segment = data.segment || null;
  const segmentBlock = getSegmentBlock(segment, tone);
  const firstName = data.name || 'there';

  const categoriesHtml = data.categories.map(cat => `
    <span style="display: inline-block; background: #FAF0E6; color: #D4A574; padding: 6px 12px; border-radius: 16px; font-size: 13px; margin: 4px; font-weight: 500;">${cat}</span>
  `).join('');

  const subject = getToneContent(tone,
    `Welcome — you're officially in`,
    `Welcome — let's grow in purpose together`
  );

  const headline = getToneContent(tone,
    `You're In!`,
    `Welcome to the Community!`
  );

  const intro = getToneContent(tone,
    `Welcome to Reawakened. We're glad you subscribed.`,
    `Welcome to Reawakened. We're really glad you joined.`
  );

  const expectText = getToneContent(tone,
    `Here's what you'll get from us:
• Real encouragement (not fluffy)
• Practical steps for purpose, confidence, relationships, and direction
• Updates on events + ways to get involved`,
    `Here's what you'll get from us:
• Faith + real-life encouragement
• Practical tools for purpose, relationships, and growth
• Revival and outreach updates from campuses and communities`
  );

  const signOff = getToneContent(tone, `Speak soon,`, `With love,`);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader(headline, `Hi ${firstName}`, 'linear-gradient(135deg, #D4A574 0%, #C49464 100%)')}
    
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <p style="color: #1a2744; font-size: 16px; margin: 0 0 16px 0; line-height: 1.6;">${intro}</p>
      <p style="color: #6B7B6E; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6; background: #FAF8F5; padding: 16px; border-radius: 12px;">${segmentBlock}</p>
      
      <h2 style="color: #1a2744; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">Your Subscriptions</h2>
      <div style="margin-bottom: 20px;">${categoriesHtml}</div>
      
      <div style="background: #FAF8F5; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <p style="color: #1a2744; font-size: 14px; margin: 0; line-height: 1.8; white-space: pre-line;">${expectText}</p>
      </div>
      
      ${data.whatsappOptIn ? `
      <div style="background: #D1FAE5; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">💬</span>
        <p style="color: #065F46; font-size: 14px; margin: 0;">You've also opted in to WhatsApp updates!</p>
      </div>` : ''}
    </div>

    <div style="background: #ffffff; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h3 style="color: #1a2744; font-size: 16px; margin: 0 0 16px 0; font-weight: 600;">Your Next Step (choose one)</h3>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <a href="https://reawakened.app/settings" style="display: block; background-color: #D4A574; background: linear-gradient(135deg, #D4A574 0%, #C49464 100%); color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 14px; text-align: center;">
          Set Your Preferences
        </a>
        <a href="https://reawakened.app/vision" style="display: block; background: #FAF8F5; color: #1a2744; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 14px; text-align: center; border: 1px solid #E8E4DE;">
          Start Vision & Goals
        </a>
        <a href="https://reawakened.app/prayer-wall" style="display: block; background: #FAF8F5; color: #1a2744; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 14px; text-align: center; border: 1px solid #E8E4DE;">
          Check the Prayer Wall
        </a>
      </div>
    </div>

    ${getEmailFooter(to)}
  </div>
</body>
</html>`;

  if (!resend) {
    console.warn('Resend not configured, skipping subscription welcome email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <noreply@reawakened.app>',
      to: [to],
      subject: `📬 ${subject}`,
      html: htmlContent,
    });
    console.log('Subscription welcome email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send subscription welcome email:', error);
    return { success: false, error };
  }
}

// Prayer Pod Notification
export async function sendPrayerPodNotificationEmail(to: string, name: string, data: {
  podName: string;
  action: 'joined' | 'created';
  memberCount?: number;
}) {
  const actionText = data.action === 'created' ? 'created' : 'joined';
  const icon = data.action === 'created' ? '🌟' : '🤝';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader(`Prayer Pod ${data.action === 'created' ? 'Created' : 'Joined'}!`, `Hi ${name}, you've ${actionText} a prayer community`, 'linear-gradient(135deg, #4A7C7C 0%, #3A6C6C 100%)')}
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h2 style="color: #1a2744; font-size: 22px; margin: 0 0 16px 0; font-weight: 600;">${data.podName}</h2>
      ${data.memberCount ? `<p style="color: #6B7B6E; font-size: 14px; margin: 0 0 16px 0;">${data.memberCount} members</p>` : ''}
      <p style="color: #6B7B6E; font-size: 14px; margin: 0; line-height: 1.6;">
        ${data.action === 'created' 
          ? 'Share your pod with others to grow your prayer community. When you pray together, mountains move!'
          : 'You\'re now connected with fellow believers for prayer support. Check in regularly to lift each other up!'}
      </p>
    </div>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://reawakened.app/prayer-pods" style="display: inline-block; background-color: #4A7C7C; background: linear-gradient(135deg, #4A7C7C 0%, #3A6C6C 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600;">
        View Your Pods
      </a>
    </div>
    ${getEmailFooter(to, 'For where two or three gather in my name, there am I with them. — Matthew 18:20')}
  </div>
</body>
</html>`;

  if (!resend) {
    console.warn('Resend not configured, skipping prayer pod notification email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <noreply@reawakened.app>',
      to: [to],
      subject: `${icon} You've ${actionText} ${data.podName}!`,
      html: htmlContent,
    });
    console.log('Prayer pod notification email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send prayer pod notification email:', error);
    return { success: false, error };
  }
}

// Prayer Request User Confirmation (Two-tone version)
export async function sendPrayerRequestConfirmationEmail(to: string, name: string, data: {
  request: string;
  isPrivate: boolean;
  urgencyLevel?: string;
  category?: string;
  campusOrCity?: string;
  segment?: AudienceSegment;
  tone?: ContentTone;
}) {
  const tone = data.tone || 'faith';
  const segment = data.segment || null;
  const segmentBlock = getSegmentBlock(segment, tone);
  const categoryLabel = getCategoryLabel(data.category);
  const urgencyDisplay = getUrgencyDisplay(data.urgencyLevel);

  const subject = getToneContent(tone,
    `We received your request — we've got you`,
    `We've received your prayer request — we're standing with you`
  );

  const headline = getToneContent(tone,
    `We've Got You`,
    `We're Praying With You`
  );

  const intro = getToneContent(tone,
    `Thanks for sharing your prayer request. We've received it, and our team will be holding this with care.`,
    `Thank you for trusting us with this. We've received your request, and our prayer team will be praying with faith.`
  );

  const encouragement = tone === 'faith' 
    ? `<div style="background: #FAF0E6; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <p style="color: #92400E; font-size: 14px; margin: 0; font-style: italic;">"The Lord is near to the brokenhearted." — Psalm 34:18</p>
      </div>`
    : '';

  const closingText = getToneContent(tone,
    `You're not alone.`,
    `We're with you in prayer.`
  );

  const signOff = getToneContent(tone, `Warmly,`, `With love,`);

  const scripture = tone === 'faith'
    ? `<p style="color: #6B7B6E; font-size: 13px; margin: 0; font-style: italic;">"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." — Philippians 4:6</p>`
    : '';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader(headline, `Hi ${name}`, 'linear-gradient(135deg, #D4A574 0%, #C49464 100%)')}
    
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <p style="color: #1a2744; font-size: 16px; margin: 0 0 16px 0; line-height: 1.6;">${intro}</p>
      <p style="color: #6B7B6E; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6; background: #FAF8F5; padding: 16px; border-radius: 12px;">${segmentBlock}</p>
      
      <div style="background: #FAF8F5; border-radius: 12px; padding: 20px; border-left: 4px solid #D4A574; margin-bottom: 16px;">
        <p style="color: #1a2744; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.request}</p>
      </div>
      
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
        <span style="display: inline-block; background: ${data.isPrivate ? '#FEF3C7' : '#D1FAE5'}; color: ${data.isPrivate ? '#92400E' : '#065F46'}; padding: 6px 12px; border-radius: 12px; font-size: 13px; font-weight: 500;">
          ${data.isPrivate ? '🔒 Private' : '🌍 Public'}
        </span>
        ${data.category ? `<span style="display: inline-block; background: #E8F4F0; color: #4A7C7C; padding: 6px 12px; border-radius: 12px; font-size: 13px; font-weight: 500;">${categoryLabel}</span>` : ''}
        ${data.urgencyLevel && data.urgencyLevel !== 'normal' ? `<span style="display: inline-block; background: ${urgencyDisplay.bgColor}; color: ${urgencyDisplay.color}; padding: 6px 12px; border-radius: 12px; font-size: 13px; font-weight: 500;">${urgencyDisplay.label}</span>` : ''}
        ${data.campusOrCity ? `<span style="display: inline-block; background: #F3F4F6; color: #6B7B6E; padding: 6px 12px; border-radius: 12px; font-size: 13px;">📍 ${data.campusOrCity}</span>` : ''}
      </div>
      
      ${encouragement}
    </div>

    <div style="background: #ffffff; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h3 style="color: #1a2744; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">Your Next Step</h3>
      <div style="display: flex; gap: 12px;">
        <a href="https://reawakened.app/pray" style="display: inline-block; background-color: #D4A574; background: linear-gradient(135deg, #D4A574 0%, #C49464 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 14px;">
          Join a Prayer Moment
        </a>
        <a href="https://reawakened.app/prayer-wall" style="display: inline-block; background: #FAF8F5; color: #1a2744; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 14px; border: 1px solid #E8E4DE;">
          View Prayer Wall
        </a>
      </div>
    </div>

    ${getEmailFooter(to, tone === 'faith' ? 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. — Philippians 4:6' : undefined)}
  </div>
</body>
</html>`;

  if (!resend) {
    console.warn('Resend not configured, skipping prayer request confirmation email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened Prayer <prayer@reawakened.app>',
      to: [to],
      subject: `🙏 ${subject}`,
      html: htmlContent,
    });
    console.log('Prayer request confirmation email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send prayer request confirmation email:', error);
    return { success: false, error };
  }
}

// Daily Devotional Reminder
export async function sendDailyDevotionalEmail(to: string, name: string, data: {
  sparkTitle: string;
  sparkDescription: string;
  scriptureRef: string;
  prayerLine?: string;
}) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
      <tr>
        <td bgcolor="#1a2744" style="background-color: #1a2744; border-radius: 24px; padding: 40px; text-align: center;">
          <p style="color: #b0b0b0; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px; font-family: 'Segoe UI', Arial, sans-serif;">Today's Spark</p>
          <h1 style="color: #ffffff; font-size: 26px; margin: 0 0 12px 0; font-weight: 700; font-family: 'Segoe UI', Arial, sans-serif;">${data.sparkTitle}</h1>
          <p style="color: #D4A574; font-size: 14px; margin: 0; font-weight: 500; font-family: 'Segoe UI', Arial, sans-serif;">${data.scriptureRef}</p>
        </td>
      </tr>
    </table>
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <p style="color: #1a2744; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">${data.sparkDescription}</p>
      ${data.prayerLine ? `
      <div style="background: #FAF8F5; border-radius: 12px; padding: 20px; border-left: 4px solid #D4A574;">
        <p style="color: #6B7B6E; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Today's Prayer</p>
        <p style="color: #1a2744; font-size: 15px; font-style: italic; margin: 0; line-height: 1.6;">${data.prayerLine}</p>
      </div>` : ''}
    </div>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://reawakened.app/sparks" style="display: inline-block; background-color: #D4A574; background: linear-gradient(135deg, #D4A574 0%, #C49464 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600;">
        Read Full Devotional
      </a>
    </div>
    ${getEmailFooter(to, 'Your word is a lamp for my feet, a light on my path. — Psalm 119:105')}
  </div>
</body>
</html>`;

  if (!resend) {
    console.warn('Resend not configured, skipping daily devotional email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <noreply@reawakened.app>',
      to: [to],
      subject: `🔥 ${data.sparkTitle}`,
      html: htmlContent,
    });
    console.log('Daily devotional email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send daily devotional email:', error);
    return { success: false, error };
  }
}

// Event Reminder (24 hours before)
export async function sendEventReminderEmail(to: string, name: string, data: {
  eventTitle: string;
  eventDate: Date;
  eventLocation?: string;
}) {
  const dateStr = data.eventDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = data.eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader("Tomorrow's the Day!", `Hi ${name}, don't forget about your event`, 'linear-gradient(135deg, #D4A574 0%, #C49464 100%)')}
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <h2 style="color: #1a2744; font-size: 22px; margin: 0 0 20px 0; font-weight: 600;">${data.eventTitle}</h2>
      <div style="background: #FAF8F5; border-radius: 12px; padding: 20px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <span style="font-size: 20px;">📅</span>
          <div>
            <p style="color: #1a2744; font-weight: 600; margin: 0;">${dateStr}</p>
            <p style="color: #6B7B6E; font-size: 14px; margin: 4px 0 0 0;">${timeStr}</p>
          </div>
        </div>
        ${data.eventLocation ? `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 20px;">📍</span>
          <p style="color: #1a2744; margin: 0;">${data.eventLocation}</p>
        </div>` : ''}
      </div>
    </div>
    ${getEmailFooter(to, 'Let us not give up meeting together, as some are in the habit of doing, but let us encourage one another. — Hebrews 10:25')}
  </div>
</body>
</html>`;

  if (!resend) {
    console.warn('Resend not configured, skipping event reminder email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <noreply@reawakened.app>',
      to: [to],
      subject: `⏰ Reminder: ${data.eventTitle} is tomorrow!`,
      html: htmlContent,
    });
    console.log('Event reminder email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send event reminder email:', error);
    return { success: false, error };
  }
}

// ===== AUTH EMAILS =====

export async function sendAuthWelcomeEmail(to: string, firstName: string | null) {
  const name = firstName || 'there';
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader("Welcome to Reawakened!", `Hey ${name}, your journey starts now`)}
    
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        We're so glad you're here! Reawakened is a community for young people who want to grow spiritually, connect with others, and make an impact for the Kingdom.
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; font-weight: 600;">
        Here's everything you can explore:
      </p>
    </div>

    <!-- Daily Sparks -->
    <a href="https://reawakened.app/sparks" style="text-decoration: none; display: block;">
      <div style="background-color: #D4A574; background: linear-gradient(135deg, #D4A574 0%, #C49464 100%); border-radius: 16px; padding: 20px 24px; margin-bottom: 12px; display: flex; align-items: center;">
        <span style="font-size: 24px; margin-right: 16px;">✨</span>
        <div>
          <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">Daily Sparks</p>
          <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Bite-sized devotionals to start your day with purpose</p>
        </div>
      </div>
    </a>

    <!-- Journeys -->
    <a href="https://reawakened.app/journeys" style="text-decoration: none; display: block;">
      <div style="background-color: #7C9A8E; background: linear-gradient(135deg, #7C9A8E 0%, #6B8B7E 100%); border-radius: 16px; padding: 20px 24px; margin-bottom: 12px; display: flex; align-items: center;">
        <span style="font-size: 24px; margin-right: 16px;">🗺️</span>
        <div>
          <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">Journeys</p>
          <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Multi-day guided programs for deeper spiritual growth</p>
        </div>
      </div>
    </a>

    <!-- Vision & Goals -->
    <a href="https://reawakened.app/vision" style="text-decoration: none; display: block;">
      <div style="background-color: #4A7C7C; background: linear-gradient(135deg, #4A7C7C 0%, #3A6C6C 100%); border-radius: 16px; padding: 20px 24px; margin-bottom: 12px; display: flex; align-items: center;">
        <span style="font-size: 24px; margin-right: 16px;">🎯</span>
        <div>
          <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">Vision & Goals</p>
          <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Discover your purpose and set meaningful life goals</p>
        </div>
      </div>
    </a>

    <!-- Prayer -->
    <a href="https://reawakened.app/pray" style="text-decoration: none; display: block;">
      <div style="background-color: #8B5CF6; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); border-radius: 16px; padding: 20px 24px; margin-bottom: 12px; display: flex; align-items: center;">
        <span style="font-size: 24px; margin-right: 16px;">🙏</span>
        <div>
          <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">Prayer Hub</p>
          <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Share prayer requests and intercede for others</p>
        </div>
      </div>
    </a>

    <!-- Community -->
    <a href="https://reawakened.app/community" style="text-decoration: none; display: block;">
      <div style="background-color: #3B82F6; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); border-radius: 16px; padding: 20px 24px; margin-bottom: 12px; display: flex; align-items: center;">
        <span style="font-size: 24px; margin-right: 16px;">👥</span>
        <div>
          <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">Community Hub</p>
          <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Connect, chat, and grow with fellow believers</p>
        </div>
      </div>
    </a>

    <!-- Events -->
    <a href="https://reawakened.app/outreach" style="text-decoration: none; display: block;">
      <div style="background-color: #EC4899; background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%); border-radius: 16px; padding: 20px 24px; margin-bottom: 12px; display: flex; align-items: center;">
        <span style="font-size: 24px; margin-right: 16px;">📅</span>
        <div>
          <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">Events & Outreach</p>
          <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Join mission trips, retreats, and community gatherings</p>
        </div>
      </div>
    </a>

    <!-- Missions -->
    <a href="https://reawakened.app/missions" style="text-decoration: none; display: block;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
        <tr>
          <td bgcolor="#1a2744" style="background-color: #1a2744; border-radius: 16px; padding: 20px 24px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right: 16px; vertical-align: middle;"><span style="font-size: 24px;">🚀</span></td>
                <td style="vertical-align: middle;">
                  <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 4px 0; font-family: 'Segoe UI', Arial, sans-serif;">Missions</p>
                  <p style="color: #e0e0e0; font-size: 14px; margin: 0; font-family: 'Segoe UI', Arial, sans-serif;">Take action and make digital impact for the Kingdom</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </a>

    <div style="background: #ffffff; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #E8E4DE; text-align: center;">
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
        Ready to begin your journey? Start with today's Daily Spark!
      </p>
      <table cellpadding="0" cellspacing="0" border="0" style="display: inline-table;">
        <tr>
          <td bgcolor="#1a2744" style="background-color: #1a2744; border-radius: 12px; padding: 14px 32px;">
            <a href="https://reawakened.app/sparks" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; font-family: 'Segoe UI', Arial, sans-serif;">Get Started Now</a>
          </td>
        </tr>
      </table>
    </div>

    ${getEmailFooter(to, 'For I know the plans I have for you, declares the Lord. — Jeremiah 29:11')}
  </div>
</body>
</html>`;

  if (!resend) {
    console.warn('Resend not configured, skipping welcome email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <hello@reawakened.app>',
      to: [to],
      subject: `Welcome to Reawakened, ${name}!`,
      html: htmlContent,
    });
    console.log('Auth welcome email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send auth welcome email:', error);
    return { success: false, error };
  }
}

export async function sendEmailVerificationEmail(to: string, firstName: string | null, token: string) {
  const name = firstName || 'there';
  const verifyUrl = `https://reawakened.app/verify-email?token=${token}`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader("Verify Your Email", `Hey ${name}, one quick step`)}
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Please verify your email address to complete your account setup.
      </p>
      <table cellpadding="0" cellspacing="0" border="0" style="display: inline-table;">
        <tr>
          <td bgcolor="#1a2744" style="background-color: #1a2744; border-radius: 12px; padding: 14px 28px;">
            <a href="${verifyUrl}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; font-family: 'Segoe UI', Arial, sans-serif;">Verify Email Address</a>
          </td>
        </tr>
      </table>
      <p style="color: #6B7280; font-size: 14px; margin: 24px 0 0 0;">
        This link expires in 24 hours. If you didn't create an account, you can ignore this email.
      </p>
    </div>
    ${getEmailFooter(to)}
  </div>
</body>
</html>`;

  if (!resend) {
    console.warn('Resend not configured, skipping email verification');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <noreply@reawakened.app>',
      to: [to],
      subject: 'Verify your email for Reawakened',
      html: htmlContent,
    });
    console.log('Email verification sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send email verification:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(to: string, firstName: string | null, token: string) {
  const name = firstName || 'there';
  const resetUrl = `https://reawakened.app/reset-password?token=${token}`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader("Reset Your Password", `Hey ${name}, let's get you back in`)}
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        We received a request to reset your password. Click the button below to create a new password.
      </p>
      <table cellpadding="0" cellspacing="0" border="0" style="display: inline-table;">
        <tr>
          <td bgcolor="#1a2744" style="background-color: #1a2744; border-radius: 12px; padding: 14px 28px;">
            <a href="${resetUrl}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; font-family: 'Segoe UI', Arial, sans-serif;">Reset Password</a>
          </td>
        </tr>
      </table>
      <p style="color: #6B7280; font-size: 14px; margin: 24px 0 0 0;">
        This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    ${getEmailFooter(to)}
  </div>
</body>
</html>`;

  if (!resend) {
    console.warn('Resend not configured, skipping password reset email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <noreply@reawakened.app>',
      to: [to],
      subject: 'Reset your Reawakened password',
      html: htmlContent,
    });
    console.log('Password reset email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error };
  }
}

export async function sendMigrationEmail(to: string, firstName: string | null, token: string) {
  const name = firstName || 'there';
  const setupUrl = `https://reawakened.app/reset-password?token=${token}&migration=true`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${getEmailHeader("Set Up Your Password", `Hey ${name}, we've got an upgrade for you`)}
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #E8E4DE;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Great news! You can now set up a password for your account.
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Click below to set up a password for your account.
      </p>
      <table cellpadding="0" cellspacing="0" border="0" style="display: inline-table;">
        <tr>
          <td bgcolor="#1a2744" style="background-color: #1a2744; border-radius: 12px; padding: 14px 28px;">
            <a href="${setupUrl}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; font-family: 'Segoe UI', Arial, sans-serif;">Set Up Password</a>
          </td>
        </tr>
      </table>
      <p style="color: #6B7280; font-size: 14px; margin: 24px 0 0 0;">
        This link expires in 7 days.
      </p>
    </div>
    ${getEmailFooter(to)}
  </div>
</body>
</html>`;

  if (!resend) {
    console.warn('Resend not configured, skipping migration email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'Reawakened <hello@reawakened.app>',
      to: [to],
      subject: 'Set up your Reawakened password',
      html: htmlContent,
    });
    console.log('Migration email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send migration email:', error);
    return { success: false, error };
  }
}
