# Backend Implementation Prompt – Multi-Region KYC Dashboard

Use this prompt to implement the **backend** for the KYC Admin project. Do not skip any requirement.

---

## Project context

- **Repo**: Multi-Region KYC Dashboard with Real-Time Audit Logs (MERN).
- **Backend**: Node.js + Express inside the `backend/` folder.
- **Frontend**: React app in `frontend/`; it will call this API for auth, transactions, rates, and audit logs.
- **Database**: MongoDB with collections `transactions` and `audit_logs`.
- **3rd party**: Cybrid API for USD/USDC rates (mock or real). Credentials in `.env`.

---

## 1. REST API and structure

- Implement a **REST API** in Node.js (ES modules) under `backend/`.
- Use **Express** for HTTP server and routing.
- Structure:
  - `src/server.js` – bootstrap app, connect DB, mount routes, start server.
  - `src/routes/` – route modules (auth, transactions, rates, audit logs, users).
  - `src/controllers/` – request handlers.
  - `src/models/` – MongoDB/Mongoose schemas (Transaction, AuditLog, User if stored in DB).
  - `src/middleware/` – auth (JWT), RBAC, request logging/audit.
  - `src/services/` – business logic (e.g. Cybrid client, audit writer).
  - `src/config/` – load from env (port, MongoDB URI, JWT secret, Cybrid URL/keys).
- Use **environment variables** for all secrets and URLs (no hardcoding). Document required vars in `backend/README.md` or root `.env.example`.

---

## 2. Authentication and RBAC

- **JWT (JSON Web Token)** for authentication:
  - On successful login, issue a JWT (e.g. access token) containing at least: user identifier and **role**.
  - Verify JWT on protected routes via middleware (e.g. `authMiddleware`).
- **Role-Based Access Control (RBAC)** – four roles:
  - **Global Admin** – full access to all regions and all endpoints.
  - **Regional Admin** – access limited to their assigned region(s).
  - **Sending Partner** – access limited to sending-related actions and data.
  - **Receiving Partner** – access limited to receiving-related actions and data.
- Implement **role-based middleware** that:
  - Reads role from the decoded JWT (or from DB by user id).
  - Allows or denies access per route based on role and, where applicable, region (e.g. `region` claim or user profile).
- Document clearly: which endpoints each role can call and how region is enforced (e.g. query filters by region for Regional Admin).

---

## 3. Audit logging

- **Audit log schema** (store in MongoDB collection `audit_logs`):
  - **user** (string or reference) – who performed the action.
  - **action** (string) – e.g. `"LOGIN"`, `"CREATE_TRANSACTION"`, `"APPROVE_KYC"`.
  - **timestamp** (date) – when the action occurred.
  - **status** (string) – e.g. `"Success"`, `"Failure"`.
  - Optionally: **details** (string or object), **ip**, **resourceId**, **region** for filtering and PCI-DSS-style audit trail.
- **Log every meaningful action** to the audit DB:
  - Login success/failure, token issuance.
  - Create/update/delete of transactions, KYC status changes.
  - Rate fetches (if you choose to log them), admin actions.
- Ensure **audit trail integrity**: write synchronously or with a guaranteed queue so logs are not lost; avoid logging secrets (passwords, full tokens). Prefer app-level audit writes (not only DB oplog).

---

## 4. MongoDB

- Use **MongoDB** (local or Atlas) and **Mongoose** (or native driver) with two main collections:
  - **transactions** – fields as needed for the app (e.g. amount, currency, status, region, userId, timestamps).
  - **audit_logs** – as in section 3.
- Optionally a **users** collection if you store users in DB (e.g. for login and role/region); otherwise you can use a static list or external IDP and still store audit by user id/name.
- Connection string from env (e.g. `MONGODB_URI`). Handle connection errors and reconnect logic.

---

## 5. Cybrid (3rd party) integration

- **Mock Cybrid API** contract: `GET /rates?from=USD&to=USDC` returns JSON: `{ rate: 1.0 }` (and optionally from, to, timestamp).
- Implement a **backend route** (e.g. `GET /api/rates`) that:
  - Accepts query params `from`, `to` (default to USD, USDC if needed).
  - Calls the Cybrid API (or a mock server) using credentials from env: `CYBRID_API_URL`, `CYBRID_API_KEY`, `CYBRID_API_SECRET` (use whatever the real API expects; for a mock, you can ignore auth).
  - Returns a JSON response compatible with the frontend: e.g. `{ from, to, rate, timestamp }`.
- **Caching (Redis-like)**: Cache the rate response for a short TTL (e.g. 60 seconds) in memory or Redis. If Redis is not installed, use an in-memory cache with TTL so that repeated requests within the TTL return the cached value. Document the caching strategy (e.g. in README).

---

## 6. Transaction and KYC workflows

- Provide REST endpoints for **transaction and KYC workflows**, e.g.:
  - List transactions (with optional filters: region, status, user, date range); enforce RBAC (e.g. Regional Admin only sees their region).
  - Get one transaction by id.
  - Create/update transaction (and write audit log).
  - Endpoints for KYC status updates (e.g. approve/reject) with audit logging.
- All such endpoints must:
  - Be protected by JWT + RBAC middleware.
  - Write to the audit log (user, action, timestamp, status).

---

## 7. Fintech and security

- **Secure JWT handling**: store JWT secret in env; use a strong algorithm (e.g. HS256 or RS256); set reasonable expiry; do not log tokens; validate signature and expiry on every request.
- **Audit trail integrity**: as in section 3; ensure logs are written and not tampered (e.g. append-only, no delete for compliance).
- **PCI-DSS**: no storage of full card numbers; no logging of full tokens or passwords; secure transmission (HTTPS in production). Document in README how the design supports PCI-DSS (e.g. no card data, audit of access, secure auth).

---

## 8. Performance

- **Cached API responses**: Implement Redis-like caching for the Cybrid rate (and optionally other external or heavy endpoints). Use in-memory TTL cache if Redis is not set up; document how to switch to Redis later (e.g. env `REDIS_URL`).

---

## 9. Deliverables (backend)

- **Code**: All backend code under `backend/` with clear structure (routes, controllers, models, middleware, services, config).
- **README**: In `backend/README.md` (or linked from root) explain:
  - Architecture (Express, JWT, RBAC, audit flow).
  - Security measures (JWT, RBAC, audit, no secrets in code).
  - How to run (npm install, env vars, npm run dev).
  - How the system would scale to 10,000 users (e.g. stateless API, DB indexing, caching, horizontal scaling, connection pooling).
- **Environment**: Document every env var (MONGODB_URI, JWT_SECRET, CYBRID_*, PORT, etc.) in README or `.env.example`.

---

## 10. API contract (summary for frontend)

- `POST /api/auth/login` – body `{ email, password }` (or similar); returns `{ token, user: { id, email, role, region? } }`.
- `GET /api/rates?from=USD&to=USDC` – returns `{ from, to, rate, timestamp }`.
- `GET /api/transactions` – query params for filters; returns list; RBAC applied.
- `GET /api/transactions/:id` – one transaction; RBAC applied.
- `POST /api/transactions` – create; body and RBAC as defined.
- `GET /api/audit-logs` – query params for search/filter (user, action, status, date range); returns list; RBAC (e.g. Global Admin only or per region).
- Optional: `GET /api/users` for admin; protect with Global Admin role.

Implement the backend according to the above so the frontend can be wired to these endpoints and the project meets the full requirements (MERN, JWT, RBAC, audit logs, Cybrid, caching, fintech best practices).
