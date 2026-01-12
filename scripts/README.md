# Database Population Script

This script pre-populates your PostgreSQL database with popular MLB player cards using the showdownbot.com API.

## Prerequisites

1. **Database Setup**: Ensure your PostgreSQL database is running and the schema is migrated:
   ```bash
   npm run db:migrate
   ```

2. **Environment Variable**: Ensure `DATABASE_URL` is set in your `.env` file:
   ```bash
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

3. **Dependencies**: Install Node.js dependencies:
   ```bash
   npm install
   ```

## Usage

### Run the Population Script

```bash
npm run db:populate
```

This will:
1. Connect to your PostgreSQL database
2. Fetch card data and images from showdownbot.com for 20 popular players
3. Save each card to the `player_cards` table
4. Skip cards that already exist in the database
5. Display a summary of success/failure/skipped cards

### Example Output

```
============================================================
  MLB Showdown Card Database Population
============================================================

Generating 20 cards...

[Mike Trout 2021]
  → Calling showdownbot.com API...
    ✓ Card data received
  → Generating image...
    ✓ Image URL: https://www.showdownbot.com/static/output/Mike_Trout_2021.png
    ✓ Saved to database

[Aaron Judge 2022]
  → Calling showdownbot.com API...
    ✓ Card data received
  → Generating image...
    ✓ Image URL: https://www.showdownbot.com/static/output/Aaron_Judge_2022.png
    ✓ Saved to database

...

============================================================
  Summary
============================================================
  ✓ Success: 18
  ⊘ Skipped: 2
  ✗ Failed:  0
  Total:    20
============================================================
```

## Players Included

The script populates the database with these players:

### Modern Stars (2020-2023)
- Mike Trout (2021)
- Shohei Ohtani - Hitter (2023)
- Shohei Ohtani - Pitcher (2023)
- Aaron Judge (2022)
- Ronald Acuna Jr. (2023)
- Mookie Betts (2020)
- Fernando Tatis Jr. (2021)
- Juan Soto (2022)
- Bryce Harper (2021)
- Freddie Freeman (2020)

### Top Pitchers
- Jacob deGrom (2019)
- Gerrit Cole (2023)
- Sandy Alcantara (2022)
- Spencer Strider (2023)
- Corbin Burnes (2021)

### Legends
- Babe Ruth (1923)
- Barry Bonds (2004)
- Ted Williams (1941)
- Ken Griffey Jr. (1997)
- Derek Jeter (2009)

## Customizing the Player List

To add or modify players, edit `/home/cam/ws/ShowdownApp/scripts/populateCards.js`:

```javascript
const POPULAR_PLAYERS = [
  { name: 'Mike Trout', year: '2021' },
  { name: 'Your Player', year: 'YEAR' },
  // Add more players here
];
```

### Special Player Names

For two-way players or specific scenarios:
- `'Shohei Ohtani (PITCHER)'` - Forces pitcher stats
- `'Shohei Ohtani (HITTER)'` - Forces hitter stats
- `'Player Name (TEAM)'` - Uses stats from specific team only

## Troubleshooting

### Database Connection Error

```
ERROR: DATABASE_URL environment variable not set
```

**Solution**: Ensure your `.env` file contains:
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

### API Rate Limiting

The script includes a 1-second delay between requests to avoid rate limiting. If you encounter issues:
1. Increase the delay in `populateCards.js` (line with `setTimeout`)
2. Run the script in smaller batches

### Card Generation Failures

If specific players fail:
- Check the player name spelling matches Baseball Reference
- Verify the year has available statistics
- Some very old players may not have complete data

### Image Generation Failures

Images may fail while card data succeeds. This is normal for:
- Very old players without photos
- Players with special characters in names
- Temporary API issues

The app will gracefully fall back to placeholder images for cards without `imageUrl`.

## Database Schema

Cards are stored in the `player_cards` table:

```sql
CREATE TABLE player_cards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  year VARCHAR(10) NOT NULL,
  card_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, year)
);
```

The `card_data` JSONB column contains the complete card structure including:
- Basic info (name, year, team, playerType)
- Stats (command, outs, speed, ip, points)
- Chart data (range and result mappings)
- Image URL (if generated successfully)
- Icons and positions

## Integration with Mobile App

Once populated, these cards are automatically available:

1. **Game Screen**: Loads real players instead of hardcoded sample data
2. **Roster Builder**: Search returns cached players instantly
3. **Card View**: Displays real card images from showdownbot.com

The app gracefully falls back to sample data if the database is empty.
