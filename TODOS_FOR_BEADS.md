# TODO Items - Convert to Beads Issues

This file contains action items extracted from documentation that should be converted to beads issues.
Once converted, this file can be deleted.

## High Priority - Testing & Coverage

### test: Add integration tests for common workflows
**Priority**: High  
**Type**: enhancement  
**Labels**: testing, integration  
**Description**:
Add end-to-end integration tests that exercise complete user workflows:
- Sync workflow: Jira → Beads → Local issues
- Start workflow: bd-start-branch with issue
- Finish workflow: bd-finish with PR creation
- Template sync workflow

**Acceptance Criteria**:
- [ ] Integration test for sync workflow
- [ ] Integration test for start-branch workflow
- [ ] Integration test for finish workflow
- [ ] Integration test for template sync
- [ ] All tests pass in CI/CD
- [ ] Coverage increases by 5-10%

**Effort**: Medium (2-3 days)

---

### test: Mock external commands for isolated testing
**Priority**: Medium  
**Type**: enhancement  
**Labels**: testing, mocking  
**Description**:
Add mocking infrastructure for external commands (`bd`, `git`, `gh`) to enable isolated unit testing without requiring actual command execution.

**Acceptance Criteria**:
- [ ] Mock framework set up (jest.mock or similar)
- [ ] bd commands mocked
- [ ] git commands mocked
- [ ] gh/gitlab-cli commands mocked
- [ ] Tests can run without external dependencies
- [ ] Coverage increases for bd-finish and bd-start-branch

**Effort**: Medium (2-3 days)

---

### test: Add property-based testing for validators
**Priority**: Low  
**Type**: enhancement  
**Labels**: testing, validation  
**Description**:
Implement property-based testing (using fast-check or similar) for input validation functions to discover edge cases automatically.

**Focus Areas**:
- Jira key pattern validation
- Branch name sanitization
- Issue ID format validation
- Priority/type mapping

**Acceptance Criteria**:
- [ ] fast-check library installed
- [ ] Property tests for Jira key validation
- [ ] Property tests for branch name slugification
- [ ] Property tests for ID validation
- [ ] Found and fixed any edge cases

**Effort**: Small (1-2 days)

---

### test: Increase statement coverage to 25-30%
**Priority**: Medium  
**Type**: enhancement  
**Labels**: testing, coverage  
**Description**:
Gradual improvement of test coverage through strategic test additions focusing on high-value code paths.

**Target Metrics**:
- Statements: 18.8% → 25-30%
- Branches: 26.6% → 35-40%
- Functions: 38.98% → 45-50%

**Acceptance Criteria**:
- [ ] Coverage thresholds updated in jest.config.js
- [ ] New tests added for uncovered critical paths
- [ ] Coverage report shows improvement
- [ ] All tests pass

**Effort**: Medium (2-3 days)

---

### test: Add E2E tests for complete user workflows
**Priority**: Low  
**Type**: enhancement  
**Labels**: testing, e2e  
**Description**:
Add end-to-end tests that exercise complete user workflows from start to finish, including actual command execution in a test environment.

**Acceptance Criteria**:
- [ ] E2E test framework set up
- [ ] Test environment configured
- [ ] Complete workflow tests written
- [ ] Tests run in CI/CD
- [ ] Documentation updated

**Effort**: Large (4-5 days)

---

## Medium Priority - Python Support

### test: Configure Python test suite with Pytest
**Priority**: Medium  
**Type**: enhancement  
**Labels**: testing, python  
**Description**:
Add comprehensive testing for Python scripts using Pytest, matching the Node.js test coverage.

**Acceptance Criteria**:
- [ ] Pytest installed and configured
- [ ] tests/ directory has Python test files
- [ ] Unit tests for sync_jira_to_beads.py
- [ ] Mock Jira API calls
- [ ] Coverage reporting configured
- [ ] Tests run in CI/CD

**Effort**: Medium (2-3 days)

---

### chore: Add Pylint for Python code quality
**Priority**: Low  
**Type**: enhancement  
**Labels**: code-quality, python  
**Description**:
Add Pylint configuration and integrate with pre-commit hooks for Python code quality.

**Acceptance Criteria**:
- [ ] Pylint installed
- [ ] .pylintrc configured
- [ ] Pre-commit hook added
- [ ] Existing Python code passes linting
- [ ] CI/CD runs Pylint

**Effort**: Small (1 day)

---

## Low Priority - CI/CD Enhancements

### ci: Add GitLab CI configuration
**Priority**: Low  
**Type**: enhancement  
**Labels**: ci-cd, gitlab  
**Description**:
Create .gitlab-ci.yml to provide CI/CD support for GitLab users, matching the GitHub Actions functionality.

**Acceptance Criteria**:
- [ ] .gitlab-ci.yml created
- [ ] Cross-platform matrix testing configured
- [ ] Tests run on merge requests
- [ ] Documentation updated

**Effort**: Small (1 day)

---

### ci: Add status badges to README
**Priority**: Low  
**Type**: documentation  
**Labels**: documentation, ci-cd  
**Description**:
Add build status, coverage, and version badges to README for visibility.

**Badges to Add**:
- Build status (GitHub Actions)
- Test coverage (Codecov or Coveralls)
- npm version
- License

**Acceptance Criteria**:
- [ ] Badges added to README
- [ ] Links working correctly
- [ ] Badges update automatically

**Effort**: Small (30 minutes)

---

### ci: Add performance benchmarks
**Priority**: Low  
**Type**: enhancement  
**Labels**: performance, testing  
**Description**:
Add performance benchmarking to track execution time of critical operations and prevent performance regressions.

**Metrics to Track**:
- Sync operation time
- Branch creation time
- PR creation time
- Template sync time

**Acceptance Criteria**:
- [ ] Benchmark suite added
- [ ] Baseline metrics established
- [ ] CI/CD runs benchmarks
- [ ] Alerts on significant regressions

**Effort**: Medium (2 days)

---

## Future Enhancements

### feat: Add snapshot testing for output formats
**Priority**: Low  
**Type**: enhancement  
**Labels**: testing, snapshots  
**Description**:
Use Jest snapshot testing to ensure consistent output formatting for PR templates, commit messages, and CLI output.

**Acceptance Criteria**:
- [ ] Snapshot tests for PR templates
- [ ] Snapshot tests for commit messages
- [ ] Snapshot tests for CLI help output
- [ ] Snapshots committed to repo
- [ ] Documentation on updating snapshots

**Effort**: Small (1 day)

---

## Notes

- These items are prioritized based on impact vs effort
- Coverage goals are realistic for CLI tools with heavy I/O
- Focus on high-value tests rather than arbitrary coverage %
- Integration with existing CI/CD pipeline is critical

## Conversion Instructions

To convert these to beads issues, run:

```bash
# For each item above, create a beads issue:
bd create "test: Add integration tests for common workflows" -t enhancement -p 1

# Assign appropriate labels and priority based on the documentation
```

Or use the batch script (create if needed):
```bash
./scripts/import-todos-to-beads.sh
```
