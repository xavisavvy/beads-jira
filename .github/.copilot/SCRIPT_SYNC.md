# Script Synchronization Guide

This project maintains parallel scripts for cross-platform and multi-language compatibility:

## Installation Scripts
- `install.sh` - Bash script for Linux/macOS/WSL
- `install.ps1` - PowerShell script for Windows

## Sync Script Implementations
- `sync_jira_to_beads.py` - Python 3 (original)
- `sync_jira_to_beads.js` - Node.js (for VueJS/Node projects)
- `sync_jira_to_beads.cs` - C#/.NET (for .NET projects)

## 🔄 Keeping Scripts in Sync

**IMPORTANT**: When modifying functionality:
1. **Installation scripts** - Both `install.sh` and `install.ps1` must be updated
2. **Sync logic** - All three implementations (`.py`, `.js`, `.cs`) must be updated

### For AI Assistants (Copilot/Claude)

When asked to modify installation logic:

1. **Always update BOTH installation scripts** - Make equivalent changes to both `install.sh` and `install.ps1`
2. **Preserve platform idioms** - Use native commands for each platform:
   - Bash: `command -v`, `$VARIABLE`, forward slashes
   - PowerShell: `Get-Command`, `$Variable`, backslashes

When asked to modify sync logic (Jira query, field mapping, beads commands):

1. **Always update ALL THREE sync implementations** - Make equivalent changes to `.py`, `.js`, and `.cs`
2. **Preserve language idioms** - Use native patterns for each language:
   - Python: `snake_case`, list comprehensions, `subprocess.run()`
   - JavaScript: `camelCase`, async/await, `execSync()`
   - C#: `PascalCase`, LINQ, `Process.Start()`
3. **Test the logic** - Ensure the same functionality works in all languages
4. **Check this file** - Review this guide before making changes

### Functional Equivalence Map

| Task | Bash (install.sh) | PowerShell (install.ps1) |
|------|-------------------|--------------------------|
| Exit on error | `set -e` | `$ErrorActionPreference = "Stop"` |
| Check command exists | `command -v bd &> /dev/null` | `Get-Command bd -ErrorAction SilentlyContinue` |
| Get git root | `git rev-parse --show-toplevel` | `git rev-parse --show-toplevel` then convert slashes |
| Create directory | `mkdir -p "$DIR"` | `New-Item -ItemType Directory -Path $DIR -Force` |
| Copy file | `cp source dest` | `Copy-Item source -Destination dest -Force` |
| Make executable | `chmod +x file` | N/A (not needed on Windows) |
| User prompt | `read -p "Prompt" VAR` | `$VAR = Read-Host "Prompt"` |
| Colors | ANSI codes `\033[0;32m` | `Write-Host -ForegroundColor Green` |
| Path separator | `/` | `\` (use `Join-Path` or `-replace '/', '\'`) |
| Python command | `python3` | `python` (Python 3 is default on Windows) |

### Platform-Specific Considerations

#### Windows (PowerShell)
- Git hooks can be bash scripts (Git for Windows includes Git Bash)
- Provide BOTH bash and PowerShell versions of hooks when possible
- Use `Join-Path` for cross-compatible path handling
- No need for executable permissions (`chmod +x`)

#### Linux/macOS (Bash)
- Always use `python3` explicitly
- Set executable permissions with `chmod +x`
- Use POSIX-compatible commands

### Git Hooks
The scripts create git hooks that run on `git pull`. Both versions create:
- `post-merge` - Bash version (works with Git Bash on Windows)
- `post-merge.ps1` - PowerShell version (optional, Windows-native)

### Checklist for Updates

When modifying **installation logic**, verify:

- [ ] Both `install.sh` and `install.ps1` are updated
- [ ] Functionality is equivalent (same checks, same outputs)
- [ ] Platform-specific commands are used correctly
- [ ] Color output works on both platforms
- [ ] File paths use correct separators for each platform
- [ ] Error handling is consistent
- [ ] User prompts are similar
- [ ] Generated files (hooks, configs) work on both platforms

