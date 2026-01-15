import { HitterCard } from '../models/Card';
import { BaseRunners } from '../models/Game';

/**
 * Baserunning utility functions for MLB Showdown game logic.
 * Handles force advancements, optimal force outs, and runner scoring.
 */

export interface ForceAdvancementResult {
  newBases: BaseRunners;
  runsScored: number;
}

/**
 * Determines if a runner on a given base is forced to advance.
 * A runner is forced when all bases behind them are occupied.
 */
export function isRunnerForced(
  base: 'first' | 'second' | 'third',
  currentBases: BaseRunners
): boolean {
  switch (base) {
    case 'first':
      // Runner on first is always forced when batter reaches base
      return true;
    
    case 'second':
      // Runner on second is forced only if first base is occupied
      return currentBases.first !== null;
    
    case 'third':
      // Runner on third is forced only if first AND second are occupied
      return currentBases.first !== null && currentBases.second !== null;
    
    default:
      return false;
  }
}

/**
 * Processes force advancement for a walk (BB).
 * Only advances runners who are forced by the batter reaching first.
 */
export function processWalkAdvancement(
  currentBases: BaseRunners,
  batter: HitterCard
): ForceAdvancementResult {
  const newBases: BaseRunners = { first: null, second: null, third: null };
  let runsScored = 0;

  // Process from 3rd → 2nd → 1st to avoid overwriting
  
  // Third base: Only advances if forced (1st AND 2nd occupied)
  if (currentBases.third) {
    if (isRunnerForced('third', currentBases)) {
      runsScored = 1; // Runner scores
    } else {
      newBases.third = currentBases.third; // Stays put
    }
  }
  
  // Second base: Only advances if forced (1st occupied)
  if (currentBases.second) {
    if (isRunnerForced('second', currentBases)) {
      newBases.third = currentBases.second; // Advances to third
    } else {
      newBases.second = currentBases.second; // Stays put
    }
  }
  
  // First base: Always forced by batter
  if (currentBases.first) {
    newBases.second = currentBases.first;
  }
  
  // Batter to first
  newBases.first = batter;
  
  return { newBases, runsScored };
}

/**
 * Processes baserunning for a ground ball out with force out logic.
 * Takes the optimal force out (furthest base with a force).
 * 
 * @param currentBases - Current base state
 * @param batter - Current batter
 * @returns Force out result with new base state
 */
export function processGroundBallForceOut(
  currentBases: BaseRunners,
  batter: HitterCard
): ForceAdvancementResult {
  const newBases: BaseRunners = { first: null, second: null, third: null };
  let runsScored = 0;

  // Determine optimal force out (take force at furthest base)
  
  if (currentBases.first && currentBases.second && currentBases.third) {
    // Bases loaded: Force out at home plate
    // Batter reaches 1st, runner from 1st → 2nd, runner from 2nd → 3rd
    // Runner from 3rd is out at home (force)
    newBases.first = batter;
    newBases.second = currentBases.first;
    newBases.third = currentBases.second;
    // Runner from 3rd is out (no run scored)
    
  } else if (currentBases.first && currentBases.second) {
    // Runners on 1st and 2nd: Force out at 3rd base
    // Batter reaches 1st, runner from 1st → 2nd
    // Runner from 2nd is out at 3rd (force)
    newBases.first = batter;
    newBases.second = currentBases.first;
    // Runner from 2nd is out
    
    // Runner on 3rd stays (if any)
    if (currentBases.third) {
      newBases.third = currentBases.third;
    }
    
  } else if (currentBases.first) {
    // Runner on 1st only: Force out at 2nd base
    // Batter reaches 1st
    // Runner from 1st is out at 2nd (force)
    newBases.first = batter;
    // Runner from 1st is out
    
    // Other runners stay
    if (currentBases.second) {
      newBases.second = currentBases.second;
    }
    if (currentBases.third) {
      newBases.third = currentBases.third;
    }
    
  } else {
    // No force situation: Batter out at first
    // All runners stay in place
    newBases.first = null; // Batter is out
    newBases.second = currentBases.second;
    newBases.third = currentBases.third;
  }

  return { newBases, runsScored };
}

/**
 * Processes baserunning for a fly ball out.
 * Checks for sacrifice fly (runner on 3rd with less than 2 outs scores).
 * 
 * @param currentBases - Current base state
 * @param outs - Current out count (before this out)
 * @returns Result with new base state and runs scored
 */
export function processFlyBallOut(
  currentBases: BaseRunners,
  outs: number
): ForceAdvancementResult {
  const newBases: BaseRunners = { ...currentBases };
  let runsScored = 0;

  // Sacrifice fly: Runner on 3rd scores if less than 2 outs
  if (currentBases.third && outs < 2) {
    runsScored = 1;
    newBases.third = null; // Runner scores and leaves base
  }

  return { newBases, runsScored };
}

/**
 * Advances all runners by a fixed number of bases (for hits).
 * 
 * @param currentBases - Current base state
 * @param batter - Current batter
 * @param bases - Number of bases to advance (1 for single, 2 for double, etc.)
 * @returns Result with new base state and runs scored
 */
export function advanceRunnersByBases(
  currentBases: BaseRunners,
  batter: HitterCard,
  bases: 1 | 2 | 3 | 4
): ForceAdvancementResult {
  const newBases: BaseRunners = { first: null, second: null, third: null };
  let runsScored = 0;

  // Process runners from third → second → first to avoid overwriting
  
  if (currentBases.third) {
    const newBase = 3 + bases;
    if (newBase >= 4) {
      runsScored++;
    } else if (newBase === 3) {
      newBases.third = currentBases.third;
    }
  }
  
  if (currentBases.second) {
    const newBase = 2 + bases;
    if (newBase >= 4) {
      runsScored++;
    } else if (newBase === 3) {
      newBases.third = currentBases.second;
    } else if (newBase === 2) {
      newBases.second = currentBases.second;
    }
  }
  
  if (currentBases.first) {
    const newBase = 1 + bases;
    if (newBase >= 4) {
      runsScored++;
    } else if (newBase === 3) {
      newBases.third = currentBases.first;
    } else if (newBase === 2) {
      newBases.second = currentBases.first;
    } else if (newBase === 1) {
      newBases.first = currentBases.first;
    }
  }
  
  // Place batter on base
  if (bases === 1) {
    newBases.first = batter;
  } else if (bases === 2) {
    newBases.second = batter;
  } else if (bases === 3) {
    newBases.third = batter;
  } else if (bases === 4) {
    runsScored++; // Home run - batter scores too
  }
  
  return { newBases, runsScored };
}
