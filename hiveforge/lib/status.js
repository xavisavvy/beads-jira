/**
 * HiveForge Status Command
 * Shows current configuration and health check
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { colors, success, error, warning, info, section } = require('./utils/prompts');
const issueTrackerGenerator = require('./generators/issue-tracker');
const ciCdGenerator = require('./generators/ci-cd');
const agentToolsGenerator = require('./generators/agent-tools');

/**
 * Show current HiveForge configuration status
 */
async function show() {
  const projectPath = process.cwd();
  const configPath = path.join(projectPath, '.hiveforge.json');

  console.log(`
${colors.yellow}╔═══════════════════════════════════════════════════════════════╗${colors.reset}
${colors.yellow}║${colors.reset}  ${colors.bright}🐝 HiveForge Status${colors.reset}                                         ${colors.yellow}║${colors.reset}
${colors.yellow}╚═══════════════════════════════════════════════════════════════╝${colors.reset}
`);

  // Check if HiveForge is configured
  if (!fs.existsSync(configPath)) {
    warning('HiveForge not configured in this directory.');
    info('Run `npx hiveforge init` to set up your environment.');
    return;
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    error(`Failed to read configuration: ${e.message}`);
    return;
  }

  // Configuration Summary
  section('Configuration');

  console.log(`  ${colors.bright}AI Agent:${colors.reset}       ${config.aiAgent || 'Not set'}`);
  console.log(`  ${colors.bright}Issue Tracker:${colors.reset}  ${config.issueTracker || 'None'}`);
  console.log(`  ${colors.bright}CI/CD:${colors.reset}          ${config.cicdPlatforms?.join(', ') || 'None'}`);
  console.log(`  ${colors.bright}Agent Tools:${colors.reset}    ${config.agentTools?.join(', ') || 'None'}`);
  console.log(`  ${colors.bright}Sync Schedule:${colors.reset}  ${config.syncSchedule || 'Not set'}`);
  console.log(`  ${colors.bright}Auto PR:${colors.reset}        ${config.autoCreatePR ? 'Yes' : 'No'}`);

  // File Status
  section('Generated Files');

  const files = [
    { path: 'CLAUDE.md', desc: 'Claude Code instructions' },
    { path: '.cursor/rules.md', desc: 'Cursor rules' },
    { path: '.github/workflows/sync-issues.yml', desc: 'GitHub Actions workflow' },
    { path: 'azure-pipelines.yml', desc: 'Azure DevOps pipeline' },
    { path: '.gitlab-ci.yml', desc: 'GitLab CI config' },
    { path: 'bitbucket-pipelines.yml', desc: 'Bitbucket pipeline' },
    { path: 'Jenkinsfile', desc: 'Jenkins pipeline' },
    { path: '.beads/config.yaml', desc: 'Beads configuration' },
    { path: '.cleo/config.json', desc: 'Cleo configuration' },
    { path: '.ralph/config.yaml', desc: 'Ralph configuration' },
    { path: '.env.example', desc: 'Environment template' }
  ];

  for (const file of files) {
    const fullPath = path.join(projectPath, file.path);
    if (fs.existsSync(fullPath)) {
      success(`${file.path.padEnd(40)} ${colors.dim}${file.desc}${colors.reset}`);
    }
  }

  // Environment Check
  section('Environment');

  // Check Git
  try {
    execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    success('Git repository detected');
  } catch (e) {
    warning('Not a git repository');
  }

  // Check Node
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    success(`Node.js ${nodeVersion}`);
  } catch (e) {
    error('Node.js not found');
  }

  // Check issue tracker secrets (if applicable)
  if (config.issueTracker && config.issueTracker !== 'none') {
    const adapter = issueTrackerGenerator.getAdapter(config.issueTracker);
    if (adapter && adapter.secrets.length > 0) {
      section('Required Secrets');

      info(`The following secrets are required for ${adapter.name}:\n`);
      for (const secret of adapter.secrets) {
        const envValue = process.env[secret];
        if (envValue) {
          success(`${secret.padEnd(20)} ${colors.dim}(set)${colors.reset}`);
        } else {
          warning(`${secret.padEnd(20)} ${colors.dim}(not set)${colors.reset}`);
        }
      }
    }
  }

  // Beads status
  if (config.agentTools?.includes('beads')) {
    section('Beads Status');

    const beadsDir = path.join(projectPath, '.beads');
    if (fs.existsSync(beadsDir)) {
      const issuesPath = path.join(beadsDir, 'issues.jsonl');
      if (fs.existsSync(issuesPath)) {
        try {
          const content = fs.readFileSync(issuesPath, 'utf8');
          const lines = content.trim().split('\n').filter(l => l);
          info(`${lines.length} issues synced`);
        } catch (e) {
          info('No issues synced yet');
        }
      } else {
        info('No issues synced yet');
      }
    }
  }

  console.log('');
  info('Run `npx hiveforge sync` to sync issues manually');
  console.log('');
}

module.exports = { show };
