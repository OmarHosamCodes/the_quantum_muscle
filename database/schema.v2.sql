-- =================================================================
--                QUANTUM MUSCLE DATABASE SCHEMA
--
-- This script creates all tables, types, indexes, functions,
-- and triggers for the application.
--
-- Database: PostgreSQL
-- =================================================================

-- Drop existing objects in reverse order of creation to avoid dependency errors
DROP TRIGGER IF EXISTS trg_check_chat_participation ON messages;
DROP FUNCTION IF EXISTS check_chat_participation();
DROP TRIGGER IF EXISTS trg_prevent_self_follow ON followers;
DROP FUNCTION IF EXISTS prevent_self_follow();
DROP TRIGGER IF EXISTS trg_update_follower_counts ON followers;
DROP FUNCTION IF EXISTS update_follower_counts();

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS chat_participants;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS content_comments;
DROP TABLE IF EXISTS content_likes;
DROP TABLE IF EXISTS content;
DROP TABLE IF EXISTS exercise_sets;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS program_workouts;
DROP TABLE IF EXISTS workouts;
DROP TABLE IF EXISTS program_trainees;
DROP TABLE IF EXISTS program_rest_days;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS followers;
DROP TABLE IF EXISTS user_tags;
DROP TABLE IF EXISTS user_metrics;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS user_type;
DROP TYPE IF EXISTS content_type;
DROP TYPE IF EXISTS message_type;


-- =================================================================
-- I. ENUM TYPES DEFINITION
-- =================================================================
-- Defines custom types to ensure data consistency for specific fields.

CREATE TYPE user_type AS ENUM ('trainee', 'trainer');
CREATE TYPE content_type AS ENUM ('image', 'video', 'text');
CREATE TYPE message_type AS ENUM ('text', 'image', 'program_request');


-- =================================================================
-- II. TABLE DEFINITIONS
-- =================================================================

-- -----------------------------------------------------------------
-- User Management
-- -----------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rat_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INT DEFAULT 0,
    phone VARCHAR(20),
    user_type user_type NOT NULL,
    profile_image_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- Denormalized counts for performance
    follower_count INT DEFAULT 0,
    following_count INT DEFAULT 0
);

CREATE TABLE user_metrics (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_recorded TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    UNIQUE(user_id, date_recorded)
);

CREATE TABLE user_tags (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tag VARCHAR(255) NOT NULL,
    UNIQUE(user_id, tag)
);

CREATE TABLE followers (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
);

-- -----------------------------------------------------------------
-- Programs & Workouts
-- -----------------------------------------------------------------
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE program_rest_days (
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    day_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (program_id, day_name)
);

CREATE TABLE program_trainees (
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    trainee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (program_id, trainee_id)
);

CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE program_workouts (
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    PRIMARY KEY (program_id, workout_id)
);

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    target_muscle VARCHAR(255) NOT NULL,
    content_url TEXT,
    content_type content_type DEFAULT 'image',
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercise_sets (
    id BIGSERIAL PRIMARY KEY,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    set_index INT NOT NULL,
    weight_kg NUMERIC(7,2),
    reps INT,
    UNIQUE(exercise_id, set_index)
);

-- -----------------------------------------------------------------
-- Social & Content
-- -----------------------------------------------------------------
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content_likes (
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (content_id, user_id)
);

CREATE TABLE content_comments (
    id BIGSERIAL PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------
-- Communication
-- -----------------------------------------------------------------
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_participants (
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    message_url TEXT,
    message_type message_type DEFAULT 'text',
    program_request_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- =================================================================
-- III. INDEXES
-- =================================================================
-- Create indexes on foreign keys and frequently queried columns to improve query performance.

-- Indexes for User Management
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_metrics_user_id ON user_metrics(user_id);
CREATE INDEX idx_user_tags_user_id ON user_tags(user_id);
CREATE INDEX idx_followers_following_id ON followers(following_id);

-- Indexes for Programs & Workouts
CREATE INDEX idx_programs_trainer_id ON programs(trainer_id);
CREATE INDEX idx_program_trainees_trainee_id ON program_trainees(trainee_id);
CREATE INDEX idx_workouts_creator_id ON workouts(creator_id);
CREATE INDEX idx_program_workouts_workout_id ON program_workouts(workout_id);
CREATE INDEX idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX idx_exercise_sets_exercise_id ON exercise_sets(exercise_id);

-- Indexes for Social & Content
CREATE INDEX idx_content_author_id ON content(author_id);
CREATE INDEX idx_content_likes_user_id ON content_likes(user_id);
CREATE INDEX idx_content_comments_author_id ON content_comments(author_id);
CREATE INDEX idx_content_comments_content_id ON content_comments(content_id);

-- Indexes for Communication
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_program_request_id ON messages(program_request_id);


-- =================================================================
-- IV. FUNCTIONS & TRIGGERS
-- =================================================================

-- -----------------------------------------------------------------
-- A. Follower Logic
-- -----------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        UPDATE users SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
        UPDATE users SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_follower_counts
AFTER INSERT OR DELETE ON followers
FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

CREATE OR REPLACE FUNCTION prevent_self_follow()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.follower_id = NEW.following_id THEN
        RAISE EXCEPTION 'A user cannot follow themselves.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_self_follow
BEFORE INSERT ON followers
FOR EACH ROW EXECUTE FUNCTION prevent_self_follow();

-- -----------------------------------------------------------------
-- B. Chat Security Logic
-- -----------------------------------------------------------------

CREATE OR REPLACE FUNCTION check_chat_participation()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM chat_participants
        WHERE chat_id = NEW.chat_id AND user_id = NEW.sender_id
    ) THEN
        RAISE EXCEPTION 'Sender is not a participant of this chat.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_chat_participation
BEFORE INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION check_chat_participation();
