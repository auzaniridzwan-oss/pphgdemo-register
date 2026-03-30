# PPHG Braze Demo Registration

**Braze Customer Profile Editor**

## Overview

This application is a **Braze Platform Demonstration** for Pan Pacific Hotel Group. The primary experience is a **mobile-first registration flow** inside an iPhone-style frame: guests move from welcome → registration form → confirmation while their profile is created or updated in Braze. The same codebase also contains **customer-service style** modules (profile view, timeline, quick actions, notes) that integrate with the Braze REST API for reading and updating users.

When `BRAZE_REST_ENDPOINT` is not configured (or mock mode is forced in storage), the app runs in **demo mode** with simulated latency and no live API calls—useful for local previews and dry runs.

## Tech stack

| Area | Choice |
|------|--------|
| **UI** | HTML5, CSS3, native ES modules (registration shell uses a tight custom layout aligned with Braze purple/slate design tokens) |
| **Icons** | [FontAwesome](https://fontawesome.com/) (kit loaded in `index.html`) |
| **HTTP client** | [Ky](https://github.com/sindresorhus/ky) — browser import map points at `esm.sh`; serverless proxy uses `fetch` |
| **Braze** | [Braze REST API](https://www.braze.com/docs/api/home) via browser → Vercel serverless → Braze (API key stays server-side) |
| **Hosting** | [Vercel](https://vercel.com/auzani-ridzwans-projects) |

## Setup

1. **Clone the repository**  
   [https://github.com/auzaniridzwan-oss/pphgdemo-register](https://github.com/auzaniridzwan-oss/pphgdemo-register)

2. **Install dependencies** (Node 18+)

   ```bash
   npm install
   ```

3. **Run locally**  
   Serve the static site (for example `npx serve .` or your preferred static server). Open `index.html` in the browser with hash routing (`#/welcome`, `#/register`, `#/thanks`).

4. **Live Braze mode on Vercel**  
   In the Vercel project, set:

   - `BRAZE_API_KEY` — REST API key (server-only; never commit or inject into `window.__APP_CONFIG__`)
   - `BRAZE_REST_ENDPOINT` — your cluster REST base URL (e.g. `https://rest.iad-01.braze.com`)

   Inject `BRAZE_REST_ENDPOINT` into the page for the client (build step or inline script) as `window.__APP_CONFIG__.BRAZE_REST_ENDPOINT` so `config/app.config.js` can detect live mode. The browser calls `/api/braze/...` routes; those functions attach the key and forward to Braze.

## Architecture

- **`StorageManager`** (`js/core/StorageManager.js`) — all `localStorage` access uses the `ar_app_` prefix, typed defaults, and safe JSON parsing so UI code never touches raw keys.
- **`AppLogger`** (`js/core/AppLogger.js`) — structured logs (`[TIMESTAMP] [CATEGORY] [LEVEL]: message`), in-memory ring buffer, and `getLogs()` for export. On startup, the registration bootstrap logs version and flow so the console acts as lightweight live documentation.

## Braze integration

Official reference: [Braze REST API](https://www.braze.com/docs/api/home).

### Endpoints used

| Path | Role |
|------|------|
| `POST /users/track` | Registration payload and profile updates (via `api/braze/users/track.js`) |
| `POST /users/export/ids` | Profile export by `external_id` (via `api/braze/users/export/ids.js`) |

### User attributes (registration)

On successful registration in live mode, `RegistrationRepository` sends a single attributes object to `/users/track` including:

- `external_id` — derived as `pphg_demo_{normalized_email}`
- `first_name`, `last_name`, `email`
- `email_subscribe` — `opted_in`
- `pphg_dream_destination` — guest selection (`beach` \| `mountain` \| `city`)
- `pphg_demo_segment` — `true` for demo segmentation

The CS profile path can update additional standard and custom attributes through `UserRepository` and `UserProfile` payloads.

### Custom events (profile / CS UI)

When live mode is on, typical events logged through `UserRepository.trackEvent` include:

| Event | When |
|-------|------|
| `cs_profile_viewed` | Profile screen load |
| `cs_attribute_updated` | After attribute write |
| `cs_note_saved` | After saving a note |
| `cs_quick_action_triggered` | Quick actions or AI CTA (properties include `action` or CTA-specific fields) |

*(Mock data and timeline examples in `js/data/mockData.js` illustrate channel behaviour; they are not sent as live events unless driven by the UI.)*

## Repository and deployment

- **GitHub:** [auzaniridzwan-oss/pphgdemo-register](https://github.com/auzaniridzwan-oss/pphgdemo-register)  
- **Vercel:** connect this repo under [auzani-ridzwans-projects](https://vercel.com/auzani-ridzwans-projects) for automatic deploys on push.

---

*This README is written for the next developer: you should be able to run the app locally, turn on live Braze on Vercel with env vars only on the server, and trace registration vs profile API usage without digging through every file first.*
