# PPHG Braze Demo Registration

**Braze Customer Profile Editor**

## Overview

This application is a **Braze Platform Demonstration** for Pan Pacific Hotel Group. The primary experience is a **mobile-first registration flow** inside an iPhone-style frame: guests move from welcome → registration form → confirmation while their profile is created or updated in Braze. The same codebase also contains **customer-service style** modules (profile view, timeline, quick actions, notes) that integrate with the Braze REST API for reading and updating users.

When `BRAZE_REST_ENDPOINT` is not configured in the browser (or mock mode is forced via `StorageManager`), the app runs in **demo mode** with simulated latency and no live API calls—useful for local previews and dry runs.

## Tech stack

| Area | Choice |
|------|--------|
| **UI** | HTML5, CSS3, native ES modules (registration shell uses a tight custom layout aligned with Braze purple/slate design tokens) |
| **Icons** | [FontAwesome](https://fontawesome.com/) (kit loaded in `index.html`) |
| **HTTP client** | [Ky](https://github.com/sindresorhus/ky) — browser import map points at `esm.sh`; `BrazeClient` targets `/api/braze/` with retries on 429/5xx |
| **Braze** | [Braze REST API](https://www.braze.com/docs/api/home) via browser → Vercel serverless → Braze (`BRAZE_API_KEY` stays server-side only) |
| **Hosting** | [Vercel](https://vercel.com/auzani-ridzwans-projects) — SPA rewrites and security headers in `vercel.json` |

## Project layout

| Path | Purpose |
|------|---------|
| `index.html` | Registration shell, FontAwesome, import map for Ky, optional `window.__APP_CONFIG__` |
| `js/register-main.js` | Bootstrap: `AppLogger` + `RegistrationRouter` |
| `js/core/` | `StorageManager`, `AppLogger`, routers and navigation |
| `js/api/` | `BrazeClient`, `RegistrationRepository`, `UserRepository`, domain models |
| `config/app.config.js` | Live vs mock mode from `__APP_CONFIG__` and storage |
| `api/braze/users/` | Vercel functions that proxy to Braze (see below) |

## Setup

1. **Clone the repository**  
   [https://github.com/auzaniridzwan-oss/pphgdemo-register](https://github.com/auzaniridzwan-oss/pphgdemo-register)

2. **Install dependencies** (Node 18+)

   ```bash
   npm install
   ```

3. **Run locally**

   - **Static preview only (demo mode):** serve the folder (e.g. `npx serve .`) and open the site. Hash routes: `#/welcome`, `#/register`, `#/thanks`.
   - **With live Braze API:** plain static servers do **not** run Vercel functions. Use the [Vercel CLI](https://vercel.com/docs/cli) from the project root so `/api/braze/*` exists:

     ```bash
     npx vercel dev
     ```

     Add `BRAZE_API_KEY` and `BRAZE_REST_ENDPOINT` to `.env.local` (or the Vercel CLI prompts) for the serverless proxy. Still expose **only** `BRAZE_REST_ENDPOINT` to the page as `window.__APP_CONFIG__.BRAZE_REST_ENDPOINT` (build step, Vercel Environment Variable exposed to client if you add that pattern, or a small injected script)—never put the API key in client config.

4. **Production (Vercel)**  
   Project settings → Environment Variables:

   - `BRAZE_API_KEY` — REST API key (server / functions only)
   - `BRAZE_REST_ENDPOINT` — cluster base URL (e.g. `https://rest.iad-01.braze.com`)

   Ensure the deployed HTML includes `BRAZE_REST_ENDPOINT` in `window.__APP_CONFIG__` so `config/app.config.js` enables live mode.

## Architecture

- **`StorageManager`** (`js/core/StorageManager.js`) — all `localStorage` access uses the `ar_app_` prefix, typed defaults, and safe JSON parsing so UI code never touches raw keys.
- **`AppLogger`** (`js/core/AppLogger.js`) — structured logs (`[TIMESTAMP] [CATEGORY] [LEVEL]: message`), in-memory ring buffer, and `getLogs()` for export. Registration startup logs version and flow for quick console orientation.

## Braze integration

- **REST API home:** [Braze REST API](https://www.braze.com/docs/api/home)  
- **User track:** [POST /users/track](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/)  
- **User export by IDs:** [POST /users/export/ids](https://www.braze.com/docs/api/endpoints/export/post_users_identifier/)

### Browser → proxy mapping

The Ky client uses `prefixUrl: '/api/braze/'`. Implemented serverless routes:

| Request path | Server file | Upstream Braze path |
|--------------|-------------|---------------------|
| `POST /api/braze/users/track` | `api/braze/users/track.js` | `POST …/users/track` |
| `POST /api/braze/users/export/ids` | `api/braze/users/export/ids.js` | `POST …/users/export/ids` |

### User attributes (registration)

On successful registration in live mode, `RegistrationRepository` sends a single attributes object to `/users/track` including:

- `external_id` — `pphg_demo_{normalized_email}`
- `first_name`, `last_name`, `email`
- `email_subscribe` — `opted_in`
- `pphg_dream_destination` — `beach` \| `mountain` \| `city`
- `pphg_demo_segment` — `true`

The CS profile path can update additional standard and custom attributes through `UserRepository` and `UserProfile` payloads.

### Custom events (profile / CS UI)

When live mode is on, typical events via `UserRepository.trackEvent` include:

| Event | When |
|-------|------|
| `cs_profile_viewed` | Profile screen load |
| `cs_attribute_updated` | After attribute write |
| `cs_note_saved` | After saving a note |
| `cs_quick_action_triggered` | Quick actions or AI CTA (properties include `action` or CTA-specific fields) |

*(Mock data in `js/data/mockData.js` illustrates timelines and attributes; it is not sent to Braze unless the UI drives a live call.)*

## Repository and deployment

- **GitHub:** [auzaniridzwan-oss/pphgdemo-register](https://github.com/auzaniridzwan-oss/pphgdemo-register)  
- **Vercel:** connect this repo under [auzani-ridzwans-projects](https://vercel.com/auzani-ridzwans-projects) for deploys on push.

**License:** `UNLICENSED` / private (see `package.json`).

---

*Handoff note: you should be able to run demo mode with any static server, use `vercel dev` when you need real Braze calls locally, and keep the REST key only in server env—not in `window.__APP_CONFIG__`.*
