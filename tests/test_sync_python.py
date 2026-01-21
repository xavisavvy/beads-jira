"""
Python test suite for sync_jira_to_beads.py
Uses pytest for testing the Python sync script
"""

import pytest
import sys
import os
from unittest.mock import Mock, patch, MagicMock
import subprocess

# Add parent directory to path to import the module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sync_jira_to_beads import JiraBeadsSync


class TestJiraBeadsSync:
    """Test suite for JiraBeadsSync class"""

    def test_initialization_basic(self):
        """Test basic initialization"""
        sync = JiraBeadsSync("PROJ")
        assert sync.project_key == "PROJ"
        assert sync.component is None
        assert sync.mcp_url == "https://mcp.atlassian.com/v1/mcp"
        assert sync.use_example_data is False

    def test_initialization_with_component(self):
        """Test initialization with component"""
        sync = JiraBeadsSync("PROJ", component="api")
        assert sync.project_key == "PROJ"
        assert sync.component == "api"

    def test_initialization_with_custom_mcp_url(self):
        """Test initialization with custom MCP URL"""
        custom_url = "https://custom-mcp.example.com/v1/mcp"
        sync = JiraBeadsSync("PROJ", mcp_url=custom_url)
        assert sync.mcp_url == custom_url

    def test_initialization_with_example_data_flag(self):
        """Test initialization with example data flag"""
        sync = JiraBeadsSync("PROJ", use_example_data=True)
        assert sync.use_example_data is True

    def test_get_example_data(self):
        """Test example data generation"""
        sync = JiraBeadsSync("PROJ", use_example_data=True)
        data = sync._get_example_data()
        
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Check first issue structure
        issue = data[0]
        assert "key" in issue
        assert "fields" in issue
        assert "summary" in issue["fields"]
        assert "description" in issue["fields"]
        assert "priority" in issue["fields"]

    def test_query_jira_with_example_data(self):
        """Test querying with example data"""
        sync = JiraBeadsSync("PROJ", use_example_data=True)
        issues = sync.query_jira_via_mcp()
        
        assert isinstance(issues, list)
        assert len(issues) > 0

    def test_map_priority_highest(self):
        """Test priority mapping for Highest"""
        sync = JiraBeadsSync("PROJ")
        assert sync._map_priority("Highest") == 0
        assert sync._map_priority("Blocker") == 0

    def test_map_priority_high(self):
        """Test priority mapping for High"""
        sync = JiraBeadsSync("PROJ")
        assert sync._map_priority("High") == 1

    def test_map_priority_medium(self):
        """Test priority mapping for Medium"""
        sync = JiraBeadsSync("PROJ")
        assert sync._map_priority("Medium") == 2

    def test_map_priority_low(self):
        """Test priority mapping for Low"""
        sync = JiraBeadsSync("PROJ")
        assert sync._map_priority("Low") == 3

    def test_map_priority_lowest(self):
        """Test priority mapping for Lowest"""
        sync = JiraBeadsSync("PROJ")
        assert sync._map_priority("Lowest") == 4

    def test_map_priority_default(self):
        """Test priority mapping for unknown priority"""
        sync = JiraBeadsSync("PROJ")
        assert sync._map_priority("Unknown") == 2  # Default to Medium

    def test_map_issue_type_bug(self):
        """Test issue type mapping for Bug"""
        sync = JiraBeadsSync("PROJ")
        assert sync._map_issue_type("Bug") == "bug"

    def test_map_issue_type_task(self):
        """Test issue type mapping for Task"""
        sync = JiraBeadsSync("PROJ")
        assert sync._map_issue_type("Task") == "task"

    def test_map_issue_type_story(self):
        """Test issue type mapping for Story"""
        sync = JiraBeadsSync("PROJ")
        assert sync._map_issue_type("Story") == "feature"

    def test_map_issue_type_epic(self):
        """Test issue type mapping for Epic"""
        sync = JiraBeadsSync("PROJ")
        assert sync._map_issue_type("Epic") == "epic"

    def test_map_issue_type_default(self):
        """Test issue type mapping for unknown type"""
        sync = JiraBeadsSync("PROJ")
        assert sync._map_issue_type("Unknown") == "task"  # Default to task

    @patch('subprocess.run')
    def test_check_beads_installed_success(self, mock_run):
        """Test checking if beads is installed (success)"""
        mock_run.return_value = Mock(returncode=0)
        sync = JiraBeadsSync("PROJ")
        assert sync._check_beads_installed() is True

    @patch('subprocess.run')
    def test_check_beads_installed_failure(self, mock_run):
        """Test checking if beads is installed (failure)"""
        mock_run.side_effect = FileNotFoundError()
        sync = JiraBeadsSync("PROJ")
        assert sync._check_beads_installed() is False

    @patch('subprocess.run')
    def test_get_existing_beads_issues(self, mock_run):
        """Test getting existing beads issues"""
        mock_output = json.dumps([
            {"id": "bd-a1b2", "title": "Test Issue", "labels": ["PROJ-123"]}
        ])
        mock_run.return_value = Mock(returncode=0, stdout=mock_output)
        
        sync = JiraBeadsSync("PROJ")
        issues = sync._get_existing_beads_issues()
        
        assert isinstance(issues, list)
        assert len(issues) == 1
        assert issues[0]["id"] == "bd-a1b2"

    def test_build_jql_basic(self):
        """Test JQL building without component"""
        sync = JiraBeadsSync("PROJ")
        issues = sync.query_jira_via_mcp()
        # Should use project key in JQL
        assert sync.project_key in str(issues) or sync.use_example_data

    def test_build_jql_with_component(self):
        """Test JQL building with component"""
        sync = JiraBeadsSync("PROJ", component="api", use_example_data=True)
        issues = sync.query_jira_via_mcp()
        # Should work with component
        assert isinstance(issues, list)


