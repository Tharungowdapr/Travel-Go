# MongoDB Atlas Setup Guide

This guide will help you connect your backend server to MongoDB Atlas.

## ✅ Compatibility

**Yes, the backend code works perfectly with MongoDB Atlas!** The `MongoClient` from the `mongodb` package supports both local MongoDB and MongoDB Atlas cloud databases.

## Getting Your MongoDB Atlas Connection String

### Step 1: Create/Select Your Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create an account
3. Create a new cluster (or use an existing one)
   - Choose a free tier (M0) for development
   - Select your preferred cloud provider and region

### Step 2: Create Database User

1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Enter a username and password (save these!)
5. Set user privileges to **Read and write to any database**
6. Click **Add User**

### Step 3: Whitelist Your IP Address

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. For development, click **Allow Access from Anywhere** (0.0.0.0/0)
   - ⚠️ **Note**: For production, only whitelist your server's IP address
4. Click **Confirm**

### Step 4: Get Your Connection String

1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Node.js** as the driver
5. Copy the connection string

It will look like this:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 5: Format the Connection String

Replace the placeholders in the connection string:

1. Replace `<username>` with your database username
2. Replace `<password>` with your database password
3. **Add your database name** at the end (before the `?`)

**Final format:**
```
mongodb+srv://myusername:mypassword@cluster0.xxxxx.mongodb.net/travelgo?retryWrites=true&w=majority
```

**Important:** 
- Replace `travelgo` with your actual database name
- URL-encode special characters in your password (e.g., `@` becomes `%40`)

### Step 6: Add to Your .env File

In your `backend/.env` file:

```env
MONGODB_URI=mongodb+srv://myusername:mypassword@cluster0.xxxxx.mongodb.net/travelgo?retryWrites=true&w=majority
MONGODB_DB_NAME=travelgo
```

## Example Connection String

Here's a complete example:

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://admin:MyP@ssw0rd123@cluster0.abc123.mongodb.net/travelgo?retryWrites=true&w=majority
MONGODB_DB_NAME=travelgo
```

## Testing the Connection

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. You should see:
   ```
   ✅ Connected to MongoDB
   🚀 Server running on port 5000
   ```

3. If you see an error, check:
   - ✅ Username and password are correct
   - ✅ IP address is whitelisted
   - ✅ Connection string format is correct
   - ✅ Database name is specified
   - ✅ Password is URL-encoded if it contains special characters

## Common Issues

### Issue: "Authentication failed"

**Solution:**
- Double-check your username and password
- Make sure the user has read/write permissions
- URL-encode special characters in password

### Issue: "IP not whitelisted"

**Solution:**
- Go to Network Access in Atlas
- Add your current IP address (or 0.0.0.0/0 for development)

### Issue: "Connection timeout"

**Solution:**
- Check your internet connection
- Verify the cluster is running (not paused)
- Check if your firewall is blocking the connection

### Issue: "Password contains special characters"

**Solution:**
URL-encode special characters:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

Or use a password without special characters.

## Database and Collection Setup

The backend will automatically:
- ✅ Connect to your database
- ✅ Create the `ai_recommendations` collection when you first save a recommendation
- ✅ Handle all database operations

No manual setup needed!

## Production Considerations

For production:

1. **Security:**
   - Use a dedicated database user with limited permissions
   - Only whitelist your production server's IP address
   - Use environment variables (never hardcode credentials)
   - Consider using MongoDB Atlas VPC peering for better security

2. **Performance:**
   - Use connection pooling (already handled by MongoClient)
   - Monitor your cluster performance in Atlas dashboard
   - Consider upgrading from free tier for production

3. **Backup:**
   - Enable automated backups in Atlas
   - Set up regular backup schedules

## Your Backend Code is Ready!

The code in `backend/config/database.js` is already configured to work with MongoDB Atlas. Just add your connection string to the `.env` file and you're good to go! 🚀






