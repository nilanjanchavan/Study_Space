# API Reference

## Base URL

```
Development:  http://localhost:4000/api
Production:   https://api.studyworkspace.com/api
```

## Response Format

All endpoints use a consistent JSON envelope:

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "message": "Human-readable message",
    "code": "MACHINE_READABLE_CODE",
    "details": { ... }
  }
}
```

---

## Health Endpoints

### GET /api

Root ping — lightweight, no database access.

**Request:**
```bash
curl http://localhost:4000/api
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "name": "Study Workspace API",
    "version": "0.1.0"
  }
}
```

---

### GET /api/health

Liveness + readiness check. Pings the database.

**Request:**
```bash
curl http://localhost:4000/api/health
```

**Response (200 — healthy):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-07-04T06:40:49.344Z",
    "uptimeSeconds": 3600,
    "environment": "development",
    "db": {
      "status": "ok",
      "latencyMs": 5
    },
    "checkMs": 5
  }
}
```

**Response (503 — degraded):**
```json
{
  "success": true,
  "data": {
    "status": "degraded",
    "db": {
      "status": "error",
      "latencyMs": null
    }
  }
}
```

---

## Auth Endpoints

### POST /api/auth/register

Create a new account. Returns a user object and access token. Sets a refresh token cookie.

**Auth required:** No
**Rate limited:** Yes (10 req / 15 min per IP)

**Request:**
```bash
curl -c cookies.txt -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@study.dev",
    "username": "alice",
    "password": "S3cretPass!",
    "name": "Alice"
  }'
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `email` | string | Yes | Valid email, max 254 chars, lowercase |
| `username` | string | Yes | 3–30 chars, alphanumeric + `_`, `.`, `-` |
| `password` | string | Yes | 8–100 chars, at least one letter and one number |
| `name` | string | No | Max 100 chars |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "49df9201-3d1e-45f5-a7f1-040204f4bee4",
      "email": "alice@study.dev",
      "username": "alice",
      "name": "Alice",
      "avatarUrl": null,
      "role": "USER",
      "isEmailVerified": false,
      "createdAt": "2026-07-04T05:05:53.313Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Response headers:**
```
Set-Cookie: rt=<refresh_token>; HttpOnly; Path=/api/auth; Max-Age=2592000
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid email, username, or password |
| 409 | `EMAIL_TAKEN` | Email already registered |
| 409 | `USERNAME_TAKEN` | Username already taken |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |

---

### POST /api/auth/login

Authenticate with email and password. Returns user + access token + refresh token cookie.

**Auth required:** No
**Rate limited:** Yes

**Request:**
```bash
curl -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@study.dev",
    "password": "S3cretPass!"
  }'
```

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `password` | string | Yes |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "49df9201-...",
      "email": "alice@study.dev",
      "username": "alice",
      "name": "Alice",
      "avatarUrl": null,
      "role": "USER",
      "isEmailVerified": false,
      "createdAt": "2026-07-04T05:05:53.313Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 403 | `ACCOUNT_INACTIVE` | Account is deactivated |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |

---

### POST /api/auth/refresh

Rotate the refresh token pair. Reads the refresh token from the httpOnly cookie.

**Auth required:** No (cookie-based)
**Rate limited:** Yes

**Request:**
```bash
curl -b cookies.txt -c cookies.txt -X POST http://localhost:4000/api/auth/refresh
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `refreshToken` | string | No | Optional — cookie is preferred |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "49df9201-...",
      "email": "alice@study.dev",
      "username": "alice"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 401 | `REFRESH_TOKEN_MISSING` | No cookie or body token |
| 401 | `INVALID_REFRESH_TOKEN` | Token hash not found in DB |
| 401 | `REFRESH_TOKEN_EXPIRED` | Token past expiration date |
| 401 | `REFRESH_TOKEN_REUSE` | Reuse detected — all sessions revoked |
| 403 | `ACCOUNT_INACTIVE` | Account is deactivated |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |

---

### POST /api/auth/logout

Revoke the refresh token and clear the cookie.

**Auth required:** No (cookie-based; idempotent)
**Rate limited:** Yes

**Request:**
```bash
curl -b cookies.txt -c cookies.txt -X POST http://localhost:4000/api/auth/logout
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Response headers:**
```
Set-Cookie: rt=; HttpOnly; Path=/api/auth; Max-Age=0
```

---

### GET /api/auth/me

