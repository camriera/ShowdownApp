## STEP 3: API Design

### 3.1 Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request**:
```typescript
// Zod Schema
const RegisterRequestSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(100),
  displayName: z.string().max(100).optional(),
});

// Example
{
  "email": "player@example.com",
  "username": "slugger42",
  "password": "SecurePass123!",
  "displayName": "The Slugger"
}
```

**Response** (201 Created):
```typescript
const RegisterResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string(),
    displayName: z.string().nullable(),
    createdAt: z.string().datetime(),
  }),
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(), // seconds
  }),
  starterPack: z.object({
    packId: z.string().uuid(),
    cardCount: z.number(),
  }),
});

// Example
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "player@example.com",
    "username": "slugger42",
    "displayName": "The Slugger",
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
    "expiresIn": 3600
  },
  "starterPack": {
    "packId": "660e8400-e29b-41d4-a716-446655440001",
    "cardCount": 15
  }
}
```

**Errors**:
| Code | Message | Description |
|------|---------|-------------|
| 400 | `INVALID_EMAIL` | Email format invalid |
| 400 | `INVALID_USERNAME` | Username format invalid |
| 400 | `PASSWORD_TOO_WEAK` | Password doesn't meet requirements |
| 409 | `EMAIL_EXISTS` | Email already registered |
| 409 | `USERNAME_EXISTS` | Username already taken |

---

#### POST /api/auth/login
Authenticate user and receive tokens.

**Request**:
```typescript
const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  deviceInfo: z.object({
    platform: z.enum(['ios', 'android', 'web']),
    deviceId: z.string().optional(),
  }).optional(),
});
```

**Response** (200 OK):
```typescript
const LoginResponseSchema = z.object({
  user: UserSchema,
  tokens: TokensSchema,
  stats: z.object({
    wins: z.number(),
    losses: z.number(),
    rating: z.number(),
    level: z.number(),
  }),
});
```

**Errors**:
| Code | Message |
|------|---------|
| 401 | `INVALID_CREDENTIALS` |
| 403 | `ACCOUNT_BANNED` |
| 403 | `ACCOUNT_INACTIVE` |

---

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request**:
```typescript
const RefreshRequestSchema = z.object({
  refreshToken: z.string(),
});
```

**Response** (200 OK):
```typescript
const RefreshResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
});
```

---

#### POST /api/auth/logout
Revoke refresh token.

**Request Header**: `Authorization: Bearer {accessToken}`

**Request**:
```typescript
const LogoutRequestSchema = z.object({
  refreshToken: z.string(),
  allDevices: z.boolean().optional().default(false),
});
```

**Response** (204 No Content)

---

### 3.2 Inventory Endpoints

#### GET /api/inventory/cards
List user's owned cards with filtering and pagination.

**Auth**: Required

**Query Parameters**:
```typescript
const ListCardsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  playerType: z.enum(['Pitcher', 'Hitter']).optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).optional(),
  minPoints: z.coerce.number().optional(),
  maxPoints: z.coerce.number().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'points', 'rarity', 'acquired']).default('acquired'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
```

**Response** (200 OK):
```typescript
const ListCardsResponseSchema = z.object({
  cards: z.array(CardInstanceSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

// CardInstanceSchema
const CardInstanceSchema = z.object({
  id: z.string().uuid(),
  templateId: z.string().uuid(),
  serialNumber: z.number(),
  rarity: RaritySchema,
  isMinted: z.boolean(),
  isTradeable: z.boolean(),
  isListed: z.boolean(),
  acquiredAt: z.string().datetime(),
  template: CardTemplateSchema,
});
```

**curl Example**:
```bash
curl -X GET "https://api.showdown.app/api/inventory/cards?page=1&limit=20&playerType=Hitter&sortBy=points&sortOrder=desc" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### GET /api/inventory/cards/:id
Get detailed card instance information.

**Auth**: Required

**Response** (200 OK):
```typescript
const CardDetailResponseSchema = z.object({
  card: CardInstanceSchema.extend({
    stats: z.object({
      gamesPlayed: z.number(),
      atBats: z.number(),
      hits: z.number(),
      homeRuns: z.number(),
      battingAvg: z.number(),
      // Pitcher stats if applicable
      inningsPitched: z.number().optional(),
      era: z.number().optional(),
    }).optional(),
    craftingEligible: z.boolean(),
    duplicateCount: z.number(),
  }),
});
```

---

#### POST /api/inventory/craft
Combine cards to create higher rarity version.

**Auth**: Required

**Request**:
```typescript
const CraftRequestSchema = z.object({
  inputCardIds: z.array(z.string().uuid()).min(3).max(5),
  recipeType: z.enum(['upgrade_rarity', 'combine_duplicates']),
});

