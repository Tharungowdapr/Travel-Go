const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");
const { authenticate } = require('../middleware/authMiddleware');

/**
 * POST /api/auth/register
 * Create a new user with hashed password
 */
router.post('/register',
  [
    body('UserName').notEmpty().withMessage('Username is required'),
    body('Password').isString().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!supabase) {
        return res.status(503).json({ success: false, error: 'Supabase not configured' });
      }

      const userData = req.body;

      // Check existing user by username
      const { data: existing, error: checkErr } = await supabase
        .from('USER')
        .select('*')
        .eq('UserName', userData.UserName)
        .single();

      if (checkErr && checkErr.code !== 'PGRST116') {
        throw checkErr;
      }
      if (existing) {
        return res.status(400).json({ success: false, error: 'Username already exists' });
      }

      // Basic password policy enforcement (also enforced on client)
      const password = userData.Password || '';
      const pwdPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
      if (!pwdPattern.test(password)) {
        return res.status(400).json({ success: false, error: 'Password does not meet complexity requirements' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      // Generate unique UserID (UUID)
      const userId = uuidv4();
      const { UserID, ...rest } = userData;
      const insertPayload = { ...rest, UserID: userId, Password: hashed };

      const { data, error } = await supabase.from('USER').insert([insertPayload]).select().single();
      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      const { Password, ...userWithoutPassword } = data;

      // Create JWT (so user is logged in immediately)
      const token = jwt.sign(
        {
          userId: data.UserID,
          UserName: data.UserName
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        token,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, error: 'Registration failed', message: error.message });
    }
  }
);


/**
 * POST /api/auth/login
 * Validate username + password and return user (without password) on success
 */
router.post('/login',
  [
    body('UserName').notEmpty().withMessage('Username is required'),
    body('Password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!supabase) {
        return res.status(503).json({ success: false, error: 'Supabase not configured' });
      }

      const { UserName, Password } = req.body;

      const { data, error } = await supabase.from('USER').select('*').eq('UserName', UserName).single();
      if (error) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const user = data;
      const match = await bcrypt.compare(Password, user.Password || '');
      if (!match) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const { Password: p, ...userWithoutPassword } = user;
      //res.json({ success: true, data: userWithoutPassword });
      // Create JWT
      const token = jwt.sign(
        {
          userId: user.UserID,   // IMPORTANT: matches authenticate middleware
          UserName: user.UserName
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Login failed', message: error.message });
    }
  }
);

// GET /api/auth/me - return currently authenticated user
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const { data, error } = await supabase.from('USER').select('*').eq('UserID', userId).single();
    if (error) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { Password, ...userWithoutPassword } = data;
    res.json({ success: true, user: userWithoutPassword });
  } catch (err) {
    console.error('Auth me error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// Dev endpoint: return decoded token payload and a short token preview
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug/token', authenticate, async (req, res) => {
    try {
      const decoded = req.decoded || null;
      const tokenPreview = (req.headers.authorization || '').split(' ')[1];
      res.json({ success: true, decoded, tokenPreview: tokenPreview ? `${tokenPreview.slice(0, 20)}...` : null });
    } catch (err) {
      console.error('debug token error:', err);
      res.status(500).json({ success: false, error: 'Failed to decode token' });
    }
  });
}

module.exports = router;
