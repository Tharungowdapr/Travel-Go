# Backend Server Setup Guide

This guide will help you set up the Node.js backend server that connects to both MongoDB and Supabase databases.

## Quick Start

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your actual credentials:

```env
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=travelgo

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## Getting Your Credentials

### MongoDB Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (if you don't have one)
3. Click "Connect" on your cluster
4. Choose "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Add the database name at the end: `?retryWrites=true&w=majority`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/travelgo?retryWrites=true&w=majority
```

### Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy it to `GEMINI_API_KEY`

## Testing the Server

### Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test AI Recommendations Endpoint

```bash
curl -X POST http://localhost:5000/api/ai/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "preferences": {
      "budget": "moderate",
      "travelStyle": "adventure",
      "interests": ["beaches", "mountains"],
      "accommodationPreferences": "hotel",
      "travelDuration": "short"
    }
  }'
```

## Project Structure

```
backend/
├── config/
│   ├── database.js      # MongoDB connection setup
│   └── supabase.js      # Supabase client setup
├── middleware/
│   ├── errorHandler.js  # Global error handling
│   └── notFound.js      # 404 handler
├── routes/
│   ├── aiRoutes.js      # AI recommendation endpoints
│   └── supabaseRoutes.js # Supabase proxy endpoints
├── services/
│   └── geminiService.js # Gemini AI integration
├── server.js            # Main server file
├── package.json
└── .env                 # Your environment variables (not in git)
```

## API Endpoints

### AI Recommendations

- **POST** `/api/ai/recommendations`
  - Get AI recommendations based on user preferences
  - Body: `{ userId: string, preferences: object }`
  - Returns: `{ success: true, data: { preferredSeason, preferredCity, preferredLodgingType, recommendations } }`

- **GET** `/api/ai/recommendations/:userId`
  - Get all recommendations for a user
  - Returns: `{ success: true, data: Array<Recommendation> }`

- **GET** `/api/ai/recommendations/:userId/:responseId`
  - Get a specific recommendation
  - Returns: `{ success: true, data: Recommendation }`

### Supabase Proxy

- **GET** `/api/supabase/health`
  - Check Supabase connection

- **POST** `/api/supabase/users`
  - Create a new user
  - Body: User object

- **GET** `/api/supabase/users/:userId`
  - Get user by ID

## MongoDB Collection Setup

The server automatically creates the `ai_recommendations` collection when you first save a recommendation. The collection structure:

```javascript
{
  UserID: string,
  ResponseID: string,
  UserQuery: string,  // JSON string
  AIResponse: {
    preferredSeason: string,
    preferredCity: string,
    preferredLodgingType: string,
    recommendations: string[]
  },
  createdAt: Date
}
```

## Troubleshooting

### MongoDB Connection Issues

- Check your connection string format
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify your username and password are correct
- Check if the database name is correct

### Supabase Connection Issues

- Verify your Supabase URL and keys
- Check if your Supabase project is active
- Ensure the tables exist in your Supabase database

### CORS Errors

- Make sure `FRONTEND_URL` in `.env` matches your React app URL
- Check if the backend server is running
- Verify the API URL in your frontend `.env` file

### Port Already in Use

If port 5000 is already in use, change the `PORT` in your `.env` file:

```env
PORT=5001
```

Then update your frontend `.env` to match:

```env
REACT_APP_API_URL=http://localhost:5001/api
```

## Production Deployment

For production:

1. Set `NODE_ENV=production` in your `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name travelgo-backend
   ```
3. Set up proper CORS for your production frontend URL
4. Use environment variables from your hosting platform
5. Set up SSL/HTTPS
6. Configure proper logging and monitoring

## Security Best Practices

- ✅ Never commit `.env` file to git
- ✅ Use environment variables for all sensitive data
- ✅ Use Supabase service role key only on backend
- ✅ Keep MongoDB connection string secure
- ✅ Use HTTPS in production
- ✅ Implement rate limiting for API endpoints
- ✅ Add authentication/authorization middleware
- ✅ Validate all input data

## Next Steps

1. ✅ Backend server is set up
2. ✅ Update frontend to use backend API (already done)
3. ✅ Test all endpoints
4. ✅ Deploy to production when ready

For frontend setup, see the main `README.md` in the `my_react_app` directory.






