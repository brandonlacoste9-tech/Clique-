-- Clique Database Schema - 2026 Edition
-- Fresh build, no legacy baggage

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table (phone-first auth, Snapchat style)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(32) UNIQUE,
    display_name VARCHAR(50),
    avatar_url TEXT,
    
    -- Profile extras
    bio VARCHAR(150),
    location VARCHAR(100), -- City/region, not exact
    
    -- Privacy settings
    story_visibility VARCHAR(20) DEFAULT 'friends', -- friends, clique, public
    allow_screenshots BOOLEAN DEFAULT false,
    ghost_mode BOOLEAN DEFAULT false, -- hide from map
    
    -- Stats
    snap_score INTEGER DEFAULT 0,
    streak_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Deletion (Law 25 compliance)
    deleted_at TIMESTAMPTZ,
    deletion_reason VARCHAR(50)
);

-- Friendships (bidirectional)
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, blocked
    
    -- Streak tracking
    streak_start_date DATE,
    streak_last_snapped_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_a, user_b)
);

-- Stories (metadata only - media in object storage)
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Media
    media_key TEXT NOT NULL, -- S3/MinIO key
    media_type VARCHAR(10) NOT NULL, -- image, video
    thumbnail_key TEXT,
    duration_seconds INTEGER, -- for videos
    
    -- Content
    caption VARCHAR(150),
    mood VARCHAR(50), -- feeling/activity tag
    song_id UUID, -- reference to music library
    
    -- Location (approximate for privacy)
    location GEOGRAPHY(POINT, 4326),
    location_name VARCHAR(100), -- e.g., "Plateau-Mont-Royal"
    
    -- Engagement
    view_count INTEGER DEFAULT 0,
    screenshot_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    
    -- Visibility
    is_public BOOLEAN DEFAULT false, -- vs friends-only
    allow_replies BOOLEAN DEFAULT true,
    
    -- Ephemeral lifecycle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Index for cleanup job
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Story views (who saw what, ephemeral)
CREATE TABLE story_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    screenshot_detected BOOLEAN DEFAULT false,
    reply_sent BOOLEAN DEFAULT false,
    
    UNIQUE(story_id, viewer_id)
);

-- Direct messages (ephemeral or persistent)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Participants
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    content_type VARCHAR(20) NOT NULL, -- text, image, video, audio, snap_reply
    content_key TEXT, -- for media
    text_content TEXT, -- for text or caption
    
    -- Snap reply reference
    reply_to_story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    
    -- Ephemeral settings
    ephemeral_mode BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ, -- null = persistent
    
    -- Status
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    
    -- Deletion (both sides can delete for themselves)
    deleted_by_sender_at TIMESTAMPTZ,
    deleted_by_recipient_at TIMESTAMPTZ
);

-- Conversations (summary table for inbox)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    last_message_id UUID REFERENCES messages(id),
    last_message_at TIMESTAMPTZ,
    
    -- Unread counts (per side)
    unread_count_a INTEGER DEFAULT 0,
    unread_count_b INTEGER DEFAULT 0,
    
    -- Streak in this conversation
    streak_count INTEGER DEFAULT 0,
    streak_expires_at TIMESTAMPTZ,
    
    UNIQUE(user_a, user_b)
);

-- Cliques (geo-fenced groups)
CREATE TABLE cliques (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    
    -- Geography
    center GEOGRAPHY(POINT, 4326) NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 2000,
    
    -- Region info
    region VARCHAR(50), -- e.g., "Montréal", "Québec", "Gatineau"
    neighborhood VARCHAR(100),
    
    -- Stats
    member_count INTEGER DEFAULT 0,
    active_story_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Clique memberships
CREATE TABLE clique_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clique_id UUID NOT NULL REFERENCES cliques(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_contributed_at TIMESTAMPTZ,
    
    UNIQUE(clique_id, user_id)
);

-- Devices (for push notifications)
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    platform VARCHAR(10) NOT NULL, -- ios, android
    push_token TEXT NOT NULL,
    
    -- App version for feature flags
    app_version VARCHAR(20),
    os_version VARCHAR(20),
    
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_friendships_user_a ON friendships(user_a);
CREATE INDEX idx_friendships_user_b ON friendships(user_b);
CREATE INDEX idx_stories_user_created ON stories(user_id, created_at DESC);
CREATE INDEX idx_stories_expires ON stories(expires_at) WHERE expires_at > NOW();
CREATE INDEX idx_stories_location ON stories USING GIST(location);
CREATE INDEX idx_story_views_story ON story_views(story_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, recipient_id, sent_at DESC);
CREATE INDEX idx_messages_ephemeral ON messages(expires_at) WHERE expires_at IS NOT NULL AND expires_at <= NOW();
CREATE INDEX idx_cliques_location ON cliques USING GIST(center);
CREATE INDEX idx_cliques_region ON cliques(region);

-- Function to update last_active_at
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_active_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_active
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_last_active();

-- Story reactions table
CREATE TABLE story_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, user_id, emoji)
);

CREATE INDEX idx_story_reactions_story ON story_reactions(story_id);
CREATE INDEX idx_story_reactions_user ON story_reactions(user_id);

-- Add columns to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT false;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS schedule_at TIMESTAMPTZ;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS reaction_count INTEGER DEFAULT 0;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT true;

-- Add column to users table for dark mode preference
ALTER TABLE users ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT true;

-- Index for scheduled stories
CREATE INDEX idx_stories_scheduled ON stories(user_id, schedule_at) WHERE is_scheduled = true;
CREATE INDEX idx_stories_draft ON stories(user_id) WHERE is_draft = true;
