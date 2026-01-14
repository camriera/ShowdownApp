## STEP 4: System Workflows

### Workflow A: User Onboarding

```
+-------------------+
|  User Downloads   |
|       App         |
+---------+---------+
          |
          v
+---------+---------+
|  Registration     |
|  Screen           |
+---------+---------+
          |
          | POST /api/auth/register
          v
+---------+---------+
|  Validate Input   |
|  - Email format   |
|  - Username rules |
|  - Password str.  |
+---------+---------+
          |
          | Check duplicates
          v
+---------+---------+
|  Create User      |
|  Record in DB     |
+---------+---------+
          |
          v
+---------+---------+
|  Initialize       |
|  user_stats       |
|  (1200 rating,    |
|   1000 coins,     |
|   Level 1)        |
+---------+---------+
          |
          v
+---------+---------+
|  Generate Starter |
|  Pack (15 cards)  |
+---------+---------+
          |
          v
+---------+---------+
|  Create Default   |
|  Deck from Pack   |
+---------+---------+
          |
          v
+---------+---------+
|  Issue JWT +      |
|  Refresh Token    |
+---------+---------+
          |
          v
+---------+---------+
|  Tutorial Flow    |
|  (Optional)       |
+---------+---------+
```

**Pseudocode: Registration Flow**

```typescript
async function registerUser(request: RegisterRequest): Promise<RegisterResponse> {
  // 1. Validate input
  const validated = RegisterRequestSchema.parse(request);

  // 2. Check for existing user
  const existingEmail = await db.users.findByEmail(validated.email);
  if (existingEmail) throw new ConflictError('EMAIL_EXISTS');

  const existingUsername = await db.users.findByUsername(validated.username);
  if (existingUsername) throw new ConflictError('USERNAME_EXISTS');

  // 3. Hash password
  const passwordHash = await bcrypt.hash(validated.password, 12);

  // 4. Create user in transaction
  const result = await db.transaction(async (tx) => {
    // Create user
    const user = await tx.users.create({
      email: validated.email,
      username: validated.username,
      passwordHash,
      displayName: validated.displayName || validated.username,
    });

    // Initialize stats
    await tx.userStats.create({
      userId: user.id,
      rating: 1200,
      coins: 1000, // Starting currency
      level: 1,
      xpTotal: 0,
    });

    // Generate starter pack
    const starterPack = await generateStarterPack(tx, user.id);

    // Auto-create deck from starter pack cards
    const deck = await createStarterDeck(tx, user.id, starterPack.cards);

    return { user, starterPack, deck };
  });

  // 5. Generate tokens
  const tokens = await generateTokens(result.user.id);

  // 6. Track achievement progress
  await trackAchievement(result.user.id, 'first_login', 1);

  return {
    user: sanitizeUser(result.user),
    tokens,
    starterPack: {
      packId: result.starterPack.id,
      cardCount: result.starterPack.cards.length,
    },
  };
}
```

**Starter Pack Contents**:
```typescript
const STARTER_PACK_CONFIG = {
  totalCards: 15,
  guaranteedPitchers: 3,
  guaranteedHitters: 12,
  rarityDistribution: {
    common: 9,      // 60%
    uncommon: 4,    // 27%
    rare: 2,        // 13%
  },
  // Ensure playable deck from day 1
  positionRequirements: {
    'C': 1,
    'IF': 4, // Can play 1B, 2B, SS, 3B
    'OF': 3,
    'DH': 1,
  },
  pointRange: {
    min: 2500, // Minimum viable roster
    max: 3500, // Competitive but not overpowered
  },
};
```

---

### Workflow B: Progression System

```
+-------------------+
|  Game Completed   |
+---------+---------+
          |
          v
+---------+---------+
|  Calculate XP     |
|  - Base: 50 XP    |
|  - Win: +100 XP   |
|  - Performance    |
|    bonuses        |
+---------+---------+
          |
          v
+---------+---------+
|  Update user_stats|
|  - Add XP         |
|  - Check level up |
+---------+---------+
          |
    +-----+-----+
    |           |
    v           v
+---+---+   +---+---+
|Level  |   |No     |
|Up!    |   |Level  |
+---+---+   +-------+
    |
    v
+---+---+
|Award  |
|Pack   |
+---+---+
    |
    v
+---+---+
|Check  |
|Achieve|
|ments  |
+---+---+
    |
    v
+---+---+
|Update |
|Client |
+-------+
```

**Pseudocode: Progression Update**

