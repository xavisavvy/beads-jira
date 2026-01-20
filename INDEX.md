# Jira-Beads Sync Integration

**One-way sync from Jira to local beads issue tracker via Atlassian Rovo MCP**

## 📑 Documentation Index

This project follows **Agentic AI SDLC** documentation structure for AI agent and human developer collaboration.

### 🚀 Getting Started (Start Here!)

1. **[INDEX.md](INDEX.md)** - Package overview and navigation (you are here)
2. **[QUICKREF.md](QUICKREF.md)** - Quick command reference and common tasks
3. **[README.md](README.md)** - Complete setup guide, architecture, and features

### 📖 Detailed Guides

4. **[EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md)** - Real-world usage scenarios
   - Daily developer workflow
   - AI agent integration examples
   - Team collaboration patterns
   
5. **[OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md)** - Network failure handling
   - What happens when offline
   - Safe failure modes
   - Example data vs production usage

### 📚 For Documentation Maintainers

6. **[DOCUMENTATION.md](DOCUMENTATION.md)** - Documentation organization guide
   - Agentic AI SDLC principles applied
   - Reading paths by role
   - Maintenance guidelines

7. **[ROADMAP.md](ROADMAP.md)** - Development roadmap (UPDATED)
   - **Phase 0**: CI/CD Foundation (NEW - CRITICAL)
   - Phase 1-6: UX improvements and features
   - Success metrics and timeline

8. **[AGENTIC_AI_CICD_ANALYSIS.md](AGENTIC_AI_CICD_ANALYSIS.md)** - CI/CD gap analysis (NEW)
   - Current state assessment
   - Critical gaps identified
   - Implementation recommendations
   - Code examples and templates

9. **[AGENTIC_AI_CICD_REVIEW_SUMMARY.md](AGENTIC_AI_CICD_REVIEW_SUMMARY.md)** - Review summary (NEW)
   - Executive overview
   - Grade breakdown by category
   - Priority recommendations

### 🔧 Implementation Files

7. **sync_jira_to_beads.py** - Main synchronization script
8. **install.sh** - Interactive installation wizard

---

## 🎯 Quick Start

### For Humans
```bash
# 1. Run interactive installer
./install.sh

# 2. Follow prompts to configure your Jira project
# 3. Test the sync
python3 scripts/sync_jira_to_beads.py YOURPROJECT --component yourcomponent
```

### For AI Agents
```bash
# Read QUICKREF.md first for command reference
# Then check EXAMPLE_WORKFLOW.md for integration patterns
# Use beads commands after sync:
bd ready --json  # Get available work
bd show <id>     # Read issue details
```

---

## 📦 What This Package Does

### The Problem
- Jira issues live in the cloud (no offline access)
- AI agents struggle with Jira API authentication
- Can't track discovered work alongside planned Jira work
- Need local, structured issue data

### The Solution
```
Jira Cloud (Team coordination)
    ↓ (one-way sync via MCP)
Local Beads DB (AI agents, offline work)
    ↓
Your AI coding agents + local development
```

### Key Benefits
- ✅ **Offline access** - Work with Jira issues without internet
- ✅ **AI integration** - Agents query local beads, not Jira API
- ✅ **Automatic sync** - Git hooks keep issues updated
- ✅ **Track discoveries** - Link local work to Jira issues
- ✅ **Safe offline** - No fake data when network fails

---

## 🗂️ Documentation Guide by Role

### New Developer (First Time Setup)
1. Read [README.md](README.md) - Overview & Installation
2. Run `./install.sh` - Automated setup
3. Check [QUICKREF.md](QUICKREF.md) - Common commands
4. Review [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md) - Daily usage

### AI Agent Developer (Integration)
1. Read [QUICKREF.md](QUICKREF.md) - Command reference
2. Study [EXAMPLE_WORKFLOW.md](EXAMPLE_WORKFLOW.md) - AI agent examples
3. Reference [README.md](README.md) - Field mappings & labels

