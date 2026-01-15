#!/usr/bin/env node

/**
 * Orchestrate dev:tunnel startup in proper order:
 * 1. Netlify Functions server (background)
 * 2. ngrok tunnel (background, waits for functions)
 * 3. Expo (foreground, shows QR code)
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const FUNCTIONS_PORT = 9000;
const HEALTH_CHECK_TIMEOUT = 60000;
const HEALTH_CHECK_INTERVAL = 500;
const ENV_TUNNEL_FILE = path.join(__dirname, '../mobile/.env.tunnel');
const ENV_MOBILE_FILE = path.join(__dirname, '../mobile/.env');

async function waitForFunctions() {
  console.log(`⏳ Waiting for Netlify Functions on port ${FUNCTIONS_PORT}...`);
  const startTime = Date.now();

  while (Date.now() - startTime < HEALTH_CHECK_TIMEOUT) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${FUNCTIONS_PORT}/api/cards-generate`, () => {
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

async function waitForTunnelFile() {
  console.log('⏳ Waiting for tunnel URL to be written to mobile/.env.tunnel...');
  const startTime = Date.now();
  const timeout = 30000;

  while (Date.now() - startTime < timeout) {
    try {
      if (fs.existsSync(ENV_TUNNEL_FILE)) {
        const content = fs.readFileSync(ENV_TUNNEL_FILE, 'utf8');
        if (content.includes('EXPO_PUBLIC_API_URL=https://')) {
          console.log('✅ Tunnel ready!\n');

          // Extract the tunnel URL from .env.tunnel
          const match = content.match(/EXPO_PUBLIC_API_URL=(.+)/);
          if (match && match[1]) {
            const tunnelUrl = match[1].trim();
            process.env.EXPO_PUBLIC_API_URL = tunnelUrl;
            console.log(`📡 EXPO_PUBLIC_API_URL=${tunnelUrl}`);

            // Write tunnel URL to mobile/.env (Expo will read this)
            fs.writeFileSync(ENV_MOBILE_FILE, `EXPO_PUBLIC_API_URL=${tunnelUrl}\n`);
            console.log(`📝 Updated mobile/.env with tunnel URL\n`);
          }

          return;
        }
      }
    } catch (error) {
      // File might not exist yet
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error('Tunnel URL not written within timeout');
}


function spawnProcess(command, args, label, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      // Inherit parent environment to get EXPO_PUBLIC_API_URL and other vars
      env: process.env,
      shell: process.platform === 'win32', // Only use shell on Windows
      ...options,
    });

    proc.on('error', reject);

    if (options.background) {
      // For background processes, resolve immediately
      resolve(proc);
    } else {
      // For foreground processes, wait for exit
      proc.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${label} exited with code ${code}`));
        }
      });
    }
  });
}

async function main() {
  try {
    // Step 1: Start Netlify Functions (background)
    console.log('🚀 Starting Netlify Functions...\n');
    const functionsProc = spawnProcess(
      'netlify',
      ['dev', '--offline', '--no-open', '--port', '9000'],
      'Netlify Functions',
      { background: true }
    );

    // Step 2: Wait for functions to be ready
    await waitForFunctions();

    // Step 3: Start tunnel (background)
    console.log('🚀 Starting ngrok tunnel...\n');
    const tunnelProc = spawnProcess(
      'npm',
      ['run', 'tunnel:functions'],
      'Tunnel',
      { background: true }
    );

    // Step 4: Wait for tunnel to write URL
    await waitForTunnelFile();

    // Step 5: Start Expo (foreground)
    console.log('🚀 Starting Expo...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    await spawnProcess(
      'npm',
      ['run', 'start:tunnel'],
      'Expo',
      { cwd: path.join(__dirname, '../mobile') }
    );

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
