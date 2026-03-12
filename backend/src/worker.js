// Clique Worker — Background jobs for media processing & ephemeral cleanup
import { config } from "./config/index.js";
import { db, query } from "./models/db.js";
import { ephemeralQueue } from "./services/redis.js";

const CLEANUP_INTERVAL = 60_000; // 1 minute
const STORY_CLEANUP_INTERVAL = 300_000; // 5 minutes

console.log("[WORKER] 🏗️  Clique Worker starting...");

// ── Ephemeral Message Cleanup ──────────────────────────────
async function cleanupEphemeralMessages() {
  try {
    // Method 1: Redis queue (if available)
    const expiredIds = await ephemeralQueue.getExpiredMessages();
    if (expiredIds && expiredIds.length > 0) {
      for (const messageId of expiredIds) {
        await query("DELETE FROM messages WHERE id = $1", [messageId]);
        await ephemeralQueue.removeFromQueue(messageId);
      }
      console.log(
        `[WORKER] 🗑️  Cleaned ${expiredIds.length} ephemeral messages (Redis)`,
      );
    }

    // Method 2: Direct DB scan (fallback / catch stragglers)
    const result = await query(
      `DELETE FROM messages 
       WHERE ephemeral_mode = true 
         AND expires_at IS NOT NULL 
         AND expires_at <= NOW()
       RETURNING id`,
    );
    if (result.rowCount > 0) {
      console.log(
        `[WORKER] 🗑️  Cleaned ${result.rowCount} ephemeral messages (DB scan)`,
      );
    }
  } catch (err) {
    console.error("[WORKER] Ephemeral cleanup error:", err.message);
  }
}

// ── Expired Story Cleanup ──────────────────────────────────
async function cleanupExpiredStories() {
  try {
    // Delete story views for expired stories first
    await query(
      `DELETE FROM story_views 
       WHERE story_id IN (
         SELECT id FROM stories WHERE expires_at <= NOW()
       )`,
    );

    // Delete expired stories
    const result = await query(
      `DELETE FROM stories WHERE expires_at <= NOW() RETURNING id, media_key, thumbnail_key`,
    );

    if (result.rowCount > 0) {
      console.log(`[WORKER] 🗑️  Cleaned ${result.rowCount} expired stories`);

      // TODO: Delete media files from MinIO/S3
      // for (const row of result.rows) {
      //   await deleteFromStorage(row.media_key);
      //   if (row.thumbnail_key) await deleteFromStorage(row.thumbnail_key);
      // }
    }
  } catch (err) {
    console.error("[WORKER] Story cleanup error:", err.message);
  }
}

// ── Streak Expiry Check ────────────────────────────────────
async function checkStreakExpiry() {
  try {
    // Expire streaks where no snap exchanged in 24h
    const result = await query(
      `UPDATE conversations 
       SET streak_count = 0, streak_expires_at = NULL
       WHERE streak_expires_at IS NOT NULL 
         AND streak_expires_at <= NOW()
         AND streak_count > 0
       RETURNING id`,
    );

    if (result.rowCount > 0) {
      console.log(`[WORKER] 💔 ${result.rowCount} streaks expired`);
    }
  } catch (err) {
    console.error("[WORKER] Streak check error:", err.message);
  }
}

// ── Inactive User Cleanup (Ghost Mode Auto-Off) ────────────
async function resetGhostMode() {
  try {
    // Auto-disable ghost mode after 24h of inactivity
    const result = await query(
      `UPDATE users 
       SET ghost_mode = false 
       WHERE ghost_mode = true 
         AND last_active_at < NOW() - INTERVAL '24 hours'
       RETURNING id`,
    );

    if (result.rowCount > 0) {
      console.log(
        `[WORKER] 👻 Reset ghost mode for ${result.rowCount} inactive users`,
      );
    }
  } catch (err) {
    console.error("[WORKER] Ghost mode reset error:", err.message);
  }
}

// ── Main Loop ──────────────────────────────────────────────
async function runWorker() {
  console.log("[WORKER] ✅ Worker running — intervals set");

  // Immediate first run
  await cleanupEphemeralMessages();
  await cleanupExpiredStories();
  await checkStreakExpiry();

  // Schedule recurring jobs
  setInterval(cleanupEphemeralMessages, CLEANUP_INTERVAL);
  setInterval(cleanupExpiredStories, STORY_CLEANUP_INTERVAL);
  setInterval(checkStreakExpiry, STORY_CLEANUP_INTERVAL);
  setInterval(resetGhostMode, STORY_CLEANUP_INTERVAL * 2);
}

runWorker().catch((err) => {
  console.error("[WORKER] Fatal error:", err);
  process.exit(1);
});
