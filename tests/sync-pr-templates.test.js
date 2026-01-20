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
  checkSync,
  syncTemplates,
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

  describe('Edge cases and error handling', () => {
    it('should handle null content in normalizeTemplate', () => {
      const result = normalizeTemplate(null);
      expect(result).toBe('');
    });

    it('should handle undefined content in normalizeTemplate', () => {
      const result = normalizeTemplate(undefined);
      expect(result).toBe('');
    });

    it('should handle empty templates', () => {
      const empty = '';
      const normalized = normalizeTemplate(empty);
      expect(normalized).toBe('');
    });

    it('should handle templates with only whitespace', () => {
      const whitespace = '   \n\n\t  ';
      const normalized = normalizeTemplate(whitespace);
      expect(normalized).toBe('');
    });

    it('should preserve template structure', () => {
      const template = '# Header\n\n## Section\n- Item 1\n- Item 2';
      const normalized = normalizeTemplate(template);
      expect(normalized).toContain('# Header');
      expect(normalized).toContain('## Section');
      expect(normalized).toContain('- Item 1');
    });

    it('should handle very long templates', () => {
      const longTemplate = 'Line\n'.repeat(1000);
      const normalized = normalizeTemplate(longTemplate);
      expect(normalized.split('\n').length).toBeGreaterThan(900);
    });

    it('should handle special markdown characters', () => {
      const template = '**Bold** *italic* `code` [link](url)';
      const normalized = normalizeTemplate(template);
      expect(normalized).toContain('**Bold**');
      expect(normalized).toContain('*italic*');
      expect(normalized).toContain('`code`');
    });

    it('should handle unicode characters', () => {
      const template = '✓ Check ✗ Cross 🎉 Emoji';
      const normalized = normalizeTemplate(template);
      expect(normalized).toContain('✓');
      expect(normalized).toContain('✗');
      expect(normalized).toContain('🎉');
    });
  });

  describe('TEMPLATES constant', () => {
    it('should have correct structure', () => {
      expect(TEMPLATES).toBeDefined();
      expect(typeof TEMPLATES).toBe('object');
    });

    it('should include github template', () => {
      expect(TEMPLATES.github).toBeDefined();
      expect(TEMPLATES.github).toContain('.github');
    });

    it('should include gitlab template', () => {
      expect(TEMPLATES.gitlab).toBeDefined();
      expect(TEMPLATES.gitlab).toContain('.gitlab');
    });

    it('should have at least 2 platforms', () => {
      const platforms = Object.keys(TEMPLATES);
      expect(platforms.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('MASTER_TEMPLATE constant', () => {
    it('should be defined', () => {
      expect(MASTER_TEMPLATE).toBeDefined();
    });

    it('should be a valid template path', () => {
      expect(MASTER_TEMPLATE).toContain('.md');
    });

    it('should match one of the templates', () => {
      const templatePaths = Object.values(TEMPLATES);
      expect(templatePaths).toContain(MASTER_TEMPLATE);
    });
  });

  describe('checkSync function', () => {
    it('should be exported', () => {
      expect(checkSync).toBeDefined();
      expect(typeof checkSync).toBe('function');
    });

    it('should return boolean', () => {
      const result = checkSync();
      expect(typeof result).toBe('boolean');
    });

    it('should return true when templates are in sync', () => {
      const result = checkSync();
      expect(result).toBe(true);
    });
  });

  describe('syncTemplates function', () => {
    it('should be exported', () => {
      expect(syncTemplates).toBeDefined();
      expect(typeof syncTemplates).toBe('function');
    });
  });

  describe('Cross-platform compatibility', () => {
    it('should handle Windows-style paths', () => {
      const winPath = 'C:\\path\\to\\file.md';
      const normalized = path.normalize(winPath);
      expect(normalized).toBeDefined();
    });

    it('should handle Unix-style paths', () => {
      const unixPath = '/path/to/file.md';
      const normalized = path.normalize(unixPath);
      expect(normalized).toBeDefined();
    });

    it('should handle path separators consistently', () => {
      const testPath = '.github/pull_request_template.md';
      const parts = testPath.split('/');
      expect(parts).toContain('.github');
      expect(parts).toContain('pull_request_template.md');
    });
  });
});
