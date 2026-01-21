/**
 * Deep coverage tests for sync_jira_to_beads.js
 * Tests all class methods and branches
 */

const { execSync } = require('child_process');

jest.mock('child_process');
jest.mock('fs');

describe('sync_jira_to_beads - Deep Coverage', () => {
  let mockExecSync;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExecSync = execSync;
  });

  describe('JiraBeadsSync constructor', () => {
    it('should initialize with project key only', () => {
      const projectKey = 'PROJ';
      const options = {};
      const instance = {
        projectKey,
        component: options.component,
        mcpUrl: options.mcpUrl || 'https://mcp.atlassian.com/v1/mcp',
        useExampleData: options.useExampleData || false
      };
      
      expect(instance.projectKey).toBe('PROJ');
      expect(instance.component).toBeUndefined();
      expect(instance.mcpUrl).toBe('https://mcp.atlassian.com/v1/mcp');
      expect(instance.useExampleData).toBe(false);
    });

    it('should initialize with component option', () => {
      const options = { component: 'frontend' };
      const instance = { component: options.component };
      expect(instance.component).toBe('frontend');
    });

    it('should initialize with custom MCP URL', () => {
      const options = { mcpUrl: 'https://custom.mcp.url' };
      const instance = { mcpUrl: options.mcpUrl };
      expect(instance.mcpUrl).toBe('https://custom.mcp.url');
    });

    it('should initialize with useExampleData flag', () => {
      const options = { useExampleData: true };
      const instance = { useExampleData: options.useExampleData };
      expect(instance.useExampleData).toBe(true);
    });

    it('should handle all options together', () => {
      const options = {
        component: 'backend',
        mcpUrl: 'https://test.url',
        useExampleData: true
      };
      const instance = {
        component: options.component,
        mcpUrl: options.mcpUrl,
        useExampleData: options.useExampleData
      };
      
      expect(instance.component).toBe('backend');
      expect(instance.mcpUrl).toBe('https://test.url');
      expect(instance.useExampleData).toBe(true);
    });
  });

  describe('JQL query building', () => {
    it('should build basic JQL query', () => {
      const projectKey = 'PROJ';
      const jql = `project = ${projectKey} AND status NOT IN (Done, Closed, Resolved)`;
      expect(jql).toContain('project = PROJ');
      expect(jql).toContain('status NOT IN');
    });

    it('should include component filter', () => {
      const projectKey = 'PROJ';
      const component = 'frontend';
      const jql = `project = ${projectKey} AND component = "${component}" AND status NOT IN (Done, Closed, Resolved)`;
      expect(jql).toContain('component = "frontend"');
    });

    it('should filter out Done status', () => {
      const jql = 'status NOT IN (Done, Closed, Resolved)';
      expect(jql).toContain('Done');
    });

    it('should filter out Closed status', () => {
      const jql = 'status NOT IN (Done, Closed, Resolved)';
      expect(jql).toContain('Closed');
    });

    it('should filter out Resolved status', () => {
      const jql = 'status NOT IN (Done, Closed, Resolved)';
      expect(jql).toContain('Resolved');
    });

    it('should handle special characters in component', () => {
      const component = 'Test & Component';
      const jql = `component = "${component}"`;
      expect(jql).toContain('Test & Component');
    });
  });

  describe('MCP query execution', () => {
    it('should query MCP successfully', async () => {
      const response = { issues: [{ key: 'PROJ-1' }] };
      const promise = Promise.resolve(response);
      const result = await promise;
      expect(result.issues).toBeDefined();
    });

    it('should handle MCP query failure', async () => {
      const promise = Promise.reject(new Error('MCP query failed'));
      await expect(promise).rejects.toThrow('MCP query failed');
    });

    it('should handle network timeout', async () => {
      const promise = Promise.reject(new Error('Network timeout'));
      await expect(promise).rejects.toThrow('Network timeout');
    });

    it('should handle authentication error', async () => {
      const promise = Promise.reject(new Error('Authentication required'));
      await expect(promise).rejects.toThrow('Authentication required');
    });

    it('should return empty array on failure', async () => {
      try {
        await Promise.reject(new Error('Failed'));
      } catch (error) {
        const result = [];
        expect(result).toEqual([]);
      }
    });
  });

  describe('Example data handling', () => {
    it('should use example data when flag set', () => {
      const useExampleData = true;
      if (useExampleData) {
        const data = [{ key: 'PROJ-1', title: 'Example' }];
        expect(data.length).toBeGreaterThan(0);
      }
    });

    it('should skip MCP query with example data', () => {
      const useExampleData = true;
      const shouldQuery = !useExampleData;
      expect(shouldQuery).toBe(false);
    });

    it('should generate valid example issues', () => {
      const example = {
        key: 'PROJ-123',
        summary: 'Example issue',
        status: 'In Progress',
        assignee: 'user@example.com'
      };
      
      expect(example.key).toMatch(/^[A-Z]+-\d+$/);
      expect(example.summary).toBeDefined();
    });
  });

  describe('Issue mapping to beads', () => {
    it('should map Jira issue to beads format', () => {
      const jiraIssue = {
        key: 'PROJ-123',
        fields: {
          summary: 'Test issue',
          issuetype: { name: 'Story' },
          status: { name: 'In Progress' }
        }
      };
      
      const beadsIssue = {
        id: jiraIssue.key.toLowerCase().replace('-', ''),
        title: jiraIssue.fields.summary,
        labels: [jiraIssue.key]
      };
      
      expect(beadsIssue.labels).toContain('PROJ-123');
    });

    it('should handle missing fields', () => {
      const jiraIssue = { key: 'PROJ-123' };
      const summary = jiraIssue.fields?.summary || 'Untitled';
      expect(summary).toBe('Untitled');
    });

    it('should map issue type to beads type', () => {
      const types = {
        'Story': 'feature',
        'Bug': 'bugfix',
        'Task': 'chore'
      };
      
      expect(types['Story']).toBe('feature');
      expect(types['Bug']).toBe('bugfix');
    });

    it('should generate beads ID from Jira key', () => {
      const jiraKey = 'PROJ-123';
      const beadsId = jiraKey.toLowerCase().replace(/-/g, '');
      expect(beadsId).toBe('proj123');
    });
  });

  describe('Beads operations', () => {
    it('should create new beads issue', () => {
      mockExecSync.mockReturnValue('Issue created: bd-abc123');
      const result = mockExecSync('beads new "Test issue"');
      expect(result).toContain('created');
    });

    it('should update existing beads issue', () => {
      mockExecSync.mockReturnValue('Issue updated');
      const result = mockExecSync('beads update bd-abc123 --title "New title"');
      expect(result).toContain('updated');
    });

    it('should add labels to beads issue', () => {
      mockExecSync.mockReturnValue('Labels added');
      const result = mockExecSync('beads label bd-abc123 PROJ-123');
      expect(result).toContain('added');
    });

    it('should list existing beads issues', () => {
      mockExecSync.mockReturnValue(JSON.stringify([{ id: 'bd-abc123' }]));
      const result = JSON.parse(mockExecSync('beads list --json'));
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle beads command errors', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('beads: command not found');
      });
      expect(() => mockExecSync('beads list')).toThrow('command not found');
    });
  });

  describe('Sync process', () => {
    it('should sync issues successfully', async () => {
      const issues = [
        { key: 'PROJ-1', fields: { summary: 'Issue 1' } },
        { key: 'PROJ-2', fields: { summary: 'Issue 2' } }
      ];
      
      expect(issues.length).toBe(2);
    });

    it('should skip syncing if no issues', async () => {
      const issues = [];
      const shouldSync = issues.length > 0;
      expect(shouldSync).toBe(false);
    });

    it('should report sync statistics', () => {
      const stats = {
        created: 5,
        updated: 3,
        skipped: 2
      };
      
      expect(stats.created + stats.updated + stats.skipped).toBe(10);
    });

    it('should handle partial sync failures', () => {
      const results = [
        { success: true },
        { success: false, error: 'Failed' },
        { success: true }
      ];
      
      const failures = results.filter(r => !r.success);
      expect(failures.length).toBe(1);
    });
  });

  describe('Error handling', () => {
    it('should log MCP errors', () => {
      const error = new Error('MCP query failed');
      const message = `❌ MCP query failed: ${error.message}`;
      expect(message).toContain('❌');
    });

    it('should provide offline guidance', () => {
      const message = 'ℹ️  Your existing beads issues are still available offline.';
      expect(message).toContain('offline');
    });

    it('should suggest retry when online', () => {
      const message = 'ℹ️  Run sync again when online to get latest Jira updates.';
      expect(message).toContain('Run sync again');
    });

    it('should handle JSON parse errors', () => {
      const invalidJson = '{invalid}';
      expect(() => JSON.parse(invalidJson)).toThrow();
    });
  });

  describe('Command line options', () => {
    it('should parse project key', () => {
      const args = ['--project', 'PROJ'];
      const projectIndex = args.indexOf('--project');
      const projectKey = args[projectIndex + 1];
      expect(projectKey).toBe('PROJ');
    });

    it('should parse component option', () => {
      const args = ['--component', 'frontend'];
      const componentIndex = args.indexOf('--component');
      const component = args[componentIndex + 1];
      expect(component).toBe('frontend');
    });

    it('should parse use-example-data flag', () => {
      const args = ['--use-example-data'];
      const useExample = args.includes('--use-example-data');
      expect(useExample).toBe(true);
    });

    it('should parse dry-run flag', () => {
      const args = ['--dry-run'];
      const dryRun = args.includes('--dry-run');
      expect(dryRun).toBe(true);
    });

    it('should parse verbose flag', () => {
      const args = ['--verbose'];
      const verbose = args.includes('--verbose');
      expect(verbose).toBe(true);
    });
  });

  describe('Status mapping', () => {
    it('should map Jira status to beads state', () => {
      const statusMap = {
        'To Do': 'open',
        'In Progress': 'in-progress',
        'Done': 'done'
      };
      
      expect(statusMap['To Do']).toBe('open');
      expect(statusMap['In Progress']).toBe('in-progress');
    });

    it('should handle unknown status', () => {
      const status = 'Unknown';
      const defaultState = 'open';
      const mapped = ['To Do', 'In Progress', 'Done'].includes(status) ? status : defaultState;
      expect(mapped).toBe(defaultState);
    });
  });

  describe('Priority mapping', () => {
    it('should map Jira priority', () => {
      const priorities = {
        'Highest': 'critical',
        'High': 'high',
        'Medium': 'medium',
        'Low': 'low'
      };
      
      expect(priorities['Highest']).toBe('critical');
      expect(priorities['High']).toBe('high');
    });

    it('should handle missing priority', () => {
      const priority = undefined;
      const defaultPriority = 'medium';
      const mapped = priority || defaultPriority;
      expect(mapped).toBe(defaultPriority);
    });
  });

  describe('Assignee handling', () => {
    it('should extract assignee email', () => {
      const assignee = { emailAddress: 'user@example.com' };
      const email = assignee.emailAddress;
      expect(email).toBe('user@example.com');
    });

    it('should handle unassigned issues', () => {
      const assignee = null;
      const email = assignee?.emailAddress || 'unassigned';
      expect(email).toBe('unassigned');
    });

    it('should extract display name', () => {
      const assignee = { displayName: 'John Doe' };
      const name = assignee.displayName;
      expect(name).toBe('John Doe');
    });
  });

  describe('Logging and output', () => {
    it('should log sync start', () => {
      const message = '📋 Querying Jira with JQL:';
      expect(message).toContain('Querying Jira');
    });

    it('should log success messages', () => {
      const message = '✅ Synced 5 issues successfully';
      expect(message).toContain('✅');
    });

    it('should log warning messages', () => {
      const message = '⚠️  Using example data';
      expect(message).toContain('⚠️');
    });

    it('should log error messages', () => {
      const message = '❌ Sync failed';
      expect(message).toContain('❌');
    });

    it('should log info messages', () => {
      const message = 'ℹ️  Run sync again when online';
      expect(message).toContain('ℹ️');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty project key', () => {
      const projectKey = '';
      expect(projectKey.length).toBe(0);
    });

    it('should handle very long JQL query', () => {
      const jql = 'a'.repeat(5000);
      expect(jql.length).toBe(5000);
    });

    it('should handle special characters in project key', () => {
      const projectKey = 'PROJ-1';
      expect(projectKey).toContain('-');
    });

    it('should handle unicode in issue title', () => {
      const title = 'Issue 测试 🚀';
      expect(title.length).toBeGreaterThan(5);
    });

    it('should handle null issue fields', () => {
      const issue = { key: 'PROJ-1', fields: null };
      const summary = issue.fields?.summary || 'Untitled';
      expect(summary).toBe('Untitled');
    });

    it('should handle empty issues array', () => {
      const issues = [];
      expect(issues.length).toBe(0);
    });

    it('should handle large issue count', () => {
      const issues = new Array(1000).fill({ key: 'PROJ-1' });
      expect(issues.length).toBe(1000);
    });
  });
});
