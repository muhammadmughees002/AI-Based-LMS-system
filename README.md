# AI-LMS — Setup Guide

## Project structure

```
lms-system/
├── main.py              ← FastAPI backend (this file)
├── requirements.txt
├── content_processor.py ← standalone CLI tool (from before)
├── lms.db               ← auto-created SQLite database
├── uploads/             ← auto-created, stores uploaded course files
└── frontend/
    └── App.jsx          ← React frontend
```

---

## 1. Backend setup

```bash
cd lms-system
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be live at http://localhost:8000
Interactive docs: http://localhost:8000/docs

---

## 2. Ollama

Make sure Ollama is running and llama3:8b is pulled:

```bash
ollama serve          # in a separate terminal
ollama pull llama3:8b
```

---

## 3. Frontend setup (React)

Option A — use the App.jsx in claude.ai as a React artifact (already interactive).

Option B — embed in a Vite project:

```bash
npm create vite@latest lms-frontend -- --template react
cd lms-frontend
npm install
# Replace src/App.jsx with the App.jsx file
npm run dev
```

---

## 4. Flow walkthrough

### Teacher
1. Register with role = teacher
2. Log in → Upload Course tab
3. Upload a PPT/PDF, enter title + topic
4. Ollama generates quiz + assignment in the background (check "My Courses" for status = ready)
5. Click "View students" to see who enrolled and their scores
6. Click "Evaluate assignments (AI)" to trigger Ollama grading of all submitted assignments

### Student
1. Register with role = student
2. Log in → Courses tab
3. Click Enroll on any ready course
4. Click Quiz → attempt MCQ online → submit → instant result
5. Click Assignment → write answers → submit
6. Go to My Profile to see full history, scores, and feedback
7. Level is auto-computed: <40% = low, 40-70% = medium, >70% = hard

---

## 5. API summary

| Method | Path | Who |
|--------|------|-----|
| POST | /api/auth/register | public |
| POST | /api/auth/login | public |
| POST | /api/teacher/upload-course | teacher |
| GET  | /api/teacher/courses | teacher |
| GET  | /api/teacher/course/{id}/students | teacher |
| POST | /api/teacher/course/{id}/evaluate-assignments | teacher |
| GET  | /api/student/courses | student |
| POST | /api/student/enroll/{id} | student |
| GET  | /api/student/quiz/{id} | student |
| POST | /api/student/quiz/{id}/submit | student |
| GET  | /api/student/quiz/{id}/result | student |
| GET  | /api/student/assignment/{id} | student |
| POST | /api/student/assignment/{id}/submit | student |
| GET  | /api/student/assignment/{id}/result | student |
| GET  | /api/student/profile | student |

---

## 6. To upgrade to PostgreSQL later

Replace sqlite3 with psycopg2:
```python
import psycopg2
conn = psycopg2.connect("postgresql://user:pass@localhost/lms")
```
The SQL schema is standard and compatible with both.