```typescript
interface GameCompletionData {
  gameId: string;
  userId: string;
  isWinner: boolean;
  runsScored: number;
  homeRuns: number;
  strikeouts: number;
  isPerfectGame: boolean;
  isNoHitter: boolean;
}

async function processGameCompletion(data: GameCompletionData): Promise<ProgressionResult> {
  // 1. Calculate base XP
  let xpEarned = 50; // Base participation XP

  // Win bonus
  if (data.isWinner) {
    xpEarned += 100;
  }

  // Performance bonuses
  xpEarned += data.homeRuns * 10;
  xpEarned += data.strikeouts * 5;
  xpEarned += Math.floor(data.runsScored / 3) * 15;

  // Special achievements
  if (data.isPerfectGame) xpEarned += 500;
  if (data.isNoHitter) xpEarned += 250;

  // 2. Update stats and check level up
  const result = await db.transaction(async (tx) => {
    const stats = await tx.userStats.findByUserId(data.userId);

    const newXpTotal = stats.xpTotal + xpEarned;
    const newLevel = calculateLevel(newXpTotal);
    const leveledUp = newLevel > stats.level;

    await tx.userStats.update(data.userId, {
      xpTotal: newXpTotal,
      level: newLevel,
      wins: data.isWinner ? stats.wins + 1 : stats.wins,
      losses: data.isWinner ? stats.losses : stats.losses + 1,
    });

    // 3. Award level-up pack if applicable
    let awardedPack = null;
    if (leveledUp) {
      const packType = getPackTypeForLevel(newLevel);
      awardedPack = await tx.packs.create({
        userId: data.userId,
        packType,
        source: 'level_up',
        cardCount: packType === 'premium' ? 5 : 5,
      });
    }

    return { stats, newLevel, leveledUp, awardedPack, xpEarned };
  });

  // 4. Check and update achievements
  const achievementUpdates = await checkAchievements(data.userId, {
    wins: result.stats.wins + (data.isWinner ? 1 : 0),
    homeRuns: data.homeRuns,
    gamesPlayed: result.stats.wins + result.stats.losses + 1,
  });

  return {
    xpEarned,
    newXpTotal: result.stats.xpTotal + xpEarned,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    packAwarded: result.awardedPack,
    achievementsUnlocked: achievementUpdates.unlocked,
  };
}

// XP requirements per level (exponential curve)
function calculateLevel(xp: number): number {
  // Level 1: 0 XP
  // Level 2: 500 XP
  // Level 3: 1200 XP
  // Level 4: 2100 XP
  // Formula: XP_required = 500 * level * (level - 1) / 2
  let level = 1;
  let xpRequired = 0;
  while (xpRequired <= xp) {
    level++;
    xpRequired = 250 * level * (level - 1);
  }
  return level - 1;
}
```

---

### Workflow C: Deck Building & Validation

```
+-------------------+
|  Open Deck Builder|
+---------+---------+
          |
          v
+---------+---------+
|  Load Owned Cards |
|  GET /inventory   |
+---------+---------+
          |
          v
+---------+---------+
|  User Selects     |
|  Cards            |
+---------+---------+
          |
          v (real-time)
+---------+---------+
|  Client-side      |
|  Validation       |
|  - Point count    |
|  - Position check |
+---------+---------+
          |
          v
+---------+---------+
|  User Saves Deck  |
|  POST /decks      |
+---------+---------+
          |
          v
+---------+---------+
|  Server-side      |
|  Full Validation  |
+---------+---------+
          |
    +-----+-----+
    |           |
    v           v
+---+---+   +---+---+
|Valid  |   |Invalid|
|Save   |   |Return |
|Deck   |   |Errors |
+-------+   +-------+
```

**Pseudocode: Deck Validation**

