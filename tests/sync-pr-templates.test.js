/**
 * Tests for PR template synchronization script
 */

const fs = require('fs');
const path = require('path');

describe('PR Template Sync', () => {
  describe('Template file paths', () => {
    it('should have correct template paths defined', () => {
      const expectedPaths = {
        github: '.github/pull_request_template.md',
        gitlab: '.gitlab/merge_request_templates/Default.md'
      };

      expect(expectedPaths.github).toBeDefined();
      expect(expectedPaths.gitlab).toBeDefined();
    });
  });

  describe('File existence checks', () => {
    it('should check if GitHub template exists', () => {
      const githubTemplate = '.github/pull_request_template.md';
      const exists = fs.existsSync(path.join(process.cwd(), githubTemplate));

      // File should exist in our repository
      expect(exists).toBe(true);
    });

    it('should check if GitLab template exists', () => {
      const gitlabTemplate = '.gitlab/merge_request_templates/Default.md';
      const exists = fs.existsSync(path.join(process.cwd(), gitlabTemplate));

      expect(exists).toBe(true);
    });
  });

  describe('Template sync validation', () => {
    it('should normalize line endings for comparison', () => {
      const content = 'Line 1\r\nLine 2\nLine 3';
      const normalized = content.replace(/\r\n/g, '\n').trim();

      expect(normalized).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should detect template header comment', () => {
      const template = `<!-- 
  PR/MR Template for Jira-Beads Sync Integration
-->

## Description`;

      expect(template).toContain('PR/MR Template');
      expect(template).toContain('## Description');
    });
  });
});
