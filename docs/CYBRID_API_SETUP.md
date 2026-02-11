# Cybrid API Setup Guide

This guide will help you obtain Cybrid API credentials and configure the backend to fetch real-time exchange rates.

## 🔑 Getting Cybrid API Credentials

### Step 1: Sign Up for Cybrid Partner Portal

1. **Visit the Cybrid Partner Portal**: [https://app.cybrid.app](https://app.cybrid.app)
   - For sandbox/testing: [https://app.sandbox.cybrid.app](https://app.sandbox.cybrid.app)

2. **Create an Account**:
   - Click "Sign Up" or "Get Started"
   - Provide your business information
   - Verify your email address

### Step 2: Set Up Organization and Bank

After logging in, you'll be guided through setup:

1. **Name Your Organization**:
   - Choose a name for your organization (e.g., "KYC Admin Platform")

2. **Create a Bank**:
   - Enter a descriptive name for your bank
   - Configure bank settings as needed
   - This represents your digital financial institution in Cybrid

3. **Generate API Key Pair**:
   - Click the "Generate" button to create your API credentials
   - You'll receive:
     - **Client ID** (this is your `CYBRID_CLIENT_ID`)
     - **Client Secret** (this is your `CYBRID_CLIENT_SECRET`)

### Step 3: Save Your Credentials Securely

⚠️ **IMPORTANT**: The Client Secret will **only be shown once**. Save it immediately!

- Copy both Client ID and Client Secret
- Store them securely (password manager, secure vault, etc.)
- You'll need to generate new keys if you lose the secret

### Step 4: Choose Environment

Cybrid provides two environments:

- **Sandbox** (for testing): `https://api.sandbox.cybrid.app`
- **Production** (for live): `https://api.cybrid.app`

For development and testing, use the **Sandbox** environment.

## 📝 Configuring Environment Variables

### Backend Configuration

Edit `backend/.env` and add your Cybrid credentials:

```env
# Cybrid API Configuration (OAuth 2.0)
# Use sandbox for testing, production for live
CYBRID_API_URL=https://api.sandbox.cybrid.app

# OAuth Credentials (from Cybrid Partner Portal)
CYBRID_CLIENT_ID=your-client-id-here
CYBRID_CLIENT_SECRET=your-client-secret-here
```

**Example:**
```env
CYBRID_API_URL=https://api.sandbox.cybrid.app
CYBRID_CLIENT_ID=abc123xyz789
CYBRID_CLIENT_SECRET=secret_key_here_do_not_share
```

### Environment-Specific URLs

**Sandbox (Testing):**
- API URL: `https://api.sandbox.cybrid.app`
- OAuth URL: `https://id.sandbox.cybrid.app/oauth/token`
- Partner Portal: `https://app.sandbox.cybrid.app`

**Production (Live):**
- API URL: `https://api.cybrid.app`
- OAuth URL: `https://id.cybrid.app/oauth/token`
- Partner Portal: `https://app.cybrid.app`

## 🔐 How Authentication Works

The backend uses **OAuth 2.0 Client Credentials Grant** flow:

1. **Token Generation**: Backend exchanges Client ID + Secret for a Bearer Token
2. **Token Caching**: Tokens are cached for ~25 minutes (they expire in 30 minutes)
3. **API Calls**: All API requests use the Bearer Token in the Authorization header
4. **Auto-Refresh**: Tokens are automatically refreshed when expired

### Authentication Flow

```
1. Backend receives rate request
2. Checks for cached OAuth token
3. If expired/missing, generates new token using Client ID + Secret
4. Uses Bearer token to call Cybrid Prices API
5. Returns exchange rate to frontend
```

## 📊 API Endpoints Used

### OAuth Token Endpoint
```
POST https://id.sandbox.cybrid.app/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
client_id=<YOUR_CLIENT_ID>
client_secret=<YOUR_CLIENT_SECRET>
scope=prices:read
```

### Prices/Rates Endpoint
```
GET https://api.sandbox.cybrid.app/api/prices?product_type=spot&symbol_pair=USD_USDC
Authorization: Bearer <TOKEN>
```

## ✅ Verifying Configuration

### Test the Integration

1. **Start the backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Check logs** for:
   - `✅ Cybrid OAuth token generated and cached` - Token generation successful
   - `📦 Cache hit for USD/USDC rate` - Rate fetched successfully
   - `🔧 Using mock rate...` - Credentials not configured (using fallback)

3. **Test the API endpoint**:
   ```bash
   curl http://localhost:3001/api/rates?from=USD&to=USDC
   ```

   Should return:
   ```json
   {
     "success": true,
     "from": "USD",
     "to": "USDC",
     "rate": 1.0,
     "timestamp": "2026-02-10T..."
   }
   ```

### Troubleshooting

**Issue: "Cybrid API credentials not configured"**
- ✅ Check that `CYBRID_CLIENT_ID` and `CYBRID_CLIENT_SECRET` are set in `backend/.env`
- ✅ Verify there are no extra spaces or quotes around the values

**Issue: "OAuth token generation failed: 401"**
- ✅ Verify Client ID and Secret are correct
- ✅ Check that credentials match the environment (sandbox vs production)
- ✅ Ensure credentials haven't been revoked or regenerated

**Issue: "Cybrid API returned 403"**
- ✅ Check rate limiting (too many token requests)
- ✅ Verify your account has access to the Prices API
- ✅ Ensure you're using the correct environment

**Issue: "Falling back to mock"**
- ✅ Check backend logs for specific error messages
- ✅ Verify network connectivity
- ✅ Ensure Cybrid API is accessible from your server

## 🔄 Generating New Keys

If you need to generate new API keys:

1. Log into [Cybrid Partner Portal](https://app.sandbox.cybrid.app)
2. Navigate to **Developers** tab
3. Click **"Generate New Key"** (top right)
4. Choose **Organization** or **Bank** keys
5. Copy the new Client ID and Secret
6. Update `backend/.env` with new credentials
7. Restart the backend server

## 📚 Additional Resources

- **Cybrid Documentation**: [https://docs.cybrid.xyz](https://docs.cybrid.xyz)
- **Authentication Guide**: [https://docs.cybrid.xyz/docs/how-to-authenticate-to-api](https://docs.cybrid.xyz/docs/how-to-authenticate-to-api)
- **API Key Generation**: [https://docs.cybrid.xyz/docs/how-do-i-generate-an-api-key-pair](https://docs.cybrid.xyz/docs/how-do-i-generate-an-api-key-pair)
- **Partner Portal**: [https://app.sandbox.cybrid.app](https://app.sandbox.cybrid.app) (Sandbox)

## 🛡️ Security Best Practices

1. **Never commit credentials to Git**: `.env` files should be in `.gitignore`
2. **Use different credentials** for sandbox and production
3. **Rotate credentials** periodically
4. **Store secrets securely**: Use environment variables or secret management services
5. **Monitor API usage**: Check Cybrid dashboard for unusual activity
6. **Use least privilege**: Only request necessary scopes (`prices:read` for rates)

## 🚀 Production Deployment

For production:

1. Use **Production** environment URLs
2. Generate **Production** API keys (separate from sandbox)
3. Set `CYBRID_API_URL=https://api.cybrid.app`
4. Use secure secret management (AWS Secrets Manager, HashiCorp Vault, etc.)
5. Enable monitoring and alerting for API failures
6. Set up rate limiting and retry logic
