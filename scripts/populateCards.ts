import { config } from 'dotenv';
import { Pool } from 'pg';
import { v2 as cloudinary } from 'cloudinary';

config();

// Verify Cloudinary URL is set
if (!process.env.CLOUDINARY_URL) {
  console.error('ERROR: CLOUDINARY_URL environment variable not set');
  process.exit(1);
}

// Parse CLOUDINARY_URL (format: cloudinary://api_key:api_secret@cloud_name)
const cloudinaryUrl = new URL(process.env.CLOUDINARY_URL);
const apiKey = cloudinaryUrl.username;
const apiSecret = cloudinaryUrl.password;
const cloudName = cloudinaryUrl.host;

if (!apiKey || !apiSecret || !cloudName) {
  console.error('ERROR: Invalid CLOUDINARY_URL format. Expected: cloudinary://api_key:api_secret@cloud_name');
  process.exit(1);
}

// Configure Cloudinary with parsed credentials
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

const POPULAR_PLAYERS = [
  { name: 'Mike Trout', year: '2021' },
  { name: 'Shohei Ohtani (HITTER)', year: '2023' },
  { name: 'Shohei Ohtani (PITCHER)', year: '2023' },
  { name: 'Aaron Judge', year: '2022' },
  { name: 'Ronald Acuna Jr.', year: '2023' },
  { name: 'Mookie Betts', year: '2020' },
  { name: 'Fernando Tatis Jr.', year: '2021' },
  { name: 'Juan Soto', year: '2022' },
  { name: 'Bryce Harper', year: '2021' },
  { name: 'Freddie Freeman', year: '2020' },
  { name: 'Jacob deGrom', year: '2019' },
  { name: 'Gerrit Cole', year: '2023' },
  { name: 'Sandy Alcantara', year: '2022' },
  { name: 'Spencer Strider', year: '2023' },
  { name: 'Corbin Burnes', year: '2021' },
  { name: 'Babe Ruth', year: '1923' },
  { name: 'Barry Bonds', year: '2004' },
  { name: 'Ted Williams', year: '1941' },
  { name: 'Ken Griffey Jr.', year: '1997' },
  { name: 'Derek Jeter', year: '2009' },
];

const SHOWDOWN_BOT_API = 'https://www.showdownbot.com/api/build_custom_card';
const SHOWDOWN_BOT_IMAGE_API = 'https://www.showdownbot.com/api/build_image_for_card';
const REQUEST_TIMEOUT_MS = 60000;

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

async function uploadToCloudinary(imageUrl: string, playerName: string): Promise<string | undefined> {
  try {
    console.log(`  → Uploading to Cloudinary...`);

    // Download the image from showdownbot
    const imageResponse = await fetchWithTimeout(
      imageUrl,
      { method: 'GET' },
      REQUEST_TIMEOUT_MS
    );

    if (!imageResponse.ok) {
      console.error(`    ✗ Failed to download image: ${imageResponse.status}`);
      return undefined;
    }

    // Get the image buffer
    const imageBuffer = await imageResponse.arrayBuffer();

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'showdown-cards',
          public_id: `${playerName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          overwrite: false,
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(Buffer.from(imageBuffer));
    });

    if (result?.secure_url) {
      console.log(`    ✓ Cloudinary URL: ${result.secure_url}`);
      return result.secure_url;
    }

    console.warn('    ⚠ No URL returned from Cloudinary');
    return undefined;
  } catch (error) {
    console.error(`    ✗ Cloudinary upload failed:`, error instanceof Error ? error.message : error);
    return undefined;
  }
}

async function generateCardImage(cardData: any, playerName: string): Promise<string | undefined> {
  try {
    console.log(`  → Generating image...`);

    const response = await fetchWithTimeout(
      SHOWDOWN_BOT_IMAGE_API,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'User-Agent': 'ShowdownApp/1.0',
        },
        body: JSON.stringify({ card: cardData }),
      },
      REQUEST_TIMEOUT_MS
    );

    if (!response.ok) {
      console.error(`    ✗ Image generation API returned ${response.status}`);
      return undefined;
    }

    const imageResponse = await response.json();

    if (imageResponse.card?.image?.output_file_name) {
      const folder = imageResponse.card.image.output_folder_path || 'static/output';
      const encodedFileName = encodeURIComponent(imageResponse.card.image.output_file_name);
      const showdownBotImageUrl = `https://www.showdownbot.com/${folder}/${encodedFileName}`;
      console.log(`    ✓ Showdown Bot image generated`);

      // Upload to Cloudinary instead of using the temporary URL
      const cloudinaryUrl = await uploadToCloudinary(showdownBotImageUrl, playerName);
      return cloudinaryUrl;
    }

    console.warn('    ⚠ No image file name in response');
    return undefined;
  } catch (error) {
    console.error(`    ✗ Image generation failed:`, error instanceof Error ? error.message : error);
    return undefined;
  }
}

