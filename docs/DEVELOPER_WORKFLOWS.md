# Developer Experience Guide

Complete workflows for different developer personas using Jira-Beads sync.

---

## 👤 Persona 1: Frontend Developer (Alice) - VueJS Project

**Profile:**
- Works on VueJS frontend
- Uses VS Code with GitHub Copilot
- Primarily works on UI features
- Gets tasks from Jira

### Initial Setup (One-Time)

```bash
# Day 1: Alice clones the project
cd ~/projects
git clone git@github.com:company/frontend-app.git
cd frontend-app

# Already has Node.js installed (for VueJS)
node --version  # v20.10.0 ✅

# Check if beads is installed
bd --version
# Not found? Install beads:
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash
# Restart terminal
bd --version  # ✅

# Run the Jira-Beads sync installer
./install.sh

# Interactive prompts:
# ✓ Found git repository at: /Users/alice/projects/frontend-app
# ✓ Found bd command
# ✓ Beads already initialized
# ✓ Created scripts directory
# ✓ Copied sync script to scripts/sync_jira_to_beads.js
#
# Configure git hook?
# This will run the Jira sync automatically after 'git pull'
# Install post-merge hook? (y/n) y
#
# Enter Jira project key (e.g., PROJ): FRONT
# Enter Jira component name (leave empty for all): ui-components
#
# ✓ Installed post-merge hook
# ✓ Created .jira-beads-config

# Initial sync to pull existing Jira issues
node scripts/sync_jira_to_beads.js FRONT --component ui-components

# Output:
# ============================================================
# 🔗 Jira to Beads Sync (Node.js)
# ============================================================
# Project: FRONT
# Component: ui-components
# ============================================================
#
# 📋 Querying Jira with JQL: project = FRONT AND component = "ui-components" AND status NOT IN (Done, Closed, Resolved)
#
# 🔄 Syncing 8 issues to beads...
#
# ✅ Created bd-a1b2 from FRONT-234
# ✅ Created bd-c3d4 from FRONT-235
# ✅ Created bd-e5f6 from FRONT-240
# ...
# ============================================================
# ✅ Sync Complete!
# ============================================================
# Created:  8
# Updated:  0
# Skipped:  0
```

### Daily Workflow

#### Morning Routine

```bash
# Alice starts her day
cd ~/projects/frontend-app

# Pull latest code - this automatically syncs Jira issues via git hook
git pull origin main

# Output shows code updates + Jira sync:
# Updating a1b2c3d..e4f5g6h
# Fast-forward
#  src/components/Button.vue | 45 +++++++++++++++++++
#  1 file changed, 45 insertions(+)
#
# 🔗 Jira to Beads Sync (Node.js)
# ...
# Created:  2  (new issues assigned this morning)
# Updated:  3  (priorities changed)
# Skipped:  0

# Check what's ready to work on
bd ready

# Output:
# bd-a1b2 [feature] Implement new dashboard layout (priority: 1)
# bd-c3d4 [bug] Fix button alignment on mobile (priority: 0)
# bd-e5f6 [feature] Add dark mode toggle (priority: 2)

# Alice picks the highest priority bug
bd show bd-c3d4

# Output:
# bd-c3d4
# Type: bug
# Priority: 0 (Highest)
# Status: ready
# Created: 2026-01-19
# Labels: FRONT-235, jira-synced, component-ui-components
#
# **Jira Issue:** [FRONT-235]
# **Status:** In Progress
# **Assignee:** Alice Smith
#
# Buttons are misaligned on mobile devices in the checkout flow.
# Users on iPhone report that "Continue" button is cut off...

# Start working on it
bd start bd-c3d4
# Status changed to: in-progress
```

#### Working with AI Assistant (Copilot)

```bash
# Alice opens VS Code
code .

# In Copilot Chat:
# Alice: "What should I work on?"
#
# Copilot runs: bd ready
# Copilot: "You have 3 ready tasks. The highest priority is bd-c3d4: 
#          'Fix button alignment on mobile'. This is a bug from Jira 
#          (FRONT-235) marked as Highest priority."
#
# Alice: "Show me the details"
#
# Copilot runs: bd show bd-c3d4
# Copilot: "This issue is about button misalignment on mobile in the 
#          checkout flow. The Jira assignee is Alice Smith (you). 
#          Status is 'In Progress' in Jira."
#
# Alice: "Start working on it"
#
# Copilot runs: bd start bd-c3d4
# Copilot: "Started working on bd-c3d4. Let me check the checkout 
#          component..."

# Alice discovers the issue while working
# Alice (in Copilot): "I found that we need to update the CSS media query"
#
# Copilot: "Should I create a subtask for updating the CSS?"
#
# Alice: "Yes, and link it to the current issue"
#
# Copilot runs:
bd create "Update mobile CSS media query for buttons" -t task -p 1
bd dep add bd-new1 bd-c3d4 --type discovered-from

# Alice continues working with Copilot's help
# Copilot suggests fixes, Alice reviews and commits
```

