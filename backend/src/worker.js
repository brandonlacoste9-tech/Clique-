// Background worker for CLIQUE
// Handles: ephemeral message cleanup, story expiration, stats updates

import * as Sentry from '@sentry/node';
import { config } from './config/index.js';
import { db } from './models/db.js';
import { redis, ephemeralQueue } from './services/redis.js';

Sentry.init({
  dsn: config.SENTRY_DSN,
  environment: config.NODE_ENV,
  release: 'clique-worker@2026.1.0',
  tracesSampleRate: config.NODE_ENV === 'production' ? 0.1 : 1.0,
  enabled: !!config.SENTRY_DSN,
});

// Process ephemeral messages
async function processEphemeralMessages() {
  const expiredMessageIds = await ephemeralQueue.getExpiredMessages();
  
  if (expiredMessageIds.length === 0) {
    return;
  }
  
  console.log(`Processing ${expiredMessageIds.length} expired messages`);
  
  // Delete expired messages from database
  await db.query(
    `DELETE FROM messages 
     WHERE id = ANY($1) AND ephemeral_mode = true`,
    [expiredMessageIds]
  );
  
  // Remove from Redis queue
  await ephemeralQueue.removeFromQueue(...expiredMessageIds);
}

// Expire old stories
async function expireStories() {
  const result = await db.query(
    `UPDATE stories 
     SET expires_at = NOW() 
     WHERE expires_at > NOW() 
     AND expires_at < NOW() - INTERVAL '1 hour'`
  );
  
  if (result.rowCount > 0) {
    console.log(`Expired ${result.rowCount} stories`);
  }
}

// Clean up old story views (keep last 30 days)
async function cleanupStoryViews() {
  const result = await db.query(
    `DELETE FROM story_views 
     WHERE viewed_at < NOW() - INTERVAL '30 days'`
  );
  
  if (result.rowCount > 0) {
    console.log(`Cleaned up ${result.rowCount} old story views`);
  }
}

// Update user snap scores based on activity
async function updateSnapScores() {
  // Stories posted
  await db.query(
    `UPDATE users 
     SET snap_score = snap_score + 10
     WHERE id IN (
       SELECT user_id FROM stories 
       WHERE created_at > NOW() - INTERVAL '24 hours'
     )`
  );
  
  // Stories viewed
  await db.query(
    `UPDATE users 
     SET snap_score = snap_score + 1
     WHERE id IN (
       SELECT viewer_id FROM story_views 
       WHERE viewed_at > NOW() - INTERVAL '24 hours'
     )`
  );
  
  // Messages sent
  await db.query(
    `UPDATE users 
     SET snap_score = snap_score + 2
     WHERE id IN (
       SELECT sender_id FROM messages 
       WHERE sent_at > NOW() - INTERVAL '24 hours'
     )`
  );
  
  console.log('Snap scores updated');
}

// Main worker loop
async function runWorker() {
  console.log('Clique Worker started');
  console.log(`Running every ${config.WORKER_INTERVAL || 60} seconds`);
  
  const interval = parseInt(config.WORKER_INTERVAL) || 60;
  
  // Run immediately on start
  await processEphemeralMessages();
  await expireStories();
  await cleanupStoryViews();
  await updateSnapScores();
  
  // Then run on interval
  setInterval(async () => {
    try {
      await processEphemeralMessages();
      await expireStories();
      await cleanupStoryViews();
      await updateSnapScores();
    } catch (err) {
      Sentry.captureException(err);
      console.error('Worker error:', err);
    }
  }, interval * 1000);
}

// Start worker
runWorker().catch((err) => {
  Sentry.captureException(err);
  console.error(err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Worker shutting down...');
  await Sentry.flush(2000);
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Worker shutting down...');
  await Sentry.flush(2000);
  process.exit(0);
});
