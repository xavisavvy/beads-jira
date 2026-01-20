# Documentation Organization - Agentic AI SDLC

This project follows **Agentic AI Software Development Lifecycle (SDLC)** documentation best practices, designed for optimal collaboration between humans and AI agents.

## Documentation Structure

```
jira-beads-sync/
│
├── INDEX.md                     # 📑 START HERE - Package overview & navigation
├── QUICKREF.md                  # ⚡ Quick command reference for daily use
├── README.md                    # 📖 Complete setup guide & architecture
├── EXAMPLE_WORKFLOW.md          # 💼 Real-world usage scenarios
├── OFFLINE_BEHAVIOR.md          # 🌐 Network failure handling
│
├── sync_jira_to_beads.py       # 🔧 Main implementation
└── install.sh                   # 🚀 Installation wizard
```

## Documentation Hierarchy

### Level 1: Entry Points
**Purpose:** Get users oriented quickly

| File | Audience | Reading Time | Purpose |
|------|----------|--------------|---------|
| **INDEX.md** | Everyone | 3 min | Package overview, navigation hub |
| **QUICKREF.md** | All users | 2 min | Fast command lookup |

### Level 2: Complete Guides
**Purpose:** Deep understanding and setup

| File | Audience | Reading Time | Purpose |
|------|----------|--------------|---------|
| **README.md** | New users | 10 min | Full setup, architecture, troubleshooting |
| **EXAMPLE_WORKFLOW.md** | Implementers | 8 min | Real-world daily usage patterns |

### Level 3: Specialized Topics
**Purpose:** Handle specific scenarios

| File | Audience | Reading Time | Purpose |
|------|----------|--------------|---------|
| **OFFLINE_BEHAVIOR.md** | Ops/DevOps | 4 min | Network failure modes, safety |

## Reading Paths by Role

### 🆕 New Developer (First-Time Setup)
```
1. INDEX.md          → Understand what this is
2. README.md         → Complete setup
3. QUICKREF.md       → Bookmark for daily use
4. EXAMPLE_WORKFLOW  → See it in action
```
**Time:** ~25 minutes

### 🤖 AI Agent Developer (Integration)
```
1. QUICKREF.md       → Command syntax
2. EXAMPLE_WORKFLOW  → Integration patterns
3. INDEX.md          → Architecture reference
4. README.md         → Field mappings
```
**Time:** ~15 minutes

### 🔧 Operations/DevOps (Deployment)
```
1. README.md         → Prerequisites, setup
2. OFFLINE_BEHAVIOR  → Failure modes
3. QUICKREF.md       → Automation commands
4. INDEX.md          → Architecture overview
```
**Time:** ~20 minutes

### 🐛 Troubleshooting
```
1. QUICKREF.md#troubleshooting  → Quick fixes
2. OFFLINE_BEHAVIOR.md          → Network issues
3. README.md#troubleshooting    → Detailed guide
```
**Time:** ~5-10 minutes

### 📚 Documentation Maintainer
```
1. This file (DOCUMENTATION.md)  → Structure overview
2. INDEX.md                      → Navigation hub
3. All other files               → Content audit
```
**Time:** ~30 minutes

## Agentic AI SDLC Principles Applied

### 1. **Clear Navigation**
- ✅ INDEX.md serves as central hub
- ✅ Every file cross-references related docs
- ✅ Reading paths documented by role

### 2. **Layered Information**
- ✅ Quick reference for daily tasks
- ✅ Complete guides for deep understanding
- ✅ Specialized topics in separate files

### 3. **Human & AI Optimized**
- ✅ Structured markdown for parsing
- ✅ Code examples with clear context
- ✅ Command syntax highlighting
- ✅ Tables for quick scanning

### 4. **Searchable & Scannable**
- ✅ Consistent heading hierarchy
- ✅ Tables of contents in long docs
- ✅ Keywords in headings
- ✅ Visual markers (emojis, formatting)

