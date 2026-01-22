#!/usr/bin/env node

/**
 * HiveForge CLI - AI Agent Development Environment Scaffolder
 * "Forge your AI agent development hive"
 */

const path = require('path');

const VERSION = require('../package.json').version;

const commands = {
  init: () => require('../lib/wizard').run(),
  add: (tool) => require('../lib/generators/agent-tools').add(tool),
  status: () => require('../lib/status').show(),
  sync: () => require('../lib/sync').run(),
  help: () => showHelp(),
  version: () => console.log(`hiveforge v${VERSION}`)
};

function showHelp() {
  console.log(`
  🐝 HiveForge v${VERSION}
  "Forge your AI agent development hive"

  Usage:
    npx hiveforge <command> [options]

  Commands:
    init              Initialize a new AI agent development environment
    add <tool>        Add an AI workflow tool (beads, cleo, ralph)
    status            Show current configuration status
    sync              Manually sync issues from configured tracker
    help              Show this help message
    version           Show version number

  Examples:
    npx hiveforge init          # Start interactive setup wizard
    npx hiveforge add beads     # Add Beads issue tracking
    npx hiveforge add cleo      # Add Cleo task management
    npx hiveforge status        # Check configuration

  Documentation:
    https://hiveforge.sh

  Report issues:
    https://github.com/hiveforge/hiveforge/issues
`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  if (command === '--version' || command === '-v') {
    commands.version();
    return;
  }

  if (command === '--help' || command === '-h') {
    commands.help();
    return;
  }

  if (commands[command]) {
    const arg = args[1];
    Promise.resolve(commands[command](arg)).catch((error) => {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    });
  } else {
    console.error(`\n❌ Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }
}

main();
