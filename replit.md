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
- `editing_service_settings` table: Photographer editing service configuration (enabled status, pricing model, rates, turnaround time)
- `editing_requests` table: Customer editing requests with lifecycle tracking (requested → accepted → in_progress → delivered → completed)

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

- **Editing Service Payments** (Dec 2025): Stripe payment integration for photo editing add-on services:
  - Payment authorization is held when customer requests editing (same pattern as photography bookings)
  - Payment is captured when customer approves delivered edited photos
  - Payment is cancelled if photographer declines the editing request
  - Server validates payment intent (amount, ownership, status) before creating request
  - New endpoint: POST /api/stripe/create-editing-payment-intent
  - Added stripePaymentId field to editing_requests table

- **Mobile-Optimized Modal System** (Nov 2025): All dialogs and modals now use consistent mobile-friendly widths (88vw, max-w-sm) with rounded corners. Base Dialog component updated to ensure future modals inherit these defaults automatically.

- **Enhanced Photographer Home Page** (Nov 2025): Redesigned photographer dashboard with:
  - Action item alerts for pending requests, photos awaiting upload, and editing requests
  - Upcoming sessions preview with customer details
  - Active editing work section
  - Recent reviews display
  - Helpful tips and "all set" status when no actions needed
  - Badge notifications on navigation for pending items

- **Profile Picture Editing** (Nov 2025): Photographers can now change their profile picture anytime with image cropping functionality. Camera button always visible on profile (no need to enter edit mode first).

- **Improved Booking Cards** (Nov 2025): Cleaner layout for "Ready for Photos" and "Completed Sessions" sections with better visual hierarchy, larger avatars, and prominent earnings display.

- **Toast Notifications for Expired Bookings** (Nov 2025): Both customers and photographers now receive toast alerts for expired booking requests instead of dedicated sections, providing a consistent experience.

- **Photo Editing Add-on Service** (Nov 2025): Complete editing services feature allowing photographers to offer post-delivery photo editing. Includes:
  - Photographer settings UI for enabling editing services with flat fee or per-photo pricing models
  - Customer UI to request editing on completed bookings with cost breakdown
  - Photographer workflow for accepting/declining requests and delivering edited photos
  - Revenue model: 20% platform commission applies to editing services (same as photography sessions)
  - Full request lifecycle tracking: requested → accepted → in_progress → delivered → completed

- **Customer Reviews System** (Nov 2025): Full review system with 1-5 star ratings, comments, and photographer response capability. Reviews display in a sliding bottom sheet for clean profile layout. Rating aggregates calculated from real review data.

- **Automatic Two-Way Live Location Sharing** (Dec 2025): Both customers and photographers now automatically share their live location with each other when within 10 minutes of the session start time. Features include:
  - Auto-start: Location sharing begins automatically when the page loads within the 10-minute window (browser still asks for permission first time)
  - Two-way visibility: Customers see photographer's location (green dot), photographers see customer's location (blue dot) plus their own (green dot)
  - Map indicators: Both maps show meeting point marker plus live location dots for each party currently sharing
  - No manual buttons: Removed the "Start Sharing" button - sharing is now seamless and automatic
  - Data stored in `live_locations` table with userId to distinguish between parties

- **Photographer Onboarding Flow** (Dec 2025): New photographers are now guided through a setup process after signup:
  - Dedicated onboarding page collects hourly rate, city/location, and optional bio
  - Signup redirects photographers to onboarding instead of dashboard
  - Existing photographers without profiles (logging in) are also redirected to onboarding
  - Profile is created via POST /api/photographers on completion
  - New photographers no longer show with misleading default ratings (fixed to show no rating until they receive actual reviews)

- **Payment Hold System** (Dec 2025): Photographer payments are now held until photos are uploaded, ensuring customers receive their photos:
  - Earnings are created with "held" status when booking is confirmed
  - Payment is released (status changes to "pending") automatically when photographer uploads photos
  - Photographer dashboard shows breakdown: Total Earned, Held (awaiting photo upload), Available (ready for withdrawal), Paid Out
  - Customer booking detail shows "Payment Protected" notice during session and "Photos Delivered" when complete
  - Encourages prompt photo delivery since photographers see held funds and clear path to release

- **Photographer Verification System** (Dec 2025): New photographers must be verified by admin before accepting bookings:
  - **Verification Status**: Photographers have a status of pending_review, verified, or rejected
  - **Portfolio Requirements**: New photographers must provide Instagram URL (required) and optional website URL during onboarding
  - **Pending Page**: Unverified photographers see a dedicated pending page explaining their application status
  - **Admin Dashboard**: Admin users can review applications at /admin, approve or reject with optional reason
  - **Enforcement**: Only verified photographers appear in search results and can accept bookings
  - **Admin Role**: New 'admin' role type added to users table
  - Existing photographers were migrated to 'verified' status

- **Booking Dismiss Feature** (Dec 2025): Both customers and photographers can now dismiss expired or declined booking notifications from their respective booking pages.

- **Founder CV Page** (Dec 2025): Interactive CV page at `/founder-cv` for investor materials:
  - Global Talent visa optimised format with Professional Summary, Innovation & Technical Leadership Highlights
  - Technical Skills grid with Engineering, CI/CD, Systems Architecture, and Quality Leadership categories
  - Detailed work experience with measurable impact metrics
  - Recognition & Leadership section highlighting CEO/CTO endorsements
  - Founder & Innovation Roadmap section for startup prototype work
  - Print-to-PDF functionality with proper A4 formatting and page breaks

- **Mobile App (React Native/Expo)** (Dec 2025): Complete mobile app in `/mobile` folder:
  - Expo Router for file-based navigation
  - Custom PhotoBackground component with animated scrolling stock images
  - Session-based authentication (cookies) with SecureStore flag for persistence
  - Customer screens: Home (photographer discovery), Bookings, Profile
  - Photographer screens: Dashboard, Bookings, Earnings, Profile with verification flow
  - Photographer onboarding: Collects hourly rate, location, Instagram (required), website
  - Verification flow routing: onboarding → pending → dashboard (based on verification status)
  - Run with `cd mobile && npm install && npx expo start`

**Demo Accounts:**
- Customer: customer@test.com / password
- Photographer: anna@snapnow.com / password
- Admin: admin@snapnow.com / admin123

## Feature Backlog

**Planned Features:**
- Push notifications for booking updates when app is closed (requires Firebase Cloud Messaging or similar service)
- Email notifications for booking confirmations, expirations, and photo deliveries
- In-app messaging between customers and photographers