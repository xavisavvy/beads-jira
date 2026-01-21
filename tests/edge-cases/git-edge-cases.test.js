/**
 * @fileoverview Edge case tests for git operations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Git Edge Cases', () => {
  let testDir;
  
  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-edge-test-'));
  });
  
  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Repository State Edge Cases', () => {
    test('handles detached HEAD state', () => {
      execSync('git init', { cwd: testDir });
      execSync('git config user.email "test@example.com"', { cwd: testDir });
      execSync('git config user.name "Test User"', { cwd: testDir });
      execSync('git config advice.detachedHead false', { cwd: testDir });
      
      fs.writeFileSync(path.join(testDir, 'test.txt'), 'content');
      execSync('git add .', { cwd: testDir });
      execSync('git commit -m "initial"', { cwd: testDir });
      
      const commitHash = execSync('git rev-parse HEAD', { cwd: testDir }).toString().trim();
      execSync(`git checkout ${commitHash}`, { cwd: testDir, stdio: 'pipe' });
      
      const status = execSync('git status', { cwd: testDir }).toString();
      expect(status).toContain('HEAD detached');
    });

    test('handles empty repository (no commits)', () => {
      execSync('git init', { cwd: testDir });
      
      expect(() => {
        execSync('git rev-parse HEAD', { cwd: testDir, stdio: 'pipe' });
      }).toThrow();
    });

    test('handles repository with only untracked files', () => {
      execSync('git init', { cwd: testDir });
      fs.writeFileSync(path.join(testDir, 'untracked.txt'), 'untracked');
      
      const status = execSync('git status --porcelain', { cwd: testDir }).toString();
      expect(status).toMatch(/^\?\? untracked\.txt/m);
    });

    test('handles merge conflicts', () => {
      execSync('git init', { cwd: testDir });
      execSync('git config user.email "test@example.com"', { cwd: testDir });
      execSync('git config user.name "Test User"', { cwd: testDir });
      
      fs.writeFileSync(path.join(testDir, 'file.txt'), 'main content');
      execSync('git add .', { cwd: testDir });
      execSync('git commit -m "main"', { cwd: testDir });
      
      execSync('git checkout -b feature', { cwd: testDir, stdio: 'pipe' });
      fs.writeFileSync(path.join(testDir, 'file.txt'), 'feature content');
      execSync('git commit -am "feature"', { cwd: testDir });
      
      execSync('git checkout -', { cwd: testDir, stdio: 'pipe' });
      fs.writeFileSync(path.join(testDir, 'file.txt'), 'main modified');
      execSync('git commit -am "main modify"', { cwd: testDir });
      
      try {
        execSync('git merge feature', { cwd: testDir, stdio: 'pipe' });
      } catch (error) {
        const status = execSync('git status', { cwd: testDir }).toString();
        expect(status).toContain('Unmerged paths');
      }
    });

    test('handles rebase command', () => {
      execSync('git init', { cwd: testDir });
      execSync('git config user.email "test@example.com"', { cwd: testDir });
      execSync('git config user.name "Test User"', { cwd: testDir });
      
      fs.writeFileSync(path.join(testDir, 'file1.txt'), 'file1');
      execSync('git add . && git commit -m "commit1"', { cwd: testDir });
      
      const mainBranch = execSync('git branch --show-current', { cwd: testDir }).toString().trim();
      
      fs.writeFileSync(path.join(testDir, 'file2.txt'), 'file2');
      execSync('git add . && git commit -m "commit2"', { cwd: testDir });
      
      execSync('git checkout -b feature HEAD~1', { cwd: testDir, stdio: 'pipe' });
      fs.writeFileSync(path.join(testDir, 'file3.txt'), 'file3');
      execSync('git add . && git commit -m "commit3"', { cwd: testDir });
      
      // Rebase onto main branch
      execSync(`git rebase ${mainBranch}`, { cwd: testDir, stdio: 'pipe' });
      
      // Verify all commits are present
      const log = execSync('git log --oneline', { cwd: testDir }).toString();
      expect(log).toContain('commit3');
      expect(log).toContain('commit2');
    });
  });

  describe('Branch Name Edge Cases', () => {
    beforeEach(() => {
      execSync('git init', { cwd: testDir });
      execSync('git config user.email "test@example.com"', { cwd: testDir });
      execSync('git config user.name "Test User"', { cwd: testDir });
      fs.writeFileSync(path.join(testDir, 'file.txt'), 'content');
      execSync('git add . && git commit -m "initial"', { cwd: testDir });
    });

    test('handles branch names with special characters', () => {
      const specialBranches = [
        'feature/TEST-123',
        'bugfix/issue-456',
        'hotfix/v1.0.0',
        'feature/user_profile',
      ];
      
      specialBranches.forEach(branch => {
        execSync(`git checkout -b ${branch}`, { cwd: testDir });
        execSync('git checkout -', { cwd: testDir });
      });
      
      const branches = execSync('git branch', { cwd: testDir }).toString();
      specialBranches.forEach(branch => {
        expect(branches).toContain(branch);
      });
    });

    test('handles very long branch names', () => {
      const longName = 'feature/' + 'a'.repeat(200);
      execSync(`git checkout -b "${longName}"`, { cwd: testDir });
      
      const currentBranch = execSync('git branch --show-current', { cwd: testDir }).toString().trim();
      expect(currentBranch).toBe(longName);
    });

    test('rejects invalid branch names', () => {
      const invalidNames = [
        'feature..double-dot',
        'feature.',
        'feature@{',
        '-starts-with-dash',
      ];
      
      invalidNames.forEach(name => {
        expect(() => {
          execSync(`git checkout -b "${name}"`, { cwd: testDir, stdio: 'pipe' });
        }).toThrow();
      });
    });
  });

  describe('Remote Operations Edge Cases', () => {
    test('handles missing remote', () => {
      execSync('git init', { cwd: testDir });
      
      expect(() => {
        execSync('git remote get-url origin', { cwd: testDir, stdio: 'pipe' });
      }).toThrow();
    });

    test('handles multiple remotes', () => {
      execSync('git init', { cwd: testDir });
      execSync('git remote add origin https://github.com/user/repo.git', { cwd: testDir });
      execSync('git remote add upstream https://github.com/upstream/repo.git', { cwd: testDir });
      
      const remotes = execSync('git remote', { cwd: testDir }).toString();
      expect(remotes).toContain('origin');
      expect(remotes).toContain('upstream');
    });

    test('handles invalid remote URL', () => {
      execSync('git init', { cwd: testDir });
      
      // Git accepts most strings as URLs, so we just verify it doesn't crash
      execSync('git remote add origin "not-a-valid-url"', { cwd: testDir });
      const remotes = execSync('git remote -v', { cwd: testDir }).toString();
      expect(remotes).toContain('origin');
    });
  });

  describe('Commit Message Edge Cases', () => {
    beforeEach(() => {
      execSync('git init', { cwd: testDir });
      execSync('git config user.email "test@example.com"', { cwd: testDir });
      execSync('git config user.name "Test User"', { cwd: testDir });
    });

    test('handles empty commit message', () => {
      fs.writeFileSync(path.join(testDir, 'file.txt'), 'content');
      execSync('git add .', { cwd: testDir });
      
      expect(() => {
        execSync('git commit --allow-empty-message -m ""', { cwd: testDir, stdio: 'pipe' });
      }).not.toThrow();
    });

    test('handles very long commit message', () => {
      fs.writeFileSync(path.join(testDir, 'file.txt'), 'content');
      execSync('git add .', { cwd: testDir });
      
      const longMessage = 'a'.repeat(10000);
      execSync(`git commit -m "${longMessage}"`, { cwd: testDir });
      
      const log = execSync('git log -1 --pretty=%B', { cwd: testDir }).toString();
      expect(log.trim()).toBe(longMessage);
    });

    test('handles multiline commit message', () => {
      fs.writeFileSync(path.join(testDir, 'file.txt'), 'content');
      execSync('git add .', { cwd: testDir });
      
      const message = 'Subject line\n\nBody paragraph 1\n\nBody paragraph 2';
      execSync(`git commit -m "${message}"`, { cwd: testDir });
      
      const log = execSync('git log -1 --pretty=%B', { cwd: testDir }).toString();
      expect(log).toContain('Subject line');
      expect(log).toContain('Body paragraph 1');
    });

    test('handles commit message with special characters', () => {
      fs.writeFileSync(path.join(testDir, 'file.txt'), 'content');
      execSync('git add .', { cwd: testDir });
      
      const message = 'feat: add feature with "quotes" and \'apostrophes\' & symbols';
      execSync('git commit -m "' + message.replace(/"/g, '\\"') + '"', { cwd: testDir });
      
      const log = execSync('git log -1 --pretty=%s', { cwd: testDir }).toString().trim();
      expect(log).toContain('quotes');
      expect(log).toContain('apostrophes');
    });
  });

  describe('File System Edge Cases', () => {
    beforeEach(() => {
      execSync('git init', { cwd: testDir });
      execSync('git config user.email "test@example.com"', { cwd: testDir });
      execSync('git config user.name "Test User"', { cwd: testDir });
    });

    test('handles files with spaces in names', () => {
      const fileName = 'file with spaces.txt';
      fs.writeFileSync(path.join(testDir, fileName), 'content');
      execSync('git add .', { cwd: testDir });
      execSync('git commit -m "add file with spaces"', { cwd: testDir });
      
      const status = execSync('git status', { cwd: testDir }).toString();
      expect(status).toContain('nothing to commit');
    });

    test('handles files with unicode characters', () => {
      const fileName = 'файл-文件-ファイル.txt';
      fs.writeFileSync(path.join(testDir, fileName), 'content');
      execSync('git add .', { cwd: testDir });
      execSync('git commit -m "unicode file"', { cwd: testDir });
      
      const files = execSync('git ls-files', { cwd: testDir }).toString();
      // Git may escape unicode characters, so check the file exists
      expect(files.length).toBeGreaterThan(0);
      expect(fs.existsSync(path.join(testDir, fileName))).toBe(true);
    });

    test('handles very large files', () => {
      const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
      fs.writeFileSync(path.join(testDir, 'large.txt'), largeContent);
      execSync('git add .', { cwd: testDir });
      execSync('git commit -m "large file"', { cwd: testDir });
      
      const status = execSync('git status', { cwd: testDir }).toString();
      expect(status).toContain('nothing to commit');
    });

    test('handles symbolic links', () => {
      if (os.platform() === 'win32') {
        return; // Skip on Windows
      }
      
      fs.writeFileSync(path.join(testDir, 'target.txt'), 'content');
      fs.symlinkSync('target.txt', path.join(testDir, 'link.txt'));
      
      execSync('git add .', { cwd: testDir });
      execSync('git commit -m "add symlink"', { cwd: testDir });
      
      const files = execSync('git ls-files', { cwd: testDir }).toString();
      expect(files).toContain('link.txt');
    });
  });
});
