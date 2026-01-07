import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { getPool } from '../utils/db';

interface CardGenerationRequest {
  name: string;
  year: string;
  setVersion?: 'CLASSIC' | 'EXPANDED' | string;
}

type ChartResult = 'PU' | 'SO' | 'GB' | 'FB' | 'BB' | '1B' | '1B+' | '2B' | '3B' | 'HR';

interface ChartEntry {
  range: [number, number];
  result: ChartResult;
}

interface PlayerCard {
  id: string;
  name: string;
  year: string;
  team: string;
  playerType: 'Pitcher' | 'Hitter';
  command: number;
  outs: number;
  chart: ChartEntry[];
  positions?: Record<string, number>;
  speed?: number;
  ip?: number;
  points: number;
  hand: 'L' | 'R' | 'S';
  icons?: string[];
  imageUrl?: string;
}

interface ShowdownBotChartResult {
  result: string;
  count: number;
}

interface ShowdownBotResponse {
  card: {
    name: string;
    year: string;
    set: string;
    team: string;
    player_type: 'HITTER' | 'PITCHER' | 'Hitter' | 'Pitcher' | null;
    command: number;
    outs: number;
    speed: { speed: number } | number;
    ip: number | null;
    points: number;
    hand: 'L' | 'R' | 'S' | null;
    chart: {
      results: Record<string, string>;
    };
    positions_and_defense: Record<string, number>;
    icons: string[];
    bref_id: string;
    image: {
      output_folder_path?: string;
      output_file_name?: string;
    };
  };
  error: string | null;
  error_for_user: string | null;
}

const SHOWDOWN_BOT_API = 'https://www.showdownbot.com/api/build_custom_card';
const SHOWDOWN_BOT_IMAGE_API = 'https://www.showdownbot.com/api/build_image_for_card';
const SHOWDOWN_BOT_BASE_URL = 'https://www.showdownbot.com';
const REQUEST_TIMEOUT_MS = 45000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Netlify Function: Generate MLB Showdown Player Card
 * 
 * POST /api/cards/generate
 * 
 * Request Body:
 * {
 *   "name": "Mike Trout",
 *   "year": "2021",
 *   "setVersion": "EXPANDED" (optional, defaults to EXPANDED)
 * }
 * 
 * Response:
 * {
 *   "card": { ... player card data ... },
 *   "cached": boolean,
 *   "generatedAt": ISO timestamp
 * }
 */
export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const body: CardGenerationRequest = JSON.parse(event.body || '{}');
    const { name, year, setVersion = 'EXPANDED' } = body;

    // Validate input
    if (!name || !year) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name and year are required' }),
      };
    }

    // Check cache first
    const cachedCard = await getCachedCard(name, year);
    if (cachedCard) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          card: cachedCard,
          cached: true,
          generatedAt: new Date().toISOString(),
        }),
      };
    }

    // Generate new card using mlb_showdown_card_bot logic
    const generatedCard = await generateCard(name, year, setVersion);

    // Cache the generated card
    await cacheCard(name, year, generatedCard);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        card: generatedCard,
        cached: false,
        generatedAt: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Card generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      }),
    };
  }
};

/**
 * Check if card exists in database cache
 */
async function getCachedCard(name: string, year: string): Promise<PlayerCard | null> {
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT card_data FROM player_cards WHERE LOWER(name) = LOWER($1) AND year = $2',
      [name, year]
    );

    if (result.rows.length > 0) {
      return result.rows[0].card_data;
    }

    return null;
  } catch (error) {
    console.error('Cache lookup error:', error);
    return null; // Don't fail if cache lookup fails
  }
}

/**
 * Save generated card to database cache
 */
