#!/bin/bash
# Run terminal agent: single run, cd to project, run agent with prompt from file.
# Used for: "Run terminal agent to fix" (prompt from .cursor/8. worker/fix-bug.md + pasted logs), Setup prompt, temp ticket (ideas, analyze, etc.).
# Not used for Implement All (see implement_all.sh).

set -e

usage() {
    echo "Usage: $0 -P /path/to/project -F /path/to/prompt.txt"
    echo "  -P /path   Project root (required)."
    echo "  -F file    Prompt file (required)."
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
    echo "Error: -F prompt_file is required and must exist"
    usage
    exit 1
fi

echo "Run terminal agent (single run)"
echo "Project: $PROJECT_PATH"
echo "cd $PROJECT_PATH"
cd "$PROJECT_PATH" || exit 1
echo "  → $(pwd)"
echo ""

PROMPT_CONTENT=$(cat "$PROMPT_FILE")
rm -f "$PROMPT_FILE"
ESCAPED=$(printf '%s' "$PROMPT_CONTENT" | sed 's/\\/\\\\/g; s/"/\\"/g')
echo "Running: agent -F -p \"<from file>\" (print mode, -F = trust workspace)"
agent -p "$ESCAPED"
AGENT_EXIT=$?
echo ""
echo "Done. Agent exited with code $AGENT_EXIT."
if [ "$AGENT_EXIT" -ne 0 ]; then
    echo "Agent failed (non-zero exit). Check [stderr] above."
fi
exit "$AGENT_EXIT"
