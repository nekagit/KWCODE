#!/bin/bash
# Optimized version with robust error handling and verification
# Run selected prompts from prompts-export.json in each Cursor project, in a loop.
# For each project: open Cursor, find Composer sidebar input, paste prompt, verify, submit.
# Features: verification loops, retry logic, safety timeouts, better window management.
#
# Usage:
#   ./run_prompts_all_projects_optimized.sh -p 8 7 4
#   ./run_prompts_all_projects_optimized.sh -p 8,7,4
#   ./run_prompts_all_projects_optimized.sh -p 8,7,4 [cursor_projects.json]
#   ./run_prompts_all_projects_optimized.sh -f prompt_ids.txt

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROMPTS_JSON="${SCRIPT_DIR}/prompts-export.json"
DEFAULT_JSON="${SCRIPT_DIR}/cursor_projects.json"
PROMPT_IDS_FILE="${SCRIPT_DIR}/prompt_ids.txt"

# Timing configuration (all can be overridden via environment variables)
SLEEP_AFTER_OPEN_PROJECT="${SLEEP_AFTER_OPEN_PROJECT:-3.0}"
SLEEP_AFTER_FOCUS_WINDOW="${SLEEP_AFTER_FOCUS_WINDOW:-1.0}"
SLEEP_AFTER_PANEL_OPERATION="${SLEEP_AFTER_PANEL_OPERATION:-1.5}"
SLEEP_AFTER_PASTE="${SLEEP_AFTER_PASTE:-0.8}"
SLEEP_AFTER_ENTER="${SLEEP_AFTER_ENTER:-1.5}"
SLEEP_BETWEEN_PROJECTS="${SLEEP_BETWEEN_PROJECTS:-2.5}"
SLEEP_BETWEEN_ROUNDS="${SLEEP_BETWEEN_ROUNDS:-180}"

# Verification and retry configuration
MAX_PANEL_OPEN_RETRIES="${MAX_PANEL_OPEN_RETRIES:-3}"
MAX_PASTE_VERIFICATION_RETRIES="${MAX_PASTE_VERIFICATION_RETRIES:-2}"
VERIFICATION_WAIT="${VERIFICATION_WAIT:-1.0}"
PANEL_STATE_CHECK_WAIT="${PANEL_STATE_CHECK_WAIT:-0.5}"

# Fallback projects
DEFAULT_PROJECTS=(
    "/Users/nenadkalicanin/Documents/February/KW-February-AITrello"
    "/Users/nenadkalicanin/Documents/February/KW-February-Soladia"
    "/Users/nenadkalicanin/Documents/February/KW-February-Saas"
)

# Logging
log_info() { echo "  ℹ $*"; }
log_success() { echo "  ✓ $*"; }
log_warn() { echo "  ⚠ $*" >&2; }
log_error() { echo "  ✗ $*" >&2; }

