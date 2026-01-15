#!/usr/bin/env node

/**
 * Ensure mobile/.env is set up for local development
 * This is run before `npm run dev` to make sure Expo uses localhost
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const ENV_FILE = path.join(__dirname, '../mobile/.env');
const LOCALHOST_URL = 'http://localhost:9000/api';

function isWsl() {
  if (process.env.WSL_INTEROP || process.env.WSL_DISTRO_NAME) {
    return true;
  }

  try {
    const version = fs.readFileSync('/proc/version', 'utf8');
    return version.toLowerCase().includes('microsoft');
  } catch (error) {
    return false;
  }
}

function getWslIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  Object.values(interfaces).forEach((entries) => {
    if (!entries) {
      return;
    }

    entries.forEach((entry) => {
      if (entry.family !== 'IPv4' || entry.internal) {
        return;
      }

      candidates.push(entry.address);
    });
  });

  const preferred = candidates.find((ip) => ip.startsWith('172.'))
    || candidates.find((ip) => ip.startsWith('192.168.'))
    || candidates.find((ip) => ip.startsWith('10.'));

  return preferred || candidates[0] || null;
}

function resolveApiUrl() {
  if (!isWsl()) {
    return LOCALHOST_URL;
  }

  const wslIp = getWslIp();
  if (!wslIp) {
    console.warn('⚠️  Could not detect WSL IP. Falling back to localhost.');
    return LOCALHOST_URL;
  }

  return `http://${wslIp}:9000/api`;
}

try {
  const apiUrl = resolveApiUrl();
  const envContent = `EXPO_PUBLIC_API_URL=${apiUrl}\n`;
  fs.writeFileSync(ENV_FILE, envContent);
  console.log(`✅ Set up mobile/.env for local development`);
  console.log(`   EXPO_PUBLIC_API_URL=${apiUrl}`);
} catch (error) {
  console.error('❌ Failed to set up mobile/.env:', error.message);
  process.exit(1);
}
