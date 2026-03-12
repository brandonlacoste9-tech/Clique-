import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { config } from "../config/index.js";

// Configure S3 client (MinIO or AWS)
const s3Client = new S3Client({
  endpoint: config.MINIO_USE_SSL
    ? `https://${config.MINIO_ENDPOINT}`
    : `http://${config.MINIO_ENDPOINT}`,
  region: "us-east-1", // MinIO doesn't care about region
  credentials: {
    accessKeyId: config.MINIO_ACCESS_KEY,
    secretAccessKey: config.MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // Required for MinIO
});

export default async function uploadRoutes(fastify, opts) {
  // Get presigned URL for upload
  fastify.post("/presigned", async (request, reply) => {
    const userId = request.user.userId;
    const { contentType, fileExtension = "jpg" } = request.body;

    if (!contentType) {
      return reply.code(400).send({ error: "Content type required" });
    }

    // Validate content type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/heic",
      "video/mp4",
      "video/quicktime",
      "video/webm",
    ];

    if (!allowedTypes.includes(contentType)) {
      return reply.code(400).send({ error: "Invalid content type" });
    }

    // Generate unique key
    const timestamp = Date.now();
    const randomId = uuidv4().split("-")[0];
    const key = `uploads/${userId}/${timestamp}-${randomId}.${fileExtension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: config.MINIO_BUCKET,
        Key: key,
        ContentType: contentType,
      });

      // Generate presigned URL (valid for 5 minutes)
      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 300,
      });

      // Public URL for viewing
      const publicUrl = config.MINIO_USE_SSL
        ? `https://${config.MINIO_ENDPOINT}/${config.MINIO_BUCKET}/${key}`
        : `http://${config.MINIO_ENDPOINT}/${config.MINIO_BUCKET}/${key}`;

      return {
        presignedUrl,
        publicUrl,
        key,
        expiresIn: 300,
      };
    } catch (err) {
      fastify.log.error("Presigned URL error:", err);
      return reply.code(500).send({ error: "Failed to generate upload URL" });
    }
  });

  // Confirm upload and create story record
  fastify.post("/story", async (request, reply) => {
    const userId = request.user.userId;
    let {
      mediaKey,
      mediaType,
      thumbnailKey,
      caption = "",
      mood = null,
      isPublic = false,
      allowReplies = true,
      location = null, // { lat, lng, name }
    } = request.body;

    if (!mediaKey || !mediaType) {
      return reply.code(400).send({ error: "Media key and type required" });
    }

    // Validate media type
    if (!["image", "video"].includes(mediaType)) {
      return reply.code(400).send({ error: "Invalid media type" });
    }

    // YOLO Auto-Tagging
    if (mediaType === "image") {
      try {
        const publicUrl = config.MINIO_USE_SSL
          ? `https://${config.MINIO_ENDPOINT}/${config.MINIO_BUCKET}/${mediaKey}`
          : `http://${config.MINIO_ENDPOINT}/${config.MINIO_BUCKET}/${mediaKey}`;
        
        const formParams = new URLSearchParams();
        formParams.append("image_url", publicUrl);
        
        const yoloRes = await axios.post("http://yolo-service:8000/detect", formParams, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 5000
        });

        if (yoloRes.data && yoloRes.data.tags && yoloRes.data.tags.length > 0) {
          // Find the most confident tag
          const topTag = yoloRes.data.tags.reduce((prev, current) => 
            (prev.confidence > current.confidence) ? prev : current
          );
          
          if (!mood) {
            mood = `auto-tag: ${topTag.class}`;
          } else {
            mood = `${mood} | auto-tag: ${topTag.class}`;
          }
          fastify.log.info(`YOLO detection identified: ${topTag.class}`);
        }
      } catch (err) {
        fastify.log.warn(`YOLO service failed or unreachable: ${err.message}`);
      }
    }

    try {
      // Calculate expiry (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + config.STORY_TTL_HOURS);

      // Insert story
      const result = await request.server.db.query(
        `INSERT INTO stories (
          user_id, media_key, media_type, thumbnail_key,
          caption, mood, is_public, allow_replies,
          location, expires_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 
          ${location ? `ST_SetSRID(ST_MakePoint($9, $10), 4326)` : "NULL"},
          $11, NOW()
        ) RETURNING *`,
        location
          ? [
              userId,
              mediaKey,
              mediaType,
              thumbnailKey,
              caption,
              mood,
              isPublic,
              allowReplies,
              location.lng,
              location.lat,
              expiresAt,
            ]
          : [
              userId,
              mediaKey,
              mediaType,
              thumbnailKey,
              caption,
              mood,
              isPublic,
              allowReplies,
              expiresAt,
            ],
      );

      const story = result.rows[0];

      // Invalidate user's story cache
      const { storyCache } = await import("../services/redis.js");
      await storyCache.invalidateUserStories(userId);

      return {
        story: {
          id: story.id,
          mediaKey: story.media_key,
          mediaType: story.media_type,
          thumbnailKey: story.thumbnail_key,
          caption: story.caption,
          mood: story.mood,
          isPublic: story.is_public,
          allowReplies: story.allow_replies,
          expiresAt: story.expires_at,
          createdAt: story.created_at,
        },
      };
    } catch (err) {
      fastify.log.error("Story creation error:", err);
      return reply.code(500).send({ error: "Failed to create story" });
    }
  });

  // Get media URL (with optional transformation)
  fastify.get("/media/:key", async (request, reply) => {
    const { key } = request.params;
    const { thumbnail = false } = request.query;

    try {
      // For now, redirect to public URL
      // In production, you might want to proxy through your CDN
      const publicUrl = config.MINIO_USE_SSL
        ? `https://${config.MINIO_ENDPOINT}/${config.MINIO_BUCKET}/${key}`
        : `http://${config.MINIO_ENDPOINT}/${config.MINIO_BUCKET}/${key}`;

      return reply.redirect(publicUrl);
    } catch (err) {
      fastify.log.error("Media fetch error:", err);
      return reply.code(500).send({ error: "Failed to fetch media" });
    }
  });
}
