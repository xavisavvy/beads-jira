# HiveForge

> Forge your AI agent development hive

[![npm version](https://badge.fury.io/js/hiveforge.svg)](https://www.npmjs.com/package/hiveforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

HiveForge is a CLI tool that scaffolds repositories for AI-assisted development workflows. It sets up repos with best-practice tooling for AI coding agents like Claude Code, GitHub Copilot CLI, and Cursor.

```
┌─────────────────────────────────────────────────────────────┐
│  🐝 HiveForge - "Forge your AI agent development hive"      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Issue Trackers        AI Agent Tools       CI/CD Platforms │
│  ---------------       --------------       --------------- │
│  • GitHub Issues       • Beads              • GitHub Actions│
│  • Jira                • Cleo               • Azure DevOps  │
│  • GitLab Issues       • Ralph              • GitLab CI     │
│  • Linear             (pluggable)          • Bitbucket     │
│                                             • Jenkins       │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
npx hiveforge init
```

This launches an interactive wizard that guides you through:

1. **AI Agent Selection** - Claude Code, Copilot, Cursor, Windsurf
2. **Issue Tracker** - GitHub Issues, Jira, GitLab Issues, Linear
3. **CI/CD Platform** - GitHub Actions, Azure DevOps, GitLab CI, Bitbucket, Jenkins
4. **Agent Tools** - Beads, Cleo, Ralph
5. **Sync Configuration** - Schedule and PR automation

## Installation

```bash
# Run directly with npx (recommended)
npx hiveforge init

# Or install globally
npm install -g hiveforge
hiveforge init
```

## Commands

| Command | Description |
|---------|-------------|
| `hiveforge init` | Initialize a new AI agent development environment |
| `hiveforge add <tool>` | Add an AI workflow tool (beads, cleo, ralph) |
| `hiveforge status` | Show current configuration status |
| `hiveforge sync` | Manually sync issues from configured tracker |
| `hiveforge help` | Show help message |

## Features

### Issue Tracker Integration

HiveForge supports multiple issue trackers:

| Tracker | Secrets Required |
|---------|------------------|
| GitHub Issues | None (uses GITHUB_TOKEN) |
| Jira | `JIRA_HOST`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY` |
| GitLab Issues | `GITLAB_TOKEN`, `GITLAB_PROJECT_ID` |
| Linear | `LINEAR_API_KEY`, `LINEAR_TEAM_ID` |

### CI/CD Pipeline Generation

Generates ready-to-use pipeline configurations:

- **GitHub Actions** - `.github/workflows/sync-issues.yml`
- **Azure DevOps** - `azure-pipelines.yml`
- **GitLab CI** - `.gitlab-ci.yml`
- **Bitbucket Pipelines** - `bitbucket-pipelines.yml`
- **Jenkins** - `Jenkinsfile`

All pipelines include:
- Skip-if-not-configured (graceful skip when secrets missing)
- Scheduled + manual triggers
- Clear logging with notice messages
- Automatic PR creation for synced issues

### AI Agent Tools

| Tool | Description | Install |
|------|-------------|---------|
| **Beads** | Issue tracking as code - syncs issues to `.beads/` | `hiveforge add beads` |
| **Cleo** | Task management for AI agents - anti-hallucination, stable IDs | `hiveforge add cleo` |
| **Ralph** | Autonomous development loops - runs AI agents iteratively | `hiveforge add ralph` |

## Generated Files

After running `hiveforge init`, you'll have:

```
your-project/
├── .hiveforge.json           # HiveForge configuration
├── .env.example              # Required environment variables
├── CLAUDE.md                 # Claude Code instructions (if selected)
├── .cursor/rules.md          # Cursor rules (if selected)
├── .github/workflows/
│   └── sync-issues.yml       # GitHub Actions (if selected)
├── .beads/
│   ├── config.yaml           # Beads configuration (if selected)
│   └── README.md
└── ...
```

## Configuration

HiveForge stores its configuration in `.hiveforge.json`:

```json
{
  "version": "1.0.0",
  "aiAgent": "claude-code",
  "issueTracker": "jira",
  "cicdPlatforms": ["github-actions"],
  "agentTools": ["beads"],
  "syncSchedule": "0 */6 * * *",
  "autoCreatePR": true
}
```

## Environment Variables

Set these in your CI/CD secrets or local `.env` file:

### Jira
```
JIRA_HOST=your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=PROJ
```

### GitLab
```
GITLAB_TOKEN=your-gitlab-token
GITLAB_PROJECT_ID=your-project-id
```

### Linear
```
LINEAR_API_KEY=your-linear-api-key
LINEAR_TEAM_ID=your-team-id
```

## Example Workflow

1. **Initialize your project:**
   ```bash
   cd my-project
   git init
   npx hiveforge init
   ```

2. **Configure secrets** in your CI/CD platform

3. **Sync issues:**
   ```bash
   npx hiveforge sync
   ```

4. **Start working:**
   ```bash
   bd ready              # See available issues
   npm run start -- bd-123  # Start on issue
   # ... do work ...
   npm run finish -- bd-123 # Create PR
   ```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT - see [LICENSE](LICENSE) for details.

## Links

- **Website**: [https://hiveforge.sh](https://hiveforge.sh)
- **Documentation**: [https://hiveforge.sh/docs](https://hiveforge.sh/docs)
- **GitHub**: [https://github.com/hiveforge/hiveforge](https://github.com/hiveforge/hiveforge)
- **npm**: [https://www.npmjs.com/package/hiveforge](https://www.npmjs.com/package/hiveforge)

---

*Made with 🐝 by the HiveForge team*
