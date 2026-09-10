# RideIN — Frontend

A React + Tailwind CSS frontend for RideIN, a ride ordering and management system for estate keke drivers, starting with Millennium Estate. This is the frontend only — auth, the map, and face verification are wired up against real browser APIs where possible, but everything that needs a real backend is mocked (see "What's real vs. mocked" below).

## Stack

- **React 18** + **Vite** (fast dev server, `npm run dev`)
- **Tailwind CSS** for styling (custom color tokens + font pairing, no default AI-generic palette)
- **react-router-dom** for client-side routing (home, login, signup, dashboard)
- Plain JS (no TypeScript) — easy to convert later if you want types

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`). The app runs fine with zero setup — Google Maps and Google sign-in both fall back to clearly-labeled placeholders until you add API keys (see below).

Other scripts:

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

## Optional: real Google Maps + real Google sign-in

Copy `.env.example` to `.env` and fill in the two keys it documents:

- `VITE_GOOGLE_MAPS_API_KEY` — without it, the map preview uses an illustrated placeholder map (still fully interactive, with live distance chips). With it, `GoogleEstateMap` loads the real Maps JS API instead, styled to match the brand palette and scoped to Millennium Estate.
- `VITE_GOOGLE_CLIENT_ID` — without it, the "Continue with Google" buttons on login/signup show a note that Google sign-in isn't configured yet. With it, they run real Google Identity Services and hand back a decoded profile (name/email/photo).

Both are optional for `npm run dev` to work — the app is designed to degrade gracefully.

## Admin access (no signup page — on purpose)

There's an estate-operations dashboard, but deliberately no "sign up as admin" anywhere in the UI — the login page is the exact same single "Log in" form everyone else uses, and nothing in the navbar or anywhere else hints that an admin role exists. To open it yourself, log in with:

```
admin@ridein.app
```

That account is seeded automatically the first time the app loads (see the comment at the top of `src/context/AuthContext.jsx`), purely so the demo has an admin to log in as without a real backend issuing accounts. Once there, an admin can approve pending rider applications and reply to any customer-care thread. Replace the seeding block in `AuthContext.jsx` once you have a real backend that issues admin accounts by hand — never through public signup.

## Routes

| Path | Page |
|---|---|
| `/` | Home — hero, how it works, fares, the interactive app preview/map, safety, estate signup |
| `/login` | Log in (email or Google) |
| `/signup` | Choose: sign up as a passenger or as a rider |
| `/signup/passenger` | Passenger signup: name + email (or Google), then optional wallet top-up |
| `/signup/rider` | Rider application: account → vehicle/estate/address/phone → guarantor → bank payout → face verification |
| `/dashboard` | Dashboard, routed by role — a rider sees order + payment history, a passenger sees ride + wallet history, and (invisibly to everyone else) an admin sees the estate-operations dashboard. All strictly read-only where that matters, and strictly separated: a passenger can never see a rider's dashboard, and a rider can never see a passenger's. |
| `/profile` | Profile, routed by role — a rider or passenger can view the details they gave RideIN and change their photo. Nothing else is editable here. |
| `/support` | Customer care chat — one page, open to riders and passengers alike (not split by role). |

## Project structure

Separation of concerns, top to bottom:

```
index.html                 Page shell, theme-flash-prevention script, Google Fonts
src/
  main.jsx                 React entry point, wraps App in BrowserRouter
  App.jsx                  Routes + AuthProvider
  index.css                Tailwind directives + small global rules

  data/                    Content & config, no JSX — edit these to change real numbers/copy
    fares.js                Pickup/Chatter fare breakdown (single source of truth for pricing)
    riders.js                Sample nearby riders (lat/lng + placeholder photo) for the passenger map
    passengers.js           Sample waiting passengers (lat/lng) for the rider map
    riderRecords.js          Sample order/payment history shown on the rider dashboard
    passengerRecords.js      Sample ride/wallet history shown on the passenger dashboard
    heroImages.js             Photos used for the homepage hero background slideshow
    estates.js               Estates currently live on RideIN (also used as the signup dropdown)
    estate.js                Millennium Estate center/gate coordinates + default zoom
    mapStyle.js              Google Maps JS API style rules matching the brand palette

  assets/riders/            Placeholder keke photos — used as rider avatars and the hero slideshow

  lib/                     Pure helper functions, no JSX
    distance.js              Haversine distance + ETA estimate + display formatting
    geo.js                   Projects lat/lng to % position for the illustrated fallback map
    loadScript.js             Cached loader for external <script> tags (Maps, Google Identity)
    supportStore.js           localStorage-backed customer-care threads — read by both SupportPage and AdminDashboardPage

  hooks/
    useGoogleMaps.js          Loads the Maps JS API from VITE_GOOGLE_MAPS_API_KEY
    useSimulatedMotion.js     Random-walk position simulation, standing in for live GPS

  context/
    AuthContext.jsx           Mock auth (localStorage-backed) — see "What's real vs. mocked"

  components/
    ui/                     Small, reusable, presentation-only primitives
      Button.jsx, Logo.jsx, SectionHead.jsx, FareLine.jsx, FormField.jsx, Stepper.jsx, ThemeToggle.jsx, Avatar.jsx
    layout/                 Page chrome
      Navbar.jsx, Footer.jsx
    sections/               One file per homepage section (composition + copy)
      Hero.jsx, HowItWorks.jsx, Fares.jsx, AppPreview.jsx, Safety.jsx, EstateSignup.jsx
    preview/                The interactive "try it" app mockup + map
      PassengerPhone.jsx     Passenger flow: see riders + live distance → request → rate & tip — only ever rendered for a signed-in passenger
      RiderPhone.jsx         Rider flow: see waiting passengers + live distance → accept → earn — only ever rendered for a signed-in rider
      AnimatedPhoneShowcase.jsx  Decorative, non-interactive 360°-spin phone mockup shown to signed-out visitors instead
      GoogleEstateMap.jsx     Real Google Map when a key is set, else the illustrated fallback
      MapPin.jsx, RoadGridSVG.jsx  Fallback-map pieces
    auth/                   Auth-specific UI, reused across login/signup pages
      GoogleSignInButton.jsx  Real Google Identity Services button + JWT decode
      FaceVerificationStep.jsx Camera capture placeholder for rider verification
      AuthLayout.jsx           Shared centered-card wrapper for auth pages

  pages/                   Route-level pages (each composes the pieces above)
    HomePage.jsx, LoginPage.jsx, SignupChoicePage.jsx,
    SignupPassengerPage.jsx, SignupRiderPage.jsx,
    DashboardPage.jsx        Routes "/dashboard" to the right dashboard below, by role
    RiderDashboardPage.jsx, PassengerDashboardPage.jsx, AdminDashboardPage.jsx
    ProfilePage.jsx           Routes "/profile" to the right profile below, by role
    RiderProfilePage.jsx, PassengerProfilePage.jsx
    SupportPage.jsx           "/support" — one customer-care chat, shared by riders and passengers
