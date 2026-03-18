import { query } from './src/models/db.js';

async function migrate() {
  try {
    console.log("Adding missing columns to users...");
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS snap_score INTEGER DEFAULT 0');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0');
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS story_visibility TEXT DEFAULT 'everyone'");
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_screenshots BOOLEAN DEFAULT true');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS ghost_mode BOOLEAN DEFAULT false');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP');
    
    // Check if ON CONFLICT (id) works (id must be primary key or unique)
    console.log("Ensuring id is unique...");
    // await query('ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id)'); 
    // Already has PRIMARY KEY in some systems, might fail if exists.
    
    console.log("Creating/updating NullClaw...");
    const BOT_UUID = '11111111-1111-1111-1111-111111111111';
    await query(`
      INSERT INTO users (id, username, display_name, name, bio, email)
      VALUES ($1, 'NullClaw', 'NullClaw AI 🐝', 'NullClaw', 'Your personal AI bestie.', 'nullclaw@chatsnap.ca')
      ON CONFLICT (id) DO UPDATE SET 
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        name = EXCLUDED.name
    `, [BOT_UUID]);
    
    console.log("Migration complete.");
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

migrate();