```typescript
interface DeckValidationInput {
  userId: string;
  cardInstanceIds: string[];
  lineupConfig?: {
    battingOrder: string[];
    startingPitcher: string;
    defensivePositions: Record<string, string>;
  };
}

interface ValidationResult {
  isValid: boolean;
  pointTotal: number;
  errors: ValidationError[];
  warnings: string[];
}

async function validateDeck(input: DeckValidationInput): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // 1. Load card instances with templates
  const cards = await db.cardInstances.findByIds(input.cardInstanceIds, {
    include: ['template'],
  });

  // 2. Verify ownership
  for (const cardId of input.cardInstanceIds) {
    const card = cards.find(c => c.id === cardId);
    if (!card) {
      errors.push({ field: 'cards', code: 'CARD_NOT_FOUND', cardId });
    } else if (card.ownerId !== input.userId) {
      errors.push({ field: 'cards', code: 'CARD_NOT_OWNED', cardId });
    }
  }

  // 3. Check for duplicates
  const uniqueIds = new Set(input.cardInstanceIds);
  if (uniqueIds.size !== input.cardInstanceIds.length) {
    errors.push({ field: 'cards', code: 'DUPLICATE_CARDS' });
  }

  // 4. Calculate point total
  const pointTotal = cards.reduce((sum, card) => sum + card.template.points, 0);

  if (pointTotal > 5000) {
    errors.push({
      field: 'pointTotal',
      code: 'POINTS_EXCEEDED',
      message: `Point total ${pointTotal} exceeds maximum 5000`,
    });
  }

  // 5. Count player types
  const pitchers = cards.filter(c => c.template.playerType === 'Pitcher');
  const hitters = cards.filter(c => c.template.playerType === 'Hitter');

  if (pitchers.length < 1) {
    errors.push({ field: 'pitchers', code: 'INSUFFICIENT_PITCHERS' });
  }

  if (hitters.length < 9) {
    errors.push({ field: 'hitters', code: 'INSUFFICIENT_HITTERS' });
  }

  // 6. Validate lineup configuration if provided
  if (input.lineupConfig) {
    const lineupErrors = validateLineupConfig(input.lineupConfig, cards);
    errors.push(...lineupErrors);
  }

  // 7. Check for tradeable cards (warning only)
  const listedCards = cards.filter(c => c.isListed);
  if (listedCards.length > 0) {
    warnings.push(
      `${listedCards.length} card(s) in this deck are listed on marketplace`
    );
  }

  // 8. Check starter viability
  const hasViableStarter = pitchers.some(p => p.template.ip >= 4);
  if (!hasViableStarter) {
    warnings.push('No pitcher with IP >= 4 for starting role');
  }

  return {
    isValid: errors.length === 0,
    pointTotal,
    errors,
    warnings,
  };
}

function validateLineupConfig(
  config: DeckValidationInput['lineupConfig'],
  cards: CardInstance[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Batting order must be exactly 9
  if (config.battingOrder.length !== 9) {
    errors.push({
      field: 'battingOrder',
      code: 'INVALID_LINEUP_SIZE',
      message: `Batting order must have exactly 9 players, got ${config.battingOrder.length}`,
    });
  }

  // All batting order cards must be hitters
  for (const cardId of config.battingOrder) {
    const card = cards.find(c => c.id === cardId);
    if (card && card.template.playerType !== 'Hitter') {
      errors.push({
        field: 'battingOrder',
        code: 'PITCHER_IN_LINEUP',
        cardId,
      });
    }
  }

  // Starting pitcher must be a pitcher
  const starter = cards.find(c => c.id === config.startingPitcher);
  if (!starter || starter.template.playerType !== 'Pitcher') {
    errors.push({
      field: 'startingPitcher',
      code: 'INVALID_STARTING_PITCHER',
    });
  }

  // Defensive positions must be valid for each card
  for (const [cardId, position] of Object.entries(config.defensivePositions)) {
    const card = cards.find(c => c.id === cardId);
    if (card && card.template.positions) {
      if (!(position in card.template.positions)) {
        errors.push({
          field: 'defensivePositions',
          code: 'INVALID_POSITION',
          cardId,
          position,
          validPositions: Object.keys(card.template.positions),
        });
      }
    }
  }

  return errors;
}
```

---

### Workflow D: Async Gameplay Session

```
+-------------------+     +-------------------+
|  Player A         |     |  Player B         |
|  (Home)           |     |  (Away)           |
+---------+---------+     +---------+---------+
          |                         |
          v                         |
+---------+---------+               |
|  Create Game      |               |
|  POST /games      |               |
+---------+---------+               |
          |                         |
          v                         |
+---------+---------+               |
|  Game Created     |               |
|  Status: pending  |               |
|  Turn: Away       |               |
+---------+---------+               |
          |                         |
          | Notification            |
          +------------------------>|
                                    v
                          +---------+---------+
                          |  Accept Game      |
                          |  Load State       |
                          +---------+---------+
                                    |
                                    v
                          +---------+---------+
                          |  PITCH Phase      |
                          |  Roll Dice        |
                          |  POST /games/:id/ |
                          |       turn        |
                          +---------+---------+
                                    |
          |<------------------------+
          |
          v
+---------+---------+
|  Load Updated     |
|  State            |
|  Advantage set    |
+---------+---------+
          |
          v
+---------+---------+
|  SWING Phase      |
|  Roll Dice        |
|  POST /games/:id/ |
|       turn        |
+---------+---------+
          |
          +------------------------>|
                                    v
                          +---------+---------+
                          |  See Result       |
                          |  Next At-Bat      |
                          +---------+---------+
                                    |
          ... continues alternating ...
```

