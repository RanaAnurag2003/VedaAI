# Deployment Guide

## Prerequisites

- MongoDB Atlas cluster
- Redis Cloud instance (TLS URL)
- OpenAI API key
- Vercel account (frontend)
- Railway or Render account (backend)

## MongoDB Atlas

1. Create a free cluster.
2. Database Access → create user with read/write.
3. Network Access → allow `0.0.0.0/0` (or Railway/Render egress IPs).
4. Copy connection string → `MONGODB_URI`.

## Redis Cloud

1. Create a free database.
2. Copy the connection URL → `REDIS_URL` (use `rediss://` if TLS required).

## Backend (Railway)

1. New project → Deploy from GitHub repo.
2. Root directory: `apps/backend` (or deploy from monorepo with custom build).
3. Build command:
   ```bash
   cd ../.. && npm install && npm run build -w @vedaai/shared-types && npm run build -w @vedaai/utils && npm run build -w @vedaai/backend
   ```
4. Start command: `npm run start -w @vedaai/backend`
5. Environment variables (see `apps/backend/.env.example`).
6. Enable WebSocket support (Railway supports it on HTTP service).

## Frontend (Vercel)

1. Import repository.
2. Root Directory: `apps/frontend`
3. Environment:
   - `NEXT_PUBLIC_API_URL` = `https://your-api.railway.app/api`
   - `NEXT_PUBLIC_WS_URL` = `https://your-api.railway.app`
4. Deploy.

## Post-deploy checks

- `GET https://your-api/health` → `{ db: true, redis: true }`
- Create assessment from Vercel URL
- Confirm WebSocket progress updates
- Download PDF on completed assessment

## Local development with production services

Copy `.env.example` to `.env` at repo root and point `MONGODB_URI` / `REDIS_URL` to cloud instances if not running locally.
