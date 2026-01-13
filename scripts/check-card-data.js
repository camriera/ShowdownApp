#!/usr/bin/env node

/**
 * Check Card Data Integrity
 *
 * Validates that all cards in the database have required fields.
 * Helps debug issues where specific players have incomplete data.
 */

require('dotenv').config();
const { Pool } = require('pg');

const requiredFields = [
  'id',
  'name',
  'year',
  'team',
  'playerType',
  'command',
  'outs',
  'chart',
  'points',
  'hand',
];

async function checkCards() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost')
      ? false
      : { rejectUnauthorized: false },
  });

  try {
    console.log('\n📋 Checking card data integrity...\n');

    const result = await pool.query(
      `SELECT name, year, card_data FROM player_cards ORDER BY name, year`
    );

    let issueCount = 0;
    let goodCount = 0;

    console.log(`Found ${result.rows.length} cards in database\n`);

    for (const row of result.rows) {
      const card = row.card_data;
      const issues = [];

      for (const field of requiredFields) {
        if (card[field] === undefined || card[field] === null) {
          issues.push(`Missing '${field}'`);
        }
      }

      if (issues.length > 0) {
        issueCount++;
        console.log(`❌ ${row.name} (${row.year})`);
        issues.forEach(issue => console.log(`   - ${issue}`));
      } else {
        goodCount++;
      }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✓ Good:    ${goodCount}`);
    console.log(`✗ Issues:  ${issueCount}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    if (issueCount > 0) {
      console.log('💡 To fix, re-run populate script for affected players:');
      console.log('   npm run db:populate\n');
    }

    process.exit(issueCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkCards();
