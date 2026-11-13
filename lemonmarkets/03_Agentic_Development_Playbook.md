# Part 3 --- Agentic Development Playbook

## Lemon Markets Sandbox Lifecycle Dashboard

**Document status:** Development execution baseline v0.1\
**Audience:** An autonomous or semi-autonomous software-development
agent.

------------------------------------------------------------------------

# 1. Mission

You are responsible for developing the Lemon Markets Sandbox Lifecycle
Dashboard described in Parts 1 and 2.

Your job is not merely to generate code.

Your job is to:

1.  understand the intended product
2.  verify external API contracts
3.  design the implementation
4.  build incrementally
5.  test each vertical slice
6.  inspect your own work
7.  correct defects
8.  maintain architectural consistency
9.  stop when the acceptance criteria are satisfied

Do not implement the entire application blindly in one pass.

------------------------------------------------------------------------

# 2. Source-of-Truth Hierarchy

When making decisions, use this priority:

### 1. Current official Lemon Markets API documentation

Authoritative for external API behaviour.

### 2. Part 1 --- Product & Functional Specification

Authoritative for intended user experience and functional scope.

### 3. Part 2 --- Technical Architecture & Engineering Specification

Authoritative for internal architecture and engineering constraints.

### 4. Architecture illustration

Authoritative for the intended conceptual relationship between:

-   browser
-   backend proxy
-   Lemon Markets API
-   REST
-   asynchronous events
-   session state
-   lifecycle stages

It is **not** authoritative for exact API contracts.

### 5. Existing repository code

Preserve valid existing decisions unless they conflict with the
specifications or create a demonstrable technical problem.

------------------------------------------------------------------------

# 3. Agent Operating Loop

For every significant task:

``` text
UNDERSTAND
   ↓
INSPECT
   ↓
PLAN
   ↓
IMPLEMENT
   ↓
TEST
   ↓
REVIEW
   ↓
CORRECT
   ↓
DOCUMENT
```

Never skip the inspection phase.

Before modifying a file:

-   inspect related files
-   understand existing abstractions
-   identify dependencies
-   check whether the functionality already exists

Do not create duplicate abstractions simply because the desired code is
not immediately visible.

------------------------------------------------------------------------

# 4. Initial Repository Audit

Before writing feature code, inspect:

-   package manager
-   framework version
-   TypeScript configuration
-   existing components
-   styling system
-   routing
-   environment configuration
-   linting
-   formatting
-   testing
-   build scripts
-   existing API code
-   README
-   Git state

Produce an internal implementation plan based on the actual repository
rather than assuming an empty project.

If the repository is empty, scaffold according to Part 2.

------------------------------------------------------------------------

# 5. Establish the Foundation First

Implement the following before integrating all API modules:

``` text
Application shell
├── Top bar
├── Lifecycle sidebar
├── Main interaction pane
├── Data inspector
└── Event stream
```

Initially use mocked data.

The first milestone is visual and structural correctness.

The application should already resemble a coherent operations console
before external API complexity is introduced.

------------------------------------------------------------------------

# 6. Build by Vertical Slice

Do not build all UI first and all backend functionality later.

Build complete vertical slices.

Recommended order:

## Slice 1 --- Account

Implement:

``` text
Account UI
 ↓
client API function
 ↓
server route
 ↓
Lemon API
 ↓
normalized result
 ↓
inspector
 ↓
state refresh
```

Add tests.

Only then proceed.

## Slice 2 --- KYC

Implement the verified sandbox KYC flow.

Ensure asynchronous state/event handling is represented correctly.

## Slice 3 --- Funding

Implement supported funding operations and resulting state.

## Slice 4 --- Market Data

Implement instrument/quote retrieval.

## Slice 5 --- Trading

Implement the smallest meaningful supported order lifecycle.

Prefer:

``` text
create → inspect → activate → observe
```

over building a sophisticated trading terminal.

## Slice 6 --- Portfolio

Connect positions/account data to preceding trading activity.

------------------------------------------------------------------------

# 7. API Integration Procedure

Before implementing an endpoint:

### Step A

Find the official documentation.

### Step B

Record:

``` text
Endpoint
HTTP method
Authentication
Path parameters
Query parameters
Request body
Response body
Error responses
Sandbox behaviour
Rate limits
Async/event behaviour
```

### Step C

Create or update the TypeScript contract.

### Step D

