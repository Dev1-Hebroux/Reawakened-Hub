# Reawakened Hub - Onboarding & Testing Guide

## Overview

Reawakened Hub is a faith-based digital platform designed to help users grow spiritually through daily devotionals ("Sparks"), prayer sessions, community features, and personal development tools.

---

## Getting Started

### 1. Access the Platform

- **Development**: Run `npm run dev` or use the "Start Server" workflow
- **Production**: Visit your published URL (e.g., `your-app.replit.app`)

### 2. Create an Account

1. Click **"Join Now"** in the navigation bar
2. Choose your sign-up method:
   - **Email/Password**: Enter your email and create a password
   - **Replit Auth**: Sign in with your Replit account (development only)
3. Verify your email if using email/password registration

### 3. Complete Onboarding

After signing up, you'll be guided through:
- Setting your spiritual goals
- Choosing focus areas
- Configuring notification preferences

---

## Core Features to Test

### Daily Sparks (Devotionals)

| Feature | How to Test |
|---------|-------------|
| View Today's Spark | Go to Home page - today's spark appears at the top |
| Read Full Devotional | Click any spark card to view the full teaching |
| Listen to Audio | Click the play button on a spark detail page |
| Bookmark Spark | Click the bookmark icon while viewing a spark |
| Complete Action | Click "I Did It" after reading the daily action |
| Journal Entry | Write a reflection in the journal section |

### AI Coach (Awake AI)

| Feature | How to Test |
|---------|-------------|
| Open AI Coach | Click the AI chat icon in the navigation |
| Start New Chat | Click "Start New Conversation" |
| Send Message | Type a question about goals, faith, or personal growth |
| View History | Previous conversations appear in the sidebar |

### Prayer Sessions

| Feature | How to Test |
|---------|-------------|
| Join Live Session | Check the Community Hub for active sessions |
| Submit Prayer Request | Use the prayer request form |
| Intercede for Others | Join an intercession session |

### Community Features

| Feature | How to Test |
|---------|-------------|
| View Blog Posts | Navigate to the Blog section |
| View Events | Check the Events page for upcoming gatherings |
| Outreach Page | View outreach opportunities |

### Personal Growth

| Feature | How to Test |
|---------|-------------|
| Set Goals | Go to Settings or Profile to set personal goals |
| Track Habits | Check daily habit completion |
| View Streaks | See your engagement streak on the dashboard |
| Earn Badges | Complete actions to unlock badges |

### Journeys (Reading Plans)

| Feature | How to Test |
|---------|-------------|
| Browse Journeys | Click "Explore Reading Plans" |
| Start a Journey | Select a journey and click "Start" |
| Track Progress | View your progress in the journey dashboard |

---

## Notification Testing

### Enable Push Notifications

1. Go to **Settings** > **Notifications**
2. Click "Enable Notifications"
3. Allow browser notification permission
4. Test notifications work by clicking "Send Test Notification"

### Notification Types

- Daily devotional reminders
- Prayer session alerts
- Event reminders
- Streak encouragement

---

## Admin Features

### Access Admin Panel

1. Sign in with an admin account (email must be in `SUPER_ADMIN_EMAILS` env var)
2. Navigate to `/admin` or click Admin in the menu

### Admin Capabilities

| Feature | Location |
|---------|----------|
| Manage Sparks | Admin > Content > Sparks |
| Manage Blog Posts | Admin > Content > Blog |
| Manage Events | Admin > Content > Events |
| View Analytics | Admin > Dashboard |
| Manage Users | Admin > Users |

---

## Testing Checklist

### Authentication
- [ ] Sign up with email/password
- [ ] Sign in with existing account
- [ ] Password reset flow
- [ ] Sign out

### Content
- [ ] Home page loads with today's spark
- [ ] Spark cards navigate to detail page
- [ ] Audio playback works
- [ ] Images load correctly

### User Actions
- [ ] Bookmark a spark
- [ ] Complete daily action
- [ ] Write journal entry
- [ ] Chat with AI coach

### Navigation
- [ ] All menu links work
- [ ] Mobile navigation works
- [ ] Back button functions correctly

### PWA Features
- [ ] App installs on mobile
- [ ] Offline mode shows cached content
- [ ] Push notifications received

---

## Environment Variables

For the platform to work fully, ensure these are configured:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection (auto-configured) |
| `OPENAI_API_KEY` | AI Coach & Text-to-Speech |
| `RESEND_API_KEY` | Email delivery |
| `VAPID_PUBLIC_KEY` | Push notifications |
| `VAPID_PRIVATE_KEY` | Push notifications |
| `SUPER_ADMIN_EMAILS` | Admin access (comma-separated) |

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Spark audio not playing | Check OpenAI API key is set |
| Notifications not working | Verify VAPID keys are configured |
| Login not working | Check if cookies are enabled |
| 401 errors | Normal for unauthenticated users |

### Getting Help

- Check browser console for JavaScript errors
- Check server logs for API errors
- Verify all environment variables are set

---

## Contact

For issues or questions, contact the development team.
