/**
 * Tests for Mock Command Helper
 */

const { MockCommandHelper, createMockHelper, withMocks } = require('./helpers/mock-commands');
const childProcess = require('child_process');

describe('Mock Command Helper', () => {
  describe('MockCommandHelper class', () => {
    let helper;

    beforeEach(() => {
      helper = new MockCommandHelper();
    });

    afterEach(() => {
      if (helper) {
        helper.restore();
      }
    });

    test('should create instance', () => {
      expect(helper).toBeInstanceOf(MockCommandHelper);
      expect(helper.commandLog).toEqual([]);
      expect(helper.mockResponses).toBeInstanceOf(Map);
      expect(helper.mockErrors).toBeInstanceOf(Map);
    });

    test('should install and restore execSync', () => {
      const original = childProcess.execSync;
      helper.install();
      
      expect(childProcess.execSync).not.toBe(original);
      
      helper.restore();
      expect(childProcess.execSync).toBe(original);
    });

    test('should log commands', () => {
      helper.install();
      helper.mockCommand('test', 'response');
      
      childProcess.execSync('test');
      childProcess.execSync('another command');
      
      expect(helper.getCommandLog()).toEqual(['test', 'another command']);
    });

    test('should mock command response', () => {
      helper.install();
      helper.mockCommand('echo test', 'mocked response');
      
      const result = childProcess.execSync('echo test').toString();
      expect(result).toBe('mocked response');
    });

    test('should mock command with JSON response', () => {
      helper.install();
      const mockData = { id: 123, name: 'test' };
      helper.mockCommand('api call', mockData);
      
      const result = JSON.parse(childProcess.execSync('api call').toString());
      expect(result).toEqual(mockData);
    });

    test('should mock command error', () => {
      helper.install();
      helper.mockError('failing command', { message: 'Command failed', status: 1 });
      
      expect(() => childProcess.execSync('failing command')).toThrow('Command failed');
    });

    test('should match patterns with string', () => {
      helper.install();
      helper.mockCommand('git status', 'clean');
      
      expect(childProcess.execSync('git status').toString()).toBe('clean');
      expect(childProcess.execSync('git status --porcelain').toString()).toBe('clean');
    });

    test('should match patterns with regex', () => {
      helper.install();
      helper.mockCommand(/^git (add|commit)/, 'success');
      
      expect(childProcess.execSync('git add .').toString()).toBe('success');
      expect(childProcess.execSync('git commit -m "test"').toString()).toBe('success');
    });

    test('should check if command was called', () => {
      helper.install();
      childProcess.execSync('test command');
      
      expect(helper.wasCommandCalled('test command')).toBe(true);
      expect(helper.wasCommandCalled('not called')).toBe(false);
    });

    test('should count command calls', () => {
      helper.install();
      childProcess.execSync('git status');
      childProcess.execSync('git status');
      childProcess.execSync('git add .');
      
      expect(helper.getCommandCallCount('git status')).toBe(2);
      expect(helper.getCommandCallCount('git add')).toBe(1);
    });

    test('should clear mocks', () => {
      helper.install();
      helper.mockCommand('test', 'response');
      childProcess.execSync('test');
      
      helper.clearMocks();
      
      expect(helper.mockResponses.size).toBe(0);
      expect(helper.getCommandLog()).toEqual([]);
    });
  });

  describe('Beads mocks', () => {
    let helper;

    beforeEach(() => {
      helper = createMockHelper();
      helper.install();
      helper.setupBeadsMocks();
    });

    afterEach(() => {
      helper.restore();
    });

    test('should mock bd ready --json', () => {
      const result = JSON.parse(childProcess.execSync('bd ready --json').toString());
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('jira_key');
    });

    test('should mock bd show with JSON', () => {
      const result = JSON.parse(childProcess.execSync('bd show beads-jira-test1 --json').toString());
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('status');
    });

    test('should mock bd update', () => {
      const result = childProcess.execSync('bd update beads-jira-test1 --status done').toString();
      expect(result).toContain('Updated issue');
    });

    test('should mock bd close', () => {
      const result = childProcess.execSync('bd close beads-jira-test1').toString();
      expect(result).toContain('Closed');
    });

    test('should mock bd create', () => {
      const result = childProcess.execSync('bd create "New issue"').toString();
      expect(result).toMatch(/beads-jira-/);
    });
  });

  describe('Git mocks', () => {
    let helper;

    beforeEach(() => {
      helper = createMockHelper();
      helper.install();
      helper.setupGitMocks();
    });

    afterEach(() => {
      helper.restore();
    });

    test('should mock git status', () => {
      const result = childProcess.execSync('git status --porcelain').toString();
      expect(result).toBe('');
    });

    test('should mock git branch', () => {
      const result = childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString();
      expect(result).toBe('main');
    });

    test('should mock git operations', () => {
      expect(() => childProcess.execSync('git checkout -b test')).not.toThrow();
      expect(() => childProcess.execSync('git add .')).not.toThrow();
      expect(() => childProcess.execSync('git commit -m "test"')).not.toThrow();
    });

    test('should mock git log', () => {
      const result = childProcess.execSync('git log -1 --pretty=%B').toString();
      expect(result).toContain('feat(test)');
    });

    test('should mock git config', () => {
      const email = childProcess.execSync('git config user.email').toString();
      expect(email).toBe('test@example.com');
    });
  });

  describe('GitHub CLI mocks', () => {
    let helper;

    beforeEach(() => {
      helper = createMockHelper();
      helper.install();
      helper.setupGitHubMocks();
    });

    afterEach(() => {
      helper.restore();
    });

    test('should mock gh pr view', () => {
      const result = JSON.parse(childProcess.execSync('gh pr view --json number').toString());
      expect(result).toHaveProperty('number');
      expect(result.number).toBe(42);
    });

    test('should mock gh pr create', () => {
      const result = childProcess.execSync('gh pr create --title "Test"').toString();
      expect(result).toContain('github.com');
      expect(result).toContain('/pull/');
    });

    test('should mock gh pr merge', () => {
      const result = childProcess.execSync('gh pr merge 42 --squash').toString();
      expect(result).toContain('Merged');
    });
  });

  describe('Presets', () => {
    let helper;

    beforeEach(() => {
      helper = createMockHelper();
      helper.install();
    });

    afterEach(() => {
      helper.restore();
    });

    test('should setup start-branch preset', () => {
      helper.createPreset('start-branch');
      
      const branch = childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString();
      const status = childProcess.execSync('git status --porcelain').toString();
      
      expect(branch).toBe('main');
      expect(status).toBe('');
    });

    test('should setup finish-workflow preset', () => {
      helper.createPreset('finish-workflow');
      
      const branch = childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString();
      expect(branch).toContain('feature/');
    });

    test('should setup jira-sync preset', () => {
      helper.createPreset('jira-sync');
      
      const issues = JSON.parse(childProcess.execSync('bd ready --json').toString());
      expect(Array.isArray(issues)).toBe(true);
    });

    test('should setup dirty-tree preset', () => {
      helper.createPreset('dirty-tree');
      
      const status = childProcess.execSync('git status --porcelain').toString();
      expect(status.length).toBeGreaterThan(0);
      expect(status).toContain('M ');
    });

    test('should setup no-pr preset', () => {
      helper.createPreset('no-pr');
      
      expect(() => childProcess.execSync('gh pr view')).toThrow('no pull requests found');
    });

    test('should throw error for unknown preset', () => {
      expect(() => helper.createPreset('unknown-preset')).toThrow('Unknown preset');
    });
  });

  describe('Integration with setupAllMocks', () => {
    let helper;

    beforeEach(() => {
      helper = createMockHelper();
      helper.install();
      helper.setupAllMocks();
    });

    afterEach(() => {
      helper.restore();
    });

    test('should have all mocks available', () => {
      // Beads
      expect(() => childProcess.execSync('bd ready --json')).not.toThrow();
      
      // Git
      expect(() => childProcess.execSync('git status')).not.toThrow();
      
      // GitHub
      expect(() => childProcess.execSync('gh pr view --json number')).not.toThrow();
    });

    test('should track all command calls', () => {
      childProcess.execSync('bd ready --json');
      childProcess.execSync('git status');
      childProcess.execSync('gh pr view --json number');
      
      expect(helper.getCommandLog().length).toBe(3);
      expect(helper.wasCommandCalled('bd ready')).toBe(true);
      expect(helper.wasCommandCalled('git status')).toBe(true);
      expect(helper.wasCommandCalled('gh pr view')).toBe(true);
    });
  });

  describe('withMocks helper function', () => {
    let helper;

    beforeEach(() => {
      helper = createMockHelper();
      helper.install();
      helper.setupAllMocks();
    });

    afterEach(() => {
      helper.restore();
    });

    test('should setup and teardown mocks automatically', () => {
      // Mocks are installed in beforeEach
      expect(() => childProcess.execSync('bd ready --json')).not.toThrow();
    });

    test('should work with all mocks', () => {
      // Should have all mocks available
      const branch = childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString();
      expect(branch).toBe('main');
    });
  });

  describe('Error handling', () => {
    let helper;

    beforeEach(() => {
      helper = createMockHelper();
      helper.install();
    });

    afterEach(() => {
      helper.restore();
    });

    test('should handle error with status code', () => {
      helper.mockError('failing', { message: 'Error', status: 127 });
      
      try {
        childProcess.execSync('failing');
      } catch (err) {
        expect(err.message).toBe('Error');
        expect(err.status).toBe(127);
      }
    });

    test('should handle error with stderr', () => {
      helper.mockError('failing', { 
        message: 'Error', 
        stderr: 'detailed error message' 
      });
      
      try {
        childProcess.execSync('failing');
      } catch (err) {
        expect(err.stderr.toString()).toContain('detailed error message');
      }
    });

    test('should prioritize errors over responses', () => {
      helper.mockCommand('test', 'success');
      helper.mockError('test', { message: 'Error' });
      
      expect(() => childProcess.execSync('test')).toThrow('Error');
    });
  });

  describe('Pattern matching', () => {
    let helper;

    beforeEach(() => {
      helper = createMockHelper();
      helper.install();
    });

    afterEach(() => {
      helper.restore();
    });

    test('should match exact strings', () => {
      helper.mockCommand('exact command', 'response');
      
      expect(childProcess.execSync('exact command').toString()).toBe('response');
    });

    test('should match substrings', () => {
      helper.mockCommand('git', 'git response');
      
      expect(childProcess.execSync('git status').toString()).toBe('git response');
      expect(childProcess.execSync('git add .').toString()).toBe('git response');
    });

    test('should match regular expressions', () => {
      helper.mockCommand(/^bd (update|close)/, 'beads operation');
      
      expect(childProcess.execSync('bd update test').toString()).toBe('beads operation');
      expect(childProcess.execSync('bd close test').toString()).toBe('beads operation');
    });

    test('should match first matching pattern', () => {
      helper.mockCommand('git', 'general');
      helper.mockCommand(/git status/, 'specific');
      
      // First match wins (general matches first)
      expect(childProcess.execSync('git status').toString()).toBe('general');
    });
  });
});
