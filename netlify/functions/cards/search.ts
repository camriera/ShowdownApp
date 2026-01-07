import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { getPool } from '../utils/db';

interface SearchQuery {
  name?: string;
  year?: string;
  playerType?: 'Pitcher' | 'Hitter';
  minPoints?: number;
  maxPoints?: number;
  limit?: number;
}

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const pool = getPool();
    const params = event.queryStringParameters || {};
    const { name, year, playerType, minPoints, maxPoints, limit = '20' } = params;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (name) {
      paramCount++;
      conditions.push(`LOWER(name) LIKE LOWER($${paramCount})`);
      values.push(`%${name}%`);
    }

    if (year) {
      paramCount++;
      conditions.push(`year = $${paramCount}`);
      values.push(year);
    }

    if (playerType) {
      paramCount++;
      conditions.push(`card_data->>'playerType' = $${paramCount}`);
      values.push(playerType);
    }

    if (minPoints) {
      paramCount++;
      conditions.push(`(card_data->>'points')::int >= $${paramCount}`);
      values.push(parseInt(minPoints));
    }

    if (maxPoints) {
      paramCount++;
      conditions.push(`(card_data->>'points')::int <= $${paramCount}`);
      values.push(parseInt(maxPoints));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    paramCount++;
    const limitClause = `LIMIT $${paramCount}`;
    values.push(parseInt(limit));

    const query = `
      SELECT card_data, created_at 
      FROM player_cards 
      ${whereClause}
      ORDER BY created_at DESC
      ${limitClause}
    `;

    const result = await pool.query(query, values);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        cards: result.rows.map(row => row.card_data),
        count: result.rows.length,
        query: params,
      }),
    };
  } catch (error) {
    console.error('Card search error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Search failed',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      }),
    };
  }
};
