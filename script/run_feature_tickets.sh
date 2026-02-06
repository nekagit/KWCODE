#!/bin/bash
# Run one feature across its projects: prompts + ticket descriptions pasted into Cursor.
# Feature is selected by id (-i), title (-t), or first feature in features.json.
# Uses same Cursor automation as run_prompts_all_projects.sh.

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/common_cursor_run.sh"

usage() {
    echo "Usage: $0 [-i FEATURE_ID | -t \"Feature title\"] [-f projects.json] [-l] [-n]"
    echo "  -i FEATURE_ID   Feature UUID from features.json"
    echo "  -t \"Title\"      Feature title (partial match)"
    echo "  (no -i/-t)      Use first feature in features.json"
    echo "  -f projects.json  Override project list (default: feature's project_paths or cursor_projects.json)"
    echo "  -l              Loop forever with SLEEP_BETWEEN_ROUNDS between rounds"
    echo "  -n              Include ticket descriptions in the pasted content (below prompts)"
    echo ""
    echo "Example: $0 -t \"Calendar\" -n    # Run feature matching 'Calendar', include tickets"
}

get_combined_prompt_content() {
    local prompts_file="$1"
    shift
    local ids=("$@")
    if command -v jq &>/dev/null; then
        local first=1
        for id in "${ids[@]}"; do
            [ -z "$id" ] && continue
            local content
            content=$(jq -r --argjson id "$id" '.[] | select(.id == $id) | .content' "$prompts_file" 2>/dev/null)
            if [ -z "$content" ]; then
                log_warn "No prompt with id=$id"
                continue
            fi
            [ "$first" -eq 0 ] && echo -e "\n\n---\n\n"
            printf '%s' "$content"
            first=0
        done
        return 0
    fi
    python3 - "$prompts_file" "${ids[@]}" << 'PY'
import json, sys
path = sys.argv[1]
ids = [int(x) for x in sys.argv[2:] if x.strip()]
with open(path) as f:
    data = json.load(f)
by_id = {p["id"]: p.get("content", "") for p in data}
parts = []
for i in ids:
    if i in by_id:
        parts.append(by_id[i])
print("\n\n---\n\n".join(parts))
PY
}

# Output ticket titles + descriptions for given ticket IDs (one per line)
get_ticket_descriptions() {
    local tickets_file="$1"
    shift
    local ids=("$@")
    [ ${#ids[@]} -eq 0 ] && return 0
    if command -v jq &>/dev/null; then
        for id in "${ids[@]}"; do
            [ -z "$id" ] && continue
            local title desc
            title=$(jq -r --arg id "$id" '.[] | select(.id == $id) | .title' "$tickets_file" 2>/dev/null)
            desc=$(jq -r --arg id "$id" '.[] | select(.id == $id) | .description' "$tickets_file" 2>/dev/null)
            [ -n "$title" ] && echo "## Ticket: $title" && echo "${desc:-}" && echo ""
        done
        return 0
    fi
    python3 - "$tickets_file" "${ids[@]}" << 'PY'
import json, sys
path = sys.argv[1]
ids = sys.argv[2:]
with open(path) as f:
    data = json.load(f)
by_id = {t["id"]: t for t in data}
for i in ids:
    t = by_id.get(i, {})
    if t:
        print("## Ticket:", t.get("title", ""))
        print(t.get("description", ""))
        print()
PY
}

# Get feature JSON by id or title; output full JSON to stdout
get_feature_json() {
    local id="$1"
    local title="$2"
    if [ -n "$id" ]; then
        jq -r --arg id "$id" '.[] | select(.id == $id)' "$FEATURES_JSON" 2>/dev/null | head -1
        return
    fi
    if [ -n "$title" ]; then
        jq -r --arg t "$title" '.[] | select(.title | test($t; "i"))' "$FEATURES_JSON" 2>/dev/null | head -1
        return
    fi
    jq -r '.[0]' "$FEATURES_JSON" 2>/dev/null
}

FEATURE_ID=""
FEATURE_TITLE=""
PROJECTS_FILE=""
LOOP=false
INCLUDE_TICKETS=false

while getopts "i:t:f:lnh" opt; do
    case "$opt" in
        i) FEATURE_ID="$OPTARG" ;;
        t) FEATURE_TITLE="$OPTARG" ;;
        f) PROJECTS_FILE="$OPTARG" ;;
        l) LOOP=true ;;
        n) INCLUDE_TICKETS=true ;;
        h) usage; exit 0 ;;
        *) usage; exit 1 ;;
    esac
