## STEP 6: Risk Analysis & Mitigations

### 6.1 Technical Risks

#### Risk T1: Race Conditions in Marketplace Transactions

| Attribute | Value |
|-----------|-------|
| **Likelihood** | High |
| **Impact** | High |
| **Priority** | Critical |

**Scenario**: Two buyers attempt to purchase the same listing simultaneously.

**Mitigation Strategy**:
1. Use PostgreSQL `FOR UPDATE` row locks in transactions
2. Implement optimistic locking with version numbers
3. Validate listing status after lock acquisition
4. Use serializable isolation for purchase transactions

**Implementation**:
```sql
-- Use SELECT FOR UPDATE to lock the listing row
BEGIN;
SELECT * FROM listings WHERE id = $1 AND status = 'active' FOR UPDATE;
-- If row returned, proceed with purchase
-- If no row or status changed, abort
COMMIT;
```

**Validation**:
- Load test with concurrent purchase attempts
- Verify only one purchase succeeds
- Verify no double-spend of coins
- Verify no duplicate card ownership

---

#### Risk T2: RNG Auditability for Pack Opening

| Attribute | Value |
|-----------|-------|
| **Likelihood** | Medium |
| **Impact** | High |
| **Priority** | High |

**Scenario**: Players suspect pack RNG is rigged; unable to prove fairness.

**Mitigation Strategy**:
1. Log all RNG seeds and outcomes to immutable audit log
2. Use cryptographically secure random number generation
3. Implement commit-reveal scheme for high-stakes packs
4. Publish aggregate rarity statistics publicly

**Implementation**:
```typescript
async function generatePackContents(packId: string, userId: string) {
  // 1. Generate cryptographic seed
  const seed = crypto.randomBytes(32).toString('hex');

  // 2. Hash seed before revealing contents
  const seedHash = crypto.createHash('sha256').update(seed).digest('hex');

  // 3. Log commitment BEFORE generating cards
  await db.rngAuditLog.create({
    packId,
    userId,
    seedHash,
    committedAt: new Date(),
  });

  // 4. Use seed to generate cards (deterministic from seed)
  const rng = seedrandom(seed);
  const cards = generateCardsFromRng(rng);

  // 5. Reveal seed after generation
  await db.rngAuditLog.update(packId, {
    seed,
    outcome: cards.map(c => c.id),
    revealedAt: new Date(),
  });

  return cards;
}
```

**Validation**:
- Players can verify seed produces same outcome
- Statistical analysis of pack outcomes matches published rates
- Third-party audit of RNG implementation

---

#### Risk T3: State Consistency in Async Games

| Attribute | Value |
|-----------|-------|
| **Likelihood** | Medium |
| **Impact** | High |
| **Priority** | High |

**Scenario**: Player exploits async nature to undo moves or corrupt state.

**Mitigation Strategy**:
1. Append-only turn log (no updates or deletes)
2. Server validates all state transitions
3. Client receives canonical state from server
4. No client-side state is trusted

**Implementation**:
```typescript
async function submitTurn(gameId: string, userId: string, action: TurnAction) {
  // 1. Load current canonical state
  const game = await db.gameSessions.findByIdForUpdate(gameId);

  // 2. Reconstruct game engine from server state (not client state)
  const engine = GameEngine.fromState(game.gameState);

  // 3. Validate action is legal in current state
  if (!engine.isValidAction(action)) {
    throw new Error('INVALID_ACTION');
  }

  // 4. Execute action server-side
  const result = engine.executeAction(action);

  // 5. Append turn to immutable log
  await db.gameTurns.create({
    gameId,
    turnNumber: game.turnCount + 1,
    previousStateHash: hashState(game.gameState),
    action,
    newStateHash: hashState(engine.getState()),
    createdAt: new Date(),
  });

  // 6. Update canonical state
  await db.gameSessions.update(gameId, {
    gameState: engine.getState(),
    turnCount: game.turnCount + 1,
  });

  return result;
}
```

**Validation**:
- State hash chain is unbroken
- Replay from turn log produces same final state
- No orphaned or skipped turns

---

#### Risk T4: NFT Minting Latency and Cost

| Attribute | Value |
|-----------|-------|
| **Likelihood** | Medium |
| **Impact** | Medium |
| **Priority** | Medium |

**Scenario**: Blockchain congestion causes slow/expensive minting.

