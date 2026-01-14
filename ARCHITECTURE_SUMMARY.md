# MLB Showdown Simulator - Deep Architectural Plan Summary

**Status**: Complete Production-Ready Specification (January 14, 2026)

---

## Executive Summary

A complete, phased architectural plan has been created for transforming the Showdown Simulator from a local gameplay app into a full-featured online card-collecting game with:

- **User ownership system** - Each card is a unique NFT-ready instance
- **Deck & lineup management** - Build and validate game-ready teams
- **Progression system** - Earn XP, unlock packs, craft cards, climb leaderboards
- **Real-time online multiplayer** - Live matches with WebSocket support
- **Fallback AI mode** - Pre-built bot opponents with various lineups
- **NFT marketplace** - Trade cards with platform fee model (5%)
- **Card crafting** - Combine duplicates into higher-rarity versions
- **Competitive integrity** - ELO rating system with seasonal tracking

---

## Business Context

**Revenue Model**: F2P with gacha packs + NFT marketplace (5% platform fee)

**Scope**: Start with 0-100 beta users, design for scalability to 1000+

**Primary Goals**: Collection progression, competitive integrity, social features, authentic MLB Showdown rules

**Platforms**: iOS, Android, Web (via React Native + Expo)

---

## Architecture Decision: Modular Monolith

**Why**: Small team, single codebase, strong consistency, fast iteration. Extract to microservices only if needed post-launch.

**Stack**:
- Frontend: React Native + Expo + Redux Toolkit
- Backend: Netlify Functions (TypeScript) + PostgreSQL (Neon) + Redis (Upstash)
- Real-time: Pusher or Ably WebSocket
- Authentication: JWT + Refresh Tokens
- NFT: Polygon blockchain (future integration)

---

## Data Model at a Glance

**20+ Tables Created** spanning:

1. **Users & Auth**: users, refresh_tokens
2. **Cards**: card_templates (master data), card_instances (NFT-ready owned copies), card_serial_counters
3. **Ownership**: decks, deck_cards, lineups
4. **Gameplay**: game_sessions, game_turns, user_stats, card_stats, season_stats
5. **Progression**: packs, pack_contents, achievements, user_achievements
6. **Marketplace**: listings, trades, transaction_log, nft_ledger
7. **Matchmaking**: matchmaking_queue
8. **Crafting**: crafting_log

All tables include proper indexing, triggers, constraints, and audit trails.

---

## API Endpoints (40+ total)

### Authentication (4 endpoints)
- POST /api/auth/register → Create account + starter pack
- POST /api/auth/login → Authenticate + receive tokens
- POST /api/auth/refresh → Refresh access token
- POST /api/auth/logout → Revoke tokens

### Inventory (2 endpoints)
- GET /api/inventory/cards → List owned cards with filters
- POST /api/inventory/craft → Combine cards into higher rarity

### Decks (6 endpoints)
- GET /api/decks → List user's decks
- POST /api/decks → Create new deck
- PUT /api/decks/:id → Update deck composition
- DELETE /api/decks/:id → Delete deck
- POST /api/decks/:id/clone → Clone existing deck

### Lineups (2 endpoints)
- POST /api/lineups → Create game-ready lineup
- GET /api/lineups/:id/validate → Validate without saving

### Packs (2 endpoints)
- GET /api/packs → List unopened packs
- POST /api/packs/:id/open → Open pack and receive cards

### Gameplay (4 endpoints)
- POST /api/games → Create game session (vs player or AI)
- GET /api/games/:id → Get current game state
- POST /api/games/:id/turn → Submit pitch/swing action
- POST /api/games/:id/concede → Forfeit game

### Stats (2 endpoints)
- GET /api/stats/me → User's stats and progress
- GET /api/stats/leaderboard → Global rankings

### Marketplace (4 endpoints)
- GET /api/marketplace/listings → Browse cards for sale
- POST /api/marketplace/listings → List card for sale
- POST /api/marketplace/listings/:id/buy → Purchase card
- DELETE /api/marketplace/listings/:id → Cancel listing

### Matchmaking (3 endpoints)
- POST /api/matchmaking/queue → Join match queue
- DELETE /api/matchmaking/queue → Leave queue
- GET /api/matchmaking/ai-opponents → Browse AI opponents

All endpoints include:
- Request/response Zod schemas (copy-paste ready)
- Error codes with descriptions
- Rate limiting per endpoint
- Authentication requirements
- curl examples

---

## System Workflows

### 1. Onboarding
```
Register → Validate email/username/password
         → Create user + initialize stats (1200 rating, 1000 coins, Level 1)
         → Generate starter pack (15 cards, guaranteed playable)
         → Auto-create deck from starter cards
         → Issue JWT + Refresh token
         → Optional: Tutorial flow
```

