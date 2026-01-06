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