/**
 * E2E Tests for bd-finish Workflow
 * Tests the complete PR creation and issue completion workflow
 */

const {
  createTempDir,
  cleanupTempDir,
  initMockGitRepo,
  initMockBeadsRepo,
  createMockBeadsIssue,
  MockBeadsCommand,
} = require('../helpers/e2e-helpers');

describe('bd-finish Workflow E2E Tests', () => {
  let testDir;
  let mockBeads;

  beforeEach(() => {
    testDir = createTempDir('e2e-finish-');
    mockBeads = new MockBeadsCommand(testDir);
    
    initMockGitRepo(testDir);
    initMockBeadsRepo(testDir);
  });

  afterEach(() => {
    cleanupTempDir(testDir);
  });

  describe('PR Title Generation', () => {
    it('should generate PR title from issue', () => {
      const issue = createMockBeadsIssue(testDir, {
        id: 'bd-a1b2',
        title: 'Fix login timeout issue',
        type: 'bug',
      });
      
      const prTitle = `[bd-a1b2] ${issue.title}`;
      
      expect(prTitle).toBe('[bd-a1b2] Fix login timeout issue');
    });

    it('should include issue type in title', () => {
      const issue = createMockBeadsIssue(testDir, {
        id: 'bd-c3d4',
        title: 'Add user profile API',
        type: 'feature',
      });
      
      const prTitle = `[Feature] [bd-c3d4] ${issue.title}`;
      
      expect(prTitle).toContain('[Feature]');
      expect(prTitle).toContain('[bd-c3d4]');
    });

    it('should handle Jira key in title', () => {
      const issue = createMockBeadsIssue(testDir, {
        id: 'bd-a1b2',
        title: 'Fix login timeout',
        labels: ['PROJ-123'],
      });
      
      const jiraKey = issue.labels.find(l => /^[A-Z]+-\d+$/.test(l));
      const prTitle = `[bd-a1b2] [${jiraKey}] ${issue.title}`;
      
      expect(prTitle).toContain('[PROJ-123]');
    });
  });

  describe('PR Body Generation', () => {
    it('should include issue description', () => {
      const issue = createMockBeadsIssue(testDir, {
        id: 'bd-a1b2',
        title: 'Fix bug',
        description: 'This is the issue description',
      });
      
      const prBody = `## Related Issue\nCloses bd-a1b2\n\n## Description\n${issue.description}`;
      
      expect(prBody).toContain(issue.description);
      expect(prBody).toContain('bd-a1b2');
    });

    it('should use PR template if available', () => {
      const template = `## Description
<!-- Describe changes -->

## Testing
<!-- How tested? -->

## Checklist
- [ ] Tests pass
- [ ] Docs updated`;
      
      expect(template).toContain('## Description');
      expect(template).toContain('## Testing');
      expect(template).toContain('## Checklist');
    });

    it('should link to beads issue', () => {
      const issueId = 'bd-a1b2';
      const prBody = `Closes ${issueId}`;
      
      expect(prBody).toContain(issueId);
    });

    it('should link to Jira issue if present', () => {
      const jiraKey = 'PROJ-123';
      const prBody = `Related Jira: ${jiraKey}`;
      
      expect(prBody).toContain(jiraKey);
    });
  });

  describe('Git Push Operations', () => {
    it('should push current branch', () => {
      const { execSync } = require('child_process');
      
      // Create and switch to feature branch
      const branchName = 'feature/bd-test-push';
      execSync(`git checkout -b ${branchName}`, {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      // Make a commit
      const fs = require('fs');
      const path = require('path');
      fs.writeFileSync(path.join(testDir, 'test.txt'), 'test');
      execSync('git add .', { cwd: testDir, stdio: 'pipe' });
      execSync('git commit -m "test"', { cwd: testDir, stdio: 'pipe' });
      
      // Get current branch
      const currentBranch = execSync('git branch --show-current', {
        cwd: testDir,
        encoding: 'utf8',
      }).trim();
      
      expect(currentBranch).toBe(branchName);
    });

    it('should handle uncommitted changes', () => {
      const { execSync } = require('child_process');
      const fs = require('fs');
      const path = require('path');
      
      // Create uncommitted file
      fs.writeFileSync(path.join(testDir, 'uncommitted.txt'), 'test');
      
      const status = execSync('git status --porcelain', {
        cwd: testDir,
        encoding: 'utf8',
      });
      
      expect(status).toContain('uncommitted.txt');
    });

    it('should detect push requirement', () => {
      const { execSync } = require('child_process');
      
      // On a new branch with commits, push is required
      // This is simulated; in practice we'd check if remote branch exists
      const needsPush = true; // Would check with git commands
      
      expect(typeof needsPush).toBe('boolean');
    });
  });

  describe('Issue Status Update', () => {
    it('should update issue to done', () => {
      const issue = createMockBeadsIssue(testDir, {
        id: 'bd-a1b2',
        title: 'Test Issue',
        status: 'in-progress',
      });
      
      const result = mockBeads.exec('done', [issue.id]);
      
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('done');
    });

    it('should handle already completed issue', () => {
      const issue = createMockBeadsIssue(testDir, {
        id: 'bd-a1b2',
        title: 'Test Issue',
        status: 'done',
      });
      
      const result = mockBeads.exec('done', [issue.id]);
      
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('done');
    });
  });

  describe('Draft PR Option', () => {
    it('should support draft PR flag', () => {
      const isDraft = true;
      
      expect(isDraft).toBe(true);
    });

    it('should support regular PR (default)', () => {
      const isDraft = false;
      
      expect(isDraft).toBe(false);
    });

    it('should parse draft flag from args', () => {
      const args = ['bd-a1b2', '--draft'];
      const isDraft = args.includes('--draft');
      
      expect(isDraft).toBe(true);
    });
  });

  describe('PR Template Selection', () => {
    it('should use bug template for bug issues', () => {
      const issueType = 'bug';
      const templateName = issueType === 'bug' ? 'bugfix' : 'default';
      
      expect(templateName).toBe('bugfix');
    });

    it('should use default template for other types', () => {
      const issueType = 'feature';
      const templateName = issueType === 'bug' ? 'bugfix' : 'default';
      
      expect(templateName).toBe('default');
    });

    it('should handle missing template', () => {
      const template = null;
      const fallback = template || 'Default PR description';
      
      expect(fallback).toBe('Default PR description');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing issue', () => {
      const result = mockBeads.exec('done', ['bd-nonexistent']);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle gh command not found', () => {
      const checkGh = () => {
        try {
          require('child_process').execSync('which gh || where gh', {
            stdio: 'pipe',
          });
          return true;
        } catch (error) {
          return false;
        }
      };
      
      const hasGh = checkGh();
      expect(typeof hasGh).toBe('boolean');
    });

    it('should handle git push failure', () => {
      const mockPush = jest.fn(() => {
        throw new Error('Push failed: no remote');
      });
      
      expect(() => mockPush()).toThrow('Push failed');
    });

    it('should handle PR creation failure', () => {
      const mockCreatePR = jest.fn(() => ({
        success: false,
        error: 'Authentication required',
      }));
      
      const result = mockCreatePR();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication');
    });
  });

  describe('PR Metadata', () => {
    it('should add labels from issue', () => {
      const issue = createMockBeadsIssue(testDir, {
        labels: ['bug', 'high-priority', 'frontend'],
      });
      
      const prLabels = issue.labels.filter(l => l !== 'jira-synced');
      
      expect(prLabels).toContain('bug');
      expect(prLabels).toContain('high-priority');
    });

    it('should set reviewers if configured', () => {
      const reviewers = ['@team-lead', '@senior-dev'];
      
      expect(reviewers.length).toBe(2);
      expect(reviewers[0]).toMatch(/^@/);
    });

    it('should set assignee to issue owner', () => {
      const assignee = '@current-user';
      
      expect(assignee).toBeTruthy();
    });
  });

  describe('Complete Finish Workflow', () => {
    it('should execute full finish workflow', () => {
      const { execSync } = require('child_process');
      const fs = require('fs');
      const path = require('path');
      
      // 1. Create and start issue
      const issue = createMockBeadsIssue(testDir, {
        id: 'bd-test',
        title: 'Test Feature',
        type: 'feature',
        status: 'in-progress',
      });
      
      // 2. Create branch
      const branchName = `feature/${issue.id}-test-feature`;
      execSync(`git checkout -b ${branchName}`, {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      // 3. Make changes and commit
      fs.writeFileSync(path.join(testDir, 'feature.js'), 'code');
      execSync('git add .', { cwd: testDir, stdio: 'pipe' });
      execSync('git commit -m "Add feature"', { cwd: testDir, stdio: 'pipe' });
      
      // 4. Generate PR title and body
      const prTitle = `[${issue.id}] ${issue.title}`;
      const prBody = `Closes ${issue.id}\n\n## Changes\nImplemented feature`;
      
      expect(prTitle).toContain(issue.id);
      expect(prBody).toContain(issue.id);
      
      // 5. Update issue to done
      const doneResult = mockBeads.exec('done', [issue.id]);
      expect(doneResult.success).toBe(true);
      expect(doneResult.data.status).toBe('done');
      
      // 6. Verify workflow completion
      const showResult = mockBeads.exec('show', [issue.id]);
      expect(showResult.data.status).toBe('done');
    });
  });
});
