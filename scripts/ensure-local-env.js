#!/usr/bin/env node

/**
 * Ensure mobile/.env is set up for local development
 * This is run before `npm run dev` to make sure Expo uses localhost
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '../mobile/.env');
const LOCALHOST_URL = 'http://localhost:9000/.netlify/functions';

try {
  const envContent = `EXPO_PUBLIC_API_URL=${LOCALHOST_URL}\n`;
  fs.writeFileSync(ENV_FILE, envContent);
  console.log(`✅ Set up mobile/.env for local development`);
  console.log(`   EXPO_PUBLIC_API_URL=${LOCALHOST_URL}`);
} catch (error) {
  console.error('❌ Failed to set up mobile/.env:', error.message);
  process.exit(1);
}
