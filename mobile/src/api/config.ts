const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:9000/api';

console.log(`🔧 API_BASE_URL configured as: ${API_BASE_URL}`);

export const API_ENDPOINTS = {
  CARDS: {
    GENERATE: `${API_BASE_URL}/cards-generate`,
    SEARCH: `${API_BASE_URL}/cards-search`,
  },
  GAMES: {
    CREATE: `${API_BASE_URL}/games/create`,
    UPDATE: `${API_BASE_URL}/games/update`,
    GET: `${API_BASE_URL}/games/get`,
  },
  ROSTERS: {
    CREATE: `${API_BASE_URL}/rosters/create`,
    LIST: `${API_BASE_URL}/rosters/list`,
    GET: `${API_BASE_URL}/rosters/get`,
  },
};

export const API_CONFIG = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};
