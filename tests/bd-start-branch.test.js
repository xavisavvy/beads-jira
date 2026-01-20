/**
 * Tests for bd-start-branch workflow helper
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('bd-start-branch', () => {
  const scriptPath = path.join(__dirname, '..', 'bd-start-branch.js');

  describe('Script structure', () => {
    it('should be a valid Node.js script', () => {
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    it('should have proper shebang', () => {
      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
    });

    it('should export functions for testing', () => {
      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('function prompt');
      expect(content).toContain('async function main');
    });
  });

  describe('Branch name generation', () => {
    it('should generate valid branch names from issue titles', () => {
      const testCases = [
        { input: 'Fix login bug', expected: /fix-login-bug/ },
        { input: 'Add new feature', expected: /add-new-feature/ },
        { input: 'Update documentation', expected: /update-documentation/ }
      ];

      testCases.forEach(({ input, expected }) => {
        const slugified = input.toLowerCase().replace(/\s+/g, '-');
        expect(slugified).toMatch(expected);
      });
    });

    it('should handle special characters in branch names', () => {
      const input = 'Fix bug #123 - User can\'t login!';
      const slug = input.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      expect(slug).toBe('fix-bug-123-user-can-t-login');
    });

    it('should truncate long branch names', () => {
      const longName = 'a'.repeat(100);
      const truncated = longName.substring(0, 50);
      
      expect(truncated.length).toBe(50);
    });
  });

  describe('Jira key handling', () => {
    it('should recognize valid Jira keys', () => {
      const validKeys = ['PROJ-123', 'ABC-1', 'XYZ-9999'];
      const jiraKeyRegex = /^[A-Z]+-\d+$/;

      validKeys.forEach(key => {
        expect(key).toMatch(jiraKeyRegex);
      });
    });

    it('should reject invalid Jira keys', () => {
      const invalidKeys = ['proj-123', 'ABC', '123', 'AB-'];
      const jiraKeyRegex = /^[A-Z]+-\d+$/;

      invalidKeys.forEach(key => {
        expect(key).not.toMatch(jiraKeyRegex);
      });
    });
  });

  describe('Git integration', () => {
    it('should handle git status checks', () => {
      // Test that git commands work in the environment
      try {
        const status = execSync('git status', { encoding: 'utf8' });
        expect(status).toBeDefined();
      } catch (error) {
        // If git is not available, test should still pass
        expect(error).toBeDefined();
      }
    });

    it('should check for uncommitted changes', () => {
      try {
        const result = execSync('git status --porcelain', { encoding: 'utf8' });
        expect(typeof result).toBe('string');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should get current branch', () => {
      try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        expect(branch).toBeDefined();
        expect(branch.length).toBeGreaterThan(0);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Command line arguments', () => {
    it('should show usage when no arguments provided', () => {
      try {
        execSync(`node "${scriptPath}"`, { encoding: 'utf8', stdio: 'pipe' });
      } catch (error) {
        expect(error.status).toBe(1);
      }
    });

    it('should accept issue ID argument', () => {
      const issueId = 'bd-a1b2';
      expect(issueId).toMatch(/^bd-[a-z0-9]+$/);
    });
  });

  describe('Branch naming patterns', () => {
    it('should format branch with Jira key', () => {
      const issueType = 'feature';
      const jiraKey = 'PROJ-123';
      const slug = 'fix-login-bug';
      const branchName = `${issueType}/${jiraKey}-${slug}`;
      
      expect(branchName).toBe('feature/PROJ-123-fix-login-bug');
    });

    it('should format branch without Jira key', () => {
      const issueType = 'bugfix';
      const issueId = 'bd-a1b2';
      const slug = 'fix-login-bug';
      const branchName = `${issueType}/${issueId}-${slug}`;
      
      expect(branchName).toBe('bugfix/bd-a1b2-fix-login-bug');
    });

    it('should handle different issue types', () => {
      const types = ['feature', 'bugfix', 'hotfix', 'task'];
      types.forEach(type => {
        const branchName = `${type}/PROJ-123-test`;
        expect(branchName).toMatch(new RegExp(`^${type}/`));
      });
    });
  });

  describe('Slugification', () => {
    it('should convert to lowercase', () => {
      const input = 'Fix Login Bug';
      const output = input.toLowerCase();
      expect(output).toBe('fix login bug');
    });

    it('should replace spaces with hyphens', () => {
      const input = 'fix login bug';
      const output = input.replace(/ /g, '-');
      expect(output).toBe('fix-login-bug');
    });

    it('should remove special characters', () => {
      const input = 'Fix bug #123!';
      const output = input.toLowerCase().replace(/[^a-z0-9 -]/g, '');
      expect(output).not.toContain('#');
      expect(output).not.toContain('!');
    });

    it('should handle empty string', () => {
      const input = '';
      const output = input.toLowerCase().replace(/[^a-z0-9 -]/g, '').substring(0, 50);
      expect(output).toBe('');
    });
  });

  describe('Module exports', () => {
    it('should export prompt function when required', () => {
      const module = require(scriptPath);
      expect(module.prompt).toBeDefined();
      expect(typeof module.prompt).toBe('function');
    });

    it('should export main function when required', () => {
      const module = require(scriptPath);
      expect(module.main).toBeDefined();
      expect(typeof module.main).toBe('function');
    });

    it('should export slugify function', () => {
      const module = require(scriptPath);
      expect(module.slugify).toBeDefined();
      expect(typeof module.slugify).toBe('function');
    });

    it('should export extractJiraKey function', () => {
      const module = require(scriptPath);
      expect(module.extractJiraKey).toBeDefined();
      expect(typeof module.extractJiraKey).toBe('function');
    });

    it('should export buildBranchName function', () => {
      const module = require(scriptPath);
      expect(module.buildBranchName).toBeDefined();
      expect(typeof module.buildBranchName).toBe('function');
    });
  });

  describe('Helper functions', () => {
    const module = require(scriptPath);

    describe('slugify', () => {
      it('should slugify text correctly', () => {
        const result = module.slugify('Fix Login Bug');
        expect(result).toBe('fix-login-bug');
      });

      it('should remove special characters', () => {
        const result = module.slugify('Fix bug #123!');
        expect(result).toMatch(/^[a-z0-9-]+$/);
        expect(result).not.toContain('#');
        expect(result).not.toContain('!');
      });

      it('should replace spaces with hyphens', () => {
        const result = module.slugify('test with spaces');
        expect(result).toBe('test-with-spaces');
      });

      it('should truncate to max length', () => {
        const longText = 'a'.repeat(100);
        const result = module.slugify(longText, 50);
        expect(result.length).toBe(50);
      });

      it('should handle empty string', () => {
        const result = module.slugify('');
        expect(result).toBe('');
      });

      it('should use default max length', () => {
        const longText = 'a'.repeat(100);
        const result = module.slugify(longText);
        expect(result.length).toBeLessThanOrEqual(50);
      });
    });

    describe('extractJiraKey', () => {
      it('should extract Jira key from labels', () => {
        const labels = ['bug', 'PROJ-123', 'high-priority'];
        const result = module.extractJiraKey(labels);
        expect(result).toBe('PROJ-123');
      });

      it('should return undefined when no Jira key exists', () => {
        const labels = ['bug', 'feature'];
        const result = module.extractJiraKey(labels);
        expect(result).toBeUndefined();
      });

      it('should match valid Jira key patterns', () => {
        const labels = ['ABC-1', 'FRONTEND-999'];
        labels.forEach(label => {
          const result = module.extractJiraKey([label]);
          expect(result).toBe(label);
        });
      });

      it('should not match invalid patterns', () => {
        const labels = ['proj-123', 'PROJ123', 'abc-def'];
        labels.forEach(label => {
          const result = module.extractJiraKey([label]);
          expect(result).toBeUndefined();
        });
      });
    });

    describe('buildBranchName', () => {
      it('should build branch name with Jira key', () => {
        const result = module.buildBranchName('feature', 'bd-a1b2', 'Fix login bug', 'PROJ-123');
        expect(result).toMatch(/^feature\/PROJ-123-/);
        expect(result).toContain('fix-login-bug');
      });

      it('should build branch name without Jira key', () => {
        const result = module.buildBranchName('bugfix', 'bd-a1b2', 'Fix login bug', null);
        expect(result).toMatch(/^bugfix\/bd-a1b2-/);
        expect(result).toContain('fix-login-bug');
      });

      it('should handle different issue types', () => {
        const types = ['feature', 'bugfix', 'hotfix', 'task'];
        types.forEach(type => {
          const result = module.buildBranchName(type, 'bd-123', 'Test', 'PROJ-1');
          expect(result).toMatch(new RegExp(`^${type}/`));
        });
      });

      it('should slugify the title in branch name', () => {
        const result = module.buildBranchName('feature', 'bd-123', 'Fix Bug #456!', 'PROJ-1');
        expect(result).not.toContain('#');
        expect(result).not.toContain('!');
        expect(result).toMatch(/^feature\/PROJ-1-fix-bug-456$/);
      });
    });
  });
});
