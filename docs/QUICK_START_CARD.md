# Quick Start Card - Jira-Beads Sync

**5-Minute Setup for .NET/VueJS Teams**

---

## 📥 Install (Once)

```bash
# Clone or download to your project
git clone https://github.com/yourorg/jira-beads-sync

# Run installer
cd your-project
../jira-beads-sync/install.sh    # Linux/macOS
# or: ..\jira-beads-sync\install.ps1  # Windows
```

---

## 🔄 Daily Workflow

### 1. Morning Sync
```bash
git pull origin main
# Automatically syncs Jira → beads
```

### 2. See Available Work
```bash
bd ready
# bd-a1b2 [bug] Fix button alignment (priority: 0)
```

### 3. Start Working
```bash
npm run start -- bd-a1b2
# ✓ Creates branch: bug/FRONT-235-fix-button-alignment
# ✓ Starts issue in beads
```

### 4. Make Changes & Commit
```bash
# ... edit files ...
git add .
git commit -m "Fix alignment (bd-a1b2 FRONT-235)"
```

### 5. Finish & Create PR
```bash
npm run finish -- bd-a1b2
# ✓ Marks issue done
# ✓ Pushes branch
# ✓ Creates GitHub PR
```

---

## 🎯 All Commands

| Task | Command |
|------|---------|
| **Install** | `npm run install` |
| **Sync Jira** | `npm run sync -- PROJ` |
| **Sync component** | `npm run sync -- PROJ --component NAME` |
| **Start work** | `npm run start -- ISSUE_ID` |
| **Finish work** | `npm run finish -- ISSUE_ID` |
| **Draft PR** | `npm run finish -- ISSUE_ID --draft` |
| **Test** | `npm run test` |
| **Config** | `npm run config` |

---

## 💡 Alternative: Direct Commands

```bash
# Using run.js
node run start bd-a1b2
node run finish bd-a1b2

# Using scripts directly
./scripts/bd-start-branch bd-a1b2      # Linux/macOS
.\scripts\bd-start-branch.ps1 bd-a1b2  # Windows
```

**Choose what your team prefers - all work the same!**

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Command not found | Run from project root where package.json is |
| Sync fails | Check network, run `npm run config` |
| No issues synced | Verify Jira project/component names |
| PR creation fails | Install platform CLI: `gh`, `glab`, or `bb` |

---

## 📚 More Info

- **Full docs**: See README.md
- **Quick ref**: See QUICKREF.md
- **Workflows**: See WORKFLOW_HELPERS.md
- **Help**: `npm run help` or `node run help`

---

## ⏱️ Time Savings

- **Per issue**: ~3 minutes saved
- **Per day**: ~12 minutes saved  
- **Per year**: ~51 hours saved per developer

**Team of 10 = 510 hours/year saved!**

---

## 🎉 That's It!

You're ready to use Jira-Beads sync with automated workflows.

**Next**: Try `npm run start -- bd-a1b2` on your first issue!
