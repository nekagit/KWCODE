#!/bin/bash
# Open 4 Cursor windows, each with a project from a JSON file.
# Usage: ./open_cursor_projects.sh [projects.json]
#   If no file given, uses ./cursor_projects.json or built-in defaults.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEFAULT_JSON="$SCRIPT_DIR/cursor_projects.json"
OPEN_AGENT_PANEL=0
SLEEP_AFTER_OPEN="${SLEEP_AFTER_OPEN:-1.5}"
SLEEP_AFTER_PANEL="${SLEEP_AFTER_PANEL:-0.8}"
SLEEP_AFTER_PASTE="${SLEEP_AFTER_PASTE:-0.5}"
SLEEP_AFTER_ENTER="${SLEEP_AFTER_ENTER:-1.2}"
# Cmd+I can toggle the panel (open→close). Use "double" to send Cmd+I twice so
# already-open panels end open (close then open). Set to 0 for fresh windows where panel is closed.
AGENT_PANEL_DOUBLE_I="${AGENT_PANEL_DOUBLE_I:-1}"

# Default projects (used if no JSON or JSON missing entries)
DEFAULT_PROJECTS=(
    "/Users/nenadkalicanin/Documents/February/KW-February-AITrello"
    "/Users/nenadkalicanin/Documents/February/KW-February-Soladia"
    "/Users/nenadkalicanin/Documents/February/KW-February-Saas"
    "/Users/nenadkalicanin/Documents/February/KW-February-AIISO"
)

usage() {
    echo "Usage: $0 [OPTIONS] [projects.json]"
    echo ""
    echo "Opens 4 Cursor windows, each with a project from the JSON file."
    echo ""
    echo "JSON format (array of project paths):"
    echo '  ["/path/to/project1", "/path/to/project2", "/path/to/project3", "/path/to/project4"]'
    echo ""
    echo "Options:"
    echo "  -h, --help       Show this help"
    echo "  -a, --agent      For each project: open it, open Agent panel (Cmd+I), paste clipboard (Cmd+V),"
    echo "                   press Enter to run the prompt, then move to the next project. Copy your prompt first!"
    echo "                   Cmd+I is a toggle; we send it twice by default so already-open panels stay open."
    echo "                   For fresh windows (panel closed) set AGENT_PANEL_DOUBLE_I=0"
    echo ""
    echo "If no file is given, uses: $DEFAULT_JSON"
    echo "If that file is missing, uses built-in default paths."
}

# Parse JSON array of strings (no jq: simple line-based parse; with jq: proper parse)
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
    # Fallback: extract quoted paths (handles "path" or 'path')
    grep -oE '"/[^"]+"|'"'"'/[^'"'"']+'"'"'' "$file" 2>/dev/null | tr -d '"' | tr -d "'"
}

# Resolve path (expand ~, resolve . and ..)
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

# Open one project in Cursor (path can exist or not; Cursor will open or show error)
open_cursor_project() {
    local dir="$1"
    local label="${2:-$dir}"
    # Expand ~ and resolve if directory exists
    if [ -d "$dir" ]; then
        dir=$(resolve_path "$dir")
    else
        case "$dir" in
            ~*) dir="$HOME${dir#\~}" ;;
        esac
    fi
    if command -v cursor &>/dev/null; then
        cursor "$dir"
    else
        open -a "Cursor" "$dir"
    fi
    echo "  ✓ Opened: $label"
    return 0
}

# In the frontmost Cursor window: open Agent panel, paste clipboard, press Enter to run.
# Cmd+I is a toggle in Cursor: if the panel is already open, one press closes it.
# When AGENT_PANEL_DOUBLE_I=1 we send Cmd+I twice so an already-open panel stays open
# (close then open). When 0 we send once (use for fresh windows where panel is closed).
run_agent_prompt_in_front() {
    osascript -e 'tell application "Cursor" to activate' 2>/dev/null
    sleep "$SLEEP_AFTER_OPEN"
    # Open Agent/Composer panel (Cmd+I); optionally twice so we don't leave it closed
    osascript -e 'tell application "System Events" to keystroke "i" using command down' 2>/dev/null
    if [ "${AGENT_PANEL_DOUBLE_I}" = "1" ]; then
        sleep 0.4
        osascript -e 'tell application "System Events" to keystroke "i" using command down' 2>/dev/null
    fi
    sleep "$SLEEP_AFTER_PANEL"
    # Paste from clipboard (Cmd+V)
    osascript -e 'tell application "System Events" to keystroke "v" using command down' 2>/dev/null
    sleep "$SLEEP_AFTER_PASTE"
    # Execute prompt (Enter)
    osascript -e 'tell application "System Events" to key code 36' 2>/dev/null
    sleep "$SLEEP_AFTER_ENTER"
}

# --- main ---
while [ $# -gt 0 ]; do
    case "$1" in
        -h|--help) usage; exit 0 ;;
        -a|--agent) OPEN_AGENT_PANEL=1; shift ;;
        -*) echo "Unknown option: $1"; usage; exit 1 ;;
        *) break ;;
    esac
done

JSON_FILE="${1:-$DEFAULT_JSON}"
PROJECTS=()

if [ -f "$JSON_FILE" ]; then
    echo "Reading projects from: $JSON_FILE"
    while IFS= read -r path; do
        [ -n "$path" ] && PROJECTS+=("$path")
    done < <(read_projects_from_json "$JSON_FILE")
fi

if [ ${#PROJECTS[@]} -eq 0 ]; then
    echo "Using built-in default projects (no JSON or empty)."
    PROJECTS=("${DEFAULT_PROJECTS[@]}")
fi

echo "Opening ${#PROJECTS[@]} Cursor window(s)..."
if [ "$OPEN_AGENT_PANEL" -eq 1 ]; then
    echo "Agent mode: for each project → open Agent panel, paste clipboard, Enter to run, then next."
    echo "Make sure your prompt is in the clipboard!"
    echo ""
fi

for i in "${!PROJECTS[@]}"; do
    n=$((i + 1))
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Project $n of ${#PROJECTS[@]}: $(basename "${PROJECTS[$i]}")"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    open_cursor_project "${PROJECTS[$i]}" "$(basename "${PROJECTS[$i]}")"
    if [ "$OPEN_AGENT_PANEL" -eq 1 ]; then
        echo "  → Opening Agent panel (Cmd+I), pasting clipboard (Cmd+V), Enter to run..."
        run_agent_prompt_in_front
        echo "  ✓ Prompt sent. Moving to next project."
    fi
    # Delay before opening next project (only between projects)
    [ $i -lt $((${#PROJECTS[@]} - 1)) ] && sleep 1.0
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Done. Opened ${#PROJECTS[@]} Cursor project(s)."
[ "$OPEN_AGENT_PANEL" -eq 1 ] && echo "Agent prompt was pasted and executed in each window."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
