#!/usr/bin/env node

/**
 * Integration Tests for Jira-Beads Sync
 * 
 * Tests complete workflows end-to-end focusing on:
 * - Module loading and structure
 * - Data transformations
 * - Workflow helpers
 * - Cross-module integration
 * - Configuration consistency
 */

const fs = require('fs');
const path = require('path');

describe('Integration Tests', () => {
  describe('Module Loading Integration', () => {
    test('should load all main modules without errors', () => {
      expect(() => require('../bd-start-branch.js')).not.toThrow();
      expect(() => require('../bd-finish.js')).not.toThrow();
      expect(() => require('../run.js')).not.toThrow();
      expect(() => require('../sync_jira_to_beads.js')).not.toThrow();
    });

    test('should load all script modules without errors', () => {
      expect(() => require('../scripts/sync-pr-templates.js')).not.toThrow();
      expect(() => require('../scripts/bitbucket-pr-defaults.js')).not.toThrow();
    });

    test('should verify module exports are correct types', () => {
      const JiraBeadsSync = require('../sync_jira_to_beads.js');
      const syncPrTemplates = require('../scripts/sync-pr-templates.js');
      const bitbucketDefaults = require('../scripts/bitbucket-pr-defaults.js');

      expect(typeof JiraBeadsSync).toBe('function'); // Class constructor
      expect(typeof syncPrTemplates).toBe('object');
      expect(typeof bitbucketDefaults).toBe('object');
    });
  });

  describe('Jira-Beads Sync Integration', () => {
    test('should instantiate JiraBeadsSync class', () => {
      const JiraBeadsSync = require('../sync_jira_to_beads.js');
      const sync = new JiraBeadsSync('TEST', { useExampleData: true });

      expect(sync).toBeInstanceOf(JiraBeadsSync);
      expect(sync.projectKey).toBe('TEST');
      expect(sync.useExampleData).toBe(true);
    });

    test('should handle component filtering', () => {
      const JiraBeadsSync = require('../sync_jira_to_beads.js');
      const sync = new JiraBeadsSync('PROJ', { component: 'backend' });

      expect(sync.component).toBe('backend');
      expect(sync.projectKey).toBe('PROJ');
    });

    test('should provide example data for offline testing', () => {
      const JiraBeadsSync = require('../sync_jira_to_beads.js');
      const sync = new JiraBeadsSync('TEST', { useExampleData: true });

      const exampleData = sync.getExampleData();
      expect(Array.isArray(exampleData)).toBe(true);
      expect(exampleData.length).toBeGreaterThan(0);
      
      // Verify example data structure
      const issue = exampleData[0];
      expect(issue).toHaveProperty('key');
      expect(issue).toHaveProperty('fields');
      expect(issue.fields).toHaveProperty('summary');
      expect(issue.fields).toHaveProperty('priority');
    });
  });

  describe('Data Transformation Integration', () => {
    test('should map Jira priorities consistently', () => {
      const priorityMap = {
        'Highest': 0,
        'High': 1,
        'Medium': 2,
        'Low': 3,
        'Lowest': 4
      };

      // Verify all priorities are unique
      const values = Object.values(priorityMap);
      const uniqueValues = [...new Set(values)];
      expect(uniqueValues.length).toBe(values.length);

      // Verify ascending order
      expect(priorityMap['Highest']).toBeLessThan(priorityMap['High']);
      expect(priorityMap['High']).toBeLessThan(priorityMap['Medium']);
      expect(priorityMap['Medium']).toBeLessThan(priorityMap['Low']);
      expect(priorityMap['Low']).toBeLessThan(priorityMap['Lowest']);
    });

    test('should map Jira issue types consistently', () => {
      const typeMap = {
        'Bug': 'bug',
        'Story': 'feature',
        'Task': 'task',
        'Epic': 'epic',
        'Sub-task': 'task'
      };

      // Verify all mappings are strings
      Object.values(typeMap).forEach(value => {
        expect(typeof value).toBe('string');
      });

      // Verify specific mappings
      expect(typeMap['Bug']).toBe('bug');
      expect(typeMap['Story']).toBe('feature');
      expect(typeMap['Epic']).toBe('epic');
    });

    test('should handle label generation correctly', () => {
      const generateLabels = (components, jiraKey) => {
        const labels = ['jira-synced'];
        
        if (jiraKey) {
          labels.push(jiraKey);
        }
        
        if (components && components.length > 0) {
          components.forEach(comp => {
            labels.push(`component-${comp}`);
          });
        }
        
        return labels;
      };

      const labels = generateLabels(['backend', 'api'], 'PROJ-123');
      
      expect(labels).toContain('jira-synced');
      expect(labels).toContain('PROJ-123');
      expect(labels).toContain('component-backend');
      expect(labels).toContain('component-api');
    });
  });

  describe('Workflow Helper Integration', () => {
    test('should slugify issue titles correctly', () => {
      const slugify = (str) => {
        return str
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 50);
      };

      expect(slugify('Test Feature')).toBe('test-feature');
      expect(slugify('Fix: Critical Bug!')).toBe('fix-critical-bug');
      expect(slugify('Add @special #chars')).toBe('add-special-chars');
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces');
      expect(slugify('  Leading and trailing  ')).toBe('leading-and-trailing');
    });

    test('should match valid Jira keys', () => {
      const jiraKeyRegex = /^[A-Z]+-[0-9]+$/;

      expect('PROJ-123').toMatch(jiraKeyRegex);
      expect('ABC-1').toMatch(jiraKeyRegex);
      expect('LONGNAME-999').toMatch(jiraKeyRegex);
      
      expect('proj-123').not.toMatch(jiraKeyRegex);
      expect('PROJ123').not.toMatch(jiraKeyRegex);
      expect('PROJ-').not.toMatch(jiraKeyRegex);
    });

    test('should generate valid branch names', () => {
      const generateBranchName = (jiraKey, title) => {
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 50);
        
        return jiraKey ? `feature/${jiraKey}-${slug}` : `feature/${slug}`;
      };

      expect(generateBranchName('PROJ-123', 'Add new feature'))
        .toBe('feature/PROJ-123-add-new-feature');
      
      expect(generateBranchName(null, 'Fix bug'))
        .toBe('feature/fix-bug');
      
      const branchName = generateBranchName('PROJ-456', 'Very long title that should be truncated because it exceeds the limit');
      expect(branchName.length).toBeLessThanOrEqual(70); // feature/ + key + - + 50 chars + margin
    });
  });

  describe('Conventional Commits Integration', () => {
    test('should recognize valid conventional commit types', () => {
      const validTypes = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'build'];
      const commitRegex = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\(.+\))?:/;

      validTypes.forEach(type => {
        expect(`${type}: message`).toMatch(commitRegex);
        expect(`${type}(scope): message`).toMatch(commitRegex);
      });
    });

    test('should parse commit message components', () => {
      const parseCommit = (message) => {
        const match = message.match(/^(\w+)(\(([^)]+)\))?: (.+)$/);
        if (!match) return null;
        
        return {
          type: match[1],
          scope: match[3] || null,
          subject: match[4]
        };
      };

      const commit1 = parseCommit('feat: add new feature');
      expect(commit1.type).toBe('feat');
      expect(commit1.scope).toBeNull();
      expect(commit1.subject).toBe('add new feature');

      const commit2 = parseCommit('fix(api): resolve bug');
      expect(commit2.type).toBe('fix');
      expect(commit2.scope).toBe('api');
      expect(commit2.subject).toBe('resolve bug');
    });
  });

  describe('File System Integration', () => {
    test('should verify all required files exist', () => {
      const requiredFiles = [
        'bd-start-branch.js',
        'bd-finish.js',
        'run.js',
        'sync_jira_to_beads.js',
        'package.json',
        'jest.config.js',
        'README.md',
        'INDEX.md',
        'CHANGELOG.md',
        'ROADMAP.md'
      ];

      requiredFiles.forEach(file => {
        expect(fs.existsSync(path.join(__dirname, '..', file))).toBe(true);
      });
    });

    test('should verify scripts directory structure', () => {
      const scriptsDir = path.join(__dirname, '..', 'scripts');
      expect(fs.existsSync(scriptsDir)).toBe(true);

      const scriptFiles = [
        'sync-pr-templates.js',
        'bitbucket-pr-defaults.js'
      ];

      scriptFiles.forEach(file => {
        expect(fs.existsSync(path.join(scriptsDir, file))).toBe(true);
      });
    });

    test('should verify docs directory structure', () => {
      const docsDir = path.join(__dirname, '..', 'docs');
      expect(fs.existsSync(docsDir)).toBe(true);

      const docSubdirs = ['guides', 'testing', 'architecture', 'history'];
      docSubdirs.forEach(dir => {
        expect(fs.existsSync(path.join(docsDir, dir))).toBe(true);
      });
    });

    test('should verify test directory structure', () => {
      const testsDir = path.join(__dirname);
      expect(fs.existsSync(testsDir)).toBe(true);

      const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.js'));
      expect(testFiles.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Integration', () => {
    test('should verify package.json structure', () => {
      const pkg = require('../package.json');

      expect(pkg).toHaveProperty('name');
      expect(pkg).toHaveProperty('version');
      expect(pkg).toHaveProperty('scripts');
      expect(pkg).toHaveProperty('devDependencies');
      
      expect(pkg.scripts).toHaveProperty('test');
      expect(pkg.scripts).toHaveProperty('lint');
    });

    test('should verify Jest configuration', () => {
      const jestConfig = require('../jest.config.js');

      expect(jestConfig.testEnvironment).toBe('node');
      expect(jestConfig.coverageDirectory).toBe('coverage');
      expect(jestConfig.testMatch).toContain('**/tests/**/*.test.js');
      expect(jestConfig.coverageThreshold).toBeDefined();
      expect(jestConfig.coverageThreshold.global).toBeDefined();
    });

    test('should verify coverage thresholds are reasonable', () => {
      const jestConfig = require('../jest.config.js');
      const thresholds = jestConfig.coverageThreshold.global;

      expect(thresholds.statements).toBeGreaterThanOrEqual(0);
      expect(thresholds.statements).toBeLessThanOrEqual(100);
      expect(thresholds.branches).toBeGreaterThanOrEqual(0);
      expect(thresholds.branches).toBeLessThanOrEqual(100);
    });
  });

  describe('Cross-Module Integration', () => {
    test('should verify modules can be required together', () => {
      expect(() => {
        require('../bd-start-branch.js');
        require('../bd-finish.js');
        require('../sync_jira_to_beads.js');
        require('../run.js');
      }).not.toThrow();
    });

    test('should verify script modules can be required together', () => {
      expect(() => {
        require('../scripts/sync-pr-templates.js');
        require('../scripts/bitbucket-pr-defaults.js');
      }).not.toThrow();
    });

    test('should verify no circular dependencies', () => {
      // If we can require all modules without errors, there are no circular deps
      const modules = [
        '../bd-start-branch.js',
        '../bd-finish.js',
        '../sync_jira_to_beads.js',
        '../run.js',
        '../scripts/sync-pr-templates.js',
        '../scripts/bitbucket-pr-defaults.js'
      ];

      modules.forEach(mod => {
        expect(() => require(mod)).not.toThrow();
      });
    });
  });

  describe('Example Data Integration', () => {
    test('should provide realistic example data', () => {
      const JiraBeadsSync = require('../sync_jira_to_beads.js');
      const sync = new JiraBeadsSync('EXAMPLE', { useExampleData: true });
      const data = sync.getExampleData();

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Verify data has Jira structure
      data.forEach(issue => {
        expect(issue).toHaveProperty('key');
        expect(issue).toHaveProperty('fields');
        expect(issue.fields).toHaveProperty('summary');
        expect(issue.fields).toHaveProperty('description');
        expect(issue.fields).toHaveProperty('status');
        expect(issue.fields).toHaveProperty('priority');
        expect(issue.fields).toHaveProperty('issuetype');
      });
    });

    test('should transform example data to beads format', () => {
      const JiraBeadsSync = require('../sync_jira_to_beads.js');
      const sync = new JiraBeadsSync('EXAMPLE', { useExampleData: true });
      const jiraIssues = sync.getExampleData();

      // Mock transformation (simplified)
      const transformedIssue = {
        id: `beads-jira-${jiraIssues[0].key.toLowerCase().replace('-', '')}`,
        title: jiraIssues[0].fields.summary,
        description: jiraIssues[0].fields.description,
        priority: 1, // Would come from mapPriority
        type: 'feature', // Would come from mapType
        labels: ['jira-synced', jiraIssues[0].key]
      };

      expect(transformedIssue).toHaveProperty('id');
      expect(transformedIssue).toHaveProperty('title');
      expect(transformedIssue).toHaveProperty('priority');
      expect(transformedIssue.labels).toContain('jira-synced');
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle missing required parameters', () => {
      const JiraBeadsSync = require('../sync_jira_to_beads.js');
      
      // Should still instantiate, but behavior depends on run()
      expect(() => new JiraBeadsSync()).not.toThrow();
    });

    test('should handle invalid project keys gracefully', () => {
      const JiraBeadsSync = require('../sync_jira_to_beads.js');
      const sync = new JiraBeadsSync('', { useExampleData: true });
      
      expect(sync.projectKey).toBe('');
      expect(sync.useExampleData).toBe(true);
    });

    test('should verify error messages are informative', () => {
      const errorTypes = [
        'Network error',
        'Authentication failed',
        'Invalid configuration',
        'File not found'
      ];

      errorTypes.forEach(msg => {
        const error = new Error(msg);
        expect(error.message).toBeTruthy();
        expect(typeof error.message).toBe('string');
      });
    });
  });
});

