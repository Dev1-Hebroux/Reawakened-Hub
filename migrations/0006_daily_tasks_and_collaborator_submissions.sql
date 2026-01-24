-- Daily Tasks Schema
CREATE TABLE IF NOT EXISTS daily_tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  date DATE NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  points INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, task_id, date)
);

CREATE INDEX idx_daily_tasks_user_date ON daily_tasks(user_id, date);
CREATE INDEX idx_daily_tasks_task ON daily_tasks(task_id);

-- Collaborator Submissions Schema
CREATE TABLE IF NOT EXISTS collaborator_submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('devotional', 'prayer', 'testimony', 'worship', 'teaching', 'spark')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  scripture_ref TEXT,
  category TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by INTEGER REFERENCES users(id),
  review_notes TEXT,
  scheduled_date DATE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_collaborator_submissions_user ON collaborator_submissions(user_id);
CREATE INDEX idx_collaborator_submissions_status ON collaborator_submissions(status);
CREATE INDEX idx_collaborator_submissions_type ON collaborator_submissions(content_type);
CREATE INDEX idx_collaborator_submissions_scheduled ON collaborator_submissions(scheduled_date);

-- Add collaborator role support (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_new') THEN
    -- Create new enum type with collaborator role
    CREATE TYPE user_role_new AS ENUM ('user', 'leader', 'admin', 'collaborator');

    -- Update existing column
    ALTER TABLE users
      ALTER COLUMN role TYPE user_role_new
      USING role::text::user_role_new;

    -- Drop old enum type
    DROP TYPE IF EXISTS user_role CASCADE;

    -- Rename new type
    ALTER TYPE user_role_new RENAME TO user_role;
  END IF;
END $$;

-- Enhanced streak tracking with grace periods
CREATE TABLE IF NOT EXISTS streak_grace_periods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  grace_days_used INTEGER DEFAULT 0,
  grace_days_allowed INTEGER DEFAULT 1, -- 1 day per week
  last_grace_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User levels and progression
CREATE TABLE IF NOT EXISTS user_progression (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_progression_user ON user_progression(user_id);
CREATE INDEX idx_user_progression_level ON user_progression(level);

-- Achievement badges
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_code)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_badge ON user_achievements(badge_code);

-- Quiz progress tracking
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  attempted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_date ON quiz_attempts(attempted_at);

-- Comments for documentation
COMMENT ON TABLE daily_tasks IS 'Tracks user completion of daily tasks';
COMMENT ON TABLE collaborator_submissions IS 'Content submissions from approved collaborators';
COMMENT ON TABLE streak_grace_periods IS 'Grace period tracking to prevent streak anxiety';
COMMENT ON TABLE user_progression IS 'User level and progression tracking';
COMMENT ON TABLE user_achievements IS 'Badge and achievement tracking';
COMMENT ON TABLE quiz_attempts IS 'Quiz question attempt history';
