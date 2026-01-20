module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    '*.js',
    'scripts/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!jest.config.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/tests/**/*.test.js'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  verbose: true
};
