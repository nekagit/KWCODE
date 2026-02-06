#!/bin/bash
# Common Cursor automation: timing, logging, focus, paste & submit.
# Source this from run_*.sh scripts:  source "$(dirname "$0")/common_cursor_run.sh"

set -e

_COMMON_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "${_COMMON_DIR}/.." && pwd)"
DATA_DIR="${WORKSPACE_ROOT}/data"
PROMPTS_JSON="${DATA_DIR}/prompts-export.json"
FEATURES_JSON="${DATA_DIR}/features.json"
TICKETS_JSON="${DATA_DIR}/tickets.json"
DEFAULT_PROJECTS_JSON="${DATA_DIR}/cursor_projects.json"

DEFAULT_PROJECTS=(
    "/Users/nenadkalicanin/Documents/February/KW-February-AITrello"
    "/Users/nenadkalicanin/Documents/February/KW-February-Soladia"
    "/Users/nenadkalicanin/Documents/February/KW-February-Saas"
)

# Timing (override with env vars)
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

log_info() { echo "  ℹ️  $*"; }
log_success() { echo "  ✅ $*"; }
log_warn() { echo "  ⚠️  $*" >&2; }

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

focus_left_panel_with_shift_tab() {
    log_info "Navigating to left panel (Shift+Tab x3)..."
    osascript <<'APPLESCRIPT'
tell application "Cursor" to activate
delay 0.5
APPLESCRIPT
    log_info "  → Shift+Tab #1"
    osascript <<'APPLESCRIPT'
tell application "System Events"
    key code 48 using shift down
end tell
APPLESCRIPT
    sleep "$SLEEP_BETWEEN_SHIFT_TABS"
    log_info "  → Shift+Tab #2"
    osascript <<'APPLESCRIPT'
tell application "System Events"
    key code 48 using shift down
end tell
APPLESCRIPT
    sleep "$SLEEP_BETWEEN_SHIFT_TABS"
    log_info "  → Shift+Tab #3"
    osascript <<'APPLESCRIPT'
tell application "System Events"
    key code 48 using shift down
end tell
APPLESCRIPT
    sleep "$SLEEP_AFTER_ALL_SHIFT_TABS"
    log_success "Left panel should be focused"
}

create_new_agent() {
    log_info "Creating new agent (Cmd+N)..."
    osascript <<'APPLESCRIPT'
tell application "Cursor" to activate
delay 0.4
APPLESCRIPT
    osascript <<'APPLESCRIPT'
tell application "System Events"
    keystroke "n" using command down
end tell
APPLESCRIPT
    sleep "$SLEEP_AFTER_CMD_N"
    log_success "New agent created"
}

paste_and_submit() {
    sleep "$SLEEP_BEFORE_PASTE"
    log_info "Pasting prompt (Cmd+V)..."
    osascript <<'APPLESCRIPT'
tell application "Cursor" to activate
delay 0.3
APPLESCRIPT
    osascript <<'APPLESCRIPT'
tell application "System Events"
    keystroke "v" using command down
end tell
APPLESCRIPT
    sleep "$SLEEP_AFTER_PASTE"
    log_success "Pasted"
    log_info "Submitting (Enter)..."
    osascript <<'APPLESCRIPT'
tell application "Cursor" to activate
delay 0.3
APPLESCRIPT
    osascript <<'APPLESCRIPT'
tell application "System Events"
    key code 36
end tell
APPLESCRIPT
    sleep "$SLEEP_AFTER_ENTER"
    log_success "Submitted"
}

# Run one project: focus window, left panel, new agent, paste & submit.
# Caller must set clipboard before calling. round can be 1 if single shot.
run_project() {
    local idx="$1"
    local path="$2"
    local round="${3:-1}"
    echo ""
    log_info "═══════════════════════════════════════"
    log_info "Project $(($idx + 1))/${#PROJECTS[@]}, Round $round"
    log_info "Path: $path"
    log_info "═══════════════════════════════════════"
    focus_cursor_window "$path"
    if [ "$idx" -eq 0 ] && [ "$round" -eq 1 ]; then
        log_info "First project - extra wait time..."
        sleep 2.0
    fi
    focus_left_panel_with_shift_tab
    create_new_agent
    paste_and_submit
    log_success "✓ Project completed!"
}