**Pseudocode: Turn Submission**

```typescript
async function submitTurn(
  gameId: string,
  userId: string,
  action: TurnAction
): Promise<TurnResult> {
  // 1. Load game with lock
  const game = await db.gameSessions.findByIdForUpdate(gameId);

  // 2. Validate it's user's turn
  if (game.currentTurnUserId !== userId) {
    throw new ForbiddenError('NOT_YOUR_TURN');
  }

  // 3. Validate game is active
  if (game.status !== 'active') {
    throw new BadRequestError('GAME_NOT_ACTIVE');
  }

  // 4. Check turn deadline
  if (game.turnDeadline && new Date() > game.turnDeadline) {
    // Auto-forfeit for timeout
    return await handleTurnTimeout(game, userId);
  }

  // 5. Deserialize game state
  const gameState: GameState = game.gameState;
  const engine = new GameEngine(gameState);

  // 6. Execute action based on phase
  let turnResult: TurnResult;

  switch (action.action) {
    case 'pitch':
      if (gameState.currentPhase !== 'PITCH') {
        throw new BadRequestError('INVALID_PHASE');
      }
      const pitchResult = engine.executePitchPhase(action.diceRoll);
      turnResult = {
        phase: 'PITCH',
        roll: action.diceRoll,
        pitchResult: pitchResult.pitchResult,
        advantage: pitchResult.advantage,
      };
      break;

    case 'swing':
      if (gameState.currentPhase !== 'SWING') {
        throw new BadRequestError('INVALID_PHASE');
      }
      const swingResult = engine.executeSwingPhase(action.diceRoll);
      const atBatResult = engine.resolveResult(swingResult.chartResult);
      turnResult = {
        phase: 'SWING',
        roll: action.diceRoll,
        chartResult: swingResult.chartResult,
        atBatResult,
      };
      break;

    case 'substitute':
      // Handle pitcher/batter substitution
      turnResult = await handleSubstitution(engine, action.substitution);
      break;

    case 'concede':
      return await handleConcession(game, userId);
  }

  // 7. Get updated state
  const newGameState = engine.getState();

  // 8. Determine next turn
  const nextTurnUserId = determineNextTurnUser(game, newGameState);
  const turnDeadline = nextTurnUserId
    ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours for async
    : null;

  // 9. Update game in database
  await db.transaction(async (tx) => {
    // Update game session
    await tx.gameSessions.update(gameId, {
      gameState: newGameState,
      currentTurnUserId: nextTurnUserId,
      turnDeadline,
      status: newGameState.isGameOver ? 'completed' : 'active',
      winnerId: newGameState.winner
        ? (newGameState.winner === 'home' ? game.homeUserId : game.awayUserId)
        : null,
      completedAt: newGameState.isGameOver ? new Date() : null,
    });

    // Record turn in history
    await tx.gameTurns.create({
      gameId,
      turnNumber: game.turnNumber + 1,
      inning: newGameState.inning,
      isTopOfInning: newGameState.isTopOfInning,
      phase: turnResult.phase,
      actingUserId: userId,
      pitchRoll: action.action === 'pitch' ? action.diceRoll : null,
      swingRoll: action.action === 'swing' ? action.diceRoll : null,
      resultType: turnResult.chartResult,
      runsScored: turnResult.atBatResult?.runsScored ?? 0,
      outsRecorded: turnResult.atBatResult?.outsRecorded ?? 0,
    });

    // Update card stats
    if (turnResult.atBatResult) {
      await updateCardStats(tx, game, newGameState, turnResult);
    }
  });

  // 10. Notify opponent
  if (nextTurnUserId && nextTurnUserId !== userId) {
    await notifyUser(nextTurnUserId, 'YOUR_TURN', {
      gameId,
      opponentName: userId === game.homeUserId
        ? game.awayUser.displayName
        : game.homeUser.displayName,
    });
  }

  // 11. If game over, process completion
  if (newGameState.isGameOver) {
    await processGameCompletion({
      gameId,
      homeUserId: game.homeUserId,
      awayUserId: game.awayUserId,
      winnerId: newGameState.winner === 'home' ? game.homeUserId : game.awayUserId,
      gameState: newGameState,
    });
  }

  return {
    turnResult,
    gameState: newGameState,
    gameOver: newGameState.isGameOver,
    winner: newGameState.winner,
    nextTurnUserId,
    turnDeadline,
  };
}
```

---

### Workflow E: Real-Time Multiplayer

