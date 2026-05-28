# SnapNow Mobile App

React Native/Expo mobile app for the SnapNow photography marketplace.

---

## Running the App

### 1. Install Expo Go on your phone
- **iPhone** — [App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android** — [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 2. Install dependencies
```bash
cd mobile
npm install
```

### 3. Start the development server
```bash
npx expo start
```

### 4. Open on your phone
- **iPhone** — open the Camera app and scan the QR code shown in the terminal
- **Android** — open Expo Go, tap **Scan QR code**, and scan the QR code in the terminal

> Your phone doesn't need to be on the same WiFi — the app connects to the Replit backend over the internet.

---

## Demo Accounts

| Role         | Email                 | Password | Notes                                   |
|--------------|-----------------------|----------|-----------------------------------------|
| Customer     | customer@test.com     | password | Browse photographers, make bookings     |
| Photographer | anna@snapnow.com      | password | Verified photographer with portfolio    |
| Admin        | admin@snapnow.com     | admin123 | Admin dashboard at `/admin` (web only)  |

---

## Screens by Role

### Customer
- **Home** — map + list of nearby photographers
- **Bookings** — view and manage your sessions
- **Profile** — account settings

### Photographer
- **Dashboard** — action items, upcoming sessions, recent reviews
- **Bookings** — manage incoming requests
- **Earnings** — track held and available payments
- **Profile** — edit bio, portfolio, hourly rate

---

## Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with providers
│   ├── index.tsx           # Welcome screen
│   ├── (auth)/             # Auth screens (login, signup)
│   ├── (customer)/         # Customer tabs (home, bookings, profile)
│   └── (photographer)/     # Photographer tabs (dashboard, earnings, etc.)
├── src/
│   ├── api/                # API client and endpoints
│   ├── context/            # Auth, City, and Query providers
│   └── components/         # Shared components
└── assets/                 # Images and icons
```

---

## Notes

- Backend API must be running (same Replit project)
- To change the backend URL, edit `src/api/client.ts`
- Replace placeholder icons in `/assets` before publishing to the App Store / Google Play
- Stock images for the PhotoBackground component are in `/assets/stock_images`
