# SnapNow - Complete Technical Documentation

> A comprehensive guide for developers building on or porting the SnapNow platform

## Overview

**SnapNow** is a fully functional marketplace platform connecting travelers with professional photographers. Think "Uber for Photography" - customers can discover nearby photographers, view portfolios, book sessions, and pay instantly. Photographers earn money with a transparent platform commission model.

**Live Demo**: Built and running on Replit
**Demo Accounts**:
- Customer: `customer@test.com` / `password`
- Photographer: `anna@snapnow.com` / `password`
- Admin: `admin@snapnow.com` / `admin123`

---

## Tech Stack Summary

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.x |
| TypeScript | Type Safety | 5.x |
| Vite | Build Tool & Dev Server | 5.x |
| TanStack Query | Server State Management | 5.x |
| Wouter | Client-side Routing | 3.x |
| Tailwind CSS | Styling | 4.x |
| shadcn/ui | Component Library (Radix UI) | Latest |
| Framer Motion | Animations | 11.x |
| Leaflet + React-Leaflet | Interactive Maps | 1.9.x |
| Recharts | Data Visualization | 2.x |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 20.x |
| Express.js | Web Framework | 4.x |
| TypeScript | Type Safety | 5.x |
| Drizzle ORM | Database Queries | Latest |
| PostgreSQL | Database (Neon Serverless) | 15.x |
| express-session | Session Management | 1.x |
| bcrypt | Password Hashing | 5.x |
| Zod | Schema Validation | 3.x |

### External Services
| Service | Purpose |
|---------|---------|
| Stripe Connect | Payment Processing (Authorization Holds) |
| Google Cloud Storage | Image/File Storage |
| Neon | Serverless PostgreSQL |

---

## Project Structure

```
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities (queryClient, utils)
│   │   ├── pages/            # Route components
│   │   └── App.tsx           # Main app with routing
│   └── index.html
├── server/                    # Backend Express application
│   ├── routes.ts             # API route definitions
│   ├── storage.ts            # Database operations (IStorage interface)
│   ├── index.ts              # Server entry point
│   └── vite.ts               # Vite dev server integration
├── shared/                    # Shared between client/server
│   └── schema.ts             # Drizzle schema + Zod types
├── scripts/                   # Utility scripts
└── drizzle.config.ts         # Database config
```

---

## Database Schema

### Core Tables

