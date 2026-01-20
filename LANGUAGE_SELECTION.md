# Language Selection Guide

Choose the right sync script implementation for your project.

## 🎯 Quick Decision

| Your Project Stack | Use This Version | Why |
|-------------------|------------------|-----|
| **VueJS, React, Angular** | `sync_jira_to_beads.js` | Node.js already installed ✅ |
| **.NET + VueJS/React** | `sync_jira_to_beads.js` | Single runtime for frontend tools ✅ |
| **Pure .NET (no frontend)** | `sync_jira_to_beads.cs` | Native .NET tooling ✅ |
| **Python, Django, Flask** | `sync_jira_to_beads.py` | Python already in stack ✅ |
| **Polyglot/Multiple stacks** | `sync_jira_to_beads.js` | Most universal (Node.js everywhere) ✅ |
| **Linux/Unix heavy** | `sync_jira_to_beads.py` | Python pre-installed on most systems ✅ |

---

## 📊 Detailed Comparison

### Node.js Version (`sync_jira_to_beads.js`)

**Pros:**
- ✅ VueJS/React/Angular projects already have Node.js
- ✅ Fast startup (~50ms)
- ✅ Excellent Windows support
- ✅ Familiar to frontend developers
- ✅ npm ecosystem for MCP clients
- ✅ Works everywhere (Windows, macOS, Linux)

**Cons:**
- ⚠️ Requires Node.js installation (usually not an issue)
- ⚠️ May feel "foreign" to pure backend .NET teams

**Installation:**
```bash
# Usually already installed for VueJS projects
node --version  # Should show v14+

# If not installed:
# Windows: Download from nodejs.org
# macOS: brew install node
# Linux: apt install nodejs npm
```

**Usage:**
```bash
node scripts/sync_jira_to_beads.js PROJ
node scripts/sync_jira_to_beads.js PROJ --component backend-api
```

---

### C#/.NET Version (`sync_jira_to_beads.cs`)

**Pros:**
- ✅ Native .NET tooling
- ✅ Familiar to .NET developers
- ✅ Strong typing and IDE support
- ✅ Excellent Windows support
- ✅ Can be compiled to self-contained executable

**Cons:**
- ⚠️ Requires `dotnet-script` global tool
- ⚠️ Slightly slower startup (~100ms)
- ⚠️ Less useful for VueJS developers on team

**Installation:**
```bash
# Install dotnet-script once globally
dotnet tool install -g dotnet-script

# Verify
dotnet script --version
```

**Usage:**
```bash
dotnet script scripts/sync_jira_to_beads.cs -- PROJ
dotnet script scripts/sync_jira_to_beads.cs -- PROJ --component backend-api
```

**Alternative: Compile to executable:**
```bash
# Create a .csproj and compile
dotnet publish -c Release -o ./bin
./bin/sync_jira_to_beads PROJ
```

---

### Python Version (`sync_jira_to_beads.py`)

**Pros:**
- ✅ Python pre-installed on macOS/Linux
- ✅ Great for DevOps/automation teams
- ✅ Simple, readable syntax
- ✅ Easy to extend with Python packages

**Cons:**
- ⚠️ Windows requires manual Python installation
- ⚠️ Less familiar to .NET/VueJS developers
- ⚠️ Python 2 vs 3 confusion on older systems

**Installation:**
```bash
# Usually pre-installed on macOS/Linux
python3 --version  # Should show 3.7+

# If not installed:
# Windows: Download from python.org or Microsoft Store
# macOS: brew install python3
# Linux: apt install python3
```

**Usage:**
```bash
python3 scripts/sync_jira_to_beads.py PROJ
python3 scripts/sync_jira_to_beads.py PROJ --component backend-api
```

---

## 🏢 Enterprise Recommendations

### Scenario 1: Pure .NET Backend Organization
**Recommendation:** Use **C#/.NET version**