async function cacheCard(name: string, year: string, card: PlayerCard): Promise<void> {
  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO player_cards (name, year, card_data) 
       VALUES ($1, $2, $3)
       ON CONFLICT (name, year) DO UPDATE SET card_data = $3, updated_at = NOW()`,
      [name, year, card]
    );
  } catch (error) {
    console.error('Cache save error:', error);
    // Don't throw - caching failure shouldn't fail the request
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Transform showdownbot.com chart format to our app's ChartEntry[] format
 * 
 * showdownbot returns: { results: {"1":"SO", "2":"SO", "3":"GB", ...} }
 * We need: [{ range: [1, 2], result: "SO" }, { range: [3, 3], result: "GB" }, ...]
 */
function transformChart(chartResults: Record<string, string>): ChartEntry[] {
  const entries: ChartEntry[] = [];
  
  const sortedRolls = Object.keys(chartResults)
    .map(k => parseInt(k, 10))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);
  
  if (sortedRolls.length === 0) return entries;
  
  let rangeStart = sortedRolls[0];
  let currentResult = chartResults[rangeStart.toString()].toUpperCase() as ChartResult;
  
  for (let i = 1; i <= sortedRolls.length; i++) {
    const roll = sortedRolls[i];
    const result = roll ? chartResults[roll.toString()]?.toUpperCase() as ChartResult : null;
    
    if (result !== currentResult || i === sortedRolls.length) {
      entries.push({
        range: [rangeStart, sortedRolls[i - 1]],
        result: currentResult,
      });
      if (roll) {
        rangeStart = roll;
        currentResult = result!;
      }
    }
  }
  
  return entries;
}

function buildImageUrl(image: { output_folder_path?: string; output_file_name?: string }): string | undefined {
  if (!image.output_file_name) return undefined;
  
  const folder = image.output_folder_path || 'static/output';
  const encodedFileName = encodeURIComponent(image.output_file_name);
  return `${SHOWDOWN_BOT_BASE_URL}/${folder}/${encodedFileName}`;
}

/**
 * Generate card image by calling the showdownbot.com image generation API.
 * This requires the full card data from the build_custom_card response.
 * 
 * @param cardData - The full card object from build_custom_card response
 * @returns The image URL if successful, undefined otherwise
 */
async function generateCardImage(cardData: ShowdownBotResponse['card']): Promise<string | undefined> {
  try {
    console.log(`Generating image for ${cardData.name} (${cardData.year})`);
    
    const response = await fetchWithTimeout(
      SHOWDOWN_BOT_IMAGE_API,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Referer': 'https://www.showdownbot.com/explore',
          'Origin': 'https://www.showdownbot.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({ card: cardData }),
      },
      REQUEST_TIMEOUT_MS
    );
    
    if (!response.ok) {
      console.error(`Image generation API returned ${response.status}`);
      return undefined;
    }
    
    const imageResponse = await response.json() as { 
      card?: { 
        image?: { 
          output_folder_path?: string; 
          output_file_name?: string; 
        } 
      } 
    };
    
    if (imageResponse.card?.image?.output_file_name) {
      const imageUrl = buildImageUrl(imageResponse.card.image);
      console.log(`Generated image URL: ${imageUrl}`);
      return imageUrl;
    }
    
    console.warn('Image generation response did not contain output_file_name');
    return undefined;
  } catch (error) {
    console.error('Image generation failed:', error instanceof Error ? error.message : error);
    return undefined;
  }
}

function transformToPlayerCard(response: ShowdownBotResponse, imageUrl?: string): PlayerCard {
  const { card } = response;
  
  const playerType: 'Pitcher' | 'Hitter' = 
    card.player_type === 'PITCHER' || card.player_type === 'Pitcher' ? 'Pitcher' : 'Hitter';
  
  const id = `${card.bref_id || card.name.toLowerCase().replace(/\s+/g, '-')}-${card.year}`;
  
  const speed = typeof card.speed === 'object' ? card.speed.speed : card.speed;
  
  return {
    id,
    name: card.name,
    year: card.year,
    team: card.team || 'Unknown',
    playerType,
    command: card.command,
    outs: card.outs,
    chart: transformChart(card.chart.results),
    positions: card.positions_and_defense || undefined,
    speed: speed || undefined,
    ip: card.ip || undefined,
    points: card.points,
    hand: card.hand || 'R',
    icons: card.icons?.length ? card.icons : undefined,
    imageUrl,
  };
}

async function generateCard(
  name: string,
  year: string,
  setVersion: string
): Promise<PlayerCard> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} for ${name} (${year})`);
        await sleep(RETRY_DELAY_MS * attempt);
      }
      
      const requestBody = {
        name,
        year,
        set: setVersion,
        disable_realtime: true,
        show_image: true,
      };
      
      console.log(`Calling showdownbot.com API for ${name} (${year})`);
      
      const response = await fetchWithTimeout(
        SHOWDOWN_BOT_API,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
        REQUEST_TIMEOUT_MS
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
      
      const data: ShowdownBotResponse = await response.json();
      
      if (data.error) {
        const userMessage = data.error_for_user || data.error;
        if (userMessage.toLowerCase().includes('not found') || 
            userMessage.toLowerCase().includes('no stats')) {
          throw new Error(`Player not found: ${name} (${year})`);
        }
        throw new Error(userMessage);
      }
      
      if (!data.card) {
        throw new Error('Invalid response: no card data returned');
      }
      
      const imageUrl = await generateCardImage(data.card);
      
      return transformToPlayerCard(data, imageUrl);
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (lastError.name === 'AbortError') {
        lastError = new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`);
      }
      
      if (lastError.message.includes('not found')) {
        throw lastError;
      }
      
      console.error(`Attempt ${attempt + 1} failed:`, lastError.message);
    }
  }
  
  throw lastError || new Error('Card generation failed after all retries');
}
