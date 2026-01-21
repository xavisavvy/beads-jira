# Platform Support Guide

**Version**: 3.1.0  
**Last Updated**: January 21, 2026  
**Status**: Cross-Platform Ready 🌍

---

## 🎯 Overview

Jira-Beads Sync works across **Windows**, **macOS**, and **Linux** with multiple runtime options.

### Supported Platforms

| Platform | Status | Runtimes | Notes |
|----------|--------|----------|-------|
| **macOS** | ✅ Full Support | Node.js, Python, Bash | Recommended for development |
| **Linux** | ✅ Full Support | Node.js, Python, Bash | CI/CD friendly |
| **Windows** | ✅ Full Support | Node.js, Python, PowerShell | PowerShell 5.1+ required |

### Supported Runtimes

| Runtime | Version | Platforms | Recommended For |
|---------|---------|-----------|-----------------|
| **Node.js** | 18.0.0+ | All | .NET + VueJS teams |
| **Python** | 3.7+ | All | Python teams, CI/CD |
| **PowerShell** | 5.1+ | Windows | Windows-only environments |
| **Bash** | 4.0+ | macOS, Linux | Unix workflows |

---

## 🚀 Quick Start by Platform

### macOS

```bash
# Install Node.js (recommended)
brew install node

# Install beads
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# Clone and setup
git clone <repo>
cd <repo>
npm run onboard
```

### Linux (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install beads
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# Clone and setup
git clone <repo>
cd <repo>
npm run onboard
```

### Windows (PowerShell)

```powershell
# Install Node.js (from nodejs.org)
winget install OpenJS.NodeJS

# Install beads (follow beads installation instructions)

# Clone and setup
git clone <repo>
cd <repo>
npm run onboard
```

---

## 📋 Platform-Specific Features

### macOS Specifics

**Package Managers:**
- Homebrew (recommended): `brew install node`
- MacPorts: `port install nodejs`

**Shell:**
- Default shell: zsh (Catalina+) or bash
- Config files: `~/.zshrc` or `~/.bashrc`

**Git:**
- Installed via Xcode Command Line Tools
- `xcode-select --install`

**Recommended Setup:**
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install tools
brew install node git jq

# Install beads
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# Restart terminal, then:
npm run onboard
```

---

### Linux Specifics

**Distribution Support:**
- ✅ Ubuntu 20.04+
- ✅ Debian 10+
- ✅ Fedora 35+
- ✅ CentOS/RHEL 8+
- ✅ Arch Linux
- ✅ Alpine Linux (with bash)

**Package Managers:**
```bash
# Debian/Ubuntu
sudo apt-get update
sudo apt-get install -y nodejs npm git

# Fedora/CentOS/RHEL
sudo dnf install -y nodejs npm git

# Arch
sudo pacman -S nodejs npm git
```

**Shell:**
- Default: bash
- Config: `~/.bashrc`

**CI/CD Integration:**
```yaml
# GitHub Actions
- uses: actions/setup-node@v3
  with:
    node-version: '18'
- run: npm run onboard
```

---

### Windows Specifics

**PowerShell Requirements:**
- PowerShell 5.1+ (Windows 10+)
- PowerShell Core 7+ (recommended)

**Execution Policy:**
```powershell
# Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Package Managers:**
- **winget** (Windows 10 1809+):
  ```powershell
  winget install OpenJS.NodeJS
  winget install Git.Git
  ```
- **Chocolatey**:
  ```powershell
  choco install nodejs git
  ```
- **Scoop**:
  ```powershell
  scoop install nodejs git
  ```

**Path Issues:**
- Node.js installs to: `C:\Program Files\nodejs\`
- Add to PATH if not automatic
- Restart terminal after install

**Line Endings:**
```powershell
# Configure Git for Windows
git config --global core.autocrlf true
```

**WSL2 Support:**
```bash
# Works in WSL2 like native Linux
npm run onboard
```

---

## 🧪 Platform Testing

### Run Platform Tests

**macOS:**
```bash
bash tests/platform/test-macos.sh
```

**Linux:**
```bash
bash tests/platform/test-linux.sh
```

**Windows:**
```powershell
pwsh tests/platform/test-windows.ps1
```

### What Gets Tested

- ✅ Operating system version
- ✅ Required commands (git, node, python)
- ✅ beads installation
- ✅ File system permissions
- ✅ Script execution
- ✅ JSON parsing
- ✅ Git configuration

---

## 🔧 Runtime Selection

The system auto-detects the best runtime:

1. **Node.js** (preferred)
   - Best cross-platform support
   - Used by .NET + VueJS teams
   - Fast and reliable

2. **Python** (fallback)
   - Works everywhere
   - Good for CI/CD
   - No compilation needed

3. **PowerShell** (Windows only)
   - Native Windows experience
   - Integrates with Windows tools

### Manual Runtime Selection

**Use Node.js:**
```bash
node scripts/sync_jira_to_beads.js PROJ
npm run sync -- PROJ
```

**Use Python:**
```bash
python3 sync_jira_to_beads.py PROJ --component api
```

**Use PowerShell (Windows):**
```powershell
pwsh -File scripts/sync_jira_to_beads.ps1 PROJ -Component api
```

---

## 🐛 Platform-Specific Troubleshooting

### macOS Issues

**"bd command not found"**
```bash
# Add to PATH in ~/.zshrc or ~/.bashrc
export PATH="$HOME/.local/bin:$PATH"
source ~/.zshrc  # or ~/.bashrc
```

**"Permission denied" on scripts**
```bash
chmod +x sync_jira_to_beads.py
chmod +x scripts/onboard.js
```

**Homebrew not found**
```bash
# Install Homebrew first
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

