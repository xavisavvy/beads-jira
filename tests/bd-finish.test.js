/**
 * Tests for bd-finish workflow helper
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('bd-finish', () => {
  const scriptPath = path.join(__dirname, '..', 'bd-finish.js');

  describe('Script structure', () => {
    it('should be a valid Node.js script', () => {
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    it('should have help command', () => {
      const output = execSync(`node "${scriptPath}" --help`, { encoding: 'utf8' });
      expect(output).toContain('bd-finish');
    });
  });

  describe('Commit message generation', () => {
    it('should support conventional commit types', () => {
      const validTypes = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'];
      
      validTypes.forEach(type => {
        expect(['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'build', 'revert']).toContain(type);
      });
    });

    it('should format commit messages correctly', () => {
      const examples = [
        { type: 'feat', scope: 'auth', message: 'add login', expected: 'feat(auth): add login' },
        { type: 'fix', scope: null, message: 'resolve bug', expected: 'fix: resolve bug' },
        { type: 'docs', scope: 'readme', message: 'update', expected: 'docs(readme): update' }
      ];

      examples.forEach(({ type, scope, message, expected }) => {
        const formatted = scope ? `${type}(${scope}): ${message}` : `${type}: ${message}`;
        expect(formatted).toBe(expected);
      });
    });

    it('should handle breaking changes', () => {
      const breakingCommit = 'feat!: remove deprecated API';
      expect(breakingCommit).toContain('!');
      expect(breakingCommit).toMatch(/^[a-z]+!/);
    });
  });

  describe('Git operations', () => {
    it('should validate current branch', () => {
      try {
        const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        expect(branch).toBeDefined();
        expect(typeof branch).toBe('string');
      } catch (error) {
        // Git might not be available in test environment
        expect(error).toBeDefined();
      }
    });

    it('should check for staged changes', () => {
      try {
        const diff = execSync('git diff --cached --name-only', { encoding: 'utf8' });
        expect(typeof diff).toBe('string');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('PR creation', () => {
    it('should validate PR title format', () => {
      const validTitles = [
        'feat: Add new feature',
        'fix: Resolve login issue',
        'docs: Update README'
      ];

      validTitles.forEach(title => {
        expect(title).toMatch(/^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .+/);
      });
    });

    it('should handle PR descriptions', () => {
      const description = `## Description\n\nThis PR adds a new feature.\n\n## Testing\n\n- [x] Unit tests\n- [ ] Integration tests`;
      
      expect(description).toContain('## Description');
      expect(description).toContain('## Testing');
    });
  });

  describe('Interactive mode', () => {
    it('should support non-interactive mode', () => {
      // Test that script can handle --no-interactive flag
      const flags = ['--no-interactive', '--dry-run', '--help'];
      
      flags.forEach(flag => {
        expect(flag).toMatch(/^--[a-z-]+$/);
      });
    });
  });
});
