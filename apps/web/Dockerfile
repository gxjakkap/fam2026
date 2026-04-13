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
ENV NODE_ENV=production

COPY --from=pruner /app/out/full/ ./
RUN bun run build --filter=web
# Compile the migrate script into a standalone executable inside the builder
RUN bun build --compile ./packages/db/scripts/migrate.ts --outfile ./migrate --minify

FROM oven/bun:latest AS runner
WORKDIR /app

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Copy standalone migration runner and sql files
COPY --from=builder /app/packages/db/drizzle ./drizzle
COPY --from=builder /app/migrate ./migrate

RUN groupadd --system --gid 1001 bunuser \
  && useradd --system --uid 1001 --gid bunuser --create-home bunuser \
  && mkdir -p /home/bunuser \
  && chown bunuser:bunuser /home/bunuser
USER bunuser

EXPOSE 8080
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "./migrate && bun apps/web/server.js"]