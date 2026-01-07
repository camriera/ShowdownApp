import { GameState } from '../models/Game';
import { apiFetch } from './client';
import { API_ENDPOINTS } from './config';
import {
  CreateGameRequest,
  CreateGameResponse,
  ApiError,
} from './types';

export async function createGame(
  gameState: GameState
): Promise<string> {
  try {
    const request: CreateGameRequest = {
      homeTeam: gameState.homeTeam,
      awayTeam: gameState.awayTeam,
    };

    const response = await apiFetch<CreateGameResponse>(
      API_ENDPOINTS.GAMES.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return response.gameId;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to create game',
      0,
      API_ENDPOINTS.GAMES.CREATE
    );
  }
}

export async function updateGame(
  gameId: string,
  gameState: GameState
): Promise<void> {
  try {
    await apiFetch(
      API_ENDPOINTS.GAMES.UPDATE,
      {
        method: 'PUT',
        body: JSON.stringify({ gameId, gameState }),
      }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Failed to update game ${gameId}`,
      0,
      API_ENDPOINTS.GAMES.UPDATE
    );
  }
}

export async function getGame(gameId: string): Promise<GameState> {
  try {
    const response = await apiFetch<{ game: GameState }>(
      `${API_ENDPOINTS.GAMES.GET}?gameId=${gameId}`,
      {
        method: 'GET',
      }
    );

    return response.game;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Failed to load game ${gameId}`,
      0,
      API_ENDPOINTS.GAMES.GET
    );
  }
}
