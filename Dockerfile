# Install dependencies only when needed
FROM node:20-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
# Ensure we install all dependencies, including devDependencies for build
RUN pnpm install --frozen-lockfile --prod=false

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app

# Reinstall pnpm in the builder stage to ensure it's correctly set up
RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Set OpenTelemetry configuration
ENV OTEL_TRACES_EXPORTER="otlp"
ENV OTEL_EXPORTER_OTLP_ENDPOINT="https://otlp-gateway-prod-gb-south-1.grafana.net/otlp"
ENV OTEL_RESOURCE_ATTRIBUTES="service.name=my-app,service.namespace=my-application-group,deployment.environment=production"
ENV OTEL_NODE_RESOURCE_DETECTORS="env,host,os"
ENV NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

# server.js is created by Next.js in standalone output mode
CMD ["node", "server.js"] 