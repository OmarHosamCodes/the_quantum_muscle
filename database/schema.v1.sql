-- Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    rat_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER DEFAULT 0,
    phone VARCHAR(20) DEFAULT '0',
    user_type VARCHAR(50) NOT NULL, -- 'trainee' or 'trainer'
    profile_image_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Height measurements (normalized from map in original model)
CREATE TABLE user_heights (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    date_recorded TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    height NUMERIC(5,2) NOT NULL,
    UNIQUE(user_id, date_recorded)
);

-- Weight measurements (normalized from map in original model)
CREATE TABLE user_weights (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    date_recorded TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    weight NUMERIC(5,2) NOT NULL,
    UNIQUE(user_id, date_recorded)
);

-- User tags
CREATE TABLE user_tags (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    tag VARCHAR(255) NOT NULL,
    UNIQUE(user_id, tag)
);

-- Followers relationship
CREATE TABLE followers (
    follower_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    following_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
);

-- Programs
CREATE TABLE programs (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    trainer_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Program rest days
CREATE TABLE program_rest_days (
    program_id VARCHAR(255) REFERENCES programs(id) ON DELETE CASCADE,
    day_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (program_id, day_name)
);

-- Program trainees (many-to-many relationship)
CREATE TABLE program_trainees (
    program_id VARCHAR(255) REFERENCES programs(id) ON DELETE CASCADE,
    trainee_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (program_id, trainee_id)
);

-- Workouts
CREATE TABLE workouts (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Program workouts (many-to-many relationship)
CREATE TABLE program_workouts (
    program_id VARCHAR(255) REFERENCES programs(id) ON DELETE CASCADE,
    workout_id VARCHAR(255) REFERENCES workouts(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    PRIMARY KEY (program_id, workout_id)
);

-- Exercises
CREATE TABLE exercises (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    content_url TEXT,
    content_type VARCHAR(50) DEFAULT 'image',
    workout_id VARCHAR(255) REFERENCES workouts(id) ON DELETE CASCADE,
    creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Exercise sets (normalized from map in original model)
CREATE TABLE exercise_sets (
    id SERIAL PRIMARY KEY,
    exercise_id VARCHAR(255) REFERENCES exercises(id) ON DELETE CASCADE,
    set_index INTEGER NOT NULL,
    weight NUMERIC(7,2),
    reps INTEGER,
    UNIQUE(exercise_id, set_index)
);

-- Content (posts)
CREATE TABLE content (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_url TEXT NOT NULL,
    creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content likes
CREATE TABLE content_likes (
    content_id VARCHAR(255) REFERENCES content(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (content_id, user_id)
);

-- Content comments
CREATE TABLE content_comments (
    id SERIAL PRIMARY KEY,
    content_id VARCHAR(255) REFERENCES content(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chats
CREATE TABLE chats (
    id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat participants
CREATE TABLE chat_participants (
    chat_id VARCHAR(255) REFERENCES chats(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (chat_id, user_id)
);

-- Messages
CREATE TABLE messages (
    id VARCHAR(255) PRIMARY KEY,
    chat_id VARCHAR(255) REFERENCES chats(id) ON DELETE CASCADE,
    sender_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    message_url TEXT,
    message_type VARCHAR(50) DEFAULT 'text',
    program_request_id VARCHAR(255) REFERENCES programs(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);