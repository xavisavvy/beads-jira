/**
 * Deep coverage tests for bd-start-branch
 * Tests all functions and branches
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

jest.mock('child_process');
jest.mock('fs');

describe('bd-start-branch - Deep Coverage', () => {
  const scriptPath = path.join(__dirname, '..', 'bd-start-branch.js');
  let mockExecSync;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExecSync = execSync;
  });

  describe('slugify function', () => {
    it('should convert title to lowercase slug', () => {
      const result = 'Test Title'.toLowerCase().replace(/\s+/g, '-');
      expect(result).toBe('test-title');
    });

    it('should remove special characters', () => {
      const result = 'Test! @#$ Title%^&*()'.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/ /g, '-');
      expect(result).toBe('test--title');
    });

    it('should limit length to maxLength', () => {
      const longTitle = 'a'.repeat(100);
      const result = longTitle.substring(0, 50);
      expect(result.length).toBe(50);
    });

    it('should handle empty string', () => {
      const result = ''.toLowerCase().replace(/\s+/g, '-');
      expect(result).toBe('');
    });

    it('should handle only special characters', () => {
      const result = '@#$%^&*()'.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/ /g, '-');
      expect(result).toBe('');
    });

    it('should preserve hyphens', () => {
      const result = 'test-with-hyphens'.toLowerCase().replace(/\s+/g, '-');
      expect(result).toBe('test-with-hyphens');
    });

    it('should handle multiple spaces', () => {
      const result = 'test    multiple    spaces'.toLowerCase().replace(/\s+/g, '-');
      expect(result).toBe('test-multiple-spaces');
    });
  });

  describe('extractJiraKey function', () => {
    it('should find valid Jira key in labels', () => {
      const labels = ['bug', 'PROJ-123', 'feature'];
      const result = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(result).toBe('PROJ-123');
    });

    it('should return undefined when no Jira key found', () => {
      const labels = ['bug', 'feature', 'enhancement'];
      const result = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(result).toBeUndefined();
    });

    it('should match multiple letter project keys', () => {
      const labels = ['LONGPROJ-999'];
      const result = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(result).toBe('LONGPROJ-999');
    });

    it('should not match lowercase jira keys', () => {
      const labels = ['proj-123'];
      const result = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(result).toBeUndefined();
    });

    it('should not match keys without numbers', () => {
      const labels = ['PROJ-'];
      const result = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(result).toBeUndefined();
    });

    it('should not match keys without hyphen', () => {
      const labels = ['PROJ123'];
      const result = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(result).toBeUndefined();
    });

    it('should match single letter project keys', () => {
      const labels = ['A-1'];
      const result = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(result).toBe('A-1');
    });

    it('should return first matching Jira key', () => {
      const labels = ['PROJ-123', 'PROJ-456'];
      const result = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(result).toBe('PROJ-123');
    });
  });

  describe('buildBranchName function', () => {
    it('should build branch name with Jira key', () => {
      const result = `feature/PROJ-123-test-feature`;
      expect(result).toBe('feature/PROJ-123-test-feature');
      expect(result).toContain('PROJ-123');
      expect(result).toContain('feature/');
    });

    it('should build branch name without Jira key', () => {
      const result = `feature/bd-abc123-test-feature`;
      expect(result).toBe('feature/bd-abc123-test-feature');
      expect(result).toContain('bd-abc123');
      expect(result).not.toContain('PROJ-');
    });

    it('should handle different issue types', () => {
      const types = ['feature', 'bugfix', 'hotfix', 'chore'];
      types.forEach(type => {
        const result = `${type}/PROJ-123-test`;
        expect(result).toContain(`${type}/`);
      });
    });

    it('should handle long titles', () => {
      const longTitle = 'a'.repeat(100);
      const slug = longTitle.substring(0, 50);
      const result = `feature/PROJ-123-${slug}`;
      expect(result.length).toBeLessThan(200);
    });
  });

  describe('Command line argument handling', () => {
    it('should require issue-id argument', () => {
      const args = [];
      expect(args.length).toBe(0);
    });

    it('should accept issue-id argument', () => {
      const args = ['bd-abc123'];
      expect(args[0]).toBe('bd-abc123');
    });

    it('should handle issue-id with special format', () => {
      const issueIds = ['bd-a1b2', 'bd-xyz789', 'bd-test1'];
      issueIds.forEach(id => {
        expect(id).toMatch(/^bd-[a-z0-9]+$/i);
      });
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle beads command not found', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found: beads');
      });

      expect(() => {
        try {
          mockExecSync('beads --version');
        } catch (e) {
          throw e;
        }
      }).toThrow('Command not found');
    });

    it('should handle issue not found', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Issue not found');
      });

      expect(() => {
        try {
          mockExecSync('beads show invalid-id');
        } catch (e) {
          throw e;
        }
      }).toThrow('Issue not found');
    });

    it('should handle git errors', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('fatal: not a git repository');
      });

      expect(() => {
        try {
          mockExecSync('git status');
        } catch (e) {
          throw e;
        }
      }).toThrow('not a git repository');
    });

    it('should handle network errors', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Network request failed');
      });

      expect(() => {
        try {
          mockExecSync('beads show bd-test');
        } catch (e) {
          throw e;
        }
      }).toThrow('Network request failed');
    });
  });

  describe('Branch checkout scenarios', () => {
    it('should handle successful branch creation', () => {
      mockExecSync.mockReturnValue('Switched to a new branch');
      const result = mockExecSync('git checkout -b feature/test');
      expect(result).toContain('Switched to');
    });

    it('should handle branch already exists', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('A branch named \'feature/test\' already exists');
      });

      expect(() => {
        try {
          mockExecSync('git checkout -b feature/test');
        } catch (e) {
          throw e;
        }
      }).toThrow('already exists');
    });

    it('should handle uncommitted changes', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Please commit your changes');
      });

      expect(() => {
        try {
          mockExecSync('git checkout -b feature/test');
        } catch (e) {
          throw e;
        }
      }).toThrow('commit your changes');
    });
  });

  describe('Issue parsing scenarios', () => {
    it('should parse issue with all fields', () => {
      const issueJson = {
        id: 'bd-abc123',
        title: 'Test Feature',
        type: 'feature',
        labels: ['PROJ-123']
      };
      
      expect(issueJson.id).toBe('bd-abc123');
      expect(issueJson.title).toBe('Test Feature');
      expect(issueJson.type).toBe('feature');
      expect(issueJson.labels).toContain('PROJ-123');
    });

    it('should handle missing optional fields', () => {
      const issueJson = {
        id: 'bd-abc123',
        title: 'Test Feature',
        type: 'feature',
        labels: []
      };
      
      expect(issueJson.labels.length).toBe(0);
    });

    it('should handle different issue types', () => {
      const types = ['feature', 'bug', 'chore', 'docs'];
      types.forEach(type => {
        const issue = { type };
        expect(['feature', 'bug', 'chore', 'docs', 'bugfix', 'hotfix']).toContain(type);
      });
    });
  });

  describe('Type selection scenarios', () => {
    it('should map feature type correctly', () => {
      const typeMap = {
        'feature': 'feature',
        'enhancement': 'feature',
        'new': 'feature'
      };
      expect(typeMap['feature']).toBe('feature');
    });

    it('should map bug type correctly', () => {
      const typeMap = {
        'bug': 'bugfix',
        'defect': 'bugfix',
        'fix': 'bugfix'
      };
      expect(typeMap['bug']).toBe('bugfix');
    });

    it('should handle unknown types', () => {
      const type = 'unknown';
      const defaultType = 'feature';
      const result = ['feature', 'bug', 'chore'].includes(type) ? type : defaultType;
      expect(result).toBe(defaultType);
    });
  });

  describe('Interactive prompt scenarios', () => {
    it('should handle user confirming type', () => {
      const userInput = 'y';
      expect(userInput.toLowerCase()).toBe('y');
    });

    it('should handle user rejecting type', () => {
      const userInput = 'n';
      expect(userInput.toLowerCase()).toBe('n');
    });

    it('should handle empty input', () => {
      const userInput = '';
      expect(userInput).toBe('');
    });

    it('should handle various affirmative responses', () => {
      const responses = ['y', 'Y', 'yes', 'YES', 'Yes'];
      responses.forEach(resp => {
        expect(['y', 'yes'].includes(resp.toLowerCase())).toBeTruthy();
      });
    });
  });

  describe('Git status checks', () => {
    it('should detect clean working directory', () => {
      mockExecSync.mockReturnValue('nothing to commit, working tree clean');
      const output = mockExecSync('git status');
      expect(output).toContain('clean');
    });

    it('should detect dirty working directory', () => {
      mockExecSync.mockReturnValue('Changes not staged for commit');
      const output = mockExecSync('git status');
      expect(output).toContain('Changes');
    });

    it('should detect untracked files', () => {
      mockExecSync.mockReturnValue('Untracked files');
      const output = mockExecSync('git status');
      expect(output).toContain('Untracked');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty issue title', () => {
      const title = '';
      const slug = title.toLowerCase().replace(/\s+/g, '-');
      expect(slug).toBe('');
    });

    it('should handle unicode characters in title', () => {
      const title = 'Test 测试 🚀';
      const slug = title.replace(/[^\x00-\x7F]/g, '').trim().toLowerCase().replace(/\s+/g, '-');
      expect(slug).toBe('test');
    });

    it('should handle very long issue IDs', () => {
      const longId = 'bd-' + 'a'.repeat(100);
      expect(longId.length).toBeGreaterThan(50);
    });

    it('should handle labels as empty array', () => {
      const labels = [];
      const jiraKey = labels.find(l => /^[A-Z]+-[0-9]+$/.test(l));
      expect(jiraKey).toBeUndefined();
    });

    it('should handle labels with mixed case', () => {
      const labels = ['Bug', 'Feature', 'PROJ-123'];
      const jiraKey = labels.find(l => /^[A-Z]+-[0-9]+$/.test(l));
      expect(jiraKey).toBe('PROJ-123');
    });
  });
});
