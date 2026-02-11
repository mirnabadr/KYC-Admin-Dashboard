# MongoDB Setup Steps – KYC Admin

Follow these steps to create the database and collections for the backend.

---

## 1. Create a cluster and get connection string

- **MongoDB Atlas**: Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas), create an account (if needed), and create a new cluster (e.g. M0 free tier).
- **Database user**: Create a database user (e.g. `kycadmin`) with a strong password. Note the username and password.
- **Network**: In Network Access, add your IP (or `0.0.0.0/0` for development only; restrict in production).
- **Connection string**: Click “Connect” → “Connect your application” → copy the URI. It looks like:
  ```text
  mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
  ```
- Put the **full URI** (with your username, password, cluster host, and database name) in your `.env` as:
  ```env
  MONGODB_URI=mongodb+srv://kycadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/kyc_admin?retryWrites=true&w=majority
  ```
  Replace `YOUR_PASSWORD` (URL-encode if it contains special characters) and `kyc_admin` with your chosen database name.

---

## 2. Create the database

- The database is created automatically when the backend first writes to it (e.g. on first insert into `transactions` or `audit_logs`).
- Use a single database name in the connection string (e.g. `kyc_admin`). All collections below live in this database.

---

## 3. Create collection: `transactions`

- **Name**: `transactions`
- **Purpose**: Store KYC/transaction records (list, create, update, filter by region/status).

**Suggested document shape** (you can align with your backend schema):

| Field       | Type     | Description                    |
|------------|----------|--------------------------------|
| `_id`      | ObjectId | Auto-generated                |
| `userId`   | string   | User who created or owns      |
| `amountUSD`| number   | Amount in USD                 |
| `amountUSDC`| number  | Amount in USDC (if applicable)|
| `status`   | string   | e.g. `"Pending"`, `"Approved"`, `"Rejected"` |
| `region`   | string   | e.g. `"US"`, `"EU"`, `"APAC"`, `"LATAM"`    |
| `user`     | string   | Display name or email         |
| `date`     | string   | ISO date or date string       |
| `createdAt`| Date     | Server-set on create          |
| `updatedAt`| Date     | Server-set on update          |

**In Atlas (optional):**

- In your cluster → “Browse Collections” → “Create Database” → database name: `kyc_admin`, collection name: `transactions` → Create.
- Or let the backend create the collection on first insert (ensure your Mongoose schema or insert logic uses this name).

**Indexes (recommended for backend):**

- `region` (for Regional Admin filters).
- `status` (for filtering by status).
- `createdAt` or `date` (for sorting and time-range filters).
- Compound: `{ region: 1, status: 1 }` if you often filter by both.

Create indexes in Atlas (Collections → `transactions` → Indexes) or in the backend with Mongoose `schema.index()`.

---

## 4. Create collection: `audit_logs`

- **Name**: `audit_logs`
- **Purpose**: Immutable audit trail for all important actions (required by project spec).

**Required fields (from project spec):**

| Field       | Type   | Description                          |
|------------|--------|--------------------------------------|
| `user`     | string | Who performed the action             |
| `action`   | string | e.g. `"LOGIN"`, `"CREATE_TRANSACTION"` |
| `timestamp`| Date   | When the action occurred             |
| `status`   | string | e.g. `"Success"`, `"Failure"`        |

**Optional but recommended:**

| Field     | Type   | Description                |
|----------|--------|----------------------------|
| `details`| string | Short description or JSON |
| `ip`     | string | Client IP                  |
| `resourceId` | string | Related transaction/user id |
| `region` | string | For regional filtering     |

**In Atlas (optional):**

- Same database `kyc_admin` → Create collection → name: `audit_logs` → Create.
- Or let the backend create it on first insert.

**Indexes (recommended):**

- `timestamp` (for “real-time” and time-range filtering).
- `user` (for “filter by user”).
- `action` (for “filter by action”).
- `status` (for “filter by status”).
- Compound: `{ user: 1, timestamp: -1 }` or `{ timestamp: -1 }` for recent-first listing.

---

## 5. Optional: `users` collection

If you store users in MongoDB (instead of a static list or external IdP):

- **Name**: `users`
- **Fields**: e.g. `email`, `passwordHash`, `role` (`"Global Admin"` | `"Regional Admin"` | `"Sending Partner"` | `"Receiving Partner"`), `region` (for Regional Admin).
- Index on `email` (unique) for login lookups.

---

## 6. Checklist

- [ ] Cluster created and connection string in `.env` as `MONGODB_URI`.
- [ ] Database name in URI (e.g. `kyc_admin`).
- [ ] Collection `transactions` created (by you or on first write by backend).
- [ ] Collection `audit_logs` created (by you or on first write by backend).
- [ ] Indexes added for `transactions` (region, status, date/createdAt) and `audit_logs` (timestamp, user, action, status).
- [ ] Backend loads `MONGODB_URI` from env and connects on startup; implement the two collections and indexes in code (Mongoose schemas or equivalent).

After this, the backend can use `transactions` and `audit_logs` as specified in the Backend Implementation Prompt.
