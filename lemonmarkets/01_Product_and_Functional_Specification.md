# Part 1 --- Product & Functional Specification

## Lemon Markets Sandbox Lifecycle Dashboard

**Document status:** Development baseline v0.1\
**Purpose:** Product/UX specification for an agentic
software-development system.

------------------------------------------------------------------------

## 1. Product Goal

Build an interactive **API Lifecycle Explorer / Operations Console** for
the Lemon Markets Sandbox.

The application must let a user operate the sandbox through a coherent
lifecycle while simultaneously exposing what happens underneath:

> **User action → API request → API response → application state change
> → asynchronous event**

The product is not primarily a trading terminal. It is a visual,
interactive demonstration and operational interface for understanding
and exercising the Lemon Markets API lifecycle.

The lifecycle is:

1.  Account
2.  KYC Simulation
3.  Funding
4.  Market Data
5.  Trading
6.  Portfolio

The interface must make these stages feel like parts of one connected
system rather than six unrelated pages.

------------------------------------------------------------------------

## 2. Primary User

The primary user is a technical user evaluating, integrating with,
debugging, or learning the Lemon Markets Sandbox API.

The application should be useful for:

-   API exploration
-   integration demonstrations
-   debugging
-   sandbox testing
-   understanding asynchronous behaviour
-   demonstrating engineering ability in an interview or technical
    review

The UI should therefore favour **observability, explicit state, and
traceability** over decorative fintech visuals.

------------------------------------------------------------------------

## 3. Core Experience

The main application shell contains four functional regions:

``` text
┌───────────────────────────────────────────────────────────────┐
│ Top Bar: application status / environment / account           │
├──────────────┬──────────────────────────────┬─────────────────┤
│              │                              │                 │
│ Lifecycle    │ Interaction Area             │ Data Inspector  │
│ Navigation   │                              │                 │
│              │ Current lifecycle operation  │ Request         │
│ Account      │                              │ Response        │
│ KYC          │ Forms / state / results      │ Headers/metadata│
│ Funding      │                              │                 │
│ Market Data  │                              │                 │
│ Trading      │                              │                 │
│ Portfolio    │                              │                 │
├──────────────┴──────────────────────────────┴─────────────────┤
│ Event / Activity Stream                                       │
└───────────────────────────────────────────────────────────────┘
```

### 3.1 Lifecycle navigation

The left navigation represents the operational journey.

Each stage has a visual state:

-   `idle`
-   `active`
-   `success`
-   `warning`
-   `error`

The navigation should make completed and currently active stages
immediately visible.

### 3.2 Interaction area

The centre pane is the primary workspace.

It changes according to the selected lifecycle stage and contains:

-   state information
-   controls
-   forms
-   actions
-   results
-   validation feedback
-   loading states
-   errors
-   relevant data visualisations

### 3.3 Data inspector

The right pane exposes API activity.

At minimum it must support:

-   HTTP method
-   endpoint
-   request body
-   response body
-   HTTP status
-   timing
-   request/response metadata where available

A tabbed presentation is recommended:

``` text
Request | Response
```

A JSON viewer must support readable formatting and syntax highlighting.

### 3.4 Event stream

The bottom activity area displays asynchronous and application events.

Example:

``` text
14:03:21  KYC_UPDATED
14:02:47  ORDER_CREATED
14:02:43  ORDER_ACTIVATED
14:01:12  QUOTE_UPDATED
```

Selecting an event should allow the user to inspect its payload and
related API operation where available.

------------------------------------------------------------------------

## 4. Functional Lifecycle

### 4.1 Account

The user must be able to:

-   select an existing sandbox account
-   retrieve account information
-   create a sandbox account where supported
-   inspect account state
-   inspect the underlying request and response

The UI must clearly distinguish:

-   local application state
-   remote API state

### 4.2 KYC Simulation

The user must be able to:

-   select an account
-   select or represent a supported sandbox KYC state
-   trigger the supported sandbox KYC operation
-   observe the response
-   observe the resulting state/event

Do not invent KYC states or endpoint semantics. They must come from the
verified Lemon Markets API documentation.

### 4.3 Funding

The user must be able to:

