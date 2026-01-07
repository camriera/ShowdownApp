import { PlayerCard } from '../models/Card';
import { apiFetch } from './client';
import { API_ENDPOINTS } from './config';
import {
  GenerateCardRequest,
  GenerateCardResponse,
  SearchCardsQuery,
  SearchCardsResponse,
  ApiError,
} from './types';

export async function generateCard(
  name: string,
  year: string,
  setVersion: 'CLASSIC' | 'EXPANDED' | string = 'EXPANDED'
): Promise<PlayerCard> {
  try {
    const request: GenerateCardRequest = { name, year, setVersion };
    
    const response = await apiFetch<GenerateCardResponse>(
      API_ENDPOINTS.CARDS.GENERATE,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return response.card;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Failed to generate card for ${name} (${year})`,
      0,
      API_ENDPOINTS.CARDS.GENERATE
    );
  }
}

export async function searchCards(
  query: SearchCardsQuery
): Promise<PlayerCard[]> {
  try {
    const params = new URLSearchParams();
    
    if (query.name) params.append('name', query.name);
    if (query.year) params.append('year', query.year);
    if (query.playerType) params.append('playerType', query.playerType);
    if (query.minPoints !== undefined) params.append('minPoints', query.minPoints.toString());
    if (query.maxPoints !== undefined) params.append('maxPoints', query.maxPoints.toString());
    if (query.limit !== undefined) params.append('limit', query.limit.toString());

    const url = `${API_ENDPOINTS.CARDS.SEARCH}?${params.toString()}`;
    
    const response = await apiFetch<SearchCardsResponse>(url, {
      method: 'GET',
    });

    return response.cards;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to search cards',
      0,
      API_ENDPOINTS.CARDS.SEARCH
    );
  }
}

export async function generateMultipleCards(
  players: Array<{ name: string; year: string }>
): Promise<PlayerCard[]> {
  const results = await Promise.allSettled(
    players.map(({ name, year }) => generateCard(name, year))
  );

  const cards: PlayerCard[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      cards.push(result.value);
    } else {
      errors.push(`${players[index].name} (${players[index].year}): ${result.reason.message}`);
    }
  });

  if (errors.length > 0 && cards.length === 0) {
    throw new ApiError(
      `Failed to generate all cards:\n${errors.join('\n')}`,
      0,
      API_ENDPOINTS.CARDS.GENERATE
    );
  }

  return cards;
}