```
+-------------------+                    +-------------------+
|  Player A         |                    |  Player B         |
+---------+---------+                    +---------+---------+
          |                                        |
          v                                        v
+---------+---------+                    +---------+---------+
|  Join Queue       |                    |  Join Queue       |
|  POST /matchmaking|                    |  POST /matchmaking|
+---------+---------+                    +---------+---------+
          |                                        |
          +------------------+  +------------------+
                             |  |
                             v  v
                    +--------+--+--------+
                    |  Matchmaking       |
                    |  Service           |
                    |  (Rating match)    |
                    +---------+----------+
                              |
               +--------------+--------------+
               |                             |
               v                             v
     +---------+---------+         +---------+---------+
     |  WebSocket:       |         |  WebSocket:       |
     |  MATCH_FOUND      |         |  MATCH_FOUND      |
     +---------+---------+         +---------+---------+
               |                             |
               v                             v
     +---------+---------+         +---------+---------+
     |  Connect to       |         |  Connect to       |
     |  Game Room        |         |  Game Room        |
     +---------+---------+         +---------+---------+
               |                             |
               +-------------+---------------+
                             |
                             v
                    +--------+--------+
                    |  Game Room      |
                    |  (Shared State) |
                    +--------+--------+
                             |
               +-------------+-------------+
               |                           |
               v                           v
     +---------+---------+       +---------+---------+
     |  PITCH Phase      |       |  Wait for         |
     |  Roll & Send      |       |  Opponent         |
     +---------+---------+       +---------+---------+
               |                           |
               | WS: PITCH_ROLL            |
               +-------------------------->|
                                           v
                                 +---------+---------+
                                 |  See Advantage    |
                                 |  SWING Phase      |
                                 +---------+---------+
                                           |
               |<--------------------------+
               |  WS: SWING_ROLL
               v
     +---------+---------+
     |  See Result       |
     |  Animation        |
     +---------+---------+
               |
      ... continues with 15s turn timers ...
```

**WebSocket Events**:

```typescript
// Server -> Client Events
interface ServerEvents {
  // Match found
  MATCH_FOUND: {
    gameId: string;
    opponent: UserSummary;
    yourTeam: 'home' | 'away';
    gameState: GameState;
  };

  // Game state updates
  GAME_STATE_UPDATE: {
    gameState: GameState;
    lastAction: TurnResult;
  };

  // Turn notifications
  YOUR_TURN: {
    phase: 'PITCH' | 'SWING';
    deadline: string; // ISO timestamp
    timeRemaining: number; // seconds
  };

  // Opponent actions
  OPPONENT_ROLL: {
    roll: number;
    phase: string;
    result: TurnResult;
  };

  // Timer updates
  TURN_TIMER: {
    timeRemaining: number;
  };

  // Game end
  GAME_OVER: {
    winner: 'home' | 'away';
    finalScore: { home: number; away: number };
    statsUpdate: StatsUpdate;
  };

  // Connection status
  OPPONENT_DISCONNECTED: {
    reconnectDeadline: string;
  };

  OPPONENT_RECONNECTED: {};
}

// Client -> Server Events
interface ClientEvents {
  // Actions
  ROLL_DICE: {
    phase: 'PITCH' | 'SWING';
  };

  SUBMIT_ROLL: {
    roll: number;
    phase: 'PITCH' | 'SWING';
  };

  // Substitution
  SUBSTITUTE: {
    outCardId: string;
    inCardId: string;
  };

  // Forfeit
  CONCEDE: {};

  // Heartbeat
  PING: {};
}
```

**Pseudocode: Real-Time Game Room**

