# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY flintworks-next/package.json ./flintworks-next/
RUN npm ci -w flintworks-next

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/flintworks-next/node_modules ./flintworks-next/node_modules
COPY flintworks-next ./flintworks-next
WORKDIR /app/flintworks-next
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/flintworks-next/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/flintworks-next/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/flintworks-next/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
