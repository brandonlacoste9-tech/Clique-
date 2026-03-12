// WebSocket client service for real-time messaging
import { useAuthStore } from "../store/cliqueStore";

const API_HOST = "localhost:3001"; // Change for production

let ws = null;
let reconnectTimer = null;
let messageHandlers = new Set();
let isConnecting = false;

export function addMessageHandler(handler) {
  messageHandlers.add(handler);
  return () => messageHandlers.delete(handler);
}

function notifyHandlers(event, data) {
  for (const handler of messageHandlers) {
    try {
      handler(event, data);
    } catch (err) {
      console.error("[WS] Handler error:", err);
    }
  }
}

export function connectWebSocket() {
  if (isConnecting || (ws && ws.readyState === WebSocket.OPEN)) return;

  const token = useAuthStore.getState().token;
  if (!token) return;

  isConnecting = true;
  const wsUrl = `ws://${API_HOST}/ws?token=${encodeURIComponent(token)}`;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("[WS] ✅ Connected");
      isConnecting = false;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      notifyHandlers("connected", {});
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        notifyHandlers(msg.event, msg.data);
      } catch (err) {
        console.error("[WS] Parse error:", err);
      }
    };

    ws.onclose = (event) => {
      console.log("[WS] Disconnected:", event.code);
      isConnecting = false;
      ws = null;

      // Auto-reconnect after 3 seconds (unless logout)
      const token = useAuthStore.getState().token;
      if (token && event.code !== 4001) {
        reconnectTimer = setTimeout(connectWebSocket, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error("[WS] Error:", error.message);
      isConnecting = false;
    };
  } catch (err) {
    console.error("[WS] Connection failed:", err);
    isConnecting = false;
  }
}

export function disconnectWebSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
}

export function sendTyping(recipientId) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ event: "typing", data: { recipientId } }));
  }
}

export function sendStopTyping(recipientId) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ event: "stop_typing", data: { recipientId } }));
  }
}

export function sendReadReceipt(recipientId, messageId) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        event: "read_receipt",
        data: { recipientId, messageId },
      }),
    );
  }
}
