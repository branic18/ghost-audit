# Ghost Audit

**Ghost Audit** is a consumer privacy tool: one place to understand your exposure, see what leaked, and get clear steps to protect yourself. This repo is an ongoing experiment in building that kind of product **without putting basic safety behind a paywall**. Privacy and breach awareness shouldn’t be a luxury—you shouldn’t have to pay just to find out whether your data is at risk or what to do about it.

The work here is a real attempt at that idea, not a throwaway mockup: multiple iterations of the same product vision, from a full-stack app to a polished breach-remediation experience and a separate design system for the UI.

## What’s in this repo

| Folder | What it is |
|--------|------------|
| [`ghost-audit-original/`](ghost-audit-original/) | First full-stack version: Express, MongoDB, accounts, and features like privacy score, knowledge test, IP review, email leak checking, and action items. |
| [`ghost-audit-demo/`](ghost-audit-demo/) | Current focus: a breach audit and remediation dashboard (React + TypeScript), built to match the product design. Uses **synthetic breach data**, a small Express API, and **local SQLite** so the full flow works end-to-end without paid third-party APIs. (There is no `ghost-audit-2` folder; this replaced that name.) |
| [`ghost-audit-design-system/`](ghost-audit-design-system/) | UI components and Storybook for Ghost Audit’s visual language—shared building blocks as the product evolves. |

Each project has its own `package.json` and `node_modules`. Install dependencies inside the folder you want to run.

### ghost-audit-original

The original implementation of Ghost Audit as a **free, consumer-facing privacy audit**: sign in, run checks, and work through recommendations. It targets the broader privacy story (score, education, IP visibility, email leaks, actionable list) described in [ghost-audit-original/README.md](ghost-audit-original/README.md).

Good starting point if you care about the classic web app, Passport auth, and MongoDB-backed flows.

### ghost-audit-demo

This is the **data-breach monitor and remediation** experience: search a **demo** email (do not use a real inbox), review synthetic breaches, triage “action required” vs notices, walk checklists, archive resolved items, and use settings/notes.

It exists because **Have I Been Pwned’s API is paid** for typical product use. Rather than gate the project on that cost—or pass fees on to users—I built **`ghost-audit-demo`** to show how Ghost Audit would behave with real breach intelligence: realistic, varied **synthetic records** generated and served by a small Express API, persisted per anonymous browser cookie in SQLite so a shared demo can serve more than one visitor. Swap the catalog layer for a free or self-hosted breach source later; the UI and state machine are meant to stay the same.

More feature detail: [ghost-audit-demo/README.md](ghost-audit-demo/README.md).

### ghost-audit-design-system

Component library and **Storybook** for Ghost Audit—buttons, patterns, and documentation so the product UI stays consistent as features land in `ghost-audit-demo` or a future production app.

---

## Running locally

### ghost-audit-original

```bash
cd ghost-audit-original
npm install
node server.js
```

- **URL:** [http://localhost:8080](http://localhost:8080) (override with `PORT`, e.g. `PORT=3333 node server.js`)
- Requires MongoDB and app config under `config/` (see [ghost-audit-original/README.md](ghost-audit-original/README.md)).

### ghost-audit-demo

Runs the Vite frontend and Express API together. Session data is stored in SQLite (`ghost-audit-demo/data/`, gitignored). Use sample addresses such as `jane.demo@ghostaudit.test` — not a real email.

```bash
cd ghost-audit-demo
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| Web app | [http://localhost:5173](http://localhost:5173) |
| API | [http://localhost:3001](http://localhost:3001) (Vite proxies `/api` here) |

```bash
npm run dev:client   # Vite only (port 5173)
npm run dev:server   # API only (port 3001)
npm run build
npm run preview
```

Railway: set **Root Directory** to `ghost-audit-demo` and **Start Command** to `npm start` (entry is `server/index.js`, not `server.js`). See [ghost-audit-demo/README.md](ghost-audit-demo/README.md).

### ghost-audit-design-system

```bash
cd ghost-audit-design-system
npm install
npm run dev          # Vite app → http://localhost:5173
npm run storybook    # http://localhost:6006
```

```bash
npm run build
npm run build-storybook
npm run lint
```
