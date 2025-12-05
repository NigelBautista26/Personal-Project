# SnapNow - Technical Guide

## 🎯 What You Have Built

**SnapNow** is a fully functional marketplace platform connecting travelers with professional photographers. Think "Uber for Photography" - customers can discover nearby photographers, view portfolios, book sessions, and pay instantly. Photographers earn money with a transparent 20% platform commission model.

## 📊 Current Architecture

### Backend (Express + PostgreSQL + Object Storage)

Your backend is a REST API built with:
- **Express.js**: Web framework handling HTTP requests
- **PostgreSQL Database**: Stores all user data, bookings, earnings
- **Drizzle ORM**: Type-safe database queries
- **Object Storage** (Google Cloud Storage): Stores photographer portfolio images
- **Session-based Authentication**: Secure login with bcrypt password hashing

### Frontend (React + TanStack Query)

Your frontend is a React single-page application with:
- **React**: UI framework
- **TanStack Query**: Data fetching and caching
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **Wouter**: Client-side routing

### Database Schema

```
users
├── id (uuid)
├── email
├── password (hashed)
├── fullName
├── role ('customer' or 'photographer')
└── createdAt

photographers
├── id (uuid)
├── userId (foreign key → users)
├── bio
├── hourlyRate
├── location
├── latitude/longitude
├── rating
├── reviewCount
├── profileImageUrl
├── portfolioImages (array)
├── isAvailable
└── stripeAccountId

bookings
├── id (uuid)
├── customerId (foreign key → users)
├── photographerId (foreign key → photographers)
├── duration
├── location
├── scheduledDate/Time
├── totalAmount
├── platformFee (20%)
├── photographerEarnings (80%)
├── status
├── stripePaymentId
└── createdAt

earnings
├── id (uuid)
├── photographerId (foreign key → photographers)
├── bookingId (foreign key → bookings)
├── grossAmount
├── platformFee (20%)
├── netAmount (80%)
├── status ('pending' or 'paid')
├── paidAt
└── createdAt
```

## 🔐 How Authentication Works

### Registration
1. User submits email, password, full name, and role (customer/photographer)
2. Backend hashes password with bcrypt (10 rounds)
3. User record created in `users` table
4. Session created and stored
5. User logged in automatically

### Login
1. User submits email and password
2. Backend looks up user by email
3. Password compared using bcrypt
4. If valid, session created with `userId`
5. Frontend receives user data (password excluded)

### Protected Routes
All API endpoints check `req.session.userId` to verify authentication. If missing, returns 401 Unauthorized.

## 📸 How Image Storage Works

### Object Storage Setup
- **Public Directory**: `/repl-default-bucket-.../public/` - For public assets
- **Private Directory**: `/repl-default-bucket-.../.private/uploads/` - For user uploads

### Upload Flow
1. Frontend requests upload URL from `/api/objects/upload`
2. Backend generates presigned URL (valid for 15 minutes)
3. Frontend uploads image directly to Google Cloud Storage
4. Frontend sends image URL to `/api/photographer-images`
5. Backend sets ACL policy (owner, visibility: public)
6. Backend stores normalized path in database

### Serving Images
- **Public images**: `/public-objects/:filePath` - No auth required
- **Private images**: `/objects/:objectPath` - Requires auth + ACL check

## 💰 How Payments Will Work (Stripe Connect)

### The 20% Commission Model

SnapNow operates as a **marketplace** using Stripe Connect:

1. **Platform Account** (You): Receives 20% of all bookings
2. **Photographer Accounts**: Each photographer gets their own Stripe Connect account

### Payment Flow
```
Customer pays £100
    ↓
Stripe receives £100
    ↓
    ├─ £20 goes to Platform (your account) → 20% commission
    └─ £80 goes to Photographer's account → their earnings
```

### Implementation Steps

#### 1. Setup Stripe Integration
```bash
# Use Replit's Stripe integration (handles API keys automatically)
```

#### 2. Create Connected Accounts for Photographers
When a photographer signs up:
```typescript
// server/routes.ts
const account = await stripe.accounts.create({
  type: 'express',
  country: 'GB',
  email: photographer.email,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
});

// Store account.id in photographers.stripeAccountId
```

