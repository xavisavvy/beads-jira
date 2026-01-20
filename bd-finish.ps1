# bd-finish - Finish a beads issue and create a PR
# PowerShell version
#
# Usage: bd-finish <issue-id> [options]
# Example: bd-finish bd-a1b2

param(
    [Parameter(Mandatory=$true)]
    [string]$IssueId,
    
    [switch]$Draft,
    [switch]$NoPush,
    [switch]$Help
)

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Show-Help {
    Write-Host "Usage: bd-finish <issue-id> [options]"
    Write-Host ""
    Write-Host "Finishes a beads issue and creates a pull request"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Draft       Create as draft PR"
    Write-Host "  -NoPush      Don't push to remote (just mark done locally)"
    Write-Host "  -Help        Show this help"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  bd-finish bd-a1b2"
    Write-Host "  bd-finish bd-a1b2 -Draft"
    Write-Host "  bd-finish bd-a1b2 -NoPush"
}

if ($Help) {
    Show-Help
    exit 0
}

$ErrorActionPreference = "Stop"

Write-ColorOutput "Finishing issue $IssueId..." "Cyan"

# Get issue details from beads
try {
    $issueJson = bd show $IssueId --json 2>$null | ConvertFrom-Json
} catch {
    Write-ColorOutput "❌ Issue $IssueId not found" "Red"
    exit 1
}

$issueTitle = $issueJson.title
$issueType = $issueJson.type
$issueStatus = $issueJson.status
$issueLabels = $issueJson.labels

# Find Jira key from labels
$jiraKey = $issueLabels | Where-Object { $_ -match '^[A-Z]+-[0-9]+$' } | Select-Object -First 1

Write-ColorOutput "📋 Issue: $issueTitle" "Cyan"
Write-ColorOutput "🏷️  Type: $issueType" "Cyan"
if ($jiraKey) {
    Write-ColorOutput "🎫 Jira: $jiraKey" "Cyan"
}
Write-Host ""

# Check if there are uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-ColorOutput "⚠️  You have uncommitted changes." "Yellow"
    Write-Host "Please commit your changes first:"
    Write-Host "  git add ."
    if ($jiraKey) {
        Write-Host "  git commit -m `"Your message ($IssueId $jiraKey)`""
    } else {
        Write-Host "  git commit -m `"Your message ($IssueId)`""
    }
    exit 1
}

# Mark issue as done
bd done $IssueId
Write-ColorOutput "✓ Marked issue as done" "Green"

if ($NoPush) {
    Write-ColorOutput "Done! (not pushing to remote)" "Green"
    exit 0
}

# Get current branch
$currentBranch = git rev-parse --abbrev-ref HEAD

if ($currentBranch -eq "main" -or $currentBranch -eq "master") {
    Write-ColorOutput "⚠️  You're on $currentBranch branch." "Yellow"
    Write-Host "No pull request needed."
    exit 0
}

Write-ColorOutput "🌿 Current branch: $currentBranch" "Cyan"

# Push to remote
Write-ColorOutput "Pushing to remote..." "Cyan"
git push -u origin $currentBranch
Write-ColorOutput "✓ Pushed to origin/$currentBranch" "Green"

# Detect git hosting platform
$remoteUrl = git config --get remote.origin.url
Write-ColorOutput "🔗 Remote: $remoteUrl" "Cyan"

# Determine platform
$platform = "other"
if ($remoteUrl -match "github\.com") {
    $platform = "github"
} elseif ($remoteUrl -match "bitbucket\.org") {
    $platform = "bitbucket"
} elseif ($remoteUrl -match "gitlab\.com") {
    $platform = "gitlab"
} else {
    # Check for self-hosted instances
    if ($remoteUrl -match "gitlab") {
        $platform = "gitlab"
    } elseif ($remoteUrl -match "bitbucket") {
        $platform = "bitbucket"
    }
}

Write-ColorOutput "📦 Platform: $platform" "Cyan"
Write-Host ""

# Build PR title and body
if ($jiraKey) {
    $prTitle = "$jiraKey`: $issueTitle"
    $prBody = @"
Closes $IssueId / $jiraKey

## Changes
- 

## Testing
- 

## Related
- Jira: $jiraKey
- Beads: $IssueId
"@
} else {
    $prTitle = $issueTitle
    $prBody = @"
Closes $IssueId

## Changes
- 

## Testing
- 
"@
}

# Create PR based on platform
switch ($platform) {
    "github" {
        if (Get-Command gh -ErrorAction SilentlyContinue) {
            Write-ColorOutput "Creating GitHub PR..." "Cyan"
            $draftArg = if ($Draft) { "--draft" } else { "" }
            if ($draftArg) {
                gh pr create --title $prTitle --body $prBody $draftArg
            } else {
                gh pr create --title $prTitle --body $prBody
            }
            Write-ColorOutput "✓ Pull request created!" "Green"
        } else {
            Write-ColorOutput "⚠️  'gh' CLI not installed." "Yellow"
            Write-Host "Install it: https://cli.github.com/"
            Write-Host ""
            
            $repoPath = $remoteUrl -replace '.*github\.com[:/](.*)\.git', '$1'
            Write-Host "Or create PR manually:"
            Write-Host "  https://github.com/$repoPath/compare/$($currentBranch)?expand=1"
        }
    }
    
    "bitbucket" {
        $repoPath = $remoteUrl -replace '.*bitbucket\.org[:/]([^/]+/[^/.]+)(\.git)?', '$1'
        
        if (Get-Command bb -ErrorAction SilentlyContinue) {
            Write-ColorOutput "Creating Bitbucket PR..." "Cyan"
            bb pr create --title $prTitle --description $prBody
            Write-ColorOutput "✓ Pull request created!" "Green"
        } else {
            Write-ColorOutput "⚠️  Bitbucket CLI not installed." "Yellow"
            Write-Host ""
            Write-Host "Create PR manually:"
            Write-Host "  https://bitbucket.org/$repoPath/pull-requests/new?source=$currentBranch"
        }
    }
    
    "gitlab" {
        $repoPath = $remoteUrl -replace '.*gitlab[^/]*[:/]([^/]+/[^/.]+)(\.git)?', '$1'
        
        if (Get-Command glab -ErrorAction SilentlyContinue) {
            Write-ColorOutput "Creating GitLab MR..." "Cyan"
            $draftArg = if ($Draft) { "--draft" } else { "" }
            if ($draftArg) {
                glab mr create --title $prTitle --description $prBody $draftArg
            } else {
                glab mr create --title $prTitle --description $prBody
            }
            Write-ColorOutput "✓ Merge request created!" "Green"
        } else {
            Write-ColorOutput "⚠️  'glab' CLI not installed." "Yellow"
            Write-Host "Install it: https://gitlab.com/gitlab-org/cli"
            Write-Host ""
            Write-Host "Or create MR manually:"
            Write-Host "  https://gitlab.com/$repoPath/-/merge_requests/new?merge_request[source_branch]=$currentBranch"
        }
    }
    
    "other" {
        Write-ColorOutput "⚠️  Unknown git platform." "Yellow"
        Write-Host ""
        Write-Host "Branch pushed to: $currentBranch"
        Write-Host "Remote: $remoteUrl"
        Write-Host ""
        Write-Host "Create pull request manually in your git platform's web UI."
    }
}

Write-Host ""
Write-ColorOutput "🎉 All done!" "Green"
Write-Host ""
Write-Host "Issue $IssueId is marked as done."
Write-Host "Branch $currentBranch has been pushed."
