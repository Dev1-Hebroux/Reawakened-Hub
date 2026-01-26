# Reawakened Hub

## Overview

Reawakened Hub is a faith-based digital platform designed to help users grow spiritually through daily devotionals ("Sparks"), prayer sessions, community features, and personal development tools. The platform follows a 5-stage vision pathway (Identity → Purpose → Calling → Dominion → WDEP) and includes gamification elements like streaks and badges to encourage daily engagement.

The application is built as a full-stack TypeScript application with a React frontend and Express backend, using PostgreSQL for data persistence. It features AI-powered coaching, text-to-speech audio generation, real-time prayer sessions, and PWA capabilities for offline access.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for auth state
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Build Tool**: Vite with code splitting for optimized bundles
- **Testing**: Vitest with React Testing Library

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Dual auth system supporting Replit SSO and email/password with session cookies
- **API Design**: RESTful endpoints with Zod validation
- **File Storage**: Google Cloud Storage for media assets

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit for schema migrations (`drizzle.config.ts`)

### Key Design Patterns
- **Monorepo Structure**: Client code in `client/`, server in `server/`, shared types in `shared/`
- **Path Aliases**: `@/` maps to client source, `@shared/` maps to shared code
- **Combined API Endpoints**: Single endpoints like `/api/init` and `/api/sparks/dashboard` reduce network round trips
- **Session-based Auth**: Cookie-based sessions with CSRF protection
- **Optimistic Updates**: React Query mutations with optimistic UI updates

### PWA Features
- Service worker for offline caching
- Push notifications via web-push
- App shell pattern for instant loading
- IndexedDB for offline data storage

## External Dependencies

### Third-Party Services
- **OpenAI**: Text-to-speech audio generation for devotional content
- **Resend**: Transactional email delivery (verification, password reset)
- **Google Cloud Storage**: Media file storage (audio, images)
- **Replit Auth**: OAuth/OIDC integration for Replit users

### Database
- **PostgreSQL**: Primary data store, configured via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Key Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: For TTS audio generation
- `RESEND_API_KEY`: For email delivery
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`: For push notifications
- `SUPER_ADMIN_EMAILS`: Comma-separated list of admin email addresses

### Frontend Libraries
- Radix UI (comprehensive component primitives)
- Framer Motion (animations)
- Recharts (data visualization)
- date-fns (date utilities)
- canvas-confetti (celebration effects)