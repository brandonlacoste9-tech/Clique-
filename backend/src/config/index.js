// Clique Config - 2026 Edition
import "dotenv/config";

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT) || 3001,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // Redis (optional in dev - graceful fallback)
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  REDIS_ENABLED: process.env.REDIS_ENABLED !== "false",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret_change_me",
  JWT_EXPIRES_IN: "7d",

  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:19006",
    "http://localhost:8081",
  ],

  // MinIO / S3
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || "localhost:9000",
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY || "clique_admin",
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY || "clique_secret_key",
  MINIO_BUCKET: process.env.MINIO_BUCKET || "clique-media",
  MINIO_USE_SSL: process.env.MINIO_USE_SSL === "true",

  // Twilio (SMS verification)
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,

  // Expo Push Notifications
  EXPO_ACCESS_TOKEN: process.env.EXPO_ACCESS_TOKEN,

  // Media processing
  MAX_VIDEO_DURATION: 60, // seconds
  MAX_STORY_DURATION: 15, // seconds

  // Ephemeral settings
  STORY_TTL_HOURS: 24,
  EPHEMERAL_MESSAGE_TTL_SECONDS: 10,

  // Feature flags
  FEATURES: {
    MAP_ENABLED: true,
    CLIQUES_ENABLED: true,
    VOICE_MESSAGES: true,
    SCREENSHOT_DETECTION: true,
  },
};

// Validation - only crash on truly critical missing values
const required = ["DATABASE_URL"];
for (const key of required) {
  if (!config[key]) {
    console.error(`⚠️  Missing required config: ${key}`);
    if (config.NODE_ENV === "production") {
      throw new Error(`Missing required config: ${key}`);
    }
  }
}
