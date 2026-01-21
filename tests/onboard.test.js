/**
 * Tests for onboarding wizard
 */

const OnboardingWizard = require('../scripts/onboard');
const { execSync } = require('child_process');
const fs = require('fs');

// Mock readline for testing
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn(),
    close: jest.fn(),
  })),
}));

describe('OnboardingWizard', () => {
  let wizard;

  beforeEach(() => {
    wizard = new OnboardingWizard();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(wizard.config).toBeDefined();
      expect(wizard.config.name).toBe('');
      expect(wizard.config.email).toBe('');
      expect(wizard.checks).toBeDefined();
    });
  });

  describe('logging methods', () => {
    let consoleLogSpy;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should log success messages', () => {
      wizard.success('Test success');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      wizard.error('Test error');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log warning messages', () => {
      wizard.warning('Test warning');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      wizard.info('Test info');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log section headers', () => {
      wizard.section('Test Section');
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('execCommand', () => {
    it('should execute valid commands successfully', () => {
      const result = wizard.execCommand('echo "test"', true);
      expect(result.success).toBe(true);
      expect(result.output).toBe('test');
    });

    it('should handle command failures gracefully', () => {
      const result = wizard.execCommand('nonexistent-command', true);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('checkPrerequisites', () => {
    it('should check for Node.js', async () => {
      const result = await wizard.checkPrerequisites();
      expect(wizard.checks.node).toBe(true);
    });

    it('should check for Git', async () => {
      const result = await wizard.checkPrerequisites();
      expect(wizard.checks.git).toBe(true);
    });

    it('should check for git repository', async () => {
      const result = await wizard.checkPrerequisites();
      expect(wizard.checks.gitRepo).toBe(true);
    });

    it('should check for beads command', async () => {
      const result = await wizard.checkPrerequisites();
      // May or may not be installed
      expect(typeof wizard.checks.beads).toBe('boolean');
    });
  });
});

describe('Onboarding Integration', () => {
  it('should have onboard script at correct location', () => {
    const scriptPath = require.resolve('../scripts/onboard.js');
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  it('should be executable', () => {
    const scriptPath = require.resolve('../scripts/onboard.js');
    const stats = fs.statSync(scriptPath);
    expect(stats.mode & fs.constants.S_IXUSR).toBeTruthy();
  });

  it('should export OnboardingWizard class', () => {
    expect(OnboardingWizard).toBeDefined();
    expect(typeof OnboardingWizard).toBe('function');
  });
});

describe('npm scripts', () => {
  it('should have onboard command in package.json', () => {
    const packageJson = require('../package.json');
    expect(packageJson.scripts.onboard).toBe('node scripts/onboard.js');
  });
});
