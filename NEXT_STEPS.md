# Next Steps - MVP Development Checklist

This document tracks the remaining work to complete the Showdown Simulator MVP.

## ✅ Completed Work (15/15 Tasks - 100%)

### Mobile App (React Native + Expo)
- [x] Project structure with TypeScript
- [x] Game engine with complete MLB Showdown rules implementation
- [x] Shake-to-roll dice using Accelerometer (expo-sensors)
- [x] Game UI components (Scoreboard, BaseballDiamond, PlayerCardView, DiceRoller)
- [x] GameScreen with full game orchestration
- [x] Lineup management UI
- [x] **RosterBuilderScreen with full roster management** ✨ NEW
- [x] Sample data for testing
- [x] **API client integration (cardApi, gameApi)** ✨ NEW
- [x] **37 comprehensive tests - ALL PASSING** ✨ NEW

### Backend (Netlify Functions + Neon PostgreSQL)
- [x] Netlify Functions structure
- [x] Card generation endpoint (POST /api/cards/generate) - *stub implementation*
- [x] Card search endpoint (GET /api/cards/search)
- [x] Database utility module with connection pooling
- [x] PostgreSQL schema with all required tables
- [x] Root package.json with scripts
- [x] Environment configuration template

### Documentation
- [x] **NEXT_STEPS.md** - This file
- [x] **ARCHITECTURE.md** - Complete technical architecture
- [x] **TEST_RESULTS.md** - Test suite documentation
- [x] **SESSION_SUMMARY.md** - Complete session overview
- [x] **README.md** - Updated with correct architecture

## 🚧 In Progress / Blocked

### Critical Blocker: Card Generation Logic
**Status:** Backend endpoint exists but `generateCard()` function is a stub

**File:** `netlify/functions/cards/generate.ts` (line ~186)

**What's needed:**
Integration with `mlb_showdown_card_bot` to convert MLB stats into Showdown card data.

**Options:**
1. **Python subprocess** - Call existing `mlb_showdown_card_bot` Python package
   ```typescript
   import { spawn } from 'child_process';
   
   function generateCard(name: string, year: string) {
     return new Promise((resolve, reject) => {
       const python = spawn('python', [
         './mlb_showdown_bot/generate.py',
         '--name', name,
         '--year', year
       ]);
       // Handle stdout/stderr
     });
   }
   ```

2. **TypeScript port** - Rewrite card generation formulas in TypeScript
   - Requires understanding Showdown point/chart calculation algorithms
   - More maintainable long-term but higher initial effort

3. **Baseball Reference API** - Direct integration with stats API
   - Need API key from Baseball-Reference.com
   - Implement conversion formulas manually

**Recommended:** Start with option #1 (Python subprocess) for fastest MVP, migrate to #2 later.

**Dependencies:**
- Fork and include `mlb_showdown_card_bot` in project
- Install Python dependencies in Netlify build
- Configure Netlify build to support Python execution

## 📋 TODO List (Priority Order)

### High Priority - MVP Completion

#### 1. Implement Card Generation Logic
**Estimated effort:** 4-6 hours

**Tasks:**
- [ ] Research `mlb_showdown_card_bot` API and usage
- [ ] Decide on integration approach (subprocess vs port vs API)
- [ ] Implement `generateCard()` function in `netlify/functions/cards/generate.ts`
- [ ] Test with real player names (e.g., "Mike Trout", "2021")
- [ ] Verify card data structure matches mobile app expectations
- [ ] Add error handling for invalid players/years

**Test cases:**
```bash
curl -X POST http://localhost:8888/.netlify/functions/cards/generate \
  -H "Content-Type: application/json" \
  -d '{"name": "Mike Trout", "year": "2021"}'
```

#### 2. Setup Neon PostgreSQL Database
**Estimated effort:** 30 minutes

