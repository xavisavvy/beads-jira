#!/usr/bin/env node

/**
 * beads-sync - CLI tool for syncing Jira issues to Beads
 * Can be run via: npx jira-beads-sync-helpers sync
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REQUIRED_ENV_VARS = [
  'JIRA_HOST',
  'JIRA_EMAIL',
  'JIRA_API_TOKEN',
  'JIRA_PROJECT_KEY',
];

function checkEnvironment() {
  const missing = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((v) => console.error(`  - ${v}`));
    console.error('\nPlease set these variables before running sync.');
    console.error(
      '\nSee: https://github.com/your-org/beads-jira#configuration'
    );
    process.exit(1);
  }
}

function checkBeadsDirectory() {
  const beadsDir = path.join(process.cwd(), '.beads');
  if (!fs.existsSync(beadsDir)) {
    console.warn('⚠️  No .beads directory found. Creating...');
    fs.mkdirSync(beadsDir, { recursive: true });
  }
}

function runSync() {
  console.log('🔄 Starting Jira to Beads sync...\n');

  try {
    checkEnvironment();
    checkBeadsDirectory();

    const syncScript = path.join(__dirname, '..', 'sync_jira_to_beads.js');
    execSync(`node "${syncScript}"`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        BEADS_PROJECT_PATH: process.env.BEADS_PROJECT_PATH || process.cwd(),
      },
    });

    console.log('\n✅ Sync completed successfully!');
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runSync();
}

module.exports = { runSync };