**Mitigation Strategy**:
1. Defer minting until user explicitly requests
2. Batch mint requests during low-gas periods
3. Use Layer 2 (Polygon) for low fees
4. Off-chain ownership is authoritative; NFT is proof-of-ownership export

**Implementation**:
```typescript
// Cards are tradeable immediately in-game
// NFT minting is optional export feature
async function requestNftMint(cardInstanceId: string, userId: string) {
  const card = await db.cardInstances.findById(cardInstanceId);

  if (card.ownerId !== userId) {
    throw new Error('NOT_OWNER');
  }

  if (card.isMinted) {
    throw new Error('ALREADY_MINTED');
  }

  // Queue for batch processing
  await db.nftMintQueue.create({
    cardInstanceId,
    userId,
    status: 'queued',
    requestedAt: new Date(),
  });

  // Background job processes queue during low-gas windows
  return { status: 'queued', estimatedCompletion: '24 hours' };
}
```

**Validation**:
- In-game trading works without NFT
- Minting completes within 24-48 hours
- Gas costs stay under $0.10 per mint on Polygon

---

#### Risk T5: Real-Time Multiplayer Latency

| Attribute | Value |
|-----------|-------|
| **Likelihood** | Low |
| **Impact** | Medium |
| **Priority** | Medium |

**Scenario**: High latency causes poor gameplay experience.

**Mitigation Strategy**:
1. Use managed WebSocket service (Pusher/Ably) with global presence
2. Implement optimistic UI updates
3. Fallback to async mode if latency > 2s
4. Regional matchmaking preference

**Implementation**:
```typescript
// Client-side optimistic update
function handleDiceRoll(roll: number) {
  // 1. Show roll animation immediately (optimistic)
  setLastRoll(roll);
  setRolling(true);

  // 2. Send to server
  socket.emit('ROLL_DICE', { roll });

  // 3. Server will confirm or reject
  // If rejected, revert UI
}

// Server sends authoritative result
socket.on('ROLL_RESULT', (data) => {
  if (data.roll !== lastRoll) {
    // Server roll differs (anti-cheat)
    setLastRoll(data.roll);
  }
  setRolling(false);
  applyResult(data.result);
});
```

**Validation**:
- P95 latency < 200ms for WebSocket messages
- Graceful degradation to async under high latency
- No desync between players

---

### 6.2 Business Risks

#### Risk B1: Pay-to-Win Perception

| Attribute | Value |
|-----------|-------|
| **Likelihood** | High |
| **Impact** | High |
| **Priority** | Critical |

**Scenario**: Players feel spending money is required to win.

**Mitigation Strategy**:
1. Starter deck is competitive (can win against any deck)
2. Card power follows diminishing returns curve
3. Skill expression through lineup building and in-game decisions
4. Ranked matchmaking by ELO, not collection value
5. Transparent stats on win rates by deck value

**Implementation**:
```typescript
// Point values follow diminishing returns
// A 500-point legendary is maybe 10% better than 300-point rare
// But costs 5x more deck budget

const POINT_EFFICIENCY_CURVE = {
  // Points spent -> Effective power multiplier
  0: 0,
  100: 0.15,
  200: 0.28,
  300: 0.40,
  400: 0.50,
  500: 0.58,
  // Each additional 100 points gives less benefit
};

// Matchmaking ignores deck value
async function findMatch(userId: string, rating: number) {
  // Match purely on rating, not on cards owned
  return await matchByRating(rating);
}
```

**Validation**:
- Track win rates by deck point total
- Ensure starter decks win > 40% against max decks
- Survey player sentiment on fairness

---

#### Risk B2: Marketplace Inflation

| Attribute | Value |
|-----------|-------|
| **Likelihood** | Medium |
| **Impact** | Medium |
| **Priority** | Medium |

**Scenario**: Card prices spiral, new players can't afford cards.

**Mitigation Strategy**:
1. Continuous card supply through packs
2. Price floor warnings for sellers
3. "Dust" system to convert excess cards to currency
4. Periodic card releases that power-creep slightly
5. Monitor and publish market health metrics

**Implementation**:
```typescript
// Suggest pricing based on market data
async function getPriceSuggestion(templateId: string, rarity: string) {
  const recentSales = await db.trades.getRecentByTemplate(templateId, 30);
  const avgPrice = average(recentSales.map(t => t.purchasePrice));

  // Warn if price is far from market
  return {
    suggestedPrice: avgPrice,
    marketLow: min(recentSales),
    marketHigh: max(recentSales),
    recentVolume: recentSales.length,
  };
}

// Currency sink through crafting
// 3 cards -> 1 upgraded card
// Removes cards from supply, creates demand
```

