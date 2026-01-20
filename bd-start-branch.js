#!/usr/bin/env node
/**
 * bd-start-branch - Start working on a beads issue with automatic branch creation
 * Node.js version
 *
 * Usage: node bd-start-branch.js <issue-id>
 * Example: node bd-start-branch.js bd-a1b2
 */

const { execSync } = require('child_process');
const readline = require('readline');

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const issueId = process.argv[2];

  if (!issueId) {
    console.log('Usage: node bd-start-branch.js <issue-id>');
    console.log('');
    console.log('Starts a beads issue and creates a git feature branch');
    console.log('');
    console.log('Example:');
    console.log('  node bd-start-branch.js bd-a1b2');
    process.exit(1);
  }

  console.log(`\x1b[34mStarting issue ${issueId}...\x1b[0m`);

  // Get issue details from beads
  let issue;
  try {
    const output = execSync(`bd show ${issueId} --json`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    issue = JSON.parse(output);
  } catch (error) {
    console.log(`\x1b[31m❌ Issue ${issueId} not found\x1b[0m`);
    process.exit(1);
  }

  const issueTitle = issue.title;
  const issueType = issue.type;
  const issueLabels = issue.labels || [];

  // Find Jira key from labels (format: PROJ-123)
  const jiraKey = issueLabels.find(label => /^[A-Z]+-[0-9]+$/.test(label));

  // Create branch name
  // Format: <type>/<jira-key>-<slugified-title>
  // Example: feature/FRONT-234-fix-button-alignment

  // Slugify title
  const slug = issueTitle
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/ /g, '-')
    .substring(0, 50);

  const branchName = jiraKey
    ? `${issueType}/${jiraKey}-${slug}`
    : `${issueType}/${issueId}-${slug}`;

  console.log(`\x1b[34m📋 Issue: ${issueTitle}\x1b[0m`);
  console.log(`\x1b[34m🏷️  Type: ${issueType}\x1b[0m`);
  if (jiraKey) {
    console.log(`\x1b[34m🎫 Jira: ${jiraKey}\x1b[0m`);
  }
  console.log(`\x1b[34m🌿 Branch: ${branchName}\x1b[0m`);
  console.log('');

  // Check if we're on a clean working directory
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (gitStatus.trim()) {
      console.log('\x1b[33m⚠️  You have uncommitted changes.\x1b[0m');
      const response = await prompt('Continue anyway? (y/n) ');
      if (!response.match(/^[Yy]$/)) {
        console.log('Cancelled.');
        process.exit(1);
      }
    }
  } catch (error) {
    // Ignore error
  }

  // Make sure we're on main/master
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  if (currentBranch !== 'main' && currentBranch !== 'master') {
    console.log(`\x1b[33m⚠️  You're on branch '${currentBranch}', not main/master.\x1b[0m`);
    const response = await prompt('Create branch from current branch? (y/n) ');
    if (!response.match(/^[Yy]$/)) {
      console.log('Cancelled. Switch to main first:');
      console.log('  git checkout main');
      process.exit(1);
    }
  }

  // Check if branch already exists
  try {
    execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, { stdio: 'ignore' });
    console.log(`\x1b[33m⚠️  Branch '${branchName}' already exists.\x1b[0m`);
    const response = await prompt('Check it out? (y/n) ');
    if (response.match(/^[Yy]$/)) {
      execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
    } else {
      console.log('Cancelled.');
      process.exit(1);
    }
  } catch (error) {
    // Branch doesn't exist, create it
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    console.log(`\x1b[32m✓ Created and checked out branch: ${branchName}\x1b[0m`);
  }

  // Start the beads issue
  execSync(`bd start ${issueId}`, { stdio: 'inherit' });
  console.log(`\x1b[32m✓ Started issue: ${issueId}\x1b[0m`);

  console.log('');
  console.log('\x1b[32m🚀 Ready to work!\x1b[0m');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Make your changes');
  console.log(`  2. Commit with: git commit -m "Your message (${issueId}${jiraKey ? ' ' + jiraKey : ''})"`);
  console.log(`  3. When done: bd done ${issueId}`);
  console.log('  4. Push and create PR');
}

// Export for testing
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
} else {
  module.exports = { prompt, main };
}
