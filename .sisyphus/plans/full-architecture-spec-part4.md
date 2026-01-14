## STEP 5: Implementation Roadmap

### Phase Overview

| Phase | Focus | Duration | Dependencies |
|-------|-------|----------|--------------|
| 0 | Foundation (MVP) | Week 1-2 | None |
| 1 | Core Progression | Week 3-4 | Phase 0 |
| 2 | Gameplay Backend | Week 5-6 | Phase 0, 1 |
| 3 | Real-Time Multiplayer | Week 7-8 | Phase 2 |
| 4 | Marketplace & Trading | Week 9-10 | Phase 0, 1 |
| 5 | Social & Polish | Week 11-12 | Phase 3, 4 |

---

### Phase 0: Foundation (MVP - Week 1-2)

**Goal**: User can register, login, own cards, and build a valid deck.

#### Database Migrations

**Files to Create**:
```
backend/database/migrations/
  001-extensions.sql
  002-users.sql
  003-card-templates.sql
  004-card-instances.sql
  005-decks.sql
  006-user-stats.sql
```

**001-extensions.sql**:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

**002-users.sql**:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_info JSONB,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_username ON users(LOWER(username));
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
```

#### API Endpoints to Implement

**Files to Create**:
```
netlify/functions/
  auth/
    register.ts
    login.ts
    refresh.ts
    logout.ts
  inventory/
    list-cards.ts
    get-card.ts
  decks/
    create.ts
    list.ts
    get.ts
    update.ts
    delete.ts
  common/
    auth-middleware.ts
    validation.ts
    error-handler.ts
    db-client.ts
```

**auth/register.ts**:
```typescript
import { Handler } from '@netlify/functions';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getPool } from '../common/db-client';
import { generateTokens } from '../common/auth';
import { handleError, ValidationError } from '../common/error-handler';

const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
  displayName: z.string().max(100).optional(),
});

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }) };
  }

  const pool = getPool();

  try {
    // Parse and validate
    const body = JSON.parse(event.body || '{}');
    const validated = RegisterSchema.parse(body);

    // Check existing email
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [validated.email]
    );
    if (emailCheck.rows.length > 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'EMAIL_EXISTS', message: 'Email already registered' }),
      };
    }

    // Check existing username
    const usernameCheck = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
      [validated.username]
    );
    if (usernameCheck.rows.length > 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'USERNAME_EXISTS', message: 'Username already taken' }),
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 12);

    // Create user in transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (email, username, password_hash, display_name)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, username, display_name, created_at`,
        [validated.email, validated.username, passwordHash, validated.displayName || validated.username]
      );
      const user = userResult.rows[0];

      // Initialize stats
      await client.query(
        `INSERT INTO user_stats (user_id, rating, coins, level, xp_total)
         VALUES ($1, 1200, 1000, 1, 0)`,
        [user.id]
      );

      // Generate starter pack
      const packResult = await client.query(
        `INSERT INTO packs (user_id, pack_type, source, card_count)
         VALUES ($1, 'starter', 'registration', 15)
         RETURNING id`,
        [user.id]
      );

      await client.query('COMMIT');

      // Generate tokens
      const tokens = await generateTokens(user.id, client);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.display_name,
            createdAt: user.created_at,
          },
          tokens,
          starterPack: {
            packId: packResult.rows[0].id,
            cardCount: 15,
          },
        }),
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    return handleError(error, headers);
  }
};
```

**common/auth-middleware.ts**:
```typescript
import { HandlerEvent } from '@netlify/functions';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';

interface TokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedEvent extends HandlerEvent {
  userId: string;
}

export function extractUserId(event: HandlerEvent): string | null {
  const authHeader = event.headers.authorization || event.headers.Authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return payload.userId;
  } catch {
    return null;
  }
}

export function requireAuth(event: HandlerEvent): AuthenticatedEvent {
  const userId = extractUserId(event);

  if (!userId) {
    throw new AuthError('UNAUTHORIZED', 'Valid authentication required');
  }

  return { ...event, userId } as AuthenticatedEvent;
}