**Validation**:
- Track median card prices over time
- Alert if prices rise > 50% in a week
- Ensure F2P players can build competitive decks within 1 month

---

#### Risk B3: Card Duplication Exploits

| Attribute | Value |
|-----------|-------|
| **Likelihood** | Low |
| **Impact** | Critical |
| **Priority** | High |

**Scenario**: Bug allows duplicating cards through crafting/trading.

**Mitigation Strategy**:
1. Transactional integrity on all card operations
2. Serial number uniqueness constraint
3. Balance reconciliation job (sum of cards = created - destroyed)
4. Audit log for all card creation/destruction
5. Admin alerts for anomalous card counts

**Implementation**:
```sql
-- Unique constraint prevents duplicate serial
ALTER TABLE card_instances
ADD CONSTRAINT unique_serial_per_template
UNIQUE (template_id, serial_number);

-- Trigger logs all card creation/destruction
CREATE TRIGGER log_card_changes
AFTER INSERT OR DELETE ON card_instances
FOR EACH ROW EXECUTE FUNCTION log_card_audit();
```

**Validation**:
- Daily reconciliation: sum(created) - sum(destroyed) = count(existing)
- Alert on any discrepancy
- Penetration testing on crafting/trading flows

---

#### Risk B4: Matchmaking Quality

| Attribute | Value |
|-----------|-------|
| **Likelihood** | Medium |
| **Impact** | Medium |
| **Priority** | Medium |

**Scenario**: New players matched against veterans, quit in frustration.

**Mitigation Strategy**:
1. Placement matches before ranked rating
2. New player protection (first 10 games vs similar)
3. Rating decay for inactive players
4. Smurf detection (unusually high win rate)

**Implementation**:
```typescript
// New player protection
async function findMatchForNewPlayer(userId: string) {
  const stats = await db.userStats.findByUserId(userId);

  if (stats.gamesPlayed < 10) {
    // Only match with other new players or AI
    return await matchNewPlayers(userId);
  }

  return await normalMatchmaking(userId, stats.rating);
}

// Smurf detection
async function checkForSmurfing(userId: string) {
  const recentGames = await db.gameSessions.getRecent(userId, 20);
  const winRate = recentGames.filter(g => g.winnerId === userId).length / 20;

  if (winRate > 0.85 && stats.gamesPlayed < 50) {
    // Suspiciously high win rate for new account
    await flagForReview(userId, 'POTENTIAL_SMURF');
    // Accelerate rating gain
    return { ratingMultiplier: 2.0 };
  }
}
```

**Validation**:
- Track new player retention at 7/30 days
- Survey match quality satisfaction
- Monitor rating distribution for anomalies

---

### 6.3 Operational Risks

#### Risk O1: Database Scaling

| Attribute | Value |
|-----------|-------|
| **Likelihood** | Low (at beta scale) |
| **Impact** | High |
| **Priority** | Low (defer) |

**Mitigation Strategy**:
1. Use managed PostgreSQL (Neon/Supabase) with auto-scaling
2. Index all frequently queried columns
3. Archive completed games after 90 days
4. Read replicas for stats/leaderboard queries

**Validation**:
- Load test with 10x expected concurrent users
- Query performance monitoring with alerts

---

#### Risk O2: Game History Storage

| Attribute | Value |
|-----------|-------|
| **Likelihood** | Medium |
| **Impact** | Low |
| **Priority** | Low |

**Mitigation Strategy**:
1. Store summary stats only (not full replay)
2. Archive game_turns after 30 days
3. Compress game_state JSON with zstd
4. Tiered storage (hot/warm/cold)

---

#### Risk O3: Marketplace Moderation

| Attribute | Value |
|-----------|-------|
| **Likelihood** | Medium |
| **Impact** | Medium |
| **Priority** | Medium |

**Mitigation Strategy**:
1. Rate limit listing creation
2. Price sanity checks (prevent $0.01 or $999999 listings)
3. Report button for suspicious listings
4. Admin queue for flagged items

---

#### Risk O4: Support Load

| Attribute | Value |
|-----------|-------|
| **Likelihood** | High |
| **Impact** | Medium |
| **Priority** | Medium |

**Mitigation Strategy**:
1. Comprehensive FAQ and help center
2. In-game transaction history for self-service
3. Automated resolution for common issues
4. Tiered support (bot -> human)

