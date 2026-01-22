# {{PROJECT_NAME}} - AI Agent Instructions

This project uses HiveForge for AI-assisted development workflows.

## Issue Tracking

- **Issue Tracker**: {{ISSUE_TRACKER}}
- **Tools**: {{TOOLS}}

## Working with Issues

Issues are synced to the `.beads/` directory. Before starting work:

1. Check available issues:
   ```bash
   bd ready
   ```

2. Start working on an issue:
   ```bash
   npm run start -- bd-xxx
   ```

3. When finished:
   ```bash
   npm run finish -- bd-xxx
   ```

## Development Guidelines

### Code Style
- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Add comments for complex logic

### Testing
- Write tests for new functionality
- Run tests before committing: `npm test`

### Commits
- Use conventional commit messages
- Reference issue IDs in commits when applicable

## Project Structure

```
.
├── .beads/           # Synced issues (auto-generated)
├── .hiveforge.json   # HiveForge configuration
├── src/              # Source code
└── tests/            # Test files
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run sync` | Sync issues from tracker |
| `npm run start -- <id>` | Start working on issue |
| `npm run finish -- <id>` | Complete issue and create PR |
| `npm test` | Run tests |
| `npx hiveforge status` | Check configuration |

## Notes for AI Agents

- Always check `.beads/issues.jsonl` for current issue context
- Reference the issue ID when making changes
- Follow the project's existing code style
- Run tests before suggesting commits
