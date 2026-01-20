# Script Synchronization Guide

This project maintains parallel installation scripts for cross-platform compatibility:
- `install.sh` - Bash script for Linux/macOS/WSL
- `install.ps1` - PowerShell script for Windows

## 🔄 Keeping Scripts in Sync

**IMPORTANT**: When modifying either installation script, both versions MUST be updated to maintain feature parity.

### For AI Assistants (Copilot/Claude)

When asked to modify installation logic:

1. **Always update BOTH scripts** - Make equivalent changes to both `install.sh` and `install.ps1`
2. **Test the logic** - Ensure the same functionality works on both platforms
3. **Preserve platform idioms** - Use native commands and conventions for each platform:
   - Bash: `command -v`, `$VARIABLE`, forward slashes
   - PowerShell: `Get-Command`, `$Variable`, backslashes
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

When modifying installation logic, verify:

- [ ] Both `install.sh` and `install.ps1` are updated
- [ ] Functionality is equivalent (same checks, same outputs)
- [ ] Platform-specific commands are used correctly
- [ ] Color output works on both platforms
- [ ] File paths use correct separators for each platform
- [ ] Error handling is consistent
- [ ] User prompts are similar
- [ ] Generated files (hooks, configs) work on both platforms
- [ ] This guide is updated if new patterns are introduced

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

When you receive a request to modify installation functionality:

1. **Read both scripts first** to understand current implementation
2. **Make changes to BOTH files** in the same response
3. **Use the equivalence map** above for platform-specific commands
4. **Preserve formatting** and structure of each script
5. **Update this guide** if you introduce new patterns
6. **Explain the changes** and note which lines were modified in each file

### Example Workflow

User request: "Add a check for Python 3.8+"

Your response should:
1. Add Python version check to `install.sh` using `python3 --version`
2. Add equivalent check to `install.ps1` using `python --version`
3. Use appropriate error messages for each platform
4. Update both scripts in parallel in one response

## 📝 Notes

- The PowerShell script was created on 2026-01-20 to match `install.sh` functionality
- Both scripts should produce the same end result: installed sync script, git hooks, and config file
- Platform differences are acceptable when they improve native user experience
- Always prioritize cross-platform compatibility in core logic
