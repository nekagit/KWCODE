#!/bin/bash
# Implement All: store project path from current open project details (-P).
# Runs "agent" in-process (cd to project path, then agent). All output streams to the
# Tauri app's terminal card in project details — no separate Terminal window.
# Ticket list is read from PROJECT_PATH/.cursor/tickets.md (for validation only).

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

usage() {
    echo "Usage: $0 -P /path/to/project"
    echo "  -P /path   Project root (required). Uses .cursor/tickets.md for ticket list."
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

TICKETS_MD="${PROJECT_PATH}/.cursor/tickets.md"
if [ ! -f "$TICKETS_MD" ]; then
    echo "Error: $TICKETS_MD not found. Add tickets in the project details Todo tab."
    exit 1
fi

# Count ticket lines for reporting only (no GUI interaction)
TICKET_COUNT=$(grep -c -E '^[[:space:]]*-[[:space:]]*\[[ xX]\][[:space:]]*#[0-9]+' "$TICKETS_MD" 2>/dev/null || true)
TICKET_COUNT=${TICKET_COUNT:-0}
if [ "$TICKET_COUNT" -eq 0 ]; then
    echo "No tickets found in $TICKETS_MD (no lines like \"- [ ] #1 Title\")."
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Implement All – $TICKET_COUNT ticket(s)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Project: $PROJECT_PATH"
echo "  Running agent in-app; output appears in this terminal card."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Running agent at project path (output below)..."
(
  cd "$PROJECT_PATH" && agent
)
AGENT_EXIT=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$AGENT_EXIT" -eq 0 ]; then
    echo "Implement All finished. Agent exited successfully."
else
    echo "Implement All finished. Agent exited with code $AGENT_EXIT."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
exit "$AGENT_EXIT"
