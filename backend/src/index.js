import * as Sentry from "@sentry/node";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import websocket from "@fastify/websocket";

import { config } from "./config/index.js";
import { db } from "./models/db.js";
import { redis } from "./services/redis.js";

Sentry.init({
  dsn: config.SENTRY_DSN,
  environment: config.NODE_ENV,
  release: "clique-api@2026.1.0",
  tracesSampleRate: config.NODE_ENV === "production" ? 0.2 : 1.0,
  enabled: !!config.SENTRY_DSN,
});

// Routes
import authRoutes from "./api/auth.js";
import userRoutes from "./api/users.js";
import storyRoutes from "./api/stories.js";
import messageRoutes from "./api/messages.js";
import cliqueRoutes from "./api/cliques.js";
import uploadRoutes from "./api/upload.js";
import eliteQueueRoutes from "./api/eliteQueue.js";
import notificationRoutes from "./api/notifications.js";
import reactionRoutes from "./api/reactions.js";
import schedulingRoutes from "./api/scheduling.js";
import blockingRoutes from "./api/blocking.js";
import subscriptionRoutes from "./api/subscriptions.js";

// WebSocket handlers
import { storySocketHandler } from "./services/websocket.js";

const app = Fastify({
  logger: {
    level: config.NODE_ENV === "production" ? "info" : "debug",
    // transport: config.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
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
await app.register(notificationRoutes, { prefix: "/notifications" });
await app.register(reactionRoutes, { prefix: "/reactions" });
await app.register(schedulingRoutes, { prefix: "/scheduling" });
await app.register(blockingRoutes, { prefix: "/blocking" });
await app.register(subscriptionRoutes, { prefix: "/subscriptions" });

// WebSocket routes
app.register(async function (fastify) {
  fastify.get("/ws/stories", { websocket: true }, storySocketHandler);
});

// Capture unhandled errors with Sentry
app.setErrorHandler((error, request, reply) => {
  Sentry.captureException(error, {
    extra: {
      url: request.url,
      method: request.method,
      params: request.params,
      query: request.query,
    },
  });
  app.log.error(error);
  reply.code(error.statusCode || 500).send({
    error: error.message || "Internal Server Error",
  });
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
  Sentry.captureException(err);
  app.log.error(err);
  await Sentry.flush(2000);
  process.exit(1);
}
