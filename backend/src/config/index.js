// Clique Config - 2026 Edition
import 'dotenv/config';

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3001,
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: '7d',
  
  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:19006'],
  
  // MinIO / S3
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'localhost:9000',
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
  MINIO_BUCKET: process.env.MINIO_BUCKET || 'clique-media',
  MINIO_USE_SSL: process.env.MINIO_USE_SSL === 'true',
  
  // Twilio (SMS verification)
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  
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
    SCREENSHOT_DETECTION: true
  }
};

// Validation
const required = ['DATABASE_URL', 'JWT_SECRET', 'MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY'];
for (const key of required) {
  if (!config[key]) {
    throw new Error(`Missing required config: ${key}`);
  }
}
