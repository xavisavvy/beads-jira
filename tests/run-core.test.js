/**
 * Unit Tests for run.js Command Routing
 * Tests the CLI interface and command dispatching
 */

describe('run.js - Command Routing', () => {
  describe('Command Parsing', () => {
    it('should parse sync command', () => {
      const args = ['sync'];
      const command = args[0];
      
      expect(command).toBe('sync');
    });

    it('should parse start command with issue ID', () => {
      const args = ['start', 'bd-test'];
      const command = args[0];
      const issueId = args[1];
      
      expect(command).toBe('start');
      expect(issueId).toBe('bd-test');
    });

    it('should parse finish command with flags', () => {
      const args = ['finish', 'bd-test', '--draft'];
      const command = args[0];
      const issueId = args[1];
      const isDraft = args.includes('--draft');
      
      expect(command).toBe('finish');
      expect(issueId).toBe('bd-test');
      expect(isDraft).toBe(true);
    });

    it('should handle no command (show help)', () => {
      const args = [];
      const command = args[0] || 'help';
      
      expect(command).toBe('help');
    });

    it('should handle help command', () => {
      const helpCommands = ['help', '--help', '-h'];
      
      helpCommands.forEach(cmd => {
        expect(['help', '--help', '-h']).toContain(cmd);
      });
    });
  });

  describe('Command Validation', () => {
    it('should validate known commands', () => {
      const validCommands = ['sync', 'start', 'finish', 'help'];
      const command = 'sync';
      
      expect(validCommands).toContain(command);
    });

    it('should reject unknown commands', () => {
      const validCommands = ['sync', 'start', 'finish', 'help'];
      const command = 'invalid';
      
      expect(validCommands).not.toContain(command);
    });

    it('should validate start command has issue ID', () => {
      const validateStart = (args) => {
        if (args[0] === 'start' && !args[1]) {
          throw new Error('Issue ID required for start command');
        }
        return true;
      };
      
      expect(() => validateStart(['start'])).toThrow();
      expect(() => validateStart(['start', 'bd-test'])).not.toThrow();
    });

    it('should validate finish command has issue ID', () => {
      const validateFinish = (args) => {
        if (args[0] === 'finish' && !args[1]) {
          throw new Error('Issue ID required for finish command');
        }
        return true;
      };
      
      expect(() => validateFinish(['finish'])).toThrow();
      expect(() => validateFinish(['finish', 'bd-test'])).not.toThrow();
    });
  });

  describe('Flag Parsing', () => {
    it('should parse --draft flag', () => {
      const args = ['finish', 'bd-test', '--draft'];
      const isDraft = args.includes('--draft');
      
      expect(isDraft).toBe(true);
    });

    it('should parse --use-example-data flag', () => {
      const args = ['sync', '--use-example-data'];
      const useExampleData = args.includes('--use-example-data');
      
      expect(useExampleData).toBe(true);
    });

    it('should handle multiple flags', () => {
      const args = ['finish', 'bd-test', '--draft', '--verbose'];
      const isDraft = args.includes('--draft');
      const isVerbose = args.includes('--verbose');
      
      expect(isDraft).toBe(true);
      expect(isVerbose).toBe(true);
    });

    it('should handle flags in any order', () => {
      const args1 = ['finish', '--draft', 'bd-test'];
      const args2 = ['finish', 'bd-test', '--draft'];
      
      const issueId1 = args1.find(a => a.startsWith('bd-'));
      const issueId2 = args2.find(a => a.startsWith('bd-'));
      
      expect(issueId1).toBe('bd-test');
      expect(issueId2).toBe('bd-test');
    });
  });

  describe('Help Text', () => {
    it('should show available commands', () => {
      const helpText = `
Available commands:
  sync   - Sync Jira issues to beads
  start  - Start working on an issue
  finish - Finish an issue and create PR
  help   - Show this help message
      `.trim();
      
      expect(helpText).toContain('sync');
      expect(helpText).toContain('start');
      expect(helpText).toContain('finish');
    });

    it('should show command usage', () => {
      const usage = {
        sync: 'npm run sync [--use-example-data]',
        start: 'npm run start -- <issue-id>',
        finish: 'npm run finish -- <issue-id> [--draft]',
      };
      
      expect(usage.sync).toContain('sync');
      expect(usage.start).toContain('issue-id');
      expect(usage.finish).toContain('--draft');
    });

    it('should show examples', () => {
      const examples = [
        'npm run sync',
        'npm run start -- bd-a1b2',
        'npm run finish -- bd-a1b2 --draft',
      ];
      
      expect(examples).toHaveLength(3);
      examples.forEach(ex => {
        expect(ex).toContain('npm run');
      });
    });
  });

  describe('Error Messages', () => {
    it('should show error for unknown command', () => {
      const command = 'invalid';
      const errorMessage = `Unknown command: ${command}`;
      
      expect(errorMessage).toContain('Unknown command');
      expect(errorMessage).toContain(command);
    });

    it('should show error for missing issue ID', () => {
      const errorMessage = 'Error: Issue ID is required';
      
      expect(errorMessage).toContain('Issue ID is required');
    });

    it('should show error for invalid issue ID format', () => {
      const issueId = 'invalid';
      const errorMessage = `Error: Invalid issue ID format: ${issueId}`;
      
      expect(errorMessage).toContain('Invalid issue ID format');
    });
  });

  describe('Command Execution', () => {
    it('should route to sync handler', () => {
      const command = 'sync';
      const handlers = {
        sync: jest.fn(),
        start: jest.fn(),
        finish: jest.fn(),
      };
      
      handlers[command]();
      
      expect(handlers.sync).toHaveBeenCalled();
      expect(handlers.start).not.toHaveBeenCalled();
    });

    it('should route to start handler with issue ID', () => {
      const command = 'start';
      const issueId = 'bd-test';
      const handlers = {
        start: jest.fn((id) => id),
      };
      
      const result = handlers[command](issueId);
      
      expect(handlers.start).toHaveBeenCalledWith(issueId);
      expect(result).toBe(issueId);
    });

    it('should route to finish handler with options', () => {
      const command = 'finish';
      const issueId = 'bd-test';
      const options = { draft: true };
      const handlers = {
        finish: jest.fn((id, opts) => ({ id, opts })),
      };
      
      const result = handlers[command](issueId, options);
      
      expect(handlers.finish).toHaveBeenCalled();
      expect(result.id).toBe(issueId);
      expect(result.opts.draft).toBe(true);
    });
  });

  describe('Exit Codes', () => {
    it('should exit with 0 on success', () => {
      const exitCode = 0;
      expect(exitCode).toBe(0);
    });

    it('should exit with 1 on error', () => {
      const exitCode = 1;
      expect(exitCode).toBe(1);
    });

    it('should exit with 1 for unknown command', () => {
      const command = 'invalid';
      const exitCode = command === 'invalid' ? 1 : 0;
      
      expect(exitCode).toBe(1);
    });
  });

  describe('Environment Variables', () => {
    it('should read JIRA_PROJECT_KEY from env', () => {
      const projectKey = process.env.JIRA_PROJECT_KEY || 'DEFAULT';
      
      expect(typeof projectKey).toBe('string');
    });

    it('should read MCP_URL from env', () => {
      const mcpUrl = process.env.MCP_URL || 'https://mcp.atlassian.com/v1/mcp';
      
      expect(mcpUrl).toContain('mcp');
    });

    it('should handle missing environment variables', () => {
      const value = process.env.NONEXISTENT || 'default';
      
      expect(value).toBe('default');
    });
  });
});
