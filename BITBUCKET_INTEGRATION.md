# Bitbucket PR Template Integration

## ⚠️ Important: Bitbucket Limitations

**Bitbucket does NOT support filesystem-based PR templates** like GitHub and GitLab.

Neither Bitbucket Cloud nor Bitbucket Server/Data Center will automatically read `.bitbucket/pull_request_template.md` or any similar file.

---

## 🔍 What We've Implemented (Option 3)

We provide an **API-based integration script** that:
1. Documents Bitbucket's API limitations
2. Provides setup instructions for those who want to attempt API integration
3. Recommends practical workarounds

---

## 🛠️ Usage

### Check Bitbucket Configuration

```bash
# Set required environment variables first
export BITBUCKET_USERNAME="your-username"
export BITBUCKET_APP_PASSWORD="your-app-password"
export BITBUCKET_WORKSPACE="your-workspace"
export BITBUCKET_REPO="your-repo"

# Check API connectivity
npm run bitbucket:check
```

### Attempt Setup

```bash
npm run bitbucket:setup
```

**Note**: This will explain that Bitbucket's API doesn't support per-PR default descriptions and recommend alternatives.

---

## 🎯 Recommended Approaches

Since Bitbucket doesn't support automatic PR templates, here are practical solutions:

### Option A: Manual Reference (Simplest) ⭐
1. Keep `.github/pull_request_template.md` as reference
2. When creating PR in Bitbucket, open the template file
3. Copy and paste content into PR description

**Pros**: No setup, works immediately
**Cons**: Manual process

### Option B: Browser Extension
1. Install "Bitbucket PR Template" browser extension
2. Configure to read from `.github/pull_request_template.md`
3. Extension auto-populates when creating PR

**Pros**: Automatic once configured
**Cons**: Requires extension installation per user

### Option C: Team Wiki/Documentation
1. Add template to Confluence or team wiki
2. Link from team onboarding docs
3. Include checklist in PR guidelines

**Pros**: Centralized, easy to maintain
**Cons**: Still manual process

### Option D: Bitbucket Pipelines Validation
1. Create pipeline that validates PR description
2. Bot comments with template if description is missing
3. Fail build if required sections not filled

**Pros**: Enforces template usage
**Cons**: Requires pipeline setup

---

## 🔧 Environment Setup

### Creating Bitbucket App Password

1. Go to https://bitbucket.org/account/settings/app-passwords/
2. Click "Create app password"
3. Name: "PR Template Manager"
4. Permissions: Select **"Repositories: Write"**
5. Click "Create"
6. **Save the password** (shown only once)

### Setting Environment Variables

**Linux/macOS (bash/zsh):**
```bash
export BITBUCKET_USERNAME="your-username"
export BITBUCKET_APP_PASSWORD="app-password-from-step-5"
export BITBUCKET_WORKSPACE="your-workspace-slug"
export BITBUCKET_REPO="your-repo-slug"
```

**Windows (PowerShell):**
```powershell
$env:BITBUCKET_USERNAME="your-username"
$env:BITBUCKET_APP_PASSWORD="app-password-from-step-5"
$env:BITBUCKET_WORKSPACE="your-workspace-slug"
$env:BITBUCKET_REPO="your-repo-slug"
```

**Permanent (add to `.bashrc` or `.zshrc`):**
```bash
echo 'export BITBUCKET_USERNAME="your-username"' >> ~/.bashrc
echo 'export BITBUCKET_APP_PASSWORD="your-app-password"' >> ~/.bashrc
echo 'export BITBUCKET_WORKSPACE="your-workspace"' >> ~/.bashrc
echo 'export BITBUCKET_REPO="your-repo"' >> ~/.bashrc
source ~/.bashrc
```

---

## 📋 What the Script Does

### `npm run bitbucket:check`

Verifies:
- Environment variables are set
- Bitbucket API connectivity works
- Repository exists and is accessible
- Explains limitations

### `npm run bitbucket:setup`

Attempts to:
- Read the PR template from `.github/pull_request_template.md`
- Connect to Bitbucket API
- **Explains why API cannot set default PR descriptions**
- Recommends alternative approaches

---

## 🤔 Why Doesn't Bitbucket Support This?

