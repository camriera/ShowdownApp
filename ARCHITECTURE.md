# Architecture Overview

Complete technical architecture for the Showdown Simulator project.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App Layer                         │
│                  (React Native + Expo)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Screens    │  │  Components  │  │ Game Engine  │      │
│  │ - GameScreen │  │ - DiceRoller │  │ - Rules      │      │
│  │ - RosterMgmt │  │ - Scoreboard │  │ - State Mgmt │      │
│  │ - CardSearch │  │ - Diamond    │  │ - Phases     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                           ▲                                  │
│                           │ Redux Store                      │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           API Client (mobile/src/api/)               │   │
│  │  - cardApi.ts (generateCard, searchCards)            │   │
│  │  - gameApi.ts (saveGame, loadGame)                   │   │
│  │  - rosterApi.ts (saveRoster, loadRoster)             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Netlify Edge Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  CDN + Redirects (/api/* → /.netlify/functions/*)   │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Serverless Functions (TypeScript)            │   │
│  │                                                       │   │
│  │  Cards:                                              │   │
│  │  - /cards-generate  POST   Generate player card      │   │
│  │  - /cards-search    GET    Query cached cards        │   │
│  │                                                       │   │
│  │  Games (future):                                     │   │
│  │  - /games/create    POST   Start new game            │   │
│  │  - /games/update    PUT    Save game state           │   │
│  │  - /games/get       GET    Resume game               │   │
│  │                                                       │   │
│  │  Rosters (future):                                   │   │
│  │  - /rosters/create  POST   Save custom roster        │   │
│  │  - /rosters/list    GET    List user rosters         │   │
│  │  - /rosters/get     GET    Load roster by ID         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ PostgreSQL Protocol
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Neon PostgreSQL (Serverless)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables:                                             │   │
│  │  - player_cards    (JSONB card data + indexes)       │   │
│  │  - game_sessions   (JSONB game state)                │   │
│  │  - rosters         (JSONB roster data)               │   │
│  │  - strategy_cards  (card definitions)                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Mobile App
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React Native | 0.73+ | Cross-platform mobile |
| Runtime | Expo | SDK 50+ | Development tooling |
| Language | TypeScript | 5.3+ | Type safety |
| State | Redux Toolkit | 2.0+ | Global state management |
| Navigation | React Navigation | 6+ | Screen routing |
| Styling | NativeBase / Styled Components | Latest | UI components |
| Sensors | expo-sensors | Latest | Accelerometer for dice |
| Testing | Jest + React Native Testing Library | Latest | Unit/integration tests |

### Backend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Platform | Netlify Functions | Latest | Serverless compute |
| Language | TypeScript | 5.3+ | Type safety |
| Database | Neon PostgreSQL | 14+ | Data persistence |
| DB Client | pg | 8.11+ | PostgreSQL driver |
| Build | esbuild | Via Netlify | Function bundling |

### Development Tools
| Tool | Purpose |
|------|---------|
| Git | Version control |
| GitHub | Repository hosting |
| ESLint | Code linting |
| Prettier | Code formatting |
| Jest | Testing framework |
| Expo Go | Mobile testing app |
| Netlify CLI | Local function testing |

## Project Structure

```
ShowdownApp/
├── mobile/                          # React Native app
│   ├── App.tsx                      # Entry point
│   ├── app.json                     # Expo configuration
│   ├── package.json                 # Mobile dependencies
│   ├── tsconfig.json                # TypeScript config
│   ├── babel.config.js              # Babel config
│   └── src/
│       ├── screens/                 # Screen components
│       │   └── GameScreen.tsx       # Main game UI
│       ├── components/              # Reusable UI components
│       │   ├── DiceRoller.tsx       # Shake-to-roll dice
│       │   ├── Scoreboard.tsx       # Score display
│       │   ├── BaseballDiamond.tsx  # Visual bases
│       │   └── PlayerCardView.tsx   # Card display
│       ├── engine/                  # Pure TypeScript game logic
│       │   └── GameEngine.ts        # MLB Showdown rules
│       ├── models/                  # TypeScript interfaces
│       │   ├── Card.ts              # PlayerCard, HitterCard, etc.
│       │   └── Game.ts              # GameState, GamePhase, etc.
│       ├── store/                   # Redux (future)
│       ├── api/                     # API client (future)
│       │   ├── cardApi.ts           # Card generation/search
│       │   ├── gameApi.ts           # Save/load games
│       │   └── rosterApi.ts         # Roster management
│       ├── utils/                   # Helper functions
│       │   └── sampleData.ts        # Test data
│       └── __tests__/               # Test files
│
├── netlify/
│   └── functions/                   # Serverless functions
│       ├── cards-generate.ts        # POST /api/cards-generate
│       ├── cards-search.ts          # GET /api/cards-search
│       ├── games/                   # Future: game endpoints
│       ├── rosters/                 # Future: roster endpoints
│       └── db.ts                    # Database connection pool
│
├── database/
│   ├── schema.sql                   # PostgreSQL schema
│   └── migrations/                  # Future: schema migrations
│
├── docs/
│   ├── REQUIREMENTS.md              # Full requirements doc
│   ├── GAME_RULES.md                # MLB Showdown mechanics
│   └── API.md                       # API documentation
│
├── .github/
│   ├── ISSUE_TEMPLATE/              # Issue templates
│   └── workflows/                   # CI/CD (future)
│
├── package.json                     # Root dependencies
├── netlify.toml                     # Netlify configuration
├── tsconfig.json                    # Root TypeScript config
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── README.md                        # Project overview
├── CONTRIBUTING.md                  # Development guidelines
├── AGENTS.md                        # AI agent instructions
├── NEXT_STEPS.md                    # Development checklist
├── ARCHITECTURE.md                  # This file
└── LICENSE                          # MIT license
```

## Data Models

### PlayerCard (TypeScript)
```typescript
interface PlayerCard {
  id: string;
  name: string;
  year: string;
  playerType: 'Pitcher' | 'Hitter';
  points: number;
  chart: ChartEntry[];
  speed?: number;
  defense?: Record<string, number>;
  
  // Pitcher-specific
  command?: number;
  control?: number;
  ip?: number;
  
  // Hitter-specific
  onBase?: number;
}

interface ChartEntry {
  minRoll: number;
  maxRoll: number;
  result: string; // 'SO', 'GB', 'FB', 'BB', '1B', '2B', '3B', 'HR'
}
```

### GameState (TypeScript)
```typescript
interface GameState {
  inning: number;
  isTopOfInning: boolean;
  outs: number;
  homeScore: number;
  awayScore: number;
  bases: [boolean, boolean, boolean]; // [1st, 2nd, 3rd]
  currentPhase: GamePhase;
  currentPitcher: PitcherCard;
  currentBatter: HitterCard;
  advantage: Advantage | null;
  lastRoll: number | null;
  pitcherFatigue: number; // Batters faced over IP
}

type GamePhase = 'PITCH' | 'ADVANTAGE' | 'SWING' | 'RESULT';
type Advantage = 'PITCHER' | 'BATTER';
```

### Database Schema (PostgreSQL)

**player_cards**
```sql
CREATE TABLE player_cards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  year VARCHAR(4) NOT NULL,
  card_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, year)
);
```

**game_sessions**
```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  home_team JSONB NOT NULL,
  away_team JSONB NOT NULL,
  game_state JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

**rosters**
```sql
CREATE TABLE rosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  roster_data JSONB NOT NULL,
  point_total INTEGER NOT NULL,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Game Engine Logic

The core game engine (`mobile/src/engine/GameEngine.ts`) implements MLB Showdown rules:

### Game Flow

```
1. PITCH PHASE
   ├─ Roll d20
   ├─ Add pitcher's Control
   ├─ Compare to batter's On-Base
   └─ Determine advantage
        ├─ If roll + Control > On-Base → PITCHER advantage
        └─ Else → BATTER advantage

2. ADVANTAGE PHASE
   └─ Set advantage holder for next roll

3. SWING PHASE
   ├─ Advantage holder rolls d20
   ├─ Look up result on their chart
   └─ Return result (SO, GB, FB, BB, 1B, 2B, 3B, HR)

4. RESULT PHASE
   ├─ Apply result to game state
   ├─ Update bases, outs, score
   ├─ Check for inning end (3 outs)
   ├─ Check for game end (9+ innings)
   └─ Apply pitcher fatigue if needed
```

### Fatigue System

```typescript
// After each batter, check if pitcher exceeded IP
battersFaced++;
if (battersFaced > pitcher.ip * 3) { // 3 batters per IP
  pitcher.control -= 1; // Penalty
}
```

### Baserunner Advancement

| Result | Baserunner Movement |
|--------|---------------------|
| SO, GB, FB | No advancement |
| BB, 1B | Force advance only |
| 2B | All runners advance 2 bases |
| 3B | All runners score, batter to 3rd |
| HR | All runners score including batter |

## API Endpoints

### Cards API

**POST /api/cards-generate**
```json
Request:
{
  "name": "Mike Trout",
  "year": "2021",
  "setVersion": "EXPANDED"
}

Response:
{
  "card": { /* PlayerCard object */ },
  "cached": false,
  "generatedAt": "2026-01-07T05:30:00Z"
}
```

**GET /api/cards-search**
```
Query params:
- name (string, optional): Filter by player name
- year (string, optional): Filter by year
- playerType (string, optional): 'Pitcher' or 'Hitter'
- minPoints (number, optional): Minimum point value
- maxPoints (number, optional): Maximum point value
- limit (number, optional): Max results (default 20)

