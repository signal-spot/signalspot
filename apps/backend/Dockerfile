# Multi-stage build for NestJS backend
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package.json ./apps/backend/
COPY shared/package.json ./shared/
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package.json ./apps/backend/
COPY shared/package.json ./shared/
RUN npm ci

COPY . .
RUN npm run build backend

# Production image, copy all the files and run nest
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy the bundled code from the build stage to the production image
COPY --from=builder --chown=nestjs:nodejs /app/dist/apps/backend ./
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "main.js"] 