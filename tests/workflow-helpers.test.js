/**
 * Tests for workflow helper utilities
 */

describe('Workflow Helpers', () => {
  describe('Branch name generation', () => {
    it('should slugify issue titles correctly', () => {
      const title = 'Fix Button Alignment on Mobile';
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/ /g, '-')
        .substring(0, 50);

      expect(slug).toBe('fix-button-alignment-on-mobile');
    });

    it('should handle special characters in titles', () => {
      const title = 'Add OAuth2 Support (v2.0)';
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/ /g, '-')
        .substring(0, 50);

      expect(slug).toBe('add-oauth2-support-v20');
    });

    it('should truncate long titles', () => {
      const longTitle = 'A'.repeat(100);
      const slug = longTitle
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/ /g, '-')
        .substring(0, 50);

      expect(slug.length).toBe(50);
    });
  });

  describe('Jira key extraction', () => {
    it('should match valid Jira keys', () => {
      const labels = ['jira-synced', 'PROJ-123', 'component-backend'];
      const jiraKey = labels.find((label) => /^[A-Z]+-[0-9]+$/.test(label));

      expect(jiraKey).toBe('PROJ-123');
    });

    it('should not match invalid formats', () => {
      const labels = ['proj-123', 'PROJ123', 'PROJ-'];
      const jiraKey = labels.find((label) => /^[A-Z]+-[0-9]+$/.test(label));

      expect(jiraKey).toBeUndefined();
    });
  });

  describe('Branch name format', () => {
    it('should generate correct branch name with Jira key', () => {
      const issueType = 'feature';
      const jiraKey = 'PROJ-123';
      const slug = 'add-dark-mode';

      const branchName = `${issueType}/${jiraKey}-${slug}`;

      expect(branchName).toBe('feature/PROJ-123-add-dark-mode');
    });

    it('should generate correct branch name without Jira key', () => {
      const issueType = 'bug';
      const issueId = 'bd-a1b2';
      const slug = 'fix-crash';

      const branchName = `${issueType}/${issueId}-${slug}`;

      expect(branchName).toBe('bug/bd-a1b2-fix-crash');
    });
  });
});
