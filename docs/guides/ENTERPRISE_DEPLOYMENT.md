# Enterprise Deployment Strategies

Strategies for rolling out the Jira-Beads sync across multiple projects in an organization.

## 🎯 Deployment Approaches

### 1. **Git Submodule Strategy** (Recommended for Most Orgs)

Pull as a submodule that can be updated centrally:

```bash
# In each project repo
git submodule add https://github.com/yourorg/jira-beads-sync tools/jira-beads
git submodule update --init --recursive

# Run installer from submodule
./tools/jira-beads/install.sh
```

**Pros:**
- Central version control
- Easy updates across all repos (`git submodule update --remote`)
- Can pin to specific versions
- Single source of truth

**Cons:**
- Teams need to understand submodules
- Requires git submodule commands

---

### 2. **Internal Package/Artifact Repository**

Publish as an internal package (pip, npm, or artifact):

```bash
# Option A: Python package
pip install --index-url https://pypi.yourorg.com jira-beads-sync
jira-beads-init PROJ --component backend

# Option B: NPM package
npm install -g @yourorg/jira-beads-sync
jira-beads-init PROJ --component backend

# Option C: Binary artifact
curl -fsSL https://artifacts.yourorg.com/jira-beads-sync/install.sh | bash
```

**Pros:**
- Standard package management workflow
- Version pinning and semantic versioning
- Works with existing artifact systems
- No git submodule complexity

**Cons:**
- Requires packaging infrastructure
- More setup overhead

---

### 3. **Cookiecutter/Yeoman Template**

Include in project templates for greenfield projects:

```bash
# Cookiecutter approach
cookiecutter gh:yourorg/project-template \
  jira_project=PROJ \
  jira_component=backend

# Generated project includes:
# - scripts/sync_jira_to_beads.py
# - .git/hooks/post-merge
# - .jira-beads-config (pre-configured)
```

**Pros:**
- Zero setup for new projects
- Enforces standards from day one
- Can customize per project type (backend, frontend, etc.)
- Works with greenfield projects

**Cons:**
- Only helps new projects
- Existing projects need different approach

---

### 4. **Centralized Scripts Repository**

Single "devtools" repo shared across all projects:

```bash
# Clone once per machine
git clone git@github.com:yourorg/devtools.git ~/.yourorg-devtools

# Symlink into each project
cd /path/to/project
~/.yourorg-devtools/bin/setup-jira-beads PROJ backend

# Or add to PATH
export PATH="$HOME/.yourorg-devtools/bin:$PATH"
sync-jira PROJ --component backend
```

**Pros:**
- Single installation per developer machine
- Easy to update globally
- Works across all projects
- Lightweight

**Cons:**
- Requires developers to clone devtools repo
- Path/symlink management
- Harder to version per-project

---

### 5. **Terraform/IaC for Git Repos**

Use infrastructure-as-code to provision repos with sync pre-installed:

```hcl
# terraform/modules/repo/main.tf
resource "github_repository" "app" {
  name = var.repo_name
  
  # Provision with template that includes jira-beads-sync
  template {
    owner      = "yourorg"
    repository = "template-with-jira-beads"
  }
}

resource "github_repository_file" "jira_config" {
  repository = github_repository.app.name
  file       = ".jira-beads-config"
  content    = templatefile("${path.module}/jira-config.tpl", {
    project   = var.jira_project
    component = var.jira_component
  })
}
```

**Pros:**
- Automated provisioning
- Consistent across all repos
- Auditable and versioned
- Works with GitOps workflows

**Cons:**
- Requires Terraform/IaC setup
- Overkill for small orgs
- Doesn't help existing projects

---

### 6. **GitHub Actions / CI Template**

Distribute as a reusable GitHub Action workflow:

```yaml
# .github/workflows/jira-sync.yml
name: Sync Jira to Beads

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 */4 * * *'  # Every 4 hours

jobs:
  sync:
    uses: yourorg/reusable-workflows/.github/workflows/jira-beads-sync.yml@v1
    with:
      jira-project: PROJ
      jira-component: backend
    secrets:
      JIRA_TOKEN: ${{ secrets.JIRA_TOKEN }}
```

