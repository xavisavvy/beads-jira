# Packaging Strategy Analysis

Assessment of different distribution approaches for Jira-Beads sync tooling.

---

## 🤔 The Core Question

**How do developers in a .NET/VueJS org adopt this tooling?**

Current state: They need to manually copy files and run installers.
Goal: Make it as easy as possible to adopt and keep updated.

---

## 📊 Distribution Options Comparison

### Option 1: npm Package (Recommended for VueJS) ⭐

**Package structure:**
```
@yourorg/jira-beads-sync/
├── package.json
├── bin/
│   ├── jira-beads-install
│   ├── jira-beads-sync
│   ├── bd-start-branch
│   └── bd-finish
├── scripts/
│   └── sync_jira_to_beads.js
└── templates/
    ├── post-merge-hook
    └── .jira-beads-config
```

**Installation:**
```bash
# In VueJS project
npm install --save-dev @yourorg/jira-beads-sync

# One-time setup
npx jira-beads-install

# Daily use
npm run sync-jira
npm run start-issue bd-a1b2
npm run finish-issue bd-a1b2
```

**Pros:**
- ✅ VueJS projects already use npm
- ✅ Versioned, easy to update (`npm update`)
- ✅ Can pin to specific version
- ✅ Scoped to @yourorg (private registry)
- ✅ npm scripts in package.json
- ✅ Discoverable (`npm run`)

**Cons:**
- ⚠️ Doesn't help .NET-only projects
- ⚠️ Requires npm in CI/CD
- ⚠️ Another dependency to manage

**Update workflow:**
```bash
npm update @yourorg/jira-beads-sync
# Automatically gets latest
```

---

### Option 2: NuGet Package (Recommended for .NET) ⭐

**Package structure:**
```
YourOrg.JiraBeadsSync/
├── YourOrg.JiraBeadsSync.csproj
├── tools/
│   ├── install.ps1
│   ├── sync_jira_to_beads.cs
│   ├── bd-start-branch.ps1
│   └── bd-finish.ps1
└── build/
    └── YourOrg.JiraBeadsSync.targets (MSBuild targets)
```

**Installation:**
```bash
# In .NET project
dotnet add package YourOrg.JiraBeadsSync

# One-time setup (runs automatically via MSBuild target)
# Or manually: dotnet tool restore
```

**Pros:**
- ✅ Native to .NET ecosystem
- ✅ Can hook into MSBuild process
- ✅ `dotnet restore` installs it
- ✅ Works with Visual Studio
- ✅ Can be .NET tool (`dotnet tool install`)

**Cons:**
- ⚠️ Doesn't help VueJS projects
- ⚠️ Requires NuGet feed (private or public)
- ⚠️ Less familiar to frontend devs

**Update workflow:**
```bash
dotnet update package YourOrg.JiraBeadsSync
```

---

### Option 3: Git Submodule (Current Approach)

**Structure:**
```
your-project/
├── tools/
│   └── jira-beads/  (git submodule)
│       ├── install.sh
│       ├── package.json
│       └── ...
└── scripts/
    └── (installed by tools/jira-beads/install.sh)
```

**Installation:**
```bash
# Add to project
git submodule add https://github.com/yourorg/jira-beads-sync tools/jira-beads
git submodule update --init

# One-time setup
./tools/jira-beads/install.sh

# Update
git submodule update --remote
```

**Pros:**
- ✅ Works for any project type
- ✅ No package manager needed
- ✅ Easy to see what version (git commit)
- ✅ Can customize locally

**Cons:**
- ⚠️ Developers forget to update submodules
- ⚠️ `git submodule` commands are confusing
- ⚠️ Cloning requires `--recursive` flag
- ⚠️ More git complexity

---

### Option 4: Monorepo with Both Packages ⭐⭐⭐

**Structure:**
```
jira-beads-sync/
├── packages/
│   ├── npm/                    # For VueJS projects
│   │   ├── package.json
│   │   ├── bin/
│   │   └── scripts/
│   │       └── sync_jira_to_beads.js
│   │
│   ├── nuget/                  # For .NET projects
│   │   ├── YourOrg.JiraBeadsSync.csproj
│   │   ├── tools/
│   │   └── scripts/
│   │       └── sync_jira_to_beads.cs
│   │
│   └── shared/                 # Shared resources
│       ├── templates/
│       ├── docs/
│       └── install-scripts/
│
├── README.md
└── .github/
    └── workflows/
        ├── publish-npm.yml
        └── publish-nuget.yml
```

