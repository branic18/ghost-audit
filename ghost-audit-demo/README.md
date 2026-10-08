# Ghost Audit — Data Breach Monitor

A clickable, functional React + TypeScript prototype of the Ghost Audit data breach
audit/remediation dashboard, built from the Figma file as the visual source of truth.

There is no `ghost-audit-2` folder. This app lives in **`ghost-audit-demo/`**.

## Getting started

From the repo root:

```bash
cd ghost-audit-demo
npm install
npm run dev
```

This starts **both** the API and the Vite client (via `concurrently`).

| Service | URL |
|---------|-----|
| Web app | [http://localhost:5173](http://localhost:5173) |
| API | [http://localhost:3001](http://localhost:3001) (Vite proxies `/api` here) |

Run services separately if needed:

```bash
npm run dev:server   # API on 3001
npm run dev:client   # Vite on 5173
```

To type-check, build, and serve the production bundle from Express (API + UI together):

```bash
npm run build
npm start            # serves dist/ and /api on PORT (default 3001)
```

Requires **Node.js 22+** (`node:sqlite`).

## Railway

This app’s entry file is **`server/index.js`**, not `server.js` (that file belongs to `ghost-audit-original/`).

1. Root Directory: `ghost-audit-demo` (no leading `/`).
2. In the service **Settings → Deploy**, set **Custom Start Command** to:

```bash
npm start
```

If it still says `Cannot find module '/app/server.js'`, the service has an old start command. Clear it or replace it with `npm start` / `node server/index.js`, then redeploy.

3. Build command: `npm install && npm run build`
4. Variable: `NIXPACKS_NODE_VERSION=22`

## Demo emails (do not use a real address)

This demo uses **synthetic** breach records. Do not type a personal inbox.

Click a sample address on the empty state, or type one of:

- `jane.demo@ghostaudit.test`
- `alex.demo@ghostaudit.test`
- `sam.demo@ghostaudit.test`

Any `*@*` string still returns a deterministic mock subset so you can simulate “adding another identity.” Results are not a real Have I Been Pwned lookup.

## Persistence and shared deploys

Each browser gets an anonymous **HttpOnly cookie** (`ga_sid`). Scan results, checklists, notes, archives, theme, and knowledge-test scores are stored **per cookie** in a local **SQLite** file so:

- Refresh keeps your session.
- Two people on the same deploy do not share checklists or test scores.

No login. Clearing cookies starts a new empty session.

### Why SQLite

SQLite is the database for this demo:

- **Privacy-centric:** data stays in a file on the machine you run (no Mongo Atlas / hosted SaaS DB).
- **Simple:** one file, no extra process, WAL mode for concurrent readers.
- **Enough for a shared demo:** a handful of simultaneous visitors is fine.

Set `DATA_DIR` on hosts with a persistent disk so the `.sqlite` file survives restarts. Ephemeral containers lose sessions on redeploy.

## API

All routes are under `/api`. Cookie is set automatically.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/demo` | Sample emails + “don’t use a real address” copy |
| GET/PUT | `/api/state` | Load/save this browser’s dashboard JSON |
| GET | `/api/breaches?email=` | Mock breach subset for an email |
| GET/POST | `/api/test` | Questions / score this session’s test |
| GET | `/api/score` | Privacy posture from **stored** actions + test |
| GET | `/api/getData` | IP lookup via apip.cc (uses the visitor IP when forwarded) |

Split UI/API origins: set `FRONTEND_ORIGIN` (exact origin) so CORS allows credentials. Same-origin (`npm start` after `build`) needs no extra CORS. Production HTTPS: `COOKIE_SECURE=true` (or `NODE_ENV=production`). `PORT` and `DATA_DIR` are optional.

## What's implemented

- **Email search** with a simulated scan: idle → loading (animated progress) → results.
- **Results table** split into **Action Required** and **Notices**, matching the Figma's
  two-table layout, with realistic, varied mock breach data (well-known historical
  breaches, each with distinct dates, data types, and descriptions).
- **Accordion rows** implementing the variant state machine documented in the Figma
  file's "Component Documentation" frame: `Accordion × State × Selection × Notes × Progress`.
- **Notices** can be moved onto the action list; completed rows go to **Archives**.
- **Settings modal** for goal + notes, with discard confirmation.
- **Knowledge test** (one question at a time) from the privacy-posture banner.
- **IP pill** in the top bar (apip.cc), plus light/dark theme.
- **Sortable columns**, toasts, and accessibility details as in the original UI work.

## Project structure

```
server/
  index.js            Express app (API, optional static dist/, CORS)
  routes.js           Breach catalog, scoring, session routes
  db.js               SQLite (node:sqlite) per-browser sessions
src/
  types.ts            Shared TypeScript types
  api.ts              Fetch helpers (credentials: include)
  demo.ts             Sample emails and demo notice
  data/mockRecords.ts Checklist templates + API → UI mapping
  state/store.tsx     Reducer; hydrates/saves /api/state
  components/         UI
data/
  ghost-audit.sqlite  Created at runtime (gitignored)
```

## Notes on scope

No accounts, no Have I Been Pwned. Breach names/dates are real historical incidents; **hits are not tied to anyone’s real inbox.** Remediation is a checklist the user confirms themselves.
