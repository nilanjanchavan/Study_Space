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

### Phase 5 — Pomodoro Timer
**Goal:** Focus session management with real-time timer control

Features:
- `POST /api/pomodoro/start` — Start a pomodoro cycle (link optional todo)
- `POST /api/pomodoro/stop` — End current cycle (mark completed/abandoned)
- `POST /api/pomodoro/pause` — Pause current cycle
- `POST /api/focus/start` — Start a focus session (normal/strict mode)
- `POST /api/focus/stop` — End focus session
- `GET /api/pomodoro/current` — Get active session for the user
- Link pomodoro cycles to focus sessions
- Track planned vs actual minutes

---

### Phase 6 — Analytics Dashboard
**Goal:** Productivity insights and progress tracking

Features:
- `GET /api/analytics/daily` — Daily focus time, pomodoros completed, todos done
- `GET /api/analytics/weekly` — Weekly aggregation with day-of-week breakdown
- `GET /api/analytics/monthly` — Monthly trends and streaks
- `GET /api/analytics/summary` — Key metrics (total focus hours, streak, best day)
- Focus time distribution charts
- Completion rate trends
- Streaks (consecutive days with completed sessions)

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

### Phase 9 — Codeforces Integration
**Goal:** Coding progress tracking via Codeforces API

Features:
- `POST /api/codeforces/link` — Link Codeforces account by handle
- `DELETE /api/codeforces/unlink` — Unlink Codeforces account
- `GET /api/codeforces/profile` — Get linked profile (rating, rank, contests)
- `POST /api/codeforces/sync` — Trigger manual data sync from CF API
- `GET /api/codeforces/stats` — Solve counts, rating history, contest results
- Automated sync on schedule or on focus session end
- Coding progress in analytics (problems solved during focus sessions)
- Rating change alerts

---

### Phase 10 — Music & Ambient System
**Goal:** Optional ambient sound integration for focus sessions

Features:
- `GET /api/music/preferences` — Get user's music preference
- `PUT /api/music/preferences` — Update music preference (source, volume, autoplay)
- Built-in sources: lo-fi, nature, white noise
- Custom playlist URL support
- Auto-start music when focus session begins
- Music preference per-session override
- Integration with external audio APIs (future)

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
| 5 | Pomodoro Timer | 🔜 Next |
| 6 | Analytics Dashboard | Planned |
| 7 | Notification System | Planned |
| 8 | Focus Mode (Strict) | Planned |
| 9 | Codeforces Integration | Planned |
| 10 | Music & Ambient System | Planned |
| 11 | User Profile & Settings | Planned |
| 12 | Email Verification & Reset | Planned |
| 13 | Frontend Application | Planned |
| 14 | Production Deployment | Planned |
