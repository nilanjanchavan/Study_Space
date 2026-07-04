# Authentication

## Overview

Study Workspace uses a **dual-token JWT authentication system**:

- **Access Token**: Short-lived JWT (15 min), sent in the `Authorization: Bearer` header
- **Refresh Token**: Long-lived opaque token (30 days), stored in an httpOnly cookie

This design provides a balance between security (short-lived access tokens limit damage from theft) and UX (users stay logged in for 30 days without re-entering credentials).

---

## JWT Flow

### Token Pair Issuance (Register / Login)

```
Client                              Server
  │                                    │
  │  POST /api/auth/register           │
  │  { email, username, password }     │
  │ ─────────────────────────────────▶│
  │                                    │  1. Validate input (Zod)
  │                                    │  2. Check email/username uniqueness
  │                                    │  3. Hash password (bcrypt, 12 rounds)
  │                                    │  4. Create User in DB
  │                                    │  5. Sign access token (JWT, 15 min)
  │                                    │  6. Generate refresh token (random)
  │                                    │  7. Hash refresh token (SHA-256)
  │                                    │  8. Store hash in RefreshToken table
  │                                    │  9. Update lastLoginAt
  │                                    │
  │ ◀─────────────────────────────────│
  │  201 { user, accessToken }         │
  │  Set-Cookie: rt=<raw_token>        │
  │                                    │
```

### Authenticated Request

```
Client                              Server
  │                                    │
  │  GET /api/auth/me                   │
  │  Authorization: Bearer <access>     │
  │ ─────────────────────────────────▶│
  │                                    │  1. Extract Bearer token
  │                                    │  2. Verify JWT signature + expiry
  │                                    │  3. Load User from DB by sub (id)
  │                                    │  4. Check isActive
  │                                    │  5. Attach req.user
  │                                    │
  │ ◀─────────────────────────────────│
  │  200 { user }                      │
  │                                    │
```

---

## Refresh Token Rotation

### Normal Rotation

```
Client                              Server
  │                                    │
  │  POST /api/auth/refresh            │
  │  Cookie: rt=<current_token>        │
  │ ─────────────────────────────────▶│
  │                                    │  1. Hash cookie token → lookup DB
  │                                    │  2. Check not revoked, not expired
  │                                    │  3. Mark presented token as revoked
  │                                    │  4. Generate NEW refresh token
  │                                    │  5. Store NEW hash in DB
  │                                    │  6. Sign NEW access token
  │                                    │
  │ ◀─────────────────────────────────│
  │  200 { user, accessToken }         │
  │  Set-Cookie: rt=<new_token>        │  ← Old token is now invalid
  │                                    │
```

### Reuse Detection

If a **revoked** token is presented, the server assumes **token theft**:

```
Client                              Server
  │                                    │
  │  POST /api/auth/refresh            │
  │  Cookie: rt=<stolen_old_token>     │
  │ ─────────────────────────────────▶│
  │                                    │  1. Hash → find row
  │                                    │  2. Row exists AND isRevoked = true
  │                                    │  3. ⚠️ REUSE DETECTED
  │                                    │  4. Revoke ALL user's refresh tokens
  │                                    │     (every device is forced to re-login)
  │                                    │
  │ ◀─────────────────────────────────│
  │  401 "Refresh token reuse          │
  │        detected; all sessions       │
  │        revoked"                     │
  │                                    │
```

**Why revoke all?** If an attacker has a valid old token, they may also have the new one. Revoking everything forces the legitimate user to re-authenticate, locking out the attacker.

---

## Cookie Strategy

The refresh token is stored in an httpOnly cookie rather than in localStorage or a response body. This protects against XSS attacks — JavaScript cannot read httpOnly cookies.

### Cookie Configuration

| Attribute | Development | Production | Purpose |
|-----------|------------|------------|---------|
| `httpOnly` | `true` | `true` | Prevents JS access (XSS protection) |
| `secure` | `false` | `true` | Only sent over HTTPS |
| `sameSite` | `lax` | `none` | CSRF protection / cross-origin |
| `path` | `/api/auth` | `/api/auth` | Scoped to auth endpoints only |
| `maxAge` | 30 days (ms) | 30 days (ms) | Token lifetime |

