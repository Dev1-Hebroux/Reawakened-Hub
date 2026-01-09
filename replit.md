# Reawakened Platform

## Overview
Reawakened is a digital missions platform for young people (ages 15-35) focused on spiritual encounter, discipleship, and global outreach. It operates as a "digital revival + mission movement" guided by the philosophy of **Encounter → Equip → Mobilise**. The platform is a full-stack TypeScript application with a React frontend and Express backend, offering community features, daily devotionals ("Sparks"), event management, blogging, and mission coordination. It includes specialized tools for personal growth, Bible reading plans, and a comprehensive vision pathway.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Styling**: Tailwind CSS v4 with a warm coaching palette (sage #7C9A8E, cream #FAF8F5, teal #4A7C7C, beige #D4A574).
- **UI Components**: shadcn/ui library utilizing Radix UI primitives.
- **Animations**: Framer Motion for transitions and micro-interactions.
- **Fonts**: DM Sans (body) and Space Grotesk (display headings).

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Wouter for routing, TanStack React Query for server state.
- **Backend**: Express.js with TypeScript, RESTful JSON APIs (`/api/*`).
- **Database**: PostgreSQL with Drizzle ORM.
- **Authentication**: Replit OpenID Connect (OIDC) via Passport.js, session management with `express-session` and `connect-pg-simple`.
- **Project Structure**: Clear separation between `client/` (React), `server/` (Express), `shared/` (common types/schema), and `migrations/`.

### Feature Specifications
- **Community Hub**: Posts (mission reports, prayer requests) and reactions.
- **Sparks**: Daily devotional content with audience segmentation, reflection cards, and a multi-mode content delivery (reflection and faith overlay).
- **Vision Pathway**: Tools for life visioning, goal setting (SMART goals), habit tracking, and daily/weekly check-ins.
- **Bible Reading Plans**: Personalized reading journeys based on spiritual maturity and interests, with progress tracking.
- **Growth Tools**: Tracks for personal mastery, communication, leadership, including assessments, strengths discovery, style profiles (DISC-inspired), EQ exercises, WDEP reality therapy, and Self-Concordant Action builders.
- **DOMINION Campaign**: A 30-day devotional campaign with segmented content for schools, universities, early-career, builders, and couples, following specific weekly themes. Content rotates daily and prioritizes segment-specific devotionals.
- **Automated Content Sync**: An `auto-seed` system runs on every server startup (development and production) to `upsert` all Spark and Reflection Card content, ensuring data consistency across environments. A nightly sync acts as a backup.
- **Email Notifications**: Transactional and scheduled emails using Resend for user actions (subscriptions, prayer requests, event registrations) and daily devotionals/event reminders, respecting user notification preferences.
- **Background Job Scheduler**: Cron-based job scheduler (`server/lib/jobScheduler.ts`) for processing scheduled notifications every 5 minutes and other recurring tasks.
- **Notification API**: RESTful endpoints (`/api/notifications/*`) for fetching, marking as read, and managing notification preferences.
- **Recommendation API**: RESTful endpoints (`/api/recommendations/*`) for personalized reading plan recommendations, continue reading suggestions, and streak data.
- **PWA Infrastructure**: Service worker (`public/sw.js`) for offline caching and push notifications, plus IndexedDB-based offline service (`client/src/services/offlineService.ts`) with sync queue.

### Performance Optimizations (January 2026)
- **Compression Middleware**: Response compression via `server/middleware/performance.ts` with gzip (~70% payload reduction).
- **Server Timing Headers**: Performance monitoring via Server-Timing response headers.
- **Slow Request Logging**: Logs requests >300ms for performance monitoring.
- **Dashboard API**: `/api/sparks/dashboard` consolidates sparks, today's spark, featured, reflection cards, and prayer sessions into one request.
- **Init Endpoint**: `/api/init` provides auth state, CSRF token, notifications count, preferences, and streak data (not yet consumed by frontend).
- **Sparks Page Optimization**: Uses `useDashboard` hook to fetch consolidated data in one request.
- **CSRF Token Prefetch**: AuthContext prefetches CSRF token with request deduplication.

#### Completed Optimizations (January 2026)
- Frontend now consumes `/api/init` endpoint on bootstrap instead of separate `/api/auth/me` calls.
- Streak storage returns both current and longest streak values (UTC-safe calculation).
- Bootstrap data (notifications, preferences, streak) hydrated after login/register and cleared on logout.
- **Service Worker API Caching**: Stale-while-revalidate strategy for API responses (`/api/sparks/*`, `/api/journeys`, `/api/reflection-cards/today`) with configurable TTLs (5-60 min). Uses `event.waitUntil()` for reliable background cache updates.

#### Follow-up Optimizations (TODO)
- Implement per-user auth caching with proper TTL and isolation.
- Add granular loading/error states to useDashboard hook for better UX.
- Add automated test coverage for streak calculations (DST transitions, duplicate entries).

## External Dependencies

### Database
- **PostgreSQL**: Primary database.
- **Drizzle Kit**: For schema migrations.

### Authentication
- **Replit OIDC**: OAuth provider.

### Frontend Libraries
- **@tanstack/react-query**: Data fetching and caching.
- **framer-motion**: Animations.
- **wouter**: Client-side routing.
- **lucide-react**: Icon library.
- **sonner**: Toast notifications.

### UI Framework
- **shadcn/ui**: Component library.
- **Radix UI primitives**: Accessible UI components.
- **Tailwind CSS v4**: Utility-first styling.

### Build & Development
- **Vite**: Frontend bundler.
- **esbuild**: Server bundling.
- **tsx**: TypeScript execution.

### Email Service
- **Resend**: Transactional and scheduled email delivery.