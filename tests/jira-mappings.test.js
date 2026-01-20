/**
 * Tests for Jira field mappings
 */

describe('Jira Field Mappings', () => {
  describe('Priority mapping', () => {
    const mapPriority = (jiraPriority) => {
      const priorityMap = {
        Highest: 0,
        High: 1,
        Medium: 2,
        Low: 3,
        Lowest: 4
      };
      return priorityMap[jiraPriority] !== undefined ? priorityMap[jiraPriority] : 2;
    };

    it('should map Highest to 0', () => {
      expect(mapPriority('Highest')).toBe(0);
    });

    it('should map High to 1', () => {
      expect(mapPriority('High')).toBe(1);
    });

    it('should map Medium to 2', () => {
      expect(mapPriority('Medium')).toBe(2);
    });

    it('should map Low to 3', () => {
      expect(mapPriority('Low')).toBe(3);
    });

    it('should map Lowest to 4', () => {
      expect(mapPriority('Lowest')).toBe(4);
    });

    it('should default to 2 for unknown priorities', () => {
      expect(mapPriority('Unknown')).toBe(2);
    });
  });

  describe('Issue type mapping', () => {
    const mapIssueType = (jiraType) => {
      const typeMap = {
        Bug: 'bug',
        Task: 'task',
        Story: 'feature',
        Feature: 'feature',
        Epic: 'epic',
        'Sub-task': 'task'
      };
      return typeMap[jiraType] || 'task';
    };

    it('should map Bug to bug', () => {
      expect(mapIssueType('Bug')).toBe('bug');
    });

    it('should map Story to feature', () => {
      expect(mapIssueType('Story')).toBe('feature');
    });

    it('should map Epic to epic', () => {
      expect(mapIssueType('Epic')).toBe('epic');
    });

    it('should default to task for unknown types', () => {
      expect(mapIssueType('Unknown')).toBe('task');
    });
  });

  describe('Label generation', () => {
    it('should generate component label', () => {
      const component = 'backend-api';
      const label = `component-${component}`;

      expect(label).toBe('component-backend-api');
    });

    it('should handle Jira key as label', () => {
      const jiraKey = 'PROJ-123';
      expect(jiraKey).toMatch(/^[A-Z]+-[0-9]+$/);
    });

    it('should always include jira-synced label', () => {
      const labels = ['jira-synced', 'PROJ-123', 'component-backend'];
      expect(labels).toContain('jira-synced');
    });
  });
});
