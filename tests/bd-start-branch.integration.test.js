/**
 * Integration tests for bd-start-branch
 * Tests critical paths and exported functions
 */

const {
  slugify,
  extractJiraKey,
  buildBranchName
} = require('../bd-start-branch.js');

describe('bd-start-branch Integration Tests', () => {
  describe('Critical Path: Branch name generation', () => {
    test('should slugify issue titles correctly', () => {
      expect(slugify('Implement New Feature')).toBe('implement-new-feature');
      expect(slugify('Fix Bug #123')).toBe('fix-bug-123');
      expect(slugify('Update Documentation & Tests')).toBe('update-documentation--tests');
    });

    test('should handle special characters in titles', () => {
      expect(slugify('Add (parentheses) to parser')).toBe('add-parentheses-to-parser');
      expect(slugify('Fix: Error in login')).toBe('fix-error-in-login');
      expect(slugify('Feature/Enhancement')).toBe('featureenhancement');
    });

    test('should truncate long titles', () => {
      const longTitle = 'This is a very long issue title that should be truncated to fifty characters maximum';
      const result = slugify(longTitle, 50);
      expect(result.length).toBeLessThanOrEqual(50);
      expect(result).toMatch(/^this-is-a-very-long-issue-title/);
    });

    test('should handle empty and whitespace-only titles', () => {
      expect(slugify('')).toBe('');
      // Whitespace gets converted to dashes then stripped
      const whitespaceResult = slugify('   ');
      expect(whitespaceResult).toBe('---');
    });
  });

  describe('Jira key extraction', () => {
    test('should extract valid Jira keys from labels', () => {
      expect(extractJiraKey(['PROJ-123'])).toBe('PROJ-123');
      expect(extractJiraKey(['bug', 'FRONT-456', 'urgent'])).toBe('FRONT-456');
      expect(extractJiraKey(['ABC-1'])).toBe('ABC-1');
    });

    test('should return undefined for no Jira key', () => {
      expect(extractJiraKey([])).toBeUndefined();
      expect(extractJiraKey(['bug', 'feature'])).toBeUndefined();
      expect(extractJiraKey(['proj-123'])).toBeUndefined(); // lowercase
      expect(extractJiraKey(['PROJ123'])).toBeUndefined(); // no dash
    });

    test('should validate Jira key format strictly', () => {
      expect(extractJiraKey(['A-1'])).toBe('A-1'); // minimal valid
      expect(extractJiraKey(['PROJECT-999'])).toBe('PROJECT-999');
      expect(extractJiraKey(['1234-ABC'])).toBeUndefined(); // number first
      expect(extractJiraKey(['PROJ-ABC'])).toBeUndefined(); // letter in number
    });
  });

  describe('Branch name format', () => {
    test('should generate correct branch name with Jira key', () => {
      const result = buildBranchName('feature', 'bd-a1b2', 'Add login page', 'PROJ-123');
      expect(result).toBe('feature/PROJ-123-add-login-page');
    });

    test('should generate correct branch name without Jira key', () => {
      const result = buildBranchName('bug', 'bd-x9y8', 'Fix memory leak', undefined);
      expect(result).toBe('bug/bd-x9y8-fix-memory-leak');
    });

    test('should handle different issue types', () => {
      expect(buildBranchName('feature', 'bd-123', 'New feature', 'ABC-1'))
        .toBe('feature/ABC-1-new-feature');
      expect(buildBranchName('bug', 'bd-456', 'Bug fix', 'ABC-2'))
        .toBe('bug/ABC-2-bug-fix');
      expect(buildBranchName('task', 'bd-789', 'Task item', undefined))
        .toBe('task/bd-789-task-item');
    });

    test('should handle special characters in branch names', () => {
      const result = buildBranchName('feature', 'bd-111', 'Add (API) & DB', 'PROJ-99');
      expect(result).toBe('feature/PROJ-99-add-api--db');
    });
  });

  describe('Error handling scenarios', () => {
    test('should handle null or undefined inputs', () => {
      // slugify will throw on null because it calls toLowerCase
      expect(() => slugify(null)).toThrow();
      
      // extractJiraKey expects an array, will throw on null
      expect(() => extractJiraKey(null)).toThrow();
      
      // buildBranchName will fail because it calls slugify with null title
      expect(() => buildBranchName(null, null, null, null)).toThrow();
    });

    test('should handle edge case titles', () => {
      expect(slugify('!!!')).toBe('');
      expect(slugify('123')).toBe('123');
      expect(slugify('a'.repeat(100), 50).length).toBe(50);
    });
  });

  describe('Real-world scenarios', () => {
    test('should handle typical feature branch', () => {
      const result = buildBranchName(
        'feature',
        'bd-abc123',
        'Implement user authentication with OAuth',
        'AUTH-456'
      );
      expect(result).toBe('feature/AUTH-456-implement-user-authentication-with-oauth');
    });

    test('should handle typical bug branch', () => {
      const result = buildBranchName(
        'bug',
        'bd-def456',
        'Fix: Null pointer exception in payment processing',
        'BUG-789'
      );
      // The slug will be shortened because of the maxLength default (50 chars)
      expect(result).toMatch(/^bug\/BUG-789-fix-null-pointer-exception-in-payment/);
    });

    test('should handle branch without Jira', () => {
      const result = buildBranchName(
        'task',
        'bd-ghi789',
        'Update dependencies and documentation',
        undefined
      );
      expect(result).toBe('task/bd-ghi789-update-dependencies-and-documentation');
    });
  });

  describe('Integration with multiple labels', () => {
    test('should find first Jira key in multiple labels', () => {
      const labels = ['bug', 'PROJ-123', 'FEAT-456', 'urgent'];
      expect(extractJiraKey(labels)).toBe('PROJ-123');
    });

    test('should ignore non-Jira labels', () => {
      const labels = ['v1.0', 'hotfix', 'TICKET-99', 'needs-review'];
      expect(extractJiraKey(labels)).toBe('TICKET-99');
    });
  });

  describe('Branch name length constraints', () => {
    test('should handle very long issue titles', () => {
      const longTitle = 'Implement a comprehensive solution for handling user authentication, ' +
        'authorization, session management, and security features including 2FA';
      const result = buildBranchName('feature', 'bd-long', longTitle, 'SEC-999');
      expect(result.length).toBeLessThanOrEqual(100); // Git branch name practical limit
    });

    test('should preserve readability with truncation', () => {
      const title = 'Add support for multiple database connections and connection pooling';
      const slug = slugify(title, 40);
      expect(slug.length).toBeLessThanOrEqual(40);
      expect(slug).toMatch(/^add-support-for-multiple-database/);
    });
  });
});
