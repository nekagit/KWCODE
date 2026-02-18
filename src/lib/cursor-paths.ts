/**
 * Canonical paths for .cursor entity folders.
 * Single source of truth for prompts and outputs (0. ideas, 1. project).
 * Former "2. setup" content lives under 1. project.
 */

const CURSOR = ".cursor";

/** Entity roots */
export const IDEAS_ROOT = `${CURSOR}/0. ideas`;
export const PROJECT_ROOT = `${CURSOR}/1. project`;
export const PLANNER_ROOT = `${CURSOR}/7. planner`;

// ─── Worker (8. worker) & Agents (2. agents) ─────────────────────────────
/** All worker prompts use .prompt.md so they appear in the Prompts page table. */
export const WORKER_IMPLEMENT_ALL_PROMPT_PATH = `${CURSOR}/8. worker/implement-all.prompt.md`;
export const WORKER_FIX_BUG_PROMPT_PATH = `${CURSOR}/8. worker/fix-bug.prompt.md`;
/** Night shift: 3 agents run this prompt in a loop; edit this file to change the prompt. */
export const WORKER_NIGHT_SHIFT_PROMPT_PATH = `${CURSOR}/8. worker/night-shift.prompt.md`;
/** Night shift Circle / badges: per-phase prompts (refactor, test, debugging, implement, create). Edit these files to adapt behaviour. */
export const WORKER_NIGHT_SHIFT_PHASE_PROMPT_PATHS = {
  refactor: `${CURSOR}/8. worker/refactor.prompt.md`,
  test: `${CURSOR}/8. worker/test.prompt.md`,
  debugging: `${CURSOR}/8. worker/debugging.prompt.md`,
  implement: `${CURSOR}/8. worker/implement.prompt.md`,
  create: `${CURSOR}/8. worker/create.prompt.md`,
} as const;
export const AGENTS_ROOT = `${CURSOR}/2. agents`;

/** Analyze job ids used by the worker queue and analyze-all flow. */
export type AnalyzeJobId =
  | "ideas"
  | "project"
  | "design"
  | "architecture"
  | "testing"
  | "documentation"
  | "frontend"
  | "backend";

/** Prompt path for an analyze job (entity folder + {name}.prompt.md). */
export function getPromptPath(id: AnalyzeJobId): string {
  switch (id) {
    case "ideas":
      return `${IDEAS_ROOT}/ideas.prompt.md`;
    case "project":
      return `${PROJECT_ROOT}/project.prompt.md`;
    case "design":
    case "architecture":
    case "testing":
    case "documentation":
      return `${PROJECT_ROOT}/${id}.prompt.md`;
    case "frontend":
      return `${PROJECT_ROOT}/frontend.prompt.md`;
    case "backend":
      return `${PROJECT_ROOT}/backend.prompt.md`;
    default:
      return "";
  }
}

/** Output path for an analyze job. */
export function getOutputPath(id: AnalyzeJobId): string {
  switch (id) {
    case "ideas":
      return `${IDEAS_ROOT}/ideas.md`;
    case "project":
      return `${PROJECT_ROOT}/PROJECT-INFO.md`;
    case "design":
    case "architecture":
    case "testing":
    case "documentation":
      return `${PROJECT_ROOT}/${id}.md`;
    case "frontend":
      return `${PROJECT_ROOT}/frontend-analysis.md`;
    case "backend":
      return `${PROJECT_ROOT}/backend-analysis.md`;
    default:
      return "";
  }
}

/** All analyze job ids in default order. */
export const ANALYZE_JOB_IDS: AnalyzeJobId[] = [
  "ideas",
  "project",
  "design",
  "architecture",
  "testing",
  "documentation",
  "frontend",
  "backend",
];

// ─── Planner (7. planner) ──────────────────────────────────────────────────
export const PLANNER_TICKETS_PATH = `${PLANNER_ROOT}/tickets.md`;
export const PLANNER_FEATURES_PATH = `${PLANNER_ROOT}/features.md`;
export const PLANNER_KANBAN_STATE_PATH = `${PLANNER_ROOT}/kanban-state.json`;

// ─── Ideas ─────────────────────────────────────────────────────────────────
export const IDEAS_DOC_PATH = `${IDEAS_ROOT}/ideas.md`;
export const IDEAS_PROMPT_PATH = `${IDEAS_ROOT}/ideas.prompt.md`;

// ─── Project ──────────────────────────────────────────────────────────────
export const PROJECT_DIR = PROJECT_ROOT;
export const PROJECT_PROMPT_PATH = `${PROJECT_ROOT}/project.prompt.md`;
export const PROJECT_OUTPUT_PATH = `${PROJECT_ROOT}/PROJECT-INFO.md`;

// ─── Project (1. project) — design, architecture, testing, documentation, frontend, backend ───
export const SETUP_DESIGN_DOC_PATH = `${PROJECT_ROOT}/design.md`;
export const SETUP_DESIGN_PROMPT_PATH = `${PROJECT_ROOT}/design.prompt.md`;
export const SETUP_ARCHITECTURE_DOC_PATH = `${PROJECT_ROOT}/architecture.md`;
export const SETUP_ARCHITECTURE_PROMPT_PATH = `${PROJECT_ROOT}/architecture.prompt.md`;
export const SETUP_TESTING_DOC_PATH = `${PROJECT_ROOT}/testing.md`;
export const SETUP_TESTING_PROMPT_PATH = `${PROJECT_ROOT}/testing.prompt.md`;
export const SETUP_TESTING_PROMPTS_DIR = `${PROJECT_ROOT}/testing`;
export const SETUP_DOCUMENTATION_DOC_PATH = `${PROJECT_ROOT}/documentation.md`;
export const SETUP_DOCUMENTATION_PROMPT_PATH = `${PROJECT_ROOT}/documentation.prompt.md`;
export const SETUP_FRONTEND_JSON_PATH = `${PROJECT_ROOT}/frontend.json`;
export const SETUP_FRONTEND_PROMPT_PATH = `${PROJECT_ROOT}/frontend.prompt.md`;
export const SETUP_FRONTEND_ANALYSIS_PATH = `${PROJECT_ROOT}/frontend-analysis.md`;
export const SETUP_BACKEND_JSON_PATH = `${PROJECT_ROOT}/backend.json`;
export const SETUP_BACKEND_PROMPT_PATH = `${PROJECT_ROOT}/backend.prompt.md`;
export const SETUP_BACKEND_ANALYSIS_PATH = `${PROJECT_ROOT}/backend-analysis.md`;

/** Doc path for a setup key (design | ideas | architecture | testing | documentation). Ideas lives under 0. ideas. */
export function getSetupDocPath(key: "design" | "ideas" | "architecture" | "testing" | "documentation"): string {
  if (key === "ideas") return IDEAS_DOC_PATH;
  return `${PROJECT_ROOT}/${key}.md`;
}

/** Prompt path for a setup key. */
export function getSetupPromptPath(key: "design" | "ideas" | "architecture" | "testing" | "documentation"): string {
  if (key === "ideas") return IDEAS_PROMPT_PATH;
  return `${PROJECT_ROOT}/${key}.prompt.md`;
}
