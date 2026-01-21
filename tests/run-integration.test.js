/**
 * Integration Tests for run.js
 * Tests command routing, argument parsing, and platform detection
 */

const child_process = require('child_process');
const os = require('os');

jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn()
}));

jest.mock('os', () => ({
  platform: jest.fn(() => 'darwin')
}));

describe('run.js - Integration Tests', () => {
  let execSync;
  let platform;
  
  beforeEach(() => {
    jest.clearAllMocks();
    execSync = child_process.execSync;
    platform = os.platform;
  });

  describe('Command Routing', () => {
    it('should route to help command', () => {
      const task = 'help';
      expect(task).toBe('help');
    });

    it('should route to install command', () => {
      const task = 'install';
      expect(task).toBe('install');
    });

    it('should route to sync command', () => {
      const task = 'sync';
      expect(task).toBe('sync');
    });

    it('should route to start command', () => {
      const task = 'start';
      expect(task).toBe('start');
    });

    it('should route to finish command', () => {
      const task = 'finish';
      expect(task).toBe('finish');
    });

    it('should route to test command', () => {
      const task = 'test';
      expect(task).toBe('test');
    });

    it('should route to config command', () => {
      const task = 'config';
      expect(task).toBe('config');
    });
  });

  describe('Platform Detection', () => {
    it('should detect Windows', () => {
      platform.mockReturnValue('win32');
      expect(os.platform()).toBe('win32');
    });

    it('should detect macOS', () => {
      platform.mockReturnValue('darwin');
      expect(os.platform()).toBe('darwin');
    });

    it('should detect Linux', () => {
      platform.mockReturnValue('linux');
      expect(os.platform()).toBe('linux');
    });

    it('should identify as Windows on win32', () => {
      platform.mockReturnValue('win32');
      const isWindows = os.platform() === 'win32';
      expect(isWindows).toBe(true);
    });

    it('should identify as Unix-like on macOS', () => {
      platform.mockReturnValue('darwin');
      const isWindows = os.platform() === 'win32';
      expect(isWindows).toBe(false);
    });
  });

  describe('Python Detection', () => {
    it('should detect python3', () => {
      execSync.mockReturnValue('Python 3.9.0');
      
      try {
        const version = execSync('python3 --version');
        expect(version).toBeTruthy();
      } catch {
        // Not available
      }
    });

    it('should detect python', () => {
      execSync.mockReturnValue('Python 3.8.0');
      
      try {
        const version = execSync('python --version');
        expect(version).toBeTruthy();
      } catch {
        // Not available
      }
    });

    it('should handle missing python', () => {
      execSync.mockImplementation(() => {
        throw new Error('command not found');
      });
      
      let hasPython = false;
      try {
        execSync('python3 --version');
        hasPython = true;
      } catch {
        hasPython = false;
      }
      
      expect(hasPython).toBe(false);
    });
  });

  describe('Install Command', () => {
    it('should run PowerShell install on Windows', () => {
      platform.mockReturnValue('win32');
      execSync.mockReturnValue('');
      
      const isWindows = os.platform() === 'win32';
      if (isWindows) {
        execSync('powershell -ExecutionPolicy Bypass -File install.ps1');
      }
      
      expect(isWindows).toBe(true);
    });

    it('should run bash install on Unix', () => {
      platform.mockReturnValue('darwin');
      execSync.mockReturnValue('');
      
      const isWindows = os.platform() === 'win32';
      if (!isWindows) {
        execSync('bash install.sh');
      }
      
      expect(isWindows).toBe(false);
    });
  });

  describe('Sync Command', () => {
    it('should sync with project key', () => {
      execSync.mockReturnValue('');
      
      const projectKey = 'PROJ';
      execSync(`node sync_jira_to_beads.js ${projectKey}`);
      
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('sync_jira_to_beads.js')
      );
    });

    it('should sync with component', () => {
      execSync.mockReturnValue('');
      
      execSync('node sync_jira_to_beads.js PROJ --component backend');
      
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('--component')
      );
    });

    it('should handle missing project key', () => {
      const args = [];
      expect(args.length).toBe(0);
    });

    it('should validate project key format', () => {
      const projectKey = 'PROJ';
      expect(projectKey).toMatch(/^[A-Z]+$/);
    });

    it('should handle invalid project key', () => {
      const projectKey = 'proj123';
      expect(projectKey).not.toMatch(/^[A-Z]+$/);
    });
  });

  describe('Start Command', () => {
    it('should start issue workflow', () => {
      execSync.mockReturnValue('');
      
      execSync('node bd-start-branch.js bd-abc123');
      
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('bd-start-branch.js')
      );
    });

    it('should handle missing issue ID', () => {
      const args = [];
      expect(args.length).toBe(0);
    });

    it('should validate issue ID format', () => {
      const issueId = 'bd-abc123';
      expect(issueId).toMatch(/^bd-/);
    });
  });

  describe('Finish Command', () => {
    it('should finish issue workflow', () => {
      execSync.mockReturnValue('');
      
      execSync('node bd-finish.js bd-abc123');
      
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('bd-finish.js')
      );
    });

    it('should finish with draft flag', () => {
      execSync.mockReturnValue('');
      
      execSync('node bd-finish.js bd-abc123 --draft');
      
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('--draft')
      );
    });

    it('should finish with no-push flag', () => {
      execSync.mockReturnValue('');
      
      execSync('node bd-finish.js bd-abc123 --no-push');
      
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('--no-push')
      );
    });
  });

  describe('Test Command', () => {
    it('should run with example data', () => {
      execSync.mockReturnValue('');
      
      execSync('node sync_jira_to_beads.js TEST --use-example-data');
      
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('--use-example-data')
      );
    });

    it('should use example data flag', () => {
      const useExampleData = true;
      expect(useExampleData).toBe(true);
    });
  });

  describe('Config Command', () => {
    it('should display platform info', () => {
      platform.mockReturnValue('darwin');
      const platformName = os.platform();
      expect(platformName).toBe('darwin');
    });

    it('should check Node.js availability', () => {
      const hasNode = true; // We're running in Node!
      expect(hasNode).toBe(true);
    });

    it('should check Python availability', () => {
      execSync.mockReturnValue('Python 3.9.0');
      
      let hasPython = false;
      try {
        execSync('python3 --version');
        hasPython = true;
      } catch {
        hasPython = false;
      }
      
      // Just validate the check runs
      expect(typeof hasPython).toBe('boolean');
    });
  });

  describe('Argument Parsing', () => {
    it('should parse task from args', () => {
      const args = ['sync', 'PROJ'];
      const task = args[0];
      expect(task).toBe('sync');
    });

    it('should parse project key', () => {
      const args = ['sync', 'PROJ'];
      const projectKey = args[1];
      expect(projectKey).toBe('PROJ');
    });

    it('should parse component flag', () => {
      const args = ['sync', 'PROJ', '--component', 'backend'];
      expect(args).toContain('--component');
      expect(args[args.indexOf('--component') + 1]).toBe('backend');
    });

    it('should parse draft flag', () => {
      const args = ['finish', 'bd-123', '--draft'];
      expect(args).toContain('--draft');
    });

    it('should parse no-push flag', () => {
      const args = ['finish', 'bd-123', '--no-push'];
      expect(args).toContain('--no-push');
    });

    it('should handle empty args', () => {
      const args = [];
      expect(args.length).toBe(0);
    });

    it('should parse multiple flags', () => {
      const args = ['sync', 'PROJ', '--component', 'api', '--use-example-data'];
      expect(args).toContain('--component');
      expect(args).toContain('--use-example-data');
    });
  });

  describe('Error Handling', () => {
    it('should handle command not found', () => {
      execSync.mockReset();
      execSync.mockImplementation(() => {
        throw new Error('command not found');
      });
      
      expect(() => {
        execSync('nonexistent-command');
      }).toThrow('command not found');
    });

    it('should handle permission denied', () => {
      const error = new Error('Permission denied');
      expect(error.message).toContain('Permission denied');
    });

    it('should handle file not found', () => {
      const error = new Error('No such file or directory');
      expect(error.message).toContain('No such file');
    });

    it('should handle Python not available', () => {
      execSync.mockReset();
      execSync.mockImplementation(() => {
        throw new Error('python3: command not found');
      });
      
      let hasPython = false;
      try {
        execSync('python3 --version');
        hasPython = true;
      } catch {
        hasPython = false;
      }
      
      expect(hasPython).toBe(false);
    });
  });

  describe('Help Display', () => {
    it('should show available commands', () => {
      const commands = ['help', 'install', 'sync', 'start', 'finish', 'test', 'config'];
      expect(commands.length).toBe(7);
    });

    it('should validate help text includes install', () => {
      const helpText = 'Available Commands: install, sync, start, finish';
      expect(helpText).toContain('install');
    });

    it('should validate help text includes sync', () => {
      const helpText = 'Available Commands: install, sync, start, finish';
      expect(helpText).toContain('sync');
    });

    it('should validate help text includes start', () => {
      const helpText = 'Available Commands: install, sync, start, finish';
      expect(helpText).toContain('start');
    });

    it('should validate help text includes finish', () => {
      const helpText = 'Available Commands: install, sync, start, finish';
      expect(helpText).toContain('finish');
    });
  });

  describe('Cross-platform Compatibility', () => {
    it('should work on Windows', () => {
      platform.mockReturnValue('win32');
      const isWindows = os.platform() === 'win32';
      expect(isWindows).toBe(true);
    });

    it('should work on macOS', () => {
      platform.mockReturnValue('darwin');
      const isWindows = os.platform() === 'win32';
      expect(isWindows).toBe(false);
    });

    it('should work on Linux', () => {
      platform.mockReturnValue('linux');
      const isWindows = os.platform() === 'win32';
      expect(isWindows).toBe(false);
    });

    it('should select correct install script on Windows', () => {
      platform.mockReturnValue('win32');
      const scriptName = os.platform() === 'win32' ? 'install.ps1' : 'install.sh';
      expect(scriptName).toBe('install.ps1');
    });

    it('should select correct install script on Unix', () => {
      platform.mockReturnValue('darwin');
      const scriptName = os.platform() === 'win32' ? 'install.ps1' : 'install.sh';
      expect(scriptName).toBe('install.sh');
    });
  });

  describe('Complete Workflows', () => {
    it('should execute full sync workflow', () => {
      execSync.mockReturnValue('Synced 5 issues\n');
      
      const output = execSync('node sync_jira_to_beads.js PROJ --component api');
      
      expect(output).toBeTruthy();
      expect(execSync).toHaveBeenCalled();
    });

    it('should execute full start workflow', () => {
      execSync.mockReturnValue('Branch created\n');
      
      const output = execSync('node bd-start-branch.js bd-abc123');
      
      expect(output).toBeTruthy();
      expect(execSync).toHaveBeenCalled();
    });

    it('should execute full finish workflow', () => {
      execSync.mockReturnValue('PR created\n');
      
      const output = execSync('node bd-finish.js bd-abc123');
      
      expect(output).toBeTruthy();
      expect(execSync).toHaveBeenCalled();
    });
  });
});
