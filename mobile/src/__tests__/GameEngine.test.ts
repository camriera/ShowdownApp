import { GameEngine } from '../engine/GameEngine';
import { HitterCard, PitcherCard } from '../models/Card';

const createTestPitcher = (overrides?: Partial<PitcherCard>): PitcherCard => ({
  id: 'pitcher-1',
  name: 'Test Pitcher',
  year: '2024',
  team: 'Test Team',
  playerType: 'Pitcher',
  command: 5,
  outs: 10,
  points: 100,
  hand: 'R',
  ip: 6,
  chart: [
    { range: [1, 5], result: 'PU' },
    { range: [6, 10], result: 'GB' },
    { range: [11, 15], result: 'FB' },
    { range: [16, 20], result: 'BB' },
  ],
  ...overrides,
});

const createTestHitter = (overrides?: Partial<HitterCard>): HitterCard => ({
  id: 'hitter-1',
  name: 'Test Hitter',
  year: '2024',
  team: 'Test Team',
  playerType: 'Hitter',
  command: 10,
  outs: 5,
  points: 200,
  hand: 'R',
  positions: { 'OF': 2 },
  speed: 15,
  chart: [
    { range: [1, 3], result: 'SO' },
    { range: [4, 7], result: 'GB' },
    { range: [8, 10], result: 'FB' },
    { range: [11, 14], result: '1B' },
    { range: [15, 17], result: '2B' },
    { range: [18, 19], result: '3B' },
    { range: [20, 20], result: 'HR' },
  ],
  ...overrides,
});

