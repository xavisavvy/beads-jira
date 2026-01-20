module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'scripts/sync-pr-templates.js',
    '!node_modules/**',
    '!coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/tests/**/*.test.js'],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 60,
      lines: 40,
      statements: 40
    }
  },
  verbose: true
};
