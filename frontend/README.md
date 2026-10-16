# STUDS-HELP AI: Frontend

Redesigned React 18 + TypeScript + Vite frontend. It talks to your **existing** FastAPI backend; the API contract is unchanged:

`POST {VITE_API_URL}/api/chat`  body `{ "message": string (1-4000), "history": [{ "role": "user"|"assistant", "content": string }] }` returns `{ "response": string }` (errors: `{ "detail": string }`).

## Requirements
- Node.js 18+ and npm

## Setup
```
npm install
cp .env.example .env      # Windows: copy .env.example .env
```
Set the backend URL in `.env` (defaults to `http://localhost:8000` if unset):
```
VITE_API_URL=http://localhost:8000
```
Anything in `VITE_*` variables is public in the browser bundle. Never put secrets there. The AI key stays in the backend's `.env`.

## Run
```
npm run dev        # http://localhost:5173  (start the backend first)
npm run build      # type-checks (tsc) then builds to dist/
npm run preview    # serve the production build locally
```
For deployment, set `VITE_API_URL` to your deployed backend and make sure the backend's `CORS_ORIGINS` includes the frontend's URL.

## Notes
- Chat history is still stored in `localStorage` under `studs-help-chats`, so existing history carries over.
- Assistant replies are rendered with a built-in safe Markdown renderer (no `innerHTML`; links limited to http/https/mailto; code shown as text). No new dependencies were added.
- No streaming, uploads or stop button, because the backend doesn't support them.
