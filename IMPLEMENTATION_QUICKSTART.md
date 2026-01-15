# Implementation Quick Start Guide

**For the developer who wants to start coding Phase 0 immediately.**

---

## What You Need to Know

### Current State
- ✅ GameEngine is complete and tested (37 passing tests)
- ✅ Card generation from showdownbot.com works
- ✅ React Native UI exists for local gameplay
- ❌ No user accounts or persistence
- ❌ No multiplayer, marketplace, or progression

### What We're Building (Phase 0)
A full backend that allows:
1. User registration with email/username/password
2. Each user gets a starter pack (15 cards) automatically
3. Users can browse their cards
4. Users can build a valid deck from their cards
5. Games can be saved and resumed

**Timeline**: Week 1-2 (2 weeks for Phase 0)

---

## Phase 0 Step-by-Step

### Step 1: Database Migrations (Day 1)

**Run these SQL migrations in order**:

```bash
# Connect to your Neon database
psql $DATABASE_URL < database/migrations/001-extensions.sql
psql $DATABASE_URL < database/migrations/002-users.sql
psql $DATABASE_URL < database/migrations/003-card-templates.sql
psql $DATABASE_URL < database/migrations/004-card-instances.sql
psql $DATABASE_URL < database/migrations/005-decks.sql
psql $DATABASE_URL < database/migrations/006-user-stats.sql
```

