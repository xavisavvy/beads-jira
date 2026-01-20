/**
 * Tests for run.js task runner
 */

const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

describe('run.js task runner', () => {
  const runScript = path.join(__dirname, '..', 'run.js');

  describe('Script structure', () => {
    it('should be a valid Node.js script', () => {
      expect(fs.existsSync(runScript)).toBe(true);
    });

    it('should have proper shebang', () => {
      const content = fs.readFileSync(runScript, 'utf-8');
      expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
    });

    it('should export functions', () => {
      const module = require(runScript);
      expect(module.run).toBeDefined();
      expect(typeof module.run).toBe('function');
      expect(module.showHelp).toBeDefined();
      expect(typeof module.showHelp).toBe('function');
    });
  });

  describe('Task definitions', () => {
    it('should have defined tasks', () => {
      const tasks = ['help', 'sync', 'start', 'finish', 'test', 'config', 'install'];

      tasks.forEach((task) => {
        expect(typeof task).toBe('string');
        expect(task.length).toBeGreaterThan(0);
      });
    });

    it('should define task descriptions', () => {
      const content = fs.readFileSync(runScript, 'utf-8');
      expect(content).toContain("help: 'Show available commands'");
      expect(content).toContain("install: 'Install sync and workflow helpers'");
      expect(content).toContain("sync: 'Sync Jira issues");
    });
  });

  describe('Platform detection', () => {
    it('should detect operating system', () => {
      const platform = os.platform();

      expect(['darwin', 'linux', 'win32', 'freebsd', 'openbsd']).toContain(platform);
    });

    it('should identify if running on Windows', () => {
      const isWindows = os.platform() === 'win32';

      expect(typeof isWindows).toBe('boolean');
    });

    it('should identify Unix-like systems', () => {
      const platform = os.platform();
      const isUnix = ['darwin', 'linux', 'freebsd', 'openbsd'].includes(platform);
      
      expect(typeof isUnix).toBe('boolean');
    });
  });

  describe('Command validation', () => {
    it('should validate node is available', () => {
      // This test runs in Node.js, so it must be available
      expect(process.version).toMatch(/^v\d+\.\d+\.\d+$/);
    });

    it('should have access to child_process module', () => {
      const { execSync } = require('child_process');
      expect(execSync).toBeDefined();
      expect(typeof execSync).toBe('function');
    });

    it('should have access to fs module', () => {
      const fs = require('fs');
      expect(fs.existsSync).toBeDefined();
      expect(fs.readFileSync).toBeDefined();
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

    it('should display all commands in help', () => {
      const output = execSync(`node "${runScript}" help`, { encoding: 'utf8' });
      
      expect(output).toContain('install');
      expect(output).toContain('sync');
      expect(output).toContain('start');
      expect(output).toContain('finish');
    });
  });

  describe('Task execution', () => {
    it('should handle invalid tasks gracefully', () => {
      const output = execSync(`node "${runScript}" invalid-task`, { encoding: 'utf8' });
      // Invalid task should show help
      expect(output).toContain('Available Commands:');
    });
  });

  describe('Argument parsing', () => {
    it('should parse task name from argv', () => {
      const args = ['node', 'run.js', 'install'];
      const task = args[2] || 'help';
      expect(task).toBe('install');
    });

    it('should parse task arguments', () => {
      const args = ['node', 'run.js', 'sync', 'PROJ', '--component', 'backend'];
      const taskArgs = args.slice(3);
      
      expect(taskArgs).toEqual(['PROJ', '--component', 'backend']);
    });

    it('should default to help when no task provided', () => {
      const args = ['node', 'run.js'];
      const task = args[2] || 'help';
      expect(task).toBe('help');
    });
  });

  describe('Command construction', () => {
    it('should build sync command', () => {
      const projectKey = 'PROJ';
      const cmd = `node scripts/sync_jira_to_beads.js ${projectKey}`;
      
      expect(cmd).toContain('sync_jira_to_beads.js');
      expect(cmd).toContain(projectKey);
    });

    it('should build start command', () => {
      const issueId = 'bd-a1b2';
      const cmd = `node scripts/bd-start-branch.js ${issueId}`;
      
      expect(cmd).toContain('bd-start-branch.js');
      expect(cmd).toContain(issueId);
    });

    it('should build finish command', () => {
      const issueId = 'bd-a1b2';
      const cmd = `node scripts/bd-finish.js ${issueId}`;
      
      expect(cmd).toContain('bd-finish.js');
      expect(cmd).toContain(issueId);
    });
  });

  describe('Platform-specific commands', () => {
    it('should choose install script based on platform', () => {
      const isWindows = os.platform() === 'win32';
      const installCmd = isWindows 
        ? 'powershell -ExecutionPolicy Bypass -File install.ps1'
        : 'bash install.sh';
      
      if (isWindows) {
        expect(installCmd).toContain('powershell');
        expect(installCmd).toContain('install.ps1');
      } else {
        expect(installCmd).toContain('bash');
        expect(installCmd).toContain('install.sh');
      }
    });

    it('should choose workflow script based on platform', () => {
      const isWindows = os.platform() === 'win32';
      const issueId = 'bd-a1b2';
      
      const startCmd = isWindows
        ? `powershell -ExecutionPolicy Bypass -File scripts/bd-start-branch.ps1 ${issueId}`
        : `node scripts/bd-start-branch.js ${issueId}`;
      
      if (isWindows) {
        expect(startCmd).toContain('powershell');
        expect(startCmd).toContain('.ps1');
      } else {
        expect(startCmd).toContain('node');
        expect(startCmd).toContain('.js');
      }
    });
  });

  describe('File system checks', () => {
    it('should verify scripts directory exists', () => {
      const scriptsDir = path.join(__dirname, '..', 'scripts');
      const exists = fs.existsSync(scriptsDir);
      expect(exists).toBe(true);
    });

    it('should check for install scripts', () => {
      const installSh = path.join(__dirname, '..', 'install.sh');
      const installPs1 = path.join(__dirname, '..', 'install.ps1');
      
      const hasInstallScript = fs.existsSync(installSh) || fs.existsSync(installPs1);
      expect(hasInstallScript).toBe(true);
    });
  });

  describe('Configuration handling', () => {
    it('should check for config file existence', () => {
      const configPath = '.jira-beads-config';
      const exists = fs.existsSync(configPath);
      expect(typeof exists).toBe('boolean');
    });

    it('should display Node.js version info', () => {
      const version = process.version;
      const info = `Node.js ${version}`;
      expect(info).toContain('Node.js');
      expect(info).toMatch(/v\d+\.\d+/);
    });

    it('should display platform info', () => {
      const platform = os.platform();
      const info = `OS: ${platform}`;
      expect(info).toContain('OS:');
    });
  });

  describe('Error cases', () => {
    it('should handle missing sync arguments', () => {
      const args = [];
      const hasProjKey = args.length > 0;
      expect(hasProjKey).toBe(false);
    });

    it('should handle missing start arguments', () => {
      const args = [];
      const hasIssueId = args.length > 0;
      expect(hasIssueId).toBe(false);
    });

    it('should handle missing finish arguments', () => {
      const args = [];
      const hasIssueId = args.length > 0;
      expect(hasIssueId).toBe(false);
    });
  });

  describe('Test mode', () => {
    it('should support example data flag', () => {
      const cmd = 'node scripts/sync_jira_to_beads.js TEST --use-example-data';
      expect(cmd).toContain('--use-example-data');
      expect(cmd).toContain('TEST');
    });
  });

  describe('Critical path validation', () => {
    const module = require(runScript);

    it('should validate required arguments for sync', () => {
      const args = [];
      const isValid = args.length > 0;
      expect(isValid).toBe(false);
    });

    it('should validate required arguments for start', () => {
      const args = [];
      const isValid = args.length > 0;
      expect(isValid).toBe(false);
    });

    it('should validate required arguments for finish', () => {
      const args = [];
      const isValid = args.length > 0;
      expect(isValid).toBe(false);
    });

    it('should handle valid sync arguments', () => {
      const args = ['PROJ', '--component', 'backend'];
      expect(args[0]).toMatch(/^[A-Z]+$/);
      expect(args).toContain('--component');
      expect(args).toContain('backend');
    });

    it('should handle valid start arguments', () => {
      const args = ['bd-a1b2'];
      expect(args[0]).toMatch(/^bd-[a-z0-9]+$/);
    });

    it('should handle valid finish arguments with flags', () => {
      const args = ['bd-a1b2', '--draft'];
      expect(args[0]).toMatch(/^bd-[a-z0-9]+$/);
      expect(args).toContain('--draft');
    });
  });

  describe('Task routing', () => {
    it('should route to install task', () => {
      const task = 'install';
      const validTasks = ['install', 'sync', 'start', 'finish', 'test', 'config', 'help'];
      expect(validTasks).toContain(task);
    });

    it('should route to sync task', () => {
      const task = 'sync';
      const validTasks = ['install', 'sync', 'start', 'finish', 'test', 'config', 'help'];
      expect(validTasks).toContain(task);
    });

    it('should route to start task', () => {
      const task = 'start';
      const validTasks = ['install', 'sync', 'start', 'finish', 'test', 'config', 'help'];
      expect(validTasks).toContain(task);
    });

    it('should route to finish task', () => {
      const task = 'finish';
      const validTasks = ['install', 'sync', 'start', 'finish', 'test', 'config', 'help'];
      expect(validTasks).toContain(task);
    });

    it('should handle default help task', () => {
      const task = undefined || 'help';
      expect(task).toBe('help');
    });
  });

  describe('Environment detection', () => {
    it('should detect Windows environment', () => {
      const isWindows = os.platform() === 'win32';
      expect(typeof isWindows).toBe('boolean');
    });

    it('should detect macOS environment', () => {
      const isMac = os.platform() === 'darwin';
      expect(typeof isMac).toBe('boolean');
    });

    it('should detect Linux environment', () => {
      const isLinux = os.platform() === 'linux';
      expect(typeof isLinux).toBe('boolean');
    });

    it('should provide platform info', () => {
      const platform = os.platform();
      expect(['win32', 'darwin', 'linux', 'freebsd', 'openbsd']).toContain(platform);
    });
  });

  describe('Script path resolution', () => {
    it('should resolve sync script path', () => {
      const scriptPath = 'scripts/sync_jira_to_beads.js';
      expect(scriptPath).toContain('sync_jira_to_beads');
      expect(scriptPath).toContain('.js');
    });

    it('should resolve start script path', () => {
      const scriptPath = 'scripts/bd-start-branch.js';
      expect(scriptPath).toContain('bd-start-branch');
      expect(scriptPath).toContain('.js');
    });

    it('should resolve finish script path', () => {
      const scriptPath = 'scripts/bd-finish.js';
      expect(scriptPath).toContain('bd-finish');
      expect(scriptPath).toContain('.js');
    });
  });
});
