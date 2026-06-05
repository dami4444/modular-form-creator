# Modular Form Creator — Frontend

React frontend for the resource workflow. It reproduces the backend's resource lifecycle exactly:
draft creation, two module forms (Basic Info, Project Details), provisioning (`draft → completed`),
and a completed-resource edit buffer that persists only via a full `PUT` on explicit submit.

## Stack

- React 19 + React Router 7
- TanStack Query (server state) · React Hook Form + Zod (forms/validation)
- styled-components + the in-repo design system (`src/design-system`)

## Prerequisites

- Docker — for the one-command full stack (below)
- Node 20+ — only for the local dev-server workflow

## Run the full stack with Docker (frontend + backend + Mongo)

```bash
docker compose up -d --build
```

- Frontend (nginx-served production build): http://localhost:5173
- Backend API: http://localhost:5001 — Swagger at [`/docs`](http://localhost:5001/docs)

Tear down with `docker compose down` (add `-v` to also drop the Mongo data volume).

## Run the app locally (Vite dev server with HMR)

Start just the backend + database in Docker (leaves port 5173 free for Vite):

```bash
docker compose up -d backend mongo
npm install
npm run dev          # http://localhost:5173
```

The API base URL is read from `VITE_API_URL` (defaults to `http://localhost:5001`).

## Quality checks

```bash
npm run lint         # eslint — no errors
npm run build        # tsc -b + vite build
```

## End-to-end tests

Playwright suite covering the business rules (draft gating, provisioning transition, and the
completed-edit buffer's discard-on-refresh / persist-on-submit behavior).

```bash
# backend must be running on :5001; the frontend dev server starts automatically
npx playwright install chromium   # once
npm run test:e2e
```

Spec: [`e2e/business-logic.spec.ts`](e2e/business-logic.spec.ts).

## Routes

| Path | Page |
|------|------|
| `/resources` | List — create / search / filter / paginate / delete |
| `/resources/:id` | Overview — module progress + provisioning |
| `/resources/:id/basic-info` | Basic Info module form |
| `/resources/:id/project-details` | Project Details module form |
| `/resources/:id/details` | Read-only summary |

## Project structure

```
src/
  api/          fetch client + per-endpoint functions
  domain/       types, business rules, and Zod schemas mirrored from the backend
  queries/      TanStack Query hooks + query keys
  context/      completed-resource edit buffer (context + provider) + resource outlet hook
  components/   shared presentational pieces (layout, status badge, module progress)
    forms/      React Hook Form module forms
    ui/         styled layout & typography primitives (Stack, Inline, Text, Heading, Callout)
  pages/        route pages + the resource layout
  routes.ts     centralized route paths (kept in sync with App.tsx)
  design-system/  in-repo design system — do not modify
```

## Container setup

- [`Dockerfile`](Dockerfile) — multi-stage frontend image: Vite production build served by nginx, with SPA fallback in [`nginx.conf`](nginx.conf)
- [`docker-compose.yml`](docker-compose.yml) — `frontend` (5173) · `backend` (5001) · `mongo` (27017)
- [`backend/Dockerfile`](backend/Dockerfile) — backend image (unchanged)
