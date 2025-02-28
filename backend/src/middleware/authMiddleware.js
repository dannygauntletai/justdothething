const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const prisma = require('../config/prisma');

// Simple in-memory cache to avoid constant DB operations
// This would need to be replaced with Redis or similar in production
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache time

/**
 * Middleware to authenticate requests using Supabase JWT tokens
 * and ensure the user exists in our database
 */
const authenticateToken = async (req, res, next) => {
  console.log('⭐ Auth middleware started');
  
  // Get the auth token from the Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  console.log(`📝 Request headers:`, {
    authorization: authHeader ? 'Present' : 'Missing',
    hasToken: !!token
  });

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    console.log('🔑 Token found, validating with Supabase...');
    
    // Verify the token using Supabase's JWT key
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('❌ Invalid token:', error?.message || 'No user found');
      throw new Error('Invalid token');
    }
    
    console.log('✅ Token valid, Supabase user found:', {
      id: user.id,
      email: user.email,
      // Other user properties redacted for security
    });

    // Check if the user is in the cache
    const cacheKey = user.id;
    const cachedUser = userCache.get(cacheKey);
    
    let dbUser;
    if (cachedUser && cachedUser.expiresAt > Date.now()) {
      dbUser = cachedUser.user;
      console.log('✅ Using cached user data:', { id: dbUser.id });
    } else {
      console.log('💾 Creating/Updating user in database...');
      
      // Create or update the user in our database
      dbUser = await prisma.user.upsert({
        where: { id: user.id },
        update: {}, // Just ensure it exists, don't update anything
        create: {
          id: user.id,
          settings: {} // Default empty settings
        }
      });
      
      // Update the cache
      userCache.set(cacheKey, {
        user: dbUser,
        expiresAt: Date.now() + CACHE_TTL
      });
      
      console.log('✅ Database user operation completed:', {
        id: dbUser.id,
        isNew: !dbUser.settings || Object.keys(dbUser.settings).length === 0
      });
    }

    // Add both the auth user and database user to the request object
    req.authUser = user;
    req.user = dbUser;
    console.log('⭐ Auth middleware completed successfully');
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
};

module.exports = authenticateToken; 