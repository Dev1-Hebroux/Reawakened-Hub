import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
