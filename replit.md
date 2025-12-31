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
  - `sparks` - Daily devotional content
  - `sparkSubscriptions` - User subscriptions to spark categories
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