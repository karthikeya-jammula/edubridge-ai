# EduBridge AI – Inclusive Adaptive Learning Ecosystem

A production-grade, full-stack AI-powered education platform built with Next.js 15, TypeScript, Prisma, and OpenAI.

---

## Features

| Module | Description |
|---|---|
| **AI Explainer** | Topic explanations in multiple difficulty levels with multilingual support |
| **Smart Quizzes** | AI-generated quizzes with adaptive difficulty |
| **Virtual Lab** | Interactive physics/chemistry experiments (Canvas-based) |
| **Career Mapping** | AI-powered career guidance with 6-month roadmaps |
| **Study Plans** | Personalized study schedules based on weak topics |
| **Text-to-Speech** | Audio narration via Web Speech API + OpenAI TTS |
| **Speech-to-Text** | Voice input using OpenAI Whisper |
| **Translation** | 20+ language support |
| **Accessibility** | High contrast, dyslexia font, font scaling, screen reader mode |
| **Teacher Dashboard** | Student analytics, at-risk detection, quiz creation |
| **Admin Panel** | User management, module configuration, system metrics |

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, TailwindCSS, ShadCN-style UI
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **AI:** OpenAI GPT-4o-mini, Whisper
- **Auth:** JWT + bcryptjs (role-based: Student, Teacher, Admin)
- **Deployment:** Docker + Docker Compose

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or Docker)
- OpenAI API key

### 1. Clone & Install

```bash
git clone <repo-url>
cd AllAIishere
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Setup Database

```bash
npx prisma migrate dev --name init
npx prisma generate
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
