# APIsimulator - Provider Operations Console

<p align="center">
  <img src="APIsimulator.jpg" alt="APIsimulator" width="400">
</p>
> **Observe, inspect, and triage your sandbox API lifecycle - from initial request to async event.**

## Fun things you can do

- Watch an API call travel from click to database to async event - in real time
- Run the whole console in Demo Mode with zero API keys
- See the full lifecycle: Action, Request, Response, DB State, Event

## What It Does

APIsimulator makes the full API lifecycle visible in one place: Action → Request → Response → DB State → Async Event. It runs in Demo Mode with no API key, so you can evaluate the console before you ever have credentials.

## Features

- **5-stage lifecycle visibility** — Action → Request → Response → DB State → Async Event
- **Demo Mode** — zero API keys needed to start
- **Zod validation** — runtime type safety on all API boundaries
- **Server-side proxying** — API keys never reach the browser
- **Fixed-point money** — amounts stored as strings, no floating-point surprises
- **Triage ladder** — severity-based issue classification

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000. The console runs in Demo Mode by default.

## Tech Stack

- Next.js 15, React 19, Tailwind 4
- Prisma (7 models), Zod
- Demo Mode (no API keys needed)
- Server-side proxying

## Project Layout

```text
APIsimulator/
├── app/                    # Next.js app router
├── components/             # UI components
├── lib/                    # Shared utilities
├── prisma/                 # Database schema + migrations
├── public/                 # Static assets
└── scripts/                # Utility scripts
```

## Verification

- `npm run build` — 0 errors
- `npm run lint` — ESLint clean
- Demo Mode works without any API credentials

## Links

- Blog post: Provider Ops Console (coming soon)