**Pros:**
- ✅ Single source of truth
- ✅ Both ecosystems supported
- ✅ Shared documentation
- ✅ Coordinated releases
- ✅ Easy to keep in sync

**Cons:**
- ⚠️ More complex CI/CD
- ⚠️ Need to maintain both packages
- ⚠️ Version management across packages

---

### Option 5: Project Template (Cookiecutter/Yeoman)

**Structure:**
```
jira-beads-template/
├── template.json
├── {{projectName}}/
│   ├── .github/workflows/
│   ├── scripts/
│   └── package.json (or .csproj)
└── hooks/
    └── post-generate.sh
```

**Usage:**
```bash
# Create new project with tooling built-in
npx create-@yourorg/app my-project
# or
dotnet new yourorg-webapp -n MyProject

# Tooling is already installed
```

**Pros:**
- ✅ Zero setup for new projects
- ✅ Baked into project templates
- ✅ Standardization across org

**Cons:**
- ⚠️ Doesn't help existing projects
- ⚠️ Updates require template changes
- ⚠️ Template drift over time

---

## 🎯 Recommended Strategy: Hybrid Approach

### For Your .NET/VueJS Organization

**Use Option 4 (Monorepo) + Option 5 (Templates)**

### Phase 1: Monorepo Structure

```
jira-beads-sync/
├── packages/
│   ├── npm/
│   │   ├── package.json
│   │   │   {
│   │   │     "name": "@yourorg/jira-beads-sync",
│   │   │     "version": "1.0.0",
│   │   │     "bin": {
│   │   │       "jira-beads-install": "./bin/install.js",
│   │   │       "jira-beads-sync": "./bin/sync.js",
│   │   │       "bd-start": "./bin/start-branch.js",
│   │   │       "bd-finish": "./bin/finish.js"
│   │   │     }
│   │   │   }
│   │   └── src/
│   │       ├── sync_jira_to_beads.js
│   │       ├── bd-start-branch.js
│   │       └── bd-finish.js
│   │
│   └── nuget/
│       ├── YourOrg.JiraBeadsSync.csproj
│       │   <PackageId>YourOrg.JiraBeadsSync</PackageId>
│       │   <Version>1.0.0</Version>
│       │   <PackageProjectUrl>https://github.com/yourorg/jira-beads-sync</PackageProjectUrl>
│       │
│       └── tools/
│           ├── sync_jira_to_beads.cs
│           ├── bd-start-branch.ps1
│           └── bd-finish.ps1
│
└── shared/
    ├── docs/           # Shared documentation
    ├── templates/      # Hook templates, configs
    └── tests/          # Integration tests
```

### Phase 2: Installation Per Project Type

**VueJS Frontend Projects:**
```bash
npm install --save-dev @yourorg/jira-beads-sync
npx jira-beads-install PROJ --component ui

# Adds to package.json:
{
  "scripts": {
    "sync-jira": "jira-beads-sync",
    "start-issue": "bd-start",
    "finish-issue": "bd-finish"
  }
}

# Daily use:
npm run sync-jira PROJ
npm run start-issue bd-a1b2
npm run finish-issue bd-a1b2
```

**.NET Backend Projects:**
```bash
dotnet add package YourOrg.JiraBeadsSync
dotnet jira-beads-install PROJ --component api

# Or as dotnet tool:
dotnet tool install --global YourOrg.JiraBeadsSync
jira-beads-sync PROJ --component api
bd-start bd-a1b2
bd-finish bd-a1b2
```

**Full-Stack Project (Both):**
```
my-fullstack-project/
├── frontend/           # VueJS
│   ├── package.json   (has @yourorg/jira-beads-sync)
│   └── .beads/
│
├── backend/            # .NET
│   ├── Backend.csproj (has YourOrg.JiraBeadsSync)
│   └── .beads/
│
└── .git/
```

