import { generateCard, searchCards, generateMultipleCards } from '../../api/cardApi';
import { ApiError } from '../../api/types';

global.fetch = jest.fn();

describe('Card API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCard', () => {
    it('should successfully generate a card', async () => {
      const mockCard = {
        id: 'test-1',
        name: 'Test Player',
        year: '2024',
        team: 'Test Team',
        playerType: 'Hitter' as const,
        command: 10,
        outs: 5,
        points: 200,
        hand: 'R' as const,
        positions: { 'OF': 2 },
        speed: 15,
        chart: [{ range: [1, 20], result: 'HR' as const }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          card: mockCard,
          cached: false,
          generatedAt: new Date().toISOString(),
        }),
      });

      const result = await generateCard('Test Player', '2024');
      
      expect(result).toEqual(mockCard);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cards/generate'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test Player'),
        })
      );
    });

    it('should throw ApiError on failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => JSON.stringify({ error: 'Player not found' }),
      });

      await expect(generateCard('Unknown Player', '2024')).rejects.toThrow(ApiError);
    });
  });

  describe('searchCards', () => {
    it('should search cards with query parameters', async () => {
      const mockCards = [
        {
          id: 'test-1',
          name: 'Test Player 1',
          year: '2024',
          team: 'Test Team',
          playerType: 'Hitter' as const,
          command: 10,
          outs: 5,
          points: 200,
          hand: 'R' as const,
          positions: { 'OF': 2 },
          speed: 15,
          chart: [{ range: [1, 20], result: 'HR' as const }],
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cards: mockCards,
          count: 1,
          query: { name: 'Test' },
        }),
      });

      const result = await searchCards({ name: 'Test', limit: 10 });
      
      expect(result).toEqual(mockCards);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('name=Test'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should handle empty results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cards: [],
          count: 0,
          query: {},
        }),
      });

      const result = await searchCards({});
      
      expect(result).toEqual([]);
    });
  });

  describe('generateMultipleCards', () => {
    it('should generate multiple cards successfully', async () => {
      const mockCard1 = {
        id: 'test-1',
        name: 'Player 1',
        year: '2024',
        team: 'Test Team',
        playerType: 'Hitter' as const,
        command: 10,
        outs: 5,
        points: 200,
        hand: 'R' as const,
        positions: { 'OF': 2 },
        speed: 15,
        chart: [{ range: [1, 20], result: 'HR' as const }],
      };

      const mockCard2 = { ...mockCard1, id: 'test-2', name: 'Player 2' };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ card: mockCard1, cached: false, generatedAt: new Date().toISOString() }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ card: mockCard2, cached: false, generatedAt: new Date().toISOString() }),
        });

      const result = await generateMultipleCards([
        { name: 'Player 1', year: '2024' },
        { name: 'Player 2', year: '2024' },
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Player 1');
      expect(result[1].name).toBe('Player 2');
    });

    it('should handle partial failures', async () => {
      const mockCard = {
        id: 'test-1',
        name: 'Player 1',
        year: '2024',
        team: 'Test Team',
        playerType: 'Hitter' as const,
        command: 10,
        outs: 5,
        points: 200,
        hand: 'R' as const,
        positions: { 'OF': 2 },
        speed: 15,
        chart: [{ range: [1, 20], result: 'HR' as const }],
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ card: mockCard, cached: false, generatedAt: new Date().toISOString() }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          text: async () => JSON.stringify({ error: 'Player not found' }),
        });

      const result = await generateMultipleCards([
        { name: 'Player 1', year: '2024' },
        { name: 'Unknown', year: '2024' },
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Player 1');
    });

    it('should throw if all cards fail', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => JSON.stringify({ error: 'Player not found' }),
      });

      await expect(
        generateMultipleCards([
          { name: 'Unknown 1', year: '2024' },
          { name: 'Unknown 2', year: '2024' },
        ])
      ).rejects.toThrow(ApiError);
    });
  });
});
