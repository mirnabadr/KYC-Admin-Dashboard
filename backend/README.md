# KYC Admin Backend

REST API backend for the Multi-Region KYC Dashboard built with Node.js, Express, MongoDB, JWT authentication, and Role-Based Access Control (RBAC).

## 🏗️ Architecture

- **Framework**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Authorization**: Role-Based Access Control (RBAC)
- **Audit Logging**: Comprehensive audit trail for compliance
- **3rd Party Integration**: Cybrid API for exchange rates
- **Caching**: In-memory TTL cache (Redis-ready)

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration (database, env)
│   ├── models/          # MongoDB schemas (User, Transaction, AuditLog)
│   ├── middleware/      # Auth, RBAC, error handling
│   ├── services/        # Business logic (Cybrid API, cache, audit)
│   ├── controllers/     # Request handlers
│   ├── routes/          # Route definitions
│   ├── scripts/         # Database seeding
│   └── server.js        # Entry point
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **RBAC**: Four roles with granular permissions
- **Rate Limiting**: Prevents API abuse
- **CORS**: Configurable cross-origin resource sharing
- **Audit Trail**: All actions logged for compliance
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Centralized error handling without leaking sensitive info

## 👥 Roles and Permissions

### Global Admin
- Full access to all regions and endpoints
- Can manage users, transactions, and audit logs
- Can approve/reject transactions across all regions

### Regional Admin
- Access limited to assigned region(s)
- Can approve/reject transactions in their region
- Can view audit logs for their region

### Sending Partner
- Access limited to sending-related actions
- Can create transactions in their region
- Can view their own transactions

### Receiving Partner
- Access limited to receiving-related actions
- Can view transactions in their region
- Cannot approve/reject transactions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (ES modules support)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string (use `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
   - `PORT`: Server port (default: 3001)
   - `CYBRID_API_KEY`, `CYBRID_API_SECRET`: Cybrid API credentials (optional, uses mock if not set)

3. **Seed initial data** (optional):
   ```bash
   npm run seed
   ```
   
   This creates test users:
   - Global Admin: `admin@kyc.com` / `admin123`
   - Regional Admin (EU): `eu-admin@kyc.com` / `admin123`
   - Sending Partner (US): `partner@kyc.com` / `partner123`
   - Regional Admin (APAC): `apac-admin@kyc.com` / `admin123`
   - Receiving Partner (LATAM): `latam-partner@kyc.com` / `partner123`

4. **Start the server**:
   ```bash
   npm run dev    # Development mode with auto-reload
   # or
   npm start      # Production mode
   ```

The server will start on `http://localhost:3001` (or your configured PORT).

## 📡 API Endpoints

### Authentication

- `POST /api/auth/login` - Login and get JWT token
  ```json
  {
    "email": "admin@kyc.com",
    "password": "admin123"
  }
  ```
  Response:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "admin@kyc.com",
      "name": "Sarah Chen",
      "role": "Global Admin",
      "region": "All Regions"
    }
  }
  ```

- `GET /api/auth/me` - Get current user info (requires auth)

### Exchange Rates

- `GET /api/rates?from=USD&to=USDC` - Get exchange rate (cached for 60 seconds)

### Transactions

- `GET /api/transactions` - List transactions (with filters: `region`, `status`, `userEmail`, `page`, `limit`)
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction (requires auth)
- `PATCH /api/transactions/:id/status` - Approve/Reject transaction (admin only)

### Audit Logs

- `GET /api/audit-logs` - List audit logs (admin only, with filters)
- `GET /api/audit-logs/:id` - Get single audit log (admin only)

### Users

- `GET /api/users` - List users (Global Admin only)
- `GET /api/users/:id` - Get single user (Global Admin only)
- `POST /api/users` - Create user (Global Admin only)
- `PATCH /api/users/:id` - Update user (Global Admin only)

## 🔒 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is obtained from `/api/auth/login` and should be stored securely (e.g., in localStorage or httpOnly cookies).

## 📊 Database Schema

### Users Collection
- `email` (unique, indexed)
- `password` (hashed)
- `name`, `role`, `region`
- `isActive`, `lastLogin`
- `createdAt`, `updatedAt`

### Transactions Collection
- `transactionId` (unique, indexed)
- `userId`, `userEmail`
- `region`, `amountUSD`, `amountUSDC`
- `status` (Pending/Approved/Rejected)
- `kycStatus`
- `approvedAt`, `approvedBy`, `rejectedAt`, `rejectedBy`
- `createdAt`, `updatedAt`

### Audit Logs Collection
- `userId`, `userEmail`
- `action`, `status` (Success/Failure)
- `details`, `resourceId`, `resourceType`
- `region`, `ipAddress`, `userAgent`
- `timestamp` (indexed)

## 🎯 Performance Optimization

### Caching Strategy

- **Exchange Rates**: Cached for 60 seconds (TTL)
- **Future**: Can be upgraded to Redis for distributed caching

### Database Indexing

All collections have appropriate indexes:
- User: `email`, `role`, `region`
- Transaction: `transactionId`, `userId`, `region`, `status`, `createdAt`
- AuditLog: `userId`, `userEmail`, `action`, `status`, `timestamp`, `region`

### Scalability Considerations

To scale to 10,000+ users:

1. **Stateless API**: JWT tokens allow horizontal scaling
2. **Database Indexing**: Optimized queries with compound indexes
3. **Connection Pooling**: Mongoose handles connection pooling
4. **Caching**: Redis for distributed caching (currently in-memory)
5. **Rate Limiting**: Prevents abuse and DDoS
6. **Load Balancing**: Can run multiple instances behind a load balancer
7. **Database Sharding**: MongoDB supports sharding for large datasets
8. **CDN**: Static assets served via CDN
9. **Monitoring**: Add APM tools (e.g., New Relic, Datadog)

## 🔍 Audit Trail Integrity

- **Synchronous Writes**: Audit logs are written synchronously to ensure no lost logs
- **Append-Only**: Audit logs are never deleted or modified
- **Comprehensive Logging**: All meaningful actions are logged (login, transactions, user management)
- **PCI-DSS Compliance**: No sensitive data (passwords, full tokens) in logs
- **IP Tracking**: IP addresses logged for security auditing

## 🛡️ PCI-DSS Considerations

- ✅ No storage of full card numbers
- ✅ No logging of passwords or full tokens
- ✅ Secure transmission (HTTPS in production)
- ✅ Comprehensive audit trail
- ✅ Role-based access control
- ✅ Secure authentication (JWT)

## 🧪 Testing

Test the API using curl or Postman:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kyc.com","password":"admin123"}'

# Get transactions (use token from login)
curl http://localhost:3001/api/transactions \
  -H "Authorization: Bearer <token>"

# Get rates
curl http://localhost:3001/api/rates?from=USD&to=USDC
```

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret for signing JWT tokens | Yes | - |
| `PORT` | Server port | No | 3001 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `CYBRID_API_URL` | Cybrid API base URL | No | https://api.cybrid.app |
| `CYBRID_API_KEY` | Cybrid API key | No | - |
| `CYBRID_API_SECRET` | Cybrid API secret | No | - |
| `CORS_ORIGIN` | Allowed CORS origin | No | http://localhost:5173 |

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access (IP whitelist)
- Ensure MongoDB user has proper permissions

### JWT Token Errors
- Verify `JWT_SECRET` is set and consistent
- Check token expiration (default: 24h)
- Ensure token is sent in Authorization header

### CORS Issues
- Update `CORS_ORIGIN` in `.env` to match frontend URL
- Check browser console for CORS errors

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 📄 License

Private - Internal use only