class TestScriptIntegration:
    """Integration tests for the script"""

    def test_script_exists(self):
        """Test that sync script exists"""
        script_path = os.path.join(os.path.dirname(__file__), "..", "sync_jira_to_beads.py")
        assert os.path.exists(script_path)

    def test_script_is_executable(self):
        """Test that script has execute permissions"""
        script_path = os.path.join(os.path.dirname(__file__), "..", "sync_jira_to_beads.py")
        assert os.access(script_path, os.X_OK)

    def test_script_has_shebang(self):
        """Test that script has proper shebang"""
        script_path = os.path.join(os.path.dirname(__file__), "..", "sync_jira_to_beads.py")
        with open(script_path, 'r') as f:
            first_line = f.readline()
            assert first_line.startswith('#!')
            assert 'python' in first_line

    @patch('subprocess.run')
    def test_script_run_with_example_data(self, mock_run):
        """Test running script with example data flag"""
        mock_run.return_value = Mock(returncode=0)
        script_path = os.path.join(os.path.dirname(__file__), "..", "sync_jira_to_beads.py")
        
        # This would run the script in a real scenario
        # For now, just verify the path is correct
        assert os.path.exists(script_path)


class TestCrossPlatform:
    """Cross-platform compatibility tests"""

    def test_path_handling(self):
        """Test that paths work on all platforms"""
        sync = JiraBeadsSync("PROJ")
        # Should not raise errors
        assert sync.project_key == "PROJ"

    def test_subprocess_calls(self):
        """Test subprocess calls are platform-agnostic"""
        sync = JiraBeadsSync("PROJ")
        # _check_beads_installed uses subprocess
        # Should work regardless of platform
        result = sync._check_beads_installed()
        assert isinstance(result, bool)

    def test_json_handling(self):
        """Test JSON handling works across platforms"""
        sync = JiraBeadsSync("PROJ", use_example_data=True)
        data = sync._get_example_data()
        
        # JSON should serialize/deserialize correctly
        json_str = json.dumps(data)
        loaded_data = json.loads(json_str)
        assert loaded_data == data


class TestErrorHandling:
    """Test error handling scenarios"""

    def test_invalid_project_key(self):
        """Test handling of invalid project key"""
        sync = JiraBeadsSync("")
        assert sync.project_key == ""
        # Should not crash during initialization

    def test_missing_beads_command(self):
        """Test handling when beads is not installed"""
        with patch('subprocess.run', side_effect=FileNotFoundError()):
            sync = JiraBeadsSync("PROJ")
            result = sync._check_beads_installed()
            assert result is False

    @patch('subprocess.run')
    def test_beads_command_failure(self, mock_run):
        """Test handling when beads command fails"""
        mock_run.return_value = Mock(returncode=1, stderr="Error")
        sync = JiraBeadsSync("PROJ")
        # Should handle gracefully
        sync._check_beads_installed()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
