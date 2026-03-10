# Clique - Product Overview

**What it is**: Clique is an ephemeral social platform for Quebec (Québecois) youth aged 15-25. The app features 24-hour disappearing stories ("L'Élite"), location-based social discovery ("Territoire"), and ephemeral messaging ("L'Élite" chat).

**Core Features**:
- **Stories**: 15-second video clips that disappear after 24 hours
- **Elite Chat**: 10-second ephemeral messages that auto-delete
- **Map/Territoire**: Location-based discovery of nearby users
- **Cliques**: Small group communities (private by default)
- **Snap Score**: Gamified engagement metric based on activity

**Aesthetic**: "Imperial Gold & Leather" - raw, premium, Quebecois. Think dark mode with gold accents, leather textures, and bold system fonts.

**Key Differentiators**:
- Ephemeral by design (nothing permanent)
- Quebec-focused (French language, Quebecois expressions)
- Premium feel for young adults
- Real-time features via WebSocket

**Tech Notes**:
- Backend: Fastify + PostgreSQL + Redis
- Frontend: React Native (Expo)
- Media: MinIO (S3-compatible) for uploads
- Worker: Background job processing for cleanup/expiration