export class AuthError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function generateTokens(userId: string, client?: any) {
  const accessToken = jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  // Store refresh token hash in database
  const tokenHash = await bcrypt.hash(refreshToken, 10);

  if (client) {
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
      [userId, tokenHash]
    );
  }

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600,
  };
}
```

#### Frontend Components

**Files to Create**:
```
mobile/src/
  screens/
    AuthScreen.tsx
    InventoryScreen.tsx
    DeckBuilderScreen.tsx (enhance existing)
  store/
    auth.slice.ts
    inventory.slice.ts
    store.ts
  api/
    auth.ts
    inventory.ts
    decks.ts
  hooks/
    useAuth.ts
```

**store/auth.slice.ts**:
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/auth-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: { email: string; username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/auth-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setTokens, clearError } = authSlice.actions;
export default authSlice.reducer;
```

#### Testing Requirements

```typescript
// tests/unit/auth.test.ts
describe('Auth Service', () => {
  describe('Registration', () => {
    it('should create user with valid input');
    it('should reject duplicate email');
    it('should reject duplicate username');
    it('should hash password securely');
    it('should initialize user stats');
    it('should create starter pack');
    it('should return valid JWT tokens');
  });

  describe('Login', () => {
    it('should authenticate valid credentials');
    it('should reject invalid password');
    it('should reject non-existent email');
    it('should return user data with tokens');
  });

  describe('Token Refresh', () => {
    it('should issue new access token with valid refresh');
    it('should reject expired refresh token');
    it('should reject revoked refresh token');
  });
});

// tests/integration/deck-validation.test.ts
describe('Deck Validation', () => {
  it('should accept valid 5000-point deck');
  it('should reject deck exceeding 5000 points');
  it('should require minimum 9 hitters');
  it('should require minimum 1 pitcher');
  it('should reject cards not owned by user');
  it('should reject duplicate cards');
});
```

#### Phase 0 Completion Criteria

- [ ] User can register with email/username/password
- [ ] User can login and receive JWT tokens
- [ ] Token refresh flow works correctly
- [ ] User has 1000 coins after registration
- [ ] Starter pack is created on registration
- [ ] User can view owned cards (empty initially)
- [ ] User can create/edit/delete decks
- [ ] Deck validation enforces 5000 point limit
- [ ] All auth endpoints have rate limiting
- [ ] Error responses follow standard format

---

### Phase 1: Core Progression (Week 3-4)

**Goal**: Users earn XP, level up, open packs, and receive cards.

#### Database Migrations

```
backend/database/migrations/
  007-packs.sql
  008-achievements.sql
```

#### API Endpoints

```
netlify/functions/
  packs/
    list.ts
    open.ts
  progression/
    get-stats.ts
    get-achievements.ts
  inventory/
    craft.ts
```

