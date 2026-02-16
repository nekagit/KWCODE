/**
 * SQLite database for app data: plan_tickets, milestones, ideas, implementation_log.
 * Uses data/app.db (same path as Tauri when running from repo).
 */
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export function getDataDir(): string {
  const cwd = process.cwd();
  const inCwd = path.join(cwd, "data");
  if (fs.existsSync(inCwd) && fs.statSync(inCwd).isDirectory()) return inCwd;
  const inParent = path.join(cwd, "..", "data");
  if (fs.existsSync(inParent) && fs.statSync(inParent).isDirectory()) return inParent;
  return cwd;
}

let db: Database.Database | null = null;

function runMigrations(conn: Database.Database): void {
  conn.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

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
      created_at TEXT NOT NULL
    );
  `);
}

export function getDb(): Database.Database {
  if (db) return db;
  const dataDir = getDataDir();
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, "app.db");
  db = new Database(dbPath);
  runMigrations(db);
  migrateIdeasFromJson(db, dataDir);
  return db;
}

/** One-time: if ideas table is empty and data/ideas.json exists, import into ideas table (preserves id for project.ideaIds). */
function migrateIdeasFromJson(conn: Database.Database, dataDir: string): void {
  const ideasFile = path.join(dataDir, "ideas.json");
  if (!fs.existsSync(ideasFile)) return;
  const count = (conn.prepare("SELECT COUNT(*) AS c FROM ideas").get() as { c: number }).c;
  if (count > 0) return;
  try {
    const raw = fs.readFileSync(ideasFile, "utf-8");
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return;
    const now = new Date().toISOString();
    const stmt = conn.prepare(
      `INSERT INTO ideas (id, project_id, title, description, category, body, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const row of arr) {
      if (row == null || typeof row !== "object" || typeof row.title !== "string") continue;
      const id = Number(row.id);
      if (!Number.isInteger(id) || id < 1) continue;
      const title = String(row.title ?? "").trim();
      const description = String(row.description ?? "").trim();
      const category = ["saas", "iaas", "paas", "website", "webapp", "webshop", "other"].includes(String(row.category)) ? row.category : "other";
      const source = ["template", "ai", "manual"].includes(String(row.source)) ? row.source : "manual";
      stmt.run(id, null, title, description, category, null, source, row.created_at ?? now, row.updated_at ?? now);
    }
  } catch (_) {
    // ignore migration errors
  }
}

export type PlanTicketRow = {
  id: string;
  project_id: string;
  number: number;
  title: string;
  description: string | null;
  priority: string;
  feature_name: string;
  done: number;
  status: string;
  milestone_id: number | null;
  idea_id: number | null;
  agents: string | null;
  created_at: string;
  updated_at: string;
};

export type MilestoneRow = {
  id: number;
  project_id: string;
  name: string;
  slug: string;
  content: string | null;
  created_at: string;
  updated_at: string;
};

export type IdeaRow = {
  id: number;
  project_id: string | null;
  title: string;
  description: string;
  category: string;
  body: string | null;
  source: string;
  created_at: string;
  updated_at: string;
};

export type ImplementationLogRow = {
  id: number;
  project_id: string;
  run_id: string;
  ticket_number: number;
  ticket_title: string;
  milestone_id: number | null;
  idea_id: number | null;
  completed_at: string;
  files_changed: string;
  summary: string;
  created_at: string;
};
