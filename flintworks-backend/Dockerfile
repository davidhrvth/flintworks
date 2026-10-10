# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY flintworks-backend/package.json ./flintworks-backend/
RUN npm ci -w flintworks-backend

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/flintworks-backend/node_modules ./flintworks-backend/node_modules
COPY flintworks-backend ./flintworks-backend
WORKDIR /app/flintworks-backend
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 backend && \
    mkdir -p /data && chown backend:nodejs /data
COPY --from=builder /app/flintworks-backend/dist ./dist
COPY --from=builder /app/flintworks-backend/node_modules ./node_modules
COPY --from=builder /app/flintworks-backend/package.json ./package.json
COPY email-templates /email-templates
ENV EMAIL_TEMPLATES_DIR=/email-templates
ENV MARKETING_NOTIFY_CSV_PATH=/data/marketing-notify.csv
USER backend
EXPOSE 3001
ENV PORT=3001
CMD ["node", "dist/index.js"]
