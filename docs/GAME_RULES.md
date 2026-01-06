# MLB Showdown Game Rules Reference

This document serves as the official rules reference for the Showdown Simulator, ensuring 100% accurate implementation of the original MLB Showdown game mechanics (2000-2005).

---

## Core Gameplay Loop

### The Four Phases

Every at-bat consists of exactly four phases that must be executed in order:

```
1. PITCH → 2. ADVANTAGE → 3. SWING → 4. RESULT
```

---

## Phase 1: Pitch

**Objective**: Determine who has the advantage in this at-bat.

### Mechanics
1. **Pitcher rolls d20**
2. **Add Pitcher's Control rating**
3. **Compare to Batter's On-Base rating**

### Formula
```
Pitch Result = d20 Roll + Pitcher Control
```

### Example
- Pitcher Control: 3
- d20 Roll: 12  
- **Pitch Result: 15**

---

## Phase 2: Advantage Determination

**Rule**: Compare the Pitch Result to the Batter's On-Base rating.

### Advantage Logic
```typescript
if (pitchResult > batterOnBase) {
  advantage = PITCHER;
} else {
  advantage = BATTER;
}
```

### Example (continued)
- Pitch Result: 15
- Batter On-Base: 10
- **Result: PITCHER has advantage** (15 > 10)

---

## Phase 3: Swing

**Objective**: Determine the outcome by consulting the advantage holder's chart.

### Mechanics
1. **Advantage holder rolls d20**
2. **Look up result on their chart**
3. **Apply any modifiers from strategy cards**

### Chart Types

#### Classic Charts (2000-2001)
- **Range**: Results 1-20 only
- **Format**: Fixed 20-sided outcomes

#### Expanded Charts (2002-2005)  
- **Range**: Results can extend beyond 20
- **Trigger**: Strategy cards can activate 21+ results
- **Format**: Extended outcome tables

### Chart Results Reference

| Result | Name | Effect |
|--------|------|--------|
| **PU** | Pop Up | Out (Pitcher charts only) |
| **SO** | Strikeout | Out |
| **GB** | Ground Ball | Out or hit based on defense |
| **FB** | Fly Ball | Out or hit based on defense |
| **BB** | Walk | Batter to first, advance runners |
| **1B** | Single | Batter to first, advance runners 1 base |
| **1B+** | Single Plus | Single + speed check for extra base |
| **2B** | Double | Batter to second, advance runners 2 bases |
| **3B** | Triple | Batter to third, advance runners home |
| **HR** | Home Run | Batter and all runners score |

---

## Phase 4: Result Resolution

### 4.1 Outs

#### Automatic Outs
- **SO (Strikeout)**: Batter out, no runners advance
- **PU (Pop Up)**: Batter out, no runners advance

#### Defense-Dependent Outs
- **GB (Ground Ball)**: 
  - Check fielder defense rating
  - May result in hit if defense is poor
  - Double play possible with runners
- **FB (Fly Ball)**:
  - Check outfield defense rating  
  - May result in hit if defense is poor
  - Sacrifice fly possible with runner on 3rd

### 4.2 Hits and Baserunning

#### Single (1B)
- Batter advances to 1st base
- Runners advance 1 base
- Runner on 2nd scores
- Runner on 1st advances to 2nd

#### Single Plus (1B+)
- Normal single rules apply
- **Additional**: Batter attempts to advance to 2nd
- **Speed Check**: Roll d20, compare to batter's Speed rating
- **Success**: Batter reaches 2nd base
- **Failure**: Batter remains at 1st base

#### Double (2B)
- Batter advances to 2nd base
- All runners advance 2 bases
- Runners on 2nd and 3rd score

#### Triple (3B)  
- Batter advances to 3rd base
- All runners score

#### Home Run (HR)
- Batter and all runners score

#### Walk (BB)
- Batter advances to 1st base
- **Force advance only**: Runners only advance if forced
- Runner on 1st advances to 2nd
- Runners on 2nd/3rd stay (unless bases loaded)

