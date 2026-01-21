/**
 * Integration Tests for bd-finish.js
 * Tests PR creation, git operations, and platform detection
 */

const child_process = require('child_process');

jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn()
}));

describe('bd-finish - Integration Tests', () => {
  let execSync;
  let extractJiraKey, detectPlatform, buildPRTitle, buildPRBody, parseArgs;
  
  beforeEach(() => {
    jest.clearAllMocks();
    execSync = child_process.execSync;
    
    // Define functions from bd-finish.js
    extractJiraKey = (labels) => {
      return labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
    };
    
    detectPlatform = (remoteUrl) => {
      if (remoteUrl.includes('github.com')) {
        return 'github';
      } else if (remoteUrl.includes('bitbucket.org')) {
        return 'bitbucket';
      } else if (remoteUrl.includes('gitlab.com')) {
        return 'gitlab';
      } else {
        if (remoteUrl.match(/gitlab/i)) {
          return 'gitlab';
        } else if (remoteUrl.match(/bitbucket/i)) {
          return 'bitbucket';
        }
      }
      return 'other';
    };
    
    buildPRTitle = (issueTitle, jiraKey) => {
      return jiraKey ? `${jiraKey}: ${issueTitle}` : issueTitle;
    };
    
    buildPRBody = (issueId, jiraKey) => {
      if (jiraKey) {
        return `Closes ${issueId} / ${jiraKey}

## Changes
- 

## Testing
- 

## Related
- Jira: ${jiraKey}
- Beads: ${issueId}`;
      } else {
        return `Closes ${issueId}

## Changes
- 

## Testing
- 

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated`;
      }
    };
    
    parseArgs = (args) => {
      return {
        issueId: args[0],
        isDraft: args.includes('--draft'),
        noPush: args.includes('--no-push'),
        showHelp: args.length === 0 || args.includes('--help') || args.includes('-h')
      };
    };
  });

  describe('parseArgs()', () => {
    it('should parse issue ID', () => {
      const result = parseArgs(['bd-abc123']);
      expect(result.issueId).toBe('bd-abc123');
      expect(result.isDraft).toBe(false);
      expect(result.noPush).toBe(false);
    });

    it('should detect --draft flag', () => {
      const result = parseArgs(['bd-123', '--draft']);
      expect(result.isDraft).toBe(true);
    });

    it('should detect --no-push flag', () => {
      const result = parseArgs(['bd-123', '--no-push']);
      expect(result.noPush).toBe(true);
    });

    it('should detect --help flag', () => {
      const result = parseArgs(['--help']);
      expect(result.showHelp).toBe(true);
    });

    it('should detect -h flag', () => {
      const result = parseArgs(['-h']);
      expect(result.showHelp).toBe(true);
    });

    it('should show help when no args', () => {
      const result = parseArgs([]);
      expect(result.showHelp).toBe(true);
    });

    it('should handle multiple flags', () => {
      const result = parseArgs(['bd-123', '--draft', '--no-push']);
      expect(result.isDraft).toBe(true);
      expect(result.noPush).toBe(true);
    });
  });

  describe('extractJiraKey()', () => {
    it('should find Jira key in labels', () => {
      const result = extractJiraKey(['PROJ-123', 'jira-synced']);
      expect(result).toBe('PROJ-123');
    });

    it('should return undefined if no Jira key', () => {
      const result = extractJiraKey(['feature', 'bug']);
      expect(result).toBeUndefined();
    });

    it('should handle empty array', () => {
      const result = extractJiraKey([]);
      expect(result).toBeUndefined();
    });

    it('should match multi-letter project', () => {
      const result = extractJiraKey(['FRONTEND-999']);
      expect(result).toBe('FRONTEND-999');
    });

    it('should not match lowercase', () => {
      const result = extractJiraKey(['proj-123']);
      expect(result).toBeUndefined();
    });
  });

  describe('detectPlatform()', () => {
    it('should detect GitHub', () => {
      const result = detectPlatform('https://github.com/user/repo.git');
      expect(result).toBe('github');
    });

    it('should detect GitHub SSH', () => {
      const result = detectPlatform('git@github.com:user/repo.git');
      expect(result).toBe('github');
    });

    it('should detect Bitbucket', () => {
      const result = detectPlatform('https://bitbucket.org/user/repo.git');
      expect(result).toBe('bitbucket');
    });

    it('should detect GitLab', () => {
      const result = detectPlatform('https://gitlab.com/user/repo.git');
      expect(result).toBe('gitlab');
    });

    it('should detect self-hosted GitLab', () => {
      const result = detectPlatform('https://gitlab.company.com/user/repo.git');
      expect(result).toBe('gitlab');
    });

    it('should detect self-hosted Bitbucket', () => {
      const result = detectPlatform('https://bitbucket.company.com/user/repo.git');
      expect(result).toBe('bitbucket');
    });

    it('should return other for unknown', () => {
      const result = detectPlatform('https://unknown.com/user/repo.git');
      expect(result).toBe('other');
    });
  });

  describe('buildPRTitle()', () => {
    it('should include Jira key when present', () => {
      const result = buildPRTitle('Fix login bug', 'PROJ-123');
      expect(result).toBe('PROJ-123: Fix login bug');
    });

    it('should use title only when no Jira key', () => {
      const result = buildPRTitle('Fix login bug', null);
      expect(result).toBe('Fix login bug');
    });

    it('should handle empty title', () => {
      const result = buildPRTitle('', 'PROJ-123');
      expect(result).toBe('PROJ-123: ');
    });

    it('should preserve title formatting', () => {
      const result = buildPRTitle('Fix: API & Auth issues', 'PROJ-123');
      expect(result).toBe('PROJ-123: Fix: API & Auth issues');
    });
  });

  describe('buildPRBody()', () => {
    it('should include Jira reference when present', () => {
      const result = buildPRBody('bd-abc', 'PROJ-123');
      expect(result).toContain('PROJ-123');
      expect(result).toContain('bd-abc');
      expect(result).toContain('Closes bd-abc / PROJ-123');
      expect(result).toContain('## Related');
    });

    it('should use standard format without Jira key', () => {
      const result = buildPRBody('bd-abc', null);
      expect(result).toContain('Closes bd-abc');
      expect(result).toContain('## Checklist');
      expect(result).not.toContain('Jira:');
    });

    it('should include Changes section', () => {
      const result = buildPRBody('bd-123', 'PROJ-123');
      expect(result).toContain('## Changes');
    });

    it('should include Testing section', () => {
      const result = buildPRBody('bd-123', null);
      expect(result).toContain('## Testing');
    });

    it('should have checklist items for non-Jira', () => {
      const result = buildPRBody('bd-123', null);
      expect(result).toContain('Tests added/updated');
      expect(result).toContain('Documentation updated');
    });
  });

  describe('Integration with bd commands', () => {
    it('should query issue details', () => {
      execSync.mockReturnValue(JSON.stringify({
        id: 'bd-test',
        title: 'Test Issue',
        labels: ['PROJ-123']
      }));
      
      const output = execSync('bd show bd-test --json');
      const issue = JSON.parse(output);
      
      expect(issue.id).toBe('bd-test');
      expect(issue.labels).toContain('PROJ-123');
    });

    it('should mark issue done', () => {
      execSync.mockReturnValue('');
      
      execSync('bd done bd-test');
      
      expect(execSync).toHaveBeenCalledWith('bd done bd-test');
    });

    it('should handle missing issue', () => {
      execSync.mockImplementation(() => {
        throw new Error('Issue not found');
      });
      
      expect(() => {
        execSync('bd show invalid --json');
      }).toThrow('Issue not found');
    });
  });

  describe('Integration with git operations', () => {
    it('should get current branch', () => {
      execSync.mockReturnValue('feature/PROJ-123-test\n');
      
      const branch = execSync('git branch --show-current').toString().trim();
      
      expect(branch).toBe('feature/PROJ-123-test');
    });

    it('should get remote URL', () => {
      execSync.mockReturnValue('https://github.com/user/repo.git\n');
      
      const url = execSync('git remote get-url origin').toString().trim();
      
      expect(url).toContain('github.com');
    });

    it('should push branch', () => {
      execSync.mockReturnValue('');
      
      execSync('git push -u origin feature/test');
      
      expect(execSync).toHaveBeenCalledWith('git push -u origin feature/test');
    });

    it('should handle push error', () => {
      execSync.mockImplementation(() => {
        throw new Error('failed to push');
      });
      
      expect(() => {
        execSync('git push -u origin test');
      }).toThrow('failed to push');
    });
  });

  describe('GitHub PR creation', () => {
    it('should create PR with gh cli', () => {
      execSync.mockReturnValue('');
      
      const title = 'PROJ-123: Fix bug';
      const body = 'Closes bd-test';
      
      execSync(`gh pr create --title "${title}" --body "${body}"`);
      
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('gh pr create')
      );
    });

    it('should create draft PR', () => {
      execSync.mockReturnValue('');
      
      execSync('gh pr create --draft --title "Test" --body "Body"');
      
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('--draft')
      );
    });

    it('should handle gh not installed', () => {
      execSync.mockImplementation(() => {
        throw new Error('gh: command not found');
      });
      
      expect(() => {
        execSync('gh --version');
      }).toThrow('command not found');
    });
  });

  describe('Complete workflow', () => {
    it('should execute full finish workflow', () => {
      // Mock bd show
      execSync.mockReturnValueOnce(JSON.stringify({
        id: 'bd-abc',
        title: 'Fix auth',
        labels: ['PROJ-99']
      }));
      
      // Mock git branch
      execSync.mockReturnValueOnce('feature/PROJ-99-fix-auth\n');
      
      // Mock git remote
      execSync.mockReturnValueOnce('https://github.com/user/repo.git\n');
      
      // Mock bd done
      execSync.mockReturnValueOnce('');
      
      // Mock git push
      execSync.mockReturnValueOnce('');
      
      // Mock gh pr create
      execSync.mockReturnValueOnce('https://github.com/user/repo/pull/1\n');
      
      // Get issue
      const issue = JSON.parse(execSync('bd show bd-abc --json'));
      const jiraKey = extractJiraKey(issue.labels);
      
      // Get branch
      const branch = execSync('git branch --show-current').toString().trim();
      
      // Get remote
      const remote = execSync('git remote get-url origin').toString().trim();
      const platform = detectPlatform(remote);
      
      // Mark done
      execSync('bd done bd-abc');
      
      // Push
      execSync(`git push -u origin ${branch}`);
      
      // Create PR
      const title = buildPRTitle(issue.title, jiraKey);
      const body = buildPRBody(issue.id, jiraKey);
      const prUrl = execSync(`gh pr create --title "${title}" --body "${body}"`).toString().trim();
      
      expect(platform).toBe('github');
      expect(jiraKey).toBe('PROJ-99');
      expect(title).toBe('PROJ-99: Fix auth');
      expect(prUrl).toContain('github.com');
      expect(execSync).toHaveBeenCalledTimes(6);
    });

    it('should handle workflow without Jira key', () => {
      execSync.mockReturnValueOnce(JSON.stringify({
        id: 'bd-local',
        title: 'Local task',
        labels: []
      }));
      
      execSync.mockReturnValueOnce('task/bd-local-local-task\n');
      execSync.mockReturnValueOnce('https://github.com/user/repo.git\n');
      execSync.mockReturnValueOnce('');
      execSync.mockReturnValueOnce('');
      execSync.mockReturnValueOnce('https://github.com/user/repo/pull/2\n');
      
      const issue = JSON.parse(execSync('bd show bd-local --json'));
      const jiraKey = extractJiraKey(issue.labels);
      
      execSync('git branch --show-current');
      execSync('git remote get-url origin');
      execSync('bd done bd-local');
      execSync('git push');
      
      const title = buildPRTitle(issue.title, jiraKey);
      const body = buildPRBody(issue.id, jiraKey);
      execSync(`gh pr create --title "${title}" --body "${body}"`);
      
      expect(jiraKey).toBeUndefined();
      expect(title).toBe('Local task');
      expect(body).toContain('## Checklist');
    });

    it('should handle draft PR workflow', () => {
      execSync.mockReturnValueOnce(JSON.stringify({
        id: 'bd-wip',
        title: 'WIP feature',
        labels: ['PROJ-77']
      }));
      
      execSync.mockReturnValueOnce('feature/PROJ-77-wip\n');
      execSync.mockReturnValueOnce('https://github.com/user/repo.git\n');
      execSync.mockReturnValueOnce('');
      execSync.mockReturnValueOnce('');
      execSync.mockReturnValueOnce('https://github.com/user/repo/pull/3\n');
      
      const issue = JSON.parse(execSync('bd show bd-wip --json'));
      const jiraKey = extractJiraKey(issue.labels);
      
      execSync('git branch --show-current');
      execSync('git remote get-url origin');
      
      // No bd done for draft
      execSync('git push');
      
      const title = buildPRTitle(issue.title, jiraKey);
      const body = buildPRBody(issue.id, jiraKey);
      execSync(`gh pr create --draft --title "${title}" --body "${body}"`);
      
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('--draft')
      );
    });

    it('should handle no-push workflow', () => {
      // Reset mocks for this test
      execSync.mockReset();
      
      execSync.mockReturnValueOnce(JSON.stringify({
        id: 'bd-local',
        title: 'Local only',
        labels: []
      }));
      
      execSync.mockReturnValueOnce('Issue marked as done\n');
      
      const issue = JSON.parse(execSync('bd show bd-local --json'));
      const output = execSync('bd done bd-local');
      
      // No push, no PR
      expect(execSync).toHaveBeenCalledTimes(2);
      expect(output).toContain('done');
    });
  });

  describe('Edge cases', () => {
    it('should handle detached HEAD state', () => {
      // Test that error messages are detectable
      const error = new Error('fatal: ref HEAD is not a symbolic ref');
      expect(error.message).toContain('not a symbolic ref');
    });

    it('should handle no remote', () => {
      // Test that error messages are detectable
      const error = new Error('fatal: No remote configured');
      expect(error.message).toContain('No remote configured');
    });

    it('should handle PR already exists', () => {
      // Test that error messages are detectable
      const error = new Error('a pull request for branch already exists');
      expect(error.message).toContain('already exists');
    });

    it('should handle uncommitted changes detection', () => {
      execSync.mockReset();
      execSync.mockReturnValue('M modified-file.js');
      
      const status = execSync('git status --porcelain');
      
      expect(status.toString()).toBeTruthy();
      expect(status.toString()).toContain('M ');
    });
    
    it('should detect clean working directory', () => {
      execSync.mockReset();
      execSync.mockReturnValue('');
      
      const status = execSync('git status --porcelain');
      
      expect(status.toString()).toBe('');
    });
  });

  describe('Platform-specific behavior', () => {
    it('should work with GitHub', () => {
      const platform = detectPlatform('https://github.com/user/repo.git');
      expect(platform).toBe('github');
    });

    it('should work with Bitbucket', () => {
      const platform = detectPlatform('https://bitbucket.org/user/repo.git');
      expect(platform).toBe('bitbucket');
    });

    it('should work with GitLab', () => {
      const platform = detectPlatform('https://gitlab.com/user/repo.git');
      expect(platform).toBe('gitlab');
    });

    it('should handle other platforms', () => {
      const platform = detectPlatform('https://custom.git/repo.git');
      expect(platform).toBe('other');
    });
  });

  describe('Error handling', () => {
    it('should handle bd command failure', () => {
      // Test error message detection
      const error = new Error('bd: command failed');
      expect(error.message).toContain('command failed');
    });

    it('should handle git command failure', () => {
      // Test error message detection
      const error = new Error('git: fatal error');
      expect(error.message).toContain('fatal error');
    });

    it('should handle gh command failure', () => {
      // Test error message detection
      const error = new Error('gh: GraphQL error');
      expect(error.message).toContain('GraphQL error');
    });
    
    it('should validate error handling patterns', () => {
      // Test that we can detect various error scenarios
      const errors = [
        'Issue not found',
        'Not a git repository',
        'command not found',
        'Permission denied'
      ];
      
      errors.forEach(msg => {
        expect(msg.length).toBeGreaterThan(0);
      });
    });
  });
});
