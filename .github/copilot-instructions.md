# GitHub Copilot / AI Agent Instructions for TravelGo

This file gives focused, actionable information for AI coding agents working on the TravelGo monorepo (Express backend, React frontend, and a Python scraper).

1) Big-picture architecture
- Backend: `backend/` — Node.js + Express API. Entrypoint: `backend/server.js`. Routes live in `backend/routes/*` and delegate business logic to `backend/services/*` (e.g. `geminiService.js`). DB connections are in `backend/config/*` (`database.js` for MongoDB, `supabase.js` for Supabase).
- Frontend: `my_react_app/` — React + TypeScript app. API wrapper: `src/config/api.ts`. Auth state: `src/context/AuthContext.tsx`. UI pages live under `src/pages/`.
- Data flows: Frontend calls backend via `API_BASE_URL` (`REACT_APP_API_URL`), backend calls Google Gemini and Supabase, and persists AI recommendation results in MongoDB collection `ai_recommendations`.

2) Key integration points and external deps
- Google Gemini AI: used in `backend/services/geminiService.js` via `@google/generative-ai`. The service builds a textual prompt, expects a JSON payload in the model's text response, parses it with a regex, and stores the result into MongoDB.
- MongoDB: connection logic in `backend/config/database.js`. Collection: `ai_recommendations` (schema described in `backend/README.md`). Backend connects using `MONGODB_URI` and `MONGODB_DB_NAME`.
- Supabase: client helpers in `backend/config/supabase.js` (backend) and `my_react_app/src/config/supabase.ts` (frontend). Note: frontend currently contains a hard-coded Supabase URL/key — treat as sensitive and consider moving to env during fixes.

3) Developer workflows and commands
- Backend (development): from `backend/` run `npm install` then `npm run dev` (uses `nodemon`) to start server on `PORT` (default 5000). Production: `npm start`.
- Frontend: from `my_react_app/` run `npm install` then `npm start` to run CRA dev server (default port 3000). Build with `npm run build`.
- Health checks: `GET /health` (server) and `GET /api/supabase/health` (supabase proxy route).

4) Environment variables (discovered in code/READMEs)
- Backend `.env` (backend/): `PORT`, `MONGODB_URI`, `MONGODB_DB_NAME`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `FRONTEND_URL`.
- Frontend `.env` (my_react_app/): `REACT_APP_API_URL`, `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, `REACT_APP_GEMINI_API_KEY`, `REACT_APP_MONGODB_URI`, `REACT_APP_MONGODB_DB_NAME` (see `my_react_app/README.md`).

5) Project-specific conventions & patterns
- Service-layer pattern: Routes are thin and call service functions (e.g. `getAIRecommendations`) that encapsulate 3rd-party calls + persistence — follow this pattern when adding endpoints.
- Error handling: the backend uses `middleware/errorHandler.js` and `middleware/notFound.js`. Ensure thrown errors bubble to the global handler (return JSON with `{ success: false, error }`).
- Validation: endpoints use `express-validator` in the route files; preserve validation logic for inputs.
- Prompt handling: `geminiService` expects JSON inside the model text and parses via regex. When modifying prompt/response code, keep robust parsing and safe JSON parsing (try/catch).

6) Files to inspect for examples
- `backend/server.js` — app boot, CORS, logging, graceful shutdown
- `backend/routes/aiRoutes.js` — endpoint + validation examples
- `backend/services/geminiService.js` — AI prompt, parse, and MongoDB persistence
- `backend/config/database.js` and `backend/config/supabase.js` — DB clients
- `my_react_app/src/config/api.ts` — frontend fetch wrapper and error handling
- `my_react_app/src/services/geminiService.ts` — calling the backend AI endpoints

7) Security notes (what agents should not commit)
- Never commit secrets or `.env` values. The repo contains a hard-coded Supabase key in `my_react_app/src/config/supabase.ts` — treat as sensitive and propose migration to env vars if asked to remediate.
- Do not expose `MONGODB_URI` or service role keys into frontend bundles.

8) Suggested first tasks for an agent
- Small change: add logging or additional validation to an AI route — follow existing route -> service -> db pattern.
- Medium change: move hard-coded Supabase keys into env variables and update `README.md` with setup steps.

If anything here is unclear or you want more detail (example request/response samples, tests, or additional files to reference), tell me which area to expand and I will iterate.
