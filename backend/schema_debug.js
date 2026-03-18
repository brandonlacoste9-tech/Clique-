import { query } from './src/models/db.js';

async function test() {
  const res = await query("SELECT id, name FROM users WHERE name = 'Brandon'");
  console.log(res.rows);
  process.exit(0);
}

test();
