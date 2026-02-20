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
DEBUG_LOG="${PROJECT_PATH}/.cursor/debug-415745.log"
[ -n "$PROJECT_PATH" ] && [ -d "$(dirname "$DEBUG_LOG")" ] && printf '%s\n' "{\"sessionId\":\"415745\",\"location\":\"run_terminal_agent.sh:pre-run\",\"message\":\"script about to run agent\",\"data\":{\"MODE\":\"$MODE\",\"AGENT_CMD\":\"$AGENT_CMD\",\"prompt_len\":${#ESCAPED},\"PROJECT_PATH\":\"$PROJECT_PATH\"},\"timestamp\":$(date +%s000),\"hypothesisId\":\"H3\"}" >> "$DEBUG_LOG"
# #endregion
AGENT_OUTPUT_FILE="${PROJECT_PATH}/.cursor/agent_output_415745.txt"
AGENT_STDERR_FILE="${PROJECT_PATH}/.cursor/agent_stderr_415745.txt"
# #region agent log - test agent binary
AGENT_VERSION=$("$AGENT_CMD" --version 2>&1 || echo "version_failed")
AGENT_WHICH=$(which "$AGENT_CMD" 2>&1 || echo "which_failed")
# Test if Cursor is reachable with a simple prompt (correct syntax: --print, prompt as positional arg)
AGENT_TEST=$("$AGENT_CMD" --print "say hi" 2>&1 | head -c 200 || echo "test_failed")
[ -n "$PROJECT_PATH" ] && [ -d "$(dirname "$DEBUG_LOG")" ] && printf '%s\n' "{\"sessionId\":\"415745\",\"location\":\"run_terminal_agent.sh:agent-check\",\"message\":\"agent binary info\",\"data\":{\"AGENT_VERSION\":\"$(echo "$AGENT_VERSION" | tr '\n' ' ' | tr '"' "'")\",\"AGENT_WHICH\":\"$AGENT_WHICH\",\"AGENT_TEST\":\"$(echo "$AGENT_TEST" | tr '\n' ' ' | tr '"' "'")\"},\"timestamp\":$(date +%s000),\"hypothesisId\":\"H1\"}" >> "$DEBUG_LOG"
# #endregion
# Log prompt length and first/last chars for debugging
PROMPT_FIRST=$(echo "$ESCAPED" | head -c 100 | tr '\n' ' ' | tr '"' "'")
PROMPT_LAST=$(echo "$ESCAPED" | tail -c 100 | tr '\n' ' ' | tr '"' "'")
[ -n "$PROJECT_PATH" ] && [ -d "$(dirname "$DEBUG_LOG")" ] && printf '%s\n' "{\"sessionId\":\"415745\",\"location\":\"run_terminal_agent.sh:prompt-debug\",\"message\":\"prompt content check\",\"data\":{\"prompt_len\":${#ESCAPED},\"prompt_first\":\"$PROMPT_FIRST\",\"prompt_last\":\"$PROMPT_LAST\"},\"timestamp\":$(date +%s000),\"hypothesisId\":\"H3\"}" >> "$DEBUG_LOG"
if [ -n "$MODE" ]; then
    echo "Running: $AGENT_CMD --mode=$MODE --print --trust \"<prompt>\""
    # #region agent log
    [ -n "$PROJECT_PATH" ] && [ -d "$(dirname "$DEBUG_LOG")" ] && printf '%s\n' "{\"sessionId\":\"415745\",\"location\":\"run_terminal_agent.sh:with-mode\",\"message\":\"invoking agent with mode\",\"data\":{\"MODE\":\"$MODE\",\"AGENT_CMD\":\"$AGENT_CMD\"},\"timestamp\":$(date +%s000),\"hypothesisId\":\"H2\"}" >> "$DEBUG_LOG"
    # #endregion
    # Correct CLI usage: --print (non-interactive), --trust (trust workspace), prompt as positional arg
    "$AGENT_CMD" --mode="$MODE" --print --trust "$PROMPT_CONTENT" > "$AGENT_OUTPUT_FILE" 2> "$AGENT_STDERR_FILE" &
    AGENT_PID=$!
    # Log that we started the agent
    [ -n "$PROJECT_PATH" ] && [ -d "$(dirname "$DEBUG_LOG")" ] && printf '%s\n' "{\"sessionId\":\"415745\",\"location\":\"run_terminal_agent.sh:agent-started\",\"message\":\"agent process started\",\"data\":{\"AGENT_PID\":$AGENT_PID},\"timestamp\":$(date +%s000),\"hypothesisId\":\"H5\"}" >> "$DEBUG_LOG"
    wait $AGENT_PID
    AGENT_EXIT=$?
else
    echo "Running: $AGENT_CMD --print --trust \"<prompt>\" (print mode, trust workspace)"
    # Correct CLI usage: --print (non-interactive), --trust (trust workspace), prompt as positional arg
    "$AGENT_CMD" --print --trust "$PROMPT_CONTENT" > "$AGENT_OUTPUT_FILE" 2> "$AGENT_STDERR_FILE" &
    AGENT_PID=$!
    [ -n "$PROJECT_PATH" ] && [ -d "$(dirname "$DEBUG_LOG")" ] && printf '%s\n' "{\"sessionId\":\"415745\",\"location\":\"run_terminal_agent.sh:agent-started\",\"message\":\"agent process started\",\"data\":{\"AGENT_PID\":$AGENT_PID},\"timestamp\":$(date +%s000),\"hypothesisId\":\"H5\"}" >> "$DEBUG_LOG"
    wait $AGENT_PID
    AGENT_EXIT=$?
fi
# Capture output and stderr for logging
AGENT_OUTPUT_SNIPPET=$(head -c 500 "$AGENT_OUTPUT_FILE" 2>/dev/null | tr '\n' ' ' | tr '"' "'" || echo "no_stdout")
AGENT_STDERR_SNIPPET=$(head -c 500 "$AGENT_STDERR_FILE" 2>/dev/null | tr '\n' ' ' | tr '"' "'" || echo "no_stderr")
# Also print to stdout/stderr so terminal sees it
cat "$AGENT_OUTPUT_FILE" 2>/dev/null
cat "$AGENT_STDERR_FILE" >&2 2>/dev/null
# #region agent log
[ -n "$PROJECT_PATH" ] && [ -d "$(dirname "$DEBUG_LOG")" ] && printf '%s\n' "{\"sessionId\":\"415745\",\"location\":\"run_terminal_agent.sh:post-run\",\"message\":\"agent exited\",\"data\":{\"AGENT_EXIT\":$AGENT_EXIT,\"MODE\":\"$MODE\",\"stdout\":\"$AGENT_OUTPUT_SNIPPET\",\"stderr\":\"$AGENT_STDERR_SNIPPET\"},\"timestamp\":$(date +%s000),\"hypothesisId\":\"H4\"}" >> "$DEBUG_LOG"
# #endregion
echo ""
echo "Done. Agent exited with code $AGENT_EXIT."
if [ "$AGENT_EXIT" -ne 0 ]; then
    echo "Agent failed (non-zero exit). Check [stderr] above."
fi
exit "$AGENT_EXIT"
