# Modular Form Creator — Frontend

React frontend for the resource workflow. It reproduces the backend's resource lifecycle exactly:
draft creation, two module forms (Basic Info, Project Details), provisioning (`draft → completed`),
and a completed-resource edit buffer that persists only via a full `PUT` on explicit submit.

## Stack

- React 19 + React Router 7
- TanStack Query (server state) · React Hook Form + Zod (forms/validation)
- styled-components + the in-repo design system (`src/design-system`)

## Prerequisites

- Node 20+
- The backend running on `http://localhost:5001` (see [`backend/README.md`](backend/README.md))

Start the full stack with Docker:

```bash
docker compose up -d
```

(Or run `backend/` directly against a local MongoDB by setting `MONGO_URI`.)

## Run the app

```bash
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