### GitHub
- ✅ Scans repository for `.github/pull_request_template.md`
- ✅ Auto-populates when creating PR
- ✅ Been available since 2016

### GitLab
- ✅ Scans repository for `.gitlab/merge_request_templates/*.md`
- ✅ Shows templates in dropdown when creating MR
- ✅ Been available since GitLab 8.6 (2016)

### Bitbucket
- ❌ Does not scan repository for template files
- ❌ API only supports repository-level descriptions
- ❌ No built-in PR template feature
- ⚠️ Feature has been requested since 2016, still not implemented

**Bitbucket's official stance**: Use PR automation via Pipelines or third-party integrations.

---

## 🔄 Integration with Main Sync

The template sync script (`npm run sync-pr-templates`) only syncs GitHub ↔ GitLab now.

Bitbucket is handled separately because:
1. It requires different approach (API vs filesystem)
2. Limitations need to be clearly communicated
3. Users need to choose their preferred workaround

---

## 📊 Comparison Table

| Feature | GitHub | GitLab | Bitbucket |
|---------|--------|--------|-----------|
| **Filesystem templates** | ✅ Yes | ✅ Yes | ❌ No |
| **Auto-population** | ✅ Yes | ✅ Yes (dropdown) | ❌ No |
| **Multiple templates** | ✅ Yes | ✅ Yes | ❌ No |
| **API support** | ✅ Yes | ✅ Yes | ⚠️ Limited |
| **Our solution** | Template file | Template file | Script + manual |

---

## 🚀 Getting Started with Bitbucket

### For Individual Users

1. **Manual approach**: Keep `.github/pull_request_template.md` open when creating PRs
2. **Browser extension**: Install template auto-fill extension
3. **Bookmark**: Create browser bookmark to template file in repo

### For Teams

1. **Documentation**: Add template to team wiki
2. **Onboarding**: Include in new developer setup
3. **Guidelines**: Add to team PR review checklist
4. **Automation**: Set up Bitbucket Pipelines validation

### For Organizations

1. **Standardization**: Add to organization standards
2. **Training**: Include in developer training
3. **Tools**: Evaluate enterprise PR automation tools
4. **Monitoring**: Track PR quality metrics

---

## 📚 Additional Resources

### Bitbucket Documentation
- [Bitbucket API Reference](https://developer.atlassian.com/cloud/bitbucket/rest/)
- [Bitbucket Pipelines](https://support.atlassian.com/bitbucket-cloud/docs/get-started-with-bitbucket-pipelines/)

### Feature Requests
- [Bitbucket PR Templates (2016 request)](https://jira.atlassian.com/browse/BCLOUD-14304)
- Vote on the feature request to help prioritize

### Alternative Tools
- Browser extensions: "Bitbucket PR Template", "PR Template for Bitbucket"
- Third-party: Waypoint, LinearB, Swarmia

---

## 🐛 Troubleshooting

### "Cannot find module" error
```bash
# Make sure you're in the repo root
cd /path/to/beads-jira
npm run bitbucket:check
```

### "Missing environment variables" error
```bash
# Check variables are set
echo $BITBUCKET_USERNAME
echo $BITBUCKET_WORKSPACE

# If empty, set them (see Environment Setup above)
```

### "API request failed: 401"
- Check app password is correct
- Verify app password has "Repositories: Write" permission
- Try creating a new app password

### "API request failed: 404"
- Check workspace and repo slugs are correct
- Verify you have access to the repository
- Try accessing via web: `https://bitbucket.org/{workspace}/{repo}`

---

## 💡 Future Improvements

If Bitbucket adds native template support:
- [ ] Update sync script to include Bitbucket
- [ ] Remove manual workaround documentation
- [ ] Deprecate API integration script
- [ ] Update all documentation

---

## ❓ Questions?

See:
- [TEMPLATES_SUMMARY.md](../TEMPLATES_SUMMARY.md) - Overview of all templates
- [PR_TEMPLATE_SYNC.md](../.github/PR_TEMPLATE_SYNC.md) - GitHub/GitLab sync process
- [CONTRIBUTING.md](../.github/CONTRIBUTING.md) - Contribution guidelines