```bash
# Add to global.json to ensure dotnet-script is installed
{
  "tools": {
    "dotnet-script": "1.4.0"
  }
}

# Or include in onboarding docs:
dotnet tool install -g dotnet-script
```

### Scenario 2: .NET Backend + VueJS Frontend (Your Case)
**Recommendation:** Use **Node.js version**

**Why:**
- Frontend team already has Node.js installed
- Single runtime for all frontend tooling (Vite, ESLint, Prettier, etc.)
- Backend devs can install Node.js once (lightweight)
- Easier to get adoption from frontend-heavy teams

**Setup:**
```bash
# VueJS projects already have package.json
# Add as a script:
{
  "scripts": {
    "sync-jira": "node scripts/sync_jira_to_beads.js"
  }
}

# Then run with:
npm run sync-jira -- PROJ --component backend
```

### Scenario 3: Python/Django Shops
**Recommendation:** Use **Python version**

```bash
# Add to requirements.txt or pyproject.toml
# (No additional deps needed, uses subprocess)

# Run with:
python3 scripts/sync_jira_to_beads.py PROJ
```

### Scenario 4: Polyglot/Microservices Organization
**Recommendation:** Use **Node.js version** (most universal)

**Why:**
- Most frontend projects have Node.js
- Many build systems use Node.js (Webpack, Vite, etc.)
- Easier to standardize across teams
- Can be packaged as npm package for internal registry

---

## 🔄 Switching Between Versions

All versions are **functionally identical** and produce the same results. You can switch at any time:

```bash
# Currently using Python
python3 scripts/sync_jira_to_beads.py PROJ

# Switch to Node.js
cp sync_jira_to_beads.js scripts/
node scripts/sync_jira_to_beads.js PROJ

# Same output, same beads issues created
```

---

## 🧪 Testing All Versions

Verify all three work the same:

```bash
# Use example data for testing
python3 sync_jira_to_beads.py PROJ --use-example-data
node sync_jira_to_beads.js PROJ --use-example-data
dotnet script sync_jira_to_beads.cs -- PROJ --use-example-data

# Check beads issues created
bd ls | grep EXAMPLE

# All three should create identical issues
```

---

## 📝 Customizing Installation Scripts

### Make install.sh prefer Node.js for .NET/VueJS projects

```bash
# Edit install.sh around line 25-35

# Check if node is installed (for VueJS projects)
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  'node' command not found.${NC}"
    echo "This project uses Node.js. Install it first:"
    echo "  https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓${NC} Found node command\n"

# Copy Node.js version instead of Python
if [ -f "sync_jira_to_beads.js" ]; then
    cp sync_jira_to_beads.js "$REPO_ROOT/scripts/"
    echo -e "${GREEN}✓${NC} Copied sync script (Node.js version)\n"
else
    echo -e "${RED}❌ sync_jira_to_beads.js not found${NC}"
    exit 1
fi
```

### Update git hook to use Node.js

```bash
# In post-merge hook
if [ -n "$JIRA_COMPONENT" ]; then
    node "$SYNC_SCRIPT" "$JIRA_PROJECT_KEY" --component "$JIRA_COMPONENT"
else
    node "$SYNC_SCRIPT" "$JIRA_PROJECT_KEY"
fi
```

---

## 💡 Pro Tips

1. **Pick one and stick with it** - Don't mix versions in same repo
2. **Document your choice** - Add to README.md which version you're using
3. **Match your stack** - Use what your team already knows
4. **Consider CI/CD** - Some CI systems have Python pre-installed, others have Node
5. **Think about Windows** - Node.js is easier to install on Windows than Python

---

## 🎓 Summary

**For your .NET + VueJS organization:**

✅ **Use Node.js version** (`sync_jira_to_beads.js`)

**Why:**
1. VueJS projects already have Node.js
2. Single runtime for frontend tooling
3. Excellent Windows support
4. Familiar to frontend developers
5. Easy to standardize across teams

**Bonus:** Backend .NET devs only need to install Node.js once (lightweight, 20MB download).
