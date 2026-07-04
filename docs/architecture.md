# Architecture

## System Overview

Study Workspace is a multi-user SaaS productivity platform built as a modular REST API. The system is designed around a layered backend architecture with clear separation of concerns: data access (Prisma), business logic (services), request handling (controllers), and transport (Express middleware + routes).

```
┌──────────────────────────────────────────────────────────────┐
│                        Client (Future)                        │
│              Web App / Mobile App / Desktop App               │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTPS
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                      Express Server (Node.js)                  │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  Middleware  │→│   Routes      │→│   Controllers      │  │
│  │  - helmet    │  │  /api/health │  │   (thin wrappers)  │  │
│  │  - cors      │  │  /api/auth   │  │                    │  │
│  │  - morgan    │  │  /api/todos  │  └────────┬───────────┘  │
│  │  - cookie    │  │  /api/...    │           │              │
│  │  - ratelimit │  └──────────────┘           ▼              │
│  │  - validate  │                     ┌──────────────────┐  │
│  │  - auth      │                     │    Services       │  │
│  └─────────────┘                     │  (business logic) │  │
│                                      └────────┬─────────┘  │
│                                               │              │
│  ┌────────────────────────────────────────────▼───────────┐  │
│  │                     Utilities                          │  │
│  │  AppError · apiResponse · asyncHandler · jwt · hash   │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────┘
                             │ Prisma Client
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                        │
│                                                              │
│  User · RefreshToken · Todo · PomodoroSession               │
│  FocusSession · Notification · MusicPreference               │
│  CodeforcesProfile                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer              | Technology                        | Version   |
|--------------------|-----------------------------------|-----------|
| Runtime            | Node.js                           | ≥ 20      |
| Language           | TypeScript                        | 6.x       |
| HTTP Framework     | Express                           | 5.x       |
| ORM                | Prisma                            | 6.x       |
| Database           | PostgreSQL                        | 17        |
| Validation         | Zod                               | 4.x       |
| Password Hashing   | bcryptjs                          | 2.x       |
| JWT                | jsonwebtoken                      | 9.x       |
| Rate Limiting      | express-rate-limit                 | 7.x       |
| Security Headers   | helmet                            | 8.x       |
| HTTP Logging       | morgan                            | 1.x       |
| CORS               | cors                              | 2.x       |
| Cookies            | cookie-parser                     | 1.x       |
| Dev Tooling        | ts-node-dev (hot reload), ts-node | 2.x, 10.x |

---

## Folder Structure

```
study-workspace/
├── prisma/
│   ├── schema.prisma              # Prisma schema (models, enums, relations, indexes)
│   ├── migrations/                # SQL migration files (version-controlled)
│   │   └── 20260703204229_add_core_models/
│   │       └── migration.sql
│   └── seed.ts                    # Database seed script (no-op in Phase 3)
│
├── src/
│   ├── app.ts                     # Express app factory (middleware wiring, route mounting)
│   ├── server.ts                  # Bootstrap: DB connect → listen → graceful shutdown
│   │
│   ├── config/
│   │   ├── env.ts                 # Centralized environment variable config
│   │   └── prisma.ts              # PrismaClient singleton (HMR-safe)
│   │
│   ├── middleware/
│   │   ├── authenticate.ts        # JWT Bearer token verification middleware
│   │   ├── errorHandler.ts        # Central error handler (AppError + Prisma mapping)
│   │   ├── notFound.ts           # 404 handler for unmatched routes
│   │   ├── rateLimit.ts           # Rate limiter for auth endpoints
│   │   └── validate.ts           # Zod schema validation middleware
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts     # Auth endpoints (register, login, refresh, logout, me)
│   │   └── health.controller.ts   # Health check endpoint
│   │
│   ├── routes/
│   │   ├── auth.routes.ts         # POST /register, /login, /refresh, /logout; GET /me
│   │   └── health.routes.ts       # GET /health
│   │
│   ├── services/
│   │   └── auth.service.ts        # Auth business logic (register, login, rotation, reuse)
│   │
│   ├── validators/
│   │   └── auth.validators.ts     # Zod schemas for auth request validation
│   │
│   ├── types/
│   │   └── express.d.ts           # TypeScript augmentation: Request.user
│   │
│   └── utils/
│       ├── AppError.ts            # Operational error class (status, code, details)
│       ├── apiResponse.ts         # Consistent JSON response envelope helpers
│       ├── asyncHandler.ts        # Async route wrapper (catches promise rejections)
│       ├── cookie.ts              # httpOnly cookie config for refresh tokens
│       ├── hash.ts                # bcrypt password hashing + SHA-256 token hashing
│       ├── jwt.ts                 # JWT sign/verify for access + refresh tokens
│       └── refreshToken.ts        # Refresh token generation + DB persistence
│
├── docs/                          # Project documentation
├── .env                           # Environment variables (gitignored)
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignore rules
├── package.json                   # NPM manifest + scripts
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # Quick-start guide
```

---

## Request Lifecycle

Every API request passes through the middleware stack in order:

```
Incoming Request
       │
       ▼
  ┌──────────┐
  │  helmet   │  ← Security headers (X-Content-Type-Options, CSP, etc.)
  └────┬─────┘
       ▼
  ┌──────────┐
  │   cors    │  ← CORS headers (origin reflection, credentials in dev)
  └────┬─────┘
       ▼
  ┌──────────┐
  │ json()    │  ← Parse JSON body
  └────┬─────┘
       ▼
  ┌──────────┐
  │urlencoded │  ← Parse URL-encoded body
  └────┬─────┘
       ▼
  ┌──────────┐
  │cookieParser│ ← Parse cookies (needed for refresh token cookie)
  └────┬─────┘
       ▼
  ┌──────────┐
  │  morgan   │  ← HTTP request logging
  └────┬─────┘
       ▼
  ┌──────────┐
  │  Router   │  ← Route matching (e.g. /api/auth/*)
  └────┬─────┘
       ▼
  ┌──────────┐
  │rateLimit  │  ← IP-based rate limiting (auth routes only)
  └────┬─────┘
       ▼
  ┌──────────┐
  │ validate  │  ← Zod schema validation (if route has validator)
  └────┬─────┘
       ▼
  ┌──────────┐
  │authenticate│ ← JWT Bearer verification (if route requires auth)
  └────┬─────┘
       ▼
  ┌──────────┐
  │ Controller │ ← Thin handler: parse request, call service, send response
  └────┬─────┘
       ▼
  ┌──────────┐
  │  Service  │  ← Business logic, database calls via Prisma
  └────┬─────┘
       ▼
  ┌──────────┐
  │ Prisma    │  ← ORM → PostgreSQL
  └────┬─────┘
       ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  Response sent to client                                    │
  │  (or error thrown → caught by errorHandler → error response) │
  └──────────────────────────────────────────────────────────────┘
```

### Error Flow

If any layer throws an `Error`:

1. **AppError** (operational) → status code, code, and message are extracted → consistent error envelope
2. **Prisma P2002** (unique constraint) → mapped to 409 Conflict
3. **Zod ZodError** → mapped to 400 Bad Request with field-level details
4. **Unknown errors** → 500 Internal Server Error (message hidden in production)

---

## Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Separation of concerns** | Controllers are thin wrappers; business logic lives in services |
| **Single responsibility** | Each file/module has one clear purpose |
| **Consistent responses** | All endpoints return `{ success: true, data }` or `{ success: false, error }` |
| **Fail fast** | Input validation at the route level; errors surface early |
| **Testability** | `createApp()` factory allows importing app without binding to a port |
| **Security by default** | helmet, rate limiting, httpOnly cookies, hashed tokens, bcrypt passwords |
