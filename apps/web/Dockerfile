FROM oven/bun:latest AS base
WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends \
  libc6 libvips curl && \
  rm -rf /var/lib/apt/lists/*

FROM base AS pruner

RUN bun install -g turbo@latest
COPY . .
RUN turbo prune web --docker

FROM base AS deps

COPY --from=pruner /app/out/json/ ./
RUN bun install --frozen-lockfile

FROM deps AS builder

ENV NEXT_TELEMETRY_DISABLED=1
ARG YB_SHA
ARG YB_COMMIT
ARG YB_BUILDDATE
ENV NEXT_PUBLIC_YB_SHA=${YB_SHA}
ENV NEXT_PUBLIC_YB_COMMIT=${YB_COMMIT}
ENV NEXT_PUBLIC_YB_BUILDDATE=${YB_BUILDDATE}
ENV NODE_ENV=production

COPY --from=pruner /app/out/full/ ./
RUN bun run build --filter=web

FROM oven/bun:latest AS runner
WORKDIR /app

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Copy drizzle migration files for runtime migrations
COPY --from=builder /app/packages/db/drizzle ./packages/db/drizzle
COPY --from=builder /app/packages/db/scripts/migrate.ts ./packages/db/scripts/migrate.ts
COPY --from=builder /app/packages/db/package.json ./packages/db/package.json
COPY --from=builder /app/packages/env ./packages/env

RUN groupadd --system --gid 1001 bunuser \
  && useradd --system --uid 1001 --gid bunuser --create-home bunuser \
  && mkdir -p /home/bunuser \
  && chown bunuser:bunuser /home/bunuser
USER bunuser

EXPOSE 8080
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "cd packages/db && bun run scripts/migrate.ts && cd /app && bun apps/web/server.js"]