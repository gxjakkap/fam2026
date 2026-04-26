FROM oven/bun:1.3.9 AS base
WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends \
  libc6 libvips curl && \
  rm -rf /var/lib/apt/lists/*

FROM base AS pruner

RUN bun install -g turbo@2.9.6
COPY . .
RUN turbo prune staff --docker

FROM base AS deps

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/bun.lock ./
RUN bun install

FROM deps AS builder

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=pruner /app/out/full/ ./
RUN bun run build --filter=staff
# Compile the migrate script into a standalone executable inside the builder
RUN bun build --compile ./packages/db/scripts/migrate.ts --outfile ./migrate --minify

FROM oven/bun:1.3.9 AS runner
WORKDIR /app

RUN groupadd --system --gid 1001 bunuser \
  && useradd --system --uid 1001 --gid bunuser --create-home bunuser \
  && mkdir -p /home/bunuser \
  && chown bunuser:bunuser /home/bunuser

COPY --from=builder --chown=bunuser:bunuser /app/apps/staff/public ./apps/staff/public
COPY --from=builder --chown=bunuser:bunuser /app/apps/staff/.next/standalone ./
COPY --from=builder --chown=bunuser:bunuser /app/apps/staff/.next/static ./apps/staff/.next/static

# Copy standalone migration runner and sql files
COPY --from=builder --chown=bunuser:bunuser /app/packages/db/drizzle ./drizzle
COPY --from=builder --chown=bunuser:bunuser /app/migrate ./migrate

USER bunuser

EXPOSE 8080
ENV NODE_ENV=production
ENV PORT=3037
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "./migrate && bun apps/staff/server.js"]