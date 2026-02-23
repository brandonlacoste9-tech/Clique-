// PostgreSQL database client
import pg from 'pg';
const { Pool } = pg;
import { config } from '../config/index.js';

export const db = new Pool({
  connectionString: config.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper for transactions
export async function withTransaction(callback) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Query helper with logging
export async function query(text, params) {
  const start = Date.now();
  const result = await db.query(text, params);
  const duration = Date.now() - start;
  
  if (config.NODE_ENV === 'development') {
    console.log('Query:', { text: text.substring(0, 100), duration, rows: result.rowCount });
  }
  
  return result;
}