---

## Fatigue System

### Pitcher Fatigue Rules

**Trigger**: When a pitcher exceeds their **IP (Innings Pitched)** rating.

### Calculation
```typescript
const inningsPitched = Math.floor(battersFaced / 3);
const isOverLimit = inningsPitched > pitcher.ip;

if (isOverLimit) {
  const excessBatters = battersFaced - (pitcher.ip * 3);
  const controlPenalty = Math.floor(excessBatters);
  const effectiveControl = pitcher.control - controlPenalty;
}
```

### Example
- Pitcher IP Rating: 6
- Batters Faced: 22
- **Innings Pitched**: 22 ÷ 3 = 7.33 innings (7 full)
- **Over Limit**: 7 > 6, so YES
- **Excess Batters**: 22 - (6 × 3) = 4 batters over limit
- **Control Penalty**: -4 (one point per excess batter)
- **Original Control**: 4 → **Effective Control**: 0

### Important Notes
- Penalty applies immediately when limit exceeded
- Penalty increases with each additional batter
- No minimum Control value (can go negative)
- Affects Pitch Phase calculations

---

## Strategy Cards

### Deck Composition

#### Constructed Format
- **60-card deck**
- **Hand size**: 3 cards at start
- **Draw**: 1 card per half-inning

#### Limited Format  
- **30-card deck**
- **Hand size**: 3 cards at start
- **Draw**: 1 card per half-inning

### Card Types

#### Offense Cards (Red)
- **Usage**: At-bat team only
- **Examples**: "Clutch Performance", "Steal Attempt"

#### Defense Cards (Blue)
- **Usage**: Fielding team only  
- **Examples**: "Great Catch", "Double Play"

#### Utility Cards (White)
- **Usage**: Either team
- **Examples**: "Manager Challenge", "Weather Delay"

### Timing Windows

| Timing | Description | Examples |
|--------|-------------|----------|
| **Before Pitch** | Play before d20 roll | "Intimidation" |
| **After Pitch** | After advantage determined | "Clutch Performance" |
| **Before Swing** | Before swing d20 roll | "Guess Pitch" |
| **After Result** | After chart lookup | "Great Catch" |

### Example Card: Clutch Performance
```typescript
{
  name: "Clutch Performance",
  type: "OFFENSE",
  timing: "AFTER_PITCH", 
  cost: 2, // Must discard 2 other cards
  effect: {
    type: "AUTO_ADVANTAGE",
    description: "Batter automatically gains advantage"
  }
}
```

---

## Roster Construction Rules

### Official DCI Tournament Rules

#### Team Composition
- **Total Players**: 25 exactly
- **Starting Pitchers**: 4 minimum (ordered by point value, highest to lowest)
- **Lineup**: 9 position players  
- **Bench**: 12 remaining players (pitchers + position players)

#### Point System
- **Point Cap**: 5,000 points maximum
- **Lineup Scoring**: Full point value
- **Bench Scoring**: Position players count as 1/5 point value (DCI Rule 523)
- **Pitcher Scoring**: All pitchers count full value regardless of role

#### Example Calculation
```typescript
// Lineup (9 players): 2000 points total
const lineupPoints = 2000; // Full value

// Bench hitters (8 players): 400 points total  
const benchPoints = Math.floor(400 / 5); // = 80 points

// All pitchers (8 total): 2900 points
const pitcherPoints = 2900; // Full value

// Total: 2000 + 80 + 2900 = 4980 points (under 5000 cap)
```

### Starter Ordering Rule
Starting pitchers must be ordered from highest to lowest point value:
```
SP1: 520 points
SP2: 480 points  
SP3: 450 points
SP4: 400 points
```

---

## Set Differences

### Classic Era (2000-2001)

#### Chart Characteristics
- **Range**: 1-20 results only
- **Strategy Cards**: Limited selection
- **Point Values**: Lower overall
- **Calculation**: Original WotC formulas

