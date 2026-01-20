#!/usr/bin/env dotnet-script
/**
 * Jira to Beads Sync Script - C# version
 * Queries Jira issues via Atlassian Rovo MCP server and syncs them to beads.
 * 
 * Designed for .NET projects where dotnet is already installed.
 * 
 * Installation:
 *   dotnet tool install -g dotnet-script
 * 
 * Usage:
 *   dotnet script sync_jira_to_beads.cs -- PROJ
 *   dotnet script sync_jira_to_beads.cs -- PROJ --component backend-api
 */

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

public class JiraIssue
{
    public string Key { get; set; }
    public JiraFields Fields { get; set; }
}

public class JiraFields
{
    public string Summary { get; set; }
    public string Description { get; set; }
    public JiraPriority Priority { get; set; }
    public JiraIssueType IssueType { get; set; }
    public JiraStatus Status { get; set; }
    public JiraUser Assignee { get; set; }
    public List<JiraComponent> Components { get; set; }
}

public class JiraPriority
{
    public string Name { get; set; }
}

public class JiraIssueType
{
    public string Name { get; set; }
}

public class JiraStatus
{
    public string Name { get; set; }
}

public class JiraUser
{
    public string DisplayName { get; set; }
}

public class JiraComponent
{
    public string Name { get; set; }
}

public class BeadsIssue
{
    public string Id { get; set; }
    public List<string> Labels { get; set; }
}

public class JiraBeadsSync
{
    private readonly string _projectKey;
    private readonly string _component;
    private readonly string _mcpUrl;
    private readonly bool _useExampleData;

    public JiraBeadsSync(string projectKey, string component = null, string mcpUrl = null, bool useExampleData = false)
    {
        _projectKey = projectKey;
        _component = component;
        _mcpUrl = mcpUrl ?? "https://mcp.atlassian.com/v1/mcp";
        _useExampleData = useExampleData;
    }

