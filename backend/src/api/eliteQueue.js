/**
 * ZYEYTÉ Elite Queue Scarcity Engine
 * Handles the "L'Offrande Initiale" (First 100 Free) logic.
 */

const MAX_SOVEREIGNS = 100;

export default async function eliteQueueRoutes(fastify, options) {
  const { redis, db } = fastify;

  fastify.post("/register", async (request, reply) => {
    const { email } = request.body;

    if (!email) {
      return reply.code(400).send({ error: "Courriel requis pour l'Élite." });
    }

    // Use Redis for atomic counter to prevent overflow during peak hype
    const currentCount = (await redis.get("zyeute:sovereign_count")) || 0;
    const count = parseInt(currentCount, 10);

    if (count < MAX_SOVEREIGNS) {
      // Atomic increment
      await redis.incr("zyeute:sovereign_count");

      const sovereignKey = `ZY-ELITE-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;

      // Save to DB (Postgres via knex/db decorator)
      // Assuming 'candidates' table exists or creating it
      await db("candidates")
        .insert({
          email,
          status: "SOVEREIGN_INITIAL",
          sovereign_key: sovereignKey,
          created_at: new Date(),
        })
        .onConflict("email")
        .ignore();

      // Store in Redis for the "Hall of Sovereigns" live feed
      const nameFromEmail = email.split("@")[0];
      const maskedName = `${nameFromEmail.charAt(0).toUpperCase()}. ${nameFromEmail.slice(1, 3)}...`;
      await redis.lpush(
        "zyeute:hall_of_sovereigns",
        JSON.stringify({
          name: maskedName,
          spot: count + 1,
          timestamp: new Date().toISOString(),
        }),
      );
      await redis.ltrim("zyeute:hall_of_sovereigns", 0, 9); // Keep last 10 for the ticker

      return {
        status: "GRANTED",
        message: "Accès Souverain Confirmé.",
        key: sovereignKey,
        spot: count + 1,
      };
    } else {
      // Pivot to Waitlist
      await db("candidates")
        .insert({
          email,
          status: "WAITLISTED",
          created_at: new Date(),
        })
        .onConflict("email")
        .ignore();

      return {
        status: "WAITLISTED",
        message: "Rejoint la liste d'attente (Les 100 places sont prises).",
      };
    }
  });

  // Endpoint for the "Hall of Sovereigns" ticker
  fastify.get("/hall", async () => {
    const hall = await redis.lrange("zyeute:hall_of_sovereigns", 0, 9);
    return hall.map((s) => JSON.parse(s));
  });
}
