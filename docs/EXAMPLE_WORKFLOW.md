# Example Workflow: Using Jira-Beads Sync

This document shows a real-world example of how to use the Jira-Beads sync integration in your daily development workflow.

## Scenario

You're a developer working on a web application project. Your team uses Jira for project management, but you want to:
- Work with issues offline
- Let AI coding agents access your issue tracker
- Create local sub-issues without polluting Jira
- Track discovered work separately from planned Jira work

## Initial Setup (One-time)

### Day 0: Installation

```bash
# Navigate to your project
cd ~/projects/my-web-app

# Install beads if not already installed
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# Initialize beads in your project
bd init

# Copy the Jira sync files to your project
git clone https://example.com/jira-beads-sync.git /tmp/jira-sync
cp /tmp/jira-sync/sync_jira_to_beads.py scripts/
cp /tmp/jira-sync/install.sh .

# Run installation
./install.sh
# Prompts:
#   Project key: WEBAPP
#   Component: backend-api
#   Install git hook? (y/n): y

# Configure Atlassian MCP (one-time OAuth)
npx -y mcp-remote@0.1.13 https://mcp.atlassian.com/v1/mcp
# Opens browser for authentication
# Keep this terminal running OR configure in Claude Desktop
```

### Configure your editor/AI

Add to `.github/copilot-instructions.md` or `AGENTS.md`:

```markdown
## Issue Tracking

We use beads for local issue tracking, synced from Jira.

Before starting work:
- Check ready issues: `bd ready`
- Jira-synced issues have the `jira-synced` label
- Create local sub-issues for discovered work
- Link them: `bd dep add <local-issue> <jira-issue> --type discovered-from`
```

## Daily Workflow

### Morning: Sync Latest Issues

```bash
# Pull latest code - this automatically syncs Jira issues via git hook
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
# Project: WEBAPP
# Component: backend-api
# 
# ✅ Found 5 Jira issues
# 
# 🔄 Processing WEBAPP-234...
#    ✅ Created bd-a1b2
# 🔄 Processing WEBAPP-235...
#    ✅ Created bd-c3d4
# 🔄 Processing WEBAPP-236...
#    Found existing beads issue: bd-e5f6
#    ✅ Updated bd-e5f6
# ...
# 
# 📊 Sync Summary
# Created:  2
# Updated:  3
```

### View Available Work

```bash
# See what's ready to work on
bd ready

# Output:
# Ready Issues (priority 0-1):
# 
# bd-a1b2 [bug] Fix memory leak in session handler (P0)
#   Labels: jira-synced, WEBAPP-234, component-backend-api
#   
# bd-c3d4 [task] Implement user authentication (P1)
#   Labels: jira-synced, WEBAPP-235, component-backend-api

# Look at a specific issue
bd show bd-a1b2

# Output:
# Issue: bd-a1b2
# Title: Fix memory leak in session handler
# Type: bug
# Priority: 0 (Highest)
# Status: ready
# Labels: jira-synced, WEBAPP-234, component-backend-api
# 
# Description:
# **Jira Issue:** [WEBAPP-234]
# **Status:** In Progress
# **Assignee:** Alice Johnson
# 
# Sessions are not being properly garbage collected after
# user logout. This causes memory usage to grow over time...
```

### Working with AI Agents

Start working on an issue using GitHub Copilot or Claude:

```bash
# Tell your AI agent to start work
# (In your editor or CLI)

You: "@workspace I want to work on bd-a1b2 - the memory leak issue"

# The AI agent can:
# 1. Read the full issue with `bd show bd-a1b2`
# 2. See it's from Jira (WEBAPP-234)
# 3. Understand priority and context
# 4. Start the work
bd start bd-a1b2

You: "As you investigate, create beads issues for any related work you discover"
```

### Discovering Additional Work

While working, your AI agent or you discover related issues:

```bash
# AI discovers that tests are missing
bd create "Add tests for session cleanup" \
  -t task \
  -p 2 \
  -d "Need unit tests to verify session cleanup works correctly. Discovered while fixing WEBAPP-234." \
  -l "testing,session-management"

# Output: Created bd-x7y8

# Link it to the Jira issue
bd dep add bd-x7y8 bd-a1b2 --type discovered-from

# AI discovers a related bug
bd create "Session timeout not configurable" \
  -t feature \
  -p 3 \
  -d "Session timeout is hardcoded. Should be configurable. Related to WEBAPP-234."

# Output: Created bd-z9w1

bd dep add bd-z9w1 bd-a1b2 --type related-to
```

### Checking Your Work

