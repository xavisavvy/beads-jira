# Performance Benchmark Quick Reference

## 🚀 Running Benchmarks

```bash
# Run all benchmarks
npm run test:benchmark

# Run performance benchmarks only
npm run test:benchmark:perf

# Run startup benchmarks only
npm run test:benchmark:startup

# View benchmark results
cat coverage/benchmark-results.json
cat coverage/startup-benchmark.json
```

## 📊 Benchmark Categories

### Performance Benchmarks
1. **Module Loading** - require() timing
2. **File Operations** - read/write performance
3. **String Operations** - templates, regex, JSON
4. **Array Operations** - iteration, map, filter, reduce
5. **Object Operations** - access, iteration
6. **Git Operations** - branch parsing, commit parsing
7. **Memory Efficiency** - allocation patterns

### Startup Benchmarks
1. **Script Startup** - run.js, bd-start-branch.js, bd-finish.js
2. **Cold vs Warm Start** - module caching effects
3. **Module Load Time** - core dependencies
4. **Initialization** - config access, git detection
5. **Performance Baselines** - target thresholds

## 🎯 Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Script Startup | < 2000ms | ~130ms | ✅ |
| Cold Start | < 500ms | 67.38ms | ✅ |
| Warm Start | < 10ms | 0.06ms | ✅ |
| Config Read | < 50ms | 0.16ms | ✅ |
| Git Detection | < 100ms | 0.03ms | ✅ |
| Small File Write | < 10ms | 0.09ms | ✅ |
| Large File Write | < 100ms | 0.11ms | ✅ |

## 📈 Interpreting Results

Each benchmark reports:
- **avg**: Average time across iterations
- **min**: Best case performance
- **max**: Worst case performance
- **samples**: Number of iterations

### What to Look For
- ✅ **Consistent times** (low variance)
- ⚠️ **High max values** (outliers)
- ❌ **Degrading trends** (over time)

## 🔍 Sample Output

```json
{
  "timestamp": "2026-01-21T06:28:59.779Z",
  "results": {
    "cold-start-run.js": {
      "avg": 67.38,
      "min": 67.38,
      "max": 67.38,
      "samples": 1
    },
    "warm-start-run.js": {
      "avg": 0.055,
      "min": 0.055,
      "max": 0.055,
      "samples": 1
    }
  }
}
```

## 💡 Best Practices

### When to Run Benchmarks
- ✅ Before major releases
- ✅ After performance changes
- ✅ When investigating slowness
- ✅ During code reviews (if relevant)

### How to Use Results
1. **Baseline**: Establish performance baseline
2. **Compare**: Before/after changes
3. **Track**: Trends over time
4. **Optimize**: Focus on slow operations
5. **Validate**: Ensure targets met

## 🛠️ Troubleshooting

### Inconsistent Results?
- Close other applications
- Run multiple times
- Check system load
- Ensure adequate resources

### Slow Performance?
- Check uncovered lines
- Profile slow operations
- Review algorithm complexity
- Consider caching

### Adding New Benchmarks?
See `tests/benchmarks/README.md` for details.

## 📚 Related Documentation

- [Performance Benchmarks README](../tests/benchmarks/README.md)
- [Phase 2 Complete Summary](PHASE_2_COMPLETE.md)
- [Coverage Best Practices](COVERAGE_BEST_PRACTICES.md)
