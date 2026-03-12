// Cliques API — Geo-fenced group communities
import { query } from "../models/db.js";
import { notifyCliqueMessage } from "../services/pushNotificationService.js";

export default async function cliqueRoutes(fastify, opts) {
  // Get nearby cliques
  fastify.get("/nearby", async (request, reply) => {
    const { lat, lng, radius = 5000 } = request.query;

    if (!lat || !lng) {
      return reply.code(400).send({ error: "Location required (lat, lng)" });
    }

    const result = await query(
      `SELECT 
        c.id, c.name, c.slug, c.region, c.neighborhood,
        c.member_count, c.active_story_count,
        ST_X(c.center::geometry) as lng,
        ST_Y(c.center::geometry) as lat,
        ST_Distance(c.center, ST_SetSRID(ST_MakePoint($1, $2), 4326)) as distance_meters,
        EXISTS(
          SELECT 1 FROM clique_members cm 
          WHERE cm.clique_id = c.id AND cm.user_id = $3
        ) as is_member
       FROM cliques c
       WHERE ST_DWithin(c.center, ST_SetSRID(ST_MakePoint($1, $2), 4326), $4)
       ORDER BY distance_meters ASC
       LIMIT 20`,
      [lng, lat, request.user.userId, radius],
    );

    return {
      cliques: result.rows.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        region: c.region,
        neighborhood: c.neighborhood,
        memberCount: c.member_count,
        activeStoryCount: c.active_story_count,
        location: { lat: c.lat, lng: c.lng },
        distanceMeters: Math.round(c.distance_meters),
        isMember: c.is_member,
      })),
    };
  });

  // Get clique details
  fastify.get("/:slug", async (request, reply) => {
    const { slug } = request.params;
    const userId = request.user.userId;

    const result = await query(
      `SELECT 
        c.*,
        ST_X(c.center::geometry) as lng,
        ST_Y(c.center::geometry) as lat,
        EXISTS(
          SELECT 1 FROM clique_members cm 
          WHERE cm.clique_id = c.id AND cm.user_id = $1
        ) as is_member
       FROM cliques c WHERE c.slug = $2`,
      [userId, slug],
    );

    if (result.rows.length === 0) {
      return reply.code(404).send({ error: "Clique not found" });
    }

    const clique = result.rows[0];

    // Get members
    const members = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, cm.joined_at
       FROM clique_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.clique_id = $1
       ORDER BY cm.joined_at ASC
       LIMIT 50`,
      [clique.id],
    );

    // Get recent stories in this clique
    const stories = await query(
      `SELECT s.id, s.media_key, s.media_type, s.caption, s.created_at, s.view_count,
              u.username, u.avatar_url
       FROM stories s
       JOIN users u ON s.user_id = u.id
       JOIN clique_members cm ON cm.user_id = s.user_id AND cm.clique_id = $1
       WHERE s.expires_at > NOW()
       ORDER BY s.created_at DESC
       LIMIT 20`,
      [clique.id],
    );

    return {
      id: clique.id,
      name: clique.name,
      slug: clique.slug,
      region: clique.region,
      neighborhood: clique.neighborhood,
      memberCount: clique.member_count,
      location: { lat: clique.lat, lng: clique.lng },
      radiusMeters: clique.radius_meters,
      isMember: clique.is_member,
      members: members.rows.map((m) => ({
        id: m.id,
        username: m.username,
        displayName: m.display_name,
        avatarUrl: m.avatar_url,
        joinedAt: m.joined_at,
      })),
      stories: stories.rows.map((s) => ({
        id: s.id,
        mediaKey: s.media_key,
        mediaType: s.media_type,
        caption: s.caption,
        createdAt: s.created_at,
        viewCount: s.view_count,
        user: { username: s.username, avatarUrl: s.avatar_url },
      })),
    };
  });

  // Create a new clique
  fastify.post("/", async (request, reply) => {
    const userId = request.user.userId;
    const {
      name,
      lat,
      lng,
      radiusMeters = 2000,
      region,
      neighborhood,
    } = request.body;

    if (!name || !lat || !lng) {
      return reply.code(400).send({ error: "Name and location required" });
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check existing slug
    const existing = await query("SELECT id FROM cliques WHERE slug = $1", [
      slug,
    ]);
    if (existing.rows.length > 0) {
      return reply.code(409).send({ error: "Ce nom de clique est déjà pris" });
    }

    const result = await query(
      `INSERT INTO cliques (name, slug, center, radius_meters, region, neighborhood, member_count, created_by)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7, 1, $8)
       RETURNING *`,
      [name, slug, lng, lat, radiusMeters, region, neighborhood, userId],
    );

    // Auto-join creator
    await query(
      `INSERT INTO clique_members (clique_id, user_id) VALUES ($1, $2)`,
      [result.rows[0].id, userId],
    );

    return {
      message: "Clique créée!",
      clique: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        slug: result.rows[0].slug,
      },
    };
  });

  // Join a clique
  fastify.post("/:id/join", async (request, reply) => {
    const userId = request.user.userId;
    const { id } = request.params;

    // Check clique exists
    const clique = await query("SELECT id FROM cliques WHERE id = $1", [id]);
    if (clique.rows.length === 0) {
      return reply.code(404).send({ error: "Clique not found" });
    }

    // Check not already member
    const existing = await query(
      "SELECT id FROM clique_members WHERE clique_id = $1 AND user_id = $2",
      [id, userId],
    );
    if (existing.rows.length > 0) {
      return reply.code(409).send({ error: "Déjà membre de cette clique" });
    }

    await query(
      "INSERT INTO clique_members (clique_id, user_id) VALUES ($1, $2)",
      [id, userId],
    );

    // Increment member count
    await query(
      "UPDATE cliques SET member_count = member_count + 1 WHERE id = $1",
      [id],
    );

    return { message: "Bienvenue dans la clique!" };
  });

  // Leave a clique
  fastify.delete("/:id/leave", async (request, reply) => {
    const userId = request.user.userId;
    const { id } = request.params;

    const result = await query(
      "DELETE FROM clique_members WHERE clique_id = $1 AND user_id = $2 RETURNING id",
      [id, userId],
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({ error: "Pas membre de cette clique" });
    }

    // Decrement member count
    await query(
      "UPDATE cliques SET member_count = GREATEST(0, member_count - 1) WHERE id = $1",
      [id],
    );

    return { message: "Tu as quitté la clique" };
  });

  // Get clique messages
  fastify.get("/:id/messages", async (request, reply) => {
    const { id } = request.params;
    const { limit = 50, before } = request.query;

    let sql = `
      SELECT cm.id, cm.content_type, cm.text_content, cm.content_key, cm.sent_at,
             u.username, u.display_name, u.avatar_url
      FROM clique_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.clique_id = $1
    `;
    const params = [id];

    if (before) {
      sql += ` AND cm.sent_at < $2`;
      params.push(before);
    }

    sql += ` ORDER BY cm.sent_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(sql, params);

    return {
      messages: result.rows.map((m) => ({
        id: m.id,
        contentType: m.content_type,
        text: m.text_content,
        contentKey: m.content_key,
        sentAt: m.sent_at,
        sender: {
          username: m.username,
          displayName: m.display_name,
          avatarUrl: m.avatar_url,
        },
      })),
    };
  });

  // Send message to clique
  fastify.post("/:id/messages", async (request, reply) => {
    const userId = request.user.userId;
    const { id } = request.params;
    const { text, type = "text", contentKey } = request.body;

    if (!text && !contentKey) {
      return reply.code(400).send({ error: "Message content required" });
    }

    // Save to DB
    const result = await query(
      `INSERT INTO clique_messages (clique_id, sender_id, content_type, text_content, content_key)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, sent_at`,
      [id, userId, type, text, contentKey],
    );

    const messageId = result.rows[0].id;
    const sentAt = result.rows[0].sent_at;

    // Get sender info for broadcast
    const user = await query(
      "SELECT username, display_name, avatar_url FROM users WHERE id = $1",
      [userId],
    );

    const broadcastData = {
      id: messageId,
      cliqueId: id,
      contentType: type,
      text,
      contentKey,
      sentAt,
      sender: {
        userId,
        username: user.rows[0].username,
        displayName: user.rows[0].display_name,
        avatarUrl: user.rows[0].avatar_url,
      },
    };

    // Broadcast via WebSocket
    const { sendToRoom } = await import("../services/websocket.js");
    sendToRoom(id, "clique_message", broadcastData);

    // Send push notifications to members NOT in the room
    const cliqueInfo = await query("SELECT name FROM cliques WHERE id = $1", [id]);
    const cliqueName = cliqueInfo.rows[0]?.name || "La Clique";
    const preview = type === "text" ? text : `📷 ${type}`;
    
    notifyCliqueMessage(id, cliqueName, user.rows[0].username, preview, userId).catch(err => {
      fastify.log.error("Clique push error:", err.message);
    });

    return { message: "Message envoyé", messageId };
  });
}