```typescript
class GameRoom {
  private gameId: string;
  private players: Map<string, WebSocket>;
  private gameState: GameState;
  private engine: GameEngine;
  private turnTimer: NodeJS.Timeout | null = null;
  private readonly TURN_TIMEOUT_SECONDS = 15;

  async handlePlayerAction(userId: string, event: ClientEvents): Promise<void> {
    switch (event.type) {
      case 'ROLL_DICE':
        await this.handleRoll(userId, event);
        break;
      case 'SUBSTITUTE':
        await this.handleSubstitution(userId, event);
        break;
      case 'CONCEDE':
        await this.handleConcede(userId);
        break;
    }
  }

  private async handleRoll(userId: string, event: RollEvent): Promise<void> {
    // Validate it's user's turn
    if (!this.isUsersTurn(userId)) {
      this.sendError(userId, 'NOT_YOUR_TURN');
      return;
    }

    // Clear turn timer
    this.clearTurnTimer();

    // Generate server-side roll (client roll is for display only)
    const roll = this.generateSecureRoll();

    // Execute phase
    let result: TurnResult;
    if (this.gameState.currentPhase === 'PITCH') {
      result = this.engine.executePitchPhase(roll);
    } else {
      const chartResult = this.engine.executeSwingPhase(roll);
      result = this.engine.resolveResult(chartResult.chartResult);
    }

    this.gameState = this.engine.getState();

    // Broadcast to both players
    this.broadcast('GAME_STATE_UPDATE', {
      gameState: this.gameState,
      lastAction: { roll, ...result },
    });

    // Check game over
    if (this.gameState.isGameOver) {
      await this.handleGameOver();
      return;
    }

    // Start next turn timer
    this.startTurnTimer();

    // Notify next player
    const nextPlayer = this.getNextTurnPlayer();
    this.sendToPlayer(nextPlayer, 'YOUR_TURN', {
      phase: this.gameState.currentPhase,
      deadline: new Date(Date.now() + this.TURN_TIMEOUT_SECONDS * 1000).toISOString(),
      timeRemaining: this.TURN_TIMEOUT_SECONDS,
    });
  }

  private startTurnTimer(): void {
    // Broadcast timer to both players
    let remaining = this.TURN_TIMEOUT_SECONDS;

    this.turnTimer = setInterval(() => {
      remaining--;
      this.broadcast('TURN_TIMER', { timeRemaining: remaining });

      if (remaining <= 0) {
        this.handleTurnTimeout();
      }
    }, 1000);
  }

  private async handleTurnTimeout(): Promise<void> {
    this.clearTurnTimer();

    const currentTurnUser = this.getCurrentTurnUser();

    // Auto-roll with penalty (worst possible roll)
    const penaltyRoll = this.gameState.currentPhase === 'PITCH' ? 1 : 1;

    // Execute with penalty roll
    // ... same as handleRoll but with penalty

    this.broadcast('TURN_TIMEOUT', {
      userId: currentTurnUser,
      penaltyApplied: true,
    });
  }

  private async handleDisconnect(userId: string): Promise<void> {
    // Give 60 seconds to reconnect
    const reconnectDeadline = new Date(Date.now() + 60000);

    this.broadcast('OPPONENT_DISCONNECTED', {
      disconnectedUser: userId,
      reconnectDeadline: reconnectDeadline.toISOString(),
    });

    // Set reconnect timeout
    setTimeout(async () => {
      if (!this.players.has(userId)) {
        // Forfeit disconnected player
        await this.handleConcede(userId);
      }
    }, 60000);
  }

  private generateSecureRoll(): number {
    // Cryptographically secure roll
    const buffer = crypto.randomBytes(4);
    const value = buffer.readUInt32BE(0);
    return (value % 20) + 1;
  }
}
```

---

### Workflow F: Marketplace Trading

```
+-------------------+                    +-------------------+
|  Seller           |                    |  Buyer            |
+---------+---------+                    +---------+---------+
          |                                        |
          v                                        |
+---------+---------+                              |
|  Select Card      |                              |
|  to Sell          |                              |
+---------+---------+                              |
          |                                        |
          v                                        |
+---------+---------+                              |
|  Set Price        |                              |
|  POST /marketplace|                              |
|  /listings        |                              |
+---------+---------+                              |
          |                                        |
          v                                        |
+---------+---------+                              |
|  Card Marked      |                              |
|  is_listed=true   |                              |
|  is_tradeable=    |                              |
|  false            |                              |
+---------+---------+                              |
          |                                        |
          |    Listing visible                     v
          +------------------------------> +------+--------+
                                           |  Browse       |
                                           |  Marketplace  |
                                           +------+--------+
                                                  |
                                                  v
                                           +------+--------+
                                           |  Click Buy    |
                                           |  Confirm Price|
                                           +------+--------+
                                                  |
                                                  v
                                           +------+--------+
                                           |  POST /market |
                                           |  /listings/:id|
                                           |  /buy         |
                                           +------+--------+
                                                  |
                    +-----------------------------+
                    |
                    v
          +---------+---------+
          |  Transaction      |
          |  Processing       |
          +---------+---------+
                    |
     +--------------+--------------+
     |                             |
     v                             v
+----+----+                 +------+------+
|Deduct   |                 |Transfer     |
|Coins    |                 |Card         |
|from     |                 |Ownership    |
|Buyer    |                 |             |
+---------+                 +------+------+
     |                             |
     v                             v
+----+----+                 +------+------+
|Calculate|                 |Update       |
|Fee (5%) |                 |Listing      |
+---------+                 |status=sold  |
     |                      +-------------+
     v
+----+----+
|Credit   |
|Seller   |
|(95%)    |
+---------+
     |
     v
+----+----+
|Log      |
|Trans-   |
|action   |
+---------+
```

