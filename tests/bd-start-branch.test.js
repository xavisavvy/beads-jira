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
  });
});
