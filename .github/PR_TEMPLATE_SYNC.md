# PR Template Synchronization

This document explains how PR/MR templates are kept in sync across platforms.

---

## 📁 Template Locations

| Platform | Path | Notes |
|----------|------|-------|
| **GitHub** | `.github/pull_request_template.md` | Master template |
| **GitLab** | `.gitlab/merge_request_templates/Default.md` | Auto-synced |
| **Bitbucket** | N/A | Not supported (see below) |

---

## 🔄 How It Works

### Master Template

The **GitHub template** (`.github/pull_request_template.md`) is the **master**. All edits should be made here first.

### Sync Process

1. **Edit** `.github/pull_request_template.md`
2. **Run sync**: `npm run sync-pr-templates`
3. **Verify**: `npm run check-pr-templates`
4. **Commit all three** templates together

### Why This Approach?

- **Single source of truth** - One template to maintain
- **Consistency** - Same experience on all platforms
- **Automation** - Script handles the copying
- **Validation** - Check command ensures sync

---

## 🛠️ Commands

### Sync Templates

```bash
npm run sync-pr-templates
```

Copies the GitHub template to GitLab and Bitbucket locations.

**Output:**
```
🔄 Syncing PR templates across platforms...

📄 Master template: .github/pull_request_template.md

✓ github: .github/pull_request_template.md (master - skipped)
✓ gitlab: .gitlab/merge_request_templates/Default.md - Synced
✓ bitbucket: .bitbucket/pull_request_template.md - Synced

✅ Sync complete: 3 templates synced, 0 failed
```

### Check Sync Status

```bash
npm run check-pr-templates
```

Verifies all templates match the master without making changes.

**Output (in sync):**
```
🔍 Checking if templates are in sync...

✓ github: .github/pull_request_template.md (master)
✓ gitlab: .gitlab/merge_request_templates/Default.md - In sync
✓ bitbucket: .bitbucket/pull_request_template.md - In sync

✅ All templates are in sync!
```

**Output (out of sync):**
```
🔍 Checking if templates are in sync...

✓ github: .github/pull_request_template.md (master)
❌ gitlab: .gitlab/merge_request_templates/Default.md - Out of sync
✓ bitbucket: .bitbucket/pull_request_template.md - In sync

❌ Templates are out of sync. Run without --check to sync them.
```

---

## 🎯 Workflow for Editing Templates

### Standard Edit

```bash
# 1. Edit the master template
vim .github/pull_request_template.md

# 2. Sync to other platforms
npm run sync-pr-templates

# 3. Verify
npm run check-pr-templates

# 4. Commit all three files
git add .github/ .gitlab/ .bitbucket/
git commit -m "docs: update PR template with new section"
git push
```

### Before Committing

Always check that templates are synced:

```bash
npm run check-pr-templates
```

Add this to your pre-commit hook if desired (see below).

---

## 🔗 CI/CD Integration

### GitHub Actions Example

```yaml
name: Check PR Templates
on: [pull_request]

jobs:
  check-templates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm run check-pr-templates
```

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Check PR templates are in sync before committing

if git diff --cached --name-only | grep -q "pull_request_template.md"; then
    echo "🔍 Checking PR template sync..."
    if ! npm run check-pr-templates --silent; then
        echo ""
        echo "❌ PR templates are out of sync!"
        echo "Run: npm run sync-pr-templates"
        exit 1
    fi
fi
```

---

## 🐛 Troubleshooting

### Templates Out of Sync After Merge

If templates get out of sync after a merge or rebase:

```bash
# Force sync from master
npm run sync-pr-templates

# Verify
npm run check-pr-templates

# Commit the sync
git add .gitlab/ .bitbucket/
git commit -m "chore: sync PR templates"
```

### Manual Edits to Non-Master Templates

**Don't do this!** Always edit the GitHub template and sync.

If you accidentally edited GitLab or Bitbucket templates:

```bash
# This will overwrite your changes with the GitHub version
npm run sync-pr-templates
```

### Script Fails

If the sync script fails:

1. Check file permissions
2. Ensure directories exist (they should be created automatically)
3. Check for syntax errors in master template
4. Try manual copy as fallback:
   ```bash
   cp .github/pull_request_template.md .gitlab/merge_request_templates/Default.md
   cp .github/pull_request_template.md .bitbucket/pull_request_template.md
   ```

---

## 📝 Template Structure

### Required Comment Block

All templates include a sync comment block at the top:

```markdown
<!-- 
  PR Template for Jira-Beads Sync Integration
  
  This file is synced across platforms:
  - GitHub: .github/pull_request_template.md
  - GitLab: .gitlab/merge_request_templates/Default.md
  - Bitbucket: .bitbucket/pull_request_template.md
  
  If you update this file, run: npm run sync-pr-templates
-->
```

This reminds contributors to run the sync command.

---

## 🔍 Platform Differences

### GitLab

- Uses "Merge Request" terminology instead of "Pull Request"
- Template in `.gitlab/merge_request_templates/Default.md`
- Multiple templates supported (we use `Default.md`)

### Bitbucket

- Uses "Pull Request" terminology
- Template in `.bitbucket/pull_request_template.md`
- Single template only

### GitHub

- Uses "Pull Request" terminology
- Template in `.github/pull_request_template.md`
- Multiple templates supported (we use single default)

**Our approach:** Use PR terminology in templates since that's most common.

---

## 🔧 Bitbucket Integration (Option 3)

Since Bitbucket doesn't support filesystem-based PR templates, we provide an API-based approach:

### Limitations

Bitbucket's API does NOT support:
- Default PR descriptions per repository
- Per-PR template population
- Filesystem-based templates (`.bitbucket/` directory)

### Available Options

**Option A: Manual Reference (Recommended)**
```bash
# Users copy template manually when creating PRs
# Reference: .github/pull_request_template.md
```

**Option B: API Check Script**
```bash
# Check Bitbucket API configuration
npm run bitbucket:check

# Attempt setup (will explain limitations)
npm run bitbucket:setup
```

**Option C: Browser Extension**
- Use browser extensions like "Bitbucket PR Template"
- Configure to read from `.github/pull_request_template.md`

**Option D: Team Documentation**
- Add PR template to team wiki/Confluence
- Include checklist in team onboarding

### Why This Limitation?

Unlike GitHub/GitLab, Bitbucket:
- Does not scan repository for template files
- API only allows repository-level descriptions
- No built-in PR template feature

See `scripts/bitbucket-pr-defaults.js` for API integration example.

---

## 💡 Future Enhancements

Potential improvements (see ROADMAP.md):

- [ ] Support for multiple template types (bug fix, feature, etc.)
- [ ] Automated sync via Git hooks
- [ ] CI check that fails PR if templates out of sync
- [ ] Template linter (validate structure)
- [ ] Platform-specific sections (using comments to hide/show)
- [ ] Bitbucket Pipelines integration for PR automation

---

## ❓ Questions?

- See [CONTRIBUTING.md](.github/CONTRIBUTING.md)
- Open an issue with `question` label
- Check [run.js](run.js) and [package.json](package.json) for script details
