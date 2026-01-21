#!/usr/bin/env node

/**
 * Interactive onboarding wizard for new developers
 * Guides through setup, validation, and first-time experience
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI colors for better UX
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class OnboardingWizard {
  constructor() {
    this.config = {
      name: '',
      email: '',
      jiraProjectKey: '',
      jiraComponent: '',
      skipGitHook: false,
      skipExample: false
    };
    this.checks = {
      git: false,
      node: false,
      beads: false,
      gitRepo: false
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  section(title) {
    console.log('\n' + '='.repeat(60));
    this.log(title, 'bright');
    console.log('='.repeat(60) + '\n');
  }

  success(message) {
    this.log(`✅ ${message}`, 'green');
  }

  error(message) {
    this.log(`❌ ${message}`, 'red');
  }

  warning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'cyan');
  }

  async question(prompt) {
    return new Promise((resolve) => {
      rl.question(`${colors.cyan}${prompt}${colors.reset} `, resolve);
    });
  }

  async confirm(prompt, defaultYes = true) {
    const suffix = defaultYes ? '[Y/n]' : '[y/N]';
    const answer = await this.question(`${prompt} ${suffix}: `);
    const normalized = answer.toLowerCase().trim();

    if (!normalized) return defaultYes;
    return normalized === 'y' || normalized === 'yes';
  }

  execCommand(command, silent = false) {
    try {
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: silent ? 'pipe' : 'inherit'
      });
      return { success: true, output: output?.trim() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async checkPrerequisites() {
    this.section('📋 Checking Prerequisites');

    // Check Node.js
    const nodeResult = this.execCommand('node --version', true);
    if (nodeResult.success) {
      this.checks.node = true;
      this.success(`Node.js installed: ${nodeResult.output}`);
    } else {
      this.error('Node.js not found');
      this.info('Install from: https://nodejs.org');
    }

    // Check Git
    const gitResult = this.execCommand('git --version', true);
    if (gitResult.success) {
      this.checks.git = true;
      this.success(`Git installed: ${gitResult.output}`);
    } else {
      this.error('Git not found');
    }

    // Check if in git repo
    const gitRepoResult = this.execCommand('git rev-parse --git-dir', true);
    if (gitRepoResult.success) {
      this.checks.gitRepo = true;
      this.success('Git repository detected');
    } else {
      this.error('Not in a Git repository');
      this.warning('Run: git init');
    }

    // Check beads
    const beadsResult = this.execCommand('which bd || where bd', true);
    if (beadsResult.success) {
      this.checks.beads = true;
      this.success('Beads (bd) command found');

      // Check if beads initialized
      const beadsDir = path.join(process.cwd(), '.beads');
      if (fs.existsSync(beadsDir)) {
        this.success('Beads repository initialized');
      } else {
        this.warning('Beads not initialized in this directory');
      }
    } else {
      this.error('Beads (bd) command not found');
      this.info('Install: curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash');
    }

    const allChecks = Object.values(this.checks).every((v) => v);
    if (!allChecks) {
      console.log('');
      this.error('Some prerequisites are missing. Please install them first.');
      return false;
    }

    return true;
  }

  async collectUserInfo() {
    this.section('👤 Developer Information');

    // Get git config name
    const gitName = this.execCommand('git config user.name', true);
    const defaultName = gitName.success ? gitName.output : '';

    // Get git config email
    const gitEmail = this.execCommand('git config user.email', true);
    const defaultEmail = gitEmail.success ? gitEmail.output : '';

    this.config.name = await this.question(
      `Your name ${defaultName ? `[${defaultName}]` : ''}: `
    );
    if (!this.config.name) this.config.name = defaultName;

    this.config.email = await this.question(
      `Your email ${defaultEmail ? `[${defaultEmail}]` : ''}: `
    );
    if (!this.config.email) this.config.email = defaultEmail;

    if (this.config.name) {
      this.success(`Welcome, ${this.config.name}! 👋`);
    }
  }

  async collectProjectInfo() {
    this.section('🎯 Project Configuration');

    this.info('This information is used to sync Jira issues to beads.');
    console.log('');

    this.config.jiraProjectKey = await this.question(
      'Jira Project Key (e.g., PROJ, FRONT, BACK): '
    );

    this.config.jiraComponent = await this.question(
      'Jira Component (optional, press Enter to skip): '
    );

    if (this.config.jiraProjectKey) {
      this.success(
        `Will sync issues from: ${this.config.jiraProjectKey}${
          this.config.jiraComponent ? ` / ${this.config.jiraComponent}` : ''
        }`
      );
    }
  }

  async configureGitHook() {
    this.section('🔗 Git Hook Configuration');

    this.info('A post-merge hook can automatically sync Jira issues after git pull.');
    console.log('');

    const installHook = await this.confirm(
      'Install automatic sync on git pull?',
      true
    );

    this.config.skipGitHook = !installHook;

    if (installHook) {
      this.success('Git hook will be installed');
    } else {
      this.info('You can sync manually with: npm run sync');
    }
  }

  async initializeBeads() {
    this.section('🎨 Initializing Beads');

    const beadsDir = path.join(process.cwd(), '.beads');
    if (fs.existsSync(beadsDir)) {
      this.success('Beads already initialized');
      return true;
    }

    this.info('Initializing beads repository...');
    const result = this.execCommand('bd init', true);

    if (result.success) {
      this.success('Beads initialized successfully');
      return true;
    } else {
      this.error('Failed to initialize beads');
      this.warning('You may need to install beads first');
      return false;
    }
  }

  async runInstaller() {
    this.section('📦 Running Installation');

    this.info('Running install script...');
    console.log('');

    const installScript = fs.existsSync('./install.sh')
      ? './install.sh'
      : path.join(__dirname, '../install.sh');

    if (!fs.existsSync(installScript)) {
      this.error('install.sh not found');
      return false;
    }

    // Create config file for non-interactive install
    const configFile = path.join(process.cwd(), '.jira-beads-onboard');
    const configContent = `
JIRA_PROJECT_KEY="${this.config.jiraProjectKey}"
JIRA_COMPONENT="${this.config.jiraComponent}"
SKIP_GIT_HOOK="${this.config.skipGitHook ? 'yes' : 'no'}"
ONBOARDING_MODE=yes
`.trim();

    fs.writeFileSync(configFile, configContent);

    const result = this.execCommand(`bash ${installScript}`, false);

    // Cleanup temp config
    try {
      fs.unlinkSync(configFile);
    } catch (e) {
      // Ignore
    }

    if (result.success) {
      this.success('Installation completed');
      return true;
    } else {
      this.error('Installation failed');
      return false;
    }
  }

  async runExampleSync() {
    this.section('🔄 Testing Sync (Example Data)');

    const runExample = await this.confirm(
      'Try a test sync with example data?',
      true
    );

    this.config.skipExample = !runExample;

    if (!runExample) {
      this.info('Skipping example sync');
      return true;
    }

    this.info('Running example sync...');
    console.log('');

    const syncScript = path.join(
      process.cwd(),
      'scripts/sync_jira_to_beads.js'
    );

    if (!fs.existsSync(syncScript)) {
      this.warning('Sync script not found, skipping example');
      return false;
    }

    const result = this.execCommand(
      `node ${syncScript} ${this.config.jiraProjectKey || 'DEMO'} --use-example-data`,
      false
    );

    if (result.success) {
      this.success('Example sync completed!');
      console.log('');
      this.info('Check synced issues with: bd ready');
      return true;
    } else {
      this.warning('Example sync failed, but installation may still be OK');
      return false;
    }
  }

  async showNextSteps() {
    this.section('🎉 Onboarding Complete!');

    this.success('Setup is complete. Here are your next steps:\n');

    console.log(`${colors.bright}Common Commands:${colors.reset}`);
    console.log(`  ${colors.green}npm run sync${colors.reset}          - Sync Jira issues`);
    console.log(`  ${colors.green}bd ready${colors.reset}              - See available work`);
    console.log(`  ${colors.green}npm run start -- bd-xxx${colors.reset} - Start working on issue`);
    console.log(`  ${colors.green}npm run finish -- bd-xxx${colors.reset} - Create PR\n`);

    console.log(`${colors.bright}Documentation:${colors.reset}`);
    console.log(`  ${colors.cyan}docs/QUICKREF.md${colors.reset}         - Quick command reference`);
    console.log(`  ${colors.cyan}docs/DEVELOPER_WORKFLOWS.md${colors.reset} - Daily workflows`);
    console.log(`  ${colors.cyan}docs/EXAMPLE_WORKFLOW.md${colors.reset} - Usage examples\n`);

    console.log(`${colors.bright}Your Configuration:${colors.reset}`);
    if (this.config.jiraProjectKey) {
      console.log(`  Jira Project: ${colors.yellow}${this.config.jiraProjectKey}${colors.reset}`);
    }
    if (this.config.jiraComponent) {
      console.log(`  Component: ${colors.yellow}${this.config.jiraComponent}${colors.reset}`);
    }
    console.log(`  Git Hook: ${this.config.skipGitHook ? colors.red + 'No' : colors.green + 'Yes'}${colors.reset}\n`);

    const viewDocs = await this.confirm(
      'Open getting started guide?',
      false
    );

    if (viewDocs) {
      const docsPath = path.join(process.cwd(), 'docs/GETTING_STARTED.md');
      if (fs.existsSync(docsPath)) {
        this.execCommand(`cat ${docsPath}`, false);
      }
    }
  }

  async run() {
    console.clear();
    this.log(
      '╔════════════════════════════════════════════════════════╗',
      'cyan'
    );
    this.log(
      '║     🚀 Jira-Beads Sync - Developer Onboarding 🚀      ║',
      'cyan'
    );
    this.log(
      '╚════════════════════════════════════════════════════════╝',
      'cyan'
    );
    console.log('');
    this.info('This wizard will help you get started in ~5 minutes\n');

    try {
      // Step 1: Prerequisites
      const prereqsOk = await this.checkPrerequisites();
      if (!prereqsOk) {
        this.warning('\nPlease install missing prerequisites and run again.');
        process.exit(1);
      }

      // Step 2: User info
      await this.collectUserInfo();

      // Step 3: Project info
      await this.collectProjectInfo();

      // Step 4: Git hook
      await this.configureGitHook();

      // Step 5: Initialize beads
      await this.initializeBeads();

      // Step 6: Run installer
      await this.runInstaller();

      // Step 7: Example sync
      await this.runExampleSync();

      // Step 8: Next steps
      await this.showNextSteps();

      this.section('✨ Happy Coding! ✨');
    } catch (error) {
      console.log('');
      this.error(`Onboarding failed: ${error.message}`);
      process.exit(1);
    } finally {
      rl.close();
    }
  }
}

// Run wizard
if (require.main === module) {
  const wizard = new OnboardingWizard();
  wizard.run().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = OnboardingWizard;