function transformChart(chartResults: Record<string, string>): any[] {
  const entries: any[] = [];
  
  const sortedRolls = Object.keys(chartResults)
    .map(k => parseInt(k, 10))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);
  
  if (sortedRolls.length === 0) return entries;
  
  let rangeStart = sortedRolls[0];
  let currentResult = chartResults[rangeStart.toString()].toUpperCase();
  
  for (let i = 1; i <= sortedRolls.length; i++) {
    const roll = sortedRolls[i];
    const result = roll ? chartResults[roll.toString()]?.toUpperCase() : null;
    
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

function transformToPlayerCard(response: any, imageUrl?: string): any {
  const { card } = response;
  
  const playerType = 
    card.player_type === 'PITCHER' || card.player_type === 'Pitcher' ? 'Pitcher' : 'Hitter';
  
  const id = `${card.bref_id || card.name.toLowerCase().replace(/\s+/g, '-')}-${card.year}`;
  
  const speed = typeof card.speed === 'object' ? card.speed.speed : card.speed;
  
  return {
    id,
    name: card.name,
    year: card.year,
    team: card.team || 'Unknown',
    playerType,
    command: card.chart.command,
    outs: card.chart.outs_full,
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

async function generateCard(name: string, year: string): Promise<any> {
  try {
    console.log(`\n[${name} ${year}]`);
    console.log(`  → Calling showdownbot.com API...`);
    
    const requestBody = {
      name,
      year,
      set: 'EXPANDED',
      disable_realtime: true,
      show_image: true,
    };
    
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
    
    const data = await response.json();
    
    if (data.error) {
      const userMessage = data.error_for_user || data.error;
      throw new Error(userMessage);
    }
    
    if (!data.card) {
      throw new Error('Invalid response: no card data returned');
    }
    
    console.log(`    ✓ Card data received`);

    const imageUrl = await generateCardImage(data.card, name);

    return transformToPlayerCard(data, imageUrl);
    
  } catch (error) {
    console.error(`    ✗ Failed:`, error instanceof Error ? error.message : error);
    throw error;
  }
}

async function populateDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  console.log('='.repeat(60));
  console.log('  MLB Showdown Card Database Population');
  console.log('='.repeat(60));
  console.log(`\nGenerating ${POPULAR_PLAYERS.length} cards...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const { name, year } of POPULAR_PLAYERS) {
    try {
      const card = await generateCard(name, year);

      await pool.query(
        `INSERT INTO player_cards (name, year, card_data) 
         VALUES ($1, $2, $3)
         ON CONFLICT (name, year) DO UPDATE SET card_data = $3, updated_at = NOW()`,
        [card.name, card.year, card]
      );

      console.log(`    ✓ Saved to database`);
      successCount++;

      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`    ✗ Failed to process ${name} (${year}):`, error instanceof Error ? error.message : error);
      failCount++;
    }
  }

  await pool.end();

  console.log('\n' + '='.repeat(60));
  console.log('  Summary');
  console.log('='.repeat(60));
  console.log(`  ✓ Success: ${successCount}`);
  console.log(`  ✗ Failed:  ${failCount}`);
  console.log(`  Total:    ${POPULAR_PLAYERS.length}`);
  console.log('='.repeat(60) + '\n');
}

populateDatabase().catch(console.error);
