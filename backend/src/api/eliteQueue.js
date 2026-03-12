/**
 * CLIQUE Elite Queue Scarcity Engine
 * Handles the "L'Offrande Initiale" (First 100 Free) logic.
 */

const MAX_SOVEREIGNS = 100;
import { sendEliteInvitation } from "../services/eliteNotificationService.js";

export default async function eliteQueueRoutes(fastify, options) {
  const { redis, db } = fastify;

  fastify.post("/register", async (request, reply) => {
    const { email } = request.body;

    if (!email) {
      return reply.code(400).send({ error: "Courriel requis pour l'Élite." });
    }

    // Use Postgres for count instead of Redis for the premiere
    const counterResult = await db.query(
      "SELECT COUNT(*) FROM candidates WHERE status = 'SOVEREIGN_INITIAL'",
    );
    const count = parseInt(counterResult.rows[0].count, 10);

    if (count < MAX_SOVEREIGNS) {
      // Atomic increment (Redis) disabled
      // await redis.incr("clique:sovereign_count");

      const sovereignKey = `CQ-ELITE-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;

      // Save to DB (Postgres via pg Pool)
      await db.query(
        `INSERT INTO candidates (email, status, sovereign_key, created_at) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (email) DO NOTHING`,
        [email, "SOVEREIGN_INITIAL", sovereignKey, new Date()],
      );

      // Store in Redis disabled for now
      // const nameFromEmail = email.split("@")[0];
      // const maskedName = `${nameFromEmail.charAt(0).toUpperCase()}. ${nameFromEmail.slice(1, 3)}...`;
      // await redis.lpush(
      //   "clique:hall_of_sovereigns",
      //   JSON.stringify({
      //     name: maskedName,
      //     spot: count + 1,
      //     timestamp: new Date().toISOString(),
      //   }),
      // );
      // await redis.ltrim("clique:hall_of_sovereigns", 0, 9); // Keep last 10 for the ticker

      // Dispatch Elite Invitation Email
      try {
        await sendEliteInvitation(email, sovereignKey, count + 1);
      } catch (err) {
        console.error(`[CLIQUE-AUTH-FAIL] ${email} - Error: ${err.message}`);
      }

      return {
        status: "GRANTED",
        message: "Accès Souverain Confirmé.",
        key: sovereignKey,
        spot: count + 1,
      };
    } else {
      // Pivot to Waitlist
      await db.query(
        `INSERT INTO candidates (email, status, created_at) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (email) DO NOTHING`,
        [email, "WAITLISTED", new Date()],
      );

      return {
        status: "WAITLISTED",
        message: "Rejoint la liste d'attente (Les 100 places sont prises).",
      };
    }
  });

  // Endpoint for the "Hall of Sovereigns" ticker
  fastify.get("/hall", async () => {
    const counterResult = await db.query(
      "SELECT COUNT(*) FROM candidates WHERE status = 'SOVEREIGN_INITIAL'",
    );
    const count = parseInt(counterResult.rows[0].count, 10);
    
    return {
      placesLeft: Math.max(0, MAX_SOVEREIGNS - count),
      totalSovereigns: count
    };
  });
}
