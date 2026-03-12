// WebSocket Service — Real-time messaging & presence
import { presence } from "./redis.js";

// Map userId → Set of WebSocket connections
const connections = new Map();
// Map cliqueId → Set of WebSocket connections
const rooms = new Map();

export function registerConnection(userId, socket) {
  if (!connections.has(userId)) {
    connections.set(userId, new Set());
  }
  connections.get(userId).add(socket);
  socket.rooms = new Set(); // Track rooms this socket is in

  presence.setOnline(userId, `ws-${Date.now()}`);

  socket.on("close", () => {
    // Cleanup connections
    const userConns = connections.get(userId);
    if (userConns) {
      userConns.delete(socket);
      if (userConns.size === 0) {
        connections.delete(userId);
        presence.setOffline(userId);
      }
    }

    // Cleanup rooms
    if (socket.rooms) {
      for (const cliqueId of socket.rooms) {
        leaveRoom(cliqueId, socket);
      }
    }
  });
}

export function joinRoom(cliqueId, socket) {
  if (!rooms.has(cliqueId)) {
    rooms.set(cliqueId, new Set());
  }
  rooms.get(cliqueId).add(socket);
  if (socket.rooms) {
    socket.rooms.add(cliqueId);
  }
  console.log(`[WS] User joined clique ${cliqueId}`);
}

export function leaveRoom(cliqueId, socket) {
  const roomSockets = rooms.get(cliqueId);
  if (roomSockets) {
    roomSockets.delete(socket);
    if (roomSockets.size === 0) {
      rooms.delete(cliqueId);
    }
  }
  if (socket.rooms) {
    socket.rooms.delete(cliqueId);
  }
}

export function sendToRoom(cliqueId, event, data) {
  const roomSockets = rooms.get(cliqueId);
  if (!roomSockets) return 0;

  const payload = JSON.stringify({
    event,
    data,
    timestamp: new Date().toISOString(),
  });

  let count = 0;
  for (const socket of roomSockets) {
    try {
      socket.send(payload);
      count++;
    } catch (err) {
      roomSockets.delete(socket);
    }
  }
  return count;
}

export function sendToUser(userId, event, data) {
  const userConns = connections.get(userId);
  if (!userConns) return false;

  const payload = JSON.stringify({
    event,
    data,
    timestamp: new Date().toISOString(),
  });

  for (const socket of userConns) {
    try {
      socket.send(payload);
    } catch (err) {
      console.error(`[WS] Failed to send to ${userId}:`, err.message);
      userConns.delete(socket);
    }
  }
  return true;
}

export function isUserConnected(userId) {
  const conns = connections.get(userId);
  return conns && conns.size > 0;
}

export function getOnlineCount() {
  return connections.size;
}

// WebSocket route handler for Fastify
export async function websocketRoutes(fastify) {
  fastify.get("/ws", { websocket: true }, (socket, request) => {
    const userId = request.user?.userId;

    if (!userId) {
      socket.close(4001, "Unauthorized");
      return;
    }

    console.log(`[WS] 🔌 ${userId} connected`);
    registerConnection(userId, socket);

    // Send connection confirmation
    socket.send(
      JSON.stringify({
        event: "connected",
        data: { message: "Bienvenue dans l'Élite", userId },
        timestamp: new Date().toISOString(),
      }),
    );

    // Handle incoming messages
    socket.on("message", (rawMsg) => {
      try {
        const msg = JSON.parse(rawMsg.toString());
        handleSocketMessage(userId, msg, socket);
      } catch (err) {
        socket.send(
          JSON.stringify({
            event: "error",
            data: { message: "Invalid message format" },
          }),
        );
      }
    });

    socket.on("error", (err) => {
      console.error(`[WS] Error for ${userId}:`, err.message);
    });
  });
}

function handleSocketMessage(userId, msg, socket) {
  switch (msg.event) {
    case "typing":
      // Forward typing indicator to recipient
      if (msg.data?.recipientId) {
        sendToUser(msg.data.recipientId, "typing", {
          userId,
          conversationId: msg.data.conversationId,
        });
      }
      break;

    case "stop_typing":
      if (msg.data?.recipientId) {
        sendToUser(msg.data.recipientId, "stop_typing", {
          userId,
          conversationId: msg.data.conversationId,
        });
      }
      break;

    case "read_receipt":
      if (msg.data?.recipientId) {
        sendToUser(msg.data.recipientId, "read_receipt", {
          userId,
          messageId: msg.data.messageId,
          readAt: new Date().toISOString(),
        });
      }
      break;

    case "join_clique":
      if (msg.data?.cliqueId) {
        joinRoom(msg.data.cliqueId, socket);
      }
      break;

    case "leave_clique":
      if (msg.data?.cliqueId) {
        leaveRoom(msg.data.cliqueId, socket);
      }
      break;

    case "clique_typing":
      if (msg.data?.cliqueId) {
        sendToRoom(msg.data.cliqueId, "clique_typing", {
          userId,
          cliqueId: msg.data.cliqueId,
          isTyping: msg.data.isTyping,
        });
      }
      break;

    case "ping":
      socket.send(JSON.stringify({ event: "pong", data: { ts: Date.now() } }));
      break;

    default:
      break;
  }
}
