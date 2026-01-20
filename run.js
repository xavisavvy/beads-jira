#!/usr/bin/env node
/**
 * Cross-platform task runner for Jira-Beads sync
 * Works on Windows, macOS, Linux without external dependencies
 *
 * Usage:
 *   node run install
 *   node run sync PROJ --component backend
 *   node run start bd-a1b2
 *   node run finish bd-a1b2
 */

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');

// eslint-disable-next-line no-unused-vars
const TASKS = {
  help: 'Show available commands',
  install: 'Install sync and workflow helpers',
  sync: 'Sync Jira issues (requires PROJ argument)',
  start: 'Start working on issue (requires issue ID)',
  finish: 'Finish issue and create PR (requires issue ID)',
  test: 'Test sync with example data',
  config: 'Show current configuration'
};

// Detect OS and runtime
const isWindows = os.platform() === 'win32';
// eslint-disable-next-line no-unused-vars
const hasNode = true; // We're running in Node!
const hasPython = (() => {
  try {
    execSync('python3 --version', { stdio: 'ignore' });
    return true;
  } catch {
    try {
      execSync('python --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
})();

function showHelp() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Jira-Beads Sync - Workflow Automation               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Detected OS:      ${os.platform()}`);
  console.log('Using Runtime:    Node.js');
  console.log('');
  console.log('Available Commands:');
  console.log('  node run install              Install sync and workflow helpers');
  console.log('  node run sync PROJ            Sync Jira issues from project');
  console.log('  node run sync PROJ --component NAME  Sync specific component');
  console.log('  node run start ISSUE          Start work (creates branch)');
  console.log('  node run finish ISSUE         Finish work (creates PR)');
  console.log('  node run finish ISSUE --draft Finish as draft PR');
  console.log('  node run test                 Test sync with example data');
  console.log('  node run config               Show configuration');
  console.log('');
  console.log('Examples:');
  console.log('  node run sync FRONT --component ui-components');
  console.log('  node run start bd-a1b2');
  console.log('  node run finish bd-a1b2');
  console.log('');
  console.log('Shortcuts (if you add to package.json):');
  console.log('  npm run sync -- FRONT --component backend');
  console.log('  npm run start -- bd-a1b2');
  console.log('  npm run finish -- bd-a1b2');
}

function run(task, args) {
  switch (task) {
  case 'install':
    if (isWindows) {
      execSync('powershell -ExecutionPolicy Bypass -File install.ps1', { stdio: 'inherit' });
    } else {
      execSync('bash install.sh', { stdio: 'inherit' });
    }
    break;

  case 'sync': {
    if (args.length === 0) {
      console.error('Error: PROJ argument required');
      console.log('Usage: node run sync PROJ [--component NAME]');
      process.exit(1);
    }
    const syncArgs = args.join(' ');
    execSync(`node scripts/sync_jira_to_beads.js ${syncArgs}`, { stdio: 'inherit' });
    break;
  }

  case 'start': {
    if (args.length === 0) {
      console.error('Error: ISSUE argument required');
      console.log('Usage: node run start ISSUE');
      process.exit(1);
    }
    const issueId = args[0];
    if (isWindows) {
      execSync(`powershell -ExecutionPolicy Bypass -File scripts/bd-start-branch.ps1 ${issueId}`, { stdio: 'inherit' });
    } else {
      execSync(`node scripts/bd-start-branch.js ${issueId}`, { stdio: 'inherit' });
    }
    break;
  }

  case 'finish': {
    if (args.length === 0) {
      console.error('Error: ISSUE argument required');
      console.log('Usage: node run finish ISSUE [--draft]');
      process.exit(1);
    }
    const finishArgs = args.join(' ');
    if (isWindows) {
      const draftFlag = args.includes('--draft') ? '-Draft' : '';
      execSync(`powershell -ExecutionPolicy Bypass -File scripts/bd-finish.ps1 ${args[0]} ${draftFlag}`, { stdio: 'inherit' });
    } else {
      execSync(`node scripts/bd-finish.js ${finishArgs}`, { stdio: 'inherit' });
    }
    break;
  }

  case 'test':
    execSync('node scripts/sync_jira_to_beads.js TEST --use-example-data', { stdio: 'inherit' });
    console.log('');
    console.log('Check beads issues:');
    console.log('  bd ls --label jira-synced');
    break;

  case 'config':
    console.log('Current Configuration:');
    console.log(`  OS:            ${os.platform()}`);
    console.log(`  Runtime:       Node.js ${process.version}`);
    console.log(`  Has Python:    ${hasPython ? 'Yes' : 'No'}`);
    console.log('');
    if (fs.existsSync('.jira-beads-config')) {
      console.log('Jira Config (.jira-beads-config):');
      console.log(fs.readFileSync('.jira-beads-config', 'utf-8'));
    } else {
      console.log('No .jira-beads-config file found.');
      console.log('Run "node run install" first.');
    }
    break;

  case 'help':
  default:
    showHelp();
    break;
  }
}

// Main
const task = process.argv[2] || 'help';
const args = process.argv.slice(3);

// Export for testing
if (require.main === module) {
  try {
    run(task, args);
  } catch (error) {
    console.error(`Error running task "${task}":`, error.message);
    process.exit(1);
  }
} else {
  module.exports = { run, showHelp };
}
