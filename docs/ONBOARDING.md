# 🚀 New Developer Onboarding Guide

Welcome to the team! This guide will help you get productive in **under 5 minutes**.

---

## Quick Start (Recommended)

Run the interactive onboarding wizard:

```bash
npm run onboard
```

The wizard will:
- ✅ Check all prerequisites (Node, Git, beads)
- ✅ Collect your configuration (Jira project, component)
- ✅ Initialize beads if needed
- ✅ Install sync scripts and git hooks
- ✅ Run a test sync with example data
- ✅ Show you next steps

**That's it!** The wizard handles everything automatically.

---

## What Gets Set Up

After onboarding completes, you'll have:

### 1. **Beads Repository**
```bash
.beads/                  # Local issue database
```

### 2. **Sync Scripts**
```bash
scripts/
  sync_jira_to_beads.js  # Main sync script
  sync_jira_to_beads.py  # Python version
  sync_jira_to_beads.cs  # C# version
```

### 3. **Git Hooks** (optional)
```bash
.git/hooks/
  post-merge             # Auto-sync on git pull
```

### 4. **Configuration**
```bash
.jira-beads-config       # Your Jira settings
```

### 5. **Workflow Helpers**
```bash
bd-start-branch          # Start work helper
bd-finish                # Finish work & create PR
```

---

## Your First Day

### Morning: Pull Latest Code

```bash
cd your-project
git pull origin main
```

If you installed the git hook, Jira issues sync automatically:
```
Updating a1b2c3d..e4f5g6h
Fast-forward
 ...

🔗 Jira to Beads Sync
============================================================
Created:  3
Updated:  1
Skipped:  0
============================================================
✅ Sync Complete!
```

### Check Available Work

```bash
bd ready
```

Output shows prioritized issues:
```
bd-a1b2 [bug] Fix login timeout (priority: 0)
bd-c3d4 [feature] Add user profile API (priority: 1)
bd-e5f6 [task] Update documentation (priority: 2)
```

### Start Working

Pick an issue and start:
```bash
npm run start -- bd-a1b2
```

This automatically:
1. Creates a feature branch (`feature/bd-a1b2-fix-login-timeout`)
2. Marks issue as "in-progress" in beads
3. Shows issue details

### Make Changes

Work normally with your tools:
```bash
# Edit code
code src/auth/login.js

# Test locally
npm test

# Commit changes
git add .
git commit -m "fix: resolve login timeout issue (bd-a1b2 PROJ-123)"
```

### Finish Work

When done, create a PR:
```bash
npm run finish -- bd-a1b2
```

This automatically:
1. Marks issue as "done" in beads
2. Pushes your branch
3. Creates a pull request
4. Links the PR to the beads issue

---

## Common Commands

### Sync Commands
```bash
npm run sync                    # Sync all Jira issues
npm run sync -- PROJ            # Sync specific project
npm run sync -- PROJ --component api  # Filter by component
```

### Beads Commands
```bash
bd ready                        # Show available work
bd show bd-xxx                  # Show issue details
bd start bd-xxx                 # Mark as in-progress
bd done bd-xxx                  # Mark as done
bd ls                           # List all issues
bd create "title" -t bug -p 1   # Create new local issue
```

### Workflow Commands
```bash
npm run start -- bd-xxx         # Start work (creates branch)
npm run finish -- bd-xxx        # Finish work (creates PR)
npm run config                  # Update configuration
```

---

## Working with Your Team

### Jira-Synced Issues

Issues from Jira have these labels:
- `jira-synced` - Synced from Jira
- `PROJ-123` - Jira issue key
- `component-api` - Component name (if any)

Check Jira metadata in description:
```bash
bd show bd-a1b2
```

Output:
```
**Jira Issue:** [PROJ-123]
**Status:** In Progress
**Assignee:** Your Name
**Priority:** Highest

Login times out after 5 minutes of inactivity...
```

### Discovered Work

You'll often find work not in Jira. Create local issues:
```bash
bd create "Refactor auth module" -t task -p 2
bd dep add bd-new1 bd-a1b2 --type discovered-from
```

This links your discovered work to the original Jira issue.

---

## Working with AI Agents

AI agents (like GitHub Copilot) can query beads directly:

```bash
# AI can check what you should work on
bd ready --json | jq '.[0]'

# AI can read issue details
bd show bd-a1b2

# AI can create related tasks
bd create "Add tests for auth" -t task -p 1
bd dep add bd-new1 bd-a1b2 --type discovered-from
```

