const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

/**
 * GET /api/supabase/health
 * Check Supabase connection
 */
router.get('/health', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase not configured'
      });
    }

    // Test connection by querying a simple table
    const { data, error } = await supabase
      .from('USER')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Supabase connection successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Supabase connection failed',
      message: error.message
    });
  }
});

/**
 * POST /api/supabase/users
 * Create a new user (proxy to Supabase)
 */
router.post('/users', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase not configured'
      });
    }

    const userData = req.body;
    const { data, error } = await supabase
      .from('USER')
      .insert([userData])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error.message
    });
  }
});

/**
 * GET /api/supabase/users/:userId
 * Get user by ID
 */
router.get('/users/:userId', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase not configured'
      });
    }

    const { userId } = req.params;
    const { data, error } = await supabase
      .from('USER')
      .select('*')
      .eq('UserID', userId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

module.exports = router;