Get the currently authenticated user's profile.

**Auth required:** Yes (`Authorization: Bearer <accessToken>`)
**Rate limited:** Yes (inherited from `/api/auth` prefix)

**Request:**
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "49df9201-...",
      "email": "alice@study.dev",
      "username": "alice",
      "name": "Alice",
      "avatarUrl": null,
      "role": "USER",
      "isEmailVerified": false,
      "createdAt": "2026-07-04T05:05:53.313Z"
    }
  }
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 401 | `AUTH_TOKEN_MISSING` | No Authorization header |
| 401 | `INVALID_ACCESS_TOKEN` | Token invalid or expired |
| 401 | `USER_NOT_FOUND` | User no longer exists |
| 403 | `ACCOUNT_INACTIVE` | Account is deactivated |

---

## Todo Endpoints

All Todo endpoints require authentication (`Authorization: Bearer <accessToken>`). Users can only access their own todos; another user's todo ID returns `404` (not `403`, to avoid leaking existence).

### Todo Object

```json
{
  "id": "6d6a190f-a92d-4b60-ba03-91778089116b",
  "title": "Finish Phase 4 docs",
  "description": "Write api.md updates",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2026-07-10T00:00:00.000Z",
  "sortOrder": 0,
  "completedAt": null,
  "createdAt": "2026-07-04T17:41:42.168Z",
  "updatedAt": "2026-07-04T17:41:42.168Z"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `priority` | enum | `LOW` \| `MEDIUM` (default) \| `HIGH` \| `URGENT` |
| `status` | enum | `TODO` (default) \| `IN_PROGRESS` \| `DONE` \| `CANCELED` |
| `dueDate` | string (ISO) \| null | Optional deadline |
| `completedAt` | string (ISO) \| null | Auto-set when status becomes `DONE`; cleared otherwise |

---

### POST /api/todos

Create a new todo.

**Request:**
```bash
curl -X POST http://localhost:4000/api/todos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Finish Phase 4 docs",
    "description": "Write api.md updates",
    "priority": "HIGH",
    "dueDate": "2026-07-10T00:00:00Z"
  }'
```

| Field | Type | Required | Default | Rules |
|-------|------|----------|---------|-------|
| `title` | string | Yes | — | 1–500 chars |
| `description` | string | No | `null` | max 5000 chars |
| `priority` | enum | No | `MEDIUM` | `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT` |
| `status` | enum | No | `TODO` | `TODO` \| `IN_PROGRESS` \| `DONE` \| `CANCELED` |
| `dueDate` | string (ISO date) | No | `null` | Must be in the future |
| `sortOrder` | integer | No | `0` | ≥ 0 |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "todo": {
      "id": "6d6a190f-...",
      "title": "Finish Phase 4 docs",
      "description": "Write api.md updates",
      "priority": "HIGH",
      "status": "TODO",
      "dueDate": "2026-07-10T00:00:00.000Z",
      "sortOrder": 0,
      "completedAt": null,
      "createdAt": "2026-07-04T17:41:42.168Z",
      "updatedAt": "2026-07-04T17:41:42.168Z"
    }
  }
}
```

---

### GET /api/todos

List the authenticated user's todos with pagination, filtering, and sorting.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | `1` | Page number (≥ 1) |
| `limit` | integer | `20` | Items per page (1–100) |
| `status` | enum | — | Filter: `TODO` \| `IN_PROGRESS` \| `DONE` \| `CANCELED` |
| `priority` | enum | — | Filter: `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT` |
| `completed` | boolean | — | Filter: `true` = done, `false` = not done |
| `sortBy` | enum | `createdAt` | `createdAt` \| `dueDate` \| `priority` |
| `sortOrder` | enum | `desc` | `asc` \| `desc` |

**Examples:**
```bash
# Default list
curl http://localhost:4000/api/todos -H "Authorization: Bearer <token>"

# Filter by urgent + sort by priority descending
curl "http://localhost:4000/api/todos?priority=URGENT&sortBy=priority&sortOrder=desc" \
  -H "Authorization: Bearer <token>"

# Only incomplete todos, page 2
curl "http://localhost:4000/api/todos?completed=false&page=2&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "todos": [ { "id": "...", "title": "...", ... } ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }
}
```

---

### GET /api/todos/:id

Get a single todo by ID. Returns `404` if the todo does not exist or belongs to another user.

