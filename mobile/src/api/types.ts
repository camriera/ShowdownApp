import { PlayerCard, HitterCard, PitcherCard } from '../models/Card';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerateCardRequest {
  name: string;
  year: string;
  setVersion?: 'CLASSIC' | 'EXPANDED' | string;
}

export interface GenerateCardResponse {
  card: PlayerCard;
  cached: boolean;
  generatedAt: string;
}

export interface SearchCardsQuery {
  name?: string;
  year?: string;
  playerType?: 'Pitcher' | 'Hitter';
  minPoints?: number;
  maxPoints?: number;
  limit?: number;
}

export interface SearchCardsResponse {
  cards: PlayerCard[];
  count: number;
  query: SearchCardsQuery;
}

export interface CreateGameRequest {
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
}

export interface CreateGameResponse {
  gameId: string;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
