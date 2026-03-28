# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Install ALL deps (including devDeps needed for build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/api ./apps/api

# Build NestJS
RUN pnpm --filter api build

# Prune devDeps
RUN pnpm --filter api --prod deploy /app/prod

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

# Copy built artifacts + production node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prod/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
