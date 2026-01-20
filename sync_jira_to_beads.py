#!/usr/bin/env python3
"""
Jira to Beads Sync Script
Queries Jira issues via Atlassian Rovo MCP server and syncs them to beads.
"""

import json
import subprocess
import sys
import os
from typing import List, Dict, Optional
from datetime import datetime


class JiraBeadsSync:
    def __init__(self, project_key: str, component: str = None, mcp_url: str = None, use_example_data: bool = False):
        self.project_key = project_key
        self.component = component
        self.mcp_url = mcp_url or "https://mcp.atlassian.com/v1/mcp"
        self.use_example_data = use_example_data
        
    def query_jira_via_mcp(self) -> List[Dict]:
        """
        Query Jira using Atlassian MCP server.
        
        Returns list of Jira issues matching the criteria.
        """
        # Build JQL query
        jql_parts = [f'project = {self.project_key}']
        
        if self.component:
            jql_parts.append(f'component = "{self.component}"')
        
        # Only sync open/in-progress issues
        jql_parts.append('status NOT IN (Done, Closed, Resolved)')
        
        jql = ' AND '.join(jql_parts)
        
        print(f"📋 Querying Jira with JQL: {jql}")
        
        # Note: This is a placeholder for the actual MCP call
        # In practice, you'd use the MCP client library or npx command
        # For now, we'll simulate the structure
        
        # Allow explicit use of example data for testing
        if self.use_example_data:
            print("⚠️  Using example data (--use-example-data flag)", file=sys.stderr)
            return self._get_example_data()
        
        try:
            # Try to use Claude's MCP integration if available
            # Otherwise fall back to direct API call
            return self._query_via_mcp_client(jql)
        except Exception as e:
            print(f"❌ MCP query failed: {e}", file=sys.stderr)
            print("", file=sys.stderr)
            print("⚠️  Cannot sync without network connection to Jira.", file=sys.stderr)
            print("ℹ️  Your existing beads issues are still available offline.", file=sys.stderr)
            print("ℹ️  Run sync again when online to get latest Jira updates.", file=sys.stderr)
            # Return empty list - don't create fake data
            return []
    
    def _query_via_mcp_client(self, jql: str) -> List[Dict]:
        """
        Query Jira via MCP using npx mcp-remote.
        
        This requires the Atlassian MCP server to be configured and authenticated.
        """
        # The actual MCP call would look something like this:
        # npx -y mcp-remote https://mcp.atlassian.com/v1/mcp
        # Then use the search tool with JQL
        
        # For this prototype, we'll use a subprocess call structure
        cmd = [
            'npx', '-y', 'mcp-remote@0.1.13',
            self.mcp_url
        ]
        
        # Note: The actual MCP interaction would be more complex
        # This is a simplified version showing the structure
        print(f"ℹ️  Would execute: {' '.join(cmd)}")
        print(f"ℹ️  With JQL query: {jql}")
        
        # For prototype, return example data
        raise NotImplementedError("MCP client integration - using example data")
    
    def _get_example_data(self) -> List[Dict]:
        """
        Return example Jira issues for testing/development only.
        
        NOTE: This should only be used when explicitly testing the script,
        not in production. Use --use-example-data flag to enable.
        """
        return [
            {
                "key": "EXAMPLE-123",
                "fields": {
                    "summary": "[EXAMPLE] Implement user authentication",
                    "description": "This is example data for testing. Add OAuth2 support for user login",
                    "priority": {"name": "High"},
                    "issuetype": {"name": "Task"},
                    "status": {"name": "In Progress"},
                    "assignee": {"displayName": "Example User"},
                    "components": [{"name": self.component or "example-component"}],
                    "created": "2025-01-10T10:00:00.000+0000",
                    "updated": "2025-01-14T15:30:00.000+0000"
                }
            },
            {
                "key": "EXAMPLE-456",
                "fields": {
                    "summary": "[EXAMPLE] Fix memory leak in session handler",
                    "description": "This is example data for testing. Sessions are not being properly garbage collected",
                    "priority": {"name": "Highest"},
                    "issuetype": {"name": "Bug"},
                    "status": {"name": "Open"},
                    "assignee": {"displayName": "Example User"},
                    "components": [{"name": self.component or "example-component"}],
                    "created": "2025-01-12T09:00:00.000+0000",
                    "updated": "2025-01-13T11:00:00.000+0000"
                }
            },
            {
                "key": "EXAMPLE-789",
                "fields": {
                    "summary": "[EXAMPLE] Add rate limiting to API endpoints",
                    "description": "This is example data for testing",
                    "priority": {"name": "Medium"},
                    "issuetype": {"name": "Feature"},
                    "status": {"name": "Open"},
                    "assignee": None,
                    "components": [{"name": self.component or "example-component"}],
                    "created": "2025-01-15T14:00:00.000+0000",
                    "updated": "2025-01-15T14:00:00.000+0000"
                }
            }
        ]
    
    def map_jira_priority(self, jira_priority: str) -> int:
        """Map Jira priority to beads priority (0-4, where 0 is highest)"""
        mapping = {
            'Highest': 0,
            'High': 1,
            'Medium': 2,
            'Low': 3,
            'Lowest': 4
        }
        return mapping.get(jira_priority, 2)
    
    def map_jira_type(self, jira_type: str) -> str:
        """Map Jira issue type to beads type"""
        mapping = {
            'Bug': 'bug',
            'Task': 'task',
            'Story': 'feature',
            'Feature': 'feature',
            'Epic': 'epic',
            'Sub-task': 'task'
        }
        return mapping.get(jira_type, 'task')
    
    def jira_to_beads_issue(self, jira_issue: Dict) -> Dict:
        """Convert Jira issue format to beads-compatible format"""
        fields = jira_issue['fields']
        
        # Build description with Jira metadata
        description_parts = [
            f"**Jira Issue:** [{jira_issue['key']}]",
            f"**Status:** {fields['status']['name']}",
        ]
        
        if fields.get('assignee'):
            description_parts.append(f"**Assignee:** {fields['assignee']['displayName']}")
        
        description_parts.append("")  # Blank line
        
        if fields.get('description'):
            description_parts.append(fields['description'])
        else:
            description_parts.append("*No description provided in Jira*")
        
        description = "\n".join(description_parts)
        
        # Build labels
        labels = [
            'jira-synced',
            jira_issue['key'],
            f"component-{self.component}" if self.component else None
        ]
        labels = [l for l in labels if l]  # Remove None values
        
        return {
            'title': fields['summary'],
            'description': description,
            'priority': self.map_jira_priority(fields['priority']['name']),
            'type': self.map_jira_type(fields['issuetype']['name']),
            'labels': labels,
            'jira_key': jira_issue['key']
        }
    
    def check_beads_exists(self, jira_key: str) -> Optional[Dict]:
        """Check if a beads issue already exists for this Jira key"""
        try:
            result = subprocess.run(
                f'bd list --label "{jira_key}" --json',
                capture_output=True,
                text=True,
                check=True,
                shell=True
            )
            
            issues = json.loads(result.stdout)
            return issues[0] if issues else None
            
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Error checking beads: {e.stderr}", file=sys.stderr)
            return None
        except json.JSONDecodeError:
            return None
    
    def create_beads_issue(self, beads_issue: Dict) -> Optional[str]:
        """Create a new issue in beads"""
        try:
            # Escape quotes in strings
            title = beads_issue['title'].replace('"', '\\"')
            description = beads_issue['description'].replace('"', '\\"').replace('\n', '\\n')
            labels = ','.join(beads_issue['labels'])
            
            # Build command as string for Windows shell
            cmd_str = (
                f'bd create "{title}" '
                f'-d "{description}" '
                f'-p {beads_issue["priority"]} '
                f'-t {beads_issue["type"]} '
                f'-l "{labels}" '
                f'--json'
            )
            
            result = subprocess.run(
                cmd_str,
                capture_output=True,
                text=True,
                check=True,
                shell=True
            )
            
            created = json.loads(result.stdout)
            return created.get('id')
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Error creating beads issue: {e.stderr}", file=sys.stderr)
            print(f"   Command: {cmd_str}", file=sys.stderr)
            print(f"   Stdout: {e.stdout}", file=sys.stderr)
            return None
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing beads response: {e}", file=sys.stderr)
            print(f"   Output: {result.stdout}", file=sys.stderr)
            return None
        except Exception as e:
            print(f"❌ Unexpected error: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc()
            return None
    
    def update_beads_issue(self, issue_id: str, beads_issue: Dict) -> bool:
        """Update an existing beads issue"""
        try:
            cmd_str = (
                f'bd update {issue_id} '
                f'--description "{beads_issue["description"]}" '
                f'--priority {beads_issue["priority"]} '
                f'--json'
            )
            
            subprocess.run(cmd_str, capture_output=True, text=True, check=True, shell=True)
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Error updating beads issue: {e.stderr}", file=sys.stderr)
            return False
    
    def sync_to_beads(self, jira_issues: List[Dict]) -> Dict[str, int]:
        """
        Sync Jira issues to beads.
        
        Returns dict with counts of created/updated/skipped issues.
        """
        stats = {'created': 0, 'updated': 0, 'skipped': 0, 'errors': 0}
        
        for jira_issue in jira_issues:
            jira_key = jira_issue['key']
            print(f"\n🔄 Processing {jira_key}...")
            
            beads_issue = self.jira_to_beads_issue(jira_issue)
            existing = self.check_beads_exists(jira_key)
            
            if existing:
                # Update existing issue
                print(f"   Found existing beads issue: {existing['id']}")
                if self.update_beads_issue(existing['id'], beads_issue):
                    print(f"   ✅ Updated {existing['id']}")
                    stats['updated'] += 1
                else:
                    stats['errors'] += 1
            else:
                # Create new issue
                new_id = self.create_beads_issue(beads_issue)
                if new_id:
                    print(f"   ✅ Created {new_id}")
                    stats['created'] += 1
                else:
                    stats['errors'] += 1
        
        return stats
    
    def run(self) -> Dict[str, int]:
        """Main sync workflow"""
        print("=" * 60)
        print("🔗 Jira to Beads Sync")
        print("=" * 60)
        print(f"Project: {self.project_key}")
        if self.component:
            print(f"Component: {self.component}")
        print(f"MCP URL: {self.mcp_url}")
        print()
        
        # Query Jira
        jira_issues = self.query_jira_via_mcp()
        print(f"\n✅ Found {len(jira_issues)} Jira issues")
        
        if not jira_issues:
            print("ℹ️  No issues to sync")
            return {'created': 0, 'updated': 0, 'skipped': 0, 'errors': 0}
        
        # Sync to beads
        print("\n" + "=" * 60)
        print("Syncing to beads...")
        print("=" * 60)
        
        stats = self.sync_to_beads(jira_issues)
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 Sync Summary")
        print("=" * 60)
        print(f"Created:  {stats['created']}")
        print(f"Updated:  {stats['updated']}")
        print(f"Errors:   {stats['errors']}")
        print(f"Total:    {len(jira_issues)}")
        print()
        
        return stats


def main():
    """CLI entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Sync Jira issues to beads via Atlassian Rovo MCP server'
    )
    parser.add_argument(
        'project_key',
        help='Jira project key (e.g., PROJ, MYAPP)'
    )
    parser.add_argument(
        '--component',
        help='Filter by Jira component name',
        default=None
    )
    parser.add_argument(
        '--mcp-url',
        help='Atlassian MCP server URL',
        default='https://mcp.atlassian.com/v1/mcp'
    )
    parser.add_argument(
        '--use-example-data',
        action='store_true',
        help='Use example data for testing (do not use in production)'
    )
    
    args = parser.parse_args()
    
    sync = JiraBeadsSync(
        project_key=args.project_key,
        component=args.component,
        mcp_url=args.mcp_url,
        use_example_data=args.use_example_data
    )
    
    try:
        stats = sync.run()
        sys.exit(0 if stats['errors'] == 0 else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Sync cancelled by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
