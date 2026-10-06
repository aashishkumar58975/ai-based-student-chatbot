# STUDS-HELP AI

A simple AI academic assistant. Students type a question, the React frontend sends it to a Python (FastAPI) backend, the backend asks an AI API, and the answer appears in the chat.

## Features
- Ask any academic question and get an AI answer
- New Chat, Chat History (saved in the browser with localStorage), delete a chat
- About Me page
- Charcoal dark theme, responsive (sidebar becomes a menu on mobile)
- No login, no database, no payments

## Technology Used
- Frontend: React, TypeScript, Vite, HTML, CSS
- Backend: Python, FastAPI, Pydantic, python-dotenv
- AI: Anthropic Claude API, isolated in one function (`ask_ai()` in `backend/main.py`) so it is easy to replace

## Project Structure
```
STUDS-HELP-AI/
├── frontend/
│   ├── src/ (components/, services/api.ts, App.tsx, main.tsx, styles.css, types.ts)
│   ├── .env.example
│   └── index.html, package.json, tsconfig.json, vite.config.ts
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── README.md
└── .gitignore
```

## Requirements
- Node.js 18+
- Python 3.9+
- An AI API key (Anthropic key from https://console.anthropic.com)

## Installation

### Backend
```
cd backend
python -m venv venv
# Windows: venv\Scripts\activate     Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```
Create `backend/.env` (copy `.env.example`) and add your key:
```
AI_API_KEY=your_key_here
```
Run:
```
uvicorn main:app --reload
```
Backend URL: http://localhost:8000

### Frontend
```
cd frontend
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev
```
Frontend URL: http://localhost:5173

Start the backend first, then the frontend.

### Production build
```
cd frontend
npm run build
```
Static files are created in `frontend/dist`.

## Deployment
**Frontend** (any static host, e.g. Netlify, Vercel, Cloudflare Pages): build command `npm run build`, output folder `dist`, environment variable `VITE_API_URL` = your deployed backend URL.

**Backend** (any Python host, e.g. Render, Railway, Fly.io): root folder `backend`, install with `pip install -r requirements.txt`, start with `uvicorn main:app --host 0.0.0.0 --port $PORT`. Add these as environment variables on the host (never commit them):
- `AI_API_KEY` – your API key
- `CORS_ORIGINS` – your deployed frontend URL, e.g. `https://your-app.netlify.app`

## Security
The API key lives only in `backend/.env` (git-ignored). The frontend never sees it.
