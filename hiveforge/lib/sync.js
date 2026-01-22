/**
 * HiveForge Sync Command
 * Manually triggers issue sync from configured tracker
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { colors, success, error, warning, info, section } = require('./utils/prompts');
const issueTrackerGenerator = require('./generators/issue-tracker');

/**
 * Run manual sync
 */
async function run() {
  const projectPath = process.cwd();
  const configPath = path.join(projectPath, '.hiveforge.json');

  console.log(`
${colors.yellow}╔═══════════════════════════════════════════════════════════════╗${colors.reset}
${colors.yellow}║${colors.reset}  ${colors.bright}🐝 HiveForge Sync${colors.reset}                                           ${colors.yellow}║${colors.reset}
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

  if (!config.issueTracker || config.issueTracker === 'none') {
    warning('No issue tracker configured.');
    info('Run `npx hiveforge init` to configure an issue tracker.');
    return;
  }

  const adapter = issueTrackerGenerator.getAdapter(config.issueTracker);
  if (!adapter) {
    error(`Unknown issue tracker: ${config.issueTracker}`);
    return;
  }

  section(`Syncing from ${adapter.name}`);

  // Check required secrets
  const missingSecrets = [];
  for (const secret of adapter.secrets) {
    if (!process.env[secret]) {
      missingSecrets.push(secret);
    }
  }

  if (missingSecrets.length > 0) {
    error('Missing required environment variables:');
    for (const secret of missingSecrets) {
      console.log(`  - ${secret}`);
    }
    console.log('');
    info('Set these in your environment or .env file.');
    return;
  }

  // Run sync based on tracker type
  try {
    switch (config.issueTracker) {
      case 'github-issues':
        await syncGitHubIssues(projectPath);
        break;
      case 'jira':
        await syncJiraIssues(projectPath);
        break;
      case 'gitlab-issues':
        await syncGitLabIssues(projectPath);
        break;
      case 'linear':
        await syncLinearIssues(projectPath);
        break;
      default:
        error(`Sync not implemented for: ${config.issueTracker}`);
        return;
    }

    success('Sync completed successfully!');
  } catch (err) {
    error(`Sync failed: ${err.message}`);
  }
}

/**
 * Sync GitHub Issues
 */
async function syncGitHubIssues(projectPath) {
  info('Fetching GitHub Issues...');

  try {
    // Use gh CLI if available
    const result = execSync('gh issue list --json number,title,state,labels,assignees,body --limit 100', {
      encoding: 'utf8',
      cwd: projectPath
    });

    const issues = JSON.parse(result);
    await writeIssuesToBeads(projectPath, issues, 'github');

    info(`Synced ${issues.length} issues`);
  } catch (e) {
    throw new Error(`GitHub CLI failed: ${e.message}. Make sure 'gh' is installed and authenticated.`);
  }
}

/**
 * Sync Jira Issues
 */
async function syncJiraIssues(projectPath) {
  info('Fetching Jira Issues...');

  const host = process.env.JIRA_HOST;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  const projectKey = process.env.JIRA_PROJECT_KEY;

  const jql = `project = ${projectKey} AND status in ("To Do", "In Progress", "Ready for Dev") ORDER BY updated DESC`;
  const url = `https://${host}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=100`;

  const auth = Buffer.from(`${email}:${token}`).toString('base64');

  try {
    // Use Node's built-in fetch or https
    const https = require('https');
    const data = await new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 400) {
            reject(new Error(`Jira API returned ${res.statusCode}: ${body}`));
          } else {
            resolve(JSON.parse(body));
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    const issues = data.issues || [];
    await writeIssuesToBeads(projectPath, issues, 'jira');

    info(`Synced ${issues.length} issues`);
  } catch (e) {
    throw new Error(`Jira API failed: ${e.message}`);
  }
}

/**
 * Sync GitLab Issues
 */
async function syncGitLabIssues(projectPath) {
  info('Fetching GitLab Issues...');

  const token = process.env.GITLAB_TOKEN;
  const projectId = process.env.GITLAB_PROJECT_ID;

  const url = `https://gitlab.com/api/v4/projects/${encodeURIComponent(projectId)}/issues?state=opened&per_page=100`;

  try {
    const https = require('https');
    const data = await new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'GET',
        headers: {
          'PRIVATE-TOKEN': token,
          'Accept': 'application/json'
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 400) {
            reject(new Error(`GitLab API returned ${res.statusCode}: ${body}`));
          } else {
            resolve(JSON.parse(body));
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    await writeIssuesToBeads(projectPath, data, 'gitlab');

    info(`Synced ${data.length} issues`);
  } catch (e) {
    throw new Error(`GitLab API failed: ${e.message}`);
  }
}

/**
 * Sync Linear Issues
 */
async function syncLinearIssues(projectPath) {
  info('Fetching Linear Issues...');

  const apiKey = process.env.LINEAR_API_KEY;
  const teamId = process.env.LINEAR_TEAM_ID;

  const query = `
    query {
      team(id: "${teamId}") {
        issues(filter: { state: { type: { in: ["backlog", "unstarted", "started"] } } }, first: 100) {
          nodes {
            id
            identifier
            title
            description
            state { name }
            priority
            assignee { name }
            labels { nodes { name } }
          }
        }
      }
    }
  `;

  try {
    const https = require('https');
    const data = await new Promise((resolve, reject) => {
      const req = https.request('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 400) {
            reject(new Error(`Linear API returned ${res.statusCode}: ${body}`));
          } else {
            resolve(JSON.parse(body));
          }
        });
      });
      req.on('error', reject);
      req.write(JSON.stringify({ query }));
      req.end();
    });

    const issues = data.data?.team?.issues?.nodes || [];
    await writeIssuesToBeads(projectPath, issues, 'linear');

    info(`Synced ${issues.length} issues`);
  } catch (e) {
    throw new Error(`Linear API failed: ${e.message}`);
  }
}