// Example - combine 3 common Mike Trouts into 1 uncommon
{
  "inputCardIds": [
    "card-instance-1",
    "card-instance-2",
    "card-instance-3"
  ],
  "recipeType": "upgrade_rarity"
}
```

**Response** (201 Created):
```typescript
const CraftResponseSchema = z.object({
  outputCard: CardInstanceSchema,
  consumedCards: z.array(z.string().uuid()),
  xpEarned: z.number(),
});
```

**Errors**:
| Code | Message | Description |
|------|---------|-------------|
| 400 | `INVALID_CARD_COUNT` | Need exactly 3 cards for upgrade |
| 400 | `CARDS_NOT_SAME_TEMPLATE` | All cards must be same player |
| 400 | `CARD_NOT_OWNED` | One or more cards not owned |
| 400 | `CARD_IN_DECK` | Cannot craft cards in active deck |
| 400 | `MAX_RARITY` | Cannot upgrade legendary cards |

---

### 3.3 Deck Endpoints

#### GET /api/decks
List user's decks.

**Auth**: Required

**Response** (200 OK):
```typescript
const ListDecksResponseSchema = z.object({
  decks: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    pointTotal: z.number(),
    isValid: z.boolean(),
    cardCount: z.number(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })),
});
```

---

#### POST /api/decks
Create a new deck.

**Auth**: Required

**Request**:
```typescript
const CreateDeckRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  cardIds: z.array(z.string().uuid()).optional(),
});
```

**Response** (201 Created):
```typescript
const CreateDeckResponseSchema = z.object({
  deck: DeckSchema,
});
```

---

#### PUT /api/decks/:id
Update deck (add/remove cards).

**Auth**: Required

**Request**:
```typescript
const UpdateDeckRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  addCards: z.array(z.object({
    cardInstanceId: z.string().uuid(),
    slotType: z.enum(['pitcher', 'hitter', 'bench', 'bullpen']),
    slotPosition: z.number().min(1).max(9).optional(),
  })).optional(),
  removeCards: z.array(z.string().uuid()).optional(),
});
```

**Response** (200 OK):
```typescript
const UpdateDeckResponseSchema = z.object({
  deck: DeckSchema,
  validationResult: z.object({
    isValid: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string()),
  }),
});
```

---

#### DELETE /api/decks/:id
Delete a deck.

**Auth**: Required

**Response** (204 No Content)

---

#### POST /api/decks/:id/clone
Clone an existing deck.

**Auth**: Required

**Request**:
```typescript
const CloneDeckRequestSchema = z.object({
  newName: z.string().min(1).max(100),
});
```

---

### 3.4 Lineup Endpoints

#### POST /api/lineups
Create a game-ready lineup from a deck.

**Auth**: Required

**Request**:
```typescript
const CreateLineupRequestSchema = z.object({
  deckId: z.string().uuid(),
  name: z.string().min(1).max(100),
  battingOrder: z.array(z.string().uuid()).length(9),
  startingPitcher: z.string().uuid(),
  bullpen: z.array(z.string().uuid()).max(5).optional(),
  defensivePositions: z.record(z.string().uuid(), z.string()),
});