### Linux Issues

**"Node.js not found"**
```bash
# Use NodeSource repository (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs

# Or use nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

**"Permission denied" on npm**
```bash
# Fix npm permissions
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**CI/CD Python version mismatch**
```yaml
# Use specific Python version
- uses: actions/setup-python@v4
  with:
    python-version: '3.11'
```

---

### Windows Issues

**"Script execution is disabled"**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**"Node is not recognized"**
```powershell
# Add Node to PATH manually
$env:Path += ";C:\Program Files\nodejs\"
# Or restart terminal
```

**"Git not found"**
```powershell
# Install Git for Windows
winget install Git.Git
# Restart terminal
```

**Line ending issues**
```powershell
# Configure Git
git config --global core.autocrlf true
git config --global core.eol lf
```

**PowerShell version too old**
```powershell
# Check version
$PSVersionTable.PSVersion

# Upgrade to PowerShell 7+
winget install Microsoft.PowerShell
```

---

## 📊 Platform Comparison

| Feature | macOS | Linux | Windows |
|---------|-------|-------|---------|
| **Node.js Support** | ✅ Excellent | ✅ Excellent | ✅ Excellent |
| **Python Support** | ✅ Excellent | ✅ Excellent | ✅ Good |
| **Bash Scripts** | ✅ Native | ✅ Native | ⚠️ Via WSL/Git Bash |
| **PowerShell** | ⚠️ Core only | ⚠️ Core only | ✅ Native |
| **Package Manager** | Homebrew | apt/dnf/pacman | winget/choco |
| **Terminal** | Terminal.app | Various | PowerShell/cmd |
| **Path Separator** | `:` | `:` | `;` |
| **Line Endings** | LF | LF | CRLF |
| **Case Sensitive** | No* | Yes | No |
| **CI/CD** | GitHub Actions | All CI systems | GitHub Actions |

*macOS can be case-sensitive if formatted as APFS (Case-sensitive)

---

## 🔄 Cross-Platform Best Practices

### Writing Cross-Platform Scripts

**1. Use platform-agnostic tools:**
```bash
# ✅ Good - works everywhere
npm run sync

# ❌ Avoid - platform-specific
./sync.sh  # Won't work on Windows
```

**2. Handle paths correctly:**
```javascript
// ✅ Good
const path = require('path');
const scriptPath = path.join(__dirname, 'scripts', 'sync.js');

// ❌ Avoid
const scriptPath = __dirname + '/scripts/sync.js';  // Breaks on Windows
```

**3. Test on multiple platforms:**
```bash
# Run platform tests
make test-macos    # macOS
make test-linux    # Linux
make test-windows  # Windows (via WSL or native)
```

---

## 🚢 Deployment Considerations

### Docker Support

```dockerfile
# Multi-stage build for any platform
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .
CMD ["npm", "run", "sync", "--", "PROJ"]
```

### CI/CD Matrix

```yaml
# GitHub Actions - test all platforms
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
    node: [18, 20]
runs-on: ${{ matrix.os }}
```

---

## 📚 Additional Resources

- [Node.js Installation](https://nodejs.org/)
- [Python Installation](https://www.python.org/downloads/)
- [PowerShell Installation](https://docs.microsoft.com/powershell/)
- [beads Installation](https://github.com/steveyegge/beads)
- [Git Installation](https://git-scm.com/downloads)

---

## 🆘 Getting Help

**Platform-specific issues:**
- macOS: Check `~/Library/Logs`
- Linux: Check `/var/log` or journalctl
- Windows: Check Event Viewer

**Community:**
- GitHub Issues: Report platform-specific bugs
- Discussions: Platform-specific questions
- Wiki: Platform setup guides

---

**Status**: ✅ All platforms fully supported and tested  
**Next**: Expand CI/CD platform support (GitLab, Bitbucket Pipelines)
