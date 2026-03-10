// Cliques API - Geo-fenced communities
import { query } from '../models/db.js';

export default async function cliqueRoutes(fastify, opts) {
  
  // Get nearby cliques
  fastify.get('/nearby', async (request, reply) => {
    const userId = request.user.userId;
    const { lat, lng, radius = 5000 } = request.query;
    
    if (!lat || !lng) {
      return reply.code(400).send({ error: 'Location required' });
    }
    
    const result = await query(
      `SELECT 
        c.*,
        (SELECT COUNT(*) FROM clique_members cm WHERE cm.clique_id = c.id) as memberCount,
        (SELECT COUNT(*) FROM stories s WHERE s.clique_id = c.id AND s.expires_at > NOW()) as activeStoryCount,
        EXISTS(
          SELECT 1 FROM clique_members cm 
          WHERE cm.clique_id = c.id AND cm.user_id = $1
        ) as is_member
       FROM cliques c
       WHERE ST_DWithin(c.center, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4)
       ORDER BY ST_Distance(c.center, ST_SetSRID(ST_MakePoint($2, $3), 4326))
       LIMIT 20`,
      [userId, lng, lat, radius]
    );
    
    return {
      cliques: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        memberCount: parseInt(row.membercount),
        activeStoryCount: parseInt(row.activestorycount),
        isMember: row.is_member,
        location: {
          lat: row.center?.coordinates?.[1],
          lng: row.center?.coordinates?.[0],
          region: row.region,
          neighborhood: row.neighborhood
        }
      }))
    };
  });
  
  // Get my cliques
  fastify.get('/me', async (request, reply) => {
    const userId = request.user.userId;
    
    const result = await query(
      `SELECT 
        c.*,
        (SELECT COUNT(*) FROM clique_members cm WHERE cm.clique_id = c.id) as memberCount,
        cm.joined_at, cm.last_contributed_at
       FROM clique_members cm
       JOIN cliques c ON cm.clique_id = c.id
       WHERE cm.user_id = $1
       ORDER BY cm.last_contributed_at DESC NULLS LAST`,
      [userId]
    );
    
    return {
      cliques: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        memberCount: parseInt(row.membercount),
        joinedAt: row.joined_at,
        lastContributedAt: row.last_contributed_at,
        location: {
          lat: row.center?.coordinates?.[1],
          lng: row.center?.coordinates?.[0],
          region: row.region,
          neighborhood: row.neighborhood
        }
      }))
    };
  });
  
  // Join a clique
  fastify.post('/:slug/join', async (request, reply) => {
    const userId = request.user.userId;
    const { slug } = request.params;
    
    const cliqueResult = await query(
      'SELECT id FROM cliques WHERE slug = $1',
      [slug]
    );
    
    if (cliqueResult.rows.length === 0) {
      return reply.code(404).send({ error: 'Clique not found' });
    }
    
    const cliqueId = cliqueResult.rows[0].id;
    
    // Check if already member
    const existing = await query(
      'SELECT id FROM clique_members WHERE clique_id = $1 AND user_id = $2',
      [cliqueId, userId]
    );
    
    if (existing.rows.length > 0) {
      return reply.code(409).send({ error: 'Already a member' });
    }
    
    // Add member
    await query(
      `INSERT INTO clique_members (clique_id, user_id, joined_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (clique_id, user_id) DO NOTHING
       RETURNING *`,
      [cliqueId, userId]
    );
    
    // Update member count
    await query(
      'UPDATE cliques SET member_count = member_count + 1 WHERE id = $1',
      [cliqueId]
    );
    
    return { message: 'Joined clique' };
  });
  
  // Leave a clique
  fastify.delete('/:slug', async (request, reply) => {
    const userId = request.user.userId;
    const { slug } = request.params;
    
    const cliqueResult = await query(
      'SELECT id FROM cliques WHERE slug = $1',
      [slug]
    );
    
    if (cliqueResult.rows.length === 0) {
      return reply.code(404).send({ error: 'Clique not found' });
    }
    
    const cliqueId = cliqueResult.rows[0].id;
    
    // Remove member
    const result = await query(
      'DELETE FROM clique_members WHERE clique_id = $1 AND user_id = $2 RETURNING id',
      [cliqueId, userId]
    );
    
    if (result.rowCount === 0) {
      return reply.code(404).send({ error: 'Not a member' });
    }
    
    // Update member count
    await query(
      'UPDATE cliques SET member_count = member_count - 1 WHERE id = $1',
      [cliqueId]
    );
    
    return { message: 'Left clique' };
  });
  
  // Create a clique (only for Élite members)
  fastify.post('/', async (request, reply) => {
    const userId = request.user.userId;
    const { name, slug, lat, lng, radius = 2000, region, neighborhood } = request.body;
    
    if (!name || !slug || !lat || !lng) {
      return reply.code(400).send({ error: 'Name, slug, and location required' });
    }
    
    // Check if user is Élite (has a sovereign key or high snap score)
    const userResult = await query(
      'SELECT snap_score FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // For now, allow anyone with snap_score > 100 to create cliques
    // In production, check for sovereign key
    if (user.snap_score < 100) {
      return reply.code(403).send({ 
        error: 'Snap score too low to create cliques. Earn more snaps!' 
      });
    }
    
    // Check slug uniqueness
    const existing = await query(
      'SELECT id FROM cliques WHERE slug = $1',
      [slug]
    );
    
    if (existing.rows.length > 0) {
      return reply.code(409).send({ error: 'Slug already taken' });
    }
    
    // Create clique
    const result = await query(
      `INSERT INTO cliques (name, slug, center, radius_meters, region, neighborhood, created_by)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7, $8)
       RETURNING *`,
      [name, slug, lng, lat, radius, region, neighborhood, userId]
    );
    
    // Auto-join creator
    await query(
      `INSERT INTO clique_members (clique_id, user_id, joined_at)
       VALUES ($1, $2, NOW())`,
      [result.rows[0].id, userId]
    );
    
    return {
      message: 'Clique created',
      clique: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        slug: result.rows[0].slug
      }
    };
  });
  
  // Get clique members
  fastify.get('/:slug/members', async (request, reply) => {
    const { slug } = request.params;
    const userId = request.user.userId;
    
    const cliqueResult = await query(
      'SELECT id FROM cliques WHERE slug = $1',
      [slug]
    );
    
    if (cliqueResult.rows.length === 0) {
      return reply.code(404).send({ error: 'Clique not found' });
    }
    
    const cliqueId = cliqueResult.rows[0].id;
    
    // Check if user is member
    const membership = await query(
      'SELECT id FROM clique_members WHERE clique_id = $1 AND user_id = $2',
      [cliqueId, userId]
    );
    
    if (membership.rows.length === 0) {
      return reply.code(403).send({ error: 'Not a member of this clique' });
    }
    
    const result = await query(
      `SELECT 
        u.id, u.username, u.display_name, u.avatar_url,
        u.snap_score, u.last_active_at,
        cm.joined_at, cm.last_contributed_at
       FROM clique_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.clique_id = $1
       ORDER BY cm.last_contributed_at DESC NULLS LAST`,
      [cliqueId]
    );
    
    return {
      members: result.rows.map(row => ({
        id: row.id,
        username: row.username,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        snapScore: row.snap_score,
        lastActiveAt: row.last_active_at,
        joinedAt: row.joined_at,
        lastContributedAt: row.last_contributed_at
      }))
    };
  });
}