usage() {
    echo "Usage: $0 -p ID [ID ...] [projects.json]"
    echo "       $0 -p ID1,ID2,ID3 [projects.json]"
    echo "       $0 -f prompt_ids.txt [projects.json]"
    echo ""
    echo "Optimized with verification loops and retry logic."
    echo "Prompts from: $PROMPTS_JSON"
    echo "Projects from: projects.json or cursor_projects.json (array of paths)."
    echo ""
    echo "Options:"
    echo "  -p ID [ID ...]   List of prompt IDs (space- or comma-separated)"
    echo "  -f FILE          Read prompt IDs from file (one ID per line)"
    echo "  -h, --help       Show this help"
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
    if [ ! -f "$prompts_file" ]; then
        log_error "Prompts file not found: $prompts_file"
        return 1
    fi
    if [ ${#ids[@]} -eq 0 ]; then
        log_error "No prompt IDs given."
        return 1
    fi

    if command -v jq &>/dev/null; then
        local first=1
        for id in "${ids[@]}"; do
            [ -z "$id" ] && continue
            local content
            content=$(jq -r --argjson id "$id" '.[] | select(.id == $id) | .content' "$prompts_file" 2>/dev/null)
            if [ -z "$content" ]; then
                log_warn "No prompt with id=$id in $prompts_file"
                continue
            fi
            [ "$first" -eq 0 ] && echo -e "\n\n---\n\n"
            printf '%s' "$content"
            first=0
        done
        return 0
    fi

    # Fallback: Python
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
    else:
        print("Warning: No prompt with id=%s" % i, file=sys.stderr)
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
    else
        log_error "Clipboard only supported on macOS (pbcopy)."
        return 1
    fi
}

read_projects_from_json() {
    local file="$1"
    if [ ! -f "$file" ]; then
        return 1
    fi
    if command -v jq &>/dev/null; then
        jq -r '.[]' "$file" 2>/dev/null | while read -r line; do
            [ -n "$line" ] && echo "$line"
        done
        return $?
    fi
    grep -oE '"/[^"]+"|'"'"'/[^'"'"']+'"'"'' "$file" 2>/dev/null | tr -d '"' | tr -d "'"
}

resolve_path() {
    local p="$1"
    [ -z "$p" ] && return 1
    if [ "${p:0:1}" = "~" ]; then
        p="$HOME${p:1}"
    fi
    local base dir_abs
    base=$(basename "$p")
    dir_abs=$(cd "$(dirname "$p")" 2>/dev/null && pwd) || return 1
    echo "${dir_abs}/${base}"
}

open_cursor_project() {
    local dir="$1"
    local label="${2:-$dir}"
    if [ -d "$dir" ]; then
        dir=$(resolve_path "$dir")
    else
        case "$dir" in
            ~*) dir="$HOME${dir#\~}" ;;
        esac
    fi
    if command -v cursor &>/dev/null; then
        cursor "$dir" &>/dev/null &
    else
        open -a "Cursor" "$dir"
    fi
    log_success "Opened: $label"
    return 0
}

# Focus the Cursor window for a specific project
focus_cursor_window_for_project() {
    local project_path="$1"
    [ -z "$project_path" ] && return 0
    local win_name
    win_name=$(basename "$project_path")
    [ -z "$win_name" ] && return 0
    local win_name_escaped
    win_name_escaped=$(printf '%s' "$win_name" | sed 's/\\/\\\\/g; s/"/\\"/g')
    
    osascript 2>/dev/null <<APPLESCRIPT
tell application "Cursor" to activate
delay 0.3
tell application "System Events"
    tell process "Cursor"
        set winCount to count of windows
        repeat with w from 1 to winCount
            try
                set winName to name of window w
                if winName contains "$win_name_escaped" then
                    set index of window w to 1
                    delay 0.2
                    return "ok"
                end if
            end try
        end repeat
        -- If no specific window found, just activate first window
        if winCount > 0 then
            set index of window 1 to 1
        end if
        return "ok"
    end tell
end tell
APPLESCRIPT
    sleep "$SLEEP_AFTER_FOCUS_WINDOW"
}

# Check if Composer panel is currently visible/open
# Returns: "open", "closed", or "unknown"
check_composer_panel_state() {
    local result
    result=$(osascript 2>/dev/null <<'APPLESCRIPT'
tell application "Cursor" to activate
delay 0.3
tell application "System Events"
    tell process "Cursor"
        try
            set frontWin to front window
            set allEls to entire contents of frontWin
            -- Look for Composer-specific elements
            repeat with el in allEls
                try
                    set r to role of el as text
                    set desc to (description of el) as text
                    set val to (value of el) as text
                    -- Check for Composer input field indicators
                    if (r is "AXTextField" or r is "AXTextArea" or r is "AXComboBox") then
                        if (desc contains "Plan" or desc contains "follow-up" or desc contains "Add a follow" or val contains "Plan" or val contains "follow") then
                            return "open"
                        end if
                    end if
                end try
            end repeat
            -- Check if any text area exists (might be open but in different state)
            set textFieldCount to 0
            repeat with el in allEls
                try
                    set r to role of el as text
                    if (r is "AXTextField" or r is "AXTextArea" or r is "AXComboBox") then
                        set textFieldCount to textFieldCount + 1
                    end if
                end try
            end repeat
            if textFieldCount > 2 then
                return "open"
            end if
            return "closed"
        on error
            return "unknown"
        end try
    end tell
end tell
APPLESCRIPT
)
    echo "$result"
}

# Open Composer panel with Cmd+I and verify it opened
# Returns 0 on success, 1 on failure
open_composer_panel() {
    local retry=0
    while [ $retry -lt "$MAX_PANEL_OPEN_RETRIES" ]; do
        log_info "Opening Composer panel (attempt $((retry + 1))/$MAX_PANEL_OPEN_RETRIES)..."
        
        # Send Cmd+I to toggle/open panel
        osascript 2>/dev/null <<'APPLESCRIPT'
tell application "Cursor" to activate
delay 0.2
tell application "System Events"
    keystroke "i" using command down
end tell
APPLESCRIPT
        
        sleep "$SLEEP_AFTER_PANEL_OPERATION"
        
        # Verify panel opened
        local state
        state=$(check_composer_panel_state)
        
        if [ "$state" = "open" ]; then
            log_success "Composer panel is open"
            return 0
        fi
        
        log_warn "Panel state: $state, retrying..."
        retry=$((retry + 1))
        
        # If it's unknown, wait a bit longer
        if [ "$state" = "unknown" ]; then
            sleep 1.0
        fi
    done
    
    log_error "Failed to open Composer panel after $MAX_PANEL_OPEN_RETRIES attempts"
    return 1
}

# Find and focus the Composer input field
# Returns 0 if focused successfully, 1 otherwise
focus_composer_input() {
    local result
    result=$(osascript 2>/dev/null <<'APPLESCRIPT'
tell application "Cursor" to activate
delay 0.3
tell application "System Events"
    tell process "Cursor"
        try
            set frontWin to front window
            set allEls to entire contents of frontWin
            -- Look for Composer input field
            repeat with el in allEls
                try
                    set r to role of el as text
                    set desc to (description of el) as text
                    set val to (value of el) as text
                    if (r is "AXTextField" or r is "AXTextArea" or r is "AXComboBox") then
                        if (desc contains "Plan" or desc contains "follow-up" or desc contains "Add a follow" or val contains "Plan" or val contains "follow") then
                            set focused of el to true
                            perform action "AXPress" of el
                            delay 0.3
                            return "ok"
                        end if
                    end if
                end try
            end repeat
            -- Fallback: try to focus any text field
            repeat with el in allEls
                try
                    set r to role of el as text
                    if (r is "AXTextField" or r is "AXTextArea" or r is "AXComboBox") then
                        set focused of el to true
                        perform action "AXPress" of el
                        delay 0.3
                        return "ok"
                    end if
                end try
            end repeat
            return "fail"
        on error
            return "fail"
        end try
    end tell
end tell
APPLESCRIPT
)
    [ "$result" = "ok" ]
}

# Verify that text was pasted into the input field
# Returns 0 if text is detected, 1 otherwise
verify_text_in_input() {
    local result
    result=$(osascript 2>/dev/null <<'APPLESCRIPT'
tell application "Cursor" to activate
delay 0.2
tell application "System Events"
    tell process "Cursor"
        try
            set frontWin to front window
            set allEls to entire contents of frontWin
            repeat with el in allEls
                try
                    set r to role of el as text
                    set val to (value of el) as text
                    if (r is "AXTextField" or r is "AXTextArea" or r is "AXComboBox") then
                        if (length of val) > 50 then
                            return "ok"
                        end if
                    end if
                end try
            end repeat
            return "fail"
        on error
            return "fail"
        end try
    end tell
end tell
APPLESCRIPT
)
    [ "$result" = "ok" ]
}

# Complete workflow: ensure panel is open, focus input, paste, verify
# Returns 0 on success, 1 on failure
execute_paste_with_verification() {
    local attempt=0
    
    while [ $attempt -lt "$MAX_PASTE_VERIFICATION_RETRIES" ]; do
        log_info "Paste attempt $((attempt + 1))/$MAX_PASTE_VERIFICATION_RETRIES"
        
        # Step 1: Check panel state
        local state
        state=$(check_composer_panel_state)
        log_info "Panel state: $state"
        
        # Step 2: Open panel if needed
        if [ "$state" != "open" ]; then
            if ! open_composer_panel; then
                log_warn "Could not open panel, retrying..."
                attempt=$((attempt + 1))
                sleep "$VERIFICATION_WAIT"
                continue
            fi
        fi
        
        # Step 3: Focus input
        if ! focus_composer_input; then
            log_warn "Could not focus input field, retrying..."
            attempt=$((attempt + 1))
            sleep "$VERIFICATION_WAIT"
            continue
        fi
        
        log_success "Input field focused"
        sleep "$PANEL_STATE_CHECK_WAIT"
        
        # Step 4: Paste
        osascript 2>/dev/null <<'APPLESCRIPT'
tell application "Cursor" to activate
delay 0.2
tell application "System Events"
    keystroke "v" using command down
end tell
APPLESCRIPT
        
        sleep "$SLEEP_AFTER_PASTE"
        
        # Step 5: Verify paste
        if verify_text_in_input; then
            log_success "Text verified in input field"
            return 0
        fi
        
        log_warn "Text not detected in input field, retrying..."
        attempt=$((attempt + 1))
        sleep "$VERIFICATION_WAIT"
    done
    
    log_error "Failed to paste and verify after $MAX_PASTE_VERIFICATION_RETRIES attempts"
    return 1
}

# Submit the prompt with Enter key
submit_prompt() {
    log_info "Submitting prompt..."
    osascript 2>/dev/null <<'APPLESCRIPT'
tell application "Cursor" to activate
delay 0.2
tell application "System Events"
    key code 36
end tell
APPLESCRIPT
    sleep "$SLEEP_AFTER_ENTER"
    log_success "Prompt submitted"
}

# Main execution for one project
run_agent_prompt_in_project() {
    local project_index="$1"
    local project_path="$2"
    local round="$3"
    
    log_info "Processing project (index: $project_index, round: $round)"
    
    # Focus correct window
    focus_cursor_window_for_project "$project_path"
    
    # Extra wait for first project in case of initialization
    if [ "$project_index" -eq 0 ]; then
        log_info "First project, allowing extra initialization time..."
        sleep 1.5
    fi
    
    # Execute paste with verification
    if ! execute_paste_with_verification; then
        log_error "Could not complete paste operation for project"
        return 1
    fi
    
    # Submit
    submit_prompt
    
    return 0
}

# ============================================================================
# MAIN SCRIPT
# ============================================================================

# Parse arguments
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
        -*)
            echo "Unknown option: $1" >&2
            usage
            exit 1
            ;;
        *)
            JSON_FILE="$1"
            shift
            ;;
    esac
