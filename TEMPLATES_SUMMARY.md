# PR/MR Templates Summary

## ✅ Created Files

### Pull Request / Merge Request Templates

| Platform | Location | Status |
|----------|----------|--------|
| **GitHub** | `.github/pull_request_template.md` | ✅ Master template |
| **GitLab** | `.gitlab/merge_request_templates/Default.md` | ✅ Auto-synced |
| **Bitbucket** | N/A (see Option 3 below) | ⚠️ Not supported |

### Issue Templates (GitHub)

| Template | Location | Purpose |
|----------|----------|---------|
| **Bug Report** | `.github/ISSUE_TEMPLATE/bug_report.md` | Report bugs and issues |
| **Feature Request** | `.github/ISSUE_TEMPLATE/feature_request.md` | Suggest new features |
| **Documentation** | `.github/ISSUE_TEMPLATE/documentation.md` | Report doc issues |
| **Config** | `.github/ISSUE_TEMPLATE/config.yml` | Template configuration |

### Documentation

| File | Purpose |
|------|---------|
| `.github/CONTRIBUTING.md` | Contributor guidelines |
| `.github/PR_TEMPLATE_SYNC.md` | Template sync documentation |

### Scripts

| Script | Purpose |
|--------|---------|
| `scripts/sync-pr-templates.js` | Keep templates in sync across platforms |

---

## 🔄 How Template Sync Works

### Master Template
- **GitHub** (`.github/pull_request_template.md`) is the single source of truth
- All edits should be made to this file first

### Sync Process
```bash
# 1. Edit GitHub template
vim .github/pull_request_template.md

# 2. Sync to other platforms
npm run sync-pr-templates

# 3. Verify sync
npm run check-pr-templates

# 4. Commit all templates
git add .github/ .gitlab/ .bitbucket/
git commit -m "docs: update PR templates"
```

### Commands Added to package.json
- `npm run sync-pr-templates` - Sync GitHub → GitLab
- `npm run check-pr-templates` - Check if in sync
- `npm run bitbucket:check` - Check Bitbucket API config
- `npm run bitbucket:setup` - Attempt Bitbucket setup (explains limitations)

---

## 📋 Template Features

### PR/MR Template Includes:
- ✅ Description section
- ✅ Related issues linking
- ✅ Type of change checkboxes (bug, feature, docs, etc.)
- ✅ Changes made list
- ✅ Testing checklist (macOS/Linux/Windows)
- ✅ Documentation update checklist
- ✅ Breaking changes section
- ✅ Screenshots/videos section
- ✅ Code quality checklist
- ✅ Performance impact assessment
- ✅ Security considerations
- ✅ Reviewer guidance and checklist

### Issue Templates Include:
- ✅ **Bug Report**: Environment details, reproduction steps, error logs
- ✅ **Feature Request**: Problem statement, use cases, implementation considerations
- ✅ **Documentation**: Affected files, suggested improvements, impact assessment
- ✅ **Config**: Links to community resources and security reporting

---

## 🎯 Best Practices

### Editing Templates
1. **Always edit GitHub template first** (master)
2. Run `npm run sync-pr-templates` to propagate
3. Run `npm run check-pr-templates` before committing
4. Commit all three templates together

### CI/CD Integration
Consider adding to your CI workflow:
```yaml
- name: Check PR templates in sync
  run: npm run check-pr-templates
```

### Pre-commit Hook
Add to `.git/hooks/pre-commit`:
```bash
if git diff --cached --name-only | grep -q "pull_request_template.md"; then
    npm run check-pr-templates || exit 1
fi
```

---

## 🌍 Platform-Specific Notes

### GitHub
- Uses "Pull Request" terminology
- Supports multiple templates (we use single default)
- ISSUE_TEMPLATE directory for issue templates
- config.yml for template configuration

### GitLab
- Uses "Merge Request" terminology
- Templates in `.gitlab/merge_request_templates/`
- `Default.md` is the default template
- Supports multiple templates

### Bitbucket
- Uses "Pull Request" terminology
- Single template only: `.bitbucket/pull_request_template.md`
- Limited compared to GitHub/GitLab

---

## 📊 What This Provides

### For Contributors
- ✅ Consistent PR/MR experience across all platforms
- ✅ Clear guidance on what information to provide
- ✅ Comprehensive checklists to avoid missing steps
- ✅ Platform-specific issue templates (GitHub)

### For Maintainers
- ✅ Standardized PR/MR format for easier review
- ✅ Required information always present
- ✅ Security and performance considerations built-in
- ✅ Easy to maintain (single source of truth)

### For The Project
- ✅ Higher quality contributions
- ✅ Faster review cycles
- ✅ Better documentation of changes
- ✅ Consistent experience regardless of hosting platform

---

## 🔍 Testing

All templates have been created and synced:

```bash
$ npm run check-pr-templates
🔍 Checking if templates are in sync...

✓ github: .github/pull_request_template.md (master)
✓ gitlab: .gitlab/merge_request_templates/Default.md - In sync
✓ bitbucket: .bitbucket/pull_request_template.md - In sync

✅ All templates are in sync!
```

---

## 📚 Related Documentation

- [CONTRIBUTING.md](.github/CONTRIBUTING.md) - Full contributor guide
- [PR_TEMPLATE_SYNC.md](.github/PR_TEMPLATE_SYNC.md) - Detailed sync documentation
- [ROADMAP.md](ROADMAP.md) - Future improvements

---

## 🔧 Bitbucket - Option 3 Implementation

Since Bitbucket doesn't support filesystem-based PR templates, we've implemented Option 3:

### What We Provide

1. **API Integration Script**: `scripts/bitbucket-pr-defaults.js`
   - Documents Bitbucket API limitations
   - Provides environment setup instructions
   - Explains alternative approaches

2. **NPM Commands**:
   ```bash
   npm run bitbucket:check    # Verify API configuration
   npm run bitbucket:setup    # Explains limitations and alternatives
   ```

3. **Documentation**: Clear explanation of why Bitbucket is different

### Why Bitbucket Is Limited

Bitbucket's API does NOT support:
- ❌ Default PR descriptions per repository
- ❌ Filesystem-based template scanning
- ❌ Per-PR template auto-population

### Recommended Approaches for Bitbucket Users

**Option A: Manual Reference** (Simplest)
- Keep `.github/pull_request_template.md` as reference
- Users copy/paste when creating PRs

**Option B: Browser Extension**
- Use "Bitbucket PR Template" browser extension
- Configure to read from `.github/pull_request_template.md`

**Option C: Team Documentation**
- Add template to Confluence/wiki
- Include in onboarding checklist

**Option D: Automation**
- Use Bitbucket Pipelines to validate PR description
- Bot comments with template if missing

### Running the Script

```bash
# Set environment variables
export BITBUCKET_USERNAME="your-username"
export BITBUCKET_APP_PASSWORD="your-app-password"
export BITBUCKET_WORKSPACE="your-workspace"
export BITBUCKET_REPO="your-repo"

# Check configuration
npm run bitbucket:check

# Attempt setup (will explain what's possible)
npm run bitbucket:setup
```

The script will explain Bitbucket's limitations and recommend best practices.

---

## ✨ What's Next

The templates are ready to use! When you:

1. **Create a PR on GitHub** → Template auto-populates ✅
2. **Create an MR on GitLab** → Select from template dropdown ✅
3. **Create a PR on Bitbucket** → Reference `.github/pull_request_template.md` manually ⚠️
4. **Create an Issue on GitHub** → Choose from 3 template types ✅

GitHub and GitLab templates are kept in sync automatically with the sync script.
