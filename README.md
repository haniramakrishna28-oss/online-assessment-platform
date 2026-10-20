# 🎓 ExamSphere - Full-Stack Online Examination & Assessment Platform

A production-grade, secure, and modern **Online Examination and Assessment Platform** built with a **React (Vite) frontend**, a **Django REST Framework (DRF) backend**, and a **PostgreSQL** relational database.

---

## 🌟 Key Capabilities & Module Overview

The platform is designed around 9 comprehensive modules built and verified sequentially:

1. **Module 1: Project Setup & PostgreSQL Database Design**
   - Clean, decoupled folder structure (`backend/`, `frontend/`).
   - Relational PostgreSQL schema with Django ORM models: `User`, `Question`, `Option`, `Exam`, `ExamAttempt`, `StudentAnswer`, `ExamResult`.
   - Foreign key integrity, unique constraints, and atomic transactions.
2. **Module 2: Authentication & Role-Based Access Control (RBAC)**
   - Custom JWT authentication using `djangorestframework-simplejwt`.
   - Distinct roles: **Admin / Instructor** and **Student**.
   - Dual-layer protection: Django backend permission classes (`IsAdminUserRole`, `IsStudentUserRole`) + React frontend route guards (`ProtectedRoute`).
3. **Module 3: Question Bank Management**
   - Admin CRUD operations for questions supporting **Multiple Choice (MCQ)** and **True/False (TF)**.
   - Comprehensive validation (minimum 2 options, exactly 1 correct answer).
   - Real-time search by keyword, subject filtering, and difficulty breakdowns.
4. **Module 4: Exam Creation & Configuration**
   - Configurable exam duration (minutes), passing marks, total marks, scheduled start/end windows, and maximum allowed attempts.
   - Question assignment from question bank with automated total mark computation.
   - Draft vs. Published states with one-click publish/unpublish.
5. **Module 5: Examination Interface & Persistent Countdown Timer**
   - Student test environment with randomized question order per attempt.
   - Persistent countdown timer synchronized with server remaining time, resilient across browser refreshes.
   - Question palette with responsive status indicators: Answered (green), Flagged (amber), Current (indigo), Unanswered (neutral).
6. **Module 6: Answer Autosave & Submission**
   - Real-time autosave to PostgreSQL upon each option selection.
   - Full state restoration: re-entering an active attempt restores all chosen options and time remaining.
   - Server-enforced time expiration: automatic submission and evaluation when the clock runs out.
   - Duplicate submission prevention and manual submission confirmation modal.
7. **Module 7: Automatic Evaluation & Results**
   - Server-side scoring, percentage computation, and pass/fail determination.
   - Student scorecard: high-contrast performance banner, metrics summary, and complete question-by-question review with correct options highlighted.
   - Admin Results & Analytics: table of all candidate submissions, search/filter controls, pass rate metrics, and candidate inspection modal.
8. **Module 8: Security & Automated Testing**
   - Anti-leak security: `is_correct` and answer identifiers are strictly excluded from exam-taking payloads.
   - 7 automated tests passing with 100% success (`python backend/manage.py test core.tests`).
