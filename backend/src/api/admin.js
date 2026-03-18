
import { query } from "../models/db.js";
import { prestigeService } from "../services/prestigeService.js";

/**
 * ADMIN API - God Mode for Clique Management.
 * Accessible only by the Architect.
 */
export default async function adminRoutes(fastify, opts) {
  
  // Directly manipulate user prestige and tier
  fastify.post("/grant-sovereignty", async (request, reply) => {
    const { userId, influence } = request.body;
    
    if (!userId) {
      return reply.code(400).send({ error: "Sovereign identity required." });
    }

    try {
      const targetInfluence = parseFloat(influence) || 0;
      
      await query(
        "UPDATE users SET influence_score = $1 WHERE id = $2",
        [targetInfluence, userId]
      );

      const newTier = await prestigeService.recalculateTier(userId, targetInfluence);
      
      return { 
        success: true, 
        message: `Sovereign level for user updated to ${targetInfluence}.`,
        newTier 
      };
    } catch (err) {
      return reply.code(500).send({ error: "Failed to apply God Mode." });
    }
  });

  // Get all users for admin list
  fastify.get("/users", async () => {
    const res = await query('SELECT id, username, display_name, influence_score, sovereign_tier FROM users ORDER BY influence_score DESC');
    return { users: res.rows };
  });
}
