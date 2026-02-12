mod db;

use base64::Engine;
use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, Manager, State};
use url::Url;

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
    pub label: String,
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

// Helper to generate current ISO 8601 timestamp
fn now_iso() -> String {
    Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true)
}

fn get_seed_prompts() -> Vec<Prompt> {
    let now = now_iso();
    vec![
        Prompt {
            id: "prompt-1".to_string(),
            title: "Initial Project Setup".to_string(),
            content: "Generate a basic project structure for a Next.js application with Tailwind CSS and TypeScript.".to_string(),
            created_at: now.clone(),
            updated_at: now.clone(),
        },
        Prompt {
            id: "prompt-2".to_string(),
            title: "Create User Authentication Flow".to_string(),
            content: "Implement a complete user authentication flow including signup, login, and password reset functionalities.".to_string(),
            created_at: now.clone(),
            updated_at: now.clone(),
        },
    ]
}

fn get_seed_designs() -> Vec<Design> {
    let now = now_iso();
    vec![
        Design {
            id: "design-1".to_string(),
            name: "Dashboard Layout".to_string(),
            description: Some("Responsive dashboard layout with a sidebar navigation and a main content area.".to_string()),
            image_url: Some("https://example.com/dashboard-layout.png".to_string()),
            created_at: now.clone(),
            updated_at: now.clone(),
        },
        Design {
            id: "design-2".to_string(),
            name: "User Profile Page".to_string(),
            description: Some("Clean and modern user profile page displaying user information, settings, and activity feed.".to_string()),
            image_url: Some("https://example.com/user-profile.png".to_string()),
            created_at: now.clone(),
            updated_at: now.clone(),
        },
    ]
}

