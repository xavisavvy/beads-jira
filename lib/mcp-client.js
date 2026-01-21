#!/usr/bin/env node
/**
 * MCP Client for Atlassian Jira Integration
 * Uses the official MCP SDK to communicate with Jira via Atlassian Rovo MCP
 */

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

class AtlassianMCPClient {
  constructor(options = {}) {
    this.jiraUrl = options.jiraUrl || process.env.JIRA_URL;
    this.apiToken = options.apiToken || process.env.JIRA_API_TOKEN;
    this.email = options.email || process.env.JIRA_EMAIL;
    this.mcpServerUrl = options.mcpServerUrl || 'https://mcp.atlassian.com/v1/mcp';
    this.client = null;
    this.transport = null;
  }

  /**
   * Connect to the MCP server
   */
  async connect() {
    try {
      // Create stdio transport for MCP communication
      this.transport = new StdioClientTransport({
        command: 'npx',
        args: ['-y', 'mcp-remote@latest', this.mcpServerUrl]
      });

      // Initialize the MCP client
      this.client = new Client(
        {
          name: 'jira-beads-sync',
          version: '1.0.0'
        },
        {
          capabilities: {}
        }
      );

      await this.client.connect(this.transport);
      console.log('✅ Connected to Atlassian MCP server');
      return true;
    } catch (error) {
      console.error(`❌ Failed to connect to MCP server: ${error.message}`);
      throw error;
    }
  }

  /**
   * Query Jira issues using JQL
   */
  async queryJira(jql, options = {}) {
    if (!this.client) {
      throw new Error('MCP client not connected. Call connect() first.');
    }

    try {
      const maxResults = options.maxResults || 100;
      const startAt = options.startAt || 0;

      // Call the MCP tool for Jira search
      const result = await this.client.callTool({
        name: 'jira-search',
        arguments: {
          jql: jql,
          maxResults: maxResults,
          startAt: startAt,
          fields: [
            'summary',
            'description',
            'priority',
            'status',
            'issuetype',
            'assignee',
            'components',
            'labels',
            'created',
            'updated'
          ]
        }
      });

      return this.parseJiraResponse(result);
    } catch (error) {
      console.error(`❌ Jira query failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parse the MCP response into Jira issue format
   */
  parseJiraResponse(result) {
    if (!result || !result.content || result.content.length === 0) {
      return [];
    }

    // MCP returns content as an array with text/JSON
    const content = result.content[0];
    
    if (content.type === 'text') {
      try {
        const data = JSON.parse(content.text);
        return data.issues || [];
      } catch (e) {
        console.error('Failed to parse MCP response:', e.message);
        return [];
      }
    }

    return [];
  }

  /**
   * Get available MCP tools
   */
  async listTools() {
    if (!this.client) {
      throw new Error('MCP client not connected. Call connect() first.');
    }

    try {
      const response = await this.client.listTools();
      return response.tools || [];
    } catch (error) {
      console.error(`❌ Failed to list tools: ${error.message}`);
      return [];
    }
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect() {
    if (this.client) {
      try {
        await this.client.close();
        console.log('✅ Disconnected from MCP server');
      } catch (error) {
        console.error(`⚠️  Error disconnecting: ${error.message}`);
      }
      this.client = null;
      this.transport = null;
    }
  }

  /**
   * Test the MCP connection
   */
  async testConnection() {
    try {
      await this.connect();
      const tools = await this.listTools();
      
      console.log('\n📊 Available MCP Tools:');
      tools.forEach(tool => {
        console.log(`  - ${tool.name}: ${tool.description || '(no description)'}`);
      });
      
      await this.disconnect();
      return true;
    } catch (error) {
      console.error(`❌ Connection test failed: ${error.message}`);
      return false;
    }
  }
}

module.exports = AtlassianMCPClient;
