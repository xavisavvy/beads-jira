#!/usr/bin/env node

/**
 * HiveForge Interactive Setup Wizard
 * Guides through AI agent development environment setup
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const { colors, log, section, success, error, warning, info } = require('./utils/prompts');
const { generateTemplate, copyTemplate } = require('./utils/templates');
const issueTrackerGenerator = require('./generators/issue-tracker');
const ciCdGenerator = require('./generators/ci-cd');
const agentToolsGenerator = require('./generators/agent-tools');

class HiveForgeWizard {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.config = {
      projectPath: process.cwd(),
      aiAgent: null,
      issueTracker: null,
      cicdPlatforms: [],
      agentTools: [],
      syncSchedule: '0 */6 * * *',
      autoCreatePR: true
    };

    this.generatedFiles = [];
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(`${colors.cyan}${prompt}${colors.reset} `, resolve);
    });
  }

  async confirm(prompt, defaultYes = true) {
    const suffix = defaultYes ? '[Y/n]' : '[y/N]';
    const answer = await this.question(`${prompt} ${suffix}:`);
    const normalized = answer.toLowerCase().trim();
    if (!normalized) return defaultYes;
    return normalized === 'y' || normalized === 'yes';
  }

  async select(prompt, options) {
    console.log(`\n${colors.bright}${prompt}${colors.reset}\n`);
    options.forEach((opt, i) => {
      console.log(`  ${colors.cyan}${i + 1})${colors.reset} ${opt.label}${opt.description ? colors.dim + ' - ' + opt.description + colors.reset : ''}`);
    });
    console.log('');

    while (true) {
      const answer = await this.question('Select option (number):');
      const num = parseInt(answer, 10);
      if (num >= 1 && num <= options.length) {
        return options[num - 1].value;
      }
      error('Invalid selection. Please enter a number.');
    }
  }

  async multiSelect(prompt, options) {
    console.log(`\n${colors.bright}${prompt}${colors.reset}\n`);
    options.forEach((opt, i) => {
      console.log(`  ${colors.cyan}${i + 1})${colors.reset} ${opt.label}${opt.description ? colors.dim + ' - ' + opt.description + colors.reset : ''}`);
    });
    console.log(`\n  ${colors.dim}Enter numbers separated by commas, or 'none' to skip${colors.reset}`);
    console.log('');

    const answer = await this.question('Select options:');

    if (answer.toLowerCase() === 'none' || !answer.trim()) {
      return [];
    }

    const selections = answer.split(',').map(s => parseInt(s.trim(), 10));
    const result = [];

    for (const num of selections) {
      if (num >= 1 && num <= options.length) {
        result.push(options[num - 1].value);
      }
    }

    return result;
  }

  showBanner() {
    console.clear();
    console.log(`
${colors.yellow}╔═══════════════════════════════════════════════════════════════╗${colors.reset}
${colors.yellow}║${colors.reset}  ${colors.bright}🐝 Welcome to HiveForge${colors.reset}                                     ${colors.yellow}║${colors.reset}
${colors.yellow}║${colors.reset}  ${colors.dim}Let's set up your AI agent development environment${colors.reset}          ${colors.yellow}║${colors.reset}
${colors.yellow}╚═══════════════════════════════════════════════════════════════╝${colors.reset}
`);
  }

  async stepAIAgent() {
    section('Step 1: AI Agent Selection');

    this.config.aiAgent = await this.select(
      'Which AI coding agent will you primarily use?',
      [
        { label: 'Claude Code', value: 'claude-code', description: 'Anthropic\'s AI coding assistant' },
        { label: 'GitHub Copilot CLI', value: 'copilot', description: 'GitHub\'s AI pair programmer' },
        { label: 'Cursor', value: 'cursor', description: 'AI-first code editor' },
        { label: 'Windsurf', value: 'windsurf', description: 'Codeium\'s AI IDE' },
        { label: 'Other / Multiple', value: 'other', description: 'Multiple agents or other tool' }
      ]
    );

    success(`Selected: ${this.config.aiAgent}`);
  }

  async stepIssueTracker() {
    section('Step 2: Issue Tracker');

    this.config.issueTracker = await this.select(
      'Where do you track issues?',
      [
        { label: 'GitHub Issues', value: 'github-issues', description: 'Free, built-in' },
        { label: 'Jira', value: 'jira', description: 'Enterprise issue tracking' },
        { label: 'GitLab Issues', value: 'gitlab-issues', description: 'GitLab built-in' },
        { label: 'Linear', value: 'linear', description: 'Modern issue tracking' },
        { label: 'None / Skip', value: 'none', description: 'Configure later' }
      ]
    );

    if (this.config.issueTracker !== 'none') {
      success(`Selected: ${this.config.issueTracker}`);
    } else {
      info('Issue tracker configuration skipped');
    }
  }

  async stepCICD() {
    section('Step 3: CI/CD Platform');

    this.config.cicdPlatforms = await this.multiSelect(
      'Select CI/CD platform(s):',
      [
        { label: 'GitHub Actions', value: 'github-actions', description: 'GitHub\'s built-in CI/CD' },
        { label: 'Azure DevOps Pipelines', value: 'azure-devops', description: 'Microsoft Azure CI/CD' },
        { label: 'GitLab CI', value: 'gitlab-ci', description: 'GitLab\'s built-in CI/CD' },
        { label: 'Bitbucket Pipelines', value: 'bitbucket', description: 'Atlassian Bitbucket CI/CD' },
        { label: 'Jenkins', value: 'jenkins', description: 'Self-hosted CI/CD' }
      ]
    );

    if (this.config.cicdPlatforms.length > 0) {
      success(`Selected: ${this.config.cicdPlatforms.join(', ')}`);
    } else {
      info('No CI/CD platforms selected');
    }
  }

  async stepAgentTools() {
    section('Step 4: Agent Tools (Optional)');

    info('These tools enhance your AI-assisted development workflow:\n');

    this.config.agentTools = await this.multiSelect(
      'Select tools to install:',
      [
        { label: 'Beads', value: 'beads', description: 'Issue tracking as code - syncs issues to git' },
        { label: 'Cleo', value: 'cleo', description: 'Task management for AI agents - anti-hallucination' },
        { label: 'Ralph', value: 'ralph', description: 'Autonomous development loops' }
      ]
    );

    if (this.config.agentTools.length > 0) {
      success(`Selected: ${this.config.agentTools.join(', ')}`);
    } else {
      info('No additional tools selected');
    }
  }

  async stepSyncConfig() {
    if (this.config.issueTracker === 'none' && this.config.cicdPlatforms.length === 0) {
      return;
    }

    section('Step 5: Sync Configuration');

    const scheduleChoice = await this.select(
      'How often should issues sync?',
      [
        { label: 'Every 6 hours', value: '0 */6 * * *', description: 'Recommended' },
        { label: 'Daily at midnight', value: '0 0 * * *', description: 'Once per day' },
        { label: 'Manual only', value: 'manual', description: 'No automatic sync' }
      ]
    );

    this.config.syncSchedule = scheduleChoice;

    if (this.config.syncSchedule !== 'manual') {
      this.config.autoCreatePR = await this.confirm('Auto-create PRs for synced issues?', true);
    }

    success(`Sync schedule: ${this.config.syncSchedule === 'manual' ? 'Manual only' : this.config.syncSchedule}`);
  }

  async generateFiles() {
    section('Step 6: Generate Files');

    info('Creating your hive...\n');

    try {
      // Generate issue tracker configuration
      if (this.config.issueTracker !== 'none') {
        const files = await issueTrackerGenerator.generate(this.config);
        this.generatedFiles.push(...files);
      }

      // Generate CI/CD workflows
      for (const platform of this.config.cicdPlatforms) {
        const files = await ciCdGenerator.generate(platform, this.config);
        this.generatedFiles.push(...files);
      }

      // Generate agent tools configuration
      for (const tool of this.config.agentTools) {
        const files = await agentToolsGenerator.generate(tool, this.config);
        this.generatedFiles.push(...files);
      }

      // Generate agent-specific config (CLAUDE.md, etc.)
      const agentConfigFiles = await this.generateAgentConfig();
      this.generatedFiles.push(...agentConfigFiles);

      // Generate .env.example
      const envFile = await this.generateEnvExample();
      if (envFile) {
        this.generatedFiles.push(envFile);
      }

      // Show generated files
      for (const file of this.generatedFiles) {
        success(file);
      }

    } catch (err) {
      error(`Failed to generate files: ${err.message}`);
      throw err;
    }
  }

  async generateAgentConfig() {
    const files = [];
    const templatesDir = path.join(__dirname, '../templates/agent-config');

    if (this.config.aiAgent === 'claude-code' || this.config.aiAgent === 'other') {
      const claudeMdPath = path.join(this.config.projectPath, 'CLAUDE.md');
      if (!fs.existsSync(claudeMdPath)) {
        const template = fs.readFileSync(
          path.join(templatesDir, 'claude-code', 'CLAUDE.md'),
          'utf8'
        );
        const content = generateTemplate(template, {
          PROJECT_NAME: path.basename(this.config.projectPath),
          ISSUE_TRACKER: this.config.issueTracker || 'none',
          TOOLS: this.config.agentTools.join(', ') || 'none'
        });
        fs.writeFileSync(claudeMdPath, content);
        files.push('CLAUDE.md');
      }
    }

    if (this.config.aiAgent === 'cursor' || this.config.aiAgent === 'other') {
      const cursorDir = path.join(this.config.projectPath, '.cursor');
      if (!fs.existsSync(cursorDir)) {
        fs.mkdirSync(cursorDir, { recursive: true });
      }
      const cursorRulesPath = path.join(cursorDir, 'rules.md');
      if (!fs.existsSync(cursorRulesPath)) {
        const template = fs.readFileSync(
          path.join(templatesDir, 'cursor', 'rules.md'),
          'utf8'
        );
        const content = generateTemplate(template, {
          PROJECT_NAME: path.basename(this.config.projectPath)
        });
        fs.writeFileSync(cursorRulesPath, content);
        files.push('.cursor/rules.md');
      }
    }

    return files;
  }

  async generateEnvExample() {
    const envExamplePath = path.join(this.config.projectPath, '.env.example');
    const secrets = [];

    // Collect required secrets based on configuration
    if (this.config.issueTracker === 'jira') {
      secrets.push(
        '# Jira Configuration',
        'JIRA_HOST=your-domain.atlassian.net',
        'JIRA_EMAIL=your-email@example.com',
        'JIRA_API_TOKEN=your-api-token',
        'JIRA_PROJECT_KEY=PROJ'
      );
    } else if (this.config.issueTracker === 'gitlab-issues') {
      secrets.push(
        '# GitLab Configuration',
        'GITLAB_TOKEN=your-gitlab-token',
        'GITLAB_PROJECT_ID=your-project-id'
      );
    } else if (this.config.issueTracker === 'linear') {
      secrets.push(
        '# Linear Configuration',
        'LINEAR_API_KEY=your-linear-api-key',
        'LINEAR_TEAM_ID=your-team-id'
      );
    }

    if (secrets.length > 0) {
      const content = `# HiveForge Environment Variables\n# Copy this file to .env and fill in your values\n\n${secrets.join('\n')}\n`;
      fs.writeFileSync(envExamplePath, content);
      return '.env.example';
    }

    return null;
  }

  async showNextSteps() {
    section('Step 7: Next Steps');

    success('🎉 Your hive is ready!\n');

    // Show secrets to configure
    if (this.config.issueTracker === 'jira') {
      console.log(`${colors.bright}Configure these secrets in your CI/CD:${colors.reset}\n`);
      console.log(`  ${colors.yellow}JIRA_HOST${colors.reset}        - your-domain.atlassian.net`);
      console.log(`  ${colors.yellow}JIRA_EMAIL${colors.reset}       - your-email@example.com`);
      console.log(`  ${colors.yellow}JIRA_API_TOKEN${colors.reset}   - your-api-token`);
      console.log(`  ${colors.yellow}JIRA_PROJECT_KEY${colors.reset} - PROJ`);
      console.log('');
    } else if (this.config.issueTracker === 'gitlab-issues') {
      console.log(`${colors.bright}Configure these secrets:${colors.reset}\n`);
      console.log(`  ${colors.yellow}GITLAB_TOKEN${colors.reset}      - your-gitlab-token`);
      console.log(`  ${colors.yellow}GITLAB_PROJECT_ID${colors.reset} - your-project-id`);
      console.log('');
    } else if (this.config.issueTracker === 'linear') {
      console.log(`${colors.bright}Configure these secrets:${colors.reset}\n`);
      console.log(`  ${colors.yellow}LINEAR_API_KEY${colors.reset}  - your-linear-api-key`);
      console.log(`  ${colors.yellow}LINEAR_TEAM_ID${colors.reset}  - your-team-id`);
      console.log('');
    }

    console.log(`${colors.bright}Commands:${colors.reset}\n`);
    console.log(`  ${colors.green}npx hiveforge status${colors.reset}    - Check configuration`);
    console.log(`  ${colors.green}npx hiveforge add cleo${colors.reset}  - Add more tools`);
    console.log(`  ${colors.green}npx hiveforge sync${colors.reset}      - Sync issues manually`);
    console.log('');

    console.log(`${colors.bright}Generated files:${colors.reset}\n`);
    for (const file of this.generatedFiles) {
      console.log(`  ${colors.cyan}${file}${colors.reset}`);
    }
    console.log('');
  }

  async run() {
    try {
      this.showBanner();

      // Check if we're in a git repo
      try {
        execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      } catch (e) {
        warning('Not in a git repository. Run `git init` first for best results.');
        const proceed = await this.confirm('Continue anyway?', false);
        if (!proceed) {
          process.exit(0);
        }
      }

      await this.stepAIAgent();
      await this.stepIssueTracker();
      await this.stepCICD();
      await this.stepAgentTools();
      await this.stepSyncConfig();
      await this.generateFiles();
      await this.showNextSteps();

      // Save configuration
      const configPath = path.join(this.config.projectPath, '.hiveforge.json');
      fs.writeFileSync(configPath, JSON.stringify({
        version: '1.0.0',
        aiAgent: this.config.aiAgent,
        issueTracker: this.config.issueTracker,
        cicdPlatforms: this.config.cicdPlatforms,
        agentTools: this.config.agentTools,
        syncSchedule: this.config.syncSchedule,
        autoCreatePR: this.config.autoCreatePR,
        generatedAt: new Date().toISOString()
      }, null, 2));

      success('\n✨ Happy forging! ✨\n');

    } catch (err) {
      error(`Wizard failed: ${err.message}`);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }
}

async function run() {
  const wizard = new HiveForgeWizard();
  await wizard.run();
}

module.exports = { run, HiveForgeWizard };