```sql
-- Users (Authentication)
users
├── id: uuid (PK)
├── email: text (unique)
├── password: text (bcrypt hashed)
├── fullName: text
├── role: enum ('customer', 'photographer', 'admin')
└── createdAt: timestamp

-- Photographer Profiles
photographers
├── id: uuid (PK)
├── userId: uuid (FK → users)
├── bio: text
├── hourlyRate: decimal
├── location: text (city name)
├── latitude: decimal
├── longitude: decimal
├── rating: decimal (calculated from reviews)
├── reviewCount: integer
├── profileImageUrl: text
├── portfolioImages: text[] (array)
├── isAvailable: boolean
├── stripeAccountId: text
├── instagramUrl: text
├── websiteUrl: text
└── verificationStatus: enum ('pending_review', 'verified', 'rejected')

-- Bookings
bookings
├── id: uuid (PK)
├── customerId: uuid (FK → users)
├── photographerId: uuid (FK → photographers)
├── duration: integer (hours)
├── location: text
├── latitude: decimal
├── longitude: decimal
├── scheduledDate: date
├── scheduledTime: text
├── totalAmount: decimal
├── serviceFee: decimal (10% customer fee)
├── platformFee: decimal (20% photographer fee)
├── photographerEarnings: decimal (80% of booking)
├── status: enum ('pending', 'confirmed', 'completed', 'cancelled', 'expired', 'declined')
├── stripePaymentIntentId: text
├── expiresAt: timestamp
├── customerDismissed: boolean
├── photographerDismissed: boolean
├── photoUrls: text[] (delivered photos)
└── createdAt: timestamp

-- Earnings Tracking
earnings
├── id: uuid (PK)
├── photographerId: uuid (FK → photographers)
├── bookingId: uuid (FK → bookings)
├── grossAmount: decimal
├── platformFee: decimal
├── netAmount: decimal
├── status: enum ('held', 'pending', 'paid')
├── paidAt: timestamp
└── createdAt: timestamp

-- Reviews
reviews
├── id: uuid (PK)
├── bookingId: uuid (FK → bookings, unique)
├── customerId: uuid (FK → users)
├── photographerId: uuid (FK → photographers)
├── rating: integer (1-5)
├── comment: text
├── photographerResponse: text
└── createdAt: timestamp

-- Photo Editing Service
editing_service_settings
├── id: uuid (PK)
├── photographerId: uuid (FK → photographers, unique)
├── isEnabled: boolean
├── pricingModel: enum ('flat', 'per_photo')
├── flatRate: decimal
├── perPhotoRate: decimal
└── turnaroundDays: integer

editing_requests
├── id: uuid (PK)
├── bookingId: uuid (FK → bookings)
├── customerId: uuid (FK → users)
├── photographerId: uuid (FK → photographers)
├── photoCount: integer
├── totalCost: decimal
├── platformFee: decimal
├── photographerEarnings: decimal
├── status: enum ('requested', 'accepted', 'declined', 'in_progress', 'delivered', 'completed')
├── editedPhotoUrls: text[]
├── revisionCount: integer
└── createdAt: timestamp

-- Live Location Sharing
live_locations
├── id: uuid (PK)
├── bookingId: uuid (FK → bookings)
├── userId: uuid (FK → users)
├── latitude: decimal
├── longitude: decimal
└── updatedAt: timestamp
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Create new user account |
| POST | `/api/login` | Authenticate user |
| POST | `/api/logout` | End session |
| GET | `/api/user` | Get current user |

### Photographers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/photographers` | List all verified photographers |
| GET | `/api/photographers/:id` | Get photographer profile |
| POST | `/api/photographers` | Create photographer profile |
| PUT | `/api/photographers/:id` | Update photographer profile |
| GET | `/api/photographer/me` | Get current photographer's profile |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get user's bookings |
| GET | `/api/bookings/:id` | Get booking details |
| POST | `/api/bookings` | Create new booking (with Stripe hold) |
| PUT | `/api/bookings/:id/accept` | Photographer accepts (captures payment) |
| PUT | `/api/bookings/:id/decline` | Photographer declines |
| PUT | `/api/bookings/:id/complete` | Mark as completed |
| PUT | `/api/bookings/:id/dismiss` | Dismiss notification |
| POST | `/api/bookings/:id/photos` | Upload delivered photos |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/photographers/:id/reviews` | Get photographer's reviews |
| POST | `/api/bookings/:id/review` | Submit review |
| POST | `/api/reviews/:id/respond` | Photographer responds |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/create-payment-intent` | Create Stripe authorization hold |
| GET | `/api/photographer/earnings` | Get earnings breakdown |
| POST | `/api/stripe/onboard` | Start Stripe Connect onboarding |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/pending-photographers` | List pending applications |
| POST | `/api/admin/photographers/:id/verify` | Approve photographer |
| POST | `/api/admin/photographers/:id/reject` | Reject photographer |

### Object Storage
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/objects/upload` | Get presigned upload URL |
| GET | `/public-objects/:path` | Serve public images |
| POST | `/api/photographer-images` | Save image to profile |

---

## Key Features Implemented

### 1. Payment System (Stripe Connect)
- **Authorization Holds**: Customer's card is authorized but not charged until photographer accepts
- **Dual Fee Structure**: 10% customer service fee + 20% photographer commission = 30% total take rate
- **Payment Protection**: Funds held until photographer uploads photos
- **Connected Accounts**: Each photographer has their own Stripe account for payouts

### 2. Photographer Verification
- New photographers submit portfolio (Instagram required)
- Admin dashboard for reviewing applications
- Only verified photographers appear in search
- Rejection reasons provided to applicants