When modifying **sync logic** (Jira queries, field mapping, beads integration), verify:

- [ ] All three implementations (`.py`, `.js`, `.cs`) are updated
- [ ] Same Jira query logic (JQL building, filtering)
- [ ] Same field mappings (priority, issue type, labels)
- [ ] Same beads commands (`bd create`, `bd edit`, `bd label`)
- [ ] Same error handling and offline behavior
- [ ] Same output messages and formatting
- [ ] Language-specific idioms are used correctly
- [ ] All three produce identical beads issues from same Jira data

When modifying either, update:
- [ ] This guide if new patterns are introduced

### Testing

After changes:

**Linux/macOS:**
```bash
cd /path/to/test/repo
bash install.sh
```

**Windows:**
```powershell
cd C:\path\to\test\repo
.\install.ps1
```

## 🤖 AI Assistant Instructions

### For Installation Script Changes

When you receive a request to modify installation functionality:

1. **Read both scripts first** (`install.sh` and `install.ps1`)
2. **Make changes to BOTH files** in the same response
3. **Use the equivalence map** above for platform-specific commands
4. **Preserve formatting** and structure of each script
5. **Update this guide** if you introduce new patterns

**Example**: "Add a check for Node.js version"
- Update `install.sh`: Use `node --version | grep -oE 'v[0-9]+' | sed 's/v//'`
- Update `install.ps1`: Use `node --version | Select-String 'v(\d+)' | ...`

### For Sync Logic Changes

When you receive a request to modify sync functionality:

1. **Read all three implementations first** (`.py`, `.js`, `.cs`)
2. **Make changes to ALL THREE files** in the same response
3. **Use language-specific idioms** (see maps below)
4. **Preserve structure** and keep implementations parallel
5. **Update this guide** if you introduce new patterns

**Example**: "Add support for syncing Jira labels"

Your response should:
1. Update Python version: Add to `_get_example_data()`, update `sync_to_beads()` loop
2. Update Node.js version: Add to `getExampleData()`, update `syncToBeads()` loop
3. Update C# version: Add to `GetExampleData()`, update `SyncToBeadsAsync()` loop
4. Use language idioms: Python `for label in labels`, JS `labels.forEach()`, C# `foreach (var label in labels)`

### Language Equivalence Maps

#### Command Execution
| Task | Python | Node.js | C# |
|------|--------|---------|-----|
| Run command | `subprocess.run(['bd', 'ls'])` | `execSync('bd ls')` | `Process.Start("bd", "ls")` |
| Get output | `result.stdout.decode()` | `execSync('bd ls', {encoding: 'utf-8'})` | `process.StandardOutput.ReadToEnd()` |
| Parse JSON | `json.loads(output)` | `JSON.parse(output)` | `JsonSerializer.Deserialize<T>(output)` |

#### Naming Conventions
| Element | Python | Node.js | C# |
|---------|--------|---------|-----|
| Functions | `snake_case` | `camelCase` | `PascalCase` |
| Variables | `snake_case` | `camelCase` | `camelCase` |
| Classes | `PascalCase` | `PascalCase` | `PascalCase` |
| Constants | `UPPER_SNAKE` | `UPPER_SNAKE` or `camelCase` | `PascalCase` |

#### Iteration
| Task | Python | Node.js | C# |
|------|--------|---------|-----|
| Loop list | `for item in items:` | `items.forEach(item => {})` | `foreach (var item in items)` |
| Map | `[x*2 for x in items]` | `items.map(x => x*2)` | `items.Select(x => x*2)` |
| Filter | `[x for x in items if x>0]` | `items.filter(x => x>0)` | `items.Where(x => x>0)` |

## 📝 Notes

- The PowerShell script was created on 2026-01-20 to match `install.sh` functionality
- Both scripts should produce the same end result: installed sync script, git hooks, and config file
- Platform differences are acceptable when they improve native user experience
- Always prioritize cross-platform compatibility in core logic
