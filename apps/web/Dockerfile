FROM oven/bun:1.3.9 AS base
WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends \
  libc6 libvips curl && \
  rm -rf /var/lib/apt/lists/*

FROM base AS pruner

RUN bun install -g turbo@2.9.6
COPY . .
RUN turbo prune web --docker

FROM base AS deps

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/bun.lock ./
RUN bun install

FROM deps AS builder

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=pruner /app/out/full/ ./
RUN bun run build --filter=web


FROM node:22-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends \
  libc6 libvips curl ca-certificates && \
  rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nextjs \
  && useradd --system --uid 1001 --gid nextjs --create-home nextjs

COPY --from=builder --chown=nextjs:nextjs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["node", "apps/web/server.js"]