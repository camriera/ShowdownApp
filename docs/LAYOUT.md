# Game Screen Layout Architecture

This document describes the responsive, fixed layout architecture used in the `GameScreen` component.

## Overview

The Game Screen uses a **fixed, non-scrolling layout** designed to maximize the play area while accommodating various device screen sizes (from iPhone SE to large tablets).

The layout is divided into three primary vertical sections: **Top**, **Middle**, and **Bottom**.

## Visual Diagram

```
+--------------------------------------------------+
|  SAFE AREA (Status Bar)                          |
+--------------------------------------------------+
|  TOP SECTION (Fixed)                             |
|  +--------------------------------------------+  |
|  |  SCOREBOARD (Height: 60px)                 |  |
|  |  [AWAY 0]  [▲ 1  ●●○]  [HOME 0]            |  |
|  +--------------------------------------------+  |
|  |  LAST PLAY BANNER                          |  |
|  |  "Roll: 18 -> PITCHER ADVANTAGE!"          |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
|                                                  |
|  MIDDLE SECTION (Flexible, Centered)             |
|  (Scaling: 0.5x - 1.0x based on height)          |
|                                                  |
|          [ 2B ]                                  |
|         /      \                                 |
|      [3B]      [1B]   <-- BASEBALL DIAMOND       |
|         \      /                                 |
|          [ HP ]                                  |
|                                                  |
+--------------------------------------------------+
|  BOTTOM SECTION (Fixed)                          |
|                                                  |
|       [ DICE ROLLER ]                            |
|         ( d20 )                                  |
|                                                  |
|  +--------------------------------------------+  |
|  |  MATCHUP SECTION                           |  |
|  |  [ PITCH PHASE ]                           |  |
|  |                                            |  |
|  |  [Pitcher Card]  VS  [Batter Card]         |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
|  SAFE AREA (Home Indicator)                      |
+--------------------------------------------------+
```

## Section Details

### 1. Top Section
- **Components:** `Scoreboard`, `LastPlayContainer`
- **Behavior:** Fixed height. Stays anchored to the top safe area.
- **Styling:** High z-index to ensure it sits above other content if necessary.

### 2. Middle Section
- **Components:** `BaseballDiamond`
- **Behavior:**
    - Uses `flex: 1` to occupy all remaining vertical space between Top and Bottom sections.
    - Content is **vertically centered**.
    - **Responsive Scaling:**
        - Calculates available height: `SCREEN_HEIGHT - HEADER - FOOTER - SAFE_MARGIN`.
        - Applies a dynamic scale factor (`DIAMOND_SCALE`) to the diamond.
        - **Scale Range:** Clamped between `0.5` (min) and `1.0` (max).
        - This ensures the field fits on small screens (iPhone SE) without scrolling, while looking natural on larger screens.

### 3. Bottom Section
- **Components:** `DiceRoller`, `MatchupSection` (Phase Info + Player Cards)
- **Behavior:** Fixed height (content-driven). Anchored to the bottom safe area.
- **Styling:** Contains the interactive dice roller and the core gameplay controls (cards).

## Responsive Logic

The scaling logic is defined in `GameScreen.tsx`:

```typescript
const HEADER_HEIGHT = 100;
const BOTTOM_HEIGHT = 180;
const SAFE_MARGIN = 40;
const DIAMOND_TARGET_HEIGHT = 360;

const AVAILABLE_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - BOTTOM_HEIGHT - SAFE_MARGIN;
const DIAMOND_SCALE = Math.min(1, Math.max(0.5, AVAILABLE_HEIGHT / DIAMOND_TARGET_HEIGHT));
```

This simple formula allows the UI to adapt fluidly without complex media queries or breakpoints.
