# Makefile for Jira-Beads Sync
# Cross-platform support for Windows/macOS/Linux

.PHONY: help install sync start finish test clean

# Detect OS and set defaults
ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
    SHELL_EXT := .ps1
    NODE_CMD := node
    PYTHON_CMD := python
else
    UNAME_S := $(shell uname -s)
    ifeq ($(UNAME_S),Linux)
        DETECTED_OS := Linux
    endif
    ifeq ($(UNAME_S),Darwin)
        DETECTED_OS := macOS
    endif
    SHELL_EXT := 
    NODE_CMD := node
    PYTHON_CMD := python3
endif

# Auto-detect best runtime (Node.js preferred for .NET/VueJS teams)
HAS_NODE := $(shell command -v node 2> /dev/null)
HAS_PYTHON := $(shell command -v python3 2> /dev/null || command -v python 2> /dev/null)
HAS_DOTNET := $(shell command -v dotnet 2> /dev/null)

# Choose sync script based on what's available
ifdef HAS_NODE
    SYNC_SCRIPT := $(NODE_CMD) scripts/sync_jira_to_beads.js
    SYNC_TYPE := Node.js
else ifdef HAS_PYTHON
    SYNC_SCRIPT := $(PYTHON_CMD) scripts/sync_jira_to_beads.py
    SYNC_TYPE := Python
else ifdef HAS_DOTNET
    SYNC_SCRIPT := dotnet script scripts/sync_jira_to_beads.cs --
    SYNC_TYPE := .NET
else
    $(error No runtime found! Install Node.js, Python, or .NET)
endif

# Default target
help:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║        Jira-Beads Sync - Workflow Automation               ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Detected OS:      $(DETECTED_OS)"
	@echo "Using Runtime:    $(SYNC_TYPE)"
	@echo ""
	@echo "Available Commands:"
	@echo "  make install              Install sync and workflow helpers"
	@echo "  make sync PROJ=MYPROJ     Sync Jira issues from project"
	@echo "  make sync PROJ=MYPROJ COMP=backend  Sync specific component"
	@echo "  make start ISSUE=bd-a1b2  Start work (creates branch)"
	@echo "  make finish ISSUE=bd-a1b2 Finish work (creates PR)"
	@echo "  make test                 Test sync with example data"
	@echo "  make clean                Remove generated files"
	@echo ""
	@echo "Examples:"
	@echo "  make sync PROJ=FRONT COMP=ui-components"
	@echo "  make start ISSUE=bd-a1b2"
	@echo "  make finish ISSUE=bd-a1b2"
	@echo ""
	@echo "For more info: https://github.com/yourorg/jira-beads-sync"

# Install everything
install:
	@echo "Installing Jira-Beads sync for $(DETECTED_OS)..."
ifeq ($(DETECTED_OS),Windows)
	@powershell -ExecutionPolicy Bypass -File install.ps1
else
	@bash install.sh
endif
	@echo "✓ Installation complete!"
	@echo ""
	@echo "Using: $(SYNC_TYPE)"
	@echo ""
	@echo "Next: make sync PROJ=YOUR_PROJECT"

# Sync Jira issues
sync:
ifndef PROJ
	$(error PROJ is required. Usage: make sync PROJ=MYPROJ)
endif
	@echo "Syncing Jira project $(PROJ)..."
ifdef COMP
	@$(SYNC_SCRIPT) $(PROJ) --component $(COMP)
else
	@$(SYNC_SCRIPT) $(PROJ)
endif

# Start working on issue
start:
ifndef ISSUE
	$(error ISSUE is required. Usage: make start ISSUE=bd-a1b2)
endif
	@echo "Starting work on $(ISSUE)..."
ifeq ($(DETECTED_OS),Windows)
	@powershell -ExecutionPolicy Bypass -File scripts/bd-start-branch.ps1 $(ISSUE)
else ifdef HAS_NODE
	@$(NODE_CMD) scripts/bd-start-branch.js $(ISSUE)
else
	@bash scripts/bd-start-branch $(ISSUE)
endif

# Finish issue and create PR
finish:
ifndef ISSUE
	$(error ISSUE is required. Usage: make finish ISSUE=bd-a1b2)
endif
	@echo "Finishing work on $(ISSUE)..."
ifeq ($(DETECTED_OS),Windows)
	@powershell -ExecutionPolicy Bypass -File scripts/bd-finish.ps1 $(ISSUE)
else ifdef HAS_NODE
	@$(NODE_CMD) scripts/bd-finish.js $(ISSUE)
else
	@bash scripts/bd-finish $(ISSUE)
endif

# Finish as draft PR
finish-draft:
ifndef ISSUE
	$(error ISSUE is required. Usage: make finish-draft ISSUE=bd-a1b2)
endif
	@echo "Finishing work on $(ISSUE) (draft PR)..."
ifeq ($(DETECTED_OS),Windows)
	@powershell -ExecutionPolicy Bypass -File scripts/bd-finish.ps1 $(ISSUE) -Draft
else ifdef HAS_NODE
	@$(NODE_CMD) scripts/bd-finish.js $(ISSUE) --draft
else
	@bash scripts/bd-finish $(ISSUE) --draft
endif

# Test with example data
test:
	@echo "Testing sync with example data..."
	@$(SYNC_SCRIPT) TEST --use-example-data
	@echo ""
	@echo "Check beads issues:"
	@bd ls --label jira-synced

# Clean generated files
clean:
	@echo "Cleaning generated files..."
	@rm -f .jira-beads-config 2>/dev/null || true
	@echo "✓ Clean complete"

# Show current config
config:
	@echo "Current Configuration:"
	@echo "  OS:            $(DETECTED_OS)"
	@echo "  Runtime:       $(SYNC_TYPE)"
	@echo "  Sync Command:  $(SYNC_SCRIPT)"
	@echo ""
	@if [ -f .jira-beads-config ]; then \
		echo "Jira Config (.jira-beads-config):"; \
		cat .jira-beads-config; \
	else \
		echo "No .jira-beads-config file found."; \
		echo "Run 'make install' first."; \
	fi
