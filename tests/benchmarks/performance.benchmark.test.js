/**
 * Performance Benchmarks
 * 
 * Tracks performance metrics for critical operations:
 * - Startup time
 * - Git operations
 * - File I/O
 * - Template processing
 * - Jira sync operations
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

describe('Performance Benchmarks', () => {
  const results = {};
  
  afterAll(() => {
    console.log('\n=== Performance Benchmark Results ===\n');
    Object.entries(results).forEach(([name, times]) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      console.log(`${name}:`);
      console.log(`  Avg: ${avg.toFixed(2)}ms`);
      console.log(`  Min: ${min.toFixed(2)}ms`);
      console.log(`  Max: ${max.toFixed(2)}ms`);
    });
    
    // Save results to file
    const reportPath = path.join(__dirname, '../../coverage/benchmark-results.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results: Object.fromEntries(
        Object.entries(results).map(([name, times]) => [
          name,
          {
            avg: times.reduce((a, b) => a + b, 0) / times.length,
            min: Math.min(...times),
            max: Math.max(...times),
            samples: times.length
          }
        ])
      )
    }, null, 2));
  });

  const benchmark = (name, fn, iterations = 10) => {
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      const end = performance.now();
      times.push(end - start);
    }
    results[name] = times;
  };

  describe('Module Loading', () => {
    test('should measure require() time for main modules', () => {
      benchmark('require-fs', () => {
        delete require.cache[require.resolve('fs')];
        require('fs');
      }, 50);
      
      benchmark('require-path', () => {
        delete require.cache[require.resolve('path')];
        require('path');
      }, 50);
    });

    test('should measure script loading time', () => {
      const scripts = [
        '../../run.js',
        '../../bd-start-branch.js',
        '../../bd-finish.js'
      ];
      
      scripts.forEach(script => {
        const scriptName = path.basename(script, '.js');
        benchmark(`load-${scriptName}`, () => {
          const scriptPath = path.join(__dirname, script);
          if (fs.existsSync(scriptPath)) {
            delete require.cache[require.resolve(scriptPath)];
            try {
              require(scriptPath);
            } catch (e) {
              // Expected - scripts may have side effects
            }
          }
        }, 10);
      });
    });
  });

  describe('File Operations', () => {
    const testDir = path.join(__dirname, '../../.test-perf');
    const testFile = path.join(testDir, 'test.txt');
    
    beforeAll(() => {
      fs.mkdirSync(testDir, { recursive: true });
    });
    
    afterAll(() => {
      fs.rmSync(testDir, { recursive: true, force: true });
    });

    test('should measure file write performance', () => {
      const data = 'test data '.repeat(100);
      benchmark('file-write-small', () => {
        fs.writeFileSync(testFile, data);
      }, 100);
      
      const largeData = 'test data '.repeat(10000);
      benchmark('file-write-large', () => {
        fs.writeFileSync(testFile, largeData);
      }, 50);
    });

    test('should measure file read performance', () => {
      const data = 'test data '.repeat(100);
      fs.writeFileSync(testFile, data);
      
      benchmark('file-read-small', () => {
        fs.readFileSync(testFile, 'utf8');
      }, 100);
      
      const largeData = 'test data '.repeat(10000);
      fs.writeFileSync(testFile, largeData);
      
      benchmark('file-read-large', () => {
        fs.readFileSync(testFile, 'utf8');
      }, 50);
    });

    test('should measure directory operations', () => {
      benchmark('dir-create', () => {
        const dir = path.join(testDir, `subdir-${Date.now()}`);
        fs.mkdirSync(dir, { recursive: true });
        fs.rmdirSync(dir);
      }, 50);
      
      // Create test structure
      for (let i = 0; i < 10; i++) {
        fs.writeFileSync(path.join(testDir, `file-${i}.txt`), 'test');
      }
      
      benchmark('dir-read', () => {
        fs.readdirSync(testDir);
      }, 100);
    });
  });

  describe('String Operations', () => {
    test('should measure template string performance', () => {
      const data = { title: 'Test Issue', key: 'PROJ-123', description: 'Test description' };
      
      benchmark('template-simple', () => {
        `Issue: ${data.key} - ${data.title}`;
      }, 1000);
      
      benchmark('template-complex', () => {
        `
# ${data.title}

**Key**: ${data.key}
**Description**: ${data.description}

## Details
- Status: In Progress
- Priority: High
        `.trim();
      }, 1000);
    });

    test('should measure regex performance', () => {
      const text = 'PROJ-123: Fix bug in sync process';
      const pattern = /^([A-Z]+-\d+):/;
      
      benchmark('regex-match', () => {
        pattern.test(text);
      }, 1000);
      
      benchmark('regex-extract', () => {
        text.match(pattern);
      }, 1000);
    });

    test('should measure JSON operations', () => {
      const obj = {
        issues: Array.from({ length: 100 }, (_, i) => ({
          key: `PROJ-${i}`,
          title: `Issue ${i}`,
          description: `Description for issue ${i}`,
          status: 'In Progress'
        }))
      };
      
      benchmark('json-stringify', () => {
        JSON.stringify(obj);
      }, 100);
      
      const json = JSON.stringify(obj);
      benchmark('json-parse', () => {
        JSON.parse(json);
      }, 100);
    });
  });

  describe('Array Operations', () => {
    const smallArray = Array.from({ length: 100 }, (_, i) => i);
    const largeArray = Array.from({ length: 10000 }, (_, i) => i);
    
    test('should measure array iteration', () => {
      benchmark('array-foreach-small', () => {
        let sum = 0;
        smallArray.forEach(n => { sum += n; });
      }, 100);
      
      benchmark('array-foreach-large', () => {
        let sum = 0;
        largeArray.forEach(n => { sum += n; });
      }, 50);
    });

    test('should measure array transformation', () => {
      benchmark('array-map-small', () => {
        smallArray.map(n => n * 2);
      }, 100);
      
      benchmark('array-filter-small', () => {
        smallArray.filter(n => n % 2 === 0);
      }, 100);
      
      benchmark('array-reduce-small', () => {
        smallArray.reduce((sum, n) => sum + n, 0);
      }, 100);
    });
  });

  describe('Object Operations', () => {
    const smallObj = Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [`key${i}`, `value${i}`])
    );
    
    const largeObj = Object.fromEntries(
      Array.from({ length: 1000 }, (_, i) => [`key${i}`, `value${i}`])
    );
    
    test('should measure object access', () => {
      benchmark('object-access-small', () => {
        smallObj.key5;
      }, 1000);
      
      benchmark('object-access-large', () => {
        largeObj.key500;
      }, 1000);
    });

    test('should measure object iteration', () => {
      benchmark('object-keys-small', () => {
        Object.keys(smallObj);
      }, 1000);
      
      benchmark('object-entries-small', () => {
        Object.entries(smallObj);
      }, 1000);
      
      benchmark('object-values-small', () => {
        Object.values(smallObj);
      }, 1000);
    });
  });

  describe('Git Operations Simulation', () => {
    test('should measure git command preparation', () => {
      const branch = 'feature/PROJ-123-test-branch';
      
      benchmark('git-branch-parse', () => {
        const match = branch.match(/([A-Z]+-\d+)/);
        if (match) {
          const key = match[1];
          const title = branch.split(key)[1]?.replace(/^-/, '').replace(/-/g, ' ');
        }
      }, 1000);
    });

    test('should measure commit message parsing', () => {
      const commits = Array.from({ length: 50 }, (_, i) => 
        `feat(PROJ-${i}): Add feature ${i}\n\nDetailed description`
      );
      
      benchmark('commit-parse-multiple', () => {
        commits.map(msg => {
          const [header, ...body] = msg.split('\n');
          const match = header.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/);
          if (match) {
            return {
              type: match[1],
              scope: match[2],
              subject: match[3],
              body: body.join('\n')
            };
          }
        });
      }, 100);
    });
  });

  describe('Memory Efficiency', () => {
    test('should measure memory allocation patterns', () => {
      const initialMemory = process.memoryUsage();
      
      // Simulate processing large dataset
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        key: `PROJ-${i}`,
        title: `Issue ${i}`,
        description: 'Description '.repeat(50),
        comments: Array.from({ length: 10 }, (_, j) => `Comment ${j}`)
      }));
      
      const afterAllocation = process.memoryUsage();
      
      // Process data
      largeData.forEach(issue => {
        const summary = `${issue.key}: ${issue.title}`;
        const commentCount = issue.comments.length;
      });
      
      const afterProcessing = process.memoryUsage();
      
      // Calculate memory deltas
      const allocationDelta = afterAllocation.heapUsed - initialMemory.heapUsed;
      const processingDelta = afterProcessing.heapUsed - afterAllocation.heapUsed;
      
      results['memory-allocation-mb'] = [allocationDelta / 1024 / 1024];
      results['memory-processing-delta-mb'] = [processingDelta / 1024 / 1024];
      
      expect(allocationDelta).toBeGreaterThan(0);
    });
  });
});