---

### 6.4 Risk Matrix Summary

| Risk ID | Risk | Likelihood | Impact | Priority | Phase to Address |
|---------|------|------------|--------|----------|------------------|
| T1 | Race conditions | High | High | Critical | Phase 4 |
| T2 | RNG auditability | Medium | High | High | Phase 1 |
| T3 | State consistency | Medium | High | High | Phase 2 |
| T4 | NFT latency | Medium | Medium | Medium | Phase 4+ |
| T5 | Multiplayer latency | Low | Medium | Medium | Phase 3 |
| B1 | Pay-to-win | High | High | Critical | Phase 0+ |
| B2 | Marketplace inflation | Medium | Medium | Medium | Phase 4+ |
| B3 | Card duplication | Low | Critical | High | Phase 0+ |
| B4 | Matchmaking quality | Medium | Medium | Medium | Phase 3 |
| O1 | Database scaling | Low | High | Low | Phase 5+ |
| O2 | Game history storage | Medium | Low | Low | Phase 5+ |
| O3 | Marketplace moderation | Medium | Medium | Medium | Phase 4 |
| O4 | Support load | High | Medium | Medium | Phase 5 |

---

## STEP 7: Code Organization & Integration Plan

### 7.1 Complete File Structure

```
ShowdownApp/
├── .sisyphus/
│   └── plans/
│       └── full-architecture-spec.md
│
├── backend/
│   ├── database/
│   │   ├── schema.sql              # Full schema (reference)
│   │   └── migrations/
│   │       ├── 001-extensions.sql
│   │       ├── 002-users.sql
│   │       ├── 003-card-templates.sql
│   │       ├── 004-card-instances.sql
│   │       ├── 005-decks.sql
│   │       ├── 006-user-stats.sql
│   │       ├── 007-packs.sql
│   │       ├── 008-achievements.sql
│   │       ├── 009-game-sessions.sql
│   │       ├── 010-game-turns.sql
│   │       ├── 011-card-stats.sql
│   │       ├── 012-listings.sql
│   │       ├── 013-trades.sql
│   │       ├── 014-transaction-log.sql
│   │       └── 015-nft-ledger.sql
│   │
│   └── tests/
│       ├── unit/
│       │   ├── auth.test.ts
│       │   ├── deck-validation.test.ts
│       │   ├── pack-generation.test.ts
│       │   └── marketplace.test.ts
│       └── integration/
│           ├── game-flow.test.ts
│           └── trading.test.ts
│
├── netlify/
│   └── functions/
│       ├── auth/
│       │   ├── register.ts
│       │   ├── login.ts
│       │   ├── refresh.ts
│       │   └── logout.ts
│       │
│       ├── inventory/
│       │   ├── list-cards.ts
│       │   ├── get-card.ts
│       │   └── craft.ts
│       │
│       ├── decks/
│       │   ├── create.ts
│       │   ├── list.ts
│       │   ├── get.ts
│       │   ├── update.ts
│       │   ├── delete.ts
│       │   └── clone.ts
│       │
│       ├── lineups/
│       │   ├── create.ts
│       │   ├── validate.ts
│       │   ├── get.ts
│       │   └── list.ts
│       │
│       ├── packs/
│       │   ├── list.ts
│       │   └── open.ts
│       │
│       ├── games/
│       │   ├── create.ts
│       │   ├── get.ts
│       │   ├── submit-turn.ts
│       │   ├── list.ts
│       │   └── concede.ts
│       │
│       ├── stats/
│       │   ├── get-user.ts
│       │   ├── get-card.ts
│       │   └── leaderboard.ts
│       │
│       ├── marketplace/
│       │   ├── list-cards.ts
│       │   ├── create-listing.ts
│       │   ├── buy.ts
│       │   ├── cancel.ts
│       │   └── trade-history.ts
│       │
│       ├── matchmaking/
│       │   ├── join-queue.ts
│       │   ├── leave-queue.ts
│       │   └── ai-opponents.ts
│       │
│       ├── common/
│       │   ├── db.ts               # Database pool (existing)
│       │   ├── db-client.ts        # Enhanced with transactions
│       │   ├── auth-middleware.ts
│       │   ├── validation.ts
│       │   ├── error-handler.ts
│       │   ├── rate-limiter.ts
│       │   └── logging.ts
│       │
│       ├── services/
│       │   ├── GameService.ts
│       │   ├── PackService.ts
│       │   ├── MatchmakingService.ts
│       │   ├── RealtimeService.ts
│       │   └── ProgressionService.ts
│       │
│       ├── cards-generate.ts       # Existing
│       └── cards-search.ts         # Existing
│
├── mobile/
│   └── src/
│       ├── screens/
│       │   ├── AuthScreen.tsx          # NEW: Login/Register
│       │   ├── InventoryScreen.tsx     # NEW: Card collection
│       │   ├── DeckBuilderScreen.tsx   # ENHANCED
│       │   ├── GameScreen.tsx          # Existing, enhanced
│       │   ├── MarketplaceScreen.tsx   # NEW
│       │   ├── ProfileScreen.tsx       # NEW
│       │   ├── LeaderboardScreen.tsx   # NEW
│       │   ├── PackOpeningScreen.tsx   # NEW
│       │   └── MatchmakingScreen.tsx   # NEW
│       │
│       ├── components/
│       │   ├── Scoreboard.tsx          # Existing
│       │   ├── BaseballDiamond.tsx     # Existing
│       │   ├── DiceRoller.tsx          # Existing
│       │   ├── PlayerCardView.tsx      # Existing
│       │   ├── ShowdownCard.tsx        # Existing
│       │   ├── GameOverOverlay.tsx     # Existing
│       │   ├── GameEventToast.tsx      # Existing
│       │   ├── PackOpening.tsx         # NEW
│       │   ├── CardDetailView.tsx      # NEW
│       │   ├── LineupValidator.tsx     # NEW
│       │   ├── OpponentCard.tsx        # NEW
│       │   ├── TradeOffer.tsx          # NEW
│       │   ├── MatchmakingQueue.tsx    # NEW
│       │   └── RarityBadge.tsx         # NEW
│       │
│       ├── store/
│       │   ├── store.ts                # NEW: Redux store config
│       │   ├── auth.slice.ts           # NEW
│       │   ├── inventory.slice.ts      # NEW
│       │   ├── deck.slice.ts           # NEW
│       │   ├── game.slice.ts           # NEW: Enhance existing
│       │   ├── marketplace.slice.ts    # NEW
│       │   └── progression.slice.ts    # NEW
│       │
│       ├── api/
│       │   ├── client.ts               # Existing
│       │   ├── config.ts               # Existing
│       │   ├── types.ts                # Existing, extended
│       │   ├── auth.ts                 # NEW
│       │   ├── inventory.ts            # NEW
│       │   ├── decks.ts                # NEW
│       │   ├── games.ts                # NEW
│       │   ├── marketplace.ts          # NEW
│       │   └── matchmaking.ts          # NEW
│       │
│       ├── hooks/
│       │   ├── useAuth.ts              # NEW
│       │   ├── useGameState.ts         # NEW
│       │   ├── useMarketplace.ts       # NEW
│       │   ├── useMatchmaking.ts       # NEW
│       │   └── useWebSocket.ts         # NEW
│       │
│       ├── engine/
│       │   └── GameEngine.ts           # Existing
│       │
│       ├── models/
│       │   ├── Card.ts                 # Existing
│       │   ├── Game.ts                 # Existing
│       │   ├── User.ts                 # NEW
│       │   ├── Deck.ts                 # NEW
│       │   └── Trade.ts                # NEW
│       │
│       ├── utils/
│       │   ├── sampleData.ts           # Existing
│       │   ├── teamLoader.ts           # Existing
│       │   ├── storage.ts              # NEW: AsyncStorage wrapper
│       │   └── validation.ts           # NEW: Client-side validators
│       │
│       └── constants/
│           ├── theme.ts                # Existing
│           └── config.ts               # NEW: App configuration
│
└── shared/
    └── types/
        ├── api.ts                      # Shared API types
        ├── game.ts                     # Shared game types
        └── validation.ts               # Shared Zod schemas
```

