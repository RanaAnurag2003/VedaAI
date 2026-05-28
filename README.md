# VedaAI — AI Assessment Creator

### **1. GitHub Repo**

- Clean code
- Setup instructions

**Prerequisites:**
- Node.js 20+
- MongoDB (local or Atlas)
- Redis (local or Redis Cloud)
- Gemini API key

**Quick start:**

1. Copy environment variables and set your Gemini API key:
```bash
cp .env.example .env
# Edit .env → set GEMINI_API_KEY
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

4. Run from root with Turbo:
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api

### **2. README**

- Architecture overview
- Approach

**Architecture Overview:**
```
apps/frontend   → Next.js 15 (App Router), Zustand, Tailwind, Socket.IO client
apps/backend    → Express, MongoDB, Redis, BullMQ, Socket.IO, OpenAI
packages/shared-types → Zod schemas & API contracts
packages/utils  → Logger, constants
```

**Approach:**
VedaAI is structured as a production-grade full-stack monorepo using Turborepo. It enables teachers to create assignments and generates structured AI question papers with real-time WebSocket updates (Socket.IO). The backend uses Express and BullMQ for reliable background job processing and OpenAI integration.

**Deployment:**
- Frontend (Vercel): Root `apps/frontend`. Build: `cd ../.. && npm run build -w @vedaai/shared-types && npm run build -w @vedaai/frontend`
- Backend (Railway/Render): Root `apps/backend`. Env needs `MONGODB_URI`, `REDIS_URL`, `OPENAI_API_KEY`.
