// Auth API - Phone OTP verification
import { config } from '../config/index.js';
import { db, query } from '../models/db.js';
import { redis } from '../services/redis.js';
import twilio from 'twilio';

const twilioClient = config.TWILIO_ACCOUNT_SID 
  ? twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
  : null;

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Format phone number (Quebec/Canada)
function formatPhone(phone) {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 1 and has 11 digits, it's already +1 format
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // If 10 digits, add +1 (North America)
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // Otherwise assume it's already formatted
  return phone.startsWith('+') ? phone : `+${phone}`;
}

export default async function authRoutes(fastify, opts) {
  
  // Request OTP
  fastify.post('/otp', async (request, reply) => {
    const { phone } = request.body;
    
    if (!phone) {
      return reply.code(400).send({ error: 'Phone number required' });
    }
    
    const formattedPhone = formatPhone(phone);
    
    // Rate limit: max 3 OTPs per 10 minutes per phone
    const rateKey = `otp:limit:${formattedPhone}`;
    const rateCheck = await redis.incr(rateKey);
    if (rateCheck === 1) {
      await redis.expire(rateKey, 600); // 10 minutes
    }
    if (rateCheck > 3) {
      return reply.code(429).send({ 
        error: 'Too many attempts. Try again in 10 minutes.' 
      });
    }
    
    const otp = generateOTP();
    
    // Store OTP in Redis (5 minute expiry)
    await redis.setex(`otp:${formattedPhone}`, 300, otp);
    
    // Send via Twilio (or log in dev)
    if (twilioClient && config.NODE_ENV === 'production') {
      try {
        await twilioClient.messages.create({
          body: `Ton code Clique est: ${otp}. Valide pour 5 minutes.`,
          from: config.TWILIO_PHONE_NUMBER,
          to: formattedPhone
        });
      } catch (err) {
        fastify.log.error('Twilio error:', err);
        return reply.code(500).send({ error: 'Failed to send SMS' });
      }
    } else {
      // Development: return OTP in response
      fastify.log.info(`[DEV] OTP for ${formattedPhone}: ${otp}`);
      return { 
        message: 'OTP sent (dev mode - check logs)',
        devOtp: config.NODE_ENV === 'development' ? otp : undefined
      };
    }
    
    return { message: 'OTP sent' };
  });
  
  // Verify OTP and login/register
  fastify.post('/verify', async (request, reply) => {
    const { phone, otp, username } = request.body;
    
    if (!phone || !otp) {
      return reply.code(400).send({ error: 'Phone and OTP required' });
    }
    
    const formattedPhone = formatPhone(phone);
    
    // Verify OTP
    const storedOtp = await redis.get(`otp:${formattedPhone}`);
    if (!storedOtp || storedOtp !== otp) {
      return reply.code(401).send({ error: 'Invalid or expired OTP' });
    }
    
    // Delete OTP (one-time use)
    await redis.del(`otp:${formattedPhone}`);
    
    // Check if user exists
    let result = await query('SELECT * FROM users WHERE phone = $1 AND deleted_at IS NULL', [formattedPhone]);
    let user = result.rows[0];
    let isNewUser = false;
    
    if (!user) {
      // Create new user
      isNewUser = true;
      
      // Generate username if not provided
      const finalUsername = username || `clique_${Date.now().toString(36)}`;
      
      // Check username uniqueness
      const existing = await query('SELECT id FROM users WHERE username = $1', [finalUsername]);
      if (existing.rows.length > 0) {
        return reply.code(409).send({ error: 'Username taken' });
      }
      
      result = await query(
        `INSERT INTO users (phone, username, display_name, created_at) 
         VALUES ($1, $2, $3, NOW()) 
         RETURNING *`,
        [formattedPhone, finalUsername, finalUsername]
      );
      user = result.rows[0];
    }
    
    // Update last active
    await query('UPDATE users SET last_active_at = NOW() WHERE id = $1', [user.id]);
    
    // Generate JWT
    const token = await reply.jwtSign({
      userId: user.id,
      username: user.username,
      phone: user.phone
    });
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        isNewUser
      }
    };
  });
  
  // Refresh token
  fastify.post('/refresh', async (request, reply) => {
    // This route is protected by JWT hook, so request.user is set
    const userId = request.user?.userId;
    
    if (!userId) {
      return reply.code(401).send({ error: 'Invalid token' });
    }
    
    // Get fresh user data
    const result = await query(
      'SELECT id, username, display_name, avatar_url FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return reply.code(401).send({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Generate new token
    const token = await reply.jwtSign({
      userId: user.id,
      username: user.username,
      phone: user.phone
    });
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        avatarUrl: user.avatar_url
      }
    };
  });
  
  // Logout (invalidate token - optional with short-lived tokens)
  fastify.post('/logout', async (request, reply) => {
    // With JWT, true logout requires token blacklisting
    // For now, client just deletes the token
    return { message: 'Logged out' };
  });
}
