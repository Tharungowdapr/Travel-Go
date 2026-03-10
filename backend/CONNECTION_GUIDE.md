# TravelGo Database Connection Guide

## Overview

The TravelGo application uses **three database systems**:

1. **Supabase (PostgreSQL)** - Primary cloud database for application data
2. **MongoDB Atlas** - Cloud NoSQL database for AI recommendations
3. **Local PostgreSQL** - Optional local database for development

## Database Configuration

### 1. Supabase (PostgreSQL) - Primary Database

**Purpose**: Stores users, countries, cities, hotels, bookings, and payments.

**Configuration** (`.env`):
```bash
SUPABASE_URL=https://<your_supabase_project_id>.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Connection File**: `config/supabase.js`

**Tables**:
- `USER` - User accounts and authentication
- `COUNTRY` - Country data
- `CITY` - City information
- `HOTEL` - Hotel listings
- `ROOM_TYPE` - Room type definitions
- `AVAILABILITY` - Room availability
- `BOOKING` - User bookings
- `PAYMENT` - Payment records

**How to Get Credentials**:
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings → API
4. Copy the URL and keys

### 2. MongoDB Atlas - AI Recommendations

**Purpose**: Stores AI-generated travel recommendations from Gemini API.

**Configuration** (`.env`):
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/travelgo?retryWrites=true&w=majority
MONGODB_DB_NAME=travelgo
```

**Connection File**: `config/database.js`

**Collections**:
- `ai_recommendations` - Stores AI-generated recommendations with user preferences

**Important**: 
- The URI must include the database name (`/travelgo`) before the query parameters
- Password special characters must be URL-encoded
- The connection has automatic fallback to local MongoDB if cloud fails

**How to Get Credentials**:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier M0 available)
3. Create a database user (Database Access)
4. Whitelist your IP (Network Access)
5. Click "Connect" → "Connect your application"
6. Copy the connection string and add database name

See [`MONGODB_ATLAS_SETUP.md`](file:///Users/tharungowdapr/Documents/college/5rth%20sem/dbms/TravelGo/backend/MONGODB_ATLAS_SETUP.md) for detailed setup instructions.

### 3. Local PostgreSQL (Optional)

**Purpose**: Optional local database for development/testing.

**Configuration** (`.env`):
```bash
LOCAL_PG_USER=tharungowdapr
LOCAL_PG_HOST=localhost
LOCAL_PG_DB=travelgo
LOCAL_PG_PASSWORD=
LOCAL_PG_PORT=5432
```

**Connection File**: `config/pg.js`

**Note**: This is optional and not required for the application to function.

## Testing Connections

### Method 1: Comprehensive Test Script

Run the automated test script to check all connections:

```bash
cd backend
node scripts/testAllConnections.js
```

This will test:
- ✅ Supabase connection and table access
- ✅ MongoDB Atlas connection and operations
- ✅ Local PostgreSQL (if configured)
- ✅ Gemini API connectivity

**Expected Output**:
```
✅ Supabase connection successful
✅ MongoDB connection successful
✅ Gemini API connection successful
```

### Method 2: Health Check Endpoints

With the server running, test via HTTP endpoints:

```bash
# Test all connections
curl http://localhost:5001/api/health/all

# Test individual services
curl http://localhost:5001/api/health/supabase
curl http://localhost:5001/api/health/mongodb
curl http://localhost:5001/api/health/postgres
```

**Available Endpoints**:
- `GET /api/health/all` - Check all database connections
- `GET /api/health/supabase` - Check Supabase only
- `GET /api/health/mongodb` - Check MongoDB only
- `GET /api/health/postgres` - Check local PostgreSQL only

### Method 3: Existing Test Scripts

```bash
# Verify Supabase tables
node scripts/verifyTables.js

# Verify MongoDB connection
node scripts/verifyMongo.js

# Test booking flow
node scripts/testBookingFlow.js
```

## Troubleshooting

### Supabase Connection Issues

**Error**: "Supabase connection failed"

**Solutions**:
1. Verify `SUPABASE_URL` is correct
2. Check that `SUPABASE_SERVICE_ROLE_KEY` is set (not just anon key)
3. Ensure your IP is not blocked
4. Verify tables exist in your Supabase project

### MongoDB Connection Issues

**Error**: "Authentication failed"

**Solutions**:
1. Double-check username and password in `MONGODB_URI`
2. Ensure password special characters are URL-encoded:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
3. Verify database user has read/write permissions
4. Check that database name is included in URI: `/travelgo?retryWrites=true`

**Error**: "IP not whitelisted"

**Solutions**:
1. Go to MongoDB Atlas → Network Access
2. Add your current IP address
3. Or add `0.0.0.0/0` for development (not recommended for production)

**Error**: "Connection timeout"

**Solutions**:
1. Check internet connection
2. Verify cluster is not paused in Atlas
3. Check firewall settings

### Local PostgreSQL Issues

**Error**: "PostgreSQL connection failed"

**Note**: Local PostgreSQL is optional. The application will work without it.

**Solutions** (if you want to use it):
1. Ensure PostgreSQL is installed and running
2. Verify database exists: `createdb travelgo`
3. Check username and password in `.env`
4. Ensure PostgreSQL is listening on port 5432

## Environment Variables Reference

Complete `.env` file structure:

```bash
# Server
PORT=5001

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/travelgo?retryWrites=true&w=majority
MONGODB_DB_NAME=travelgo

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# JWT
JWT_SECRET=your_jwt_secret

# Local PostgreSQL (Optional)
LOCAL_PG_USER=your_username
LOCAL_PG_HOST=localhost
LOCAL_PG_DB=travelgo
LOCAL_PG_PASSWORD=your_password
LOCAL_PG_PORT=5432
LOCAL_MONGODB_URI=mongodb://localhost:27017/travelgo
```

## Connection Flow

### Server Startup

1. Server loads environment variables from `.env`
2. Attempts to connect to MongoDB (cloud first, then local fallback)
3. Supabase client is initialized
4. Server starts listening on configured port

### Request Handling

- **User/Hotel/Booking operations** → Supabase
- **AI recommendations** → MongoDB + Gemini API
- **Health checks** → All databases

## Production Considerations

### Security
- Never commit `.env` file to version control
- Use strong passwords for database users
- Restrict IP whitelist in MongoDB Atlas
- Use service role key only on backend (never expose to frontend)

### Performance
- MongoDB connection pooling is automatic
- Supabase has built-in connection pooling
- Consider upgrading from free tiers for production load

### Monitoring
- Use health check endpoints for uptime monitoring
- Monitor MongoDB Atlas dashboard for performance
- Check Supabase dashboard for query performance

## Quick Start Checklist

- [ ] Copy `.env.example` to `.env` (if exists)
- [ ] Add Supabase credentials to `.env`
- [ ] Add MongoDB Atlas URI to `.env` (with database name!)
- [ ] Add Gemini API key to `.env`
- [ ] Run `node scripts/testAllConnections.js`
- [ ] Verify all connections show ✅
- [ ] Start server with `npm run dev`
- [ ] Test health endpoint: `curl http://localhost:5001/api/health/all`

## Support

For detailed MongoDB setup, see: [`MONGODB_ATLAS_SETUP.md`](file:///Users/tharungowdapr/Documents/college/5rth%20sem/dbms/TravelGo/backend/MONGODB_ATLAS_SETUP.md)

For backend setup, see: [`BACKEND_SETUP.md`](file:///Users/tharungowdapr/Documents/college/5rth%20sem/dbms/TravelGo/BACKEND_SETUP.md)
