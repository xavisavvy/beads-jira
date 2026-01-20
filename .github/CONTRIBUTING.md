# Contributing to Jira-Beads Sync Integration

Thank you for your interest in contributing! This document provides guidelines and best practices.

---

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/beads-jira.git
   cd beads-jira
   ```
3. **Install dependencies**
   ```bash
   npm install
   ./install.sh  # or .\install.ps1 on Windows
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Make your changes**
6. **Test your changes**
   ```bash
   npm test
   npm run sync -- TEST --use-example-data
   ```
7. **Submit a pull request**

---

## 📋 Pull Request Process

### Before Submitting

- [ ] Code follows existing style and conventions
- [ ] All tests pass
- [ ] Documentation updated (if needed)
- [ ] Tested on multiple platforms (if applicable)
- [ ] PR template filled out completely
- [ ] Commits follow conventional commit format (see below)

### PR Template

When you create a PR, a template will be auto-populated. Please fill out all sections thoroughly.

### Review Process

1. **Automated checks** run (if CI configured)
2. **Maintainer review** (usually within 2-3 days)
3. **Feedback addressed** (you may need to make changes)
4. **Approval and merge**

---

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Formatting, missing semicolons, etc. (no code change)
- **refactor**: Code restructuring without functionality change
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependencies

### Examples

```bash
feat(sync): add dry-run mode to preview changes

Adds --dry-run flag to sync command that shows what would
be created/updated without making actual changes.

Closes #42

---

fix(bd-finish): handle missing Jira key gracefully

Previously crashed when beads issue had no Jira key label.
Now falls back to issue ID in branch name.

Fixes #38

---

docs(readme): clarify MCP integration status

Adds prominent banner explaining that MCP integration
is currently a stub using example data.
```

---

## 🏗️ Project Structure

```
.
├── .github/                    # GitHub templates and workflows
├── .gitlab/                    # GitLab MR templates
├── .bitbucket/                 # Bitbucket PR templates
├── scripts/                    # Installed scripts directory
│   ├── sync-pr-templates.js   # Keep templates in sync
│   └── ...
├── bd-start-branch*           # Workflow helper (source)
├── bd-finish*                 # Workflow helper (source)
├── sync_jira_to_beads.js      # Main sync script (Node)
├── sync_jira_to_beads.py      # Main sync script (Python)
├── sync_jira_to_beads.cs      # Main sync script (C#)
├── install.sh                 # Installation script (Unix)
├── install.ps1                # Installation script (Windows)
├── run.js                     # Cross-platform task runner
├── package.json               # npm scripts and metadata
├── README.md                  # Main documentation
├── QUICKREF.md                # Quick reference guide
├── ROADMAP.md                 # Development roadmap
└── ...                        # Other documentation
```

---

## 🧪 Testing

### Manual Testing Checklist

When making changes, test on multiple platforms if possible:

**Installation:**
```bash
./install.sh               # macOS/Linux
.\install.ps1              # Windows PowerShell
npm run install            # Cross-platform via Node
```

**Sync Command:**
```bash
npm run sync -- TEST --use-example-data
npm run sync -- PROJ --component backend
```

**Workflow Helpers:**
```bash
npm run start -- bd-test1
npm run finish -- bd-test1
```

**Template Sync:**
```bash
npm run check-pr-templates
npm run sync-pr-templates
```

### Automated Tests

Currently, automated tests are minimal (see ROADMAP.md #8). Future contributions should include tests!

---

## 📚 Documentation

### When to Update Documentation

Update documentation when:
- Adding new features
- Changing command syntax
- Fixing bugs that affected documented behavior
- Adding new configuration options
- Changing installation process

### Documentation Files

| File | Update When |
|------|-------------|
| **README.md** | Setup process or architecture changes |
| **QUICKREF.md** | New commands or command changes |
| **ROADMAP.md** | Completing roadmap items or major changes |
| **WORKFLOW_HELPERS.md** | Workflow helper changes |
| **Code comments** | Complex logic added |

---

## 🔄 Keeping Templates in Sync

We support multiple Git platforms. When editing PR/MR templates:

### Process

1. **Edit the master template**: `.github/pull_request_template.md`
2. **Sync to GitLab**:
   ```bash
   npm run sync-pr-templates
   ```
3. **Verify sync**:
   ```bash
   npm run check-pr-templates
   ```

This ensures GitHub and GitLab have identical templates.

**Note**: Bitbucket does not support filesystem-based PR templates. For Bitbucket repositories, you'll need to manually set default PR descriptions via the API or web interface.

---

## 🎯 Code Style Guidelines

### JavaScript/Node.js

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **semicolons**
- Use **const/let**, not var
- Use **async/await** over raw promises
- Add JSDoc comments for functions

```javascript
/**
 * Query Jira via MCP server
 * @param {string} jql - JQL query string
 * @returns {Promise<Array>} Array of Jira issues
 */
async function queryJira(jql) {
  // Implementation
}
```

### Bash Scripts

- Use **shellcheck** for linting
- Use **set -e** for error handling
- Add comments for complex logic
- Use **${VAR}** for variable expansion

### Python (if contributing to .py version)

- Follow **PEP 8**
- Use **type hints**
- Use **docstrings** for functions
- Use **4 spaces** for indentation

---

## 🐛 Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md).

**Before reporting:**
1. Check if already reported (search issues)
2. Try latest version
3. Verify it's not a beads core issue

**Include:**
- Detailed steps to reproduce
- Your environment (OS, versions)
- Error messages and logs
- Expected vs actual behavior

---

## 💡 Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md).

**Check first:**
- Review [ROADMAP.md](ROADMAP.md) - might already be planned
- Search existing issues
- Consider if it fits project scope

**Provide:**
- Clear use case
- Examples from other tools
- Implementation ideas
- Willingness to contribute

---

## 🔒 Security

**Do not report security issues publicly!**

Use GitHub Security Advisories or email maintainers directly.

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## ❓ Questions?

- Open an issue with the `question` label
- Check existing documentation
- Ask in discussions (if enabled)

---

## 🙏 Thank You!

Every contribution, no matter how small, helps make this project better for everyone!

**Recognition:**
- Contributors listed in releases
- Significant contributions highlighted in README
