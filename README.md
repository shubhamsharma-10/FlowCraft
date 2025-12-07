# FlowCraft 🚀

> An AI-powered app generator that creates full React + Vite applications from natural language prompts. Similar to Lovable/Bolt, this platform allows you to describe an app idea and watch it come to life in real-time.

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Express](https://img.shields.io/badge/Express-5.1-green)
![Prisma](https://img.shields.io/badge/Prisma-7.1-purple)
![BullMQ](https://img.shields.io/badge/BullMQ-5.65-red)

## ✨ Features

- **🤖 AI-Powered Code Generation** - Describe your app in plain English and get a working React application
- **⚡ Real-time Preview** - Watch your app run live in an E2B sandbox with hot-reload
- **📁 Project Management** - Save, load, and manage multiple projects per user
- **🔐 Authentication** - Secure JWT-based user authentication
- **📊 Live Status Updates** - Real-time generation progress via Redis pub/sub
- **🔄 Async Processing** - Background job processing with BullMQ for scalability

---

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│   Client App    │────▶│   Express API    │────▶│   BullMQ Queue    │
│                 │     │   (Port 3000)    │     │   (Redis-backed)  │
└─────────────────┘     └──────────────────┘     └───────────────────┘
                               │                          │
                               ▼                          ▼
                        ┌──────────────┐         ┌──────────────────┐
                        │  PostgreSQL  │         │  Worker Process  │
                        │   (Prisma)   │         │  (AI Pipeline)   │
                        └──────────────┘         └──────────────────┘
                                                          │
                                    ┌─────────────────────┼─────────────────────┐
                                    ▼                     ▼                     ▼
                              ┌──────────┐         ┌─────────────┐       ┌──────────┐
                              │ Planner  │────────▶│ Normalizer  │──────▶│ CodeGen  │
                              │  Agent   │         │    Agent    │       │  Agent   │
                              └──────────┘         └─────────────┘       └──────────┘
                                                          │
                                                          ▼
                                                   ┌──────────────┐
                                                   │ E2B Sandbox  │
                                                   │  (Preview)   │
                                                   └──────────────┘
```

---

## 🧠 AI Pipeline

The code generation process uses a **three-stage agentic pipeline** powered by **Groq LLM**:

| Stage | Agent | Description |
|-------|-------|-------------|
| 1️⃣ | **Planner Agent** | Analyzes the user prompt and creates a high-level project structure and feature list |
| 2️⃣ | **Normalizer Agent** | Converts the plan into a standardized format with file paths and component descriptions |
| 3️⃣ | **CodeGen Agent** | Generates actual React + Vite + Tailwind CSS code for each file |

---

## 📂 Project Structure

```
lovable/
├── prisma/
│   ├── schema.prisma          # Database models (User, Project, ProjectFile)
│   └── migrations/            # Database migrations
├── src/
│   ├── ai/
│   │   ├── agents/
│   │   │   ├── planner.agent.ts      # Planning agent (Groq)
│   │   │   ├── normaliser.agent.ts   # Normalizer agent
│   │   │   └── codgen.agent.ts       # Code generation agent
│   │   ├── prompt/
│   │   │   ├── planner.prompt.ts     # System prompt for planner
│   │   │   ├── normaliser.prompt.ts  # System prompt for normalizer
│   │   │   └── codegen.prompt.ts     # System prompt for codegen
│   │   ├── template/                 # Template files
│   │   └── orchesterator.ts          # Pipeline orchestration
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts    # Register/Login logic
│   │   │   └── generate.controller.ts # Project generation logic
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts    # JWT verification
│   │   ├── routes/
│   │   │   ├── auth.route.ts         # /api/auth/* routes
│   │   │   └── generate.route.ts     # /api/project/* routes
│   │   └── index.ts                  # Express app entry
│   ├── services/
│   │   ├── e2b.ts                    # E2B sandbox management
│   │   ├── redis.ts                  # Redis connection singleton
│   │   ├── prisma.ts                 # Prisma client & helpers
│   │   └── baseTemplate.ts           # React/Vite base project template
│   ├── worker/
│   │   ├── generate.worker.ts        # BullMQ worker for generation
│   │   └── run.worker.ts             # Sandbox execution helper
│   └── utils/
│       ├── config.ts                 # Environment configuration
│       └── constant.ts               # App constants
├── .env.example                      # Environment template
├── package.json                      # Dependencies & scripts
└── tsconfig.json                     # TypeScript configuration
```

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Runtime** | Node.js + TypeScript | Type-safe backend development |
| **API** | Express 5 | REST API framework |
| **Database** | PostgreSQL + Prisma | Data persistence & ORM |
| **Queue** | BullMQ + Redis | Async job processing |
| **Cache/Pub-Sub** | Redis (ioredis) | Session storage & real-time status |
| **AI** | Groq SDK | LLM inference for code generation |
| **Sandbox** | E2B Code Interpreter | Secure code execution & preview |
| **Auth** | JWT + bcrypt | Secure authentication |

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/signin` | Login and receive JWT token |

### Projects (Protected - requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/project/generate` | Start AI generation from prompt |
| POST | `/api/project/start-project` | Launch sandbox for session |
| POST | `/api/project/save-project` | Persist project to database |
| GET | `/api/project/getProjectbyId/:id` | Load & run saved project |
| GET | `/api/project/getAllProjects` | List all user projects |
| GET | `/api/project/job-status` | Check generation job status |

---

## 📦 Database Schema

```prisma
model user {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  password  String
  projects  project[]
}

model project {
  id            String         @id @default(cuid())
  user_id       String
  name          String
  created_at    DateTime       @default(now())
  updated_at    DateTime       @updatedAt
  project_files project_file[]
  user          user           @relation(...)
}

model project_file {
  id            String   @id @default(cuid())
  project_id    String
  file_path     String
  file_content  String
  updated_at    DateTime @updatedAt
  project       project  @relation(...)
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis server
- API keys for:
  - **Groq** (LLM inference)
  - **E2B** (sandbox execution)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd lovable
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   GROQ_API_KEY=<your-groq-api-key>
   OPENROUTER_API_KEY=<your-openrouter-api-key>
   DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
   E2B_API_KEY=<your-e2b-api-key>
   JWT_SECRET_KEY=<your-jwt-secret>
   ```

4. **Setup database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Build TypeScript**
   ```bash
   npm run watch    # Development (watch mode)
   # OR
   npx tsc          # One-time build
   ```

### Running the Application

You need to run **two processes**:

```bash
# Terminal 1: API Server
npm run dev:api

# Terminal 2: Worker Process
npm run dev:worker
```

The API server will start on `http://localhost:3000`

---

## 📝 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `prisma:migrate` | `npx prisma migrate dev` | Run database migrations |
| `prisma:generate` | `npx prisma generate` | Generate Prisma client |
| `watch` | `npx tsc --watch` | Compile TypeScript in watch mode |
| `dev:api` | `node ./dist/src/index.js` | Start API server |
| `dev:worker` | `node ./dist/src/worker/generate.worker.js` | Start BullMQ worker |

---

## 🔄 How It Works

1. **User sends a prompt** → `POST /api/project/generate`
2. **API queues a job** → BullMQ adds job to Redis queue
3. **Worker picks up job** → Runs through AI pipeline:
   - Planner → Creates project structure
   - Normalizer → Standardizes format
   - CodeGen → Generates actual code
4. **Code stored in Redis** → Temporary session storage
5. **E2B Sandbox launched** → Runs the generated React app
6. **Live preview URL returned** → User can interact with the app
7. **User can save** → Persists project to PostgreSQL

---

## 🎯 Generated App Stack

Apps created by this system use:
- ⚛️ **React 18** - UI library
- ⚡ **Vite 5** - Build tool with HMR
- 🎨 **Tailwind CSS 3** - Utility-first styling
- 🔀 **React Router 6** - Client-side routing
- 📦 **TypeScript** - Type safety

---

## 📄 License

ISC

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
