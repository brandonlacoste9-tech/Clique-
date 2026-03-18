
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_key TEXT NOT NULL,
    media_type VARCHAR(10) NOT NULL,
    thumbnail_key TEXT,
    duration_seconds INTEGER,
    caption VARCHAR(150),
    mood VARCHAR(150),
    song_id UUID,
    location GEOGRAPHY(POINT, 4326),
    location_name VARCHAR(100),
    view_count INTEGER DEFAULT 0,
    screenshot_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    allow_replies BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_stories_user_created ON stories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_expires ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_location ON stories USING GIST(location);
