
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  console.log('Starting migrations...');
  try {
    await db.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS public_key TEXT;
    `);
    console.log('Added public_key to users');

    await db.query(`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS encryption_iv TEXT;
    `);
    console.log('Added is_encrypted and encryption_iv to messages');

    console.log('Migrations complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await db.end();
  }
}

migrate();