### 2. Pack Opening & Progression
```
Play game → Earn XP (based on result)
         → Level up every N XP
         → Unlock pack at each level
         → Open pack → Roll RNG for card rarities
         → Add cards to inventory
         → Trigger achievement checks (e.g., "collect 100 cards")
         → Award additional rewards (coins, cosmetics)
```

### 3. Deck Building & Validation
```
Browse owned cards (filters: type, rarity, points)
         → Select 9 hitters + 1 starting pitcher + relief pitchers
         → Assign defensive positions
         → Server validates:
            - Point total <= 5000
            - All positions filled
            - Pitcher IP >= 4
            - All cards owned by user
         → Save lineup as "active" or "inactive"
         → Use in game creation
```

### 4. Async Gameplay
```
Create game → Select opponent or AI
           → Home player pitches (roll d20)
           → Away player swings (roll d20)
           → Server resolves outcome
           → Repeat until game ends (9+ innings)
           → Update user stats (W/L, rating, XP)
           → Award cards/cosmetics if achievement unlocked
```

### 5. Real-Time Multiplayer
```
Join matchmaking queue (with lineup + rating)
                     → Server finds opponent within rating range
                     → Match found → Establish WebSocket connection
                     → Real-time game state broadcast
                     → Turn timeout logic (auto-forfeit if idle)
                     → Disconnect handling + rejoin capability
                     → Game completion → Stats update
```

### 6. Marketplace Trading
```
User lists card (set price in coins)
           → Card marked as "not tradeable"
           → Buyer browses marketplace
           → Buyer makes offer
           → Seller accepts → Deduct coins from buyer
           → Calculate fee (5% of sale price)
           → Transfer card instance to buyer
           → Log for NFT minting verification
           → Buyer can now trade again
```

### 7. Card Crafting
```
User selects 3x common "Mike Trout 2021"
                 → Crafts into 1x uncommon "Mike Trout 2021"
                 → Original 3 cards consumed
                 → New card created with incremented serial number
                 → Log crafting action
                 → User gains XP for crafting
```

---

## Implementation Roadmap (12 Weeks)

### Phase 0: Foundation (Week 1-2)
**MVP milestone**: User can register, own cards, build valid deck

**Tasks**:
- Create 6 database migrations (users, cards, decks, stats)
- Implement 15 Netlify Functions (auth, inventory, decks, lineups)
- Build authentication middleware + Zod validation
- Create Redux store: auth slice
- Build UI: AuthScreen, InventoryScreen, DeckBuilderScreen
- Test: Registration → deck creation flow

**Files**: 40+ new files

---

### Phase 1: Core Progression (Week 3-4)
**Milestone**: XP system, pack opening, achievements working

**Tasks**:
- Database: packs, pack_contents, achievements tables
- API: Pack endpoints (list, open), stats endpoints
- RNG: Implement cryptographically secure card generation
- Achievement: Track progress, unlock rewards
- UI: PackOpening animation component, AchievementPopup
- Stats: Calculate batting avg, ERA, level progression

**Files**: 25+ new files

---

### Phase 2: Gameplay Backend (Week 5-6)
**Milestone**: Games persist, async gameplay works, stats accumulate

**Tasks**:
- Database: game_sessions, game_turns, card_stats migrations
- API: Game endpoints (create, get, submit turn)
- Game state: Serialize/deserialize GameState to/from JSON
- Stat tracking: Update card_stats after each at-bat
- Opponent loading: Fetch opponent's deck configuration
- Undo prevention: Lock game state during opponent's turn

**Files**: 30+ new files

---

### Phase 3: Real-Time Multiplayer (Week 7-8)
**Milestone**: Live matches with WebSocket, matchmaking queue

**Tasks**:
- WebSocket: Integrate Pusher/Ably for real-time
- Matchmaking: Implement rating-based queue matching
- Database: matchmaking_queue table
- API: Queue endpoints, match-found notifications
- Turn timeout: Auto-forfeit if idle > 5 minutes
- Rejoin logic: Restore game state on reconnect

**Files**: 35+ new files

---

### Phase 4: Marketplace & Trading (Week 9-10)
**Milestone**: Players can trade cards, marketplace has active listings

**Tasks**:
- Database: listings, trades, transaction_log tables
- API: Marketplace endpoints (list, buy, sell, cancel)
- Fee calculation: 5% of sale price (platform revenue)
- NFT ledger: Track minting eligibility
- Race condition prevention: SELECT FOR UPDATE on listings
- Transaction audit: Log all trades for compliance

**Files**: 25+ new files

---

### Phase 5: Social & Polish (Week 11-12)
**Milestone**: Leaderboards, seasonal tracking, admin tools

