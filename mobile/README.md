# SnapNow Mobile App

React Native/Expo mobile app for the SnapNow photography marketplace.

## Setup

```bash
cd mobile
npm install
npx expo start
```

## Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with providers
│   ├── index.tsx           # Welcome screen
│   ├── (auth)/             # Auth screens (login, signup)
│   ├── (customer)/         # Customer screens (home, bookings, profile)
│   └── (photographer)/     # Photographer screens (dashboard, earnings, etc.)
├── src/
│   ├── api/                # API client and endpoints
│   ├── context/            # Auth and Query providers
│   └── components/         # Shared components
└── assets/                 # Images and icons
```

## Demo Accounts

- **Customer:** customer@test.com / password
- **Photographer:** anna@snapnow.com / password

## Notes

- Backend API must be running (same Replit project)
- Replace placeholder icons in `/assets` before publishing
- Stock images for PhotoBackground are included in `/assets/stock_images`
