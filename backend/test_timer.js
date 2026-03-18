import { query } from './src/models/db.js';

async function test() {
  const BOT_UUID = '11111111-1111-1111-1111-111111111111';
  const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NzA2Zjk1Mi1kMmQzLTQzN2YtYTZiYi1kNWRkNzJiMzcyY2IiLCJpYXQiOjE3NzM3ODg4Mjh9.M5POF-W7FwtYoNTSO8CrNFPFgc8ja5nrtcj2NMtNK_I';
  const userId = '4706f952-d2d3-437f-a6bb-d5dd72b372cb';

  console.log("Testing with user:", userId);

  // 2. Find or create a conversation between user and bot
  let convRes = await query(
    "SELECT id FROM conversations WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)",
    [userId, BOT_UUID]
  );
  
  let convId;
  if (convRes.rows.length === 0) {
    const insertRes = await query(
      "INSERT INTO conversations (user_a, user_b, last_message_at) VALUES ($1, $2, NOW()) RETURNING id",
      [userId, BOT_UUID]
    );
    convId = insertRes.rows[0].id;
    console.log("Created new conversation:", convId);
  } else {
    convId = convRes.rows[0].id;
    console.log("Using existing conversation:", convId);
  }

  // 3. Trigger the timer endpoint (backend port 3001, prefix /api)
  console.log(`Triggering timer for ${convId}...`);
  const resp = await fetch(`http://localhost:3001/api/conversations/${convId}/timer`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_TOKEN}`
    },
    body: JSON.stringify({ durationSeconds: 5 })
  });
  
  const result = await resp.json();
  console.log("Backend response:", result);

  console.log("Waiting 10 seconds for wipe to execute...");
  setTimeout(() => {
    console.log("Done. Check logs/files.");
    process.exit(0);
  }, 10000);
}

test().catch(err => { console.error(err); process.exit(1); });