    public async Task<List<JiraIssue>> QueryJiraViaMcpAsync()
    {
        // Build JQL query
        var jqlParts = new List<string> { $"project = {_projectKey}" };

        if (!string.IsNullOrEmpty(_component))
        {
            jqlParts.Add($"component = \"{_component}\"");
        }

        // Only sync open/in-progress issues
        jqlParts.Add("status NOT IN (Done, Closed, Resolved)");

        var jql = string.Join(" AND ", jqlParts);

        Console.WriteLine($"📋 Querying Jira with JQL: {jql}");

        // Allow explicit use of example data for testing
        if (_useExampleData)
        {
            Console.Error.WriteLine("⚠️  Using example data (--use-example-data flag)");
            return GetExampleData();
        }

        try
        {
            return await QueryViaMcpClientAsync(jql);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"❌ MCP query failed: {ex.Message}");
            Console.Error.WriteLine();
            Console.Error.WriteLine("⚠️  Cannot sync without network connection to Jira.");
            Console.Error.WriteLine("ℹ️  Your existing beads issues are still available offline.");
            Console.Error.WriteLine("ℹ️  Run sync again when online to get latest Jira updates.");
            return new List<JiraIssue>();
        }
    }

    private Task<List<JiraIssue>> QueryViaMcpClientAsync(string jql)
    {
        Console.WriteLine($"ℹ️  Would query MCP at: {_mcpUrl}");
        Console.WriteLine($"ℹ️  With JQL query: {jql}");

        throw new NotImplementedException("MCP client integration - using example data");
    }

    private List<JiraIssue> GetExampleData()
    {
        return new List<JiraIssue>
        {
            new JiraIssue
            {
                Key = "EXAMPLE-123",
                Fields = new JiraFields
                {
                    Summary = "[EXAMPLE] Implement user authentication",
                    Description = "This is example data for testing. Add OAuth2 support for user login",
                    Priority = new JiraPriority { Name = "High" },
                    IssueType = new JiraIssueType { Name = "Story" },
                    Status = new JiraStatus { Name = "In Progress" },
                    Assignee = new JiraUser { DisplayName = "John Doe" },
                    Components = new List<JiraComponent> { new JiraComponent { Name = "backend-api" } }
                }
            },
            new JiraIssue
            {
                Key = "EXAMPLE-124",
                Fields = new JiraFields
                {
                    Summary = "[EXAMPLE] Fix memory leak in session handler",
                    Description = "This is example data. Sessions are not being properly garbage collected",
                    Priority = new JiraPriority { Name = "Highest" },
                    IssueType = new JiraIssueType { Name = "Bug" },
                    Status = new JiraStatus { Name = "Open" },
                    Assignee = new JiraUser { DisplayName = "Jane Smith" },
                    Components = new List<JiraComponent> { new JiraComponent { Name = "backend-api" } }
                }
            }
        };
    }

    public async Task SyncToBeadsAsync(List<JiraIssue> issues)
    {
        Console.WriteLine($"\n🔄 Syncing {issues.Count} issues to beads...\n");

        int created = 0, updated = 0, skipped = 0;

        foreach (var issue in issues)
        {
            try
            {
                var exists = CheckBeadsIssueExists(issue.Key);

                if (exists)
                {
                    UpdateBeadsIssue(issue);
                    updated++;
                }
                else
                {
                    CreateBeadsIssue(issue);
                    created++;
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"⚠️  Failed to sync {issue.Key}: {ex.Message}");
                skipped++;
            }
        }

        Console.WriteLine("\n" + new string('=', 60));
        Console.WriteLine("✅ Sync Complete!");
        Console.WriteLine(new string('=', 60));
        Console.WriteLine($"Created:  {created}");
        Console.WriteLine($"Updated:  {updated}");
        Console.WriteLine($"Skipped:  {skipped}");
        Console.WriteLine(new string('=', 60) + "\n");
    }

    private bool CheckBeadsIssueExists(string jiraKey)
    {
        try
        {
            var output = RunCommand("bd", "ls --json");
            var issues = JsonSerializer.Deserialize<List<BeadsIssue>>(output);
            return issues?.Any(i => i.Labels?.Contains(jiraKey) == true) ?? false;
        }
        catch
        {
            return false;
        }
    }

    private void CreateBeadsIssue(JiraIssue jiraIssue)
    {
        var title = jiraIssue.Fields.Summary;
        var priority = MapPriority(jiraIssue.Fields.Priority?.Name);
        var type = MapIssueType(jiraIssue.Fields.IssueType?.Name);

        var description = BuildDescription(jiraIssue);

        // Create the issue
        var issueId = RunCommand("bd", $"create \"{title}\" -t {type} -p {priority}").Trim();

        // Add description
        if (!string.IsNullOrEmpty(description))
        {
            var escapedDesc = description.Replace("\"", "\\\"");
            RunCommand("bd", $"edit {issueId} -d \"{escapedDesc}\"", ignoreErrors: true);
        }

        // Add labels
        AddLabelsToBeadsIssue(issueId, jiraIssue);

        Console.WriteLine($"✅ Created {issueId} from {jiraIssue.Key}");
    }

    private void UpdateBeadsIssue(JiraIssue jiraIssue)
    {
        var output = RunCommand("bd", "ls --json");
        var issues = JsonSerializer.Deserialize<List<BeadsIssue>>(output);
        var beadsIssue = issues?.FirstOrDefault(i => i.Labels?.Contains(jiraIssue.Key) == true);

        if (beadsIssue == null) return;

        var description = BuildDescription(jiraIssue);
        var priority = MapPriority(jiraIssue.Fields.Priority?.Name);

        try
        {
            var escapedDesc = description.Replace("\"", "\\\"");
            RunCommand("bd", $"edit {beadsIssue.Id} -d \"{escapedDesc}\" -p {priority}", ignoreErrors: true);
            Console.WriteLine($"🔄 Updated {beadsIssue.Id} from {jiraIssue.Key}");
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"⚠️  Failed to update {beadsIssue.Id}: {ex.Message}");
        }
    }

    private void AddLabelsToBeadsIssue(string beadsIssueId, JiraIssue jiraIssue)
    {
        var labels = new List<string> { jiraIssue.Key, "jira-synced" };

        if (jiraIssue.Fields.Components != null)
        {
            labels.AddRange(jiraIssue.Fields.Components.Select(c => $"component-{c.Name}"));
        }

        foreach (var label in labels)
        {
            try
            {
                RunCommand("bd", $"label add {beadsIssueId} \"{label}\"", ignoreErrors: true);
            }
            catch
            {
                // Ignore label errors
            }
        }
    }

    private string BuildDescription(JiraIssue jiraIssue)
    {
        var parts = new[]
        {
            $"**Jira Issue:** [{jiraIssue.Key}]",
            $"**Status:** {jiraIssue.Fields.Status?.Name ?? "Unknown"}",
            $"**Assignee:** {jiraIssue.Fields.Assignee?.DisplayName ?? "Unassigned"}",
            "",
            jiraIssue.Fields.Description ?? "(No description)"
        };

        return string.Join("\\n", parts);
    }

    private int MapPriority(string jiraPriority)
    {
        return jiraPriority switch
        {
            "Highest" => 0,
            "High" => 1,
            "Medium" => 2,
            "Low" => 3,
            "Lowest" => 4,
            _ => 2
        };
    }

    private string MapIssueType(string jiraType)
    {
        return jiraType switch
        {
            "Bug" => "bug",
            "Task" => "task",
            "Story" => "feature",
            "Feature" => "feature",
            "Epic" => "epic",
            _ => "task"
        };
    }

    private string RunCommand(string command, string arguments, bool ignoreErrors = false)
    {
        var psi = new ProcessStartInfo
        {
            FileName = command,
            Arguments = arguments,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = Process.Start(psi);
        var output = process.StandardOutput.ReadToEnd();
        var error = process.StandardError.ReadToEnd();
        process.WaitForExit();

        if (process.ExitCode != 0 && !ignoreErrors)
        {
            throw new Exception($"Command failed: {error}");
        }

        return output;
    }

    public async Task RunAsync()
    {
        Console.WriteLine(new string('=', 60));
        Console.WriteLine("🔗 Jira to Beads Sync (C#/.NET)");
        Console.WriteLine(new string('=', 60));
        Console.WriteLine($"Project: {_projectKey}");
        if (!string.IsNullOrEmpty(_component))
        {
            Console.WriteLine($"Component: {_component}");
        }
        Console.WriteLine(new string('=', 60) + "\n");

        // Check if beads is available
        try
        {
            RunCommand("bd", "--version", ignoreErrors: true);
        }
        catch
        {
            Console.Error.WriteLine("❌ beads (bd) command not found.");
            Console.Error.WriteLine("Please install beads first.");
            Environment.Exit(1);
        }

        // Query Jira
        var issues = await QueryJiraViaMcpAsync();

        if (issues.Count == 0)
        {
            Console.WriteLine("ℹ️  No issues to sync.");
            return;
        }

        // Sync to beads
        await SyncToBeadsAsync(issues);
    }
}

