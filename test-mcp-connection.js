#!/usr/bin/env node
/**
 * Test MCP Connection
 * Validates that the Atlassian MCP integration is working
 */

const AtlassianMCPClient = require('./lib/mcp-client');

async function testConnection() {
  console.log('='.repeat(60));
  console.log('🔍 Testing Atlassian MCP Connection');
  console.log('='.repeat(60));
  console.log('');

  const mcpUrl = process.env.MCP_URL || 'https://mcp.atlassian.com/v1/mcp';

  console.log(`MCP Server: ${mcpUrl}`);
  console.log('');

  const client = new AtlassianMCPClient({
    mcpServerUrl: mcpUrl
  });

  try {
    const success = await client.testConnection();

    if (success) {
      console.log('');
      console.log('✅ MCP connection test successful!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Run: node sync_jira_to_beads.js YOUR_PROJECT_KEY');
      console.log('2. Or use: npm run sync -- YOUR_PROJECT_KEY');
      console.log('');
      process.exit(0);
    } else {
      console.log('');
      console.log('❌ MCP connection test failed');
      console.log('');
      console.log('Troubleshooting:');
      console.log('1. Check network connectivity');
      console.log('2. Verify MCP_URL environment variable');
      console.log('3. Authenticate: npx -y mcp-remote@latest ' + mcpUrl);
      console.log('4. Check Atlassian MCP server status');
      console.log('');
      process.exit(1);
    }
  } catch (error) {
    console.error('');
    console.error(`❌ Fatal error: ${error.message}`);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    console.error('');
    process.exit(1);
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node test-mcp-connection.js [options]

Options:
  --help, -h           Show this help

Environment Variables:
  MCP_URL              Custom MCP server URL (default: https://mcp.atlassian.com/v1/mcp)

Examples:
  node test-mcp-connection.js
  MCP_URL=https://custom-mcp.example.com node test-mcp-connection.js
`);
    process.exit(0);
  }

  testConnection().catch(error => {
    console.error(`\n❌ Unexpected error: ${error.message}\n`);
    process.exit(1);
  });
}

module.exports = { testConnection };
