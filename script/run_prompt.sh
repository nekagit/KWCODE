#!/bin/bash
# Run Prompt: execute agent -p with a prompt from a file.
# Used by the "Run Prompt" button in the Setup tab sections.
# Output streams to the Tauri app floating terminal dialog.

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

usage() {
    echo "Usage: $0 -P /path/to/project -F /path/to/prompt-file"
    echo "  -P /path   Project root (required)."
    echo "  -F file    Path to file containing prompt for agent (print mode). Runs agent -p \"<content>\"."
}

PROJECT_PATH=""
PROMPT_FILE=""
while [ $# -gt 0 ]; do
    case "$1" in
        -h|--help) usage; exit 0 ;;
        -P) shift; [ $# -gt 0 ] && PROJECT_PATH="$1" && shift ;;
        -F) shift; [ $# -gt 0 ] && PROMPT_FILE="$1" && shift ;;
        *) echo "Unknown option: $1"; usage; exit 1 ;;
    esac
done

if [ -z "$PROJECT_PATH" ] || [ ! -d "$PROJECT_PATH" ]; then
    echo "Error: -P /path/to/project is required and must be a directory"
    usage
    exit 1
fi

if [ -z "$PROMPT_FILE" ] || [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: -F /path/to/prompt-file is required and must be a file"
    usage
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Run Prompt"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Project: $PROJECT_PATH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "cd $PROJECT_PATH"
cd "$PROJECT_PATH" || exit 1
echo "  → $(pwd)"
echo ""

PROMPT_CONTENT=$(cat "$PROMPT_FILE")
rm -f "$PROMPT_FILE"
ESCAPED=$(printf '%s' "$PROMPT_CONTENT" | sed 's/\\/\\\\/g; s/"/\\"/g')
echo "Running: agent -p \"<prompt>\" (print mode)"
agent -p "$ESCAPED"

AGENT_EXIT=$?
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Done. Agent exited with code $AGENT_EXIT."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
exit "$AGENT_EXIT"
