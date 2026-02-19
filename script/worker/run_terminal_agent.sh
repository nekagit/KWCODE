#!/bin/bash
# Run terminal agent: single run, cd to project, run agent with prompt from file.
# Used for: "Run terminal agent to fix" (prompt from .cursor/8. worker/fix-bug.md + pasted logs), Setup prompt, temp ticket (ideas, analyze, etc.).
# Not used for Implement All (see implement_all.sh).

set -e

usage() {
    echo "Usage: $0 -P /path/to/project -F /path/to/prompt.txt [-M mode]"
    echo "  -P /path   Project root (required)."
    echo "  -F file    Prompt file (required)."
    echo "  -M mode    Cursor CLI mode: ask | plan | debug (optional; default = normal agent)."
}

PROJECT_PATH=""
PROMPT_FILE=""
MODE=""
while [ $# -gt 0 ]; do
    case "$1" in
        -h|--help) usage; exit 0 ;;
        -P) shift; [ $# -gt 0 ] && PROJECT_PATH="$1" && shift ;;
        -F) shift; [ $# -gt 0 ] && PROMPT_FILE="$1" && shift ;;
        -M) shift; [ $# -gt 0 ] && MODE="$1" && shift ;;
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

# Cursor CLI: binary may be 'agent' or 'cursor-agent' (e.g. in ~/.local/bin)
AGENT_CMD=""
for cmd in agent cursor-agent; do
    if command -v "$cmd" >/dev/null 2>&1; then
        AGENT_CMD="$cmd"
        break
    fi
done
if [ -z "$AGENT_CMD" ]; then
    echo "[stderr] Cursor CLI not found (looked for 'agent' and 'cursor-agent'). Install: curl https://cursor.com/install -fsS | bash"
    echo "[stderr] This app adds ~/.local/bin and /usr/local/bin to PATH; ensure the CLI is in one of those or on your PATH."
    exit 127
fi

# #region agent log
DEBUG_LOG="${PROJECT_PATH}/.cursor/debug-b99de4.log"
[ -n "$PROJECT_PATH" ] && [ -d "$(dirname "$DEBUG_LOG")" ] && printf '%s\n' "{\"sessionId\":\"b99de4\",\"location\":\"run_terminal_agent.sh\",\"message\":\"script about to run agent\",\"data\":{\"MODE\":\"$MODE\",\"has_F\":\"yes\",\"prompt_len\":${#ESCAPED}},\"timestamp\":$(date +%s000),\"hypothesisId\":\"H3\"}" >> "$DEBUG_LOG"
# #endregion
if [ -n "$MODE" ]; then
    echo "Running: $AGENT_CMD --mode=$MODE -F -p \"<from file>\""
    "$AGENT_CMD" --mode="$MODE" -F -p "$ESCAPED"
else
    echo "Running: $AGENT_CMD -F -p \"<from file>\" (print mode, -F = trust workspace)"
    "$AGENT_CMD" -F -p "$ESCAPED"
fi
AGENT_EXIT=$?
# #region agent log
[ -n "$PROJECT_PATH" ] && [ -d "$(dirname "$DEBUG_LOG")" ] && printf '%s\n' "{\"sessionId\":\"b99de4\",\"location\":\"run_terminal_agent.sh\",\"message\":\"agent exited\",\"data\":{\"AGENT_EXIT\":$AGENT_EXIT},\"timestamp\":$(date +%s000),\"hypothesisId\":\"H4\"}" >> "$DEBUG_LOG"
# #endregion
echo ""
echo "Done. Agent exited with code $AGENT_EXIT."
if [ "$AGENT_EXIT" -ne 0 ]; then
    echo "Agent failed (non-zero exit). Check [stderr] above."
fi
exit "$AGENT_EXIT"
