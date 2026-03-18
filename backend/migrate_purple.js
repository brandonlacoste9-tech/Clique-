import { query } from './src/models/db.js';

async function migrate() {
  try {
    console.log("Creating friendships table...");
    await query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending', -- pending, accepted, blocked
        streak_count INTEGER DEFAULT 0,
        streak_last_snapped_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_a, user_b),
        CHECK (user_a < user_b) -- Canonical order to avoid duplicates (e.g. 1,2 and 2,1)
      )
    `);

    console.log("Adding default NullClaw friendship for all existing users...");
    const BOT_UUID = '11111111-1111-1111-1111-111111111111';
    const users = await query('SELECT id FROM users WHERE id != $1', [BOT_UUID]);
    for (const u of users.rows) {
      const [a, b] = [u.id, BOT_UUID].sort();
      await query(`
        INSERT INTO friendships (user_a, user_b, status)
        VALUES ($1, $2, 'accepted')
        ON CONFLICT (user_a, user_b) DO NOTHING
      `, [a, b]);
    }

    console.log("Purple migration (v1) complete.");
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

migrate();
