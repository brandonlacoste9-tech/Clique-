# Clique - Tech Stack & Conventions

## Build System

**Backend**: Node.js 22 + npm
**Frontend**: Expo SDK 55 + React Native 0.76

## Tech Stack

### Backend
- **Framework**: Fastify 5.x (lightweight, fast, plugin-based)
- **Database**: PostgreSQL 16 (persistent data)
- **Cache/Queue**: Redis 7 (ephemeral stories, presence, BullMQ)
- **Storage**: MinIO (S3-compatible for media uploads)
- **Auth**: JWT with cookie-based sessions
- **SMS**: Twilio for phone verification
- **Media Processing**: FFmpeg + Sharp for video/image manipulation
- **Push Notifications**: Expo Server SDK
- **Validation**: Zod schemas

### Frontend
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State**: Zustand with AsyncStorage persistence
- **HTTP**: Axios with interceptors
- **Real-time**: Socket.io-client + WebSocket
- **Camera**: Expo Camera
- **Location**: Expo Location + React Native Maps
- **Haptics**: Expo Haptics

## Common Commands

### Backend
```bash
npm start          # Start API server (production)
npm run dev        # Start with nodemon (development)
npm run worker     # Start background worker
npm test           # Run vitest tests
npm run db:migrate # Run database migrations
npm run db:seed    # Seed database
```

### Frontend
```bash
npm start          # Start Expo dev server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in browser
```

### Docker
```bash
docker-compose up        # Start all services (postgres, redis, minio, api, worker)
docker-compose down      # Stop all services
docker-compose logs api  # View API logs
```

## Project Conventions

### Backend
- ES modules (`import/export`)
- Fastify decorators for db/redis access
- Request hooks for auth enforcement
- Zod for input validation
- Transaction helper: `withTransaction(callback)`
- Query helper: `query(text, params)` with logging

### Frontend
- Functional components with hooks
- Zustand stores for state management
- Theme object for consistent styling
- Quebecois phrases in `cliquePhrases`
- Haptic feedback on tab switches

### Naming
- Files: kebab-case (auth.js, cliqueStore.js)
- Variables: camelCase (userId, storyId)
- Constants: UPPER_SNAKE_CASE (MAX_VIDEO_DURATION)
- Database: snake_case (user_id, created_at)