**Pseudocode: Purchase Flow**

```typescript
async function purchaseListing(
  listingId: string,
  buyerId: string,
  confirmedPrice: number
): Promise<PurchaseResult> {
  // Use transaction with row locking to prevent race conditions
  return await db.transaction(async (tx) => {
    // 1. Lock and load listing
    const listing = await tx.listings.findByIdForUpdate(listingId);

    if (!listing) {
      throw new NotFoundError('LISTING_NOT_FOUND');
    }

    if (listing.status !== 'active') {
      throw new BadRequestError('LISTING_NOT_AVAILABLE');
    }

    if (listing.sellerId === buyerId) {
      throw new BadRequestError('CANNOT_BUY_OWN_LISTING');
    }

    // 2. Verify price hasn't changed
    if (listing.priceCoins !== confirmedPrice) {
      throw new ConflictError('PRICE_CHANGED', {
        expectedPrice: confirmedPrice,
        currentPrice: listing.priceCoins,
      });
    }

    // 3. Load buyer's balance
    const buyerStats = await tx.userStats.findByUserIdForUpdate(buyerId);

    if (buyerStats.coins < listing.priceCoins) {
      throw new BadRequestError('INSUFFICIENT_BALANCE', {
        required: listing.priceCoins,
        available: buyerStats.coins,
      });
    }

    // 4. Calculate fee (5%)
    const FEE_PERCENTAGE = 5;
    const feeAmount = Math.floor(listing.priceCoins * FEE_PERCENTAGE / 100);
    const sellerReceives = listing.priceCoins - feeAmount;

    // 5. Execute transfers
    // Deduct from buyer
    await tx.userStats.update(buyerId, {
      coins: buyerStats.coins - listing.priceCoins,
    });

    // Credit seller
    const sellerStats = await tx.userStats.findByUserIdForUpdate(listing.sellerId);
    await tx.userStats.update(listing.sellerId, {
      coins: sellerStats.coins + sellerReceives,
    });

    // 6. Transfer card ownership
    await tx.cardInstances.update(listing.cardInstanceId, {
      ownerId: buyerId,
      isListed: false,
      isTradeable: true,
      acquiredAt: new Date(),
    });

    // 7. Update listing status
    await tx.listings.update(listingId, {
      status: 'sold',
      soldAt: new Date(),
    });

    // 8. Create trade record
    const trade = await tx.trades.create({
      listingId,
      buyerId,
      purchasePrice: listing.priceCoins,
      feeAmount,
      sellerReceives,
      status: 'accepted',
      completedAt: new Date(),
    });

    // 9. Log transaction for both parties
    await tx.transactionLog.createMany([
      {
        transactionType: 'marketplace_purchase',
        userId: buyerId,
        counterpartyId: listing.sellerId,
        cardInstanceIds: [listing.cardInstanceId],
        coinsChange: -listing.priceCoins,
        referenceType: 'trade',
        referenceId: trade.id,
      },
      {
        transactionType: 'marketplace_sale',
        userId: listing.sellerId,
        counterpartyId: buyerId,
        cardInstanceIds: [listing.cardInstanceId],
        coinsChange: sellerReceives,
        referenceType: 'trade',
        referenceId: trade.id,
        metadata: { feeAmount },
      },
    ]);

    // 10. Track achievements
    await trackAchievement(buyerId, 'first_trade', 1);
    await trackAchievement(listing.sellerId, 'first_trade', 1);

    // 11. Load transferred card for response
    const acquiredCard = await tx.cardInstances.findById(listing.cardInstanceId, {
      include: ['template'],
    });

    return {
      trade: {
        id: trade.id,
        listingId,
        purchasePrice: listing.priceCoins,
        feeAmount,
        status: 'accepted',
        completedAt: trade.completedAt,
      },
      acquiredCard,
      newBalance: buyerStats.coins - listing.priceCoins,
    };
  });
}
```

---

### Workflow G: Card Crafting

