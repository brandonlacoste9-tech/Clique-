
import { query } from "../models/db.js";

/**
 * Prestige Service - The engine of Social Status in the Clique.
 * Quantifies user influence based on engagement and elitism.
 */
export const prestigeService = {
  // Increment influence score for engagement
  addInfluence: async (userId, points) => {
    try {
      const result = await query(
        "UPDATE users SET influence_score = influence_score + $1 WHERE id = $2 RETURNING influence_score",
        [points, userId]
      );
      
      const newScore = result.rows[0]?.influence_score || 0;
      await prestigeService.recalculateTier(userId, newScore);
      
      return newScore;
    } catch (err) {
      console.error("Influence update failed:", err.message);
      return 0;
    }
  },

  // Screenshots detected by others increase your prestige (you are worth snapping)
  onScreenshotDetected: async (ownerId) => {
    return await prestigeService.addInfluence(ownerId, 5.0);
  },

  // Each view adds a small grain of gold
  onStoryViewed: async (ownerId) => {
    return await prestigeService.addInfluence(ownerId, 0.1);
  },

  // Recalculate the Sovereign Tier based on current influence
  recalculateTier: async (userId, score) => {
    let tier = 'INITIÉ (GRATUIT)';
    if (score >= 1000) tier = 'DIEU D\'OR 👑';
    else if (score >= 500) tier = 'IMPÉRIAL ⚜️';
    else if (score >= 100) tier = 'SOUVERAIN 💎';
    else if (score >= 10) tier = 'ELITE ✨';

    await query(
      "UPDATE users SET sovereign_tier = $1 WHERE id = $2",
      [tier, userId]
    );
  }
};