**Tasks**:
- Leaderboards: Top 100 by rating, wins, era, home_runs
- Seasons: Create 2026-S1, track peak rating, reset mechanism
- Friends: Add friend list, direct challenges
- Analytics: Dashboard for admin to view user metrics
- Polish: UI refinements, animation timing, error messages
- Documentation: API docs, deployment guide, troubleshooting

**Files**: 30+ new files

---

## Risk Analysis (14 Identified Risks)

### Technical Risks

**T1: Race Conditions in Marketplace** (Likelihood: High, Impact: High)
- Mitigation: Use PostgreSQL `SELECT FOR UPDATE` locks, validate status post-lock

**T2: RNG Auditability** (Likelihood: Medium, Impact: High)
- Mitigation: Log seed hash before generation, reveal seed after, publish stats

**T3: State Consistency in Async Games** (Likelihood: Medium, Impact: High)
- Mitigation: Lock game_sessions during opponent turn, use transaction isolation

**T4: NFT Minting Latency** (Likelihood: High, Impact: Medium)
- Mitigation: Queue minting jobs asynchronously, cache blockchain status, retry failed mints

**T5: WebSocket Scaling** (Likelihood: Medium, Impact: Medium)
- Mitigation: Use managed service (Pusher/Ably), monitor connection limits, implement reconnect backoff

### Business Risks

**B1: Pay-to-Win Perception** (Likelihood: High, Impact: High)
- Mitigation: Stat tracking shows skill beats cards; starter deck viable; power advantage < 20%

**B2: Marketplace Inflation** (Likelihood: High, Impact: High)
- Mitigation: Remove coins from economy (burn on pack purchases), limit daily coin generation

**B3: Card Duplication Exploits** (Likelihood: Medium, Impact: High)
- Mitigation: Atomic transactions, unique serial numbers, audit logging on all inventory changes

**B4: Churn from Poor Matchmaking** (Likelihood: Medium, Impact: High)
- Mitigation: Quick-match after 30s wait, expand rating range, test with various player ratings

### Operational Risks

**O1: Database Scaling** (Likelihood: Medium, Impact: Medium)
- Mitigation: Neon auto-scaling, query optimization, archival of old game history

**O2: Support Load** (Likelihood: Medium, Impact: Medium)
- Mitigation: FAQ, automated refund system for failed transactions, support dashboard

**O3: Marketplace Moderation** (Likelihood: Medium, Impact: Low)
- Mitigation: Automated price ceiling checks, report system, admin dashboard

**O4: Data Backup & Recovery** (Likelihood: Low, Impact: High)
- Mitigation: Neon automated backups, test restore quarterly, document RTO/RPO

---

## Code Organization

```
backend/
├── functions/
│   ├── auth/
│   │   ├── register.ts
│   │   ├── login.ts
│   │   ├── refresh.ts
│   │   └── logout.ts
│   ├── inventory/
│   │   ├── list-cards.ts
│   │   ├── get-card.ts
│   │   └── craft.ts
│   ├── decks/
│   │   ├── create.ts
│   │   ├── list.ts
│   │   ├── get.ts
│   │   ├── update.ts
│   │   └── delete.ts
│   ├── lineups/
│   │   ├── create.ts
│   │   └── validate.ts
│   ├── packs/
│   │   ├── list.ts
│   │   └── open.ts
│   ├── games/
│   │   ├── create.ts
│   │   ├── get.ts
│   │   ├── submit-turn.ts
│   │   └── concede.ts
│   ├── stats/
│   │   ├── get-user-stats.ts
│   │   └── get-leaderboard.ts
│   ├── marketplace/
│   │   ├── list-cards.ts
│   │   ├── create-listing.ts
│   │   ├── buy.ts
│   │   └── cancel-listing.ts
│   ├── matchmaking/
│   │   ├── join-queue.ts
│   │   ├── leave-queue.ts
│   │   └── get-ai-opponents.ts
│   └── common/
│       ├── auth-middleware.ts
│       ├── validation.ts
│       ├── error-handler.ts
│       ├── db-client.ts
│       ├── logger.ts
│       └── constants.ts
├── database/
│   └── migrations/
│       ├── 001-extensions.sql
│       ├── 002-users.sql
│       ├── 003-card-templates.sql
│       ├── 004-card-instances.sql
│       ├── 005-decks.sql
│       ├── 006-user-stats.sql
│       ├── 007-packs.sql
│       ├── 008-achievements.sql
│       ├── 009-game-sessions.sql
│       ├── 010-marketplace.sql
│       ├── 011-matchmaking.sql
│       └── 012-indexes-and-triggers.sql
└── tests/
    ├── integration/
    │   ├── auth.test.ts
    │   ├── decks.test.ts
    │   └── games.test.ts
    └── unit/
        ├── game-validation.test.ts
        └── rng.test.ts

frontend/
├── src/
│   ├── screens/
│   │   ├── AuthScreen.tsx (new)
│   │   ├── InventoryScreen.tsx (new)
│   │   ├── DeckBuilderScreen.tsx (new)
│   │   ├── GameplayScreen.tsx (enhanced)
│   │   ├── MarketplaceScreen.tsx (new)
│   │   ├── ProfileScreen.tsx (new)
│   │   ├── LeaderboardScreen.tsx (new)
│   │   └── PackOpeningScreen.tsx (new)
│   ├── components/
│   │   ├── CardDetailView.tsx (new)
│   │   ├── LineupValidator.tsx (new)
│   │   ├── PackRevealAnimation.tsx (new)
│   │   ├── MarketplaceListing.tsx (new)
│   │   └── OpponentCard.tsx (new)
│   ├── store/
│   │   ├── auth.slice.ts (new)
│   │   ├── inventory.slice.ts (new)
│   │   ├── game.slice.ts (enhanced)
│   │   ├── marketplace.slice.ts (new)
│   │   └── store.ts (new)
│   ├── api/
│   │   ├── auth.ts (new)
│   │   ├── inventory.ts (new)
│   │   ├── games.ts (enhanced)
│   │   ├── marketplace.ts (new)
│   │   └── matchmaking.ts (new)
│   └── hooks/
│       ├── useAuth.ts (new)
│       ├── useInventory.ts (new)
│       ├── useGameState.ts (enhanced)
│       ├── useMarketplace.ts (new)
│       └── useMatchmaking.ts (new)
└── __tests__/
    ├── screens/ (component tests)
    └── api/ (integration tests)
```

