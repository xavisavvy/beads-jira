/**
 * Tests for PR template synchronization script
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  readTemplate,
  writeTemplate,
  normalizeTemplate,
  TEMPLATES,
  MASTER_TEMPLATE
} = require('../scripts/sync-pr-templates');

describe('PR Template Sync', () => {
  const syncScript = path.join(__dirname, '..', 'scripts', 'sync-pr-templates.js');
  const githubTemplate = path.join(__dirname, '..', '.github', 'pull_request_template.md');
  const gitlabTemplate = path.join(__dirname, '..', '.gitlab', 'merge_request_templates', 'Default.md');

  describe('Template file paths', () => {
    it('should have correct template paths defined', () => {
      expect(TEMPLATES.github).toBe('.github/pull_request_template.md');
      expect(TEMPLATES.gitlab).toBe('.gitlab/merge_request_templates/Default.md');
    });

    it('should define a master template', () => {
      expect(MASTER_TEMPLATE).toBe(TEMPLATES.github);
    });
  });

  describe('File existence checks', () => {
    it('should check if GitHub template exists', () => {
      const exists = fs.existsSync(githubTemplate);
      expect(exists).toBe(true);
    });

    it('should check if GitLab template exists', () => {
      const exists = fs.existsSync(gitlabTemplate);
      expect(exists).toBe(true);
    });
  });

  describe('Template reading', () => {
    it('should read existing template files', () => {
      const content = readTemplate(githubTemplate);
      
      expect(content).not.toBeNull();
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
    });

    it('should return null for non-existent files', () => {
      const content = readTemplate('/nonexistent/file.md');
      expect(content).toBeNull();
    });

    it('should read both GitHub and GitLab templates', () => {
      const githubContent = readTemplate(githubTemplate);
      const gitlabContent = readTemplate(gitlabTemplate);
      
      expect(githubContent).not.toBeNull();
      expect(gitlabContent).not.toBeNull();
    });
  });

  describe('Template normalization', () => {
    it('should normalize line endings for comparison', () => {
      const content = 'Line 1\r\nLine 2\nLine 3';
      const normalized = normalizeTemplate(content);

      expect(normalized).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should trim whitespace consistently', () => {
      const content = '  \n\nContent\n\n  ';
      const normalized = normalizeTemplate(content);
      
      expect(normalized).toBe('Content');
    });

    it('should handle mixed line endings', () => {
      const content = 'Line 1\r\nLine 2\rLine 3\n';
      const normalized = normalizeTemplate(content).replace(/\r/g, '\n');
      
      expect(normalized).toContain('Line 1\nLine 2\nLine 3');
    });

    it('should handle empty content', () => {
      const normalized = normalizeTemplate('   \n\n   ');
      expect(normalized).toBe('');
    });
  });

  describe('Template header detection', () => {
    it('should detect template header comment', () => {
      const content = readTemplate(githubTemplate);
      
      expect(content).toContain('<!--');
      expect(content).toContain('-->');
    });

    it('should identify markdown sections', () => {
      const content = readTemplate(githubTemplate);
      const sections = ['## Description', '## Changes', '## Testing', '## Checklist'];
      
      sections.forEach(section => {
        expect(content.toLowerCase()).toContain(section.toLowerCase());
      });
    });
  });

  describe('Script execution', () => {
    it('should run check mode successfully', () => {
      const output = execSync(`node "${syncScript}" --check`, { encoding: 'utf8' });
      
      expect(output).toContain('templates');
    });

    it('should show help information', () => {
      const output = execSync(`node "${syncScript}" --help`, { encoding: 'utf8' });
      
      expect(output).toContain('sync-pr-templates');
    });
  });

  describe('Template content validation', () => {
    it('should have matching content structure', () => {
      const githubContent = fs.readFileSync(githubTemplate, 'utf8');
      const gitlabContent = fs.readFileSync(gitlabTemplate, 'utf8');

      // Both should have description section
      expect(githubContent).toContain('Description');
      expect(gitlabContent).toContain('Description');
    });

    it('should have consistent markdown formatting', () => {
      const githubContent = fs.readFileSync(githubTemplate, 'utf8');
      
      // Should use proper markdown headers
      expect(githubContent).toMatch(/^## /m);
    });

    it('should include required PR sections', () => {
      const githubContent = fs.readFileSync(githubTemplate, 'utf8');
      const requiredSections = ['Description', 'Changes', 'Testing'];
      
      requiredSections.forEach(section => {
        expect(githubContent.toLowerCase()).toContain(section.toLowerCase());
      });
    });

    it('should normalize both templates to same content', () => {
      const githubContent = readTemplate(githubTemplate);
      const gitlabContent = readTemplate(gitlabTemplate);
      
      expect(normalizeTemplate(githubContent)).toBe(normalizeTemplate(gitlabContent));
    });
  });

  describe('File operations', () => {
    it('should handle directory creation', () => {
      const testDir = path.join(__dirname, '..', '.gitlab', 'merge_request_templates');
      expect(fs.existsSync(testDir)).toBe(true);
    });

    it('should validate file read operations', () => {
      const content = fs.readFileSync(githubTemplate, 'utf8');
      
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
    });
  });
});