#### Typical Ranges
- **Pitcher Control**: 0-5
- **Hitter On-Base**: 6-12
- **Player Points**: 50-400

### Expanded Era (2002-2005)

#### Chart Characteristics  
- **Range**: 1-20+ results (extended charts possible)
- **Strategy Cards**: Full selection with advanced effects
- **Point Values**: Higher overall  
- **Calculation**: Updated WotC formulas

#### Typical Ranges
- **Pitcher Control**: 0-7
- **Hitter On-Base**: 4-15+  
- **Player Points**: 100-600+

#### Extended Chart Example
```typescript
// Standard result (1-20)
if (roll <= 20) {
  return standardChart[roll];
}

// Extended result (21+) - activated by strategy cards
if (roll > 20 && hasExtendedChartAccess) {
  return extendedChart[roll];
}
```

---

## Advanced Rules

### Speed Ratings

#### Usage
- **1B+ outcomes**: Attempt to reach 2nd base
- **Stolen base attempts**: Strategy card activation
- **Scoring from 2nd**: On singles

#### Speed Check Formula
```typescript
const speedCheck = (roll: number, playerSpeed: number): boolean => {
  return roll <= playerSpeed;
};
```

### Defense Ratings

#### Position Defense
- **Range**: 0-5+ (higher is better)
- **Usage**: Converts outs on GB/FB results
- **Calculation**: Based on real fielding metrics

#### Defense Check Example  
```typescript
// Ground ball to shortstop with defense rating 3
const defenseCheck = (roll: number, defenseRating: number): boolean => {
  return roll + defenseRating >= 12; // Standard difficulty
};
```

---

## Implementation Notes

### Random Number Generation
- **Die Type**: 20-sided die (d20)
- **Range**: 1-20 inclusive
- **Method**: Cryptographically secure random when possible

### Precision Requirements
- **Control/On-Base**: Integer values only
- **Speed**: Integer values only  
- **Defense**: Integer values only
- **Points**: Integer values only

### Edge Cases

#### Tied Advantage
- **Rule**: Batter wins ties
- **Implementation**: `pitchResult <= batterOnBase` gives batter advantage

#### Negative Control
- **Scenario**: Heavily fatigued pitcher
- **Rule**: No minimum Control value
- **Implementation**: Allow negative effective Control values

#### Extended Charts Without Cards
- **Scenario**: Roll > 20 without strategy card access
- **Rule**: Use highest available result (usually 20)
- **Implementation**: Clamp to maximum chart range

---

## Rules Verification

### Testing Requirements
All game engine implementations must pass these verification tests:

#### Pitch Phase Tests
```typescript
// Test 1: Basic advantage calculation
pitcher.control = 3;
batter.onBase = 10;
roll = 8;
expected = PITCHER; // (8 + 3) > 10

// Test 2: Tie goes to batter  
pitcher.control = 5;
batter.onBase = 15;
roll = 10;
expected = BATTER; // (10 + 5) <= 15
```

#### Fatigue Tests
```typescript
// Test 1: No fatigue
pitcher.ip = 6;
battersFaced = 18; // Exactly 6 innings
expected = 0; // No penalty

// Test 2: Moderate fatigue
pitcher.ip = 6; 
battersFaced = 21; // 7 innings pitched
expected = -3; // 3 batter penalty
```

#### Roster Validation Tests
```typescript
// Test 1: Bench scoring rule
lineupPoints = 2000;
benchHitterPoints = 500;
pitcherPoints = 2400;
total = 2000 + Math.floor(500/5) + 2400;
expected = true; // 4500 < 5000

// Test 2: Starter ordering
starters = [520, 480, 450, 400];
expected = true; // Descending order
```

---

This rules reference ensures our implementation maintains 100% accuracy to the original MLB Showdown experience while providing clear guidance for developers and verification for the community.