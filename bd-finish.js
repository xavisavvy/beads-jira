#!/usr/bin/env node
/**
 * bd-finish - Finish a beads issue and create a PR
 * Node.js version
 *
 * Usage: node bd-finish.js <issue-id> [options]
 * Example: node bd-finish.js bd-a1b2
 */

const { execSync } = require('child_process');

function showHelp() {
  console.log('Usage: node bd-finish.js <issue-id> [options]');
  console.log('');
  console.log('Finishes a beads issue and creates a pull request');
  console.log('');
  console.log('Options:');
  console.log('  --draft        Create as draft PR');
  console.log('  --no-push      Don\'t push to remote (just mark done locally)');
  console.log('  --help, -h     Show this help');
  console.log('');
  console.log('Examples:');
  console.log('  node bd-finish.js bd-a1b2');
  console.log('  node bd-finish.js bd-a1b2 --draft');
  console.log('  node bd-finish.js bd-a1b2 --no-push');
}

function parseArgs(args) {
  return {
    issueId: args[0],
    isDraft: args.includes('--draft'),
    noPush: args.includes('--no-push'),
    showHelp: args.length === 0 || args.includes('--help') || args.includes('-h')
  };
}

function extractJiraKey(labels) {
  return labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
}

function detectPlatform(remoteUrl) {
  if (remoteUrl.includes('github.com')) {
    return 'github';
  } else if (remoteUrl.includes('bitbucket.org')) {
    return 'bitbucket';
  } else if (remoteUrl.includes('gitlab.com')) {
    return 'gitlab';
  } else {
    // Check for self-hosted
    if (remoteUrl.match(/gitlab/i)) {
      return 'gitlab';
    } else if (remoteUrl.match(/bitbucket/i)) {
      return 'bitbucket';
    }
  }
  return 'other';
}

function buildPRTitle(issueTitle, jiraKey) {
  return jiraKey ? `${jiraKey}: ${issueTitle}` : issueTitle;
}

function buildPRBody(issueId, jiraKey) {
  if (jiraKey) {
    return `Closes ${issueId} / ${jiraKey}

## Changes
- 

## Testing
- 

## Related
- Jira: ${jiraKey}
- Beads: ${issueId}`;
  } else {
    return `Closes ${issueId}

## Changes
- 

## Testing
- 

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated`;
  }
}