---

## Integration with Existing GameEngine

The GameEngine (`mobile/src/engine/GameEngine.ts`) remains **completely unchanged**.

**Data Flow**:
1. User creates game session via API
2. Backend loads GameState from database
3. Turn submitted → Loaded into GameEngine.executePhase()
4. GameEngine returns new state immutably
5. Backend persists result to database
6. Response includes updated game state for UI rendering

**No Breaking Changes**: The engine's pure TypeScript implementation is decoupled from persistence.

---

## Testing Strategy

### Unit Tests (Phase 0 onwards)
- Validation schemas (Zod)
- Game state transitions
- RNG distribution
- ELO calculations

### Integration Tests (Phase 1+)
- Auth flow (register → login → token refresh)
- Deck creation & validation
- Pack opening & card distribution
- Game session persistence
- Marketplace transactions

### End-to-End Tests (Phase 2+)
- Full user journey: register → open pack → build deck → play game → view stats
- Concurrent marketplace purchases
- Real-time multiplayer match creation

### Load Testing (Pre-launch)
- 100 concurrent users registering
- 50 concurrent games in progress
- 200 marketplace listings active

---

## Next Steps for Development

1. **Immediately**: Review this plan with stakeholders, get sign-off on design
2. **Week 1**: Begin Phase 0 database migrations
3. **Week 2**: Implement Phase 0 API endpoints
4. **Ongoing**: Run integration tests after each phase
5. **Launch prep**: Security audit, GDPR compliance review, bug bash

---

## Key Decisions Made

✅ **Monolith** (not microservices) - better for 0-100 users
✅ **JWT auth** - stateless, mobile-friendly
✅ **PostgreSQL JSONB** - flexible while maintaining ACID
✅ **5% marketplace fee** - sustainable, player-friendly
✅ **ELO rating** - proven, fair competitive system
✅ **Async-first gameplay** - accommodates timezone differences
✅ **Starter deck guaranteed playable** - fair onboarding

---

## Success Metrics

- ✅ Registration → first game in < 5 min
- ✅ 95%+ pack RNG fairness (verified by statistical audit)
- ✅ Marketplace transactions complete in < 1 second
- ✅ Real-time game latency < 200ms
- ✅ 99.5% uptime (4-hour SLA for async games)
- ✅ < 5% churn in first 30 days

---

## Full Specification Files

Complete specifications are available in:

1. **full-architecture-spec.md** - Architecture overview + database schema (1000 lines)
2. **full-architecture-spec-part2.md** - Complete API design (40+ endpoints)
3. **full-architecture-spec-part3.md** - System workflows with pseudocode
4. **full-architecture-spec-part4.md** - Implementation roadmap (Phase 0-5)
5. **full-architecture-spec-part5.md** - Risk analysis + code organization

**Location**: `/home/cam/ws/ShowdownApp/.sisyphus/plans/`

---

## Questions or Changes?

This plan is designed to be **flexible**. If you need to:
- Adjust timeline
- Change API structure
- Modify rarity distributions
- Add new features
- Shift phase priorities

Simply let me know and I'll provide updated specifications with minimal disruption.

---

**Prepared by**: Claude (Prometheus + Ultrawork)
**Date**: January 14, 2026
**Status**: Ready for Implementation
