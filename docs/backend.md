# Backend Module Guide

## Module Architecture

The backend follows a **layered architecture** pattern:

```
Routes  →  Validators  →  Middleware  →  Controllers  →  Services  →  Prisma
```

Each layer has a single responsibility and depends only on the layer below it.

---

## Middleware

### `authenticate.ts` — JWT Authentication

Protects routes that require an authenticated user.

**How it works:**
1. Reads `Authorization: Bearer <token>` header
2. Verifies the JWT using the access secret
3. Loads the user from the database
4. Attaches `req.user` (the full User record)
5. Rejects deactivated accounts (403)

**Usage:**
```typescript
router.get('/me', authenticate, me);
```

### `errorHandler.ts` — Central Error Handler

The final middleware in the chain. Catches all errors and formats them consistently.

**Error mapping:**
| Source | Status | Code |
|--------|--------|------|
| `AppError` (any) | `error.status` | `error.code` |
| `Prisma.PrismaClientKnownRequestError` P2002 | 409 | `DUPLICATE_FIELD` |
| `ZodError` | 400 | `VALIDATION_ERROR` |
| Unknown | 500 | _(none)_ |

**Security:** In production, 500 errors return a generic message. Detailed error info (stack, details) is only included when `NODE_ENV=development`.

### `notFound.ts` — 404 Handler

Catches any request that doesn't match a route. Returns:
```json
{ "success": false, "error": { "message": "Route not found: GET /api/unknown" } }
```

### `rateLimit.ts` — Auth Rate Limiter

Applied to all `/api/auth` routes. Configurable via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTH_RATE_WINDOW_MS` | 900000 (15 min) | Time window |
| `AUTH_RATE_MAX` | 10 | Max requests per IP per window |

Returns 429 with `"code": "RATE_LIMIT_EXCEEDED"` when exceeded.

### `validate.ts` — Request Validation

Generic Zod schema validator that can target `body`, `query`, or `params`.

**Flow:**
1. Parse the request target against the Zod schema
2. For `body`/`params`: replace `req[target]` with the parsed value
3. For `query`: store the parsed value on `req.validatedQuery` (Express 5's `req.query` is a read-only getter and cannot be reassigned/mutated — controllers read from `req.validatedQuery`)
4. On failure → 400 with field-level error details

**Usage:**
```typescript
// Body validation (auth register)
router.post('/register', validate(registerSchema, 'body'), register);

// Query validation (todo list with pagination/filtering)
router.get('/', validate(listTodosQuerySchema, 'query'), list);
// Inside controller: const query = req.validatedQuery as ListTodosQuery;

