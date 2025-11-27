const jwt = require('jsonwebtoken');
const db = require('../config/database');
const jwtLib = jwt; // Alias to avoid conflict

// Initialize Clerk if secret key is provided
let clerkClient = null;
if (process.env.CLERK_SECRET_KEY) {
  const { createClerkClient } = require('@clerk/clerk-sdk-node');
  clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
}

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Try Clerk token first (if Clerk is configured)
    if (clerkClient && process.env.CLERK_SECRET_KEY) {
      try {
        // Decode Clerk JWT to get user ID (Clerk tokens are JWTs)
        const decoded = jwtLib.decode(token);
        
        if (decoded && decoded.sub && decoded.iss && decoded.iss.includes('clerk')) {
          // This is a Clerk token - get user info
          const clerkUserId = decoded.sub;
          
          // Find or create user in our database
          let user = await db('users').where({ clerk_user_id: clerkUserId }).first();
          
          if (!user) {
            // Try to get user info from Clerk API
            try {
              const clerkUser = await clerkClient.users.getUser(clerkUserId);
              const [newUser] = await db('users').insert({
                clerk_user_id: clerkUserId,
                name: clerkUser.firstName || clerkUser.name || 'User',
                email: clerkUser.emailAddresses?.[0]?.emailAddress || clerkUser.primaryEmailAddress?.emailAddress || '',
                password_hash: '' // No password needed for Clerk users
              }).returning(['id', 'name', 'email', 'clerk_user_id']);
              user = newUser;
            } catch (e) {
              // If we can't get user from Clerk, create minimal user
              const [newUser] = await db('users').insert({
                clerk_user_id: clerkUserId,
                name: 'User',
                email: decoded.email || '',
                password_hash: ''
              }).returning(['id', 'name', 'email', 'clerk_user_id']);
              user = newUser;
            }
          }
          
          req.user = {
            userId: user.id,
            email: user.email,
            clerkUserId: clerkUserId
          };
          return next();
        }
      } catch (clerkError) {
        // Not a Clerk token or Clerk not configured, try JWT
      }
    }

    // Fallback to JWT (for backward compatibility)
    jwtLib.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };