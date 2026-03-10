const express = require("express");
const router = express.Router();
const { getAIRecommendations, getRecommendationsForUser } = require("../services/geminiService");

if (!getRecommendationsForUser) {
  console.warn('Warning: getRecommendationsForUser is not exported from services/geminiService. Falling back to empty implementation.');
}


// POST /api/ai/recommendations
router.post("/recommendations", async (req, res) => {
  try {
    const { hotelName, city, country, preferences, userId } = req.body;

    const aiData = await getAIRecommendations(
      hotelName,
      city,
      country,
      preferences,
      userId
    );

    res.json({ success: true, data: aiData });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate AI recommendations",
    });
  }
});

// GET /api/ai/recommendations/:userId - return all recommendations for a user (most recent first)
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const recs = await getRecommendationsForUser(userId);
    res.json({ success: true, data: recs });
  } catch (err) {
    console.error('Error fetching recommendations for user:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
  }
});

module.exports = router;

