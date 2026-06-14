# AI CRM

> Production-ready, AI-native Customer Relationship Management system built as a pnpm monorepo. Combines a React SPA, Express API, MongoDB persistence, Redis-backed job queues, and Anthropic Claude for intelligent lead scoring, sentiment analysis, and natural-language CRM querying.

[![CI](https://github.com/your-org/ai-crm/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/ai-crm/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Claude](https://img.shields.io/badge/Claude-Sonnet%204.6-D97706)](https://anthropic.com/)

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Backend Architecture](#backend-architecture)
- [Data Model](#data-model)
- [Authentication Flow](#authentication-flow)
- [AI Engine](#ai-engine)
- [Frontend Architecture](#frontend-architecture)
- [Background Jobs & Scheduler](#background-jobs--scheduler)
- [CI/CD Pipeline](#cicd-pipeline)
- [Security Model](#security-model)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)

---

## System Architecture

The system is split into three deployable units: a static SPA served through nginx, a Node.js API server, and shared backing services (MongoDB + Redis).

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        SPA["React SPA\n(Vite build)"]
    end

    subgraph Infra["Infrastructure"]
        Nginx["nginx :80\n(SPA + cache headers)"]
        API["Express API :4000"]
        Mongo[("MongoDB 7\nDocument Store")]
        Redis[("Redis 7\nQueue + Cache")]
    end

    subgraph AI["AI Layer"]
        Claude["Anthropic\nClaude API"]
        Worker["BullMQ Workers\n(concurrency: 5)"]
        Cron["node-cron\nScheduler"]
    end

    SPA -->|REST / JSON| API
    Nginx -->|serve static| SPA
    API --> Mongo
    API --> Redis
    API -->|direct calls| Claude
    Worker -->|job processing| Claude
    Worker --> Mongo
    Redis -->|queue transport| Worker
    Cron -->|enqueue batches| Redis
```

---

## Tech Stack

### Backend

| Layer         | Technology                             | Purpose                                           |
| ------------- | -------------------------------------- | ------------------------------------------------- |
| Runtime       | Node.js 20 LTS                         | JavaScript runtime                                |
| Framework     | Express 4.21                           | HTTP server, routing, middleware chain            |
| Database      | MongoDB 7 + Mongoose 8                 | Document persistence, aggregation pipelines       |
| Cache / Queue | Redis 7 + BullMQ 5                     | Async job queues, rate-limit counters             |
| AI Provider   | Anthropic Claude (`claude-sonnet-4-6`) | Scoring, sentiment, follow-up, chat               |
| Auth          | JWT (jsonwebtoken) + bcryptjs          | Stateless access tokens + refresh token rotation  |
| Validation    | Zod 3 (shared with client)             | Request parsing, AI response validation           |
| Logging       | Pino 9 + pino-http                     | Structured JSON logs                              |
| Scheduling    | node-cron 4                            | Nightly batch scoring (02:00 UTC)                 |
| Config        | envalid                                | Typed, validated environment variables at startup |

### Frontend

| Layer         | Technology                 | Purpose                                         |
| ------------- | -------------------------- | ----------------------------------------------- |
| Framework     | React 18.3                 | UI rendering                                    |
| Build         | Vite 5                     | Dev server, bundling, HMR                       |
| Routing       | React Router v6            | Client-side navigation, protected routes        |
| Server state  | TanStack Query 5           | Data fetching, caching, mutation + invalidation |
| Forms         | React Hook Form 7 + Zod    | Validated, uncontrolled forms                   |
| Drag & Drop   | dnd-kit                    | Pipeline Kanban board                           |
| Charts        | Recharts 3                 | Analytics dashboards                            |
| Styling       | Tailwind CSS 3             | Utility-first CSS                               |
| UI Primitives | Radix UI                   | Accessible, unstyled headless components        |
| i18n          | i18next 23                 | EN / PL translations                            |
| Testing       | Vitest 2 + Testing Library | Unit + component tests                          |
| Components    | Storybook 8                | Visual documentation + isolated development     |

### Infrastructure & Tooling

| Tool                  | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| pnpm 9 workspaces     | Monorepo dependency management                  |
| Turborepo 2           | Task orchestration, build graph, local cache    |
| Docker / Compose      | Local dev environment + production images       |
| GitHub Actions        | CI (lint → test → build) + CD (GHCR push)       |
| Husky 9 + lint-staged | Git hooks — format on commit, typecheck on push |
| Commitlint            | Conventional Commits enforcement                |
| Prettier 3            | Consistent code formatting                      |

---

## Monorepo Structure

```
ai-crm/
├── packages/
│   ├── shared/                  # @ai-crm/shared
│   │   └── src/
│   │       ├── schemas/         # Zod schemas: auth, contact, deal, ai (source of truth)
│   │       └── types/           # api.types.ts (ApiResponse, PaginatedResponse), enums
│   │
│   ├── server/                  # @ai-crm/server
│   │   └── src/
│   │       ├── app.ts           # DI wiring + Express app factory (createApp)
│   │       ├── server.ts        # Entry point: connectDB → createApp → listen
│   │       ├── modules/         # auth | contacts | deals | activities | analytics
│   │       ├── ai/              # AiClient, providers, services, prompts, AiUsageTracker
│   │       ├── jobs/            # BullMQ queues, workers, node-cron scheduler
│   │       ├── config/          # env.ts, database.ts, redis.ts
│   │       └── shared/          # errors, middleware, utils
│   │
│   └── client/                  # @ai-crm/client
│       └── src/
│           ├── app/             # App.tsx, providers.tsx, router.tsx
│           ├── features/        # auth | contacts | pipeline | ai | ai-chat | analytics | activities | settings
│           └── shared/          # components/ui, components/layout, hooks, i18n, lib/axios, lib/queryClient
│
├── .github/
│   ├── workflows/               # ci.yml, cd.yml
│   ├── ISSUE_TEMPLATE/          # bug_report.yml, feature_request.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODEOWNERS
│   └── dependabot.yml
│
├── turbo.json                   # Task pipeline: build → lint/test
├── pnpm-workspace.yaml
└── docker-compose.yml
```

**Turborepo task graph** — `shared:build` must complete before any downstream lint or test:

```mermaid
graph LR
    SB["shared:build"] --> CB["client:build"]
    SB --> ServerB["server:build"]
    SB --> CL["client:lint"]
    SB --> SL["server:lint"]
    CB --> CT["client:test"]
    ServerB --> ST["server:test"]
```

---

## Backend Architecture

### Layered Architecture

Every domain module follows the same four-layer contract. Layers only call downward — no skipping allowed.

```mermaid
graph TD
    HTTP["HTTP Request"] --> GM["Global Middleware\nhelmet · cors · rateLimit · pinoHttp · cookieParser"]
    GM --> Auth["authenticate middleware\nJWT verify → req.user"]
    Auth --> Val["validateRequest middleware\nZod schema parse → 400 on failure"]
    Val --> C["Controller\nthin — delegates to service, uses asyncHandler"]
    C --> S["Service\nbusiness logic, throws typed AppError subclasses"]
    S --> R["Repository\nIRepository interface — Mongoose implementation"]
    R --> DB[("MongoDB")]
    S --> AI["AiClient\nretry · timeout · usage tracking"]
    AI --> P["IAiProvider interface"]
    P -->|ENABLE_AI=true| Claude["ClaudeProvider\n@anthropic-ai/sdk"]
    P -->|ENABLE_AI=false| Mock["MockAiProvider\nno network calls"]
    C -.->|"uncaught throws"| EH["errorHandler middleware\nAppError → JSON envelope"]

    style GM fill:#dbeafe
    style Auth fill:#dbeafe
    style Val fill:#dbeafe
    style EH fill:#fee2e2
```

### Dependency Injection

All wiring happens **once**, explicitly in `src/app.ts`. No IoC container, no decorators, no magic. Repositories are constructed, injected into services, services into controllers, controllers into route factories:

```typescript
// app.ts — illustrative excerpt
const contactRepository = new MongoContactRepository();
const activityRepository = new MongoActivityRepository();
const aiClient = new AiClient(aiProvider, usageTracker, env.ENABLE_AI);
const scoringService = new ContactScoringService(contactRepository, activityRepository, aiClient);
const contactController = new ContactController(
  contactService,
  scoringService,
  followUpService,
  sentimentService,
);
```

Consequences: test isolation is trivial (inject mock repositories), swapping a data store only requires a new class implementing the `IRepository` interface.

### API Response Envelope

All endpoints return the same shape:

```
// Success (single or paginated)
{ "success": true,  "data": T, "meta"?: { page, limit, total, totalPages } }

// Error
{ "success": false, "message": string, "errors"?: ZodIssue[] }
```

### Route Map

| Method + Path                                        | Module                                         |
| ---------------------------------------------------- | ---------------------------------------------- |
| `POST /api/auth/register · login · refresh · logout` | Auth                                           |
| `GET · POST /api/contacts`                           | Contacts — list (filtered, paginated) + create |
| `GET · PUT · DELETE /api/contacts/:id`               | Contacts — detail, update, soft-delete         |
| `PATCH /api/contacts/bulk-status`                    | Contacts — bulk status update                  |
| `GET · POST /api/contacts/:id/activities`            | Activities scoped to contact                   |
| `GET · POST · PUT · DELETE /api/deals`               | Deals CRUD                                     |
| `GET · POST /api/deals/:id/activities`               | Activities scoped to deal                      |
| `GET /api/activities`                                | Global activity feed                           |
| `GET /api/analytics`                                 | Dashboard KPIs + chart data                    |
| `POST /api/ai/score/:contactId`                      | AI — single contact scoring                    |
| `POST /api/ai/score/bulk`                            | AI — enqueue batch scoring job                 |
| `GET /api/ai/score-history/:contactId`               | AI — scoring history                           |
| `POST /api/ai/follow-up/:contactId`                  | AI — generate follow-up suggestions            |
| `POST /api/ai/sentiment/:contactId`                  | AI — trigger sentiment analysis                |
| `POST /api/ai/chat`                                  | AI — natural-language CRM query                |
| `GET /api/ai/usage`                                  | AI — token usage + cost dashboard              |

---

## Data Model

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string email UK
        string passwordHash
        string name
        string role "user or admin"
        string[] refreshTokens
        boolean isActive
        Date lastLoginAt
    }

    CONTACT {
        ObjectId _id PK
        ObjectId ownerId FK
        string name
        string email
        string status "lead|prospect|customer|churned"
        string[] tags
        Record customFields
        object aiScore "value, scoredAt, reasoning, signals{pos,neg}"
        string sentiment "positive|neutral|at-risk"
        Date deletedAt "null = active (soft delete)"
    }

    DEAL {
        ObjectId _id PK
        ObjectId contactId FK
        ObjectId ownerId FK
        string title
        number value
        string stage "discovery|proposal|negotiation|closed_won|closed_lost"
        string priority "low|medium|high"
        object[] stageHistory "stage, changedAt, changedBy, daysInPreviousStage"
        Date expectedCloseDate
        Date closedAt
        Date deletedAt "null = active (soft delete)"
    }

    ACTIVITY {
        ObjectId _id PK
        ObjectId contactId FK
        ObjectId dealId FK "optional"
        ObjectId ownerId FK
        string type "call|email|note|meeting|task"
        string title
        string body
        Date scheduledAt
        Date completedAt
    }

    SCORING_HISTORY {
        ObjectId _id PK
        ObjectId contactId FK
        ObjectId ownerId FK
        number score
        number previousScore
        string reasoning
        string[] signalsPositive
        string[] signalsNegative
        string recommendedAction
        string aiModel
        number tokensUsed
    }

    AI_USAGE {
        ObjectId _id PK
        ObjectId ownerId FK
        string feature "lead_scoring|sentiment|follow_up|chat"
        string entityId
        number inputTokens
        number outputTokens
        number estimatedCostUsd
        number latencyMs
        string model
    }

    USER        ||--o{ CONTACT         : "owns"
    USER        ||--o{ DEAL            : "owns"
    USER        ||--o{ ACTIVITY        : "owns"
    USER        ||--o{ AI_USAGE        : "tracked by"
    CONTACT     ||--o{ DEAL            : "linked to"
    CONTACT     ||--o{ ACTIVITY        : "has"
    CONTACT     ||--o{ SCORING_HISTORY : "scored in"
    DEAL        ||--o{ ACTIVITY        : "has"
```

**Key schema decisions:**

- **Soft delete** (`deletedAt: Date | null`) on `Contact` and `Deal`. Mongoose `pre('find')` middleware auto-injects `{ deletedAt: null }` on every query — callers never need to remember to filter.
- **Embedded `aiScore` in Contact** avoids a join on the most common read path. Full audit trail lives in `SCORING_HISTORY`.
- **`stageHistory` array in Deal** tracks every stage transition with `daysInPreviousStage` — enables pipeline velocity analytics without extra collections or external event sourcing.
- **`ownerId` on every document** — all repository methods require it. No query ever returns data across owners.
- **Text index** on Contact (`name`, `email`, `company`) powers full-text search without Elasticsearch.
- **`password` and `refreshTokens` fields** are `select: false` in Mongoose — never returned in queries unless explicitly requested with `+password`.

---

## Authentication Flow

JWT dual-token strategy: short-lived access tokens + long-lived refresh tokens stored in HTTP-only cookies, rotated on every use.

```mermaid
sequenceDiagram
    participant Browser
    participant API
    participant DB as MongoDB

    Browser->>API: POST /api/auth/login { email, password }
    API->>DB: findByEmail (select +password +refreshTokens)
    DB-->>API: User document
    API->>API: bcrypt.compare(candidate, hash)
    API-->>Browser: Set-Cookie: refreshToken (httpOnly, Secure, SameSite=Strict, 7d)
    API-->>Browser: 200 { accessToken } (15m JWT in response body)

    note over Browser,API: Authenticated requests

    Browser->>API: GET /api/contacts (Authorization: Bearer accessToken)
    API->>API: authenticate → jwt.verify → req.user = { id, email, role }
    API-->>Browser: 200 { data: contacts[] }

    note over Browser,API: Access token expires (15 min)

    Browser->>API: POST /api/auth/refresh (Cookie: refreshToken)
    API->>DB: Find user, verify token is in refreshTokens[]
    API->>DB: Rotate — $pull old token, $push new token (prevents reuse)
    API-->>Browser: Set-Cookie: refreshToken (new, rotated)
    API-->>Browser: 200 { accessToken } (new 15m JWT)

    note over Browser,API: Logout

    Browser->>API: POST /api/auth/logout (Cookie: refreshToken)
    API->>DB: $pull refresh token from user.refreshTokens[]
    API-->>Browser: 200 + Clear-Cookie
```

---

## AI Engine

### Infrastructure Architecture

```mermaid
graph TD
    subgraph Features["AI Feature Services"]
        SS["ContactScoringService\n• single contact scoring\n• batch scoring\n• score history"]
        FS["FollowUpService\n• generate follow-up suggestions\nbased on activities + deals"]
        SentS["SentimentService\n• classify contact sentiment\n• auto-triggered on activity create"]
        CS["AiChatService\n• tool-use chat loop\n• NL → CRM query translation"]
    end

    subgraph Core["AI Core"]
        AC["AiClient\n• 3 retries\n• exponential backoff on rate limits\n• 60s timeout\n• usage tracking per call"]
        UT["AiUsageTracker\npersists AiUsage records to MongoDB\n(tokens, cost, latency, model)"]
    end

    subgraph Providers["IAiProvider interface"]
        CP["ClaudeProvider\n@anthropic-ai/sdk\nENABLE_AI=true"]
        MP["MockAiProvider\nENABLE_AI=false\nno network calls"]
    end

    SS & FS & SentS & CS --> AC
    AC --> UT
    AC --> CP & MP
    CP --> Claude["Anthropic\nClaude API"]
```

`AiClient` is the **only** code that touches a provider. All retry, timeout, and usage-tracking logic lives there. Feature services call `aiClient.complete()` and receive a typed `AiCompletionResponse`. Swapping to a different LLM requires only implementing `IAiProvider`.

### Lead Scoring Pipeline

Scoring runs in two modes — **on-demand** via REST and **background batch** via BullMQ + nightly cron.

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Queue as BullMQ (Redis)
    participant Worker
    participant ScoringService
    participant Claude as Anthropic Claude
    participant DB as MongoDB

    alt On-demand (single contact)
        Client->>API: POST /api/ai/score/:contactId
        API->>ScoringService: scoreContact(id, ownerId)
    else Bulk via API
        Client->>API: POST /api/ai/score/bulk { contactIds[] }
        API->>Queue: contactScoringQueue.add(job)
        API-->>Client: 202 Accepted { jobId }
        Queue->>Worker: dequeue (concurrency=5)
        Worker->>ScoringService: scoreBatch(contactIds, ownerId)
    else Nightly cron (02:00 UTC)
        Cron->>Queue: batches of 50 contacts per owner\n(100ms stagger between batches)
        Queue->>Worker: dequeue (concurrency=5)
        Worker->>ScoringService: scoreBatch()
    end

    ScoringService->>DB: findById(contact) + findRecentActivities(30 days)
    ScoringService->>Claude: complete(scoringPrompt, { temperature: 0.3 })
    Claude-->>ScoringService: JSON { value, reasoning, signals, recommendedAction }
    ScoringService->>ScoringService: Zod validate AiScoreSchema
    ScoringService->>DB: contact.updateAiScore()
    ScoringService->>DB: ScoringHistory.create() (full audit record)
    ScoringService-->>API: ScoringResult { score, previousScore, model }
```

### AI Chat — Tool-Use Pattern

The chat feature implements a **two-round-trip tool-use loop**. Claude decides which CRM tool to call, the server executes the query against MongoDB, then Claude synthesizes a natural-language response:

```mermaid
sequenceDiagram
    participant User
    participant ChatService
    participant Claude as Claude (tool_use)
    participant DB as MongoDB

    User->>ChatService: "Show me hot leads from Acme with AI score above 70"

    ChatService->>Claude: Round 1 — messages[] + tools[filter_contacts, get_pipeline_summary, get_contact_details]
    Claude-->>ChatService: stopReason=tool_use\ntoolCall: filter_contacts({ company:"Acme", aiScoreMin:70 })

    ChatService->>DB: contactRepository.chatQuery(ownerId, filters)
    DB-->>ChatService: Contact[]

    ChatService->>Claude: Round 2 — original messages + tool results
    Claude-->>ChatService: Natural-language response

    ChatService-->>User: { message, data: { type:"contacts", payload:[] }, toolsUsed:["filter_contacts"] }
```

Available tools: `filter_contacts` (status, search, AI score range, sentiment, company, date), `get_pipeline_summary` (stage breakdown + revenue), `get_contact_details` (lookup by name or email).

### Sentiment Auto-Trigger — Observer Pattern

Sentiment analysis fires automatically on every new activity via setter injection:

```mermaid
graph LR
    AC["Activity created\nPOST /api/activities"] --> AS["ActivityService.create()"]
    AS -->|"setSentimentService()"| SS["SentimentService\n.analyzeContact()"]
    SS --> AI["AiClient"]
    AI --> Claude["Claude API"]
    Claude --> U["Contact.sentiment updated\npositive | neutral | at-risk"]
```

This avoids a circular module dependency while keeping the trigger transparent to callers.

---

## Frontend Architecture

### Application Shell

```mermaid
graph TD
    Main["main.tsx"] --> Providers["Providers\nQueryClientProvider · AuthContext · I18nextProvider · RouterProvider"]
    Providers --> Router["React Router v6"]
    Router --> Public["Public routes\n/login  /register"]
    Router --> Guard["ProtectedRoute\n(reads AuthContext — redirects if unauthenticated)"]
    Guard --> Layout["AppLayout\nSidebar + TopBar + Outlet"]
    Layout --> Pages["Feature Pages\n/dashboard · /contacts · /contacts/:id\n/pipeline · /activities · /ai-chat\n/analytics · /settings"]
```

### State Management Strategy

| State type   | Solution                  | Rationale                                                      |
| ------------ | ------------------------- | -------------------------------------------------------------- |
| Auth session | React Context + Reducer   | Global, synchronous, no network needed                         |
| Server data  | TanStack Query 5          | Stale-while-revalidate, background refetch, cache invalidation |
| Form state   | React Hook Form           | Uncontrolled, minimal re-renders, Zod resolver                 |
| UI / local   | `useState` / `useReducer` | Component-local, not shared upward                             |

No Redux or Zustand. Server state (TanStack Query) covers the vast majority of shared state in a data-centric app like a CRM.

### Feature Module Pattern

Every domain follows the same layout under `src/features/<domain>/`:

```
features/pipeline/
├── api/
│   └── pipeline.api.ts       # typed axios wrappers, imports from @ai-crm/shared
├── hooks/
│   ├── usePipeline.ts        # useQuery — deals grouped by stage
│   └── useDealMutations.ts   # useMutation — create / update / move / delete
├── components/
│   ├── PipelineBoard.tsx     # dnd-kit DndContext, columns layout
│   ├── PipelineColumn.tsx    # Droppable zone per stage
│   ├── DealCard.tsx          # Draggable deal card
│   ├── DealForm.tsx          # react-hook-form + zod validation
│   ├── PipelineSummary.tsx   # KPI bar (total value, deal count per stage)
│   └── DealCard.stories.tsx  # Storybook stories co-located with component
└── pages/
    └── PipelinePage.tsx      # Assembles the full page, wires hooks → components
```

### Data Fetching Pattern

```mermaid
graph LR
    Page["Page / Component"] --> UQ["useDeals()\nuseQuery(deals, fetcher)"]
    UQ --> API["pipeline.api.ts\naxios.get(/api/deals)"]
    API --> Express["Express /api/deals"]

    Page --> UM["useDealMutations()\nuseMutation(updater)"]
    UM --> API2["pipeline.api.ts\naxios.put(/api/deals/:id)"]
    API2 --> Express
    UM -->|"onSuccess"| INV["queryClient\n.invalidateQueries(['deals'])"]
    INV --> UQ
```

The axios instance (`src/shared/lib/axios.ts`) handles:

- Attaching `Authorization: Bearer <token>` on every request
- Automatic silent refresh on 401 via response interceptor
- Base URL from `VITE_API_URL` environment variable

---

## Background Jobs & Scheduler

```mermaid
graph TD
    subgraph Triggers["Triggers"]
        API["REST: POST /api/ai/score/bulk"]
        Cron["node-cron\n0 2 * * *\n02:00 UTC daily"]
    end

    subgraph BullMQ["BullMQ — contact-scoring (Redis)"]
        Job["Job payload\n{ contactIds[], ownerId }"]
    end

    subgraph Worker["Scoring Worker (concurrency: 5)"]
        W["Process job"]
        RL["AiRateLimitError\n→ exponential backoff\n→ Bull retry"]
    end

    API -->|"queue.add(job)"| Job
    Cron -->|"batches of 50\n100ms delay between batches"| Job
    Job --> W
    W -->|rate limited| RL
    RL --> W
    W --> ScS["ContactScoringService\n.scoreBatch()"]
    ScS --> MongoDB["MongoDB\naiScore update\n+ ScoringHistory insert"]
```

The scheduler fans out all contacts across all users into 50-contact batches with staggered enqueue delays. This prevents a thundering-herd against the Claude API at 02:00 UTC.

---

## CI/CD Pipeline

```mermaid
graph TB
    subgraph Local["Developer machine (Husky)"]
        PC["pre-commit\nlint-staged → prettier --write staged files"]
        CM["commit-msg\ncommitlint → Conventional Commits"]
        PP["pre-push\npnpm lint → tsc --noEmit all packages"]
    end

    subgraph CI["ci.yml — GitHub Actions\nTrigger: push to main/develop · PR to main"]
        L["Typecheck & Format\nprettier --check\nturbo lint"]
        TC["Test / Client\nvitest (jsdom)"]
        TS["Test / Server\njest\nMongoDB 7 service\nRedis 7 service"]
        B["Build\nturbo build\nTurborepo .turbo cache"]
        L --> TC & TS
        TC & TS --> B
    end

    subgraph CD["cd.yml — GitHub Actions\nTrigger: workflow_run CI success on main"]
        DS["Docker / Server\nDockerfile.prod (3-stage)\ndeps → build → node:alpine runner\nnon-root appuser\nghcr.io push"]
        DC["Docker / Client\nDockerfile.prod (3-stage)\ndeps → build → nginx:alpine runner\nSPA routing config\nghcr.io push"]
    end

    PR["Pull Request"] --> CI
    Push["Push to main"] --> CI
    CI -->|"conclusion == success"| CD
    DS & DC --> GHCR[("GHCR\nghcr.io/org/ai-crm-server:sha-abc · latest\nghcr.io/org/ai-crm-client:sha-abc · latest")]
```

**Image tagging strategy:** `sha-<short>` (immutable, safe to pin in deployments) + `latest` (rolling pointer for environments that track HEAD).

**Concurrency:** CI cancels in-progress runs on the same branch (fast feedback on rapid pushes). CD never cancels (`cancel-in-progress: false`) — a deploy must always finish.

---

## Security Model

| Concern          | Approach                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| Authentication   | JWT access tokens (15m) + httpOnly refresh tokens (7d), rotated on every use — stolen refresh token cannot be reused |
| Password storage | bcrypt cost factor 12; password field excluded from all Mongoose queries by default (`select: false`)                |
| Data isolation   | `ownerId` required on every repository method — data never crosses user boundaries                                   |
| Input validation | Zod schemas parsed at the request boundary (`validateRequest` middleware) before business logic runs                 |
| Rate limiting    | `express-rate-limit`: global limiter + stricter limit on `/api/auth/*`                                               |
| HTTP headers     | Helmet (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)                                         |
| CORS             | Locked to `CLIENT_URL` env var, credentials mode enabled                                                             |
| Container        | Non-root `appuser` created in server production image                                                                |
| AI toggle        | `ENABLE_AI=false` → `MockAiProvider` — Claude API is never called without explicit opt-in; API key is optional       |
| Secrets          | `JWT_SECRET` and `ANTHROPIC_API_KEY` validated at startup by `envalid` — process exits fast if misconfigured         |

---

## Quick Start

**Prerequisites:** Docker + Docker Compose (for the simplest path). Node.js 20 + pnpm 9 for local development without Docker.

### Docker

```bash
git clone <repo-url> && cd ai-crm
cp .env.example .env      # set JWT_SECRET (min 32 chars) at minimum
docker compose up
```

| Service     | URL                              |
| ----------- | -------------------------------- |
| React SPA   | http://localhost:5173            |
| Express API | http://localhost:4000/api/health |
| Storybook   | http://localhost:6006            |
| MongoDB     | `mongodb://localhost:27017`      |
| Redis       | `redis://localhost:6379`         |

### Local (without Docker)

```bash
pnpm install      # installs all workspaces + initializes Husky hooks
pnpm dev          # starts client (:5173) + server (:4000) + shared watcher
```

### Commands

```bash
# Root — runs across all packages via Turborepo
pnpm build              # full build (shared → server + client)
pnpm test               # all tests
pnpm lint               # typecheck all packages
pnpm format             # prettier --write .
pnpm format:check       # prettier --check . (used in CI)

# Per-package
pnpm --filter @ai-crm/client test         # vitest (single run)
pnpm --filter @ai-crm/client test:watch   # vitest watch
pnpm --filter @ai-crm/client storybook    # Storybook :6006
pnpm --filter @ai-crm/server test         # jest (unit + integration)
```

### Adding a New Domain Module

1. **`packages/shared`** — add Zod schema in `src/schemas/`, export from `src/schemas/index.ts`
2. **`packages/server/src/modules/<domain>/`** — create `model.ts → repository.ts → service.ts → controller.ts → routes.ts`, wire in `app.ts`
3. **`packages/client/src/features/<domain>/`** — create `api/<domain>.api.ts`, `hooks/`, `components/`, `pages/`
4. Register the page in `src/app/router.tsx` and the nav entry in `Sidebar.tsx`

---

## Environment Variables

| Variable              | Required | Default                 | Description                                      |
| --------------------- | -------- | ----------------------- | ------------------------------------------------ |
| `NODE_ENV`            | Yes      | —                       | `development` / `test` / `production`            |
| `PORT`                | No       | `4000`                  | Express listen port                              |
| `MONGODB_URI`         | Yes      | —                       | MongoDB connection string                        |
| `MONGODB_URI_TEST`    | No       | `''`                    | Test database URI (jest integration tests)       |
| `REDIS_URL`           | Yes      | —                       | Redis connection string (BullMQ + rate limiting) |
| `JWT_SECRET`          | Yes      | —                       | JWT signing secret — minimum 32 characters       |
| `JWT_ACCESS_EXPIRES`  | No       | `15m`                   | Access token lifetime                            |
| `JWT_REFRESH_EXPIRES` | No       | `7d`                    | Refresh token lifetime                           |
| `CLIENT_URL`          | No       | `http://localhost:5173` | Allowed CORS origin                              |
| `ENABLE_AI`           | No       | `false`                 | Set `true` to enable Claude API calls            |
| `ANTHROPIC_API_KEY`   | If AI    | —                       | Anthropic API key                                |
| `AI_MODEL`            | No       | `claude-sonnet-4-6`     | Claude model identifier                          |
| `AI_MAX_TOKENS`       | No       | `1024`                  | Max tokens per AI completion                     |
