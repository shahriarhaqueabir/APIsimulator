# Part 2 --- Technical Architecture & Engineering Specification

## Lemon Markets Sandbox Lifecycle Dashboard

**Document status:** Development baseline v0.1\
**Purpose:** Technical contract for an agentic development system.

------------------------------------------------------------------------

## 1. Architecture Objective

Create a maintainable web application with a strict separation between:

1.  presentation
2.  client-side application state
3.  server/API integration
4.  external Lemon Markets services
5.  asynchronous event handling

Target architecture:

``` text
┌───────────────────────────────┐
│ Browser                       │
│                               │
│ React / Next.js UI             │
│ Lifecycle UI                   │
│ JSON Inspector                 │
│ Event Stream                   │
│ Local session state            │
└───────────────┬───────────────┘
                │
                │ HTTPS / application API
                ▼
┌───────────────────────────────┐
│ Next.js server boundary       │
│                               │
│ API routes / server services  │
│ Lemon API client              │
│ Credential handling           │
│ Webhook/SSE handling          │
│ Response normalization        │
└───────────────┬───────────────┘
                │
                │ HTTPS
                ▼
┌───────────────────────────────┐
│ Lemon Markets Sandbox         │
│ REST + supported async APIs   │
└───────────────────────────────┘
```

------------------------------------------------------------------------

## 2. Recommended Stack

Use:

-   **Next.js**
-   **React**
-   **TypeScript**
-   **Tailwind CSS**
-   **shadcn/ui**
-   **Lucide React**
-   **TanStack Query**
-   **Zustand**
-   **React Hook Form**
-   **Zod**
-   **Vitest**
-   **Playwright**

Use a JSON viewer/editor component appropriate for the inspector. Monaco
is acceptable if its bundle cost is justified; otherwise use a
lightweight JSON viewer.

Use a charting library only where market/portfolio data genuinely
benefits from visualisation.

------------------------------------------------------------------------

## 3. Architectural Boundaries

### 3.1 UI layer

React components render:

-   lifecycle state
-   forms
-   tables
-   cards
-   charts
-   inspector
-   events

Components should not contain raw external API URLs or credentials.

### 3.2 Client API layer

Create typed functions/hooks such as:

``` text
lib/api/
  client
  accounts
  kyc
  funding
  market
  orders
  portfolio
```

The client layer communicates only with the application's own server
routes.

### 3.3 Server integration layer

The server owns:

-   Lemon API base URL
-   credentials
-   external request construction
-   external response handling
-   logging
-   webhook/SSE integration
-   security-sensitive logic

No secret should be shipped to the browser bundle.

------------------------------------------------------------------------

## 4. Suggested Repository Structure

``` text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── account/
│   ├── kyc/
│   ├── funding/
│   ├── market-data/
│   ├── trading/
│   └── portfolio/
│
├── components/
│   ├── layout/
│   │   ├── DashboardShell.tsx
│   │   ├── TopBar.tsx
│   │   ├── Sidebar.tsx
│   │   └── InspectorPanel.tsx
│   │
│   ├── lifecycle/
│   │   ├── LifecycleNav.tsx
│   │   ├── LifecycleStatus.tsx
│   │   └── LifecycleProgress.tsx
│   │
│   ├── inspector/
│   │   ├── RequestViewer.tsx
│   │   ├── ResponseViewer.tsx
│   │   └── JsonViewer.tsx
│   │
│   ├── events/
│   │   ├── EventStream.tsx
│   │   └── EventDetails.tsx
│   │
│   ├── account/
│   ├── kyc/
│   ├── funding/
│   ├── market/
│   ├── trading/
│   └── portfolio/
│
├── lib/
│   ├── api/
│   ├── hooks/
│   ├── validation/
│   └── utils/
│
├── stores/
│   └── appStore.ts
│
├── types/
│   ├── api.ts
│   ├── account.ts
│   ├── kyc.ts
│   ├── funding.ts
│   ├── market.ts
│   ├── order.ts
│   └── portfolio.ts
│
└── styles/
    └── globals.css
```

The exact structure may evolve, but domain boundaries must remain clear.

------------------------------------------------------------------------

## 5. State Management

Use **TanStack Query** for remote/server state:

-   accounts
-   KYC state
-   balances
-   instruments
-   quotes
-   orders
-   positions
-   documents

Use **Zustand** only for application/UI state, for example:

``` ts
type LifecycleStep =
  | "account"
  | "kyc"
  | "funding"
  | "market-data"
  | "trading"
  | "portfolio";

interface AppState {
  activeLifecycle: LifecycleStep;
  activeAccountId: string | null;
  inspectorOpen: boolean;
}
```

Do not duplicate remote API data inside Zustand unless there is a
documented reason.

------------------------------------------------------------------------

## 6. API Contract Model

Every API operation should produce an internal operation record.

Conceptually:

``` ts
interface ApiOperation {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status?: number;
  durationMs?: number;
  request?: unknown;
  response?: unknown;
  error?: unknown;
}
```

This model powers the inspector and activity history.

Do not assume the external API's response shape is identical to this
internal model.

------------------------------------------------------------------------

## 7. Event Model

Represent application-visible events consistently:

