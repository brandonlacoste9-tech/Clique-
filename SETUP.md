# CLIQUE - Setup Guide

## Prerequisites

- Node.js 20+ 
- Docker & Docker Compose
- npm or yarn

## Quick Start (Docker)

1. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

2. Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. Start all services:
   ```bash
   docker-compose up -d
   ```

4. Run database migrations:
   ```bash
   docker-compose exec api npm run db:migrate
   ```

5. Seed test data:
   ```bash
   docker-compose exec api npm run db:seed
   ```

6. Access the API at `http://localhost:3001`

## Development (Local)

1. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Start Redis and PostgreSQL locally (or use Docker):
   ```bash
   docker-compose up -d postgres redis
   ```

3. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

4. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

## Environment Variables

### Root `.env`
- `DB_PASSWORD` - PostgreSQL password
- `MINIO_PASSWORD` - MinIO password
- `JWT_SECRET` - JWT signing secret

### Backend `backend/.env`
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `MINIO_ENDPOINT` - MinIO endpoint (localhost:9000 for dev)
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `MINIO_BUCKET` - MinIO bucket name
- `MINIO_USE_SSL` - Use SSL for MinIO
- `TWILIO_ACCOUNT_SID` - Twilio account SID (optional for dev)
- `TWILIO_AUTH_TOKEN` - Twilio auth token (optional for dev)
- `TWILIO_PHONE_NUMBER` - Twilio phone number (optional for dev)
- `CORS_ORIGINS` - Comma-separated list of allowed origins
- `NODE_ENV` - Environment (development/production)
- `WORKER_INTERVAL` - Worker job interval in seconds

## API Endpoints

- `POST /auth/otp` - Request OTP
- `POST /auth/verify` - Verify OTP and login
- `GET /stories/feed` - Get stories feed
- `POST /stories/:id/view` - View a story
- `GET /messages/conversations` - Get conversations
- `POST /messages/:userId` - Send message
- `GET /users/me` - Get profile
- `GET /cliques/nearby` - Get nearby cliques

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npx jest
```