### Phase 3: Update Strategy

**npm version:**
```bash
cd frontend
npm update @yourorg/jira-beads-sync
# Automatically gets latest
```

**NuGet version:**
```bash
cd backend
dotnet add package YourOrg.JiraBeadsSync
# Or: dotnet tool update --global YourOrg.JiraBeadsSync
```

---

## 💡 Key Decisions to Make

### 1. Single .beads Database or Multiple?

**Option A: Monorepo-style (Single .beads at root)**
```
my-project/
├── .beads/             # Shared database
├── frontend/
└── backend/
```
**Pros:** Single source of truth, no duplication
**Cons:** Frontend/backend might have different Jira projects

**Option B: Separate databases**
```
my-project/
├── frontend/
│   └── .beads/         # Frontend issues
└── backend/
    └── .beads/         # Backend issues
```
**Pros:** Clear separation, different Jira filters
**Cons:** Need to cd between directories

**Recommendation:** Option B for full-stack, Option A for single-stack

### 2. Private Registry or Public?

**Private (Recommended for enterprise):**
- npm: Verdaccio, Azure Artifacts, GitHub Packages
- NuGet: Azure Artifacts, GitHub Packages, MyGet

**Public:**
- npm: npmjs.com (@yourorg scope)
- NuGet: nuget.org

**Recommendation:** Start private, go public if open-sourcing

### 3. Versioning Strategy

**Option A: Synchronized versions**
- npm v1.2.3 = NuGet v1.2.3
- Released together
- Same features

**Option B: Independent versions**
- npm v1.5.0, NuGet v1.3.0
- Different release cycles
- Can diverge

**Recommendation:** Option A (synchronized) for simplicity

---

## 🚀 Migration Path

### Step 1: Create Monorepo (This Week)
```bash
mkdir -p jira-beads-sync/packages/{npm,nuget,shared}
# Move existing files
# Set up CI/CD
```

### Step 2: Publish First Versions (Next Week)
```bash
# npm
cd packages/npm
npm publish --access restricted

# NuGet
cd packages/nuget
dotnet pack
dotnet nuget push *.nupkg
```

### Step 3: Pilot with 2-3 Projects (Week 3)
```bash
# Test in real projects
# Gather feedback
# Iterate
```

### Step 4: Create Project Templates (Week 4)
```bash
# Vue template with @yourorg/jira-beads-sync
# .NET template with YourOrg.JiraBeadsSync
```

### Step 5: Rollout to Org (Week 5+)
```bash
# Announce in team channels
# Update onboarding docs
# Deprecate git submodule approach
```

---

## 📊 Effort Estimation

| Task | Effort | Owner |
|------|--------|-------|
| Set up monorepo structure | 2 hours | DevOps |
| Create npm package | 4 hours | Frontend lead |
| Create NuGet package | 4 hours | Backend lead |
| Set up private registries | 4 hours | DevOps |
| CI/CD for publishing | 6 hours | DevOps |
| Documentation updates | 3 hours | Tech writer |
| Pilot testing | 1 week | 2-3 devs |
| Project templates | 8 hours | Both leads |
| **Total** | **~2-3 weeks** | **Team effort** |

---

## 🎯 Final Recommendation

**For your .NET/VueJS organization:**

✅ **Do:**
1. Create monorepo with npm + NuGet packages
2. Publish to private registry (Azure Artifacts or GitHub Packages)
3. Use synchronized versioning (v1.0.0 for both)
4. Keep documentation in shared/ folder
5. Provide both packages but let teams choose

✅ **Don't:**
1. Force one package on all projects
2. Make it too complex (keep simple install)
3. Forget to version scripts alongside packages
4. Skip the pilot phase

**Start with:**
- npm package for VueJS projects ⭐ (they're already using npm)
- Document NuGet approach for .NET-only projects
- Build NuGet package in Phase 2 if there's demand

**This gives you:**
- Easy adoption (npm install for VueJS teams)
- Automatic updates (npm update)
- Versioning and rollback
- Gradual rollout capability
- Path to full .NET support later

**Bottom line:** Start with npm package, add NuGet if needed. Don't over-engineer upfront.
