/**
 * E2E Test Helpers
 * Utilities for end-to-end testing workflows
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Create a temporary test directory
 */
function createTempDir(prefix = 'beads-test-') {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  return tempDir;
}

/**
 * Clean up temporary directory
 */
function cleanupTempDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Initialize a mock git repository
 */
function initMockGitRepo(dir) {
  execSync('git init', { cwd: dir, stdio: 'pipe' });
  execSync('git config user.name "Test User"', { cwd: dir, stdio: 'pipe' });
  execSync('git config user.email "test@example.com"', { cwd: dir, stdio: 'pipe' });
  
  // Create initial commit
  fs.writeFileSync(path.join(dir, 'README.md'), '# Test Repo');
  execSync('git add .', { cwd: dir, stdio: 'pipe' });
  execSync('git commit -m "Initial commit"', { cwd: dir, stdio: 'pipe' });
}

/**
 * Initialize a mock beads repository
 */
function initMockBeadsRepo(dir) {
  const beadsDir = path.join(dir, '.beads');
  fs.mkdirSync(beadsDir, { recursive: true });
  
  // Create mock beads config
  const config = {
    version: '1.0',
    issues: [],
  };
  fs.writeFileSync(
    path.join(beadsDir, 'config.json'),
    JSON.stringify(config, null, 2)
  );
}

/**
 * Create a mock beads issue
 */
function createMockBeadsIssue(dir, issueData) {
  const beadsDir = path.join(dir, '.beads');
  const issuesFile = path.join(beadsDir, 'issues.json');
  
  let issues = [];
  if (fs.existsSync(issuesFile)) {
    issues = JSON.parse(fs.readFileSync(issuesFile, 'utf8'));
  }
  
  const issue = {
    id: issueData.id || `bd-${Math.random().toString(36).substr(2, 4)}`,
    title: issueData.title || 'Test Issue',
    type: issueData.type || 'task',
    priority: issueData.priority || 2,
    status: issueData.status || 'todo',
    labels: issueData.labels || [],
    description: issueData.description || 'Test description',
    createdAt: new Date().toISOString(),
    ...issueData,
  };
  
  issues.push(issue);
  fs.writeFileSync(issuesFile, JSON.stringify(issues, null, 2));
  
  return issue;
}

/**
 * Mock beads command execution
 */
class MockBeadsCommand {
  constructor(testDir) {
    this.testDir = testDir;
    this.calls = [];
  }
  
  exec(command, args = []) {
    this.calls.push({ command, args });
    
    // Mock different beads commands
    switch (command) {
      case 'init':
        initMockBeadsRepo(this.testDir);
        return { success: true, output: 'Beads initialized' };
      
      case 'ls':
        return this.mockList();
      
      case 'show':
        return this.mockShow(args[0]);
      
      case 'create':
        return this.mockCreate(args);
      
      case 'start':
        return this.mockStart(args[0]);
      
      case 'done':
        return this.mockDone(args[0]);
      
      default:
        return { success: true, output: `Mock ${command}` };
    }
  }
  
  mockList() {
    const issuesFile = path.join(this.testDir, '.beads', 'issues.json');
    if (fs.existsSync(issuesFile)) {
      const issues = JSON.parse(fs.readFileSync(issuesFile, 'utf8'));
      return {
        success: true,
        output: issues.map(i => `${i.id} [${i.type}] ${i.title}`).join('\n'),
        data: issues,
      };
    }
    return { success: true, output: '', data: [] };
  }
  
  mockShow(issueId) {
    const issuesFile = path.join(this.testDir, '.beads', 'issues.json');
    if (fs.existsSync(issuesFile)) {
      const issues = JSON.parse(fs.readFileSync(issuesFile, 'utf8'));
      const issue = issues.find(i => i.id === issueId);
      if (issue) {
        return {
          success: true,
          output: JSON.stringify(issue, null, 2),
          data: issue,
        };
      }
    }
    return { success: false, error: 'Issue not found' };
  }
  
  mockCreate(args) {
    const title = args.find(a => !a.startsWith('-')) || 'New Issue';
    const issue = createMockBeadsIssue(this.testDir, { title });
    return {
      success: true,
      output: `Created ${issue.id}`,
      data: issue,
    };
  }
  
  mockStart(issueId) {
    return this.updateIssueStatus(issueId, 'in-progress');
  }
  
  mockDone(issueId) {
    return this.updateIssueStatus(issueId, 'done');
  }
  
  updateIssueStatus(issueId, status) {
    const issuesFile = path.join(this.testDir, '.beads', 'issues.json');
    if (fs.existsSync(issuesFile)) {
      const issues = JSON.parse(fs.readFileSync(issuesFile, 'utf8'));
      const issue = issues.find(i => i.id === issueId);
      if (issue) {
        issue.status = status;
        fs.writeFileSync(issuesFile, JSON.stringify(issues, null, 2));
        return {
          success: true,
          output: `Updated ${issueId} to ${status}`,
          data: issue,
        };
      }
    }
    return { success: false, error: 'Issue not found' };
  }
  
  getCalls() {
    return this.calls;
  }
  
  reset() {
    this.calls = [];
  }
}

/**
 * Run a command with timeout
 */
function runCommandWithTimeout(command, options = {}, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Command timeout: ${command}`));
    }, timeout);
    
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        ...options,
      });
      clearTimeout(timer);
      resolve(result);
    } catch (error) {
      clearTimeout(timer);
      reject(error);
    }
  });
}

/**
 * Spawn async command for interactive testing
 */
function spawnInteractive(command, args = [], options = {}) {
  return spawn(command, args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    ...options,
  });
}

/**
 * Wait for condition with timeout
 */
async function waitFor(condition, timeout = 5000, interval = 100) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout waiting for condition');
}

/**
 * Capture console output
 */
class ConsoleCapture {
  constructor() {
    this.logs = [];
    this.errors = [];
    this.originalLog = console.log;
    this.originalError = console.error;
  }
  
  start() {
    console.log = (...args) => {
      this.logs.push(args.join(' '));
    };
    console.error = (...args) => {
      this.errors.push(args.join(' '));
    };
  }
  
  stop() {
    console.log = this.originalLog;
    console.error = this.originalError;
  }
  
  getLogs() {
    return this.logs;
  }
  
  getErrors() {
    return this.errors;
  }
  
  clear() {
    this.logs = [];
    this.errors = [];
  }
}

/**
 * Mock process.exit
 */
function mockProcessExit() {
  const originalExit = process.exit;
  const exitCalls = [];
  
  process.exit = (code) => {
    exitCalls.push(code);
  };
  
  return {
    restore: () => {
      process.exit = originalExit;
    },
    getCalls: () => exitCalls,
  };
}

/**
 * Create mock environment variables
 */
function withEnv(envVars, callback) {
  const originalEnv = { ...process.env };
  
  Object.assign(process.env, envVars);
  
  try {
    return callback();
  } finally {
    process.env = originalEnv;
  }
}

module.exports = {
  createTempDir,
  cleanupTempDir,
  initMockGitRepo,
  initMockBeadsRepo,
  createMockBeadsIssue,
  MockBeadsCommand,
  runCommandWithTimeout,
  spawnInteractive,
  waitFor,
  ConsoleCapture,
  mockProcessExit,
  withEnv,
};
