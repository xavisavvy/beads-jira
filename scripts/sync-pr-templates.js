#!/usr/bin/env node
/**
 * Sync PR templates across platforms
 *
 * Keeps GitHub, GitLab, and Bitbucket PR templates in sync.
 * Edit the master template, then run this script to propagate changes.
 *
 * Usage: node scripts/sync-pr-templates.js [--check]
 *
 * Options:
 *   --check    Check if templates are in sync without making changes
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES = {
  github: '.github/pull_request_template.md',
  gitlab: '.gitlab/merge_request_templates/Default.md'
};

const MASTER_TEMPLATE = TEMPLATES.github; // GitHub is the master

function readTemplate(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`❌ Could not read ${filePath}: ${error.message}`);
    return null;
  }
}

function writeTemplate(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`❌ Could not write ${filePath}: ${error.message}`);
    return false;
  }
}

function normalizeTemplate(content) {
  // Normalize line endings and whitespace for comparison
  if (!content) return '';
  return content.replace(/\r\n/g, '\n').trim();
}

function checkSync() {
  console.log('🔍 Checking if templates are in sync...\n');

  const master = readTemplate(MASTER_TEMPLATE);
  if (!master) {
    console.error(`❌ Master template not found: ${MASTER_TEMPLATE}`);
    process.exit(1);
  }

  const normalizedMaster = normalizeTemplate(master);
  let allInSync = true;

  for (const [platform, templatePath] of Object.entries(TEMPLATES)) {
    if (templatePath === MASTER_TEMPLATE) {
      console.log(`✓ ${platform}: ${templatePath} (master)`);
      continue;
    }

    const template = readTemplate(templatePath);
    if (!template) {
      console.log(`❌ ${platform}: ${templatePath} - File missing`);
      allInSync = false;
      continue;
    }

    const normalizedTemplate = normalizeTemplate(template);
    if (normalizedTemplate === normalizedMaster) {
      console.log(`✓ ${platform}: ${templatePath} - In sync`);
    } else {
      console.log(`❌ ${platform}: ${templatePath} - Out of sync`);
      allInSync = false;
    }
  }

  console.log('');
  return allInSync;
}

function syncTemplates() {
  console.log('🔄 Syncing PR templates across platforms...\n');

  const master = readTemplate(MASTER_TEMPLATE);
  if (!master) {
    console.error(`❌ Master template not found: ${MASTER_TEMPLATE}`);
    process.exit(1);
  }

  console.log(`📄 Master template: ${MASTER_TEMPLATE}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const [platform, templatePath] of Object.entries(TEMPLATES)) {
    if (templatePath === MASTER_TEMPLATE) {
      console.log(`✓ ${platform}: ${templatePath} (master - skipped)`);
      successCount++;
      continue;
    }

    if (writeTemplate(templatePath, master)) {
      console.log(`✓ ${platform}: ${templatePath} - Synced`);
      successCount++;
    } else {
      console.log(`❌ ${platform}: ${templatePath} - Failed`);
      failCount++;
    }
  }

  console.log('');
  console.log(`✅ Sync complete: ${successCount} templates synced, ${failCount} failed`);

  if (failCount > 0) {
    process.exit(1);
  }
}

function showUsage() {
  console.log('Usage: node scripts/sync-pr-templates.js [--check]');
  console.log('');
  console.log('Sync PR templates across GitHub and GitLab.');
  console.log('');
  console.log('Note: Bitbucket does not natively support filesystem-based PR templates.');
  console.log('Options:');
  console.log('  --check    Check if templates are in sync without making changes');
  console.log('  --help     Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  npm run sync-pr-templates        # Sync all templates');
  console.log('  npm run sync-pr-templates check  # Check sync status');
}

// Main
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showUsage();
  process.exit(0);
}

if (args.includes('--check') || args.includes('check')) {
  const inSync = checkSync();
  if (!inSync) {
    console.log('❌ Templates are out of sync. Run without --check to sync them.');
    process.exit(1);
  } else {
    console.log('✅ All templates are in sync!');
    process.exit(0);
  }
} else {
  syncTemplates();
}

// Export for testing
module.exports = {
  readTemplate,
  writeTemplate,
  normalizeTemplate,
  checkSync,
  syncTemplates,
  TEMPLATES,
  MASTER_TEMPLATE
};
