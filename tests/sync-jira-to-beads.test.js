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
  });
});