// Example
{
  "deckId": "deck-uuid",
  "name": "Game Day Lineup",
  "battingOrder": [
    "card-instance-1", // Leadoff
    "card-instance-2", // 2nd
    // ... 9 total
  ],
  "startingPitcher": "pitcher-instance-id",
  "bullpen": ["reliever-1", "reliever-2"],
  "defensivePositions": {
    "card-instance-1": "CF",
    "card-instance-2": "SS",
    // ...
  }
}
```

**Response** (201 Created):
```typescript
const CreateLineupResponseSchema = z.object({
  lineup: LineupSchema,
  validation: z.object({
    isValid: z.boolean(),
    pointTotal: z.number(),
    errors: z.array(z.object({
      field: z.string(),
      message: z.string(),
    })),
  }),
});
```

**Validation Rules**:
- Exactly 9 hitters in batting order
- All cards must be owned by user
- All cards must be in the deck
- Point total must be <= 5000
- Each position must be valid for the assigned card
- No duplicate cards
- Starting pitcher must have IP >= 4

---

#### GET /api/lineups/:id/validate
Validate a lineup without saving.

**Auth**: Required

**Response** (200 OK):
```typescript
const ValidateLineupResponseSchema = z.object({
  isValid: z.boolean(),
  pointTotal: z.number(),
  errors: z.array(ValidationErrorSchema),
  warnings: z.array(z.string()),
  suggestions: z.array(z.string()),
});
```

---

### 3.5 Pack Endpoints

#### GET /api/packs
List user's unopened packs.

**Auth**: Required

**Response** (200 OK):
```typescript
const ListPacksResponseSchema = z.object({
  packs: z.array(z.object({
    id: z.string().uuid(),
    packType: PackTypeSchema,
    source: PackSourceSchema,
    cardCount: z.number(),
    guaranteedRarity: RaritySchema.nullable(),
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime().nullable(),
  })),
});
```

---

#### POST /api/packs/:id/open
Open a pack and receive cards.

**Auth**: Required

**Response** (200 OK):
```typescript
const OpenPackResponseSchema = z.object({
  pack: z.object({
    id: z.string().uuid(),
    packType: PackTypeSchema,
  }),
  cards: z.array(z.object({
    card: CardInstanceSchema,
    revealOrder: z.number(),
    isNew: z.boolean(), // First time getting this template
    isDuplicate: z.boolean(),
  })),
  rewards: z.object({
    xpEarned: z.number(),
    coinsEarned: z.number(),
  }),
});
```

**Pack Contents by Type**:
| Pack Type | Cards | Common | Uncommon | Rare | Epic | Legendary |
|-----------|-------|--------|----------|------|------|-----------|
| starter | 15 | 60% | 30% | 8% | 1.9% | 0.1% |
| standard | 5 | 70% | 20% | 8% | 1.8% | 0.2% |
| premium | 5 | 40% | 35% | 18% | 6% | 1% |
| legendary | 5 | 20% | 30% | 30% | 15% | 5% |

---

### 3.6 Game Endpoints

#### POST /api/games
Create a new game session.

**Auth**: Required

**Request**:
```typescript
const CreateGameRequestSchema = z.object({
  lineupId: z.string().uuid(),
  mode: z.enum(['async', 'realtime', 'ai']),
  opponentId: z.string().uuid().optional(), // For direct challenge
  aiDifficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  isRanked: z.boolean().default(true),
});
```

**Response** (201 Created):
```typescript
const CreateGameResponseSchema = z.object({
  game: z.object({
    id: z.string().uuid(),
    status: GameStatusSchema,
    mode: GameModeSchema,
    homeUserId: z.string().uuid().nullable(),
    awayUserId: z.string().uuid().nullable(),
    currentTurnUserId: z.string().uuid().nullable(),
    turnDeadline: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
  }),
  // For realtime games
  websocketUrl: z.string().url().optional(),
  websocketToken: z.string().optional(),
});
```

---

#### GET /api/games/:id
Get current game state.

**Auth**: Required

**Response** (200 OK):
```typescript
const GetGameResponseSchema = z.object({
  game: z.object({
    id: z.string().uuid(),
    status: GameStatusSchema,
    mode: GameModeSchema,

    // Players
    homeUser: UserSummarySchema.nullable(),
    awayUser: UserSummarySchema.nullable(),

    // State
    gameState: GameStateSchema, // Full GameState object

    // Turn info
    currentTurnUserId: z.string().uuid().nullable(),
    turnDeadline: z.string().datetime().nullable(),
    turnNumber: z.number(),

    // Timestamps
    createdAt: z.string().datetime(),
    startedAt: z.string().datetime().nullable(),
  }),

  // Your view
  yourTeam: z.enum(['home', 'away']),
  isYourTurn: z.boolean(),
  availableActions: z.array(z.string()),
});
```

---

#### POST /api/games/:id/turn
Submit a turn action.

**Auth**: Required

**Request**:
```typescript
const SubmitTurnRequestSchema = z.object({
  action: z.enum(['pitch', 'swing', 'substitute', 'concede']),
  diceRoll: z.number().min(1).max(20).optional(),
  substitution: z.object({
    outCardId: z.string().uuid(),
    inCardId: z.string().uuid(),
  }).optional(),
});

// Example - Pitch phase
{
  "action": "pitch",
  "diceRoll": 14
}

