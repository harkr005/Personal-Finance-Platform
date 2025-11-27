const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Initialize Clerk if secret key is provided
let clerkClient = null;
if (process.env.CLERK_SECRET_KEY) {
  const { createClerkClient } = require('@clerk/clerk-sdk-node');
  clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
}

const router = express.Router();

// Register (traditional - for backward compatibility)
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [user] = await db('users').insert({
      name,
      email,
      password_hash
    }).returning(['id', 'name', 'email', 'created_at']);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login (traditional - for backward compatibility)
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Sync Clerk user with our database
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    if (!clerkClient) {
      return res.status(400).json({ error: 'Clerk is not configured' });
    }

    const { clerkUserId } = req.user;
    
    if (!clerkUserId) {
      return res.status(400).json({ error: 'Clerk user ID required' });
    }

    // Get user info from Clerk
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    
    // Find or create user in our database
    let user = await db('users').where({ clerk_user_id: clerkUserId }).first();
    
    if (user) {
      // Update existing user
      const [updatedUser] = await db('users')
        .where({ clerk_user_id: clerkUserId })
        .update({
          name: clerkUser.firstName || clerkUser.name || user.name,
          email: clerkUser.emailAddresses[0]?.emailAddress || clerkUser.primaryEmailAddress?.emailAddress || user.email
        })
        .returning(['id', 'name', 'email', 'clerk_user_id']);
      
      return res.json({
        message: 'User synced successfully',
        user: updatedUser
      });
    } else {
      // Create new user
      const [newUser] = await db('users').insert({
        clerk_user_id: clerkUserId,
        name: clerkUser.firstName || clerkUser.name || 'User',
        email: clerkUser.emailAddresses[0]?.emailAddress || clerkUser.primaryEmailAddress?.emailAddress || '',
        password_hash: '' // No password needed for Clerk users
      }).returning(['id', 'name', 'email', 'clerk_user_id']);
      
      return res.status(201).json({
        message: 'User created successfully',
        user: newUser
      });
    }
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Get current user (works with both Clerk and JWT)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await db('users')
      .select('id', 'name', 'email', 'clerk_user_id', 'created_at')
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

module.exports = router;