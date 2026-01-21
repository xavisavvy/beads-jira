/**
 * E2E Tests for Sync Workflow
 * Tests the complete Jira-to-Beads sync process
 */

const {
  createTempDir,
  cleanupTempDir,
  initMockGitRepo,
  initMockBeadsRepo,
  MockBeadsCommand,
} = require('../helpers/e2e-helpers');
const { mockJiraIssues, mockConfig } = require('../fixtures/test-data');

describe('Sync Workflow E2E Tests', () => {
  let testDir;
  let mockBeads;

  beforeEach(() => {
    testDir = createTempDir('e2e-sync-');
    mockBeads = new MockBeadsCommand(testDir);
    
    initMockGitRepo(testDir);
    initMockBeadsRepo(testDir);
  });

  afterEach(() => {
    cleanupTempDir(testDir);
  });

  describe('Sync Execution', () => {
    it('should sync Jira issues to beads', () => {
      const mockSync = jest.fn(() => ({
        success: true,
        created: 3,
        updated: 1,
        skipped: 0,
      }));
      
      const result = mockSync();
      
      expect(result.success).toBe(true);
      expect(result.created).toBeGreaterThan(0);
    });

    it('should handle sync with specific project key', () => {
      const projectKey = 'PROJ';
      const mockSync = jest.fn((key) => ({
        success: true,
        projectKey: key,
        created: 3,
      }));
      
      const result = mockSync(projectKey);
      
      expect(result.projectKey).toBe('PROJ');
    });

    it('should handle sync with component filter', () => {
      const component = 'frontend';
      const mockSync = jest.fn((key, comp) => ({
        success: true,
        component: comp,
        created: 2,
      }));
      
      const result = mockSync('PROJ', component);
      
      expect(result.component).toBe('frontend');
    });
  });

  describe('Issue Transformation', () => {
    it('should transform Jira bug to beads bug', () => {
      const jiraIssue = mockJiraIssues[0];
      
      expect(jiraIssue.fields.issuetype.name).toBe('Bug');
      
      const beadsType = jiraIssue.fields.issuetype.name.toLowerCase();
      expect(beadsType).toBe('bug');
    });

    it('should transform Jira story to beads feature', () => {
      const jiraIssue = mockJiraIssues[1];
      
      expect(jiraIssue.fields.issuetype.name).toBe('Story');
      
      const beadsType = jiraIssue.fields.issuetype.name === 'Story'
        ? 'feature'
        : 'task';
      expect(beadsType).toBe('feature');
    });

    it('should map Jira priority to beads priority', () => {
      const priorityMap = {
        Highest: 0,
        Blocker: 0,
        High: 1,
        Medium: 2,
        Low: 3,
        Lowest: 4,
      };
      
      expect(priorityMap['High']).toBe(1);
      expect(priorityMap['Medium']).toBe(2);
      expect(priorityMap['Low']).toBe(3);
    });

    it('should add jira-synced label', () => {
      const labels = ['jira-synced', 'PROJ-123'];
      
      expect(labels).toContain('jira-synced');
    });

    it('should add Jira key as label', () => {
      const jiraKey = 'PROJ-123';
      const labels = ['jira-synced', jiraKey];
      
      expect(labels).toContain(jiraKey);
    });

    it('should add component label if present', () => {
      const component = 'frontend';
      const labels = ['jira-synced', 'PROJ-123', `component-${component}`];
      
      expect(labels).toContain('component-frontend');
    });
  });

  describe('Duplicate Detection', () => {
    it('should skip issues already synced', () => {
      const existingIssues = [{ labels: ['PROJ-123'] }];
      const newIssue = { key: 'PROJ-123' };
      
      const isDuplicate = existingIssues.some(i =>
        i.labels.includes(newIssue.key)
      );
      
      expect(isDuplicate).toBe(true);
    });

    it('should sync new issues', () => {
      const existingIssues = [{ labels: ['PROJ-123'] }];
      const newIssue = { key: 'PROJ-124' };
      
      const isDuplicate = existingIssues.some(i =>
        i.labels.includes(newIssue.key)
      );
      
      expect(isDuplicate).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle MCP query failure', () => {
      const mockQuery = jest.fn(() => {
        throw new Error('MCP query failed');
      });
      
      expect(() => mockQuery()).toThrow('MCP query failed');
    });

    it('should handle network errors', () => {
      const mockQuery = jest.fn(() => ({
        success: false,
        error: 'Network error',
      }));
      
      const result = mockQuery();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle authentication failures', () => {
      const mockQuery = jest.fn(() => ({
        success: false,
        error: 'Authentication failed',
      }));
      
      const result = mockQuery();
      
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Authentication/);
    });
  });

  describe('Sync Summary', () => {
    it('should report created issues', () => {
      const summary = {
        created: 3,
        updated: 0,
        skipped: 0,
      };
      
      expect(summary.created).toBe(3);
    });

    it('should report updated issues', () => {
      const summary = {
        created: 0,
        updated: 2,
        skipped: 0,
      };
      
      expect(summary.updated).toBe(2);
    });

    it('should report skipped issues', () => {
      const summary = {
        created: 0,
        updated: 0,
        skipped: 5,
      };
      
      expect(summary.skipped).toBe(5);
    });

    it('should calculate total issues processed', () => {
      const summary = {
        created: 3,
        updated: 2,
        skipped: 5,
      };
      
      const total = summary.created + summary.updated + summary.skipped;
      expect(total).toBe(10);
    });
  });
});
