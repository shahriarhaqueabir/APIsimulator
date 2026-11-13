# Lemon Ops Console — Design Spec

**Date:** 2026-06-23
**Status:** Draft

## Overview

A Technical Operations Console for lemon.markets internal Solution Engineers. Provides real-time monitoring, tracing, and guided triage across the lemon.markets Brokerage API.

**Audience:** Internal lemon.markets Solution Engineers monitoring client integrations.

**Primary functions:**
1. Monitor order lifecycle across client integrations
2. Track client KYC/onboarding status
3. Inspect real-time event streams and webhook payloads
4. Detect anomalies and guide SEs through root-cause triage

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router + TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| State/Cache | TanStack React Query v5 |
| Database | Prisma + SQLite (local file, zero-setup) |
| Validation | Zod |
| Auth (future) | NextAuth.js with app-level credentials |
| Package manager | pnpm |
| Testing | Vitest (unit), Playwright (E2E) |

---

## Data Flow

```
Browser (React)  ←→  Next.js Server (API Routes)  ←→  lemon.markets API
                              ↕
                        SQLite (Prisma)
```

- Bearer token lives **server-side only** — never exposed to the browser
- Next.js API routes (`/api/lemon/*`) proxy requests to lemon.markets with Zod validation
- React Query polls these internal routes at configurable intervals
- Webhooks received at `/api/webhooks/lemon` are persisted to SQLite

### Sync Strategy

| Data | Source | Freshness |
|---|---|---|
| Spaces, Orders, Trades | React Query polling via API proxy | Every 10s (configurable) |
| Documents | On-demand fetch on Accounts page | Manual refresh |
| Events | Polling + Webhook push | Near real-time |
| Webhook payloads | Push to `/api/webhooks/lemon` | Instant |
| Issues | Derived client-side from Orders + Events | Every poll cycle |
| Triage Guides | Static JSON, bundled at build time | Code-deployed |

---

## Data Model

### Entities

| Entity | Source | Purpose |
|---|---|---|
| **Space** | lemon.markets API (`/v1/spaces`) | A client integration |
| **Order** | API (`/v1/trading/orders`) | Order lifecycle tracking |
| **Trade** | API (`/v1/trading/trades`) | Executed fills from orders |
| **Document** | API (`/v1/documents`) | KYC/onboarding status |
| **Event** | API (`/v1/events`) + Webhooks | Raw event stream |
| **Webhook** | Inbound receiver | Stored incoming payloads |
| **Issue** | Derived locally | Anomaly detected by the app |
| **TriageGuide** | Bundled JSON | Step-by-step troubleshooting playbooks |

### Persistence

- **Prisma + SQLite** — zero external DB dependency
- Orders, trades, documents, events synced from API on page load
- Webhooks persisted to SQLite as they arrive
- Issues derived client-side via the triage engine
- Triage guides are static JSON in the codebase

---

## Views (Screens)

### 1. Dashboard — Overview
- KPI cards: orders today, failed orders, pending KYC, open issues
- Recent issues feed with severity badges
- Quick-search bar (client name, order ID, ISIN)

### 2. Orders — Order Lifecycle Monitor
- Data table: Order ID, Client (Space), ISIN, Side, Quantity, Status, Created, Actions
- Filters: status, date range, client
- Inline expandable detail panel with full order JSON + timeline
- Auto-refresh (10s default, configurable)
- Color-coded status badges

### 3. Accounts — Onboarding Tracker
- Data table: spaces/clients with onboarding status
- Document status column (pending/approved/rejected)
- Detail expansion with rejection reasons, resubmission hints

### 4. Events — Real-Time Event Inspector
- Live event feed (newest first, auto-scrolling)
- Filters: event type, client, date range
- Click to inspect raw JSON payload (syntax highlighted)
- Webhook log tab with delivery status
- Full-text search across event payloads

### 5. Triage Center — Guided Troubleshooting
- Issues list: anomaly description, severity, client, first-seen time
- Click issue → step-by-step triage card:
  - E.g. "Order stuck in `open`": check market hours → check ISIN halt status → check position limits
  - Each step has a **Run Check** button querying the API
  - Hint box with common causes and past resolutions
  - Mark resolved with notes

---

## Project Structure

```
lemonmarkets/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   ├── accounts/
│   │   │   ├── events/
│   │   │   └── triage/
│   │   └── api/
│   │       ├── lemon/          # Proxy routes
│   │       └── webhooks/       # Webhook receiver
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── data-table.tsx
│   │   ├── status-badge.tsx
│   │   └── detail-panel.tsx
│   ├── lib/
│   │   ├── lemon-client.ts     # Typed API client
│   │   ├── triage-engine.ts    # Issue detection rules
│   │   └── triage-guides.json  # Bundled playbooks
│   ├── hooks/
│   │   ├── use-orders.ts
│   │   ├── use-spaces.ts
│   │   ├── use-events.ts
│   │   └── use-webhooks.ts
│   ├── types/
│   │   ├── lemon.ts            # Zod + inferred types
│   │   └── triage.ts
│   └── db/
│       ├── schema.prisma
│       └── seed.ts
├── docs/                       # Design docs and plans
└── package.json
```

---

## Error Handling

- **API proxy:** Every proxy route wraps fetch in try/catch, returns `{ ok: false, code, message }`
- **React Query:** `onError` callbacks → toast notifications
- **Component:** Error boundaries per view
- **API retry:** Idempotency-Key header forwarded for safe retries
- **Connection indicator:** Status pill in sidebar showing API health

---

## Testing Strategy

- **Unit:** Vitest for hooks, triage engine, lemon-client
- **Integration:** Playwright for E2E (dashboard → orders → event inspector)
- **Mock:** MSW or manual fixtures (no live API credentials required)
- **Seed:** SQLite seed script with demo spaces, orders, events

---

## Future Considerations (post-MVP)

- NextAuth.js for app-level user auth
- Alerting/notification rules (e.g., watch a specific client)
- Historical trend charts for order volume and failure rates
- Multi-user shared triage notes
- Export/Share issue reports
