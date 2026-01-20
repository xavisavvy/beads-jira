# Husky Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to automatically run checks before commits and pushes.

## 🎯 Why Husky?

Git hooks ensure code quality by running automated checks before code is committed or pushed. This prevents:
- ❌ Broken code from being committed
- ❌ Failing tests from being pushed
- ❌ Inconsistent commit messages
- ❌ Linting errors in the codebase

## 🔧 Installed Hooks

### 1. `commit-msg` - Conventional Commits

**When**: After you write a commit message  
**What it does**: Validates commit message format using [commitlint](https://commitlint.js.org/)

**Example valid messages**:
```bash
feat: add user authentication
fix: resolve memory leak in sync
docs: update installation guide
test: add integration tests
chore: update dependencies
```

**Example invalid messages**:
```bash
✗ Added new feature        # No type prefix
✗ FIX: bug fix             # Type must be lowercase
✗ feat added something     # Missing colon
```

---

### 2. `pre-commit` - Quality Checks

**When**: Before each commit  
**What it does**:
1. ✅ Runs ESLint on all JavaScript files
2. ✅ Checks PR templates are synchronized
3. ✅ Runs all tests to ensure nothing is broken

**Output**:
```
🔍 Running pre-commit checks...
  → Running ESLint...
  → Checking PR templates...
  → Running tests...
✅ Pre-commit checks passed!
```

**If checks fail**: Commit is blocked until issues are fixed

---

### 3. `pre-push` - Comprehensive Testing

**When**: Before pushing to remote  
**What it does**:
1. ✅ Runs full test suite with coverage
2. ✅ Ensures all tests pass
3. ✅ Validates coverage thresholds

**Output**:
```
🚀 Running pre-push checks...
  → Running tests with coverage...
✅ Pre-push checks passed!
```

**Why**: Prevents broken code from reaching GitHub

---

### 4. `post-merge` - Automatic Updates

**When**: After pulling or merging changes  
**What it does**:
1. ✅ Detects changes to `package.json`
2. ✅ Automatically runs `npm install` if needed
3. ✅ Alerts about `package-lock.json` changes

**Output**:
```
🔄 Post-merge hook running...
  → package.json changed, running npm install...
✅ Post-merge checks complete!
```

**Why**: Keeps dependencies synchronized automatically

---

## ⚙️ Configuration

Hooks are configured in `.husky/` directory:

```
.husky/
├── _/              # Husky internal files
├── commit-msg      # Validates commit messages
├── pre-commit      # Runs before commits
├── pre-push        # Runs before pushes
└── post-merge      # Runs after merges
```

## 🚀 How to Use

### Normal Workflow

Just commit as usual - hooks run automatically:

```bash
git add .
git commit -m "feat: add new feature"
# → commit-msg validates format
# → pre-commit runs linting and tests

git push
# → pre-push runs full test suite
```

### Skipping Hooks (Not Recommended)

If you absolutely need to skip hooks:

```bash
# Skip pre-commit and commit-msg
git commit --no-verify -m "message"

# Skip pre-push
git push --no-verify
```

**⚠️ Warning**: Only skip hooks if you know what you're doing!

---

## 🛠️ Maintenance

### Updating Hooks

To modify what hooks do, edit files in `.husky/`:

```bash
# Edit pre-commit hook
nano .husky/pre-commit

# Make executable
chmod +x .husky/pre-commit
```

### Adding New Hooks

Create new hook file:

```bash
# Create prepare-commit-msg hook
cat > .husky/prepare-commit-msg << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Your hook logic here
EOF

chmod +x .husky/prepare-commit-msg
```

### Disabling Husky

To disable hooks temporarily:

```bash
# Unset HUSKY environment variable
export HUSKY=0

# Or skip specific hooks
git config core.hooksPath /dev/null
```

To re-enable:

```bash
unset HUSKY
# Or
npx husky install
```

---

## 📊 Hook Performance

Typical execution times:

| Hook | Time | What it runs |
|------|------|--------------|
| commit-msg | <0.1s | Message validation |
| pre-commit | ~2-3s | Linting + tests |
| pre-push | ~2-3s | Full test suite with coverage |
| post-merge | 0-30s | npm install (if needed) |

---

## 🐛 Troubleshooting

### Hook Not Running

```bash
# Reinstall hooks
npx husky install

# Check hook permissions
ls -la .husky/
# Should show: -rwxr-xr-x (executable)

# Make executable if needed
chmod +x .husky/*
```

### Tests Failing in Hook

```bash
# Run tests manually to see full output
npm test

# Run with verbose output
npm test -- --verbose
```

### Commitlint Errors

```bash
# Check commit message format
echo "your message" | npx commitlint

# See commitlint config
cat commitlint.config.js
```

### Post-merge Hook Issues

```bash
# Manually run npm install
npm install

# Check if package.json changed
git diff HEAD~1 package.json
```

---

## 📚 Related Documentation

- [Husky Documentation](https://typicode.github.io/husky/)
- [Commitlint](https://commitlint.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Project: CONVENTIONAL_COMMITS.md](./CONVENTIONAL_COMMITS.md)
- [Project: DEVELOPER_WORKFLOWS.md](./DEVELOPER_WORKFLOWS.md)

---

## ✅ Best Practices

### Do's ✅
- ✅ Let hooks run naturally
- ✅ Fix issues when hooks fail
- ✅ Write good commit messages
- ✅ Run tests locally before committing
- ✅ Keep hooks fast (< 5 seconds)

### Don'ts ❌
- ❌ Don't skip hooks regularly with `--no-verify`
- ❌ Don't commit broken code
- ❌ Don't ignore failing tests
- ❌ Don't add slow operations to pre-commit
- ❌ Don't disable Husky permanently

---

**Last Updated**: 2026-01-20  
**Husky Version**: 8.0.3  
**Status**: ✅ Fully configured and tested
