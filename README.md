# VedaAI — AI Assessment Creator

Production-grade full-stack monorepo for teachers to create assignments and generate structured AI question papers with real-time WebSocket updates.

## Architecture

```
apps/frontend   → Next.js 15 (App Router), Zustand, Tailwind, Socket.IO client
apps/backend    → Express, MongoDB, Redis, BullMQ, Socket.IO, OpenAI
packages/shared-types → Zod schemas & API contracts
packages/utils  → Logger, constants
```

## Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Redis (local or Redis Cloud)
- OpenAI API key

## Quick start

1. Copy environment variables and set your OpenAI API key:

```bash
cp .env.example .env
# Edit .env → set OPENAI_API_KEY
cp apps/frontend/.env.local.example apps/frontend/.env.local
```

2. Start MongoDB and Redis (Docker):

```bash
docker compose up -d
```

3. Install dependencies and build shared packages:

```bash
npm install
npm run build -w @vedaai/shared-types
npm run build -w @vedaai/utils
```

4. Run backend and frontend (separate terminals):

```bash
npm run dev:backend
npm run dev:frontend
```

Or from root with Turbo (if configured):

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Health: http://localhost:4000/health

## Environment variables

See [.env.example](.env.example) for all required variables.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/assignments/create` | Create assignment & enqueue generation |
| GET | `/api/assignments/:id` | Get assignment + generated paper |
| GET | `/api/assignments/:id/status` | Generation status (Redis) |
| POST | `/api/assignments/:id/regenerate` | Re-queue generation |
| GET | `/health` | Service health check |

## WebSocket events

- `join:assignment` — join room for assignment updates
- `generation:queued` | `generation:progress` | `generation:completed` | `generation:failed`

## Deployment

### Frontend (Vercel)

- Root directory: `apps/frontend`
- Build command: `cd ../.. && npm run build -w @vedaai/shared-types && npm run build -w @vedaai/frontend`
- Env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`

### Backend (Railway / Render)

- Root directory: `apps/backend`
- Start: `npm run start`
- Env: `MONGODB_URI`, `REDIS_URL`, `OPENAI_API_KEY`, `CORS_ORIGIN`, `PORT`

### MongoDB Atlas & Redis Cloud

Configure connection strings in backend environment variables.

## License

Private — interview assignment.
