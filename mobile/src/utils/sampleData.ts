import { HitterCard, PitcherCard } from '../models/Card';

export const SAMPLE_PITCHER: PitcherCard = {
  id: 'pitcher_1',
  name: 'Ace Pitcher',
  year: '2021',
  team: 'Home',
  playerType: 'Pitcher',
  command: 4,
  outs: 16,
  ip: 6,
  points: 350,
  hand: 'R',
  chart: [
    { range: [1, 6], result: 'PU' },
    { range: [7, 16], result: 'SO' },
    { range: [17, 18], result: 'GB' },
    { range: [19, 19], result: 'FB' },
    { range: [20, 20], result: '1B' },
  ],
};

export const SAMPLE_HITTER: HitterCard = {
  id: 'hitter_1',
  name: 'Power Slugger',
  year: '2021',
  team: 'Away',
  playerType: 'Hitter',
  command: 11,
  outs: 12,
  speed: 12,
  points: 420,
  hand: 'R',
  positions: { 'RF': 2, 'DH': 0 },
  chart: [
    { range: [1, 2], result: 'SO' },
    { range: [3, 8], result: 'GB' },
    { range: [9, 12], result: 'FB' },
    { range: [13, 13], result: 'BB' },
    { range: [14, 16], result: '1B' },
    { range: [17, 18], result: '2B' },
    { range: [19, 19], result: '3B' },
    { range: [20, 20], result: 'HR' },
  ],
};

const createHitter = (name: string, onBase: number, power: 'low' | 'medium' | 'high'): HitterCard => {
  const powerCharts = {
    low: [
      { range: [1, 4] as [number, number], result: 'SO' as const },
      { range: [5, 10] as [number, number], result: 'GB' as const },
      { range: [11, 14] as [number, number], result: 'FB' as const },
      { range: [15, 16] as [number, number], result: 'BB' as const },
      { range: [17, 19] as [number, number], result: '1B' as const },
      { range: [20, 20] as [number, number], result: '2B' as const },
    ],
    medium: [
      { range: [1, 2] as [number, number], result: 'SO' as const },
      { range: [3, 8] as [number, number], result: 'GB' as const },
      { range: [9, 12] as [number, number], result: 'FB' as const },
      { range: [13, 13] as [number, number], result: 'BB' as const },
      { range: [14, 16] as [number, number], result: '1B' as const },
      { range: [17, 18] as [number, number], result: '2B' as const },
      { range: [19, 19] as [number, number], result: '3B' as const },
      { range: [20, 20] as [number, number], result: 'HR' as const },
    ],
    high: [
      { range: [1, 2] as [number, number], result: 'SO' as const },
      { range: [3, 6] as [number, number], result: 'GB' as const },
      { range: [7, 10] as [number, number], result: 'FB' as const },
      { range: [11, 11] as [number, number], result: 'BB' as const },
      { range: [12, 14] as [number, number], result: '1B' as const },
      { range: [15, 17] as [number, number], result: '2B' as const },
      { range: [18, 18] as [number, number], result: '3B' as const },
      { range: [19, 20] as [number, number], result: 'HR' as const },
    ],
  };

  return {
    id: `hitter_${name.replace(/\s/g, '_')}`,
    name,
    year: '2021',
    team: 'Team',
    playerType: 'Hitter',
    command: onBase,
    outs: 12,
    speed: 12,
    points: 300,
    hand: 'R',
    positions: { 'OF': 2 },
    chart: powerCharts[power],
  };
};

export const SAMPLE_TEAMS = {
  home: {
    name: 'Home Team',
    pitcher: SAMPLE_PITCHER,
    lineup: [
      createHitter('Leadoff Hitter', 10, 'low'),
      createHitter('Contact Hitter', 9, 'low'),
      createHitter('Power Hitter', 11, 'high'),
      createHitter('Cleanup Hitter', 12, 'high'),
      createHitter('Fifth Hitter', 10, 'medium'),
      createHitter('Sixth Hitter', 9, 'medium'),
      createHitter('Seventh Hitter', 8, 'low'),
      createHitter('Eighth Hitter', 8, 'low'),
      createHitter('Ninth Hitter', 7, 'low'),
    ],
  },
  away: {
    name: 'Away Team',
    pitcher: {
      ...SAMPLE_PITCHER,
      id: 'pitcher_2',
      name: 'Away Ace',
      team: 'Away',
    },
    lineup: [
      createHitter('Away Leadoff', 10, 'low'),
      createHitter('Away Second', 9, 'low'),
      createHitter('Away Third', 11, 'high'),
      createHitter('Away Cleanup', 12, 'high'),
      createHitter('Away Fifth', 10, 'medium'),
      createHitter('Away Sixth', 9, 'medium'),
      createHitter('Away Seventh', 8, 'low'),
      createHitter('Away Eighth', 8, 'low'),
      createHitter('Away Ninth', 7, 'low'),
    ],
  },
};