// Example - Substitution
{
  "action": "substitute",
  "substitution": {
    "outCardId": "tired-pitcher-id",
    "inCardId": "fresh-reliever-id"
  }
}
```

**Response** (200 OK):
```typescript
const SubmitTurnResponseSchema = z.object({
  turnResult: z.object({
    turnNumber: z.number(),
    phase: z.string(),
    roll: z.number().nullable(),

    // Pitch phase result
    pitchResult: z.number().optional(),
    advantage: z.enum(['PITCHER', 'BATTER']).optional(),

    // Swing phase result
    chartResult: z.string().optional(),
    atBatResult: z.object({
      isOut: z.boolean(),
      outsRecorded: z.number(),
      runsScored: z.number(),
      description: z.string(),
    }).optional(),
  }),

  // Updated game state
  gameState: GameStateSchema,

  // Game over?
  gameOver: z.boolean(),
  winner: z.enum(['home', 'away']).nullable(),

  // Next turn info
  nextTurnUserId: z.string().uuid().nullable(),
  turnDeadline: z.string().datetime().nullable(),
});
```

---

#### POST /api/games/:id/concede
Forfeit the game.

**Auth**: Required

**Response** (200 OK):
```typescript
const ConcedeResponseSchema = z.object({
  game: GameSummarySchema,
  statsUpdate: z.object({
    ratingChange: z.number(),
    newRating: z.number(),
  }),
});
```

---

### 3.7 Stats Endpoints

#### GET /api/stats/me
Get current user's stats.

**Auth**: Required

**Response** (200 OK):
```typescript
const UserStatsResponseSchema = z.object({
  overall: z.object({
    wins: z.number(),
    losses: z.number(),
    draws: z.number(),
    winRate: z.number(),
    rating: z.number(),
    peakRating: z.number(),
    level: z.number(),
    xpTotal: z.number(),
    xpToNextLevel: z.number(),
  }),
  batting: z.object({
    atBats: z.number(),
    hits: z.number(),
    homeRuns: z.number(),
    rbis: z.number(),
    battingAvg: z.number(),
    slugging: z.number(),
  }),
  pitching: z.object({
    inningsPitched: z.number(),
    earnedRuns: z.number(),
    strikeouts: z.number(),
    walks: z.number(),
    era: z.number(),
  }),
  recentGames: z.array(GameSummarySchema).max(10),
});
```

---

#### GET /api/stats/leaderboard
Get leaderboard rankings.

**Auth**: Optional

**Query Parameters**:
```typescript
const LeaderboardQuerySchema = z.object({
  type: z.enum(['rating', 'wins', 'winRate', 'homeRuns', 'era']).default('rating'),
  season: z.string().optional(), // e.g., "2026-S1"
  limit: z.coerce.number().min(10).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});
