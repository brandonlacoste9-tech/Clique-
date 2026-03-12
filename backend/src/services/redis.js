// Redis client for ephemeral data — with graceful fallback
import Redis from "ioredis";
import { config } from "../config/index.js";

let redis;
let redisConnected = false;

try {
  redis = new Redis(config.REDIS_URL, {
    retryStrategy: (times) => {
      if (times > 5) {
        console.warn(
          "[CLIQUE] Redis unavailable — running without cache/presence",
        );
        return null; // Stop retrying
      }
      return Math.min(times * 100, 2000);
    },
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    connectTimeout: 5000,
  });

  redis.on("connect", () => {
    redisConnected = true;
    console.log("[CLIQUE] ✅ Redis connected");
  });

  redis.on("error", (err) => {
    if (redisConnected) {
      console.warn("[CLIQUE] Redis error:", err.message);
    }
    redisConnected = false;
  });

  redis.on("close", () => {
    redisConnected = false;
  });

  // Attempt connection but don't block startup
  redis.connect().catch(() => {
    console.warn("[CLIQUE] Redis connection failed — running in degraded mode");
  });
} catch (err) {
  console.warn("[CLIQUE] Redis init failed — running without Redis");
  redis = null;
}

// Safe Redis wrapper — returns null instead of crashing
async function safeRedis(fn) {
  if (!redisConnected || !redis) return null;
  try {
    return await fn(redis);
  } catch (err) {
    console.warn("[CLIQUE] Redis op failed:", err.message);
    return null;
  }
}

export { redis, redisConnected, safeRedis };

// Story cache helpers
export const storyCache = {
  async getActiveStories(userId, options = {}) {
    const { friendsOnly = true } = options;
    const key = `stories:${userId}:${friendsOnly ? "friends" : "public"}`;
    return safeRedis((r) => r.get(key).then((v) => (v ? JSON.parse(v) : null)));
  },

  async setActiveStories(userId, stories, options = {}) {
    const { friendsOnly = true } = options;
    const key = `stories:${userId}:${friendsOnly ? "friends" : "public"}`;
    return safeRedis((r) => r.setex(key, 300, JSON.stringify(stories)));
  },

  async invalidateUserStories(userId) {
    return safeRedis(async (r) => {
      const keys = await r.keys(`stories:${userId}:*`);
      if (keys.length > 0) await r.del(...keys);
    });
  },
};

// Presence tracking
export const presence = {
  async setOnline(userId, socketId) {
    return safeRedis((r) =>
      r.hset(
        "presence",
        userId,
        JSON.stringify({
          socketId,
          lastSeen: Date.now(),
        }),
      ),
    );
  },

  async setOffline(userId) {
    return safeRedis((r) => r.hdel("presence", userId));
  },

  async isOnline(userId) {
    const data = await safeRedis((r) => r.hget("presence", userId));
    return !!data;
  },

  async getOnlineFriends(friendIds) {
    if (friendIds.length === 0) return [];
    const results = await safeRedis((r) => r.hmget("presence", ...friendIds));
    if (!results) return [];
    return friendIds.filter((_, i) => results[i] !== null);
  },
};

// Ephemeral message queue
export const ephemeralQueue = {
  async scheduleDeletion(messageId, expiresAt) {
    const delay = expiresAt.getTime() - Date.now();
    if (delay > 0) {
      return safeRedis((r) =>
        r.zadd("ephemeral:messages", expiresAt.getTime(), messageId),
      );
    }
  },

  async getExpiredMessages() {
    const now = Date.now();
    return (
      (await safeRedis((r) => r.zrangebyscore("ephemeral:messages", 0, now))) ||
      []
    );
  },

  async removeFromQueue(messageId) {
    return safeRedis((r) => r.zrem("ephemeral:messages", messageId));
  },
};

// Rate limiting
export const rateLimit = {
  async checkLimit(key, limit, windowSeconds) {
    const result = await safeRedis(async (r) => {
      const current = await r.incr(key);
      if (current === 1) {
        await r.expire(key, windowSeconds);
      }
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetIn: await r.ttl(key),
      };
    });
    // If Redis is down, allow the request
    return result || { allowed: true, remaining: limit, resetIn: 0 };
  },
};

// OTP storage
export const otpStore = {
  async set(phone, otp) {
    return safeRedis((r) => r.setex(`otp:${phone}`, 300, otp));
  },
  async get(phone) {
    return safeRedis((r) => r.get(`otp:${phone}`));
  },
  async del(phone) {
    return safeRedis((r) => r.del(`otp:${phone}`));
  },
};
