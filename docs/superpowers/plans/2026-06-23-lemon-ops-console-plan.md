# Lemon Ops Console — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Technical Operations Console for lemon.markets internal Solution Engineers with order monitoring, onboarding tracking, event inspection, and guided triage.

**Architecture:** Single Next.js 16 App Router project with API routes proxying to the lemon.markets API. Prisma + SQLite for local persistence. shadcn/ui for dashboard components. React Query for server-state caching and polling.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack React Query v5, Prisma + SQLite, Zod, Vitest, Playwright

---

## Phase 1: Project Scaffolding

### Task 1.1: Create Next.js project

**Files:**
- Create: `lemonmarkets/` (project root)

- [ ] **Step 1: Create Next.js app**

Run: `npx create-next-app@latest lemonmarkets --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm`

Expected: Project created with all defaults. Confirm by running `cd lemonmarkets && pnpm dev` opens http://localhost:3000.

- [ ] **Step 2: Install core dependencies**

```bash
cd lemonmarkets
pnpm add @tanstack/react-query zod prisma @prisma/client
pnpm add -D @types/node vitest @vitejs/plugin-react
```

- [ ] **Step 3: Install shadcn/ui**

```bash
pnpm dlx shadcn@latest init -d
```

Expected: `components.json` created, `src/lib/utils.ts` created, `src/app/globals.css` updated.

- [ ] **Step 4: Add base shadcn/ui components**

```bash
# Core primitives we'll need
pnpm dlx shadcn@latest add button card table badge toast dropdown-menu sheet separator input
```

Expected: Components added under `src/components/ui/`.

- [ ] **Step 5: Set up Prisma with SQLite**

```bash
pnpm dlx prisma init --datasource-provider sqlite
```

Expected: `prisma/schema.prisma` created with SQLite provider, `.env` updated with `DATABASE_URL`.

- [ ] **Step 6: Commit scaffolding**

```bash
git add .
git commit -m "chore: scaffold Next.js project with shadcn/ui and Prisma"
```

---

### Task 1.2: Configure dev tooling

**Files:**
- Create: `vitest.config.ts`
- Create: `.env.example`
- Modify: `tsconfig.json` (ensure strict mode)
- Modify: `src/app/layout.tsx` (remove default boilerplate)

- [ ] **Step 1: Create Vitest config**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 2: Create .env.example**

```
# lemon.markets API credentials (sandbox)
LEMON_MARKETS_API_KEY=your_api_key_here
LEMON_MARKETS_BASE_URL=https://paper.lemon.markets/v1

# Database
DATABASE_URL=file:./dev.db
```

- [ ] **Step 3: Clean up layout boilerplate**

```typescript
// src/app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lemon Ops Console",
  description: "Technical Operations Console for lemon.markets",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Create Providers wrapper**

```typescript
// src/components/providers.tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 1000, // 10s default stale time
            retry: 2,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: configure Vitest, env, providers, and layout"
```

---

## Phase 2: Data Layer

### Task 2.1: Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Write the full schema**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Space {
  id        String   @id
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  orders    Order[]
  events    Event[]
  webhooks  Webhook[]
  issues    Issue[]
}

model Order {
  id         String   @id
  spaceId    String
  space      Space    @relation(fields: [spaceId], references: [id])
  isin       String
  side       String   // buy | sell
  quantity   String   // decimal string up to 5 decimal places
  limitPrice String?  // fixed-point 4 decimal places
  status     String   // open | filled | canceled | failed
  createdAt  DateTime
  updatedAt  DateTime @updatedAt

  trades  Trade[]
}

model Trade {
  id      String @id
  orderId String
  order   Order  @relation(fields: [orderId], references: [id])
  isin    String
  side    String
  price   String // fixed-point 4 decimal places
  quantity String
  createdAt DateTime
}

model Document {
  id        String   @id
  spaceId   String
  type      String   // id_front, id_back, proof_of_address, etc.
  status    String   // pending | approved | rejected
  rejectReason String?
  createdAt DateTime
  updatedAt DateTime @updatedAt
}

model Event {
  id        String   @id
  spaceId   String
  space     Space    @relation(fields: [spaceId], references: [id])
  type      String
  payload   String   // JSON string
  createdAt DateTime
}

model Webhook {
  id        String   @id
  spaceId   String
  space     Space    @relation(fields: [spaceId], references: [id])
  eventType String
  payload   String   // JSON string
  status    String   // received | processed | failed
  createdAt DateTime
}

model Issue {
  id          String   @id
  spaceId     String
  space       Space    @relation(fields: [spaceId], references: [id])
  type        String   // stuck_order, onboarding_incomplete, trade_failed
  severity    String   // low | medium | high | critical
  description String
  details     String?  // JSON string
  status      String   // open | investigating | resolved
  resolvedAt  DateTime?
  notes       String?
  createdAt   DateTime
  updatedAt   DateTime @updatedAt
}
```

- [ ] **Step 2: Run Prisma migration**

```bash
pnpm dlx prisma migrate dev --name init
```

Expected: Migration created and applied. SQLite database file created at `prisma/dev.db`.

- [ ] **Step 3: Generate Prisma client**

```bash
pnpm dlx prisma generate
```

- [ ] **Step 4: Create DB utility**

```typescript
// src/lib/db.ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add Prisma schema with all entities"
```

---

### Task 2.2: Zod types and validation schemas

**Files:**
- Create: `src/types/lemon.ts`
- Create: `src/types/triage.ts`

- [ ] **Step 1: Define lemon.markets API types**

