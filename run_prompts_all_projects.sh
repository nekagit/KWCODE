#!/bin/bash
# Run selected prompts from prompts-export.json in each Cursor project, in a loop.
# For each project: open Cursor, open Composer (Cmd+I), paste prompt content, Enter.
# Then wait 180 seconds and repeat until you stop the process (Ctrl+C).
#
# Usage:
#   ./run_prompts_all_projects.sh -p 8 7 4
#   ./run_prompts_all_projects.sh -p 8,7,4
#   ./run_prompts_all_projects.sh -p 8,7,4 [cursor_projects.json]
#   ./run_prompts_all_projects.sh -f prompt_ids.txt
#
# Prompt IDs: from prompts-export.json (e.g. 8=Major Feature, 7=Cursorrules, 4=Implement further)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROMPTS_JSON="${SCRIPT_DIR}/prompts-export.json"
DEFAULT_JSON="${SCRIPT_DIR}/cursor_projects.json"
PROMPT_IDS_FILE="${SCRIPT_DIR}/prompt_ids.txt"

SLEEP_AFTER_OPEN_PROJECT="${SLEEP_AFTER_OPEN_PROJECT:-2.5}"
SLEEP_AFTER_OPEN="${SLEEP_AFTER_OPEN:-1.5}"
SLEEP_BETWEEN_TOGGLE="${SLEEP_BETWEEN_TOGGLE:-2.0}"
SLEEP_AFTER_PANEL="${SLEEP_AFTER_PANEL:-1.2}"
SLEEP_AFTER_PASTE="${SLEEP_AFTER_PASTE:-0.5}"
SLEEP_AFTER_ENTER="${SLEEP_AFTER_ENTER:-1.2}"
SLEEP_BETWEEN_PROJECTS="${SLEEP_BETWEEN_PROJECTS:-2.0}"
SLEEP_BETWEEN_ROUNDS="${SLEEP_BETWEEN_ROUNDS:-180}"
# We always send Cmd+I twice so Composer ends open (close-then-open when it was open). Unused; kept for env compatibility.
AGENT_PANEL_DOUBLE_I="${AGENT_PANEL_DOUBLE_I:-1}"

# Fallback only when cursor_projects.json is missing or empty; count = length of JSON array.
DEFAULT_PROJECTS=(
    "/Users/nenadkalicanin/Documents/February/KW-February-AITrello"
    "/Users/nenadkalicanin/Documents/February/KW-February-Soladia"
    "/Users/nenadkalicanin/Documents/February/KW-February-Saas"
)

usage() {
    echo "Usage: $0 -p ID [ID ...] [projects.json]"
    echo "       $0 -p ID1,ID2,ID3 [projects.json]"
    echo "       $0 -f prompt_ids.txt [projects.json]"
    echo ""
    echo "Prompts are loaded from: $PROMPTS_JSON"
    echo "Projects from: projects.json or cursor_projects.json (array of paths)."
    echo ""
    echo "Options:"
    echo "  -p ID [ID ...]   List of prompt IDs (space- or comma-separated)"
    echo "  -f FILE          Read prompt IDs from file (one ID per line)"
    echo "  -h, --help       Show this help"
    echo ""
    echo "Loop: for each project → open Cursor → open Composer → paste prompt → Enter; then wait ${SLEEP_BETWEEN_ROUNDS}s and repeat. Stop with Ctrl+C."
}

# Parse prompt IDs from args: -p 8 7 4 or -p 8,7,4
parse_prompt_ids() {
    local ids=()
    if [ -n "$1" ]; then
        # Allow comma-separated or space-separated
        IFS=', ' read -ra ids <<< "$1"
    fi
    printf '%s\n' "${ids[@]}"
}

