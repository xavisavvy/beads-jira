/**
 * Mock Command Helper
 * 
 * Provides utilities for mocking external commands (bd, git, gh) in tests.
 * Allows isolated testing of CLI scripts without actual command execution.
 * 
 * Usage:
 *   const helper = createMockHelper();
 *   helper.install();
 *   helper.setupAllMocks();
 *   // ... run tests ...
 *   helper.restore();
 */

const childProcess = require('child_process');

class MockCommandHelper {
  constructor() {
    this.commandLog = [];
    this.mockResponses = new Map();
    this.mockErrors = new Map();
    this.originalExecSync = childProcess.execSync;
  }

  /**
   * Install mock for execSync to capture and mock commands
   */
  install() {
    this.commandLog = [];
    const self = this;
    
    childProcess.execSync = function(command, options) {
      const cmdStr = command.toString().trim();
      self.commandLog.push(cmdStr);

      // Check for error mocks first
      for (const [pattern, error] of self.mockErrors.entries()) {
        if (self._matchesPattern(cmdStr, pattern)) {
          const err = new Error(error.message);
          err.status = error.status || 1;
          err.stderr = Buffer.from(error.stderr || error.message);
          throw err;
        }
      }

      // Check for response mocks
      for (const [pattern, response] of self.mockResponses.entries()) {
        if (self._matchesPattern(cmdStr, pattern)) {
          return Buffer.from(typeof response === 'string' ? response : JSON.stringify(response));
        }
      }

      // Default empty response for unmocked commands
      return Buffer.from('');
    };
  }

  /**
   * Restore original execSync
   */
  restore() {
    childProcess.execSync = this.originalExecSync;
    this.commandLog = [];
  }

  /**
   * Check if command matches pattern (exact match or includes)
   */
  _matchesPattern(command, pattern) {
    if (pattern instanceof RegExp) {
      return pattern.test(command);
    }
    return command.includes(pattern) || command.startsWith(pattern);
  }

  /**
   * Mock a command response
   */
  mockCommand(pattern, response) {
    this.mockResponses.set(pattern, response);
  }

  /**
   * Mock a command error
   */
  mockError(pattern, error) {
    this.mockErrors.set(pattern, error);
  }

  /**
   * Clear all mocks
   */
  clearMocks() {
    this.mockResponses.clear();
    this.mockErrors.clear();
    this.commandLog = [];
  }

  /**
   * Get command history
   */
  getCommandLog() {
    return [...this.commandLog];
  }

  /**
   * Check if a command was called
   */
  wasCommandCalled(pattern) {
    return this.commandLog.some(cmd => this._matchesPattern(cmd, pattern));
  }

  /**
   * Get number of times a command was called
   */
  getCommandCallCount(pattern) {
    return this.commandLog.filter(cmd => this._matchesPattern(cmd, pattern)).length;
  }

  /**
   * Setup common beads mocks
   */
  setupBeadsMocks() {
    // bd ready --json
    this.mockCommand('bd ready --json', [
      {
        id: 'beads-jira-test1',
        title: 'Test feature implementation',
        priority: 1,
        labels: ['feature', 'jira-synced'],
        jira_key: 'PROJ-123'
      },
      {
        id: 'beads-jira-test2',
        title: 'Fix critical bug',
        priority: 0,
        labels: ['bug', 'jira-synced'],
        jira_key: 'PROJ-456'
      }
    ]);

    // bd show --json
    this.mockCommand(/bd show .+ --json/, {
      id: 'beads-jira-test1',
      title: 'Test feature implementation',
      priority: 1,
      status: 'open',
      labels: ['feature', 'jira-synced'],
      jira_key: 'PROJ-123',
      description: 'Test description'
    });

    // bd update
    this.mockCommand(/bd update/, '✓ Updated issue');

    // bd close
    this.mockCommand(/bd close/, '✓ Closed beads-jira-test1');

    // bd create
    this.mockCommand(/bd create/, 'beads-jira-new123');
  }