### 3. Booking Flow
1. Customer searches photographers by location
2. Selects photographer, date, time, duration
3. Payment authorized (not captured)
4. Photographer has time window to accept/decline
5. On accept: payment captured, booking confirmed
6. On decline/expire: authorization released

### 4. Photo Delivery
- Photographer uploads photos after session
- Customer can view and download
- Payment released to photographer after upload

### 5. Review System
- 1-5 star ratings with comments
- Photographer can respond to reviews
- Ratings aggregated for photographer profiles

### 6. Photo Editing Add-on
- Photographers can offer editing services
- Flat fee or per-photo pricing
- Unlimited revisions until customer satisfied
- 20% platform commission on editing services

### 7. Live Location Sharing
- Automatic sharing within 10 minutes of session
- Two-way visibility (customer sees photographer, vice versa)
- Uses browser geolocation API

---

## Environment Variables

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/db
PGHOST=...
PGPORT=5432
PGUSER=...
PGPASSWORD=...
PGDATABASE=...

# Session Security
SESSION_SECRET=your-secret-key

# Object Storage
DEFAULT_OBJECT_STORAGE_BUCKET_ID=...
PUBLIC_OBJECT_SEARCH_PATHS=/bucket/public
PRIVATE_OBJECT_DIR=/bucket/.private

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
```

---

## Authentication Flow

### Session-based Auth
1. User submits credentials
2. Server validates and creates session
3. Session ID stored in HTTP-only cookie
4. All requests include cookie automatically
5. Server validates session on each request

### Password Security
- Bcrypt with 10 salt rounds
- Passwords never stored in plain text
- Session secrets required in production

---

## Image Storage Flow

### Upload Process
1. Frontend requests presigned URL from `/api/objects/upload`
2. Backend generates URL valid for 15 minutes
3. Frontend uploads directly to Google Cloud Storage
4. Frontend notifies backend with file path
5. Backend sets ACL policy and stores reference

### Serving Images
- Public images: No auth required, served via `/public-objects/`
- Private images: Auth + ACL check required

---

## Native App Conversion Guide

### Recommended Approach: React Native + Expo

The frontend is React-based, making React Native the natural choice.

#### What Transfers Directly
- Business logic and API calls
- TanStack Query data fetching patterns
- TypeScript types from `shared/schema.ts`
- Authentication flow logic

#### What Needs Replacement
| Web | React Native |
|-----|--------------|
| Tailwind CSS | NativeWind or StyleSheet |
| shadcn/ui | React Native Paper or custom |
| Wouter routing | React Navigation |
| Leaflet maps | react-native-maps |
| Browser geolocation | expo-location |
| File upload | expo-image-picker |

#### Backend Considerations
- Backend API remains unchanged
- Update CORS settings for mobile app
- Consider adding push notifications (Firebase)
- May need refresh token system for mobile sessions

### Key Files to Reference
- `shared/schema.ts` - All data types
- `server/routes.ts` - Complete API documentation
- `server/storage.ts` - Database operations
- `client/src/lib/queryClient.ts` - API call patterns

---

## Troubleshooting

### Database Issues
```bash
# Push schema changes
npm run db:push

# Force reset (loses data)
npm run db:push --force
```

### API Not Working
- Check server logs in console
- Verify session cookie is being sent
- Check CORS configuration

### Image Upload Issues
- Verify object storage is configured
- Check presigned URL generation
- Ensure ACL policies are set correctly

---

## Business Model

### Revenue Streams
1. **Primary**: 30% total take rate (10% customer + 20% photographer)
2. **Secondary**: 20% commission on photo editing services
3. **Future**: Featured placements, premium subscriptions

### Unit Economics
- Average booking: £75
- Customer pays: £82.50 (includes 10% fee)
- Platform revenue: £22.50 per booking
- Photographer receives: £60 (80%)

---

**Last Updated**: December 2025
**Built with Replit**
