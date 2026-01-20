# Offline Behavior

## Question: What happens if I don't have a network connection?

**Answer: The sync script will gracefully skip syncing and preserve your existing beads data. It will NOT create fake/nonsense issues.**

## Behavior Details

### When Offline (No MCP Connection)

```bash
python3 scripts/sync_jira_to_beads.py PROJ --component backend-api
```

**Output:**
```
============================================================
🔗 Jira to Beads Sync
============================================================
Project: PROJ
Component: backend-api

📋 Querying Jira with JQL: project = PROJ AND component = "backend-api" ...
❌ MCP query failed: [connection error]

⚠️  Cannot sync without network connection to Jira.
ℹ️  Your existing beads issues are still available offline.
ℹ️  Run sync again when online to get latest Jira updates.

✅ Found 0 Jira issues
ℹ️  No issues to sync
```

**What happens:**
- ✅ Script exits gracefully with exit code 0
- ✅ No fake/example data is created
- ✅ Existing beads issues remain unchanged
- ✅ Your local work continues unaffected

### When Git Hook Runs Offline

If you have the git post-merge hook installed:

```bash
git pull origin main  # When offline
```

**Output:**
```
Already up to date.

Running Jira sync...
❌ MCP query failed: [connection error]

⚠️  Cannot sync without network connection to Jira.
ℹ️  Your existing beads issues are still available offline.
ℹ️  Run sync again when online to get latest Jira updates.

ℹ️  No issues to sync
```

**What happens:**
- ✅ Git pull completes normally
- ✅ Sync hook runs but finds no issues
- ✅ No errors prevent your git workflow
- ✅ You can continue working with existing issues

## Testing with Example Data

For testing or demonstration purposes, you can explicitly use example data:

```bash
python3 scripts/sync_jira_to_beads.py PROJ --use-example-data
```

**Output:**
```
⚠️  Using example data (--use-example-data flag)

✅ Found 3 Jira issues

🔄 Processing EXAMPLE-123...
   ✅ Created bd-a1b2
...
```

**What happens:**
- Creates issues with keys like `EXAMPLE-123`, `EXAMPLE-456`
- Titles prefixed with `[EXAMPLE]`
- Descriptions indicate they are test data
- Useful for development/testing without real Jira

**Warning:** Don't use `--use-example-data` in production or git hooks!

## Working Offline

### Your existing beads issues are always available:

```bash
# View issues synced earlier (when you were online)
bd ready

# Work on existing issues
bd start bd-a1b2
bd show bd-a1b2

# Create new local issues
bd create "Fix broken link" -t bug -p 1

# These work completely offline
```

### When you go back online:

```bash
# Sync gets latest Jira updates
python3 scripts/sync_jira_to_beads.py PROJ --component backend-api

# Or just:
git pull  # Auto-syncs via hook
```

## Best Practices

### 1. Sync Before Going Offline

```bash
# Morning: Get all latest issues before traveling
python3 scripts/sync_jira_to_beads.py PROJ --component backend-api

# Now you have all current Jira issues for offline work
```

### 2. Don't Worry About Failed Syncs

The script is designed to be safe:
- No fake data is ever created
- Offline failures don't corrupt your beads database
- You can safely retry when online

### 3. Manual Updates When Back Online

If Jira issues changed while offline:

```bash
# When back online, run manual sync to catch up
python3 scripts/sync_jira_to_beads.py PROJ --component backend-api
```

## Troubleshooting

### "I ran the script offline and it created weird EXAMPLE issues"

This only happens if you used `--use-example-data` flag. To remove them:

```bash
# Find example issues
bd list --label EXAMPLE-123

# Delete them
bd delete bd-x1y2  # Replace with actual IDs
```

### "My git hook is creating fake issues"

Check your `.git/hooks/post-merge` file. If it has `--use-example-data`, remove that flag:

```bash
# Wrong:
python3 scripts/sync_jira_to_beads.py PROJ --use-example-data

# Correct:
python3 scripts/sync_jira_to_beads.py PROJ --component backend-api
```

### "I want to prevent sync when offline"

Add a network check to your git hook:

```bash
# In .git/hooks/post-merge
if ! ping -c 1 google.com &> /dev/null; then
    echo "⚠️  Offline - skipping Jira sync"
    exit 0
fi

python3 scripts/sync_jira_to_beads.py PROJ --component backend-api
```

## Summary

**Without network:**
- ✅ Script fails safely
- ✅ No fake data created
- ✅ Existing issues preserved
- ✅ Work continues normally offline

**With `--use-example-data` flag:**
- ⚠️ Creates clearly marked example issues
- 📝 Useful for testing only
- ❌ Don't use in production

**Best approach:**
- Sync before going offline
- Work with existing issues while offline
- Sync again when back online
