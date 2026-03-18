
import { query } from "../models/db.js";

/**
 * AURUM Service - The voice of the Golden Concierge.
 */
export const aurumService = {
  AURUM_ID: '11111111-1111-1111-1111-111111111111',

  // Send a formal warning or insight directly from AURUM
  sendAlert: async (recipientId, text) => {
    try {
      // 1. Insert the system message
      const msgResult = await query(
        `INSERT INTO messages (sender_id, recipient_id, content_type, text_content, sent_at)
         VALUES ($1, $2, 'text', $3, NOW())
         RETURNING id`,
        [aurumService.AURUM_ID, recipientId, `⚜️ AURUM: ${text}`]
      );

      const msgId = msgResult.rows[0].id;

       // 2. Update the conversation summary
      const [uA, uB] = [aurumService.AURUM_ID, recipientId].sort();
      const isRecipientA = (uA === recipientId);
      
      await query(
        `INSERT INTO conversations (user_a, user_b, last_message_id, last_message_at, unread_count_a, unread_count_b)
         VALUES ($1::uuid, $2::uuid, $3, NOW(), 
           ${isRecipientA ? 1 : 0}, 
           ${isRecipientA ? 0 : 1}
         )
         ON CONFLICT (user_a, user_b) DO UPDATE SET 
           last_message_id = $3,
           last_message_at = NOW(),
           unread_count_a = conversations.unread_count_a + ${isRecipientA ? 1 : 0},
           unread_count_b = conversations.unread_count_b + ${isRecipientA ? 0 : 1}`,
        [uA, uB, msgId]
      );

      console.log(`[AURUM] Alert sent to ${recipientId}: ${text}`);
    } catch (err) {
      console.error("[AURUM] Alert failed:", err.message);
    }
  }
};