**Pros:**
- No local installation needed
- Centralized updates
- Works in CI/CD pipeline
- Consistent across team

**Cons:**
- Requires cloud CI (not local git hooks)
- Network dependency
- Not truly "offline"

---

## 🏢 Enterprise Customization

### Configuration Management

Create org-wide config structure:

```yaml
# .yourorg/jira-beads.yml (checked into each repo)
jira:
  url: https://yourorg.atlassian.net
  project: PROJ
  component: backend
  filters:
    - assignee = currentUser()
    - labels = "urgent"
  
beads:
  auto_sync: true
  sync_on_pull: true
  branches: [main, develop]
  
mcp:
  url: https://mcp.yourorg.com/v1/mcp
  timeout: 30
```

Then centralize the sync script:

```python
# Read org-wide config
config = yaml.safe_load(open('.yourorg/jira-beads.yml'))
sync = JiraBeadsSync(
    project_key=config['jira']['project'],
    component=config['jira']['component'],
    mcp_url=config['mcp']['url']
)
```

---

### Custom Field Mappings

Override field mappings per org:

```python
# yourorg_jira_sync/field_mappings.py
PRIORITY_MAP = {
    'Critical': 0,
    'High': 1,
    'Medium': 2,
    'Low': 3
}

CUSTOM_FIELDS = {
    'customfield_10001': 'sprint',
    'customfield_10002': 'story_points'
}
```

---

### Self-Service Portal

Build internal tool for teams:

```bash
# Internal CLI
yourorg-jira setup
# Interactive prompts:
# - Which repo?
# - Jira project key?
# - Component name?
# - Enable auto-sync on pull? (Y/n)
# 
# ✅ Installed jira-beads-sync in /path/to/repo
# ✅ Created .jira-beads-config
# ✅ Installed git hook
```

---

## 📊 Rollout Plan

### Phase 1: Pilot (2-4 weeks)
- Select 2-3 teams
- Install manually via `install.sh`
- Gather feedback
- Iterate on docs

### Phase 2: Early Adopters (1-2 months)
- Publish to internal package repo
- Create self-service docs
- Train team leads
- Monitor adoption

### Phase 3: Org-Wide (2-3 months)
- Include in project templates
- Add to new developer onboarding
- Terraform provisioning for new repos
- Migrate existing projects

### Phase 4: Standardization (Ongoing)
- Mandate for new projects
- Deprecate old issue tracking workflows
- Automate compliance checking
- Continuous improvement

---

## 🔧 Maintenance & Governance

### Versioning Strategy

```bash
# Pin to major version in submodule
git submodule add -b v1 https://github.com/yourorg/jira-beads-sync

# Or use package version pinning
npm install @yourorg/jira-beads-sync@^1.0.0
```

### Update Process

```bash
# Central update notification
# tools/jira-beads/.version
1.2.0

# Automated PR to update across all repos
gh pr create --title "Update jira-beads-sync to v1.2.0" \
  --body "Security fixes and performance improvements"
```

### Compliance Checking

```yaml
# .github/workflows/compliance.yml
- name: Check jira-beads-sync installed
  run: |
    if [ ! -f "scripts/sync_jira_to_beads.py" ]; then
      echo "::error::jira-beads-sync not installed"
      exit 1
    fi
```

---

## 🚀 Migration Guide for Existing Projects

### Discovery Script

```bash
#!/bin/bash
# discover-repos.sh - Find repos that need jira-beads-sync

gh repo list yourorg --limit 1000 --json name,defaultBranch | \
  jq -r '.[] | .name' | \
  while read repo; do
    if ! gh api "repos/yourorg/$repo/contents/scripts/sync_jira_to_beads.py" \
         -q '.name' 2>/dev/null; then
      echo "❌ $repo - NOT INSTALLED"
    else
      echo "✅ $repo - installed"
    fi
  done
```

### Bulk Installation

