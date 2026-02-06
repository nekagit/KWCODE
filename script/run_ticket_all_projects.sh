#!/bin/bash
# Run one ticket across all projects: paste ticket title + description into Cursor.
# Ticket selected by id (-i) or title (-t). Uses same Cursor automation as run_prompts.

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/common_cursor_run.sh"

usage() {
    echo "Usage: $0 [-i TICKET_ID | -t \"Ticket title\"] [-f projects.json] [-l]"
    echo "  -i TICKET_ID    Ticket UUID from tickets.json"
    echo "  -t \"Title\"      Ticket title (partial match)"
    echo "  (no -i/-t)      Use first ticket in tickets.json"
    echo "  -f projects.json  Project list (default: cursor_projects.json)"
    echo "  -l              Loop forever with SLEEP_BETWEEN_ROUNDS between rounds"
    echo ""
    echo "Example: $0 -t \"Calendar\"    # Run first ticket matching 'Calendar'"
}

get_ticket_content() {
    local tickets_file="$1"
    local id="$2"
    local title="$3"
    if command -v jq &>/dev/null; then
        if [ -n "$id" ]; then
            jq -r --arg id "$id" '.[] | select(.id == $id) | "## \(.title)\n\n\(.description)"' "$tickets_file" 2>/dev/null
            return $?
        fi
        if [ -n "$title" ]; then
            jq -r --arg t "$title" '.[] | select(.title | test($t; "i")) | "## \(.title)\n\n\(.description)"' "$tickets_file" 2>/dev/null | head -1
            return $?
        fi
        jq -r '.[0] | "## \(.title)\n\n\(.description)"' "$tickets_file" 2>/dev/null
        return $?
    fi
    python3 - "$tickets_file" "$id" "$title" << 'PY'
import json, sys, re
path = sys.argv[1]
tid, ttitle = sys.argv[2], sys.argv[3]
with open(path) as f:
    data = json.load(f)
for t in data:
    if tid and t.get("id") == tid:
        print("##", t.get("title", ""))
        print()
        print(t.get("description", ""))
        sys.exit(0)
    if ttitle and re.search(re.escape(ttitle), t.get("title", ""), re.I):
        print("##", t.get("title", ""))
        print()
        print(t.get("description", ""))
        sys.exit(0)
if not tid and not ttitle and data:
    t = data[0]
    print("##", t.get("title", ""))
    print()
    print(t.get("description", ""))
PY
}

TICKET_ID=""
TICKET_TITLE=""
PROJECTS_FILE=""
LOOP=false

while getopts "i:t:f:lh" opt; do
    case "$opt" in
        i) TICKET_ID="$OPTARG" ;;
        t) TICKET_TITLE="$OPTARG" ;;
        f) PROJECTS_FILE="$OPTARG" ;;
        l) LOOP=true ;;
        h) usage; exit 0 ;;
        *) usage; exit 1 ;;
    esac
done

[ ! -f "$TICKETS_JSON" ] && { echo "Missing $TICKETS_JSON"; exit 1; }
TICKET_CONTENT=$(get_ticket_content "$TICKETS_JSON" "$TICKET_ID" "$TICKET_TITLE")
[ -z "$TICKET_CONTENT" ] && { echo "No matching ticket found"; exit 1; }

# Project list
PROJECTS=()
if [ -n "$PROJECTS_FILE" ] && [ -f "$PROJECTS_FILE" ]; then
    while IFS= read -r path; do
        [ -n "$path" ] && PROJECTS+=("$path")
    done < <(read_projects_from_json "$PROJECTS_FILE")
fi
[ ${#PROJECTS[@]} -eq 0 ] && while IFS= read -r path; do
    [ -n "$path" ] && PROJECTS+=("$path")
done < <(read_projects_from_json "$DEFAULT_PROJECTS_JSON")
[ ${#PROJECTS[@]} -eq 0 ] && PROJECTS=("${DEFAULT_PROJECTS[@]}")

TMP_CONTENT=$(mktemp)
trap 'rm -f "$TMP_CONTENT"' EXIT
echo "$TICKET_CONTENT" > "$TMP_CONTENT"

TICKET_TITLE_LINE=$(echo "$TICKET_CONTENT" | head -1)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎫 Run ticket across projects"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Ticket: $TICKET_TITLE_LINE"
echo "Projects: ${#PROJECTS[@]}"
echo "Loop: $LOOP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ROUND=0
while true; do
    ROUND=$((ROUND + 1))
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║         ROUND $ROUND                        ║"
    echo "╚════════════════════════════════════════╝"
    set_clipboard "$TMP_CONTENT"
    log_success "Clipboard set"
    for i in "${!PROJECTS[@]}"; do
        open_cursor_project "${PROJECTS[$i]}"
        sleep "$SLEEP_AFTER_OPEN_PROJECT"
        run_project "$i" "${PROJECTS[$i]}" "$ROUND"
        if [ $i -lt $((${#PROJECTS[@]} - 1)) ]; then
            log_info "Waiting ${SLEEP_BETWEEN_PROJECTS}s before next project..."
            sleep "$SLEEP_BETWEEN_PROJECTS"
        fi
    done
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Round $ROUND complete - ticket on all projects"
    [ "$LOOP" != true ] && break
    echo "⏱️  Waiting ${SLEEP_BETWEEN_ROUNDS}s before next round (Ctrl+C to stop)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    sleep "$SLEEP_BETWEEN_ROUNDS"
done
