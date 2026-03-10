
require("dotenv").config();
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require('uuid');

async function seedMongo() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;

    if (!uri) {
        console.error("❌ MONGODB_URI not found in .env");
        return;
    }

    console.log("🌱 Starting MongoDB Seeding...");
    const client = new MongoClient(uri, {
        tls: true,
        tlsAllowInvalidCertificates: true
    });

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection("ai_recommendations");

        const sampleRecommendations = [
            {
                userId: "travel_tester",
                hotelName: "Grand Hotel Paris",
                recommendationText: "Based on your interest in luxury and city life, we recommend the Grand Hotel in Paris for its central location and premium amenities.",
                timestamp: new Date()
            },
            {
                userId: "travel_tester",
                hotelName: "Beach Resort Sydney",
                recommendationText: "For your next adventure, consider the Beach Resort in Sydney. It offers great surfing spots and a relaxing spa.",
                timestamp: new Date()
            }
        ];

        const result = await collection.insertMany(sampleRecommendations);
        console.log(`✅ Inserted ${result.insertedCount} sample recommendations into MongoDB.`);
    } catch (err) {
        console.error("❌ MongoDB Seeding failed:", err.message);
        console.log("\n💡 TIP: If you see a timeout, ensure your IP is whitelisted in MongoDB Atlas.");
    } finally {
        await client.close();
    }
}

seedMongo();
