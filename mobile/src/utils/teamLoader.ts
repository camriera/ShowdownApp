import { HitterCard, PitcherCard } from '../models/Card';
import { searchCards } from '../api';

export interface Team {
  name: string;
  pitcher: PitcherCard;
  lineup: HitterCard[];
}

const DEFAULT_HOME_ROSTER = [
  { name: 'Mike Trout', year: '2021' },
  { name: 'Aaron Judge', year: '2022' },
  { name: 'Mookie Betts', year: '2020' },
  { name: 'Ronald Acuna Jr.', year: '2023' },
  { name: 'Bryce Harper', year: '2021' },
  { name: 'Freddie Freeman', year: '2020' },
  { name: 'Juan Soto', year: '2022' },
  { name: 'Fernando Tatis Jr.', year: '2021' },
  { name: 'Babe Ruth', year: '1923' },
];

const DEFAULT_HOME_PITCHER = { name: 'Gerrit Cole', year: '2023' };

const DEFAULT_AWAY_ROSTER = [
  { name: 'Barry Bonds', year: '2004' },
  { name: 'Ted Williams', year: '1941' },
  { name: 'Ken Griffey Jr.', year: '1997' },
  { name: 'Derek Jeter', year: '2009' },
  { name: 'Shohei Ohtani (HITTER)', year: '2023' },
  { name: 'Vladimir Guerrero Jr.', year: '2021' },
  { name: 'Pete Alonso', year: '2019' },
  { name: 'Jose Altuve', year: '2017' },
  { name: 'Francisco Lindor', year: '2018' },
];

const DEFAULT_AWAY_PITCHER = { name: 'Jacob deGrom', year: '2019' };

export async function loadDefaultTeams(): Promise<{ home: Team; away: Team }> {
  try {
    const homeHittersPromises = DEFAULT_HOME_ROSTER.map(({ name, year }) =>
      searchCards({ name, year, playerType: 'Hitter', limit: 1 })
        .then(cards => cards[0] as HitterCard)
        .catch(() => null)
    );

    const awayHittersPromises = DEFAULT_AWAY_ROSTER.map(({ name, year }) =>
      searchCards({ name, year, playerType: 'Hitter', limit: 1 })
        .then(cards => cards[0] as HitterCard)
        .catch(() => null)
    );

    const homePitcherPromise = searchCards({
      name: DEFAULT_HOME_PITCHER.name,
      year: DEFAULT_HOME_PITCHER.year,
      playerType: 'Pitcher',
      limit: 1,
    }).then(cards => cards[0] as PitcherCard)
      .catch(() => null);

    const awayPitcherPromise = searchCards({
      name: DEFAULT_AWAY_PITCHER.name,
      year: DEFAULT_AWAY_PITCHER.year,
      playerType: 'Pitcher',
      limit: 1,
    }).then(cards => cards[0] as PitcherCard)
      .catch(() => null);

    const [homeHitters, awayHitters, homePitcher, awayPitcher] = await Promise.all([
      Promise.all(homeHittersPromises),
      Promise.all(awayHittersPromises),
      homePitcherPromise,
      awayPitcherPromise,
    ]);

    const validHomeHitters = homeHitters.filter((h): h is HitterCard => h !== null);
    const validAwayHitters = awayHitters.filter((h): h is HitterCard => h !== null);

    if (validHomeHitters.length === 0 || validAwayHitters.length === 0 || !homePitcher || !awayPitcher) {
      throw new Error('Failed to load enough players from database');
    }

    return {
      home: {
        name: 'Home All-Stars',
        pitcher: homePitcher,
        lineup: validHomeHitters,
      },
      away: {
        name: 'Away Legends',
        pitcher: awayPitcher,
        lineup: validAwayHitters,
      },
    };
  } catch (error) {
    throw new Error(`Failed to load teams: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