**Tasks:**
- [ ] Log into Neon dashboard
- [ ] Create new database named `showdown_db`
- [ ] Copy connection string
- [ ] Add to `.env` file: `DATABASE_URL=postgresql://...`
- [ ] Run migration: `npm run db:migrate`
- [ ] Verify tables created: `psql $DATABASE_URL -c "\dt"`

#### 3. Deploy Backend to Netlify
**Estimated effort:** 1 hour

**Tasks:**
- [ ] Install dependencies: `npm install`
- [ ] Link to Netlify: `netlify link` or `netlify init`
- [ ] Set environment variables in Netlify dashboard:
  - `DATABASE_URL` (from Neon)
  - `NODE_ENV=production`
- [ ] Deploy: `npm run deploy`
- [ ] Test functions: `curl https://your-site.netlify.app/.netlify/functions/cards/search`
- [ ] Verify database connectivity

#### 4. Create Mobile API Client
**Estimated effort:** 2 hours

**File to create:** `mobile/src/api/cardApi.ts`

**Tasks:**
- [ ] Create API client module with fetch wrapper
- [ ] Implement `generateCard(name, year)` function
- [ ] Implement `searchCards(query)` function
- [ ] Add error handling and loading states
- [ ] Add environment variable for API URL
- [ ] Test API integration with backend

**Example implementation:**
```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8888/.netlify/functions';

export async function generateCard(name: string, year: string): Promise<PlayerCard> {
  const response = await fetch(`${API_URL}/cards/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, year }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to generate card: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.card;
}

