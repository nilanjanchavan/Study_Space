# Roadmap

## Completed Phases

### Phase 1 ✅ — Backend Foundation
**Status:** Complete

Delivered:
- Node.js + TypeScript + Express project scaffold
- Folder structure (routes, controllers, middleware, config)
- PostgreSQL 17 provisioned and connected
- Prisma ORM configured with empty schema
- `/api/health` endpoint with DB ping
- Graceful shutdown with DB disconnect
- Development workflow (`npm run dev` with hot reload)

**Files:** `package.json`, `tsconfig.json`, `src/app.ts`, `src/server.ts`, `src/config/*`, `prisma/schema.prisma` (empty)

---

### Phase 2 ✅ — Database Design
**Status:** Complete

Delivered:
- 8 Prisma models: `User`, `RefreshToken`, `Todo`, `PomodoroSession`, `FocusSession`, `Notification`, `MusicPreference`, `CodeforcesProfile`
- 8 enums: `Role`, `TodoPriority`, `TodoStatus`, `SessionStatus`, `FocusMode`, `NotificationType`, `AuthProvider`, `MusicSource`
- 17 secondary indexes optimized for dashboard and analytics queries
- Cascade and SetNull delete strategies
- First migration: `20260703204229_add_core_models`

**Files:** `prisma/schema.prisma`, `prisma/migrations/20260703204229_add_core_models/migration.sql`

---

### Phase 3 ✅ — Authentication
**Status:** Complete

Delivered:
- User registration with password hashing (bcrypt, 12 rounds)
- User login with credential verification
- JWT access tokens (short-lived, 15 min)
- Refresh token rotation with httpOnly cookies
- Refresh token reuse detection (revokes all sessions on replay)
- Logout (single token revocation)
- `/me` authenticated endpoint
- Request validation with Zod (password policy, email format, username rules)
- Rate limiting on auth endpoints (10 req / 15 min per IP)
- Consistent API response envelope
- Centralized error handling with AppError + Prisma mapping

**Files:** `src/services/auth.service.ts`, `src/controllers/auth.controller.ts`, `src/routes/auth.routes.ts`, `src/middleware/authenticate.ts`, `src/middleware/rateLimit.ts`, `src/middleware/validate.ts`, `src/validators/auth.validators.ts`, `src/utils/*`

---

### Phase 3.5 ✅ — Project Documentation
**Status:** Complete

Delivered:
- Architecture documentation with system diagram
- Backend module guide (middleware, services, controllers, utilities)
- Database documentation with ER diagram and model reference
- Authentication documentation with JWT flow diagrams
- Complete API reference with request/response examples
- Development guide with setup instructions and workflow
- Deployment guide with security checklist
- Product roadmap

**Files:** `docs/*.md`

---

## Remaining Phases

### Phase 4 ✅ — Todo Management
**Status:** Complete
**Goal:** Full CRUD for todos with filtering, sorting, and pagination

Delivered:
- `POST /api/todos` — Create todo (title, description, priority, status, dueDate, sortOrder)
- `GET /api/todos` — List todos with pagination + filtering (status, priority, completed) + sorting (dueDate, createdAt, priority)
- `GET /api/todos/:id` — Get single todo
- `PATCH /api/todos/:id` — Update todo; status→DONE auto-stamps `completedAt`, reverting clears it
- `DELETE /api/todos/:id` — Permanently delete todo
- Zod validation on body, query, and params
- Ownership enforcement — users get `404` for other users' todos (no existence leak)
- Thin controllers + service layer + validators (testable structure)

Files: `src/validators/todo.validators.ts`, `src/services/todo.service.ts`, `src/controllers/todo.controller.ts`, `src/routes/todo.routes.ts`

---

### Phase 5 ✅ — Pomodoro Timer
**Status:** Complete
**Goal:** Pomodoro engine with full session lifecycle and state machine

Delivered:
- `POST /api/pomodoro/start` — Start a session (WORK/SHORT_BREAK/LONG_BREAK, optional todo link, optional duration override)
- `POST /api/pomodoro/pause` — Pause a running session (RUNNING → PAUSED)
- `POST /api/pomodoro/resume` — Resume a paused session (PAUSED → RUNNING; folds pause into `accumulatedPausedMs`)
- `POST /api/pomodoro/complete` — Complete a session (→ COMPLETED; computes `actualMinutes` excluding paused time)
- `POST /api/pomodoro/cancel` — Cancel a session (→ CANCELLED)
- `GET /api/pomodoro/current` — Get the user's single active session (or null)
- `GET /api/pomodoro/history` — Paginated history with filters (type, status, date range)
- Single-active-session invariant (enforced; starting a second returns 409)
- Configurable durations from user prefs (`pomodoroLength`, `shortBreakLength`, `longBreakLength`)
- Pause tracking via `pausedAt` + `accumulatedPausedMs`; `actualMinutes` excludes paused time
- Zod validation on all inputs; auth on all endpoints

Files: `src/validators/pomodoro.validators.ts`, `src/services/pomodoro.service.ts`, `src/controllers/pomodoro.controller.ts`, `src/routes/pomodoro.routes.ts`

---

### Phase 6 ✅ — Analytics Dashboard
**Status:** Complete
**Goal:** Productivity insights and progress tracking

Delivered:
- `GET /api/analytics/dashboard` — Todo/Pomodoro/Focus totals + current active sessions
- `GET /api/analytics/daily` — Today's focus minutes, pomodoros, todos, completion rate
- `GET /api/analytics/weekly` — Last 7 days chart-friendly array
- `GET /api/analytics/monthly` — Monthly focus hours + weekly breakdown
- `GET /api/analytics/streak` — Current + longest streak (consecutive days with ≥1 COMPLETED WORK pomodoro)
- Prisma `aggregate`/`groupBy`/`count` used throughout — no N+1 queries
- Zod validation on date params; auth on all endpoints

