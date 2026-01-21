# CI/CD & Automation Guide

## Overview

This guide explains how to set up automated Jira-to-Beads synchronization using GitHub Actions or run it manually with `npx`.

---

## Quick Start

### For End Users (npx)

```bash
# Set environment variables
export JIRA_HOST="your-domain.atlassian.net"
export JIRA_EMAIL="your-email@example.com"
export JIRA_API_TOKEN="your-api-token"
export JIRA_PROJECT_KEY="PROJ"

# Run sync
npx jira-beads-sync-helpers sync
```

### For CI/CD (GitHub Actions)

The repository includes an automated sync workflow that runs every 6 hours or on-demand.

**Setup Required:**
1. Add GitHub secrets (see [Configuration](#github-secrets))
2. Enable workflow in repository settings
3. Workflow will automatically create PRs with synced issues

---

## Installation Methods

### Method 1: Global Installation

```bash
npm install -g jira-beads-sync-helpers
beads-sync
```

### Method 2: npx (No Installation)

```bash
npx jira-beads-sync-helpers sync
```

### Method 3: Project Dependency

```bash
npm install jira-beads-sync-helpers --save-dev
npm run sync
```

---

## Configuration

### Environment Variables

Required variables for both manual and automated sync:

| Variable | Description | Example |
|----------|-------------|---------|
| `JIRA_HOST` | Your Jira domain | `company.atlassian.net` |
| `JIRA_EMAIL` | Your Jira email | `user@company.com` |
| `JIRA_API_TOKEN` | Jira API token | `ATBBxyz123...` |
| `JIRA_PROJECT_KEY` | Jira project key | `PROJ` |
| `BEADS_PROJECT_PATH` | Path to beads project | `/path/to/project` (optional) |

**Create Jira API Token:**
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Copy and save securely

### GitHub Secrets

For GitHub Actions automation, add these secrets:

**Settings → Secrets and variables → Actions → New repository secret**

- `JIRA_HOST`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`
- `JIRA_PROJECT_KEY`

---

## GitHub Actions Workflow

### Automated Sync Workflow

**File:** `.github/workflows/sync-jira.yml`

**Triggers:**
- **Scheduled:** Every 6 hours automatically
- **Manual:** Via GitHub UI (Actions → Sync Jira to Beads → Run workflow)

**What it does:**
1. Fetches latest Jira issues
2. Updates `.beads/` directory
3. Creates a Pull Request with changes
4. Labels PR as `automated`, `sync`, `jira`

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Sync Jira to Beads** workflow
3. Click **Run workflow**
4. Select sync mode:
   - `auto` - Automatic sync with PR creation
   - `manual` - Manual review before committing
   - `dry-run` - Preview changes without committing

### Workflow Customization

**Change Schedule:**

Edit `.github/workflows/sync-jira.yml`:

```yaml
on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
    # Change to:
    - cron: '0 9 * * *'   # Daily at 9am
    - cron: '0 */2 * * *' # Every 2 hours
    - cron: '0 0 * * 1'   # Weekly on Monday
```

**Add Notifications:**

```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Jira sync completed: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
      }
```

---

## Usage Examples

### Manual Sync

```bash
# Basic sync
npx jira-beads-sync-helpers sync

# Sync specific project
cd /path/to/my-project
npx jira-beads-sync-helpers sync

# With custom environment
JIRA_PROJECT_KEY="MYPROJ" npx jira-beads-sync-helpers sync
```

### Using in npm Scripts

**package.json:**
```json
{
  "scripts": {
    "sync:jira": "beads-sync",
    "sync:dev": "JIRA_PROJECT_KEY=DEV beads-sync",
    "sync:prod": "JIRA_PROJECT_KEY=PROD beads-sync"
  }
}
```

### Pre-commit Hook

Sync before commits (optional):

**.husky/pre-commit:**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Optional: Sync Jira before commit
npm run sync:jira --silent || true
```

---

## CI/CD Integration

### GitHub Actions (Included)

✅ **Pre-configured** - See `.github/workflows/sync-jira.yml`

### GitLab CI

**.gitlab-ci.yml:**
```yaml
sync-jira:
  stage: sync
  image: node:18
  script:
    - npm ci
    - npm run sync
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"
  variables:
    JIRA_HOST: $JIRA_HOST
    JIRA_EMAIL: $JIRA_EMAIL
    JIRA_API_TOKEN: $JIRA_API_TOKEN
    JIRA_PROJECT_KEY: $JIRA_PROJECT_KEY
```

### Bitbucket Pipelines

**bitbucket-pipelines.yml:**
```yaml
pipelines:
  custom:
    sync-jira:
      - step:
          name: Sync Jira to Beads
          image: node:18
          script:
            - npm ci
            - npm run sync
          artifacts:
            - .beads/**
```

### Jenkins

**Jenkinsfile:**
```groovy
pipeline {
  agent any
  
  triggers {
    cron('H */6 * * *') // Every 6 hours
  }
  
  environment {
    JIRA_HOST = credentials('jira-host')
    JIRA_EMAIL = credentials('jira-email')
    JIRA_API_TOKEN = credentials('jira-api-token')
    JIRA_PROJECT_KEY = credentials('jira-project-key')
  }
  
  stages {
    stage('Sync') {
      steps {
        sh 'npm ci'
        sh 'npm run sync'
      }
    }
  }
}
```

---

## Monitoring & Debugging

### Check Sync Status

```bash
# View last sync
cat .beads/.sync-metadata.json

# Check workflow status
gh run list --workflow=sync-jira.yml

# View workflow logs
gh run view <run-id> --log
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=beads:* npx jira-beads-sync-helpers sync

# Verbose output
npm run sync -- --verbose
```

### Common Issues

**❌ Authentication Failed**
- Verify API token is valid
- Check email matches Jira account
- Ensure host doesn't include `https://`

**❌ No Issues Synced**
- Verify project key is correct
- Check user has project access
- Ensure issues exist in Jira

**❌ Workflow Not Running**
- Verify secrets are set correctly
- Check workflow is enabled
- Review workflow permissions

---

## Security Best Practices

### Secrets Management

- ✅ Use GitHub Secrets for CI/CD
- ✅ Never commit `.env` files
- ✅ Rotate API tokens regularly
- ✅ Use least-privilege access
- ❌ Don't expose tokens in logs

### Environment Files

**.env (gitignored):**
```bash
JIRA_HOST=your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-token-here
JIRA_PROJECT_KEY=PROJ
```

**.env.example (committed):**
```bash
JIRA_HOST=
JIRA_EMAIL=
JIRA_API_TOKEN=
JIRA_PROJECT_KEY=
```

---

## Advanced Features

### Multi-Project Sync

Sync multiple Jira projects:

```bash
# Sync multiple projects
JIRA_PROJECT_KEY=PROJ1 npm run sync
JIRA_PROJECT_KEY=PROJ2 npm run sync
JIRA_PROJECT_KEY=PROJ3 npm run sync
```

### Conditional Sync

Only sync if changes detected:

```bash
#!/bin/bash
BEFORE=$(git rev-parse HEAD:.beads)
npm run sync
AFTER=$(git rev-parse HEAD:.beads)

if [ "$BEFORE" != "$AFTER" ]; then
  echo "Changes detected, creating PR..."
  gh pr create --title "Sync Jira" --body "Automated sync"
fi
```

### Sync Metrics

Track sync performance:

```bash
# Time sync duration
time npm run sync

# Count synced issues
echo "Synced: $(find .beads -name '*.json' | wc -l) issues"

# Check sync frequency
git log --all --grep="sync Jira" --oneline | head -10
```

---

## Troubleshooting

### Workflow Debugging

```bash
# Enable workflow debug logs
# Add secret: ACTIONS_STEP_DEBUG = true

# View detailed run logs
gh run view --log-failed

# Rerun failed jobs
gh run rerun <run-id> --failed
```

### Manual Verification

```bash
# Test connection
npm run test:mcp

# Verify environment
node -e "console.log(process.env.JIRA_HOST)"

# Check git config
git config user.name
git config user.email
```

---

## FAQ

**Q: How often should I sync?**  
A: Depends on your workflow. Recommendations:
- Active projects: Every 2-6 hours
- Stable projects: Daily
- Archived projects: Weekly

**Q: Can I sync bidirectionally?**  
A: Currently one-way (Jira → Beads). Bidirectional sync is planned.

**Q: What happens to local beads changes?**  
A: Sync creates a PR, so you can review before merging.

**Q: Can I customize PR templates?**  
A: Yes! Edit `.github/workflows/sync-jira.yml` body section.

**Q: Does this work with Jira Data Center?**  
A: Yes, set `JIRA_HOST` to your data center URL.

---

## Related Documentation

- [GETTING_STARTED.md](GETTING_STARTED.md) - Initial setup
- [DEVELOPER_WORKFLOWS.md](DEVELOPER_WORKFLOWS.md) - Daily workflows
- [REAL_MCP_INTEGRATION.md](REAL_MCP_INTEGRATION.md) - MCP details
- [README.md](README.md) - Project overview

---

## Support

Issues? See:
- Check [Troubleshooting](#troubleshooting)
- Review workflow logs
- Test with `npm run test:mcp`
- Create issue on GitHub

---

**Last Updated:** January 21, 2026  
**Version:** 3.1.0