```typescript
// src/types/lemon.ts
import { z } from "zod"

export const OrderStatus = z.enum(["open", "filled", "canceled", "failed"])
export type OrderStatus = z.infer<typeof OrderStatus>

export const OrderSchema = z.object({
  id: z.string().uuid(),
  space_id: z.string().uuid(),
  isin: z.string().length(12),
  side: z.enum(["buy", "sell"]),
  quantity: z.string(),
  limit_price: z.string().nullable(),
  status: OrderStatus,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type LemonOrder = z.infer<typeof OrderSchema>

export const SpaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  created_at: z.string().datetime(),
})
export type LemonSpace = z.infer<typeof SpaceSchema>

export const TradeSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  isin: z.string().length(12),
  side: z.enum(["buy", "sell"]),
  price: z.string(),
  quantity: z.string(),
  created_at: z.string().datetime(),
})
export type LemonTrade = z.infer<typeof TradeSchema>

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  space_id: z.string().uuid(),
  type: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  reject_reason: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type LemonDocument = z.infer<typeof DocumentSchema>

export const EventSchema = z.object({
  id: z.string().uuid(),
  space_id: z.string().uuid(),
  type: z.string(),
  payload: z.record(z.unknown()),
  created_at: z.string().datetime(),
})
export type LemonEvent = z.infer<typeof EventSchema>

// API response wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    results: z.array(data),
    next: z.string().nullable(),
    previous: z.string().nullable(),
  })

// Proxy API response formats
export const ProxySuccessSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    ok: z.literal(true),
    data,
  })

export const ProxyErrorSchema = z.object({
  ok: z.literal(false),
  code: z.string(),
  message: z.string(),
})

export type ProxyResponse<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string }
```

- [ ] **Step 2: Define triage types**

```typescript
// src/types/triage.ts
import { z } from "zod"

export const IssueSeverity = z.enum(["low", "medium", "high", "critical"])
export type IssueSeverity = z.infer<typeof IssueSeverity>

export const IssueStatus = z.enum(["open", "investigating", "resolved"])
export type IssueStatus = z.infer<typeof IssueStatus>

export const IssueType = z.enum([
  "stuck_order",
  "onboarding_incomplete",
  "trade_failed",
  "document_rejected",
  "webhook_delivery_failed",
])
export type IssueType = z.infer<typeof IssueType>

export const TriageStepSchema = z.object({
  id: z.string(),
  label: z.string(),         // "Check if market is open"
  description: z.string(),   // Detailed what-to-do text
  apiCheck: z.string().optional(), // API endpoint to call, e.g. "/v1/instruments/{isin}"
  hint: z.string().optional(),
})
export type TriageStep = z.infer<typeof TriageStepSchema>

export const TriageGuideSchema = z.object({
  issueType: IssueType,
  title: z.string(),
  description: z.string(),
  severity: IssueSeverity,
  steps: z.array(TriageStepSchema),
})
export type TriageGuide = z.infer<typeof TriageGuideSchema>

export const IssueSchema = z.object({
  id: z.string().uuid(),
  spaceId: z.string().uuid(),
  type: IssueType,
  severity: IssueSeverity,
  description: z.string(),
  details: z.string().nullable(),
  status: IssueStatus,
  resolvedAt: z.string().datetime().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
})
export type Issue = z.infer<typeof IssueSchema>
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add Zod schemas for lemon.markets API and triage types"
```

---

### Task 2.3: Lemon API client

**Files:**
- Create: `src/lib/lemon-client.ts`

- [ ] **Step 1: Write the typed API client**

```typescript
// src/lib/lemon-client.ts
import { z } from "zod"
import {
  type LemonOrder,
  type LemonSpace,
  type LemonTrade,
  type LemonDocument,
  type LemonEvent,
  OrderSchema,
  SpaceSchema,
  TradeSchema,
  DocumentSchema,
  EventSchema,
  ApiResponseSchema,
} from "@/types/lemon"

const BASE_URL = process.env.LEMON_MARKETS_BASE_URL || "https://paper.lemon.markets/v1"
const API_KEY = process.env.LEMON_MARKETS_API_KEY

class LemonApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = "LemonApiError"
  }
}

async function fetchLemon<T>(
  path: string,
  options?: { params?: Record<string, string>; signal?: AbortSignal }
): Promise<T> {
  if (!API_KEY) {
    throw new LemonApiError(401, "NO_API_KEY", "LEMON_MARKETS_API_KEY is not configured")
  }

  const url = new URL(`${BASE_URL}${path}`)
  if (options?.params) {
    Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    signal: options?.signal,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new LemonApiError(
      res.status,
      body.code || "UNKNOWN",
      body.message || `API returned ${res.status}`
    )
  }

  return res.json()
}

export const lemonApi = {
  // Spaces
  async getSpaces(signal?: AbortSignal) {
    const schema = ApiResponseSchema(SpaceSchema)
    return schema.parse(await fetchLemon<unknown>("/spaces", { signal }))
  },

  // Orders
  async getOrders(params?: {
    space_id?: string
    status?: string
    limit?: string
    signal?: AbortSignal
  }) {
    const { signal, ...rest } = params || {}
    const schema = ApiResponseSchema(OrderSchema)
    return schema.parse(await fetchLemon<unknown>("/trading/orders", { params: rest, signal }))
  },

  // Trades
  async getTrades(params?: {
    order_id?: string
    signal?: AbortSignal
  }) {
    const { signal, ...rest } = params || {}
    const schema = ApiResponseSchema(TradeSchema)
    return schema.parse(await fetchLemon<unknown>("/trading/trades", { params: rest, signal }))
  },

  // Documents
  async getDocuments(params?: {
    space_id?: string
    status?: string
    signal?: AbortSignal
  }) {
    const { signal, ...rest } = params || {}
    const schema = ApiResponseSchema(DocumentSchema)
    return schema.parse(await fetchLemon<unknown>("/documents", { params: rest, signal }))
  },

  // Events
  async getEvents(params?: {
    space_id?: string
    type?: string
    limit?: string
    signal?: AbortSignal
  }) {
    const { signal, ...rest } = params || {}
    const schema = ApiResponseSchema(EventSchema)
    return schema.parse(await fetchLemon<unknown>("/events", { params: rest, signal }))
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add typed lemon.markets API client"
```

---

## Phase 3: UI Shell

