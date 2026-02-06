//! SQLite database for app data (projects, tickets, features).
//! Migrates from existing JSON files on first run.

use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

const KV_ALL_PROJECTS: &str = "all_projects";
const KV_CURSOR_PROJECTS: &str = "cursor_projects";
const KV_DATA_DIR: &str = "data_dir";

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
        ",
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Migrate data from JSON files in `data_dir` into the database if DB is empty.
pub fn migrate_from_json(data_dir: &Path, conn: &Connection) -> Result<(), String> {
    let count: i64 = conn
        .query_row(
            "SELECT (SELECT COUNT(*) FROM kv_store) + (SELECT COUNT(*) FROM tickets) + (SELECT COUNT(*) FROM features) AS n",
            [],
            |row| row.get::<_, i64>(0),
        )
        .map_err(|e| e.to_string())?;
    if count != 0 {
        return Ok(());
    }

    let all_projects_path = data_dir.join("all_projects.json");
    if all_projects_path.exists() {
        let content = std::fs::read_to_string(&all_projects_path).map_err(|e| e.to_string())?;
        let _: Vec<String> = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?1, ?2)",
            params![KV_ALL_PROJECTS, content],
        )
        .map_err(|e| e.to_string())?;
    }

    let cursor_projects_path = data_dir.join("cursor_projects.json");
    if cursor_projects_path.exists() {
        let content = std::fs::read_to_string(&cursor_projects_path).map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?1, ?2)",
            params![KV_CURSOR_PROJECTS, content],
        )
        .map_err(|e| e.to_string())?;
    }

    let tickets_path = data_dir.join("tickets.json");
    if tickets_path.exists() {
        let content = std::fs::read_to_string(&tickets_path).map_err(|e| e.to_string())?;
        let tickets: Vec<super::Ticket> = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        for t in tickets {
            let prompt_ids = t.prompt_ids.as_ref().and_then(|v| serde_json::to_string(v).ok());
            let project_paths = t.project_paths.as_ref().and_then(|v| serde_json::to_string(v).ok());
            conn.execute(
                "INSERT OR REPLACE INTO tickets (id, title, description, status, priority, created_at, updated_at, prompt_ids, project_paths)
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
    }

    let features_path = data_dir.join("features.json");
    if features_path.exists() {
        let content = std::fs::read_to_string(&features_path).map_err(|e| e.to_string())?;
        let features: Vec<super::Feature> = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        for f in features {
            let ticket_ids = serde_json::to_string(&f.ticket_ids).map_err(|e| e.to_string())?;
            let prompt_ids = serde_json::to_string(&f.prompt_ids).map_err(|e| e.to_string())?;
            let project_paths = serde_json::to_string(&f.project_paths).map_err(|e| e.to_string())?;
            conn.execute(
                "INSERT OR REPLACE INTO features (id, title, ticket_ids, prompt_ids, project_paths, created_at, updated_at)
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
    }

    // Persist data dir so all access uses path from DB (ADR 069).
    let data_dir_value = data_dir.to_string_lossy().to_string();
    conn.execute(
        "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?1, ?2)",
        params![KV_DATA_DIR, data_dir_value],
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

/// Set data directory path in DB (e.g. from settings).
pub fn set_data_dir(conn: &Connection, path: &Path) -> Result<(), String> {
    let value = path.to_string_lossy().to_string();
    conn.execute(
        "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?1, ?2)",
        params![KV_DATA_DIR, value],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
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
