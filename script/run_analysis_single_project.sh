#!/bin/bash
# Run the project analysis prompt in Cursor for a single project.
# The app writes the prompt to the project's .cursor/analysis-prompt.md first;
# this script copies it to the clipboard, opens Cursor at the project, and
# triggers the agent (Cmd+N, paste, Enter). Results are saved by Cursor in .cursor/.

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/common_cursor_run.sh"

usage() {
    echo "Usage: $0 -P /path/to/project"
    echo "  -P /path   Project root (required). Prompt must exist at .cursor/analysis-prompt.md"
    echo ""
    echo "The app (project details page) writes the prompt to the project's .cursor/analysis-prompt.md"
    echo "before invoking this script. This script then opens Cursor, pastes the prompt, and submits."
    echo "The AI will write results (e.g. .cursor/ANALYSIS.md, .cursor/design.md) in the project."
}

PROJECT_PATH=""
while [ $# -gt 0 ]; do
    case "$1" in
        -h|--help) usage; exit 0 ;;
        -P) shift; [ $# -gt 0 ] && PROJECT_PATH="$1" && shift ;;
        *) echo "Unknown option: $1"; usage; exit 1 ;;
    esac
done

if [ -z "$PROJECT_PATH" ] || [ ! -d "$PROJECT_PATH" ]; then
    echo "Error: -P /path/to/project is required and must be a directory"
    usage
    exit 1
fi

PROMPT_FILE="${PROJECT_PATH}/.cursor/analysis-prompt.md"
if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: Prompt file not found: $PROMPT_FILE"
    echo "Save the analysis prompt from the project details page (Analysis dialog → Save prompt to .cursor) first."
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📂 Analysis – single project"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Project: $PROJECT_PATH"
echo "Prompt:  $PROMPT_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

set_clipboard "$PROMPT_FILE"
log_success "Clipboard set from .cursor/analysis-prompt.md"
open_cursor_project "$PROJECT_PATH"
sleep "$SLEEP_AFTER_OPEN_PROJECT"
run_project 0 "$PROJECT_PATH" 1
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Analysis round complete. Check Cursor for results in .cursor/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