### Task 3.1: Dashboard layout with sidebar

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/components/sidebar.tsx`
- Modify: `src/app/page.tsx` (redirect to dashboard)

- [ ] **Step 1: Create sidebar component**

```typescript
// src/components/sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/orders", label: "Orders", icon: "📋" },
  { href: "/accounts", label: "Accounts", icon: "👤" },
  { href: "/events", label: "Events", icon: "🔌" },
  { href: "/triage", label: "Triage Center", icon: "🔍" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r bg-muted/30 flex flex-col p-4 gap-1 h-screen sticky top-0">
      <div className="font-bold text-lg mb-6 px-3">Lemon Ops</div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                pathname === item.href && "font-medium"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          API Connected
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Create dashboard layout**

```typescript
// src/app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Update root page to redirect**

```typescript
// src/app/page.tsx
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/dashboard")
}
```

- [ ] **Step 4: Create placeholder pages for empty views**

```typescript
// src/app/(dashboard)/dashboard/page.tsx
export default function DashboardPage() {
  return <div className="space-y-6">
    <h1 className="text-2xl font-bold">Dashboard</h1>
    <p className="text-muted-foreground">Loading overview...</p>
  </div>
}
```

Create similarly for:
- `src/app/(dashboard)/orders/page.tsx`
- `src/app/(dashboard)/accounts/page.tsx`
- `src/app/(dashboard)/events/page.tsx`
- `src/app/(dashboard)/triage/page.tsx`

Each with the same pattern (title + loading placeholder).

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add dashboard layout with sidebar navigation"
```

---

### Task 3.2: Shared UI components

**Files:**
- Create: `src/components/status-badge.tsx`
- Create: `src/components/data-table.tsx`
- Create: `src/components/detail-panel.tsx`

- [ ] **Step 1: Status badge component**

```typescript
// src/components/status-badge.tsx
import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  // Order statuses
  filled: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  open: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  canceled: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  // Document statuses
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  pending: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  // Issue severity
  critical: "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  // Generic
  received: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
  processed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status] || "bg-gray-100 text-gray-800"
      )}
    >
      {status}
    </span>
  )
}
```

- [ ] **Step 2: Data table component**

```typescript
// src/components/data-table.tsx
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">{emptyMessage}</div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={String(col.key)} className={col.className}>
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow
            key={item.id}
            className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
            onClick={() => onRowClick?.(item)}
          >
            {columns.map((col) => (
              <TableCell key={String(col.key)} className={col.className}>
                {col.render ? col.render(item) : String(item[col.key as keyof T] ?? "")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 3: Detail panel component**

```typescript
// src/components/detail-panel.tsx
"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DetailPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
}

