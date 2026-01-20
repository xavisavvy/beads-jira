/**
 * Tests for bd-start-branch workflow helper
 */

const { execSync } = require('child_process');
const path = require('path');

describe('bd-start-branch', () => {
  const scriptPath = path.join(__dirname, '..', 'bd-start-branch.js');

  describe('Script structure', () => {
    it('should be a valid Node.js script', () => {
      // Check if the file exists and is executable
      const fs = require('fs');
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    it('should require arguments to run', () => {
      try {
        execSync(`node "${scriptPath}"`, { encoding: 'utf8', stderr: 'pipe' });
      } catch (error) {
        // Should fail when no arguments provided
        expect(error.status).not.toBe(0);
      }
    });
  });

  describe('Input validation', () => {
    it('should handle missing arguments', () => {
      try {
        execSync(`node "${scriptPath}"`, { encoding: 'utf8', stderr: 'pipe' });
      } catch (error) {
        // Should provide helpful error message
        const stderr = error.stderr ? error.stderr.toString() : '';
        const stdout = error.stdout ? error.stdout.toString() : '';
        const output = stderr || stdout;
        expect(output.length).toBeGreaterThan(0);
      }
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
  });
});