**Request:**
```bash
curl http://localhost:4000/api/todos/6d6a190f-a92d-4b60-ba03-91778089116b \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": { "todo": { "id": "...", "title": "...", ... } }
}
```

---

### PATCH /api/todos/:id

Update a todo. Only provided fields are changed. Setting `status` to `DONE` automatically stamps `completedAt`; changing away from `DONE` clears it.

**Request:**
```bash
curl -X PATCH http://localhost:4000/api/todos/6d6a190f-... \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DONE",
    "priority": "URGENT",
    "dueDate": "null"
  }'
```

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | 1–500 chars |
| `description` | string \| null | Pass `""` or `"null"` to clear |
| `priority` | enum | `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT` |
| `status` | enum | `TODO` \| `IN_PROGRESS` \| `DONE` \| `CANCELED` |
| `dueDate` | ISO date \| `"null"` | Pass `"null"` to clear the due date |
| `sortOrder` | integer | ≥ 0 |

**Response (200):**
```json
{
  "success": true,
  "data": { "todo": { "id": "...", "status": "DONE", "completedAt": "2026-07-04T18:30:39.324Z", ... } }
}
```

---

### DELETE /api/todos/:id

Permanently delete a todo. Returns `404` if it does not exist or belongs to another user.

**Request:**
```bash
curl -X DELETE http://localhost:4000/api/todos/6d6a190f-... \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Todo deleted successfully" }
}
```

**Todo error responses:**

| Status | Code | When |
|--------|------|------|
| 401 | `AUTH_TOKEN_MISSING` | No Bearer token |
| 401 | `INVALID_ACCESS_TOKEN` | Token invalid or expired |
| 404 | `TODO_NOT_FOUND` | Todo does not exist OR belongs to another user |
| 400 | `VALIDATION_ERROR` | Invalid body, params, or query |

---

## Pomodoro Endpoints

All Pomodoro endpoints require authentication. At most **one active session** (RUNNING or PAUSED) is allowed per user; starting a second returns `409 SESSION_ALREADY_ACTIVE`.

### Session Object

