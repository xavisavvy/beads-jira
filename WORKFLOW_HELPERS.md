# Workflow Automation Reference

Quick reference for `bd-start-branch` and `bd-finish` workflow helpers.

## 🚀 bd-start-branch

**Automatically create a feature branch and start working on a beads issue.**

### Usage

```bash
# npm (recommended - works everywhere)
npm run start -- bd-a1b2

# Or using run.js directly
node run start bd-a1b2

# Or direct scripts
./scripts/bd-start-branch bd-a1b2          # Linux/macOS
.\scripts\bd-start-branch.ps1 bd-a1b2      # Windows
node scripts/bd-start-branch.js bd-a1b2    # Cross-platform
```

### What It Does

1. ✅ Reads issue details from beads
2. ✅ Extracts Jira key from labels (e.g., `FRONT-234`)
3. ✅ Creates branch with naming convention:
   - `feature/JIRA-123-descriptive-title`
   - `bug/JIRA-456-fix-something`
   - `task/JIRA-789-refactor-code`
4. ✅ Checks out the new branch
5. ✅ Marks issue as "in-progress" in beads

### Branch Naming Convention

| Issue Type | Jira Key | Title | Branch Name |
|------------|----------|-------|-------------|
| feature | FRONT-234 | "Add dark mode toggle" | `feature/FRONT-234-add-dark-mode-toggle` |
| bug | BACK-567 | "Fix memory leak in session handler" | `bug/BACK-567-fix-memory-leak-in-session-handler` |
| task | MOBILE-120 | "Refactor API calls" | `task/MOBILE-120-refactor-api-calls` |

**No Jira key?** Falls back to issue ID:
- `feature/bd-a1b2-add-dark-mode-toggle`

### Example Session

```bash
$ ./scripts/bd-start-branch bd-a1b2

Starting issue bd-a1b2...
📋 Issue: Fix button alignment on mobile
🏷️  Type: bug
🎫 Jira: FRONT-235
🌿 Branch: bug/FRONT-235-fix-button-alignment-on-mobile

✓ Created and checked out branch: bug/FRONT-235-fix-button-alignment-on-mobile
✓ Started issue: bd-a1b2

🚀 Ready to work!

Next steps:
  1. Make your changes
  2. Commit with: git commit -m "Your message (bd-a1b2 FRONT-235)"
  3. When done: bd done bd-a1b2
  4. Push and create PR
```

### Safety Checks

- ⚠️ **Uncommitted changes?** Prompts to continue or abort
- ⚠️ **Not on main/master?** Prompts to create from current branch
- ⚠️ **Branch exists?** Prompts to check it out instead

---

## 🏁 bd-finish

**Mark an issue as done, push the branch, and create a pull request.**

### Usage

```bash
# npm (recommended - works everywhere)
npm run finish -- bd-a1b2                # Standard PR
npm run finish -- bd-a1b2 --draft        # Draft PR

# Or using run.js directly
node run finish bd-a1b2
node run finish bd-a1b2 --draft

# Or direct scripts
./scripts/bd-finish bd-a1b2              # Linux/macOS
.\scripts\bd-finish.ps1 bd-a1b2          # Windows
node scripts/bd-finish.js bd-a1b2        # Cross-platform
```

### What It Does

1. ✅ Reads issue details from beads
2. ✅ Checks for uncommitted changes (requires clean state)
3. ✅ Marks issue as "done" in beads
4. ✅ Pushes current branch to remote
5. ✅ Detects git platform (GitHub, Bitbucket, GitLab, other)
6. ✅ Creates pull request with appropriate CLI or manual URL

### Supported Platforms

| Platform | CLI Tool | Detection |
|----------|----------|-----------|
| **GitHub** | `gh` | `github.com` in remote URL |
| **Bitbucket** | `bb` | `bitbucket.org` in remote URL |
| **GitLab** | `glab` | `gitlab.com` in remote URL |
| **Self-hosted** | - | URL pattern matching |
| **Other** | - | Manual URL provided |

### PR Template

For Jira-synced issues:
```markdown
JIRA-123: Fix button alignment on mobile

## Changes
- 

## Testing
- 

## Related
- Jira: JIRA-123
- Beads: bd-a1b2
```

For local-only issues:
```markdown
Fix button alignment on mobile

## Changes
- 

## Testing
- 
```

### Example Session

```bash
$ ./scripts/bd-finish bd-a1b2

Finishing issue bd-a1b2...
📋 Issue: Fix button alignment on mobile
🏷️  Type: bug
🎫 Jira: FRONT-235

✓ Marked issue as done
🌿 Current branch: bug/FRONT-235-fix-button-alignment-on-mobile
Pushing to remote...
✓ Pushed to origin/bug/FRONT-235-fix-button-alignment-on-mobile
🔗 Remote: git@github.com:company/frontend-app.git
📦 Platform: github

Creating GitHub PR...
✓ Pull request created!

🎉 All done!

Issue bd-a1b2 is marked as done.
Branch bug/FRONT-235-fix-button-alignment-on-mobile has been pushed.
```

### Platform-Specific Behavior

#### GitHub (with `gh` CLI)
```bash
# Creates PR with title and body
gh pr create --title "FRONT-235: Fix button alignment on mobile" \
  --body "Closes bd-a1b2 / FRONT-235..."

# Draft PR
gh pr create --title "..." --body "..." --draft
```

#### Bitbucket (with `bb` CLI)
```bash
# Creates PR
bb pr create --title "FRONT-235: Fix button alignment on mobile" \
  --description "Closes bd-a1b2 / FRONT-235..."
```

