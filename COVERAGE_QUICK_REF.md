# Test Coverage Quick Reference

## Summary Stats
```
Tests:       301 passing
Coverage:    18.8% statements, 26.6% branches, 38.98% functions
Status:      ✅ All thresholds met
Build Time:  ~1.5 seconds
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/bd-finish.test.js

# Watch mode
npm test -- --watch

# Update snapshots
npm test -- -u
```

## Coverage Highlights

### 🏆 Best Coverage (sync-pr-templates.js)
- 60.67% statements
- 63.33% branches  
- 83.33% functions
- **Why**: Pure functions, minimal I/O

### ⚡ Good Function Coverage (bd-finish.js)
- 75% functions
- **Why**: Extracted testable helpers

### 📊 Overall Health
- **Functions**: 38.98% (target: 38%) ✅
- **Branches**: 26.6% (target: 26%) ✅
- **Statements**: 18.8% (target: 18%) ✅

## What's Tested

### ✅ Critical Paths (60-90% coverage)
- Data transformation (priority, issue type mapping)
- Input validation (Jira keys, arguments)
- String formatting (branch names, PR titles)
- Template processing (normalization)

### ⚠️ Light Testing (10-30% coverage)
- External commands (`git`, `bd`, `gh`)
- File system operations
- User prompts
- Main entry points

## Key Files

| File | Purpose | Coverage | Priority |
|------|---------|----------|----------|
| `COVERAGE_BEST_PRACTICES.md` | Detailed guide | - | 📖 Read first |
| `COVERAGE_REVIEW_SUMMARY.md` | Changes made | - | 📋 Reference |
| `jest.config.js` | Test configuration | - | ⚙️ Thresholds |
| `coverage/lcov-report/index.html` | Interactive report | - | 🔍 Visual |

## Quick Commands

```bash
# Check current coverage
npm test -- --coverage --silent | tail -15

# Run only fast tests
npm test -- --testPathIgnorePatterns=integration

# Debug a specific test
node --inspect-brk node_modules/.bin/jest tests/bd-finish.test.js

# Generate fresh coverage report
rm -rf coverage && npm test -- --coverage
```

## Best Practices Checklist

- [x] Pure functions extracted and tested
- [x] Edge cases covered (null, empty, long input)
- [x] Error paths validated
- [x] Critical business logic tested
- [x] Module exports pattern used
- [x] Realistic thresholds for CLI tools
- [x] Fast test execution (< 2s)
- [x] No flaky tests
- [x] Documentation complete

## When to Update Coverage

### Add Tests When:
- Adding new pure functions
- Changing business logic
- Fixing bugs (add regression test)
- Adding new validators/parsers

### Don't Add Tests When:
- Just wrapping external commands
- Adding simple file I/O
- Changing only UI text
- Refactoring without logic changes

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Coverage Report](coverage/lcov-report/index.html)
- [Best Practices Guide](COVERAGE_BEST_PRACTICES.md)
- [Review Summary](COVERAGE_REVIEW_SUMMARY.md)

## Troubleshooting

**Tests failing?**
```bash
npm test -- --verbose
```

**Coverage not updating?**
```bash
rm -rf coverage node_modules/.cache
npm test -- --coverage --no-cache
```

**Need to see specific file coverage?**
```bash
npm test -- --coverage --collectCoverageFrom='bd-finish.js'
```

**Want only failed tests?**
```bash
npm test -- --onlyFailures
```

---

**Last Updated**: 2026-01-20  
**Status**: ✅ All tests passing  
**Maintainer**: Development Team