#### Finishing the Day

```bash
# Alice is done for the day but hasn't finished the bug
bd show bd-c3d4
# Status: in-progress

# She commits her work
git add .
git commit -m "WIP: Fix mobile button alignment (bd-c3d4 FRONT-235)"
git push

# Next morning, git pull will sync any new Jira updates
# The issue bd-c3d4 will still be in-progress locally
# If someone changed priority in Jira, it will update
```

#### When Issue is Complete

```bash
# Alice finishes the fix
bd done bd-c3d4

# Status changed to: done

# She commits and creates PR
git add .
git commit -m "Fix mobile button alignment (closes bd-c3d4 FRONT-235)"
git push
gh pr create --title "Fix mobile button alignment" \
  --body "Fixes bd-c3d4 / FRONT-235"

# After merge to main, the issue stays "done" in beads
# Jira still shows "In Progress" (one-way sync from Jira → beads)
# PM updates Jira to "Done" manually
```

---

## 👤 Persona 2: Backend Developer (Bob) - .NET API Project

**Profile:**
- Works on .NET Core API
- Uses Visual Studio + GitHub Copilot
- Handles backend features and bug fixes
- Prefers PowerShell on Windows

### Initial Setup (One-Time)

```powershell
# Day 1: Bob clones the project (Windows)
cd C:\projects
git clone git@github.com:company/backend-api.git
cd backend-api

# Doesn't have Node.js, but has .NET SDK
dotnet --version  # 8.0.101 ✅

# Install beads
# Downloads from https://github.com/steveyegge/beads/releases
# Adds to PATH

bd --version  # ✅

# Bob prefers .NET tooling, so installs dotnet-script
dotnet tool install -g dotnet-script

# Run the installer (PowerShell version)
.\install.ps1

# Interactive prompts (same as bash version):
# ...
# Enter Jira project key: BACK
# Enter Jira component name: api-auth
# ...

# Bob edits .jira-beads-config to use .NET version
# Changes: SYNC_SCRIPT=scripts/sync_jira_to_beads.cs

# Initial sync
dotnet script scripts/sync_jira_to_beads.cs -- BACK --component api-auth

# Or simpler: Bob creates a PowerShell alias
Set-Alias sync-jira 'dotnet script scripts/sync_jira_to_beads.cs --'
# Adds to $PROFILE for persistence

# Now can run:
sync-jira BACK --component api-auth
```

### Daily Workflow

#### Morning Routine

```powershell
# Bob starts his day
cd C:\projects\backend-api

# Pull latest code
git pull origin main

# Post-merge hook runs automatically:
# 🔗 Jira to Beads Sync (C#/.NET)
# ...
# Created:  1
# Updated:  2

# Check ready work
bd ready

# bd-g7h8 [feature] Implement OAuth2 refresh tokens (priority: 1)
# bd-i9j0 [bug] Memory leak in session handler (priority: 0)
# bd-k1l2 [feature] Add rate limiting middleware (priority: 2)

# Bob picks the memory leak bug
bd show bd-i9j0

# bd-i9j0
# Type: bug
# Priority: 0 (Highest)
# Status: ready
# Labels: BACK-567, jira-synced, component-api-auth
#
# **Jira Issue:** [BACK-567]
# **Status:** In Progress
# **Assignee:** Bob Johnson
#
# Sessions are not being properly garbage collected, causing
# memory usage to grow over time...

bd start bd-i9j0
```

#### Working with AI Assistant (Visual Studio Copilot)

```csharp
// Bob opens Visual Studio
// Opens SessionManager.cs

// In Copilot Chat:
// Bob: "@workspace What issue should I work on?"
//
// Copilot: (runs bd ready in terminal)
// "You have a critical bug bd-i9j0 (BACK-567) about memory leak 
//  in session handler. Priority: Highest."
//
// Bob: "Show me the session handler code"
//
// Copilot: (opens SessionManager.cs)
// "Here's the session handler. The issue is in the cleanup logic..."

// Bob discovers additional problems while fixing
// Bob: "@copilot I found that we're also missing null checks"
//
// Copilot: "Should I create a new beads issue for the null check fix?"
//
// Bob: "Yes, link it to the current issue"

// Copilot executes:
// bd create "Add null checks to session cleanup" -t task -p 2
// bd dep add bd-new1 bd-i9j0 --type discovered-from
```