Response:
{
  "cards": [/* Array of PlayerCard */],
  "count": 15,
  "query": { /* Echo of query params */ }
}
```

## Deployment Architecture

### Netlify Configuration

**Build Settings:**
- Build command: `npm install`
- Functions directory: `netlify/functions`
- Publish directory: `mobile/dist` (unused for now)
- Node version: 18+

**Environment Variables:**
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NODE_ENV` - production/development

**Redirects:**
```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Neon PostgreSQL

**Connection pooling:**
- Max connections: 10
- Idle timeout: 30s
- Connection timeout: 2s
- SSL: Required in production

**Scaling:**
- Automatic scaling with usage
- Serverless architecture
- Regional deployment (us-east-1 recommended)

### Mobile App Distribution

**Development:**
- Expo Go app for testing
- Hot reload via Metro bundler
- Local testing on physical devices

**Production (Future):**
- iOS: TestFlight → App Store
- Android: Internal testing → Google Play
- EAS Build for native compilation

## Security Considerations

### Current State (MVP)
- No authentication (public API)
- No rate limiting (rely on Netlify defaults)
- No sensitive data stored
- Database credentials in environment variables only

### Future Enhancements
- [ ] Add API authentication (JWT tokens)
- [ ] Implement rate limiting per IP
- [ ] Add request validation (Zod schemas)
- [ ] Sanitize user inputs
- [ ] Add CORS restrictions
- [ ] Implement user accounts

## Performance Considerations

### Caching Strategy
1. **Database cache** - Store generated cards in PostgreSQL
2. **Check cache first** - Avoid redundant Baseball Reference calls
3. **Stale cache** - No expiration (player stats don't change)

### Database Indexes
```sql
-- Optimize common queries
CREATE INDEX idx_player_cards_name ON player_cards(LOWER(name));
CREATE INDEX idx_player_cards_year ON player_cards(year);
CREATE INDEX idx_player_cards_type ON player_cards((card_data->>'playerType'));
CREATE INDEX idx_player_cards_points ON player_cards(((card_data->>'points')::int));
```

### Netlify Function Optimization
- Connection pool reuse across invocations
- Lazy loading of heavy dependencies
- Minimal bundle size with esbuild
- Cold start mitigation via keep-warm pings (future)

## Testing Strategy

### Mobile App Tests
```
mobile/src/__tests__/
├── engine/
│   └── GameEngine.test.ts    # Game logic unit tests
├── components/
│   ├── DiceRoller.test.tsx   # Component tests
│   └── Scoreboard.test.tsx
└── integration/
    └── GameFlow.test.tsx     # E2E game tests
