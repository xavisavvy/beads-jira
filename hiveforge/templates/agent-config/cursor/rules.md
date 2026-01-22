# {{PROJECT_NAME}} - Cursor Rules

## Project Context

This project uses HiveForge for AI-assisted development. Issues are tracked in `.beads/`.

## Coding Guidelines

### Style
- Follow existing patterns in the codebase
- Use meaningful names for variables and functions
- Keep functions focused and small
- Add comments only where logic is non-obvious

### Best Practices
- Check existing code before creating new files
- Reuse existing utilities and helpers
- Maintain consistent error handling patterns
- Follow the principle of least surprise

### Testing
- Write tests for new functionality
- Ensure existing tests pass before changes
- Mock external dependencies appropriately

## Issue Workflow

1. Find issues in `.beads/issues.jsonl`
2. Reference issue IDs in commits
3. Follow conventional commit format

## Forbidden Actions

- Don't create unnecessary abstractions
- Don't add dependencies without justification
- Don't modify unrelated code
- Don't skip tests or linting

## Helpful Commands

```bash
# Check issues
bd ready

# Run tests
npm test

# Check configuration
npx hiveforge status
```
