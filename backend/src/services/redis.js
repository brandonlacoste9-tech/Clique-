// Redis client for ephemeral data
import Redis from 'ioredis';
import { config } from '../config/index.js';

export const redis = new Redis(config.REDIS_URL, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

// Story cache helpers
export const storyCache = {
  async getActiveStories(userId, options = {}) {
    const { friendsOnly = true, location = null, radius = 5000 } = options;
    const key = `stories:${userId}:${friendsOnly ? 'friends' : 'public'}`;
    
    // Try cache first
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Return null to trigger DB fetch
    return null;
  },
  
  async setActiveStories(userId, stories, options = {}) {
    const { friendsOnly = true } = options;
    const key = `stories:${userId}:${friendsOnly ? 'friends' : 'public'}`;
    
    // Cache for 5 minutes
    await redis.setex(key, 300, JSON.stringify(stories));
  },
  
  async invalidateUserStories(userId) {
    const keys = await redis.keys(`stories:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
};

// Presence tracking
export const presence = {
  async setOnline(userId, socketId) {
    await redis.hset('presence', userId, JSON.stringify({
      socketId,
      lastSeen: Date.now()
    }));
  },
  
  async setOffline(userId) {
    await redis.hdel('presence', userId);
  },
  
  async isOnline(userId) {
    const data = await redis.hget('presence', userId);
    return !!data;
  },
  
  async getOnlineFriends(friendIds) {
    if (friendIds.length === 0) return [];
    const results = await redis.hmget('presence', ...friendIds);
    return friendIds.filter((_, i) => results[i] !== null);
  }
};

// Ephemeral message queue
export const ephemeralQueue = {
  async scheduleDeletion(messageId, expiresAt) {
    const delay = expiresAt.getTime() - Date.now();
    if (delay > 0) {
      await redis.zadd('ephemeral:messages', expiresAt.getTime(), messageId);
    }
  },
  
  async getExpiredMessages() {
    const now = Date.now();
    const expired = await redis.zrangebyscore('ephemeral:messages', 0, now);
    return expired;
  },
  
  async removeFromQueue(messageId) {
    await redis.zrem('ephemeral:messages', messageId);
  }
};

// Rate limiting
export const rateLimit = {
  async checkLimit(key, limit, windowSeconds) {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetIn: await redis.ttl(key)
    };
  }
};
