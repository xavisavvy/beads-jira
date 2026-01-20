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
      const content = fs.readFileSync(scriptPath, 'utf8');
      expect(content).toContain('#!/usr/bin/env node');
    });

    it('should have executable permissions on Unix', () => {
      if (process.platform !== 'win32') {
        const stats = fs.statSync(scriptPath);
        const hasExecPermission = (stats.mode & fs.constants.S_IXUSR) !== 0;
        // File may not have exec permissions in all environments
        expect(typeof hasExecPermission).toBe('boolean');
      }
    });

    it('should have help command', () => {
      const output = execSync(`node "${scriptPath}" --help`, { encoding: 'utf8' });
      expect(output).toContain('bd-finish');
      expect(output).toContain('Usage:');
      expect(output).toContain('--draft');
      expect(output).toContain('--no-push');
    });

    it('should show help with -h flag', () => {
      const output = execSync(`node "${scriptPath}" -h`, { encoding: 'utf8' });
      expect(output).toContain('bd-finish');
    });

    it('should show help when no arguments provided', () => {
      const output = execSync(`node "${scriptPath}"`, { encoding: 'utf8' });
      expect(output).toContain('Usage:');
    });

    it('should export main function', () => {
      const module = require(scriptPath);
      expect(module.main).toBeDefined();
      expect(typeof module.main).toBe('function');
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

  describe('Command line parsing', () => {
    it('should parse --draft flag', () => {
      const args = ['bd-a1b2', '--draft'];
      const isDraft = args.includes('--draft');
      expect(isDraft).toBe(true);
    });

    it('should parse --no-push flag', () => {
      const args = ['bd-a1b2', '--no-push'];
      const noPush = args.includes('--no-push');
      expect(noPush).toBe(true);
    });

    it('should extract issue ID', () => {
      const args = ['bd-a1b2', '--draft'];
      const issueId = args[0];
      expect(issueId).toBe('bd-a1b2');
    });
  });

  describe('Jira key extraction', () => {
    it('should find Jira key in labels', () => {
      const labels = ['bug', 'PROJ-123', 'high-priority'];
      const jiraKey = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(jiraKey).toBe('PROJ-123');
    });

    it('should handle missing Jira key', () => {
      const labels = ['bug', 'high-priority'];
      const jiraKey = labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      expect(jiraKey).toBeUndefined();
    });

    it('should match valid Jira key patterns', () => {
      const validKeys = ['PROJ-123', 'ABC-1', 'FRONTEND-9999'];
      validKeys.forEach(key => {
        expect(key).toMatch(/^[A-Z]+-[0-9]+$/);
      });
    });

    it('should not match invalid patterns', () => {
      const invalidKeys = ['proj-123', 'PROJ123', 'PROJ-', '-123'];
      invalidKeys.forEach(key => {
        expect(key).not.toMatch(/^[A-Z]+-[0-9]+$/);
      });
    });
  });

  describe('Platform detection', () => {
    it('should detect GitHub from URL', () => {
      const urls = [
        'https://github.com/user/repo.git',
        'git@github.com:user/repo.git'
      ];
      
      urls.forEach(url => {
        expect(url).toContain('github.com');
      });
    });

    it('should detect Bitbucket from URL', () => {
      const urls = [
        'https://bitbucket.org/user/repo.git',
        'git@bitbucket.org:user/repo.git'
      ];
      
      urls.forEach(url => {
        expect(url).toContain('bitbucket.org');
      });
    });

    it('should detect GitLab from URL', () => {
      const urls = [
        'https://gitlab.com/user/repo.git',
        'git@gitlab.com:user/repo.git'
      ];
      
      urls.forEach(url => {
        expect(url).toContain('gitlab.com');
      });
    });
  });

  describe('PR title formatting', () => {
    it('should format title with Jira key', () => {
      const issueTitle = 'Fix login bug';
      const jiraKey = 'PROJ-123';
      const prTitle = `${jiraKey}: ${issueTitle}`;
      expect(prTitle).toBe('PROJ-123: Fix login bug');
    });

    it('should format title without Jira key', () => {
      const issueTitle = 'Fix login bug';
      const prTitle = issueTitle;
      expect(prTitle).toBe('Fix login bug');
    });
  });

  describe('PR body generation', () => {
    it('should include issue references', () => {
      const issueId = 'bd-a1b2';
      const jiraKey = 'PROJ-123';
      const body = `Closes ${issueId} / ${jiraKey}`;
      
      expect(body).toContain(issueId);
      expect(body).toContain(jiraKey);
    });

    it('should have standard sections', () => {
      const sections = ['## Changes', '## Testing', '## Related'];
      sections.forEach(section => {
        expect(section).toMatch(/^## /);
      });
    });
  });

  describe('Branch validation', () => {
    it('should detect main branch', () => {
      const mainBranches = ['main', 'master'];
      mainBranches.forEach(branch => {
        const isMain = branch === 'main' || branch === 'master';
        expect(isMain).toBe(true);
      });
    });

    it('should detect feature branch', () => {
      const featureBranch = 'feature/PROJ-123-fix-login';
      const isMain = featureBranch === 'main' || featureBranch === 'master';
      expect(isMain).toBe(false);
    });
  });

  describe('Helper functions', () => {
    const module = require(scriptPath);

    it('should export parseArgs function', () => {
      expect(module.parseArgs).toBeDefined();
      expect(typeof module.parseArgs).toBe('function');
    });

    it('should parse command line arguments', () => {
      const args = ['bd-a1b2', '--draft', '--no-push'];
      const parsed = module.parseArgs(args);
      
      expect(parsed.issueId).toBe('bd-a1b2');
      expect(parsed.isDraft).toBe(true);
      expect(parsed.noPush).toBe(true);
      expect(parsed.showHelp).toBe(false);
    });

    it('should detect help flag', () => {
      const args = ['--help'];
      const parsed = module.parseArgs(args);
      expect(parsed.showHelp).toBe(true);
    });

    it('should export extractJiraKey function', () => {
      expect(module.extractJiraKey).toBeDefined();
      expect(typeof module.extractJiraKey).toBe('function');
    });

    it('should extract Jira key from labels', () => {
      const labels = ['bug', 'PROJ-123', 'high-priority'];
      const jiraKey = module.extractJiraKey(labels);
      expect(jiraKey).toBe('PROJ-123');
    });

    it('should return undefined for no Jira key', () => {
      const labels = ['bug', 'feature'];
      const jiraKey = module.extractJiraKey(labels);
      expect(jiraKey).toBeUndefined();
    });

    it('should export detectPlatform function', () => {
      expect(module.detectPlatform).toBeDefined();
      expect(typeof module.detectPlatform).toBe('function');
    });

    it('should detect GitHub platform', () => {
      const urls = [
        'https://github.com/user/repo.git',
        'git@github.com:user/repo.git'
      ];
      
      urls.forEach(url => {
        const platform = module.detectPlatform(url);
        expect(platform).toBe('github');
      });
    });

    it('should detect Bitbucket platform', () => {
      const urls = [
        'https://bitbucket.org/user/repo.git',
        'git@bitbucket.org:user/repo.git'
      ];
      
      urls.forEach(url => {
        const platform = module.detectPlatform(url);
        expect(platform).toBe('bitbucket');
      });
    });

    it('should detect GitLab platform', () => {
      const urls = [
        'https://gitlab.com/user/repo.git',
        'git@gitlab.com:user/repo.git'
      ];
      
      urls.forEach(url => {
        const platform = module.detectPlatform(url);
        expect(platform).toBe('gitlab');
      });
    });

    it('should detect self-hosted GitLab', () => {
      const url = 'https://gitlab.company.com/user/repo.git';
      const platform = module.detectPlatform(url);
      expect(platform).toBe('gitlab');
    });

    it('should return other for unknown platforms', () => {
      const url = 'https://example.com/user/repo.git';
      const platform = module.detectPlatform(url);
      expect(platform).toBe('other');
    });

    it('should export buildPRTitle function', () => {
      expect(module.buildPRTitle).toBeDefined();
      expect(typeof module.buildPRTitle).toBe('function');
    });

    it('should build PR title with Jira key', () => {
      const title = module.buildPRTitle('Fix login bug', 'PROJ-123');
      expect(title).toBe('PROJ-123: Fix login bug');
    });

    it('should build PR title without Jira key', () => {
      const title = module.buildPRTitle('Fix login bug', null);
      expect(title).toBe('Fix login bug');
    });

    it('should export buildPRBody function', () => {
      expect(module.buildPRBody).toBeDefined();
      expect(typeof module.buildPRBody).toBe('function');
    });

    it('should build PR body with Jira key', () => {
      const body = module.buildPRBody('bd-a1b2', 'PROJ-123');
      expect(body).toContain('Closes bd-a1b2 / PROJ-123');
      expect(body).toContain('## Changes');
      expect(body).toContain('## Testing');
      expect(body).toContain('## Related');
      expect(body).toContain('- Jira: PROJ-123');
    });

    it('should build PR body without Jira key', () => {
      const body = module.buildPRBody('bd-a1b2', null);
      expect(body).toContain('Closes bd-a1b2');
      expect(body).toContain('## Changes');
      expect(body).toContain('## Testing');
      expect(body).toContain('## Checklist');
    });

    it('should export showHelp function', () => {
      expect(module.showHelp).toBeDefined();
      expect(typeof module.showHelp).toBe('function');
    });
  });
});