```bash
#!/bin/bash
# bulk-install.sh - Install in multiple repos

REPOS=(
  "backend-api"
  "frontend-web"
  "mobile-app"
)

for repo in "${REPOS[@]}"; do
  echo "Installing in $repo..."
  
  cd "$HOME/repos/$repo"
  
  # Clone jira-beads-sync
  git submodule add https://github.com/yourorg/jira-beads-sync tools/jira-beads
  
  # Run installer
  ./tools/jira-beads/install.sh
  
  # Commit
  git add .
  git commit -m "Add jira-beads-sync integration"
  git push
  
  # Create PR
  gh pr create --title "Add Jira-Beads sync" \
    --body "Automated installation of jira-beads-sync"
done
```

---

## 📋 Decision Matrix

| Scenario | Best Strategy |
|----------|---------------|
| **10-50 repos, active development** | Git Submodule |
| **100+ repos, need versioning** | Internal Package |
| **Greenfield projects only** | Cookiecutter Template |
| **Polyglot org (many languages)** | Centralized Scripts Repo |
| **Infrastructure-as-Code culture** | Terraform Provisioning |
| **Cloud-first, CI-heavy** | GitHub Actions |
| **Mix of old/new projects** | Submodule + Package Hybrid |

---

## 💡 Pro Tips

1. **Start small**: Pilot with friendly teams first
2. **Document wins**: Track time saved, issues synced, developer happiness
3. **Automate onboarding**: Make it part of new project checklist
4. **Monitor adoption**: Track which teams are using it
5. **Gather feedback**: Regular surveys and office hours
6. **Celebrate success**: Share metrics and testimonials
7. **Iterate quickly**: Fix pain points before wide rollout

---

## 🔤 Language-Specific Considerations

### For .NET/VueJS Projects

Since your projects are primarily .NET and VueJS, **use the Node.js version** (`sync_jira_to_beads.js`):

**Why Node.js for .NET/VueJS projects?**
- ✅ VueJS projects already have Node.js installed
- ✅ Single runtime for both frontend and backend tools
- ✅ Works natively on Windows, Linux, and macOS
- ✅ Familiar to VueJS developers
- ✅ No additional runtime installation needed

**Alternative: C#/.NET version** (`sync_jira_to_beads.cs`):
- Use if you want pure .NET tooling
- Requires `dotnet-script` global tool
- Better for .NET-only shops without Node.js

**Keep the Python version?**
- ⚠️ Only if you already have Python in your stack
- For .NET/VueJS teams, stick with **Node.js**

### Recommended Setup

```bash
# In each repo, use Node.js version
./install.sh  # or .\install.ps1 on Windows

# The installer will copy sync_jira_to_beads.js instead of .py
# Git hooks will use: node scripts/sync_jira_to_beads.js
```

### Customizing for Your Stack

Edit the install scripts to prefer Node.js:

```bash
# install.sh - change Python check to Node check
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
fi

# Copy JS version instead
cp sync_jira_to_beads.js "$REPO_ROOT/scripts/"
```

### Performance Comparison

| Language | Startup Time | Dependencies | Windows Support | Team Familiarity |
|----------|--------------|--------------|-----------------|------------------|
| **Node.js** | ~50ms | Already installed | ✅ Excellent | ✅ High (VueJS devs) |
| **C#/.NET** | ~100ms | dotnet-script | ✅ Excellent | ✅ High (.NET devs) |
| **Python** | ~80ms | Usually pre-installed | ⚠️ Manual install | ⚠️ Lower |

**Verdict for .NET/VueJS shops: Use Node.js** 🏆

---

## 🔗 Related Resources

- [SCRIPT_SYNC.md](.github/.copilot/SCRIPT_SYNC.md) - Keeping install.sh and install.ps1 in sync
- [README.md](README.md) - Installation and usage guide
- [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md) - Daily usage patterns
- [Beads GitHub Repo](https://github.com/steveyegge/beads)

---

## 📦 Available Implementations

This project provides **three language implementations** with identical functionality:

| File | Language | Best For |
|------|----------|----------|
| `sync_jira_to_beads.py` | Python 3 | Linux/macOS projects, DevOps teams |
| `sync_jira_to_beads.js` | Node.js | **VueJS, React, Node.js projects** ⭐ |
| `sync_jira_to_beads.cs` | C#/.NET | **.NET projects, pure .NET shops** ⭐ |

**For your .NET/VueJS organization, use the Node.js version.**