#### Afternoon: Different Context

```powershell
# Bob needs to switch to a feature branch for different work
git checkout feature/oauth-refresh

# Beads issues stay the same (repo-level, not branch-specific)
bd ls
# Shows all issues including in-progress bd-i9j0

# Bob creates a new local-only issue for the feature work
bd create "Refactor token validation logic" -t task -p 2

# This is NOT synced from Jira - it's discovered work
# Label it appropriately
bd label add bd-new2 "local-only"

# Links it to the Jira-synced feature
bd dep add bd-new2 bd-g7h8 --type discovered-from

# Now Bob has:
# - bd-i9j0: From Jira, in-progress (bug fix)
# - bd-g7h8: From Jira, ready (OAuth feature)
# - bd-new2: Local only, ready (refactoring for OAuth)
```

#### End of Day

```powershell
# Bob finishes the memory leak fix
bd done bd-i9j0

git add .
git commit -m "Fix memory leak in session cleanup (bd-i9j0 BACK-567)"
git push
gh pr create --title "Fix session handler memory leak" --body "Closes bd-i9j0 / BACK-567"

# Still working on OAuth feature
bd show bd-g7h8
# Status: in-progress

# Commits work-in-progress
git commit -am "WIP: OAuth refresh token implementation (bd-g7h8 BACK-600)"
git push
```

---

## 👤 Persona 3: Full-Stack Developer (Charlie) - Multiple Repos

**Profile:**
- Works across backend (.NET) and frontend (VueJS)
- Uses both VS Code and Visual Studio
- Works on features spanning multiple repos
- Uses macOS

### Setup Across Multiple Repos

```bash
# Charlie works on 3 repos
cd ~/projects

# Frontend repo (VueJS)
cd frontend-app
./install.sh
# Uses: node scripts/sync_jira_to_beads.js
# Jira project: FRONT, component: checkout-flow

# Backend API repo (.NET)
cd ../backend-api
./install.sh
# Uses: node scripts/sync_jira_to_beads.js (Node.js on macOS)
# Jira project: BACK, component: checkout-service

# Mobile app repo (React Native)
cd ../mobile-app
./install.sh
# Uses: node scripts/sync_jira_to_beads.js
# Jira project: MOBILE, component: checkout

# Each repo has its own .beads database
# But Charlie can see related issues across repos
```

### Daily Workflow: Cross-Repo Feature

```bash
# Morning: Charlie pulls all repos
cd ~/projects
for repo in frontend-app backend-api mobile-app; do
  cd $repo
  git pull origin main  # Auto-syncs Jira for each
  cd ..
done

# Charlie is working on a checkout flow feature
# This spans all 3 repos

# Frontend issues
cd frontend-app
bd ready | grep checkout
# bd-f1 [feature] Update checkout UI for new payment flow (FRONT-450)

# Backend issues
cd ../backend-api
bd ready | grep checkout
# bd-b1 [feature] Add payment webhook endpoint (BACK-670)

# Mobile issues  
cd ../mobile-app
bd ready | grep checkout
# bd-m1 [feature] Implement payment screen (MOBILE-120)

# Charlie creates a tracking document
cat > ~/projects/checkout-epic.md << EOF
# Checkout Payment Flow Epic

## Related Issues
- Frontend: bd-f1 (FRONT-450) - Update checkout UI
- Backend: bd-b1 (BACK-670) - Add payment webhook
- Mobile: bd-m1 (MOBILE-120) - Implement payment screen

## Status
- [ ] Backend webhook endpoint
- [ ] Frontend UI updates
- [ ] Mobile payment screen
- [ ] Integration testing
EOF
```

#### Working Across Repos

```bash
# Charlie starts with backend
cd ~/projects/backend-api
bd start bd-b1

# Copilot helps implement the webhook
# Charlie discovers he needs a new DTO model

bd create "Create PaymentWebhookDTO model" -t task -p 1
bd dep add bd-new1 bd-b1 --type discovered-from

# After finishing backend work
bd done bd-new1
bd done bd-b1

# Push changes
git commit -am "Add payment webhook endpoint (bd-b1 BACK-670)"
git push

# Switch to frontend
cd ../frontend-app
bd start bd-f1

# While working, Charlie needs to check backend implementation
cd ../backend-api
git log --oneline | head -5
# See his recent commit

# Back to frontend
cd ../frontend-app

# Creates integration task
bd create "Integrate with new payment webhook" -t task -p 1
bd dep add bd-new1 bd-f1 --type discovered-from

# Copilot helps with integration
# Charlie tests against local backend

bd done bd-new1
bd done bd-f1
```

