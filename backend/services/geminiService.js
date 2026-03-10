const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getMongoDB } = require("../config/database");

const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Correct initialization

/**
 * Generate AI recommendations for a hotel
 * @param {string} hotelName - The name of the hotel
 * @param {string} city - The city where the hotel is located
 * @param {string} country - The country where the hotel is located
 * @returns {Promise<object>} - AI-generated recommendations
 */

async function getAIRecommendations(hotelName, city, country, preferences, userId) {
  // Support multiple cities in preferences.cities (array)
  const prompt = `
    You are a travel recommendation expert.

    Hotel: "${hotelName}"
    Location: ${city}, ${country}

    User preferences:
    - Budget: ${preferences.budget}
    - Preferred city: ${preferences.city}
    - Season: ${preferences.season}

    TASK:
    Based on the user's preferences, suggest a list of 3 cities (not limited to the provided city) that might interest the user for travel. For each city, generate a personalized hotel recommendation.

    Return ONLY valid JSON as an array, where each item has:
    {
      "city": string,                      // city name
      "preferredSeason": string,           // e.g., "Summer", "Winter"
      "preferredLodgingType": string,      // e.g., "Hotel", "Resort", "Boutique"
      "description": string,
      "whyItMatchesUser": string,
      "rating": number,
      "sampleReviewFromUserPerspective": string
    }

    Rules:
    - Do NOT mention being an AI
    - Rating must be a number between 1 and 5
    - Keep values concise (no long essays for single fields)
    - If you cannot infer a field, return an empty string ("") for that field
    - PLEASE ENSURE THE RESPONSE IS STRICTLY IN JSON FORMAT WITHOUT ANY ADDITIONAL TEXT OR MARKDOWN FORMATTING OR FORMATTING MARKERS.
    `;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });


    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Log raw response for debugging
    console.log("Gemini raw response:\n", response);

    // Remove markdown code block markers if present
    let cleaned = response.replace(/```json|```/gi, '').trim();

    // Try to extract the first JSON array (greedy, multiline)
    let jsonMatch = cleaned.match(/\[([\s\S]*?)\]/m);
    let jsonStr = null;
    if (jsonMatch) {
      // Add brackets back since match removes them
      jsonStr = '[' + jsonMatch[1] + ']';
    } else {
      // Fallback: slice from first [ to last ]
      const first = cleaned.indexOf('[');
      const last = cleaned.lastIndexOf(']');
      if (first !== -1 && last !== -1 && last > first) {
        jsonStr = cleaned.slice(first, last + 1);
      }
    }
    if (!jsonStr) {
      throw new Error("Invalid JSON returned by Gemini");
    }
    let aiResponse;
    try {
      aiResponse = JSON.parse(jsonStr);
    } catch (err) {
      console.error("JSON parse error. Extracted:", jsonStr);
      throw err;
    }


    try {
      await saveAIRecommendation(hotelName, aiResponse, userId);
    } catch (dbErr) {
      console.warn("⚠️ Failed to save recommendation to DB (" + dbErr.message + "), but returning result to user.");
    }
    return aiResponse;
  } catch (error) {
    console.error("Error generating AI recommendations:", error);
    throw new Error("Failed to generate AI recommendations");
  }
}

/**
 * Save AI recommendations to MongoDB
 * @param {string} hotelName - The name of the hotel
 * @param {object} aiResponse - The AI-generated recommendations
 */
async function saveAIRecommendation(hotelName, aiResponse, userId) {
  const db = getMongoDB();

  await db.collection("ai_recommendations").insertOne({
    userId: userId || null,
    hotelName,
    recommendations: aiResponse,
    createdAt: new Date(),
  });
}

async function getRecommendationsForUser(userId) {
  try {
    const db = getMongoDB();
    const cursor = db.collection('ai_recommendations')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const results = await cursor.toArray();
    // Map to only return the recommendations payload and metadata
    return results.map(r => ({ id: r._id, userId: r.userId, createdAt: r.createdAt, recommendations: r.recommendations }));
  } catch (err) {
    console.warn("⚠️ Cannot fetch user history (MongoDB not connected):", err.message);
    return []; // Return empty history if DB is down
  }
}

module.exports = { getAIRecommendations, getRecommendationsForUser };


