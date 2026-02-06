#!/bin/bash
# Run prompts on a single project (by path or by index into cursor_projects.json).
# Same as run_prompts_all_projects.sh but one project only. One round unless -l.

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/common_cursor_run.sh"

usage() {
    echo "Usage: $0 -p ID [ID ...] [-P /path/to/project | -I index] [projects.json]"
    echo "  -p ID [ID ...]  Prompt IDs from prompts-export.json (required)"
    echo "  -P /path         Use this project path"
    echo "  -I index         Use project at 0-based index from cursor_projects.json (or next arg file)"
    echo "  projects.json    Optional: project list file (used with -I or when no -P)"
    echo "  -l               Loop: repeat with SLEEP_BETWEEN_ROUNDS"
    echo ""
    echo "Example: $0 -p 8 -P /Users/me/MyProject"
    echo "Example: $0 -p 7 8 -I 0    # First project from cursor_projects.json, prompts 7 and 8"
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

parse_prompt_ids() {
    local ids=()
    if [ -n "$1" ]; then
        IFS=', ' read -ra ids <<< "$1"
    fi
    printf '%s\n' "${ids[@]}"
}

PROMPT_IDS=()
PROJECT_PATH=""
PROJECT_INDEX=""
JSON_FILE=""
LOOP=false

while [ $# -gt 0 ]; do
    case "$1" in
        -h|--help) usage; exit 0 ;;
        -p)
            shift
            while [ $# -gt 0 ] && [[ "$1" =~ ^[0-9,]+$ ]]; do
                while IFS= read -r id; do
                    [ -n "$id" ] && PROMPT_IDS+=("$id")
                done < <(parse_prompt_ids "$1")
                shift
            done
            ;;
        -P) shift; [ $# -gt 0 ] && PROJECT_PATH="$1" && shift ;;
        -I) shift; [ $# -gt 0 ] && PROJECT_INDEX="$1" && shift ;;
        -l) LOOP=true; shift ;;
        *)
            [ -z "$JSON_FILE" ] && JSON_FILE="$1"
            shift
            ;;
    esac
done

if [ ${#PROMPT_IDS[@]} -eq 0 ]; then
    echo "No prompt IDs specified (-p ID [ID ...])"
    usage
    exit 1
fi

# Resolve single project
PROJECTS=()
if [ -n "$PROJECT_PATH" ]; then
    [ -d "$PROJECT_PATH" ] || { echo "Not a directory: $PROJECT_PATH"; exit 1; }
    PROJECTS=("$PROJECT_PATH")
else
    JSON_FILE="${JSON_FILE:-$DEFAULT_PROJECTS_JSON}"
    if [ -f "$JSON_FILE" ]; then
        while IFS= read -r path; do
            [ -n "$path" ] && PROJECTS+=("$path")
        done < <(read_projects_from_json "$JSON_FILE")
    fi
    [ ${#PROJECTS[@]} -eq 0 ] && PROJECTS=("${DEFAULT_PROJECTS[@]}")
    if [ -n "$PROJECT_INDEX" ] && [ "$PROJECT_INDEX" -ge 0 ] && [ "$PROJECT_INDEX" -lt ${#PROJECTS[@]} ]; then
        PROJECTS=("${PROJECTS[$PROJECT_INDEX]}")
    else
        # Single project mode: use first
        PROJECTS=("${PROJECTS[0]}")
    fi
fi
[ ${#PROJECTS[@]} -eq 0 ] && { echo "No project path"; exit 1; }

TMP_PROMPT=$(mktemp)
trap 'rm -f "$TMP_PROMPT"' EXIT
get_combined_prompt_content "$PROMPTS_JSON" "${PROMPT_IDS[@]}" > "$TMP_PROMPT"
[ ! -s "$TMP_PROMPT" ] && { echo "No prompt content"; exit 1; }

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📂 Single project – prompts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Prompt IDs: ${PROMPT_IDS[*]}"
echo "Project: ${PROJECTS[0]}"
echo "Loop: $LOOP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ROUND=0
while true; do
    ROUND=$((ROUND + 1))
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║         ROUND $ROUND                        ║"
    echo "╚════════════════════════════════════════╝"
    set_clipboard "$TMP_PROMPT"
    log_success "Clipboard set"
    open_cursor_project "${PROJECTS[0]}"
    sleep "$SLEEP_AFTER_OPEN_PROJECT"
    run_project 0 "${PROJECTS[0]}" "$ROUND"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Round $ROUND complete"
    [ "$LOOP" != true ] && break
    echo "⏱️  Waiting ${SLEEP_BETWEEN_ROUNDS}s (Ctrl+C to stop)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    sleep "$SLEEP_BETWEEN_ROUNDS"
done
