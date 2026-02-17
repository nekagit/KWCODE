# Agent CLI setup (Worker tab / Fast development)

The Worker tab’s “Run terminal agent” (fast development) runs a shell script that calls the **Cursor CLI** with your prompt. The script looks for **`agent`** or **`cursor-agent`** on PATH (Cursor installs to `~/.local/bin`; the app adds that to PATH when running the script).

## If you see “Cursor CLI not found” or “agent: command not found”

1. **Install Cursor CLI** (if not already):  
   `curl https://cursor.com/install -fsS | bash`  
   This typically installs to `~/.local/bin` as `agent` or `cursor-agent`.
2. **Make it visible to the Desktop app:**  
   The app already adds **`~/.local/bin`** and **`/usr/local/bin`** to PATH when it runs the script. If the CLI is in one of those, it should be found. If you installed elsewhere, symlink or copy the binary into `~/.local/bin` or `/usr/local/bin`, or set PATH for GUI apps and restart the app.
3. **Rebuild and run:** Rebuild the app and run from the Desktop so the bundled script (which tries both `agent` and `cursor-agent`) is used.

## Summary

- The script runs: `agent -p "<your prompt>"` or `cursor-agent -p "..."` in the project directory (whichever is found).
- The app extends PATH with `~/.local/bin` and `/usr/local/bin` when spawning the script.
- Cursor CLI is the expected agent; install with `curl https://cursor.com/install -fsS | bash` if needed.
