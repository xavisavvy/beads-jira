/**
 * Test Fixtures
 * Sample data for testing
 */

const mockJiraIssues = [
  {
    key: 'PROJ-123',
    fields: {
      summary: 'Fix login timeout issue',
      description: 'Users experiencing timeout after 5 minutes of inactivity',
      issuetype: { name: 'Bug' },
      priority: { name: 'High' },
      status: { name: 'In Progress' },
      assignee: { displayName: 'John Doe' },
      components: [{ name: 'frontend' }],
      created: '2026-01-20T10:00:00.000Z',
      updated: '2026-01-21T15:30:00.000Z',
    },
  },
  {
    key: 'PROJ-124',
    fields: {
      summary: 'Add user profile API endpoint',
      description: 'Need REST API for user profile management',
      issuetype: { name: 'Story' },
      priority: { name: 'Medium' },
      status: { name: 'To Do' },
      assignee: { displayName: 'Jane Smith' },
      components: [{ name: 'backend' }],
      created: '2026-01-20T11:00:00.000Z',
      updated: '2026-01-21T12:00:00.000Z',
    },
  },
  {
    key: 'PROJ-125',
    fields: {
      summary: 'Update documentation for API v2',
      description: 'Document new endpoints and breaking changes',
      issuetype: { name: 'Task' },
      priority: { name: 'Low' },
      status: { name: 'To Do' },
      assignee: null,
      components: [{ name: 'docs' }],
      created: '2026-01-21T09:00:00.000Z',
      updated: '2026-01-21T09:00:00.000Z',
    },
  },
];

const mockBeadsIssues = [
  {
    id: 'bd-a1b2',
    title: 'Fix login timeout issue',
    type: 'bug',
    priority: 1,
    status: 'in-progress',
    labels: ['jira-synced', 'PROJ-123', 'component-frontend'],
    description: '**Jira Issue:** PROJ-123\n\nUsers experiencing timeout after 5 minutes of inactivity',
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-01-21T15:30:00.000Z',
  },
  {
    id: 'bd-c3d4',
    title: 'Add user profile API endpoint',
    type: 'feature',
    priority: 2,
    status: 'todo',
    labels: ['jira-synced', 'PROJ-124', 'component-backend'],
    description: '**Jira Issue:** PROJ-124\n\nNeed REST API for user profile management',
    createdAt: '2026-01-20T11:00:00.000Z',
    updatedAt: '2026-01-21T12:00:00.000Z',
  },
];

const mockConfig = {
  jiraProjectKey: 'PROJ',
  jiraComponent: 'frontend',
  mcpUrl: 'https://mcp.atlassian.com/v1/mcp',
  autoSync: true,
};

const mockGitConfig = {
  userName: 'Test User',
  userEmail: 'test@example.com',
  defaultBranch: 'main',
  remoteName: 'origin',
};

const mockOnboardingAnswers = {
  name: 'John Doe',
  email: 'john@example.com',
  jiraProjectKey: 'PROJ',
  jiraComponent: 'api',
  installGitHook: true,
  runExampleSync: true,
};

const mockBranchNames = [
  {
    issueId: 'bd-a1b2',
    title: 'Fix login timeout',
    type: 'bug',
    jiraKey: 'PROJ-123',
    expected: 'bug/bd-a1b2-fix-login-timeout-PROJ-123',
  },
  {
    issueId: 'bd-c3d4',
    title: 'Add user profile API',
    type: 'feature',
    jiraKey: 'PROJ-124',
    expected: 'feature/bd-c3d4-add-user-profile-api-PROJ-124',
  },
  {
    issueId: 'bd-e5f6',
    title: 'Update documentation',
    type: 'task',
    jiraKey: null,
    expected: 'task/bd-e5f6-update-documentation',
  },
];

const mockPrTemplates = {
  default: `## Description
<!-- Describe your changes -->

## Related Issues
<!-- Link to beads issues -->

## Testing
<!-- How was this tested? -->

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Code reviewed
`,
  bugfix: `## Bug Fix
<!-- What was the bug? -->

## Root Cause
<!-- What caused it? -->

## Fix
<!-- How did you fix it? -->

## Testing
<!-- How did you verify the fix? -->
`,
};

const mockEnvironments = {
  development: {
    NODE_ENV: 'development',
    JIRA_PROJECT_KEY: 'PROJ',
    MCP_URL: 'https://mcp.atlassian.com/v1/mcp',
  },
  ci: {
    NODE_ENV: 'test',
    CI: 'true',
    JIRA_PROJECT_KEY: 'PROJ',
    MCP_URL: 'https://mcp.atlassian.com/v1/mcp',
  },
  production: {
    NODE_ENV: 'production',
    JIRA_PROJECT_KEY: 'PROJ',
    MCP_URL: 'https://mcp.atlassian.com/v1/mcp',
  },
};

const mockErrors = {
  beadsNotFound: {
    code: 'ENOENT',
    message: 'beads command not found',
    suggestion: 'Install beads from https://github.com/steveyegge/beads',
  },
  notGitRepo: {
    code: 'NOT_GIT_REPO',
    message: 'Not a git repository',
    suggestion: 'Run git init to initialize a git repository',
  },
  notBeadsRepo: {
    code: 'NOT_BEADS_REPO',
    message: 'Not a beads repository',
    suggestion: 'Run bd init to initialize beads',
  },
  jiraAuthFailed: {
    code: 'AUTH_FAILED',
    message: 'Jira authentication failed',
    suggestion: 'Check your Jira credentials and MCP configuration',
  },
  networkError: {
    code: 'NETWORK_ERROR',
    message: 'Network request failed',
    suggestion: 'Check your internet connection',
  },
};

module.exports = {
  mockJiraIssues,
  mockBeadsIssues,
  mockConfig,
  mockGitConfig,
  mockOnboardingAnswers,
  mockBranchNames,
  mockPrTemplates,
  mockEnvironments,
  mockErrors,
};
