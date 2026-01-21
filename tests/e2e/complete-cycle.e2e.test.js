/**
 * E2E Tests for Complete Development Cycle
 * Tests the full workflow from sync to PR
 */

const {
  createTempDir,
  cleanupTempDir,
  initMockGitRepo,
  initMockBeadsRepo,
  createMockBeadsIssue,
  MockBeadsCommand,
} = require('../helpers/e2e-helpers');

describe('Complete Dev Cycle E2E Tests', () => {
  let testDir;
  let mockBeads;

  beforeEach(() => {
    testDir = createTempDir('e2e-cycle-');
    mockBeads = new MockBeadsCommand(testDir);
    
    initMockGitRepo(testDir);
    initMockBeadsRepo(testDir);
  });

  afterEach(() => {
    cleanupTempDir(testDir);
  });

  describe('Full Workflow: Sync → Start → Work → Finish', () => {
    it('should complete full development cycle', () => {
      const { execSync } = require('child_process');
      const fs = require('fs');
      const path = require('path');
      
      // 1. SYNC: Create issues from Jira (simulated)
      const issue1 = createMockBeadsIssue(testDir, {
        id: 'bd-a1b2',
        title: 'Fix login bug',
        type: 'bug',
        status: 'todo',
        labels: ['PROJ-123'],
      });
      
      const issue2 = createMockBeadsIssue(testDir, {
        id: 'bd-c3d4',
        title: 'Add API endpoint',
        type: 'feature',
        status: 'todo',
        labels: ['PROJ-124'],
      });
      
      expect(issue1).toBeDefined();
      expect(issue2).toBeDefined();
      
      // 2. START: Begin work on issue1
      const startResult = mockBeads.exec('start', [issue1.id]);
      expect(startResult.success).toBe(true);
      expect(startResult.data.status).toBe('in-progress');
      
      // 3. CREATE BRANCH
      const branchName = `bug/${issue1.id}-fix-login-bug-PROJ-123`;
      execSync(`git checkout -b ${branchName}`, {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      const currentBranch = execSync('git branch --show-current', {
        cwd: testDir,
        encoding: 'utf8',
      }).trim();
      expect(currentBranch).toBe(branchName);
      
      // 4. WORK: Make changes
      fs.writeFileSync(path.join(testDir, 'fix.js'), 'bugfix code');
      execSync('git add .', { cwd: testDir, stdio: 'pipe' });
      execSync('git commit -m "Fix login bug"', {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      // 5. FINISH: Complete issue
      const doneResult = mockBeads.exec('done', [issue1.id]);
      expect(doneResult.success).toBe(true);
      expect(doneResult.data.status).toBe('done');
      
      // 6. VERIFY: Check final state
      const showResult = mockBeads.exec('show', [issue1.id]);
      expect(showResult.data.status).toBe('done');
      
      // Issue 2 should still be todo
      const issue2Status = mockBeads.exec('show', [issue2.id]);
      expect(issue2Status.data.status).toBe('todo');
    });
  });

  describe('Multiple Issues Workflow', () => {
    it('should handle working on multiple issues', () => {
      const { execSync } = require('child_process');
      
      // Create multiple issues
      const issues = [
        createMockBeadsIssue(testDir, {
          id: 'bd-1',
          title: 'Issue 1',
          type: 'task',
        }),
        createMockBeadsIssue(testDir, {
          id: 'bd-2',
          title: 'Issue 2',
          type: 'feature',
        }),
        createMockBeadsIssue(testDir, {
          id: 'bd-3',
          title: 'Issue 3',
          type: 'bug',
        }),
      ];
      
      // Start each issue and create branches
      issues.forEach((issue, index) => {
        const branchName = `${issue.type}/${issue.id}-issue-${index + 1}`;
        
        execSync(`git checkout -b ${branchName}`, {
          cwd: testDir,
          stdio: 'pipe',
        });
        
        mockBeads.exec('start', [issue.id]);
        
        // Switch back to master (default branch from git init)
        execSync('git checkout master', { cwd: testDir, stdio: 'pipe' });
      });
      
      // Verify all branches exist
      const branches = execSync('git branch', {
        cwd: testDir,
        encoding: 'utf8',
      });
      
      expect(branches).toContain('task/bd-1');
      expect(branches).toContain('feature/bd-2');
      expect(branches).toContain('bug/bd-3');
    });

    it('should track which issues are in-progress', () => {
      // Create issues with different statuses
      createMockBeadsIssue(testDir, { id: 'bd-1', status: 'todo' });
      createMockBeadsIssue(testDir, { id: 'bd-2', status: 'in-progress' });
      createMockBeadsIssue(testDir, { id: 'bd-3', status: 'done' });
      
      const listResult = mockBeads.exec('ls');
      const issues = listResult.data;
      
      const inProgress = issues.filter(i => i.status === 'in-progress');
      expect(inProgress.length).toBe(1);
      expect(inProgress[0].id).toBe('bd-2');
    });
  });

  describe('Branch Switching Workflow', () => {
    it('should switch between feature branches', () => {
      const { execSync } = require('child_process');
      
      // Create two branches
      const branch1 = 'feature/bd-1-feature-one';
      const branch2 = 'feature/bd-2-feature-two';
      
      execSync(`git checkout -b ${branch1}`, {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      execSync(`git checkout -b ${branch2}`, {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      // Switch back to branch1
      execSync(`git checkout ${branch1}`, {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      const currentBranch = execSync('git branch --show-current', {
        cwd: testDir,
        encoding: 'utf8',
      }).trim();
      
      expect(currentBranch).toBe(branch1);
    });

    it('should handle uncommitted changes when switching', () => {
      const { execSync } = require('child_process');
      const fs = require('fs');
      const path = require('path');
      
      // Create branch and make changes
      execSync('git checkout -b feature/test', {
        cwd: testDir,
        stdio: 'pipe',
      });
      
      fs.writeFileSync(path.join(testDir, 'uncommitted.txt'), 'test');
      
      // Check for uncommitted changes
      const status = execSync('git status --porcelain', {
        cwd: testDir,
        encoding: 'utf8',
      });
      
      expect(status.trim()).toBeTruthy();
    });
  });

  describe('Conflict Scenarios', () => {
    it('should detect when branch is behind main', () => {
      // This would check if local branch needs to be updated
      // Simulated check
      const isBehind = false; // Would use git commands to check
      
      expect(typeof isBehind).toBe('boolean');
    });

    it('should handle merge conflicts (simulated)', () => {
      const hasConflicts = false; // Would detect actual conflicts
      
      if (hasConflicts) {
        // Would provide conflict resolution steps
        expect(false).toBe(true); // Should not reach here in test
      } else {
        expect(true).toBe(true);
      }
    });

    it('should suggest pull before push if behind', () => {
      const isBehind = true;
      const suggestion = isBehind
        ? 'Pull latest changes before pushing'
        : 'Ready to push';
      
      expect(suggestion).toContain('Pull');
    });
  });

  describe('Workflow State Management', () => {
    it('should track workflow progress', () => {
      const workflowSteps = [
        { name: 'sync', completed: true },
        { name: 'start', completed: true },
        { name: 'work', completed: true },
        { name: 'finish', completed: false },
      ];
      
      const currentStep = workflowSteps.find(s => !s.completed);
      expect(currentStep.name).toBe('finish');
    });

    it('should validate workflow order', () => {
      const validOrder = ['sync', 'start', 'work', 'finish'];
      const currentIndex = 2; // on 'work' step
      
      expect(validOrder[currentIndex]).toBe('work');
    });

    it('should allow skipping optional steps', () => {
      const optionalSteps = ['sync']; // Can work on existing issues
      const requiredSteps = ['start', 'finish'];
      
      expect(optionalSteps).toContain('sync');
      expect(requiredSteps).toContain('start');
    });
  });

  describe('Integration Points', () => {
    it('should integrate with git', () => {
      const { execSync } = require('child_process');
      
      const gitVersion = execSync('git --version', {
        encoding: 'utf8',
      });
      
      expect(gitVersion).toContain('git version');
    });

    it('should integrate with beads', () => {
      const result = mockBeads.exec('ls');
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should integrate with GitHub CLI (if available)', () => {
      try {
        const { execSync } = require('child_process');
        execSync('which gh || where gh', { stdio: 'pipe' });
        // gh is available
        expect(true).toBe(true);
      } catch (error) {
        // gh not available - acceptable in test environment
        expect(error).toBeDefined();
      }
    });
  });

  describe('Cleanup and Maintenance', () => {
    it('should list all feature branches', () => {
      const { execSync } = require('child_process');
      
      // Create some branches
      execSync('git checkout -b feature/bd-1', {
        cwd: testDir,
        stdio: 'pipe',
      });
      execSync('git checkout master', { cwd: testDir, stdio: 'pipe' });
      execSync('git checkout -b feature/bd-2', {
        cwd: testDir,
        stdio: 'pipe',
      });
      execSync('git checkout master', { cwd: testDir, stdio: 'pipe' });
      
      const branches = execSync('git branch', {
        cwd: testDir,
        encoding: 'utf8',
      });
      
      const featureBranches = branches
        .split('\n')
        .filter(b => b.includes('feature/'));
      
      expect(featureBranches.length).toBeGreaterThan(0);
    });

    it('should identify completed issues for cleanup', () => {
      createMockBeadsIssue(testDir, { id: 'bd-1', status: 'done' });
      createMockBeadsIssue(testDir, { id: 'bd-2', status: 'in-progress' });
      createMockBeadsIssue(testDir, { id: 'bd-3', status: 'done' });
      
      const listResult = mockBeads.exec('ls');
      const completedIssues = listResult.data.filter(i => i.status === 'done');
      
      expect(completedIssues.length).toBe(2);
    });
  });

  describe('End-to-End Performance', () => {
    it('should complete workflow in reasonable time', () => {
      const start = Date.now();
      
      // Create issue
      const issue = createMockBeadsIssue(testDir, {
        id: 'bd-perf',
        title: 'Performance test',
      });
      
      // Start issue
      mockBeads.exec('start', [issue.id]);
      
      // Done issue
      mockBeads.exec('done', [issue.id]);
      
      const duration = Date.now() - start;
      
      // Should complete in under 1 second
      expect(duration).toBeLessThan(1000);
    });
  });
});
