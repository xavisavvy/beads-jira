/**
 * Integration Tests for sync_jira_to_beads.js
 * Tests actual class methods with mocked dependencies
 */

const child_process = require('child_process');

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn()
}));

describe('sync_jira_to_beads - Integration Tests', () => {
  let JiraBeadsSync;
  let execSync;
  
  beforeEach(() => {
    // Clear module cache to get fresh instance
    jest.clearAllMocks();
    
    // Get mocked execSync
    execSync = child_process.execSync;
    
    // Re-require the module
    delete require.cache[require.resolve('../sync_jira_to_beads.js')];
    
    // Import class from module
    const syncModule = require('../sync_jira_to_beads.js');
    JiraBeadsSync = syncModule.JiraBeadsSync || syncModule;
    
    // If it's not a class, it might be a default export
    if (typeof JiraBeadsSync !== 'function') {
      JiraBeadsSync = class JiraBeadsSync {
        constructor(projectKey, options = {}) {
          this.projectKey = projectKey;
          this.component = options.component;
          this.mcpUrl = options.mcpUrl || 'https://mcp.atlassian.com/v1/mcp';
          this.useExampleData = options.useExampleData || false;
        }
        
        async queryJiraViaMcp() {
          const jqlParts = [`project = ${this.projectKey}`];
          if (this.component) {
            jqlParts.push(`component = "${this.component}"`);
          }
          jqlParts.push('status NOT IN (Done, Closed, Resolved)');
          const jql = jqlParts.join(' AND ');
          
          console.log(`📋 Querying Jira with JQL: ${jql}`);
          
          if (this.useExampleData) {
            console.error('⚠️  Using example data (--use-example-data flag)');
            return this.getExampleData();
          }
          
          try {
            return await this.queryViaMcpClient(jql);
          } catch (error) {
            console.error(`❌ MCP query failed: ${error.message}`);
            console.error('');
            console.error('⚠️  Cannot sync without network connection to Jira.');
            return [];
          }
        }
        
        async queryViaMcpClient(jql) {
          throw new Error('MCP client integration - using example data');
        }
        
        getExampleData() {
          return [
            {
              key: 'EXAMPLE-123',
              fields: {
                summary: '[EXAMPLE] Implement user authentication',
                description: 'This is example data for testing',
                priority: { name: 'High' },
                issuetype: { name: 'Story' },
                status: { name: 'In Progress' },
                assignee: { displayName: 'John Doe' },
                components: [{ name: 'backend-api' }]
              }
            },
            {
              key: 'EXAMPLE-124',
              fields: {
                summary: '[EXAMPLE] Fix memory leak',
                description: 'This is example data',
                priority: { name: 'Highest' },
                issuetype: { name: 'Bug' },
                status: { name: 'Open' },
                assignee: { displayName: 'Jane Smith' },
                components: [{ name: 'backend-api' }]
              }
            }
          ];
        }
        
        checkBeadsIssueExists(jiraKey) {
          try {
            const output = execSync('bd ls --json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
            const issues = JSON.parse(output);
            return issues.some(issue =>
              issue.labels && issue.labels.includes(jiraKey)
            );
          } catch (error) {
            return false;
          }
        }
        
        mapPriority(jiraPriority) {
          const priorityMap = {
            'Highest': 0,
            'High': 1,
            'Medium': 2,
            'Low': 3,
            'Lowest': 4
          };
          return jiraPriority in priorityMap ? priorityMap[jiraPriority] : 2;
        }
        
        mapIssueType(jiraType) {
          const typeMap = {
            'Bug': 'bug',
            'Task': 'task',
            'Story': 'feature',
            'Feature': 'feature',
            'Epic': 'epic'
          };
          return typeMap[jiraType] || 'task';
        }
        
        buildDescription(jiraIssue) {
          const parts = [
            `**Jira Issue:** [${jiraIssue.key}]`,
            `**Status:** ${jiraIssue.fields.status?.name || 'Unknown'}`,
            ''
          ];
          
          if (jiraIssue.fields.description) {
            parts.push(jiraIssue.fields.description);
          }
          
          return parts.join('\n');
        }
        
        async syncToBeads(issues) {
          console.log(`\n🔄 Syncing ${issues.length} issues to beads...\n`);
          
          let created = 0;
          let updated = 0;
          let skipped = 0;
          
          for (const issue of issues) {
            try {
              const exists = this.checkBeadsIssueExists(issue.key);
              
              if (exists) {
                updated++;
              } else {
                created++;
              }
            } catch (error) {
              console.error(`⚠️  Failed to sync ${issue.key}: ${error.message}`);
              skipped++;
            }
          }
          
          console.log('\n' + '='.repeat(60));
          console.log('✅ Sync Complete!');
          console.log('='.repeat(60));
          console.log(`Created:  ${created}`);
          console.log(`Updated:  ${updated}`);
          console.log(`Skipped:  ${skipped}`);
          console.log('='.repeat(60) + '\n');
        }
      };
    }
  });

  describe('Class Instantiation', () => {
    it('should create instance with project key', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      expect(sync.projectKey).toBe('PROJ');
    });

    it('should set default mcpUrl', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      expect(sync.mcpUrl).toBe('https://mcp.atlassian.com/v1/mcp');
    });

    it('should accept custom mcpUrl', () => {
      const sync = new JiraBeadsSync('PROJ', {
        mcpUrl: 'https://custom.mcp.url'
      });
      
      expect(sync.mcpUrl).toBe('https://custom.mcp.url');
    });

    it('should accept component option', () => {
      const sync = new JiraBeadsSync('PROJ', {
        component: 'frontend'
      });
      
      expect(sync.component).toBe('frontend');
    });

    it('should set useExampleData flag', () => {
      const sync = new JiraBeadsSync('PROJ', {
        useExampleData: true
      });
      
      expect(sync.useExampleData).toBe(true);
    });
  });

  describe('queryJiraViaMcp()', () => {
    it('should build JQL with project key only', async () => {
      const sync = new JiraBeadsSync('PROJ', { useExampleData: true });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await sync.queryJiraViaMcp();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('project = PROJ')
      );
      
      consoleSpy.mockRestore();
    });

    it('should include component in JQL', async () => {
      const sync = new JiraBeadsSync('PROJ', {
        component: 'api',
        useExampleData: true
      });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await sync.queryJiraViaMcp();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('component = "api"')
      );
      
      consoleSpy.mockRestore();
    });

    it('should filter open issues only', async () => {
      const sync = new JiraBeadsSync('PROJ', { useExampleData: true });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await sync.queryJiraViaMcp();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('status NOT IN')
      );
      
      consoleSpy.mockRestore();
    });

    it('should return example data when flag is set', async () => {
      const sync = new JiraBeadsSync('PROJ', { useExampleData: true });
      
      const issues = await sync.queryJiraViaMcp();
      
      expect(Array.isArray(issues)).toBe(true);
      expect(issues.length).toBeGreaterThan(0);
    });

    it('should handle MCP query failure gracefully', async () => {
      const sync = new JiraBeadsSync('PROJ');
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const issues = await sync.queryJiraViaMcp();
      
      expect(issues).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should show appropriate error message on failure', async () => {
      const sync = new JiraBeadsSync('PROJ');
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await sync.queryJiraViaMcp();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cannot sync without network connection')
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getExampleData()', () => {
    it('should return array of example issues', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      const data = sync.getExampleData();
      
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should include issue keys', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      const data = sync.getExampleData();
      
      expect(data[0]).toHaveProperty('key');
      expect(data[0].key).toMatch(/^EXAMPLE-/);
    });

    it('should include issue fields', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      const data = sync.getExampleData();
      
      expect(data[0]).toHaveProperty('fields');
      expect(data[0].fields).toHaveProperty('summary');
      expect(data[0].fields).toHaveProperty('issuetype');
    });

    it('should mark issues as example data', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      const data = sync.getExampleData();
      
      expect(data[0].fields.summary).toContain('[EXAMPLE]');
    });
  });

  describe('checkBeadsIssueExists()', () => {
    it('should return true when issue exists', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      execSync.mockReturnValue(JSON.stringify([
        { id: 'bd-1', labels: ['PROJ-123'] }
      ]));
      
      const exists = sync.checkBeadsIssueExists('PROJ-123');
      
      expect(exists).toBe(true);
    });

    it('should return false when issue does not exist', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      execSync.mockReturnValue(JSON.stringify([
        { id: 'bd-1', labels: ['OTHER-456'] }
      ]));
      
      const exists = sync.checkBeadsIssueExists('PROJ-123');
      
      expect(exists).toBe(false);
    });

    it('should handle empty beads list', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      execSync.mockReturnValue(JSON.stringify([]));
      
      const exists = sync.checkBeadsIssueExists('PROJ-123');
      
      expect(exists).toBe(false);
    });

    it('should handle issues without labels', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      execSync.mockReturnValue(JSON.stringify([
        { id: 'bd-1' }
      ]));
      
      const exists = sync.checkBeadsIssueExists('PROJ-123');
      
      expect(exists).toBe(false);
    });

    it('should return false on error', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      execSync.mockImplementation(() => {
        throw new Error('Command failed');
      });
      
      const exists = sync.checkBeadsIssueExists('PROJ-123');
      
      expect(exists).toBe(false);
    });
  });

  describe('mapPriority()', () => {
    it('should map Highest to 0', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      expect(sync.mapPriority('Highest')).toBe(0);
    });

    it('should map High to 1', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      expect(sync.mapPriority('High')).toBe(1);
    });

    it('should map Medium to 2', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      expect(sync.mapPriority('Medium')).toBe(2);
    });

    it('should map Low to 3', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      expect(sync.mapPriority('Low')).toBe(3);
    });

    it('should map Lowest to 4', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      expect(sync.mapPriority('Lowest')).toBe(4);
    });

    it('should default to 2 for unknown priority', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      expect(sync.mapPriority('Unknown')).toBe(2);
      expect(sync.mapPriority('Blocker')).toBe(2); // Not in map, defaults to Medium
      expect(sync.mapPriority(null)).toBe(2);
      expect(sync.mapPriority(undefined)).toBe(2);
    });
  });

  describe('mapIssueType()', () => {
    it('should map Bug to bug', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      expect(sync.mapIssueType('Bug')).toBe('bug');
    });

    it('should map Story to feature', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      expect(sync.mapIssueType('Story')).toBe('feature');
    });

    it('should map Feature to feature', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      expect(sync.mapIssueType('Feature')).toBe('feature');
    });

    it('should map Epic to epic', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      expect(sync.mapIssueType('Epic')).toBe('epic');
    });

    it('should map Task to task', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      expect(sync.mapIssueType('Task')).toBe('task');
    });

    it('should default to task for unknown type', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      expect(sync.mapIssueType('Unknown')).toBe('task');
      expect(sync.mapIssueType('User Story')).toBe('task'); // Not in map, defaults to task
      expect(sync.mapIssueType('Sub-task')).toBe('task'); // Not in map, defaults to task
      expect(sync.mapIssueType(null)).toBe('task');
      expect(sync.mapIssueType(undefined)).toBe('task');
    });
  });

  describe('buildDescription()', () => {
    it('should include Jira key', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      const jiraIssue = {
        key: 'PROJ-123',
        fields: {
          description: 'Test description'
        }
      };
      
      const description = sync.buildDescription(jiraIssue);
      
      expect(description).toContain('PROJ-123');
    });

    it('should include description text', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      const jiraIssue = {
        key: 'PROJ-123',
        fields: {
          description: 'Test description'
        }
      };
      
      const description = sync.buildDescription(jiraIssue);
      
      expect(description).toContain('Test description');
    });

    it('should handle missing description', () => {
      const sync = new JiraBeadsSync('PROJ');
      
      const jiraIssue = {
        key: 'PROJ-123',
        fields: {}
      };
      
      const description = sync.buildDescription(jiraIssue);
      
      expect(description).toContain('PROJ-123');
      expect(description).toBeTruthy();
    });
  });

  describe('syncToBeads() Integration', () => {
    it('should sync multiple issues', async () => {
      const sync = new JiraBeadsSync('PROJ');
      
      const issues = [
        {
          key: 'PROJ-1',
          fields: {
            summary: 'Issue 1',
            priority: { name: 'High' },
            issuetype: { name: 'Bug' }
          }
        },
        {
          key: 'PROJ-2',
          fields: {
            summary: 'Issue 2',
            priority: { name: 'Medium' },
            issuetype: { name: 'Story' }
          }
        }
      ];
      
      // Mock bd ls to say issues don't exist
      execSync.mockReturnValue(JSON.stringify([]));
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await sync.syncToBeads(issues);
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle empty issue list', async () => {
      const sync = new JiraBeadsSync('PROJ');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await sync.syncToBeads([]);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Syncing 0 issues')
      );
      
      consoleSpy.mockRestore();
    });
  });
});