``` ts
interface AppEvent {
  id: string;
  timestamp: string;
  type: string;
  source: "api" | "webhook" | "sse" | "system";
  accountId?: string;
  operationId?: string;
  payload?: unknown;
}
```

The actual event types and transport must be verified against Lemon
Markets documentation.

The frontend should not care whether an event arrived through webhook
processing, SSE, polling, or another supported mechanism. It should
consume a normalized application event.

------------------------------------------------------------------------

## 8. Request/Response Inspection

Every API-backed mutation should be observable.

Recommended flow:

``` text
UI action
   ↓
mutation hook
   ↓
server route
   ↓
external API
   ↓
normalized operation record
   ↓
UI
   ├── update domain state
   └── display inspector
```

The inspector should support:

-   copy JSON
-   formatted JSON
-   collapsed/expanded nodes
-   status badge
-   method badge
-   endpoint/path
-   timestamp
-   duration
-   error payload

Never expose secrets in the inspector.

Redact:

-   bearer tokens
-   API keys
-   cookies
-   authorization headers
-   other credential material

------------------------------------------------------------------------

## 9. Asynchronous State Reconciliation

Asynchronous events can arrive after the original HTTP response.

Therefore:

``` text
POST order
   ↓
201 Created
   ↓
UI shows "created"
   ↓
event arrives
   ↓
invalidate/refetch relevant query
   ↓
UI shows authoritative current state
```

Do not permanently treat an optimistic state as authoritative.

The API is the source of truth for remote state.

------------------------------------------------------------------------

## 10. Authentication and Secrets

Credentials must remain server-side.

Environment configuration should follow a pattern such as:

``` env
LEMON_API_URL=
LEMON_API_TOKEN=
```

Do not expose secret environment variables through `NEXT_PUBLIC_*`.

Do not write tokens into:

-   localStorage
-   sessionStorage
-   IndexedDB
-   URL parameters
-   client-side logs
-   event payloads
-   screenshots/test snapshots

------------------------------------------------------------------------

## 11. Error Architecture

Create a normalized internal error model:

``` ts
interface AppError {
  kind:
    | "validation"
    | "network"
    | "authentication"
    | "authorization"
    | "api"
    | "timeout"
    | "event"
    | "unknown";

  message: string;
  status?: number;
  operationId?: string;
  details?: unknown;
}
```

External errors should be normalized at the server/client boundary
rather than interpreted independently by every component.

------------------------------------------------------------------------

## 12. Loading and Mutation Semantics

Every async operation needs explicit states:

``` text
idle
loading
success
error
```

For mutations, disable duplicate submissions while the operation is in
flight unless the API explicitly supports idempotent repeated requests.

For destructive or financially meaningful operations, require explicit
user confirmation where appropriate.

------------------------------------------------------------------------

## 13. Validation

Use Zod schemas for user-entered data.

Validation should happen:

1.  client-side for immediate feedback
2.  server-side before external API calls

Client validation is a UX feature, not a security boundary.

Never trust browser input.

------------------------------------------------------------------------

## 14. Testing Architecture

### Unit tests

Test:

-   validation schemas
-   API response normalization
-   state transitions
-   error normalization
-   lifecycle logic

### Component tests

Test:

-   lifecycle navigation
-   forms
-   loading states
-   error states
-   inspector rendering
-   event rendering

### End-to-end tests

At minimum verify:

``` text
Open dashboard
→ select account
→ perform supported operation
→ see request
→ see response
→ see state update
```

Where live sandbox access is unsuitable for CI, provide mocked API
fixtures and a dedicated integration-test mode.

------------------------------------------------------------------------

## 15. Security Baseline

The agent must check for:

-   credential leakage
-   unsafe logging
-   XSS through rendered API payloads
-   uncontrolled HTML rendering
-   insecure proxying
-   missing input validation
-   accidental secret persistence
-   overly permissive CORS
-   unsafe error disclosure

JSON from external APIs must be rendered as data, never injected as
arbitrary HTML.

------------------------------------------------------------------------

## 16. Performance

Avoid premature optimisation.

Priorities:

1.  fast initial dashboard rendering
2.  small reusable components
3.  avoid unnecessary global state
4.  cache read-heavy API data appropriately
5.  lazy-load heavy inspector/editor components if necessary
6.  avoid rendering an unbounded event stream

The event stream should have a bounded in-memory history or pagination
strategy.

------------------------------------------------------------------------

## 17. API Verification Rule

The agent must verify the current Lemon Markets API documentation before
implementing external integrations.

The architecture image contains conceptual endpoint examples. It is not
sufficient evidence for exact:

-   URL paths
-   HTTP methods
-   request fields
-   response fields
-   authentication
-   sandbox behaviour
-   event transport
-   rate limits

Never invent or silently approximate an external API contract.

------------------------------------------------------------------------

## 18. Definition of Technical Completion

The implementation is technically complete when:

-   frontend and backend boundaries are separated
-   external credentials remain server-side
-   all supported lifecycle modules use typed API integration
-   remote state is managed consistently
-   API operations appear in the inspector
-   asynchronous events are normalized
-   errors are explicit
-   unit/component/E2E coverage exists for core flows
-   no known credential leakage exists
-   the application can run against mocks without the external API
-   the real sandbox integration is verified independently
