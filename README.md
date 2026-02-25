# EduBridge AI – Adaptive Learning Platform 🎓

> **48-Hour Hackathon MVP** – AI-powered education with OpenAI integration

---

## ⚡ Quick Start (2 minutes)

```bash
# 1. Install & Setup
npm run setup

# 2. Start development server  
npm run dev
```

**That's it!** Open http://localhost:3000

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Student | student@demo.com | demo123 |
| Teacher | teacher@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |

---

## 🚀 Key Features

| Feature | Innovation |
|---------|------------|
| **AI Explainer** | GPT-4o explanations at any difficulty level |
| **Smart Quizzes** | AI-generated adaptive assessments |
| **Virtual Lab** | Interactive physics/chemistry simulations |
| **Career Mapping** | Personalized career roadmaps |
| **Voice I/O** | Speech-to-text & text-to-speech |
| **20+ Languages** | Real-time translation |
| **Accessibility** | Dyslexia fonts, high contrast, screen reader |

## 🛠️ Tech Stack

- **Next.js 16** + TypeScript + TailwindCSS
- **Prisma** + SQLite (zero config!)
- **OpenAI** GPT-4o-mini & Whisper
- **JWT Auth** with role-based access

## 📁 Project Structure

```
src/
├── app/           # Pages & API routes
├── components/    # UI components
├── services/ai/   # OpenAI integrations
├── context/       # Auth & accessibility
└── lib/           # Utils & helpers
```

## 🔧 Environment Variables

```env
# Required for AI features (works in demo mode without)
OPENAI_API_KEY=sk-...

# Optional
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret
```

## 📝 Scripts

```bash
npm run dev       # Start dev server (Turbopack)
npm run setup     # Full setup (install + db + seed)
npm run db:reset  # Reset database with demo data
npm run build     # Production build
```

## 🐳 Docker (Optional)

```bash
docker-compose up --build
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Docker Deployment

```bash
# Set your OpenAI key
export OPENAI_API_KEY=sk-...

# Start everything
docker compose up -d

# Run migrations
docker compose exec app npx prisma migrate deploy
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   │   ├── auth/           # Register, login, me
│   │   ├── ai/             # Explain, translate, quiz, TTS, STT
│   │   ├── student/        # Dashboard, quiz, study-plan, lab, career
│   │   ├── teacher/        # Teacher dashboard
│   │   └── admin/          # User management
│   ├── login/              # Login page
│   ├── dashboard/          # Student dashboard
│   ├── explain/            # AI explainer
│   ├── quiz/               # Quiz taking
│   ├── lab/                # Virtual lab
│   ├── career/             # Career mapping
│   ├── teacher/            # Teacher dashboard
│   └── admin/              # Admin panel
├── components/
│   ├── ui/                 # ShadCN-style components
│   └── layout/             # Navbar, layout components
├── context/                # Auth & accessibility providers
├── hooks/                  # Custom hooks (useApi)
├── lib/                    # Core utilities (auth, prisma, validation)
└── services/
    ├── ai/                 # OpenAI services (explain, translate, quiz, TTS, STT, career, study-plan)
    └── personalization/    # Adaptive difficulty, weak topic detection, risk scoring
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✓ | Current user profile |
| POST | `/api/ai/explain` | ✓ | AI topic explanation |
| POST | `/api/ai/translate` | ✓ | AI translation |
| POST | `/api/ai/generate-quiz` | ✓ | Generate AI quiz |
| POST | `/api/ai/text-to-speech` | ✓ | Text-to-speech |
| POST | `/api/ai/speech-to-text` | ✓ | Speech-to-text |
| GET | `/api/student/dashboard` | Student | Student dashboard data |
| GET/POST | `/api/student/quiz` | Student | List/submit quizzes |
| GET/POST | `/api/student/study-plan` | Student | Get/generate study plan |
| POST | `/api/student/lab` | Student | Save lab session |
| POST | `/api/student/career` | Student | Generate career roadmap |
| GET | `/api/teacher/dashboard` | Teacher | Teacher analytics |
| GET/PATCH | `/api/admin/users` | Admin | User management |

## License

MIT