### Operations (Deployment)
1. Check [README.md](README.md) - Prerequisites & troubleshooting
2. Review [OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md) - Failure modes
3. Use [QUICKREF.md](QUICKREF.md) - Cron & automation setup

### Troubleshooting
1. Start with [QUICKREF.md](QUICKREF.md) - Quick fixes
2. Check [OFFLINE_BEHAVIOR.md](OFFLINE_BEHAVIOR.md) - Network issues
3. See [README.md](README.md) - Detailed troubleshooting

---

## 🏗️ Architecture Overview

### Components
```
┌─────────────────────────────────────────────────────┐
│                   Jira Cloud                        │
│              (Team's source of truth)               │
└────────────────────┬────────────────────────────────┘
                     │
                     │ Atlassian Rovo MCP
                     │ (OAuth authenticated)
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│          sync_jira_to_beads.py                      │
│  • Queries via MCP                                  │
│  • Maps Jira → Beads format                         │
│  • Creates/updates local issues                     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│            Local Beads Database                      │
│              (.beads/beads.db)                       │
│  • SQLite database                                  │
│  • Offline accessible                               │
│  • Full-text search                                 │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│ AI Agents    │          │ Developers   │
│ (via bd CLI) │          │ (via bd CLI) │
└──────────────┘          └──────────────┘
```

### Data Flow

1. **Query**: Script queries Jira via MCP server
2. **Transform**: Converts Jira issues to beads format
3. **Sync**: Creates new or updates existing beads issues
4. **Label**: Tags with `jira-synced`, Jira key, component
5. **Access**: AI agents and developers query via `bd` commands

---

## 📊 Issue Mapping

| Jira Field | Beads Field | Transformation |
|------------|-------------|----------------|
| Summary | Title | Direct copy |
| Description | Description | Includes Jira metadata |
| Priority | Priority (0-4) | Highest→0, High→1, Medium→2, Low→3, Lowest→4 |
| Type | Type | Bug→bug, Task→task, Story→feature, Epic→epic |
| Key | Label | e.g., "PROJ-123" |
| Component | Label | e.g., "component-backend-api" |
| - | Label | "jira-synced" on all |

---

## 🔐 Security & Limitations

### Current State (Prototype)
- ⚠️ Uses example data by default (MCP integration not complete)
- ⚠️ One-way sync only (Jira → Beads)
- ⚠️ No authentication implementation (relies on MCP)

### Safe Offline Behavior
- ✅ Returns empty list when offline (no fake data)
- ✅ Preserves existing beads issues
- ✅ Exit code 0 (safe for git hooks)
- ✅ Clear error messages

### Production Considerations
- Implement real MCP client integration
- Add error retry logic
- Consider rate limiting
- Add logging for auditing

---

## 🤝 Contributing & Extending

This is a **working prototype** designed to be extended:

### To Add Real MCP Integration
Edit `_query_via_mcp_client()` in `sync_jira_to_beads.py`:
```python
def _query_via_mcp_client(self, jql: str) -> List[Dict]:
    # Replace with actual MCP client library
    # Example: use Anthropic's MCP SDK
    pass
```

### To Add Bidirectional Sync
Create `sync_beads_to_jira.py` to push updates back to Jira.

### To Customize Filtering
Edit JQL query in `query_jira_via_mcp()` method.

---

## 📄 License

MIT License - Same as [beads](https://github.com/steveyegge/beads)

---

## 🔗 Related Resources

- **Beads**: https://github.com/steveyegge/beads
- **Atlassian Rovo MCP**: https://support.atlassian.com/rovo/
- **Model Context Protocol**: https://modelcontextprotocol.io/
- **Agentic AI SDLC**: Best practices for AI-augmented development

---

## 📞 Support

**For questions about:**
- **This integration** → Check documentation files above
- **Beads** → https://github.com/steveyegge/beads
- **Atlassian MCP** → https://support.atlassian.com/rovo/

---

**Ready to start?** 
- **Humans**: See [README.md](README.md) for detailed setup
- **AI Agents**: See [QUICKREF.md](QUICKREF.md) for commands
- **Everyone**: Run `./install.sh` to begin!
