-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    learner_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    name TEXT,
    learning_goal TEXT,
    explanation_language TEXT DEFAULT 'english',
    daily_duration INTEGER DEFAULT 10,
    weekly_frequency INTEGER DEFAULT 5,
    current_level TEXT DEFAULT 'A1',
    target_level TEXT DEFAULT 'B2',
    bangla_assistance BOOLEAN DEFAULT 1,
    female_voice BOOLEAN DEFAULT 1,
    voice_speed TEXT DEFAULT 'normal',
    personality TEXT DEFAULT 'friendly',
    correction_intensity TEXT DEFAULT 'normal',
    profile_image TEXT,
    onboarding_completed BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Learner memory table
CREATE TABLE IF NOT EXISTS learner_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    strengths TEXT,
    weaknesses TEXT,
    recurring_mistakes TEXT,
    vocabulary TEXT,
    pronunciation_notes TEXT,
    topics TEXT,
    completed_lessons TEXT,
    unfinished_lessons TEXT,
    goals TEXT,
    preferences TEXT,
    recent_performance TEXT,
    long_term_performance TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Level history
CREATE TABLE IF NOT EXISTS level_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    level TEXT NOT NULL,
    confidence REAL DEFAULT 0,
    evidence_count INTEGER DEFAULT 0,
    grammar_score REAL DEFAULT 0,
    vocabulary_score REAL DEFAULT 0,
    fluency_score REAL DEFAULT 0,
    pronunciation_score REAL DEFAULT 0,
    comprehension_score REAL DEFAULT 0,
    confidence_score REAL DEFAULT 0,
    assessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration INTEGER DEFAULT 0,
    mode TEXT DEFAULT 'free_conversation',
    topic TEXT,
    messages TEXT,
    transcript TEXT,
    corrections TEXT,
    vocabulary_introduced TEXT,
    mistakes TEXT,
    scores TEXT,
    summary TEXT,
    recommendations TEXT,
    ended_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mistakes table
CREATE TABLE IF NOT EXISTS mistakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    original_sentence TEXT NOT NULL,
    corrected_sentence TEXT NOT NULL,
    explanation TEXT,
    category TEXT,
    frequency INTEGER DEFAULT 1,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    improvement_status TEXT DEFAULT 'active',
    severity TEXT DEFAULT 'medium',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    word TEXT NOT NULL,
    meaning TEXT,
    example TEXT,
    pronunciation TEXT,
    difficulty TEXT DEFAULT 'medium',
    date_introduced DATETIME DEFAULT CURRENT_TIMESTAMP,
    mastery REAL DEFAULT 0,
    review_status TEXT DEFAULT 'new',
    context TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    current_status TEXT,
    target_status TEXT,
    progress REAL DEFAULT 0,
    blocking_factor TEXT,
    next_action TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Schedule table
CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    monday TEXT,
    tuesday TEXT,
    wednesday TEXT,
    thursday TEXT,
    friday TEXT,
    saturday TEXT,
    sunday TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    total_speaking_time INTEGER DEFAULT 0,
    practice_streak INTEGER DEFAULT 0,
    last_practice_date DATE,
    accuracy REAL DEFAULT 0,
    conversation_length_avg REAL DEFAULT 0,
    fluency REAL DEFAULT 0,
    grammar REAL DEFAULT 0,
    vocabulary REAL DEFAULT 0,
    pronunciation REAL DEFAULT 0,
    confidence REAL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    subtitles_enabled BOOLEAN DEFAULT 1,
    subtitle_font_size TEXT DEFAULT 'medium',
    focus_word_highlighting BOOLEAN DEFAULT 1,
    english_captions BOOLEAN DEFAULT 1,
    bangla_captions BOOLEAN DEFAULT 0,
    auto_scroll BOOLEAN DEFAULT 1,
    reduced_motion BOOLEAN DEFAULT 0,
    large_text BOOLEAN DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