**packs/open.ts** (Key Logic):
```typescript
async function openPack(packId: string, userId: string): Promise<OpenPackResult> {
  return await db.transaction(async (tx) => {
    // 1. Load and lock pack
    const pack = await tx.packs.findByIdForUpdate(packId);

    if (!pack || pack.userId !== userId) {
      throw new NotFoundError('PACK_NOT_FOUND');
    }

    if (pack.isOpened) {
      throw new BadRequestError('PACK_ALREADY_OPENED');
    }

    // 2. Generate cards based on pack type
    const cardTemplates = await generatePackContents(tx, pack);

    // 3. Create card instances
    const cardInstances = [];
    for (const template of cardTemplates) {
      const instance = await tx.cardInstances.create({
        templateId: template.id,
        ownerId: userId,
        rarity: template.rarity,
        source: 'pack',
      });
      cardInstances.push(instance);
    }

    // 4. Mark pack as opened
    await tx.packs.update(packId, {
      isOpened: true,
      openedAt: new Date(),
    });

    // 5. Create pack contents records
    for (let i = 0; i < cardInstances.length; i++) {
      await tx.packContents.create({
        packId,
        cardInstanceId: cardInstances[i].id,
        revealOrder: i + 1,
      });
    }

    // 6. Award XP for opening
    const xpEarned = 25;
    await tx.userStats.increment(userId, 'xpTotal', xpEarned);

    // 7. Check for new cards achievement
    const uniqueCards = await tx.cardInstances.countUniqueTemplates(userId);
    await trackAchievement(userId, 'collect_25', uniqueCards);
    await trackAchievement(userId, 'collect_100', uniqueCards);

    return {
      pack: { id: packId, packType: pack.packType },
      cards: cardInstances.map((card, i) => ({
        card,
        revealOrder: i + 1,
        isNew: card.isNew,
        isDuplicate: card.isDuplicate,
      })),
      rewards: { xpEarned, coinsEarned: 0 },
    };
  });
}

async function generatePackContents(tx: Transaction, pack: Pack): Promise<CardTemplate[]> {
  const config = PACK_CONFIGS[pack.packType];
  const templates: CardTemplate[] = [];

  // Determine rarities based on config
  const rarities = [];
  for (const [rarity, count] of Object.entries(config.rarityDistribution)) {
    for (let i = 0; i < count; i++) {
      rarities.push(rarity);
    }
  }

  // Shuffle rarities
  shuffleArray(rarities);

  // Select random cards for each rarity
  for (const rarity of rarities) {
    const template = await tx.cardTemplates.findRandomByRarity(rarity);
    if (template) {
      templates.push({ ...template, rarity });
    }
  }

  // Ensure starter pack has position requirements
  if (pack.packType === 'starter') {
    templates = await ensureStarterPositions(tx, templates);
  }

  return templates;
}
```

#### Phase 1 Completion Criteria

- [ ] Pack opening generates correct card distribution
- [ ] XP is awarded for game completion
- [ ] Level up triggers pack reward
- [ ] Achievements track and unlock correctly
- [ ] User stats display on profile
- [ ] Crafting consumes 3 cards and creates 1 upgraded
- [ ] Card stats (batting avg, ERA) accumulate

---

### Phase 2: Gameplay Backend (Week 5-6)

**Goal**: Full async game flow with persistence and stat tracking.

#### Database Migrations

```
backend/database/migrations/
  009-game-sessions.sql
  010-game-turns.sql
  011-card-stats.sql
```

#### API Endpoints

```
netlify/functions/
  games/
    create.ts
    get.ts
    submit-turn.ts
    list.ts
```

#### Integration with Existing GameEngine

```typescript
// services/GameService.ts
import { GameEngine } from '../../mobile/src/engine/GameEngine';
import { GameState } from '../../mobile/src/models/Game';

export class GameService {
  /**
   * Create a new game session from lineups
   */
  async createGame(
    homeUserId: string,
    homeLineupId: string,
    awayUserId: string | null,
    awayLineupId: string,
    mode: 'async' | 'realtime' | 'ai'
  ): Promise<GameSession> {
    // Load lineups with full card data
    const homeLineup = await this.loadLineupWithCards(homeLineupId);
    const awayLineup = await this.loadLineupWithCards(awayLineupId);

    // Initialize GameEngine
    const engine = new GameEngine(
      {
        name: homeLineup.name,
        lineup: homeLineup.hitters,
        pitcher: homeLineup.pitcher,
      },
      {
        name: awayLineup.name,
        lineup: awayLineup.hitters,
        pitcher: awayLineup.pitcher,
      }
    );

    const initialState = engine.getState();

    // Persist to database
    const game = await db.gameSessions.create({
      homeUserId,
      awayUserId,
      homeLineupId,
      awayLineupId,
      mode,
      gameState: initialState,
      status: awayUserId ? 'active' : 'pending',
      currentTurnUserId: awayUserId, // Away bats first
      turnDeadline: awayUserId
        ? new Date(Date.now() + 24 * 60 * 60 * 1000)
        : null,
    });

    return game;
  }

  /**
   * Execute a turn and persist state
   */
  async executeTurn(
    gameId: string,
    userId: string,
    action: TurnAction
  ): Promise<TurnResult> {
    const game = await db.gameSessions.findByIdForUpdate(gameId);

    // Validation
    if (game.currentTurnUserId !== userId) {
      throw new Error('NOT_YOUR_TURN');
    }

    // Reconstruct engine from state
    const engine = GameEngine.fromState(game.gameState);

    // Execute action
    let result: any;
    if (action.type === 'pitch') {
      result = engine.executePitchPhase(action.roll);
    } else if (action.type === 'swing') {
      const swingResult = engine.executeSwingPhase(action.roll);
      result = engine.resolveResult(swingResult.chartResult);
    }

    const newState = engine.getState();

    // Persist
    await db.gameSessions.update(gameId, {
      gameState: newState,
      currentTurnUserId: this.getNextTurnUser(game, newState),
      status: newState.isGameOver ? 'completed' : 'active',
    });

    // Record turn
    await db.gameTurns.create({
      gameId,
      turnNumber: game.turnCount + 1,
      ...this.extractTurnData(action, result, newState),
    });

    return { result, gameState: newState };
  }
}
```

