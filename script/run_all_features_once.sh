#!/bin/bash
# Run each feature once: for every feature in features.json, build prompt+tickets and run on that feature's projects.
# One pass through all features (no loop). Uses same Cursor automation.

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/common_cursor_run.sh"

usage() {
    echo "Usage: $0 [-f projects.json] [-n]"
    echo "  -f projects.json  Use this project list for features that have no project_paths"
    echo "  -n                 Include ticket descriptions in pasted content for each feature"
    echo ""
    echo "Iterates over data/features.json and runs each feature on its project_paths (or -f / default)."
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
            if [ -z "$content" ]; then continue; fi
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
    fi
}

DEFAULT_PROJECTS_FILE=""
INCLUDE_TICKETS=false
while getopts "f:nh" opt; do
    case "$opt" in
        f) DEFAULT_PROJECTS_FILE="$OPTARG" ;;
        n) INCLUDE_TICKETS=true ;;
        h) usage; exit 0 ;;
        *) usage; exit 1 ;;
    esac
done

[ ! -f "$FEATURES_JSON" ] && { echo "Missing $FEATURES_JSON"; exit 1; }
FEATURE_COUNT=$(jq 'length' "$FEATURES_JSON" 2>/dev/null || echo 0)
[ "$FEATURE_COUNT" -eq 0 ] && { echo "No features in $FEATURES_JSON"; exit 0; }

# Default project list for features with no project_paths
FALLBACK_PROJECTS=()
if [ -n "$DEFAULT_PROJECTS_FILE" ] && [ -f "$DEFAULT_PROJECTS_FILE" ]; then
    while IFS= read -r path; do
        [ -n "$path" ] && FALLBACK_PROJECTS+=("$path")
    done < <(read_projects_from_json "$DEFAULT_PROJECTS_FILE")
fi
[ ${#FALLBACK_PROJECTS[@]} -eq 0 ] && while IFS= read -r path; do
    [ -n "$path" ] && FALLBACK_PROJECTS+=("$path")
done < <(read_projects_from_json "$DEFAULT_PROJECTS_JSON")
[ ${#FALLBACK_PROJECTS[@]} -eq 0 ] && FALLBACK_PROJECTS=("${DEFAULT_PROJECTS[@]}")

TMP_CONTENT=$(mktemp)
trap 'rm -f "$TMP_CONTENT"' EXIT

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Run all features once (${FEATURE_COUNT} features)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

idx=0
while [ "$idx" -lt "$FEATURE_COUNT" ]; do
    FEATURE_JSON=$(jq -c ".[$idx]" "$FEATURES_JSON" 2>/dev/null)
    [ -z "$FEATURE_JSON" ] || [ "$FEATURE_JSON" = "null" ] && { idx=$((idx + 1)); continue; }
    title=$(echo "$FEATURE_JSON" | jq -r '.title')
    prompt_ids=()
    while IFS= read -r id; do
        [ -n "$id" ] && prompt_ids+=("$id")
    done < <(echo "$FEATURE_JSON" | jq -r '.prompt_ids[]? // empty')
    ticket_ids=()
    while IFS= read -r id; do
        [ -n "$id" ] && ticket_ids+=("$id")
    done < <(echo "$FEATURE_JSON" | jq -r '.ticket_ids[]? // empty')
    project_paths=()
    while IFS= read -r path; do
        [ -n "$path" ] && project_paths+=("$path")
    done < <(echo "$FEATURE_JSON" | jq -r '.project_paths[]? // empty')

    if [ ${#prompt_ids[@]} -eq 0 ]; then
        log_warn "Feature '$title' has no prompt_ids, skipping"
        continue
    fi
    PROJECTS=("${project_paths[@]}")
    [ ${#PROJECTS[@]} -eq 0 ] && PROJECTS=("${FALLBACK_PROJECTS[@]}")

    get_combined_prompt_content "$PROMPTS_JSON" "${prompt_ids[@]}" > "$TMP_CONTENT"
    if [ "$INCLUDE_TICKETS" = true ] && [ ${#ticket_ids[@]} -gt 0 ] && [ -f "$TICKETS_JSON" ]; then
        echo -e "\n\n---\n\n## Tickets for this feature\n" >> "$TMP_CONTENT"
        get_ticket_descriptions "$TICKETS_JSON" "${ticket_ids[@]}" >> "$TMP_CONTENT"
    fi
    [ ! -s "$TMP_CONTENT" ] && continue

    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║  Feature $idx/$FEATURE_COUNT: $(echo "$title" | cut -c1-28)"
    echo "╚════════════════════════════════════════╝"
    set_clipboard "$TMP_CONTENT"
    log_success "Clipboard set for: $title"
    for i in "${!PROJECTS[@]}"; do
        open_cursor_project "${PROJECTS[$i]}"
        sleep "$SLEEP_AFTER_OPEN_PROJECT"
        run_project "$i" "${PROJECTS[$i]}" 1
        if [ $i -lt $((${#PROJECTS[@]} - 1)) ]; then
            log_info "Waiting ${SLEEP_BETWEEN_PROJECTS}s before next project..."
            sleep "$SLEEP_BETWEEN_PROJECTS"
        fi
    done
    echo "✅ Feature '$title' done"
    idx=$((idx + 1))
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All features run once"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
