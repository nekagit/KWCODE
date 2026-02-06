mod db;

use base64::Engine;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, Manager, State};

#[cfg(unix)]
use std::os::unix::process::CommandExt;

struct RunEntry {
    child: Child,
    label: String,
}

struct RunningState {
    runs: Arc<Mutex<HashMap<String, RunEntry>>>,
}

impl Default for RunningState {
    fn default() -> Self {
        Self {
            runs: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunIdResponse {
    pub run_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScriptLogPayload {
    pub run_id: String,
    pub line: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScriptExitedPayload {
    pub run_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunningRunInfo {
    pub run_id: String,
    pub label: String,
}

fn gen_run_id() -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    format!("run-{}", nanos)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptItem {
    pub id: u32,
    pub title: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ticket {
    pub id: String,
    pub title: String,
    pub description: String,
    pub status: String, // "backlog" | "in_progress" | "done" | "blocked"
    #[serde(default)]
    pub priority: i32,
    pub created_at: String,
    pub updated_at: String,
    // Legacy: read for migration, never serialized
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt_ids: Option<Vec<u32>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub project_paths: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Feature {
    pub id: String,
    pub title: String, // label for run / display
    #[serde(default)]
    pub ticket_ids: Vec<String>,
    #[serde(default)]
    pub prompt_ids: Vec<u32>,
    #[serde(default)]
    pub project_paths: Vec<String>, // empty = use active projects
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimingParams {
    pub sleep_after_open_project: f64,
    pub sleep_after_window_focus: f64,
    pub sleep_between_shift_tabs: f64,
    pub sleep_after_all_shift_tabs: f64,
    pub sleep_after_cmd_n: f64,
    pub sleep_before_paste: f64,
    pub sleep_after_paste: f64,
    pub sleep_after_enter: f64,
    pub sleep_between_projects: f64,
    pub sleep_between_rounds: f64,
}

fn is_valid_workspace(p: &PathBuf) -> bool {
    p.join("script").join("run_prompts_all_projects.sh").exists() && p.join("data").is_dir()
}

fn data_dir(ws: &PathBuf) -> PathBuf {
    let data = ws.join("data");
    if data.is_dir() {
        data
    } else {
        ws.clone()
    }
}

fn script_path(ws: &PathBuf) -> PathBuf {
    ws.join("script").join("run_prompts_all_projects.sh")
}

/// Resolve project root (contains script/ and data/). Tries current working directory first,
/// then walks up from the executable path so the app finds data when launched from any cwd.
fn project_root() -> Result<PathBuf, String> {
    // 1) Try current working directory (e.g. when running `tauri dev` from repo root)
    let mut candidate = std::env::current_dir().map_err(|e| e.to_string())?;
    if candidate.join("src-tauri").exists() {
        candidate = candidate.parent().unwrap_or(&candidate).to_path_buf();
    }
    if is_valid_workspace(&candidate) {
        return Ok(candidate);
    }

    // 2) Walk up from executable path (e.g. built app or dev binary in target/debug)
    if let Ok(exe) = std::env::current_exe() {
        let mut dir = exe.parent().map(PathBuf::from).unwrap_or_default();
        for _ in 0..20 {
            if dir.as_os_str().is_empty() {
                break;
            }
            if is_valid_workspace(&dir) {
                return Ok(dir);
            }
            if let Some(p) = dir.parent() {
                dir = p.to_path_buf();
            } else {
                break;
            }
        }
    }

    Err("Project root not found. Run the app from the repo root (contains script/run_prompts_all_projects.sh and data/).".to_string())
}

/// Read a file from disk and return its contents as base64 (for sending to API for PDF/text extraction).
#[tauri::command]
fn read_file_as_base64(path: String) -> Result<String, String> {
    let path_buf = PathBuf::from(path.trim());
    if !path_buf.exists() {
        return Err("File does not exist".to_string());
    }
    if !path_buf.is_file() {
        return Err("Path is not a file".to_string());
    }
    let bytes = std::fs::read(&path_buf).map_err(|e| e.to_string())?;
    Ok(base64::engine::general_purpose::STANDARD.encode(&bytes))
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
}

/// Read a text file under project root (script/ or data/). Path must be relative to project root or absolute under it.
#[tauri::command]
fn read_file_text(path: String) -> Result<String, String> {
    let ws = project_root()?;
    let path_buf = PathBuf::from(path.trim());
    let canonical = if path_buf.is_absolute() {
        path_buf.canonicalize().map_err(|e| e.to_string())?
    } else {
        ws.join(path_buf).canonicalize().map_err(|e| e.to_string())?
    };
    if !canonical.starts_with(ws.canonicalize().map_err(|e| e.to_string())?) {
        return Err("Path must be under project root".to_string());
    }
    if !canonical.is_file() {
        return Err("Path is not a file".to_string());
    }
    let content = std::fs::read_to_string(&canonical).map_err(|e| e.to_string())?;
    Ok(content)
}

/// List files in script/ directory.
#[tauri::command]
fn list_scripts() -> Result<Vec<FileEntry>, String> {
    let ws = project_root()?;
    let script_dir = ws.join("script");
    if !script_dir.is_dir() {
        return Ok(vec![]);
    }
    let mut entries = vec![];
    for e in std::fs::read_dir(&script_dir).map_err(|e| e.to_string())? {
        let e = e.map_err(|e| e.to_string())?;
        let path = e.path();
        if path.is_file() {
            let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string();
            let path_str = path.to_string_lossy().to_string();
            entries.push(FileEntry { name, path: path_str });
        }
    }
    entries.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(entries)
}

const PROJECTS_JSON: &str = "projects.json";

fn projects_path() -> Result<PathBuf, String> {
    let ws = project_root()?;
    Ok(data_dir(&ws).join(PROJECTS_JSON))
}

fn read_projects_json() -> Result<Vec<serde_json::Value>, String> {
    let path = projects_path()?;
    if !path.exists() {
        return Ok(vec![]);
    }
    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let arr: Vec<serde_json::Value> = serde_json::from_str(&content).unwrap_or_default();
    Ok(arr)
}

fn write_projects_json(projects: &[serde_json::Value]) -> Result<(), String> {
    let path = projects_path()?;
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let content = serde_json::to_string_pretty(projects).map_err(|e| e.to_string())?;
    std::fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(())
}

/// List all projects (JSON array string). Used when running in Tauri so /api/data/projects is not available.
#[tauri::command]
fn list_projects() -> Result<String, String> {
    let projects = read_projects_json()?;
    serde_json::to_string(&projects).map_err(|e| e.to_string())
}

/// Get a single project by id. Returns JSON object string or error if not found.
#[tauri::command]
fn get_project(id: String) -> Result<String, String> {
    let projects = read_projects_json()?;
    let id_trim = id.trim();
    let found = projects
        .iter()
        .find(|p| p.get("id").and_then(|v| v.as_str()) == Some(id_trim));
    match found {
        Some(p) => serde_json::to_string(p).map_err(|e| e.to_string()),
        None => Err("Project not found".to_string()),
    }
}

/// Create a new project. Body is JSON object with at least "name". Id and timestamps are set if missing.
#[tauri::command]
fn create_project(body: String) -> Result<String, String> {
    let mut project: serde_json::Map<String, serde_json::Value> =
        serde_json::from_str(&body).map_err(|e| e.to_string())?;
    let now = std::time::SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();
    let iso = chrono::DateTime::from_timestamp(now.as_secs() as i64, now.subsec_nanos())
        .map(|dt| dt.to_rfc3339_opts(chrono::SecondsFormat::Millis, true))
        .unwrap_or_else(|| format!("{}.{:03}Z", now.as_secs(), now.subsec_nanos() / 1_000_000));
    // Simple unique id (no uuid crate)
    let id = project.get("id").and_then(|v| v.as_str()).map(String::from).unwrap_or_else(|| {
        format!("proj-{}", now.as_nanos())
    });
    project.insert("id".to_string(), serde_json::Value::String(id.clone()));
    if !project.contains_key("created_at") {
        project.insert("created_at".to_string(), serde_json::Value::String(iso.clone()));
    }
    if !project.contains_key("updated_at") {
        project.insert("updated_at".to_string(), serde_json::Value::String(iso));
    }
    let project_val = serde_json::Value::Object(project.clone());
    let mut projects = read_projects_json()?;
    projects.push(project_val);
    write_projects_json(&projects)?;
    serde_json::to_string(&serde_json::Value::Object(project)).map_err(|e| e.to_string())
}

/// Update an existing project by id. Body is full project JSON.
#[tauri::command]
fn update_project(id: String, body: String) -> Result<(), String> {
    let id_trim = id.trim();
    let updated: serde_json::Value = serde_json::from_str(&body).map_err(|e| e.to_string())?;
    let mut projects = read_projects_json()?;
    let idx = projects
        .iter()
        .position(|p| p.get("id").and_then(|v| v.as_str()) == Some(id_trim))
        .ok_or_else(|| "Project not found".to_string())?;
    projects[idx] = updated;
    write_projects_json(&projects)
}

/// Delete a project by id.
#[tauri::command]
fn delete_project(id: String) -> Result<(), String> {
    let id_trim = id.trim();
    let mut projects = read_projects_json()?;
    let len_before = projects.len();
    projects.retain(|p| p.get("id").and_then(|v| v.as_str()) != Some(id_trim));
    if projects.len() == len_before {
        return Err("Project not found".to_string());
    }
    write_projects_json(&projects)
}

/// List JSON files in data/ directory.
#[tauri::command]
fn list_data_files() -> Result<Vec<FileEntry>, String> {
    let ws = project_root()?;
    let data = data_dir(&ws);
    if !data.is_dir() {
        return Ok(vec![]);
    }
    let mut entries = vec![];
    for e in std::fs::read_dir(&data).map_err(|e| e.to_string())? {
        let e = e.map_err(|e| e.to_string())?;
        let path = e.path();
        if path.is_file() {
            let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string();
            if name.ends_with(".json") {
                let path_str = path.to_string_lossy().to_string();
                entries.push(FileEntry { name, path: path_str });
            }
        }
    }
    entries.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(entries)
}

/// Result of analyzing a project directory for AI ticket generation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectAnalysis {
    pub name: String,
    pub path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub package_json: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub readme_snippet: Option<String>,
    pub top_level_dirs: Vec<String>,
    pub top_level_files: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub config_snippet: Option<String>,
}

const README_MAX_CHARS: usize = 8000;
const CONFIG_MAX_CHARS: usize = 4000;

/// Analyze a project directory for AI ticket generation: read package.json, README, list top-level structure.
/// Path must be an existing directory (e.g. from all_projects list).
#[tauri::command]
fn analyze_project_for_tickets(project_path: String) -> Result<ProjectAnalysis, String> {
    let path_buf = PathBuf::from(project_path.trim());
    if !path_buf.exists() {
        return Err("Project path does not exist".to_string());
    }
    if !path_buf.is_dir() {
        return Err("Project path is not a directory".to_string());
    }
    let name = path_buf
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("project")
        .to_string();
    let path_str = path_buf.to_string_lossy().to_string();

    let package_json = path_buf
        .join("package.json")
        .exists()
        .then(|| std::fs::read_to_string(path_buf.join("package.json")))
        .and_then(Result::ok);

    let readme_snippet = ["README.md", "readme.md", "README.MD"]
        .iter()
        .find(|f| path_buf.join(f).exists())
        .and_then(|f| std::fs::read_to_string(path_buf.join(f)).ok())
        .map(|s| {
            let t = s.trim();
            if t.len() > README_MAX_CHARS {
                format!("{}...", &t[..README_MAX_CHARS])
            } else {
                t.to_string()
            }
        });

    let mut top_level_dirs = Vec::new();
    let mut top_level_files = Vec::new();
    if let Ok(entries) = std::fs::read_dir(&path_buf) {
        for e in entries.flatten() {
            let p = e.path();
            if let Some(n) = p.file_name().and_then(|n| n.to_str()) {
                if n.starts_with('.') && n != ".git" {
                    continue;
                }
                if p.is_dir() {
                    top_level_dirs.push(n.to_string());
                } else {
                    top_level_files.push(n.to_string());
                }
            }
        }
    }
    top_level_dirs.sort();
    top_level_files.sort();

    let config_snippet = ["tsconfig.json", "vite.config.ts", "vite.config.js", "next.config.mjs", "next.config.js", "Cargo.toml", "pyproject.toml", "requirements.txt"]
        .iter()
        .find(|f| path_buf.join(f).exists())
        .and_then(|f| std::fs::read_to_string(path_buf.join(f)).ok())
        .map(|s| {
            let t = s.trim();
            if t.len() > CONFIG_MAX_CHARS {
                format!("{}...", &t[..CONFIG_MAX_CHARS])
            } else {
                t.to_string()
            }
        });

    Ok(ProjectAnalysis {
        name,
        path: path_str,
        package_json,
        readme_snippet,
        top_level_dirs,
        top_level_files,
        config_snippet,
    })
}

fn with_db<F, T>(f: F) -> Result<T, String>
where
    F: FnOnce(&rusqlite::Connection) -> Result<T, String>,
{
    let ws = project_root()?;
    let data = data_dir(&ws);
    let conn = db::open_db(&data.join("app.db"))?;
    db::migrate_from_json(&data, &conn)?;
    f(&conn)
}

#[tauri::command]
fn get_all_projects() -> Result<Vec<String>, String> {
    with_db(db::get_all_projects)
}

#[tauri::command]
fn get_active_projects() -> Result<Vec<String>, String> {
    with_db(db::get_active_projects)
}

#[tauri::command]
fn get_prompts() -> Result<Vec<PromptItem>, String> {
    let ws = project_root()?;
    let path = data_dir(&ws).join("prompts-export.json");
    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let arr: Vec<serde_json::Value> = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    let items: Vec<PromptItem> = arr
        .into_iter()
        .filter_map(|v| {
            let id = v.get("id")?.as_u64()? as u32;
            let title = v.get("title")?.as_str().unwrap_or("").to_string();
            Some(PromptItem { id, title })
        })
        .collect();
    Ok(items)
}

#[tauri::command]
fn save_active_projects(projects: Vec<String>) -> Result<(), String> {
    with_db(|conn| db::save_active_projects(conn, &projects))?;
    let ws = project_root()?;
    let dir = data_dir(&ws);
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join("cursor_projects.json");
    let content = serde_json::to_string_pretty(&projects).map_err(|e| e.to_string())?;
    std::fs::write(path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_tickets() -> Result<Vec<Ticket>, String> {
    with_db(db::get_tickets)
}

#[tauri::command]
fn save_tickets(tickets: Vec<Ticket>) -> Result<(), String> {
    with_db(|conn| db::save_tickets(conn, &tickets))
}

#[tauri::command]
fn get_features() -> Result<Vec<Feature>, String> {
    with_db(db::get_features)
}

#[tauri::command]
fn save_features(features: Vec<Feature>) -> Result<(), String> {
    with_db(|conn| db::save_features(conn, &features))
}

#[tauri::command]
fn get_kv_store_entries() -> Result<Vec<db::KvEntry>, String> {
    with_db(db::get_kv_store_entries)
}

fn run_script_inner(
    app: AppHandle,
    state: State<'_, RunningState>,
    ws: PathBuf,
    run_id: String,
    run_label: String,
    prompt_ids: Vec<u32>,
    active_projects: Vec<String>,
    timing: TimingParams,
) -> Result<(), String> {
    let script = script_path(&ws);
    let prompt_ids_str: Vec<String> = prompt_ids.iter().map(|n| n.to_string()).collect();

    let projects_file: PathBuf = if active_projects.is_empty() {
        data_dir(&ws).join("cursor_projects.json")
    } else {
        let tmp = std::env::temp_dir().join(format!("run_prompts_{}.json", run_id));
        let content =
            serde_json::to_string_pretty(&active_projects).map_err(|e| e.to_string())?;
        std::fs::write(&tmp, content).map_err(|e| e.to_string())?;
        tmp
    };

    let mut cmd = Command::new("bash");
    cmd.arg(script.as_os_str())
        .arg("-p")
        .args(&prompt_ids_str)
        .arg(projects_file.as_os_str())
        .current_dir(&ws)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    #[cfg(unix)]
    cmd.process_group(0);
    cmd.env("SLEEP_AFTER_OPEN_PROJECT", timing.sleep_after_open_project.to_string())
        .env("SLEEP_AFTER_WINDOW_FOCUS", timing.sleep_after_window_focus.to_string())
        .env("SLEEP_BETWEEN_SHIFT_TABS", timing.sleep_between_shift_tabs.to_string())
        .env("SLEEP_AFTER_ALL_SHIFT_TABS", timing.sleep_after_all_shift_tabs.to_string())
        .env("SLEEP_AFTER_CMD_N", timing.sleep_after_cmd_n.to_string())
        .env("SLEEP_BEFORE_PASTE", timing.sleep_before_paste.to_string())
        .env("SLEEP_AFTER_PASTE", timing.sleep_after_paste.to_string())
        .env("SLEEP_AFTER_ENTER", timing.sleep_after_enter.to_string())
        .env("SLEEP_BETWEEN_PROJECTS", timing.sleep_between_projects.to_string())
        .env("SLEEP_BETWEEN_ROUNDS", timing.sleep_between_rounds.to_string());

    let mut child = cmd.spawn().map_err(|e| e.to_string())?;
    let stdout = child.stdout.take().ok_or("no stdout")?;
    let stderr = child.stderr.take().ok_or("no stderr")?;

    {
        let mut guard = state.runs.lock().map_err(|e| e.to_string())?;
        guard.insert(
            run_id.clone(),
            RunEntry {
                child,
                label: run_label.clone(),
            },
        );
    }

    let app_stdout = app.clone();
    let app_stderr = app.clone();
    let app_exited = app.clone();
    let runs_handle = Arc::clone(&state.runs);
    let run_id_stdout = run_id.clone();
    let run_id_stderr = run_id.clone();
    let run_id_exited = run_id.clone();
    thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(line) = line {
                let _ = app_stdout.emit(
                    "script-log",
                    ScriptLogPayload {
                        run_id: run_id_stdout.clone(),
                        line,
                    },
                );
            }
        }
    });
    thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(line) = line {
                let _ = app_stderr.emit(
                    "script-log",
                    ScriptLogPayload {
                        run_id: run_id_stderr.clone(),
                        line: format!("[stderr] {}", line),
                    },
                );
            }
        }
    });
    thread::spawn(move || {
        loop {
            let exited = {
                let mut guard = match runs_handle.lock() {
                    Ok(g) => g,
                    Err(_) => break,
                };
                if let Some(entry) = guard.get_mut(&run_id_exited) {
                    if entry.child.try_wait().ok().flatten().is_some() {
                        guard.remove(&run_id_exited);
                        true
                    } else {
                        false
                    }
                } else {
                    break;
                }
            };
            if exited {
                let _ = app_exited.emit("script-exited", ScriptExitedPayload { run_id: run_id_exited });
                break;
            }
            thread::sleep(std::time::Duration::from_millis(500));
        }
    });

    Ok(())
}

#[tauri::command]
async fn run_script(
    app: AppHandle,
    state: State<'_, RunningState>,
    prompt_ids: Vec<u32>,
    active_projects: Vec<String>,
    timing: TimingParams,
    run_label: Option<String>,
) -> Result<RunIdResponse, String> {
    let ws = project_root()?;
    if run_label.is_none() {
        save_active_projects(active_projects.clone())?;
    }
    let run_id = gen_run_id();
    let label = run_label.unwrap_or_else(|| "Manual run".to_string());
    run_script_inner(
        app,
        state,
        ws,
        run_id.clone(),
        label,
        prompt_ids,
        active_projects,
        timing,
    )?;
    Ok(RunIdResponse { run_id })
}

#[tauri::command]
fn list_running_runs(state: State<'_, RunningState>) -> Result<Vec<RunningRunInfo>, String> {
    let guard = state.runs.lock().map_err(|e| e.to_string())?;
    Ok(guard
        .iter()
        .map(|(run_id, entry)| RunningRunInfo {
            run_id: run_id.clone(),
            label: entry.label.clone(),
        })
        .collect())
}

#[tauri::command]
fn stop_run(state: State<'_, RunningState>, run_id: String) -> Result<(), String> {
    let mut guard = state.runs.lock().map_err(|e| e.to_string())?;
    if let Some(mut entry) = guard.remove(&run_id) {
        let pid = entry.child.id() as i32;
        #[cfg(unix)]
        {
            let _ = unsafe { libc::kill(-pid, libc::SIGKILL) };
        }
        let _ = entry.child.kill();
    }
    Ok(())
}

#[tauri::command]
fn stop_script(state: State<'_, RunningState>) -> Result<(), String> {
    let mut guard = state.runs.lock().map_err(|e| e.to_string())?;
    for (_run_id, mut entry) in guard.drain() {
        let pid = entry.child.id() as i32;
        #[cfg(unix)]
        {
            let _ = unsafe { libc::kill(-pid, libc::SIGKILL) };
        }
        let _ = entry.child.kill();
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(RunningState::default())
        .setup(|app| {
            // Workaround for macOS/Tauri bug: WebView sometimes shows white instead of devUrl.
            // Force-navigate from Rust at 1s, 3s, 5s (navigate + eval fallback) if the initial load fails.
            #[cfg(debug_assertions)]
            {
                let app_url = "http://127.0.0.1:4000/".to_string();
                let app_handle = app.handle().clone();
                std::thread::spawn(move || {
                    for &delay_ms in &[1000_u64, 3000, 5000] {
                        std::thread::sleep(std::time::Duration::from_millis(delay_ms));
                        let handle = app_handle.clone();
                        let url = app_url.clone();
                        let _ = app_handle.run_on_main_thread(move || {
                            for (_, w) in handle.webview_windows() {
                                let _ = w.navigate(
                                    url.parse().unwrap_or_else(|_| "http://127.0.0.1:4000/".parse().unwrap()),
                                );
                                // Fallback: force location via JS in case navigate() is ignored
                                let js = format!("window.location.href = {}", serde_json::to_string(&url).unwrap_or_else(|_| "\"http://127.0.0.1:4000/\"".into()));
                                let _ = w.eval(&js);
                                break;
                            }
                        });
                    }
                });
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            read_file_as_base64,
            read_file_text,
            list_scripts,
            list_data_files,
            list_projects,
            get_project,
            create_project,
            update_project,
            delete_project,
            analyze_project_for_tickets,
            get_all_projects,
            get_active_projects,
            get_prompts,
            save_active_projects,
            get_tickets,
            save_tickets,
            get_features,
            save_features,
            run_script,
            list_running_runs,
            stop_run,
            stop_script,
            get_kv_store_entries,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