Files: `src/validators/analytics.validators.ts`, `src/services/analytics.service.ts`, `src/controllers/analytics.controller.ts`, `src/routes/analytics.routes.ts`

---

### Phase 7 — Notification System
**Goal:** In-app reminders and alerts

Features:
- `GET /api/notifications` — List user's notifications (paginated, filter by read/unread)
- `PATCH /api/notifications/:id/read` — Mark notification as read
- `PATCH /api/notifications/read-all` — Mark all as read
- `DELETE /api/notifications/:id` — Delete notification
- `GET /api/notifications/unread-count` — Badge count
- Notification triggers:
  - Focus reminders (scheduled)
  - Break reminders (after pomodoro completion)
  - Water reminders (interval-based)
  - Todo due alerts (before deadline)
- User notification preferences (opt-in/out per type)

---

### Phase 8 — Focus Mode (Strict/Discipline Mode)
**Goal:** Enhanced focus with distraction blocking

Features:
- `POST /api/focus/strict/start` — Enter strict focus mode
- `POST /api/focus/strict/end` — Exit strict mode
- Strict mode rules:
  - Block non-essential notifications
  - Show focus timer prominently
  - Track strict mode sessions separately in analytics
  - Optional website/app blocking recommendations
- Strict mode session history
- Discipline score (percentage of focus time in strict mode)

---

### Phase 9 ✅ — Codeforces Integration
**Status:** Complete (backend)
**Goal:** Coding progress tracking via Codeforces API

Delivered:
- `GET /api/codeforces/profile` — Cached profile (or null)
- `PUT /api/codeforces/profile` — Save/update handle (validated; no auto-sync)
- `POST /api/codeforces/sync` — Fetch live from CF API; caches rating/maxRating/rank/maxRank/contribution/avatar/titlePhoto
- `DELETE /api/codeforces/profile` — Unlink
- Robust error handling: timeout (8s), network errors, malformed JSON, handle-not-found — never crashes
- Zod handle validation (3–24 chars, alphanumeric + `_.-`)

Files: `src/validators/codeforces.validators.ts`, `src/services/codeforces.service.ts`, `src/controllers/codeforces.controller.ts`, `src/routes/codeforces.routes.ts`

---

### Phase 10 ✅ — Music & Ambient System
**Status:** Complete (backend preferences only)
**Goal:** Optional ambient sound preferences for focus sessions

Delivered:
- `GET /api/music/preferences` — Auto-creates defaults on first access
- `PATCH /api/music/preferences` — Partial update (source, volume, isAutoplay, customPlaylistUrl)
- Validation: volume 0–100, source enum, URL format, non-empty body
- Defaults: `NONE` / `50` / `false` / `null`

Files: `src/validators/music.validators.ts`, `src/services/music.service.ts`, `src/controllers/music.controller.ts`, `src/routes/music.routes.ts`

---

### Phase 11 — User Profile & Settings
**Goal:** Account management and personalization

Features:
- `GET /api/users/profile` — Get full profile
- `PUT /api/users/profile` — Update name, avatar, username
- `PUT /api/users/password` — Change password (requires current password)
- `POST /api/users/avatar` — Upload avatar image
- `GET /api/users/settings` — Get all user settings
- `PUT /api/users/settings` — Update settings (pomodoro length, notifications, music)
- `GET /api/users/sessions` — List active login sessions
- `DELETE /api/users/sessions/:id` — Revoke specific session

---

### Phase 12 — Email Verification & Password Reset
**Goal:** Email-based account security

Features:
- `POST /api/auth/send-verification` — Send verification email
- `POST /api/auth/verify-email` — Verify email with token
- `POST /api/auth/forgot-password` — Request password reset email
- `POST /api/auth/reset-password` — Reset password with token
- Email templates (verification, reset)
- Token expiry (24 hours for reset, 7 days for verification)

---

### Phase 13 — Frontend Application
**Goal:** Web-based user interface

Features:
- React (or Next.js) SPA
- Dashboard with analytics widgets
- Pomodoro timer UI with visual countdown
- Todo board (Kanban-style drag-and-drop)
- Focus mode overlay (strict mode)
- Notification center
- User settings page
- Codeforces profile view
- Responsive design (mobile + desktop)
- Dark/light theme

---

### Phase 14 — Production Deployment & Launch
**Goal:** Production-ready deployment

Tasks:
- Production infrastructure setup (Vercel/Railway for frontend, VPS/container for backend)
- Domain configuration and SSL
- Production database (managed PostgreSQL with backups)
- CI/CD pipeline (GitHub Actions)
- Monitoring and alerting (Sentry, uptime checks)
- Performance optimization (caching, CDN)
- Security audit
- Load testing
- Documentation finalization
- Launch checklist

---

## Timeline Summary

| Phase | Title | Status |
|-------|-------|--------|
| 1 | Backend Foundation | ✅ Complete |
| 2 | Database Design | ✅ Complete |
| 3 | Authentication | ✅ Complete |
| 3.5 | Project Documentation | ✅ Complete |
| 4 | Todo Management | ✅ Complete |
| 5 | Pomodoro Timer | ✅ Complete |
| 6 | Analytics Dashboard | ✅ Complete |
| 7 | Notification System | Planned |
| 8 | Focus Mode (Strict) | Planned |
| 9 | Codeforces Integration | ✅ Complete |
| 10 | Music & Ambient System | ✅ Complete |
| 11 | User Profile & Settings | Planned |
| 12 | Email Verification & Reset | Planned |
| 13 | Frontend Application | Planned |
| 14 | Production Deployment | Planned |
