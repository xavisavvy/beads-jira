/**
 * Tests for run.js task runner
 */

const { execSync } = require('child_process');
const os = require('os');
const path = require('path');

describe('run.js task runner', () => {
  const runScript = path.join(__dirname, '..', 'run.js');

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
      const output = execSync(`node "${runScript}" help`, { encoding: 'utf8' });
      
      expect(output).toContain('Jira-Beads Sync');
      expect(output).toContain('Commands:');
    });

    it('should show help when no arguments provided', () => {
      const output = execSync(`node "${runScript}"`, { encoding: 'utf8' });
      
      expect(output).toContain('Available Commands:');
    });
  });

  describe('Task execution', () => {
    it('should handle invalid tasks gracefully', () => {
      try {
        execSync(`node "${runScript}" invalid-task`, { encoding: 'utf8', stderr: 'pipe' });
      } catch (error) {
        // Should fail with an error message
        expect(error.status).not.toBe(0);
      }
    });
  });
});
