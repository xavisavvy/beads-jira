#!/usr/bin/env node
/**
 * Bitbucket PR Default Description Manager
 *
 * Sets default PR description via Bitbucket API since filesystem templates aren't supported.
 *
 * Usage:
 *   node scripts/bitbucket-pr-defaults.js setup
 *   node scripts/bitbucket-pr-defaults.js check
 *   node scripts/bitbucket-pr-defaults.js update
 *
 * Prerequisites:
 *   - BITBUCKET_USERNAME environment variable
 *   - BITBUCKET_APP_PASSWORD environment variable (app password with repository:write)
 *   - BITBUCKET_WORKSPACE environment variable (workspace slug)
 *   - BITBUCKET_REPO environment variable (repository slug)
 *
 * Setup instructions:
 *   1. Create app password: https://bitbucket.org/account/settings/app-passwords/
 *      Required scopes: repository:write
 *   2. Set environment variables:
 *      export BITBUCKET_USERNAME="your-username"
 *      export BITBUCKET_APP_PASSWORD="your-app-password"
 *      export BITBUCKET_WORKSPACE="your-workspace"
 *      export BITBUCKET_REPO="your-repo"
 *   3. Run: npm run bitbucket:setup
 */

const fs = require('fs');
const https = require('https');

const TEMPLATE_PATH = '.github/pull_request_template.md';
// eslint-disable-next-line no-unused-vars
const BITBUCKET_API = 'https://api.bitbucket.org/2.0';

// Environment variables
const USERNAME = process.env.BITBUCKET_USERNAME;
const APP_PASSWORD = process.env.BITBUCKET_APP_PASSWORD;
const WORKSPACE = process.env.BITBUCKET_WORKSPACE;
const REPO = process.env.BITBUCKET_REPO;

/**
 * Make authenticated request to Bitbucket API
 */
function apiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${USERNAME}:${APP_PASSWORD}`).toString('base64');

    const options = {
      hostname: 'api.bitbucket.org',
      path: `/2.0${path}`,
      method: method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(body ? JSON.parse(body) : null);
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`API request failed: ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Read PR template from file
 */
function readTemplate() {
  try {
    return fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  } catch (error) {
    console.error(`❌ Could not read template: ${TEMPLATE_PATH}`);
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

/**
 * Convert markdown template to Bitbucket format
 * Bitbucket uses different markdown syntax for some elements
 */
function convertTemplate(template) {
  // Remove the sync comment header
  let converted = template.replace(/<!--[\s\S]*?-->\n\n/, '');

  // Note: Bitbucket uses standard markdown, so minimal conversion needed
  return converted;
}

/**
 * Check environment variables
 */
function checkEnv() {
  const missing = [];
  if (!USERNAME) missing.push('BITBUCKET_USERNAME');
  if (!APP_PASSWORD) missing.push('BITBUCKET_APP_PASSWORD');
  if (!WORKSPACE) missing.push('BITBUCKET_WORKSPACE');
  if (!REPO) missing.push('BITBUCKET_REPO');

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('');
    console.error('Setup instructions:');
    console.error('1. Create app password: https://bitbucket.org/account/settings/app-passwords/');
    console.error('   Required scopes: repository:write');
    console.error('2. Set environment variables:');
    console.error('   export BITBUCKET_USERNAME="your-username"');
    console.error('   export BITBUCKET_APP_PASSWORD="your-app-password"');
    console.error('   export BITBUCKET_WORKSPACE="your-workspace"');
    console.error('   export BITBUCKET_REPO="your-repo"');
    process.exit(1);
  }
}

/**
 * Get repository default description
 */
async function getCurrentDefault() {
  try {
    const repo = await apiRequest('GET', `/repositories/${WORKSPACE}/${REPO}`);
    return repo.description || null;
  } catch (error) {
    throw new Error(`Failed to get repository info: ${error.message}`);
  }
}

/**
 * Setup command - configure default PR description
 */
async function setup() {
  console.log('🔧 Setting up Bitbucket PR default description...\n');

  checkEnv();

  console.log(`Repository: ${WORKSPACE}/${REPO}`);
  console.log(`Template: ${TEMPLATE_PATH}\n`);

  // Read and convert template
  const template = readTemplate();
  const converted = convertTemplate(template);

  console.log('📄 Template preview (first 200 chars):');
  console.log('─'.repeat(60));
  console.log(converted.substring(0, 200) + '...');
  console.log('─'.repeat(60));
  console.log('');

  console.log('⚠️  WARNING:');
  console.log('   Bitbucket does NOT support per-PR default descriptions via API.');
  console.log('   The API only allows setting repository-level descriptions.');
  console.log('');
  console.log('   Alternative approaches:');
  console.log('   1. Store template as repository README or wiki page');
  console.log('   2. Use browser extension for auto-population');
  console.log('   3. Create a script that users run to populate PR description');
  console.log('   4. Use PR automation tool (e.g., Bitbucket Pipelines)');
  console.log('');
  console.log('❌ Cannot set default PR description via Bitbucket API.');
  console.log('   Please reference .github/pull_request_template.md manually when creating PRs.');

  process.exit(1);
}

/**
 * Check command - verify configuration
 */
async function check() {
  console.log('🔍 Checking Bitbucket configuration...\n');

  checkEnv();

  console.log('✓ Environment variables configured');
  console.log(`  - Repository: ${WORKSPACE}/${REPO}`);
  console.log(`  - Username: ${USERNAME}`);
  console.log('');

  try {
    const current = await getCurrentDefault();
    console.log('✓ API connection successful');
    console.log(`  - Repository description: ${current || '(none)'}`);
  } catch (error) {
    console.error(`❌ API connection failed: ${error.message}`);
    process.exit(1);
  }

  console.log('');
  console.log('⚠️  Note: Bitbucket does not support filesystem-based PR templates.');
  console.log('   Users must manually reference the template when creating PRs.');
}

/**
 * Show usage
 */
function showUsage() {
  console.log('Bitbucket PR Default Description Manager');
  console.log('');
  console.log('Usage: node scripts/bitbucket-pr-defaults.js <command>');
  console.log('');
  console.log('Commands:');
  console.log('  setup    Attempt to configure default PR description (limited by Bitbucket API)');
  console.log('  check    Verify Bitbucket API configuration');
  console.log('  help     Show this help message');
  console.log('');
  console.log('Important:');
  console.log('  Bitbucket does NOT support filesystem-based PR templates like GitHub/GitLab.');
  console.log('  This script documents the API approach, but Bitbucket API has limitations.');
  console.log('');
  console.log('Recommended approach:');
  console.log('  1. Keep .github/pull_request_template.md as reference');
  console.log('  2. Users manually copy template when creating PRs');
  console.log('  3. Add PR checklist to team documentation');
  console.log('');
  console.log('Environment variables required:');
  console.log('  BITBUCKET_USERNAME       Your Bitbucket username');
  console.log('  BITBUCKET_APP_PASSWORD   App password with repository:write scope');
  console.log('  BITBUCKET_WORKSPACE      Workspace slug');
  console.log('  BITBUCKET_REPO           Repository slug');
}

// Main
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
  case 'setup':
    setup().catch(error => {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    });
    break;

  case 'check':
    check().catch(error => {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    });
    break;

  case 'help':
  case '--help':
  case '-h':
  case undefined:
    showUsage();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.error('Run with --help for usage information');
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  apiRequest,
  readTemplate,
  convertTemplate,
  checkEnv,
  showUsage
};
