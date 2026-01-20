# Jira-Beads Sync Integration

[![CI](https://github.com/xavisavvy/beads-jira/actions/workflows/ci.yml/badge.svg)](https://github.com/xavisavvy/beads-jira/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-2.0.6-blue.svg)](https://github.com/xavisavvy/beads-jira/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/tests-301%20passing-success.svg)](https://github.com/xavisavvy/beads-jira/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-18.8%25-yellow.svg)](./coverage/lcov-report/index.html)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/xavisavvy/beads-jira/graphs/commit-activity)

**Automatically sync Jira issues to your local [beads](https://github.com/steveyegge/beads) issue tracker via the Atlassian Rovo MCP server.**

> 🎉 **Phase 0 Complete!** CI/CD pipeline, automated testing, and code quality tools are now live!
>
> 📖 **Documentation Navigation**
> - **[INDEX.md](INDEX.md)** - Complete documentation index (22 guides)
> - **[QUICKREF.md](QUICKREF.md)** - Quick command reference
> - **[ROADMAP.md](ROADMAP.md)** - Development roadmap (Phase 1 next!)
> - **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What we've built
> - **README.md** - Setup guide (you are here)

---

## Overview

This integration allows you to:
- ✅ Query Jira issues filtered by project and component
- ✅ Sync issues to your local beads database
- ✅ Automatically trigger syncs on `git pull` via git hooks
- ✅ Work offline with full Jira issue context
- ✅ Enable AI agents to access Jira issues locally
- ✅ Track discovered work alongside planned Jira issues

## Prerequisites

| Requirement | Version | Installation |
|-------------|---------|--------------|
| **Python** | 3.7+ | Usually pre-installed on macOS/Linux |
| **Beads** | Latest | `curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh \| bash` |
| **Git** | Any | Usually pre-installed |
| **Jira Cloud Access** | - | Access to your organization's Jira |
| **Atlassian Rovo MCP** | - | Optional for real data (see Setup) |

## Quick Start

### 1. Install the Integration

From your project root:

```bash
# Clone or download these files to your project
cp -r jira-beads-sync/* /path/to/your/project/

# Run the installation script
cd /path/to/your/project
./install.sh
```

The installer will:
- Check for beads and initialize if needed
- Copy the sync script to `scripts/sync_jira_to_beads.py`
- Install workflow helpers (`bd-start-branch`, `bd-finish`)
- Optionally install a git post-merge hook
- Create a config file at `.jira-beads-config`

### 2. Configure Atlassian MCP

If you haven't already set up the Atlassian Rovo MCP server:

```bash
# This will open a browser for OAuth authentication
npx -y mcp-remote@0.1.13 https://mcp.atlassian.com/v1/mcp
```

Keep this terminal session running, or configure it in your IDE/client.

### 3. Test Manual Sync

```bash
# Using npm (recommended)
npm run sync -- PROJ
npm run sync -- PROJ --component backend-api

# Or using run.js directly
node run sync PROJ
node run sync PROJ --component backend-api
```

### 4. Automatic Sync on Git Pull

If you installed the git hook, the sync will run automatically when you:

```bash
git pull  # Only on main/master branch
```

### 5. Workflow Helpers

Streamline your development with automated branch creation and PR creation:

```bash
# Start working - creates branch automatically
npm run start -- bd-a1b2

# Make changes, commit...

# Finish - creates PR automatically
npm run finish -- bd-a1b2
```

**Alternative:** Use `node run start bd-a1b2` or direct scripts.

See [WORKFLOW_HELPERS.md](WORKFLOW_HELPERS.md) for details.

## How It Works

### Data Flow

```
Jira Cloud
    ↓
Atlassian Rovo MCP Server (OAuth authenticated)
    ↓
sync_jira_to_beads.py (queries via MCP)
    ↓
Local Beads Database (.beads/beads.db)
```

### Issue Mapping

Jira fields are mapped to beads as follows:

| Jira Field | Beads Field | Notes |
|------------|-------------|-------|
| Summary | Title | Direct copy |
| Description | Description | Includes Jira key and status |
| Priority | Priority | Mapped: Highest→0, High→1, Medium→2, Low→3, Lowest→4 |
| Issue Type | Type | Mapped: Bug→bug, Task→task, Story/Feature→feature, Epic→epic |
| Key | Label | Added as label for tracking (e.g., "PROJ-123") |
| Components | Label | Added as "component-{name}" label |
| - | Label | "jira-synced" label added to all synced issues |

### Sync Behavior

- **Create**: Issues not in beads are created with Jira key as a label
- **Update**: Existing issues (matched by Jira key label) are updated with latest description and priority
- **No Delete**: Issues are never deleted from beads (even if closed/removed in Jira)

## Advanced Usage

### Custom MCP URL

If you're using a different MCP server endpoint:

```bash
python3 scripts/sync_jira_to_beads.py PROJ \
  --mcp-url https://custom-mcp.example.com/v1/mcp
```

### Filtering by Multiple Criteria

Edit `sync_jira_to_beads.py` to add custom JQL filters:

```python
# In the query_jira_via_mcp method
jql_parts.append('labels = "backend"')
jql_parts.append('assignee = currentUser()')
```

### Running as a Cron Job

For periodic syncing (e.g., every hour):

```bash
# Add to crontab
0 * * * * cd /path/to/project && python3 scripts/sync_jira_to_beads.py PROJ --component backend-api
```

## Configuration

### .jira-beads-config

Edit this file to set default values:

```bash
# Jira-Beads Sync Configuration
JIRA_PROJECT_KEY="PROJ"
JIRA_COMPONENT="backend-api"
MCP_URL="https://mcp.atlassian.com/v1/mcp"
```

Then source it in scripts:

```bash
source .jira-beads-config
python3 scripts/sync_jira_to_beads.py $JIRA_PROJECT_KEY --component $JIRA_COMPONENT
```

### Git Hook Configuration

The post-merge hook is at `.git/hooks/post-merge`. Edit to customize:

```bash
# Change which branches trigger sync
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "develop" ]]; then
    # Skip sync
fi

# Change component filter
JIRA_COMPONENT="different-component"
```

## Troubleshooting

> 💡 **Quick fixes:** See [QUICKREF.md](QUICKREF.md#troubleshooting)  
> 🌐 **Offline issues:** See [OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md)

### Common Issues

#### "bd command not found"

**Cause:** Beads is not installed or not in PATH

**Solution:**
```bash
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash
# Restart your terminal or run: source ~/.bashrc  # or ~/.zshrc
which bd  # Should show the bd path
```

#### "MCP query failed"

**Cause:** MCP integration not implemented (expected behavior)

**Current behavior:** 
- Script uses example data in testing mode
- Returns empty list when offline (safe)

**To use real Jira data (requires implementation):**
1. Authenticate: `npx -y mcp-remote@0.1.13 https://mcp.atlassian.com/v1/mcp`
2. Keep MCP session running
3. Implement `_query_via_mcp_client()` method in script
4. Use MCP client library (Anthropic MCP SDK)

**Workaround for testing:**
```bash
# Use example data explicitly
python3 scripts/sync_jira_to_beads.py PROJ --use-example-data
```

See [OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md) for details on example data vs production usage.

#### "Not a beads repository"

**Cause:** Beads not initialized in current directory

**Solution:**
```bash
cd /path/to/project
bd init
```

#### Issues Not Syncing (Returns 0 issues)

**Possible causes:**
1. Offline/no network (expected - see [OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md))
2. Wrong project key
3. Component doesn't exist
4. No open issues in Jira

**Debug steps:**
```bash
# Check the JQL query being used
python3 scripts/sync_jira_to_beads.py PROJ --component backend-api

# Look for output:
# "📋 Querying Jira with JQL: project = PROJ AND component = 'backend-api' ..."

# Test this JQL directly in Jira web interface
# Go to Jira → Filters → Advanced search → Paste JQL
```

#### Git Hook Not Running

**Cause:** Hook not executable or wrong branch

**Solution:**
```bash
# Check hook exists
ls -la .git/hooks/post-merge

# Make executable
chmod +x .git/hooks/post-merge

# Test manually
.git/hooks/post-merge

# Check it only runs on main/master
git branch  # Should show * main or * master
```

### Getting Help

1. Check [QUICKREF.md](QUICKREF.md) for command syntax
2. Review [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md) for usage patterns
3. See [OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md) for network issues
4. Check beads documentation: https://github.com/steveyegge/beads

## Example Workflow

> 📖 **For detailed workflows:** See [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md)

### Daily Usage Pattern

```bash
# Morning: Pull latest code - this automatically syncs Jira issues via git hook
git pull origin main

# Output:
# Updating a1b2c3d..e4f5g6h
# Fast-forward
#  src/api/users.js | 45 ++++++++++++++++++++++++++++++++++++++++++
#  1 file changed, 45 insertions(+)
# 
# Running Jira sync...
# ============================================================
# 🔗 Jira to Beads Sync
# ============================================================
# ...
# Created:  2
# Updated:  3

# Check ready work
bd ready

# Your AI agent works with beads issues
# Updates are tracked locally in beads

# Evening: Push your changes
git add .
git commit -m "Implemented feature"
git push
```

For complete workflows including AI agent integration, see [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md).

## Integration with AI Agents

> 📖 **For complete AI integration examples:** See [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md#ai-agent-example-session)

The synced beads issues are perfect for AI coding agents. Here's a quick example:

```bash
# Agent queries available work
bd ready --json | jq '.[0]'

# Agent reads issue details
bd show bd-a1b2

# Agent sees Jira context in description:
# **Jira Issue:** [PROJ-234]
# **Status:** In Progress
# **Assignee:** Alice Johnson
# 
# Sessions are not being properly garbage collected...

# Agent creates dependencies for discovered work
bd create "Add missing tests" -t task -p 2
bd dep add bd-new1 bd-a1b2 --type discovered-from
```

### Configuring Your AI Agents

Add to your `AGENTS.md` or `.github/copilot-instructions.md`:

```markdown
## Issue Tracking

We use beads for issue tracking, which syncs from Jira.

Before starting work:
- Run `bd ready` to see available tasks
- Jira-synced issues are labeled with `jira-synced` and their Jira key
- Check issue descriptions for Jira metadata

When you discover new work related to a Jira issue:
- Create a new beads issue: `bd create "title" -t task -p 2`
- Link it: `bd dep add <new-issue> <jira-issue> --type discovered-from`
```

For detailed AI agent workflows, see [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md).

## Files

| File | Purpose |
|------|---------|
| `sync_jira_to_beads.py` | Main synchronization script |
| `install.sh` | Interactive installation wizard |
| `INDEX.md` | Package overview and navigation |
| `README.md` | Complete setup guide (this file) |
| `QUICKREF.md` | Quick command reference |
| `EXAMPLE_WORKFLOW.md` | Real-world usage scenarios |
| `OFFLINE_BEHAVIOR.md` | Network failure handling |

## Documentation Guide

**For humans:**
1. Start with [INDEX.md](INDEX.md) - Package overview
2. Read this file (README.md) - Setup and architecture
3. Check [QUICKREF.md](QUICKREF.md) - Command reference
4. Review [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md) - Daily workflow

**For AI agents:**
1. Read [QUICKREF.md](QUICKREF.md) - Command syntax
2. Study [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md) - Integration patterns
3. Reference this file - Field mappings and labels

**For troubleshooting:**
1. Check [QUICKREF.md](QUICKREF.md#troubleshooting) - Quick fixes
2. See [OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md) - Network issues
3. Review this file - Detailed troubleshooting

## Future Enhancements

Potential improvements:

- [ ] **Real MCP Integration** - Implement actual Atlassian Rovo MCP client
- [ ] **Bidirectional Sync** - Update Jira from beads changes
- [ ] **More Jira Fields** - Sync labels, custom fields, attachments
- [ ] **Conflict Resolution** - Handle concurrent updates
- [ ] **Multiple Projects** - Sync from multiple Jira projects
- [ ] **Web UI** - Monitor sync status and conflicts
- [ ] **Incremental Sync** - Only sync changed issues

## Contributing

This is a **working prototype** designed to be extended:

1. Fork/copy these files
2. Modify the sync logic in `sync_jira_to_beads.py`
3. Add custom field mappings
4. Implement real MCP integration
5. Share improvements!

See [INDEX.md](INDEX.md) for architecture details.

## Related Documentation

- **[INDEX.md](INDEX.md)** - Package overview and architecture
- **[QUICKREF.md](QUICKREF.md)** - Command reference
- **[EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md)** - Usage scenarios
- **[OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md)** - Network handling

## License

MIT - Same as [beads](https://github.com/steveyegge/beads)

## Credits

- Built on [beads](https://github.com/steveyegge/beads) by @steveyegge
- Uses [Atlassian Rovo MCP Server](https://support.atlassian.com/rovo/docs/atlassian-remote-mcp-server/)
- Inspired by the need for offline Jira access and AI agent integration
- Documentation follows **Agentic AI SDLC** best practices
