# Quick Reference - Jira-Beads Sync

**Fast command reference for daily use. See [README.md](README.md) for detailed explanations.**

---

## 🚀 Workflow Helpers (Recommended)

### Start Working on Issue
```bash
# Automatically creates branch and starts issue
npm run start -- bd-a1b2

# Or: node run start bd-a1b2

# Example output:
# ✓ Created branch: bug/FRONT-235-fix-button-alignment
# ✓ Started issue: bd-a1b2
```

### Finish Issue
```bash
# Automatically marks done, pushes, and creates PR
npm run finish -- bd-a1b2

# Or: node run finish bd-a1b2

# Options:
npm run finish -- bd-a1b2 --draft      # Draft PR
node run finish bd-a1b2 --draft        # Same
```

**See [WORKFLOW_HELPERS.md](WORKFLOW_HELPERS.md) for complete guide.**

---

## Installation (One-Time)

```bash
# Automated installation
./install.sh    # Linux/macOS
.\install.ps1   # Windows

# Or using npm
npm run install
```

---

## Core Sync Commands

```bash
# Sync all issues from a project (npm)
npm run sync -- PROJECTKEY

# Sync specific component (npm)
npm run sync -- PROJECTKEY --component backend-api

# Or using run.js directly
node run sync PROJECTKEY
node run sync PROJECTKEY --component backend-api

# Test with example data
npm run test
# or: node run test

# Show config
npm run config
# or: node run config
```

---

## Beads Commands (After Sync)

### View Synced Issues
```bash
# All Jira-synced issues
bd list --label jira-synced

# Specific Jira component
bd list --label component-backend-api

# Specific Jira issue
bd list --label PROJ-123

# Ready to work on
bd ready
```

### Work with Issues
```bash
# Show details
bd show <issue-id>

# Start work
bd start <issue-id>

# Mark done
bd done <issue-id>

# Check dependencies
bd deps <issue-id>
```

### Link Discovered Work
```bash
# Create local issue
bd create "New subtask discovered" -p 1 -t task

# Link to Jira issue
bd dep add <new-issue-id> <jira-issue-id> --type discovered-from
```

---

## Git Hook (Automatic Sync)

**Runs automatically on:**
- `git pull` (main/master branch)
- `git merge` (main/master branch)

**Manage hook:**
```bash
# Check if installed
ls -la .git/hooks/post-merge

# Disable
mv .git/hooks/post-merge .git/hooks/post-merge.disabled

# Enable
mv .git/hooks/post-merge.disabled .git/hooks/post-merge

# Remove
rm .git/hooks/post-merge
```

---

## Field Mappings

### Priority
| Jira | Beads | Notes |
|------|-------|-------|
| Highest | 0 | Critical/Blocker |
| High | 1 | High priority |
| Medium | 2 | Normal (default) |
| Low | 3 | Low priority |
| Lowest | 4 | Minimal priority |

### Type
| Jira | Beads |
|------|-------|
| Bug | bug |
| Task | task |
| Story | feature |
| Feature | feature |
| Epic | epic |
| Sub-task | task |

### Labels (Auto-Added)
Every synced issue gets:
- `jira-synced` - Identifies all Jira issues
- `PROJ-123` - The actual Jira key
- `component-backend-api` - Component name (if specified)

---

## Common Workflows

### Morning Routine
```bash
git pull                    # Auto-syncs via hook
bd ready                    # See available work
bd show <id>                # Review specific issue
bd start <id>               # Begin work
```

### AI Agent Integration
```bash
# Agent queries for work
bd ready --json | jq '.[0]'

# Agent reads issue
bd show <id>

# Agent updates status
bd update <id> --status in_progress

# Agent creates related work
bd create "Implement login validation" -p 1
bd dep add <new-id> <jira-id> --type discovered-from

# Agent marks complete
bd done <id>
```

### End of Day
```bash
bd list --status in_progress    # Review your work
git add . && git commit -m "..."
git push
```

---

## Troubleshooting

### Sync Issues

**bd command not found**
```bash
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash
```

**Not a beads repository**
```bash
bd init
```

**Sync creates no issues**
- Check you're online (no network = no sync, see [OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md))
- Verify Jira project key is correct
- Check component exists in Jira
- Run with verbose errors: `python3 scripts/sync_jira_to_beads.py PROJ 2>&1`

**MCP query failed**
- Currently expected (uses example data by default)
- To use real MCP: Authenticate with `npx -y mcp-remote@0.1.13 https://mcp.atlassian.com/v1/mcp`
- Keep MCP session running

### Git Hook Issues

**Hook not running**
```bash
# Check exists and is executable
ls -la .git/hooks/post-merge
chmod +x .git/hooks/post-merge

# Test manually
.git/hooks/post-merge
```

**Hook creates fake issues**
- Remove `--use-example-data` flag from hook
- See [OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md)

### Offline Issues

**What happens offline?**
- See [OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md) for details
- TL;DR: Script fails gracefully, no fake data created

---

## Advanced Usage

### Custom JQL Filtering

Edit `sync_jira_to_beads.py` around line 30:

```python
def query_jira_via_mcp(self) -> List[Dict]:
    jql_parts = [f'project = {self.project_key}']
    
    # Add your custom filters
    jql_parts.append('assignee = currentUser()')
    jql_parts.append('labels = "urgent"')
    jql_parts.append('sprint in openSprints()')
    jql_parts.append('status NOT IN (Done, Closed, Resolved)')
```

### Periodic Sync (Cron)

```bash
# Edit crontab
crontab -e

# Hourly sync
0 * * * * cd /path/to/project && python3 scripts/sync_jira_to_beads.py PROJ --component backend

# Daily at 9am
0 9 * * * cd /path/to/project && python3 scripts/sync_jira_to_beads.py PROJ
```

### Multiple Components

```bash
# Create wrapper script: scripts/sync_all.sh
#!/bin/bash
python3 scripts/sync_jira_to_beads.py PROJ --component backend
python3 scripts/sync_jira_to_beads.py PROJ --component frontend
python3 scripts/sync_jira_to_beads.py PROJ --component mobile

# Run all syncs
./scripts/sync_all.sh
```

---

## Configuration Files

```
.beads/                          # Beads database (created by bd init)
scripts/sync_jira_to_beads.py   # Main sync script
.git/hooks/post-merge           # Auto-sync git hook
```

---

## For AI Agents

**Key commands for autonomous operation:**

```bash
# Get available work (JSON output)
bd ready --json

# Read specific issue
bd show <id> --json

# Update issue status
bd update <id> --status in_progress

# Create discovered work
bd create "title" -d "description" -p 1 -t task --json

# Link to parent
bd dep add <child-id> <parent-id> --type discovered-from

# Mark complete
bd done <id>
```

**Integration points:**
- See [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md) for full AI agent examples
- Add to your `AGENTS.md` or `.github/copilot-instructions.md`
- Use `--json` flag for all commands for structured output

---

## Documentation Links

- **[INDEX.md](INDEX.md)** - Package overview and navigation
- **[README.md](README.md)** - Complete setup and architecture
- **[EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md)** - Real-world scenarios
- **[OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md)** - Network failure handling

---

## Exit Codes

```
0 - Success (sync completed or safely skipped)
1 - Errors during sync (check stderr output)
130 - User cancelled (Ctrl+C)
```

---

**Need more detail?** See [README.md](README.md) or [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md)