#### 3. Onboarding Link
```typescript
const accountLink = await stripe.accountLinks.create({
  account: photographerStripeAccountId,
  refresh_url: 'https://yourapp.replit.dev/photographer/onboarding',
  return_url: 'https://yourapp.replit.dev/photographer/dashboard',
  type: 'account_onboarding',
});
// Send photographer to accountLink.url to complete onboarding
```

#### 4. Process Booking Payment
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000, // £100 in pence
  currency: 'gbp',
  application_fee_amount: 2000, // £20 (20% commission)
  transfer_data: {
    destination: photographerStripeAccountId, // £80 goes here
  },
});
```

### Stripe Connect Dashboard
Photographers can see their earnings in their own Stripe dashboard, and you can track platform revenue in your main Stripe account.

## 📱 Converting to Native Mobile App (iOS & Android)

### Current State: Progressive Web App (PWA)
- Works in mobile browsers
- Can be "installed" to home screen
- Limited native features

### Option 1: React Native with Expo (Recommended)

Expo is a framework that lets you build **one codebase** for iOS and Android.

#### Step 1: Install Expo CLI
```bash
npm install -g expo-cli
```

#### Step 2: Create New Expo Project
```bash
npx create-expo-app snapnow-mobile
cd snapnow-mobile
```

#### Step 3: Copy Your Components
Most of your React components can be reused! Main changes:
- `<div>` → `<View>`
- `<span>` → `<Text>`
- `onClick` → `onPress`
- CSS → StyleSheet or NativeWind (Tailwind for React Native)

#### Step 4: Install Dependencies
```bash
npm install @tanstack/react-query
npm install expo-router # For navigation
npm install nativewind # For Tailwind CSS
```

#### Step 5: Update Components
```tsx
// Before (React Web)
<div className="bg-black p-4">
  <h1 className="text-white">SnapNow</h1>
</div>

// After (React Native)
<View className="bg-black p-4">
  <Text className="text-white text-2xl font-bold">SnapNow</Text>
</View>
```

#### Step 6: Test on Your Phone
```bash
expo start
# Scan QR code with Expo Go app (iOS/Android)
```

#### Step 7: Build for App Stores
```bash
# iOS
expo build:ios

# Android
expo build:android
```

### Option 2: Capacitor (Keep Existing Web Code)

Capacitor wraps your web app into native containers:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android
npx cap open ios # Opens Xcode
npx cap open android # Opens Android Studio
```

### Mobile-Specific Features to Add

#### 1. Location Services
```tsx
import * as Location from 'expo-location';

const { status } = await Location.requestForegroundPermissionsAsync();
const location = await Location.getCurrentPositionAsync();
```

#### 2. Camera Access (for photographer portfolios)
```tsx
import * as ImagePicker from 'expo-image-picker';

const result = await ImagePicker.launchCameraAsync({
  allowsEditing: true,
  aspect: [4, 3],
  quality: 1,
});
```

#### 3. Push Notifications (for booking confirmations)
```tsx
import * as Notifications from 'expo-notifications';

await Notifications.scheduleNotificationAsync({
  content: {
    title: "Booking Confirmed!",
    body: "Your photoshoot with Sarah is confirmed for tomorrow at 2 PM",
  },
  trigger: { seconds: 2 },
});
```

## 🚀 Deployment & Publishing

### Backend Deployment (Replit)
Your backend is already live! When you click "Publish" in Replit:
- Your Express server becomes publicly accessible
- Database automatically connected
- Object storage works out of the box
- Get custom domain: `snapnow.replit.app`

### Frontend Deployment
Currently served by Express. To deploy separately:

#### Option 1: Same Replit (Current Setup)
```bash
npm run build # Builds to dist/
# Express serves static files from dist/
```

#### Option 2: Separate Frontend (Vercel/Netlify)
```bash
# Build frontend
npm run build

# Deploy to Vercel
npm i -g vercel
vercel --prod

# Update API base URL
# client/src/lib/api.ts
const API_BASE = "https://snapnow-backend.replit.dev/api";
```

