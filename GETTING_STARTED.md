# 🚀 Getting Started - Quick Decision Tree

**Choose your path based on your needs:**

---

## 📝 What Do You Want to Do?

### 1️⃣ I Just Want to Try It Out
```bash
# Quick test with example data
./install.sh
node scripts/sync_jira_to_beads.js PROJ --use-example-data
bd ready
```
**Next**: See [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md)

---

### 2️⃣ I Want to Set Up My Project
```bash
# Full installation
./install.sh
# Answer prompts for Jira project and component
```
**Next**: See [README.md](README.md#quick-start)

---

### 3️⃣ I Want to Use Workflow Automation
```bash
# After installing, use helpers
npm run start -- bd-a1b2   # Start work
npm run finish -- bd-a1b2  # Finish & PR
```
**Next**: See [WORKFLOW_HELPERS.md](WORKFLOW_HELPERS.md)

---

### 4️⃣ I Want to Choose a Language
| Your Stack | Use This |
|------------|----------|
| .NET + VueJS | `sync_jira_to_beads.js` (Node.js) ⭐ |
| Pure .NET | `sync_jira_to_beads.cs` (C#) |
| Python/Linux | `sync_jira_to_beads.py` (Python) |

**Next**: See [LANGUAGE_SELECTION.md](LANGUAGE_SELECTION.md)

---

### 5️⃣ I Want to Roll Out to My Team
| Team Size | Strategy |
|-----------|----------|
| 1-10 devs | Manual setup per repo |
| 10-50 devs | Git submodules |
| 50+ devs | Internal package + templates |

**Next**: See [ENTERPRISE_DEPLOYMENT.md](ENTERPRISE_DEPLOYMENT.md)

---

### 6️⃣ I Want to Understand the Workflow
**Choose your persona:**
- Frontend Developer → [DEVELOPER_WORKFLOWS.md](DEVELOPER_WORKFLOWS.md#persona-1-frontend-developer-alice---vuejs-project)
- Backend Developer → [DEVELOPER_WORKFLOWS.md](DEVELOPER_WORKFLOWS.md#persona-2-backend-developer-bob---net-api-project)
- Full-Stack Developer → [DEVELOPER_WORKFLOWS.md](DEVELOPER_WORKFLOWS.md#persona-3-full-stack-developer-charlie---multiple-repos)
- Team Lead → [DEVELOPER_WORKFLOWS.md](DEVELOPER_WORKFLOWS.md#persona-4-team-lead-diana---oversight--planning)
- DevOps Engineer → [DEVELOPER_WORKFLOWS.md](DEVELOPER_WORKFLOWS.md#persona-5-devops-engineer-eve---automation)

---

### 7️⃣ I Need Quick Commands
**See**: [QUICKREF.md](QUICKREF.md)

Common commands:
```bash
# Sync Jira
npm run sync -- PROJ --component backend

# Start work
npm run start -- bd-a1b2

# Finish work
npm run finish -- bd-a1b2
```

---

### 8️⃣ I'm Offline / Having Issues
**See**: [OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md)

TL;DR:
- ✅ Sync works offline (uses cached data)
- ✅ Beads always works offline
- ✅ Workflow helpers work offline (no PR creation)

---

## 🎯 Most Common Path

For .NET + VueJS teams (your case):

```bash
# 1. Install
npm run install
# Or: ./install.sh (Linux/macOS) or .\install.ps1 (Windows)

# 2. Configure for your Jira
# Enter project: PROJ
# Enter component: backend-api

# 3. Test sync
npm run sync -- PROJ --component backend-api

# 4. Try workflow helpers
bd ready
npm run start -- bd-a1b2
# ... make changes ...
npm run finish -- bd-a1b2

# 5. Done! 🎉
```

---

## 📚 Full Documentation Index

| File | Purpose | When to Read |
|------|---------|--------------|
| **COMPLETE_SUMMARY.md** | Project overview | First time |
| **README.md** | Setup guide | Installing |
| **QUICKREF.md** | Command reference | Daily use |
| **WORKFLOW_HELPERS.md** | Automation guide | Setting up helpers |
| **LANGUAGE_SELECTION.md** | Choose language | Deciding stack |
| **DEVELOPER_WORKFLOWS.md** | Persona workflows | Understanding usage |
| **ENTERPRISE_DEPLOYMENT.md** | Rollout strategies | Team/org deployment |
| **EXAMPLE_WORKFLOW.md** | Real scenarios | Learning patterns |
| **OFFLINE_BEHAVIOR.md** | Network handling | Troubleshooting |
| **INDEX.md** | Navigation | Finding docs |

---

## ⏱️ Time Estimate

### Individual Setup
- **Quick test**: 5 minutes
- **Full setup**: 10 minutes
- **With workflow helpers**: 15 minutes

### Team Rollout
- **Small team (5 devs)**: 1 hour
- **Medium team (20 devs)**: 4 hours (1 per week)
- **Large org (100+ devs)**: See ENTERPRISE_DEPLOYMENT.md

---

## 💡 Pro Tips

1. **Start small**: Test with one repo first
2. **Use Node.js**: Already installed for VueJS projects
3. **Install platform CLI**: `gh` for GitHub, `glab` for GitLab, `bb` for Bitbucket
4. **Train team**: Share WORKFLOW_HELPERS.md with developers
5. **Measure success**: Track time saved per issue

---

## 🆘 Need Help?

1. Check [QUICKREF.md](QUICKREF.md) for commands
2. See [README.md](README.md#troubleshooting) for common issues
3. Review [OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md) for network issues
4. Ask your AI assistant (Copilot/Claude)!

---

## 🎉 You're Ready!

Pick your path above and get started. Most people start with #2 (Set Up My Project).

**Questions?** Check the docs or ask your AI assistant.

**Happy coding! 🚀**