```json
{
  "id": "fd2cd864-3795-458c-9696-e10f9936d585",
  "type": "WORK",
  "status": "RUNNING",
  "plannedMinutes": 25,
  "actualMinutes": null,
  "startedAt": "2026-07-09T05:20:58.340Z",
  "endedAt": null,
  "pausedAt": null,
  "accumulatedPausedMs": 0,
  "todoId": null,
  "elapsedMs": 49,
  "focusMs": 49,
  "createdAt": "2026-07-09T05:20:58.340Z",
  "updatedAt": "2026-07-09T05:20:58.340Z"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `type` | enum | `WORK` (default) \| `SHORT_BREAK` \| `LONG_BREAK` |
| `status` | enum | `RUNNING` \| `PAUSED` \| `COMPLETED` \| `CANCELLED` \| `ABANDONED` |
| `plannedMinutes` | int | From user prefs or `durationMinutes` override |
| `actualMinutes` | int\|null | Computed on completion/cancel (excludes paused time) |
| `pausedAt` | ISO\|null | Most recent pause timestamp; null when running/terminal |
| `accumulatedPausedMs` | int | Total paused time in ms across all pause/resume cycles |
| `elapsedMs` | int | Wall-clock ms since `startedAt` |
| `focusMs` | int | `elapsedMs` minus all paused time |

---

### POST /api/pomodoro/start

Start a new Pomodoro session. Fails with `409` if a session is already active.

**Request:**
```bash
curl -X POST http://localhost:4000/api/pomodoro/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"type":"WORK","durationMinutes":30,"todoId":"<uuid>"}'
```

| Field | Type | Required | Default | Rules |
|-------|------|----------|---------|-------|
| `type` | enum | No | `WORK` | `WORK` \| `SHORT_BREAK` \| `LONG_BREAK` |
| `durationMinutes` | int | No | User pref (25/5/15) | 1–180 |
| `todoId` | UUID | No | `null` | Must belong to the user |

**Response (201):** `{ "success": true, "data": { "session": { ... } } }`

---

### POST /api/pomodoro/pause

Pause the active session (RUNNING → PAUSED). Returns `409` if already paused, `404` if no active session.

**Request:**
```bash
curl -X POST http://localhost:4000/api/pomodoro/pause -H "Authorization: Bearer <token>"
```

**Response (200):** `{ "success": true, "data": { "session": { "status": "PAUSED", "pausedAt": "..." } } }`

---

### POST /api/pomodoro/resume

Resume a paused session (PAUSED → RUNNING). Folds the pause duration into `accumulatedPausedMs`.

**Request:**
```bash
curl -X POST http://localhost:4000/api/pomodoro/resume -H "Authorization: Bearer <token>"
```

**Response (200):** `{ "success": true, "data": { "session": { "status": "RUNNING", "pausedAt": null } } }`

---

### POST /api/pomodoro/complete

Complete the active session (RUNNING or PAUSED → COMPLETED). Computes `actualMinutes` (excluding paused time) and sets `endedAt`.

**Request:**
```bash
curl -X POST http://localhost:4000/api/pomodoro/complete -H "Authorization: Bearer <token>"
```

**Response (200):** `{ "success": true, "data": { "session": { "status": "COMPLETED", "actualMinutes": 24, "endedAt": "..." } } }`

---

### POST /api/pomodoro/cancel

Cancel the active session (RUNNING or PAUSED → CANCELLED). Computes `actualMinutes` and sets `endedAt`.

**Request:**
```bash
curl -X POST http://localhost:4000/api/pomodoro/cancel -H "Authorization: Bearer <token>"
```

**Response (200):** `{ "success": true, "data": { "session": { "status": "CANCELLED", "actualMinutes": 3, "endedAt": "..." } } }`

---

### GET /api/pomodoro/current

Get the user's single active session (RUNNING or PAUSED). Returns `null` if none is active.

**Request:**
```bash
curl http://localhost:4000/api/pomodoro/current -H "Authorization: Bearer <token>"
```

**Response (200):** `{ "success": true, "data": { "session": { ... } | null } }`

---

### GET /api/pomodoro/history

Paginated history of all sessions (including completed/cancelled). Supports filtering by type, status, and date range.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | `1` | Page number (≥ 1) |
| `limit` | int | `20` | Items per page (1–100) |
| `type` | enum | — | `WORK` \| `SHORT_BREAK` \| `LONG_BREAK` |
| `status` | enum | — | `RUNNING` \| `PAUSED` \| `COMPLETED` \| `CANCELLED` \| `ABANDONED` |
| `from` | ISO date | — | Inclusive lower bound on `startedAt` |
| `to` | ISO date | — | Inclusive upper bound on `startedAt` |

**Example:**
```bash
curl "http://localhost:4000/api/pomodoro/history?type=WORK&status=COMPLETED&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [ { "id": "...", "type": "WORK", ... } ],
    "pagination": { "page": 1, "limit": 20, "total": 4, "totalPages": 1 }
  }
}
```

**Pomodoro error responses:**

| Status | Code | When |
|--------|------|------|
| 401 | `AUTH_TOKEN_MISSING` | No Bearer token |
| 404 | `NO_ACTIVE_SESSION` | Pause/resume/complete/cancel with no active session |
| 404 | `TODO_NOT_FOUND` | Linked todo doesn't exist or belongs to another user |
| 409 | `SESSION_ALREADY_ACTIVE` | Starting a second active session |
| 409 | `SESSION_ALREADY_PAUSED` | Pausing an already-paused session |
| 409 | `SESSION_ALREADY_RUNNING` | Resuming an already-running session |

---

## Focus Session Endpoints

All require authentication. At most **one active Focus Session** per user. Pomodoros started while a focus session is active are auto-associated with it. Cancelling a focus session does NOT delete its pomodoro history.

### Session Object
```json
{
  "id": "...", "mode": "STRICT", "strictModeEnabled": true, "status": "COMPLETED",
  "goal": "Ship Phase 6", "plannedMinutes": 90, "actualMinutes": 25,
  "completedPomodoros": 1, "cancelledPomodoros": 1,
  "startedAt": "...", "endedAt": "...", "elapsedMs": 2611, "pomodoroCount": 2,
  "createdAt": "...", "updatedAt": "..."
}
```

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/focus/start` | Start focus session (body: `mode`, `goal?`, `plannedMinutes`) → 201 |
| `POST` | `/api/focus/end` | End active session → COMPLETED; computes stats |
| `POST` | `/api/focus/cancel` | Cancel active session → CANCELLED; computes stats |
| `GET` | `/api/focus/current` | Get active session or null |
| `GET` | `/api/focus/history` | Paginated history (query: `page`, `limit`, `mode`, `status`, `from`, `to`) |
| `GET` | `/api/focus/:id` | Get by ID (404 if not owned) |

