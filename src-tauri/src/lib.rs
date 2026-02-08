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

/// A milestone that has to be done in an application. One feature has many tickets and must have at least one.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Feature {
    pub id: String,
    pub title: String, // label for run / display
    /// At least one ticket; a feature groups work items (tickets) for this milestone.
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
#[serde(rename_all = "camelCase")]
pub struct RunScriptArgs {
    #[serde(default)]
    pub prompt_ids: Vec<u32>,
    #[serde(default)]
    pub combined_prompt: Option<String>,
    #[serde(default)]
    pub active_projects: Vec<String>,
    pub timing: TimingParams,
    pub run_label: Option<String>,
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

/// Git repository info for the project details Git tab.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GitInfo {
    pub current_branch: String,
    pub branches: Vec<String>,
    pub remotes: String,
    pub status_short: String,
    pub last_commits: Vec<String>,
    pub head_ref: String,
    pub config_preview: String,
}

fn run_git(project_path: &PathBuf, args: &[&str]) -> Result<String, String> {
    let out = Command::new("git")
        .args(args)
        .current_dir(project_path)
        .output()
        .map_err(|e| e.to_string())?;
    let text = String::from_utf8_lossy(if out.status.success() { &out.stdout } else { &out.stderr });
    Ok(text.trim().to_string())
}

