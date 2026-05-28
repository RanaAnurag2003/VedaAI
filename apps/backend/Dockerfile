FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages ./packages
COPY apps/backend ./apps/backend
RUN npm ci --workspace=@vedaai/shared-types --workspace=@vedaai/utils --workspace=@vedaai/backend 2>/dev/null || npm install
RUN npm run build -w @vedaai/shared-types && npm run build -w @vedaai/utils && npm run build -w @vedaai/backend

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]
