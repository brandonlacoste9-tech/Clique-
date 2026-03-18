import pg from 'pg';
const { Pool } = pg;
import fs from 'fs';

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_rvfBARYoa80g@ep-dawn-hall-advlpm60-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  try {
    const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    fs.writeFileSync('columns.txt', JSON.stringify(cols.rows.map(r => r.column_name), null, 2));
    console.log('Columns written to columns.txt');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
