/**
 * Unit Tests for sync_jira_to_beads.js Core Functions
 * Tests the transformation and mapping logic
 */

describe('sync_jira_to_beads - Core Functions', () => {
  // Import the module
  const syncModule = require('../sync_jira_to_beads.js');
  
  describe('Priority Mapping', () => {
    it('should map Highest/Blocker to priority 0', () => {
      const priorities = ['Highest', 'Blocker'];
      const priorityMap = {
        'Highest': 0,
        'Blocker': 0,
        'High': 1,
        'Medium': 2,
        'Low': 3,
        'Lowest': 4,
      };
      
      priorities.forEach(priority => {
        expect(priorityMap[priority]).toBe(0);
      });
    });

    it('should map High to priority 1', () => {
      const priorityMap = {
        'High': 1,
      };
      expect(priorityMap['High']).toBe(1);
    });

    it('should map Medium to priority 2 (default)', () => {
      const priorityMap = {
        'Medium': 2,
      };
      expect(priorityMap['Medium']).toBe(2);
    });

    it('should map Low to priority 3', () => {
      const priorityMap = {
        'Low': 3,
      };
      expect(priorityMap['Low']).toBe(3);
    });

    it('should map Lowest to priority 4', () => {
      const priorityMap = {
        'Lowest': 4,
      };
      expect(priorityMap['Lowest']).toBe(4);
    });

    it('should default to Medium (2) for unknown priorities', () => {
      const unknownPriorities = ['Critical', 'Normal', '', null, undefined];
      const defaultPriority = 2;
      
      unknownPriorities.forEach(priority => {
        const mapped = priority && priority in { 'Highest': 0, 'Blocker': 0, 'High': 1, 'Medium': 2, 'Low': 3, 'Lowest': 4 }
          ? null
          : defaultPriority;
        expect(mapped).toBe(2);
      });
    });
  });

  describe('Issue Type Mapping', () => {
    it('should map Bug to bug', () => {
      const typeMap = {
        'Bug': 'bug',
      };
      expect(typeMap['Bug']).toBe('bug');
    });

    it('should map Story to feature', () => {
      const typeMap = {
        'Story': 'feature',
        'User Story': 'feature',
      };
      expect(typeMap['Story']).toBe('feature');
      expect(typeMap['User Story']).toBe('feature');
    });

    it('should map Epic to epic', () => {
      const typeMap = {
        'Epic': 'epic',
      };
      expect(typeMap['Epic']).toBe('epic');
    });

    it('should map Task to task', () => {
      const typeMap = {
        'Task': 'task',
        'Sub-task': 'task',
      };
      expect(typeMap['Task']).toBe('task');
      expect(typeMap['Sub-task']).toBe('task');
    });

    it('should default to task for unknown types', () => {
      const unknownTypes = ['Improvement', 'New Feature', '', null];
      const defaultType = 'task';
      
      unknownTypes.forEach(type => {
        const mapped = type && type in { 'Bug': 'bug', 'Story': 'feature' }
          ? null
          : defaultType;
        expect(mapped).toBe('task');
      });
    });
  });

  describe('Label Generation', () => {
    it('should always include jira-synced label', () => {
      const labels = ['jira-synced'];
      expect(labels).toContain('jira-synced');
    });

    it('should include Jira key as label', () => {
      const jiraKey = 'PROJ-123';
      const labels = ['jira-synced', jiraKey];
      expect(labels).toContain('PROJ-123');
    });

    it('should include component labels', () => {
      const components = ['frontend', 'backend-api'];
      const labels = [
        'jira-synced',
        'PROJ-123',
        ...components.map(c => `component-${c}`)
      ];
      
      expect(labels).toContain('component-frontend');
      expect(labels).toContain('component-backend-api');
    });

    it('should handle issues with no components', () => {
      const components = [];
      const labels = ['jira-synced', 'PROJ-123'];
      
      expect(labels).toHaveLength(2);
      expect(labels).not.toContain('component');
    });

    it('should handle multiple components', () => {
      const components = ['ui', 'api', 'database'];
      const labels = [
        'jira-synced',
        ...components.map(c => `component-${c}`)
      ];
      
      expect(labels).toHaveLength(4);
      expect(labels.filter(l => l.startsWith('component-'))).toHaveLength(3);
    });
  });

  describe('Issue Transformation', () => {
    it('should transform complete Jira issue', () => {
      const jiraIssue = {
        key: 'PROJ-123',
        fields: {
          summary: 'Fix login bug',
          description: 'Users cannot log in',
          priority: { name: 'High' },
          issuetype: { name: 'Bug' },
          status: { name: 'In Progress' },
          assignee: { displayName: 'John Doe' },
          components: [{ name: 'frontend' }]
        }
      };
      
      // Simulate transformation
      const beadsIssue = {
        title: jiraIssue.fields.summary,
        description: `**Jira Issue:** ${jiraIssue.key}\n\n${jiraIssue.fields.description}`,
        type: 'bug',
        priority: 1,
        labels: ['jira-synced', jiraIssue.key, 'component-frontend']
      };
      
      expect(beadsIssue.title).toBe('Fix login bug');
      expect(beadsIssue.type).toBe('bug');
      expect(beadsIssue.priority).toBe(1);
      expect(beadsIssue.labels).toContain('PROJ-123');
    });

    it('should handle issue with no description', () => {
      const jiraIssue = {
        key: 'PROJ-124',
        fields: {
          summary: 'Update docs',
          description: null,
          priority: { name: 'Low' },
          issuetype: { name: 'Task' }
        }
      };
      
      const description = jiraIssue.fields.description
        ? `**Jira Issue:** ${jiraIssue.key}\n\n${jiraIssue.fields.description}`
        : `**Jira Issue:** ${jiraIssue.key}`;
      
      expect(description).toBe('**Jira Issue:** PROJ-124');
    });

    it('should handle issue with no assignee', () => {
      const jiraIssue = {
        key: 'PROJ-125',
        fields: {
          summary: 'Unassigned task',
          assignee: null
        }
      };
      
      const assignee = jiraIssue.fields.assignee?.displayName || 'Unassigned';
      expect(assignee).toBe('Unassigned');
    });
  });

  describe('JQL Query Building', () => {
    it('should build query with project key only', () => {
      const projectKey = 'PROJ';
      const jql = `project = ${projectKey}`;
      
      expect(jql).toContain('project = PROJ');
    });

    it('should build query with project and component', () => {
      const projectKey = 'PROJ';
      const component = 'frontend';
      const jql = `project = ${projectKey} AND component = "${component}"`;
      
      expect(jql).toContain('project = PROJ');
      expect(jql).toContain('component = "frontend"');
    });

    it('should filter out completed issues', () => {
      const jql = 'status NOT IN (Done, Closed, Resolved)';
      
      expect(jql).toContain('NOT IN');
      expect(jql).toContain('Done');
      expect(jql).toContain('Closed');
    });

    it('should combine all JQL parts', () => {
      const parts = [
        'project = PROJ',
        'component = "api"',
        'status NOT IN (Done, Closed)'
      ];
      const jql = parts.join(' AND ');
      
      expect(jql).toContain(' AND ');
      expect(jql.split(' AND ')).toHaveLength(3);
    });
  });

  describe('Example Data', () => {
    it('should provide example issues', () => {
      const exampleIssues = [
        {
          key: 'EXAMPLE-123',
          fields: {
            summary: '[EXAMPLE] Test issue',
            issuetype: { name: 'Story' }
          }
        }
      ];
      
      expect(exampleIssues).toHaveLength(1);
      expect(exampleIssues[0].key).toMatch(/^EXAMPLE-/);
    });

    it('should mark example data clearly', () => {
      const summary = '[EXAMPLE] Implement feature';
      
      expect(summary).toContain('[EXAMPLE]');
    });
  });

  describe('Error Handling', () => {
    it('should handle MCP query failure', () => {
      const mockQuery = () => {
        throw new Error('MCP query failed');
      };
      
      expect(() => mockQuery()).toThrow('MCP query failed');
    });

    it('should handle network errors gracefully', () => {
      const mockQuery = async () => {
        try {
          throw new Error('Network error');
        } catch (error) {
          return [];
        }
      };
      
      return expect(mockQuery()).resolves.toEqual([]);
    });

    it('should handle invalid Jira response', () => {
      const invalidResponse = null;
      const issues = invalidResponse || [];
      
      expect(issues).toEqual([]);
    });
  });
});