Implement the server-side integration.

### Step E

Implement the client hook/function.

### Step F

Implement UI.

### Step G

Add tests.

Never infer a request schema from a screenshot.

------------------------------------------------------------------------

# 8. Mocking Strategy

The application must be developable without repeatedly hitting the real
sandbox.

Create fixtures representing:

-   successful account response
-   validation error
-   authentication error
-   API error
-   KYC response
-   funding response
-   instrument response
-   quote response
-   order creation
-   order activation
-   position response
-   asynchronous event

The mock layer must resemble the verified external contracts.

Do not invent mock fields that the production application does not
understand.

------------------------------------------------------------------------

# 9. UI Development Rules

The agent should create reusable primitives.

Prefer:

``` text
ApiStatusBadge
JsonViewer
OperationCard
AccountSelector
LifecycleNavItem
EventItem
ErrorPanel
LoadingState
EmptyState
```

over repeating equivalent markup inside every page.

Domain components should compose these primitives.

Example:

``` text
TradingPage
 ├── AccountSelector
 ├── InstrumentSelector
 ├── OrderForm
 ├── ApiStatusBadge
 ├── OperationCard
 └── EventItem
```

------------------------------------------------------------------------

# 10. Interaction Rules

Every button that performs an API action must communicate:

### Before

What will happen?

### During

The operation is running.

### After success

What actually happened?

### After failure

What failed and what can the user do?

Avoid ambiguous buttons such as:

``` text
GO
RUN
DO IT
```

Prefer explicit actions:

``` text
Create Account
Trigger KYC Update
Retrieve Quotes
Place Order
Activate Order
Refresh Portfolio
```

------------------------------------------------------------------------

# 11. Inspector Rules

The inspector is a core product feature, not a debugging widget that can
be added later.

Every meaningful API operation should produce an inspectable record.

Example:

``` text
POST /api/orders
────────────────────────
Request
{
  ...
}

Response
201
{
  ...
}

Duration
184 ms
```

If a request fails:

``` text
POST /api/orders
────────────────────────
Status
400

Error
{
  ...
}
```

The inspector should never display credentials.

------------------------------------------------------------------------

# 12. Event Stream Rules

Events should be:

-   timestamped
-   typed
-   source-labelled
-   selectable
-   inspectable

Events should not be silently discarded simply because they arrive after
the original API request.

Where an event changes remote state:

``` text
event received
 ↓
identify affected domain
 ↓
invalidate/refetch relevant query
 ↓
render authoritative state
```

Do not rely exclusively on local mutation state.

------------------------------------------------------------------------

# 13. Lifecycle State

Maintain a derived lifecycle status.

Example:

``` text
Account       ✓
KYC           ✓
Funding       ✓
Market Data   ●
Trading       ○
Portfolio     ○
```

The state must be derived from actual known conditions.

Do not mark a lifecycle stage complete merely because the user visited
it.

------------------------------------------------------------------------

# 14. Error Injection

Before declaring a module complete, deliberately test:

-   invalid form input
-   API 4xx
-   API 5xx
-   network failure
-   timeout
-   malformed/unexpected response
-   duplicate submission
-   event arriving after mutation
-   event arriving before a refresh
-   empty response/data state

A feature that only works on the happy path is incomplete.

------------------------------------------------------------------------

# 15. Agent Self-Review Checklist

After each vertical slice, inspect the implementation and answer:

### Product

-   Does this help the user understand the lifecycle?
-   Is the relationship between action and API activity visible?
-   Is the UI consistent with the rest of the console?

### Architecture

-   Is business logic in the correct layer?
-   Did I introduce duplicated logic?
-   Did I leak external API details into UI components?
-   Did I put remote state into global client state unnecessarily?

### Security

-   Can any secret reach the browser?
-   Is sensitive data persisted?
-   Is external JSON rendered safely?
-   Are logs safe?

### Reliability

-   What happens if the API fails?
-   What happens if an async event arrives late?
-   What happens if the user clicks twice?
-   Can stale data be mistaken for authoritative state?

### Testing

-   Is the happy path covered?
-   Is at least one failure path covered?
-   Is the critical integration path covered?

------------------------------------------------------------------------

# 16. Milestone Gates

Do not continue automatically if a gate fails.

## Gate 1 --- Shell

Required:

-   application runs
-   layout works
-   navigation works
-   responsive behaviour is acceptable
-   mocked inspector works
-   mocked event stream works

