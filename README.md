# meRESUmax

> **"Your Resume. Your Potential. Your Next Move."**  
> *Hero headline: "Your next opportunity starts with clarity."*

**meRESUmax** is an AI Resume Analyzer, Career Intelligence, and Job Recommendation Platform designed with an Apple-inspired **iOS Liquid Glass** user interface, explainable heuristic scoring, document parsing, career roadmaps, and external job discovery.

---

## 🌟 Key Capabilities

1. **iOS Liquid Glass User Experience**
   - Signature midnight palette (`#070912`, `#0B1020`, `#11182A`) with atmospheric lighting orbs, fine luminous borders, inset reflections, and fluid micro-interactions.
   - Translucent floating capsule navigation, responsive drawer menus, and dynamic score dials.

2. **Transparent Resume Quality Scoring (0 - 100)**
   - **Structure & Completeness (20%)**: Section integrity across Summary, Education, Experience, Projects, and Skills.
   - **Relevant Skills Depth (25%)**: Cross-referenced against a verified taxonomy of 100+ technical skills.
   - **Projects & Practical Experience (25%)**: Proactive action verb evaluation and capstone depth.
   - **Clarity & Formatting (15%)**: Optimal word count scanability.
   - **Measurable Impact (15%)**: Numerical metrics, percentage gains, and quantifiable achievements.

3. **Deterministic Role Archetype & Job Matching**
   - Benchmark resumes against Software Developer, Frontend, Backend, Python Developer, AI/ML Engineer, Data Analyst, Data Scientist, Cloud, and Cybersecurity archetypes.
   - Paste custom job descriptions for instant skill-gap extraction.

4. **AI Career Intelligence & STAR Enhancements**
   - Executive synthesis, role-tailored summary rewrites, and STAR project bullet enhancements.
   - Technical interview preparation questions with strategic talking points.
   - Deterministic high-grade fallback engine when live OpenAI API keys are not supplied.

5. **Personalized Career Roadmap**
   - Generates progressive learning milestones from verified skill gaps.
   - Interactive timeline with priority badges, status toggles, and database persistence.

6. **Job Discovery & Bookmarking**
   - Adzuna API integration for live postings.
   - Transparent labeling distinguishing live listings from curated demonstrations.
   - Direct outbound application links and favorite bookmarks.

7. **Executive A4 PDF Report Generation**
   - Download branded executive summary reports built with ReportLab, featuring score dials, breakdown tables, and roadmap steps.

8. **Security & Data Privacy**
   - Private document uploads with cryptographic UUID names.
   - Salted password hashing (PBKDF2 / SHA-256).
   - Zero third-party ad tracking, user account deletion, and strict data confidentiality.

9. **Interactive AI Mock Interview Simulator**
   - Role-tailored 5-question interview loops spanning Technical Depth, Architecture, STAR Behavioral scenarios, and Debugging.
   - Live browser Web Speech API voice dictation and real-time STAR method evaluation with senior exemplar answers.
   - Comprehensive debrief scorecard with readiness indices and transcript download.

10. **AI Cover Letter & LinkedIn Optimizer**
    - High-converting, ATS-optimized cover letter synthesis matching target company and job descriptions.
    - SEO-ranked LinkedIn headlines and storytelling 1st-person "About" bio copy with core competency keywords.

11. **Live ATS Resume Architect & Multi-Format Exporter**
    - Live dual-pane editor with real-time ATS scan health scoring.
    - 3 recruiter-approved ATS templates (Modern, Minimalist, Executive).
    - Instant export to print-ready PDF, clean plaintext (.txt), and structured JSON.

12. **Interactive Job Application Tracker (Kanban Pipeline)**
    - Visual multi-stage Kanban pipeline (Wishlist & Saved, Applied, Interviewing, Offer Received, Archived).
    - Pipeline conversion analytics, interview countdowns, and upcoming milestone badges.
    - 1-click stage progression, client-side CSV / JSON export, and direct integration with AI Mock Interview loops.
    - 1-click "Track Pipeline" button on all job opportunities.

13. **Floating AI Career Assistant**
    - Omnipresent Liquid Glass floating chat interface available across authenticated routes.
    - Context-aware recruiter AI answering resume improvements, score explanations, mock questions, and job matching.
    - Dual mode: live Gemini/OpenAI integration when configured, with high-fidelity deterministic heuristic advice in demo mode.

---

