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
    console.log('👥 Starting to load teams from database...');
    console.log(`📍 API URL: ${process.env.EXPO_PUBLIC_API_URL || 'NOT SET'}`);

    const homeHittersPromises = DEFAULT_HOME_ROSTER.map(({ name, year }) =>
      searchCards({ name, year, playerType: 'Hitter', limit: 1 })
        .then(cards => {
          if (!cards || cards.length === 0) {
            console.warn(`⚠️  Failed to load ${name} (${year}) - not found in database`);
            return null;
          }
          console.log(`✅ Loaded ${name} (${year})`);
          return cards[0] as HitterCard;
        })
        .catch((error) => {
          console.warn(`⚠️  Failed to load ${name} (${year}):`, error instanceof Error ? error.message : String(error));
          return null;
        })
    );

    const awayHittersPromises = DEFAULT_AWAY_ROSTER.map(({ name, year }) =>
      searchCards({ name, year, playerType: 'Hitter', limit: 1 })
        .then(cards => {
          if (!cards || cards.length === 0) {
            console.warn(`⚠️  Failed to load ${name} (${year}) - not found in database`);
            return null;
          }
          console.log(`✅ Loaded ${name} (${year})`);
          return cards[0] as HitterCard;
        })
        .catch((error) => {
          console.warn(`⚠️  Failed to load ${name} (${year}):`, error instanceof Error ? error.message : String(error));
          return null;
        })
    );

    console.log(`📌 Loading home pitcher: ${DEFAULT_HOME_PITCHER.name}`);
    const homePitcherPromise = searchCards({
      name: DEFAULT_HOME_PITCHER.name,
      year: DEFAULT_HOME_PITCHER.year,
      playerType: 'Pitcher',
      limit: 1,
    }).then(cards => {
      if (cards && cards.length > 0) {
        console.log(`✅ Loaded ${DEFAULT_HOME_PITCHER.name}`);
        return cards[0] as PitcherCard;
      }
      console.warn(`⚠️  Could not load home pitcher`);
      return null;
    })
      .catch((error) => {
        console.warn(`⚠️  Failed to load home pitcher:`, error instanceof Error ? error.message : String(error));
        return null;
      });

    console.log(`📌 Loading away pitcher: ${DEFAULT_AWAY_PITCHER.name}`);
    const awayPitcherPromise = searchCards({
      name: DEFAULT_AWAY_PITCHER.name,
      year: DEFAULT_AWAY_PITCHER.year,
      playerType: 'Pitcher',
      limit: 1,
    }).then(cards => {
      if (cards && cards.length > 0) {
        console.log(`✅ Loaded ${DEFAULT_AWAY_PITCHER.name}`);
        return cards[0] as PitcherCard;
      }
      console.warn(`⚠️  Could not load away pitcher`);
      return null;
    })
      .catch((error) => {
        console.warn(`⚠️  Failed to load away pitcher:`, error instanceof Error ? error.message : String(error));
        return null;
      });

    const [homeHitters, awayHitters, homePitcher, awayPitcher] = await Promise.all([
      Promise.all(homeHittersPromises),
      Promise.all(awayHittersPromises),
      homePitcherPromise,
      awayPitcherPromise,
    ]);

    const validHomeHitters = homeHitters.filter((h): h is HitterCard => h !== null);
    const validAwayHitters = awayHitters.filter((h): h is HitterCard => h !== null);

    console.log(`📊 Team loading summary:`);
    console.log(`   Home: ${validHomeHitters.length}/${DEFAULT_HOME_ROSTER.length} hitters + ${homePitcher ? '1' : '0'} pitcher`);
    console.log(`   Away: ${validAwayHitters.length}/${DEFAULT_AWAY_ROSTER.length} hitters + ${awayPitcher ? '1' : '0'} pitcher`);

    if (validHomeHitters.length === 0 || validAwayHitters.length === 0 || !homePitcher || !awayPitcher) {
      const errors = [];
      if (validHomeHitters.length === 0) errors.push('No home hitters loaded');
      if (validAwayHitters.length === 0) errors.push('No away hitters loaded');
      if (!homePitcher) errors.push('Home pitcher not loaded');
      if (!awayPitcher) errors.push('Away pitcher not loaded');
      throw new Error(errors.join(', '));
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
    const message = error instanceof Error ? error.message : String(error);
    console.error(`💥 Failed to load teams: ${message}`);
    throw new Error(`Failed to load teams: ${message}`);
  }
}
