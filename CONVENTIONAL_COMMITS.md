# Conventional Commits Guide

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages and uses [standard-version](https://github.com/conventional-changelog/standard-version) for automated versioning.

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

| Type | Description | Emoji |
|------|-------------|-------|
| **feat** | A new feature | ✨ |
| **fix** | A bug fix | 🐛 |
| **docs** | Documentation only changes | 📝 |
| **style** | Code style changes (formatting, semicolons, etc) | 💄 |
| **refactor** | Code change that neither fixes a bug nor adds a feature | ♻️ |
| **perf** | Performance improvement | ⚡ |
| **test** | Adding or updating tests | ✅ |
| **build** | Changes to build system or dependencies | 🔧 |
| **ci** | Changes to CI configuration files and scripts | 👷 |
| **chore** | Other changes that don't modify src or test files | 🔨 |
| **revert** | Revert a previous commit | ⏪ |

### Scope (Optional)

The scope should be the name of the affected component:

- `sync` - Jira sync functionality
- `workflow` - Workflow helpers (bd-start-branch, bd-finish)
- `install` - Installation scripts
- `templates` - PR/MR templates
- `ci` - CI/CD configuration
- `tests` - Test files
- `docs` - Documentation files

### Subject

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end
- Maximum 50 characters

### Body (Optional)

- Use the imperative, present tense
- Include motivation for the change and contrast with previous behavior
- Wrap at 72 characters

### Footer (Optional)

- Reference issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`

## Examples

### Simple commit

```bash
git commit -m "feat(sync): add support for Jira labels"
```

### Commit with scope and body

```bash
git commit -m "fix(workflow): handle special characters in branch names

Previously, special characters in issue titles would cause
branch creation to fail. Now they are properly sanitized.

Closes #42"
```

### Breaking change

```bash
git commit -m "feat(sync)!: change config file format

BREAKING CHANGE: The configuration file format has changed from
.jira-beads-config to .jira-beads.json. Users must migrate their
existing configuration files.

Migration guide: docs/migration-v2.md
```

### Multiple files

```bash
git commit -m "test: add workflow helper tests

- Add tests for branch name generation
- Add tests for Jira key extraction  
- Add tests for slug generation

Coverage increased from 0% to 85%"
```

## Automated Versioning

This project uses **standard-version** to automatically:
- Bump version in package.json
- Generate CHANGELOG.md
- Create git tag
- Commit changes

### Creating a Release

```bash
# Automatic version bump based on commits
npm run release

# Or specify version explicitly
npm run release:patch   # 1.0.0 -> 1.0.1
npm run release:minor   # 1.0.0 -> 1.1.0
npm run release:major   # 1.0.0 -> 2.0.0

# Dry run to see what would happen
npm run release:dry
```

### How Version is Determined

- `feat`: Minor version bump (1.0.0 -> 1.1.0)
- `fix`: Patch version bump (1.0.0 -> 1.0.1)
- `BREAKING CHANGE`: Major version bump (1.0.0 -> 2.0.0)

### First Release

For the first release:

```bash
npm run release -- --first-release
```

This will create version 1.0.0 without bumping.

## Commit Validation

Commits are automatically validated using **commitlint**:

```bash
# Valid commits ✅
git commit -m "feat: add new feature"
git commit -m "fix(sync): resolve crash on startup"
git commit -m "docs: update README"

# Invalid commits ❌
git commit -m "Add new feature"           # Missing type
git commit -m "feat add new feature"      # Missing colon
git commit -m "feature: add something"    # Wrong type
```

If a commit message is invalid, the commit will be rejected with an error message.

## Best Practices

### 1. One Logical Change Per Commit

```bash
# ✅ Good
git commit -m "feat(sync): add label support"
git commit -m "test(sync): add tests for label support"

# ❌ Bad
git commit -m "feat(sync): add label support and fix crash and update docs"
```

### 2. Write Clear, Descriptive Messages

```bash
# ✅ Good
git commit -m "fix(workflow): handle spaces in issue titles correctly"

# ❌ Bad
git commit -m "fix: bug"
git commit -m "fix: oops"
git commit -m "fix: stuff"
```

### 3. Use Breaking Changes Sparingly

```bash
# Only when truly breaking backwards compatibility
git commit -m "feat(config)!: migrate to JSON format

BREAKING CHANGE: Configuration file format changed from
shell script to JSON. See migration guide for details."
```

### 4. Reference Issues

```bash
git commit -m "fix(sync): prevent duplicate issues

Closes #123
Fixes #456
Relates to #789"
```

## Changelog

The CHANGELOG.md is automatically generated from commit messages:

```markdown
## [1.1.0] - 2026-01-20

### ✨ Features
- **sync**: add support for Jira labels (#123)
- **workflow**: add branch cleanup helper (#124)

### 🐛 Bug Fixes
- **sync**: prevent duplicate issue creation (#125)
- **workflow**: handle special characters in titles (#126)

### 📝 Documentation
- update installation guide (#127)
- add troubleshooting section (#128)
```

## Hooks

### Pre-commit Hook

Runs automatically before commit:
- Lints code with ESLint
- Checks PR template sync
- Formats code with Prettier

### Commit-msg Hook

Runs automatically after commit message is entered:
- Validates commit message format
- Rejects invalid commit messages

## Bypassing Hooks (Not Recommended)

In emergency situations only:

```bash
# Skip pre-commit hook
git commit --no-verify

# But commit-msg hook will still run!
```

## Integration with CI/CD

The CI pipeline validates:
- All commits follow conventional format
- CHANGELOG.md is up to date
- Version in package.json matches git tag

## Tools Used

- **commitlint**: Validate commit messages
- **standard-version**: Automated versioning and changelog
- **husky**: Git hooks management
- **lint-staged**: Run linters on staged files

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

## Troubleshooting

### "Your commit message doesn't follow conventional format"

Check that your message follows the format: `type(scope): subject`

### "standard-version: command not found"

```bash
npm install
```

### "Cannot read property 'version' of null"

Make sure package.json has a version field:

```json
{
  "version": "1.0.0"
}
```

---

**Quick Reference Card**

```
feat:     ✨ New feature
fix:      🐛 Bug fix
docs:     📝 Documentation
style:    💄 Formatting
refactor: ♻️  Code change
perf:     ⚡ Performance
test:     ✅ Tests
build:    🔧 Build system
ci:       👷 CI/CD
chore:    🔨 Maintenance
revert:   ⏪ Revert

Example: feat(sync): add label support
```
