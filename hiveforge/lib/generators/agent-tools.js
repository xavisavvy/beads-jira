/**
 * HiveForge Agent Tools Generator
 * Installs and configures AI workflow tools
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { success, error, info, warning } = require('../utils/prompts');
const { loadTemplate, getTemplatesDir } = require('../utils/templates');

/**
 * Agent tool configurations
 */
const tools = {
  beads: {
    name: 'Beads',
    description: 'Issue tracking as code - syncs issues to git',
    installCommand: null, // Handled by generator
    files: ['.beads/config.yaml', '.beads/README.md'],
    postInstall: 'Run `bd init` to initialize if not already done'
  },
  cleo: {
    name: 'Cleo',
    description: 'Task management for AI agents - anti-hallucination, stable IDs',
    installCommand: 'npm install -g @cleo/cli',
    files: ['.cleo/config.json'],
    postInstall: 'Run `cleo init` to start using task management'
  },
  ralph: {
    name: 'Ralph',
    description: 'Autonomous development loops - runs AI agents iteratively',
    installCommand: 'npm install -g @ralph/cli',
    files: ['.ralph/config.yaml'],
    postInstall: 'Run `ralph setup` to configure autonomous workflows'
  }
};

/**
 * Generate tool configuration files
 * @param {string} tool - Tool identifier
 * @param {object} config - HiveForge configuration
 * @returns {string[]} List of generated files
 */
async function generate(tool, config) {
  const toolConfig = tools[tool];
  if (!toolConfig) {
    throw new Error(`Unknown tool: ${tool}`);
  }

  const files = [];
  const { projectPath } = config;

  switch (tool) {
    case 'beads':
      files.push(...(await generateBeadsConfig(projectPath, config)));
      break;
    case 'cleo':
      files.push(...(await generateCleoConfig(projectPath, config)));
      break;
    case 'ralph':
      files.push(...(await generateRalphConfig(projectPath, config)));
      break;
  }

  return files;
}

/**
 * Generate Beads configuration
 */
async function generateBeadsConfig(projectPath, config) {
  const files = [];
  const beadsDir = path.join(projectPath, '.beads');

  if (!fs.existsSync(beadsDir)) {
    fs.mkdirSync(beadsDir, { recursive: true });
  }

  // Create README
  const readmePath = path.join(beadsDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    const readme = `# Beads - Issue Tracking as Code

This directory contains issue data synced from your issue tracker.

## Files

- \`config.yaml\` - Sync configuration
- \`issues.jsonl\` - Synced issues (auto-generated)
- \`interactions.jsonl\` - Issue interactions (auto-generated)

## Commands

\`\`\`bash
# View available issues
bd ready

# Start working on an issue
npm run start -- bd-xxx

# Finish and create PR
npm run finish -- bd-xxx

# Sync issues manually
npx hiveforge sync
\`\`\`

## Documentation

See [Beads Documentation](https://github.com/steveyegge/beads) for more information.
`;
    fs.writeFileSync(readmePath, readme);
    files.push('.beads/README.md');
  }

  // Create .gitignore
  const gitignorePath = path.join(beadsDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, '# Keep issue data but ignore temp files\n*.tmp\n*.bak\n');
    files.push('.beads/.gitignore');
  }

  return files;
}

/**
 * Generate Cleo configuration
 */
async function generateCleoConfig(projectPath, config) {
  const files = [];
  const cleoDir = path.join(projectPath, '.cleo');

  if (!fs.existsSync(cleoDir)) {
    fs.mkdirSync(cleoDir, { recursive: true });
  }

  // Create config.json
  const configPath = path.join(cleoDir, 'config.json');
  if (!fs.existsSync(configPath)) {
    const cleoConfig = {
      version: '1.0.0',
      project: path.basename(projectPath),
      taskIdPrefix: 'TASK',
      stableIds: true,
      antiHallucination: {
        enabled: true,
        verifyTasksExist: true,
        requireTaskContext: true
      },
      integration: {
        beads: config.agentTools && config.agentTools.includes('beads'),
        issueTracker: config.issueTracker || null
      }
    };
    fs.writeFileSync(configPath, JSON.stringify(cleoConfig, null, 2));
    files.push('.cleo/config.json');
  }

  // Create README
  const readmePath = path.join(cleoDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    const readme = `# Cleo - Task Management for AI Agents

Cleo provides stable task IDs and anti-hallucination features for AI coding agents.

## Features

- **Stable IDs**: Tasks maintain consistent identifiers across sessions
- **Anti-Hallucination**: Prevents AI agents from inventing non-existent tasks
- **Context Tracking**: Maintains task context for better AI understanding

## Usage

\`\`\`bash
# List tasks
cleo list

# Create a task
cleo add "Implement feature X"

# Mark task complete
cleo done TASK-001

# Show task context
cleo context TASK-001
\`\`\`

## Configuration

Edit \`.cleo/config.json\` to customize behavior.
`;
    fs.writeFileSync(readmePath, readme);
    files.push('.cleo/README.md');
  }

  return files;
}

