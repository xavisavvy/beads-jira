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
