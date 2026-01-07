-- MLB Showdown Simulator Database Schema
-- PostgreSQL 14+ compatible

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Player Cards Cache
-- Stores generated player cards to avoid repeated Baseball Reference API calls
CREATE TABLE IF NOT EXISTS player_cards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  year VARCHAR(4) NOT NULL,
  card_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, year)
);

CREATE INDEX idx_player_cards_name ON player_cards(LOWER(name));
CREATE INDEX idx_player_cards_year ON player_cards(year);
CREATE INDEX idx_player_cards_type ON player_cards((card_data->>'playerType'));
CREATE INDEX idx_player_cards_points ON player_cards(((card_data->>'points')::int));

-- Game Sessions
-- Stores active and completed game states for resuming/replaying
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  home_team JSONB NOT NULL,
  away_team JSONB NOT NULL,
  game_state JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_sessions_created ON game_sessions(created_at DESC);

-- User Rosters
-- Stores custom team rosters with point validation
CREATE TABLE IF NOT EXISTS rosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  roster_data JSONB NOT NULL,
  point_total INTEGER NOT NULL,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT point_total_check CHECK (point_total >= 0 AND point_total <= 5000)
);

CREATE INDEX idx_rosters_name ON rosters(name);
CREATE INDEX idx_rosters_points ON rosters(point_total);
CREATE INDEX idx_rosters_valid ON rosters(is_valid);

-- Strategy Cards
-- Stores the 60-card strategy deck cards
CREATE TABLE IF NOT EXISTS strategy_cards (
  id SERIAL PRIMARY KEY,
  card_name VARCHAR(255) NOT NULL UNIQUE,
  card_type VARCHAR(50) NOT NULL,
  effect_description TEXT NOT NULL,
  effect_data JSONB NOT NULL,
  set_version VARCHAR(50) DEFAULT 'CLASSIC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_strategy_cards_type ON strategy_cards(card_type);
CREATE INDEX idx_strategy_cards_set ON strategy_cards(set_version);

-- Auto-update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER update_player_cards_updated_at
  BEFORE UPDATE ON player_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rosters_updated_at
  BEFORE UPDATE ON rosters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed data: Classic strategy cards (subset for testing)
INSERT INTO strategy_cards (card_name, card_type, effect_description, effect_data, set_version) VALUES
  ('Steal', 'Action', 'Attempt to steal a base', '{"type": "steal", "modifier": 0}', 'CLASSIC'),
  ('Take a Pitch', 'Action', 'Force pitcher to throw without swinging', '{"type": "take_pitch", "advantage": "batter"}', 'CLASSIC'),
  ('Intentional Walk', 'Action', 'Walk the batter intentionally', '{"type": "walk", "forced": true}', 'CLASSIC'),
  ('Pickoff', 'Action', 'Attempt to pick off a baserunner', '{"type": "pickoff", "modifier": 0}', 'CLASSIC'),
  ('Hit and Run', 'Action', 'Runner steals, batter must swing', '{"type": "hit_and_run", "mandatory_swing": true}', 'CLASSIC')
ON CONFLICT (card_name) DO NOTHING;
