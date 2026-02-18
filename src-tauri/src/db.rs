//! SQLite database for app data (projects, tickets, features).
//! Migrates from existing JSON files on first run.

use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

const KV_ALL_PROJECTS: &str = "all_projects";
const KV_CURSOR_PROJECTS: &str = "cursor_projects";
const KV_DATA_DIR: &str = "data_dir";
const KV_PROJECTS: &str = "projects";

pub fn open_db(db_path: &Path) -> Result<Connection, String> {
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute_batch(
        "PRAGMA foreign_keys = ON;
         PRAGMA journal_mode = WAL;",
    )
    .map_err(|e| e.to_string())?;
    init_schema(&conn)?;
    Ok(conn)
}

fn init_schema(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS kv_store (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS tickets (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL,
            priority INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            prompt_ids TEXT,
            project_paths TEXT
        );
        CREATE TABLE IF NOT EXISTS features (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            ticket_ids TEXT NOT NULL DEFAULT '[]',
            prompt_ids TEXT NOT NULL DEFAULT '[]',
            project_paths TEXT NOT NULL DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS prompts (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS designs (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            image_url TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS plan_tickets (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            number INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            priority TEXT NOT NULL DEFAULT 'P1',
            feature_name TEXT NOT NULL DEFAULT 'General',
            done INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'Todo',
            milestone_id INTEGER,
            idea_id INTEGER,
            agents TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(project_id, number)
        );
        CREATE TABLE IF NOT EXISTS plan_kanban_state (
            project_id TEXT PRIMARY KEY,
            in_progress_ids TEXT NOT NULL DEFAULT '[]',
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS milestones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            content TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS ideas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'other',
            body TEXT,
            source TEXT NOT NULL DEFAULT 'manual',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS implementation_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            run_id TEXT NOT NULL,
            ticket_number INTEGER NOT NULL,
            ticket_title TEXT NOT NULL,
            milestone_id INTEGER,
            idea_id INTEGER,
            completed_at TEXT NOT NULL,
            files_changed TEXT NOT NULL DEFAULT '[]',
            summary TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending'
        );
        ",
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}


/// Get data directory path from DB; if missing or invalid, use fallback and persist it.
pub fn get_data_dir(conn: &Connection, fallback: &Path) -> PathBuf {
    let stored: Option<String> = conn
        .query_row(
            "SELECT value FROM kv_store WHERE key = ?1",
            params![KV_DATA_DIR],
            |row| row.get(0),
        )
        .ok();
    let path = stored
        .filter(|s| !s.is_empty())
        .map(PathBuf::from)
        .filter(|p| p.exists() && p.is_dir());
    match path {
        Some(p) => p,
        None => {
            let fallback_buf = fallback.to_path_buf();
            let value = fallback.to_string_lossy().to_string();
            let _ = conn.execute(
                "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?1, ?2)",
                params![KV_DATA_DIR, value],
            );
            fallback_buf
        }
    }
}


pub fn get_all_projects(conn: &Connection) -> Result<Vec<String>, String> {
    let content: String = match conn.query_row(
        "SELECT value FROM kv_store WHERE key = ?1",
        params![KV_ALL_PROJECTS],
        |row| row.get(0),
    ) {
        Ok(v) => v,
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            return Ok(vec![]);
        }
        Err(e) => return Err(e.to_string()),
    };
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

/// Full projects list as JSON array (same shape as data/projects.json). Default "[]".
pub fn get_projects_json(conn: &Connection) -> Result<String, String> {
    let content: String = match conn.query_row(
        "SELECT value FROM kv_store WHERE key = ?1",
        params![KV_PROJECTS],
        |row| row.get(0),
    ) {
        Ok(v) => v,
        Err(rusqlite::Error::QueryReturnedNoRows) => return Ok("[]".to_string()),
        Err(e) => return Err(e.to_string()),
    };
    Ok(content)
}

pub fn save_projects_json(conn: &Connection, json: &str) -> Result<(), String> {
    conn.execute(
        "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?1, ?2)",
        params![KV_PROJECTS, json],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Key-value pair for kv_store table (for Data view).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KvEntry {
    pub key: String,
    pub value: String,
}

pub fn get_kv_store_entries(conn: &Connection) -> Result<Vec<KvEntry>, String> {
    let mut stmt = conn
        .prepare("SELECT key, value FROM kv_store ORDER BY key")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(KvEntry {
                key: row.get(0)?,
                value: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut out = vec![];
    for row in rows {
        out.push(row.map_err(|e| e.to_string())?);
    }
    Ok(out)
}

pub fn get_active_projects(conn: &Connection) -> Result<Vec<String>, String> {
    let content: String = match conn.query_row(
        "SELECT value FROM kv_store WHERE key = ?1",
        params![KV_CURSOR_PROJECTS],
        |row| row.get(0),
    ) {
        Ok(v) => v,
        Err(rusqlite::Error::QueryReturnedNoRows) => return Ok(vec![]),
        Err(e) => return Err(e.to_string()),
    };
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

pub fn save_active_projects(conn: &Connection, projects: &[String]) -> Result<(), String> {
    let content = serde_json::to_string(projects).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?1, ?2)",
        params![KV_CURSOR_PROJECTS, content],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn get_tickets(conn: &Connection) -> Result<Vec<super::Ticket>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, title, description, status, priority, created_at, updated_at, prompt_ids, project_paths FROM tickets ORDER BY updated_at DESC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            let prompt_ids: Option<String> = row.get(7)?;
            let project_paths: Option<String> = row.get(8)?;
            Ok(super::Ticket {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                status: row.get(3)?,
                priority: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
                prompt_ids: prompt_ids.and_then(|s| serde_json::from_str(&s).ok()),
                project_paths: project_paths.and_then(|s| serde_json::from_str(&s).ok()),
            })
        })
        .map_err(|e| e.to_string())?;
    let mut out = vec![];
    for row in rows {
        out.push(row.map_err(|e| e.to_string())?);
    }
    Ok(out)
}

pub fn save_tickets(conn: &Connection, tickets: &[super::Ticket]) -> Result<(), String> {
    conn.execute("DELETE FROM tickets", []).map_err(|e| e.to_string())?;
    for t in tickets {
        let prompt_ids = t.prompt_ids.as_ref().and_then(|v| serde_json::to_string(v).ok());
        let project_paths = t.project_paths.as_ref().and_then(|v| serde_json::to_string(v).ok());
        conn.execute(
            "INSERT INTO tickets (id, title, description, status, priority, created_at, updated_at, prompt_ids, project_paths)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                t.id,
                t.title,
                t.description,
                t.status,
                t.priority,
                t.created_at,
                t.updated_at,
                prompt_ids,
                project_paths,
            ],
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn get_features(conn: &Connection) -> Result<Vec<super::Feature>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, title, ticket_ids, prompt_ids, project_paths, created_at, updated_at FROM features ORDER BY updated_at DESC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(super::Feature {
                id: row.get(0)?,
                title: row.get(1)?,
                ticket_ids: serde_json::from_str(row.get::<_, String>(2)?.as_str()).unwrap_or_default(),
                prompt_ids: serde_json::from_str(row.get::<_, String>(3)?.as_str()).unwrap_or_default(),
                project_paths: serde_json::from_str(row.get::<_, String>(4)?.as_str()).unwrap_or_default(),
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut out = vec![];
    for row in rows {
        out.push(row.map_err(|e| e.to_string())?);
    }
    Ok(out)
}

pub fn save_features(conn: &Connection, features: &[super::Feature]) -> Result<(), String> {
    conn.execute("DELETE FROM features", []).map_err(|e| e.to_string())?;
    for f in features {
        let ticket_ids = serde_json::to_string(&f.ticket_ids).map_err(|e| e.to_string())?;
        let prompt_ids = serde_json::to_string(&f.prompt_ids).map_err(|e| e.to_string())?;
        let project_paths = serde_json::to_string(&f.project_paths).map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT INTO features (id, title, ticket_ids, prompt_ids, project_paths, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                f.id,
                f.title,
                ticket_ids,
                prompt_ids,
                project_paths,
                f.created_at,
                f.updated_at,
            ],
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn get_prompts(conn: &Connection) -> Result<Vec<super::Prompt>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, title, content, created_at, updated_at FROM prompts ORDER BY updated_at DESC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(super::Prompt {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut out = vec![];
    for row in rows {
        out.push(row.map_err(|e| e.to_string())?);
    }
    Ok(out)
}

pub fn save_prompts(conn: &Connection, prompts: &[super::Prompt]) -> Result<(), String> {
    conn.execute("DELETE FROM prompts", []).map_err(|e| e.to_string())?;
    for p in prompts {
        conn.execute(
            "INSERT INTO prompts (id, title, content, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                p.id,
                p.title,
                p.content,
                p.created_at,
                p.updated_at,
            ],
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn get_designs(conn: &Connection) -> Result<Vec<super::Design>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, name, description, image_url, created_at, updated_at FROM designs ORDER BY updated_at DESC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(super::Design {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                image_url: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut out = vec![];
    for row in rows {
        out.push(row.map_err(|e| e.to_string())?);
    }
    Ok(out)
}

pub fn save_designs(conn: &Connection, designs: &[super::Design]) -> Result<(), String> {
    conn.execute("DELETE FROM designs", []).map_err(|e| e.to_string())?;
    for d in designs {
        conn.execute(
            "INSERT INTO designs (id, name, description, image_url, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                d.id,
                d.name,
                d.description,
                d.image_url,
                d.created_at,
                d.updated_at,
            ],
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

// --- Project-scoped data for Worker/Planner (avoid fetch to /api which triggers URL parse error in Tauri) ---

pub fn get_plan_tickets_for_project(conn: &Connection, project_id: &str) -> Result<Vec<serde_json::Value>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, project_id, number, title, description, priority, feature_name, done, status, milestone_id, idea_id, agents, created_at, updated_at FROM plan_tickets WHERE project_id = ?1 ORDER BY number ASC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![project_id.trim()], |row| {
            let agents: Option<String> = row.get(11)?;
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "project_id": row.get::<_, String>(1)?,
                "number": row.get::<_, i64>(2)?,
                "title": row.get::<_, String>(3)?,
                "description": row.get::<_, Option<String>>(4)?,
                "priority": row.get::<_, String>(5)?,
                "feature_name": row.get::<_, String>(6)?,
                "featureName": row.get::<_, String>(6)?,
                "done": row.get::<_, i64>(7)? != 0,
                "status": row.get::<_, String>(8)?,
                "milestone_id": row.get::<_, Option<i64>>(9)?,
                "idea_id": row.get::<_, Option<i64>>(10)?,
                "milestoneId": row.get::<_, Option<i64>>(9)?,
                "ideaId": row.get::<_, Option<i64>>(10)?,
                "agents": agents.and_then(|s| serde_json::from_str::<Vec<String>>(&s).ok()),
                "created_at": row.get::<_, String>(12)?,
                "updated_at": row.get::<_, String>(13)?,
            }))
        })
        .map_err(|e| e.to_string())?;
    let mut out = vec![];
    for row in rows {
        out.push(row.map_err(|e| e.to_string())?);
    }
    Ok(out)
}

pub fn get_plan_kanban_state_for_project(conn: &Connection, project_id: &str) -> Result<serde_json::Value, String> {
    let in_progress_ids: String = conn
        .query_row(
            "SELECT in_progress_ids FROM plan_kanban_state WHERE project_id = ?1",
            rusqlite::params![project_id.trim()],
            |row| row.get(0),
        )
        .unwrap_or_else(|_| "[]".to_string());
    let ids: Vec<String> = serde_json::from_str(&in_progress_ids).unwrap_or_default();
    Ok(serde_json::json!({ "inProgressIds": ids }))
}

const GENERAL_DEVELOPMENT_NAME: &str = "General Development";
const GENERAL_DEVELOPMENT_SLUG: &str = "general-development";

pub fn get_milestones_for_project(conn: &Connection, project_id: &str) -> Result<Vec<serde_json::Value>, String> {
    let project_id = project_id.trim();
    let mut stmt = conn
        .prepare(
            "SELECT id, project_id, name, slug, content, created_at, updated_at FROM milestones WHERE project_id = ?1 ORDER BY name ASC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![project_id], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, i64>(0)?,
                "project_id": row.get::<_, String>(1)?,
                "name": row.get::<_, String>(2)?,
                "slug": row.get::<_, String>(3)?,
                "content": row.get::<_, Option<String>>(4)?,
                "created_at": row.get::<_, String>(5)?,
                "updated_at": row.get::<_, String>(6)?,
            }))
        })
        .map_err(|e| e.to_string())?;
    let mut out = vec![];
    for row in rows {
        out.push(row.map_err(|e| e.to_string())?);
    }
    let has_general = out.iter().any(|v| v.get("name").and_then(|n| n.as_str()) == Some(GENERAL_DEVELOPMENT_NAME));
    if !has_general {
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO milestones (project_id, name, slug, content, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            rusqlite::params![project_id, GENERAL_DEVELOPMENT_NAME, GENERAL_DEVELOPMENT_SLUG, None::<String>, &now, &now],
        )
        .map_err(|e| e.to_string())?;
        let mut stmt2 = conn
            .prepare(
                "SELECT id, project_id, name, slug, content, created_at, updated_at FROM milestones WHERE project_id = ?1 ORDER BY name ASC",
            )
            .map_err(|e| e.to_string())?;
        let rows2 = stmt2
            .query_map(rusqlite::params![project_id], |row| {
                Ok(serde_json::json!({
                    "id": row.get::<_, i64>(0)?,
                    "project_id": row.get::<_, String>(1)?,
                    "name": row.get::<_, String>(2)?,
                    "slug": row.get::<_, String>(3)?,
                    "content": row.get::<_, Option<String>>(4)?,
                    "created_at": row.get::<_, String>(5)?,
                    "updated_at": row.get::<_, String>(6)?,
                }))
            })
            .map_err(|e| e.to_string())?;
        out = vec![];
        for row in rows2 {
            out.push(row.map_err(|e| e.to_string())?);
        }
    }
    Ok(out)
}

pub fn get_ideas_list(conn: &Connection, project_id: Option<&str>) -> Result<Vec<serde_json::Value>, String> {
    let mut out = vec![];
    let map_row = |row: &rusqlite::Row| {
        Ok(serde_json::json!({
            "id": row.get::<_, i64>(0)?,
            "project_id": row.get::<_, Option<String>>(1)?,
            "title": row.get::<_, String>(2)?,
            "description": row.get::<_, String>(3)?,
            "category": row.get::<_, String>(4)?,
            "source": row.get::<_, String>(5)?,
            "created_at": row.get::<_, String>(6)?,
            "updated_at": row.get::<_, String>(7)?,
        }))
    };
    if let Some(pid) = project_id {
        let mut stmt = conn
            .prepare("SELECT id, project_id, title, description, category, source, created_at, updated_at FROM ideas WHERE project_id = ?1 OR project_id IS NULL ORDER BY id ASC")
            .map_err(|e| e.to_string())?;
        let rows = stmt.query_map(rusqlite::params![pid.trim()], map_row).map_err(|e| e.to_string())?;
        for row in rows {
            out.push(row.map_err(|e| e.to_string())?);
        }
    } else {
        let mut stmt = conn
            .prepare("SELECT id, project_id, title, description, category, source, created_at, updated_at FROM ideas ORDER BY id ASC")
            .map_err(|e| e.to_string())?;
        let rows = stmt.query_map([], map_row).map_err(|e| e.to_string())?;
        for row in rows {
            out.push(row.map_err(|e| e.to_string())?);
        }
    }
    Ok(out)
}