#### Syncing Throughout the Day

```bash
# Someone in the team updated Jira priorities
# Charlie syncs manually (doesn't want to wait for git pull)

cd ~/projects/frontend-app
node scripts/sync_jira_to_beads.js FRONT --component checkout-flow
# Updated:  1 (bd-f1 priority changed from 2 to 0)

cd ../backend-api
node scripts/sync_jira_to_beads.js BACK --component checkout-service
# Updated:  0

cd ../mobile-app
node scripts/sync_jira_to_beads.js MOBILE --component checkout
# Updated:  1 (bd-m1 assignee changed)
```

---

## 👤 Persona 4: Team Lead (Diana) - Oversight & Planning

**Profile:**
- Manages a team of 5 developers
- Reviews Jira weekly for sprint planning
- Uses beads to track discovered work
- Wants visibility into actual work vs planned work

### Setup

```bash
cd ~/projects

# Diana sets up sync for all team repos
for repo in repo1 repo2 repo3; do
  cd $repo
  ./install.sh
  # Configures each with appropriate Jira filters
done
```

### Weekly Workflow: Sprint Planning

```bash
# Monday: Sprint planning day
cd ~/projects/backend-api

# Sync latest Jira issues for the sprint
node scripts/sync_jira_to_beads.js BACK

# Created:  12  (new sprint issues)
# Updated:  5   (priorities adjusted)

# Review planned work
bd ready

# Diana sees:
# bd-a1 [feature] User profile API (priority: 1) - Alice
# bd-a2 [feature] Notification service (priority: 1) - Bob
# bd-a3 [bug] Login timeout fix (priority: 0) - Charlie
# ... 12 total from Jira

# Check all issues (including discovered work from last sprint)
bd ls --json | jq 'length'
# 47 total issues

# How many are from Jira vs discovered?
bd ls --json | jq '[.[] | select(.labels | contains(["jira-synced"]))] | length'
# 12 from Jira

bd ls --json | jq '[.[] | select(.labels | contains(["jira-synced"]) | not)] | length'
# 35 discovered during development

# Diana exports this for sprint review
bd ls --json | jq '[.[] | select(.labels | contains(["jira-synced"]) | not)] | 
  map({id, title, type, priority})' > discovered-work-sprint-15.json
```

### Daily Workflow: Team Standup

```bash
# Every morning before standup
cd ~/projects/backend-api
git pull origin main  # Syncs Jira

# Check team progress
bd ls --json | jq '[.[] | select(.status == "in-progress")] | 
  map({id, title, assignee: .labels | map(select(startswith("assignee-"))) })'

# Output shows:
# [
#   {
#     "id": "bd-a1",
#     "title": "User profile API",
#     "assignee": ["assignee-alice"]
#   },
#   {
#     "id": "bd-n5",  # Discovered work
#     "title": "Add caching layer for user queries",
#     "assignee": ["assignee-alice"]
#   }
# ]

# Diana sees Alice is working on discovered work (bd-n5)
# In standup: "Alice, I see you're working on a caching layer - 
#              is this blocking the profile API (bd-a1)?"
```

### End of Sprint: Metrics

```bash
# Friday: Sprint retrospective prep
cd ~/projects/backend-api

# Completed Jira issues
bd ls --json | jq '[.[] | 
  select(.status == "done" and .labels | contains(["jira-synced"]))] | length'
# 10 out of 12 planned (83% completion)

# Discovered work completed
bd ls --json | jq '[.[] | 
  select(.status == "done" and (.labels | contains(["jira-synced"]) | not))] | length'
# 18 discovered tasks completed

# Ratio of discovered to planned
# 18 / 10 = 1.8x discovered work

# Diana shares in retro:
# "We completed 83% of planned Jira work, but did 1.8x more 
#  discovered work. We need to either estimate better or push 
#  back on scope creep."

# Export for presentation
bd ls --json | jq '[.[] | select(.status == "done")] | 
  group_by(.labels | contains(["jira-synced"])) | 
  map({jira_synced: .[0].labels | contains(["jira-synced"]), count: length})'
```

---

