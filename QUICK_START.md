# Quick Start Guide - KYC Admin

This guide will help you get the full-stack application running quickly.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

Or from the root directory:
```bash
npm run install:all
```

## Step 2: Configure Environment Variables

### Backend

1. Copy the example file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `backend/.env` and set:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (already set if you followed setup)
   - `JWT_SECRET`: Already generated in root `.env`
   - `PORT`: 3001 (default)
   - `CYBRID_API_KEY` and `CYBRID_API_SECRET`: Optional (uses mock if not set)

### Frontend

1. The `frontend/.env` file is already created with:
   ```
   VITE_API_URL=http://localhost:3001
   ```

   Update this if your backend runs on a different port.

## Step 3: Seed Database (Optional but Recommended)

This creates test users and sample data:

```bash
cd backend
npm run seed
```

**Test Accounts Created:**
- Global Admin: `admin@kyc.com` / `admin123`
- Regional Admin (EU): `eu-admin@kyc.com` / `admin123`
- Sending Partner (US): `partner@kyc.com` / `partner123`
- Regional Admin (APAC): `apac-admin@kyc.com` / `admin123`
- Receiving Partner (LATAM): `latam-partner@kyc.com` / `partner123`

## Step 4: Start the Backend

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

You should see:
```
🚀 KYC Admin Backend Server
   - Environment: development
   - Server running on http://localhost:3001
   - Health check: http://localhost:3001/health
```

## Step 5: Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

## Step 6: Access the Application

1. Open your browser to `http://localhost:5173`
2. You'll be redirected to the login page
3. Use one of the test accounts from Step 3 to log in

## Troubleshooting

### Backend won't start

- **MongoDB Connection Error**: 
  - Verify `MONGODB_URI` in `backend/.env` is correct
  - Check MongoDB Atlas network access (IP whitelist)
  - Ensure database name `kyc_admin` is in the connection string

- **Port Already in Use**:
  - Change `PORT` in `backend/.env` to a different port
  - Update `VITE_API_URL` in `frontend/.env` to match

### Frontend can't connect to backend

- Verify backend is running on the port specified in `frontend/.env`
- Check CORS settings in `backend/src/config/env.js`
- Open browser console for detailed error messages

### Login fails

- Ensure database is seeded: `cd backend && npm run seed`
- Check backend logs for authentication errors
- Verify JWT_SECRET is set in `backend/.env`

## Running Both Together

From the root directory:

```bash
npm run dev:all
```

This runs both frontend and backend concurrently.

## Next Steps

- Review `backend/README.md` for API documentation
- Check `docs/BACKEND_IMPLEMENTATION_PROMPT.md` for architecture details
- See `docs/MONGODB_SETUP_STEPS.md` for database setup

## Production Deployment

For production:

1. Set `NODE_ENV=production` in backend `.env`
2. Use a strong `JWT_SECRET` (different from development)
3. Configure proper CORS origins
4. Set up HTTPS
5. Use environment-specific MongoDB connection strings
6. Configure proper rate limiting
7. Set up monitoring and logging