fn seed_initial_data(conn: &rusqlite::Connection) -> Result<(), String> {
    // Seed Prompts
    let prompts_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM prompts",
        [],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;

    if prompts_count == 0 {
        println!("Seeding initial prompts...");
        db::save_prompts(conn, &get_seed_prompts())?;
    }

    // Seed Designs
    let designs_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM designs",
        [],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;

    if designs_count == 0 {
        println!("Seeding initial designs...");
        db::save_designs(conn, &get_seed_designs())?;
    }

    Ok(())
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
pub struct Prompt {
    pub id: String,
    pub title: String,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Design {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub image_url: Option<String>,
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
    let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
    let stderr = String::from_utf8_lossy(&out.stderr).trim().to_string();
    if out.status.success() {
        Ok(stdout)
    } else {
        Err(if stderr.is_empty() { stdout } else { stderr })
    }
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

/// Return git diff and full file content for a changed file. Used when clicking a file in the Git tab.
#[derive(serde::Serialize)]
pub struct GitFileView {
    pub diff: String,
    pub full_content: Option<String>,
}

#[tauri::command]
fn get_git_file_view(project_path: String, file_path: String) -> Result<GitFileView, String> {
    let path_buf = PathBuf::from(project_path.trim());
    if !path_buf.exists() || !path_buf.is_dir() {
        return Err("Project path does not exist".to_string());
    }
    let git_dir = path_buf.join(".git");
    if !git_dir.exists() {
        return Err("Not a git repository".to_string());
    }
    let file_path = file_path.trim();
    if file_path.is_empty() {
        return Err("File path is empty".to_string());
    }
    let full_path = path_buf.join(file_path);
    let exists = full_path.exists() && full_path.is_file();

    let mut diff_parts = vec![];
    if let Ok(staged) = run_git(&path_buf, &["diff", "--staged", "--", file_path]) {
        if !staged.is_empty() {
            diff_parts.push(format!("=== Staged changes ===\n{}\n", staged));
        }
    }
    if let Ok(unstaged) = run_git(&path_buf, &["diff", "--", file_path]) {
        if !unstaged.is_empty() {
            diff_parts.push(format!("=== Unstaged changes ===\n{}\n", unstaged));
        }
    }
    let diff = if diff_parts.is_empty() && exists {
        "(no changes or untracked file)".to_string()
    } else {
        diff_parts.join("\n")
    };

    let full_content = if exists {
        std::fs::read_to_string(&full_path).ok()
    } else {
        None
    };

    Ok(GitFileView { diff, full_content })
}

fn validate_git_repo(project_path: &str) -> Result<PathBuf, String> {
    let path_buf = PathBuf::from(project_path.trim());
    if path_buf.as_os_str().is_empty() {
        return Err("Project path is empty".to_string());
    }
    if !path_buf.exists() || !path_buf.is_dir() {
        return Err("Project path does not exist or is not a directory".to_string());
    }
    if !path_buf.join(".git").exists() {
        return Err("Not a git repository (no .git)".to_string());
    }
    Ok(path_buf)
}

#[tauri::command]
fn git_fetch(project_path: String) -> Result<String, String> {
    let path_buf = validate_git_repo(&project_path)?;
    run_git(&path_buf, &["fetch"])
}

#[tauri::command]
fn git_pull(project_path: String) -> Result<String, String> {
    let path_buf = validate_git_repo(&project_path)?;
    run_git(&path_buf, &["pull"])
}

#[tauri::command]
fn git_push(project_path: String) -> Result<String, String> {
    let path_buf = validate_git_repo(&project_path)?;
    run_git(&path_buf, &["push"])
}

#[tauri::command]
fn git_commit(project_path: String, message: String) -> Result<String, String> {
    let path_buf = validate_git_repo(&project_path)?;
    let msg = message.trim();
    if msg.is_empty() {
        return Err("Commit message cannot be empty".to_string());
    }
    run_git(&path_buf, &["add", "-A"])?;
    run_git(&path_buf, &["commit", "-m", msg])
}

fn is_valid_workspace(p: &PathBuf) -> bool {
    p.join("script").join("implement_all.sh").exists() && p.join("data").is_dir()
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

fn implement_all_script_path(ws: &PathBuf) -> PathBuf {
    ws.join("script").join("implement_all.sh")
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

    Err("Project root not found. Run the app from the repo root (contains script/implement_all.sh and data/).".to_string())
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

/// Entry for one directory listing (one level under a root). Matches frontend FileEntry shape.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DirListingEntry {
    pub name: String,
    #[serde(rename = "isDirectory")]
    pub is_directory: bool,
    pub size: u64,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

/// List one level of files/dirs under a given root (e.g. project repo path). Used by Project Files in Stakeholder tab.
#[tauri::command]
fn list_files_under_root(root: String, path: String) -> Result<Vec<DirListingEntry>, String> {
    let root_buf = PathBuf::from(root.trim());
    let root_canonical = root_buf.canonicalize().map_err(|e| e.to_string())?;
    let path_buf = PathBuf::from(path.trim().trim_start_matches('/'));
    let dir = if path_buf.as_os_str().is_empty() || path_buf == Path::new(".") {
        root_canonical.clone()
    } else {
        root_canonical.join(path_buf).canonicalize().map_err(|e| e.to_string())?
    };
    if !dir.starts_with(&root_canonical) {
        return Err("Path must be under project root".to_string());
    }
    if !dir.is_dir() {
        return Err("Path is not a directory".to_string());
    }
    let mut entries = Vec::new();
    for e in std::fs::read_dir(&dir).map_err(|e| e.to_string())? {
        let e = e.map_err(|e| e.to_string())?;
        let path = e.path();
        let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string();
        if name.is_empty() || name == "." || name == ".." {
            continue;
        }
        let meta = std::fs::metadata(&path).map_err(|e| e.to_string())?;
        let is_directory = path.is_dir();
        let size = if is_directory { 0 } else { meta.len() };
        let updated_at = meta
            .modified()
            .ok()
            .map(|t| {
                let dt: DateTime<Utc> = t.into();
                dt.format("%Y-%m-%dT%H:%M:%SZ").to_string()
            })
            .unwrap_or_default();
        entries.push(DirListingEntry {
            name,
            is_directory,
            size,
            updated_at,
        });
    }
    entries.sort_by(|a, b| {
        if a.is_directory != b.is_directory {
            return a.is_directory.cmp(&b.is_directory).reverse();
        }
        a.name.to_lowercase().cmp(&b.name.to_lowercase())
    });
    Ok(entries)
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

/// List all files under project_path/.cursor (recursive). Returns empty vec if .cursor does not exist or is not a directory.
#[tauri::command]
fn list_cursor_folder(project_path: String) -> Result<Vec<FileEntry>, String> {
    let base = PathBuf::from(project_path.trim()).join(".cursor");
    if !base.exists() || !base.is_dir() {
        return Ok(vec![]);
    }
    let mut entries = vec![];
    fn collect_files(dir: &Path, out: &mut Vec<FileEntry>) -> Result<(), String> {
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

/// Archive .cursor/planner/tickets.md or .cursor/planner/features.md to .cursor/legacy/{file}-YYYY-MM-DD.md and create a new empty file.
/// file_kind must be "tickets" or "features".
#[tauri::command]
fn archive_cursor_file(project_path: String, file_kind: String) -> Result<(), String> {
    let base = PathBuf::from(project_path.trim());
    if !base.exists() || !base.is_dir() {
        return Err("Project path does not exist or is not a directory".to_string());
    }
    let (cursor_file, legacy_prefix, minimal_content) = match file_kind.trim() {
        "tickets" => (
            ".cursor/planner/tickets.md",
            "tickets",
            "# Work items (tickets) — (project name)\n\n**Project:** (set)\n**Source:** Archived and reset\n**Last updated:** (date)\n\n---\n\n## Summary: Done vs missing\n\n### Done\n\n| Area | What's implemented |\n\n### Missing or incomplete\n\n| Area | Gap |\n\n---\n\n## Prioritized work items (tickets)\n\n### P0 — Critical / foundation\n
#### Feature: (add feature name)\n
- [ ] #1 (add ticket)\n
### P1 — High / quality and maintainability\n
### P2 — Medium / polish and scale\n
### P3 — Lower / later\n
## Next steps\n
1. Add tickets under features.\n",
        ),
        "features" => (
            ".cursor/planner/features.md",
            "features",
            "# Features roadmap\n\nFeatures below are derived from .cursor/planner/tickets.md. Add features as checklist items with ticket refs, e.g. `- [ ] Feature name — #1, #2`.\n\n## Major features\n\n- [ ] (add feature)\n",
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
    if !path_buf.exists() || !path_buf.is_dir() {
        return Err("Project path does not exist or is not a directory".to_string());
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
    seed_initial_data(&conn)?; // New seeding call
    f(&conn)
}

/// Resolve data directory from DB (ADR 069). Uses path stored in kv_store, or fallback from project root, and persists it.
#[tauri::command]
fn resolve_data_dir() -> Result<PathBuf, String> {
    let ws = project_root()?;
    let fallback = data_dir(&ws);
    with_db(|conn| Ok(db::get_data_dir(conn, &fallback)))
}

/// Project record (camelCase for frontend). Stored in kv_store "projects" as JSON array.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    /// Optional on create; generated if missing or empty.
    #[serde(default)]
    pub id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub repo_path: Option<String>,
    #[serde(default)]
    pub prompt_ids: Vec<i64>,
    #[serde(default)]
    pub ticket_ids: Vec<String>,
    #[serde(default)]
    pub feature_ids: Vec<String>,
    #[serde(default)]
    pub idea_ids: Vec<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub design_ids: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub architecture_ids: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entity_categories: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spec_files: Option<Vec<serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spec_files_tickets: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spec_files_features: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,
}

fn list_projects_impl(conn: &rusqlite::Connection) -> Result<Vec<Project>, String> {
    let json = db::get_projects_json(conn)?;
    let arr: Vec<Project> = serde_json::from_str(&json).unwrap_or_default();
    Ok(arr)
}

#[tauri::command]
fn list_projects() -> Result<Vec<Project>, String> {
    with_db(list_projects_impl)
}

#[tauri::command]
fn get_project(id: String) -> Result<Option<Project>, String> {
    with_db(|conn| {
        let projects = list_projects_impl(conn)?;
        Ok(projects.into_iter().find(|p| p.id == id))
    })
}

#[tauri::command]
fn create_project(project: Project) -> Result<Project, String> {
    with_db(|conn| {
        let mut projects = list_projects_impl(conn)?;
        let now = now_iso();
        let mut p = project;
        if p.id.is_empty() {
            p.id = uuid::Uuid::new_v4().to_string();
        }
        p.created_at.get_or_insert(now.clone());
        p.updated_at = Some(now);
        projects.push(p.clone());
        let json = serde_json::to_string(&projects).map_err(|e| e.to_string())?;
        db::save_projects_json(conn, &json)?;
        Ok(p)
    })
}

#[tauri::command]
fn update_project(id: String, project: serde_json::Value) -> Result<Project, String> {
    with_db(|conn| {
        let mut projects = list_projects_impl(conn)?;
        let idx = projects.iter().position(|p| p.id == id).ok_or("Project not found")?;
        let now = now_iso();
        let base = projects[idx].clone();
        let updated: Project = serde_json::from_value(project).map_err(|e| e.to_string())?;
        let merged = Project {
            id: base.id,
            name: if updated.name.is_empty() { base.name } else { updated.name },
            description: updated.description.or(base.description),
            repo_path: updated.repo_path.or(base.repo_path),
            prompt_ids: if updated.prompt_ids.is_empty() { base.prompt_ids } else { updated.prompt_ids },
            ticket_ids: if updated.ticket_ids.is_empty() { base.ticket_ids } else { updated.ticket_ids },
            feature_ids: if updated.feature_ids.is_empty() { base.feature_ids } else { updated.feature_ids },
            idea_ids: if updated.idea_ids.is_empty() { base.idea_ids } else { updated.idea_ids },
            design_ids: updated.design_ids.or(base.design_ids),
            architecture_ids: updated.architecture_ids.or(base.architecture_ids),
            entity_categories: updated.entity_categories.or(base.entity_categories),
            spec_files: updated.spec_files.or(base.spec_files),
            spec_files_tickets: updated.spec_files_tickets.or(base.spec_files_tickets),
            spec_files_features: updated.spec_files_features.or(base.spec_files_features),
            created_at: base.created_at,
            updated_at: Some(now),
        };
        projects[idx] = merged.clone();
        let json = serde_json::to_string(&projects).map_err(|e| e.to_string())?;
        db::save_projects_json(conn, &json)?;
        Ok(merged)
    })
}

#[tauri::command]
fn delete_project(id: String) -> Result<(), String> {
    with_db(|conn| {
        let mut projects = list_projects_impl(conn)?;
        let len = projects.len();
        projects.retain(|p| p.id != id);
        if projects.len() == len {
            return Err("Project not found".to_string());
        }
        let json = serde_json::to_string(&projects).map_err(|e| e.to_string())?;
        db::save_projects_json(conn, &json)?;
        Ok(())
    })
}

/// Resolved project: project + linked prompts, tickets, features, ideas (empty), designs, architectures (empty).
#[tauri::command]
fn get_project_resolved(id: String) -> Result<serde_json::Value, String> {
    let project = with_db(|conn| {
        let projects = list_projects_impl(conn)?;
        projects.into_iter().find(|p| p.id == id).ok_or("Project not found".to_string())
    })?;
    let tickets = with_db(db::get_tickets).unwrap_or_default();
    let features = with_db(db::get_features).unwrap_or_default();
    let prompts = with_db(db::get_prompts).unwrap_or_default();
    let designs = with_db(db::get_designs).unwrap_or_default();
    let prompt_ids: Vec<i64> = project.prompt_ids.iter().copied().collect();
    let ticket_ids: Vec<String> = project.ticket_ids.clone();
    let feature_ids: Vec<String> = project.feature_ids.clone();
    let design_ids: Vec<String> = project.design_ids.as_deref().unwrap_or(&[]).to_vec();
    let prompts_resolved: Vec<serde_json::Value> = prompt_ids
        .iter()
        .filter_map(|pid| {
            prompts.iter().find(|p| p.id.parse::<i64>().ok() == Some(*pid)).map(|p| {
                serde_json::json!({
                    "id": p.id.parse::<i64>().unwrap_or(0),
                    "title": p.title,
                    "content": p.content,
                })
            })
        })
        .collect();
    let tickets_resolved: Vec<serde_json::Value> = ticket_ids
        .iter()
        .filter_map(|tid| {
            tickets.iter().find(|t| t.id == *tid).map(|t| {
                serde_json::json!({
                    "id": t.id,
                    "title": t.title,
                    "status": t.status,
                    "description": t.description,
                })
            })
        })
        .collect();
    let features_resolved: Vec<serde_json::Value> = feature_ids
        .iter()
        .filter_map(|fid| {
            features.iter().find(|f| f.id == *fid).map(|f| {
                serde_json::json!({
                    "id": f.id,
                    "title": f.title,
                    "prompt_ids": f.prompt_ids,
                    "project_paths": f.project_paths,
                })
            })
        })
        .collect();
    let designs_resolved: Vec<serde_json::Value> = design_ids
        .iter()
        .filter_map(|did| {
            designs.iter().find(|d| d.id == *did).map(|d| {
                serde_json::json!({ "id": d.id, "name": d.name })
            })
        })
        .collect();
    let ideas_empty: Vec<serde_json::Value> = vec![];
    let architectures_empty: Vec<serde_json::Value> = vec![];
    let resolved = serde_json::json!({
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "repoPath": project.repo_path,
        "promptIds": project.prompt_ids,
        "ticketIds": project.ticket_ids,
        "featureIds": project.feature_ids,
        "ideaIds": project.idea_ids,
        "designIds": project.design_ids,
        "architectureIds": project.architecture_ids,
        "entityCategories": project.entity_categories,
        "prompts": prompts_resolved,
        "tickets": tickets_resolved,
        "features": features_resolved,
        "ideas": ideas_empty,
        "designs": designs_resolved,
        "architectures": architectures_empty,
    });
    Ok(resolved)
}

#[tauri::command]
fn get_project_export(id: String, category: String) -> Result<String, String> {
    let resolved = get_project_resolved(id)?;
    let value = match category.as_str() {
        "prompts" => resolved.get("prompts"),
        "tickets" => resolved.get("tickets"),
        "features" => resolved.get("features"),
        "ideas" => resolved.get("ideas"),
        "designs" => resolved.get("designs"),
        "architectures" => resolved.get("architectures"),
        "project" => Some(&resolved),
        _ => return Err(format!("Unknown category: {}", category)),
    };
    let out = value
        .map(|v| serde_json::to_string(v).map_err(|e| e.to_string()))
        .unwrap_or_else(|| Ok("[]".to_string()))?;
    Ok(out)
}

#[tauri::command]
fn get_all_projects() -> Result<Vec<String>, String> {
    with_db(db::get_all_projects)
}

/// Collect all direct subdirectory paths under `dir`. No filter by name—every subdir and symlink is included.
fn list_subdir_paths(dir: &Path) -> Result<Vec<String>, String> {
    let mut paths = vec![];
    for entry in std::fs::read_dir(dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let is_dir = path.is_dir();
        let is_symlink = entry.file_type().map(|ft| ft.is_symlink()).unwrap_or(false);
        if is_dir || is_symlink {
            let path_str = path
                .canonicalize()
                .ok()
                .and_then(|c| c.to_str().map(String::from))
                .unwrap_or_else(|| path.to_string_lossy().to_string());
            paths.push(path_str);
        }
    }
    Ok(paths)
}

/// Parse FEBRUARY_DIR= value from a line of .env content.
fn parse_february_dir_line(line: &str) -> Option<PathBuf> {
    let line = line.trim();
    if !line.starts_with("FEBRUARY_DIR=") {
        return None;
    }
    let value = line["FEBRUARY_DIR=".len()..].trim().trim_matches('"').trim_matches('\'');
    if value.is_empty() {
        return None;
    }
    let pb = PathBuf::from(value);
    if pb.is_absolute() {
        Some(pb)
    } else {
        None
    }
}

/// Read one line from path_file and return it as PathBuf if absolute and existing dir.
fn read_february_dir_from_file(path_file: &Path) -> Option<PathBuf> {
    let line = std::fs::read_to_string(path_file).ok()?.lines().next()?.trim().to_string();
    if line.is_empty() {
        return None;
    }
    let pb = PathBuf::from(line);
    if pb.is_absolute() && pb.is_dir() {
        Some(pb)
    } else {
        None
    }
}

/// Read projects root path from data/february-dir.txt. Check project data dir, cwd/data, then walk up from exe.
fn february_dir_from_data_file() -> Option<PathBuf> {
    if let Ok(ws) = project_root() {
        let data = data_dir(&ws);
        let path_file = data.join("february-dir.txt");
        if path_file.exists() {
            if let Some(pb) = read_february_dir_from_file(&path_file) {
                return Some(pb);
            }
        }
    }
    if let Ok(cwd) = std::env::current_dir() {
        let path_file = cwd.join("data").join("february-dir.txt");
        if path_file.exists() {
            if let Some(pb) = read_february_dir_from_file(&path_file) {
                return Some(pb);
            }
        }
    }
    if let Ok(exe) = std::env::current_exe() {
        let mut dir = exe.parent().map(PathBuf::from).unwrap_or_default();
        for _ in 0..15 {
            if dir.as_os_str().is_empty() {
                break;
            }
            let path_file = dir.join("data").join("february-dir.txt");
            if path_file.exists() {
                if let Some(pb) = read_february_dir_from_file(&path_file) {
                    return Some(pb);
                }
            }
            if let Some(p) = dir.parent() {
                dir = p.to_path_buf();
            } else {
                break;
            }
        }
    }
    None
}

/// Read FEBRUARY_DIR from process env or from .env file (project root, cwd, or near executable).
fn resolve_february_dir() -> Option<PathBuf> {
    if let Some(pb) = february_dir_from_data_file() {
        return Some(pb);
    }
    if let Some(pb) = std::env::var("FEBRUARY_DIR").ok().filter(|p| !p.trim().is_empty()).map(|p| PathBuf::from(p.trim())) {
        if pb.is_absolute() {
            return Some(pb);
        }
    }
    let try_env_file = |path: &Path| -> Option<PathBuf> {
        let content = std::fs::read_to_string(path).ok()?;
        for line in content.lines() {
            if let Some(pb) = parse_february_dir_line(line) {
                return Some(pb);
            }
        }
        None
    };
    if let Ok(ws) = project_root() {
        if let Some(pb) = try_env_file(&ws.join(".env")) {
            return Some(pb);
        }
    }
    if let Ok(cwd) = std::env::current_dir() {
        if let Some(pb) = try_env_file(&cwd.join(".env")) {
            return Some(pb);
        }
    }
    if let Ok(exe) = std::env::current_exe() {
        let mut dir = exe.parent().map(PathBuf::from).unwrap_or_default();
        for _ in 0..15 {
            if dir.as_os_str().is_empty() {
                break;
            }
            if let Some(pb) = try_env_file(&dir.join(".env")) {
                return Some(pb);
            }
            if let Some(p) = dir.parent() {
                dir = p.to_path_buf();
            } else {
                break;
            }
        }
    }
    None
}

/// List all subdirectories of the configured projects root. Used by Projects page Local repos card.
/// No filter by name—every folder is included. Path from data file or FEBRUARY_DIR (env or .env); else parent of project root.
#[tauri::command]
fn list_february_folders() -> Result<Vec<String>, String> {
    let mut candidates: Vec<PathBuf> = vec![];

    if let Some(pb) = resolve_february_dir() {
        let pb_canon = pb.canonicalize().ok().unwrap_or(pb);
        if pb_canon.is_dir() {
            candidates.push(pb_canon);
        }
    }

    if candidates.is_empty() {
        if let Ok(ws) = project_root() {
            if let Some(parent) = ws.parent() {
                let parent_buf = parent.to_path_buf();
                let canonical_parent = parent_buf.canonicalize().ok().unwrap_or(parent_buf);
                if canonical_parent.is_dir() && !candidates.iter().any(|c| c == &canonical_parent) {
                    candidates.push(canonical_parent);
                }
            }
        }
    }

    let mut seen = HashSet::new();
    let mut paths = vec![];
    for dir in &candidates {
        if let Ok(subdirs) = list_subdir_paths(dir) {
            for s in subdirs {
                if seen.insert(s.clone()) {
                    paths.push(s);
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
fn get_prompts() -> Result<Vec<Prompt>, String> {
    with_db(db::get_prompts)
}

#[tauri::command]
fn save_prompts(prompts: Vec<Prompt>) -> Result<(), String> {
    with_db(|conn| db::save_prompts(conn, &prompts))
}

#[tauri::command]
fn add_prompt(title: String, content: String) -> Result<Prompt, String> {
    let mut prompts = with_db(db::get_prompts).map_err(|e| e.to_string())?;
    let next_id: i64 = prompts
        .iter()
        .filter_map(|p| p.id.parse().ok())
        .max()
        .map(|n: i64| n + 1)
        .unwrap_or(1);
    let now = now_iso();
    let new_prompt = Prompt {
        id: next_id.to_string(),
        title: title.trim().to_string(),
        content,
        created_at: now.clone(),
        updated_at: now,
    };
    prompts.push(new_prompt.clone());
    with_db(|conn| db::save_prompts(conn, &prompts))?;
    Ok(new_prompt)
}

#[tauri::command]
fn get_designs() -> Result<Vec<Design>, String> {
    with_db(db::get_designs)
}

#[tauri::command]
fn save_designs(designs: Vec<Design>) -> Result<(), String> {
    with_db(|conn| db::save_designs(conn, &designs))
}

#[tauri::command]
fn save_active_projects(projects: Vec<String>) -> Result<(), String> {
    with_db(|conn| db::save_active_projects(conn, &projects))
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
    let run_label_clone = run_label.clone();
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
                let _ = app_exited.emit("script-exited", ScriptExitedPayload { run_id: run_id_exited, label: run_label_clone.clone() });
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
    let run_label_clone = run_label.clone();
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
                let _ = app_exited.emit("script-exited", ScriptExitedPayload { run_id: run_id_exited, label: run_label_clone.clone() });
                break;
            }
            thread::sleep(std::time::Duration::from_millis(500));
        }
    });

    Ok(())
}

fn run_implement_all_script_inner(
    app: AppHandle,
    state: State<'_, RunningState>,
    ws: PathBuf,
    run_id: String,
    run_label: String,
    project_path: String,
    slot: Option<u8>,
    prompt_content: Option<String>,
) -> Result<(), String> {
    let run_label_clone = run_label.clone();
    let script = implement_all_script_path(&ws);
    if !script.exists() {
        return Err(format!(
            "Implement All script not found: {}",
            script.to_string_lossy()
        ));
    }
    let prompt_path: Option<PathBuf> = match &prompt_content {
        Some(content) => {
            let p = std::env::temp_dir().join(format!("kw_implement_all_prompt_{}.txt", run_id));
            std::fs::write(&p, content).map_err(|e| e.to_string())?;
            Some(p)
        }
        None => None,
    };
    let mut cmd = Command::new("bash");
    cmd.arg(script.as_os_str())
        .arg("-P")
        .arg(project_path.as_str());
    if let Some(s) = slot {
        if (1..=3).contains(&s) {
            cmd.arg("-S").arg(s.to_string());
        }
    }
    if let Some(ref path) = prompt_path {
        cmd.arg("-F").arg(path.as_os_str());
    }
    cmd.current_dir(&ws)
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
                let _ = app_exited.emit("script-exited", ScriptExitedPayload { run_id: run_id_exited, label: run_label_clone.clone() });
                break;
            }
            thread::sleep(std::time::Duration::from_millis(500));
        }
    });

    Ok(())
}

/// Opens 3 Terminal.app windows (macOS only), each running `cd project_path && agent`.
/// Gives you a real TTY so Cursor CLI runs in interactive mode instead of "print mode".
#[tauri::command]
async fn open_implement_all_in_system_terminal(project_path: String) -> Result<(), String> {
    #[cfg(not(target_os = "macos"))]
    {
        let _ = project_path;
        return Err("Open in system terminal is only supported on macOS.".to_string());
    }
    #[cfg(target_os = "macos")]
    {
        // Escape path for shell: single-quote wrap, inner ' → '\''
        let path_escaped = project_path.replace('\'', "'\\''");
        let shell_cmd = format!("cd '{}' && agent", path_escaped);
        // Escape for AppleScript string: \ → \\, " → \"
        let as_escaped = shell_cmd.replace('\\', "\\\\").replace('"', "\\\"");
        let script = format!(
            "tell application \"Terminal\" to do script \"{}\"",
            as_escaped
        );
        for _ in 0..3 {
            Command::new("osascript")
                .arg("-e")
                .arg(&script)
                .spawn()
                .map_err(|e| format!("Failed to open Terminal: {}", e))?;
        }
        Ok(())
    }
}

#[tauri::command]
async fn run_implement_all(
    app: AppHandle,
    state: State<'_, RunningState>,
    project_path: String,
    slot: Option<u8>,
    prompt_content: Option<String>,
) -> Result<RunIdResponse, String> {
    let ws = project_root()?;
    let run_id = gen_run_id();
    let label = match slot {
        Some(1) => "Implement All (Terminal 1)".to_string(),
        Some(2) => "Implement All (Terminal 2)".to_string(),
        Some(3) => "Implement All (Terminal 3)".to_string(),
        _ => "Implement All".to_string(),
    };
    run_implement_all_script_inner(app, state, ws, run_id.clone(), label, project_path, slot, prompt_content)?;
    Ok(RunIdResponse { run_id })
}

#[tauri::command]
async fn run_analysis_script(
    app: AppHandle,
    state: State<'_, RunningState>,
    project_path: String,
) -> Result<RunIdResponse, String> {
    let ws = project_root()?;
    let run_id = gen_run_id();
    let label = format!("Analysis: {}", Path::new(&project_path).file_name().and_then(|n| n.to_str()).unwrap_or("project"));
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
            // Workaround for macOS/Tauri bug: WebView often shows white instead of devUrl.
            // 1) Load a local loader HTML first (shows "kwcode" then redirects to dev server).
            // 2) Retry navigating to app URL at 2s, 4s, 6s in case loader redirect fails.
            #[cfg(debug_assertions)]
            {
                let app_url = "http://127.0.0.1:4000/".to_string();
                let app_handle = app.handle().clone();

                // Write loader to temp file so we can navigate to it (file:// works when devUrl fails).
                let loader_url = (|| -> Option<Url> {
                    let html = include_str!("../../public/tauri-load.html");
                    let temp = std::env::temp_dir().join("tauri-load.html");
                    std::fs::write(&temp, html).ok()?;
                    let path = temp.canonicalize().ok()?;
                    Url::from_file_path(path).ok()
                })();

                std::thread::spawn(move || {
                    // First: try to show loader (file://) so user sees something instead of white.
                    if let Some(ref url) = loader_url {
                        std::thread::sleep(std::time::Duration::from_millis(150));
                        let handle = app_handle.clone();
                        let load_url = url.clone();
                        let _ = app_handle.run_on_main_thread(move || {
                            for (_, w) in handle.webview_windows() {
                                let _ = w.navigate(load_url.as_str().parse().unwrap_or_else(|_| "http://127.0.0.1:4000/".parse().unwrap()));
                                break;
                            }
                        });
                    }

                    // Fallback: force-navigate to dev server in case loader or initial load failed.
                    for _ in 0..3 {
                        std::thread::sleep(std::time::Duration::from_millis(2000));
                        let handle = app_handle.clone();
                        let url = app_url.clone();
                        let _ = app_handle.run_on_main_thread(move || {
                            for (_, w) in handle.webview_windows() {
                                let _ = w.navigate(
                                    url.parse().unwrap_or_else(|_| "http://127.0.0.1:4000/".parse().unwrap()),
                                );
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
            list_files_under_root,
            list_scripts,
            list_cursor_folder,
            write_spec_file,
            archive_cursor_file,
            get_git_info,
            get_git_file_view,
            git_fetch,
            git_pull,
            git_push,
            git_commit,
            analyze_project_for_tickets,
            get_all_projects,
            list_projects,
            get_project,
            create_project,
            update_project,
            delete_project,
            get_project_resolved,
            get_project_export,
            list_february_folders,
            get_active_projects,
            get_prompts,
            save_prompts,
            add_prompt,
            get_designs,
            save_designs,
            save_active_projects,
            get_tickets,
            save_tickets,
            get_features,
            save_features,
            run_script,
            run_analysis_script,
            run_implement_all,
            open_implement_all_in_system_terminal,
            list_running_runs,
            stop_run,
            stop_script,
            get_kv_store_entries,
            get_data_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}