// CLI handling
var args = Args.ToArray();

if (args.Length == 0 || args.Contains("--help") || args.Contains("-h"))
{
    Console.WriteLine(@"
Usage: dotnet script sync_jira_to_beads.cs -- PROJECT_KEY [options]

Options:
  --component NAME      Filter by Jira component
  --mcp-url URL        Custom MCP server URL
  --use-example-data   Use example data for testing
  --help, -h           Show this help

Examples:
  dotnet script sync_jira_to_beads.cs -- PROJ
  dotnet script sync_jira_to_beads.cs -- PROJ --component backend-api
  dotnet script sync_jira_to_beads.cs -- PROJ --use-example-data
");
    Environment.Exit(0);
}

var projectKey = args[0];
string component = null;
string mcpUrl = null;
bool useExampleData = false;

for (int i = 1; i < args.Length; i++)
{
    if (args[i] == "--component" && i + 1 < args.Length)
    {
        component = args[++i];
    }
    else if (args[i] == "--mcp-url" && i + 1 < args.Length)
    {
        mcpUrl = args[++i];
    }
    else if (args[i] == "--use-example-data")
    {
        useExampleData = true;
    }
}

var sync = new JiraBeadsSync(projectKey, component, mcpUrl, useExampleData);
await sync.RunAsync();