#### Phase 2 Completion Criteria

- [ ] Game session persists across app restarts
- [ ] Turn submission validates correct player
- [ ] Game state reconstructs from database
- [ ] Turn history records all actions
- [ ] Card stats update after each at-bat
- [ ] Win/loss records update on completion
- [ ] Rating updates (ELO) after ranked games
- [ ] Inactive games timeout after 24 hours

---

### Phase 3: Real-Time Multiplayer (Week 7-8)

**Goal**: Live games with WebSocket connection and matchmaking.

#### Technology: Pusher Channels

**Setup**:
```typescript
// services/PusherService.ts
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export class RealtimeService {
  async broadcastToGame(gameId: string, event: string, data: any): Promise<void> {
    await pusher.trigger(`game-${gameId}`, event, data);
  }

  async broadcastToUser(userId: string, event: string, data: any): Promise<void> {
    await pusher.trigger(`user-${userId}`, event, data);
  }

  generateSocketAuth(userId: string, socketId: string, channel: string): string {
    return pusher.authorizeChannel(socketId, channel, {
      user_id: userId,
    });
  }
}
```

**Matchmaking Queue (Redis)**:
```typescript
// services/MatchmakingService.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export class MatchmakingService {
  private readonly QUEUE_KEY = 'matchmaking:queue';
  private readonly RATING_TOLERANCE_INITIAL = 100;
  private readonly RATING_TOLERANCE_MAX = 500;
  private readonly RATING_EXPAND_INTERVAL = 10000; // 10 seconds

  async joinQueue(userId: string, lineupId: string, rating: number): Promise<QueueEntry> {
    // Check for existing entry
    const existing = await redis.hget(this.QUEUE_KEY, userId);
    if (existing) {
      throw new Error('ALREADY_IN_QUEUE');
    }

    const entry: QueueEntry = {
      userId,
      lineupId,
      rating,
      ratingTolerance: this.RATING_TOLERANCE_INITIAL,
      queuedAt: Date.now(),
    };

    // Add to queue
    await redis.hset(this.QUEUE_KEY, userId, JSON.stringify(entry));

    // Try immediate match
    const match = await this.findMatch(entry);
    if (match) {
      return { ...entry, matchedWith: match };
    }

    return entry;
  }

  async findMatch(entry: QueueEntry): Promise<string | null> {
    const allEntries = await redis.hgetall(this.QUEUE_KEY);

    for (const [otherId, otherJson] of Object.entries(allEntries)) {
      if (otherId === entry.userId) continue;

      const other: QueueEntry = JSON.parse(otherJson);

      // Check rating compatibility
      const ratingDiff = Math.abs(entry.rating - other.rating);
      const tolerance = Math.max(entry.ratingTolerance, other.ratingTolerance);

      if (ratingDiff <= tolerance) {
        // Match found!
        await this.createMatch(entry, other);
        return otherId;
      }
    }

    return null;
  }

  private async createMatch(player1: QueueEntry, player2: QueueEntry): Promise<void> {
    // Remove both from queue
    await redis.hdel(this.QUEUE_KEY, player1.userId, player2.userId);

    // Create game session
    const gameService = new GameService();
    const game = await gameService.createGame(
      player1.userId,
      player1.lineupId,
      player2.userId,
      player2.lineupId,
      'realtime'
    );

    // Notify both players
    const realtime = new RealtimeService();
    await realtime.broadcastToUser(player1.userId, 'MATCH_FOUND', {
      gameId: game.id,
      opponent: await getUserSummary(player2.userId),
      yourTeam: 'home',
    });
    await realtime.broadcastToUser(player2.userId, 'MATCH_FOUND', {
      gameId: game.id,
      opponent: await getUserSummary(player1.userId),
      yourTeam: 'away',
    });
  }

  // Periodic job to expand rating tolerance
  async expandTolerances(): Promise<void> {
    const allEntries = await redis.hgetall(this.QUEUE_KEY);
    const now = Date.now();

    for (const [userId, json] of Object.entries(allEntries)) {
      const entry: QueueEntry = JSON.parse(json);

      // Expand tolerance every 10 seconds
      const waitTime = now - entry.queuedAt;
      const expansions = Math.floor(waitTime / this.RATING_EXPAND_INTERVAL);
      const newTolerance = Math.min(
        this.RATING_TOLERANCE_INITIAL + (expansions * 50),
        this.RATING_TOLERANCE_MAX
      );

      if (newTolerance !== entry.ratingTolerance) {
        entry.ratingTolerance = newTolerance;
        await redis.hset(this.QUEUE_KEY, userId, JSON.stringify(entry));

        // Try match again with expanded tolerance
        await this.findMatch(entry);
      }
    }
  }
}
```