// Params validation (todo id)
router.get('/:id', validate(todoIdParamSchema, 'params'), getById);
```

---

## Todo Module

### `todo.service.ts` — Todo Business Logic

| Function | Purpose |
|----------|---------|
| `createTodo(userId, input)` | Create a todo scoped to the user |
| `getTodoById(userId, todoId)` | Fetch a todo; 404 if not owned |
| `listTodos(userId, query)` | Paginated list with filter (status/priority/completed) + sort (dueDate/createdAt/priority) |
| `updateTodo(userId, todoId, input)` | Partial update; auto-manages `completedAt` on status transitions |
| `deleteTodo(userId, todoId)` | Delete a todo; 404 if not owned |

**Key design decisions:**
- **Ownership enforcement**: every fetch/update/delete checks `todo.userId === userId` and throws `404 TODO_NOT_FOUND` (not `403`) to avoid leaking the existence of other users' todos.
- **`completedAt` auto-management**: setting `status` to `DONE` stamps `completedAt` (only if not already set); changing to any other status clears it.
- **Stable ordering**: non-`createdAt` sorts tie-break by `sortOrder ASC` for deterministic pagination.

---

## Services

### `auth.service.ts` — Authentication Business Logic

The core auth module. All database operations for user management live here.

| Function | Purpose |
|----------|---------|
| `registerUser(input, meta)` | Validate uniqueness, hash password, create user, issue tokens |
| `loginUser(input, meta)` | Verify credentials, update lastLoginAt, issue tokens |
| `refreshTokens(rawToken)` | Verify token, rotate (revoke old + issue new), reuse detection |
| `logoutUser(rawToken)` | Revoke a single refresh token by hash |
| `getUserById(id)` | Fetch user by ID (for `/me` endpoint) |

**Key design decisions:**
- `toPublicUser()` strips `passwordHash` from all responses — the hash is never exposed
- Generic error messages on login (`"Invalid email or password"`) prevent user enumeration
- Refresh token rotation is atomic: revoke old → issue new in sequence
- Reuse detection revokes ALL user tokens when a revoked token is replayed

---

## Controllers

### `auth.controller.ts` — Auth HTTP Handlers

Thin wrappers that:
1. Extract request data and metadata (userAgent, IP)
2. Call the corresponding service function
3. Set/clear the refresh token cookie
4. Return a consistent JSON response

### `health.controller.ts` — Health Check

Lightweight endpoint that:
1. Runs `SELECT 1` against PostgreSQL
2. Returns server uptime, environment, and DB latency

---

## Utilities

### `AppError.ts` — Operational Error Class

Extends `Error` with HTTP context:

```typescript
class AppError extends Error {
  status: number;        // HTTP status code
  isOperational: boolean; // true for 4xx, false for 5xx
  code?: string;          // Machine-readable error code
  details?: unknown;      // Arbitrary error context
}
```

**Static constructors:** `AppError.badRequest()`, `.unauthorized()`, `.forbidden()`, `.notFound()`, `.conflict()`

### `apiResponse.ts` — Response Envelope

Two helper functions enforce the consistent response format:

```typescript
sendSuccess(res, data, 200)   → { success: true,  data }
sendError(res, msg, 500, code) → { success: false, error: { message, code } }
```

### `asyncHandler.ts` — Async Route Wrapper

Catches rejected promises from async route handlers and forwards them to Express error middleware. Without this, unhandled promise rejections would crash the process.

### `hash.ts` — Cryptographic Hashing

| Function | Algorithm | Purpose |
|----------|-----------|---------|
| `hashPassword(plain)` | bcrypt (12 rounds) | User passwords |
| `verifyPassword(plain, hash)` | bcrypt compare | Login verification |
| `hashToken(token)` | SHA-256 | Refresh token digest for DB storage |

### `jwt.ts` — JSON Web Tokens

| Function | Secret | Expiry | Purpose |
|----------|--------|--------|---------|
| `signAccessToken(payload)` | `JWT_ACCESS_SECRET` | 15 min | API authentication |
| `signRefreshToken(payload)` | `JWT_REFRESH_SECRET` | 30 days | Token rotation |
| `verifyAccessToken(token)` | `JWT_ACCESS_SECRET` | — | Auth middleware |
| `verifyRefreshToken(token)` | `JWT_REFRESH_SECRET` | — | Refresh flow |

### `refreshToken.ts` — Refresh Token Management

Generates a cryptographically random token, hashes it, and persists the hash to the database. Returns the raw token for cookie placement.

Token format: `<40-byte random base64url>.<userId>`

### `cookie.ts` — Cookie Configuration

Configures the httpOnly refresh token cookie:

| Option | Dev | Production | Purpose |
|--------|-----|------------|---------|
| `httpOnly` | `true` | `true` | Prevents XSS access |
| `secure` | `false` | `true` | HTTPS-only in prod |
| `sameSite` | `lax` | `none` | CSRF protection |
| `path` | `/api/auth` | `/api/auth` | Scoped to auth endpoints |

---

## Validation Flow

Request validation uses **Zod schemas** defined in `validators/` and enforced by the `validate` middleware.

### Auth Validators

| Schema | Fields | Rules |
|--------|--------|-------|
| `registerSchema` | email, username, password, name? | email format, username 3–30 chars (alphanumeric + `_.-`), password 8–100 chars (letter + digit), name optional |
| `loginSchema` | email, password | email format, password required |
| `refreshSchema` | refreshToken? | Optional — the token is usually read from the cookie |

### Validation Error Response

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "fields": [
        { "path": "email", "message": "Invalid email" },
        { "path": "password", "message": "Password must contain at least one number" }
      ]
    }
  }
}
```
