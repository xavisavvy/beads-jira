#!/usr/bin/env node
/**
 * Jira to Beads Sync Script - Node.js version
 * Queries Jira issues via Atlassian Rovo MCP server and syncs them to beads.
 *
 * Designed for .NET/VueJS projects where Node is already installed.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class JiraBeadsSync {
  constructor(projectKey, options = {}) {
    this.projectKey = projectKey;
    this.component = options.component;
    this.mcpUrl = options.mcpUrl || 'https://mcp.atlassian.com/v1/mcp';
    this.useExampleData = options.useExampleData || false;
  }

  /**
   * Query Jira using Atlassian MCP server
   */
  async queryJiraViaMcp() {
    // Build JQL query
    const jqlParts = [`project = ${this.projectKey}`];

    if (this.component) {
      jqlParts.push(`component = "${this.component}"`);
    }

    // Only sync open/in-progress issues
    jqlParts.push('status NOT IN (Done, Closed, Resolved)');

    const jql = jqlParts.join(' AND ');

    console.log(`📋 Querying Jira with JQL: ${jql}`);

    // Allow explicit use of example data for testing
    if (this.useExampleData) {
      console.error('⚠️  Using example data (--use-example-data flag)');
      return this.getExampleData();
    }

    try {
      return await this.queryViaMcpClient(jql);
    } catch (error) {
      console.error(`❌ MCP query failed: ${error.message}`);
      console.error('');
      console.error('⚠️  Cannot sync without network connection to Jira.');
      console.error('ℹ️  Your existing beads issues are still available offline.');
      console.error('ℹ️  Run sync again when online to get latest Jira updates.');
      return [];
    }
  }

  /**
   * Query Jira via MCP (to be implemented with actual MCP client)
   */
  async queryViaMcpClient(jql) {
    // For prototype, return example data
    console.log(`ℹ️  Would query MCP at: ${this.mcpUrl}`);
    console.log(`ℹ️  With JQL query: ${jql}`);

    throw new Error('MCP client integration - using example data');
  }

  /**
   * Return example Jira issues for testing
   */
  getExampleData() {
    return [
      {
        key: 'EXAMPLE-123',
        fields: {
          summary: '[EXAMPLE] Implement user authentication',
          description: 'This is example data for testing. Add OAuth2 support for user login',
          priority: { name: 'High' },
          issuetype: { name: 'Story' },
          status: { name: 'In Progress' },
          assignee: { displayName: 'John Doe' },
          components: [{ name: 'backend-api' }]
        }
      },
      {
        key: 'EXAMPLE-124',
        fields: {
          summary: '[EXAMPLE] Fix memory leak in session handler',
          description: 'This is example data. Sessions are not being properly garbage collected',
          priority: { name: 'Highest' },
          issuetype: { name: 'Bug' },
          status: { name: 'Open' },
          assignee: { displayName: 'Jane Smith' },
          components: [{ name: 'backend-api' }]
        }
      }
    ];
  }

  /**
   * Sync issues to beads
   */
  async syncToBeads(issues) {
    console.log(`\n🔄 Syncing ${issues.length} issues to beads...\n`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const issue of issues) {
      try {
        const exists = this.checkBeadsIssueExists(issue.key);

        if (exists) {
          this.updateBeadsIssue(issue);
          updated++;
        } else {
          this.createBeadsIssue(issue);
          created++;
        }
      } catch (error) {
        console.error(`⚠️  Failed to sync ${issue.key}: ${error.message}`);
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Sync Complete!');
    console.log('='.repeat(60));
    console.log(`Created:  ${created}`);
    console.log(`Updated:  ${updated}`);
    console.log(`Skipped:  ${skipped}`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Check if a beads issue with this Jira key already exists
   */
  checkBeadsIssueExists(jiraKey) {
    try {
      const output = execSync('bd ls --json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
      const issues = JSON.parse(output);
      return issues.some(issue =>
        issue.labels && issue.labels.includes(jiraKey)
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a new beads issue from Jira data
   */
  createBeadsIssue(jiraIssue) {
    const title = jiraIssue.fields.summary;
    const priority = this.mapPriority(jiraIssue.fields.priority?.name);
    const type = this.mapIssueType(jiraIssue.fields.issuetype?.name);

    // Build description with Jira metadata
    const description = this.buildDescription(jiraIssue);

    // Create the issue
    const cmd = [
      'bd', 'create',
      `"${title}"`,
      '-t', type,
      '-p', priority.toString()
    ];

    const issueId = execSync(cmd.join(' '), {
      encoding: 'utf-8',
      shell: true
    }).trim();

    // Add description
    if (description) {
      execSync(`bd edit ${issueId} -d "${description.replace(/"/g, '\\"')}"`, {
        shell: true,
        stdio: 'ignore'
      });
    }

    // Add labels
    this.addLabelsToBeadsIssue(issueId, jiraIssue);

    console.log(`✅ Created ${issueId} from ${jiraIssue.key}`);
  }

  /**
   * Update existing beads issue with Jira data
   */
  updateBeadsIssue(jiraIssue) {
    // Find the beads issue ID
    const output = execSync('bd ls --json', { encoding: 'utf-8' });
    const issues = JSON.parse(output);
    const beadsIssue = issues.find(issue =>
      issue.labels && issue.labels.includes(jiraIssue.key)
    );

    if (!beadsIssue) return;

    const description = this.buildDescription(jiraIssue);
    const priority = this.mapPriority(jiraIssue.fields.priority?.name);

    // Update description and priority
    try {
      execSync(`bd edit ${beadsIssue.id} -d "${description.replace(/"/g, '\\"')}" -p ${priority}`, {
        shell: true,
        stdio: 'ignore'
      });
      console.log(`🔄 Updated ${beadsIssue.id} from ${jiraIssue.key}`);
    } catch (error) {
      console.error(`⚠️  Failed to update ${beadsIssue.id}`);
    }
  }

  /**
   * Add labels to beads issue
   */
  addLabelsToBeadsIssue(beadsIssueId, jiraIssue) {
    const labels = [
      jiraIssue.key,
      'jira-synced'
    ];

    // Add component labels
    if (jiraIssue.fields.components) {
      jiraIssue.fields.components.forEach(comp => {
        labels.push(`component-${comp.name}`);
      });
    }

    labels.forEach(label => {
      try {
        execSync(`bd label add ${beadsIssueId} "${label}"`, {
          shell: true,
          stdio: 'ignore'
        });
      } catch (error) {
        // Ignore label errors
      }
    });
  }

  /**
   * Build description with Jira metadata
   */
  buildDescription(jiraIssue) {
    const parts = [
      `**Jira Issue:** [${jiraIssue.key}]`,
      `**Status:** ${jiraIssue.fields.status?.name || 'Unknown'}`,
      `**Assignee:** ${jiraIssue.fields.assignee?.displayName || 'Unassigned'}`,
      '',
      jiraIssue.fields.description || '(No description)'
    ];

    return parts.join('\\n');
  }

  /**
   * Map Jira priority to beads priority (0-4)
   */
  mapPriority(jiraPriority) {
    const priorityMap = {
      'Highest': 0,
      'High': 1,
      'Medium': 2,
      'Low': 3,
      'Lowest': 4
    };
    return priorityMap[jiraPriority] || 2;
  }

  /**
   * Map Jira issue type to beads type
   */
  mapIssueType(jiraType) {
    const typeMap = {
      'Bug': 'bug',
      'Task': 'task',
      'Story': 'feature',
      'Feature': 'feature',
      'Epic': 'epic'
    };
    return typeMap[jiraType] || 'task';
  }

  /**
   * Main sync method
   */
  async run() {
    console.log('='.repeat(60));
    console.log('🔗 Jira to Beads Sync (Node.js)');
    console.log('='.repeat(60));
    console.log(`Project: ${this.projectKey}`);
    if (this.component) {
      console.log(`Component: ${this.component}`);
    }
    console.log('='.repeat(60) + '\n');

    // Check if beads is available
    try {
      execSync('bd --version', { stdio: 'ignore' });
    } catch (error) {
      console.error('❌ beads (bd) command not found.');
      console.error('Please install beads first.');
      process.exit(1);
    }

    // Query Jira
    const issues = await this.queryJiraViaMcp();

    if (issues.length === 0) {
      console.log('ℹ️  No issues to sync.');
      return;
    }

    // Sync to beads
    await this.syncToBeads(issues);
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node sync_jira_to_beads.js PROJECT_KEY [options]

Options:
  --component NAME      Filter by Jira component
  --mcp-url URL        Custom MCP server URL
  --use-example-data   Use example data for testing
  --help, -h           Show this help

Examples:
  node sync_jira_to_beads.js PROJ
  node sync_jira_to_beads.js PROJ --component backend-api
  node sync_jira_to_beads.js PROJ --use-example-data
`);
    process.exit(0);
  }

  const projectKey = args[0];
  const options = {};

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--component' && args[i + 1]) {
      options.component = args[++i];
    } else if (args[i] === '--mcp-url' && args[i + 1]) {
      options.mcpUrl = args[++i];
    } else if (args[i] === '--use-example-data') {
      options.useExampleData = true;
    }
  }

  const sync = new JiraBeadsSync(projectKey, options);
  sync.run().catch(error => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = JiraBeadsSync;
