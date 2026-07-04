# Database Design

## Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o{ RefreshToken : "has many"
    User ||--o{ Todo : "has many"
    User ||--o{ PomodoroSession : "has many"
    User ||--o{ FocusSession : "has many"
    User ||--o{ Notification : "has many"
    User ||--o| MusicPreference : "has one"
    User ||--o| CodeforcesProfile : "has one"

    Todo ||--o{ PomodoroSession : "has many"
    FocusSession ||--o{ PomodoroSession : "has many"

    User {
        UUID id PK
        String email UK
        String username UK
        String passwordHash
        String name
        String avatarUrl
        Role role
        Boolean isEmailVerified
        Int pomodoroLength
        Boolean isActive
        DateTime lastLoginAt
        DateTime createdAt
        DateTime updatedAt
    }

    RefreshToken {
        UUID id PK
        String tokenHash UK
        UUID userId FK
        String userAgent
        String ipAddress
        Boolean isRevoked
        DateTime expiresAt
        DateTime createdAt
        DateTime updatedAt
    }

    Todo {
        UUID id PK
        UUID userId FK
        String title
        String description
        TodoPriority priority
        TodoStatus status
        DateTime dueDate
        Int sortOrder
        DateTime completedAt
        DateTime createdAt
        DateTime updatedAt
    }

    PomodoroSession {
        UUID id PK
        UUID userId FK
        UUID todoId FK
        UUID focusSessionId FK
        Int plannedMinutes
        Int actualMinutes
        SessionStatus status
        DateTime startedAt
        DateTime endedAt
        DateTime createdAt
        DateTime updatedAt
    }

    FocusSession {
        UUID id PK
        UUID userId FK
        FocusMode mode
        SessionStatus status
        String goal
        Int plannedMinutes
        Int actualMinutes
        DateTime startedAt
        DateTime endedAt
        DateTime createdAt
        DateTime updatedAt
    }

    Notification {
        UUID id PK
        UUID userId FK
        NotificationType type
        String title
        String body
        Boolean isRead
        DateTime readAt
        DateTime createdAt
        DateTime updatedAt
    }

    MusicPreference {
        UUID id PK
        UUID userId FK_UK
        MusicSource source
        Int volume
        Boolean isAutoplay
        String customPlaylistUrl
        DateTime createdAt
        DateTime updatedAt
    }

    CodeforcesProfile {
        UUID id PK
        UUID userId FK_UK
        AuthProvider provider
        String codeforcesHandle UK
        Int rating
        Int maxRating
        String rank
        Json statsJson
        DateTime lastSyncedAt
        DateTime createdAt
        DateTime updatedAt
    }
```

---

## Conventions

| Convention | Rule |
|------------|------|
| Primary keys | UUID (`@id @default(uuid())`) on every model |
| Timestamps | `createdAt` + `updatedAt` on every model (Prisma auto-manages `updatedAt`) |
| Deletions | `Cascade` on owned children; `SetNull` on linked references |
| Uniqueness | Enforced at the database level via `@unique` |
| Soft deletes | `User.isActive` flag (accounts are never hard-deleted in production) |

---

## Enums

### `Role`
Account role for role-based access control.
| Value | Description |
|-------|-------------|
| `USER` | Default SaaS subscriber |
| `ADMIN` | Platform administrator |

### `TodoPriority`
| Value | Description |
|-------|-------------|
| `LOW` | Low priority |
| `MEDIUM` | Default priority |
| `HIGH` | High priority |
| `URGENT` | Must be done immediately |

### `TodoStatus`
Lifecycle states for a todo item.
| Value | Description |
|-------|-------------|
| `TODO` | Not yet started (default) |
| `IN_PROGRESS` | Currently being worked on |
| `DONE` | Completed |
| `CANCELED` | Abandoned by user |

### `SessionStatus`
Shared lifecycle for both Pomodoro and Focus sessions.
| Value | Description |
|-------|-------------|
| `RUNNING` | Session is active (default) |
| `COMPLETED` | Finished successfully |
| `ABANDONED` | User quit early |
| `PAUSED` | Temporarily paused |

### `FocusMode`
| Value | Description |
|-------|-------------|
| `NORMAL` | Standard focus session (default) |
| `STRICT` | Discipline mode — blocks distractions |

### `NotificationType`
| Value | Description |
|-------|-------------|
| `FOCUS_REMINDER` | Time to start focusing |
| `BREAK_REMINDER` | Break is due |
| `WATER_REMINDER` | Hydration reminder |
| `TODO_DUE` | A todo deadline is approaching |
| `SYSTEM` | System-level notification |

### `AuthProvider`
| Value | Description |
|-------|-------------|
| `LOCAL` | Email/password registration |
| `CODEFORCES` | Linked via Codeforces OAuth |

### `MusicSource`
| Value | Description |
|-------|-------------|
| `NONE` | No music (default) |
| `LOFI` | Lo-fi beats |
| `NATURE` | Nature sounds |
| `WHITE_NOISE` | White noise |
| `CUSTOM` | User-provided playlist URL |

---

## Models

### User
The core account entity. Owns all other data via cascade relations.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto | Unique identifier |
| `email` | String | unique, max 254 | Login email |
| `username` | String | unique, 3–30 chars | Public display name |
| `passwordHash` | String | required | bcrypt hash (never exposed) |
| `name` | String? | max 100 | Full name |
| `avatarUrl` | String? | — | Profile picture URL |
| `role` | Role | default USER | RBAC role |
| `isEmailVerified` | Boolean | default false | Email verification status |
| `pomodoroLength` | Int | default 25 | Default timer length (minutes) |
| `isActive` | Boolean | default true | Soft-delete flag |
| `lastLoginAt` | DateTime? | — | Last successful login |
| `createdAt` | DateTime | auto | Account creation |
| `updatedAt` | DateTime | auto | Last modification |

**Indexes:** `(email)`, `(isActive)`

---

### RefreshToken
Server-side token store for JWT rotation. Raw tokens are never persisted — only their SHA-256 hash.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Token identifier |
| `tokenHash` | String | unique | SHA-256 hash of the raw token |
| `userId` | UUID | FK → User | Token owner |
| `userAgent` | String? | — | Client device / browser |
| `ipAddress` | String? | — | Client IP address |
| `isRevoked` | Boolean | default false | Revocation status |
| `expiresAt` | DateTime | required | Token expiration timestamp |
| `createdAt` | DateTime | auto | Token creation |
| `updatedAt` | DateTime | auto | Last modification |

**Indexes:** `(userId)`, `(expiresAt)`

---

### Todo
An actionable task with priority, status, and optional due date.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `userId` | UUID | FK → User | Task owner |
| `title` | String | required | Task title |
| `description` | String? | — | Detailed description |
| `priority` | TodoPriority | default MEDIUM | Priority level |
| `status` | TodoStatus | default TODO | Current status |
| `dueDate` | DateTime? | — | Optional deadline |
| `sortOrder` | Int | default 0 | Board ordering hint |
| `completedAt` | DateTime? | — | When marked done |
| `createdAt` | DateTime | auto | Creation timestamp |
| `updatedAt` | DateTime | auto | Last modification |

**Indexes:** `(userId, status)`, `(userId, dueDate)`, `(userId, sortOrder)`

---

### PomodoroSession
A single Pomodoro cycle (e.g. one 25-min work block). The primary analytics data source.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `userId` | UUID | FK → User | Session owner |
| `todoId` | UUID? | FK → Todo, SetNull | Optional linked todo |
| `focusSessionId` | UUID? | FK → FocusSession, SetNull | Optional parent focus block |
| `plannedMinutes` | Int | required | Planned work duration |
| `actualMinutes` | Int? | — | Actual work duration |
| `status` | SessionStatus | default RUNNING | Session lifecycle |
| `startedAt` | DateTime | auto | Session start |
| `endedAt` | DateTime? | — | Session end |
| `createdAt` | DateTime | auto | Record creation |
| `updatedAt` | DateTime | auto | Last modification |

**Indexes:** `(userId, startedAt)`, `(todoId)`, `(focusSessionId)`

---

### FocusSession
An aggregate deep-work block spanning multiple Pomodoro cycles. Supports normal and strict (discipline) modes.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `userId` | UUID | FK → User | Session owner |
| `mode` | FocusMode | default NORMAL | Normal or strict |
| `status` | SessionStatus | default RUNNING | Session lifecycle |
| `goal` | String? | — | What the user aimed to accomplish |
| `plannedMinutes` | Int | required | Planned total duration |
| `actualMinutes` | Int? | — | Actual total duration |
| `startedAt` | DateTime | auto | Session start |
| `endedAt` | DateTime? | — | Session end |
| `createdAt` | DateTime | auto | Record creation |
| `updatedAt` | DateTime | auto | Last modification |

**Indexes:** `(userId, startedAt)`, `(userId, status)`

---

### Notification
In-app notification for reminders and alerts.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `userId` | UUID | FK → User | Recipient |
| `type` | NotificationType | required | Notification category |
| `title` | String | required | Notification title |
| `body` | String? | — | Notification body |
| `isRead` | Boolean | default false | Read status |
| `readAt` | DateTime? | — | When marked as read |
| `createdAt` | DateTime | auto | Creation timestamp |
| `updatedAt` | DateTime | auto | Last modification |

**Indexes:** `(userId, isRead)`, `(userId, createdAt)`

---

### MusicPreference
Per-user ambient music configuration (1:1 with User).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `userId` | UUID | FK → User, unique | Music preference owner |
| `source` | MusicSource | default NONE | Music source type |
| `volume` | Int | default 50 | Volume level (0–100) |
| `isAutoplay` | Boolean | default false | Auto-start on focus |
| `customPlaylistUrl` | String? | — | URL for CUSTOM source |
| `createdAt` | DateTime | auto | Creation timestamp |
| `updatedAt` | DateTime | auto | Last modification |

**Indexes:** `(userId)`

---

### CodeforcesProfile
Linked Codeforces account for coding progress tracking (1:1 with User).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `userId` | UUID | FK → User, unique | Profile owner |
| `provider` | AuthProvider | default CODEFORCES | Link method |
| `codeforcesHandle` | String | unique | CF username |
| `rating` | Int? | — | Current rating |
| `maxRating` | Int? | — | All-time max rating |
| `rank` | String? | — | Current rank title |
| `statsJson` | Json? | — | Cached solve/contest data |
| `lastSyncedAt` | DateTime? | — | Last CF API sync |
| `createdAt` | DateTime | auto | Link creation |
| `updatedAt` | DateTime | auto | Last modification |

**Indexes:** `(userId)`, `(codeforcesHandle)`

---

## Relationships

| Parent | Child | Cardinality | onDelete | Notes |
|--------|-------|-------------|----------|-------|
| User | RefreshToken | 1:N | **Cascade** | Tokens are owned session data |
| User | Todo | 1:N | **Cascade** | Todos are personal to the user |
| User | PomodoroSession | 1:N | **Cascade** | Analytics owned by user |
| User | FocusSession | 1:N | **Cascade** | Sessions owned by user |
| User | Notification | 1:N | **Cascade** | Alerts are personal |
| User | MusicPreference | **1:1** | **Cascade** | `@unique` on FK |
| User | CodeforcesProfile | **1:1** | **Cascade** | `@unique` on FK |
| Todo | PomodoroSession | 1:N | **SetNull** | Preserves analytics if todo deleted |
| FocusSession | PomodoroSession | 1:N | **SetNull** | Preserves cycles if session deleted |

### Cascade vs SetNull rationale

- **Cascade**: When a user is deleted, all their data (tokens, todos, sessions, notifications, preferences) is removed. This is a hard delete for the user (soft delete via `isActive` is preferred in production).
- **SetNull**: A PomodoroSession may optionally reference a Todo and/or FocusSession. If the parent todo or session is deleted, the cycle record survives with a null FK — its analytics value remains intact.

---

## Indexes Summary

17 secondary indexes (plus unique constraints and PK indexes) optimized for common query patterns:

| Table | Index | Access Pattern |
|-------|-------|----------------|
| User | `(email)` | Login lookup |
| User | `(isActive)` | Admin user listing |
| RefreshToken | `(userId)` | Load user's active tokens |
| RefreshToken | `(expiresAt)` | Token cleanup jobs |
| Todo | `(userId, status)` | Dashboard filter by status |
| Todo | `(userId, dueDate)` | Dashboard sort by deadline |
| Todo | `(userId, sortOrder)` | Board drag-and-drop ordering |
| PomodoroSession | `(userId, startedAt)` | Analytics: sessions per day |
| PomodoroSession | `(todoId)` | Per-todo focus time |
| PomodoroSession | `(focusSessionId)` | Cycles within a focus block |
| FocusSession | `(userId, startedAt)` | Analytics: focus time per day |
| FocusSession | `(userId, status)` | Active sessions |
| Notification | `(userId, isRead)` | Unread badge count |
| Notification | `(userId, createdAt)` | Chronological feed |
| MusicPreference | `(userId)` | 1:1 lookup (also via @unique) |
| CodeforcesProfile | `(userId)` | 1:1 lookup (also via @unique) |
| CodeforcesProfile | `(codeforcesHandle)` | Handle lookup for linking |

---

## Migration Strategy

### Current Migrations

| Migration | Name | Status |
|-----------|------|--------|
| `20260703204229` | `add_core_models` | Applied ✅ |

### Workflow

```bash
# After modifying schema.prisma:

# Option A: Create a named migration (recommended for production)
npx prisma migrate dev --name <description>

# Option B: Push without migration history (prototyping only)
npx prisma db push

# Apply pending migrations in production
npx prisma migrate deploy
```

### Shadow Database

`prisma migrate dev` uses a **shadow database** to validate migrations. The `studyuser` role has `CREATEDB` permission to support this. In production, `prisma migrate deploy` is used instead (no shadow DB needed).

### Migration Best Practices

1. Always use `prisma migrate dev` in development — it creates and applies migrations
2. Review generated SQL in `prisma/migrations/<timestamp>_<name>/migration.sql` before committing
3. Never modify a migration after it has been applied
4. In production, use `prisma migrate deploy` (applies without creating)
5. Back up the database before running untested migrations