# Get prompt content by ID from prompts-export.json (order preserved)
# Output: combined content of all prompts (IDs in order), to stdout
get_combined_prompt_content() {
    local prompts_file="$1"
    shift
    local ids=("$@")
    if [ ! -f "$prompts_file" ]; then
        echo "Error: Prompts file not found: $prompts_file" >&2
        return 1
    fi
    if [ ${#ids[@]} -eq 0 ]; then
        echo "Error: No prompt IDs given." >&2
        return 1
    fi

    if command -v jq &>/dev/null; then
        local first=1
        for id in "${ids[@]}"; do
            [ -z "$id" ] && continue
            local content
            content=$(jq -r --argjson id "$id" '.[] | select(.id == $id) | .content' "$prompts_file" 2>/dev/null)
            if [ -z "$content" ]; then
                echo "Warning: No prompt with id=$id in $prompts_file" >&2
                continue
            fi
            [ "$first" -eq 0 ] && echo -e "\n\n---\n\n"
            printf '%s' "$content"
            first=0
        done
        return 0
    fi

    # Fallback: Python (macOS has Python)
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

# Copy combined prompt to clipboard (macOS). Reads from stdin or from file path $1.
set_clipboard() {
    if [[ "$(uname)" == Darwin ]]; then
        if [ -n "$1" ] && [ -f "$1" ]; then
            pbcopy < "$1"
        else
            pbcopy
        fi
    else
        echo "Error: Clipboard only supported on macOS (pbcopy). Install xclip/xsel for Linux." >&2
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
        cursor "$dir"
    else
        open -a "Cursor" "$dir"
    fi
    echo "  ✓ Opened: $label"
    return 0
}

# Bring the Cursor window whose title contains the project folder name to front.
# After many rounds, the correct window may not be frontmost; this ensures we send Cmd+I to the right window.
focus_cursor_window_for_project() {
    local project_path="$1"
    [ -z "$project_path" ] && return 0
    local win_name
    win_name=$(basename "$project_path")
    [ -z "$win_name" ] && return 0
    # Escape for AppleScript string: backslash and double-quote
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
                    return
                end if
            end try
        end repeat
    end tell
end tell
APPLESCRIPT
}

run_agent_prompt_in_front() {
    # $1 = project index (0-based), $2 = project path (for window focus), $3 = round number (for later-round delays).
    local project_index="${1:-0}"
    local project_path="${2:-}"
    local round_num="${3:-1}"
    local toggle_delay="$SLEEP_BETWEEN_TOGGLE"
    # Per-project delays for first rounds; from round 7 onward use longer delay so Composer reliably reopens.
    if [ "$round_num" -ge 7 ] 2>/dev/null; then
        toggle_delay="5.0"
    else
        case "$project_index" in
            0) toggle_delay="3.5" ;;
            1) toggle_delay="2.5" ;;
            2) toggle_delay="3.0" ;;
        esac
    fi
    # Ensure the correct Cursor window is frontmost (critical after round 7 when many windows exist).
    focus_cursor_window_for_project "$project_path"
    sleep "$SLEEP_AFTER_OPEN"
    # Activate once, then both Cmd+I in same window (close-then-open Composer).
    osascript <<APPLESCRIPT 2>/dev/null
tell application "Cursor" to activate
delay 0.2
tell application "System Events" to keystroke "i" using command down
delay $toggle_delay
tell application "System Events" to keystroke "i" using command down
delay $SLEEP_AFTER_PANEL
APPLESCRIPT
    # Paste into Composer input (Cmd+V) then submit (Enter)
    osascript -e 'tell application "Cursor" to activate' 2>/dev/null
    sleep 0.2
    osascript -e 'tell application "System Events" to keystroke "v" using command down' 2>/dev/null
    sleep "$SLEEP_AFTER_PASTE"
    osascript -e 'tell application "System Events" to key code 36' 2>/dev/null
    sleep "$SLEEP_AFTER_ENTER"
}

# --- Parse args ---
PROMPT_IDS=()
JSON_FILE=""
USE_IDS_FILE=""

while [ $# -gt 0 ]; do
    case "$1" in
        -h|--help) usage; exit 0 ;;
        -p)
            shift
            # Consume all following args that look like IDs (numbers or comma-separated)
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

# Prompt IDs from file if -f was used
if [ -n "$USE_IDS_FILE" ]; then
    PROMPT_IDS=()
    [ -f "$USE_IDS_FILE" ] || { echo "Error: File not found: $USE_IDS_FILE" >&2; exit 1; }
    while IFS= read -r line; do
        id=$(echo "$line" | tr -d ' \t' | grep -E '^[0-9]+$')
        [ -n "$id" ] && PROMPT_IDS+=("$id")
    done < "$USE_IDS_FILE"
fi

if [ ${#PROMPT_IDS[@]} -eq 0 ]; then
    echo "Error: No prompt IDs. Use -p 8 7 4 or -f prompt_ids.txt" >&2
    usage
    exit 1
fi

# Projects
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

# Build combined prompt once to verify IDs; use temp file in loop to avoid huge vars
TMP_PROMPT=$(mktemp)
trap 'rm -f "$TMP_PROMPT"' EXIT
get_combined_prompt_content "$PROMPTS_JSON" "${PROMPT_IDS[@]}" > "$TMP_PROMPT"
if [ ! -s "$TMP_PROMPT" ]; then
    echo "Error: No content could be built for IDs: ${PROMPT_IDS[*]}" >&2
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Prompt IDs: ${PROMPT_IDS[*]}"
echo "Projects: ${#PROJECTS[@]}"
echo "Loop: run once per project → wait ${SLEEP_BETWEEN_ROUNDS}s → repeat. Stop with Ctrl+C."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ROUND=0
while true; do
    ROUND=$((ROUND + 1))
    echo ""
    echo "========== ROUND $ROUND =========="
    set_clipboard "$TMP_PROMPT" || exit 1

    for i in "${!PROJECTS[@]}"; do
        n=$((i + 1))
        echo "━━━━ Project $n of ${#PROJECTS[@]}: $(basename "${PROJECTS[$i]}")"
        open_cursor_project "${PROJECTS[$i]}" "$(basename "${PROJECTS[$i]}")"
        sleep "$SLEEP_AFTER_OPEN_PROJECT"
        echo "  → Composer: paste prompt, Enter..."
        run_agent_prompt_in_front "$i" "${PROJECTS[$i]}" "$ROUND"
        echo "  ✓ Prompt sent."
        [ $i -lt $((${#PROJECTS[@]} - 1)) ] && sleep "$SLEEP_BETWEEN_PROJECTS"
    done

    echo ""
    echo "Round $ROUND done. Waiting ${SLEEP_BETWEEN_ROUNDS} seconds (Ctrl+C to stop)..."
    sleep "$SLEEP_BETWEEN_ROUNDS"
done