```bash
# See the full dependency tree
bd deps bd-a1b2

# Output:
# Dependencies for bd-a1b2:
# 
# bd-a1b2 [bug] Fix memory leak in session handler
#   └─ discovered-from:
#      ├─ bd-x7y8 [task] Add tests for session cleanup
#      └─ bd-z9w1 [feature] Session timeout not configurable

# View your current work in progress
bd list --status in-progress

# Output:
# bd-a1b2 [bug] Fix memory leak in session handler (P0)
# bd-x7y8 [task] Add tests for session cleanup (P2)
```

### Completing Work

```bash
# Mark the Jira issue as done locally
bd done bd-a1b2

# Mark discovered work as done too
bd done bd-x7y8

# Commit your changes
git add .
git commit -m "Fix session memory leak (WEBAPP-234)

- Fixed session cleanup after logout
- Added unit tests for session lifecycle
- Sessions now properly garbage collected

Fixes: WEBAPP-234"

git push origin feature/fix-session-leak
```

### Update Jira Manually

Since this is one-way sync (Jira → Beads), update Jira:

1. Open Jira issue WEBAPP-234
2. Add comment: "Fixed in PR #123. Also added missing tests."
3. Move to "Done" column

> **Future Enhancement**: Bidirectional sync could automate this!

## Weekly: Manual Sync

If you want to sync without pulling:

```bash
# Sync all open issues from your component
python3 scripts/sync_jira_to_beads.py WEBAPP --component backend-api

# Or sync entire project
python3 scripts/sync_jira_to_beads.py WEBAPP

# Or sync different component
python3 scripts/sync_jira_to_beads.py WEBAPP --component frontend
```

## Advanced Workflow: Multiple Projects

Working on multiple projects:

```bash
# Morning: Sync all your active projects
cd ~/projects/web-app
git pull  # Syncs WEBAPP issues

cd ~/projects/mobile-app  
git pull  # Syncs MOBILE issues

cd ~/projects/api-service
git pull  # Syncs API issues

# View all ready work across projects
bd ready --all-repos

# AI agent can now see all your work across repositories
```

## Advanced: Custom Filtering

Edit `scripts/sync_jira_to_beads.py` to sync only your assigned issues:

```python
def query_jira_via_mcp(self) -> List[Dict]:
    # ... existing code ...
    
    jql_parts.append('assignee = currentUser()')  # Add this line
    jql_parts.append('status NOT IN (Done, Closed, Resolved)')
    
    jql = ' AND '.join(jql_parts)
```

Now sync only pulls YOUR issues:

```bash
python3 scripts/sync_jira_to_beads.py WEBAPP
# Only syncs issues assigned to you
```

## Integration with Team Workflow

### Standup Preparation

```bash
# What did you work on yesterday?
bd list --status done --updated-since yesterday

# What are you working on today?
bd list --status in-progress

# Any blockers?
bd list --blocked
```

### Sprint Planning

```bash
# See all Jira issues for current sprint
bd list --label jira-synced --label sprint-42

# Group by priority
bd list --label jira-synced --sort priority

# See issues you discovered that might need Jira tickets
bd list --not-label jira-synced --status ready
# These are local issues you created - consider adding to Jira
```

## Offline Work

When you're on a plane or have no internet:

```bash
# You already have all Jira issues synced locally
bd ready

# Work normally - create issues, link dependencies, etc.
bd create "Optimize database query" -t task -p 2
bd start bd-new-issue

# When back online, manually create Jira tickets for important discoveries
# Or wait for bidirectional sync feature!
```

## AI Agent Example Session

Here's what an AI agent sees:

```
Agent: "Let me check what work is available"
> bd ready --json

Agent: "I see bd-a1b2 is highest priority. Let me read it."
> bd show bd-a1b2

Agent: "This is from Jira issue WEBAPP-234. It's a memory leak in session 
       handling. Let me examine the session manager code..."
> grep -r "session" src/

Agent: "I found the issue in src/api/session.js. I'll fix it."
> [makes code changes]

Agent: "I should add tests for this."
> bd create "Add session cleanup tests" -t task -p 2 -l "testing"
> bd dep add bd-x7y8 bd-a1b2 --type discovered-from

Agent: "I'll implement the tests too..."
> [creates test file]

Agent: "All done. Let me mark both as complete."
> bd done bd-a1b2
> bd done bd-x7y8
```

## Benefits You Get

1. **Offline Access**: Work on Jira issues without internet
2. **AI Integration**: Agents can read/write issues without Jira API complexity
3. **Local Discovery**: Track discovered work without creating Jira noise
4. **Dependency Tracking**: Link local work to Jira issues
5. **Automatic Updates**: Git hook keeps issues fresh
6. **Flexibility**: Filter, search, organize locally however you want

## Summary

This workflow gives you the best of both worlds:
- **Jira** for team coordination and project management
- **Beads** for local development, AI agents, and offline work
- Automatic sync keeps them aligned with minimal effort