#### GitLab (with `glab` CLI)
```bash
# Creates Merge Request
glab mr create --title "FRONT-235: Fix button alignment on mobile" \
  --description "Closes bd-a1b2 / FRONT-235..."

# Draft MR
glab mr create --title "..." --description "..." --draft
```

#### No CLI Installed?
Provides manual URL:
```
⚠️  'gh' CLI not installed.
Install it: https://cli.github.com/

Or create PR manually:
  https://github.com/company/frontend-app/compare/bug/FRONT-235-fix-button-alignment-on-mobile?expand=1
```

### Safety Checks

- ⚠️ **Uncommitted changes?** Aborts and asks to commit first
- ⚠️ **On main/master?** Skips PR creation (no branch to merge)

---

## 🔄 Complete Workflow Example

### Start to Finish

```bash
# Morning: Sync Jira issues
git pull origin main
# Auto-syncs via post-merge hook

# Pick an issue to work on
bd ready
# bd-a1b2 [bug] Fix button alignment on mobile (priority: 0)

# Start working (creates branch automatically)
npm run start -- bd-a1b2
# ✓ Created branch: bug/FRONT-235-fix-button-alignment-on-mobile
# ✓ Started issue: bd-a1b2

# Make changes
vim src/components/Button.vue

# Commit work
git add .
git commit -m "Fix mobile button alignment (bd-a1b2 FRONT-235)"

# Finish and create PR (all in one)
npm run finish -- bd-a1b2
# ✓ Marked issue as done
# ✓ Pushed to origin
# ✓ Created GitHub PR

# Done! 🎉
```

### With AI Assistant (Copilot)

```bash
# In VS Code/Terminal
> @copilot I want to work on bd-a1b2

# Copilot runs:
npm run start -- bd-a1b2

# You work together with Copilot...

# When done:
> @copilot I'm done with this issue

# Copilot runs:
npm run finish -- bd-a1b2
```

---

## 🛠️ Installation

These scripts are automatically installed by `install.sh` or `install.ps1`:

```bash
# Installed to:
scripts/bd-start-branch       # Bash version
scripts/bd-start-branch.ps1   # PowerShell version
scripts/bd-start-branch.js    # Node.js version
scripts/bd-finish             # Bash version
scripts/bd-finish.ps1         # PowerShell version
scripts/bd-finish.js          # Node.js version
```

### Optional: Add to PATH

```bash
# Linux/macOS
echo 'export PATH="$PATH:~/projects/your-repo/scripts"' >> ~/.bashrc

# Then use anywhere:
bd-start-branch bd-a1b2
bd-finish bd-a1b2
```

```powershell
# PowerShell
$env:PATH += ";C:\projects\your-repo\scripts"

# Add to $PROFILE for persistence
Add-Content $PROFILE '$env:PATH += ";C:\projects\your-repo\scripts"'
```

### Optional: Create Aliases

```bash
# Linux/macOS (~/.bashrc or ~/.zshrc)
alias bds='./scripts/bd-start-branch'
alias bdf='./scripts/bd-finish'

# Then:
bds bd-a1b2
bdf bd-a1b2
```

```powershell
# PowerShell ($PROFILE)
Set-Alias bds '.\scripts\bd-start-branch.ps1'
Set-Alias bdf '.\scripts\bd-finish.ps1'

# Then:
bds bd-a1b2
bdf bd-a1b2
```

---

## 🎯 Platform CLI Installation

### GitHub CLI (`gh`)
```bash
# macOS
brew install gh

# Windows (winget)
winget install --id GitHub.cli

# Linux
# See: https://cli.github.com/manual/installation
```

### Bitbucket CLI (`bb`)
```bash
# npm
npm install -g bitbucket-cli

# Or see: https://bitbucket.org/product/cli
```

### GitLab CLI (`glab`)
```bash
# macOS
brew install glab

# Windows (scoop)
scoop install glab

# Linux
# See: https://gitlab.com/gitlab-org/cli
```

---

## 📊 Comparison

| Workflow | Without Helpers | With Helpers |
|----------|----------------|--------------|
| **Start Work** | 4 commands | 1 command |
| **Finish Work** | 4 commands | 1 command |
| **Total Commands** | 8 | 2 |
| **Time Saved** | - | ~2 minutes per issue |

### Traditional Workflow (8 commands)
```bash
bd ready
bd show bd-a1b2
bd start bd-a1b2
git checkout -b feature/FRONT-234-fix-button-alignment
# ... work ...
bd done bd-a1b2
git push -u origin feature/FRONT-234-fix-button-alignment
gh pr create --title "..." --body "..."
```

### With Helpers (2 commands)
```bash
./scripts/bd-start-branch bd-a1b2
# ... work ...
./scripts/bd-finish bd-a1b2
```

---

## 💡 Tips

1. **Draft PRs**: Use `--draft` flag to create work-in-progress PRs
2. **No Push**: Use `--no-push` to just mark done locally without creating PR
3. **Branch Naming**: Branch names are auto-sanitized (lowercase, hyphens, max 50 chars)
4. **Safety First**: Both scripts check for uncommitted changes and confirm risky actions
5. **AI Integration**: These scripts work great with Copilot/Claude - just ask them to run!

---

## 🔗 Related

- [DEVELOPER_WORKFLOWS.md](DEVELOPER_WORKFLOWS.md) - Detailed developer personas and workflows
- [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md) - Real-world usage scenarios
- [QUICKREF.md](QUICKREF.md) - Quick command reference