**What gets created**:
- `users` table (email, username, password_hash)
- `refresh_tokens` table (JWT refresh tokens)
- `card_templates` table (player archetypes)
- `card_instances` table (owned cards with serial numbers)
- `decks` table (user's card collections)
- `deck_cards` table (many-to-many linking)
- `user_stats` table (wins/losses/rating/xp)

### Step 2: Backend API Functions (Day 2-3)

Create these Netlify Functions in `netlify/functions/`:

#### Authentication (4 functions)

**1. `auth/register.ts`** (100 lines)
- Input: email, username, password, displayName
- Process:
  - Validate email/username format
  - Hash password with bcrypt
  - Create user record
  - Create user_stats (rating=1200, coins=1000, level=1)
  - Generate starter pack
  - Create default deck from starter cards
  - Issue JWT + Refresh token
- Output: user, tokens, starterPackId

**2. `auth/login.ts`** (80 lines)
- Input: email, password
- Process:
  - Find user by email
  - Compare password hash
  - Generate tokens
  - Update last_login_at
- Output: user, tokens, stats

**3. `auth/refresh.ts`** (60 lines)
- Input: refreshToken
- Process:
  - Validate refresh token not expired/revoked
  - Generate new accessToken
- Output: accessToken, expiresIn

**4. `auth/logout.ts`** (40 lines)
- Input: refreshToken
- Process:
  - Mark refreshToken as revoked (set revoked_at)
  - Or delete it (choose one)
- Output: success

#### Inventory (2 functions)

**5. `inventory/list-cards.ts`** (120 lines)
- Input: userId, page, limit, filters (playerType, rarity, search)
- Process:
  - Query card_instances WHERE owner_id = userId
  - Join with card_templates for full card data
  - Filter by playerType, rarity, points
  - Paginate (skip, take)
  - Count total
- Output: cards[], pagination metadata

**6. `inventory/get-card.ts`** (80 lines)
- Input: userId, cardInstanceId
- Process:
  - Query card_instances + card_templates
  - Verify owner is userId
  - Calculate stats (if card has been used in games)
  - Count duplicates of this template
- Output: card details

#### Decks (5 functions)

**7. `decks/list.ts`** (60 lines)
- Input: userId
- Process:
  - Query decks WHERE user_id = userId
  - Count cards in each deck
  - Calculate point total
- Output: deck[], count by deck

**8. `decks/create.ts`** (100 lines)
- Input: userId, name, description
- Process:
  - Create decks record
  - Set is_valid = false (no cards yet)
- Output: deck object

**9. `decks/get.ts`** (100 lines)
- Input: userId, deckId
- Process:
  - Query decks + all deck_cards + card_instances + card_templates
  - Calculate point total and validation
- Output: full deck with all card details

**10. `decks/update.ts`** (150 lines)
- Input: userId, deckId, addCards[], removeCards[]
- Process:
  - Verify user owns deck
  - For each add: INSERT into deck_cards
  - For each remove: DELETE from deck_cards
  - Recalculate point total via trigger (auto-updated)
  - Validate deck (max 5000 points)
- Output: updated deck + validation result

**11. `decks/delete.ts`** (60 lines)
- Input: userId, deckId
- Process:
  - Verify user owns deck
  - DELETE FROM decks (CASCADE deletes deck_cards)
- Output: success

#### Lineups (optional for Phase 0, but prep)

**12. `lineups/create.ts`** (200 lines)
- Input: userId, deckId, name, battingOrder[9], startingPitcher, bullpen[], defensivePositions{}
- Process:
  - Verify all 9 cards in batting order are in the deck
  - Verify pitcher is in deck
  - Validate each card can play assigned position
  - No duplicate cards
  - Check point total
  - INSERT into lineups
- Output: lineup + validation result

### Step 3: Middleware & Utilities (Day 3)

**`common/auth-middleware.ts`** (80 lines)
- JWT verification
- Extract user ID from token
- Attach to event context

**`common/validation.ts`** (100 lines)
- Zod schemas for all endpoints
- Email validation
- Username validation
- Password rules

**`common/error-handler.ts`** (100 lines)
- Catch all errors
- Return standard error response
- Log for debugging
- Handle Zod validation errors

**`common/db-client.ts`** (50 lines)
- Export `getPool()` for all functions
- Connection pooling singleton

### Step 4: Frontend Redux + Screens (Day 4)

**Redux Store** (`mobile/src/store/`)

**`auth.slice.ts`**
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

// Actions: registerUser, loginUser, logout, setUser, clearError
```

**`inventory.slice.ts`**
```typescript
interface InventoryState {
  cards: CardInstance[];
  loading: boolean;
  page: number;
  totalPages: number;
  filters: { playerType?, rarity?, search? };
}

// Actions: loadCards, addCard, filterCards, setPage
```

**`decks.slice.ts`**
```typescript
interface DecksState {
  decks: Deck[];
  selectedDeckId: string | null;
  loading: boolean;
}

// Actions: loadDecks, createDeck, selectDeck, addCardToDeck
```

**Screens**

**`AuthScreen.tsx`** (Register + Login)
- Two tabs: Register / Login
- Form fields: email, username (register only), password
- Button: "Create Account" / "Sign In"
- On success: Save tokens to secure storage, navigate to Home

**`InventoryScreen.tsx`** (Browse Cards)
- List view of owned cards
- Filters: Player Type, Rarity, Min/Max Points
- Search bar
- Pagination
- Tap card to see details

**`DeckBuilderScreen.tsx`** (Manage Decks)
- List user's decks
- "New Deck" button
- For each deck:
  - Show name, card count, point total
  - Tap to edit
  - Edit view: drag cards in/out, validate

### Step 5: Testing (Day 5)

**Manual test flow**:
1. Launch app → AuthScreen
2. Register with test email/username → Receive starter pack
3. See "You got 15 cards!"
4. Navigate to Inventory → See all 15 cards
5. Create a new deck
6. Add cards from inventory to deck → Validate it works
7. See point total update in real-time
8. Log out → Log back in → See same deck

**Automated tests** (optional for Phase 0, but prep):
- Auth registration (happy path + error cases)
- Deck creation & validation
- Card filtering

---

## File Count for Phase 0

| Category | Files | Est. Lines |
|----------|-------|-----------|
| Backend Functions | 12 | 1,200 |
| Common Utilities | 4 | 400 |
| Database Migrations | 6 | 600 |
| Redux Slices | 3 | 300 |
| Screens | 3 | 1,500 |
| Components | 2 | 400 |
| API Client | 2 | 200 |
| **Total** | **32** | **4,600** |

---

## Key Implementation Details

### Password Hashing
```typescript
import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash(password, 12); // Cost factor 12
```

### JWT Tokens
```typescript
import jwt from 'jsonwebtoken';
const accessToken = jwt.sign(
  { userId, email },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
const refreshToken = jwt.sign(
  { userId },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
);
```

### Starter Pack Generation
```typescript
function generateStarterPack(userId: string): CardInstance[] {
  // 1. Query card_templates (all available cards)
  // 2. Weighted random selection:
  //    - 9 common (60%)
  //    - 4 uncommon (27%)
  //    - 2 rare (13%)
  // 3. Guarantee: 3 pitchers + 12 hitters
  // 4. Create card_instances with source='starter'
  // 5. Return array of card instances
}
```

### Deck Point Validation
```typescript
// Trigger auto-calculates point_total:
const total = SUM(card_templates.points)
              FROM deck_cards
              WHERE deck_id = $1

// Application-side validation:
if (pointTotal > 5000) {
  return { valid: false, error: 'Point limit exceeded' };
}
```

---

## Dependency Installation

Add to `package.json`:
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.2",
    "zod": "^3.22.4",
    "pg": "^8.11.2"
  }
}
```

For frontend:
```json
{
  "dependencies": {
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3"
  }
}
```

---

## Environment Variables Needed

**Backend** (add to `.env`):
```
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
NODE_ENV=development
```

**Frontend** (add to `mobile/.env`):
```
EXPO_PUBLIC_API_URL=http://localhost:9000/api
```

---

## Debugging

### Database Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# View migrations applied
psql $DATABASE_URL -c "SELECT * FROM schema_migrations;" # (need to track manually)

# Check table structure
psql $DATABASE_URL -c "\dt users"
```

### API Issues
```bash
# Test registration
curl -X POST http://localhost:9000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"SecurePass123"}'

# Check auth token
curl -X GET http://localhost:9000/api/inventory/cards \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Success Criteria for Phase 0

✅ User can register with unique email/username
✅ User receives starter pack (15 cards) automatically
✅ User can log in and get JWT tokens
✅ User can list owned cards
✅ User can create a deck
✅ User can add/remove cards from deck
✅ Point total validates correctly
✅ No crashes, error messages are helpful
✅ All 12 API functions tested manually

---

## Timeline

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Database migrations | All 6 .sql files applied |
| 2 | Auth endpoints | register, login, refresh working |
| 3 | Inventory + Deck endpoints | Full backend API |
| 3 | Common utilities | Auth middleware, validation, errors |
| 4 | Redux store | Auth, inventory, decks slices |
| 4 | UI Screens | AuthScreen, InventoryScreen, DeckBuilderScreen |
| 5 | Testing | Manual end-to-end test passes |

---

## Common Pitfalls to Avoid

1. **Don't** use `Math.random()` for RNG → Use `crypto.randomBytes()` instead
2. **Don't** store plaintext passwords → Always use bcrypt
3. **Don't** send JWT secret to client → Keep it server-side only
4. **Don't** forget CORS headers in Netlify functions
5. **Don't** update point totals manually → Use database trigger
6. **Don't** allow users to modify other users' cards → Always verify userId
7. **Don't** return full game state to client until needed → Query optimization

---

## Questions During Implementation?

Refer to the full specifications:
- **Database**: full-architecture-spec.md (lines 156-1000)
- **API Schemas**: full-architecture-spec-part2.md (all endpoints with examples)
- **Workflows**: full-architecture-spec-part3.md (pseudocode and diagrams)

---

**Ready to start?**

Create a new branch: `git checkout -b feature/phase-0-authentication-and-ownership`

Then follow the 5-day plan above.

Good luck! 🚀
