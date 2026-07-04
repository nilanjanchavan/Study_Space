# Development Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 20 | Runtime |
| npm | ≥ 10 | Package manager |
| PostgreSQL | ≥ 15 | Database |
| Git | any | Version control |

---

## Local Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd study-workspace
npm install
```

### 2. Configure PostgreSQL

Create a database and user (or use an existing instance):

```sql
CREATE ROLE studyuser LOGIN PASSWORD 'studypass' CREATEDB;
CREATE DATABASE studyworkspace OWNER studyuser;
GRANT ALL PRIVILEGES ON DATABASE studyworkspace TO studyuser;
GRANT ALL ON SCHEMA public TO studyuser;
```

The `CREATEDB` permission is required by Prisma Migrate for the shadow database in development.

### 3. Configure Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://studyuser:studypass@localhost:5432/studyworkspace?schema=public"

# JWT (generate strong secrets for production)
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_DAYS=30

# Rate limiting
AUTH_RATE_WINDOW_MS=900000
AUTH_RATE_MAX=10
```

**Generating JWT secrets:**

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Migrations

```bash
npx prisma migrate dev
```

### 6. Start the Server

```bash
npm run dev
```

Server starts at `http://localhost:4000`.

Verify:
```bash
curl http://localhost:4000/api          # → { success: true, data: { name, version } }
curl http://localhost:4000/api/health   # → { success: true, data: { status: "healthy", ... } }
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | HTTP server port |
| `NODE_ENV` | `development` | Environment mode (`development` / `production`) |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | — | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | — | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_DAYS` | `30` | Refresh token lifetime (days) |
| `AUTH_RATE_WINDOW_MS` | `900000` | Rate limit window (ms) — 15 min |
| `AUTH_RATE_MAX` | `10` | Max requests per window per IP |

---

## NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `ts-node-dev --respawn --transpile-only src/server.ts` | Dev server with hot reload |
| `npm run build` | `tsc` | Compile TypeScript to `dist/` |
| `npm start` | `node dist/server.js` | Run compiled server |
| `npm run prisma:generate` | `prisma generate` | Generate Prisma client |
| `npm run prisma:migrate` | `prisma migrate dev` | Create + apply migration |
| `npm run prisma:studio` | `prisma studio` | Open database GUI |
| `npm run db:push` | `prisma db push` | Push schema without migration |

---

## Prisma Commands

### Daily Development

```bash
# After modifying schema.prisma:
npx prisma migrate dev --name <description>
# This creates a migration file AND applies it.

# View the database in a browser GUI:
npx prisma studio
```

### Schema Changes

```bash
# Format the schema
npx prisma format

# Validate the schema (no DB connection)
npx prisma validate

# Check the current migration status
npx prisma migrate status
```

### Production

```bash
# Apply pending migrations (no shadow DB needed)
npx prisma migrate deploy

# Reset the entire database (DESTRUCTIVE — never use in production)
npx prisma migrate reset
```

### Troubleshooting

```bash
# If Prisma client is out of date:
npx prisma generate

# If migrations are out of sync:
npx prisma migrate resolve --applied <migration_name>

# If you need to see what SQL a migration would run:
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script
```

---

## Development Workflow

### Adding a New Feature (e.g. Todo CRUD)

1. **Update schema** (if needed):
   ```bash
   # Edit prisma/schema.prisma, then:
   npx prisma migrate dev --name add_todo_description
   npx prisma generate
   ```

2. **Create validator** (`src/validators/todo.validators.ts`):
   ```typescript
   import { z } from 'zod';
   export const createTodoSchema = z.object({ title: z.string().min(1), ... });
   ```

3. **Create service** (`src/services/todo.service.ts`):
   ```typescript
   export async function createTodo(userId: string, input: CreateTodoInput) { ... }
   ```

4. **Create controller** (`src/controllers/todo.controller.ts`):
   ```typescript
   export const createTodo = asyncHandler(async (req, res) => { ... });
   ```

5. **Create routes** (`src/routes/todo.routes.ts`):
   ```typescript
   const router = Router();
   router.post('/', authenticate, validate(createTodoSchema), createTodo);
   ```

6. **Mount in `app.ts`**:
   ```typescript
   import todoRoutes from './routes/todo.routes';
   app.use('/api/todos', todoRoutes);
   ```

7. **Typecheck:**
   ```bash
   npx tsc --noEmit
   ```

### Project Conventions

| Convention | Rule |
|------------|------|
| File naming | `camelCase.ts` (e.g. `auth.service.ts`) |
| Route files | Named after the resource (e.g. `todo.routes.ts`) |
| Service files | Named after the domain (e.g. `auth.service.ts`) |
| Error handling | Always throw `AppError`; never return error objects |
| Responses | Always use `sendSuccess()` or `sendError()` |
| Async routes | Always wrap with `asyncHandler()` |
| DB access | Only via `prisma` singleton from `config/prisma.ts` |
| Timestamps | Let Prisma handle `createdAt`/`updatedAt` (never set manually) |
| UUIDs | Let Prisma auto-generate (never pass `id` on create) |

---

## Common Issues

### `@prisma/client did not initialize yet`
```bash
npx prisma generate
```

### Prisma Migrate shadow database error (P3014)
```sql
ALTER ROLE studyuser CREATEDB;
```

### TypeScript deprecation warnings (TS5101, TS5107)
The `tsconfig.json` uses `moduleResolution: "bundler"` which is compatible with TS 6.

### Port already in use
```bash
# Find and kill the process
lsof -i :4000    # Linux/Mac
netstat -ano | findstr :4000   # Windows
```

### Rate limit hit during testing
Temporarily increase `AUTH_RATE_MAX` in `.env` or restart the server to reset the counter.
