# Gattini

Tiny pixel-art, Pokémon-like experiment. Frontend is a vanilla JS PWA (Canvas). Backend is a minimal Express API scaffold with Web Push placeholders.

## Run the frontend
- From `frontend/`, serve files locally (example: `python3 -m http.server 4173`).
- Open `http://localhost:4173` in the browser. Canvas + service worker + manifest load; game logic is placeholder-only.

## Run the backend
- Copy `backend/.env.example` to `backend/.env` and fill VAPID keys + port.
- From `backend/`, install deps: `npm install`.
- Start API: `npm run start` (listens on `PORT`, defaults to `3000`).
- Routes live under `/api` (`/api/subscribe`, `/api/send-action`, `/api/pending`).

## PWA + push notes (iOS Safari)
- Requires install as a PWA (Add to Home Screen) plus user-granted notification permission.
- Needs HTTPS + valid VAPID keys; localhost works for dev, but iOS push requires a real certificate.
- Service worker (`frontend/sw.js`) currently only handles push + notification clicks; caching/offline is TODO.
- Manifest uses data-URL icons as placeholders; replace with real PNGs for production.
= gattini
