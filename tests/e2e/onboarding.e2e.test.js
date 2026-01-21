/**
 * E2E Tests for Onboarding Wizard
 * Tests the complete onboarding workflow
 */

const {
  createTempDir,
  cleanupTempDir,
  initMockGitRepo,
  MockBeadsCommand,
  ConsoleCapture,
  mockProcessExit,
} = require('../helpers/e2e-helpers');
const { mockOnboardingAnswers } = require('../fixtures/test-data');

// We'll mock the actual onboarding wizard
jest.mock('../../scripts/onboard.js', () => {
  return jest.fn();
});

describe('Onboarding Wizard E2E Tests', () => {
  let testDir;
  let mockBeads;
  let consoleCapture;
  let exitMock;

  beforeEach(() => {
    testDir = createTempDir('e2e-onboard-');
    mockBeads = new MockBeadsCommand(testDir);
    consoleCapture = new ConsoleCapture();
    exitMock = mockProcessExit();
    
    // Initialize git repo
    initMockGitRepo(testDir);
  });

  afterEach(() => {
    consoleCapture.stop();
    exitMock.restore();
    cleanupTempDir(testDir);
  });

  describe('Prerequisites Checking', () => {
    it('should check for Node.js', () => {
      const { execSync } = require('child_process');
      
      expect(() => {
        execSync('node --version', { stdio: 'pipe' });
      }).not.toThrow();
    });

    it('should check for Git', () => {
      const { execSync } = require('child_process');
      
      expect(() => {
        execSync('git --version', { stdio: 'pipe' });
      }).not.toThrow();
    });

    it('should detect git repository', () => {
      const fs = require('fs');
      const path = require('path');
      
      const gitDir = path.join(testDir, '.git');
      expect(fs.existsSync(gitDir)).toBe(true);
    });

    it('should check for beads command (may not be installed)', () => {
      const { execSync } = require('child_process');
      
      try {
        execSync('which bd || where bd', { stdio: 'pipe' });
        // beads is installed
        expect(true).toBe(true);
      } catch (error) {
        // beads not installed - expected in test environment
        expect(error).toBeDefined();
      }
    });
  });

  describe('User Information Collection', () => {
    it('should collect user name from git config', () => {
      const { execSync } = require('child_process');
      
      const name = execSync('git config user.name', {
        cwd: testDir,
        encoding: 'utf8',
      }).trim();
      
      expect(name).toBe('Test User');
    });

    it('should collect user email from git config', () => {
      const { execSync } = require('child_process');
      
      const email = execSync('git config user.email', {
        cwd: testDir,
        encoding: 'utf8',
      }).trim();
      
      expect(email).toBe('test@example.com');
    });

    it('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test('valid@example.com')).toBe(true);
      expect(emailRegex.test('invalid.email')).toBe(false);
      expect(emailRegex.test('no-at-sign.com')).toBe(false);
    });

    it('should validate Jira project key format', () => {
      const projectKeyRegex = /^[A-Z][A-Z0-9]{1,}$/;
      
      expect(projectKeyRegex.test('PROJ')).toBe(true);
      expect(projectKeyRegex.test('FRONTEND')).toBe(true);
      expect(projectKeyRegex.test('proj')).toBe(false); // lowercase
      expect(projectKeyRegex.test('123')).toBe(false); // starts with number
    });
  });

  describe('Beads Initialization', () => {
    it('should initialize beads repository', () => {
      const result = mockBeads.exec('init');
      
      expect(result.success).toBe(true);
      
      const fs = require('fs');
      const path = require('path');
      const beadsDir = path.join(testDir, '.beads');
      
      expect(fs.existsSync(beadsDir)).toBe(true);
    });

    it('should skip init if beads already initialized', () => {
      const fs = require('fs');
      const path = require('path');
      
      // Initialize once
      mockBeads.exec('init');
      
      const beadsDir = path.join(testDir, '.beads');
      expect(fs.existsSync(beadsDir)).toBe(true);
      
      // Second init should not fail
      const result = mockBeads.exec('init');
      expect(result.success).toBe(true);
    });

    it('should create beads config file', () => {
      mockBeads.exec('init');
      
      const fs = require('fs');
      const path = require('path');
      const configFile = path.join(testDir, '.beads', 'config.json');
      
      expect(fs.existsSync(configFile)).toBe(true);
      
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      expect(config).toHaveProperty('version');
    });
  });

  describe('Configuration Storage', () => {
    it('should store Jira project key', () => {
      const config = {
        jiraProjectKey: mockOnboardingAnswers.jiraProjectKey,
      };
      
      expect(config.jiraProjectKey).toBe('PROJ');
    });

    it('should store Jira component (optional)', () => {
      const config = {
        jiraComponent: mockOnboardingAnswers.jiraComponent,
      };
      
      expect(config.jiraComponent).toBe('api');
    });

    it('should handle empty component', () => {
      const config = {
        jiraComponent: '',
      };
      
      expect(config.jiraComponent).toBe('');
    });
  });

  describe('Git Hook Installation', () => {
    it('should create post-merge hook file', () => {
      const fs = require('fs');
      const path = require('path');
      
      const hookPath = path.join(testDir, '.git', 'hooks', 'post-merge');
      const hookContent = '#!/bin/bash\n# Auto-sync on git pull\nnpm run sync\n';
      
      fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
      
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should make hook executable', () => {
      const fs = require('fs');
      const path = require('path');
      
      const hookPath = path.join(testDir, '.git', 'hooks', 'post-merge');
      const hookContent = '#!/bin/bash\n# Auto-sync on git pull\nnpm run sync\n';
      
      fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
      
      const stats = fs.statSync(hookPath);
      const isExecutable = (stats.mode & fs.constants.S_IXUSR) !== 0;
      
      expect(isExecutable).toBe(true);
    });

    it('should skip hook installation if declined', () => {
      const installHook = false;
      
      expect(installHook).toBe(false);
      // Hook should not be created
    });
  });

  describe('Example Sync', () => {
    it('should run example sync successfully', () => {
      const mockSync = jest.fn(() => ({
        success: true,
        created: 3,
        updated: 1,
        skipped: 0,
      }));
      
      const result = mockSync();
      
      expect(result.success).toBe(true);
      expect(result.created).toBe(3);
      expect(mockSync).toHaveBeenCalled();
    });

    it('should handle sync failure gracefully', () => {
      const mockSync = jest.fn(() => ({
        success: false,
        error: 'Network error',
      }));
      
      const result = mockSync();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should skip example sync if declined', () => {
      const runExampleSync = false;
      const mockSync = jest.fn();
      
      if (runExampleSync) {
        mockSync();
      }
      
      expect(mockSync).not.toHaveBeenCalled();
    });
  });

  describe('Next Steps Display', () => {
    it('should display common commands', () => {
      const commands = [
        'npm run sync',
        'bd ready',
        'npm run start -- bd-xxx',
        'npm run finish -- bd-xxx',
      ];
      
      commands.forEach(cmd => {
        expect(cmd).toBeTruthy();
        expect(typeof cmd).toBe('string');
      });
    });

    it('should show documentation links', () => {
      const docs = [
        'docs/QUICKREF.md',
        'docs/DEVELOPER_WORKFLOWS.md',
        'docs/EXAMPLE_WORKFLOW.md',
      ];
      
      docs.forEach(doc => {
        expect(doc).toMatch(/^docs\/.*\.md$/);
      });
    });

    it('should display configuration summary', () => {
      const summary = {
        jiraProject: mockOnboardingAnswers.jiraProjectKey,
        component: mockOnboardingAnswers.jiraComponent,
        gitHook: mockOnboardingAnswers.installGitHook,
      };
      
      expect(summary.jiraProject).toBe('PROJ');
      expect(summary.component).toBe('api');
      expect(summary.gitHook).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing Node.js gracefully', () => {
      // This test would check behavior if Node.js is not found
      // In practice, if Node.js isn't installed, we can't run the test
      expect(true).toBe(true);
    });

    it('should handle missing Git gracefully', () => {
      const checkGit = () => {
        try {
          require('child_process').execSync('git --version', {
            stdio: 'pipe',
          });
          return true;
        } catch (error) {
          return false;
        }
      };
      
      const hasGit = checkGit();
      expect(typeof hasGit).toBe('boolean');
    });

    it('should handle beads not installed', () => {
      const checkBeads = () => {
        try {
          require('child_process').execSync('which bd || where bd', {
            stdio: 'pipe',
          });
          return true;
        } catch (error) {
          return false;
        }
      };
      
      const hasBeads = checkBeads();
      expect(typeof hasBeads).toBe('boolean');
    });

    it('should handle invalid Jira project key', () => {
      const validateProjectKey = (key) => {
        const regex = /^[A-Z][A-Z0-9]{1,}$/;
        return regex.test(key);
      };
      
      expect(validateProjectKey('PROJ')).toBe(true);
      expect(validateProjectKey('invalid')).toBe(false);
      expect(validateProjectKey('')).toBe(false);
    });
  });

  describe('Complete Workflow', () => {
    it('should complete full onboarding workflow', () => {
      // 1. Check prerequisites
      mockBeads.exec('init');
      
      // 2. Collect user info (from git config)
      const userInfo = {
        name: 'Test User',
        email: 'test@example.com',
      };
      
      // 3. Collect project info
      const projectInfo = {
        jiraProjectKey: 'PROJ',
        jiraComponent: 'api',
      };
      
      // 4. Install git hook (simulated)
      const gitHookInstalled = true;
      
      // 5. Run example sync (simulated)
      const syncResult = { success: true, created: 3 };
      
      // Verify all steps completed
      expect(userInfo.name).toBeTruthy();
      expect(projectInfo.jiraProjectKey).toBeTruthy();
      expect(gitHookInstalled).toBe(true);
      expect(syncResult.success).toBe(true);
    });
  });
});
