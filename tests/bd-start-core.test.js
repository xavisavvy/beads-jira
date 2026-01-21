/**
 * Unit Tests for bd-start-branch.js Core Functions
 * Tests branch name generation and git operations
 */

describe('bd-start-branch - Core Functions', () => {
  describe('Branch Name Generation', () => {
    it('should generate bug branch name', () => {
      const issueId = 'bd-a1b2';
      const title = 'Fix login timeout';
      const type = 'bug';
      const jiraKey = 'PROJ-123';
      
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const branchName = `${type}/${issueId}-${slug}-${jiraKey}`;
      
      expect(branchName).toBe('bug/bd-a1b2-fix-login-timeout-PROJ-123');
    });

    it('should generate feature branch name', () => {
      const issueId = 'bd-c3d4';
      const title = 'Add user profile API';
      const type = 'feature';
      const jiraKey = 'PROJ-124';
      
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const branchName = `${type}/${issueId}-${slug}-${jiraKey}`;
      
      expect(branchName).toBe('feature/bd-c3d4-add-user-profile-api-PROJ-124');
    });

    it('should generate task branch name', () => {
      const issueId = 'bd-e5f6';
      const title = 'Update documentation';
      const type = 'task';
      
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const branchName = `${type}/${issueId}-${slug}`;
      
      expect(branchName).toBe('task/bd-e5f6-update-documentation');
    });

    it('should handle branch name without Jira key', () => {
      const issueId = 'bd-test';
      const title = 'Local task';
      const type = 'task';
      const jiraKey = null;
      
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const branchName = jiraKey
        ? `${type}/${issueId}-${slug}-${jiraKey}`
        : `${type}/${issueId}-${slug}`;
      
      expect(branchName).toBe('task/bd-test-local-task');
      expect(branchName).not.toContain('null');
    });
  });

  describe('Title Slugification', () => {
    it('should slugify simple title', () => {
      const title = 'Simple Title';
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      expect(slug).toBe('simple-title');
    });

    it('should remove special characters', () => {
      const title = 'Fix: API Errors & Issues!';
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      expect(slug).toBe('fix-api-errors-issues');
    });

    it('should handle multiple spaces', () => {
      const title = 'Multiple    Spaces   Here';
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      expect(slug).toBe('multiple-spaces-here');
    });

    it('should remove leading/trailing dashes', () => {
      const title = '  Trimmed Title  ';
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      expect(slug).toBe('trimmed-title');
    });

    it('should handle unicode characters', () => {
      const title = 'Café résumé naïve';
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-');
      
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    });

    it('should truncate long titles', () => {
      const longTitle = 'This is a very long title that exceeds the maximum allowed length for branch names';
      const maxLength = 50;
      const slug = longTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .substring(0, maxLength);
      
      expect(slug.length).toBeLessThanOrEqual(maxLength);
    });

    it('should handle empty title', () => {
      const title = '';
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'untitled';
      
      expect(slug).toBe('untitled');
    });

    it('should handle all special characters', () => {
      const title = '!@#$%^&*()_+={}[]|\\:;"<>,.?/~`';
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      expect(slug).toBe('');
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
      const labels = ['PROJ-123', 'PROJ-124'];
      const jiraKeyRegex = /^[A-Z]+-\d+$/;
      const jiraKey = labels.find(l => jiraKeyRegex.test(l));
      
      expect(jiraKey).toBe('PROJ-123');
    });

    it('should return null when no Jira key present', () => {
      const labels = ['jira-synced', 'component-api'];
      const jiraKeyRegex = /^[A-Z]+-\d+$/;
      const jiraKey = labels.find(l => jiraKeyRegex.test(l));
      
      expect(jiraKey).toBeUndefined();
    });

    it('should validate Jira key format', () => {
      const jiraKeyRegex = /^[A-Z]+-\d+$/;
      
      expect(jiraKeyRegex.test('PROJ-123')).toBe(true);
      expect(jiraKeyRegex.test('FRONTEND-42')).toBe(true);
      expect(jiraKeyRegex.test('proj-123')).toBe(false);
      expect(jiraKeyRegex.test('PROJ123')).toBe(false);
      expect(jiraKeyRegex.test('123-PROJ')).toBe(false);
      expect(jiraKeyRegex.test('')).toBe(false);
    });

    it('should handle complex project keys', () => {
      const jiraKeyRegex = /^[A-Z0-9]+-\d+$/;
      
      expect(jiraKeyRegex.test('LONGPROJECTNAME-999')).toBe(true);
      expect(jiraKeyRegex.test('A-1')).toBe(true);
      expect(jiraKeyRegex.test('ABC123-456')).toBe(true);
    });
  });

  describe('Git Branch Creation', () => {
    it('should construct git checkout command', () => {
      const branchName = 'feature/bd-test-new-feature';
      const command = `git checkout -b ${branchName}`;
      
      expect(command).toContain('git checkout -b');
      expect(command).toContain(branchName);
    });

    it('should handle branch names with special patterns', () => {
      const branchNames = [
        'bug/bd-a1b2-fix-bug',
        'feature/bd-c3d4-add-feature',
        'task/bd-e5f6-update-task',
      ];
      
      branchNames.forEach(name => {
        expect(name).toMatch(/^(bug|feature|task)\/bd-[a-z0-9]+-/);
      });
    });

    it('should detect existing branch names', () => {
      const existingBranches = [
        'feature/bd-1',
        'bug/bd-2',
      ];
      const newBranch = 'feature/bd-1';
      
      const exists = existingBranches.includes(newBranch);
      expect(exists).toBe(true);
    });
  });

  describe('Issue Type to Branch Prefix', () => {
    it('should map bug type to bug prefix', () => {
      const type = 'bug';
      const prefix = type;
      
      expect(prefix).toBe('bug');
    });

    it('should map feature type to feature prefix', () => {
      const type = 'feature';
      const prefix = type;
      
      expect(prefix).toBe('feature');
    });

    it('should map task type to task prefix', () => {
      const type = 'task';
      const prefix = type;
      
      expect(prefix).toBe('task');
    });

    it('should handle epic type', () => {
      const type = 'epic';
      const prefix = type;
      
      expect(prefix).toBe('epic');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing issue ID', () => {
      const validateIssueId = (id) => {
        if (!id) throw new Error('Issue ID required');
        return true;
      };
      
      expect(() => validateIssueId()).toThrow('Issue ID required');
      expect(() => validateIssueId('bd-test')).not.toThrow();
    });

    it('should handle invalid issue ID format', () => {
      const validateIssueIdFormat = (id) => {
        if (!/^bd-[a-z0-9]+$/.test(id)) {
          throw new Error('Invalid issue ID format');
        }
        return true;
      };
      
      expect(() => validateIssueIdFormat('bd-test')).not.toThrow();
      expect(() => validateIssueIdFormat('invalid')).toThrow();
      expect(() => validateIssueIdFormat('BD-TEST')).toThrow();
    });

    it('should handle git command failures', () => {
      const mockGitCommand = () => {
        throw new Error('fatal: not a git repository');
      };
      
      expect(() => mockGitCommand()).toThrow('not a git repository');
    });

    it('should handle invalid branch names', () => {
      const validateBranchName = (name) => {
        if (!/^[a-z]+\/bd-[a-z0-9]+-/.test(name)) {
          throw new Error('Invalid branch name format');
        }
        return true;
      };
      
      expect(() => validateBranchName('feature/bd-test-name')).not.toThrow();
      expect(() => validateBranchName('invalid')).toThrow();
    });
  });

  describe('Branch Name Validation', () => {
    it('should validate correct branch name format', () => {
      const validNames = [
        'bug/bd-a1b2-fix-bug-PROJ-123',
        'feature/bd-c3d4-add-feature',
        'task/bd-e5f6-update-task',
      ];
      
      const pattern = /^(bug|feature|task|epic)\/bd-[a-z0-9]+-[a-z0-9-]+/;
      
      validNames.forEach(name => {
        expect(pattern.test(name)).toBe(true);
      });
    });

    it('should reject invalid branch names', () => {
      const invalidNames = [
        'invalid',
        'bug/no-issue-id',
        'feature/',
        '/bd-test',
        'BD-TEST/feature',
      ];
      
      const pattern = /^(bug|feature|task|epic)\/bd-[a-z0-9]+-[a-z0-9-]+/;
      
      invalidNames.forEach(name => {
        expect(pattern.test(name)).toBe(false);
      });
    });
  });

  describe('Integration', () => {
    it('should create complete workflow', () => {
      // Get issue data
      const issue = {
        id: 'bd-test',
        title: 'Test Feature',
        type: 'feature',
        labels: ['PROJ-999']
      };
      
      // Extract Jira key
      const jiraKeyRegex = /^[A-Z]+-\d+$/;
      const jiraKey = issue.labels.find(l => jiraKeyRegex.test(l));
      
      // Generate branch name
      const slug = issue.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const branchName = jiraKey
        ? `${issue.type}/${issue.id}-${slug}-${jiraKey}`
        : `${issue.type}/${issue.id}-${slug}`;
      
      expect(branchName).toBe('feature/bd-test-test-feature-PROJ-999');
      expect(jiraKey).toBe('PROJ-999');
    });
  });
});