#### Phase 3 Completion Criteria

- [ ] Matchmaking finds opponents within rating range
- [ ] Rating tolerance expands over time
- [ ] WebSocket connects both players to game room
- [ ] Turn timer (15s) enforces move deadlines
- [ ] Disconnection handling with 60s reconnect window
- [ ] Server-side dice rolls prevent cheating
- [ ] Game state syncs correctly between clients
- [ ] Auto-forfeit after timeout

---

### Phase 4: Marketplace & Trading (Week 9-10)

**Goal**: Buy/sell cards on marketplace with fee system.

#### Database Migrations

```
backend/database/migrations/
  012-listings.sql
  013-trades.sql
  014-transaction-log.sql
  015-nft-ledger.sql
```

#### API Endpoints

```
netlify/functions/
  marketplace/
    list-cards.ts
    create-listing.ts
    buy.ts
    cancel.ts
    my-listings.ts
    trade-history.ts
```

#### Phase 4 Completion Criteria

- [ ] Users can list cards for sale
- [ ] Marketplace search with filters
- [ ] Purchase deducts coins from buyer
- [ ] 5% fee calculated correctly
- [ ] Seller receives 95% of sale price
- [ ] Card ownership transfers atomically
- [ ] Transaction log records all trades
- [ ] Listed cards cannot be in active deck
- [ ] Expired listings auto-cancel

---

### Phase 5: Social & Polish (Week 11-12)

**Goal**: Friends, leaderboards, and admin tools.

#### Features

1. **Friends System**
   - Send/accept friend requests
   - Challenge friends directly
   - Activity feed of friend games

2. **Leaderboards**
   - Rating leaderboard
   - Win count leaderboard
   - Seasonal tracking

3. **Admin Tools**
   - Ban/unban users
   - Issue currency/packs
   - View transaction logs
   - Game moderation

#### Phase 5 Completion Criteria

- [ ] Friends list with add/remove
- [ ] Direct challenge via friend list
- [ ] Leaderboards display top 100
- [ ] Seasonal stats reset on schedule
- [ ] Admin can ban users
- [ ] Admin can issue rewards
- [ ] Push notifications for friend activity
- [ ] Profile customization (avatar, bio)

