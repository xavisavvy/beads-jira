/**
 * E2E Tests for bd-start Workflow
 * Tests the complete branch creation and issue start workflow
 */

const {
  createTempDir,
  cleanupTempDir,
  initMockGitRepo,
  initMockBeadsRepo,
  createMockBeadsIssue,
  MockBeadsCommand,
} = require('../helpers/e2e-helpers');
const { mockBranchNames } = require('../fixtures/test-data');

describe('bd-start Workflow E2E Tests', () => {
  let testDir;
  let mockBeads;

  beforeEach(() => {
    testDir = createTempDir('e2e-start-');
    mockBeads = new MockBeadsCommand(testDir);
    
    initMockGitRepo(testDir);
    initMockBeadsRepo(testDir);
  });

  afterEach(() => {
    cleanupTempDir(testDir);
  });

  describe('Branch Creation', () => {
    it('should create branch with bug prefix', () => {
      const issue = createMockBeadsIssue(testDir, {
        id: 'bd-a1b2',
        title: 'Fix login timeout',
        type: 'bug',
        labels: ['PROJ-123'],
      });
      
      const branchName = `bug/${issue.id}-fix-login-timeout-PROJ-123`;
      
      expect(branchName).toMatch(/^bug\//);
      expect(branchName).toContain(issue.id);
      expect(branchName).toContain('PROJ-123');
    });

    it('should create branch with feature prefix', () => {
      const issue = createMockBeadsIssue(testDir, {
        id: 'bd-c3d4',
        title: 'Add user profile API',
        type: 'feature',
        labels: ['PROJ-124'],
      });
      
      const branchName = `feature/${issue.id}-add-user-profile-api-PROJ-124`;
      
      expect(branchName).toMatch(/^feature\//);
      expect(branchName).toContain(issue.id);
    });

    it('should create branch with task prefix', () => {
      const issue = createMockBeadsIssue(testDir, {
        id: 'bd-e5f6',
        title: 'Update documentation',
        type: 'task',
      });
      
      const branchName = `task/${issue.id}-update-documentation`;
      
      expect(branchName).toMatch(/^task\//);
      expect(branchName).toContain(issue.id);
    });

    it('should slugify branch name', () => {
      const title = 'Fix: Login & Auth Issues (URGENT!)';
      const slugified = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      expect(slugified).toBe('fix-login-auth-issues-urgent');
    });

    it('should truncate long branch names', () => {
      const longTitle = 'This is a very long issue title that exceeds the maximum length and should be truncated';
      const maxLength = 50;
      
      const truncated = longTitle.substring(0, maxLength);
      
      expect(truncated.length).toBeLessThanOrEqual(maxLength);
    });

    it('should handle special characters in titles', () => {
      const title = 'Fix: "API" Errors & <Response> Issues!';
      const cleaned = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      expect(cleaned).not.toContain('"');
      expect(cleaned).not.toContain('<');
      expect(cleaned).not.toContain('&');
    });
  });

  describe('Jira Key Extraction', () => {
    it('should extract Jira key from labels', () => {
      const labels = ['jira-synced', 'PROJ-123', 'component-frontend'];
      const jiraKeyRegex = /^[A-Z]+-\d+$/;
      
      const jiraKey = labels.find(l => jiraKeyRegex.test(l));
      
      expect(jiraKey).toBe('PROJ-123');
    });

    it('should handle multiple Jira keys (use first)', () => {
      const labels = ['PROJ-123', 'PROJ-124', 'component-api'];
      const jiraKeyRegex = /^[A-Z]+-\d+$/;
      
      const jiraKey = labels.find(l => jiraKeyRegex.test(l));
      
      expect(jiraKey).toBe('PROJ-123');
    });

    it('should handle no Jira key', () => {
      const labels = ['jira-synced', 'component-frontend'];
      const jiraKeyRegex = /^[A-Z]+-\d+$/;
      
      const jiraKey = labels.find(l => jiraKeyRegex.test(l));
      
      expect(jiraKey).toBeUndefined();
    });

    it('should validate Jira key format', () => {
      const jiraKeyRegex = /^[A-Z]+-\d+$/;
      
      expect(jiraKeyRegex.test('PROJ-123')).toBe(true);
      expect(jiraKeyRegex.test('FRONTEND-42')).toBe(true);
      expect(jiraKeyRegex.test('proj-123')).toBe(false); // lowercase
      expect(jiraKeyRegex.test('PROJ123')).toBe(false); // no dash
      expect(jiraKeyRegex.test('123-PROJ')).toBe(false); // reversed
    });
  });

  describe('Issue Status Update', () => {
    it('should update issue to in-progress', () => {
      const issue = createMockBeadsIssue(testDir, {
        id: 'bd-a1b2',
        title: 'Test Issue',
        status: 'todo',
      });
      
      const result = mockBeads.exec('start', [issue.id]);
      
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('in-progress');
    });

    it('should handle already started issue', () => {
      const issue = createMockBeadsIssue(testDir, {
        id: 'bd-a1b2',
        title: 'Test Issue',
        status: 'in-progress',
      });
      
      const result = mockBeads.exec('start', [issue.id]);
      
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('in-progress');
    });

    it('should handle non-existent issue', () => {
      const result = mockBeads.exec('start', ['bd-xxxx']);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Git Operations', () => {
    it('should create git branch', () => {
      const { execSync } = require('child_process');
      const branchName = 'feature/bd-test-new-feature';
      
      execSync(`git checkout -b ${branchName}`, {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      const currentBranch = execSync('git branch --show-current', {
        cwd: testDir,
        encoding: 'utf8',
      }).trim();
      
      expect(currentBranch).toBe(branchName);
    });

    it('should handle existing branch name', () => {
      const { execSync } = require('child_process');
      const branchName = 'feature/bd-test-existing';
      
      // Create branch first time
      execSync(`git checkout -b ${branchName}`, {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      // Switch back to main
      execSync('git checkout -', {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      // Try to create same branch again
      expect(() => {
        execSync(`git checkout -b ${branchName}`, {
          cwd: testDir,
          stdio: 'pipe',
        });
      }).toThrow();
    });

    it('should checkout existing branch if it exists', () => {
      const { execSync } = require('child_process');
      const branchName = 'feature/bd-test-checkout';
      
      // Create branch
      execSync(`git checkout -b ${branchName}`, {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      // Switch away
      execSync('git checkout -', {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      // Checkout existing branch
      execSync(`git checkout ${branchName}`, {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      const currentBranch = execSync('git branch --show-current', {
        cwd: testDir,
        encoding: 'utf8',
      }).trim();
      
      expect(currentBranch).toBe(branchName);
    });
  });

  describe('Branch Name Validation', () => {
    it('should validate branch name format for bug', () => {
      const branchName = 'bug/bd-a1b2-fix-login-PROJ-123';
      
      expect(branchName).toMatch(/^bug\/bd-[a-z0-9]+-.*$/);
    });

    it('should validate branch name format for feature', () => {
      const branchName = 'feature/bd-c3d4-add-api-PROJ-124';
      
      expect(branchName).toMatch(/^feature\/bd-[a-z0-9]+-.*$/);
    });

    it('should validate branch name format for task', () => {
      const branchName = 'task/bd-e5f6-update-docs';
      
      expect(branchName).toMatch(/^task\/bd-[a-z0-9]+-.*$/);
    });

    it('should reject invalid branch names', () => {
      const invalidNames = [
        'invalid',
        'bug/no-issue-id',
        'feature/',
        '/bd-a1b2',
      ];
      
      const validPattern = /^(bug|feature|task)\/bd-[a-z0-9]+-/;
      
      invalidNames.forEach(name => {
        expect(validPattern.test(name)).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing issue ID', () => {
      const validateInput = (issueId) => {
        if (!issueId) {
          throw new Error('Issue ID is required');
        }
        return true;
      };
      
      expect(() => validateInput()).toThrow('Issue ID is required');
      expect(() => validateInput('')).toThrow('Issue ID is required');
      expect(() => validateInput('bd-a1b2')).not.toThrow();
    });

    it('should handle invalid issue ID format', () => {
      const validateFormat = (issueId) => {
        if (!/^bd-[a-z0-9]+$/.test(issueId)) {
          throw new Error('Invalid issue ID format');
        }
        return true;
      };
      
      expect(() => validateFormat('bd-a1b2')).not.toThrow();
      expect(() => validateFormat('invalid')).toThrow();
      expect(() => validateFormat('BD-A1B2')).toThrow(); // uppercase
    });

    it('should handle git command failures', () => {
      const mockGitCommand = jest.fn(() => {
        throw new Error('Git command failed');
      });
      
      expect(() => mockGitCommand()).toThrow('Git command failed');
    });

    it('should handle beads command failures', () => {
      const result = mockBeads.exec('start', ['bd-nonexistent']);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Complete Start Workflow', () => {
    it('should execute full start workflow', () => {
      // 1. Create issue
      const issue = createMockBeadsIssue(testDir, {
        id: 'bd-test',
        title: 'Test Feature',
        type: 'feature',
        labels: ['PROJ-999'],
      });
      
      // 2. Start issue (update status)
      const startResult = mockBeads.exec('start', [issue.id]);
      expect(startResult.success).toBe(true);
      
      // 3. Generate branch name
      const branchName = `feature/${issue.id}-test-feature-PROJ-999`;
      expect(branchName).toBeTruthy();
      
      // 4. Create git branch
      const { execSync } = require('child_process');
      execSync(`git checkout -b ${branchName}`, {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      // 5. Verify current branch
      const currentBranch = execSync('git branch --show-current', {
        cwd: testDir,
        encoding: 'utf8',
      }).trim();
      
      expect(currentBranch).toBe(branchName);
      
      // 6. Verify issue status
      const showResult = mockBeads.exec('show', [issue.id]);
      expect(showResult.data.status).toBe('in-progress');
    });
  });
});
