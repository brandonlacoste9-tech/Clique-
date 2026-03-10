# Clique - Project Structure

```
.
├── backend/                    # Fastify API server
│   ├── config/
│   │   └── init.sql           # Database schema/migrations
│   ├── src/
│   │   ├── api/               # Route handlers (Fastify plugins)
│   │   │   ├── auth.js        # Phone OTP authentication
│   │   │   ├── users.js       # User profile endpoints
│   │   │   ├── stories.js     # Story CRUD operations
│   │   │   ├── messages.js    # Chat/messaging endpoints
│   │   │   ├── cliques.js     # Group/community endpoints
│   │   │   ├── upload.js      # Media upload (presigned URLs)
│   │   │   └── eliteQueue.js  # Premium/elite features
│   │   ├── config/
│   │   │   └── index.js       # Centralized config with validation
│   │   ├── models/
│   │   │   └── db.js          # PostgreSQL connection + helpers
│   │   ├── services/
│   │   │   ├── redis.js       # Redis client + presence tracking
│   │   │   ├── websocket.js   # WebSocket handlers for real-time
│   │   │   └── eliteNotificationService.js
│   │   ├── index.js           # Main entry point
│   │   └── worker.js          # Background job processor
│   ├── Dockerfile
│   ├── Dockerfile.worker
│   └── package.json
│
├── frontend/                   # React Native (Expo) app
│   ├── src/
│   │   ├── api/
│   │   │   └── cliqueApi.js   # API client with interceptors
│   │   ├── assets/
│   │   │   └── heroes/        # Marketing images
│   │   ├── components/
│   │   │   └── StoryViewer.js # Story viewing component
│   │   ├── data/
│   │   │   └── marketingContent.js
│   │   ├── screens/           # Screen components
│   │   │   ├── AuthScreen.js
│   │   │   ├── CameraScreen.js
│   │   │   ├── ChatScreen.js
│   │   │   ├── ChatDetailScreen.js
│   │   │   ├── MapScreen.js
│   │   │   ├── ProfileScreen.js
│   │   │   └── StoriesScreen.js
│   │   ├── services/
│   │   │   ├── eliteGreetingService.js
│   │   │   └── snapKitService.js
│   │   ├── store/             # Zustand state stores
│   │   │   └── cliqueStore.js # Auth, stories, messages, UI
│   │   └── theme/
│   │       └── cliqueTheme.js # Colors, spacing, typography
│   ├── assets/                # App assets (sounds, images)
│   ├── marketing/             # Web landing pages
│   ├── App.js                 # Main app with navigation
│   ├── app.json               # Expo config
│   └── package.json
│
├── docker-compose.yml         # Local development environment
├── vercel.json                # Web deployment config
└── .gitignore
```

## Key Patterns

### Backend API Structure
- Each API endpoint is a Fastify plugin in `src/api/`
- Routes registered with prefix: `/auth`, `/users`, `/stories`, etc.
- Auth hook protects all routes except public endpoints
- Database queries use `query(text, params)` helper

### Frontend State Management
- `useAuthStore`: Authentication state (persisted)
- `useStoriesStore`: Story feed, views, my stories
- `useMessagesStore`: Conversations, active chat, messages
- `useUIStore`: Tab state, camera, story viewer

### Theme System
- `colors`: Imperial Gold palette + Leather textures
- `typography`: System fonts (bold display, body)
- `spacing`: 4/8/16/24/32/48 scale
- `shadows`: Gold shadow + card shadow
- `cliquePhrases`: Quebecois expressions for UI
