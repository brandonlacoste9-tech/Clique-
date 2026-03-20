import { query } from './src/models/db.js';

async function migrate() {
  try {
    console.log("Creating candidates table (Elite Queue)...");
    await query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'WAITLISTED',
        sovereign_key VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("Adding prestige columns to users...");
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS influence_score NUMERIC DEFAULT 0,
      ADD COLUMN IF NOT EXISTS sovereign_tier VARCHAR(50) DEFAULT 'INCEPTION'
    `);

    console.log("Elite migration complete.");
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

migrate();
