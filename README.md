# 🎓 Study Workspace

> A full-stack productivity workspace built for focused study — combining task management, Pomodoro sessions, deep focus, productivity analytics, ambient music, and competitive programming tracking in one place.

<p align="center">
  <a href="https://study-space-pink.vercel.app"><strong>🌐 Live Demo</strong></a>
  &nbsp; • &nbsp;
  <a href="https://github.com/nilanjanchavan/Study_Space"><strong>GitHub Repository</strong></a>
</p>

Study Workspace brings the tools needed for productive study into a single connected application. Instead of switching between a task manager, focus timer, analytics dashboard, and background music player, users can manage their entire study workflow from one workspace.

---

## ✨ Features

### 🍅 Focus & Pomodoro

- Customizable work and break durations
- Short and long break cycles
- Auto-start sessions and breaks
- Daily Pomodoro goals
- Session history and progress tracking
- Browser notifications and sound effects
- Integrated ambient music

### 🌲 Deep Focus

A distraction-free workspace designed for longer study sessions.

- Focus goals and custom durations
- Strict Focus Mode
- Multi-cycle Pomodoro support
- Live session and cycle progress
- Session timeline
- Completion tracking and celebrations
- Focus analytics

### ✅ Task Management

- Create, edit, complete, and delete todos
- Priority and status management
- Due dates
- Filtering and sorting
- Task completion tracking
- Dashboard task overview

### 📊 Productivity Analytics

- Daily, weekly, and monthly analytics
- Focus-time visualization
- Pomodoro statistics
- Task completion rates
- Productivity insights
- Activity history
- Streak tracking

### 🎵 Ambient Music

Built-in background audio for distraction-free work.

- Rain, Forest, Ocean, Fireplace and Café ambience
- White noise, Night ambience and Wind
- Volume control
- Loop playback
- Persistent music preferences
- Integration with Pomodoro and Deep Focus


### 🔐 Authentication & Personalization

- JWT authentication
- Rotating HttpOnly refresh tokens
- Persistent login sessions
- Protected routes
- Light and dark themes
- Custom accent colors
- Pomodoro, focus, notification and music preferences

---

## 🛠 Tech Stack

### Frontend

**Next.js 16** • **React** • **TypeScript** • **Tailwind CSS v4** • **shadcn/ui** • **TanStack Query** • **Axios** • **React Hook Form** • **Zod** • **Recharts**

### Backend

**Node.js** • **Express.js** • **TypeScript** • **Prisma ORM** • **JWT**

### Database & Deployment

**PostgreSQL (Neon)** • **Vercel** • **Render**

---

## 📁 Project Structure

The Express backend lives at the repository root, while the Next.js frontend is located inside `frontend/`.

```text
Study_Space/
│
├── src/                         # Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── providers/
│       ├── services/
│       └── types/
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/nilanjanchavan/Study_Space.git
cd Study_Space
```

### 2. Backend Setup

Install dependencies from the repository root:

```bash
npm install
```

Create a `.env` file:

```env
NODE_ENV=development
PORT=4000

DATABASE_URL="your-postgresql-connection-string"

JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_DAYS="30"

AUTH_RATE_WINDOW_MS="900000"
AUTH_RATE_MAX="10"
```

Set up Prisma:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the backend:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:4000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the frontend:

```bash
npm run dev
```

The application runs at:

```text
http://localhost:3000
```

---

## 🌐 Deployment

Study Workspace is deployed using a three-service architecture:

```text
┌──────────────────┐
│      Vercel      │
│ Next.js Frontend │
└────────┬─────────┘
         │ HTTPS
         ▼
┌──────────────────┐
│      Render      │
│   Express API    │
└────────┬─────────┘
         │ Prisma
         ▼
┌──────────────────┐
│       Neon       │
│    PostgreSQL    │
└──────────────────┘
```


> The backend currently uses Render's free tier, so the first request after a period of inactivity may take longer while the service wakes up.

---


## 🔮 Future Improvements

- Study Rooms and shared focus sessions
- Real-time collaboration
- Calendar integration
- Habit tracking
- Expanded achievement system
- More ambient soundscapes
- PWA and offline support
- Mobile application
- Remaining codeforces integration
- Background images in pomodoro sessions

---

## 🤝 Contributing

Contributions, suggestions, and ideas are welcome. Feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
  Built with Next.js, Express, Prisma & PostgreSQL.
</p>
