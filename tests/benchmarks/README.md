# Performance Benchmarks

This directory contains performance benchmarking tests for the Jira-Beads Sync integration.

## Benchmark Suites

### 1. Performance Benchmarks (`performance.benchmark.test.js`)

Measures core operation performance:
- **Module Loading**: `require()` timing for main modules
- **File Operations**: Read/write performance for small and large files
- **String Operations**: Template strings, regex, JSON parsing
- **Array Operations**: Iteration, transformation (map/filter/reduce)
- **Object Operations**: Access patterns and iteration
- **Git Operations**: Branch parsing, commit message parsing
- **Memory Efficiency**: Allocation patterns and memory usage

### 2. Startup Benchmarks (`startup.benchmark.test.js`)

Measures application startup performance:
- **Script Startup**: Time to start run.js, bd-start-branch.js, bd-finish.js
- **Cold vs Warm Start**: Module loading cache effects
- **Module Load Time**: Core dependency loading
- **Initialization**: Config file access, git directory detection
- **Performance Baselines**: Expected performance thresholds

## Running Benchmarks

```bash
# Run all benchmarks
npm test -- tests/benchmarks

# Run specific benchmark suite
npm test -- tests/benchmarks/performance.benchmark.test.js
npm test -- tests/benchmarks/startup.benchmark.test.js

# Run with verbose output
npm test -- tests/benchmarks --verbose
```

## Benchmark Reports

Benchmarks generate JSON reports in `coverage/`:
- `benchmark-results.json` - Performance metrics with avg/min/max
- `startup-benchmark.json` - Startup timing metrics

## Performance Targets

### Startup Time
- **run.js startup**: < 2000ms
- **Cold start**: < 500ms
- **Config file read**: < 50ms
- **Git detection**: < 100ms

### File Operations
- **Small file read/write**: < 10ms
- **Large file read/write**: < 100ms
- **Directory operations**: < 50ms

### String Operations
- **Simple template**: < 0.1ms
- **Complex template**: < 1ms
- **Regex operations**: < 0.1ms
- **JSON parse/stringify**: < 10ms

## Continuous Monitoring

Benchmarks should be run:
- Before major releases
- After performance-related changes
- When investigating performance issues
- As part of CI/CD pipeline (future)

## Interpreting Results

Each benchmark reports:
- **Avg**: Average time across iterations
- **Min**: Best case performance
- **Max**: Worst case performance
- **Samples**: Number of iterations

Look for:
- ✅ Consistent performance (low std deviation)
- ⚠️ High max values (potential outliers)
- ❌ Trends showing degradation over time

## Adding New Benchmarks

```javascript
benchmark('operation-name', () => {
  // Code to benchmark
}, iterations);
```

Guidelines:
- Use descriptive names
- Include enough iterations for stability (10-1000)
- Avoid side effects that affect subsequent iterations
- Clean up resources after tests
