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

## Backend (Render)

This repository includes a `render.yaml` Blueprint file that makes backend deployment automated.

1. Go to your **Render Dashboard** → click **New +** → **Blueprint**.
2. Connect your GitHub repository: `https://github.com/RanaAnurag2003/VedaAI.git`.
3. Render will auto-detect the Blueprint. It will prompt you to configure the following environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `REDIS_URL`: Your Redis Cloud or Upstash database connection URL.
   - `GEMINI_API_KEY`: (Optional) Your Gemini API key for question generation.
   - `OPENAI_API_KEY`: (Optional) Your OpenAI API key.
   - `CORS_ORIGIN`: Set this to your Netlify Frontend URL (e.g., `https://your-app.netlify.app`) once the frontend is deployed.
4. Click **Apply** to deploy the service. Render will automatically build the backend via the multi-stage `Dockerfile` with the correct repository root context.

*Note: For websockets to connect reliably, Render's default HTTP configuration will manage websocket handshakes automatically.*

## Frontend (Netlify)

This repository includes a `netlify.toml` file in the root that pre-configures Netlify for monorepos.

1. Go to your **Netlify Dashboard** → click **Add new site** → **Import an existing project**.
2. Connect your GitHub repository.
3. Netlify will auto-detect the monorepo configuration:
   - **Base directory**: (leave blank / repository root)
   - **Build command**: `npm run build -w @vedaai/shared-types && npm run build -w @vedaai/frontend`
   - **Publish directory**: `apps/frontend/.next`
4. Add the following **Environment Variables** in the Netlify project settings:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL with `/api` suffix (e.g., `https://vedaai-backend.onrender.com/api`).
   - `NEXT_PUBLIC_WS_URL`: Your Render backend URL (e.g., `https://vedaai-backend.onrender.com`).
5. Click **Deploy site**. Netlify will use its built-in Next.js Runtime to handle Server-Side Rendering (SSR).

## Post-deploy checks

- `GET https://your-api/health` → `{ db: true, redis: true }`
- Create assessment from Vercel URL
- Confirm WebSocket progress updates
- Download PDF on completed assessment

## Local development with production services

Copy `.env.example` to `.env` at repo root and point `MONGODB_URI` / `REDIS_URL` to cloud instances if not running locally.
