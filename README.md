# AI CRM Starter

![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Express](https://img.shields.io/badge/Express-4-000)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green)
![Redis](https://img.shields.io/badge/Redis-7-red)

Production-ready CRM monorepo with React, Express, MongoDB, Redis, and AI-ready infrastructure.

## Quick start

```bash
git clone <your-repo-url>
cd ai-crm
cp .env.example .env
docker compose up
```

| URL | Service |
|-----|---------|
| http://localhost:5173 | React SPA |
| http://localhost:4000 | Express API |
| http://localhost:6006 | Storybook |
| localhost:27017 | MongoDB (connect via Compass) |
| localhost:6379 | Redis |

## Project structure

```
ai-crm/
├── packages/
│   ├── client/          # React 18 SPA (Vite + Tailwind + React Query)
│   ├── server/          # Express 4 API (Mongoose + BullMQ + JWT)
│   └── shared/          # Zod schemas + TypeScript types (shared contracts)
├── docker-compose.yml   # MongoDB, Redis, server, client services
├── turbo.json           # Turborepo task pipeline
├── pnpm-workspace.yaml  # pnpm workspace config
└── .env.example         # Environment variables template
```

## Available commands

| Command | Location | Description |
|---------|----------|-------------|
| `docker compose up` | Root | Start all services (MongoDB, Redis, API, SPA) |
| `docker compose down -v` | Root | Stop all services and remove volumes |
| `pnpm dev` | Root | Start all packages in dev mode via Turborepo |
| `pnpm build` | Root | Build all packages |
| `pnpm test` | Root | Run all tests |
| `pnpm test:e2e` | client | Run Playwright E2E tests |
| `pnpm storybook` | client | Start Storybook on port 6006 |
| `pnpm lint` | Root | Type-check all packages |

## Architecture decisions

- **Monorepo with pnpm workspaces + Turborepo**: Shared code without publish cycles. Turborepo caches builds and runs tasks in parallel.
- **Shared package for Zod schemas**: Single source of truth for validation on both client and server. Types are inferred from schemas, never manually duplicated.
- **Repository pattern on server**: `ContactRepository` abstracts Mongoose. Tests inject mocks without touching the database. Swap to any data source without changing services.
- **Layered architecture**: Controller -> Service -> Repository. No layer skipping. Each layer has a single responsibility.
- **Dependency injection**: Services receive dependencies via constructor. No `new` inside services.
- **Factory function for Express app**: `createApp()` instead of a singleton. Enables proper test isolation with supertest.
- **i18n configured from day one**: Retrofitting translations costs 3x more than starting with them. EN + PL included.
- **Storybook for UI components**: Visual testing, documentation, and isolated development of components and states.
- **BullMQ queue ready**: Contact scoring and enrichment jobs are set up and ready for AI provider integration.

## Adding a new feature module

1. **Shared schema**: Add Zod schema in `packages/shared/src/schemas/`, export from index
2. **Server module**: Create `packages/server/src/modules/<feature>/` with model, repository, service, controller, routes
3. **Client feature**: Create `packages/client/src/features/<feature>/` with api, hooks, components, pages
4. **Translations**: Add namespace JSON files in `locales/en/` and `locales/pl/`
5. **Tests**: Add unit tests (Jest/Vitest) and integration tests (supertest)
6. **Stories**: Add Storybook stories for each component

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_INITDB_ROOT_USERNAME` | Yes | `admin` | MongoDB root username |
| `MONGO_INITDB_ROOT_PASSWORD` | Yes | `changeme` | MongoDB root password |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `MONGODB_URI_TEST` | No | — | MongoDB test database URI |
| `REDIS_URL` | Yes | — | Redis connection string |
| `JWT_SECRET` | Yes | — | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | JWT token expiration |
| `PORT` | No | `4000` | Express server port |
| `NODE_ENV` | Yes | `development` | Runtime environment |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS origin |
| `ANTHROPIC_API_KEY` | No | — | Anthropic API key (for AI features) |
| `OPENAI_API_KEY` | No | — | OpenAI API key (for AI features) |
| `VITE_API_URL` | No | `http://localhost:4000` | API URL for the client |
