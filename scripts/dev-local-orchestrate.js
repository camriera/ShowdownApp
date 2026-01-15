#!/usr/bin/env node

/**
 * Orchestrate local dev startup in proper order:
 * 1. Netlify Functions server (background)
 * 2. Expo (foreground, shows QR code and CLI output)
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const FUNCTIONS_PORT = 9000;
const HEALTH_CHECK_TIMEOUT = 60000;
const HEALTH_CHECK_INTERVAL = 500;

async function waitForFunctions() {
  console.log(`⏳ Waiting for Netlify Functions on port ${FUNCTIONS_PORT}...`);
  const startTime = Date.now();

  while (Date.now() - startTime < HEALTH_CHECK_TIMEOUT) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${FUNCTIONS_PORT}/api/cards-search`, () => {
          resolve();
        });
        req.on('error', reject);
        req.setTimeout(1000);
      });

      console.log(`✅ Netlify Functions ready!\n`);
      return;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      process.stderr.write(`  Waiting... (${elapsed}ms)\r`);
      await new Promise(resolve => setTimeout(resolve, HEALTH_CHECK_INTERVAL));
    }
  }

  throw new Error(`Netlify Functions not ready after ${HEALTH_CHECK_TIMEOUT}ms`);
}

function spawnProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      env: process.env,
      ...options,
    });

    proc.on('error', reject);

    if (options.background) {
      resolve(proc);
    } else {
      proc.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    }
  });
}

async function main() {
  try {
    // Step 1: Start Netlify Functions (background)
    console.log('🚀 Starting Netlify Functions...\n');
    await spawnProcess(
      'netlify',
      ['dev', '--offline', '--no-open', '--port', '9000'],
      { background: true }
    );

    // Step 2: Wait for functions to be ready
    await waitForFunctions();

    // Step 3: Start Expo (foreground - shows QR code and all output)
    console.log('🚀 Starting Expo...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    await spawnProcess(
      'npm',
      ['start'],
      { cwd: path.join(__dirname, '../mobile') }
    );

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