-   view relevant funding/account cash information
-   perform supported sandbox funding operations
-   see the resulting balance/state
-   inspect request and response
-   observe asynchronous events where applicable

### 4.4 Market Data

The user must be able to:

-   select an instrument
-   retrieve instrument information
-   retrieve supported quote/market data
-   view current values in a readable format
-   inspect the underlying API calls

A lightweight chart may be added only when the available data makes it
meaningful.

### 4.5 Trading

The user must be able to:

-   select an account
-   select an instrument
-   specify supported order parameters
-   submit an order
-   inspect order creation
-   activate an order where supported
-   observe order status/events
-   inspect every relevant request/response

The UI must never imply that an operation succeeded merely because a
button was clicked. Success is based on the actual API response and/or
verified asynchronous state.

### 4.6 Portfolio

The user must be able to:

-   retrieve positions
-   view relevant account/portfolio information
-   inspect supported documents where applicable
-   connect resulting positions to preceding trading activity where
    practical

------------------------------------------------------------------------

## 5. Cross-Cutting Behaviour

Every API-backed action should follow this lifecycle:

``` text
Idle
 ↓
Submitting
 ↓
HTTP request
 ↓
Response received
 ├── Success → update state
 └── Error   → expose error
 ↓
Optional asynchronous event
 ↓
Refresh/reconcile state
```

The application must preserve enough context for the user to answer:

> "What did I just do, what did the API return, and what changed?"

------------------------------------------------------------------------

## 6. Error Handling

Errors are first-class UI states.

The interface must distinguish at least:

-   validation errors
-   network errors
-   authentication/authorization errors
-   API errors
-   timeout errors
-   asynchronous/event errors
-   unknown/unexpected errors

Errors should provide:

-   human-readable explanation
-   HTTP status where applicable
-   API error payload where available
-   affected operation
-   retry action where safe

Never hide the underlying API error behind a generic "Something went
wrong."

------------------------------------------------------------------------

## 7. Persistence

Local persistence may be used for non-sensitive session information such
as:

-   selected account
-   selected lifecycle stage
-   UI preferences
-   recent activity metadata

Do **not** persist API secrets/tokens in browser local storage.

The server-side boundary owns sensitive credentials.

------------------------------------------------------------------------

## 8. UX Principles

1.  **Observable over opaque.**
2.  **Lifecycle over disconnected pages.**
3.  **Explicit state over implied state.**
4.  **Technical clarity over visual decoration.**
5.  **Real API results over optimistic UI claims.**
6.  **Recoverable errors over dead ends.**
7.  **Shared components over duplicated screens.**

The visual direction should be a restrained dark technical operations
console. Avoid excessive neon effects, gradients, or decorative elements
that reduce readability.

------------------------------------------------------------------------

## 9. Non-Goals for V1

Do not expand V1 into:

-   a full retail trading platform
-   a production brokerage frontend
-   advanced portfolio analytics
-   social trading
-   complex charting
-   elaborate authentication/account management
-   an AI assistant

These may be future capabilities, but they are not required to prove the
core concept.

------------------------------------------------------------------------

## 10. V1 Acceptance Criteria

V1 is successful when a reviewer can:

1.  Open the application and understand the lifecycle immediately.
2.  Select or create a sandbox account using supported API
    functionality.
3.  Execute a KYC sandbox operation.
4.  Perform a supported funding operation.
5.  Retrieve market data.
6.  Create/activate a supported sandbox order.
7.  Observe the resulting portfolio/position state.
8.  Inspect API requests and responses for those actions.
9.  Observe relevant asynchronous events.
10. Understand the relationship between actions, API traffic, events,
    and state.

The application must remain usable when an API operation fails.

------------------------------------------------------------------------

## 11. Source-of-Truth Rule

The architecture illustration is a **product and system concept**, not
an authoritative API contract.

Any endpoint, HTTP method, request schema, response schema, event type,
or authentication mechanism shown in the illustration must be verified
against the current Lemon Markets documentation before implementation.

If the illustration and official API documentation disagree, the
verified API documentation wins.

The agent must never fabricate an endpoint merely because it appears
visually plausible in the diagram.
