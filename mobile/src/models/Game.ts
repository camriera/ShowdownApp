import { HitterCard, PitcherCard } from './Card';

export type GamePhase = 'PITCH' | 'ADVANTAGE' | 'SWING' | 'RESULT' | 'BETWEEN_BATTERS';
export type Advantage = 'PITCHER' | 'BATTER';

export interface BaseRunners {
  first: HitterCard | null;
  second: HitterCard | null;
  third: HitterCard | null;
}

export interface InningScore {
  away: number;
  home: number;
}

export interface GameState {
  gameId: string;
  
  homeTeam: {
    name: string;
    lineup: HitterCard[];
    pitcher: PitcherCard;
  };
  
  awayTeam: {
    name: string;
    lineup: HitterCard[];
    pitcher: PitcherCard;
  };
  
  inning: number;
  isTopOfInning: boolean;
  outs: number;
  
  score: {
    home: number;
    away: number;
  };
  
  currentPhase: GamePhase;
  currentBatterIndex: number;
  currentAdvantage: Advantage | null;
  
  lastPitchRoll: number | null;
  lastPitchResult: number | null;
  lastSwingRoll: number | null;
  
  bases: BaseRunners;
  
  pitcherBattersFaced: number;
  
  isGameOver: boolean;
  winner: 'home' | 'away' | null;
}

export interface AtBatResult {
  isOut: boolean;
  outsRecorded: number;
  runsScored: number;
  newBaseState: BaseRunners;
  description: string;
}