### Mobile App Publishing

#### iOS App Store
1. **Apple Developer Account**: $99/year
2. **Bundle ID**: `com.snapnow.app`
3. **Build**: `expo build:ios`
4. **Submit**: Upload to App Store Connect
5. **Review**: Apple reviews in 24-48 hours

#### Google Play Store
1. **Google Play Developer**: $25 one-time
2. **Package Name**: `com.snapnow.app`
3. **Build**: `expo build:android`
4. **Submit**: Upload to Google Play Console
5. **Review**: Usually approved in hours

## 🔧 Environment Variables

Your app requires these environment variables (already set in Replit):

```env
# Database
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=...
PGUSER=...
PGPASSWORD=...
PGDATABASE=...

# Object Storage
DEFAULT_OBJECT_STORAGE_BUCKET_ID=...
PUBLIC_OBJECT_SEARCH_PATHS=/bucket/public
PRIVATE_OBJECT_DIR=/bucket/.private

# Session (change in production!)
SESSION_SECRET=snapnow-secret-change-in-production

# Stripe (to be added)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## ✅ Completed Features

### Stripe Payments - DONE
- [x] Stripe integration with authorization holds (manual capture)
- [x] Payment only captured when photographer accepts booking
- [x] Auto-cancel on expiration/decline
- [x] Platform fee collection (10% customer + 20% photographer = 30% total)

### Core Features - DONE
- [x] Review and rating system (1-5 stars with comments)
- [x] Photo delivery system (photographer uploads, customer downloads)
- [x] Payment hold system (funds held until photos uploaded)
- [x] Professional photographer onboarding with verification
- [x] Admin dashboard for photographer approval
- [x] Live location sharing between customer and photographer
- [x] Photo editing add-on service with revisions
- [x] Booking dismiss feature for expired/declined bookings

### Investor Materials - DONE
- [x] Founder CV page at `/founder-cv` with print-to-PDF
- [x] Global Talent visa optimised format

## 📈 Future Enhancements

### Planned Features
- [ ] Push notifications for booking updates
- [ ] Email notifications (booking confirmations, expirations)
- [ ] In-app messaging between customers and photographers
- [ ] Calendar availability for photographers

### Mobile App (Future)
- [ ] Set up Expo project
- [ ] Port components to React Native
- [ ] Add camera and location features
- [ ] Test on iOS and Android
- [ ] Submit to app stores

## 🎓 Learning Resources

### Stripe Connect
- https://stripe.com/docs/connect
- https://stripe.com/docs/connect/collect-then-transfer-guide

### React Native / Expo
- https://docs.expo.dev/
- https://reactnative.dev/

### PostgreSQL & Drizzle
- https://orm.drizzle.team/docs/overview
- https://www.postgresql.org/docs/

## 💡 Business Model Summary

### Revenue Streams
1. **Primary**: 30% total take rate on every booking (10% customer service fee + 20% photographer commission)
2. **Secondary**: Photo editing add-on services (20% commission)
3. **Future**: Featured photographer placements, premium subscriptions

### Unit Economics Example
- Average booking: £75
- Customer pays: £82.50 (includes 10% service fee)
- Platform revenue: £22.50 (10% from customer + 20% from photographer)
- Photographer earnings: £60 (80% of booking)
- Target: 100 bookings/month = £2,250 monthly revenue

### Growth Strategy
1. **Phase 1**: Launch in one city (London)
2. **Phase 2**: Expand to 3 major tourist cities
3. **Phase 3**: International expansion
4. **Phase 4**: Add video services, drone photography

---

## 🆘 Need Help?

### Database Issues
```bash
# Reset database
npm run db:push --force

# Re-seed data
npx tsx server/seed.ts
```

### API Not Working
```bash
# Check server logs
# Look for errors in the console
# Verify authentication headers
```

### Image Upload Issues
```bash
# Verify object storage is set up
# Check PRIVATE_OBJECT_DIR env var
# Test presigned URL generation
```

---

**Built with ❤️ on Replit**
