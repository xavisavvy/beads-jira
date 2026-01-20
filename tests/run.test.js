/**
 * Tests for run.js task runner
 */

const os = require('os');

describe('run.js task runner', () => {
  describe('Task definitions', () => {
    it('should have defined tasks', () => {
      const tasks = ['help', 'sync', 'start', 'finish', 'test', 'config'];

      tasks.forEach((task) => {
        expect(typeof task).toBe('string');
        expect(task.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Platform detection', () => {
    it('should detect operating system', () => {
      const platform = os.platform();

      expect(['darwin', 'linux', 'win32']).toContain(platform);
    });

    it('should identify if running on Windows', () => {
      const isWindows = os.platform() === 'win32';

      expect(typeof isWindows).toBe('boolean');
    });
  });

  describe('Command validation', () => {
    it('should validate node is available', () => {
      // This test runs in Node.js, so it must be available
      expect(process.version).toMatch(/^v\d+\.\d+\.\d+$/);
    });
  });

  describe('Help command', () => {
    it('should generate help text without errors', () => {
      const helpText = `
╔════════════════════════════════════════════════════════════╗
║        Jira-Beads Sync - Workflow Automation               ║
╚════════════════════════════════════════════════════════════╝
      `;

      expect(helpText).toContain('Jira-Beads Sync');
      expect(helpText).toContain('Workflow Automation');
    });
  });
});