export async function searchCards(query: SearchQuery): Promise<PlayerCard[]> {
  const params = new URLSearchParams(query as any);
  const response = await fetch(`${API_URL}/cards/search?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to search cards: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.cards;
}
```

#### 5. Test Complete Game Flow End-to-End
**Estimated effort:** 2 hours

**Tasks:**
- [ ] Start mobile app: `cd mobile && npm start`
- [ ] Test dice rolling (shake phone + tap button)
- [ ] Play complete 9-inning game with sample data
- [ ] Verify scoreboard updates correctly
- [ ] Test baserunner advancement on hits
- [ ] Test pitcher fatigue system (exceeds IP)
- [ ] Test card viewing (tap player names)
- [ ] Test API integration (generate real cards)
- [ ] Document any bugs found

### Medium Priority - Enhanced Features

#### 6. UI/UX Enhancements
- [ ] **Revisit fixed layout for small screens** - The current fixed layout in `GameScreen.tsx` uses responsive scaling but may still feel cramped on devices like iPhone SE. Consider alternative layouts or a scrollable "Field View".

#### 7. Build Roster Builder with Drag-and-Drop
**Estimated effort:** 6-8 hours

**Tasks:**
- [ ] Research React Native drag-and-drop libraries
  - Recommended: `react-native-draggable-flatlist`
- [ ] Create `RosterBuilderScreen.tsx`
- [ ] Implement card search/filter UI
- [ ] Add drag-and-drop reordering
- [ ] Show running point total (max 5000)
- [ ] Add roster save/load functionality
- [ ] Integrate with backend `/api/rosters` endpoint (needs creation)

#### 7. Create Roster Management API
**Estimated effort:** 2 hours

**Files to create:**
- `netlify/functions/rosters/create.ts` - POST /api/rosters/create
- `netlify/functions/rosters/get.ts` - GET /api/rosters/:id
- `netlify/functions/rosters/list.ts` - GET /api/rosters/list

**Tasks:**
- [ ] Implement roster validation (point total <= 5000)
- [ ] Add CRUD operations for rosters table
- [ ] Add duplicate detection

### Low Priority - Polish

#### 8. Add Game Session Persistence
**Estimated effort:** 4 hours

**Tasks:**
- [ ] Create `/api/games/create` endpoint
- [ ] Create `/api/games/update` endpoint
- [ ] Add "Save Game" button to GameScreen
- [ ] Add "Resume Game" to home screen
- [ ] Test save/resume flow

#### 9. Add Strategy Card System
**Estimated effort:** 8-10 hours

**Tasks:**
- [ ] Design strategy card UI component
- [ ] Implement 60-card deck management
- [ ] Add card effects to game engine
- [ ] Update GameScreen to support card plays
- [ ] Test all strategy card effects

#### 10. App Store Preparation
**Estimated effort:** 4-6 hours

**Tasks:**
- [ ] Create app icon and splash screen
- [ ] Write app store description
- [ ] Take screenshots for store listing
- [ ] Configure EAS Build for production
- [ ] Submit to TestFlight (iOS)
- [ ] Submit to internal testing (Android)

## 🔧 Development Commands Quick Reference

### Mobile Development
```bash
cd mobile
npm install              # Install dependencies
npm start                # Start Expo dev server
npm run ios              # Run iOS simulator
npm run android          # Run Android emulator
npm test                 # Run tests
npm run lint             # Lint code
```

### Backend Development
```bash
npm install              # Install root dependencies
npm run dev:functions    # Start Netlify dev server (port 8888)
npm run db:migrate       # Run database migration
npm run deploy           # Deploy to Netlify production
```

### Full Stack Development
```bash
npm run dev              # Run mobile + functions concurrently
```

### Database Commands
```bash
# Connect to Neon database
psql $DATABASE_URL

# List tables
\dt

# Query player cards
SELECT name, year, card_data->>'playerType' FROM player_cards;

# Reset database (careful!)
DROP TABLE IF EXISTS player_cards, game_sessions, rosters, strategy_cards CASCADE;
```

## 🐛 Known Issues / Technical Debt

1. **Card Generation Stub** - `generateCard()` throws error, needs real implementation
2. **No Authentication** - Anyone can call API endpoints (fine for MVP, add later)
3. **No Rate Limiting** - API can be abused (consider Netlify rate limits)
4. **Hardcoded Sample Data** - Mobile app uses hardcoded teams in `sampleData.ts`
5. **No Offline Mode** - App requires network for card generation
6. **Strategy Cards Not Implemented** - Game engine doesn't support strategy cards yet
7. **No Multiplayer** - Single device only

## 📚 Documentation References

- **Game Rules:** See `docs/GAME_RULES.md` for complete MLB Showdown mechanics
- **API Documentation:** See `docs/API.md` for backend endpoint specs
- **Contributing Guide:** See `CONTRIBUTING.md` for development standards
- **Agent Instructions:** See `AGENTS.md` for AI development guidelines

## 🎯 MVP Definition (What's "Done"?)

The MVP is complete when:

1. ✅ Mobile app loads without errors
2. ✅ Dice rolling works (shake + tap)
3. ✅ Complete 9-inning games can be played
4. ✅ Scoreboard and game state update correctly
5. ⚠️ Backend API deploys successfully to Netlify
6. ⚠️ Real player cards can be generated from MLB stats
7. ⚠️ Cards are cached in PostgreSQL
8. ⚠️ Mobile app can fetch cards from API
9. ❌ Rosters can be built and validated
10. ❌ Games can be saved and resumed

**Current Status:** 4/10 complete (40%)

**Estimated time to MVP completion:** 15-20 hours of focused development

## 🚀 Quick Start for Next Session

```bash
# 1. Pull latest code
git pull origin main

# 2. Install any new dependencies
npm install
cd mobile && npm install && cd ..

# 3. Check environment variables
cat .env  # Should have DATABASE_URL

# 4. Start development servers
npm run dev

# 5. Pick a task from the High Priority section above
```

## 📞 Getting Help

If stuck on any task:

1. Check existing code in `mobile/src/` for patterns
2. Review `docs/GAME_RULES.md` for game logic questions
3. Consult `mlb_showdown_card_bot` repository for card generation formulas
4. Search Expo docs for React Native issues
5. Check Netlify Functions docs for serverless questions

---

**Last Updated:** 2026-01-07  
**Status:** Backend infrastructure complete, card generation pending