9. **Module 9: Full Integration & Demonstration**
   - 1-click Demo logins for Admin and Student.
   - Automated data seeding command (`python backend/manage.py seed_data`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router 7, Axios, Lucide React, Modern CSS & Glassmorphism |
| **Backend** | Python 3.12, Django 6.1, Django REST Framework, SimpleJWT, Django CORS Headers |
| **Database** | PostgreSQL 18.4 (Port 5432, Database: `online_exam_db`) |
| **Security** | JWT Tokens (HMAC-SHA256), Password hashing (PBKDF2-SHA256), Role-based authorization |

---

## 📂 Project Architecture & Directory Structure

```
online examination platform/
├── backend/
│   ├── config/               # Django root configuration
│   │   ├── settings.py       # PostgreSQL DB, SimpleJWT, CORS, Installed Apps
│   │   ├── urls.py           # Top-level API router mounting
│   │   └── wsgi.py
│   ├── core/                 # Examination core application
│   │   ├── models.py         # User, Question, Option, Exam, Attempt, Answer, Result
│   │   ├── serializers.py    # Serializers with sanitization (Student vs Admin)
│   │   ├── views.py          # ViewSets & server-side evaluation engine
│   │   ├── permissions.py    # RBAC permission classes
│   │   ├── urls.py           # Router endpoints
│   │   ├── tests.py          # Automated test suite (7 tests)
│   │   └── management/
│   │       └── commands/
│   │           └── seed_data.py # Sample database seeding script
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Role-aware top navigation
│   │   │   └── ProtectedRoute.jsx    # React Router RBAC guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global JWT state and token refresh
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx         # Login with 1-click Demo credentials
│   │   │   ├── RegisterPage.jsx      # Role-based candidate registration
│   │   │   ├── AdminDashboard.jsx    # Admin metrics and navigation hub
│   │   │   ├── QuestionBankPage.jsx  # Question CRUD, MCQ/TF options modal
│   │   │   ├── ExamManagementPage.jsx# Exam creator, schedule & publish
│   │   │   ├── AvailableExamsPage.jsx# Student exam browser
│   │   │   ├── ExamTakingPage.jsx    # Timed exam taking & autosave
│   │   │   ├── ExamResultPage.jsx    # Student evaluation & question review
│   │   │   └── AdminResultsPage.jsx  # Instructor analytics & candidate audit
│   │   ├── api.js                    # Axios instance with JWT interceptor
│   │   ├── App.jsx                   # Central route registry
│   │   ├── index.css                 # Global theme & glassmorphic styling
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── pgdata/                   # PostgreSQL local cluster database files
├── start_postgres.bat        # Script to start PostgreSQL server
├── start_servers.bat         # Script to launch PostgreSQL, Django & Vite
└── README.md
```

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Python 3.10+** (or Conda environment)
- **Node.js 18+** & `npm`
- **PostgreSQL** running on port `5432` with database `online_exam_db`

### 2. Database & Helper Scripts
To start PostgreSQL in the workspace:
```cmd
start_postgres.bat
```
*(Runs `postgres.exe -D pgdata` on port 5432).*

### 3. Backend Setup
1. Navigate to the backend directory:
   ```cmd
   cd backend
   ```
2. Apply database migrations:
   ```cmd
   python manage.py migrate
   ```
3. Seed sample data (users, questions, and published exams):
   ```cmd
   python manage.py seed_data
   ```
4. Start Django development server:
   ```cmd
   python manage.py runserver 0.0.0.0:8000
   ```

### 4. Frontend Setup
1. Navigate to the frontend directory:
   ```cmd
   cd frontend
   ```
2. Install dependencies:
   ```cmd
   npm install
   ```
3. Start the Vite development server:
   ```cmd
   npm run dev
   ```
4. Access the platform in your browser at `http://localhost:5173`.

---

## 🔑 Demo Accounts & Credentials

The platform includes pre-configured credentials for testing both roles:

| Role | Username | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `adminpassword123` | Full Question Bank CRUD, Exam publishing, System analytics & student audit |
| **Student** | `student` | `studentpassword123` | View published exams, take timed assessments, autosave answers, view scorecards |

*Tip: The Login page includes instant **"Demo Admin"** and **"Demo Student"** buttons for 1-click login.*

---

## 📡 REST API Reference

### Authentication & Profile
- `POST /api/auth/register/` - Register a new user (`STUDENT` or `ADMIN`).
- `POST /api/auth/login/` - Obtain JWT access & refresh tokens with user payload.
- `POST /api/auth/refresh/` - Refresh expired access token.
- `GET  /api/auth/me/` - Retrieve authenticated user profile.
- `GET  /api/auth/admin-check/` - Verify administrator permissions (403 for students).
- `GET  /api/auth/student-check/` - Verify student permissions.

### Question Bank (Admin Only)
- `GET    /api/questions/` - List questions (supports `?search=`, `?subject=`, `?difficulty=`).
- `POST   /api/questions/` - Create a question with nested options.
- `GET    /api/questions/{id}/` - Retrieve question details.
- `PUT    /api/questions/{id}/` - Update question and options.
- `DELETE /api/questions/{id}/` - Delete question.
- `GET    /api/questions/stats/` - Statistical summary of question types and difficulty.
- `GET    /api/questions/subjects/` - List distinct subjects.

### Exam Management
- `GET    /api/exams/` - List exams (Students see published only; Admins see all).
- `POST   /api/exams/` - Create exam with assigned questions (Admin).
- `GET    /api/exams/{id}/` - Retrieve exam details.
- `POST   /api/exams/{id}/publish/` - Publish exam for students (Admin).
- `POST   /api/exams/{id}/unpublish/` - Revert exam to draft (Admin).
- `GET    /api/exams/available/` - List all currently open published exams (Student).
- `POST   /api/exams/{id}/start/` - Start or resume an exam attempt (Student).

### Exam Attempts & Autosave
- `POST   /api/attempts/{id}/autosave/` - Autosave answer to PostgreSQL `{ question_id, selected_option_id }`.
- `GET    /api/attempts/{id}/status/` - Heartbeat status check (remaining seconds, saved answers).
- `POST   /api/attempts/{id}/submit/` - Finish and submit exam for automated evaluation.

### Results & Evaluation
- `GET    /api/results/` - List results (Students see own; Admins see all).
- `GET    /api/results/{id}/` - Detailed evaluation with scorecard and answers review.
- `GET    /api/results/my_results/` - All past results for authenticated student.
- `GET    /api/results/all_results/` - All submissions across exams with analytics (Admin).

---

## 🧪 Automated Testing & Verification

The platform includes an automated Django test suite in `backend/core/tests.py`:

```cmd
python backend/manage.py test core.tests
```

**Verification Results:**
- `test_01_role_based_access_control`: PASSED (403 forbidden enforced for students on admin endpoints).
- `test_02_student_available_exams`: PASSED (draft exams excluded from student view).
- `test_03_security_correct_answers_never_leaked`: PASSED (`is_correct` excluded from test payloads).
- `test_04_autosave_answer_and_state_restoration`: PASSED (persisted in PostgreSQL & restored on resume).
- `test_05_server_side_evaluation_and_scoring`: PASSED (score, percentage, and pass/fail marked accurately).
- `test_06_duplicate_submission_prevention`: PASSED (idempotent submission handling).
- `test_07_timer_expiry_handling`: PASSED (server enforces time limits and auto-submits expired attempts).

**7 tests ran in 39.2s — 100% OK.**

---

## 🛡️ Security Architecture

1. **Answer Masking Before Submission**: `StudentOptionSerializer` explicitly excludes `is_correct`. Candidates cannot inspect browser network responses to find correct answers during the exam.
2. **Server-Enforced Timing**: Attempt duration is calculated using PostgreSQL `start_time` and current server time (`timezone.now()`), preventing client clock tampering.
3. **Atomic Evaluation**: Exam evaluation executes inside `transaction.atomic()`, ensuring score calculation, answer marking, and result recording are consistent.
4. **Idempotent Submission**: Attempts can only transition from `IN_PROGRESS` to `SUBMITTED` or `EXPIRED` once; subsequent calls return the existing evaluation result.