**Start body:** `{ "mode": "NORMAL"|"STRICT", "goal": "string (≤500)", "plannedMinutes": 1–720 }`

**End/cancel response** includes computed `completedPomodoros`, `cancelledPomodoros`, `actualMinutes`.

| Status | Code | When |
|--------|------|------|
| 404 | `NO_ACTIVE_FOCUS_SESSION` | End/cancel with no active session |
| 404 | `FOCUS_SESSION_NOT_FOUND` | ID not found or owned by another user |
| 409 | `FOCUS_SESSION_ALREADY_ACTIVE` | Starting a second active session |

---

## Analytics Endpoints

All require authentication. All data is scoped to the authenticated user. Read-only aggregations over existing Todo, PomodoroSession, and FocusSession data.

| Method | Route | Query | Purpose |
|--------|-------|-------|---------|
| `GET` | `/api/analytics/dashboard` | — | Todo/Pomodoro/Focus totals + current active sessions |
| `GET` | `/api/analytics/daily` | `date?` | Today's focus minutes, pomodoros, todos, completion rate |
| `GET` | `/api/analytics/weekly` | — | Last 7 days chart array (`date`, `focusMinutes`, `pomodoros`, `completedTodos`) |
| `GET` | `/api/analytics/monthly` | `date?` | Monthly focus hours, totals, weekly breakdown |
| `GET` | `/api/analytics/streak` | — | Current + longest streak (consecutive days with ≥1 COMPLETED WORK pomodoro) |

**Dashboard response shape:**
```json
{
  "todos": { "totalTodos": 3, "completedTodos": 1, "pendingTodos": 2, "overdueTodos": 0 },
  "pomodoros": { "totalPomodoros": 3, "completedPomodoros": 2, "cancelledPomodoros": 1, "totalFocusMinutes": 50, "averagePomodoroLength": 38 },
  "focusSessions": { "totalFocusSessions": 1, "completedFocusSessions": 1 },
  "current": { "activePomodoro": null, "activeFocusSession": null }
}
```

**Streak rule:** A streak day = at least one COMPLETED WORK pomodoro. Current streak counts back from today (or yesterday if nothing today); longest is computed across all history.

---

## Global Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Request body failed Zod validation |
| 401 | `AUTH_TOKEN_MISSING` | No Bearer token in Authorization header |
| 401 | `INVALID_ACCESS_TOKEN` | Access token is invalid or expired |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 401 | `INVALID_REFRESH_TOKEN` | Refresh token hash not found |
| 401 | `REFRESH_TOKEN_EXPIRED` | Refresh token past expiry |
| 401 | `REFRESH_TOKEN_MISSING` | No refresh token provided |
| 401 | `REFRESH_TOKEN_REUSE` | Token reuse detected; all sessions revoked |
| 401 | `USER_NOT_FOUND` | User referenced by token doesn't exist |
| 403 | `ACCOUNT_INACTIVE` | Account has been deactivated |
| 404 | `ROUTE_NOT_FOUND` | No matching route (handled by notFound middleware) |
| 404 | `TODO_NOT_FOUND` | Todo not found or owned by another user |
| 404 | `NO_ACTIVE_SESSION` | No active Pomodoro session to pause/resume/complete/cancel |
| 409 | `EMAIL_TAKEN` | Email already registered |
| 409 | `USERNAME_TAKEN` | Username already taken |
| 409 | `DUPLICATE_FIELD` | Prisma unique constraint violation (mapped from P2002) |
| 409 | `SESSION_ALREADY_ACTIVE` | Attempted to start a second active Pomodoro session |
| 409 | `SESSION_ALREADY_PAUSED` | Attempted to pause an already-paused session |
| 409 | `SESSION_ALREADY_RUNNING` | Attempted to resume an already-running session |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests; try again later |
| 500 | _(none)_ | Internal server error (generic message in production) |

---

## Validation Error Details

When `code` is `VALIDATION_ERROR`, the `details` object contains a `fields` array:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "fields": [
        { "path": "email", "message": "Invalid email" },
        { "path": "password", "message": "Password must be at least 8 characters" },
        { "path": "password", "message": "Password must contain at least one number" }
      ]
    }
  }
}
```

**Note:** Multiple errors can appear for the same field (e.g. password failing both min-length and regex checks).
