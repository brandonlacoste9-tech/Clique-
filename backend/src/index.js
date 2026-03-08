import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import websocket from "@fastify/websocket";

import { config } from "./config/index.js";
import { db } from "./models/db.js";
import { redis } from "./services/redis.js";

// Routes
import authRoutes from "./api/auth.js";
import userRoutes from "./api/users.js";
import storyRoutes from "./api/stories.js";
import messageRoutes from "./api/messages.js";
import cliqueRoutes from "./api/cliques.js";
import uploadRoutes from "./api/upload.js";
import eliteQueueRoutes from "./api/eliteQueue.js";

// WebSocket handlers
import { storySocketHandler } from "./services/websocket.js";

const app = Fastify({
  logger: {
    level: config.NODE_ENV === "production" ? "info" : "debug",
    transport:
      config.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
  },
});

// Register plugins
await app.register(cors, {
  origin: config.CORS_ORIGINS,
  credentials: true,
});

await app.register(jwt, {
  secret: config.JWT_SECRET,
  cookie: {
    cookieName: "clique_token",
    signed: false,
  },
});

await app.register(multipart, {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for videos
    files: 1,
  },
});

await app.register(websocket);

// Decorate with database and cache
app.decorate("db", db);
app.decorate("redis", redis);

// Auth hook
app.addHook("onRequest", async (request, reply) => {
  // Public routes that don't need auth
  const publicRoutes = ["/auth/verify", "/auth/refresh", "/health", "/elite"];
  if (publicRoutes.some((route) => request.url.startsWith(route))) {
    return;
  }

  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: "Unauthorized" });
  }
});

// Register routes
await app.register(authRoutes, { prefix: "/auth" });
await app.register(userRoutes, { prefix: "/users" });
await app.register(storyRoutes, { prefix: "/stories" });
await app.register(messageRoutes, { prefix: "/messages" });
await app.register(cliqueRoutes, { prefix: "/cliques" });
await app.register(uploadRoutes, { prefix: "/upload" });
await app.register(eliteQueueRoutes, { prefix: "/elite" });

// WebSocket routes
app.register(async function (fastify) {
  fastify.get("/ws/stories", { websocket: true }, storySocketHandler);
});

// Health check
app.get("/health", async () => {
  return {
    status: "ok",
    version: "2026.1.0",
    region: "quebec",
    timestamp: new Date().toISOString(),
  };
});

// Start server
try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info(`Clique API running on port ${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