#[tauri::command]
fn get_git_info(project_path: String) -> Result<GitInfo, String> {
    let path_buf = PathBuf::from(project_path.trim());
    if path_buf.as_os_str().is_empty() {
        return Err("Project path is empty".to_string());
    }
    if !path_buf.exists() || !path_buf.is_dir() {
        return Err("Project path does not exist or is not a directory".to_string());
    }
    let git_dir = path_buf.join(".git");
    if !git_dir.exists() {
        return Err("Not a git repository (no .git)".to_string());
    }

    let mut info = GitInfo::default();

    // HEAD ref (e.g. ref: refs/heads/main)
    let head_path = git_dir.join("HEAD");
    if head_path.is_file() {
        info.head_ref = std::fs::read_to_string(&head_path).unwrap_or_default().trim().to_string();
        if info.head_ref.starts_with("ref: ") {
            info.current_branch = info.head_ref.trim_start_matches("ref: refs/heads/").to_string();
        }
    }

    // git status -sb
    if let Ok(s) = run_git(&path_buf, &["status", "-sb"]) {
        info.status_short = s;
    }

    // git branch -a
    if let Ok(s) = run_git(&path_buf, &["branch", "-a"]) {
        info.branches = s.lines().map(|l| l.trim().to_string()).filter(|l| !l.is_empty()).collect();
    }

    // git remote -v
    if let Ok(s) = run_git(&path_buf, &["remote", "-v"]) {
        info.remotes = s;
    }

    // git log -n 30 --oneline
    if let Ok(s) = run_git(&path_buf, &["log", "-n", "30", "--oneline"]) {
        info.last_commits = s.lines().map(|l| l.to_string()).filter(|l| !l.is_empty()).collect();
    }

    // .git/config preview (first 4KB, sanitized)
    let config_path = git_dir.join("config");
    if config_path.is_file() {
        if let Ok(content) = std::fs::read_to_string(&config_path) {
            let max_len = 4096;
            info.config_preview = if content.len() > max_len {
                format!("{}...", &content[..max_len])
            } else {
                content
            };
        }
    }

    Ok(info)
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

fn analysis_script_path(ws: &PathBuf) -> PathBuf {
    ws.join("script").join("run_analysis_single_project.sh")
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

/// Read a text file under a given root (e.g. project repo path). Use for project spec files from .cursor in another repo.
#[tauri::command]
fn read_file_text_under_root(root: String, path: String) -> Result<String, String> {
    let root_buf = PathBuf::from(root.trim());
    let root_canonical = root_buf.canonicalize().map_err(|e| e.to_string())?;
    let path_buf = PathBuf::from(path.trim());
    let canonical = if path_buf.is_absolute() {
        path_buf.canonicalize().map_err(|e| e.to_string())?
    } else {
        root_canonical.join(path_buf).canonicalize().map_err(|e| e.to_string())?
    };
    if !canonical.starts_with(&root_canonical) {
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
    Ok(resolve_data_dir()?.join(PROJECTS_JSON))
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

/// Read JSON array from data/<filename>. Returns empty array if file missing or invalid.
fn read_data_json_array(path: &std::path::Path, filename: &str) -> Vec<serde_json::Value> {
    let file_path = path.join(filename);
    if !file_path.exists() {
        return vec![];
    }
    let content = match std::fs::read_to_string(&file_path) {
        Ok(c) => c,
        Err(_) => return vec![],
    };
    let arr: Vec<serde_json::Value> = serde_json::from_str(&content).unwrap_or_default();
    arr
}

/// Get a single project with resolved prompts, tickets, features, ideas, designs, architectures.
/// Uses the same data sources as the dashboard (SQLite for tickets, get_features for features, JSON for rest)
/// so that "All data" and project details show consistent counts.
#[tauri::command]
fn get_project_resolved(id: String) -> Result<String, String> {
    let projects = read_projects_json()?;
    let id_trim = id.trim();
    let project = projects
        .iter()
        .find(|p| p.get("id").and_then(|v| v.as_str()) == Some(id_trim))
        .ok_or_else(|| "Project not found".to_string())?
        .clone();

    let data_path = resolve_data_dir()?;

    let ticket_ids: Vec<String> = project
        .get("ticketIds")
        .and_then(|v| v.as_array())
        .map(|a| {
            a.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();
    let feature_ids: Vec<String> = project
        .get("featureIds")
        .and_then(|v| v.as_array())
        .map(|a| {
            a.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();
    let prompt_ids: Vec<u32> = project
        .get("promptIds")
        .and_then(|v| v.as_array())
        .map(|a| a.iter().filter_map(|v| v.as_u64().map(|n| n as u32)).collect())
        .unwrap_or_default();
    let idea_ids: Vec<u64> = project
        .get("ideaIds")
        .and_then(|v| v.as_array())
        .map(|a| a.iter().filter_map(|v| v.as_u64()).collect())
        .unwrap_or_default();
    let design_ids: Vec<String> = project
        .get("designIds")
        .and_then(|v| v.as_array())
        .map(|a| {
            a.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();
    let architecture_ids: Vec<String> = project
        .get("architectureIds")
        .and_then(|v| v.as_array())
        .map(|a| {
            a.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();

    let tickets = get_tickets()?;
    let features = get_features()?;
    let prompts_list = read_data_json_array(&data_path, "prompts-export.json");
    let ideas_list = read_data_json_array(&data_path, "ideas.json");
    let designs_list = read_data_json_array(&data_path, "designs.json");
    let architectures_list = read_data_json_array(&data_path, "architectures.json");

    let entity_categories = project.get("entityCategories").cloned().unwrap_or(serde_json::Value::Object(serde_json::Map::new()));
    let get_cat = |kind: &str, entity_id: &str| -> serde_json::Value {
        entity_categories
            .get(kind)
            .and_then(|m| m.get(entity_id))
            .cloned()
            .unwrap_or(serde_json::Value::Object(serde_json::Map::new()))
    };

    let resolved_tickets: Vec<serde_json::Value> = ticket_ids
        .iter()
        .filter_map(|tid| {
            let t = tickets.iter().find(|x| x.id == *tid)?;
            let mut obj = serde_json::to_value(t).ok()?;
            let cat = get_cat("tickets", tid);
            if let (Some(obj_map), Some(cat_map)) = (obj.as_object_mut(), cat.as_object()) {
                for (k, v) in cat_map {
                    obj_map.insert(k.clone(), v.clone());
                }
            }
            Some(obj)
        })
        .collect();

    let resolved_features: Vec<serde_json::Value> = feature_ids
        .iter()
        .filter_map(|fid| {
            let f = features.iter().find(|x| x.id == *fid)?;
            let mut obj = serde_json::to_value(f).ok()?;
            let cat = get_cat("features", fid);
            if let (Some(obj_map), Some(cat_map)) = (obj.as_object_mut(), cat.as_object()) {
                for (k, v) in cat_map {
                    obj_map.insert(k.clone(), v.clone());
                }
            }
            Some(obj)
        })
        .collect();

    let resolved_prompts: Vec<serde_json::Value> = prompt_ids
        .iter()
        .filter_map(|pid| {
            let p = prompts_list.iter().find(|v| v.get("id").and_then(|x| x.as_u64()) == Some(*pid as u64))?;
            let mut obj = p.clone();
            let cat = get_cat("prompts", &pid.to_string());
            if let (Some(obj_map), Some(cat_map)) = (obj.as_object_mut(), cat.as_object()) {
                for (k, v) in cat_map {
                    obj_map.insert(k.clone(), v.clone());
                }
            }
            Some(obj)
        })
        .collect();

    let resolved_ideas: Vec<serde_json::Value> = idea_ids
        .iter()
        .filter_map(|iid| {
            let i = ideas_list.iter().find(|v| v.get("id").and_then(|x| x.as_u64()) == Some(*iid))?;
            let mut obj = i.clone();
            let cat = get_cat("ideas", &iid.to_string());
            if let (Some(obj_map), Some(cat_map)) = (obj.as_object_mut(), cat.as_object()) {
                for (k, v) in cat_map {
                    obj_map.insert(k.clone(), v.clone());
                }
            }
            Some(obj)
        })
        .collect();

    let resolved_designs: Vec<serde_json::Value> = design_ids
        .iter()
        .filter_map(|did| {
            let d = designs_list.iter().find(|v| v.get("id").and_then(|x| x.as_str()) == Some(did.as_str()))?;
            let mut obj = d.clone();
            let cat = get_cat("designs", did);
            if let (Some(obj_map), Some(cat_map)) = (obj.as_object_mut(), cat.as_object()) {
                for (k, v) in cat_map {
                    obj_map.insert(k.clone(), v.clone());
                }
            }
            Some(obj)
        })
        .collect();

    let resolved_architectures: Vec<serde_json::Value> = architecture_ids
        .iter()
        .filter_map(|aid| {
            let a = architectures_list.iter().find(|v| v.get("id").and_then(|x| x.as_str()) == Some(aid.as_str()))?;
            let mut obj = a.clone();
            let cat = get_cat("architectures", aid);
            if let (Some(obj_map), Some(cat_map)) = (obj.as_object_mut(), cat.as_object()) {
                for (k, v) in cat_map {
                    obj_map.insert(k.clone(), v.clone());
                }
            }
            Some(obj)
        })
        .collect();

    let mut out = serde_json::to_value(&project).map_err(|e| e.to_string())?;
    let obj = out.as_object_mut().ok_or("Invalid project")?;
    obj.insert("prompts".to_string(), serde_json::Value::Array(resolved_prompts));
    obj.insert("tickets".to_string(), serde_json::Value::Array(resolved_tickets));
    obj.insert("features".to_string(), serde_json::Value::Array(resolved_features));
    obj.insert("ideas".to_string(), serde_json::Value::Array(resolved_ideas));
    obj.insert("designs".to_string(), serde_json::Value::Array(resolved_designs));
    obj.insert("architectures".to_string(), serde_json::Value::Array(resolved_architectures));

    serde_json::to_string(&out).map_err(|e| e.to_string())
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

/// List all files under project_path/.cursor (recursive). Returns empty vec if .cursor does not exist or is not a directory.
#[tauri::command]
fn list_cursor_folder(project_path: String) -> Result<Vec<FileEntry>, String> {
    let base = PathBuf::from(project_path.trim()).join(".cursor");
    if !base.exists() || !base.is_dir() {
        return Ok(vec![]);
    }
    let mut entries = vec![];
    fn collect_files(dir: &std::path::Path, out: &mut Vec<FileEntry>) -> Result<(), String> {
        for e in std::fs::read_dir(dir).map_err(|e| e.to_string())? {
            let e = e.map_err(|e| e.to_string())?;
            let path = e.path();
            if path.is_file() {
                let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string();
                let path_str = path.to_string_lossy().to_string();
                out.push(FileEntry { name, path: path_str });
            } else if path.is_dir() {
                collect_files(&path, out)?;
            }
        }
        Ok(())
    }
    collect_files(&base, &mut entries)?;
    entries.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(entries)
}

/// Write a spec file into the project directory (e.g. project_path + "/.cursor/design-x.md").
/// Creates parent directories if needed. relative_path should be like ".cursor/design-abc.md".
#[tauri::command]
fn write_spec_file(project_path: String, relative_path: String, content: String) -> Result<(), String> {
    let base = PathBuf::from(project_path.trim());
    if !base.exists() || !base.is_dir() {
        return Err("Project path does not exist or is not a directory".to_string());
    }
    let full = base.join(relative_path.trim().trim_start_matches('/'));
    if let Some(parent) = full.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::write(&full, content).map_err(|e| e.to_string())?;
    Ok(())
}

/// Archive .cursor/tickets.md or .cursor/features.md to .cursor/legacy/{file}-YYYY-MM-DD.md and create a new empty file.
/// file_kind must be "tickets" or "features".
#[tauri::command]
fn archive_cursor_file(project_path: String, file_kind: String) -> Result<(), String> {
    let base = PathBuf::from(project_path.trim());
    if !base.exists() || !base.is_dir() {
        return Err("Project path does not exist or is not a directory".to_string());
    }
    let (cursor_file, legacy_prefix, minimal_content) = match file_kind.trim() {
        "tickets" => (
            ".cursor/tickets.md",
            "tickets",
            "# Work items (tickets) — (project name)\n\n**Project:** (set)\n**Source:** Archived and reset\n**Last updated:** (date)\n\n---\n\n## Summary: Done vs missing\n\n### Done\n\n| Area | What's implemented |\n\n### Missing or incomplete\n\n| Area | Gap |\n\n---\n\n## Prioritized work items (tickets)\n\n### P0 — Critical / foundation\n\n#### Feature: (add feature name)\n\n- [ ] #1 (add ticket)\n\n### P1 — High / quality and maintainability\n\n### P2 — Medium / polish and scale\n\n### P3 — Lower / later\n\n## Next steps\n\n1. Add tickets under features.\n",
        ),
        "features" => (
            ".cursor/features.md",
            "features",
            "# Features roadmap\n\nFeatures below are derived from .cursor/tickets.md. Add features as checklist items with ticket refs, e.g. `- [ ] Feature name — #1, #2`.\n\n## Major features\n\n- [ ] (add feature)\n",
        ),
        _ => return Err("file_kind must be 'tickets' or 'features'".to_string()),
    };
    let cursor_path = base.join(cursor_file);
    let content = if cursor_path.exists() {
        std::fs::read_to_string(&cursor_path).unwrap_or_else(|_| String::new())
    } else {
        String::new()
    };
    let date = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let legacy_name = format!("{}-{}.md", legacy_prefix, date);
    let legacy_path = base.join(".cursor").join("legacy");
    std::fs::create_dir_all(&legacy_path).map_err(|e| e.to_string())?;
    let legacy_full = legacy_path.join(&legacy_name);
    std::fs::write(&legacy_full, content).map_err(|e| e.to_string())?;
    std::fs::write(&cursor_path, minimal_content).map_err(|e| e.to_string())?;
    Ok(())
}

/// List JSON files in data/ directory.
#[tauri::command]
fn list_data_files() -> Result<Vec<FileEntry>, String> {
    let data = resolve_data_dir()?;
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

/// Resolve data directory from DB (ADR 069). Uses path stored in kv_store, or fallback from project root, and persists it.
fn resolve_data_dir() -> Result<PathBuf, String> {
    let ws = project_root()?;
    let fallback = data_dir(&ws);
    with_db(|conn| Ok(db::get_data_dir(conn, &fallback)))
}

#[tauri::command]
fn get_all_projects() -> Result<Vec<String>, String> {
    with_db(db::get_all_projects)
}

/// List all subdirectories of the parent of project root (Documents/February). Used by Projects page Local projects card.
#[tauri::command]
fn list_february_folders() -> Result<Vec<String>, String> {
    let ws = project_root()?;
    let february_dir = ws
        .parent()
        .ok_or_else(|| "Project root has no parent (February folder)".to_string())?;
    if !february_dir.is_dir() {
        return Ok(vec![]);
    }
    let mut paths = vec![];
    for entry in std::fs::read_dir(february_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_dir() {
            if let Ok(canonical) = path.canonicalize() {
                if let Some(s) = canonical.to_str() {
                    paths.push(s.to_string());
                }
            }
        }
    }
    paths.sort();
    Ok(paths)
}

#[tauri::command]
fn get_active_projects() -> Result<Vec<String>, String> {
    with_db(db::get_active_projects)
}

#[tauri::command]
fn get_prompts() -> Result<Vec<PromptItem>, String> {
    let path = resolve_data_dir()?.join("prompts-export.json");
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
    let dir = resolve_data_dir()?;
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
    let path = resolve_data_dir()?.join("features.json");
    if path.exists() {
        let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
        let features: Vec<Feature> = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        return Ok(features);
    }
    with_db(db::get_features)
}

#[tauri::command]
fn save_features(features: Vec<Feature>) -> Result<(), String> {
    with_db(|conn| db::save_features(conn, &features))?;
    let dir = resolve_data_dir()?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join("features.json");
    let content = serde_json::to_string_pretty(&features).map_err(|e| e.to_string())?;
    std::fs::write(path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_kv_store_entries() -> Result<Vec<db::KvEntry>, String> {
    with_db(db::get_kv_store_entries)
}

/// Return the data directory path (from DB, ADR 069). Used by UI to show where data is stored.
#[tauri::command]
fn get_data_dir() -> Result<String, String> {
    resolve_data_dir().map(|p| p.to_string_lossy().to_string())
}

fn run_script_inner(
    app: AppHandle,
    state: State<'_, RunningState>,
    ws: PathBuf,
    run_id: String,
    run_label: String,
    prompt_ids: Vec<u32>,
    combined_prompt: Option<String>,
    active_projects: Vec<String>,
    timing: TimingParams,
) -> Result<(), String> {
    let script = script_path(&ws);
    let prompt_ids_str: Vec<String> = prompt_ids.iter().map(|n| n.to_string()).collect();

    let data = resolve_data_dir()?;
    let projects_file: PathBuf = if active_projects.is_empty() {
        data.join("cursor_projects.json")
    } else {
        let tmp = std::env::temp_dir().join(format!("run_prompts_{}.json", run_id));
        let content =
            serde_json::to_string_pretty(&active_projects).map_err(|e| e.to_string())?;
        std::fs::write(&tmp, content).map_err(|e| e.to_string())?;
        tmp
    };

    let prompt_file_path: Option<PathBuf> = match combined_prompt {
        Some(content) => {
            let tmp = std::env::temp_dir().join(format!("run_combined_prompt_{}.txt", run_id));
            std::fs::write(&tmp, content).map_err(|e| e.to_string())?;
            Some(tmp)
        }
        None => None,
    };

    let mut cmd = Command::new("bash");
    cmd.arg(script.as_os_str());
    if let Some(ref path) = prompt_file_path {
        cmd.arg("-F").arg(path.as_os_str());
    } else {
        cmd.arg("-p").args(&prompt_ids_str);
    }
    cmd.arg(projects_file.as_os_str())
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

fn run_analysis_script_inner(
    app: AppHandle,
    state: State<'_, RunningState>,
    ws: PathBuf,
    run_id: String,
    run_label: String,
    project_path: String,
) -> Result<(), String> {
    let script = analysis_script_path(&ws);
    if !script.exists() {
        return Err(format!(
            "Analysis script not found: {}",
            script.to_string_lossy()
        ));
    }
    let mut cmd = Command::new("bash");
    cmd.arg(script.as_os_str())
        .arg("-P")
        .arg(project_path.as_str())
        .current_dir(&ws)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    #[cfg(unix)]
    cmd.process_group(0);

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
async fn run_analysis_script(
    app: AppHandle,
    state: State<'_, RunningState>,
    project_path: String,
) -> Result<RunIdResponse, String> {
    let ws = project_root()?;
    let run_id = gen_run_id();
    let label = format!("Analysis: {}", std::path::Path::new(&project_path).file_name().and_then(|n| n.to_str()).unwrap_or("project"));
    run_analysis_script_inner(app, state, ws, run_id.clone(), label, project_path)?;
    Ok(RunIdResponse { run_id })
}

#[tauri::command]
async fn run_script(
    app: AppHandle,
    state: State<'_, RunningState>,
    args: RunScriptArgs,
) -> Result<RunIdResponse, String> {
    let ws = project_root()?;
    if args.run_label.is_none() {
        save_active_projects(args.active_projects.clone())?;
    }
    let run_id = gen_run_id();
    let label = args
        .run_label
        .unwrap_or_else(|| "Manual run".to_string());
    run_script_inner(
        app,
        state,
        ws,
        run_id.clone(),
        label,
        args.prompt_ids,
        args.combined_prompt,
        args.active_projects,
        args.timing,
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
            read_file_text_under_root,
            list_scripts,
            list_data_files,
            list_cursor_folder,
            write_spec_file,
            archive_cursor_file,
            get_git_info,
            list_projects,
            get_project,
            get_project_resolved,
            create_project,
            update_project,
            delete_project,
            analyze_project_for_tickets,
            get_all_projects,
            list_february_folders,
            get_active_projects,
            get_prompts,
            save_active_projects,
            get_tickets,
            save_tickets,
            get_features,
            save_features,
            run_script,
            run_analysis_script,
            list_running_runs,
            stop_run,
            stop_script,
            get_kv_store_entries,
            get_data_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
