#!/bin/bash
# Implement All: store project path from current open project details (-P).
# Optional -S 1|2|3: terminal slot in the project details 3-split terminal section.
# Runs "agent" in-process (cd to project path, then agent). Output streams to the
# Tauri app terminal card for this slot. Ticket list from .cursor/tickets.md (validation only).

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

usage() {
    echo "Usage: $0 -P /path/to/project [-S 1|2|3]"
    echo "  -P /path   Project root (required). Uses .cursor/tickets.md for ticket list."
    echo "  -S 1|2|3   Terminal slot (optional). Matches the 3 split terminals in project details."
}

PROJECT_PATH=""
SLOT=""
while [ $# -gt 0 ]; do
    case "$1" in
        -h|--help) usage; exit 0 ;;
        -P) shift; [ $# -gt 0 ] && PROJECT_PATH="$1" && shift ;;
        -S) shift; [ $# -gt 0 ] && SLOT="$1" && shift ;;
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
  echo "Implement All – $TICKET_COUNT ticket(s)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi
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