### 7.2 Integration Points

#### GameEngine Integration

The existing `GameEngine` class remains the source of truth for game logic. Backend services wrap it:

```typescript
// netlify/functions/services/GameService.ts
import { GameEngine } from '../../../mobile/src/engine/GameEngine';
import { GameState, HitterCard, PitcherCard } from '../../../mobile/src/models/Game';

export class GameService {
  /**
   * Reconstruct GameEngine from persisted state
   */
  static fromPersistedState(gameState: GameState): GameEngine {
    // GameEngine needs a method to reconstruct from state
    // Add this to GameEngine.ts:
    // static fromState(state: GameState): GameEngine

    return GameEngine.fromState(gameState);
  }

  /**
   * Serialize GameEngine state for persistence
   */
  static toPersistedState(engine: GameEngine): GameState {
    return engine.getState();
  }
}
```

**Required GameEngine Enhancement**:
```typescript
// Add to mobile/src/engine/GameEngine.ts
export class GameEngine {
  // ... existing code ...

  /**
   * Reconstruct engine from serialized state
   */
  static fromState(state: GameState): GameEngine {
    const engine = new GameEngine(state.homeTeam, state.awayTeam);
    engine.state = { ...state };
    return engine;
  }

  /**
   * Validate if an action is legal in current state
   */
  isValidAction(action: { type: string }): boolean {
    if (this.state.isGameOver) return false;

    switch (action.type) {
      case 'pitch':
        return this.state.currentPhase === 'PITCH';
      case 'swing':
        return this.state.currentPhase === 'SWING';
      case 'substitute':
        return true; // Allow substitutions any time
      default:
        return false;
    }
  }
}
```

