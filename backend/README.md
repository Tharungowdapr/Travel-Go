# TravelGo Backend Server

Node.js/Express backend server for TravelGo application, handling MongoDB and Supabase connections.

## Features

- ✅ MongoDB connection for AI recommendations storage
- ✅ Supabase integration for main database operations
- ✅ Google Gemini AI integration
- ✅ RESTful API endpoints
- ✅ Error handling and validation
- ✅ CORS configuration
- ✅ Environment-based configuration

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string_here
MONGODB_DB_NAME=travelgo

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Server health check

### AI Recommendations
- `POST /api/ai/recommendations` - Get AI recommendations
  ```json
  {
    "userId": "user123",
    "preferences": {
      "budget": "moderate",
      "travelStyle": "adventure",
      "interests": ["beaches", "mountains"],
      "previousTravels": "...",
      "accommodationPreferences": "hotel",
      "travelDuration": "short"
    }
  }
  ```

- `GET /api/ai/recommendations/:userId` - Get all recommendations for a user
- `GET /api/ai/recommendations/:userId/:responseId` - Get specific recommendation

### Supabase Proxy
- `GET /api/supabase/health` - Check Supabase connection
- `POST /api/supabase/users` - Create user
- `GET /api/supabase/users/:userId` - Get user by ID

## Project Structure

```
backend/
├── config/
│   ├── database.js      # MongoDB connection
│   └── supabase.js      # Supabase client
├── middleware/
│   ├── errorHandler.js  # Global error handler
│   └── notFound.js      # 404 handler
├── routes/
│   ├── aiRoutes.js      # AI recommendation routes
│   └── supabaseRoutes.js # Supabase proxy routes
├── services/
│   └── geminiService.js # Gemini AI service
├── server.js            # Main server file
├── package.json
└── .env                 # Environment variables (create this)
```

## MongoDB Collection

The server expects a MongoDB collection named `ai_recommendations` with the following structure:

```javascript
{
  UserID: string,
  ResponseID: string,
  UserQuery: string,  // JSON string of preferences
  AIResponse: {
    preferredSeason: string,
    preferredCity: string,
    preferredLodgingType: string,
    recommendations: string[]
  },
  createdAt: Date
}
```

## Error Handling

All errors are handled by the global error handler middleware and return JSON responses in the format:

```json
{
  "success": false,
  "error": "Error message"
}
```

## CORS Configuration

The server is configured to accept requests from the frontend URL specified in `FRONTEND_URL` environment variable. Update this for production.

## Security Notes

- Never commit `.env` file to version control
- Use service role key for Supabase only on the backend
- Keep MongoDB connection string secure
- Use environment variables for all sensitive data






