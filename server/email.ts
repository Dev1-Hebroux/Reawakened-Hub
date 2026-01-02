import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

if (!resend) {
  console.warn('RESEND_API_KEY not configured - email functionality will be disabled');
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
    <div style="background: linear-gradient(135deg, #1a2744 0%, #2d3a52 100%); border-radius: 24px; padding: 40px; text-align: center; margin-bottom: 24px;">
      <h1 style="color: #ffffff; font-size: 32px; margin: 0 0 16px 0; font-weight: 700;">
        🔥 Welcome to Reawakened, ${name}!
      </h1>
      <p style="color: rgba(255,255,255,0.8); font-size: 18px; margin: 0; line-height: 1.6;">
        Your mission journey has begun. You're now part of a global movement making digital impact for the Kingdom.
      </p>
    </div>

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
      
      <a href="https://reawakened.one/sparks" style="display: block; background: linear-gradient(135deg, #D4A574 0%, #C49464 100%); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; margin-bottom: 12px; font-weight: 600;">
        ✨ Daily Sparks — Start your day with devotionals
      </a>
      
      <a href="https://reawakened.one/community" style="display: block; background: linear-gradient(135deg, #7C9A8E 0%, #6B8B7E 100%); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; margin-bottom: 12px; font-weight: 600;">
        👥 Community Hub — Connect with fellow believers
      </a>
      
      <a href="https://reawakened.one/vision" style="display: block; background: linear-gradient(135deg, #4A7C7C 0%, #3A6C6C 100%); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 600;">
        🎯 Vision Journey — Discover your purpose
      </a>
    </div>

    <div style="text-align: center; padding: 20px;">
      <p style="color: #6B7B6E; font-size: 14px; margin: 0 0 8px 0;">
        Questions? Reply to this email or join our WhatsApp community.
      </p>
      <p style="color: #1a2744; font-size: 14px; margin: 0; font-weight: 600;">
        — The Reawakened Team
      </p>
    </div>
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
      from: 'Reawakened <noreply@reawakened.one>',
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
      <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #D4A574 0%, #C49464 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
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
    <div style="background: linear-gradient(135deg, #1a2744 0%, #2d3a52 100%); border-radius: 24px; padding: 40px; text-align: center; margin-bottom: 24px;">
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        ${greeting}'s Prayer Focus
      </p>
      <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 12px 0; font-weight: 700;">
        ${focusIcon} ${data.focusName}
      </h1>
      <p style="color: rgba(255,255,255,0.8); font-size: 16px; margin: 0; line-height: 1.6;">
        Hi ${name}, here are today's prayer points for your intercession.
      </p>
    </div>

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
      <a href="https://reawakened.one/pray" style="display: inline-block; background: linear-gradient(135deg, #D4A574 0%, #C49464 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        🙏 Start Praying Now
      </a>
    </div>

    <div style="text-align: center; padding: 20px; border-top: 1px solid #E8E4DE;">
      <p style="color: #6B7B6E; font-size: 13px; margin: 0 0 8px 0;">
        You're receiving this because you've committed to pray for ${data.focusName}.
      </p>
      <p style="color: #6B7B6E; font-size: 12px; margin: 0;">
        <a href="https://reawakened.one/settings" style="color: #4A7C7C;">Manage your prayer subscriptions</a>
      </p>
    </div>
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
      from: 'Reawakened Prayer <prayer@reawakened.one>',
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
    <div style="background: linear-gradient(135deg, #4A7C7C 0%, #3A6C6C 100%); border-radius: 24px; padding: 40px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 48px; margin-bottom: 16px;">⛪</div>
      <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 12px 0; font-weight: 700;">
        Welcome to ${data.altarName}!
      </h1>
      <p style="color: rgba(255,255,255,0.8); font-size: 16px; margin: 0; line-height: 1.6;">
        You've joined the prayer altar for ${data.campusName}
      </p>
    </div>

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
      <a href="https://reawakened.one/pray" style="display: inline-block; background: linear-gradient(135deg, #D4A574 0%, #C49464 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        Start Interceding
      </a>
    </div>

    <div style="text-align: center; padding: 20px;">
      <p style="color: #1a2744; font-size: 14px; margin: 0; font-weight: 600;">
        Together, we're raising an altar of prayer over ${data.campusName}!
      </p>
      <p style="color: #6B7B6E; font-size: 13px; margin: 8px 0 0 0;">
        — The Reawakened Team
      </p>
    </div>
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
      from: 'Reawakened <noreply@reawakened.one>',
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
  const prayerTeamEmail = process.env.PRAYER_TEAM_EMAIL || 'prayer@reawakened.one';
  
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
    <div style="background: linear-gradient(135deg, #D4A574 0%, #C49464 100%); border-radius: 24px; padding: 40px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🙏</div>
      <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 12px 0; font-weight: 700;">
        New Prayer Request
      </h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">
        Someone needs your intercession
      </p>
    </div>

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
      <a href="https://reawakened.one/admin/prayer" style="display: inline-block; background: linear-gradient(135deg, #4A7C7C 0%, #3A6C6C 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        View in Prayer Dashboard
      </a>
    </div>

    <div style="text-align: center; padding: 20px; border-top: 1px solid #E8E4DE;">
      <p style="color: #6B7B6E; font-size: 13px; margin: 0;">
        "The prayer of a righteous person is powerful and effective." — James 5:16
      </p>
    </div>
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
      from: 'Reawakened Prayer <prayer@reawakened.one>',
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
