module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only changes
        'style',    // Formatting, missing semicolons, etc
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Performance improvement
        'test',     // Adding or updating tests
        'build',    // Changes to build system or dependencies
        'ci',       // Changes to CI configuration files and scripts
        'chore',    // Other changes that don't modify src or test files
        'revert'    // Revert a previous commit
      ]
    ],
    'subject-case': [0], // Allow any case for subject
    'body-max-line-length': [0], // No limit on body line length
    'footer-max-line-length': [0] // No limit on footer line length
  }
};
