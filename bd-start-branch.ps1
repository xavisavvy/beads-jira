# bd-start-branch - Start working on a beads issue with automatic branch creation
# PowerShell version
#
# Usage: bd-start-branch <issue-id>
# Example: bd-start-branch bd-a1b2

param(
    [Parameter(Mandatory=$true)]
    [string]$IssueId
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "Starting issue $IssueId..." "Cyan"

# Get issue details from beads
try {
    $issueJson = bd show $IssueId --json 2>$null | ConvertFrom-Json
} catch {
    Write-ColorOutput "❌ Issue $IssueId not found" "Red"
    exit 1
}

$issueTitle = $issueJson.title
$issueType = $issueJson.type
$issueLabels = $issueJson.labels

# Find Jira key from labels (format: PROJ-123)
$jiraKey = $issueLabels | Where-Object { $_ -match '^[A-Z]+-[0-9]+$' } | Select-Object -First 1

# Create branch name
# Format: <type>/<jira-key>-<slugified-title>
# Example: feature/FRONT-234-fix-button-alignment

# Slugify title
$slug = $issueTitle.ToLower() -replace '[^a-z0-9 -]', '' -replace ' ', '-'
$slug = $slug.Substring(0, [Math]::Min(50, $slug.Length))

if ($jiraKey) {
    $branchName = "$issueType/$jiraKey-$slug"
} else {
    $branchName = "$issueType/$IssueId-$slug"
}

Write-ColorOutput "📋 Issue: $issueTitle" "Cyan"
Write-ColorOutput "🏷️  Type: $issueType" "Cyan"
if ($jiraKey) {
    Write-ColorOutput "🎫 Jira: $jiraKey" "Cyan"
}
Write-ColorOutput "🌿 Branch: $branchName" "Cyan"
Write-Host ""

# Check if we're on a clean working directory
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-ColorOutput "⚠️  You have uncommitted changes." "Yellow"
    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -notmatch '^[Yy]$') {
        Write-Host "Cancelled."
        exit 1
    }
}

# Make sure we're on main/master
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
    Write-ColorOutput "⚠️  You're on branch '$currentBranch', not main/master." "Yellow"
    $response = Read-Host "Create branch from current branch? (y/n)"
    if ($response -notmatch '^[Yy]$') {
        Write-Host "Cancelled. Switch to main first:"
        Write-Host "  git checkout main"
        exit 1
    }
}

# Check if branch already exists
$branchExists = git show-ref --verify --quiet "refs/heads/$branchName"
if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "⚠️  Branch '$branchName' already exists." "Yellow"
    $response = Read-Host "Check it out? (y/n)"
    if ($response -match '^[Yy]$') {
        git checkout $branchName
    } else {
        Write-Host "Cancelled."
        exit 1
    }
} else {
    git checkout -b $branchName
    Write-ColorOutput "✓ Created and checked out branch: $branchName" "Green"
}

# Start the beads issue
bd start $IssueId
Write-ColorOutput "✓ Started issue: $IssueId" "Green"

Write-Host ""
Write-ColorOutput "🚀 Ready to work!" "Green"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Make your changes"
if ($jiraKey) {
    Write-Host "  2. Commit with: git commit -m `"Your message ($IssueId $jiraKey)`""
} else {
    Write-Host "  2. Commit with: git commit -m `"Your message ($IssueId)`""
}
Write-Host "  3. When done: bd done $IssueId"
Write-Host "  4. Push and create PR"