function main() {
  const args = process.argv.slice(2);
  const parsed = parseArgs(args);

  if (parsed.showHelp) {
    showHelp();
    process.exit(0);
  }

  const issueId = parsed.issueId;
  const isDraft = parsed.isDraft;
  const noPush = parsed.noPush;

  console.log(`\x1b[34mFinishing issue ${issueId}...\x1b[0m`);

  // Get issue details from beads
  let issue;
  try {
    const output = execSync(`bd show ${issueId} --json`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    issue = JSON.parse(output);
  } catch (error) {
    console.log(`\x1b[31m❌ Issue ${issueId} not found\x1b[0m`);
    process.exit(1);
  }

  const issueTitle = issue.title;
  const issueType = issue.type;
  const issueLabels = issue.labels || [];

  // Find Jira key from labels
  const jiraKey = extractJiraKey(issueLabels);

  console.log(`\x1b[34m📋 Issue: ${issueTitle}\x1b[0m`);
  console.log(`\x1b[34m🏷️  Type: ${issueType}\x1b[0m`);
  if (jiraKey) {
    console.log(`\x1b[34m🎫 Jira: ${jiraKey}\x1b[0m`);
  }
  console.log('');

  // Check for uncommitted changes
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (gitStatus.trim()) {
      console.log('\x1b[33m⚠️  You have uncommitted changes.\x1b[0m');
      console.log('Please commit your changes first:');
      console.log('  git add .');
      console.log(`  git commit -m "Your message (${issueId}${jiraKey ? ' ' + jiraKey : ''})"`);
      process.exit(1);
    }
  } catch (error) {
    // Ignore error
  }

  // Mark issue as done
  execSync(`bd done ${issueId}`, { stdio: 'inherit' });
  console.log('\x1b[32m✓ Marked issue as done\x1b[0m');

  if (noPush) {
    console.log('\x1b[32mDone! (not pushing to remote)\x1b[0m');
    process.exit(0);
  }

  // Get current branch
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
    encoding: 'utf-8'
  }).trim();

  if (currentBranch === 'main' || currentBranch === 'master') {
    console.log(`\x1b[33m⚠️  You're on ${currentBranch} branch.\x1b[0m`);
    console.log('No pull request needed.');
    process.exit(0);
  }

  console.log(`\x1b[34m🌿 Current branch: ${currentBranch}\x1b[0m`);

  // Push to remote
  console.log('\x1b[34mPushing to remote...\x1b[0m');
  execSync(`git push -u origin ${currentBranch}`, { stdio: 'inherit' });
  console.log(`\x1b[32m✓ Pushed to origin/${currentBranch}\x1b[0m`);

  // Detect git hosting platform
  const remoteUrl = execSync('git config --get remote.origin.url', {
    encoding: 'utf-8'
  }).trim();
  console.log(`\x1b[34m🔗 Remote: ${remoteUrl}\x1b[0m`);

  // Determine platform
  const platform = detectPlatform(remoteUrl);

  console.log(`\x1b[34m📦 Platform: ${platform}\x1b[0m`);
  console.log('');

  // Build PR title and body
  const prTitle = buildPRTitle(issueTitle, jiraKey);
  const prBody = buildPRBody(issueId, jiraKey, issueTitle);

  // Create PR based on platform
  switch (platform) {
  case 'github':
    try {
      execSync('gh --version', { stdio: 'ignore' });
      console.log('\x1b[34mCreating GitHub PR...\x1b[0m');
      const draftFlag = isDraft ? '--draft' : '';
      execSync(`gh pr create --title "${prTitle}" --body "${prBody}" ${draftFlag}`, {
        stdio: 'inherit'
      });
      console.log('\x1b[32m✓ Pull request created!\x1b[0m');
    } catch (error) {
      console.log('\x1b[33m⚠️  \'gh\' CLI not installed.\x1b[0m');
      console.log('Install it: https://cli.github.com/');
      console.log('');
      const repoPath = remoteUrl.replace(/.*github\.com[:/](.*)\.git/, '$1');
      console.log('Or create PR manually:');
      console.log(`  https://github.com/${repoPath}/compare/${currentBranch}?expand=1`);
    }
    break;

  case 'bitbucket': {
    const bbRepoPath = remoteUrl.replace(/.*bitbucket\.org[:/]([^/]+\/[^/.]+)(\.git)?/, '$1');
    try {
      execSync('bb --version', { stdio: 'ignore' });
      console.log('\x1b[34mCreating Bitbucket PR...\x1b[0m');
      execSync(`bb pr create --title "${prTitle}" --description "${prBody}"`, {
        stdio: 'inherit'
      });
      console.log('\x1b[32m✓ Pull request created!\x1b[0m');
    } catch (error) {
      console.log('\x1b[33m⚠️  Bitbucket CLI not installed.\x1b[0m');
      console.log('');
      console.log('Create PR manually:');
      console.log(`  https://bitbucket.org/${bbRepoPath}/pull-requests/new?source=${currentBranch}`);
    }
    break;
  }

  case 'gitlab': {
    const glRepoPath = remoteUrl.replace(/.*gitlab[^/]*[:/]([^/]+\/[^/.]+)(\.git)?/, '$1');
    try {
      execSync('glab --version', { stdio: 'ignore' });
      console.log('\x1b[34mCreating GitLab MR...\x1b[0m');
      const draftFlag = isDraft ? '--draft' : '';
      execSync(`glab mr create --title "${prTitle}" --description "${prBody}" ${draftFlag}`, {
        stdio: 'inherit'
      });
      console.log('\x1b[32m✓ Merge request created!\x1b[0m');
    } catch (error) {
      console.log('\x1b[33m⚠️  \'glab\' CLI not installed.\x1b[0m');
      console.log('Install it: https://gitlab.com/gitlab-org/cli');
      console.log('');
      console.log('Or create MR manually:');
      console.log(`  https://gitlab.com/${glRepoPath}/-/merge_requests/new?merge_request[source_branch]=${currentBranch}`);
    }
    break;
  }

  case 'other':
    console.log('\x1b[33m⚠️  Unknown git platform.\x1b[0m');
    console.log('');
    console.log(`Branch pushed to: ${currentBranch}`);
    console.log(`Remote: ${remoteUrl}`);
    console.log('');
    console.log('Create pull request manually in your git platform\'s web UI.');
    break;
  }

  console.log('');
  console.log('\x1b[32m🎉 All done!\x1b[0m');
  console.log('');
  console.log(`Issue ${issueId} is marked as done.`);
  console.log(`Branch ${currentBranch} has been pushed.`);
}

// Export for testing
if (require.main === module) {
  main();
} else {
  module.exports = {
    main,
    showHelp,
    parseArgs,
    extractJiraKey,
    detectPlatform,
    buildPRTitle,
    buildPRBody
  };
}