**Tips for AI:**
- Beads issues are local and fast to query
- Jira metadata is in issue descriptions
- Use labels to filter (e.g., `jira-synced`, `component-api`)

---

## Troubleshooting

### "bd command not found"

Install beads:
```bash
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash
# Restart your terminal
```

### "Not a beads repository"

Initialize beads:
```bash
bd init
```

### "Sync returns 0 issues"

Possible causes:
1. **Offline** - This is OK! Beads works offline. Sync when back online.
2. **Wrong project key** - Check your `.jira-beads-config`
3. **No open issues** - Check Jira directly

Debug:
```bash
npm run sync -- PROJ --component api  # Try specific filters
```

### Git hook not running

Make executable:
```bash
chmod +x .git/hooks/post-merge
```

Test manually:
```bash
.git/hooks/post-merge
```

---

## Next Steps

### Day 1
- [x] Complete onboarding ✅
- [ ] Sync Jira issues: `npm run sync`
- [ ] Pick your first task: `bd ready`
- [ ] Start working: `npm run start -- bd-xxx`

### Week 1
- [ ] Read [DEVELOPER_WORKFLOWS.md](DEVELOPER_WORKFLOWS.md)
- [ ] Set up your IDE with beads
- [ ] Configure AI agent with beads commands
- [ ] Create your first discovered work issue

### Month 1
- [ ] Review [QUICKREF.md](QUICKREF.md) for advanced commands
- [ ] Set up custom beads labels for your workflow
- [ ] Share feedback on the onboarding process

---

## Getting Help

### Quick References
- **[QUICKREF.md](QUICKREF.md)** - Command cheat sheet
- **[EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md)** - Real-world examples
- **[DEVELOPER_WORKFLOWS.md](DEVELOPER_WORKFLOWS.md)** - Detailed workflows

### Documentation by Role
- **Frontend Developer** - See Alice's workflow in DEVELOPER_WORKFLOWS.md
- **Backend Developer** - See Bob's workflow in DEVELOPER_WORKFLOWS.md
- **Full-Stack Developer** - See Charlie's workflow in DEVELOPER_WORKFLOWS.md
- **Team Lead** - See Diana's workflow in DEVELOPER_WORKFLOWS.md

### Common Questions

**Q: Do I need to update Jira when I finish work?**  
A: No, this is one-way sync (Jira → beads). Your PM updates Jira.

**Q: Can I work offline?**  
A: Yes! Beads is local. Sync when you have network again.

**Q: What if priority changes in Jira?**  
A: Run `npm run sync` or wait for next `git pull` - it auto-updates.

**Q: Can I create my own issues?**  
A: Yes! Use `bd create`. These stay local unless you add them to Jira.

**Q: How do I see all my work (Jira + local)?**  
A: `bd ls` shows everything. Jira issues have `jira-synced` label.

---

## Configuration Reference

Your `.jira-beads-config` file:

```bash
# Jira Configuration
JIRA_PROJECT_KEY="PROJ"         # Your project key
JIRA_COMPONENT="api"            # Component filter (optional)
MCP_URL="https://mcp.atlassian.com/v1/mcp"  # MCP endpoint

# Sync Settings
AUTO_SYNC_ON_PULL=true          # Auto-sync on git pull
SYNC_SCRIPT="scripts/sync_jira_to_beads.js"  # Which script to use
```

Edit this file to change your defaults.

---

## Pro Tips

### Speed Up Your Workflow

1. **Create aliases** in your shell config:
   ```bash
   alias bdr="bd ready"
   alias bds="npm run sync"
   alias bdstart="npm run start --"
   alias bdfinish="npm run finish --"
   ```

2. **Use tab completion** for issue IDs in your shell

3. **Set up VS Code tasks** for common commands:
   ```json
   {
     "label": "Sync Jira",
     "type": "shell",
     "command": "npm run sync"
   }
   ```

### Stay Organized

1. **Review ready work daily**: `bd ready` shows prioritized backlog
2. **Clean up done issues weekly**: Archive completed work
3. **Link discovered work**: Always use `bd dep add` to track relationships

### Work Smarter

1. **Let AI help**: Configure Copilot to query beads
2. **Batch sync**: Run sync in morning, work offline all day
3. **Use examples**: Check EXAMPLE_WORKFLOW.md for patterns

---

## Welcome Aboard! 🎉

You're all set! Questions? Ask your team or check the docs.

**Quick links:**
- [QUICKREF.md](QUICKREF.md) - Command reference
- [DEVELOPER_WORKFLOWS.md](DEVELOPER_WORKFLOWS.md) - Daily workflows
- [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md) - Real examples

Happy coding! 🚀
