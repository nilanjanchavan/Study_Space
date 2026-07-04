# Deployment Guide

## Overview

This guide covers deploying Study Workspace from local development to production. The system consists of a Node.js/Express backend and a PostgreSQL database.

---

## Local vs Production Comparison

| Aspect | Local Development | Production |
|--------|-----------------|------------|
| Node environment | `development` | `production` |
| Database | Local PostgreSQL | Managed PostgreSQL (RDS, Supabase, Neon) |
| JWT secrets | Dev defaults in `.env` | Generated strong secrets |
| Cookies | `secure: false`, `sameSite: lax` | `secure: true`, `sameSite: none` |
| Error responses | Full stack traces and details | Generic messages only |
| Rate limiting | Lenient (10/15min) | Stricter (adjustable) |
| CORS | `origin: true` (reflect all) | Specific allowed origins |
| HTTP logging | `morgan('dev')` (colored) | `morgan('combined')` or JSON logger |
| Process manager | `ts-node-dev` (hot reload) | PM2 / systemd / Docker |

---

## Environment Variables

### Required for Production

```env
# Server
NODE_ENV=production
PORT=4000

# Database — use a managed PostgreSQL connection string
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public&sslmode=require"

# JWT — MUST be strong random strings (min 32 chars)
JWT_ACCESS_SECRET=<generated-with-openssl-rand-hex-48>
JWT_REFRESH_SECRET=<generated-with-openssl-rand-hex-48>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_DAYS=30

# Rate limiting
AUTH_RATE_WINDOW_MS=900000
AUTH_RATE_MAX=10
```

### Generating Secure Secrets

```bash
# Generate two different secrets
openssl rand -hex 48   # → use as JWT_ACCESS_SECRET
openssl rand -hex 48   # → use as JWT_REFRESH_SECRET
```

---

## PostgreSQL Deployment

### Option 1: AWS RDS

1. Create a PostgreSQL 17 RDS instance
2. Configure security group to allow inbound traffic on port 5432 from your app server
3. Create a database user and database:
   ```sql
   CREATE ROLE studyuser LOGIN PASSWORD '<strong_password>';
   CREATE DATABASE studyworkspace OWNER studyuser;
   ```
4. Set `DATABASE_URL` with the RDS endpoint
5. Run migrations:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

### Option 2: Supabase / Neon

1. Create a project on [supabase.com](https://supabase.com) or [neon.tech](https://neon.tech)
2. Copy the provided connection string
3. Set `DATABASE_URL` in your production environment
4. Run migrations:
   ```bash
   DATABASE_URL="..." npx prisma migrate deploy
   ```

### Database Backups

- **AWS RDS**: Enable automated daily snapshots
- **Supabase**: Built-in daily backups (7-day retention on free tier)
- **Neon**: Branching + point-in-time recovery

---

## Backend Deployment

### Option 1: Traditional VPS (PM2 + systemd)

```bash
# On the server
git clone <repo>
cd study-workspace
npm ci --production   # Install production deps only
npx prisma generate
npx prisma migrate deploy   # Apply migrations
npm run build             # Compile TypeScript

# Start with PM2
npx pm2 start dist/server.js --name study-workspace
npx pm2 startup            # Generate systemd startup script
npx pm2 save              # Save process list
```

### Option 2: Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src/
RUN npx tsc

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

```bash
docker build -t study-workspace .
docker run -d -p 4000:4000 --env-file .env study-workspace
```

### Option 3: Railway / Fly.io / Render

These platforms auto-detect Node.js and can deploy directly from a Git repository. Configure environment variables in their dashboard.

---

## Frontend Deployment (Future)

The frontend is not yet built. When ready:

| Platform | Notes |
|----------|-------|
| Vercel | Best for React/Next.js; auto-deploys from Git |
| Netlify | Good for static SPAs; supports rewrites for API proxy |
| Cloudflare Pages | Fast global CDN; supports SSR |

The frontend will need CORS configured to communicate with the backend API. Update the CORS origin in `app.ts` from `true` to your specific frontend domain.

---

## Security Checklist

### Pre-Deployment

- [ ] All JWT secrets are strong random strings (not dev defaults)
- [ ] `NODE_ENV=production` is set
- [ ] Database connection uses SSL (`sslmode=require` in connection string)
- [ ] Database user has minimal required permissions (no CREATEDB in production)
- [ ] `.env` is NOT committed to version control
- [ ] `.gitignore` includes `.env`, `node_modules/`, `dist/`

### Application Security

- [ ] CORS origin is set to specific frontend domains (not `*` or `true`)
- [ ] Cookies use `secure: true` (HTTPS only)
- [ ] Cookies use `sameSite: strict` or `sameSite: none` (not `lax` for cross-origin)
- [ ] Rate limiting is enabled and appropriately configured
- [ ] Error responses do not leak stack traces or internal details
- [ ] Helmet is enabled (security headers)

### Infrastructure

- [ ] Server is behind a reverse proxy (Nginx/Caddy) for TLS termination
- [ ] HTTP is redirected to HTTPS
- [ ] Database is not publicly accessible (firewall/security group)
- [ ] Database backups are automated and tested
- [ ] Server logs are collected and monitored
- [ ] Process manager handles crashes and auto-restarts

### Post-Deployment

- [ ] Verify `/api/health` returns `db.status: "ok"`
- [ ] Verify `/api/auth/register` and `/api/auth/login` work
- [ ] Verify refresh token cookie is `httpOnly` and `secure`
- [ ] Verify rate limiting responds with 429
- [ ] Verify CORS blocks unauthorized origins

---

## Monitoring (Future)

These are planned but not yet implemented:

- [ ] Health check monitoring (UptimeRobot, BetterUptime)
- [ ] Application performance monitoring (APM — Datadog, New Relic)
- [ ] Error tracking (Sentry)
- [ ] Log aggregation (CloudWatch, Loki, Papertrail)
- [ ] Database monitoring (pgAdmin, Supabase dashboard)
