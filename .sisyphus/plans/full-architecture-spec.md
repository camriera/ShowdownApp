# MLB Showdown Simulator - Complete Architectural Specification

**Version**: 1.0.0
**Date**: 2026-01-14
**Status**: Production-Ready Specification

---

## Table of Contents

1. [Architecture Overview](#step-1-architecture-overview)
2. [Data Modeling](#step-2-data-modeling)
3. [API Design](#step-3-api-design)
4. [System Workflows](#step-4-system-workflows)
5. [Implementation Roadmap](#step-5-implementation-roadmap)
6. [Risk Analysis & Mitigations](#step-6-risk-analysis--mitigations)
7. [Code Organization & Integration](#step-7-code-organization--integration-plan)

---

## STEP 1: Architecture Overview

### 1.1 High-Level Systems Diagram

```
+------------------------------------------------------------------+
|                         CLIENT LAYER                              |
|  +---------------------------+  +-----------------------------+   |
|  |   React Native Mobile     |  |      Web Dashboard          |   |
|  |   (iOS / Android / Web)   |  |   (Admin / Analytics)       |   |
|  +------------+--------------+  +-------------+---------------+   |
|               |                               |                   |
+---------------+-------------------------------+-------------------+
                |                               |
                v                               v
+------------------------------------------------------------------+
|                        API GATEWAY                                |
|  +------------------------------------------------------------+  |
|  |              Netlify Functions (Serverless)                 |  |
|  |  - JWT Authentication Middleware                            |  |
|  |  - Rate Limiting (per-user, per-endpoint)                   |  |
|  |  - Request Validation (Zod schemas)                         |  |
|  |  - Error Handling & Logging                                 |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                |
                v
+------------------------------------------------------------------+
|                      SERVICE LAYER                                |
|  +------------+  +------------+  +------------+  +------------+  |
|  |    Auth    |  | Inventory  |  |  Gameplay  |  | Marketplace|  |
|  |  Service   |  |  Service   |  |  Service   |  |  Service   |  |
|  +------------+  +------------+  +------------+  +------------+  |
|  +------------+  +------------+  +------------+  +------------+  |
|  |   Packs    |  |   Stats    |  | Matchmaking|  |   Social   |  |
|  |  Service   |  |  Service   |  |  Service   |  |  Service   |  |
|  +------------+  +------------+  +------------+  +------------+  |
+------------------------------------------------------------------+
                |
                v
+------------------------------------------------------------------+
|                      DATA LAYER                                   |
|  +-------------------------+  +-----------------------------+    |
|  |      PostgreSQL         |  |         Redis               |    |
|  |  (Primary Database)     |  |  (Sessions, Matchmaking,    |    |
|  |  - Users, Cards, Games  |  |   Real-time Game State)     |    |
|  |  - Transactions, Stats  |  |                             |    |
|  +-------------------------+  +-----------------------------+    |
+------------------------------------------------------------------+
                |
                v
+------------------------------------------------------------------+
|                    EXTERNAL SERVICES                              |
|  +---------------+  +----------------+  +--------------------+   |
|  | ShowdownBot   |  |  Blockchain    |  |    WebSocket       |   |
|  | API (Cards)   |  |  (NFT Minting) |  |  (Pusher/Ably)     |   |
|  +---------------+  +----------------+  +--------------------+   |
+------------------------------------------------------------------+
```

### 1.2 Domain/Service Boundaries

| Domain | Responsibilities | Data Owned |
|--------|-----------------|------------|
| **Auth** | Registration, login, JWT tokens, password reset, session management | Users, Sessions, RefreshTokens |
| **Inventory** | Card ownership, card instances, crafting, collection browsing | CardInstances, CardOwnership, CraftingLog |
| **Gameplay** | Game sessions, turn execution, state management, AI opponents | GameSessions, GameTurns, GameHistory |
| **Rewards** | XP progression, pack generation, achievement tracking | UserXP, Packs, PackContents, Achievements |
| **Marketplace** | Listings, trades, fee calculation, transaction history | Listings, Trades, TransactionLog |
| **Matchmaking** | Opponent finding, queue management, rating calculation | MatchmakingQueue, PlayerRatings |
| **Stats** | Win/loss tracking, card usage stats, leaderboards | UserStats, CardStats, SeasonStats |
| **Social** | Friends, messaging, activity feeds | Friends, Messages, ActivityFeed |

### 1.3 Communication Patterns

#### Request-Response (Synchronous)
- All CRUD operations (cards, decks, inventory)
- Authentication flows
- Marketplace transactions
- Stats queries and leaderboards

#### Event-Driven (Asynchronous)
- Real-time game state updates (WebSocket)
- Matchmaking notifications
- Achievement unlocks
- Trade offers and responses
- Pack opening animations

#### Hybrid Approach for Gameplay
```
Async Mode (Turn-Based):
  Client -> REST API -> Database -> Response
  Opponent polls or receives push notification

Real-Time Mode:
  Client <-> WebSocket <-> Game State Manager <-> Opponent Client
  State persisted to DB after each turn for recovery
```

### 1.4 Architecture Decision: Modular Monolith

**Recommendation**: Start with a **Modular Monolith** deployed as Netlify Functions

**Justification**:

| Factor | Microservices | Modular Monolith | Decision |
|--------|--------------|------------------|----------|
| Team Size | Large teams | Small teams (0-100 users) | Monolith |
| Deployment Complexity | High | Low (single deploy) | Monolith |
| Data Consistency | Eventual | Strong (single DB) | Monolith |
| Development Speed | Slower | Faster iteration | Monolith |
| Scaling Path | Built-in | Extract later | Monolith |
| Cost (Beta) | Higher | Lower | Monolith |

**Future Extraction Path**:
1. Phase 1-4: Single Netlify Functions project with domain folders
2. Phase 5+: Extract high-traffic services (Matchmaking, Real-time) if needed
3. Scale: Move to dedicated servers only when Netlify limits are hit

### 1.5 Technology Stack Justification

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | React Native + Expo | Cross-platform, existing codebase, hot reload |
| **State** | Redux Toolkit | Already chosen, predictable state, dev tools |
| **Backend** | Netlify Functions (Node.js) | Existing setup, serverless scaling, low ops |
| **Database** | PostgreSQL (Neon/Supabase) | JSONB support, strong consistency, existing schema |
| **Cache** | Redis (Upstash) | Session storage, matchmaking queues, game state |
| **Real-time** | Pusher or Ably | Managed WebSocket, presence, fallback support |
| **Auth** | JWT + Refresh Tokens | Stateless, mobile-friendly, standard practice |
| **NFT** | Polygon (future) | Low gas fees, fast transactions, gaming focus |
| **Card Gen** | ShowdownBot API | Existing integration, authentic calculations |

---

## STEP 2: Data Modeling

### 2.1 Entity Relationship Diagram

```
+------------------+       +-------------------+       +------------------+
|      users       |       |   card_templates  |       |  card_instances  |
+------------------+       +-------------------+       +------------------+
| id (PK)          |       | id (PK)           |       | id (PK)          |
| email            |       | name              |       | template_id (FK) |
| password_hash    |       | year              |       | owner_id (FK)    |
| username         |       | player_type       |       | serial_number    |
| created_at       |       | command           |       | rarity           |
| updated_at       |       | chart (JSONB)     |       | minted           |
+--------+---------+       | points            |       | created_at       |
         |                 +--------+----------+       +--------+---------+
         |                          |                           |
         |                          |                           |
         v                          v                           v
+------------------+       +-------------------+       +------------------+
|      decks       |       |   deck_cards      |       |     lineups      |
+------------------+       +-------------------+       +------------------+
| id (PK)          |<------| deck_id (FK)      |       | id (PK)          |
| user_id (FK)     |       | card_instance_id  |------>| deck_id (FK)     |
| name             |       | position          |       | name             |
| point_total      |       +-------------------+       | lineup_data      |
| created_at       |                                   | is_active        |
+------------------+                                   +------------------+
         |
         |
         v
+------------------+       +-------------------+       +------------------+
|  game_sessions   |       |    game_turns     |       |    user_stats    |
+------------------+       +-------------------+       +------------------+
| id (PK)          |<------| game_id (FK)      |       | user_id (PK, FK) |
| home_user_id     |       | turn_number       |       | wins             |
| away_user_id     |       | phase             |       | losses           |
| home_lineup_id   |       | action_data       |       | rating           |
| away_lineup_id   |       | result_data       |       | games_played     |
| game_state       |       | created_at        |       | updated_at       |
| status           |       +-------------------+       +------------------+
| winner_id        |
+------------------+
         |
         v
+------------------+       +-------------------+       +------------------+
|      packs       |       |  pack_contents    |       |   achievements   |
+------------------+       +-------------------+       +------------------+
| id (PK)          |<------| pack_id (FK)      |       | id (PK)          |
| user_id (FK)     |       | card_instance_id  |       | user_id (FK)     |
| pack_type        |       | revealed          |       | achievement_type |
| source           |       +-------------------+       | progress         |
| opened_at        |                                   | unlocked_at      |
| created_at       |                                   +------------------+
+------------------+

+------------------+       +-------------------+       +------------------+
|    listings      |       |      trades       |       |   nft_ledger     |
+------------------+       +-------------------+       +------------------+
| id (PK)          |       | id (PK)           |       | id (PK)          |
| seller_id (FK)   |       | listing_id (FK)   |       | card_instance_id |
| card_instance_id |       | buyer_id (FK)     |       | token_id         |
| price            |       | status            |       | blockchain       |
| status           |       | fee_amount        |       | tx_hash          |
| created_at       |       | completed_at      |       | minted_at        |
| expires_at       |       +-------------------+       +------------------+
+------------------+
```

### 2.2 Complete SQL Schema

```sql
-- ============================================================
-- MLB Showdown Simulator - Complete Database Schema
-- PostgreSQL 14+ Compatible
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS & AUTHENTICATION
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,

    -- Account status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT username_format CHECK (username ~* '^[a-zA-Z0-9_]{3,50}$')
);

CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_username ON users(LOWER(username));
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Refresh tokens for JWT authentication
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_info JSONB,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,

    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at) WHERE revoked_at IS NULL;

-- ============================================================
-- CARD TEMPLATES (Master Card Data)
-- ============================================================

CREATE TABLE card_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(100) UNIQUE, -- e.g., "mike-trout-2021"

    -- Player info
    name VARCHAR(255) NOT NULL,
    year VARCHAR(4) NOT NULL,
    team VARCHAR(100),
    player_type VARCHAR(10) NOT NULL CHECK (player_type IN ('Pitcher', 'Hitter')),

    -- Game stats
    command INTEGER NOT NULL CHECK (command >= 0 AND command <= 20),
    outs INTEGER NOT NULL CHECK (outs >= 0),
    chart JSONB NOT NULL, -- Array of {range: [start, end], result: string}

    -- Position players
    positions JSONB, -- {position: defense_rating}
    speed INTEGER CHECK (speed >= 8 AND speed <= 28),

    -- Pitchers
    ip INTEGER CHECK (ip >= 0 AND ip <= 9),

    -- Metadata
    points INTEGER NOT NULL CHECK (points >= 0 AND points <= 1000),
    hand VARCHAR(1) NOT NULL CHECK (hand IN ('L', 'R', 'S')),
    icons TEXT[],
    image_url TEXT,

    -- Versioning
    set_version VARCHAR(50) DEFAULT 'EXPANDED',
    source VARCHAR(50) DEFAULT 'showdownbot',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_player_year UNIQUE (name, year, set_version)
);

CREATE INDEX idx_card_templates_name ON card_templates(LOWER(name));
CREATE INDEX idx_card_templates_year ON card_templates(year);
CREATE INDEX idx_card_templates_type ON card_templates(player_type);
CREATE INDEX idx_card_templates_points ON card_templates(points);
CREATE INDEX idx_card_templates_search ON card_templates USING gin(to_tsvector('english', name));

-- ============================================================
-- CARD INSTANCES (User-Owned Cards - NFT Ready)
-- ============================================================

CREATE TYPE rarity_level AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');

CREATE TABLE card_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES card_templates(id),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Uniqueness
    serial_number INTEGER NOT NULL,
    rarity rarity_level NOT NULL DEFAULT 'common',

    -- NFT status
    is_minted BOOLEAN DEFAULT false,
    nft_token_id VARCHAR(100),

    -- Crafting/origin
    source VARCHAR(50) NOT NULL DEFAULT 'pack', -- pack, craft, trade, starter
    parent_instance_ids UUID[], -- For crafted cards

    -- State
    is_tradeable BOOLEAN DEFAULT true,
    is_listed BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    acquired_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_serial UNIQUE (template_id, serial_number)
);

CREATE INDEX idx_card_instances_owner ON card_instances(owner_id);
CREATE INDEX idx_card_instances_template ON card_instances(template_id);
CREATE INDEX idx_card_instances_rarity ON card_instances(rarity);
CREATE INDEX idx_card_instances_tradeable ON card_instances(is_tradeable, is_listed)
    WHERE is_tradeable = true;

-- Serial number sequence per template
CREATE TABLE card_serial_counters (
    template_id UUID PRIMARY KEY REFERENCES card_templates(id),
    next_serial INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- DECKS & LINEUPS
-- ============================================================

CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Validation
    point_total INTEGER NOT NULL DEFAULT 0,
    is_valid BOOLEAN DEFAULT false,
    validation_errors JSONB,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT point_total_limit CHECK (point_total >= 0 AND point_total <= 5000)
);

CREATE INDEX idx_decks_user ON decks(user_id);
CREATE INDEX idx_decks_valid ON decks(is_valid) WHERE is_valid = true;

-- Cards assigned to decks
CREATE TABLE deck_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    card_instance_id UUID NOT NULL REFERENCES card_instances(id) ON DELETE CASCADE,

    -- Position in deck
    slot_type VARCHAR(20) NOT NULL CHECK (slot_type IN ('pitcher', 'hitter', 'bench', 'bullpen')),
    slot_position INTEGER, -- 1-9 for lineup order, NULL for bench

    -- Timestamps
    added_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_card_in_deck UNIQUE (deck_id, card_instance_id)
);

CREATE INDEX idx_deck_cards_deck ON deck_cards(deck_id);
CREATE INDEX idx_deck_cards_instance ON deck_cards(card_instance_id);

-- Game-ready lineup configurations
CREATE TABLE lineups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,

    -- Lineup configuration (ordered array of card_instance_ids)
    batting_order UUID[] NOT NULL, -- 9 hitters in order
    starting_pitcher UUID NOT NULL,
    bullpen UUID[], -- Relief pitchers

    -- Defensive positions {card_instance_id: position}
    defensive_positions JSONB NOT NULL,

    -- Status
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lineups_deck ON lineups(deck_id);
CREATE INDEX idx_lineups_active ON lineups(is_active) WHERE is_active = true;

-- ============================================================
-- GAME SESSIONS & HISTORY
-- ============================================================

CREATE TYPE game_status AS ENUM ('pending', 'active', 'paused', 'completed', 'abandoned', 'forfeit');
CREATE TYPE game_mode AS ENUM ('async', 'realtime', 'ai');

CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Players
    home_user_id UUID REFERENCES users(id),
    away_user_id UUID REFERENCES users(id),
    home_lineup_id UUID NOT NULL REFERENCES lineups(id),
    away_lineup_id UUID NOT NULL REFERENCES lineups(id),

    -- Game mode
    mode game_mode NOT NULL DEFAULT 'async',
    is_ranked BOOLEAN DEFAULT true,

    -- Full game state (serialized GameState)
    game_state JSONB NOT NULL,

    -- Status
    status game_status NOT NULL DEFAULT 'pending',
    current_turn_user_id UUID REFERENCES users(id),
    turn_deadline TIMESTAMPTZ,

    -- Result
    winner_id UUID REFERENCES users(id),
    final_score_home INTEGER,
    final_score_away INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    CONSTRAINT different_players CHECK (
        home_user_id IS NULL OR away_user_id IS NULL OR home_user_id != away_user_id
    )
);

CREATE INDEX idx_game_sessions_home ON game_sessions(home_user_id);
CREATE INDEX idx_game_sessions_away ON game_sessions(away_user_id);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_sessions_active ON game_sessions(status, current_turn_user_id)
    WHERE status = 'active';

-- Individual turns for history/replay (summary only, not full replay)
CREATE TABLE game_turns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,

    -- Turn info
    turn_number INTEGER NOT NULL,
    inning INTEGER NOT NULL,
    is_top_of_inning BOOLEAN NOT NULL,

    -- Action data
    phase VARCHAR(20) NOT NULL,
    acting_user_id UUID REFERENCES users(id),
    pitch_roll INTEGER,
    swing_roll INTEGER,

    -- Result summary
    result_type VARCHAR(20), -- 'SO', 'HR', 'BB', etc.
    runs_scored INTEGER DEFAULT 0,
    outs_recorded INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_turn UNIQUE (game_id, turn_number)
);

CREATE INDEX idx_game_turns_game ON game_turns(game_id);
CREATE INDEX idx_game_turns_user ON game_turns(acting_user_id);

-- ============================================================
-- USER STATS & PROGRESSION
-- ============================================================

CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    -- Overall record
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    draws INTEGER NOT NULL DEFAULT 0,

    -- Rating (ELO-based)
    rating INTEGER NOT NULL DEFAULT 1200,
    peak_rating INTEGER NOT NULL DEFAULT 1200,

    -- Progression
    xp_total BIGINT NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,

    -- Currency
    coins BIGINT NOT NULL DEFAULT 0,
    premium_currency BIGINT NOT NULL DEFAULT 0,

    -- Aggregate stats
    total_runs_scored INTEGER NOT NULL DEFAULT 0,
    total_runs_allowed INTEGER NOT NULL DEFAULT 0,
    total_home_runs INTEGER NOT NULL DEFAULT 0,
    total_strikeouts INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT non_negative_stats CHECK (
        wins >= 0 AND losses >= 0 AND draws >= 0 AND
        xp_total >= 0 AND level >= 1 AND
        coins >= 0 AND premium_currency >= 0
    )
);

-- Card-specific usage stats
CREATE TABLE card_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES card_templates(id),

    -- Usage
    games_played INTEGER NOT NULL DEFAULT 0,

    -- Hitter stats
    at_bats INTEGER NOT NULL DEFAULT 0,
    hits INTEGER NOT NULL DEFAULT 0,
    home_runs INTEGER NOT NULL DEFAULT 0,
    rbis INTEGER NOT NULL DEFAULT 0,
    walks INTEGER NOT NULL DEFAULT 0,
    strikeouts INTEGER NOT NULL DEFAULT 0,

    -- Pitcher stats
    innings_pitched DECIMAL(5,1) NOT NULL DEFAULT 0,
    earned_runs INTEGER NOT NULL DEFAULT 0,
    pitcher_strikeouts INTEGER NOT NULL DEFAULT 0,
    pitcher_walks INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_user_card_stats UNIQUE (user_id, template_id)
);

CREATE INDEX idx_card_stats_user ON card_stats(user_id);
CREATE INDEX idx_card_stats_template ON card_stats(template_id);

-- Seasonal stats tracking
CREATE TABLE season_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    season_id VARCHAR(20) NOT NULL, -- e.g., "2026-S1"

    -- Season record
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    rating_start INTEGER NOT NULL DEFAULT 1200,
    rating_end INTEGER,
    rating_peak INTEGER NOT NULL DEFAULT 1200,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,

    CONSTRAINT unique_user_season UNIQUE (user_id, season_id)
);

CREATE INDEX idx_season_stats_user ON season_stats(user_id);
CREATE INDEX idx_season_stats_season ON season_stats(season_id);

-- ============================================================
-- PACKS & REWARDS
-- ============================================================

CREATE TYPE pack_type AS ENUM ('starter', 'standard', 'premium', 'legendary', 'event');
CREATE TYPE pack_source AS ENUM ('purchase', 'level_up', 'achievement', 'daily', 'event', 'gift');

CREATE TABLE packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Pack info
    pack_type pack_type NOT NULL,
    source pack_source NOT NULL,

    -- Contents (generated when opened)
    card_count INTEGER NOT NULL DEFAULT 5,
    guaranteed_rarity rarity_level,

    -- Status
    is_opened BOOLEAN DEFAULT false,
    opened_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_packs_user ON packs(user_id);
CREATE INDEX idx_packs_unopened ON packs(user_id, is_opened) WHERE is_opened = false;

-- Pack contents (created when pack is opened)
CREATE TABLE pack_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
    card_instance_id UUID NOT NULL REFERENCES card_instances(id),

    -- Reveal order for animation
    reveal_order INTEGER NOT NULL,
    is_revealed BOOLEAN DEFAULT false,

    -- Timestamps
    revealed_at TIMESTAMPTZ
);

CREATE INDEX idx_pack_contents_pack ON pack_contents(pack_id);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================

CREATE TABLE achievement_definitions (
    id VARCHAR(50) PRIMARY KEY, -- e.g., "first_win", "collect_100_cards"
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,

    -- Requirements
    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INTEGER NOT NULL,

    -- Rewards
    xp_reward INTEGER NOT NULL DEFAULT 0,
    coin_reward INTEGER NOT NULL DEFAULT 0,
    pack_reward pack_type,

    -- Display
    icon_url TEXT,
    is_hidden BOOLEAN DEFAULT false,

    -- Order
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL REFERENCES achievement_definitions(id),

    -- Progress
    current_progress INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,

    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    claimed_at TIMESTAMPTZ,

    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_completed ON user_achievements(user_id, is_completed);

-- ============================================================
-- MARKETPLACE & TRADING
-- ============================================================

CREATE TYPE listing_status AS ENUM ('active', 'sold', 'cancelled', 'expired');

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id),
    card_instance_id UUID NOT NULL REFERENCES card_instances(id),

    -- Pricing
    price_coins BIGINT NOT NULL CHECK (price_coins > 0),

    -- Status
    status listing_status NOT NULL DEFAULT 'active',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    sold_at TIMESTAMPTZ,

    CONSTRAINT unique_active_listing UNIQUE (card_instance_id)
);

CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_card ON listings(card_instance_id);
CREATE INDEX idx_listings_active ON listings(status, expires_at) WHERE status = 'active';
CREATE INDEX idx_listings_price ON listings(price_coins) WHERE status = 'active';

CREATE TYPE trade_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'expired');

CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id),
    buyer_id UUID NOT NULL REFERENCES users(id),

    -- Transaction
    purchase_price BIGINT NOT NULL,
    fee_amount BIGINT NOT NULL, -- Platform fee
    seller_receives BIGINT NOT NULL,

    -- Status
    status trade_status NOT NULL DEFAULT 'pending',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    CONSTRAINT fee_calculation CHECK (seller_receives = purchase_price - fee_amount)
);

CREATE INDEX idx_trades_buyer ON trades(buyer_id);
CREATE INDEX idx_trades_listing ON trades(listing_id);
CREATE INDEX idx_trades_status ON trades(status);

-- Transaction log for auditing
CREATE TABLE transaction_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Transaction type
    transaction_type VARCHAR(50) NOT NULL, -- trade, craft, pack_open, reward, etc.

    -- Participants
    user_id UUID NOT NULL REFERENCES users(id),
    counterparty_id UUID REFERENCES users(id),

    -- Items involved
    card_instance_ids UUID[],

    -- Currency changes
    coins_change BIGINT NOT NULL DEFAULT 0,
    premium_currency_change BIGINT NOT NULL DEFAULT 0,

    -- Reference
    reference_type VARCHAR(50),
    reference_id UUID,

    -- Metadata
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transaction_log_user ON transaction_log(user_id);
CREATE INDEX idx_transaction_log_type ON transaction_log(transaction_type);
CREATE INDEX idx_transaction_log_date ON transaction_log(created_at);

-- ============================================================
-- NFT LEDGER
-- ============================================================

CREATE TABLE nft_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_instance_id UUID NOT NULL REFERENCES card_instances(id),

    -- Blockchain info
    blockchain VARCHAR(50) NOT NULL DEFAULT 'polygon',
    contract_address VARCHAR(100),
    token_id VARCHAR(100),

    -- Transaction
    mint_tx_hash VARCHAR(100),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, minted, failed

    -- Timestamps
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    minted_at TIMESTAMPTZ,

    CONSTRAINT unique_nft_card UNIQUE (card_instance_id)
);

CREATE INDEX idx_nft_ledger_card ON nft_ledger(card_instance_id);
CREATE INDEX idx_nft_ledger_token ON nft_ledger(token_id) WHERE token_id IS NOT NULL;

-- ============================================================
-- CRAFTING LOG
-- ============================================================

CREATE TABLE crafting_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Input cards (consumed)
    input_card_ids UUID[] NOT NULL,
    input_count INTEGER NOT NULL,

    -- Output card (created)
    output_card_id UUID NOT NULL REFERENCES card_instances(id),
    output_rarity rarity_level NOT NULL,

    -- Recipe used
    recipe_type VARCHAR(50) NOT NULL, -- upgrade_rarity, combine_duplicates, etc.

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crafting_log_user ON crafting_log(user_id);
CREATE INDEX idx_crafting_log_output ON crafting_log(output_card_id);

-- ============================================================
-- MATCHMAKING
-- ============================================================

CREATE TABLE matchmaking_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    lineup_id UUID NOT NULL REFERENCES lineups(id),

    -- Matching criteria
    rating INTEGER NOT NULL,
    rating_range INTEGER NOT NULL DEFAULT 200, -- Expands over time
    game_mode game_mode NOT NULL DEFAULT 'realtime',

    -- Status
    is_active BOOLEAN DEFAULT true,
    matched_with_user_id UUID REFERENCES users(id),
    matched_game_id UUID REFERENCES game_sessions(id),

    -- Timestamps
    queued_at TIMESTAMPTZ DEFAULT NOW(),
    matched_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT unique_user_in_queue UNIQUE (user_id)
);

CREATE INDEX idx_matchmaking_active ON matchmaking_queue(is_active, rating)
    WHERE is_active = true;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_templates_updated_at BEFORE UPDATE ON card_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON decks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lineups_updated_at BEFORE UPDATE ON lineups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_stats_updated_at BEFORE UPDATE ON card_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate serial numbers for card instances
CREATE OR REPLACE FUNCTION generate_card_serial()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    -- Get or create counter for this template
    INSERT INTO card_serial_counters (template_id, next_serial)
    VALUES (NEW.template_id, 1)
    ON CONFLICT (template_id) DO UPDATE
    SET next_serial = card_serial_counters.next_serial + 1
    RETURNING next_serial INTO next_num;

    NEW.serial_number = next_num;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_serial_number BEFORE INSERT ON card_instances
    FOR EACH ROW WHEN (NEW.serial_number IS NULL)
    EXECUTE FUNCTION generate_card_serial();

-- Update deck point total when cards change
CREATE OR REPLACE FUNCTION update_deck_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE decks d
    SET point_total = (
        SELECT COALESCE(SUM(ct.points), 0)
        FROM deck_cards dc
        JOIN card_instances ci ON dc.card_instance_id = ci.id
        JOIN card_templates ct ON ci.template_id = ct.id
        WHERE dc.deck_id = COALESCE(NEW.deck_id, OLD.deck_id)
    )
    WHERE d.id = COALESCE(NEW.deck_id, OLD.deck_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalc_deck_points_insert AFTER INSERT ON deck_cards
    FOR EACH ROW EXECUTE FUNCTION update_deck_points();

CREATE TRIGGER recalc_deck_points_delete AFTER DELETE ON deck_cards
    FOR EACH ROW EXECUTE FUNCTION update_deck_points();

-- ============================================================
-- SEED DATA: Achievement Definitions
-- ============================================================

INSERT INTO achievement_definitions (id, name, description, category, requirement_type, requirement_value, xp_reward, coin_reward, sort_order) VALUES
('first_game', 'Rookie Debut', 'Play your first game', 'gameplay', 'games_played', 1, 100, 50, 1),
('first_win', 'First Victory', 'Win your first game', 'gameplay', 'wins', 1, 200, 100, 2),
('win_10', 'Rising Star', 'Win 10 games', 'gameplay', 'wins', 10, 500, 250, 3),
('win_50', 'All-Star', 'Win 50 games', 'gameplay', 'wins', 50, 1000, 500, 4),
('win_100', 'Hall of Fame', 'Win 100 games', 'gameplay', 'wins', 100, 2500, 1000, 5),
('collect_25', 'Card Collector', 'Collect 25 unique cards', 'collection', 'unique_cards', 25, 300, 150, 10),
('collect_100', 'Serious Collector', 'Collect 100 unique cards', 'collection', 'unique_cards', 100, 1000, 500, 11),
('first_legendary', 'Legendary Find', 'Obtain your first legendary card', 'collection', 'legendary_cards', 1, 500, 0, 15),
('first_craft', 'Master Craftsman', 'Craft your first card', 'crafting', 'cards_crafted', 1, 200, 100, 20),
('first_trade', 'Trader', 'Complete your first trade', 'marketplace', 'trades_completed', 1, 200, 100, 25),
('hit_hr', 'Long Ball', 'Hit your first home run', 'gameplay', 'home_runs', 1, 50, 25, 30),
('hit_100_hr', 'Power Hitter', 'Hit 100 home runs', 'gameplay', 'home_runs', 100, 1000, 500, 31),
('rating_1400', 'Contender', 'Reach 1400 rating', 'competitive', 'peak_rating', 1400, 500, 250, 40),
('rating_1600', 'Elite', 'Reach 1600 rating', 'competitive', 'peak_rating', 1600, 1000, 500, 41),
('rating_1800', 'Legend', 'Reach 1800 rating', 'competitive', 'peak_rating', 1800, 2500, 1000, 42)
ON CONFLICT (id) DO NOTHING;
```

