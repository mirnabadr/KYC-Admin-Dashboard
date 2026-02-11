# Multi-Region KYC Dashboard with Real-Time Audit Logs

MERN stack: **M**ongoDB, **E**xpress, **R**eact, **N**ode.js. Frontend and backend are in separate folders.

## Repository structure

| Folder / file      | Purpose |
|--------------------|--------|
| `frontend/`        | React (Vite) app – dashboard, auth UI, transactions, audit logs, theme |
| `backend/`         | Node/Express API – JWT, RBAC, audit logs, Cybrid proxy, MongoDB |
| `docs/`            | Backend implementation prompt and MongoDB setup steps |
| `.env`             | Backend + Cybrid env vars (see below). Frontend uses `frontend/.env` with `VITE_*` |

## Quick start

1. **Install**
   - Root: `npm run install:all` (installs frontend + backend deps)
   - Or: `cd frontend && npm install` and `cd backend && npm install`

2. **Environment**
   - Copy root `.env` and set `MONGODB_URI`, `CYBRID_*`, `JWT_SECRET`, `PORT` for backend.
   - For frontend, create `frontend/.env` with `VITE_API_URL=http://localhost:3001` so the app calls the backend for rates and auth (optional; app works with mock if not set).

3. **Run**
   - Frontend: `npm run dev` (from root) or `cd frontend && npm run dev`
   - Backend: `npm run dev:backend` (from root) or `cd backend && npm run dev`  
   - Backend is a placeholder until you implement it using `docs/BACKEND_IMPLEMENTATION_PROMPT.md`.

## Backend and MongoDB

- **Backend prompt**: Follow **`docs/BACKEND_IMPLEMENTATION_PROMPT.md`** to implement the full API (JWT, RBAC, audit logs, Cybrid, caching).
- **MongoDB**: Follow **`docs/MONGODB_SETUP_STEPS.md`** to create the database and the `transactions` and `audit_logs` collections.

## Environment variables

- **Root `.env`** (used by backend when you run it from `backend/` or load from project root):
  - `MONGODB_URI` – MongoDB connection string
  - `CYBRID_API_URL`, `CYBRID_API_KEY`, `CYBRID_API_SECRET` – Cybrid (or mock) API
  - `JWT_SECRET` – secret for signing JWTs
  - `PORT` – backend port (e.g. 3001)

- **Frontend `frontend/.env`** (only `VITE_*` are exposed to the browser):
  - `VITE_API_URL` – backend base URL (e.g. `http://localhost:3001`) so the frontend uses the real API for rates and auth.

## 3rd party (Cybrid) integration

- Backend will call Cybrid (or a mock) using `CYBRID_*` from `.env` and expose `GET /api/rates?from=USD&to=USDC`.
- Frontend already calls this when `VITE_API_URL` is set; otherwise it uses an in-app mock. Put your Cybrid credentials in the root `.env` and the backend URL in `frontend/.env` as above.