/**
 * Write issues to beads format
 */
async function writeIssuesToBeads(projectPath, issues, source) {
  const beadsDir = path.join(projectPath, '.beads');
  if (!fs.existsSync(beadsDir)) {
    fs.mkdirSync(beadsDir, { recursive: true });
  }

  const issuesPath = path.join(beadsDir, 'issues.jsonl');
  const lines = issues.map(issue => {
    // Normalize issue format
    const normalized = normalizeIssue(issue, source);
    return JSON.stringify(normalized);
  });

  fs.writeFileSync(issuesPath, lines.join('\n') + '\n');

  // Update metadata
  const metadataPath = path.join(beadsDir, 'metadata.json');
  const metadata = {
    lastSync: new Date().toISOString(),
    source: source,
    issueCount: issues.length
  };
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

/**
 * Normalize issue format across different trackers
 */
function normalizeIssue(issue, source) {
  switch (source) {
    case 'github':
      return {
        id: `gh-${issue.number}`,
        key: `GH-${issue.number}`,
        title: issue.title,
        description: issue.body || '',
        status: issue.state,
        labels: issue.labels?.map(l => l.name) || [],
        assignee: issue.assignees?.[0]?.login || null,
        source: 'github'
      };
    case 'jira':
      return {
        id: issue.id,
        key: issue.key,
        title: issue.fields?.summary || '',
        description: issue.fields?.description || '',
        status: issue.fields?.status?.name || 'Unknown',
        priority: issue.fields?.priority?.name || 'Medium',
        labels: issue.fields?.labels || [],
        assignee: issue.fields?.assignee?.displayName || null,
        source: 'jira'
      };
    case 'gitlab':
      return {
        id: `gl-${issue.iid}`,
        key: `GL-${issue.iid}`,
        title: issue.title,
        description: issue.description || '',
        status: issue.state,
        labels: issue.labels || [],
        assignee: issue.assignee?.name || null,
        source: 'gitlab'
      };
    case 'linear':
      return {
        id: issue.id,
        key: issue.identifier,
        title: issue.title,
        description: issue.description || '',
        status: issue.state?.name || 'Unknown',
        priority: issue.priority,
        labels: issue.labels?.nodes?.map(l => l.name) || [],
        assignee: issue.assignee?.name || null,
        source: 'linear'
      };
    default:
      return issue;
  }
}

module.exports = { run };