```
+-------------------+
|  User Views       |
|  Collection       |
+---------+---------+
          |
          v
+---------+---------+
|  Filter: Cards    |
|  with 3+ dupes    |
+---------+---------+
          |
          v
+---------+---------+
|  Select 3x        |
|  Same Card        |
+---------+---------+
          |
          v
+---------+---------+
|  Preview Result   |
|  (rarity upgrade) |
+---------+---------+
          |
          v
+---------+---------+
|  Confirm Craft    |
|  POST /inventory  |
|  /craft           |
+---------+---------+
          |
          v
+---------+---------+
|  Validate:        |
|  - All owned      |
|  - Same template  |
|  - Not in decks   |
|  - Not listed     |
+---------+---------+
          |
    +-----+-----+
    |           |
    v           v
+---+---+   +---+---+
|Valid  |   |Error  |
+---+---+   +-------+
    |
    v
+---+---+
|Delete |
|Input  |
|Cards  |
+---+---+
    |
    v
+---+---+
|Create |
|New    |
|Card   |
|+1 Rarity
+---+---+
    |
    v
+---+---+
|Log    |
|Craft  |
+---+---+
    |
    v
+---+---+
|Return |
|New    |
|Card   |
+-------+
```

**Pseudocode: Crafting System**

```typescript
const RARITY_ORDER: rarity_level[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
];

interface CraftRecipe {
  type: 'upgrade_rarity' | 'combine_duplicates';
  inputCount: number;
  outputRarityBoost: number;
}

const RECIPES: Record<string, CraftRecipe> = {
  upgrade_rarity: {
    type: 'upgrade_rarity',
    inputCount: 3,
    outputRarityBoost: 1,
  },
  combine_duplicates: {
    type: 'combine_duplicates',
    inputCount: 5,
    outputRarityBoost: 2,
  },
};

async function craftCards(
  userId: string,
  inputCardIds: string[],
  recipeType: string
): Promise<CraftResult> {
  const recipe = RECIPES[recipeType];
  if (!recipe) {
    throw new BadRequestError('INVALID_RECIPE');
  }

  if (inputCardIds.length !== recipe.inputCount) {
    throw new BadRequestError('INVALID_CARD_COUNT', {
      required: recipe.inputCount,
      provided: inputCardIds.length,
    });
  }

  return await db.transaction(async (tx) => {
    // 1. Load and lock input cards
    const inputCards = await tx.cardInstances.findByIdsForUpdate(inputCardIds, {
      include: ['template'],
    });

    // 2. Validate all cards exist and are owned
    for (const cardId of inputCardIds) {
      const card = inputCards.find(c => c.id === cardId);
      if (!card) {
        throw new NotFoundError('CARD_NOT_FOUND', { cardId });
      }
      if (card.ownerId !== userId) {
        throw new ForbiddenError('CARD_NOT_OWNED', { cardId });
      }
      if (card.isListed) {
        throw new BadRequestError('CARD_IS_LISTED', { cardId });
      }
    }

    // 3. Validate all cards are same template
    const templateId = inputCards[0].templateId;
    if (!inputCards.every(c => c.templateId === templateId)) {
      throw new BadRequestError('CARDS_NOT_SAME_TEMPLATE');
    }

    // 4. Check cards not in active decks
    const cardsInDecks = await tx.deckCards.findByCardInstanceIds(inputCardIds);
    if (cardsInDecks.length > 0) {
      throw new BadRequestError('CARD_IN_DECK', {
        cardIds: cardsInDecks.map(dc => dc.cardInstanceId),
      });
    }

    // 5. Determine output rarity
    const inputRarity = inputCards[0].rarity;
    const inputRarityIndex = RARITY_ORDER.indexOf(inputRarity);
    const outputRarityIndex = Math.min(
      inputRarityIndex + recipe.outputRarityBoost,
      RARITY_ORDER.length - 1
    );
    const outputRarity = RARITY_ORDER[outputRarityIndex];

    // 6. Check not already max rarity
    if (inputRarityIndex === RARITY_ORDER.length - 1) {
      throw new BadRequestError('MAX_RARITY_REACHED');
    }

    // 7. Delete input cards
    await tx.cardInstances.deleteMany(inputCardIds);

    // 8. Create output card
    const outputCard = await tx.cardInstances.create({
      templateId,
      ownerId: userId,
      rarity: outputRarity,
      source: 'craft',
      parentInstanceIds: inputCardIds,
      isTradeable: true,
    });

    // 9. Log crafting
    await tx.craftingLog.create({
      userId,
      inputCardIds,
      inputCount: inputCardIds.length,
      outputCardId: outputCard.id,
      outputRarity,
      recipeType,
    });

    // 10. Award XP
    const xpEarned = 50 + (outputRarityIndex * 25);
    await tx.userStats.increment(userId, 'xpTotal', xpEarned);

    // 11. Track achievement
    await trackAchievement(userId, 'first_craft', 1);

    // 12. Load full output card with template
    const fullOutputCard = await tx.cardInstances.findById(outputCard.id, {
      include: ['template'],
    });

    return {
      outputCard: fullOutputCard,
      consumedCards: inputCardIds,
      xpEarned,
    };
  });
}
```