```

## What's real vs. mocked

This frontend wires up every browser API it reasonably can, and clearly labels the rest as placeholders so nothing pretends to be more finished than it is:

- **Google Maps** — real, once you add `VITE_GOOGLE_MAPS_API_KEY`. Falls back to an illustrated map otherwise. Either way, the map is scoped to Millennium Estate (`src/data/estate.js` — **replace the placeholder lat/lng there with the estate's real coordinates before launch**).
- **"How close" distance** — real math (Haversine straight-line distance from `src/lib/distance.js`), computed live from each rider's/passenger's position. It is **not** real GPS and **not** real road distance — positions are simulated with a random-walk (`useSimulatedMotion.js`) since there's no backend or device location feed yet. Swap the simulated positions for a real location feed (e.g. WebSocket or polling) once you have one, and the distance/ETA math keeps working unchanged. ETA is a rough estimate (~15 km/h average), not routing.
- **Google sign-in** — real Google Identity Services once you add `VITE_GOOGLE_CLIENT_ID`. It decodes the returned JWT client-side to read name/email/photo for the demo. **Before production**, that token must be verified server-side (Google's tokeninfo endpoint or a server-side library) — never trust a client-decoded JWT for real authentication.
- **Login / signup / sessions** — **fully mocked**, stored in `localStorage` via `src/context/AuthContext.jsx`. There is no real backend, no password hashing, no server session. It exists so the full UX (signup → dashboard, protected routes, login/logout) can be built and demoed today. The file has a comment block at the top explaining exactly what to replace and pointing out that the `useAuth()` interface it exports is designed to stay the same when you swap in real API calls.
- **Face verification** — a **UI placeholder only**. It opens the device camera (`getUserMedia`), captures a still frame, and shows a fake "verifying" delay before marking the step done. There is no liveness check and no ID matching. Before launch, replace `FaceVerificationStep.jsx`'s fake verify step with a real provider (e.g. Smile ID or Youverify are common choices for Nigerian ID/BVN + face verification).
- **Wallet funding** — shows fake bank-transfer instructions and a client-side "confirm" button; no real payment is processed. Wire this to your payment provider (bank transfer webhook, Paystack/Flutterwave, etc.) when the backend exists.
- **Rider dashboard order/payment history** — sample data in `src/data/riderRecords.js`, identical for every rider since there's no backend yet. **By design, both tables are read-only** — there is no edit or delete control anywhere on the dashboard, matching the requirement that riders can view but never clear or alter their own records. Keep that constraint when wiring up the real API: the dashboard should only ever call read endpoints.
- **Passenger dashboard ride/wallet history** — same idea, mirrored for passengers: sample data in `src/data/passengerRecords.js`, also strictly read-only.
- **Dashboard access is strictly split by role.** `/dashboard` goes through `src/pages/DashboardPage.jsx`, which checks the logged-in user's role and renders only the matching dashboard — a passenger account can never see `RiderDashboardPage`, and a rider account can never see `PassengerDashboardPage`. Both dashboard pages also re-check the role themselves before rendering anything, so this holds even if the routing changes later.
- **The "Open the app" homepage section has no working "Accept ride" or "Request a ride" button for anyone who isn't actually signed in as that role.** Earlier this section let any visitor — logged in or not — click through both a passenger-request flow and a rider-accept flow, which looked like anyone could "accept" a ride. Now: a signed-out visitor sees only `AnimatedPhoneShowcase` (`src/components/preview/AnimatedPhoneShowcase.jsx`), a purely decorative, non-interactive phone mockup that spins 360° on a loop between a passenger face and a rider face — nothing on it can be clicked. The real, working `PassengerPhone`/`RiderPhone` components only render here for a signed-in passenger or rider, and only their own side — so the only way to actually request or accept a ride is to be logged in as the account it belongs to.
- **Rider photos** — each sample rider in `src/data/riders.js` now carries a `photo` (currently a placeholder keke image from `src/assets/riders/`), shown as a thumbnail in the passenger's rider-picker chips and in the ride-request card. Swap in each rider's real verified photo (captured during signup — see `FaceVerificationStep.jsx`) once there's a backend to store it.
- **Profile pages** (`/profile`) let a rider or passenger see the details they gave RideIN at signup and change their own photo (stored as a data URL in `localStorage` via `AuthContext`'s `updatePhoto`) — nothing else on that page is editable. That's deliberate: a wrong address, plate number, or email is a customer-care conversation, not a self-service edit, so every other field renders locked. Real photo storage (uploaded to actual object storage, not base64 in `localStorage`) is one of the things to swap in once there's a backend.
- **Customer care** (`/support`) is a single chat page open to riders and passengers alike, backed by `src/lib/supportStore.js` (one thread per account, keyed by user id, in `localStorage`). Sending a message gets an immediate canned auto-reply so the demo feels responsive; the admin dashboard's inbox reads and can reply to the same threads for real (within the demo). Replace this with a real support tool (WhatsApp Business API, Zendesk, Intercom, etc.) before launch — the comment at the top of `supportStore.js` says so too.
- **Admin dashboard** (`/dashboard` for the one seeded admin account — see "Admin access" above) shows rider/passenger counts, a table of all riders with an "Approve" action for anyone still `pending_review`, a table of all passengers, and the customer-care inbox described above. There is deliberately no reject/delete/edit action anywhere on this page — approving a rider is the one write this demo models, matching what an estate operator actually needs day to day.
- **The estate application form** (`EstateSignup.jsx`) shows a local success message on submit — it doesn't send anywhere yet. Point its `handleSubmit` at your API or a form service when ready.

## Design notes

- Colors are defined as named tokens in `tailwind.config.js` (`brand`, `accent`, `ink`, `paper`, `map`, etc.) rather than raw hex scattered through components — change the brand palette in one place.
- Light/dark is a manual switch (`src/components/ui/ThemeToggle.jsx`, in the navbar), not just the OS setting. It toggles a `dark` class on `<html>` (`darkMode: 'class'` in `tailwind.config.js`) and remembers the choice in `localStorage` (`ridein-theme`). A small inline script in `index.html` applies that saved choice (or, on a first visit, the OS preference) before React even mounts, so there's no flash of the wrong background on load.
- Fare numbers (₦300/₦100/₦400 pickup, ₦1,200/₦300/₦1,500 chatter) live in one place: `src/data/fares.js`. Every screen that shows a price reads from there.
- The homepage hero has a dimmed, auto-crossfading photo background (`src/data/heroImages.js`, currently the same placeholder keke photos used for rider avatars) so the headline stays easy to read over a real photo rather than a flat color. Swap the images there for real ones anytime — no code changes needed.
