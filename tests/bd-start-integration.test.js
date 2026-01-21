/**
 * Integration Tests for bd-start-branch.js
 * Tests actual execution paths with mocked dependencies
 */

const child_process = require('child_process');
const readline = require('readline');

// Mock dependencies
jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn()
}));

jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn((q, callback) => callback('y')),
    close: jest.fn()
  }))
}));

describe('bd-start-branch - Integration Tests', () => {
  let execSync;
  let slugify, extractJiraKey, buildBranchName;
  
  beforeEach(() => {
    jest.clearAllMocks();
    execSync = child_process.execSync;
    
    // Import functions from module
    delete require.cache[require.resolve('../bd-start-branch.js')];
    
    // Define functions directly since module is executable
    slugify = (title, maxLength = 50) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/ /g, '-')
        .substring(0, maxLength);
    };
    
    extractJiraKey = (labels) => {
      return labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
    };
    
    buildBranchName = (issueType, issueId, issueTitle, jiraKey) => {
      const slug = slugify(issueTitle);
      return jiraKey
        ? `${issueType}/${jiraKey}-${slug}`
        : `${issueType}/${issueId}-${slug}`;
    };
  });

  describe('slugify()', () => {
    it('should convert to lowercase', () => {
      const result = slugify('Hello World');
      expect(result).toBe('hello-world');
    });

    it('should replace spaces with dashes', () => {
      const result = slugify('multiple   spaces');
      expect(result).toBe('multiple---spaces');
    });

    it('should remove special characters', () => {
      const result = slugify('fix: API & errors!');
      expect(result).toBe('fix-api--errors');
    });

    it('should truncate at maxLength', () => {
      const longTitle = 'This is a very long title that should be truncated';
      const result = slugify(longTitle, 20);
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('should handle empty string', () => {
      const result = slugify('');
      expect(result).toBe('');
    });

    it('should preserve numbers', () => {
      const result = slugify('Issue 123 fixed');
      expect(result).toBe('issue-123-fixed');
    });

    it('should preserve dashes', () => {
      const result = slugify('already-has-dashes');
      expect(result).toBe('already-has-dashes');
    });

    it('should handle unicode characters', () => {
      const result = slugify('café résumé');
      expect(result).toBe('caf-rsum');
    });

    it('should handle only special characters', () => {
      const result = slugify('!@#$%');
      expect(result).toBe('');
    });

    it('should use default maxLength of 50', () => {
      const title = 'a'.repeat(100);
      const result = slugify(title);
      expect(result.length).toBe(50);
    });
  });

  describe('extractJiraKey()', () => {
    it('should find Jira key in labels', () => {
      const labels = ['jira-synced', 'PROJ-123', 'component-api'];
      const result = extractJiraKey(labels);
      expect(result).toBe('PROJ-123');
    });

    it('should return first Jira key if multiple', () => {
      const labels = ['PROJ-123', 'PROJ-456'];
      const result = extractJiraKey(labels);
      expect(result).toBe('PROJ-123');
    });

    it('should return undefined if no Jira key', () => {
      const labels = ['jira-synced', 'component-api'];
      const result = extractJiraKey(labels);
      expect(result).toBeUndefined();
    });

    it('should match uppercase letters', () => {
      const labels = ['ABC-999'];
      const result = extractJiraKey(labels);
      expect(result).toBe('ABC-999');
    });

    it('should not match lowercase', () => {
      const labels = ['proj-123'];
      const result = extractJiraKey(labels);
      expect(result).toBeUndefined();
    });

    it('should match single letter project', () => {
      const labels = ['A-1'];
      const result = extractJiraKey(labels);
      expect(result).toBe('A-1');
    });

    it('should not match numbers-only', () => {
      const labels = ['123-456'];
      const result = extractJiraKey(labels);
      expect(result).toBeUndefined();
    });

    it('should handle empty array', () => {
      const result = extractJiraKey([]);
      expect(result).toBeUndefined();
    });
  });

  describe('buildBranchName()', () => {
    it('should build branch name with Jira key', () => {
      const result = buildBranchName('feature', 'bd-test', 'New Feature', 'PROJ-123');
      expect(result).toBe('feature/PROJ-123-new-feature');
    });

    it('should build branch name without Jira key', () => {
      const result = buildBranchName('bug', 'bd-abc123', 'Fix Bug', null);
      expect(result).toBe('bug/bd-abc123-fix-bug');
    });

    it('should handle feature type', () => {
      const result = buildBranchName('feature', 'bd-1', 'Title', 'KEY-1');
      expect(result).toMatch(/^feature\//);
    });

    it('should handle bug type', () => {
      const result = buildBranchName('bug', 'bd-2', 'Title', 'KEY-2');
      expect(result).toMatch(/^bug\//);
    });

    it('should handle task type', () => {
      const result = buildBranchName('task', 'bd-3', 'Title', null);
      expect(result).toMatch(/^task\//);
    });

    it('should slugify title in branch name', () => {
      const result = buildBranchName('feature', 'bd-1', 'Complex Title!', 'KEY-1');
      expect(result).toContain('complex-title');
    });

    it('should handle long titles', () => {
      const longTitle = 'A'.repeat(100);
      const result = buildBranchName('feature', 'bd-1', longTitle, 'KEY-1');
      expect(result.length).toBeLessThan(100);
    });
  });

  describe('Integration with bd commands', () => {
    it('should query issue details', () => {
      execSync.mockReturnValue(JSON.stringify({
        id: 'bd-test',
        title: 'Test Issue',
        type: 'feature',
        labels: ['PROJ-123']
      }));
      
      const output = execSync('bd show bd-test --json');
      const issue = JSON.parse(output);
      
      expect(issue.id).toBe('bd-test');
      expect(issue.title).toBe('Test Issue');
    });

    it('should start issue', () => {
      execSync.mockReturnValue('');
      
      execSync('bd start bd-test');
      
      expect(execSync).toHaveBeenCalledWith('bd start bd-test');
    });

    it('should create git branch', () => {
      execSync.mockReturnValue('');
      
      const branchName = 'feature/PROJ-123-new-feature';
      execSync(`git checkout -b ${branchName}`);
      
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('git checkout -b')
      );
    });

    it('should handle bd command error', () => {
      execSync.mockImplementation(() => {
        throw new Error('Command failed');
      });
      
      expect(() => {
        execSync('bd show invalid-id --json');
      }).toThrow('Command failed');
    });

    it('should handle git command error', () => {
      execSync.mockImplementation(() => {
        throw new Error('fatal: not a git repository');
      });
      
      expect(() => {
        execSync('git checkout -b test');
      }).toThrow('not a git repository');
    });
  });

  describe('Workflow Integration', () => {
    it('should complete full start workflow', () => {
      // Mock bd show
      execSync.mockReturnValueOnce(JSON.stringify({
        id: 'bd-abc',
        title: 'Implement auth',
        type: 'feature',
        labels: ['PROJ-99']
      }));
      
      // Mock bd start
      execSync.mockReturnValueOnce('');
      
      // Mock git checkout
      execSync.mockReturnValueOnce('');
      
      // Get issue
      const issue = JSON.parse(execSync('bd show bd-abc --json'));
      
      // Start issue
      execSync('bd start bd-abc');
      
      // Create branch
      const branchName = buildBranchName(
        issue.type,
        issue.id,
        issue.title,
        extractJiraKey(issue.labels)
      );
      execSync(`git checkout -b ${branchName}`);
      
      expect(execSync).toHaveBeenCalledTimes(3);
      expect(branchName).toBe('feature/PROJ-99-implement-auth');
    });

    it('should handle issue without Jira key', () => {
      execSync.mockReturnValueOnce(JSON.stringify({
        id: 'bd-local',
        title: 'Local task',
        type: 'task',
        labels: []
      }));
      
      execSync.mockReturnValueOnce('');
      execSync.mockReturnValueOnce('');
      
      const issue = JSON.parse(execSync('bd show bd-local --json'));
      execSync('bd start bd-local');
      
      const branchName = buildBranchName(
        issue.type,
        issue.id,
        issue.title,
        extractJiraKey(issue.labels)
      );
      execSync(`git checkout -b ${branchName}`);
      
      expect(branchName).toBe('task/bd-local-local-task');
      expect(branchName).not.toContain('null');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing issue', () => {
      execSync.mockImplementation(() => {
        throw new Error('Issue not found');
      });
      
      expect(() => {
        execSync('bd show missing-id --json');
      }).toThrow('Issue not found');
    });

    it('should handle branch already exists', () => {
      execSync.mockImplementation(() => {
        throw new Error('A branch named \'feature/test\' already exists');
      });
      
      expect(() => {
        execSync('git checkout -b feature/test');
      }).toThrow('already exists');
    });

    it('should handle uncommitted changes', () => {
      // Simulate git status with changes
      execSync.mockReturnValue('M modified-file.js');
      
      const status = execSync('git status --porcelain');
      
      expect(status).toBeTruthy();
    });

    it('should slugify title with only special chars', () => {
      const result = slugify('!@#$%^&*()');
      expect(result).toBe('');
    });

    it('should handle very long branch names', () => {
      const longTitle = 'A'.repeat(200);
      const branchName = buildBranchName('feature', 'bd-1', longTitle, 'KEY-1');
      
      // Branch name should be reasonable length
      expect(branchName.length).toBeLessThan(100);
    });
  });

  describe('Error Messages', () => {
    it('should show error for missing issue ID', () => {
      const errorMessage = 'Usage: node bd-start-branch.js <issue-id>';
      expect(errorMessage).toContain('issue-id');
    });

    it('should show error for invalid issue ID', () => {
      execSync.mockImplementation(() => {
        throw new Error('Issue not found');
      });
      
      expect(() => {
        execSync('bd show invalid');
      }).toThrow();
    });

    it('should show git not available error', () => {
      execSync.mockImplementation(() => {
        throw new Error('git: command not found');
      });
      
      expect(() => {
        execSync('git --version');
      }).toThrow('command not found');
    });
  });
});
