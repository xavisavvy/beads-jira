module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'bd-start-branch.js',
    'bd-finish.js',
    'run.js',
    'sync_jira_to_beads.js',
    'scripts/**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!commitlint.config.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  testMatch: ['**/tests/**/*.test.js'],
  coverageThreshold: {
    global: {
      branches: 25,
      functions: 38,
      lines: 18,
      statements: 18
    }
  },
  verbose: true
};
