/**
 * HiveForge CI/CD Generator
 * Creates CI/CD pipeline configurations for various platforms
 */

const fs = require('fs');
const path = require('path');
const { loadTemplate, copyTemplate, getTemplatesDir } = require('../utils/templates');
const issueTrackerGenerator = require('./issue-tracker');

/**
 * CI/CD platform configurations
 */
const platforms = {
  'github-actions': {
    name: 'GitHub Actions',
    dir: '.github/workflows',
    file: 'sync-issues.yml',
    template: 'github-actions/sync-issues.yml'
  },
  'azure-devops': {
    name: 'Azure DevOps Pipelines',
    dir: '',
    file: 'azure-pipelines.yml',
    template: 'azure-devops/azure-pipelines.yml'
  },
  'gitlab-ci': {
    name: 'GitLab CI',
    dir: '',
    file: '.gitlab-ci.yml',
    template: 'gitlab-ci/.gitlab-ci.yml'
  },
  bitbucket: {
    name: 'Bitbucket Pipelines',
    dir: '',
    file: 'bitbucket-pipelines.yml',
    template: 'bitbucket/bitbucket-pipelines.yml'
  },
  jenkins: {
    name: 'Jenkins',
    dir: '',
    file: 'Jenkinsfile',
    template: 'jenkins/Jenkinsfile'
  }
};

/**
 * Generate CI/CD configuration for a platform
 * @param {string} platform - CI/CD platform identifier
 * @param {object} config - HiveForge configuration
 * @returns {string[]} List of generated files
 */
async function generate(platform, config) {
  const platformConfig = platforms[platform];
  if (!platformConfig) {
    throw new Error(`Unknown CI/CD platform: ${platform}`);
  }

  const files = [];
  const { projectPath, issueTracker, syncSchedule, autoCreatePR } = config;
  const templatesDir = path.join(getTemplatesDir(), 'ci-cd');

  // Get secrets based on issue tracker
  const adapter = issueTrackerGenerator.getAdapter(issueTracker);
  const secrets = adapter ? adapter.secrets : [];

  // Build destination path
  const destDir = platformConfig.dir
    ? path.join(projectPath, platformConfig.dir)
    : projectPath;

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const destPath = path.join(destDir, platformConfig.file);
  const templatePath = path.join(templatesDir, platformConfig.template);

  // Skip if file already exists
  if (fs.existsSync(destPath)) {
    return files;
  }

  // Load and process template
  if (fs.existsSync(templatePath)) {
    const content = loadTemplate(templatePath, {
      SCHEDULE: syncSchedule === 'manual' ? '0 0 * * 0' : syncSchedule, // Default to weekly if manual
      ISSUE_TRACKER: issueTracker || 'none',
      ISSUE_TRACKER_NAME: adapter ? adapter.name : 'Issue Tracker',
      SECRETS_CHECK: generateSecretsCheck(platform, secrets),
      SECRETS_ENV: generateSecretsEnv(platform, secrets),
      AUTO_CREATE_PR: autoCreatePR ? 'true' : 'false',
      SKIP_SCHEDULE: syncSchedule === 'manual' ? 'true' : 'false'
    });
    fs.writeFileSync(destPath, content);

    const relativePath = platformConfig.dir
      ? `${platformConfig.dir}/${platformConfig.file}`
      : platformConfig.file;
    files.push(relativePath);
  }

  return files;
}

/**
 * Generate secrets check code for a platform
 * @param {string} platform - CI/CD platform
 * @param {string[]} secrets - Required secrets
 * @returns {string} Platform-specific secrets check
 */
function generateSecretsCheck(platform, secrets) {
  if (secrets.length === 0) {
    return 'echo "configured=true" >> $GITHUB_OUTPUT';
  }

  const checks = {
    'github-actions': secrets
      .map((s) => `[ -z "$\{{ secrets.${s} }}" ]`)
      .join(' || '),
    'azure-devops': secrets.map((s) => `[[ -z "$(${s})" ]]`).join(' || '),
    'gitlab-ci': secrets.map((s) => `[ -z "$${s}" ]`).join(' || '),
    bitbucket: secrets.map((s) => `[ -z "$${s}" ]`).join(' || '),
    jenkins: secrets.map((s) => `env.${s} == null`).join(' || ')
  };

  return checks[platform] || checks['github-actions'];
}

/**
 * Generate secrets environment variables for a platform
 * @param {string} platform - CI/CD platform
 * @param {string[]} secrets - Required secrets
 * @returns {string} Platform-specific env block
 */
function generateSecretsEnv(platform, secrets) {
  if (secrets.length === 0) {
    return '';
  }

  const envFormats = {
    'github-actions': secrets
      .map((s) => `          ${s}: $\{{ secrets.${s} }}`)
      .join('\n'),
    'azure-devops': secrets.map((s) => `          ${s}: $(${s})`).join('\n'),
    'gitlab-ci': secrets.map((s) => `    ${s}: $${s}`).join('\n'),
    bitbucket: secrets.map((s) => `          ${s}: $${s}`).join('\n'),
    jenkins: secrets
      .map((s) => `                        ${s}: credentials('${s.toLowerCase()}')`)
      .join('\n')
  };

  return envFormats[platform] || envFormats['github-actions'];
}

/**
 * Get platform configuration
 * @param {string} platform - Platform identifier
 * @returns {object} Platform configuration
 */
function getPlatform(platform) {
  return platforms[platform] || null;
}

/**
 * Get all available platforms
 * @returns {object} All platforms
 */
function getPlatforms() {
  return platforms;
}

module.exports = {
  generate,
  getPlatform,
  getPlatforms,
  platforms
};