```

### Backend Tests (Future)
```
tests/
├── unit/
│   ├── cardGeneration.test.ts
│   └── database.test.ts
└── integration/
    └── apiEndpoints.test.ts
```

### Test Commands
```bash
cd mobile
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test GameEngine.test.ts # Specific test
```

## Monitoring and Debugging

### Netlify Functions
- Function logs in Netlify dashboard
- Error tracking via console.error()
- Deploy logs for build failures

### Mobile App
- React DevTools for component inspection
- Redux DevTools for state debugging
- Expo DevTools for network/performance
- Console logs visible in terminal

### Database
```bash
# Connect to Neon
psql $DATABASE_URL

# Check table contents
SELECT COUNT(*) FROM player_cards;

# View recent cards
SELECT name, year FROM player_cards ORDER BY created_at DESC LIMIT 10;
```

## Scalability Considerations

### Current Limits
- Netlify Functions: 125k invocations/month (free tier)
- Neon PostgreSQL: 3 GB storage (free tier)
- Concurrent functions: 10 (free tier)

### Scaling Strategy
- **Horizontal:** Netlify auto-scales function instances
- **Database:** Neon auto-scales compute resources
- **Caching:** Reduces database load significantly
- **CDN:** Netlify edge caching for static assets

### When to Upgrade
- **Functions:** If API calls exceed 125k/month
- **Database:** If storage exceeds 3GB (unlikely for MVP)
- **Compute:** If cold starts become problematic

## Development Workflow

### Local Development
```bash
# Terminal 1: Mobile app
cd mobile && npm start

# Terminal 2: Netlify Functions
npm run dev:functions

# Terminal 3: Database (if needed)
psql $DATABASE_URL
```

### Deployment Workflow
```bash
# 1. Ensure tests pass
cd mobile && npm test

# 2. Deploy backend
npm run deploy

# 3. Test production endpoints
curl https://your-site.netlify.app/api/cards-search

# 4. Build mobile app (future)
cd mobile && eas build
```

---

**Last Updated:** 2026-01-07  
**Version:** MVP Architecture v1.0
