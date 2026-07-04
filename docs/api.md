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
| 409 | `EMAIL_TAKEN` | Email already registered |
| 409 | `USERNAME_TAKEN` | Username already registered |
| 409 | `DUPLICATE_FIELD` | Prisma unique constraint violation (mapped from P2002) |
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