/**
 * Generate Ralph configuration
 */
async function generateRalphConfig(projectPath, config) {
  const files = [];
  const ralphDir = path.join(projectPath, '.ralph');

  if (!fs.existsSync(ralphDir)) {
    fs.mkdirSync(ralphDir, { recursive: true });
  }

  // Create config.yaml
  const configPath = path.join(ralphDir, 'config.yaml');
  if (!fs.existsSync(configPath)) {
    const ralphConfig = `# Ralph - Autonomous Development Loops
# Generated by HiveForge

version: "1.0"

project:
  name: ${path.basename(projectPath)}

loops:
  # Example: Run tests on file changes
  test-on-change:
    trigger: file-change
    patterns:
      - "src/**/*.js"
      - "src/**/*.ts"
    action: npm test

  # Example: Lint on save
  lint-on-save:
    trigger: file-save
    patterns:
      - "**/*.js"
      - "**/*.ts"
    action: npm run lint:fix

  # Example: AI review on commit
  ai-review:
    trigger: pre-commit
    action: ralph ai-review
    enabled: false  # Enable when ready

settings:
  max_iterations: 10
  timeout_minutes: 30
  notify_on_complete: true
`;
    fs.writeFileSync(configPath, ralphConfig);
    files.push('.ralph/config.yaml');
  }

  // Create README
  const readmePath = path.join(ralphDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    const readme = `# Ralph - Autonomous Development Loops

Ralph runs AI agents iteratively to complete development tasks autonomously.

## Features

- **Autonomous Loops**: Define trigger-action workflows
- **File Watching**: React to file changes automatically
- **AI Integration**: Run AI agents on events

## Usage

\`\`\`bash
# Start Ralph daemon
ralph start

# Run a specific loop
ralph run test-on-change

# Stop Ralph
ralph stop
\`\`\`

## Configuration

Edit \`.ralph/config.yaml\` to define your loops and triggers.
`;
    fs.writeFileSync(readmePath, readme);
    files.push('.ralph/README.md');
  }

  return files;
}

/**
 * Add a tool to an existing project
 * @param {string} tool - Tool identifier
 */
async function add(tool) {
  if (!tool) {
    error('Please specify a tool to add: beads, cleo, or ralph');
    console.log('\nUsage: npx hiveforge add <tool>\n');
    console.log('Available tools:');
    for (const [key, config] of Object.entries(tools)) {
      console.log(`  ${key.padEnd(10)} - ${config.description}`);
    }
    process.exit(1);
  }

  const toolConfig = tools[tool];
  if (!toolConfig) {
    error(`Unknown tool: ${tool}`);
    console.log('\nAvailable tools: beads, cleo, ralph');
    process.exit(1);
  }

  info(`Adding ${toolConfig.name}...`);

  // Load existing config if present
  const configPath = path.join(process.cwd(), '.hiveforge.json');
  let config = {
    projectPath: process.cwd(),
    agentTools: []
  };

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config.projectPath = process.cwd();
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Check if already installed
  if (config.agentTools && config.agentTools.includes(tool)) {
    warning(`${toolConfig.name} is already configured in this project`);
    return;
  }

  // Generate tool files
  const files = await generate(tool, config);

  // Run install command if specified
  if (toolConfig.installCommand) {
    info(`Installing ${toolConfig.name} globally...`);
    try {
      execSync(toolConfig.installCommand, { stdio: 'inherit' });
    } catch (e) {
      warning(`Could not install globally. You may need to run: ${toolConfig.installCommand}`);
    }
  }

  // Update config
  if (!config.agentTools) {
    config.agentTools = [];
  }
  config.agentTools.push(tool);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  success(`${toolConfig.name} added successfully!`);

  if (files.length > 0) {
    console.log('\nGenerated files:');
    for (const file of files) {
      console.log(`  ${file}`);
    }
  }

  if (toolConfig.postInstall) {
    console.log(`\nNext steps: ${toolConfig.postInstall}`);
  }
}

/**
 * Get tool configuration
 * @param {string} tool - Tool identifier
 * @returns {object} Tool configuration
 */
function getTool(tool) {
  return tools[tool] || null;
}

/**
 * Get all available tools
 * @returns {object} All tools
 */
function getTools() {
  return tools;
}

module.exports = {
  generate,
  add,
  getTool,
  getTools,
  tools
};