done

[ ! -f "$FEATURES_JSON" ] && { echo "Missing $FEATURES_JSON"; exit 1; }
FEATURE_JSON=$(get_feature_json "$FEATURE_ID" "$FEATURE_TITLE")
[ -z "$FEATURE_JSON" ] && { echo "No matching feature found"; exit 1; }

FEATURE_TITLE_NAME=$(echo "$FEATURE_JSON" | jq -r '.title')
PROMPT_IDS_STR=$(echo "$FEATURE_JSON" | jq -r '.prompt_ids | @json')
TICKET_IDS_STR=$(echo "$FEATURE_JSON" | jq -r '.ticket_ids | @json')
# Parse prompt_ids and ticket_ids into arrays
PROMPT_IDS=()
while IFS= read -r line; do
    [ -n "$line" ] && PROMPT_IDS+=("$line")
done < <(echo "$FEATURE_JSON" | jq -r '.prompt_ids[]? // empty')
TICKET_IDS=()
while IFS= read -r line; do
    [ -n "$line" ] && TICKET_IDS+=("$line")
done < <(echo "$FEATURE_JSON" | jq -r '.ticket_ids[]? // empty')

if [ ${#PROMPT_IDS[@]} -eq 0 ]; then
    echo "Feature has no prompt_ids"
    exit 1
fi

# Resolve project list: -f file, else feature's project_paths, else cursor_projects.json
PROJECTS=()
if [ -n "$PROJECTS_FILE" ] && [ -f "$PROJECTS_FILE" ]; then
    while IFS= read -r path; do
        [ -n "$path" ] && PROJECTS+=("$path")
    done < <(read_projects_from_json "$PROJECTS_FILE")
fi
if [ ${#PROJECTS[@]} -eq 0 ]; then
    while IFS= read -r path; do
        [ -n "$path" ] && PROJECTS+=("$path")
    done < <(echo "$FEATURE_JSON" | jq -r '.project_paths[]? // empty')
fi
if [ ${#PROJECTS[@]} -eq 0 ]; then
    while IFS= read -r path; do
        [ -n "$path" ] && PROJECTS+=("$path")
    done < <(read_projects_from_json "$DEFAULT_PROJECTS_JSON")
fi
[ ${#PROJECTS[@]} -eq 0 ] && PROJECTS=("${DEFAULT_PROJECTS[@]}")

TMP_CONTENT=$(mktemp)
trap 'rm -f "$TMP_CONTENT"' EXIT

# Build content: prompts first, then optional ticket block
get_combined_prompt_content "$PROMPTS_JSON" "${PROMPT_IDS[@]}" > "$TMP_CONTENT"
if [ "$INCLUDE_TICKETS" = true ] && [ ${#TICKET_IDS[@]} -gt 0 ] && [ -f "$TICKETS_JSON" ]; then
    echo -e "\n\n---\n\n## Tickets for this feature\n" >> "$TMP_CONTENT"
    get_ticket_descriptions "$TICKETS_JSON" "${TICKET_IDS[@]}" >> "$TMP_CONTENT"
fi
[ ! -s "$TMP_CONTENT" ] && { echo "No prompt content"; exit 1; }

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Run feature: $FEATURE_TITLE_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Prompt IDs: ${PROMPT_IDS[*]}"
echo "Tickets included: $INCLUDE_TICKETS (${#TICKET_IDS[@]} tickets)"
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
    echo "✅ Round $ROUND complete - feature \"$FEATURE_TITLE_NAME\" on all projects"
    [ "$LOOP" != true ] && break
    echo "⏱️  Waiting ${SLEEP_BETWEEN_ROUNDS}s before next round (Ctrl+C to stop)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    sleep "$SLEEP_BETWEEN_ROUNDS"
done
