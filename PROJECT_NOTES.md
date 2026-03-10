# CLIQUE - Project Notes

## Current Status (March 10, 2026)

### ✅ Completed
- All missing backend files created:
  - `backend/src/services/websocket.js` - WebSocket handlers
  - `backend/src/api/cliques.js` - Geo-fenced clique API
  - `backend/src/worker.js` - Background job processor
  - `backend/Dockerfile.worker` - Worker Dockerfile
  - `backend/scripts/migrate.js` - Database migration script
  - `backend/scripts/seed.js` - Database seeding script

- Environment setup:
  - `.env` - Root environment variables
  - `backend/.env` - Backend environment variables
  - `backend/.env.example` - Environment template
  - `frontend/.env.local` - Frontend environment

- Frontend updates:
  - `frontend/src/services/websocketClient.js` - WebSocket client
  - `frontend/src/store/cliqueStore.js` - WebSocket connection on auth
  - `frontend/src/api/cliqueApi.js` - API URL from env
  - `frontend/src/services/eliteGreetingService.js` - Graceful sound handling

- Bug fixes:
  - Backend logger transport removed (pino-pretty issue)
  - Upload.js S3 client lazy loaded
  - Upload.js route param fixed (`:key(*)` → `*`)

### ⚠️ Requirements to Run

**Backend needs:**
- PostgreSQL 16 on `localhost:5432`
- Redis 7 on `localhost:6379`
- MinIO on `localhost:9000` (or update `MINIO_ENDPOINT` in `.env`)

**Frontend needs:**
- Expo dev server running
- Backend API at `http://localhost:3001`

### 📝 Next Steps

1. Start PostgreSQL, Redis, MinIO (Docker or local)
2. Run migrations: `docker-compose exec api npm run db:migrate`
3. Seed data: `docker-compose exec api npm run db:seed`
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `cd frontend && npm start`

### 🔧 Environment Variables

**Root `.env`:**
- `DB_PASSWORD` - PostgreSQL password
- `MINIO_PASSWORD` - MinIO password
- `JWT_SECRET` - JWT signing secret

**Backend `backend/.env`:**
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `MINIO_ENDPOINT` - MinIO endpoint
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `CORS_ORIGINS` - Allowed origins

### 📦 Dependencies Installed

- Backend: 401 packages (Fastify, PostgreSQL, Redis, MinIO SDK, etc.)
- Frontend: Expo SDK 55, React Native 0.76, React Navigation, Zustand, etc.

### 🐛 Known Issues

- Redis connection errors shown when Redis not running (expected)
- Backend starts but can't connect to database without PostgreSQL/Redis

### 🎯 Features Implemented

**Backend:**
- Phone OTP authentication
- Stories CRUD with view tracking
- DMs with ephemeral support
- Friendships
- Cliques (geo-fenced groups)
- Media upload with presigned URLs
- Elite queue (first 100 users)
- WebSocket for real-time updates
- Background worker for cleanup

**Frontend:**
- Auth flow (phone + Snapchat login)
- Camera with recording/upload
- Stories feed
- Chat/Elite tab
- Map with friend locations
- Profile screen
- WebSocket connection
- Elite greeting service
