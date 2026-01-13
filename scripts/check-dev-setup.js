#!/usr/bin/env node

/**
 * Development Setup Validator
 *
 * Checks that your environment is properly configured for development.
 * Run this before starting: npm run verify-setup
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function check(name, condition, errorMsg) {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    return true;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    if (errorMsg) console.log(`  ${colors.yellow}${errorMsg}${colors.reset}`);
    return false;
  }
}

console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.blue}  Development Setup Checker${colors.reset}`);
console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

let issues = [];

// Check Node.js version
const nodeVersion = parseInt(process.version.slice(1));
issues.push(!check(
  'Node.js >= 18',
  nodeVersion >= 18,
  `Found: Node ${process.version}. Install v18+`
));

// Check npm version
const npmVersion = require('child_process').execSync('npm -v').toString().trim();
const npmMajor = parseInt(npmVersion.split('.')[0]);
issues.push(!check(
  'npm >= 9',
  npmMajor >= 9,
  `Found: npm ${npmVersion}. Install npm v9+`
));

// Check required files
issues.push(!check(
  'Root .env exists',
  fs.existsSync(path.join(__dirname, '../.env')),
  'Create .env file with your DATABASE_URL, CLOUDINARY_URL, NGROK_AUTHTOKEN'
));

issues.push(!check(
  'mobile/.env exists (will be created automatically)',
  fs.existsSync(path.join(__dirname, '../mobile/.env')),
  'Run: touch mobile/.env (it will be auto-populated during dev:tunnel)'
));

issues.push(!check(
  'netlify.toml exists',
  fs.existsSync(path.join(__dirname, '../netlify.toml')),
  'Netlify configuration missing'
));

// Check environment variables
require('dotenv').config();

console.log(`\n${colors.blue}Environment Variables:${colors.reset}`);

const requiredEnvs = {
  'DATABASE_URL': 'Neon.tech PostgreSQL connection string',
  'CLOUDINARY_URL': 'Cloudinary image hosting credentials'
};

const optionalEnvs = {
  'NGROK_AUTHTOKEN': 'For phone testing outside LAN (optional)'
};

let hasAllRequired = true;
for (const [env, desc] of Object.entries(requiredEnvs)) {
  const hasEnv = Boolean(process.env[env]);
  if (!hasEnv) hasAllRequired = false;
  issues.push(!check(
    `${env}`,
    hasEnv,
    desc
  ));
}

for (const [env, desc] of Object.entries(optionalEnvs)) {
  const hasEnv = Boolean(process.env[env]);
  console.log(`${hasEnv ? colors.green + '✓' + colors.reset : colors.yellow + '◎' + colors.reset} ${env} (${desc})`);
}

// Summary
console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

if (issues.every(i => !i)) {
  console.log(`${colors.green}✓ All checks passed! You're ready to develop.${colors.reset}\n`);
  console.log('Next steps:');
  console.log(`  ${colors.blue}npm run dev${colors.reset}        # Local development`);
  console.log(`  ${colors.blue}npm run dev:tunnel${colors.reset} # Phone testing outside LAN\n`);
  process.exit(0);
} else {
  const failCount = issues.filter(i => i).length;
  console.log(`${colors.red}✗ ${failCount} issue(s) found. Fix above and try again.${colors.reset}\n`);
  console.log('For detailed setup instructions, see: DEVELOPMENT.md\n');
  process.exit(1);
}
