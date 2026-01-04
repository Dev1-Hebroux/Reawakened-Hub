# Reawakened Platform

## Overview

Reawakened is a digital missions platform designed to help young people (ages 15-45) encounter Jesus, grow in discipleship, and engage in global outreach. The platform functions as a "digital revival + mission movement" with the core philosophy of **Encounter → Equip → Mobilise**.

The application is a full-stack TypeScript project with a React frontend and Express backend, featuring community engagement tools, daily devotional content ("Sparks"), event management, blog functionality, and mission coordination features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with warm coaching palette (sage #7C9A8E, cream #FAF8F5, teal #4A7C7C, beige #D4A574)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Fonts**: DM Sans (body) and Space Grotesk (display headings)
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit OpenID Connect (OIDC) with Passport.js
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage
- **API Pattern**: RESTful JSON APIs under `/api/*` prefix

### Data Storage
- **Database**: PostgreSQL (provisioned via Replit)
- **Schema Location**: `shared/schema.ts` using Drizzle table definitions
- **Key Tables**:
  - `users` - User accounts (required for Replit Auth)
  - `sessions` - Session storage (required for Replit Auth)
  - `posts` - Community hub posts (mission reports, prayer requests)
  - `reactions` - Post reactions/likes
  - `sparks` - Daily devotional content (enhanced for DOMINION campaign)
  - `sparkSubscriptions` - User subscriptions to spark categories
  - `reflectionCards` - Dual-mode reflection cards (base + faith overlay)
  - `events` - Mission events and gatherings
  - `eventRegistrations` - Event sign-ups
  - `blogPosts` - Blog articles
  
**Vision Pathway Tables** (Life Vision & Goal feature):
  - `pathwaySessions` - Main container for user's vision journey
  - `wheelLifeEntries` - Wheel of Life category scores (1-10)
  - `focusAreas` - User's priority areas from wheel assessment
  - `valuesSelection` - User's chosen values and meanings
  - `visionStatements` - Vision, identity statements, top outcomes
  - `purposeFlower` - Ikigai-style purpose (passion, strengths, needs, rewards)
  - `visionGoals` - SMART goals with metrics and deadlines
  - `goalMilestones` - Milestones for tracking goal progress
  - `ninetyDayPlans` - 90-day action plans with key results
  - `visionHabits` - Trackable daily/weekly habits
  - `habitLogs` - Daily habit completion logs
  - `dailyCheckins` - Daily energy and focus check-ins
  - `weeklyReviews` - Weekly reflection and planning
  - `visionExports` - PDF/export records

**Bible Reading Plans Tables** (Personalized Reading Journey):
  - `readingPlans` - Reading plan catalog with topics, duration, maturity levels
  - `readingPlanDays` - Daily content with scripture, devotionals, reflection questions
  - `userSpiritualProfiles` - User spiritual maturity level and topic interests
  - `userPlanEnrollments` - User enrollment in plans with progress tracking
  - `userReadingProgress` - Daily reading completion logs with journaling

**Growth Tools Tables** (Personal Development Tools):
  - `growthTracks` - Growth track definitions (Personal Mastery, Communication, Leadership)
  - `growthModules` - Modules within tracks
  - `assessments` - Assessment configurations
  - `assessmentQuestions` - Question bank for assessments
  - `assessmentAttempts` - User assessment submissions
  - `strengthsCatalog` - 24 character strengths definitions
  - `userStrengths` - User's Top 5 strengths selections
  - `styleProfiles` - DISC-inspired style profiles
  - `userStyles` - User's primary/secondary style results
  - `eqDomains` - 4 EQ domains (Self-Awareness, Self-Management, Social Awareness, Relationship Management)
  - `eqPractices` - EQ micro-practice library
  - `wdepExercises` - WDEP reality therapy exercises
  - `wdepResponses` - User responses for each WDEP screen
  - `wdepExperimentLogs` - Weekly experiment tracking
  - `scaExercises` - Self-Concordant Action exercises
  - `scaFocusItems` - Focus list items with motivation tracking

### Authentication Flow
- Uses Replit's built-in OIDC authentication
- Session-based auth with PostgreSQL session store
- Protected routes use `isAuthenticated` middleware
- User data synced via `upsertUser` on login

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components (layout, sections, ui)
│   │   │   ├── Assessment.tsx  # Reusable assessment engine
│   │   ├── pages/        # Route pages
│   │   │   ├── TrackHub.tsx    # Growth Tracks hub
│   │   │   ├── WdepTool.tsx    # WDEP reality therapy tool
│   │   │   ├── StrengthsTool.tsx  # Character strengths discovery
│   │   │   ├── StylesTool.tsx  # 4 Styles communication quiz
│   │   │   ├── EqTool.tsx      # EQ Micro-Skills assessment
│   │   │   ├── ScaTool.tsx     # Self-Concordant Action builder
│   │   │   ├── ReadingPlans.tsx   # Bible reading plans discovery
│   │   │   ├── ReadingPlanDetail.tsx  # Plan detail with daily readings
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations
│   └── replitAuth.ts # Authentication setup
├── shared/           # Shared types and schema
│   └── schema.ts     # Drizzle database schema
└── migrations/       # Drizzle migration files
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle Kit**: Schema migrations via `npm run db:push`

### Authentication
- **Replit OIDC**: OAuth provider at `https://replit.com/oidc`
- **Required env vars**: `REPL_ID`, `SESSION_SECRET`, `ISSUER_URL`

### Frontend Libraries
- **@tanstack/react-query**: Data fetching and caching
- **framer-motion**: Animation library
- **wouter**: Client-side routing
- **lucide-react**: Icon library
- **sonner**: Toast notifications

### UI Framework
- **shadcn/ui**: Component system built on Radix UI
- **Radix UI primitives**: Accessible UI components
- **Tailwind CSS v4**: Utility-first styling with `@tailwindcss/vite` plugin

### Build & Development
- **Vite**: Frontend bundler with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

## Brand Assets

### Logo Files (HD/4K)
All logos stored in `attached_assets/`:

**Primary Logos (278x141 - Current in Use)**:
- `Reawakened_278_141_logo_bigger_1767192125280.png` - Dark navy text (for light backgrounds) - ACTIVE
- `Reawakened_278_141_logo_white_1767192258915.png` - White text (for dark/glass backgrounds) - ACTIVE

**Legacy Dark Logo** (for light backgrounds):
- `Reawakened_Logo_1_new_1767191127649.png` - HD dark logo (1024x1024)
- `Reawakened_Logo-05_1767191127650.jpg` - JPG version

**Legacy Light Logo** (for dark backgrounds):
- `8_1767191207405.png` - White text on dark background
- `9_1767191207410.png` - Alternative white version
- `10_1767191207411.png` - Alternative white version

**Dark Blue Background Versions**:
- `1_1767191238762.png` - Dark on navy background
- `2_1767191238762.png` - Alternative dark on navy

### Brand Colors
- **Navy Blue**: #1a2744 (dark overlays, gradients)
- **Sage Green**: #7C9A8E
- **Cream**: #FAF8F5
- **Muted Teal**: #4A7C7C
- **Beige**: #D4A574
- **Primary Orange**: (defined in Tailwind config)

## DOMINION Campaign (19 Jan - 17 Feb 2026)

### Campaign Overview
30-day devotional campaign targeting 5 audience segments with 360 pieces of content total.

### Content Structure
- **30 Global Sparks** - Universal daily devotionals
- **150 Segmented Sparks** - 30 × 5 audiences (tailored messaging)
- **30 Global Reflection Cards** - Universal reflection prompts
- **150 Segmented Reflection Cards** - 30 × 5 audiences

### Audience Segments
1. `schools` - Students (ages 15-18)
2. `universities` - University students
3. `early-career` - "The 9-5 Reset" (young professionals)
4. `builders` - Entrepreneurs and creatives
5. `couples` - Young couples

### Week Themes
1. Identity & Belonging (Days 1-6)
2. Prayer & Presence (Days 7-12)
3. Peace & Anxiety (Days 13-18)
4. Bold Witness (Days 19-24)
5. Commission (Days 25-30)

### Content Modes
- **Reflection Mode** - Seeker-sensitive base content (quote, question, action)
- **Faith Overlay** - Additional scripture reference + prayer line

### Daily Rotation
- Content rotates at 05:00 GMT (Europe/London timezone)
- `daily_date` field controls which content shows each day
- Segment-specific content prioritized, falls back to global if no match

### Key Schema Fields (sparks table)
- `status` - draft, scheduled, published, archived
- `publish_at` - When to auto-publish (timestamp)
- `daily_date` - Which day to show (YYYY-MM-DD format)
- `featured` - Homepage highlight flag
- `audience_segment` - Target audience (null = global)
- `week_theme` - Campaign week category
- `prayer_line` - Faith Overlay prayer text
- `cta_primary` - Call-to-action text

### API Endpoints
- `GET /api/sparks/published?audience=X` - Published sparks for audience
- `GET /api/sparks/featured?audience=X` - Featured sparks for audience
- `GET /api/sparks/today?audience=X` - Today's devotional for audience
- `GET /api/reflection-cards?audience=X` - Reflection cards for audience
- `GET /api/reflection-cards/today?audience=X` - Today's reflection card

## Automated Content Sync System

### Overview
The platform uses an automated content synchronization system to ensure production always has the latest content. This is fully automated with no manual intervention required.

### How It Works

**Auto-Seed on Startup** (`server/auto-seed.ts`):
- On server startup, checks if DOMINION campaign content exists (looks for Day 1 sparks with date 2026-01-03)
- If production database is empty, automatically seeds 180 sparks + 180 reflection cards
- Uses `createSpark()` and `createReflectionCard()` for initial population

**Nightly Content Sync** (`server/content-sync.ts`):
- Scheduled job runs automatically at 23:00 London time every day
- Uses `upsertSpark()` and `upsertReflectionCard()` to update existing content or add new content
- Matches content by `dailyDate + audienceSegment + title` for sparks
- Matches content by `dailyDate + audienceSegment` for reflection cards
- Ensures any content updates made in development are synced to production before midnight

### Key Files
- `server/auto-seed.ts` - Startup seeding for empty databases
- `server/content-sync.ts` - Nightly sync scheduler and upsert logic
- `server/storage.ts` - Contains `upsertSpark()` and `upsertReflectionCard()` methods

### Database Considerations
- Replit maintains separate development and production PostgreSQL databases
- Schema changes sync on publish, but DATA does not automatically sync
- The nightly sync ensures content is always up-to-date in production

## Email Notification System

### Overview
The platform uses Resend for transactional email notifications. All user form submissions trigger confirmation emails, and scheduled jobs send daily devotionals and event reminders.

### Configuration
- **Provider**: Resend (requires `RESEND_API_KEY` secret)
- **From Addresses**: `noreply@reawakened.one`, `prayer@reawakened.one`

### Transactional Emails (server/email.ts)
Emails sent immediately when users take action:

| Trigger | Email Function | Description |
|---------|---------------|-------------|
| `/api/subscribe` | `sendSubscriptionWelcomeEmail` | Welcome email with subscribed categories |
| `/api/prayer-requests` | `sendPrayerRequestConfirmationEmail` | Confirmation to submitter |
| `/api/prayer-requests` | `sendPrayerRequestNotification` | Alert to prayer team |
| `/api/testimonies` | `sendTestimonyAcknowledgementEmail` | Acknowledgement to submitter |
| `/api/volunteer` | `sendVolunteerConfirmationEmail` | Volunteer signup confirmation |
| `/api/mission-registration` | `sendMissionTripInterestEmail` | Mission interest confirmation |
| `/api/event-registrations` | `sendEventRegistrationEmail` | Event registration confirmation |
| `/api/challenges/:id/join` | `sendChallengeEnrollmentEmail` | Challenge enrollment confirmation |
| `/api/prayer-pods` (create) | `sendPrayerPodNotificationEmail` | Pod creation confirmation |
| `/api/prayer-pods/:id/join` | `sendPrayerPodNotificationEmail` | Pod join confirmation |

### Scheduled Emails (server/notification-scheduler.ts)
Automated emails sent on schedule:

| Job | Time | Description |
|-----|------|-------------|
| Daily Devotional | 00:01 London | Today's Spark to subscribers |
| Event Reminders | 18:00 London | 24-hour reminder before events |

### User Preferences
Respects `notificationPreferences` table settings:
- `emailEnabled` - Master toggle for all emails
- `newSparkAlerts` - Daily devotional opt-in
- `eventReminders` - Event reminder opt-in

### Key Files
- `server/email.ts` - Email template functions
- `server/notification-scheduler.ts` - Scheduled job management
- `server/routes.ts` - API routes with email triggers