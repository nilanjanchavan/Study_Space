# 🎓 Study Workspace

> A modern, full-stack productivity platform designed to help students and professionals stay focused, build consistent study habits, and track their progress.

<p align="center">
  <img src="./public/preview.png" alt="Study Workspace Preview" width="100%">
</p>

## ✨ Features

### 🔐 Authentication
- Secure JWT authentication
- Refresh token authentication using HttpOnly cookies
- Persistent login sessions
- Protected routes
- User profile management

---

### ✅ Todo Management

Organize tasks with a clean productivity workflow.

- Create, edit and delete todos
- Priority levels
- Status tracking
- Due dates
- Progress tracking
- Filtering & sorting
- Responsive task board

---

### 🍅 Pomodoro Timer

A fully-featured customizable Pomodoro workspace.

- Custom work & break durations
- Auto-start work sessions
- Auto-start breaks
- Long break intervals
- Daily Pomodoro goals
- Session history
- Motivational quotes
- Ambient music integration
- Progress ring timer
- Browser notifications
- Sound effects

---

### 🌲 Deep Focus Mode

Inspired by Forest.

A distraction-free workspace designed for long study sessions.

Features include:

- Strict Focus Mode
- Multi-cycle Pomodoro support
- Automatic break handling
- Focus goals
- Live progress tracking
- Session timeline
- Completion celebration
- Music integration
- Focus analytics

---

### 📊 Analytics

Track your productivity over time.

- Daily statistics
- Weekly analytics
- Monthly analytics
- Productivity insights
- Streak tracking
- Focus time visualization
- Completion rates
- Activity history

---

### 🎵 Ambient Music

Stay focused with built-in background sounds.

- Rain
- Forest
- Ocean
- Fireplace
- Café
- White Noise
- Night Ambience
- Wind

Features:

- Volume control
- Loop playback
- Auto play
- Auto pause
- Persistent playback
- Music preferences

---

### ⚙️ Settings

Customize your entire workspace.

- Theme selection
- Accent colors
- Pomodoro settings
- Notification preferences
- Music preferences
- Focus preferences
- Codeforces integration
- Account settings

---

### 🏆 Codeforces Integration

Competitive programming support.

- Link account
- Sync profile
- Display rating
- Track progress
- View contribution

---

### 🎨 Modern UI

Designed with usability first.

- Responsive layout
- Dark / Light mode
- Dynamic accent colors
- Glassmorphism
- Premium dashboard
- Interactive cards
- Animated progress indicators
- Beautiful typography

---

## 🛠 Tech Stack

### Frontend

- Next.js 16
- React
- TypeScript
- TailwindCSS v4
- shadcn/ui
- TanStack Query
- Axios
- React Hook Form
- Zod
- Recharts
- Lucide Icons

---

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- HttpOnly Refresh Tokens

---

### Database

- PostgreSQL

---

## 📁 Project Structure

```
StudyWorkspace/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── providers/
│   ├── services/
│   ├── lib/
│   └── types/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── prisma/
│   │   └── utils/
│   │
│   └── prisma/
│
└── README.md
```

---

## 🚀 Getting Started

### Clone

```bash
git clone https://github.com/yourusername/study-workspace.git
cd study-workspace
```

---

### Backend

```bash
cd backend

npm install

npx prisma migrate dev

npm run dev
```

Runs on

```
http://localhost:4000
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Runs on

```
http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend

```
DATABASE_URL=

JWT_SECRET=

JWT_REFRESH_SECRET=

PORT=4000
```

### Frontend

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 📸 Screenshots

| Dashboard | Pomodoro |
|-----------|-----------|
| Screenshot | Screenshot |

| Focus | Analytics |
|--------|-----------|
| Screenshot | Screenshot |

| Settings | Landing Page |
|----------|--------------|
| Screenshot | Screenshot |

---

## 🧠 Future Improvements

- Study Rooms
- Real-time collaboration
- Shared Pomodoro sessions
- AI Study Assistant
- Calendar integration
- Habit Tracker
- Achievement System
- Mobile application
- Offline support
- PWA support

---

## 📈 Project Status

Current Version

```
v1.0
```

Status

```
Backend        ✅ Complete

Authentication ✅

Todos          ✅

Pomodoro       ✅

Deep Focus     ✅

Analytics      ✅

Music          ✅

Settings       ✅

Responsive UI  ✅

Dashboard      ✅

Landing Page   ✅
```

---

## 🤝 Contributing

Contributions, ideas and suggestions are always welcome.

Feel free to open an Issue or submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Acknowledgements

Inspired by

- Forest
- Notion
- Linear
- Raycast
- Rize
- Sunsama

---

<p align="center">
Built with ❤️ using Next.js, Express, Prisma and PostgreSQL.
</p>