### Cookie Name
`rt` — short, unambiguous, doesn't reveal implementation details.

### Why `path=/api/auth`?
Only auth endpoints need the refresh token cookie. Scoping the path means it's never sent to other API routes (like `/api/todos`), reducing exposure.

---

## Password Hashing

| Algorithm | Library | Salt Rounds | Hash Format |
|-----------|---------|-------------|-------------|
| bcrypt | `bcryptjs` | 12 | `$2a$12$...` |

### Why bcryptjs (not bcrypt)?
The native `bcrypt` npm package requires native C++ compilation, which can fail on some platforms. `bcryptjs` is a pure JavaScript implementation with the same API and comparable performance for this use case.

### Password Policy (enforced by Zod validator)
- Minimum 8 characters
- Maximum 100 characters
- At least one letter
- At least one number

### Generic Error Messages
Login failures return `"Invalid email or password"` regardless of whether the email doesn't exist or the password is wrong. This prevents **user enumeration** — an attacker cannot determine if an email is registered.

---

## Authentication Middleware

### `authenticate.ts`

Applied as route middleware to protect endpoints:

```typescript
router.get('/me', authenticate, me);
```

**Behavior:**
1. Extracts `Bearer` token from `Authorization` header
2. Verifies JWT signature and expiration
3. Queries the database for the user
4. Attaches `req.user` (the full User record, minus password hash)
5. Returns 401 if token missing, invalid, or expired
6. Returns 403 if user account is deactivated (`isActive = false`)

**Important:** The middleware checks the database on every authenticated request. This ensures that:
- Recently deactivated accounts are immediately blocked
- Deleted accounts are caught
- The latest user state is always available

---

## Security Considerations

### Token Storage

| Token | Where | Why |
|-------|-------|-----|
| Access | Client memory / JS variable | Short-lived, needs to be in headers |
| Refresh | httpOnly cookie | Protected from XSS, auto-sent by browser |

### Refresh Token Security

1. **Only hash stored**: The raw refresh token is never written to the database. Only its SHA-256 digest is persisted. Even if the database is compromised, tokens cannot be reconstructed.
2. **Rotation**: Every refresh invalidates the previous token. A stolen token has a narrow window of usefulness.
3. **Reuse detection**: Replaying a revoked token triggers mass revocation, locking out the attacker.
4. **Expiry**: Tokens expire after 30 days. Expired tokens are cleaned up by the `isRevoked` flag.

### Rate Limiting

All auth endpoints (`/api/auth/*`) are rate-limited to 10 requests per 15 minutes per IP address. This mitigates:
- Brute-force password attacks
- Credential stuffing
- Refresh token replay attempts

### JWT Secret Management

- **Development**: Secrets are set in `.env` (not committed to git)
- **Production**: Secrets must be generated with `openssl rand -hex 48` or equivalent
- **Rotation**: If a secret is compromised, all existing tokens become invalid. Users must re-login.

### Session Lifecycle

| Event | Action |
|-------|--------|
| Register | Create user + issue token pair |
| Login | Verify credentials + issue token pair |
| Access token expires | Client calls `/refresh` with cookie |
| Refresh | Rotate token pair (revoke old, issue new) |
| Logout | Revoke refresh token + clear cookie |
| Token reuse detected | Revoke ALL user tokens + force re-login |
| Account deactivated | Auth middleware rejects all requests (403) |

---

## Future Considerations

These are NOT yet implemented but are planned:

- [ ] Email verification flow (confirm `isEmailVerified`)
- [ ] Password reset (forgot password email + reset token)
- [ ] Multi-device session management (list active sessions, revoke individually)
- [ ] Two-factor authentication (TOTP)
- [ ] OAuth2 providers (Google, GitHub, Codeforces)
