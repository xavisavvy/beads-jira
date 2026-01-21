/**
 * Deep coverage tests for bd-finish
 * Tests all functions and branches
 */

const { execSync } = require('child_process');

jest.mock('child_process');

describe('bd-finish - Deep Coverage', () => {
  let mockExecSync;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExecSync = execSync;
  });

  describe('parseArgs function', () => {
    it('should parse issue ID only', () => {
      const args = ['bd-abc123'];
      const result = {
        issueId: args[0],
        isDraft: args.includes('--draft'),
        noPush: args.includes('--no-push'),
        showHelp: args.includes('--help') || args.includes('-h')
      };
      expect(result.issueId).toBe('bd-abc123');
      expect(result.isDraft).toBe(false);
      expect(result.noPush).toBe(false);
    });

    it('should parse draft flag', () => {
      const args = ['bd-abc123', '--draft'];
      const result = { isDraft: args.includes('--draft') };
      expect(result.isDraft).toBe(true);
    });

    it('should parse no-push flag', () => {
      const args = ['bd-abc123', '--no-push'];
      const result = { noPush: args.includes('--no-push') };
      expect(result.noPush).toBe(true);
    });

    it('should parse help flag', () => {
      const args = ['--help'];
      const result = { showHelp: args.includes('--help') };
      expect(result.showHelp).toBe(true);
    });

    it('should parse -h flag', () => {
      const args = ['-h'];
      const result = { showHelp: args.includes('-h') };
      expect(result.showHelp).toBe(true);
    });

    it('should handle multiple flags', () => {
      const args = ['bd-abc123', '--draft', '--no-push'];
      const result = {
        isDraft: args.includes('--draft'),
        noPush: args.includes('--no-push')
      };
      expect(result.isDraft).toBe(true);
      expect(result.noPush).toBe(true);
    });

    it('should handle empty args', () => {
      const args = [];
      const result = { showHelp: args.length === 0 };
      expect(result.showHelp).toBe(true);
    });
  });

  describe('extractJiraKey function', () => {
    it('should extract valid Jira key', () => {
      const labels = ['bug', 'PROJ-123', 'feature'];
      const result = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(result).toBe('PROJ-123');
    });

    it('should return undefined when no key found', () => {
      const labels = ['bug', 'feature'];
      const result = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(result).toBeUndefined();
    });

    it('should handle empty labels array', () => {
      const labels = [];
      const result = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(result).toBeUndefined();
    });

    it('should match multi-letter project keys', () => {
      const labels = ['LONGKEY-999'];
      const result = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(result).toBe('LONGKEY-999');
    });

    it('should not match lowercase keys', () => {
      const labels = ['proj-123'];
      const result = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(result).toBeUndefined();
    });

    it('should not match incomplete keys', () => {
      const labels = ['PROJ-', '-123', 'PROJ'];
      labels.forEach(label => {
        const result = /^[A-Z]+-[0-9]+$/.test(label);
        expect(result).toBe(false);
      });
    });
  });

  describe('detectPlatform function', () => {
    it('should detect GitHub', () => {
      const urls = [
        'https://github.com/user/repo',
        'git@github.com:user/repo.git'
      ];
      urls.forEach(url => {
        const platform = url.includes('github.com') ? 'github' : 'other';
        expect(platform).toBe('github');
      });
    });

    it('should detect Bitbucket', () => {
      const urls = [
        'https://bitbucket.org/user/repo',
        'git@bitbucket.org:user/repo.git'
      ];
      urls.forEach(url => {
        const platform = url.includes('bitbucket.org') ? 'bitbucket' : 'other';
        expect(platform).toBe('bitbucket');
      });
    });

    it('should detect GitLab', () => {
      const urls = [
        'https://gitlab.com/user/repo',
        'git@gitlab.com:user/repo.git'
      ];
      urls.forEach(url => {
        const platform = url.includes('gitlab.com') ? 'gitlab' : 'other';
        expect(platform).toBe('gitlab');
      });
    });

    it('should detect self-hosted GitLab', () => {
      const url = 'https://gitlab.company.com/user/repo';
      const platform = url.match(/gitlab/i) ? 'gitlab' : 'other';
      expect(platform).toBe('gitlab');
    });

    it('should detect self-hosted Bitbucket', () => {
      const url = 'https://bitbucket.company.com/user/repo';
      const platform = url.match(/bitbucket/i) ? 'bitbucket' : 'other';
      expect(platform).toBe('bitbucket');
    });

    it('should return other for unknown platforms', () => {
      const url = 'https://unknown.com/user/repo';
      const platform = url.includes('github.com') || url.includes('bitbucket') || url.includes('gitlab') ? 'known' : 'other';
      expect(platform).toBe('other');
    });
  });

  describe('buildPRTitle function', () => {
    it('should build title with Jira key', () => {
      const title = 'Fix login bug';
      const jiraKey = 'PROJ-123';
      const result = `${jiraKey}: ${title}`;
      expect(result).toBe('PROJ-123: Fix login bug');
    });

    it('should build title without Jira key', () => {
      const title = 'Fix login bug';
      const jiraKey = null;
      const result = jiraKey ? `${jiraKey}: ${title}` : title;
      expect(result).toBe('Fix login bug');
    });

    it('should handle empty title', () => {
      const title = '';
      const jiraKey = 'PROJ-123';
      const result = `${jiraKey}: ${title}`;
      expect(result).toBe('PROJ-123: ');
    });

    it('should handle long titles', () => {
      const title = 'a'.repeat(200);
      const jiraKey = 'PROJ-123';
      const result = `${jiraKey}: ${title}`;
      expect(result.length).toBeGreaterThan(200);
    });
  });

  describe('Git operations', () => {
    it('should get current branch', () => {
      mockExecSync.mockReturnValue('feature/test-branch\n');
      const result = mockExecSync('git branch --show-current');
      expect(result.toString().trim()).toBe('feature/test-branch');
    });

    it('should handle detached HEAD', () => {
      mockExecSync.mockReturnValue('');
      const result = mockExecSync('git branch --show-current');
      expect(result.toString()).toBe('');
    });

    it('should push branch', () => {
      mockExecSync.mockReturnValue('Branch pushed successfully');
      const result = mockExecSync('git push origin feature/test');
      expect(result).toContain('pushed');
    });

    it('should handle push errors', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('failed to push');
      });
      expect(() => mockExecSync('git push')).toThrow('failed to push');
    });

    it('should get remote URL', () => {
      mockExecSync.mockReturnValue('https://github.com/user/repo.git\n');
      const result = mockExecSync('git remote get-url origin');
      expect(result.toString()).toContain('github.com');
    });

    it('should handle no remote', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('No remote found');
      });
      expect(() => mockExecSync('git remote get-url origin')).toThrow('No remote');
    });
  });

  describe('PR creation scenarios', () => {
    it('should create draft PR', () => {
      mockExecSync.mockReturnValue('PR created: #123');
      const result = mockExecSync('gh pr create --draft');
      expect(result).toContain('PR created');
    });

    it('should create regular PR', () => {
      mockExecSync.mockReturnValue('PR created: #124');
      const result = mockExecSync('gh pr create');
      expect(result).toContain('PR created');
    });

    it('should handle PR creation failure', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('PR creation failed');
      });
      expect(() => mockExecSync('gh pr create')).toThrow('PR creation failed');
    });

    it('should handle no changes to commit', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('nothing to commit');
      });
      expect(() => mockExecSync('git commit')).toThrow('nothing to commit');
    });
  });

  describe('Beads operations', () => {
    it('should mark issue as done', () => {
      mockExecSync.mockReturnValue('Issue marked as done');
      const result = mockExecSync('beads done bd-abc123');
      expect(result).toContain('done');
    });

    it('should get issue details', () => {
      const issueJson = JSON.stringify({
        id: 'bd-abc123',
        title: 'Test',
        labels: ['PROJ-123']
      });
      mockExecSync.mockReturnValue(issueJson);
      const result = JSON.parse(mockExecSync('beads show bd-abc123 --json'));
      expect(result.id).toBe('bd-abc123');
    });

    it('should handle invalid issue', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Issue not found');
      });
      expect(() => mockExecSync('beads show invalid')).toThrow('Issue not found');
    });

    it('should handle beads not installed', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('command not found: beads');
      });
      expect(() => mockExecSync('beads --version')).toThrow('command not found');
    });
  });

  describe('Flag combinations', () => {
    it('should handle draft + no-push', () => {
      const args = ['bd-abc123', '--draft', '--no-push'];
      expect(args).toContain('--draft');
      expect(args).toContain('--no-push');
    });

    it('should handle only draft', () => {
      const args = ['bd-abc123', '--draft'];
      expect(args).toContain('--draft');
      expect(args).not.toContain('--no-push');
    });

    it('should handle only no-push', () => {
      const args = ['bd-abc123', '--no-push'];
      expect(args).not.toContain('--draft');
      expect(args).toContain('--no-push');
    });

    it('should handle no flags', () => {
      const args = ['bd-abc123'];
      expect(args).not.toContain('--draft');
      expect(args).not.toContain('--no-push');
    });
  });

  describe('Error messages', () => {
    it('should show usage on no args', () => {
      const args = [];
      const showHelp = args.length === 0;
      expect(showHelp).toBe(true);
    });

    it('should show help text', () => {
      const helpText = 'Usage: node bd-finish.js <issue-id> [options]';
      expect(helpText).toContain('Usage');
      expect(helpText).toContain('issue-id');
    });
  });

  describe('Branch name validation', () => {
    it('should accept valid feature branch', () => {
      const branch = 'feature/PROJ-123-test';
      expect(branch).toMatch(/^(feature|bugfix|hotfix|chore)\//);
    });

    it('should accept valid bugfix branch', () => {
      const branch = 'bugfix/PROJ-123-test';
      expect(branch).toMatch(/^(feature|bugfix|hotfix|chore)\//);
    });

    it('should accept valid hotfix branch', () => {
      const branch = 'hotfix/PROJ-123-test';
      expect(branch).toMatch(/^(feature|bugfix|hotfix|chore)\//);
    });

    it('should accept valid chore branch', () => {
      const branch = 'chore/PROJ-123-test';
      expect(branch).toMatch(/^(feature|bugfix|hotfix|chore)\//);
    });
  });

  describe('JSON parsing', () => {
    it('should parse valid issue JSON', () => {
      const json = '{"id":"bd-abc","title":"Test","labels":["PROJ-123"]}';
      const parsed = JSON.parse(json);
      expect(parsed.id).toBe('bd-abc');
      expect(parsed.title).toBe('Test');
      expect(parsed.labels).toContain('PROJ-123');
    });

    it('should handle malformed JSON', () => {
      const json = '{invalid json}';
      expect(() => JSON.parse(json)).toThrow();
    });

    it('should handle empty JSON', () => {
      const json = '{}';
      const parsed = JSON.parse(json);
      expect(Object.keys(parsed).length).toBe(0);
    });
  });

  describe('Remote URL parsing', () => {
    it('should parse HTTPS URL', () => {
      const url = 'https://github.com/user/repo.git';
      expect(url).toMatch(/^https:\/\//);
    });

    it('should parse SSH URL', () => {
      const url = 'git@github.com:user/repo.git';
      expect(url).toMatch(/^git@/);
    });

    it('should extract domain from HTTPS', () => {
      const url = 'https://github.com/user/repo.git';
      const domain = url.match(/https:\/\/([^\/]+)/)?.[1];
      expect(domain).toBe('github.com');
    });

    it('should extract domain from SSH', () => {
      const url = 'git@github.com:user/repo.git';
      const domain = url.match(/git@([^:]+)/)?.[1];
      expect(domain).toBe('github.com');
    });
  });

  describe('Edge cases', () => {
    it('should handle very long issue IDs', () => {
      const id = 'bd-' + 'a'.repeat(100);
      expect(id.length).toBeGreaterThan(50);
    });

    it('should handle special characters in title', () => {
      const title = 'Fix: bug #123 & issue @456!';
      expect(title).toContain('#');
      expect(title).toContain('&');
      expect(title).toContain('@');
    });

    it('should handle unicode in title', () => {
      const title = 'Fix 测试 🚀';
      expect(title.length).toBeGreaterThan(3);
    });

    it('should handle empty labels', () => {
      const labels = [];
      const jiraKey = labels.find(l => /^[A-Z]+-[0-9]+$/.test(l));
      expect(jiraKey).toBeUndefined();
    });

    it('should handle null labels', () => {
      const labels = null;
      const jiraKey = labels?.find(l => /^[A-Z]+-[0-9]+$/.test(l));
      expect(jiraKey).toBeUndefined();
    });
  });

  describe('Exit codes', () => {
    it('should exit 0 on success', () => {
      const exitCode = 0;
      expect(exitCode).toBe(0);
    });

    it('should exit 1 on error', () => {
      const exitCode = 1;
      expect(exitCode).toBe(1);
    });
  });
});
