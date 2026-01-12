#!/usr/bin/env node

/**
 * Setup Verification Script
 * 
 * Verifies that all necessary components are installed and configured
 * for local development of the Showdown App.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function section(title) {
  log(`\n${'='.repeat(60)}`, colors.blue);
  log(`  ${title}`, colors.blue);
  log('='.repeat(60), colors.blue);
}

function checkFile(filePath, required = true) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    success(`Found: ${filePath}`);
    return true;
  } else {
    if (required) {
      error(`Missing: ${filePath}`);
    } else {
      warning(`Optional file missing: ${filePath}`);
    }
    return false;
  }
}

function checkCommand(command, name) {
  try {
    execSync(`which ${command}`, { stdio: 'pipe' });
    success(`${name} is installed`);
    return true;
  } catch (e) {
    error(`${name} is not installed (command: ${command})`);
    return false;
  }
}

function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  
  if (major >= 18) {
    success(`Node.js ${version} (>= 18 required)`);
    return true;
  } else {
    error(`Node.js ${version} is too old (>= 18 required)`);
    return false;
  }
}

function checkEnvVar(varName, file = '.env') {
  require('dotenv').config();
  const value = process.env[varName];
  
  if (value) {
    success(`${varName} is set in ${file}`);
    return true;
  } else {
    error(`${varName} is not set in ${file}`);
    return false;
  }
}

function checkDependencies(packageJsonPath, name) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const nodeModules = path.join(path.dirname(packageJsonPath), 'node_modules');
    
    if (fs.existsSync(nodeModules)) {
      success(`${name} dependencies installed`);
      return true;
    } else {
      error(`${name} dependencies not installed (run: npm install)`);
      return false;
    }
  } catch (e) {
    error(`Cannot read ${packageJsonPath}`);
    return false;
  }
}

async function checkDatabase() {
  require('dotenv').config();
  const { Pool } = require('pg');
  
  if (!process.env.DATABASE_URL) {
    error('DATABASE_URL not set in .env');
    return false;
  }
  
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });
  
  try {
    const result = await pool.query('SELECT NOW()');
    success(`Database connected: ${result.rows[0].now}`);
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'player_cards'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      const countResult = await pool.query('SELECT COUNT(*) FROM player_cards');
      const count = parseInt(countResult.rows[0].count);
      success(`player_cards table exists with ${count} cards`);
      
      if (count === 0) {
        warning('Database is empty - consider running: npm run db:populate');
      }
    } else {
      warning('player_cards table does not exist - run: npm run db:migrate');
    }
    
    await pool.end();
    return true;
  } catch (e) {
    error(`Database connection failed: ${e.message}`);
    await pool.end();
    return false;
  }
}

async function main() {
  log('\n⚾ Showdown App - Setup Verification\n', colors.cyan);
  
  let allGood = true;
  
  // Check Node.js version
  section('Node.js Environment');
  allGood = checkNodeVersion() && allGood;
  
  // Check required commands
  section('Required Commands');
  allGood = checkCommand('npm', 'npm') && allGood;
  allGood = checkCommand('git', 'git') && allGood;
  checkCommand('psql', 'psql (optional for db:migrate)');
  
  // Check project structure
  section('Project Structure');
  allGood = checkFile('package.json') && allGood;
  allGood = checkFile('netlify.toml') && allGood;
  allGood = checkFile('mobile/package.json') && allGood;
  allGood = checkFile('netlify/functions/cards/generate.ts') && allGood;
  allGood = checkFile('netlify/functions/utils/db.ts') && allGood;
  
  // Check environment files
  section('Environment Configuration');
  allGood = checkFile('.env') && allGood;
  checkFile('mobile/.env', false);
  
  if (fs.existsSync('.env')) {
    allGood = checkEnvVar('DATABASE_URL') && allGood;
  }
  
  // Check dependencies
  section('Dependencies');
  allGood = checkDependencies('./package.json', 'Root') && allGood;
  allGood = checkDependencies('./mobile/package.json', 'Mobile') && allGood;
  
  // Check database
  section('Database Connection');
  try {
    const dbOk = await checkDatabase();
    allGood = dbOk && allGood;
  } catch (e) {
    error(`Database check failed: ${e.message}`);
    allGood = false;
  }
  
  // Check documentation
  section('Documentation');
  checkFile('README.md');
  checkFile('LOCAL_SETUP.md');
  checkFile('TEST_BACKEND.md');
  checkFile('netlify/README.md');
  
  // Summary
  section('Summary');
  
  if (allGood) {
    success('✨ All checks passed! You\'re ready to develop!');
    info('\nNext steps:');
    info('  1. npm run dev          # Start full stack');
    info('  2. Open Expo Go app and scan QR code');
    info('  3. See LOCAL_SETUP.md for detailed instructions');
  } else {
    error('❌ Some checks failed. Please fix the issues above.');
    info('\nCommon fixes:');
    info('  • Missing .env: cp .env.example .env (then edit with your DATABASE_URL)');
    info('  • Missing dependencies: npm install && cd mobile && npm install');
    info('  • Database issues: npm run db:test, then npm run db:migrate');
    info('\nSee LOCAL_SETUP.md for complete setup instructions.');
  }
  
  log('');
  process.exit(allGood ? 0 : 1);
}

main().catch((error) => {
  console.error('Verification failed:', error);
  process.exit(1);
});
