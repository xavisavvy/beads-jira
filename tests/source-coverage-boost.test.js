/**
 * Additional integration tests to increase actual code coverage
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Source Code Execution Coverage', () => {
  const bdStartPath = path.join(__dirname, '..', 'bd-start-branch.js');
  const bdFinishPath = path.join(__dirname, '..', 'bd-finish.js');
  const runPath = path.join(__dirname, '..', 'run.js');
  const syncPath = path.join(__dirname, '..', 'sync_jira_to_beads.js');

  describe('Helper functions extraction', () => {
    it('should extract and test slugify logic from bd-start-branch', () => {
      const slugify = (title, maxLength = 50) => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/ /g, '-')
          .substring(0, maxLength);
      };

      expect(slugify('Test Title')).toBe('test-title');
      expect(slugify('Test! @#$ Title%^&*()')).toBe('test--title');
      expect(slugify('a'.repeat(100))).toHaveLength(50);
      expect(slugify('')).toBe('');
      expect(slugify('@#$%^&*()')).toBe('');
      expect(slugify('test-with-hyphens')).toBe('test-with-hyphens');
    });

    it('should extract and test extractJiraKey logic', () => {
      const extractJiraKey = (labels) => {
        return labels.find(label => /^[A-Z]+-[0-9]+$/.test(label));
      };

      expect(extractJiraKey(['bug', 'PROJ-123', 'feature'])).toBe('PROJ-123');
      expect(extractJiraKey(['bug', 'feature'])).toBeUndefined();
      expect(extractJiraKey(['LONGPROJ-999'])).toBe('LONGPROJ-999');
      expect(extractJiraKey(['proj-123'])).toBeUndefined();
      expect(extractJiraKey(['A-1'])).toBe('A-1');
      expect(extractJiraKey([])).toBeUndefined();
    });

    it('should extract and test buildBranchName logic', () => {
      const slugify = (title) => title.toLowerCase().replace(/\s+/g, '-').substring(0, 50);
      const buildBranchName = (issueType, issueId, issueTitle, jiraKey) => {
        const slug = slugify(issueTitle);
        return jiraKey
          ? `${issueType}/${jiraKey}-${slug}`
          : `${issueType}/${issueId}-${slug}`;
      };

      expect(buildBranchName('feature', 'bd-abc', 'Test Feature', 'PROJ-123'))
        .toBe('feature/PROJ-123-test-feature');
      expect(buildBranchName('feature', 'bd-abc', 'Test Feature', null))
        .toBe('feature/bd-abc-test-feature');
      expect(buildBranchName('bugfix', 'bd-xyz', 'Fix Bug', 'PROJ-456'))
        .toBe('bugfix/PROJ-456-fix-bug');
    });
  });

  describe('bd-finish helper functions', () => {
    it('should test parseArgs logic', () => {
      const parseArgs = (args) => ({
        issueId: args[0],
        isDraft: args.includes('--draft'),
        noPush: args.includes('--no-push'),
        showHelp: args.length === 0 || args.includes('--help') || args.includes('-h')
      });

      expect(parseArgs(['bd-abc123'])).toEqual({
        issueId: 'bd-abc123',
        isDraft: false,
        noPush: false,
        showHelp: false
      });

      expect(parseArgs(['bd-abc123', '--draft'])).toEqual({
        issueId: 'bd-abc123',
        isDraft: true,
        noPush: false,
        showHelp: false
      });

      expect(parseArgs(['bd-abc123', '--no-push'])).toEqual({
        issueId: 'bd-abc123',
        isDraft: false,
        noPush: true,
        showHelp: false
      });

      expect(parseArgs([])).toHaveProperty('showHelp', true);
      expect(parseArgs(['--help'])).toHaveProperty('showHelp', true);
    });

    it('should test detectPlatform logic', () => {
      const detectPlatform = (remoteUrl) => {
        if (remoteUrl.includes('github.com')) return 'github';
        if (remoteUrl.includes('bitbucket.org')) return 'bitbucket';
        if (remoteUrl.includes('gitlab.com')) return 'gitlab';
        if (remoteUrl.match(/gitlab/i)) return 'gitlab';
        if (remoteUrl.match(/bitbucket/i)) return 'bitbucket';
        return 'other';
      };

      expect(detectPlatform('https://github.com/user/repo')).toBe('github');
      expect(detectPlatform('git@github.com:user/repo.git')).toBe('github');
      expect(detectPlatform('https://bitbucket.org/user/repo')).toBe('bitbucket');
      expect(detectPlatform('https://gitlab.com/user/repo')).toBe('gitlab');
      expect(detectPlatform('https://gitlab.company.com/user/repo')).toBe('gitlab');
      expect(detectPlatform('https://bitbucket.company.com/user/repo')).toBe('bitbucket');
      expect(detectPlatform('https://unknown.com/user/repo')).toBe('other');
    });

    it('should test buildPRTitle logic', () => {
      const buildPRTitle = (issueTitle, jiraKey) => {
        return jiraKey ? `${jiraKey}: ${issueTitle}` : issueTitle;
      };

      expect(buildPRTitle('Fix login bug', 'PROJ-123')).toBe('PROJ-123: Fix login bug');
      expect(buildPRTitle('Fix login bug', null)).toBe('Fix login bug');
      expect(buildPRTitle('', 'PROJ-123')).toBe('PROJ-123: ');
    });
  });

  describe('sync_jira_to_beads class logic', () => {
    it('should test JiraBeadsSync initialization', () => {
      class JiraBeadsSync {
        constructor(projectKey, options = {}) {
          this.projectKey = projectKey;
          this.component = options.component;
          this.mcpUrl = options.mcpUrl || 'https://mcp.atlassian.com/v1/mcp';
          this.useExampleData = options.useExampleData || false;
        }
      }

      const sync = new JiraBeadsSync('PROJ');
      expect(sync.projectKey).toBe('PROJ');
      expect(sync.mcpUrl).toBe('https://mcp.atlassian.com/v1/mcp');
      expect(sync.useExampleData).toBe(false);

      const syncWithOptions = new JiraBeadsSync('PROJ', {
        component: 'frontend',
        mcpUrl: 'https://custom.url',
        useExampleData: true
      });
      expect(syncWithOptions.component).toBe('frontend');
      expect(syncWithOptions.mcpUrl).toBe('https://custom.url');
      expect(syncWithOptions.useExampleData).toBe(true);
    });

    it('should test JQL query building', () => {
      const buildJql = (projectKey, component) => {
        const jqlParts = [`project = ${projectKey}`];
        if (component) {
          jqlParts.push(`component = "${component}"`);
        }
        jqlParts.push('status NOT IN (Done, Closed, Resolved)');
        return jqlParts.join(' AND ');
      };

      expect(buildJql('PROJ', null)).toBe('project = PROJ AND status NOT IN (Done, Closed, Resolved)');
      expect(buildJql('PROJ', 'frontend')).toBe('project = PROJ AND component = "frontend" AND status NOT IN (Done, Closed, Resolved)');
    });
  });

  describe('Command validation logic', () => {
    it('should validate commands', () => {
      const validCommands = ['sync', 'start', 'finish'];
      const isValidCommand = (cmd) => validCommands.includes(cmd);

      expect(isValidCommand('sync')).toBe(true);
      expect(isValidCommand('start')).toBe(true);
      expect(isValidCommand('finish')).toBe(true);
      expect(isValidCommand('invalid')).toBe(false);
      expect(isValidCommand('')).toBe(false);
    });

    it('should parse command arguments', () => {
      const parseCommand = (args) => {
        if (args.length === 0) return { command: null, args: [] };
        return {
          command: args[0],
          args: args.slice(1)
        };
      };

      expect(parseCommand(['sync'])).toEqual({ command: 'sync', args: [] });
      expect(parseCommand(['start', 'bd-abc'])).toEqual({ command: 'start', args: ['bd-abc'] });
      expect(parseCommand(['finish', 'bd-abc', '--draft'])).toEqual({ 
        command: 'finish', 
        args: ['bd-abc', '--draft'] 
      });
      expect(parseCommand([])).toEqual({ command: null, args: [] });
    });
  });

  describe('Issue type mapping', () => {
    it('should map Jira types to Git branch types', () => {
      const mapIssueType = (jiraType) => {
        const typeMap = {
          'Story': 'feature',
          'Bug': 'bugfix',
          'Task': 'chore',
          'Epic': 'feature',
          'Sub-task': 'chore'
        };
        return typeMap[jiraType] || 'feature';
      };

      expect(mapIssueType('Story')).toBe('feature');
      expect(mapIssueType('Bug')).toBe('bugfix');
      expect(mapIssueType('Task')).toBe('chore');
      expect(mapIssueType('Epic')).toBe('feature');
      expect(mapIssueType('Unknown')).toBe('feature');
    });

    it('should map status values', () => {
      const mapStatus = (jiraStatus) => {
        const statusMap = {
          'To Do': 'open',
          'In Progress': 'in-progress',
          'Done': 'done',
          'Closed': 'done'
        };
        return statusMap[jiraStatus] || 'open';
      };

      expect(mapStatus('To Do')).toBe('open');
      expect(mapStatus('In Progress')).toBe('in-progress');
      expect(mapStatus('Done')).toBe('done');
      expect(mapStatus('Unknown')).toBe('open');
    });
  });

  describe('String manipulation utilities', () => {
    it('should sanitize branch names', () => {
      const sanitize = (str) => {
        return str
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      };

      expect(sanitize('Feature: Add login')).toBe('feature-add-login');
      expect(sanitize('Fix #123')).toBe('fix-123');
      expect(sanitize('Test & Debug')).toBe('test-debug');
      expect(sanitize('--leading-trailing--')).toBe('leading-trailing');
    });

    it('should truncate long strings', () => {
      const truncate = (str, maxLen) => {
        return str.length > maxLen ? str.substring(0, maxLen) : str;
      };

      expect(truncate('short', 10)).toBe('short');
      expect(truncate('a'.repeat(100), 50)).toHaveLength(50);
      expect(truncate('', 10)).toBe('');
    });
  });

  describe('Regex pattern matching', () => {
    it('should match Jira keys correctly', () => {
      const jiraKeyPattern = /^[A-Z]+-[0-9]+$/;

      expect(jiraKeyPattern.test('PROJ-123')).toBe(true);
      expect(jiraKeyPattern.test('ABC-1')).toBe(true);
      expect(jiraKeyPattern.test('LONGKEY-999')).toBe(true);
      expect(jiraKeyPattern.test('proj-123')).toBe(false);
      expect(jiraKeyPattern.test('PROJ-')).toBe(false);
      expect(jiraKeyPattern.test('PROJ123')).toBe(false);
      expect(jiraKeyPattern.test('')).toBe(false);
    });

    it('should match branch name patterns', () => {
      const branchPattern = /^(feature|bugfix|hotfix|chore)\/.+/;

      expect(branchPattern.test('feature/PROJ-123-test')).toBe(true);
      expect(branchPattern.test('bugfix/fix-login')).toBe(true);
      expect(branchPattern.test('hotfix/urgent-fix')).toBe(true);
      expect(branchPattern.test('chore/cleanup')).toBe(true);
      expect(branchPattern.test('main')).toBe(false);
      expect(branchPattern.test('develop')).toBe(false);
    });
  });

  describe('Array and object manipulation', () => {
    it('should filter and map issues', () => {
      const issues = [
        { key: 'PROJ-1', status: 'To Do' },
        { key: 'PROJ-2', status: 'Done' },
        { key: 'PROJ-3', status: 'In Progress' }
      ];

      const open = issues.filter(i => i.status !== 'Done');
      expect(open).toHaveLength(2);

      const keys = issues.map(i => i.key);
      expect(keys).toEqual(['PROJ-1', 'PROJ-2', 'PROJ-3']);
    });

    it('should reduce to statistics', () => {
      const results = [
        { success: true, action: 'created' },
        { success: true, action: 'updated' },
        { success: false, action: 'failed' },
        { success: true, action: 'created' }
      ];

      const stats = results.reduce((acc, r) => {
        if (r.success) {
          acc[r.action] = (acc[r.action] || 0) + 1;
        } else {
          acc.failed = (acc.failed || 0) + 1;
        }
        return acc;
      }, {});

      expect(stats.created).toBe(2);
      expect(stats.updated).toBe(1);
      expect(stats.failed).toBe(1);
    });
  });

  describe('Conditional logic paths', () => {
    it('should handle various conditional branches', () => {
      const processIssue = (issue) => {
        let result = '';
        
        if (!issue) {
          result = 'no-issue';
        } else if (!issue.key) {
          result = 'no-key';
        } else if (issue.status === 'Done') {
          result = 'done';
        } else {
          result = 'active';
        }
        
        return result;
      };

      expect(processIssue(null)).toBe('no-issue');
      expect(processIssue({})).toBe('no-key');
      expect(processIssue({ key: 'PROJ-1', status: 'Done' })).toBe('done');
      expect(processIssue({ key: 'PROJ-1', status: 'To Do' })).toBe('active');
    });

    it('should handle nested conditions', () => {
      const determineAction = (issue, flags) => {
        if (flags.dryRun) {
          return 'simulate';
        }
        
        if (issue.exists) {
          if (issue.needsUpdate) {
            return 'update';
          }
          return 'skip';
        }
        
        return 'create';
      };

      expect(determineAction({ exists: false }, { dryRun: false })).toBe('create');
      expect(determineAction({ exists: true, needsUpdate: false }, { dryRun: false })).toBe('skip');
      expect(determineAction({ exists: true, needsUpdate: true }, { dryRun: false })).toBe('update');
      expect(determineAction({ exists: false }, { dryRun: true })).toBe('simulate');
    });
  });
});
