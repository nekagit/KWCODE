#!/bin/bash
# RELIABLE VERSION - Longer delays for consistency
# Uses Shift+Tab 3x with proper timing

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKSPACE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DATA_DIR="${WORKSPACE_ROOT}/data"
PROMPTS_JSON="${DATA_DIR}/prompts-export.json"
DEFAULT_JSON="${DATA_DIR}/cursor_projects.json"

# Timing - INCREASED for reliability
SLEEP_AFTER_OPEN_PROJECT="${SLEEP_AFTER_OPEN_PROJECT:-4.0}"
SLEEP_AFTER_WINDOW_FOCUS="${SLEEP_AFTER_WINDOW_FOCUS:-1.5}"
SLEEP_BETWEEN_SHIFT_TABS="${SLEEP_BETWEEN_SHIFT_TABS:-0.5}"
SLEEP_AFTER_ALL_SHIFT_TABS="${SLEEP_AFTER_ALL_SHIFT_TABS:-0.8}"
SLEEP_AFTER_CMD_N="${SLEEP_AFTER_CMD_N:-2.0}"
SLEEP_BEFORE_PASTE="${SLEEP_BEFORE_PASTE:-0.8}"
SLEEP_AFTER_PASTE="${SLEEP_AFTER_PASTE:-1.0}"
SLEEP_AFTER_ENTER="${SLEEP_AFTER_ENTER:-2.0}"
SLEEP_BETWEEN_PROJECTS="${SLEEP_BETWEEN_PROJECTS:-3.0}"
SLEEP_BETWEEN_ROUNDS="${SLEEP_BETWEEN_ROUNDS:-270}"

DEFAULT_PROJECTS=(
    "/Users/nenadkalicanin/Documents/February/KW-February-AITrello"
    "/Users/nenadkalicanin/Documents/February/KW-February-Soladia"
    "/Users/nenadkalicanin/Documents/February/KW-February-Saas"
)

log_info() { echo "  ℹ️  $*"; }
log_success() { echo "  ✅ $*"; }
log_warn() { echo "  ⚠️  $*" >&2; }

usage() {
    echo "Usage: $0 -p ID [ID ...] [projects.json]"
    echo ""
    echo "RELIABLE VERSION - Longer delays for consistency"
}

parse_prompt_ids() {
    local ids=()
    if [ -n "$1" ]; then
        IFS=', ' read -ra ids <<< "$1"
    fi
    printf '%s\n' "${ids[@]}"
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

set_clipboard() {
    if [[ "$(uname)" == Darwin ]]; then
        if [ -n "$1" ] && [ -f "$1" ]; then
            pbcopy < "$1"
        else
            pbcopy
        fi
    fi
}

read_projects_from_json() {
    local file="$1"
    [ ! -f "$file" ] && return 1
    if command -v jq &>/dev/null; then
        jq -r '.[]' "$file" 2>/dev/null | while read -r line; do
            [ -n "$line" ] && echo "$line"
        done
        return $?
    fi
    grep -oE '"/[^"]+"|'"'"'/[^'"'"']+'"'"'' "$file" 2>/dev/null | tr -d '"' | tr -d "'"
}

open_cursor_project() {
    local dir="$1"
    if command -v cursor &>/dev/null; then
        cursor "$dir" &>/dev/null &
    else
        open -a "Cursor" "$dir"
    fi
    log_success "Opened: $(basename "$dir")"
}

focus_cursor_window() {
    local project_path="$1"
    local win_name=$(basename "$project_path")
    
    log_info "Focusing Cursor window..."
    
    osascript <<APPLESCRIPT
tell application "Cursor" to activate
delay 0.6
tell application "System Events"
    tell process "Cursor"
        try
            set winCount to count of windows
            repeat with w from 1 to winCount
                try
                    if name of window w contains "$win_name" then
                        set index of window w to 1
                        delay 0.5
                        return
                    end if
                end try
            end repeat
            if winCount > 0 then
                set index of window 1 to 1
                delay 0.5
            end if
        end try
    end tell
end tell
APPLESCRIPT
    
    sleep "$SLEEP_AFTER_WINDOW_FOCUS"
    log_success "Window focused"
}

# Focus left panel using Shift+Tab 3 times with delays between each
# Note: Cursor (and Terminal) need "Accessibility" permission in System Settings
# for System Events to send key events. If it hangs here, grant that permission.
focus_left_panel_with_shift_tab() {
    log_info "Navigating to left panel (Shift+Tab x3)..."
    
    # Make sure Cursor is active first (stderr shown so permission errors are visible)
    osascript <<'APPLESCRIPT'
tell application "Cursor" to activate
delay 0.5
APPLESCRIPT
    
    # First Shift+Tab
    log_info "  → Shift+Tab #1"
    osascript <<'APPLESCRIPT'
tell application "System Events"
    key code 48 using shift down
end tell
APPLESCRIPT
    sleep "$SLEEP_BETWEEN_SHIFT_TABS"
    
    # Second Shift+Tab
    log_info "  → Shift+Tab #2"
    osascript <<'APPLESCRIPT'
tell application "System Events"
    key code 48 using shift down
end tell
APPLESCRIPT
    sleep "$SLEEP_BETWEEN_SHIFT_TABS"
    
    # Third Shift+Tab
    log_info "  → Shift+Tab #3"
    osascript <<'APPLESCRIPT'
tell application "System Events"
    key code 48 using shift down
end tell
APPLESCRIPT
    
    sleep "$SLEEP_AFTER_ALL_SHIFT_TABS"
    log_success "Left panel should be focused"
}

# Create new agent with Cmd+N
create_new_agent() {
    log_info "Creating new agent (Cmd+N)..."
    
    # Make sure Cursor is active
    osascript <<'APPLESCRIPT'
tell application "Cursor" to activate
delay 0.4
APPLESCRIPT
    
    # Send Cmd+N
    osascript <<'APPLESCRIPT'
tell application "System Events"
    keystroke "n" using command down
end tell
APPLESCRIPT
    
    sleep "$SLEEP_AFTER_CMD_N"
    log_success "New agent created"
}

# Paste prompt and submit
paste_and_submit() {
    sleep "$SLEEP_BEFORE_PASTE"
    
    log_info "Pasting prompt (Cmd+V)..."
    
    # Make sure Cursor is active
    osascript <<'APPLESCRIPT'
tell application "Cursor" to activate
delay 0.3
APPLESCRIPT
    
    # Paste
    osascript <<'APPLESCRIPT'
tell application "System Events"
    keystroke "v" using command down
end tell
APPLESCRIPT
    
    sleep "$SLEEP_AFTER_PASTE"
    log_success "Pasted"
    
    log_info "Submitting (Enter)..."
    
    # Make sure Cursor is active
    osascript <<'APPLESCRIPT'
tell application "Cursor" to activate
delay 0.3
APPLESCRIPT
    
    # Submit
    osascript <<'APPLESCRIPT'
tell application "System Events"
    key code 36
end tell
APPLESCRIPT
    
    sleep "$SLEEP_AFTER_ENTER"
    log_success "Submitted"
}

run_project() {
    local idx="$1"
    local path="$2"
    local round="$3"
    
    echo ""
    log_info "═══════════════════════════════════════"
    log_info "Project $(($idx + 1))/${#PROJECTS[@]}, Round $round"
    log_info "Path: $path"
    log_info "═══════════════════════════════════════"
    
    focus_cursor_window "$path"
    
    # First project in first round gets extra time
    if [ "$idx" -eq 0 ] && [ "$round" -eq 1 ]; then
        log_info "First project - extra wait time..."
        sleep 2.0
    fi
    
    # Focus left panel with Shift+Tab x3
    focus_left_panel_with_shift_tab
    
    # Create new agent
    create_new_agent
    
    # Paste and submit
    paste_and_submit
    
    log_success "✓ Project completed!"
}

# ============================================================================
# MAIN
# ============================================================================

PROMPT_IDS=()
JSON_FILE=""
USE_IDS_FILE=""

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
        -f)
            shift
            [ $# -gt 0 ] && USE_IDS_FILE="$1" && shift
            ;;
        *)
            JSON_FILE="$1"
            shift
            ;;
    esac
