#!/bin/bash
# Implement All: one run per terminal slot; prompt is built by the app from .cursor/8. worker/implement-all.md and the ticket (+ .cursor/2. agents when assigned).
# Usage: -P project path (required), -S 1|2|3 (optional slot), -F prompt file (optional; when set, runs agent -F -p "<content>").

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

usage() {
    echo "Usage: $0 -P /path/to/project [-S 1|2|3] [-F file]"
    echo "  -P /path   Project root (required)."
    echo "  -S 1|2|3   Terminal slot (optional). Matches the 3 split terminals in project details."
    echo "  -F file   Path to file containing prompt for agent (print mode). If set, runs agent -p \"<content>\"."
}

PROJECT_PATH=""
SLOT=""
PROMPT_FILE=""
while [ $# -gt 0 ]; do
    case "$1" in
        -h|--help) usage; exit 0 ;;
        -P) shift; [ $# -gt 0 ] && PROJECT_PATH="$1" && shift ;;
        -S) shift; [ $# -gt 0 ] && SLOT="$1" && shift ;;
        -F) shift; [ $# -gt 0 ] && PROMPT_FILE="$1" && shift ;;
        *) echo "Unknown option: $1"; usage; exit 1 ;;
    esac
done

if [ -z "$PROJECT_PATH" ] || [ ! -d "$PROJECT_PATH" ]; then
    echo "Error: -P /path/to/project is required and must be a directory"
    usage
    exit 1
fi

if [ -n "$SLOT" ]; then
  case "$SLOT" in
    1|2|3) ;;
    *) echo "Error: -S must be 1, 2, or 3"; usage; exit 1 ;;
  esac
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Implement All – Terminal slot $SLOT of 3"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Implement All"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi
echo "Project: $PROJECT_PATH"
echo "  cd into project path, then run agent."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "cd $PROJECT_PATH"
cd "$PROJECT_PATH" || exit 1
echo "  → $(pwd)"
echo ""
if [ -n "$PROMPT_FILE" ] && [ -f "$PROMPT_FILE" ]; then
  PROMPT_CONTENT=$(cat "$PROMPT_FILE")
  rm -f "$PROMPT_FILE"
  ESCAPED=$(printf '%s' "$PROMPT_CONTENT" | sed 's/\\/\\\\/g; s/"/\\"/g')
  echo "Running: agent -F -p \"<from file>\" (print mode, -F = trust workspace)"
  echo "(Output may appear when the agent finishes.)"
  agent -F -p "$ESCAPED"
else
  echo "Running: agent"
  echo "(Output may appear when the agent finishes.)"
  agent
fi
AGENT_EXIT=$?
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Done. Agent exited with code $AGENT_EXIT."
if [ "$AGENT_EXIT" -ne 0 ]; then
  echo "Agent failed (non-zero exit). Scroll up for agent output or look for [stderr] lines."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
exit "$AGENT_EXIT"
