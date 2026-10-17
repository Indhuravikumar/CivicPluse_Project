# CivicPulse AI 🏙️
### AI-Powered Civic Intelligence & Resolution Platform
> Smart India Hackathon 2024 — GovTech / Smart City Track

---

## 🚀 Quick Start (Local Dev — Recommended)

### Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB (local or Atlas)
- npm / pip

---

### 1. AI Service (FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
# Runs at http://localhost:8000
# Swagger docs: http://localhost:8000/docs
```

### 2. Backend (Node.js + Express)
```bash
cd backend
npm install
cp .env.example .env   # edit MONGODB_URI if needed
npm run dev
# Runs at http://localhost:5000

# Seed demo data (in a new terminal):
npm run seed
```

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

Open http://localhost:5173

---

## 🐳 Docker (All-in-one)

```bash
cd civicpulse
docker compose up --build

# Seed data after containers start:
docker exec civicpulse_backend npm run seed
```

| Service     | URL                       |
|-------------|---------------------------|
| Frontend    | http://localhost:3000      |
| Backend API | http://localhost:5000      |
| AI Service  | http://localhost:8000/docs |
| MongoDB     | mongodb://localhost:27017  |

---

## 🔑 Demo Credentials

| Role    | Email                            | Password     |
|---------|----------------------------------|--------------|
| Admin   | admin@civicpulse.gov             | Admin@123    |
| Officer | officer.roads@civicpulse.gov     | Officer@123  |
| Citizen | citizen1@gmail.com               | Citizen@123  |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Auth | JWT-based login/register with role-based access (Citizen / Officer / Admin) |
| 🤖 AI Analysis | Auto-categorize, severity scoring, department routing via FastAPI AI service |
| 🗺️ Live Map | Leaflet + OpenStreetMap heatmap of all civic issues |
| 📊 Dashboard | Animated KPI cards, trend charts, category pie charts |
| 📈 Analytics | 30-day trends, dept performance radar, severity distribution |
| 🔁 Timeline | Full audit trail for every issue status change |
| 🔔 Notifications | Real-time per-user notification system |
| 🧹 Duplicate Detection | AI similarity check to merge redundant reports |
| ✅ Resolution Verification | AI before/after comparison for quality assurance |
| 🌐 Multilingual | English, Tamil, Hindi auto-detection |
| 🌙 Dark Mode | Full dark/light theme toggle |
| 📱 Responsive | Mobile-first UI with sidebar navigation |

---

## 🏗️ Architecture

```
civicpulse/
├── frontend/          React 18 + Vite + TypeScript + Tailwind + Shadcn
│   ├── src/pages/     All page components
│   ├── src/components/UI + layout components
│   ├── src/hooks/     React Query data hooks
│   ├── src/store/     Zustand auth store
│   └── src/lib/       API client + utils
│
├── backend/           Node.js + Express + TypeScript
│   ├── src/models/    Mongoose schemas (User, Issue, Dept, Notification, AuditLog)
│   ├── src/routes/    REST API routes
│   ├── src/controllers/Business logic
│   ├── src/middleware/ Auth, upload, error handling
│   └── src/scripts/   Database seed
│
├── ai-service/        Python FastAPI
│   └── main.py        Mock AI endpoints (ready for real ML model)
│
└── docker-compose.yml Orchestrates all 4 services
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register citizen |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/profile` | Update profile |

### Issues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/issues` | List issues (paginated, filtered) |
| POST | `/api/issues` | Create issue with image upload |
| GET | `/api/issues/:id` | Get issue detail |
| PATCH | `/api/issues/:id/status` | Update status (officer/admin) |
| POST | `/api/issues/:id/upvote` | Upvote/downvote |
| POST | `/api/issues/:id/verify` | AI resolution verification |
| DELETE | `/api/issues/:id` | Delete issue |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | KPI stats |
| GET | `/api/analytics/trends` | Time-series trends |
| GET | `/api/analytics/categories` | Category breakdown |
| GET | `/api/analytics/departments` | Dept performance |
| GET | `/api/analytics/heatmap` | Map data points |

### AI Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze-text` | Text analysis |
| POST | `/api/ai/analyze-image` | Image classification |
| POST | `/api/ai/check-duplicate` | Duplicate detection |
| POST | `/api/ai/calculate-priority` | Priority scoring |
| POST | `/api/ai/verify-resolution` | Resolution verification |
| GET | `/api/ai/insights` | Predictive insights |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, Leaflet |
| State | Zustand + TanStack Query (React Query v5) |
| Backend | Node.js, Express.js, TypeScript, JWT, Multer |
| Database | MongoDB 7 + Mongoose |
| AI Service | Python 3.11, FastAPI, Pydantic (mock mode, ready for YOLO) |
| DevOps | Docker, Docker Compose, Nginx |

---

## 📝 License
MIT — Smart India Hackathon 2024
