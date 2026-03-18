import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_rvfBARYoa80g@ep-dawn-hall-advlpm60-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  const BOT_UUID = '11111111-1111-1111-1111-111111111111';
  try {
    const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    const columnNames = cols.rows.map(r => r.column_name);
    console.log('User columns:', columnNames);
    
    // We will build an insert query dynamically based on what exists.
    let query = `INSERT INTO users (id, username, display_name`;
    let valuesStr = `VALUES ($1, $2, $3`;
    let values = [BOT_UUID, 'NullClaw', 'NullClaw AI 🐝'];
    let idx = 4;
    
    if (columnNames.includes('phone')) {
      query += `, phone`;
      valuesStr += `, $${idx++}`;
      values.push('+00000000000');
    }
    if (columnNames.includes('bio')) {
      query += `, bio`;
      valuesStr += `, $${idx++}`;
      values.push('Your personal AI bestie.');
    }
    
    query += `) ${valuesStr}) ON CONFLICT (username) DO NOTHING RETURNING id;`;
    
    console.log('Executing:', query);
    const res = await pool.query(query, values);
    console.log('Inserted:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
