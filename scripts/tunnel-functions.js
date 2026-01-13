#!/usr/bin/env node

/**
 * Tunnel Functions Script
 *
 * Sets up an ngrok tunnel to expose Netlify Functions running on localhost:9000
 * to the public internet, allowing phone testing outside your local network.
 *
 * Usage:
 *   npm run tunnel:functions
 *   npm run dev:tunnel  (starts everything: mobile, netlify dev, and tunnel together)
 *
 * Requirements:
 *   - NGROK_AUTHTOKEN environment variable (from https://dashboard.ngrok.com/)
 *   - netlify dev running on port 9000 (started automatically by dev:tunnel)
 */

const path = require('path');
const fs = require('fs');
const http = require('http');
const ngrok = require('@ngrok/ngrok');

// Load environment variables from .env files
require('dotenv').config(); // Load root .env file
require('dotenv').config({ path: path.join(__dirname, '../mobile/.env') }); // Load mobile/.env file

const PORT = 9000;
const ENV_FILE = path.join(__dirname, '../mobile/.env.tunnel');
const HEALTH_CHECK_TIMEOUT = 30000; // 30 seconds
const HEALTH_CHECK_INTERVAL = 500; // Check every 500ms

async function waitForPort() {
  console.log(`⏳ Waiting for port ${PORT} to be ready...`);
  const startTime = Date.now();

  while (Date.now() - startTime < HEALTH_CHECK_TIMEOUT) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${PORT}/.netlify/functions/cards-generate`, () => {
          // Any response is fine - we just need the port to be listening
          resolve();
        });
        req.on('error', reject);
        req.setTimeout(1000);
      });

      console.log(`✅ Port ${PORT} is ready!\n`);
      return;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      process.stderr.write(`  Checking port... (${elapsed}ms)\r`);
      // Port not ready yet, wait and try again
      await new Promise(resolve => setTimeout(resolve, HEALTH_CHECK_INTERVAL));
    }
  }

  console.error(`\n⚠️  Port ${PORT} did not respond after ${HEALTH_CHECK_TIMEOUT}ms`);
  console.log('\n💡 Make sure netlify dev is running on port 9000:');
  console.log('   netlify dev --offline --no-open --port 9000\n');
  throw new Error(`Port ${PORT} did not become ready within ${HEALTH_CHECK_TIMEOUT}ms`);
}

async function startTunnel() {
  let listener = null;

  try {
    console.log(`🔌 Starting ngrok tunnel for port ${PORT}...`);

    // Validate NGROK_AUTHTOKEN is set before proceeding
    if (!process.env.NGROK_AUTHTOKEN) {
      throw new Error(
        'NGROK_AUTHTOKEN environment variable not set'
      );
    }

    // Wait for the Netlify dev server to be ready before starting tunnel
    await waitForPort();

    listener = await ngrok.forward({
      addr: `localhost:${PORT}`,
      authtoken_from_env: true,
    });

    const url = listener.url();
    const functionsUrl = `${url}/.netlify/functions`;

    console.log('\n✅ Tunnel established!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 Public URL: ${url}`);
    console.log(`🔧 Functions: ${functionsUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    updateMobileEnv(functionsUrl);

    console.log('💡 Tunnel will stay open. Press Ctrl+C to stop.\n');
    console.log('🧪 Test with:');
    console.log(`   curl ${functionsUrl}/cards-generate -X POST -H "Content-Type: application/json" -d '{"name":"Mike Trout","year":"2021"}'\n`);

    // Keep stdin open to keep the process alive
    process.stdin.resume();

    // Handle graceful shutdown on signals
    const handleShutdown = async () => {
      console.log('\n\n🛑 Stopping tunnel...');
      try {
        if (listener) {
          await listener.close();
        }
        console.log('✅ Tunnel closed');
      } catch (err) {
        console.error('⚠️  Error closing tunnel:', err.message);
      }
      process.exit(0);
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);

    // Keep the process running indefinitely until a signal is received
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Failed to start tunnel:', error.message);

    if (error.message.includes('authtoken')) {
      console.log('\n💡 You need to set up ngrok:');
      console.log('   1. Sign up at https://ngrok.com');
      console.log('   2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken');
      console.log('   3. Set environment variable:');
      console.log('      export NGROK_AUTHTOKEN=your_token_here');
      console.log('   4. Or add to root .env file:');
      console.log('      NGROK_AUTHTOKEN=your_token_here\n');
    }

    // Clean up listener if it was created
    if (listener) {
      try {
        await listener.close();
      } catch (err) {
        // Ignore cleanup errors
      }
    }

    process.exit(1);
  }
}

function updateMobileEnv(functionsUrl) {
  try {
    let envContent = '';

    if (fs.existsSync(ENV_FILE)) {
      envContent = fs.readFileSync(ENV_FILE, 'utf8');
    }

    const lines = envContent.split('\n').filter(line => {
      return !line.startsWith('EXPO_PUBLIC_API_URL');
    });

    lines.push(`EXPO_PUBLIC_API_URL=${functionsUrl}`);

    fs.writeFileSync(ENV_FILE, lines.join('\n'));

    console.log(`📝 Updated mobile/.env.tunnel`);
    console.log(`   EXPO_PUBLIC_API_URL=${functionsUrl}`);
    console.log('⚠️  IMPORTANT: Restart Expo to apply changes!');
    console.log('   Press "r" in the Expo terminal to reload\n');
  } catch (error) {
    console.warn('⚠️  Could not update mobile/.env.tunnel:', error.message);
    console.log(`\n   Manually add to mobile/.env.tunnel:`);
    console.log(`   EXPO_PUBLIC_API_URL=${functionsUrl}\n`);
  }
}

startTunnel();