  /**
   * Setup common git mocks
   */
  setupGitMocks() {
    // git status
    this.mockCommand('git status --porcelain', '');
    
    // git branch
    this.mockCommand('git rev-parse --abbrev-ref HEAD', 'main');
    this.mockCommand(/git branch/, '* main\n  feature/test-branch\n');
    
    // git checkout
    this.mockCommand(/git checkout/, '');
    
    // git add
    this.mockCommand(/git add/, '');
    
    // git commit
    this.mockCommand(/git commit/, '[main abc1234] test commit');
    
    // git push
    this.mockCommand(/git push/, 'To github.com:user/repo\n   abc1234..def5678  main -> main');
    
    // git log
    this.mockCommand(/git log -1 --pretty=%B/, 'feat(test): add test feature');
    this.mockCommand(/git log --oneline/, 
      'abc1234 feat: test feature\n' +
      'def5678 fix: bug fix\n' +
      'ghi9012 docs: update readme'
    );
    
    // git config
    this.mockCommand(/git config user\.email/, 'test@example.com');
    this.mockCommand(/git config user\.name/, 'Test User');
  }

  /**
   * Setup common GitHub CLI mocks
   */
  setupGitHubMocks() {
    // gh pr view
    this.mockCommand(/gh pr view --json/, { number: 42, state: 'OPEN', title: 'Test PR' });
    
    // gh pr create
    this.mockCommand(/gh pr create/, 'https://github.com/user/repo/pull/42');
    
    // gh pr merge
    this.mockCommand(/gh pr merge/, '✓ Merged Pull Request #42');
    
    // gh pr list
    this.mockCommand(/gh pr list/, '42\tTest PR\tmain\tOPEN');
  }

  /**
   * Setup all common mocks (beads, git, gh)
   */
  setupAllMocks() {
    this.setupBeadsMocks();
    this.setupGitMocks();
    this.setupGitHubMocks();
  }

  /**
   * Create a custom mock preset
   */
  createPreset(name) {
    const presets = {
      'start-branch': () => {
        this.setupAllMocks();
        this.mockCommand('git status --porcelain', ''); // Clean working tree
        this.mockCommand('git rev-parse --abbrev-ref HEAD', 'main'); // On main branch
      },
      
      'finish-workflow': () => {
        this.setupAllMocks();
        this.mockCommand('git rev-parse --abbrev-ref HEAD', 'feature/PROJ-123-test-feature');
        this.mockCommand('git status --porcelain', ''); // Clean tree
        this.mockCommand(/gh pr view/, { number: 42, state: 'OPEN' }); // PR exists
      },
      
      'jira-sync': () => {
        this.setupBeadsMocks();
        this.mockCommand('bd ready --json', []); // No existing issues
      },

      'dirty-tree': () => {
        this.setupGitMocks();
        this.mockCommand('git status --porcelain', 'M file1.js\nA file2.js'); // Dirty tree
      },

      'no-pr': () => {
        this.setupGitMocks();
        this.mockError(/gh pr view/, { 
          message: 'no pull requests found', 
          status: 1,
          stderr: 'no pull requests found for branch'
        });
      }
    };

    if (presets[name]) {
      presets[name]();
    } else {
      throw new Error(`Unknown preset: ${name}`);
    }
  }
}

/**
 * Create a new mock helper instance
 */
function createMockHelper() {
  return new MockCommandHelper();
}

/**
 * Convenience function for quick test setup
 */
function withMocks(testFn, preset = 'all') {
  const helper = createMockHelper();
  
  beforeEach(() => {
    helper.install();
    if (preset === 'all') {
      helper.setupAllMocks();
    } else if (preset) {
      helper.createPreset(preset);
    }
  });

  afterEach(() => {
    helper.restore();
  });

  return helper;
}

module.exports = {
  MockCommandHelper,
  createMockHelper,
  withMocks
};
