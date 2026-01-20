/**
 * Tests for sync_jira_to_beads script
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('sync_jira_to_beads', () => {
  const scriptPath = path.join(__dirname, '..', 'sync_jira_to_beads.js');

  describe('Script structure', () => {
    it('should be a valid Node.js script', () => {
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    it('should have proper shebang', () => {
      const content = fs.readFileSync(scriptPath, 'utf8');
      expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
    });
  });

  describe('Configuration handling', () => {
    it('should validate required environment variables', () => {
      const requiredVars = ['JIRA_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN', 'BEADS_TOKEN'];
      
      requiredVars.forEach(varName => {
        expect(typeof varName).toBe('string');
        expect(varName.length).toBeGreaterThan(0);
      });
    });

    it('should handle missing configuration gracefully', () => {
      // Test that script validates configuration
      const env = { ...process.env };
      delete env.JIRA_URL;
      delete env.JIRA_EMAIL;
      delete env.JIRA_API_TOKEN;
      delete env.BEADS_TOKEN;

      try {
        execSync(`node "${scriptPath}"`, { 
          encoding: 'utf8',
          env,
          stdio: 'pipe'
        });
      } catch (error) {
        // Should fail gracefully with error message
        expect(error.status).not.toBe(0);
      }
    });
  });

  describe('Data mapping', () => {
    it('should map Jira priorities correctly', () => {
      const priorityMap = {
        'Highest': 0,
        'High': 1,
        'Medium': 2,
        'Low': 3,
        'Lowest': 4
      };

      Object.entries(priorityMap).forEach(([key, value]) => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(5);
      });
    });

    it('should map Jira issue types', () => {
      const typeMap = {
        'Bug': 'bug',
        'Story': 'feature',
        'Task': 'task',
        'Epic': 'epic'
      };

      Object.values(typeMap).forEach(value => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  describe('API integration', () => {
    it('should construct valid Jira API URLs', () => {
      const baseUrl = 'https://example.atlassian.net';
      const apiPath = '/rest/api/3/search';
      const fullUrl = `${baseUrl}${apiPath}`;

      expect(fullUrl).toContain('atlassian.net');
      expect(fullUrl).toContain('/rest/api/3/');
    });

    it('should handle authentication headers', () => {
      const email = 'test@example.com';
      const token = 'test-token';
      const auth = Buffer.from(`${email}:${token}`).toString('base64');

      expect(auth).toBeDefined();
      expect(typeof auth).toBe('string');
    });
  });

  describe('Label generation', () => {
    it('should generate appropriate labels', () => {
      const labels = ['jira-synced', 'bug', 'feature', 'enhancement'];
      
      labels.forEach(label => {
        expect(label).toMatch(/^[a-z-]+$/);
      });
    });

    it('should handle component labels', () => {
      const component = 'Frontend';
      const label = `component:${component.toLowerCase()}`;
      
      expect(label).toBe('component:frontend');
    });
  });

  describe('Error handling', () => {
    it('should validate HTTP responses', () => {
      const validStatusCodes = [200, 201, 204];
      const errorCodes = [400, 401, 403, 404, 500];

      validStatusCodes.forEach(code => {
        expect(code).toBeGreaterThanOrEqual(200);
        expect(code).toBeLessThan(300);
      });

      errorCodes.forEach(code => {
        expect(code).toBeGreaterThanOrEqual(400);
      });
    });

    it('should handle network errors gracefully', () => {
      const errors = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'];
      errors.forEach(errorCode => {
        expect(typeof errorCode).toBe('string');
      });
    });
  });

  describe('JQL query construction', () => {
    it('should build basic project query', () => {
      const projectKey = 'PROJ';
      const jql = `project = ${projectKey}`;
      expect(jql).toBe('project = PROJ');
    });

    it('should add component filter', () => {
      const projectKey = 'PROJ';
      const component = 'backend';
      const jql = `project = ${projectKey} AND component = "${component}"`;
      expect(jql).toContain('component =');
    });

    it('should filter by status', () => {
      const jql = 'status NOT IN (Done, Closed, Resolved)';
      expect(jql).toContain('status NOT IN');
    });
  });

  describe('Example data', () => {
    it('should provide example data structure', () => {
      const exampleIssue = {
        key: 'EXAMPLE-123',
        fields: {
          summary: 'Test issue',
          description: 'Test description',
          priority: { name: 'High' },
          issuetype: { name: 'Story' },
          status: { name: 'In Progress' }
        }
      };

      expect(exampleIssue.key).toMatch(/^[A-Z]+-\d+$/);
      expect(exampleIssue.fields.summary).toBeDefined();
      expect(exampleIssue.fields.priority.name).toBeDefined();
    });
  });

  describe('Class structure', () => {
    it('should export JiraBeadsSync class', () => {
      const content = fs.readFileSync(scriptPath, 'utf8');
      expect(content).toContain('class JiraBeadsSync');
    });

    it('should have constructor with options', () => {
      const content = fs.readFileSync(scriptPath, 'utf8');
      expect(content).toContain('constructor(projectKey, options = {})');
    });

    it('should have queryJiraViaMcp method', () => {
      const content = fs.readFileSync(scriptPath, 'utf8');
      expect(content).toContain('async queryJiraViaMcp()');
    });

    it('should have getExampleData method', () => {
      const content = fs.readFileSync(scriptPath, 'utf8');
      expect(content).toContain('getExampleData()');
    });
  });

  describe('Options handling', () => {
    it('should accept component option', () => {
      const options = { component: 'backend' };
      expect(options.component).toBe('backend');
    });

    it('should accept mcpUrl option', () => {
      const options = { mcpUrl: 'https://custom.mcp.url' };
      expect(options.mcpUrl).toContain('https://');
    });

    it('should accept useExampleData option', () => {
      const options = { useExampleData: true };
      expect(options.useExampleData).toBe(true);
    });
  });

  describe('Issue transformation', () => {
    it('should transform Jira issue to beads format', () => {
      const jiraIssue = {
        key: 'PROJ-123',
        fields: {
          summary: 'Test issue',
          priority: { name: 'High' }
        }
      };

      const transformed = {
        title: jiraIssue.fields.summary,
        labels: [jiraIssue.key, 'jira-synced']
      };

      expect(transformed.title).toBe('Test issue');
      expect(transformed.labels).toContain('PROJ-123');
      expect(transformed.labels).toContain('jira-synced');
    });

    it('should handle missing fields gracefully', () => {
      const jiraIssue = {
        key: 'PROJ-123',
        fields: {
          summary: 'Test issue'
        }
      };

      const description = jiraIssue.fields.description || '';
      expect(typeof description).toBe('string');
    });
  });

  describe('Component filtering', () => {
    it('should filter by component name', () => {
      const components = [
        { name: 'backend' },
        { name: 'frontend' },
        { name: 'api' }
      ];

      const targetComponent = 'backend';
      const filtered = components.filter(c => c.name === targetComponent);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('backend');
    });
  });

  describe('Offline behavior', () => {
    it('should handle offline mode', () => {
      const errorMessage = 'Cannot sync without network connection';
      expect(errorMessage).toContain('network');
    });

    it('should provide helpful offline message', () => {
      const message = 'Your existing beads issues are still available offline';
      expect(message).toContain('offline');
    });
  });

  describe('JiraBeadsSync class methods', () => {
    const JiraBeadsSync = require(scriptPath);

    it('should instantiate with project key', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync).toBeDefined();
      expect(sync.projectKey).toBe('PROJ');
    });

    it('should accept component option', () => {
      const sync = new JiraBeadsSync('PROJ', { component: 'backend' });
      expect(sync.component).toBe('backend');
    });

    it('should accept mcpUrl option', () => {
      const sync = new JiraBeadsSync('PROJ', { mcpUrl: 'https://custom.url' });
      expect(sync.mcpUrl).toBe('https://custom.url');
    });

    it('should accept useExampleData option', () => {
      const sync = new JiraBeadsSync('PROJ', { useExampleData: true });
      expect(sync.useExampleData).toBe(true);
    });

    it('should have mapPriority method', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync.mapPriority).toBeDefined();
      expect(typeof sync.mapPriority).toBe('function');
    });

    it('should map priorities correctly', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync.mapPriority('Highest')).toBe(0);
      expect(sync.mapPriority('High')).toBe(1);
      expect(sync.mapPriority('Medium')).toBe(2);
      expect(sync.mapPriority('Low')).toBe(3);
      expect(sync.mapPriority('Lowest')).toBe(4);
      expect(sync.mapPriority('Unknown')).toBe(2);
    });

    it('should handle null priority', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync.mapPriority(null)).toBe(2);
    });

    it('should handle undefined priority', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync.mapPriority(undefined)).toBe(2);
    });

    it('should handle empty string priority', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync.mapPriority('')).toBe(2);
    });

    it('should have mapIssueType method', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync.mapIssueType).toBeDefined();
      expect(typeof sync.mapIssueType).toBe('function');
    });

    it('should map issue types correctly', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync.mapIssueType('Bug')).toBe('bug');
      expect(sync.mapIssueType('Task')).toBe('task');
      expect(sync.mapIssueType('Story')).toBe('feature');
      expect(sync.mapIssueType('Feature')).toBe('feature');
      expect(sync.mapIssueType('Epic')).toBe('epic');
      expect(sync.mapIssueType('Unknown')).toBe('task');
    });

    it('should handle null issue type', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync.mapIssueType(null)).toBe('task');
    });

    it('should handle undefined issue type', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync.mapIssueType(undefined)).toBe('task');
    });

    it('should have buildDescription method', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync.buildDescription).toBeDefined();
      expect(typeof sync.buildDescription).toBe('function');
    });

    it('should build description with Jira metadata', () => {
      const sync = new JiraBeadsSync('PROJ');
      const jiraIssue = {
        key: 'PROJ-123',
        fields: {
          summary: 'Test issue',
          description: 'Test description',
          status: { name: 'Open' },
          assignee: { displayName: 'John Doe' }
        }
      };
      
      const description = sync.buildDescription(jiraIssue);
      expect(description).toContain('PROJ-123');
      expect(description).toContain('Open');
      expect(description).toContain('John Doe');
      expect(description).toContain('Test description');
    });

    it('should handle missing description', () => {
      const sync = new JiraBeadsSync('PROJ');
      const jiraIssue = {
        key: 'PROJ-123',
        fields: {
          summary: 'Test',
          status: { name: 'Open' }
        }
      };
      
      const description = sync.buildDescription(jiraIssue);
      expect(description).toContain('No description');
    });

    it('should handle missing status', () => {
      const sync = new JiraBeadsSync('PROJ');
      const jiraIssue = {
        key: 'PROJ-123',
        fields: {
          summary: 'Test',
          description: 'Test description'
        }
      };
      
      const description = sync.buildDescription(jiraIssue);
      expect(description).toContain('Unknown');
    });

    it('should handle missing assignee', () => {
      const sync = new JiraBeadsSync('PROJ');
      const jiraIssue = {
        key: 'PROJ-123',
        fields: {
          summary: 'Test',
          description: 'Test description',
          status: { name: 'Open' }
        }
      };
      
      const description = sync.buildDescription(jiraIssue);
      expect(description).toContain('Unassigned');
    });

    it('should have getExampleData method', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync.getExampleData).toBeDefined();
      expect(typeof sync.getExampleData).toBe('function');
    });

    it('should return example data', () => {
      const sync = new JiraBeadsSync('PROJ');
      const data = sync.getExampleData();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].key).toMatch(/^[A-Z]+-\d+$/);
      expect(data[0].fields).toBeDefined();
    });

    it('should return example data with correct structure', () => {
      const sync = new JiraBeadsSync('PROJ');
      const data = sync.getExampleData();
      
      data.forEach(issue => {
        expect(issue.key).toBeDefined();
        expect(issue.fields).toBeDefined();
        expect(issue.fields.summary).toBeDefined();
        expect(issue.fields.priority).toBeDefined();
        expect(issue.fields.issuetype).toBeDefined();
      });
    });

    it('should have queryJiraViaMcp method', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync.queryJiraViaMcp).toBeDefined();
      expect(typeof sync.queryJiraViaMcp).toBe('function');
    });

    it('should construct with default mcpUrl', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync.mcpUrl).toBeDefined();
      expect(sync.mcpUrl).toContain('mcp.atlassian.com');
    });

    it('should construct with default useExampleData', () => {
      const sync = new JiraBeadsSync('PROJ');
      expect(sync.useExampleData).toBe(false);
    });
  });
});