## 👤 Persona 5: DevOps Engineer (Eve) - Automation

**Profile:**
- Maintains CI/CD pipelines
- Automates team workflows
- Uses Python for scripting
- Wants beads synced in CI

### Setup

```bash
# Eve uses Python version for scripting
cd ~/projects/backend-api
./install.sh

# Chooses Python version for integration with other DevOps tools
pip install -r requirements.txt  # No deps needed, uses subprocess
```

### CI/CD Integration

```yaml
# .github/workflows/sync-jira.yml
name: Sync Jira to Beads

on:
  schedule:
    - cron: '0 */4 * * *'  # Every 4 hours
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install beads
        run: |
          curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash
          echo "$HOME/.local/bin" >> $GITHUB_PATH
      
      - name: Sync Jira
        run: |
          python3 scripts/sync_jira_to_beads.py BACK --component api-core
        env:
          JIRA_TOKEN: ${{ secrets.JIRA_TOKEN }}
      
      - name: Export beads state
        run: |
          bd ls --json > beads-state.json
      
      - name: Upload state
        uses: actions/upload-artifact@v3
        with:
          name: beads-state
          path: beads-state.json
```

### Daily Workflow: Monitoring

```bash
# Eve checks sync status across all repos
for repo in repo1 repo2 repo3; do
  echo "=== $repo ==="
  cd ~/projects/$repo
  
  # Check last sync time
  git log --oneline --grep="Jira sync" -1
  
  # Check for sync errors
  git log --oneline --grep="MCP query failed" --since="1 day ago"
done

# If syncs failing, Eve investigates
cd ~/projects/backend-api
python3 scripts/sync_jira_to_beads.py BACK --component api-core

# Output shows:
# ❌ MCP query failed: Connection timeout
# ⚠️  Cannot sync without network connection to Jira.
# ℹ️  Your existing beads issues are still available offline.

# Eve checks network/firewall issues
# Meanwhile, devs can still work with existing beads issues
```

---

## 🔄 Common Patterns Across All Personas

### Pattern 1: Offline Work

```bash
# Developer is on a plane, no internet
git pull  # Fails or no new changes

# Jira sync fails gracefully
# ❌ MCP query failed: Network unreachable
# ℹ️  Your existing beads issues are still available offline.

# Can still work with existing issues
bd ready
bd start bd-existing
# ... work continues ...

# When back online, sync automatically happens on next git pull
```

### Pattern 2: New Jira Issue Assigned

```bash
# PM assigns new Jira issue PROJ-999 to developer

# Developer pulls latest
git pull origin main

# Auto-sync runs:
# Created:  1 (bd-new from PROJ-999)

# Developer sees new issue
bd ready
# bd-new [feature] New urgent feature (priority: 0)

bd show bd-new
# **Jira Issue:** [PROJ-999]
# **Status:** In Progress
# **Assignee:** Developer Name
# ...
```

### Pattern 3: Priority Change in Jira

```bash
# PM changes priority in Jira from Low to Highest

# Developer pulls or manually syncs
git pull origin main

# Auto-sync runs:
# Updated:  1 (bd-existing priority changed)

bd ready
# bd-existing now shows at top with priority: 0
```

### Pattern 4: Discovered Work During Development

```bash
# While working on Jira issue, developer finds technical debt
bd create "Refactor legacy auth code" -t task -p 2
bd dep add bd-new1 bd-jira-issue --type discovered-from

# This stays local in beads
# PM can see it in weekly sync review
# Can decide to create Jira issue if it's significant
```

---

## 📊 Summary: Initialization Times

| Persona | Initial Setup Time | Daily Overhead | Benefit |
|---------|-------------------|----------------|---------|
| **Frontend (Alice)** | 5 min | 0 sec (auto-sync) | Always has latest Jira context |
| **Backend (Bob)** | 7 min | 0 sec (auto-sync) | Native .NET tooling |
| **Full-Stack (Charlie)** | 15 min (3 repos) | 0 sec (auto-sync) | Cross-repo visibility |
| **Team Lead (Diana)** | 20 min (setup + scripts) | 2 min (daily checks) | Team metrics & planning |
| **DevOps (Eve)** | 30 min (CI/CD setup) | 5 min (monitoring) | Automated sync |

All personas benefit from:
- ✅ Offline-first (beads is local)
- ✅ AI agent integration (Copilot can query beads)
- ✅ Discovered work tracking (local issues + Jira issues)
- ✅ Automatic sync (git hooks)
- ✅ No context switching (stay in terminal/IDE)