done

if [ -n "$USE_IDS_FILE" ]; then
    PROMPT_IDS=()
    [ -f "$USE_IDS_FILE" ] || { echo "File not found: $USE_IDS_FILE"; exit 1; }
    while IFS= read -r line; do
        id=$(echo "$line" | tr -d ' \t' | grep -E '^[0-9]+$')
        [ -n "$id" ] && PROMPT_IDS+=("$id")
    done < "$USE_IDS_FILE"
fi

if [ ${#PROMPT_IDS[@]} -eq 0 ]; then
    echo "No prompt IDs specified"
    usage
    exit 1
fi

JSON_FILE="${JSON_FILE:-$DEFAULT_JSON}"
PROJECTS=()
if [ -f "$JSON_FILE" ]; then
    while IFS= read -r path; do
        [ -n "$path" ] && PROJECTS+=("$path")
    done < <(read_projects_from_json "$JSON_FILE")
fi
[ ${#PROJECTS[@]} -eq 0 ] && PROJECTS=("${DEFAULT_PROJECTS[@]}")

TMP_PROMPT=$(mktemp)
trap 'rm -f "$TMP_PROMPT"' EXIT
get_combined_prompt_content "$PROMPTS_JSON" "${PROMPT_IDS[@]}" > "$TMP_PROMPT"
[ ! -s "$TMP_PROMPT" ] && { echo "No prompt content"; exit 1; }

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐢 RELIABLE VERSION - SLOW & STEADY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Longer delays between operations for consistency"
echo "Navigation: Shift+Tab x3 → Cmd+N → Paste → Enter"
echo ""
echo "Prompt IDs: ${PROMPT_IDS[*]}"
echo "Projects: ${#PROJECTS[@]}"
echo ""
echo "Timing settings (seconds):"
echo "  - After open project:     $SLEEP_AFTER_OPEN_PROJECT"
echo "  - After window focus:     $SLEEP_AFTER_WINDOW_FOCUS"
echo "  - Between Shift+Tabs:     $SLEEP_BETWEEN_SHIFT_TABS"
echo "  - After all Shift+Tabs:   $SLEEP_AFTER_ALL_SHIFT_TABS"
echo "  - After Cmd+N:            $SLEEP_AFTER_CMD_N"
echo "  - After paste:            $SLEEP_AFTER_PASTE"
echo "  - After submit:           $SLEEP_AFTER_ENTER"
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
    
    for i in "${!PROJECTS[@]}"; do
        open_cursor_project "${PROJECTS[$i]}"
        sleep "$SLEEP_AFTER_OPEN_PROJECT"
        
        run_project "$i" "${PROJECTS[$i]}" "$ROUND"
        
        if [ $i -lt $((${#PROJECTS[@]} - 1)) ]; then
            echo ""
            log_info "Waiting ${SLEEP_BETWEEN_PROJECTS}s before next project..."
            sleep "$SLEEP_BETWEEN_PROJECTS"
        fi
    done
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Round $ROUND complete - all projects processed"
    echo "⏱️  Waiting ${SLEEP_BETWEEN_ROUNDS}s before next round"
    echo "   (Press Ctrl+C to stop)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    sleep "$SLEEP_BETWEEN_ROUNDS"
done