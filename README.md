# Study Workspace — Backend

Multi-user productivity platform (Pomodoro, todos, analytics, Codeforces integration).

**Phase 1 — Backend foundation.** This phase delivers a runnable Express + TypeScript
server with a PostgreSQL connection via Prisma. No business features or auth yet.

---

## Tech Stack

| Layer       | Choice            |
|-------------|-------------------|
| Runtime     | Node.js (≥ 20)    |
| HTTP        | Express 5         |
| Language    | TypeScript        |
| Database    | PostgreSQL 17     |
| ORM         | Prisma 6          |

---

## Prerequisites

The following are already set up in this environment:

- **Node.js** v24.7.0, **npm** 11.5.1
- **PostgreSQL 17** installed via winget, running as Windows service `postgresql-17`
  - Superuser: `postgres` / password: `postgres`
  - Port: `5432`

If you need to start/stop the DB service manually:

```bash
# Start
powershell.exe -NoProfile -Command "Start-Service postgresql-17"
# Stop
powershell.exe -NoProfile -Command "Stop-Service postgresql-17"
```

---

## Database

An application role and database have been created to match `.env`:

| Item              | Value              |
|-------------------|--------------------|
| Role (login)      | `studyuser`        |
| Password          | `studypass`        |
| Database          | `studyworkspace`   |
| Schema            | `public`           |

Connection string (`.env`):

```
DATABASE_URL="postgresql://studyuser:studypass@localhost:5432/studyworkspace?schema=public"
```

---

## Project Structure

```
study-workspace/
├── prisma/
│   ├── schema.prisma          # datasource + generator (no models yet)
│   └── seed.ts                # no-op Phase 1 placeholder
├── src/
│   ├── app.ts                 # Express app factory + middleware wiring
│   ├── server.ts              # bootstrap: connect DB → listen → graceful shutdown
│   ├── config/
│   │   ├── env.ts             # centralized env config
│   │   └── prisma.ts          # PrismaClient singleton
│   ├── controllers/
│   │   └── health.controller.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   └── routes/
│       └── health.routes.ts
├── .env / .env.example
├── package.json
└── tsconfig.json
```

---

## Getting Started

```bash
# Install dependencies (already done)
npm install

# Generate Prisma client (already done)
npx prisma generate

# Sync schema to DB (already done — schema has no models yet)
npx prisma db push

# Start the dev server (hot reload via ts-node-dev)
npm run dev
```

Server starts on **http://localhost:4000**.

### Other scripts

| Script                  | Purpose                                  |
|-------------------------|------------------------------------------|
| `npm run dev`           | Dev server with auto-reload              |
| `npm run build`         | Compile TypeScript → `dist/`             |
| `npm start`             | Run compiled server (`dist/server.js`)   |
| `npm run prisma:studio` | Open Prisma Studio DB GUI                |
| `npm run prisma:migrate`| Create + apply a migration               |
| `npm run db:push`       | Push schema state to DB without history  |

---

## API (Phase 1)

| Method | Route           | Description                                      |
|--------|-----------------|--------------------------------------------------|
| GET    | `/api`          | API root — name + version (no DB)                |
| GET    | `/api/health`   | Liveness + readiness; pings DB via `SELECT 1`    |

### Example: health response

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-07-03T19:53:21.374Z",
    "uptimeSeconds": 97,
    "environment": "development",
    "db": { "status": "ok", "latencyMs": 5 },
    "checkMs": 5
  }
}
```

If the DB is unreachable, `/api/health` returns HTTP `503` with `db.status: "error"`
while the rest of the API stays up.

---

## Verification Status (Phase 1 — COMPLETE)

- [x] Node + TypeScript project scaffolded
- [x] Express 5 server with `/api/health` route
- [x] Folder structure (`routes`, `controllers`, `middleware`, `config`)
- [x] Prisma schema + client generated (default location)
- [x] PostgreSQL 17 provisioned; role + database created
- [x] `prisma db push` — DB in sync with schema
- [x] Server boots and connects to PostgreSQL
- [x] `GET /api/health` returns `db.status: "ok"`

**Next phase:** data models (User, Todo, FocusSession, ...) and authentication.