describe('GameEngine', () => {
  let engine: GameEngine;
  let homePitcher: PitcherCard;
  let awayPitcher: PitcherCard;
  let homeLineup: HitterCard[];
  let awayLineup: HitterCard[];

  beforeEach(() => {
    homePitcher = createTestPitcher({ name: 'Home Pitcher' });
    awayPitcher = createTestPitcher({ name: 'Away Pitcher' });
    
    homeLineup = Array.from({ length: 9 }, (_, i) => 
      createTestHitter({ id: `home-hitter-${i}`, name: `Home Hitter ${i + 1}` })
    );
    
    awayLineup = Array.from({ length: 9 }, (_, i) => 
      createTestHitter({ id: `away-hitter-${i}`, name: `Away Hitter ${i + 1}` })
    );

    engine = new GameEngine(
      { name: 'Home Team', lineup: homeLineup, pitcher: homePitcher },
      { name: 'Away Team', lineup: awayLineup, pitcher: awayPitcher }
    );
  });

  describe('Game Initialization', () => {
    it('should start at top of 1st inning', () => {
      const state = engine.getState();
      expect(state.inning).toBe(1);
      expect(state.isTopOfInning).toBe(true);
    });

    it('should start with 0-0 score', () => {
      const state = engine.getState();
      expect(state.score.home).toBe(0);
      expect(state.score.away).toBe(0);
    });

    it('should start in PITCH phase', () => {
      const state = engine.getState();
      expect(state.currentPhase).toBe('PITCH');
    });

    it('should have empty bases', () => {
      const state = engine.getState();
      expect(state.bases.first).toBeNull();
      expect(state.bases.second).toBeNull();
      expect(state.bases.third).toBeNull();
    });
  });

  describe('Pitch Phase', () => {
    it('should give pitcher advantage when pitch result > batter command', () => {
      const { advantage } = engine.executePitchPhase(15);
      expect(advantage).toBe('PITCHER');
    });

    it('should give batter advantage when pitch result <= batter command', () => {
      const { advantage } = engine.executePitchPhase(5);
      expect(advantage).toBe('BATTER');
    });

    it('should transition to SWING phase', () => {
      engine.executePitchPhase(10);
      const state = engine.getState();
      expect(state.currentPhase).toBe('SWING');
    });

    it('should calculate pitch result as roll + pitcher command', () => {
      const { pitchResult } = engine.executePitchPhase(10);
      expect(pitchResult).toBe(15);
    });
  });

  describe('Swing Phase', () => {
    it('should use pitcher chart when pitcher has advantage', () => {
      engine.executePitchPhase(15);
      const { chartResult } = engine.executeSwingPhase(7);
      expect(chartResult).toBe('GB');
    });

    it('should use batter chart when batter has advantage', () => {
      engine.executePitchPhase(3);
      const { chartResult } = engine.executeSwingPhase(20);
      expect(chartResult).toBe('HR');
    });

    it('should transition to RESULT phase', () => {
      engine.executePitchPhase(10);
      engine.executeSwingPhase(5);
      const state = engine.getState();
      expect(state.currentPhase).toBe('RESULT');
    });
  });

  describe('Result Phase - Outs', () => {
    it('should record strikeout', () => {
      engine.executePitchPhase(3);
      engine.executeSwingPhase(2);
      const result = engine.resolveResult('SO');
      
      expect(result.isOut).toBe(true);
      expect(result.outsRecorded).toBe(1);
      expect(result.runsScored).toBe(0);
    });

    it('should record ground out', () => {
      engine.executePitchPhase(15);
      engine.executeSwingPhase(8);
      const result = engine.resolveResult('GB');
      
      expect(result.isOut).toBe(true);
      expect(result.outsRecorded).toBe(1);
    });

    it('should increment outs in game state', () => {
      engine.executePitchPhase(3);
      engine.executeSwingPhase(2);
      engine.resolveResult('SO');
      
      const state = engine.getState();
      expect(state.outs).toBe(1);
    });
  });

  describe('Result Phase - Hits', () => {
    it('should handle single with runner on second', () => {
      const state = engine.getState();
      state.bases.second = homeLineup[0];
      
      engine.executePitchPhase(3);
      engine.executeSwingPhase(12);
      const result = engine.resolveResult('1B');
      
      expect(result.runsScored).toBe(1);
      expect(result.newBaseState.first).toBeDefined();
      expect(result.newBaseState.second).toBeDefined();
    });

    it('should handle double clearing bases', () => {
      const state = engine.getState();
      state.bases.first = homeLineup[0];
      state.bases.second = homeLineup[1];
      state.bases.third = homeLineup[2];
      
      engine.executePitchPhase(3);
      engine.executeSwingPhase(16);
      const result = engine.resolveResult('2B');
      
      expect(result.runsScored).toBe(3);
      expect(result.newBaseState.second).toBeDefined();
      expect(result.newBaseState.first).toBeNull();
      expect(result.newBaseState.third).toBeNull();
    });

    it('should handle home run with bases loaded', () => {
      const state = engine.getState();
      state.bases.first = homeLineup[0];
      state.bases.second = homeLineup[1];
      state.bases.third = homeLineup[2];
      
      engine.executePitchPhase(3);
      engine.executeSwingPhase(20);
      const result = engine.resolveResult('HR');
      
      expect(result.runsScored).toBe(4);
      expect(result.newBaseState.first).toBeNull();
      expect(result.newBaseState.second).toBeNull();
      expect(result.newBaseState.third).toBeNull();
    });

    it('should handle walk with bases loaded', () => {
      const state = engine.getState();
      state.bases.first = homeLineup[0];
      state.bases.second = homeLineup[1];
      state.bases.third = homeLineup[2];
      
      engine.executePitchPhase(15);
      engine.executeSwingPhase(18);
      const result = engine.resolveResult('BB');
      
      expect(result.runsScored).toBe(1);
      expect(result.newBaseState.first).toBeDefined();
      expect(result.newBaseState.second).toBeDefined();
      expect(result.newBaseState.third).toBeDefined();
    });
  });

  describe('Inning Management', () => {
    it('should end inning after 3 outs', () => {
      for (let i = 0; i < 3; i++) {
        engine.executePitchPhase(15);
        engine.executeSwingPhase(5);
        engine.resolveResult('SO');
      }
      
      const state = engine.getState();
      expect(state.outs).toBe(0);
      expect(state.isTopOfInning).toBe(false);
    });

    it('should advance to bottom of inning after top half', () => {
      for (let i = 0; i < 3; i++) {
        engine.executePitchPhase(15);
        engine.executeSwingPhase(5);
        engine.resolveResult('SO');
      }
      
      const state = engine.getState();
      expect(state.inning).toBe(1);
      expect(state.isTopOfInning).toBe(false);
    });

    it('should advance to next inning after bottom half', () => {
      for (let half = 0; half < 2; half++) {
        for (let out = 0; out < 3; out++) {
          engine.executePitchPhase(15);
          engine.executeSwingPhase(5);
          engine.resolveResult('SO');
        }
      }
      
      const state = engine.getState();
      expect(state.inning).toBe(2);
      expect(state.isTopOfInning).toBe(true);
    });

    it('should clear bases when inning ends', () => {
      const state = engine.getState();
      state.bases.first = homeLineup[0];
      state.bases.second = homeLineup[1];
      
      for (let i = 0; i < 3; i++) {
        engine.executePitchPhase(15);
        engine.executeSwingPhase(5);
        engine.resolveResult('SO');
      }
      
      const newState = engine.getState();
      expect(newState.bases.first).toBeNull();
      expect(newState.bases.second).toBeNull();
      expect(newState.bases.third).toBeNull();
    });
  });

  describe('Game Completion', () => {
    it('should end game after 9 innings if not tied', () => {
      for (let inning = 1; inning <= 9; inning++) {
        for (let half = 0; half < 2; half++) {
          for (let out = 0; out < 3; out++) {
            const state = engine.getState();
            if (inning === 5 && half === 0 && out === 0) {
              state.score.home = 5;
              state.score.away = 2;
            }
            
            engine.executePitchPhase(15);
            engine.executeSwingPhase(5);
            engine.resolveResult('SO');
          }
        }
      }
      
      const state = engine.getState();
      expect(state.isGameOver).toBe(true);
      expect(state.winner).toBe('home');
    });

    it('should continue to extra innings if tied after 9', () => {
      for (let inning = 1; inning <= 9; inning++) {
        for (let half = 0; half < 2; half++) {
          for (let out = 0; out < 3; out++) {
            engine.executePitchPhase(15);
            engine.executeSwingPhase(5);
            engine.resolveResult('SO');
          }
        }
      }
      
      const state = engine.getState();
      expect(state.isGameOver).toBe(false);
      expect(state.inning).toBe(10);
    });
  });

  describe('Pitcher Fatigue', () => {
    it('should not apply penalty before exceeding IP', () => {
      for (let i = 0; i < 18; i++) {
        engine.executePitchPhase(3);
        engine.executeSwingPhase(12);
        engine.resolveResult('1B');
      }
      
      const { pitchResult } = engine.executePitchPhase(10);
      expect(pitchResult).toBe(15);
    });

    it('should apply penalty after exceeding IP', () => {
      for (let i = 0; i < 21; i++) {
        engine.executePitchPhase(3);
        engine.executeSwingPhase(12);
        engine.resolveResult('1B');
      }
      
      const { pitchResult } = engine.executePitchPhase(10);
      expect(pitchResult).toBe(12);
    });
  });

  describe('Score Tracking', () => {
    it('should credit runs to away team in top of inning', () => {
      engine.executePitchPhase(3);
      engine.executeSwingPhase(20);
      engine.resolveResult('HR');
      
      const state = engine.getState();
      expect(state.score.away).toBe(1);
      expect(state.score.home).toBe(0);
    });

    it('should credit runs to home team in bottom of inning', () => {
      for (let i = 0; i < 3; i++) {
        engine.executePitchPhase(15);
        engine.executeSwingPhase(5);
        engine.resolveResult('SO');
      }
      
      engine.executePitchPhase(3);
      engine.executeSwingPhase(20);
      engine.resolveResult('HR');
      
      const state = engine.getState();
      expect(state.score.home).toBe(1);
      expect(state.score.away).toBe(0);
    });
  });

  describe('Batter Rotation', () => {
    it('should advance to next batter after at-bat', () => {
      const initialBatterIndex = engine.getState().currentBatterIndex;
      
      engine.executePitchPhase(15);
      engine.executeSwingPhase(5);
      engine.resolveResult('SO');
      
      const newBatterIndex = engine.getState().currentBatterIndex;
      expect(newBatterIndex).toBe(initialBatterIndex + 1);
    });

    it('should wrap around lineup after 9th batter', () => {
      for (let i = 0; i < 9; i++) {
        engine.executePitchPhase(15);
        engine.executeSwingPhase(5);
        engine.resolveResult('1B');
      }
      
      const state = engine.getState();
      expect(state.currentBatterIndex).toBe(0);
    });
  });
});
