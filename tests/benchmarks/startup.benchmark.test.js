/**
 * Startup Performance Benchmarks
 * 
 * Measures application startup time and cold start performance
 */

const { performance } = require('perf_hooks');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Startup Benchmarks', () => {
  const results = {};
  
  afterAll(() => {
    console.log('\n=== Startup Benchmark Results ===\n');
    Object.entries(results).forEach(([name, value]) => {
      console.log(`${name}: ${typeof value === 'number' ? value.toFixed(2) + 'ms' : value}`);
    });
    
    const reportPath = path.join(__dirname, '../../coverage/startup-benchmark.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results
    }, null, 2));
  });

  describe('Script Startup Time', () => {
    test('should measure run.js startup', () => {
      const start = performance.now();
      try {
        execSync('node run.js --version 2>/dev/null', { 
          timeout: 5000,
          cwd: path.join(__dirname, '../..'),
          stdio: 'pipe'
        });
      } catch (e) {
        // Expected - may not have --version flag
      }
      const end = performance.now();
      results['run.js-startup'] = end - start;
      
      expect(end - start).toBeLessThan(2000); // Should start in < 2s
    });

    test('should measure bd-start-branch.js startup', () => {
      const scriptPath = path.join(__dirname, '../../bd-start-branch.js');
      if (!fs.existsSync(scriptPath)) {
        results['bd-start-branch.js-startup'] = 'SKIPPED - file not found';
        return;
      }

      const start = performance.now();
      try {
        execSync(`node ${scriptPath} --help 2>/dev/null`, { 
          timeout: 5000,
          stdio: 'pipe'
        });
      } catch (e) {
        // Expected - may not have --help flag
      }
      const end = performance.now();
      results['bd-start-branch.js-startup'] = end - start;
      
      expect(end - start).toBeLessThan(2000);
    });

    test('should measure bd-finish.js startup', () => {
      const scriptPath = path.join(__dirname, '../../bd-finish.js');
      if (!fs.existsSync(scriptPath)) {
        results['bd-finish.js-startup'] = 'SKIPPED - file not found';
        return;
      }

      const start = performance.now();
      try {
        execSync(`node ${scriptPath} --help 2>/dev/null`, { 
          timeout: 5000,
          stdio: 'pipe'
        });
      } catch (e) {
        // Expected
      }
      const end = performance.now();
      results['bd-finish.js-startup'] = end - start;
      
      expect(end - start).toBeLessThan(2000);
    });
  });

  describe('Cold Start vs Warm Start', () => {
    test('should measure cold start performance', () => {
      // Clear Node.js require cache
      Object.keys(require.cache).forEach(key => {
        delete require.cache[key];
      });
      
      const start = performance.now();
      require('../../run.js');
      const end = performance.now();
      
      results['cold-start-run.js'] = end - start;
      expect(end - start).toBeGreaterThan(0);
    });

    test('should measure warm start performance', () => {
      // Module already loaded
      const start = performance.now();
      require('../../run.js');
      const end = performance.now();
      
      results['warm-start-run.js'] = end - start;
      expect(end - start).toBeLessThan(results['cold-start-run.js']);
    });
  });

  describe('Module Load Time', () => {
    test('should measure core dependency load time', () => {
      const modules = ['fs', 'path', 'child_process', 'util'];
      
      modules.forEach(mod => {
        delete require.cache[require.resolve(mod)];
        const start = performance.now();
        require(mod);
        const end = performance.now();
        results[`module-load-${mod}`] = end - start;
      });
    });

    test('should measure total module load time', () => {
      const cacheSize = Object.keys(require.cache).length;
      results['total-modules-loaded'] = cacheSize;
      
      expect(cacheSize).toBeGreaterThan(0);
    });
  });

  describe('Initialization Performance', () => {
    test('should measure config file access time', () => {
      const configPaths = [
        '.beads/config.json',
        'package.json',
        'jest.config.js'
      ];
      
      configPaths.forEach(configPath => {
        const fullPath = path.join(__dirname, '../..', configPath);
        if (fs.existsSync(fullPath)) {
          const start = performance.now();
          fs.readFileSync(fullPath, 'utf8');
          const end = performance.now();
          results[`config-read-${path.basename(configPath)}`] = end - start;
        }
      });
    });

    test('should measure git directory detection', () => {
      const start = performance.now();
      let currentDir = __dirname;
      let found = false;
      
      while (currentDir !== path.parse(currentDir).root) {
        if (fs.existsSync(path.join(currentDir, '.git'))) {
          found = true;
          break;
        }
        currentDir = path.dirname(currentDir);
      }
      
      const end = performance.now();
      results['git-detection-time'] = end - start;
      results['git-directory-found'] = found;
      
      expect(end - start).toBeLessThan(100); // Should be fast
    });
  });

  describe('Performance Baselines', () => {
    test('should establish baseline expectations', () => {
      const baselines = {
        'max-startup-time-ms': 2000,
        'max-cold-start-ms': 500,
        'max-config-read-ms': 50,
        'max-git-detection-ms': 100
      };
      
      results['performance-baselines'] = baselines;
      
      // Validate actual performance against baselines
      if (results['run.js-startup'] && typeof results['run.js-startup'] === 'number') {
        expect(results['run.js-startup']).toBeLessThan(baselines['max-startup-time-ms']);
      }
      
      if (results['cold-start-run.js']) {
        expect(results['cold-start-run.js']).toBeLessThan(baselines['max-cold-start-ms']);
      }
      
      if (results['git-detection-time']) {
        expect(results['git-detection-time']).toBeLessThan(baselines['max-git-detection-ms']);
      }
    });

    test('should record Node.js version for context', () => {
      results['node-version'] = process.version;
      results['platform'] = process.platform;
      results['arch'] = process.arch;
      results['cpu-count'] = require('os').cpus().length;
      
      expect(process.version).toMatch(/^v\d+\.\d+\.\d+$/);
    });
  });
});
