// Database migration script
// Runs the init.sql schema on PostgreSQL

import { db } from '../src/models/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('Starting database migration...');

  try {
    // Read the init.sql file
    const sqlPath = path.join(__dirname, '..', 'config', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolons (simple split, handles basic SQL)
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // Execute each statement
    for (const statement of statements) {
      try {
        await db.query(statement);
        console.log(`✓ Executed: ${statement.substring(0, 50)}...`);
      } catch (err) {
        // Ignore errors for statements that already exist
        if (!err.message.includes('already exists') && !err.message.includes('does not exist')) {
          console.error(`Error executing: ${statement.substring(0, 50)}...`);
          console.error(err.message);
        }
      }
    }

    console.log('\n✅ Database migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigrations();
