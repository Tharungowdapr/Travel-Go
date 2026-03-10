
require("dotenv").config();
const { MongoClient } = require("mongodb");

async function seedMongoLocal() {
    const uri = process.env.LOCAL_MONGODB_URI || "mongodb://localhost:27017/travelgo";
    const dbName = "travelgo";

    console.log(`🌱 Starting Local MongoDB Seeding: ${uri}...`);
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection("ai_recommendations");

        // Clear old data
        await collection.deleteMany({});

        const sampleRecommendations = [
            {
                userId: "local_tester",
                hotelName: "Paris Local Inn 1",
                recommendationText: "Recommended for its local charm and excellent breakfast.",
                timestamp: new Date()
            },
            {
                userId: "local_tester",
                hotelName: "London Local Inn 2",
                recommendationText: "Great location for sightseeing.",
                timestamp: new Date()
            }
        ];

        const result = await collection.insertMany(sampleRecommendations);
        console.log(`✅ Inserted ${result.insertedCount} sample recommendations into local MongoDB.`);
    } catch (err) {
        console.error("❌ Local MongoDB Seeding failed:", err.message);
    } finally {
        await client.close();
    }
}

seedMongoLocal();
