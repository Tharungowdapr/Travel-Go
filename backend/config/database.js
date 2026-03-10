const { MongoClient } = require('mongodb');

let client = null;
let db = null;

const connectMongoDB = async () => {
  try {
    if (!client) {
      let mongoUri = process.env.MONGODB_URI;
      const localUri = process.env.LOCAL_MONGODB_URI || "mongodb://localhost:27017/travelgo";

      // Attempt to connect to Cloud first, or if it fails, try local
      try {
        console.log(`🔍 Attempting to connect to Cloud MongoDB...`);
        client = new MongoClient(mongoUri, {
          tls: true,
          tlsAllowInvalidCertificates: true,
          serverSelectionTimeoutMS: 5000
        });
        await client.connect();
        console.log('✅ Connected to Cloud MongoDB');
      } catch (cloudErr) {
        console.warn(`⚠️ Cloud MongoDB failed: ${cloudErr.message}. Falling back to LOCAL...`);
        client = new MongoClient(localUri);
        await client.connect();
        console.log('✅ Connected to LOCAL MongoDB');
        mongoUri = localUri;
      }

      const dbName = (mongoUri === localUri) ? 'travelgo' : (process.env.MONGODB_DB_NAME || 'travelgo');
      db = client.db(dbName);
    }
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

const getMongoDB = () => {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongoDB() first.');
  }
  return db;
};

const closeMongoDB = async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
    client = null;
    db = null;
  }
};

module.exports = {
  connectMongoDB,
  getMongoDB,
  closeMongoDB
};