## Gate 2 --- Account

Required:

-   real or verified mocked account flow works
-   request appears
-   response appears
-   state updates
-   errors render correctly

## Gate 3 --- KYC/Funding

Required:

-   verified sandbox flows work
-   state transitions are observable
-   relevant events are handled

## Gate 4 --- Market Data

Required:

-   instruments load
-   quotes load
-   loading/error/empty states work

## Gate 5 --- Trading

Required:

-   supported order flow works
-   order state is observable
-   async changes are reconciled

## Gate 6 --- Portfolio

Required:

-   positions load
-   portfolio reflects supported preceding operations

## Gate 7 --- Release

Required:

-   production build succeeds
-   lint/type checks pass
-   tests pass
-   no secrets are exposed
-   README explains setup
-   environment variables are documented
-   core lifecycle can be demonstrated from start to finish

------------------------------------------------------------------------

# 17. Definition of Done

A task is done only when:

-   implementation exists
-   relevant tests exist
-   type checking passes
-   linting passes
-   error handling exists
-   loading states exist
-   the feature integrates with the inspector where applicable
-   the feature integrates with lifecycle state where applicable
-   no architectural boundary was violated
-   the agent has reviewed the resulting code

A feature is not done because the page renders.

------------------------------------------------------------------------

# 18. Documentation Requirements

Maintain:

``` text
README.md
.env.example
architecture documentation
API integration notes
```

README must explain:

-   what the application does
-   architecture
-   local setup
-   required environment variables
-   development commands
-   testing
-   sandbox configuration
-   security considerations

Do not document unverified API behaviour as fact.

------------------------------------------------------------------------

# 19. Git/Change Discipline

Keep changes logically grouped.

Prefer commits or change sets such as:

``` text
feat: create dashboard shell
feat: add account lifecycle
feat: add API inspector
feat: add KYC simulation
feat: add funding flow
feat: add market data
feat: add trading lifecycle
feat: add portfolio view
test: add lifecycle integration coverage
fix: reconcile asynchronous order state
```

Do not mix unrelated refactors into feature changes unless necessary.

------------------------------------------------------------------------

# 20. Final End-to-End Demonstration

Before declaring the project complete, perform this conceptual journey:

``` text
START
 │
 ▼
Open dashboard
 │
 ▼
Select/create sandbox account
 │
 ▼
Inspect account API request/response
 │
 ▼
Run supported KYC simulation
 │
 ▼
Observe resulting state/event
 │
 ▼
Fund account
 │
 ▼
Observe balance/state
 │
 ▼
Retrieve market data
 │
 ▼
Select instrument
 │
 ▼
Create supported order
 │
 ▼
Activate order if supported
 │
 ▼
Observe asynchronous updates
 │
 ▼
Refresh/reconcile portfolio
 │
 ▼
Inspect resulting positions
 │
 ▼
END
```

At every step the user should be able to answer:

> **What did I do?**

> **What did the API return?**

> **What changed?**

> **What event occurred?**

That is the final test of whether the application fulfils its purpose.

------------------------------------------------------------------------

# 21. Agent Stop Conditions

Stop implementation and request human clarification when:

-   the product requirement is genuinely ambiguous
-   official API documentation conflicts materially with the
    specification
-   an API capability shown in the architecture illustration does not
    exist
-   an external operation has unclear financial/sandbox consequences
-   credentials or security requirements are unclear
-   a major architectural change becomes necessary

Do not guess simply to keep coding.

For minor implementation choices, use the documented architecture and
established repository conventions.

------------------------------------------------------------------------

# 22. Final Engineering Principle

The application should demonstrate that the developer understands a
financial API as a **system and lifecycle**, not merely as a collection
of HTTP endpoints.

The finished product should make this visible:

``` text
                 HUMAN
                   │
                   ▼
              USER ACTION
                   │
                   ▼
             API REQUEST
                   │
                   ▼
            API RESPONSE
                   │
          ┌────────┴────────┐
          ▼                 ▼
     STATE CHANGE       ASYNC EVENT
          │                 │
          └────────┬────────┘
                   ▼
             APPLICATION
                STATE
                   │
                   ▼
             HUMAN-READABLE
               RESULT
```

If a design decision improves this chain, it is likely aligned with the
product.

If it obscures this chain, question whether it belongs in V1.