## 🏗 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion
- **Backend**: Python 3.13, Flask 3, Flask-SQLAlchemy, Werkzeug, PyPDF, python-docx, ReportLab, OpenAI SDK, Requests
- **Database**: SQLite (local development) / MySQL compatible via SQLAlchemy

---

## 🚀 Running meRESUmax Locally

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your keys (optional):
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
ADZUNA_COUNTRY=in
```
*(If no API keys are provided, meRESUmax automatically activates its explainable heuristic scoring and curated demo job engine.)*

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```
Backend will start on `http://127.0.0.1:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Frontend will start on `http://127.0.0.1:5173`.

---

## ☁️ Deploying to Render

You can deploy meRESUmax on Render using either the included `render.yaml` Blueprint or manual service creation:

### Option A: Automatic Blueprint (Recommended)
1. In your [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
2. Connect your GitHub repository: `https://github.com/prithvirajranaware130307-debug/meRESUmax`.
3. Render will automatically detect `render.yaml` and configure both the backend web service and the frontend static site with the correct build and start commands!

### Option B: Manual Configuration

#### 1. Backend Service (Web Service)
- **Environment**: Python
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn --bind 0.0.0.0:$PORT run:app`
- **Health Check Path**: `/api/health`
- **Environment Variables**:
  - `FLASK_ENV`: `production`
  - `SECRET_KEY`: *(Generate a secure random string)*
  - `CORS_ORIGINS`: `*` *(or your frontend Render URL)*
  - `GEMINI_API_KEY`: *(Optional: Google Gemini API key)*
  - `GEMINI_MODEL`: `gemini-2.5-flash`
  - `DATABASE_URL`: *(Optional Render PostgreSQL instance, or defaults to local SQLite)*

#### 2. Frontend Service (Static Site)
- **Root Directory**: `frontend`
- **Build Command**: `npm ci && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://<your-backend-service-name>.onrender.com`
- **Redirects / Rewrites**:
  - **Type**: `Rewrite`
  - **Source**: `/*`
  - **Destination**: `/index.html` *(ensures React client-side routing works on page refreshes)*

---

## 🧪 Automated Test Suite

Run the full pytest test suite:
```bash
cd backend
python -m pytest -v
```

### Verified Test Results
- `tests/test_auth.py`: Registration, JWT session token generation, invalid credentials handling.
- `tests/test_parser_scoring.py`: Section parsing, skills taxonomy extraction, heuristic quality scoring, job matching.
- `tests/test_report.py`: ReportLab A4 PDF document formatting and download verification.
- `tests/test_e2e_flow.py`: Complete user lifecycle (registration -> PDF upload -> analysis -> roadmap toggling -> job search -> PDF report generation -> profile updates).

---

## 📁 Project Architecture

```
meRESUmax/
├── backend/
│   ├── app/
│   │   ├── models/           # SQLAlchemy models: User, Resume, Analysis, Job, RoadmapTask
│   │   ├── routes/           # Blueprints: auth, resume, analysis, jobs, roadmap, profile, health
│   │   ├── services/         # parser.py, scorer.py, matcher.py, openai_service.py, job_service.py, report_generator.py
│   │   ├── utils/            # auth_helper.py (HMAC token security)
│   │   ├── config.py         # App configuration & environment loader
│   │   └── __init__.py       # App factory & DB initialization
│   ├── tests/                # Automated pytest test suites
│   ├── uploads/              # Isolated document storage
│   ├── reports/              # Generated executive PDF reports
│   ├── requirements.txt      # Python dependencies
│   └── run.py                # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── glass/        # GlassCard, GlassButton, ScoreDial, Logo
│   │   │   └── layout/       # Navbar, Footer, BackgroundAtmosphere
│   │   ├── pages/            # LandingPage, LoginPage, RegisterPage, DashboardPage, AnalyzePage, ResultsPage, JobsPage, RoadmapPage, ProfilePage, HistoryPage, SettingsPage
│   │   ├── context/          # AuthContext
│   │   ├── services/         # api.ts
│   │   ├── types/            # TypeScript interfaces
│   │   ├── styles/           # index.css (Liquid Glass tokens)
│   │   ├── App.tsx           # Router & protected route guards
│   │   └── main.tsx          # Application mount
│   ├── package.json
│   ├── vite.config.ts        # Vite proxy to Flask backend
│   └── tailwind.config.js    # Custom Liquid Glass color tokens & animations
├── .env.example
├── .gitignore
└── README.md
```
