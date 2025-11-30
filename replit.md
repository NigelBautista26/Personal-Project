# SnapNow - Photography Marketplace Platform

## Overview

SnapNow is a marketplace platform that connects travelers with professional photographers - essentially an "Uber for Photography" service. Users can discover nearby photographers, view their portfolios, book sessions, and make payments. Photographers can manage their availability, track bookings, and monitor earnings through a dedicated dashboard.

The platform features location-based photographer discovery with an interactive map interface, real-time booking management, and integrated payment processing with platform fee handling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React-based single-page application built with Vite
- TypeScript for type safety
- Client-side routing using Wouter (lightweight alternative to React Router)

**State Management & Data Fetching:**
- TanStack Query (React Query) for server state management, caching, and data synchronization
- No global state library - relies on React Query's built-in caching and React's component state

**UI & Styling:**
- Tailwind CSS v4 for utility-first styling with custom design tokens
- shadcn/ui component library (Radix UI primitives with custom styling)
- Framer Motion for animations and transitions
- Dark mode theming with CSS custom properties

**Design Decisions:**
- Mobile-first responsive design optimized for on-the-go users
- Glass morphism UI effects for modern aesthetic
- Custom viewport breakpoint at 768px for mobile/desktop distinction

### Backend Architecture

**Server Framework:**
- Express.js REST API with session-based authentication
- HTTP server (no WebSocket implementation despite ws dependency)
- Modular route registration pattern

**Authentication & Security:**
- Session-based authentication using express-session
- Bcrypt for password hashing (10 salt rounds)
- HTTP-only cookies with SameSite protection
- Session secret required in production environment
- No JWT implementation

**Database Layer:**
- Drizzle ORM for type-safe database queries
- PostgreSQL via Neon serverless driver
- Schema-first approach with shared TypeScript types
- Database migrations managed through drizzle-kit

**Database Schema Design:**
- `users` table: Core authentication and user profiles (customer/photographer roles)
- `photographers` table: Extended profile data with location coordinates, portfolio, pricing
- `bookings` table: Session reservations with status tracking and payment references
- `earnings` table: Payment tracking for photographers with platform fee calculations
- `reviews` table: Customer reviews with 1-5 star ratings, comments, and photographer responses (unique constraint per booking)

**Key Architectural Patterns:**
- Repository pattern via `IStorage` interface (DatabaseStorage implementation)
- Shared schema definitions between client and server
- Type-safe data transfer using Zod validation schemas
- Separation of concerns: routes, storage, and business logic

### External Dependencies

**Object Storage:**
- Google Cloud Storage for photographer portfolio images and profile pictures
- Custom ACL (Access Control List) policy system for object permissions
- Replit-specific authentication using sidecar endpoint (`http://127.0.0.1:1106`)
- Public object search paths configurable via environment variables

**Payment Processing:**
- Stripe integration (dependencies present but implementation not visible in provided files)
- Platform fee model: Bookings include totalAmount, platformFee, and photographerEarnings fields
- Stripe account ID stored per photographer for marketplace payouts

**Third-Party Services:**
- Google Cloud Storage SDK (`@google-cloud/storage`)
- Neon serverless PostgreSQL (`@neondatabase/serverless`)
- File upload handling via Uppy (`@uppy/core`, `@uppy/dashboard`, `@uppy/react`)

**Development Tools:**
- Vite for development server and build process
- Replit-specific plugins for error handling and development UI
- ESBuild for server-side bundling in production
- Custom meta images plugin for OpenGraph/Twitter card generation

**Environment Requirements:**
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (required in production)
- `PUBLIC_OBJECT_SEARCH_PATHS`: Comma-separated paths for public object access
- `NODE_ENV`: Environment indicator (development/production)

**Notable Architectural Decisions:**

1. **Session vs JWT**: Chose session-based auth for simpler implementation and better security for a marketplace requiring persistent sessions

2. **Drizzle ORM**: Selected for type safety and PostgreSQL compatibility, avoiding the overhead of heavier ORMs while maintaining developer experience

3. **Google Cloud Storage**: Required for Replit deployment; custom ACL layer provides granular permission control

4. **Monorepo Structure**: Single repository with shared types between client/server reduces duplication and ensures type consistency

5. **Location-based Discovery**: Latitude/longitude stored as decimals in PostgreSQL for proximity queries and map rendering

6. **Platform Fee Model**: Three-way split calculation (total, platform fee, photographer earnings) stored per booking for financial transparency and audit trails

7. **Dynamic Booking Expiration**: Response windows calculated based on session urgency (30min for same-day, up to 24h for future sessions)

## Recent Changes

- **Customer Reviews System** (Nov 2025): Full review system with 1-5 star ratings, comments, and photographer response capability. Reviews display in a sliding bottom sheet for clean profile layout. Rating aggregates calculated from real review data.

## Feature Backlog

**Planned Features:**
- Push notifications for booking updates when app is closed (requires Firebase Cloud Messaging or similar service)
- Email notifications for booking confirmations, expirations, and photo deliveries
- In-app messaging between customers and photographers