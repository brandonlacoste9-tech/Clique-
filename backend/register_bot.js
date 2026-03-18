import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_rvfBARYoa80g@ep-dawn-hall-advlpm60-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  const BOT_UUID = '11111111-1111-1111-1111-111111111111';
  try {
    const res = await pool.query(
      `INSERT INTO users (id, name, email) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (id) DO NOTHING RETURNING id;`,
      [BOT_UUID, 'NullClaw AI 🐝', 'nullclaw@chatsnap.ca']
    );
    console.log('Inserted:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