### 5. **Maintainable**
- ✅ Single source of truth (no duplication)
- ✅ Cross-references for related content
- ✅ Clear file ownership/purpose
- ✅ Version control friendly

## File Cross-Reference Matrix

| From | To | Link Type | Purpose |
|------|-----|-----------|---------|
| INDEX → README | Deep dive | Setup details |
| INDEX → QUICKREF | Quick start | Fast commands |
| INDEX → EXAMPLE_WORKFLOW | Scenarios | Usage patterns |
| README → INDEX | Navigation | Package overview |
| README → QUICKREF | Quick help | Command syntax |
| README → OFFLINE_BEHAVIOR | Specialization | Network handling |
| README → EXAMPLE_WORKFLOW | Examples | Real workflows |
| QUICKREF → README | Details | Full explanations |
| QUICKREF → OFFLINE_BEHAVIOR | Troubleshooting | Network issues |
| EXAMPLE_WORKFLOW → README | Reference | Architecture |
| OFFLINE_BEHAVIOR → QUICKREF | Commands | Quick fixes |

## Content Distribution

### Commands & Syntax
**Primary:** QUICKREF.md  
**Secondary:** README.md (with context), EXAMPLE_WORKFLOW.md (in scenarios)

### Architecture & Design
**Primary:** INDEX.md, README.md  
**Secondary:** All files reference as needed

### Troubleshooting
**Primary:** QUICKREF.md (quick fixes), README.md (detailed)  
**Secondary:** OFFLINE_BEHAVIOR.md (network-specific)

### Usage Examples
**Primary:** EXAMPLE_WORKFLOW.md  
**Secondary:** README.md (brief), QUICKREF.md (commands)

### Setup & Installation
**Primary:** README.md  
**Secondary:** INDEX.md (quick start), QUICKREF.md (commands)

## Documentation Standards

### File Headers
Every doc starts with:
1. Title (# heading)
2. Brief description
3. Navigation links (> blockquote)
4. Table of contents (for long docs)

### Code Blocks
- Always specify language for syntax highlighting
- Include example output when helpful
- Add comments for complex commands

### Cross-References
- Use relative links: `[QUICKREF.md](QUICKREF.md)`
- Include section anchors: `[Commands](QUICKREF.md#commands)`
- Explain link context: "See X for details on Y"

### Visual Hierarchy
- **Bold** for emphasis and UI elements
- `Code` for commands and filenames
- > Blockquotes for tips and notes
- Tables for structured data
- Emoji for visual scanning (sparingly)

## Maintenance Checklist

When updating documentation:

- [ ] Update cross-references if file structure changes
- [ ] Keep QUICKREF.md in sync with command changes
- [ ] Update examples in EXAMPLE_WORKFLOW.md
- [ ] Verify all links work
- [ ] Check reading times are still accurate
- [ ] Ensure INDEX.md reflects current structure
- [ ] Update this file if principles change

## Success Metrics

Documentation is successful when:
1. ✅ New user can get running in < 10 minutes
2. ✅ AI agent can find all commands in < 2 minutes
3. ✅ Common issues resolved via QUICKREF in < 5 minutes
4. ✅ Zero duplicate information across files
5. ✅ All cross-references valid
6. ✅ Every file serves distinct purpose

## For AI Agents Reading This

**To understand this project:**
1. Read INDEX.md for architecture
2. Read QUICKREF.md for all available commands
3. Reference README.md for field mappings and labels

**To integrate this project:**
- Commands are in QUICKREF.md
- Usage patterns in EXAMPLE_WORKFLOW.md
- Error handling in OFFLINE_BEHAVIOR.md

**To troubleshoot:**
- Start with QUICKREF.md#troubleshooting
- Network issues → OFFLINE_BEHAVIOR.md
- Setup issues → README.md#troubleshooting

---

**Last Updated:** 2026-01-20  
**Documentation Version:** 1.0  
**Follows:** Agentic AI SDLC Best Practices
