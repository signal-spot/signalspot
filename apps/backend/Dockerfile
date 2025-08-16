# Multi-stage build for production-optimized NestJS backend
FROM node:18-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# ========================================
# Dependencies stage - production deps only
# ========================================
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY shared/package*.json ./shared/

# Install production dependencies with better caching
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# ========================================
# Builder stage - compile TypeScript
# ========================================
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY shared/package*.json ./shared/

# Install all dependencies (including dev)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN npm run build backend

# ========================================
# Production stage - minimal runtime
# ========================================
FROM base AS production
WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    PORT=3000 \
    NODE_OPTIONS="--max-old-space-size=1024"

# Create non-root user with specific UID/GID
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create necessary directories
RUN mkdir -p logs uploads temp && \
    chown -R nodejs:nodejs /app

# Copy production dependencies
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist/apps/backend ./dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/backend/mikro-orm.config.js ./
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Copy environment example (for reference)
COPY --chown=nodejs:nodejs apps/backend/.env.example ./.env.example

# Switch to non-root user
USER nodejs

# Health check configuration
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "const http = require('http'); \
    http.get('http://localhost:3000/health', (res) => { \
      process.exit(res.statusCode === 200 ? 0 : 1); \
    }).on('error', () => process.exit(1));"

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the application
CMD ["node", "dist/main.js"] 