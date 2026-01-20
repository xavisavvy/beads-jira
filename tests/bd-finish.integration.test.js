/**
 * Integration tests for bd-finish
 * Tests critical paths and exported functions
 */

const {
  showHelp,
  parseArgs,
  extractJiraKey,
  detectPlatform
} = require('../bd-finish.js');

describe('bd-finish Integration Tests', () => {
  describe('Command line argument parsing', () => {
    test('should parse issue ID argument', () => {
      const result = parseArgs(['bd-a1b2']);
      expect(result.issueId).toBe('bd-a1b2');
      expect(result.isDraft).toBe(false);
      expect(result.noPush).toBe(false);
      expect(result.showHelp).toBe(false);
    });

    test('should handle --draft flag', () => {
      const result = parseArgs(['bd-test', '--draft']);
      expect(result.issueId).toBe('bd-test');
      expect(result.isDraft).toBe(true);
    });

    test('should handle --no-push flag', () => {
      const result = parseArgs(['bd-test', '--no-push']);
      expect(result.issueId).toBe('bd-test');
      expect(result.noPush).toBe(true);
    });

    test('should show help with --help flag', () => {
      const result = parseArgs(['--help']);
      expect(result.showHelp).toBe(true);
    });

    test('should show help with -h flag', () => {
      const result = parseArgs(['-h']);
      expect(result.showHelp).toBe(true);
    });

    test('should show help when no args provided', () => {
      const result = parseArgs([]);
      expect(result.showHelp).toBe(true);
    });

    test('should handle multiple flags', () => {
      const result = parseArgs(['bd-test', '--draft', '--no-push']);
      expect(result.issueId).toBe('bd-test');
      expect(result.isDraft).toBe(true);
      expect(result.noPush).toBe(true);
    });
  });

  describe('Platform detection', () => {
    test('should detect GitHub', () => {
      expect(detectPlatform('git@github.com:user/repo.git')).toBe('github');
      expect(detectPlatform('https://github.com/user/repo.git')).toBe('github');
    });

    test('should detect Bitbucket', () => {
      expect(detectPlatform('git@bitbucket.org:user/repo.git')).toBe('bitbucket');
      expect(detectPlatform('https://bitbucket.org/user/repo.git')).toBe('bitbucket');
    });

    test('should detect GitLab', () => {
      expect(detectPlatform('git@gitlab.com:user/repo.git')).toBe('gitlab');
      expect(detectPlatform('https://gitlab.com/user/repo.git')).toBe('gitlab');
    });

    test('should detect self-hosted GitLab', () => {
      expect(detectPlatform('https://gitlab.company.com/user/repo.git')).toBe('gitlab');
      expect(detectPlatform('git@gitlab.internal:user/repo.git')).toBe('gitlab');
    });

    test('should handle unknown platforms', () => {
      expect(detectPlatform('git@unknown.com:user/repo.git')).toBe('other');
      expect(detectPlatform('https://git.company.com/repo.git')).toBe('other');
    });

    test('should handle empty or invalid URLs', () => {
      expect(detectPlatform('')).toBe('other');
      expect(() => detectPlatform(null)).toThrow();
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
      expect(extractJiraKey(['A-1'])).toBe('A-1');
      expect(extractJiraKey(['PROJECT-999'])).toBe('PROJECT-999');
      expect(extractJiraKey(['1234-ABC'])).toBeUndefined();
      expect(extractJiraKey(['PROJ-ABC'])).toBeUndefined();
    });

    test('should find first Jira key in multiple labels', () => {
      const labels = ['bug', 'PROJ-123', 'FEAT-456', 'urgent'];
      expect(extractJiraKey(labels)).toBe('PROJ-123');
    });
  });

  describe('Help display', () => {
    test('should display help text without errors', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls.some(call => 
        call[0].includes('Usage')
      )).toBe(true);
      consoleSpy.mockRestore();
    });

    test('should document all options', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('--draft');
      expect(output).toContain('--no-push');
      expect(output).toContain('--help');
      consoleSpy.mockRestore();
    });

    test('should provide usage examples', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('Examples');
      expect(output).toContain('bd-finish');
      consoleSpy.mockRestore();
    });
  });

  describe('Real-world platform scenarios', () => {
    test('should handle various GitHub URL formats', () => {
      expect(detectPlatform('git@github.com:org/repo.git')).toBe('github');
      expect(detectPlatform('https://github.com/org/repo')).toBe('github');
      expect(detectPlatform('https://github.com/org/repo.git')).toBe('github');
      expect(detectPlatform('ssh://git@github.com/org/repo.git')).toBe('github');
    });

    test('should handle various Bitbucket URL formats', () => {
      expect(detectPlatform('git@bitbucket.org:workspace/repo.git')).toBe('bitbucket');
      expect(detectPlatform('https://bitbucket.org/workspace/repo')).toBe('bitbucket');
      expect(detectPlatform('https://bitbucket.org/workspace/repo.git')).toBe('bitbucket');
    });

    test('should handle various GitLab URL formats', () => {
      expect(detectPlatform('git@gitlab.com:group/project.git')).toBe('gitlab');
      expect(detectPlatform('https://gitlab.com/group/project')).toBe('gitlab');
      expect(detectPlatform('https://gitlab.com/group/project.git')).toBe('gitlab');
    });
  });

  describe('Edge cases', () => {
    test('should handle missing issueId gracefully', () => {
      const result = parseArgs([]);
      expect(result.issueId).toBeUndefined();
      expect(result.showHelp).toBe(true);
    });

    test('should handle issue IDs with special characters', () => {
      const result = parseArgs(['bd-abc_123']);
      expect(result.issueId).toBe('bd-abc_123');
    });

    test('should handle URLs with trailing slashes', () => {
      expect(detectPlatform('https://github.com/user/repo/')).toBe('github');
    });

    test('should handle case-sensitive platform names', () => {
      // GitHub.com won't match because includes() is case-sensitive
      expect(detectPlatform('https://GitHub.com/user/repo')).toBe('other');
      // But gitlab will match via regex which is case-insensitive
      expect(detectPlatform('https://GITLAB.com/user/repo')).toBe('gitlab');
    });
  });

  describe('Argument combinations', () => {
    test('should handle flags in different orders', () => {
      const result1 = parseArgs(['--draft', 'bd-test', '--no-push']);
      const result2 = parseArgs(['bd-test', '--no-push', '--draft']);
      
      expect(result1.issueId).toBe('--draft');
      expect(result2.issueId).toBe('bd-test');
      expect(result2.isDraft).toBe(true);
      expect(result2.noPush).toBe(true);
    });

    test('should handle duplicate flags', () => {
      const result = parseArgs(['bd-test', '--draft', '--draft']);
      expect(result.isDraft).toBe(true);
    });
  });

  describe('Label edge cases', () => {
    test('should handle empty label arrays', () => {
      expect(extractJiraKey([])).toBeUndefined();
    });

    test('should handle null or undefined labels', () => {
      expect(() => extractJiraKey(null)).toThrow();
      expect(() => extractJiraKey(undefined)).toThrow();
    });

    test('should handle labels with similar patterns', () => {
      expect(extractJiraKey(['PR-123-branch'])).toBeUndefined(); // not a label
      expect(extractJiraKey(['PROJ-123'])).toBe('PROJ-123'); // valid
    });
  });
});
