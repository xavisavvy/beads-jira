/**
 * Integration tests for run.js task runner
 * Tests critical paths and exported functions
 */

const { showHelp, isWindows, hasPython } = require('../run.js');

describe('run.js Integration Tests', () => {
  describe('Platform detection', () => {
    test('should detect Windows correctly', () => {
      expect(typeof isWindows).toBe('boolean');
    });

    test('should detect Python availability', () => {
      expect(typeof hasPython).toBe('boolean');
    });
  });

  describe('Help display', () => {
    test('should display help text without errors', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should show available commands', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toContain('install');
      expect(output).toContain('sync');
      expect(output).toContain('start');
      expect(output).toContain('finish');
      expect(output).toContain('config');
      consoleSpy.mockRestore();
    });

    test('should show usage examples', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toContain('Examples');
      expect(output).toMatch(/node run/);
      consoleSpy.mockRestore();
    });

    test('should display OS information', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/OS|platform/i);
      consoleSpy.mockRestore();
    });

    test('should show decorative formatting', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/[╔═╗║]/);
      consoleSpy.mockRestore();
    });
  });

  describe('Configuration', () => {
    test('should have platform detection variables', () => {
      expect(isWindows).toBeDefined();
      expect(typeof isWindows).toBe('boolean');
    });

    test('should have Python detection', () => {
      expect(hasPython).toBeDefined();
      expect(typeof hasPython).toBe('boolean');
    });
  });

  describe('Cross-platform support', () => {
    test('should identify current platform', () => {
      const platform = process.platform;
      expect(['darwin', 'linux', 'win32']).toContain(platform);
    });

    test('should match isWindows to platform', () => {
      const expectedWindows = process.platform === 'win32';
      expect(isWindows).toBe(expectedWindows);
    });
  });

  describe('Help text content validation', () => {
    test('should document sync command with PROJ argument', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/sync.*PROJ/);
      consoleSpy.mockRestore();
    });

    test('should document start command with ISSUE argument', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/start.*ISSUE/i);
      consoleSpy.mockRestore();
    });

    test('should document finish command with options', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/finish.*ISSUE/i);
      expect(output).toMatch(/draft/i);
      consoleSpy.mockRestore();
    });

    test('should show component flag for sync', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/--component/);
      consoleSpy.mockRestore();
    });
  });

  describe('npm shortcuts documentation', () => {
    test('should suggest npm scripts', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/npm run|Shortcuts/i);
      consoleSpy.mockRestore();
    });
  });

  describe('Real-world command documentation', () => {
    test('should show practical sync example', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/sync.*FRONT|sync.*PROJ/);
      consoleSpy.mockRestore();
    });

    test('should show practical start example', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/start.*bd-[a-z0-9]+/i);
      consoleSpy.mockRestore();
    });

    test('should show practical finish example', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/finish.*bd-[a-z0-9]+/i);
      consoleSpy.mockRestore();
    });
  });

  describe('Environment information', () => {
    test('should display Node.js as runtime', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/Node\.js|node/i);
      consoleSpy.mockRestore();
    });

    test('should show detected OS', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/darwin|linux|win32|OS/i);
      consoleSpy.mockRestore();
    });
  });

  describe('Command categories', () => {
    test('should group installation commands', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/install/i);
      consoleSpy.mockRestore();
    });

    test('should group workflow commands', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/start/i);
      expect(output).toMatch(/finish/i);
      consoleSpy.mockRestore();
    });

    test('should group configuration commands', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/config/i);
      consoleSpy.mockRestore();
    });
  });

  describe('Module exports', () => {
    test('should export showHelp function', () => {
      expect(typeof showHelp).toBe('function');
    });

    test('should export platform flags', () => {
      expect(isWindows).toBeDefined();
      expect(hasPython).toBeDefined();
    });
  });

  describe('Help formatting', () => {
    test('should have proper structure', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      
      expect(consoleSpy.mock.calls.length).toBeGreaterThan(10);
      consoleSpy.mockRestore();
    });

    test('should use consistent indentation', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/  node run/);
      consoleSpy.mockRestore();
    });
  });

  describe('Error guidance', () => {
    test('should provide clear command format', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      showHelp();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toMatch(/node run \w+/);
      consoleSpy.mockRestore();
    });
  });
});
