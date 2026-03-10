
require("dotenv").config();
const { MongoClient } = require("mongodb");

async function verifyMongo() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;

    if (!uri) {
        console.error("❌ MONGODB_URI not found in .env");
        return;
    }

    console.log(`🔍 Connecting to MongoDB: ${uri.split('@')[1]}...`);
    const client = new MongoClient(uri, {
        tls: true,
        tlsAllowInvalidCertificates: true
    });

    try {
        await client.connect();
        console.log("✅ MongoDB Connected Successfully.");

        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();

        if (collections.length === 0) {
            console.log("⚠️ No collections found in database:", dbName);
        } else {
            console.log(`✅ Collections in '${dbName}':`, collections.map(c => c.name));
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(`   - ${col.name}: ${count} documents`);
            }
        }
    } catch (err) {
        console.error("❌ MongoDB Connection failed:", err.message);
    } finally {
        await client.close();
    }
}

verifyMongo();
