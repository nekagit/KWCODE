/**
 * Canonical paths for .cursor numbered entity folders.
 * Single source of truth for prompts and outputs (0. ideas, 1. project, 2. setup).
 */

const CURSOR = ".cursor";

/** Entity roots (N. name) */
export const IDEAS_ROOT = `${CURSOR}/0. ideas`;
export const PROJECT_ROOT = `${CURSOR}/1. project`;
export const SETUP_ROOT = `${CURSOR}/2. setup`;

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
      return `${SETUP_ROOT}/${id}.prompt.md`;
    case "frontend":
      return `${SETUP_ROOT}/frontend.prompt.md`;
    case "backend":
      return `${SETUP_ROOT}/backend.prompt.md`;
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
      return `${SETUP_ROOT}/${id}.md`;
    case "frontend":
      return `${SETUP_ROOT}/frontend-analysis.md`;
    case "backend":
      return `${SETUP_ROOT}/backend-analysis.md`;
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

// ─── Ideas ─────────────────────────────────────────────────────────────────
export const IDEAS_DOC_PATH = `${IDEAS_ROOT}/ideas.md`;
export const IDEAS_PROMPT_PATH = `${IDEAS_ROOT}/ideas.prompt.md`;

// ─── Project ──────────────────────────────────────────────────────────────
export const PROJECT_DIR = PROJECT_ROOT;
export const PROJECT_PROMPT_PATH = `${PROJECT_ROOT}/project.prompt.md`;
export const PROJECT_OUTPUT_PATH = `${PROJECT_ROOT}/PROJECT-INFO.md`;

// ─── Setup (2. setup) — design, architecture, testing, documentation, frontend, backend ───
export const SETUP_DESIGN_DOC_PATH = `${SETUP_ROOT}/design.md`;
export const SETUP_DESIGN_PROMPT_PATH = `${SETUP_ROOT}/design.prompt.md`;
export const SETUP_ARCHITECTURE_DOC_PATH = `${SETUP_ROOT}/architecture.md`;
export const SETUP_ARCHITECTURE_PROMPT_PATH = `${SETUP_ROOT}/architecture.prompt.md`;
export const SETUP_TESTING_DOC_PATH = `${SETUP_ROOT}/testing.md`;
export const SETUP_TESTING_PROMPT_PATH = `${SETUP_ROOT}/testing.prompt.md`;
export const SETUP_TESTING_PROMPTS_DIR = `${SETUP_ROOT}/testing`;
export const SETUP_DOCUMENTATION_DOC_PATH = `${SETUP_ROOT}/documentation.md`;
export const SETUP_DOCUMENTATION_PROMPT_PATH = `${SETUP_ROOT}/documentation.prompt.md`;
export const SETUP_FRONTEND_JSON_PATH = `${SETUP_ROOT}/frontend.json`;
export const SETUP_FRONTEND_PROMPT_PATH = `${SETUP_ROOT}/frontend.prompt.md`;
export const SETUP_FRONTEND_ANALYSIS_PATH = `${SETUP_ROOT}/frontend-analysis.md`;
export const SETUP_BACKEND_JSON_PATH = `${SETUP_ROOT}/backend.json`;
export const SETUP_BACKEND_PROMPT_PATH = `${SETUP_ROOT}/backend.prompt.md`;
export const SETUP_BACKEND_ANALYSIS_PATH = `${SETUP_ROOT}/backend-analysis.md`;

/** Doc path for a setup key (design | ideas | architecture | testing | documentation). Ideas lives under 0. ideas. */
export function getSetupDocPath(key: "design" | "ideas" | "architecture" | "testing" | "documentation"): string {
  if (key === "ideas") return IDEAS_DOC_PATH;
  return `${SETUP_ROOT}/${key}.md`;
}

/** Prompt path for a setup key. */
export function getSetupPromptPath(key: "design" | "ideas" | "architecture" | "testing" | "documentation"): string {
  if (key === "ideas") return IDEAS_PROMPT_PATH;
  return `${SETUP_ROOT}/${key}.prompt.md`;
}