done

# Load prompt IDs from file if specified
if [ -n "$USE_IDS_FILE" ]; then
    PROMPT_IDS=()
    [ -f "$USE_IDS_FILE" ] || { log_error "File not found: $USE_IDS_FILE"; exit 1; }
    while IFS= read -r line; do
        id=$(echo "$line" | tr -d ' \t' | grep -E '^[0-9]+$')
        [ -n "$id" ] && PROMPT_IDS+=("$id")
    done < "$USE_IDS_FILE"
fi

# Validate prompt IDs
if [ ${#PROMPT_IDS[@]} -eq 0 ]; then
    log_error "No prompt IDs. Use -p 8 7 4 or -f prompt_ids.txt"
    usage
    exit 1
fi

# Load projects
JSON_FILE="${JSON_FILE:-$DEFAULT_JSON}"
PROJECTS=()
if [ -f "$JSON_FILE" ]; then
    while IFS= read -r path; do
        [ -n "$path" ] && PROJECTS+=("$path")
    done < <(read_projects_from_json "$JSON_FILE")
fi
if [ ${#PROJECTS[@]} -eq 0 ]; then
    PROJECTS=("${DEFAULT_PROJECTS[@]}")
fi

# Build combined prompt
TMP_PROMPT=$(mktemp)
trap 'rm -f "$TMP_PROMPT"' EXIT
get_combined_prompt_content "$PROMPTS_JSON" "${PROMPT_IDS[@]}" > "$TMP_PROMPT"
if [ ! -s "$TMP_PROMPT" ]; then
    log_error "No content could be built for IDs: ${PROMPT_IDS[*]}"
    exit 1
fi

# Display configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "OPTIMIZED SCRIPT WITH VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Prompt IDs: ${PROMPT_IDS[*]}"
echo "Projects: ${#PROJECTS[@]}"
echo "Max panel open retries: $MAX_PANEL_OPEN_RETRIES"
echo "Max paste verification retries: $MAX_PASTE_VERIFICATION_RETRIES"
echo "Loop interval: ${SLEEP_BETWEEN_ROUNDS}s"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Main loop
ROUND=0
while true; do
    ROUND=$((ROUND + 1))
    echo ""
    echo "========== ROUND $ROUND =========="
    
    # Copy prompt to clipboard once per round
    set_clipboard "$TMP_PROMPT" || exit 1
    log_success "Prompt copied to clipboard"
    
    # Process each project
    for i in "${!PROJECTS[@]}"; do
        n=$((i + 1))
        echo ""
        echo "━━━━ Project $n of ${#PROJECTS[@]}: $(basename "${PROJECTS[$i]}")"
        
        # Open project
        open_cursor_project "${PROJECTS[$i]}" "$(basename "${PROJECTS[$i]}")"
        sleep "$SLEEP_AFTER_OPEN_PROJECT"
        
        # Execute prompt with retries and verification
        if run_agent_prompt_in_project "$i" "${PROJECTS[$i]}" "$ROUND"; then
            log_success "Project completed successfully"
        else
            log_warn "Project had issues but continuing..."
        fi
        
        # Wait between projects (except after last)
        if [ $i -lt $((${#PROJECTS[@]} - 1)) ]; then
            sleep "$SLEEP_BETWEEN_PROJECTS"
        fi
    done
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Round $ROUND completed successfully"
    echo "Waiting ${SLEEP_BETWEEN_ROUNDS} seconds..."
    echo "Press Ctrl+C to stop"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    sleep "$SLEEP_BETWEEN_ROUNDS"
done