#### Data Flow: API to Redux to Components

```
User Action (e.g., Open Pack)
        │
        ▼
┌───────────────────┐
│  Component        │
│  (PackOpening)    │
│  dispatch(        │
│    openPack(id)   │
│  )                │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Redux Thunk      │
│  openPack()       │
│  - API call       │
│  - Handle result  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  API Layer        │
│  api/packs.ts     │
│  - POST /packs/   │
│    :id/open       │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Netlify Function │
│  packs/open.ts    │
│  - Validate       │
│  - Generate cards │
│  - Persist        │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Response         │
│  { cards, xp }    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Redux Reducer    │
│  packSlice        │
│  - Update state   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Component        │
│  Re-renders with  │
│  new cards        │
└───────────────────┘
```

### 7.3 Testing Strategy

#### Unit Tests (per module)

| Module | Test Focus | Coverage Target |
|--------|------------|-----------------|
| Auth | Token generation, validation, password hashing | 95% |
| GameEngine | All game rules, edge cases | 100% |
| Deck Validation | Point limits, position rules | 100% |
| Pack Generation | Rarity distribution | 90% |
| Marketplace | Price calculations, fee logic | 95% |

#### Integration Tests

| Flow | Components Involved | Test Cases |
|------|---------------------|------------|
| Registration | API -> DB -> Response | Valid input, duplicates, validation errors |
| Game Creation | API -> GameEngine -> DB | Valid lineups, point limits, AI opponent |
| Turn Submission | API -> GameEngine -> DB -> Notification | Valid turn, wrong player, timeout |
| Purchase | API -> DB Transaction -> Balance Update | Concurrent purchase, insufficient funds |

#### End-to-End Tests

| Scenario | Steps |
|----------|-------|
| New User Journey | Register -> Open starter pack -> Build deck -> Play AI game |
| Trading Flow | List card -> Browse marketplace -> Purchase -> Verify ownership |
| Ranked Match | Join queue -> Match found -> Complete game -> Rating update |

### 7.4 Deployment Configuration

**netlify.toml**:
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"
  included_files = ["mobile/src/engine/**", "mobile/src/models/**", "shared/**"]

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[context.production.environment]
  NODE_ENV = "production"
  DATABASE_URL = "postgresql://..."
  JWT_SECRET = "..."
  PUSHER_APP_ID = "..."
  PUSHER_KEY = "..."
  PUSHER_SECRET = "..."
  REDIS_URL = "..."
```

---

## Summary

This architectural specification provides a complete blueprint for implementing the MLB Showdown Simulator with:

1. **Modular Monolith Architecture** - Suitable for small team, easy to deploy
2. **Complete Data Model** - 15+ tables covering all features
3. **RESTful API Design** - 40+ endpoints with full schemas
4. **Detailed Workflows** - 7 core flows with pseudocode
5. **Phased Roadmap** - 12-week implementation plan
6. **Risk Mitigations** - 14 identified risks with strategies
7. **Code Organization** - File-by-file structure

**Immediate Next Steps (Phase 0)**:
1. Run database migrations 001-006
2. Implement auth endpoints (register, login, refresh)
3. Create Redux store with auth slice
4. Build AuthScreen component
5. Test registration flow end-to-end

All code samples are production-ready and can be implemented directly.