```

**Response** (200 OK):
```typescript
const LeaderboardResponseSchema = z.object({
  type: z.string(),
  season: z.string().nullable(),
  entries: z.array(z.object({
    rank: z.number(),
    user: UserSummarySchema,
    value: z.number(),
    change: z.number(), // Position change since yesterday
  })),
  yourRank: z.number().nullable(),
  yourEntry: z.object({
    rank: z.number(),
    value: z.number(),
  }).nullable(),
});
```

---

### 3.8 Marketplace Endpoints

#### GET /api/marketplace/listings
Browse active marketplace listings.

**Auth**: Optional (required for price recommendations)

**Query Parameters**:
```typescript
const MarketplaceQuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(50).default(20),
  templateId: z.string().uuid().optional(),
  playerName: z.string().optional(),
  playerType: z.enum(['Pitcher', 'Hitter']).optional(),
  rarity: RaritySchema.optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(['price', 'rarity', 'serial', 'listed']).default('listed'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
```

**Response** (200 OK):
```typescript
const MarketplaceListingsResponseSchema = z.object({
  listings: z.array(z.object({
    id: z.string().uuid(),
    card: CardInstanceSchema,
    seller: UserSummarySchema,
    priceCoins: z.number(),
    listedAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
  })),
  pagination: PaginationSchema,
  priceStats: z.object({
    minPrice: z.number(),
    maxPrice: z.number(),
    avgPrice: z.number(),
    totalListings: z.number(),
  }).optional(),
});
```

---

#### POST /api/marketplace/listings
Create a new listing.

**Auth**: Required

**Request**:
```typescript
const CreateListingRequestSchema = z.object({
  cardInstanceId: z.string().uuid(),
  priceCoins: z.number().min(1).max(1000000000),
  durationDays: z.number().min(1).max(30).default(7),
});
```

**Response** (201 Created):
```typescript
const CreateListingResponseSchema = z.object({
  listing: ListingSchema,
  fees: z.object({
    listingFee: z.number(),
    saleFeePct: z.number(), // e.g., 5 for 5%
    estimatedSaleFee: z.number(),
  }),
});
```

**Errors**:
| Code | Message |
|------|---------|
| 400 | `CARD_NOT_OWNED` |
| 400 | `CARD_NOT_TRADEABLE` |
| 400 | `CARD_ALREADY_LISTED` |
| 400 | `CARD_IN_ACTIVE_DECK` |
| 400 | `INSUFFICIENT_BALANCE` |

---

#### POST /api/marketplace/listings/:id/buy
Purchase a listed card.

**Auth**: Required

**Request**:
```typescript
const BuyListingRequestSchema = z.object({
  confirmedPrice: z.number(), // Must match listing price
});
```

**Response** (200 OK):
```typescript
const BuyListingResponseSchema = z.object({
  trade: z.object({
    id: z.string().uuid(),
    listingId: z.string().uuid(),
    purchasePrice: z.number(),
    feeAmount: z.number(),
    status: z.literal('accepted'),
    completedAt: z.string().datetime(),
  }),
  acquiredCard: CardInstanceSchema,
  newBalance: z.number(),
});
```

---

#### DELETE /api/marketplace/listings/:id
Cancel a listing.

**Auth**: Required (must be seller)

**Response** (204 No Content)

---

### 3.9 Matchmaking Endpoints

#### POST /api/matchmaking/queue
Join the matchmaking queue.

**Auth**: Required

**Request**:
```typescript
const JoinQueueRequestSchema = z.object({
  lineupId: z.string().uuid(),
  mode: z.enum(['realtime', 'async']).default('realtime'),
});
```

**Response** (200 OK):
```typescript
const JoinQueueResponseSchema = z.object({
  queueEntry: z.object({
    id: z.string().uuid(),
    position: z.number(),
    estimatedWaitSeconds: z.number(),
    rating: z.number(),
    ratingRange: z.number(),
  }),
  // Subscribe to this for match found
  websocketChannel: z.string(),
});
```

---

#### DELETE /api/matchmaking/queue
Leave the matchmaking queue.

**Auth**: Required

**Response** (204 No Content)

---

#### GET /api/matchmaking/ai-opponents
Get available AI opponent options.

**Auth**: Required

**Response** (200 OK):
```typescript
const AiOpponentsResponseSchema = z.object({
  opponents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    description: z.string(),
    teamTheme: z.string(), // e.g., "1998 Power Hitters"
    estimatedRating: z.number(),
  })),
});
```

---

### 3.10 Rate Limiting Strategy

| Endpoint Category | Limit | Window | Burst |
|-------------------|-------|--------|-------|
| Auth (login/register) | 5 | 1 min | 10 |
| Auth (refresh) | 30 | 1 min | 50 |
| Inventory (read) | 60 | 1 min | 100 |
| Inventory (write) | 20 | 1 min | 30 |
| Game (create) | 10 | 1 min | 15 |
| Game (turn) | 60 | 1 min | 100 |
| Marketplace (read) | 60 | 1 min | 100 |
| Marketplace (write) | 10 | 1 min | 15 |
| Pack (open) | 10 | 1 min | 20 |
| Stats (read) | 30 | 1 min | 50 |

**Rate Limit Headers**:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705234567
```

**429 Too Many Requests Response**:
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retryAfter": 32
}
```

---

### 3.11 Error Handling Conventions

**Standard Error Response**:
```typescript
const ErrorResponseSchema = z.object({
  error: z.string(), // Machine-readable code
  message: z.string(), // Human-readable message
  details: z.record(z.any()).optional(), // Field-specific errors
  requestId: z.string().uuid(), // For support tickets
  timestamp: z.string().datetime(),
});

// Example
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid request body",
  "details": {
    "email": "Must be a valid email address",
    "password": "Must be at least 8 characters"
  },
  "requestId": "req_550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-01-14T10:30:00Z"
}
```

**HTTP Status Code Usage**:
| Status | Usage |
|--------|-------|
| 200 | Success (GET, PUT, POST with data return) |
| 201 | Created (POST creating new resource) |
| 204 | No Content (DELETE, POST with no return) |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (valid token, no permission) |
| 404 | Not Found |
| 409 | Conflict (duplicate, state conflict) |
| 422 | Unprocessable Entity (business logic error) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