export function DetailPanel({ open, onOpenChange, title, children }: DetailPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          {children}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 4: Add scroll-area shadcn component**

```bash
pnpm dlx shadcn@latest add scroll-area
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add shared UI components (status-badge, data-table, detail-panel)"
```

---

## Phase 4: Dashboard View

### Task 4.1: React Query hooks

**Files:**
- Create: `src/hooks/use-spaces.ts`
- Create: `src/hooks/use-orders.ts`
- Create: `src/hooks/use-events.ts`

- [ ] **Step 1: Spaces hook**

```typescript
// src/hooks/use-spaces.ts
"use client"

import { useQuery } from "@tanstack/react-query"
import type { LemonSpace } from "@/types/lemon"

async function fetchSpaces(): Promise<LemonSpace[]> {
  const res = await fetch("/api/lemon/spaces")
  if (!res.ok) throw new Error("Failed to fetch spaces")
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data.results
}

export function useSpaces() {
  return useQuery({
    queryKey: ["spaces"],
    queryFn: fetchSpaces,
  })
}
```

- [ ] **Step 2: Orders hook**

```typescript
// src/hooks/use-orders.ts
"use client"

import { useQuery } from "@tanstack/react-query"
import type { LemonOrder } from "@/types/lemon"

async function fetchOrders(): Promise<LemonOrder[]> {
  const res = await fetch("/api/lemon/orders")
  if (!res.ok) throw new Error("Failed to fetch orders")
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data.results
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    refetchInterval: 10_000, // poll every 10s
  })
}
```

- [ ] **Step 3: Events hook**

```typescript
// src/hooks/use-events.ts
"use client"

import { useQuery } from "@tanstack/react-query"
import type { LemonEvent } from "@/types/lemon"

async function fetchEvents(): Promise<LemonEvent[]> {
  const res = await fetch("/api/lemon/events")
  if (!res.ok) throw new Error("Failed to fetch events")
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data.results
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    refetchInterval: 10_000,
  })
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add React Query hooks for spaces, orders, events"
```

---

### Task 4.2: API proxy routes

**Files:**
- Create: `src/app/api/lemon/spaces/route.ts`
- Create: `src/app/api/lemon/orders/route.ts`
- Create: `src/app/api/lemon/events/route.ts`

- [ ] **Step 1: Spaces proxy route**

```typescript
// src/app/api/lemon/spaces/route.ts
import { NextResponse } from "next/server"
import { lemonApi } from "@/lib/lemon-client"

export async function GET() {
  try {
    const data = await lemonApi.getSpaces()
    return NextResponse.json({ ok: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { ok: false, code: "API_ERROR", message },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Orders proxy route**

```typescript
// src/app/api/lemon/orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { lemonApi } from "@/lib/lemon-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params: Record<string, string> = {}
    const spaceId = searchParams.get("space_id")
    const status = searchParams.get("status")
    if (spaceId) params.space_id = spaceId
    if (status) params.status = status

    const data = await lemonApi.getOrders({ ...params })
    return NextResponse.json({ ok: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { ok: false, code: "API_ERROR", message },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Events proxy route**

```typescript
// src/app/api/lemon/events/route.ts
import { NextRequest, NextResponse } from "next/server"
import { lemonApi } from "@/lib/lemon-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params: Record<string, string> = {}
    const spaceId = searchParams.get("space_id")
    const type = searchParams.get("type")
    if (spaceId) params.space_id = spaceId
    if (type) params.type = type

    const data = await lemonApi.getEvents({ ...params })
    return NextResponse.json({ ok: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { ok: false, code: "API_ERROR", message },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add API proxy routes for spaces, orders, events"
```

---

### Task 4.3: Dashboard page implementation

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Implement dashboard with KPI cards and issue feed**

```typescript
// src/app/(dashboard)/dashboard/page.tsx
"use client"

import { useOrders } from "@/hooks/use-orders"
import { useSpaces } from "@/hooks/use-spaces"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const { data: orders, isLoading: ordersLoading } = useOrders()
  const { data: spaces, isLoading: spacesLoading } = useSpaces()

  const today = new Date().toISOString().split("T")[0]
  const todayOrders = orders?.filter(
    (o) => o.created_at.startsWith(today)
  ) ?? []
  const failedOrders = todayOrders.filter((o) => o.status === "failed")
  const openIssues = orders?.filter((o) => o.status === "open").length ?? 0

  const isLoading = ordersLoading || spacesLoading

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Orders Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : todayOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Failed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? "..." : failedOrders.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : spaces?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Open Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{openIssues}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-3">
                {orders?.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">{order.isin}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.side} · {order.quantity}
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/orders">View All Orders →</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/orders">📋 Order Monitor — track live order lifecycle</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/accounts">👤 Accounts — view onboarding status</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/events">🔌 Events — inspect event stream and webhooks</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/triage">🔍 Triage Center — guided troubleshooting</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add card shadcn component**

```bash
pnpm dlx shadcn@latest add card
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: implement dashboard with KPI cards and recent orders"
```

---

## Phase 5: Orders View

### Task 5.1: Orders page with filters

**Files:**
- Modify: `src/app/(dashboard)/orders/page.tsx`

- [ ] **Step 1: Implement orders page**

```typescript
// src/app/(dashboard)/orders/page.tsx
"use client"

import { useState } from "react"
import { useOrders } from "@/hooks/use-orders"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DetailPanel } from "@/components/detail-panel"
import type { LemonOrder } from "@/types/lemon"
import type { Column } from "@/components/data-table"

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<LemonOrder | null>(null)

  const filtered = (orders ?? []).filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false
    if (
      searchQuery &&
      !order.isin.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !order.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  const columns: Column<LemonOrder>[] = [
    { key: "id", label: "Order ID", className: "w-[180px]" },
    { key: "isin", label: "ISIN", className: "w-[130px]" },
    {
      key: "side",
      label: "Side",
      render: (order) => (
        <span className={order.side === "buy" ? "text-green-600" : "text-red-600"}>
          {order.side.toUpperCase()}
        </span>
      ),
    },
    { key: "quantity", label: "Qty" },
    {
      key: "status",
      label: "Status",
      render: (order) => <StatusBadge status={order.status} />,
    },
    {
      key: "created_at",
      label: "Created",
      render: (order) => new Date(order.created_at).toLocaleString(),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="text-sm text-muted-foreground">
          Auto-refreshing every 10s
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by ISIN or Order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="filled">Filled</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading orders...</p>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(order) => setSelectedOrder(order)}
          emptyMessage="No orders found matching the current filters."
        />
      )}

      <DetailPanel
        open={!!selectedOrder}
        onOpenChange={(open) => { if (!open) setSelectedOrder(null) }}
        title={`Order ${selectedOrder?.id?.slice(0, 8) ?? ""}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Status</div>
              <StatusBadge status={selectedOrder.status} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">ISIN</div>
              <div className="text-sm font-mono">{selectedOrder.isin}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Side</div>
              <div className="text-sm">{selectedOrder.side}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Quantity</div>
              <div className="text-sm">{selectedOrder.quantity}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Created</div>
              <div className="text-sm">{new Date(selectedOrder.created_at).toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Raw Data</div>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-[400px]">
                {JSON.stringify(selectedOrder, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </DetailPanel>
    </div>
  )
}
```

- [ ] **Step 2: Add missing shadcn components**

```bash
pnpm dlx shadcn@latest add input select
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: implement orders view with filters and detail panel"
```

---

## Phase 6: Accounts View

### Task 6.1: Accounts page with document tracking

**Files:**
- Create: `src/hooks/use-documents.ts`
- Modify: `src/app/(dashboard)/accounts/page.tsx`

- [ ] **Step 1: Documents hook**

```typescript
// src/hooks/use-documents.ts
"use client"

import { useQuery } from "@tanstack/react-query"
import type { LemonDocument } from "@/types/lemon"

async function fetchDocuments(): Promise<LemonDocument[]> {
  const res = await fetch("/api/lemon/documents")
  if (!res.ok) throw new Error("Failed to fetch documents")
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data.results
}

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
  })
}
```

- [ ] **Step 2: Documents proxy route**

```typescript
// src/app/api/lemon/documents/route.ts
import { NextRequest, NextResponse } from "next/server"
import { lemonApi } from "@/lib/lemon-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params: Record<string, string> = {}
    const spaceId = searchParams.get("space_id")
    const status = searchParams.get("status")
    if (spaceId) params.space_id = spaceId
    if (status) params.status = status

    const data = await lemonApi.getDocuments({ ...params })
    return NextResponse.json({ ok: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { ok: false, code: "API_ERROR", message },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Implement accounts page**

```typescript
// src/app/(dashboard)/accounts/page.tsx
"use client"

import { useState } from "react"
import { useSpaces } from "@/hooks/use-spaces"
import { useDocuments } from "@/hooks/use-documents"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { DetailPanel } from "@/components/detail-panel"
import type { Column } from "@/components/data-table"
import type { LemonSpace } from "@/types/lemon"

export default function AccountsPage() {
  const { data: spaces, isLoading: spacesLoading } = useSpaces()
  const { data: documents, isLoading: docsLoading } = useDocuments()
  const [selectedSpace, setSelectedSpace] = useState<LemonSpace | null>(null)
  const isLoading = spacesLoading || docsLoading

  const spaceDocs = selectedSpace
    ? (documents ?? []).filter((d) => d.space_id === selectedSpace.id)
    : []

  const getSpaceStatus = (spaceId: string): string => {
    const docs = (documents ?? []).filter((d) => d.space_id === spaceId)
    if (docs.length === 0) return "pending"
    if (docs.some((d) => d.status === "rejected")) return "rejected"
    if (docs.every((d) => d.status === "approved")) return "approved"
    return "pending"
  }

  const columns: Column<LemonSpace>[] = [
    { key: "name", label: "Client Name" },
    {
      key: "id",
      label: "Status",
      render: (space) => <StatusBadge status={getSpaceStatus(space.id)} />,
    },
    {
      key: "created_at",
      label: "Created",
      render: (space) => new Date(space.created_at).toLocaleDateString(),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Accounts</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Loading accounts...</p>
      ) : (
        <DataTable
          columns={columns}
          data={spaces ?? []}
          onRowClick={(space) => setSelectedSpace(space)}
          emptyMessage="No accounts found."
        />
      )}

      <DetailPanel
        open={!!selectedSpace}
        onOpenChange={(open) => { if (!open) setSelectedSpace(null) }}
        title={`${selectedSpace?.name ?? ""} — Documents`}
      >
        {spaceDocs.length === 0 ? (
          <p className="text-muted-foreground">No documents found for this space.</p>
        ) : (
          <div className="space-y-4">
            {spaceDocs.map((doc) => (
              <div key={doc.id} className="p-3 rounded border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{doc.type}</div>
                  <StatusBadge status={doc.status} />
                </div>
                {doc.reject_reason && (
                  <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
                    Reason: {doc.reject_reason}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(doc.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </DetailPanel>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: implement accounts onboarding view with document tracking"
```

---

## Phase 7: Events View

### Task 7.1: Events page with webhook log

**Files:**
- Modify: `src/app/(dashboard)/events/page.tsx`

- [ ] **Step 1: Implement events page**

```typescript
// src/app/(dashboard)/events/page.tsx
"use client"

import { useState } from "react"
import { useEvents } from "@/hooks/use-events"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { DetailPanel } from "@/components/detail-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import type { LemonEvent } from "@/types/lemon"
import type { Column } from "@/components/data-table"

export default function EventsPage() {
  const { data: events, isLoading } = useEvents()
  const [selectedEvent, setSelectedEvent] = useState<LemonEvent | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = (events ?? []).filter((event) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      event.type.toLowerCase().includes(q) ||
      event.id.toLowerCase().includes(q) ||
      JSON.stringify(event.payload).toLowerCase().includes(q)
    )
  })

  const columns: Column<LemonEvent>[] = [
    { key: "type", label: "Type", render: (ev) => <code className="text-xs">{ev.type}</code> },
    { key: "id", label: "Event ID", className: "w-[200px]" },
    {
      key: "created_at",
      label: "Timestamp",
      render: (ev) => new Date(ev.created_at).toLocaleString(),
    },
  ]

  const webhookColumns: Column<{ id: string; eventType: string; status: string; createdAt: string }>[] = [
    { key: "eventType", label: "Event Type" },
    { key: "status", label: "Status", render: (wh) => <StatusBadge status={wh.status} /> },
    { key: "createdAt", label: "Received", render: (wh) => new Date(wh.createdAt).toLocaleString() },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <div className="text-sm text-muted-foreground">
          Auto-refreshing every 10s
        </div>
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Event Stream</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook Log</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Input
            placeholder="Search events by type, ID, or payload..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />

          {isLoading ? (
            <p className="text-muted-foreground">Loading events...</p>
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              onRowClick={(ev) => setSelectedEvent(ev)}
              emptyMessage="No events found."
            />
          )}

          <DetailPanel
            open={!!selectedEvent}
            onOpenChange={(open) => { if (!open) setSelectedEvent(null) }}
            title={`Event: ${selectedEvent?.type ?? ""}`}
          >
            {selectedEvent && (
              <div className="space-y-4">
                <div className="text-sm font-medium">Raw Payload</div>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-[500px]">
                  {JSON.stringify(selectedEvent, null, 2)}
                </pre>
              </div>
            )}
          </DetailPanel>
        </TabsContent>

        <TabsContent value="webhooks">
          <p className="text-muted-foreground mb-4">
            Incoming webhooks are stored here for inspection. Set up your lemon.markets webhook to
            point to <code>/api/webhooks/lemon</code>.
          </p>
          <DataTable
            columns={webhookColumns}
            data={[]}
            emptyMessage="No webhooks received yet. Configure a webhook endpoint in your lemon.markets dashboard."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Add tabs component**

```bash
pnpm dlx shadcn@latest add tabs
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: implement events view with event stream and webhook log"
```

---

## Phase 8: Triage Center

### Task 8.1: Triage engine and guides

**Files:**
- Create: `src/lib/triage-engine.ts`
- Create: `src/lib/triage-guides.json`

- [ ] **Step 1: Create triage guides data**

```json
// src/lib/triage-guides.json
[
  {
    "issueType": "stuck_order",
    "title": "Order Stuck in 'open'",
    "description": "An order has been in 'open' status longer than expected and has not filled or failed.",
    "severity": "medium",
    "steps": [
      {
        "id": "check-market-hours",
        "label": "Check if the market is currently open",
        "description": "Verify that the relevant exchange is in trading hours. Many orders remain open simply because the market is closed.",
        "hint": "Use the instruments endpoint to check trading hours for this ISIN."
      },
      {
        "id": "check-isin-halt",
        "label": "Check if the ISIN is halted",
        "description": "Some instruments may have trading halts. Check the instrument status for halt indicators.",
        "apiCheck": "/v1/instruments/{isin}",
        "hint": "Test with sandbox ISINs: XF0000000046 (buy halt), XF0000000053 (sell halt), XF0000000061 (both halt)."
      },
      {
        "id": "check-position-limits",
        "label": "Verify position limits",
        "description": "Check if the space has reached its position limits for this instrument.",
        "hint": "Position limits are configured per space in the lemon.markets dashboard."
      }
    ]
  },
  {
    "issueType": "trade_failed",
    "title": "Trade Execution Failed",
    "description": "A trade has failed to execute. This may be due to insufficient funds, invalid ISIN, or market conditions.",
    "severity": "high",
    "steps": [
      {
        "id": "check-order-details",
        "label": "Review the failed order details",
        "description": "Check the order's response payload for the failure reason code.",
        "hint": "Common codes: insufficient_funds, invalid_isin, market_closed, limit_reached."
      },
      {
        "id": "check-account-balance",
        "label": "Verify the account has sufficient funds",
        "description": "Check the space's cash balance to ensure enough funds are available for the trade.",
        "apiCheck": "/v1/spaces/{space_id}"
      },
      {
        "id": "validate-isin",
        "label": "Validate the ISIN is tradeable",
        "description": "Confirm the ISIN is a valid, tradeable instrument through the instruments endpoint.",
        "apiCheck": "/v1/instruments/{isin}"
      }
    ]
  },
  {
    "issueType": "onboarding_incomplete",
    "title": "Client Onboarding Incomplete",
    "description": "A client space has not completed the KYC/documentation process.",
    "severity": "medium",
    "steps": [
      {
        "id": "check-document-status",
        "label": "Review which documents are pending",
        "description": "Check the documents endpoint for this space to see which KYC documents are still pending or rejected.",
        "apiCheck": "/v1/documents?space_id={space_id}",
        "hint": "Common requirements: ID front/back, proof of address, tax declaration."
      },
      {
        "id": "check-rejection-reasons",
        "label": "Review rejection reasons",
        "description": "If documents were rejected, check the rejection reason to guide the client on resubmission.",
        "hint": "Common reasons: image_unreadable, document_expired, name_mismatch, address_mismatch."
      },
      {
        "id": "guide-resubmission",
        "label": "Guide the client on resubmission",
        "description": "Provide clear guidance on what needs to be corrected and resubmitted.",
        "hint": "Clients can re-upload documents through the onboarding flow."
      }
    ]
  },
  {
    "issueType": "document_rejected",
    "title": "KYC Document Rejected",
    "description": "A client's KYC document has been rejected and needs attention.",
    "severity": "high",
    "steps": [
      {
        "id": "review-rejection",
        "label": "Review the rejection reason",
        "description": "Check the document's reject_reason field to understand why it was rejected.",
        "apiCheck": "/v1/documents/{document_id}"
      },
      {
        "id": "communicate-with-client",
        "label": "Communicate with the client",
        "description": "Inform the client about what needs to be corrected and how to resubmit.",
        "hint": "Be specific about what's wrong. 'Image too dark' vs. 'Document expired' require different actions."
      }
    ]
  }
]
```

- [ ] **Step 2: Create triage engine**

```typescript
// src/lib/triage-engine.ts
import guidesData from "./triage-guides.json"
import type { TriageGuide, IssueType } from "@/types/triage"
import type { LemonOrder } from "@/types/lemon"

const guides = guidesData as TriageGuide[]

export function getGuide(issueType: IssueType): TriageGuide | undefined {
  return guides.find((g) => g.issueType === issueType)
}

export function getAllGuides(): TriageGuide[] {
  return guides
}

export interface DetectedIssue {
  type: IssueType
  description: string
}

export function detectIssues(orders: LemonOrder[]): DetectedIssue[] {
  const issues: DetectedIssue[] = []

  // Detect stuck orders: open for more than 5 minutes
  const now = Date.now()
  for (const order of orders) {
    if (order.status === "open") {
      const created = new Date(order.created_at).getTime()
      if (now - created > 5 * 60 * 1000) {
        issues.push({
          type: "stuck_order",
          description: `Order ${order.id.slice(0, 8)} for ${order.isin} has been open since ${new Date(order.created_at).toLocaleTimeString()}`,
        })
      }
    }
    if (order.status === "failed") {
      issues.push({
        type: "trade_failed",
        description: `Order ${order.id.slice(0, 8)} for ${order.isin} failed`,
      })
    }
  }

  return issues
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add triage engine and bundled guides"
```

---

### Task 8.2: Triage center page

**Files:**
- Modify: `src/app/(dashboard)/triage/page.tsx`

- [ ] **Step 1: Implement triage center**

```typescript
// src/app/(dashboard)/triage/page.tsx
"use client"

import { useState } from "react"
import { useOrders } from "@/hooks/use-orders"
import { detectIssues, getGuide, getAllGuides } from "@/lib/triage-engine"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { IssueType, TriageGuide, TriageStep } from "@/types/triage"

export default function TriagePage() {
  const { data: orders, isLoading } = useOrders()
  const [activeGuide, setActiveGuide] = useState<TriageGuide | null>(null)

  const issues = orders ? detectIssues(orders) : []
  const guides = getAllGuides()

  const openGuide = (type: IssueType) => {
    const guide = getGuide(type)
    if (guide) setActiveGuide(guide)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Triage Center</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Issues */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Scanning orders...</p>
              ) : issues.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-green-600 font-medium">No issues detected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All monitored orders are functioning normally.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {issues.map((issue, i) => {
                    const guide = getGuide(issue.type)
                    return (
                      <div
                        key={i}
                        className="flex items-start justify-between p-3 rounded border"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={guide?.severity ?? "medium"} />
                            <span className="font-medium text-sm">
                              {guide?.title ?? issue.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{issue.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openGuide(issue.type)}
                        >
                          Triage →
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Playbooks */}
          <Card>
            <CardHeader>
              <CardTitle>All Triage Playbooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {guides.map((guide) => (
                  <div
                    key={guide.issueType}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer"
                    onClick={() => setActiveGuide(guide)}
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">{guide.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {guide.steps.length} steps · {guide.steps.filter(s => s.apiCheck).length} API checks
                      </div>
                    </div>
                    <Badge variant="outline">{guide.severity}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Guide Panel */}
        <div className="lg:col-span-1">
          {activeGuide ? (
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{activeGuide.title}</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveGuide(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {activeGuide.description}
                </p>
                <div className="space-y-4">
                  {activeGuide.steps.map((step, i) => (
                    <div key={step.id} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <div>
                          <div className="text-sm font-medium">{step.label}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {step.description}
                          </p>
                          {step.apiCheck && (
                            <div className="mt-2">
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                {step.apiCheck}
                              </code>
                            </div>
                          )}
                          {step.hint && (
                            <div className="mt-2 text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 p-2 rounded">
                              💡 {step.hint}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <Button className="w-full" variant="outline">
                    ✓ Mark as Resolved
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Select an issue or playbook to begin guided troubleshooting.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add badge component**

```bash
pnpm dlx shadcn@latest add badge
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: implement triage center with issue detection and playbooks"
```

---

## Phase 9: Seed Data & Mock Mode

### Task 9.1: Seed script with test data

**Files:**
- Create: `src/db/seed.ts`

- [ ] **Step 1: Write seed script**

```typescript
// src/db/seed.ts
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  console.log("Seeding database with demo data...")

  // Create demo spaces
  const spaces = await Promise.all([
    db.space.create({
      data: {
        id: "00000000-0000-0000-0000-000000000001",
        name: "Demo Client A",
      },
    }),
    db.space.create({
      data: {
        id: "00000000-0000-0000-0000-000000000002",
        name: "Demo Client B",
      },
    }),
    db.space.create({
      data: {
        id: "00000000-0000-0000-0000-000000000003",
        name: "Demo Client C",
      },
    }),
  ])
  console.log(`Created ${spaces.length} spaces`)

  // Create demo orders
  const orders = await Promise.all([
    db.order.create({
      data: {
        id: "10000000-0000-0000-0000-000000000001",
        spaceId: spaces[0].id,
        isin: "XF0000000046",
        side: "buy",
        quantity: "10.00000",
        status: "open",
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
      },
    }),
    db.order.create({
      data: {
        id: "10000000-0000-0000-0000-000000000002",
        spaceId: spaces[0].id,
        isin: "US0378331005",
        side: "sell",
        quantity: "5.00000",
        status: "filled",
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
    }),
    db.order.create({
      data: {
        id: "10000000-0000-0000-0000-000000000003",
        spaceId: spaces[1].id,
        isin: "DE000BASF111",
        side: "buy",
        quantity: "20.00000",
        status: "failed",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    }),
  ])
  console.log(`Created ${orders.length} orders`)

  // Create demo events
  const events = await Promise.all([
    db.event.create({
      data: {
        id: "20000000-0000-0000-0000-000000000001",
        spaceId: spaces[0].id,
        type: "order.created",
        payload: JSON.stringify({ order_id: orders[0].id, isin: "XF0000000046" }),
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
      },
    }),
    db.event.create({
      data: {
        id: "20000000-0000-0000-0000-000000000002",
        spaceId: spaces[0].id,
        type: "order.filled",
        payload: JSON.stringify({ order_id: orders[1].id, fill_price: "150.2500" }),
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
    }),
    db.event.create({
      data: {
        id: "20000000-0000-0000-0000-000000000003",
        spaceId: spaces[1].id,
        type: "order.failed",
        payload: JSON.stringify({ order_id: orders[2].id, reason: "insufficient_funds" }),
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    }),
  ])
  console.log(`Created ${events.length} events`)

  console.log("Seed complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
```

- [ ] **Step 2: Add seed script to package.json**

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "tsx src/db/seed.ts"
  }
}
```

Install tsx: `pnpm add -D tsx`

- [ ] **Step 3: Run seed**

```bash
pnpm dlx prisma db seed
```

Expected: Database populated with 3 spaces, 3 orders, 3 events.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add seed script with demo data"
```

---

## Phase 10: Testing

### Task 10.1: Unit tests

**Files:**
- Create: `src/lib/__tests__/triage-engine.test.ts`
- Create: `src/lib/__tests__/lemon-client.test.ts`

- [ ] **Step 1: Write triage engine tests**

```typescript
// src/lib/__tests__/triage-engine.test.ts
import { describe, it, expect } from "vitest"
import { detectIssues, getGuide, getAllGuides } from "../triage-engine"
import type { LemonOrder } from "@/types/lemon"

const makeOrder = (overrides: Partial<LemonOrder> = {}): LemonOrder => ({
  id: "10000000-0000-0000-0000-000000000001",
  space_id: "00000000-0000-0000-0000-000000000001",
  isin: "US0378331005",
  side: "buy",
  quantity: "10.00000",
  limit_price: null,
  status: "open",
  created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

describe("triage-engine", () => {
  describe("getGuide", () => {
    it("returns the correct guide for stuck_order", () => {
      const guide = getGuide("stuck_order")
      expect(guide).toBeDefined()
      expect(guide?.title).toBe("Order Stuck in 'open'")
      expect(guide?.steps.length).toBeGreaterThan(0)
    })

    it("returns undefined for unknown issue type", () => {
      const guide = getGuide("unknown" as any)
      expect(guide).toBeUndefined()
    })
  })

  describe("getAllGuides", () => {
    it("returns all guides", () => {
      const guides = getAllGuides()
      expect(guides.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe("detectIssues", () => {
    it("detects stuck orders (open > 5 min)", () => {
      const order = makeOrder({
        status: "open",
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      })
      const issues = detectIssues([order])
      expect(issues).toHaveLength(1)
      expect(issues[0].type).toBe("stuck_order")
    })

    it("does not flag recent open orders", () => {
      const order = makeOrder({
        status: "open",
        created_at: new Date().toISOString(),
      })
      const issues = detectIssues([order])
      expect(issues).toHaveLength(0)
    })

    it("detects failed orders", () => {
      const order = makeOrder({ status: "failed" })
      const issues = detectIssues([order])
      expect(issues).toHaveLength(1)
      expect(issues[0].type).toBe("trade_failed")
    })

    it("ignores filled and canceled orders", () => {
      const orders: LemonOrder[] = [
        makeOrder({ id: "1", status: "filled" }),
        makeOrder({ id: "2", status: "canceled" }),
      ]
      const issues = detectIssues(orders)
      expect(issues).toHaveLength(0)
    })
  })
})
```

- [ ] **Step 2: Run tests**

```bash
pnpm vitest run
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "test: add unit tests for triage engine"
```

---

### Task 10.2: E2E smoke test

**Files:**
- Create: `e2e/dashboard.spec.ts`
- Modify: `package.json` (add playwright config)

- [ ] **Step 1: Install Playwright**

```bash
pnpm dlx playwright install chromium
```

- [ ] **Step 2: Create E2E test**

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from "@playwright/test"

test.describe("Lemon Ops Console", () => {
  test("loads dashboard with KPI cards", async ({ page }) => {
    await page.goto("/dashboard")

    // Dashboard title is visible
    await expect(page.locator("h1")).toHaveText("Dashboard")

    // KPI cards are rendered
    const cards = page.locator("h3")
    await expect(cards.nth(0)).toHaveText("Orders Today")
    await expect(cards.nth(1)).toHaveText("Failed Today")
    await expect(cards.nth(2)).toHaveText("Active Clients")
    await expect(cards.nth(3)).toHaveText("Open Issues")
  })

  test("navigates through all views", async ({ page }) => {
    await page.goto("/dashboard")

    // Navigate to Orders
    await page.getByRole("link", { name: "Orders" }).click()
    await expect(page.locator("h1")).toHaveText("Orders")

    // Navigate to Accounts
    await page.getByRole("link", { name: "Accounts" }).click()
    await expect(page.locator("h1")).toHaveText("Accounts")

    // Navigate to Events
    await page.getByRole("link", { name: "Events" }).click()
    await expect(page.locator("h1")).toHaveText("Events")

    // Navigate to Triage
    await page.getByRole("link", { name: "Triage Center" }).click()
    await expect(page.locator("h1")).toHaveText("Triage Center")
  })

  test("triage page shows playbooks", async ({ page }) => {
    await page.goto("/triage")

    const allGuidesCard = page.locator("text=All Triage Playbooks")
    await expect(allGuidesCard).toBeVisible()

    // Click first playbook
    const playbook = page.locator("text=Order Stuck in 'open'").first()
    await playbook.click()

    // Guide panel opens
    await expect(page.locator("text=Check if the market is currently open")).toBeVisible()
  })
})
```

- [ ] **Step 3: Add Playwright config and script**

```bash
pnpm dlx playwright init
```

Add to package.json scripts:
```json
{
  "scripts": {
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "test: add E2E smoke tests for navigation and triage"
```

---

## Phase 11: Polish & Error Handling

### Task 11.1: Error boundaries and connection indicator

**Files:**
- Create: `src/components/error-boundary.tsx`
- Create: `src/app/api/lemon/health/route.ts`

- [ ] **Step 1: Create error boundary**

```typescript
// src/components/error-boundary.tsx
"use client"

import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <Card className="m-6">
          <CardHeader>
            <CardTitle className="text-red-600">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
                window.location.reload()
              }}
            >
              Reload Page
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
```

- [ ] **Step 2: Create health check endpoint**

```typescript
// src/app/api/lemon/health/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  const hasApiKey = !!process.env.LEMON_MARKETS_API_KEY

  return NextResponse.json({
    ok: hasApiKey,
    status: hasApiKey ? "connected" : "no_api_key",
    message: hasApiKey
      ? "API key is configured"
      : "LEMON_MARKETS_API_KEY is not set. Using demo mode.",
  })
}
```

- [ ] **Step 3: Update sidebar to show health indicator**

Modify `src/components/sidebar.tsx` — the health indicator is already rendered in Task 3.1. The green/red dot is already there. Optionally add a health check hook.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add error boundaries and health check endpoint"
```

---

## Summary of Files Created

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Database schema (8 models) |
| `src/lib/db.ts` | Prisma client singleton |
| `src/types/lemon.ts` | Zod schemas for lemon.markets API |
| `src/types/triage.ts` | Zod schemas for triage entities |
| `src/lib/lemon-client.ts` | Typed API client |
| `src/lib/triage-engine.ts` | Issue detection rules |
| `src/lib/triage-guides.json` | Bundled troubleshooting playbooks |
| `src/components/providers.tsx` | React Query + toast provider |
| `src/components/sidebar.tsx` | Navigation sidebar |
| `src/components/status-badge.tsx` | Color-coded status badges |
| `src/components/data-table.tsx` | Generic data table |
| `src/components/detail-panel.tsx` | Slide-out detail panel |
| `src/components/error-boundary.tsx` | React error boundary |
| `src/hooks/use-spaces.ts` | Spaces React Query hook |
| `src/hooks/use-orders.ts` | Orders React Query hook |
| `src/hooks/use-events.ts` | Events React Query hook |
| `src/hooks/use-documents.ts` | Documents React Query hook |
| `src/app/api/lemon/*/route.ts` | 4 API proxy routes + health |
| `src/app/(dashboard)/*` | 5 view pages |
| `src/db/seed.ts` | Demo data seeder |
| `src/lib/__tests__/triage-engine.test.ts` | Unit tests |
| `e2e/dashboard.spec.ts` | E2E smoke tests |
| `vitest.config.ts` | Vitest configuration |
