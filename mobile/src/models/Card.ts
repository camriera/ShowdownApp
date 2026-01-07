// Core type definitions for MLB Showdown cards

export type ChartResult = 'PU' | 'SO' | 'GB' | 'FB' | 'BB' | '1B' | '1B+' | '2B' | '3B' | 'HR';

export interface ChartEntry {
  range: [number, number]; // [start, end] inclusive
  result: ChartResult;
}

export interface PlayerCard {
  id: string;
  name: string;
  year: string;
  team: string;
  playerType: 'Pitcher' | 'Hitter';
  
  // Core game stats
  command: number;        // Control (Pitcher) or On-Base (Hitter)
  outs: number;          // Chart outs count
  chart: ChartEntry[];   // Result mappings
  
  // Position players only
  positions?: { [position: string]: number };
  speed?: number;
  
  // Pitchers only
  ip?: number;           // Innings Pitched rating
  
  // Metadata
  points: number;
  hand: 'L' | 'R' | 'S'; // Left, Right, Switch
  icons?: string[];
  imageUrl?: string;
}

export interface PitcherCard extends PlayerCard {
  playerType: 'Pitcher';
  ip: number;
}

export interface HitterCard extends PlayerCard {
  playerType: 'Hitter';
  positions: { [position: string]: number };
  speed: number;
}
